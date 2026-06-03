import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('🔍 Checking database connection...\n')
    
    // 检查各个表的记录数
    const customerCount = await prisma.customer.count()
    console.log(`✓ Customers: ${customerCount}`)
    
    const supplierCount = await prisma.supplier.count()
    console.log(`✓ Suppliers: ${supplierCount}`)
    
    const bookingCount = await prisma.bookingData.count()
    console.log(`✓ Booking Orders: ${bookingCount}`)
    
    const exchangeCount = await prisma.exchangeData.count()
    console.log(`✓ Exchange Orders: ${exchangeCount}`)
    
    const passengerCount = await prisma.passengerData.count()
    console.log(`✓ Passengers: ${passengerCount}`)
    
    const itemCount = await prisma.itemData.count()
    console.log(`✓ Booking Items: ${itemCount}`)
    
    const exchangeItemCount = await prisma.exchangeItemData.count()
    console.log(`✓ Exchange Items: ${exchangeItemCount}`)
    
    const bookingPaymentCount = await prisma.bookingPaymentData.count()
    console.log(`✓ Booking Payments: ${bookingPaymentCount}`)
    
    const exchangePaymentCount = await prisma.exchangePaymentData.count()
    console.log(`✓ Exchange Payments: ${exchangePaymentCount}`)
    
    console.log('\n✅ Database connection successful!')
    
    // 显示一些示例数据
    console.log('\n📋 Sample Data:')
    const sampleBooking = await prisma.bookingData.findFirst({
      include: {
        passengers: true,
        items: true,
      }
    })
    
    if (sampleBooking) {
      console.log('\nSample Booking Order:')
      console.log(`  Booking #: ${sampleBooking.bookno}`)
      console.log(`  Customer: ${sampleBooking.customer}`)
      console.log(`  Date: ${sampleBooking.bookdate?.toISOString().split('T')[0] || 'N/A'}`)
      console.log(`  Passengers: ${sampleBooking.passengers.length}`)
      console.log(`  Items: ${sampleBooking.items.length}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
