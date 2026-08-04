const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function listPlaceholderOrders() {
  try {
    console.log('=== 占位订单列表 ===\n')
    
    const placeholderOrders = await prisma.bookingData.findMany({
      where: {
        status: 'Placeholder'
      },
      orderBy: {
        bookno: 'asc'
      },
      select: {
        id: true,
        bookno: true,
        display_no: true,
        bookdate: true,
        customer: true,
        status: true,
        special: true
      }
    })
    
    console.log(`共有 ${placeholderOrders.length} 个占位订单:\n`)
    
    placeholderOrders.forEach(order => {
      console.log(`${order.bookno} (ID: ${order.id})`)
      console.log(`  Display No: ${order.display_no}`)
      console.log(`  Customer: ${order.customer}`)
      console.log(`  Status: ${order.status}`)
      console.log(`  Note: ${order.special}`)
      console.log()
    })
    
    console.log('这些订单用于填补空缺，保持订单号连续性')
    console.log('它们在列表中可见，但没有实际业务数据')
    
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listPlaceholderOrders()
