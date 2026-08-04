const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testAutoFill() {
  try {
    console.log('=== 测试自动填充功能 ===\n')
    
    // 步骤 1: 查看当前最大订单号
    const maxOrder = await prisma.bookingData.findFirst({
      orderBy: { bookno: 'desc' },
      select: { bookno: true }
    })
    
    console.log(`当前最大订单号: ${maxOrder.bookno}`)
    
    // 步骤 2: 模拟序列跳号（手动推进序列）
    console.log('\n步骤 2: 模拟序列跳号...')
    
    // 消耗几个序列号（不创建订单）
    for (let i = 0; i < 3; i++) {
      const result = await prisma.$queryRaw`
        SELECT nextval('booking_number_seq')::int as nextval
      `
      console.log(`  消耗序列号: T${Number(result[0].nextval)}`)
    }
    
    // 步骤 3: 创建真实订单（应该自动填充中间的空缺）
    console.log('\n步骤 3: 创建真实订单（应该触发自动填充）...')
    
    // 获取下一个序列号
    const nextSeqResult = await prisma.$queryRaw`
      SELECT nextval('booking_number_seq')::int as nextval
    `
    const nextNumber = Number(nextSeqResult[0].nextval)
    const nextBookno = `T${nextNumber}`
    
    console.log(`  将要创建的订单号: ${nextBookno}`)
    
    // 注意：实际创建订单的逻辑在 API 中，这里只是演示
    console.log('\n📝 提示: 实际创建订单请通过前端或 API')
    console.log('    POST /api/booking-orders/create')
    console.log('    系统会自动填充跳号\n')
    
    // 步骤 4: 检查是否有新的跳号
    const allOrders = await prisma.bookingData.findMany({
      orderBy: { bookno: 'asc' },
      select: { bookno: true }
    })
    
    const numbers = allOrders.map(o => {
      const match = o.bookno.match(/T(\d+)/)
      return match ? parseInt(match[1]) : null
    }).filter(n => n !== null)
    
    console.log('步骤 4: 检查跳号...')
    let gaps = []
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] > 1) {
        for (let missing = numbers[i] + 1; missing < numbers[i + 1]; missing++) {
          gaps.push(missing)
        }
      }
    }
    
    if (gaps.length > 0) {
      console.log(`\n⚠️ 发现 ${gaps.length} 个跳号:`)
      gaps.forEach(n => console.log(`  T${n}`))
      console.log('\n💡 解决方案:')
      console.log('  1. 通过前端创建新订单，系统会自动填充')
      console.log('  2. 或运行: node fill-missing-orders.js')
    } else {
      console.log('\n✅ 没有跳号！')
    }
    
    // 步骤 5: 预测下一个订单号
    const nextExpected = Math.max(...numbers) + 1
    console.log(`\n📊 统计:`)
    console.log(`  当前订单总数: ${numbers.length}`)
    console.log(`  订单号范围: T${Math.min(...numbers)} - T${Math.max(...numbers)}`)
    console.log(`  下一个订单号: T${nextExpected}`)
    console.log(`  序列当前值: T${nextNumber}`)
    
    if (nextNumber > nextExpected) {
      console.log(`\n⚠️ 注意: 序列已经推进到 T${nextNumber}`)
      console.log(`  下次创建订单时，会从 T${nextNumber + 1} 开始`)
      console.log(`  并自动填充 T${nextExpected} - T${nextNumber} 的空缺`)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutoFill()
