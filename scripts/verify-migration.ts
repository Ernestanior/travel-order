import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
  console.log('🔍 验证新加坡数据库...\n')
  
  try {
    // 检查数据库连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功\n')
    
    // 检查数据
    const stats = {
      customers: await prisma.customer.count(),
      suppliers: await prisma.supplier.count(),
      bookings: await prisma.bookingData.count(),
      exchanges: await prisma.exchangeData.count(),
      passengers: await prisma.passengerData.count(),
      items: await prisma.itemData.count()
    }
    
    console.log('📊 数据统计:')
    console.log(`   客户: ${stats.customers}`)
    console.log(`   供应商: ${stats.suppliers}`)
    console.log(`   订单: ${stats.bookings}`)
    console.log(`   Exchange Orders: ${stats.exchanges}`)
    console.log(`   乘客: ${stats.passengers}`)
    console.log(`   订单项: ${stats.items}`)
    
    // 测试查询最新的订单
    console.log('\n📋 最新的 5 个订单:')
    const recentBookings = await prisma.bookingData.findMany({
      take: 5,
      orderBy: { bookdate: 'desc' },
      select: {
        bookno: true,
        customer: true,
        bookdate: true
      }
    })
    
    recentBookings.forEach(b => {
      console.log(`   - ${b.bookno}: ${b.customer} (${b.bookdate?.toISOString().split('T')[0]})`)
    })
    
    console.log('\n✅ 新加坡数据库验证成功！')
    console.log('\n数据库位置: ap-southeast-1 (Singapore)')
    console.log('预计延迟会大幅降低 🚀')
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMigration()
