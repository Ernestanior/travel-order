import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function deleteOldData() {
  console.log('🗑️  Starting deletion of data before 2026-01-01...\n')
  
  const cutoffDate = new Date('2026-01-01')
  const BATCH_SIZE = 100 // 每次删除100条记录
  
  try {
    // 1. 获取所有要删除的 booking numbers
    console.log('📋 Step 1: Finding old booking orders...')
    const oldBookings = await prisma.bookingData.findMany({
      where: {
        bookdate: {
          lt: cutoffDate
        }
      },
      select: {
        bookno: true
      }
    })
    
    const booknoList = oldBookings.map(b => b.bookno)
    console.log(`   Found ${booknoList.length} booking orders to delete\n`)
    
    // 2. 获取所有要删除的 exchange numbers
    console.log('📋 Step 2: Finding old exchange orders...')
    const oldExchanges = await prisma.exchangeData.findMany({
      where: {
        exchangedate: {
          lt: cutoffDate
        }
      },
      select: {
        exchangeno: true
      }
    })
    
    const exchangenoList = oldExchanges.map(e => e.exchangeno)
    console.log(`   Found ${exchangenoList.length} exchange orders to delete\n`)
    
    // 3. 删除关联到旧 Booking 的 Exchange Orders
    console.log('🗑️  Step 3: Finding exchanges linked to old bookings...')
    const linkedExchanges = await prisma.exchangeData.findMany({
      where: {
        bookno: {
          in: booknoList
        }
      },
      select: {
        exchangeno: true
      }
    })
    
    const linkedExchangenoList = linkedExchanges.map(e => e.exchangeno)
    console.log(`   Found ${linkedExchangenoList.length} exchanges linked to old bookings\n`)
    
    // 删除这些 Exchange 的相关数据
    if (linkedExchangenoList.length > 0) {
      console.log('🗑️  Step 4: Deleting linked exchange data...')
      
      // 删除 Exchange Payments
      let deletedCount = 0
      for (let i = 0; i < linkedExchangenoList.length; i += BATCH_SIZE) {
        const batch = linkedExchangenoList.slice(i, i + BATCH_SIZE)
        const result = await prisma.exchangePaymentData.deleteMany({
          where: {
            exchangeno: {
              in: batch
            }
          }
        })
        deletedCount += result.count
        console.log(`   Deleted ${deletedCount} linked exchange payments (${Math.min(i + BATCH_SIZE, linkedExchangenoList.length)}/${linkedExchangenoList.length})`)
      }
      
      // 删除 Exchange Items
      deletedCount = 0
      for (let i = 0; i < linkedExchangenoList.length; i += BATCH_SIZE) {
        const batch = linkedExchangenoList.slice(i, i + BATCH_SIZE)
        const result = await prisma.exchangeItemData.deleteMany({
          where: {
            exchangeno: {
              in: batch
            }
          }
        })
        deletedCount += result.count
        console.log(`   Deleted ${deletedCount} linked exchange items (${Math.min(i + BATCH_SIZE, linkedExchangenoList.length)}/${linkedExchangenoList.length})`)
      }
      
      // 删除 Exchange Orders
      deletedCount = 0
      for (let i = 0; i < linkedExchangenoList.length; i += BATCH_SIZE) {
        const batch = linkedExchangenoList.slice(i, i + BATCH_SIZE)
        const result = await prisma.exchangeData.deleteMany({
          where: {
            exchangeno: {
              in: batch
            }
          }
        })
        deletedCount += result.count
        console.log(`   Deleted ${deletedCount} linked exchange orders (${Math.min(i + BATCH_SIZE, linkedExchangenoList.length)}/${linkedExchangenoList.length})`)
      }
      
      console.log('   ✅ Linked exchange data deleted\n')
    }
    
    // 4. 删除 Booking 相关数据
    console.log('🗑️  Step 5: Deleting booking-related data...')
    
    // 删除 Booking Payments
    let deletedCount = 0
    for (let i = 0; i < booknoList.length; i += BATCH_SIZE) {
      const batch = booknoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.bookingPaymentData.deleteMany({
        where: {
          bookno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} booking payments (${Math.min(i + BATCH_SIZE, booknoList.length)}/${booknoList.length})`)
    }
    
    // 删除 Items
    deletedCount = 0
    for (let i = 0; i < booknoList.length; i += BATCH_SIZE) {
      const batch = booknoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.itemData.deleteMany({
        where: {
          bookno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} booking items (${Math.min(i + BATCH_SIZE, booknoList.length)}/${booknoList.length})`)
    }
    
    // 删除 Passengers
    deletedCount = 0
    for (let i = 0; i < booknoList.length; i += BATCH_SIZE) {
      const batch = booknoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.passengerData.deleteMany({
        where: {
          bookno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} passengers (${Math.min(i + BATCH_SIZE, booknoList.length)}/${booknoList.length})`)
    }
    
    // 删除 Booking Orders
    deletedCount = 0
    for (let i = 0; i < booknoList.length; i += BATCH_SIZE) {
      const batch = booknoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.bookingData.deleteMany({
        where: {
          bookno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} booking orders (${Math.min(i + BATCH_SIZE, booknoList.length)}/${booknoList.length})`)
    }
    
    console.log('   ✅ Booking-related data deleted\n')
    
    // 6. 删除 Exchange 相关数据（按日期）
    console.log('🗑️  Step 6: Deleting exchange-related data (by date)...')
    
    // 删除 Exchange Payments
    deletedCount = 0
    for (let i = 0; i < exchangenoList.length; i += BATCH_SIZE) {
      const batch = exchangenoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.exchangePaymentData.deleteMany({
        where: {
          exchangeno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} exchange payments (${Math.min(i + BATCH_SIZE, exchangenoList.length)}/${exchangenoList.length})`)
    }
    
    // 删除 Exchange Items
    deletedCount = 0
    for (let i = 0; i < exchangenoList.length; i += BATCH_SIZE) {
      const batch = exchangenoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.exchangeItemData.deleteMany({
        where: {
          exchangeno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} exchange items (${Math.min(i + BATCH_SIZE, exchangenoList.length)}/${exchangenoList.length})`)
    }
    
    // 删除 Exchange Orders
    deletedCount = 0
    for (let i = 0; i < exchangenoList.length; i += BATCH_SIZE) {
      const batch = exchangenoList.slice(i, i + BATCH_SIZE)
      const result = await prisma.exchangeData.deleteMany({
        where: {
          exchangeno: {
            in: batch
          }
        }
      })
      deletedCount += result.count
      console.log(`   Deleted ${deletedCount} exchange orders (${Math.min(i + BATCH_SIZE, exchangenoList.length)}/${exchangenoList.length})`)
    }
    
    console.log('   ✅ Exchange-related data deleted\n')
    
    // 7. 清理孤立的 Customers 和 Suppliers（可选）
    console.log('🗑️  Step 7: Checking for orphaned customers and suppliers...')
    
    // 检查没有任何订单的客户
    const allCustomers = await prisma.customer.findMany({
      select: { customer: true }
    })
    
    let orphanedCustomers = 0
    for (const customer of allCustomers) {
      const hasBookings = await prisma.bookingData.count({
        where: { customer: customer.customer }
      })
      const hasExchanges = await prisma.exchangeData.count({
        where: { customer: customer.customer }
      })
      
      if (hasBookings === 0 && hasExchanges === 0) {
        await prisma.customer.delete({
          where: { customer: customer.customer }
        })
        orphanedCustomers++
      }
    }
    
    console.log(`   Deleted ${orphanedCustomers} orphaned customers`)
    
    // 检查没有任何订单的供应商
    const allSuppliers = await prisma.supplier.findMany({
      select: { supplier: true }
    })
    
    let orphanedSuppliers = 0
    for (const supplier of allSuppliers) {
      const hasExchanges = await prisma.exchangeData.count({
        where: { supplier: supplier.supplier }
      })
      
      if (hasExchanges === 0) {
        await prisma.supplier.delete({
          where: { supplier: supplier.supplier }
        })
        orphanedSuppliers++
      }
    }
    
    console.log(`   Deleted ${orphanedSuppliers} orphaned suppliers\n`)
    
    // 8. 显示最终统计
    console.log('📊 Final Statistics:')
    console.log(`   Booking Orders: ${await prisma.bookingData.count()}`)
    console.log(`   Exchange Orders: ${await prisma.exchangeData.count()}`)
    console.log(`   Customers: ${await prisma.customer.count()}`)
    console.log(`   Suppliers: ${await prisma.supplier.count()}`)
    console.log(`   Passengers: ${await prisma.passengerData.count()}`)
    console.log(`   Booking Items: ${await prisma.itemData.count()}`)
    console.log(`   Exchange Items: ${await prisma.exchangeItemData.count()}`)
    console.log(`   Booking Payments: ${await prisma.bookingPaymentData.count()}`)
    console.log(`   Exchange Payments: ${await prisma.exchangePaymentData.count()}`)
    
    console.log('\n✅ Deletion completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during deletion:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 确认提示
console.log('⚠️  WARNING: This will delete all data before 2026-01-01!')
console.log('⚠️  This operation CANNOT be undone!')
console.log('\nStarting in 3 seconds...\n')

setTimeout(() => {
  deleteOldData()
}, 3000)
