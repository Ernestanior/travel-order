import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateStatusByOutstanding() {
  console.log('开始更新订单状态...')
  
  try {
    // 获取所有订单
    const bookings = await prisma.bookingData.findMany({
      include: {
        items: true,
        payments: true
      }
    })
    
    console.log(`找到 ${bookings.length} 个 Booking Orders`)
    
    let updatedToCloseCount = 0
    let updatedToOpenCount = 0
    
    for (const booking of bookings) {
      const totalCost = booking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const discount = Number(booking.discount || 0)
      const paid = booking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = (totalCost - discount) - paid
      
      // 如果 outstanding <= 0 但 status 不是 Close，更新为 Close
      if (outstanding <= 0.001 && booking.status !== 'Close') {
        await prisma.bookingData.update({
          where: { id: booking.id },
          data: { status: 'Close' }
        })
        console.log(`✓ 更新 Booking ${booking.bookno}: outstanding=${outstanding.toFixed(2)}, status: ${booking.status} -> Close`)
        updatedToCloseCount++
      }
      // 如果 outstanding > 0 但 status 是 Close，更新为 Open
      else if (outstanding > 0.001 && booking.status === 'Close') {
        await prisma.bookingData.update({
          where: { id: booking.id },
          data: { status: 'Open' }
        })
        console.log(`✓ 更新 Booking ${booking.bookno}: outstanding=${outstanding.toFixed(2)}, status: Close -> Open`)
        updatedToOpenCount++
      }
    }
    
    console.log(`\n已更新 ${updatedToCloseCount} 个订单为 Close`)
    console.log(`已更新 ${updatedToOpenCount} 个订单为 Open`)
    
    // 获取所有 Exchange Orders
    const exchanges = await prisma.exchangeData.findMany({
      include: {
        items: true,
        payments: true
      }
    })
    
    console.log(`\n找到 ${exchanges.length} 个 Exchange Orders`)
    
    let exchangeUpdatedToCloseCount = 0
    let exchangeUpdatedToOpenCount = 0
    
    for (const exchange of exchanges) {
      const totalCost = exchange.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const discount = Number(exchange.discount || 0)
      const paid = exchange.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = (totalCost - discount) - paid
      
      // 如果 outstanding <= 0 但 status 不是 Close，更新为 Close
      if (outstanding <= 0.001 && exchange.status !== 'Close') {
        await prisma.exchangeData.update({
          where: { id: exchange.id },
          data: { status: 'Close' }
        })
        console.log(`✓ 更新 Exchange ${exchange.exchangeno}: outstanding=${outstanding.toFixed(2)}, status: ${exchange.status} -> Close`)
        exchangeUpdatedToCloseCount++
      }
      // 如果 outstanding > 0 但 status 是 Close，更新为 Open
      else if (outstanding > 0.001 && exchange.status === 'Close') {
        await prisma.exchangeData.update({
          where: { id: exchange.id },
          data: { status: 'Open' }
        })
        console.log(`✓ 更新 Exchange ${exchange.exchangeno}: outstanding=${outstanding.toFixed(2)}, status: Close -> Open`)
        exchangeUpdatedToOpenCount++
      }
    }
    
    console.log(`\n已更新 ${exchangeUpdatedToCloseCount} 个 Exchange 为 Close`)
    console.log(`已更新 ${exchangeUpdatedToOpenCount} 个 Exchange 为 Open`)
    console.log(`\n总共更新: ${updatedToCloseCount + updatedToOpenCount + exchangeUpdatedToCloseCount + exchangeUpdatedToOpenCount} 个订单`)
    
  } catch (error) {
    console.error('更新失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateStatusByOutstanding()
  .then(() => {
    console.log('\n✓ 状态更新完成!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ 更新失败:', error)
    process.exit(1)
  })
