const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function syncDisplayToBookno() {
  try {
    console.log('=== 将 display_no 同步为 bookno ===\n')
    
    // 步骤 1: 先清空所有 display_no（避免唯一性冲突）
    console.log('步骤 1: 清空所有 display_no...')
    await prisma.bookingData.updateMany({
      data: { display_no: null }
    })
    console.log('✅ 已清空\n')
    
    // 步骤 2: 获取所有订单
    console.log('步骤 2: 同步 display_no = bookno...')
    const allOrders = await prisma.bookingData.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        bookno: true,
        customer: true
      }
    })
    
    console.log(`共有 ${allOrders.length} 个订单需要同步\n`)
    
    // 步骤 3: 逐个设置 display_no = bookno
    let updated = 0
    for (const order of allOrders) {
      await prisma.bookingData.update({
        where: { id: order.id },
        data: { display_no: order.bookno }
      })
      console.log(`✅ ${order.bookno}: display_no = ${order.bookno}`)
      updated++
    }
    
    console.log(`\n=== 完成 ===`)
    console.log(`成功同步: ${updated} 个订单`)
    
  } catch (error) {
    console.error('同步失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncDisplayToBookno()
