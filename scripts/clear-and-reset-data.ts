import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Starting data cleanup and reset...\n')

  try {
    // 1. 先删除 Exchange 相关数据（因为它们引用 Booking Orders）
    console.log('🔄 Deleting Exchange Orders and related data...')
    
    // 删除 Exchange Payments
    const deletedExchangePayments = await prisma.exchangePaymentData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedExchangePayments.count} exchange payments`)
    
    // 删除 Exchange Items
    const deletedExchangeItems = await prisma.exchangeItemData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedExchangeItems.count} exchange items`)
    
    // 删除 Exchange Orders
    const deletedExchanges = await prisma.exchangeData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedExchanges.count} exchange orders\n`)

    // 2. 删除 Booking 相关数据
    console.log('📦 Deleting Booking Orders and related data...')
    
    // 删除 Booking Payments
    const deletedBookingPayments = await prisma.bookingPaymentData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedBookingPayments.count} booking payments`)
    
    // 删除 Passengers
    const deletedPassengers = await prisma.passengerData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedPassengers.count} passengers`)
    
    // 删除 Booking Items
    const deletedBookingItems = await prisma.itemData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedBookingItems.count} booking items`)
    
    // 删除 Booking Orders
    const deletedBookings = await prisma.bookingData.deleteMany({})
    console.log(`  ✅ Deleted ${deletedBookings.count} booking orders\n`)

    // 3. 重置序列（PostgreSQL）
    console.log('🔢 Resetting ID sequences...')
    
    // 重置 Booking Data ID 序列
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('booking_data', 'id'),
        100001,
        false
      );
    `
    console.log('  ✅ Booking Order ID sequence reset to start at 100001')
    
    // 重置 Exchange Data ID 序列
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('exchange_data', 'id'),
        100001,
        false
      );
    `
    console.log('  ✅ Exchange Order ID sequence reset to start at 100001')
    
    // 重置 Booking Payment ID 序列
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('booking_payment_data', 'id'),
        100001,
        false
      );
    `
    console.log('  ✅ Payment Receipt ID sequence reset to start at 100001')
    
    // 重置 Exchange Payment ID 序列
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('exchange_payment_data', 'id'),
        100001,
        false
      );
    `
    console.log('  ✅ Exchange Payment ID sequence reset to start at 100001\n')

    // 4. 验证保留的数据
    console.log('✅ Verifying retained data...')
    
    const customerCount = await prisma.customer.count()
    console.log(`  📋 Customers retained: ${customerCount}`)
    
    const supplierCount = await prisma.supplier.count()
    console.log(`  📋 Suppliers retained: ${supplierCount}\n`)

    // 5. 最终验证
    console.log('🔍 Final verification...')
    
    const remainingBookings = await prisma.bookingData.count()
    const remainingExchanges = await prisma.exchangeData.count()
    const remainingBookingPayments = await prisma.bookingPaymentData.count()
    const remainingExchangePayments = await prisma.exchangePaymentData.count()
    const remainingItems = await prisma.itemData.count()
    const remainingExchangeItems = await prisma.exchangeItemData.count()
    const remainingPassengers = await prisma.passengerData.count()
    
    console.log(`  Booking Orders: ${remainingBookings} (should be 0)`)
    console.log(`  Exchange Orders: ${remainingExchanges} (should be 0)`)
    console.log(`  Booking Payments: ${remainingBookingPayments} (should be 0)`)
    console.log(`  Exchange Payments: ${remainingExchangePayments} (should be 0)`)
    console.log(`  Booking Items: ${remainingItems} (should be 0)`)
    console.log(`  Exchange Items: ${remainingExchangeItems} (should be 0)`)
    console.log(`  Passengers: ${remainingPassengers} (should be 0)\n`)

    if (
      remainingBookings === 0 &&
      remainingExchanges === 0 &&
      remainingBookingPayments === 0 &&
      remainingExchangePayments === 0 &&
      remainingItems === 0 &&
      remainingExchangeItems === 0 &&
      remainingPassengers === 0
    ) {
      console.log('✅ ✅ ✅ SUCCESS! All data cleaned successfully!')
      console.log('\n📝 Summary:')
      console.log('   - All Booking Orders deleted')
      console.log('   - All Exchange Orders deleted')
      console.log('   - All Payments deleted')
      console.log('   - All Items deleted')
      console.log('   - All Passengers deleted')
      console.log('   - Customers retained ✅')
      console.log('   - Suppliers retained ✅')
      console.log('\n🆔 New ID sequences:')
      console.log('   - Booking Orders: T100001, T100002, T100003...')
      console.log('   - Exchange Orders: 1100001, 1100002, 1100003...')
      console.log('   - Payment Receipts: R100001, R100002, R100003...')
    } else {
      console.log('⚠️  WARNING: Some data remains, please check!')
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
