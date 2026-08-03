const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkOrphanedRecords() {
  try {
    console.log('=== 检查是否有孤立的子记录 ===\n')
    
    const missingBookNos = [
      'T100018',
      'T100033', 'T100034', 'T100035', 'T100036', 'T100037',
      'T100051', 'T100052', 'T100053'
    ]
    
    for (const bookno of missingBookNos) {
      console.log(`\n检查 ${bookno}:`)
      
      // 检查 items
      const items = await prisma.itemData.findMany({
        where: { bookno }
      })
      
      // 检查 passengers
      const passengers = await prisma.passengerData.findMany({
        where: { bookno }
      })
      
      // 检查 payments
      const payments = await prisma.bookingPaymentData.findMany({
        where: { bookno }
      })
      
      if (items.length > 0) {
        console.log(`  ⚠️ 发现 ${items.length} 条 items 记录`)
        items.forEach(item => {
          console.log(`    - ${item.item}: ${item.quantity} x $${item.unitprice}`)
        })
      }
      
      if (passengers.length > 0) {
        console.log(`  ⚠️ 发现 ${passengers.length} 条 passengers 记录`)
        passengers.forEach(p => {
          console.log(`    - ${p.paxname}`)
        })
      }
      
      if (payments.length > 0) {
        console.log(`  ⚠️ 发现 ${payments.length} 条 payments 记录`)
        payments.forEach(p => {
          console.log(`    - ${p.receiptno}: $${p.amount}`)
        })
      }
      
      if (items.length === 0 && passengers.length === 0 && payments.length === 0) {
        console.log(`  ✅ 没有找到任何相关记录（确认是创建失败导致的跳号）`)
      }
    }
    
    console.log('\n\n=== 结论 ===')
    console.log('如果所有缺失的订单号都没有子记录，说明：')
    console.log('  1. 这些订单在创建过程中失败了')
    console.log('  2. 数据库序列已经消耗了这些号码')
    console.log('  3. 这是 PostgreSQL 序列的正常行为，不是删除操作')
    console.log('  4. 跳号不影响系统功能，只是号码不连续')
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrphanedRecords()
