const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fillDisplayNumbers() {
  try {
    console.log('=== 为现有订单填充 display_no ===\n')
    
    // 1. 获取所有没有 display_no 的订单，按 id 排序
    const ordersWithoutDisplayNo = await prisma.bookingData.findMany({
      where: {
        display_no: null
      },
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true,
        bookno: true
      }
    })
    
    console.log(`找到 ${ordersWithoutDisplayNo.length} 个需要填充 display_no 的订单\n`)
    
    if (ordersWithoutDisplayNo.length === 0) {
      console.log('✅ 所有订单都已经有 display_no')
      return
    }
    
    // 2. 获取当前最大的 display_no
    const maxDisplayOrder = await prisma.bookingData.findFirst({
      where: {
        display_no: {
          not: null
        }
      },
      orderBy: {
        display_no: 'desc'
      },
      select: {
        display_no: true
      }
    })
    
    let nextNumber = 100001
    if (maxDisplayOrder && maxDisplayOrder.display_no) {
      const match = maxDisplayOrder.display_no.match(/T(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    console.log(`起始 display_no: T${nextNumber}\n`)
    
    // 3. 逐个更新（使用事务确保一致性）
    let updated = 0
    for (const order of ordersWithoutDisplayNo) {
      const displayNo = `T${nextNumber}`
      
      try {
        await prisma.bookingData.update({
          where: { id: order.id },
          data: { display_no: displayNo }
        })
        
        console.log(`✅ ${order.bookno} (ID: ${order.id}) -> display_no: ${displayNo}`)
        nextNumber++
        updated++
      } catch (error) {
        console.error(`❌ 更新失败: ${order.bookno}`, error.message)
      }
    }
    
    console.log(`\n=== 完成 ===`)
    console.log(`成功更新: ${updated} 个订单`)
    console.log(`下一个可用的 display_no: T${nextNumber}`)
    
  } catch (error) {
    console.error('填充失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fillDisplayNumbers()
