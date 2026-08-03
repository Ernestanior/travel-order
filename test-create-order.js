const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testCreateOrder() {
  try {
    console.log('=== 测试创建订单（模拟新机制） ===\n')
    
    // 模拟创建订单的逻辑
    console.log('步骤 1: 生成 bookno（内部ID，可能跳号）')
    const sequenceResult = await prisma.$queryRaw`
      SELECT nextval('booking_number_seq')::int as nextval
    `
    const booknoNumber = Number(sequenceResult[0].nextval)
    const bookno = `T${booknoNumber}`
    console.log(`  生成的 bookno: ${bookno}`)
    
    console.log('\n步骤 2: 生成 display_no（给客户看的，严格连续）')
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
    
    let displayNumber = 100001
    if (maxDisplayOrder && maxDisplayOrder.display_no) {
      const match = maxDisplayOrder.display_no.match(/T(\d+)/)
      if (match) {
        displayNumber = parseInt(match[1]) + 1
      }
    }
    
    const display_no = `T${displayNumber}`
    console.log(`  当前最大 display_no: ${maxDisplayOrder?.display_no || '无'}`)
    console.log(`  生成的 display_no: ${display_no}`)
    
    console.log('\n步骤 3: 确保客户存在')
    const testCustomer = '测试客户'
    const existingCustomer = await prisma.customer.findUnique({
      where: { customer: testCustomer }
    })
    
    if (!existingCustomer) {
      await prisma.customer.create({
        data: {
          customer: testCustomer,
          tel: '12345678'
        }
      })
      console.log('  ✅ 测试客户已创建')
    } else {
      console.log('  ✅ 测试客户已存在')
    }
    
    console.log('\n步骤 4: 创建订单（在事务中）')
    const newOrder = await prisma.bookingData.create({
      data: {
        bookno: bookno,
        display_no: display_no,
        bookdate: new Date(),
        customer: '测试客户',
        status: 'Open'
      }
    })
    
    console.log(`  ✅ 订单创建成功！`)
    console.log(`  - ID: ${newOrder.id}`)
    console.log(`  - bookno: ${newOrder.bookno}`)
    console.log(`  - display_no: ${newOrder.display_no}`)
    
    // 验证连续性
    console.log('\n步骤 5: 验证 display_no 连续性')
    const allDisplayNos = await prisma.bookingData.findMany({
      where: {
        display_no: {
          not: null
        }
      },
      orderBy: {
        display_no: 'asc'
      },
      select: {
        display_no: true
      }
    })
    
    const numbers = allDisplayNos.map(o => {
      const match = o.display_no.match(/T(\d+)/)
      return match ? parseInt(match[1]) : null
    }).filter(n => n !== null)
    
    let hasGap = false
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] !== 1) {
        console.log(`  ❌ 发现跳号: T${numbers[i]} -> T${numbers[i + 1]}`)
        hasGap = true
      }
    }
    
    if (!hasGap) {
      console.log(`  ✅ display_no 仍然连续！(T${numbers[0]} - T${numbers[numbers.length - 1]})`)
    }
    
    // 删除测试订单
    console.log('\n步骤 6: 清理测试数据')
    await prisma.bookingData.delete({
      where: { id: newOrder.id }
    })
    console.log('  ✅ 测试订单已删除')
    
  } catch (error) {
    console.error('测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateOrder()
