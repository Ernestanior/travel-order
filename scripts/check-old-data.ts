import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function checkOldData() {
  console.log('🔍 Checking data before 2026-01-01...\n')
  
  const cutoffDate = new Date('2026-01-01')
  
  try {
    // 检查 Booking Orders
    const oldBookings = await prisma.bookingData.count({
      where: {
        bookdate: {
          lt: cutoffDate
        }
      }
    })
    
    const totalBookings = await prisma.bookingData.count()
    
    console.log(`📊 Booking Orders:`)
    console.log(`   Total: ${totalBookings}`)
    console.log(`   Before 2026-01-01: ${oldBookings}`)
    console.log(`   Will keep: ${totalBookings - oldBookings}`)
    console.log(`   % to delete: ${((oldBookings / totalBookings) * 100).toFixed(1)}%\n`)
    
    // 检查 Exchange Orders
    const oldExchanges = await prisma.exchangeData.count({
      where: {
        exchangedate: {
          lt: cutoffDate
        }
      }
    })
    
    const totalExchanges = await prisma.exchangeData.count()
    
    console.log(`📊 Exchange Orders:`)
    console.log(`   Total: ${totalExchanges}`)
    console.log(`   Before 2026-01-01: ${oldExchanges}`)
    console.log(`   Will keep: ${totalExchanges - oldExchanges}`)
    console.log(`   % to delete: ${((oldExchanges / totalExchanges) * 100).toFixed(1)}%\n`)
    
    // 获取将要删除的 booking numbers
    const bookingsToDelete = await prisma.bookingData.findMany({
      where: {
        bookdate: {
          lt: cutoffDate
        }
      },
      select: {
        bookno: true
      },
      take: 10 // 只取前10个作为示例
    })
    
    const booknoList = bookingsToDelete.map(b => b.bookno)
    
    // 检查相关数据
    const relatedPassengers = await prisma.passengerData.count({
      where: {
        bookno: {
          in: booknoList
        }
      }
    })
    
    const relatedItems = await prisma.itemData.count({
      where: {
        bookno: {
          in: booknoList
        }
      }
    })
    
    const relatedPayments = await prisma.bookingPaymentData.count({
      where: {
        bookno: {
          in: booknoList
        }
      }
    })
    
    console.log(`📊 Related data (estimated based on sample):`)
    console.log(`   Passengers to delete: ~${Math.round(relatedPassengers * (oldBookings / 10))}`)
    console.log(`   Items to delete: ~${Math.round(relatedItems * (oldBookings / 10))}`)
    console.log(`   Payments to delete: ~${Math.round(relatedPayments * (oldBookings / 10))}\n`)
    
    // 获取将要删除的 exchange numbers
    const exchangesToDelete = await prisma.exchangeData.findMany({
      where: {
        exchangedate: {
          lt: cutoffDate
        }
      },
      select: {
        exchangeno: true
      },
      take: 10
    })
    
    const exchangenoList = exchangesToDelete.map(e => e.exchangeno)
    
    const relatedExchangeItems = await prisma.exchangeItemData.count({
      where: {
        exchangeno: {
          in: exchangenoList
        }
      }
    })
    
    const relatedExchangePayments = await prisma.exchangePaymentData.count({
      where: {
        exchangeno: {
          in: exchangenoList
        }
      }
    })
    
    console.log(`📊 Related exchange data (estimated):`)
    console.log(`   Exchange Items to delete: ~${Math.round(relatedExchangeItems * (oldExchanges / 10))}`)
    console.log(`   Exchange Payments to delete: ~${Math.round(relatedExchangePayments * (oldExchanges / 10))}\n`)
    
    // 检查最新的订单日期
    const latestBooking = await prisma.bookingData.findFirst({
      where: {
        bookdate: {
          gte: cutoffDate
        }
      },
      orderBy: {
        bookdate: 'desc'
      },
      select: {
        bookno: true,
        bookdate: true,
        customer: true
      }
    })
    
    const oldestBooking = await prisma.bookingData.findFirst({
      where: {
        bookdate: {
          lt: cutoffDate
        }
      },
      orderBy: {
        bookdate: 'desc'
      },
      select: {
        bookno: true,
        bookdate: true,
        customer: true
      }
    })
    
    console.log(`📅 Date Range:`)
    console.log(`   Latest booking to delete: ${oldestBooking?.bookdate?.toISOString().split('T')[0]} (${oldestBooking?.bookno})`)
    console.log(`   Oldest booking to keep: ${latestBooking?.bookdate?.toISOString().split('T')[0]} (${latestBooking?.bookno})\n`)
    
    console.log(`⚠️  SUMMARY:`)
    console.log(`   This will delete approximately:`)
    console.log(`   - ${oldBookings} Booking Orders`)
    console.log(`   - ${oldExchanges} Exchange Orders`)
    console.log(`   - All related passengers, items, and payments\n`)
    
    console.log(`✅ Data after 2026-01-01 will be kept:`)
    console.log(`   - ${totalBookings - oldBookings} Booking Orders`)
    console.log(`   - ${totalExchanges - oldExchanges} Exchange Orders\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOldData()
