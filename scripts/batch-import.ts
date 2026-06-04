import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

const MDB_FILE = path.join(__dirname, '../assets/db.mdb')
const BATCH_SIZE = 500 // Process 500 records at a time
const PAYMENT_BATCH_SIZE = 100 // Smaller batch for payments to avoid OOM

// Execute mdb-export command and parse CSV
function exportTable(tableName: string): any[] {
  try {
    console.log(`   Exporting table: ${tableName}`)
    const output = execSync(`mdb-export "${MDB_FILE}" "${tableName}"`, {
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer
    })
    
    const lines = output.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').toLowerCase())
    const rows = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      rows.push(row)
    }
    
    console.log(`   Found ${rows.length} rows`)
    return rows
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error)
    return []
  }
}

// Parse CSV line (handle commas inside quotes)
function parseCSVLine(line: string): (string | null)[] {
  const result: (string | null)[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result.map(v => v === '' ? null : v)
}

// Convert date format
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  try {
    const parts = dateStr.split(' ')[0].split('/')
    if (parts.length === 3) {
      const month = parseInt(parts[0])
      const day = parseInt(parts[1])
      let year = parseInt(parts[2])
      
      if (year < 100) {
        year += year < 50 ? 2000 : 1900
      }
      
      return new Date(year, month - 1, day)
    }
  } catch (e) {
    // Ignore date parse errors
  }
  return null
}

// Convert number
function parseDecimal(value: string | null): number {
  if (!value) return 0
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

async function batchImport() {
  console.log('🚀 Starting fast batch import...\n')
  
  try {
    // First, ensure all customers from bookings exist
    console.log('📊 Ensuring all customers exist...')
    const bookings = exportTable('Booking Data')
    const exchanges = exportTable('Exchange Data')
    
    const allCustomerNames = new Set<string>()
    bookings.forEach(b => {
      if (b.customer) allCustomerNames.add(b.customer.trim())
    })
    exchanges.forEach(e => {
      if (e.customer) allCustomerNames.add(e.customer.trim())
    })
    
    console.log(`   Found ${allCustomerNames.size} unique customer names in orders`)
    
    // Get existing customers
    const existingCustomers = await prisma.customer.findMany({
      select: { customer: true }
    })
    const existingCustomerSet = new Set(existingCustomers.map(c => c.customer))
    
    // Create missing customers with placeholder data
    const missingCustomers = Array.from(allCustomerNames).filter(
      name => !existingCustomerSet.has(name)
    )
    
    if (missingCustomers.length > 0) {
      console.log(`   Creating ${missingCustomers.length} missing customers...`)
      for (let i = 0; i < missingCustomers.length; i += BATCH_SIZE) {
        const batch = missingCustomers.slice(i, i + BATCH_SIZE)
        await prisma.customer.createMany({
          data: batch.map(name => ({
            customer: name,
            tel: 'N/A', // Required field
            address: null,
            fax: null,
          })),
          skipDuplicates: true,
        })
        console.log(`   Created batch ${Math.floor(i/BATCH_SIZE) + 1}`)
      }
    }
    console.log(`✅ All customers ready\n`)
    
    // Now import suppliers from exchange data
    console.log('📊 Ensuring all suppliers exist...')
    const allSupplierNames = new Set<string>()
    exchanges.forEach(e => {
      if (e.supplier) allSupplierNames.add(e.supplier.trim())
    })
    
    const existingSuppliers = await prisma.supplier.findMany({
      select: { supplier: true }
    })
    const existingSupplierSet = new Set(existingSuppliers.map(s => s.supplier))
    
    const missingSuppliers = Array.from(allSupplierNames).filter(
      name => !existingSupplierSet.has(name)
    )
    
    if (missingSuppliers.length > 0) {
      console.log(`   Creating ${missingSuppliers.length} missing suppliers...`)
      for (let i = 0; i < missingSuppliers.length; i += BATCH_SIZE) {
        const batch = missingSuppliers.slice(i, i + BATCH_SIZE)
        await prisma.supplier.createMany({
          data: batch.map(name => ({
            supplier: name,
            tel: null,
            address: null,
            fax: null,
          })),
          skipDuplicates: true,
        })
      }
    }
    console.log(`✅ All suppliers ready\n`)
    
    // Import Bookings (only missing ones)
    console.log('📊 Importing booking orders...')
    const currentBookingCount = await prisma.bookingData.count()
    console.log(`   Current bookings in DB: ${currentBookingCount}`)
    
    if (bookings.length > currentBookingCount) {
      const bookingsToImport = bookings.slice(currentBookingCount)
      console.log(`   Will import ${bookingsToImport.length} new bookings`)
      
      for (let i = 0; i < bookingsToImport.length; i += BATCH_SIZE) {
        const batch = bookingsToImport.slice(i, i + BATCH_SIZE)
        const data = batch.map(row => ({
          bookno: row.bookno?.trim() || '',
          bookdate: parseDate(row.bookdate),
          customer: row.customer?.trim() || '',
          deptdate: parseDate(row.deptdate),
          depttime: row.depttime?.trim() || null,
          deptflt: row.deptflt?.trim() || null,
          deptdest: row.deptdest?.trim() || null,
          deptdate2: parseDate(row.deptdate2),
          depttime2: row.depttime2?.trim() || null,
          deptflt2: row.deptflt2?.trim() || null,
          deptdest2: row.deptdest2?.trim() || null,
          arrvdate: parseDate(row.arrvdate),
          arrvtime: row.arrvtime?.trim() || null,
          arrvflt: row.arrvflt?.trim() || null,
          arrvdest: row.arrvdest?.trim() || null,
          arrvdate2: parseDate(row.arrvdate2),
          arrvtime2: row.arrvtime2?.trim() || null,
          arrvflt2: row.arrvflt2?.trim() || null,
          arrvdest2: row.arrvdest2?.trim() || null,
          discount: parseDecimal(row.discount),
          tourcode: row.tourcode?.trim() || null,
          tour: row.tour?.trim() || null,
          staff: row.staff?.trim() || null,
          status: row.status?.trim() || null,
          special: row.special?.trim() || null,
        })).filter(d => d.bookno && d.customer)
        
        await prisma.bookingData.createMany({
          data,
          skipDuplicates: true,
        })
        console.log(`   Imported batch ${Math.floor(i/BATCH_SIZE) + 1}: ${data.length} bookings`)
      }
    }
    const finalBookingCount = await prisma.bookingData.count()
    console.log(`✅ Total bookings: ${finalBookingCount}\n`)
    
    // Import Passengers
    console.log('📊 Importing passengers...')
    const passengers = exportTable('Passenger Data')
    const currentPassengerCount = await prisma.passengerData.count()
    console.log(`   Current passengers in DB: ${currentPassengerCount}`)
    
    if (passengers.length > 0) {
      // Get all valid booking numbers
      const validBookings = await prisma.bookingData.findMany({
        select: { bookno: true }
      })
      const validBooknoSet = new Set(validBookings.map(b => b.bookno))
      console.log(`   Have ${validBooknoSet.size} valid booking numbers`)
      
      // Filter passengers to only those with valid booking numbers
      const validPassengers = passengers.filter(p => 
        p.bookno && p.paxname && validBooknoSet.has(p.bookno.trim())
      )
      console.log(`   ${validPassengers.length} passengers have valid bookings`)
      
      for (let i = 0; i < validPassengers.length; i += BATCH_SIZE) {
        const batch = validPassengers.slice(i, i + BATCH_SIZE)
        const data = batch.map(row => ({
          bookno: row.bookno?.trim() || '',
          paxname: row.paxname?.trim() || '',
          passport: row.passport?.trim() || null,
          exchangeno: row.exchangeno?.trim() || null,
        })).filter(d => d.bookno && d.paxname)
        
        if (data.length > 0) {
          await prisma.passengerData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/BATCH_SIZE) + 1}: ${data.length} passengers`)
        }
      }
    }
    const finalPassengerCount = await prisma.passengerData.count()
    console.log(`✅ Total passengers: ${finalPassengerCount}\n`)
    
    // Import Items
    console.log('📊 Importing booking items...')
    const items = exportTable('Item Data')
    const currentItemCount = await prisma.itemData.count()
    console.log(`   Current items in DB: ${currentItemCount}`)
    
    if (items.length > 0) {
      // Get all valid booking numbers (reuse from above)
      const validBookings = await prisma.bookingData.findMany({
        select: { bookno: true }
      })
      const validBooknoSet = new Set(validBookings.map(b => b.bookno))
      
      const validItems = items.filter(item => 
        item.bookno && item.item && validBooknoSet.has(item.bookno.trim())
      )
      console.log(`   ${validItems.length} items have valid bookings`)
      
      for (let i = 0; i < validItems.length; i += BATCH_SIZE) {
        const batch = validItems.slice(i, i + BATCH_SIZE)
        const data = batch.map(row => ({
          bookno: row.bookno?.trim() || '',
          item: row.item?.trim() || '',
          quantity: parseInt(row.quantity) || 0,
          price: parseDecimal(row.price),
          unitprice: parseDecimal(row.unitprice),
          exchangeno: row.exchangeno?.trim() || null,
        })).filter(d => d.bookno && d.item)
        
        if (data.length > 0) {
          await prisma.itemData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/BATCH_SIZE) + 1}: ${data.length} items`)
        }
      }
    }
    const finalItemCount = await prisma.itemData.count()
    console.log(`✅ Total items: ${finalItemCount}\n`)
    
    // Import Booking Payments
    console.log('📊 Importing booking payments...')
    const bookingPayments = exportTable('Booking Payment Data')
    const currentPaymentCount = await prisma.bookingPaymentData.count()
    console.log(`   Current payments in DB: ${currentPaymentCount}`)
    
    if (bookingPayments.length > 0) {
      // Get all valid booking numbers
      const validBookings = await prisma.bookingData.findMany({
        select: { bookno: true }
      })
      const validBooknoSet = new Set(validBookings.map(b => b.bookno))
      
      const validPayments = bookingPayments.filter(payment => 
        !payment.bookno || validBooknoSet.has(payment.bookno.trim())
      )
      console.log(`   ${validPayments.length} payments are valid (null bookno or valid booking)`)
      
      for (let i = 0; i < validPayments.length; i += PAYMENT_BATCH_SIZE) {
        const batch = validPayments.slice(i, i + PAYMENT_BATCH_SIZE)
        const data = batch.map(row => ({
          receiptno: row.receiptno?.trim() || null,
          bookno: row.bookno?.trim() || null,
          receiptdate: parseDate(row.receiptdate),
          paytype: row.paytype?.trim() || null,
          for: row.for?.trim() || null,
          chequeno: row.chequeno?.trim() || null,
          visano: row.visano?.trim() || null,
          amountpaid: parseDecimal(row.amountpaid),
          paidtext: row.paidtext?.trim() || null,
          customer: row.customer?.trim() || null,
          payfor: row.payfor?.trim() || null,
        }))
        
        if (data.length > 0) {
          await prisma.bookingPaymentData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/PAYMENT_BATCH_SIZE) + 1}: ${data.length} payments`)
        }
      }
    }
    const finalPaymentCount = await prisma.bookingPaymentData.count()
    console.log(`✅ Total booking payments: ${finalPaymentCount}\n`)
    
    // Import Exchanges
    console.log('📊 Importing exchange orders...')
    console.log(`   Found ${exchanges.length} exchange orders to process`)
    
    if (exchanges.length > 0) {
      for (let i = 0; i < exchanges.length; i += BATCH_SIZE) {
        const batch = exchanges.slice(i, i + BATCH_SIZE)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno?.trim() || '',
          bookno: row.bookno?.trim() || '',
          exchangedate: parseDate(row.exchangedate),
          supplier: row.supplier?.trim() || '',
          status: row.status?.trim() || null,
          bookdate: parseDate(row.bookdate),
          customer: row.customer?.trim() || '',
          deptdate: parseDate(row.deptdate),
          depttime: row.depttime?.trim() || null,
          deptflt: row.deptflt?.trim() || null,
          deptdest: row.deptdest?.trim() || null,
          deptdate2: parseDate(row.deptdate2),
          depttime2: row.depttime2?.trim() || null,
          deptflt2: row.deptflt2?.trim() || null,
          deptdest2: row.deptdest2?.trim() || null,
          arrvdate: parseDate(row.arrvdate),
          arrvtime: row.arrvtime?.trim() || null,
          arrvflt: row.arrvflt?.trim() || null,
          arrvdest: row.arrvdest?.trim() || null,
          arrvdate2: parseDate(row.arrvdate2),
          arrvtime2: row.arrvtime2?.trim() || null,
          arrvflt2: row.arrvflt2?.trim() || null,
          arrvdest2: row.arrvdest2?.trim() || null,
          discount: parseDecimal(row.discount),
          tourcode: row.tourcode?.trim() || null,
          tour: row.tour?.trim() || null,
          staff: row.staff?.trim() || null,
          special: row.special?.trim() || null,
        })).filter(d => d.exchangeno && d.bookno && d.supplier && d.customer)
        
        if (data.length > 0) {
          await prisma.exchangeData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/BATCH_SIZE) + 1}: ${data.length} exchanges`)
        }
      }
    }
    const finalExchangeCount = await prisma.exchangeData.count()
    console.log(`✅ Total exchanges: ${finalExchangeCount}\n`)
    
    // Import Exchange Items
    console.log('📊 Importing exchange items...')
    const exchangeItems = exportTable('Exchange Item Data')
    
    if (exchangeItems.length > 0) {
      // Get all valid exchange numbers
      const validExchanges = await prisma.exchangeData.findMany({
        select: { exchangeno: true }
      })
      const validExchangenoSet = new Set(validExchanges.map(e => e.exchangeno))
      
      const validExchangeItems = exchangeItems.filter(item => 
        item.exchangeno && item.item && validExchangenoSet.has(item.exchangeno.trim())
      )
      console.log(`   ${validExchangeItems.length} exchange items have valid exchanges`)
      
      for (let i = 0; i < validExchangeItems.length; i += BATCH_SIZE) {
        const batch = validExchangeItems.slice(i, i + BATCH_SIZE)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno?.trim() || '',
          item: row.item?.trim() || '',
          quantity: parseInt(row.quantity) || 0,
          price: parseDecimal(row.price),
          unitprice: parseDecimal(row.unitprice),
        })).filter(d => d.exchangeno && d.item)
        
        if (data.length > 0) {
          await prisma.exchangeItemData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/BATCH_SIZE) + 1}: ${data.length} exchange items`)
        }
      }
    }
    const finalExchangeItemCount = await prisma.exchangeItemData.count()
    console.log(`✅ Total exchange items: ${finalExchangeItemCount}\n`)
    
    // Import Exchange Payments
    console.log('📊 Importing exchange payments...')
    const exchangePayments = exportTable('Exchange Payment Data')
    
    if (exchangePayments.length > 0) {
      // Get all valid exchange numbers
      const validExchanges = await prisma.exchangeData.findMany({
        select: { exchangeno: true }
      })
      const validExchangenoSet = new Set(validExchanges.map(e => e.exchangeno))
      
      const validExchangePayments = exchangePayments.filter(payment => 
        payment.exchangeno && validExchangenoSet.has(payment.exchangeno.trim())
      )
      console.log(`   ${validExchangePayments.length} exchange payments have valid exchanges`)
      
      for (let i = 0; i < validExchangePayments.length; i += PAYMENT_BATCH_SIZE) {
        const batch = validExchangePayments.slice(i, i + PAYMENT_BATCH_SIZE)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno?.trim() || '',
          bookno: row.bookno?.trim() || null,
          receiptdate: parseDate(row.receiptdate),
          paytype: row.paytype?.trim() || null,
          chequeno: row.chequeno?.trim() || null,
          amountpaid: parseDecimal(row.amountpaid),
          remarks: row.remarks?.trim() || null,
          issue: row.issue?.trim() || null,
          paidtext: row.paidtext?.trim() || null,
        })).filter(d => d.exchangeno)
        
        if (data.length > 0) {
          await prisma.exchangePaymentData.createMany({
            data,
            skipDuplicates: true,
          })
          console.log(`   Imported batch ${Math.floor(i/PAYMENT_BATCH_SIZE) + 1}: ${data.length} exchange payments`)
        }
      }
    }
    const finalExchangePaymentCount = await prisma.exchangePaymentData.count()
    console.log(`✅ Total exchange payments: ${finalExchangePaymentCount}\n`)
    
    console.log('🎉 Batch import completed!\n')
    console.log('📊 Final Summary:')
    console.log(`   Customers: ${await prisma.customer.count()}`)
    console.log(`   Suppliers: ${await prisma.supplier.count()}`)
    console.log(`   Booking Orders: ${finalBookingCount}`)
    console.log(`   Exchange Orders: ${finalExchangeCount}`)
    console.log(`   Passengers: ${finalPassengerCount}`)
    console.log(`   Booking Items: ${finalItemCount}`)
    console.log(`   Exchange Items: ${finalExchangeItemCount}`)
    console.log(`   Booking Payments: ${finalPaymentCount}`)
    console.log(`   Exchange Payments: ${finalExchangePaymentCount}`)
    
  } catch (error) {
    console.error('❌ Error during import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

batchImport()
