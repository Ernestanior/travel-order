// 检查指定订单的详细信息
// 使用方法: node check-orders.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkOrders() {
  try {
    console.log('检查订单 T100056 到 T100062 的详细信息...\n')
    
    const orders = await prisma.bookingData.findMany({
      where: {
        bookno: {
          in: ['T100056', 'T100057', 'T100058', 'T100059', 'T100060', 'T100061', 'T100062']
        }
      },
      include: {
        items: true,
        passengers: true,
        payments: true,
        exchanges: true
      },
      orderBy: {
        bookno: 'asc'
      }
    })
    
    if (orders.length === 0) {
      console.log('没有找到任何订单')
      return
    }
    
    for (const order of orders) {
      console.log('━'.repeat(80))
      console.log(`订单号: ${order.bookno} (Display No: ${order.display_no})`)
      console.log(`客户: ${order.customer}`)
      console.log(`状态: ${order.status}`)
      console.log(`预订日期: ${order.bookdate}`)
      console.log(`出发日期: ${order.deptdate}`)
      console.log(`折扣: ${order.discount}`)
      console.log(`Items 数量: ${order.items.length}`)
      console.log(`Passengers 数量: ${order.passengers.length}`)
      console.log(`Payments 数量: ${order.payments.length}`)
      console.log(`Exchanges 数量: ${order.exchanges.length}`)
      
      // 计算总金额
      const totalCost = order.items.reduce((sum, item) => sum + Number(item.price || 0), 0)
      const paid = order.payments.reduce((sum, payment) => sum + Number(payment.amountpaid || 0), 0)
      console.log(`总金额: $${totalCost.toFixed(2)}`)
      console.log(`已付: $${paid.toFixed(2)}`)
      
      if (order.items.length > 0) {
        console.log('\nItems:')
        order.items.forEach(item => {
          console.log(`  - ${item.item}: ${item.quantity} x $${item.unitprice} = $${item.price}`)
        })
      }
      
      if (order.passengers.length > 0) {
        console.log('\nPassengers:')
        order.passengers.forEach(p => {
          console.log(`  - ${p.paxname} (${p.passport || 'No passport'})`)
        })
      }
      
      console.log('')
    }
    
    console.log('━'.repeat(80))
    
  } catch (error) {
    console.error('查询过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders()
