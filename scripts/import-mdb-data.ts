import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

const MDB_FILE = path.join(__dirname, '../assets/db.mdb')

// 执行 mdb-export 命令并解析 CSV
function exportTable(tableName: string): any[] {
  try {
    const output = execSync(`mdb-export "${MDB_FILE}" "${tableName}"`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
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
    
    return rows
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error)
    return []
  }
}

// 解析 CSV 行（处理引号内的逗号）
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

// 转换日期格式
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  try {
    // Access 日期格式: "01/08/06 00:00:00"
    const parts = dateStr.split(' ')[0].split('/')
    if (parts.length === 3) {
      const month = parseInt(parts[0])
      const day = parseInt(parts[1])
      let year = parseInt(parts[2])
      
      // 处理两位年份
      if (year < 100) {
        year += year < 50 ? 2000 : 1900
      }
      
      return new Date(year, month - 1, day)
    }
  } catch (e) {
    console.error('Error parsing date:', dateStr, e)
  }
  return null
}

// 转换数字
function parseDecimal(value: string | null): number {
  if (!value) return 0
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

async function importData() {
  console.log('🚀 Starting data import from MDB...\n')
  
  try {
    // 1. Import Customers
    console.log('📊 Importing customers...')
    const customers = exportTable('Customer Data')
    let customerCount = 0
    
    for (const row of customers) {
      try {
        if (!row.customer || !row.tel) continue
        await prisma.customer.upsert({
          where: { customer: row.customer.trim() },
          update: {
            address: row.address?.trim() || null,
            tel: row.tel?.trim() || 'N/A',
            fax: row.fax?.trim() || null,
          },
          create: {
            customer: row.customer.trim(),
            address: row.address?.trim() || null,
            tel: row.tel?.trim() || 'N/A',
            fax: row.fax?.trim() || null,
          },
        })
        customerCount++
        if (customerCount % 50 === 0) {
          console.log(`   Processed ${customerCount} customers...`)
        }
      } catch (e: any) {
        if (!e.message.includes('Unique constraint')) {
          console.error(`Error importing customer: ${row.customer}`, e.message)
        }
      }
    }
    console.log(`✅ Imported ${customerCount} customers\n`)
    
    // 2. Import Suppliers
    console.log('📊 Importing suppliers...')
    const suppliers = exportTable('Supplier Data')
    let supplierCount = 0
    
    for (const row of suppliers) {
      try {
        if (!row.supplier) continue
        await prisma.supplier.upsert({
          where: { supplier: row.supplier.trim() },
          update: {
            address: row.address?.trim() || null,
            tel: row.tel?.trim() || null,
            fax: row.fax?.trim() || null,
          },
          create: {
            supplier: row.supplier.trim(),
            address: row.address?.trim() || null,
            tel: row.tel?.trim() || null,
            fax: row.fax?.trim() || null,
          },
        })
        supplierCount++
      } catch (e: any) {
        console.error(`Error importing supplier: ${row.supplier}`, e.message)
      }
    }
    console.log(`✅ Imported ${supplierCount} suppliers\n`)
    
    // 3. Import Booking Data
    console.log('📊 Importing booking orders...')
    const bookings = exportTable('Booking Data')
    let bookingCount = 0
    
    for (const row of bookings) {
      try {
        if (!row.bookno || !row.customer) continue
        await prisma.bookingData.create({
          data: {
            bookno: row.bookno.trim(),
            bookdate: parseDate(row.bookdate),
            customer: row.customer.trim(),
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
          },
        })
        bookingCount++
        
        if (bookingCount % 100 === 0) {
          console.log(`   Processed ${bookingCount} bookings...`)
        }
      } catch (e: any) {
        if (!e.message.includes('Unique constraint')) {
          console.error(`Error importing booking: ${row.bookno}`, e.message)
        }
      }
    }
    console.log(`✅ Imported ${bookingCount} booking orders\n`)
    
    // 4. Import Passengers
    console.log('📊 Importing passengers...')
    const passengers = exportTable('Passenger Data')
    let passengerCount = 0
    
    for (const row of passengers) {
      try {
        if (!row.bookno || !row.paxname) continue
        await prisma.passengerData.create({
          data: {
            bookno: row.bookno.trim(),
            paxname: row.paxname.trim(),
            passport: row.passport?.trim() || null,
            exchangeno: row.exchangeno?.trim() || null,
          },
        })
        passengerCount++
        if (passengerCount % 100 === 0) {
          console.log(`   Processed ${passengerCount} passengers...`)
        }
      } catch (e: any) {
        // Skip duplicates silently
      }
    }
    console.log(`✅ Imported ${passengerCount} passengers\n`)
    
    // 5. Import Item Data
    console.log('📊 Importing booking items...')
    const items = exportTable('Item Data')
    let itemCount = 0
    
    for (const row of items) {
      try {
        if (!row.bookno || !row.item) continue
        await prisma.itemData.create({
          data: {
            bookno: row.bookno.trim(),
            item: row.item.trim(),
            quantity: parseInt(row.quantity) || 0,
            price: parseDecimal(row.price),
            unitprice: parseDecimal(row.unitprice),
            exchangeno: row.exchangeno?.trim() || null,
          },
        })
        itemCount++
        if (itemCount % 100 === 0) {
          console.log(`   Processed ${itemCount} items...`)
        }
      } catch (e: any) {
        // Skip duplicates
      }
    }
    console.log(`✅ Imported ${itemCount} booking items\n`)
    
    // 6. Import Exchange Data
    console.log('📊 Importing exchange orders...')
    const exchanges = exportTable('Exchange Data')
    let exchangeCount = 0
    
    for (const row of exchanges) {
      try {
        if (!row.exchangeno || !row.bookno || !row.supplier || !row.customer) continue
        await prisma.exchangeData.create({
          data: {
            exchangeno: row.exchangeno.trim(),
            bookno: row.bookno.trim(),
            exchangedate: parseDate(row.exchangedate),
            supplier: row.supplier.trim(),
            status: row.status?.trim() || null,
            bookdate: parseDate(row.bookdate),
            customer: row.customer.trim(),
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
          },
        })
        exchangeCount++
        if (exchangeCount % 100 === 0) {
          console.log(`   Processed ${exchangeCount} exchanges...`)
        }
      } catch (e: any) {
        if (!e.message.includes('Unique constraint')) {
          console.error(`Error importing exchange: ${row.exchangeno}`, e.message)
        }
      }
    }
    console.log(`✅ Imported ${exchangeCount} exchange orders\n`)
    
    // 7. Import Exchange Item Data
    console.log('📊 Importing exchange items...')
    const exchangeItems = exportTable('Exchange Item Data')
    let exchangeItemCount = 0
    
    for (const row of exchangeItems) {
      try {
        if (!row.exchangeno || !row.item) continue
        await prisma.exchangeItemData.create({
          data: {
            exchangeno: row.exchangeno.trim(),
            item: row.item.trim(),
            quantity: parseInt(row.quantity) || 0,
            price: parseDecimal(row.price),
            unitprice: parseDecimal(row.unitprice),
          },
        })
        exchangeItemCount++
      } catch (e: any) {
        // Skip duplicates
      }
    }
    console.log(`✅ Imported ${exchangeItemCount} exchange items\n`)
    
    // 8. Import Booking Payment Data
    console.log('📊 Importing booking payments...')
    const bookingPayments = exportTable('Booking Payment Data')
    let bookingPaymentCount = 0
    
    for (const row of bookingPayments) {
      try {
        await prisma.bookingPaymentData.create({
          data: {
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
          },
        })
        bookingPaymentCount++
        if (bookingPaymentCount % 100 === 0) {
          console.log(`   Processed ${bookingPaymentCount} booking payments...`)
        }
      } catch (e: any) {
        // Skip errors
      }
    }
    console.log(`✅ Imported ${bookingPaymentCount} booking payments\n`)
    
    // 9. Import Exchange Payment Data
    console.log('📊 Importing exchange payments...')
    const exchangePayments = exportTable('Exchange Payment Data')
    let exchangePaymentCount = 0
    
    for (const row of exchangePayments) {
      try {
        if (!row.exchangeno) continue
        await prisma.exchangePaymentData.create({
          data: {
            exchangeno: row.exchangeno.trim(),
            bookno: row.bookno?.trim() || null,
            receiptdate: parseDate(row.receiptdate),
            paytype: row.paytype?.trim() || null,
            chequeno: row.chequeno?.trim() || null,
            amountpaid: parseDecimal(row.amountpaid),
            remarks: row.remarks?.trim() || null,
            issue: row.issue?.trim() || null,
            paidtext: row.paidtext?.trim() || null,
          },
        })
        exchangePaymentCount++
        if (exchangePaymentCount % 100 === 0) {
          console.log(`   Processed ${exchangePaymentCount} exchange payments...`)
        }
      } catch (e: any) {
        // Skip errors
      }
    }
    console.log(`✅ Imported ${exchangePaymentCount} exchange payments\n`)
    
    console.log('🎉 Data import completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
