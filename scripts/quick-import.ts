import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient()
const MDB_FILE = path.join(__dirname, '../assets/db.mdb')

function exportTable(tableName: string): any[] {
  try {
    console.log(`  Exporting ${tableName}...`)
    const output = execSync(`mdb-export "${MDB_FILE}" "${tableName}"`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    })
    
    const lines = output.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      console.log(`  ⚠️  ${tableName}: No data`)
      return []
    }
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').toLowerCase())
    const rows = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim())
      const row: any = {}
      headers.forEach((header, index) => {
        const val = values[index]
        row[header] = (!val || val === '') ? null : val
      })
      rows.push(row)
    }
    
    console.log(`  ✓ ${tableName}: ${rows.length} rows exported`)
    return rows
  } catch (error) {
    console.error(`  ✗ Error exporting ${tableName}:`, error)
    return []
  }
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  try {
    const parts = dateStr.split(' ')[0].split('/')
    if (parts.length === 3) {
      const month = parseInt(parts[0])
      const day = parseInt(parts[1])
      let year = parseInt(parts[2])
      if (year < 100) year += year < 50 ? 2000 : 1900
      return new Date(year, month - 1, day)
    }
  } catch (e) {
    return null
  }
  return null
}

async function quickImport() {
  console.log('🚀 Quick Import - Essential Data Only\n')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected\n')
    
    // Import Suppliers (small dataset)
    console.log('📊 Importing Suppliers...')
    const suppliers = exportTable('Supplier Data')
    let suppCount = 0
    for (const row of suppliers.slice(0, 100)) { // Limit to 100 for testing
      try {
        if (!row.supplier) continue
        await prisma.supplier.upsert({
          where: { supplier: row.supplier },
          update: {},
          create: {
            supplier: row.supplier,
            address: row.address,
            tel: row.tel,
            fax: row.fax,
          },
        })
        suppCount++
      } catch (e: any) {
        if (!e.message?.includes('Unique')) {
          console.log(`    Error: ${row.supplier?.substring(0, 30)}`)
        }
      }
    }
    console.log(`✅ Suppliers: ${suppCount} imported\n`)
    
    // Import Booking Data (sample)
    console.log('📊 Importing Booking Orders (sample: first 50)...')
    const bookings = exportTable('Booking Data')
    let bookCount = 0
    for (const row of bookings.slice(0, 50)) { // Just first 50 for quick test
      try {
        if (!row.bookno || !row.customer) continue
        await prisma.bookingData.create({
          data: {
            bookno: row.bookno,
            bookdate: parseDate(row.bookdate),
            customer: row.customer,
            deptdate: parseDate(row.deptdate),
            depttime: row.depttime,
            deptflt: row.deptflt,
            deptdest: row.deptdest,
            arrvdate: parseDate(row.arrvdate),
            arrvtime: row.arrvtime,
            arrvflt: row.arrvflt,
            arrvdest: row.arrvdest,
            discount: parseFloat(row.discount || '0'),
            tourcode: row.tourcode,
            tour: row.tour,
            staff: row.staff,
            status: row.status,
            special: row.special,
          },
        })
        bookCount++
      } catch (e: any) {
        if (!e.message?.includes('Unique')) {
          console.log(`    Error: ${row.bookno}`)
        }
      }
    }
    console.log(`✅ Booking Orders: ${bookCount} imported\n`)
    
    // Check results
    console.log('📊 Final counts:')
    console.log(`  Customers: ${await prisma.customer.count()}`)
    console.log(`  Suppliers: ${await prisma.supplier.count()}`)
    console.log(`  Bookings: ${await prisma.bookingData.count()}`)
    
    console.log('\n✅ Quick import complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickImport()
