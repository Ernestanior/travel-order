import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

const MDB_FILE = path.join(__dirname, '../assets/db.mdb')
const TINY_BATCH = 25 // Very small batch

function exportTable(tableName: string): any[] {
  try {
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

async function finishImport() {
  console.log('🚀 Finishing remaining imports...\n')
  
  try {
    // 1. Finish exchange items
    console.log('📊 Finishing exchange items...')
    const currentCount = await prisma.exchangeItemData.count()
    console.log(`   Current: ${currentCount}`)
    
    const exchangeItems = exportTable('Exchange Item Data')
    console.log(`   Total available: ${exchangeItems.length}`)
    
    const validExchanges = await prisma.exchangeData.findMany({
      select: { exchangeno: true }
    })
    const validExchangenoSet = new Set(validExchanges.map(e => e.exchangeno))
    
    // Get already imported exchange items
    const existingItems = await prisma.exchangeItemData.findMany({
      select: { exchangeno: true, item: true }
    })
    const existingSet = new Set(existingItems.map(i => `${i.exchangeno}|${i.item}`))
    
    const validExchangeItems = exchangeItems.filter(item => 
      item.exchangeno && item.item && 
      validExchangenoSet.has(item.exchangeno.trim()) &&
      !existingSet.has(`${item.exchangeno.trim()}|${item.item.trim()}`)
    )
    
    console.log(`   Need to import: ${validExchangeItems.length}`)
    
    let imported = 0
    for (let i = 0; i < validExchangeItems.length; i += TINY_BATCH) {
      const batch = validExchangeItems.slice(i, i + TINY_BATCH)
      const data = batch.map(row => ({
        exchangeno: row.exchangeno.trim(),
        item: row.item.trim(),
        quantity: parseInt(row.quantity) || 0,
        price: parseDecimal(row.price),
        unitprice: parseDecimal(row.unitprice),
      }))
      
      try {
        await prisma.exchangeItemData.createMany({
          data,
          skipDuplicates: true,
        })
        imported += data.length
        if (imported % 250 === 0) {
          console.log(`   Progress: ${imported}/${validExchangeItems.length}`)
        }
      } catch (error: any) {
        console.error(`   Error at batch ${i}: ${error.message}`)
      }
    }
    
    const finalExchangeItemCount = await prisma.exchangeItemData.count()
    console.log(`✅ Total exchange items: ${finalExchangeItemCount}\n`)
    
    // 2. Import exchange payments
    console.log('📊 Importing exchange payments...')
    const exchangePayments = exportTable('Exchange Payment Data')
    console.log(`   Total available: ${exchangePayments.length}`)
    
    const validExchangePayments = exchangePayments.filter(p => 
      p.exchangeno && validExchangenoSet.has(p.exchangeno.trim())
    )
    
    console.log(`   Valid payments: ${validExchangePayments.length}`)
    
    imported = 0
    for (let i = 0; i < validExchangePayments.length; i += TINY_BATCH) {
      const batch = validExchangePayments.slice(i, i + TINY_BATCH)
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
      
      try {
        await prisma.exchangePaymentData.createMany({
          data,
          skipDuplicates: true,
        })
        imported += data.length
        if (imported % 250 === 0) {
          console.log(`   Progress: ${imported}/${validExchangePayments.length}`)
        }
      } catch (error: any) {
        console.error(`   Error at batch ${i}: ${error.message}`)
      }
    }
    
    const finalExchangePaymentCount = await prisma.exchangePaymentData.count()
    console.log(`✅ Total exchange payments: ${finalExchangePaymentCount}\n`)
    
    console.log('🎉 All data imported!\n')
    console.log('📊 Final Summary:')
    console.log(`   Customers: ${await prisma.customer.count()}`)
    console.log(`   Suppliers: ${await prisma.supplier.count()}`)
    console.log(`   Booking Orders: ${await prisma.bookingData.count()}`)
    console.log(`   Exchange Orders: ${await prisma.exchangeData.count()}`)
    console.log(`   Passengers: ${await prisma.passengerData.count()}`)
    console.log(`   Booking Items: ${await prisma.itemData.count()}`)
    console.log(`   Exchange Items: ${finalExchangeItemCount}`)
    console.log(`   Booking Payments: ${await prisma.bookingPaymentData.count()}`)
    console.log(`   Exchange Payments: ${finalExchangePaymentCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finishImport()
