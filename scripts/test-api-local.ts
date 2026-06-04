import { prisma } from '../lib/db'

async function testAPI() {
  try {
    console.log('Testing database queries...\n')
    
    // Test 1: Count customers
    const customerCount = await prisma.customer.count()
    console.log(`✓ Customers: ${customerCount}`)
    
    // Test 2: Get sample customer
    const sampleCustomer = await prisma.customer.findFirst()
    if (sampleCustomer) {
      console.log(`✓ Sample customer: ${sampleCustomer.customer}`)
    }
    
    // Test 3: Count bookings
    const bookingCount = await prisma.bookingData.count()
    console.log(`✓ Booking Orders: ${bookingCount}`)
    
    // Test 4: Try to get bookings
    const bookings = await prisma.bookingData.findMany({
      take: 5,
      include: {
        passengers: true,
        items: true,
        payments: true,
      }
    })
    console.log(`✓ Found ${bookings.length} bookings in query`)
    
    if (bookings.length > 0) {
      console.log(`\nSample booking:`)
      console.log(`  Number: ${bookings[0].bookno}`)
      console.log(`  Customer: ${bookings[0].customer}`)
      console.log(`  Items: ${bookings[0].items.length}`)
      console.log(`  Passengers: ${bookings[0].passengers.length}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
