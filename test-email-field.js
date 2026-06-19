// 测试email字段是否正常工作
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing email field functionality...\n')
    
    // 1. 查找一个测试客户
    const testCustomer = await prisma.bookingData.findFirst({
      include: {
        customerData: true
      }
    })
    
    if (!testCustomer) {
      console.log('No booking data found to test')
      return
    }
    
    console.log('Test Booking:', {
      bookno: testCustomer.bookno,
      customer: testCustomer.customer,
      currentEmail: testCustomer.customerData?.email || '(no email)'
    })
    
    // 2. 测试更新email
    const testEmail = `test${Date.now()}@example.com`
    console.log(`\nAttempting to update email to: ${testEmail}`)
    
    await prisma.customer.update({
      where: { customer: testCustomer.customer },
      data: { email: testEmail }
    })
    
    console.log('✅ Email updated successfully!')
    
    // 3. 验证更新
    const updated = await prisma.customer.findUnique({
      where: { customer: testCustomer.customer }
    })
    
    console.log('\nVerification:')
    console.log('  Customer:', updated.customer)
    console.log('  Email:', updated.email)
    console.log('  Tel:', updated.tel)
    console.log('  Address:', updated.address)
    
    if (updated.email === testEmail) {
      console.log('\n✅ Email field is working correctly!')
    } else {
      console.log('\n❌ Email field update failed')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
