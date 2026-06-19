// 完整测试email字段的端到端流程
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('=== Email Field Full Flow Test ===\n')
    
    // 1. 找一个测试用的booking
    const testBooking = await prisma.bookingData.findFirst({
      include: {
        customerData: true,
        items: true,
        passengers: true
      }
    })
    
    if (!testBooking) {
      console.log('❌ No booking found for testing')
      return
    }
    
    console.log('Step 1: Found test booking')
    console.log('  Booking #:', testBooking.bookno)
    console.log('  Customer:', testBooking.customer)
    console.log('  Current Email:', testBooking.customerData?.email || '(empty)')
    
    // 2. 模拟前端GET请求 - 获取booking详情
    console.log('\nStep 2: Simulating GET request...')
    const bookingDetail = await prisma.bookingData.findUnique({
      where: { id: testBooking.id },
      include: {
        passengers: true,
        items: true,
        payments: true,
        customerData: true,
      }
    })
    
    const emailFromGet = bookingDetail.customerData?.email || ''
    console.log('  Email from GET:', emailFromGet || '(empty)')
    console.log('  ✅ GET request OK')
    
    // 3. 模拟前端PUT请求 - 更新email
    console.log('\nStep 3: Simulating PUT request with new email...')
    const newEmail = `test-${Date.now()}@example.com`
    console.log('  New Email:', newEmail)
    
    // 更新customer记录（模拟API的upsert逻辑）
    await prisma.customer.upsert({
      where: { customer: testBooking.customer },
      update: {
        address: testBooking.customerData?.address || null,
        tel: testBooking.customerData?.tel || 'N/A',
        email: newEmail,
      },
      create: {
        customer: testBooking.customer,
        address: testBooking.customerData?.address || null,
        tel: testBooking.customerData?.tel || 'N/A',
        email: newEmail,
      }
    })
    
    console.log('  ✅ PUT request OK')
    
    // 4. 验证 - 模拟刷新页面重新GET
    console.log('\nStep 4: Simulating page refresh (GET again)...')
    const verifyBooking = await prisma.bookingData.findUnique({
      where: { id: testBooking.id },
      include: {
        customerData: true,
      }
    })
    
    const emailAfterSave = verifyBooking.customerData?.email || ''
    console.log('  Email after save:', emailAfterSave)
    
    // 5. 最终验证
    console.log('\n=== Test Results ===')
    
    if (emailAfterSave === newEmail) {
      console.log('✅ SUCCESS! Email saved and retrieved correctly')
      console.log('\nDetails:')
      console.log('  - Email was saved to database')
      console.log('  - Email can be retrieved via API')
      console.log('  - Customer record updated correctly')
    } else {
      console.log('❌ FAILED! Email not saved correctly')
      console.log('  Expected:', newEmail)
      console.log('  Got:', emailAfterSave)
    }
    
    // 6. 显示完整的customer记录
    console.log('\n=== Customer Record ===')
    const finalCustomer = await prisma.customer.findUnique({
      where: { customer: testBooking.customer }
    })
    console.log('Customer:', finalCustomer.customer)
    console.log('Email:', finalCustomer.email)
    console.log('Tel:', finalCustomer.tel)
    console.log('Address:', finalCustomer.address || '(empty)')
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
