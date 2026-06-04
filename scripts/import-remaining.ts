import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

const MDB_FILE = path.join(__dirname, '../assets/db.mdb')
const SMALL_BATCH = 50 // Very small batch to avoid OOM

function exportTable(tableName: string): any[] {
  try {
    console.log(`   Exporting: ${tableName}`)
    const output = execSync(`mdb-export "${MDB_FILE}" "${tableName}"`, {
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024,
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
    console.error(`Error exporting ${tableName}:`, error)
    return []
  }
}

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
  } catch (e) {}
  return null
}

function parseDecimal(value: string | null): number {
  if (!value) return 0
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

async function importRemaining() {
  console.log('🚀 Importing remaining data with small batches...\n')
  
  try {
    // 1. Import remaining booking payments
    console.log('📊 Importing remaining booking payments...')
    const bookingPayments = exportTable('Booking Payment Data')
    const currentPaymentCount = await prisma.bookingPaymentData.count()
    console.log(`   Current: ${currentPaymentCount}, Total: ${bookingPayments.length}`)
    
    if (bookingPayments.length > currentPaymentCount) {
      const validBookings = await prisma.bookingData.findMany({
        select: { bookno: true }
      })
      const validBooknoSet = new Set(validBookings.map(b => b.bookno))
      
      const validPayments = bookingPayments.filter(p => 
        !p.bookno || validBooknoSet.has(p.bookno?.trim())
      )
      
      const remaining = validPayments.slice(currentPaymentCount)
      console.log(`   Will import ${remaining.length} more payments`)
      
      for (let i = 0; i < remaining.length; i += SMALL_BATCH) {
        const batch = remaining.slice(i, i + SMALL_BATCH)
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
          if ((i / SMALL_BATCH) % 10 === 0) {
            console.log(`   Progress: ${i + data.length}/${remaining.length}`)
          }
        }
      }
    }
    const finalPaymentCount = await prisma.bookingPaymentData.count()
    console.log(`✅ Total booking payments: ${finalPaymentCount}\n`)
    
    // 2. Import exchanges
    console.log('📊 Importing exchange orders...')
    const exchanges = exportTable('Exchange Data')
    const currentExchangeCount = await prisma.exchangeData.count()
    console.log(`   Current: ${currentExchangeCount}, Total: ${exchanges.length}`)
    
    if (exchanges.length > 0) {
      const validBookings = await prisma.bookingData.findMany({
        select: { bookno: true }
      })
      const validBooknoSet = new Set(validBookings.map(b => b.bookno))
      
      const validSuppliers = await prisma.supplier.findMany({
        select: { supplier: true }
      })
      const validSupplierSet = new Set(validSuppliers.map(s => s.supplier))
      
      const validCustomers = await prisma.customer.findMany({
        select: { customer: true }
      })
      const validCustomerSet = new Set(validCustomers.map(c => c.customer))
      
      const validExchanges = exchanges.filter(e => 
        e.exchangeno && e.bookno && e.supplier &&
        validBooknoSet.has(e.bookno.trim()) &&
        validSupplierSet.has(e.supplier.trim()) &&
        (!e.customer || validCustomerSet.has(e.customer.trim()))
      )
      
      console.log(`   ${validExchanges.length} exchanges have valid references`)
      
      for (let i = 0; i < validExchanges.length; i += SMALL_BATCH) {
        const batch = validExchanges.slice(i, i + SMALL_BATCH)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno.trim(),
          bookno: row.bookno.trim(),
          exchangedate: parseDate(row.exchangedate),
          supplier: row.supplier.trim(),
          status: row.status?.trim() || null,
          bookdate: parseDate(row.bookdate),
          customer: row.customer?.trim() || null,
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
        }))
        
        if (data.length > 0) {
          await prisma.exchangeData.createMany({
            data,
            skipDuplicates: true,
          })
          if ((i / SMALL_BATCH) % 10 === 0) {
            console.log(`   Progress: ${i + data.length}/${validExchanges.length}`)
          }
        }
      }
    }
    const finalExchangeCount = await prisma.exchangeData.count()
    console.log(`✅ Total exchanges: ${finalExchangeCount}\n`)
    
    // 3. Import exchange items
    console.log('📊 Importing exchange items...')
    const exchangeItems = exportTable('Exchange Item Data')
    
    if (exchangeItems.length > 0) {
      const validExchanges = await prisma.exchangeData.findMany({
        select: { exchangeno: true }
      })
      const validExchangenoSet = new Set(validExchanges.map(e => e.exchangeno))
      
      const validExchangeItems = exchangeItems.filter(item => 
        item.exchangeno && item.item && validExchangenoSet.has(item.exchangeno.trim())
      )
      
      console.log(`   ${validExchangeItems.length} exchange items have valid exchanges`)
      
      for (let i = 0; i < validExchangeItems.length; i += SMALL_BATCH) {
        const batch = validExchangeItems.slice(i, i + SMALL_BATCH)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno.trim(),
          item: row.item.trim(),
          quantity: parseInt(row.quantity) || 0,
          price: parseDecimal(row.price),
          unitprice: parseDecimal(row.unitprice),
        }))
        
        if (data.length > 0) {
          await prisma.exchangeItemData.createMany({
            data,
            skipDuplicates: true,
          })
          if ((i / SMALL_BATCH) % 10 === 0) {
            console.log(`   Progress: ${i + data.length}/${validExchangeItems.length}`)
          }
        }
      }
    }
    const finalExchangeItemCount = await prisma.exchangeItemData.count()
    console.log(`✅ Total exchange items: ${finalExchangeItemCount}\n`)
    
    // 4. Import exchange payments
    console.log('📊 Importing exchange payments...')
    const exchangePayments = exportTable('Exchange Payment Data')
    
    if (exchangePayments.length > 0) {
      const validExchanges = await prisma.exchangeData.findMany({
        select: { exchangeno: true }
      })
      const validExchangenoSet = new Set(validExchanges.map(e => e.exchangeno))
      
      const validExchangePayments = exchangePayments.filter(p => 
        p.exchangeno && validExchangenoSet.has(p.exchangeno.trim())
      )
      
      console.log(`   ${validExchangePayments.length} exchange payments have valid exchanges`)
      
      for (let i = 0; i < validExchangePayments.length; i += SMALL_BATCH) {
        const batch = validExchangePayments.slice(i, i + SMALL_BATCH)
        const data = batch.map(row => ({
          exchangeno: row.exchangeno.trim(),
          bookno: row.bookno?.trim() || null,
          receiptdate: parseDate(row.receiptdate),
          paytype: row.paytype?.trim() || null,
          chequeno: row.chequeno?.trim() || null,
          amountpaid: parseDecimal(row.amountpaid),
          remarks: row.remarks?.trim() || null,
          issue: row.issue?.trim() || null,
          paidtext: row.paidtext?.trim() || null,
        }))
        
        if (data.length > 0) {
          await prisma.exchangePaymentData.createMany({
            data,
            skipDuplicates: true,
          })
          if ((i / SMALL_BATCH) % 10 === 0) {
            console.log(`   Progress: ${i + data.length}/${validExchangePayments.length}`)
          }
        }
      }
    }
    const finalExchangePaymentCount = await prisma.exchangePaymentData.count()
    console.log(`✅ Total exchange payments: ${finalExchangePaymentCount}\n`)
    
    console.log('🎉 Import completed!\n')
    console.log('📊 Final Summary:')
    console.log(`   Customers: ${await prisma.customer.count()}`)
    console.log(`   Suppliers: ${await prisma.supplier.count()}`)
    console.log(`   Booking Orders: ${await prisma.bookingData.count()}`)
    console.log(`   Exchange Orders: ${finalExchangeCount}`)
    console.log(`   Passengers: ${await prisma.passengerData.count()}`)
    console.log(`   Booking Items: ${await prisma.itemData.count()}`)
    console.log(`   Exchange Items: ${finalExchangeItemCount}`)
    console.log(`   Booking Payments: ${finalPaymentCount}`)
    console.log(`   Exchange Payments: ${finalExchangePaymentCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importRemaining()
