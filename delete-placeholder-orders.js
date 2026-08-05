// 删除指定的占位订单
// 使用方法: node delete-placeholder-orders.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deletePlaceholderOrders() {
  try {
    console.log('开始删除占位订单...')
    
    // 要删除的订单号
    const ordersToDelete = ['T100056', 'T100057', 'T100058', 'T100059', 'T100060', 'T100061']
    
    for (const bookno of ordersToDelete) {
      console.log(`\n检查订单 ${bookno}...`)
      
      // 查询订单信息
      const order = await prisma.bookingData.findUnique({
        where: { bookno },
        include: {
          items: true,
          passengers: true,
          payments: true,
          exchanges: true
        }
      })
      
      if (!order) {
        console.log(`  订单 ${bookno} 不存在`)
        continue
      }
      
      // 检查是否是占位订单（customer 为 [PLACEHOLDER] 且 status 为 Placeholder）
      if (order.customer === '[PLACEHOLDER]' && order.status === 'Placeholder') {
        console.log(`  确认为占位订单，正在删除...`)
        
        // 删除关联数据
        await prisma.itemData.deleteMany({ where: { bookno } })
        await prisma.passengerData.deleteMany({ where: { bookno } })
        await prisma.bookingPaymentData.deleteMany({ where: { bookno } })
        
        // 检查是否有 exchange orders
        if (order.exchanges.length > 0) {
          console.log(`  警告：订单 ${bookno} 有 ${order.exchanges.length} 个关联的 Exchange Orders，跳过删除`)
          continue
        }
        
        // 删除主订单
        await prisma.bookingData.delete({ where: { bookno } })
        console.log(`  ✓ 成功删除订单 ${bookno}`)
      } else {
        console.log(`  订单 ${bookno} 不是占位订单 (customer: ${order.customer}, status: ${order.status})`)
        console.log(`  如果需要删除，请手动确认`)
      }
    }
    
    console.log('\n删除完成！')
    
  } catch (error) {
    console.error('删除过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deletePlaceholderOrders()
