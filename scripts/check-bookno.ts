import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkBookingNumbers() {
  try {
    // 获取最近的10个订单号
    const recentBookings = await prisma.bookingData.findMany({
      select: { bookno: true, id: true },
      orderBy: { id: 'desc' },
      take: 10
    })
    
    console.log('最近的订单号:')
    recentBookings.forEach(b => {
      console.log(`  ID: ${b.id}, Bookno: ${b.bookno}`)
    })
    
    // 获取最大的纯数字订单号
    const numericBooknos = recentBookings
      .map(b => parseInt(b.bookno))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)
    
    console.log('\n纯数字订单号 (降序):')
    console.log(numericBooknos.slice(0, 5))
    
    if (numericBooknos.length > 0) {
      const nextBookno = numericBooknos[0] + 1
      console.log(`\n建议下一个订单号: ${nextBookno}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookingNumbers()
