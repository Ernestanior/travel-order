const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkRelations() {
  try {
    console.log('=== 检查关联关系 ===\n')
    
    // 检查是否有使用 bookno 的关联数据
    const exchanges = await prisma.exchangeData.count()
    const items = await prisma.itemData.count()
    const passengers = await prisma.passengerData.count()
    const payments = await prisma.bookingPaymentData.count()
    
    console.log('依赖 bookno 的数据量:')
    console.log(`  Exchange Orders: ${exchanges}`)
    console.log(`  Items: ${items}`)
    console.log(`  Passengers: ${passengers}`)
    console.log(`  Payments: ${payments}`)
    
    // 检查一个具体例子
    console.log('\n=== 示例关联 ===')
    const sampleBooking = await prisma.bookingData.findFirst({
      include: {
        items: true,
        passengers: true,
        payments: true,
        exchanges: true
      }
    })
    
    if (sampleBooking) {
      console.log(`\n订单: ${sampleBooking.bookno} (display_no: ${sampleBooking.display_no})`)
      console.log(`  - Items: ${sampleBooking.items.length}`)
      console.log(`  - Passengers: ${sampleBooking.passengers.length}`)
      console.log(`  - Payments: ${sampleBooking.payments.length}`)
      console.log(`  - Exchanges: ${sampleBooking.exchanges.length}`)
      
      if (sampleBooking.items.length > 0) {
        console.log(`\n  示例 Item: ${sampleBooking.items[0].item}`)
        console.log(`    关联字段 bookno: ${sampleBooking.items[0].bookno}`)
      }
    }
    
    console.log('\n=== 结论 ===')
    console.log('当前所有关联都使用 bookno 作为外键')
    console.log('如果要改用 id 作为外键，需要:')
    console.log('  1. 修改数据库表结构（添加 booking_id 列）')
    console.log('  2. 迁移所有现有数据')
    console.log('  3. 更新所有相关代码')
    console.log('\n建议: 保持现状，bookno 作为稳定的关联字段')
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRelations()
