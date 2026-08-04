const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fillMissingOrders() {
  try {
    console.log('=== 填充缺失的订单号 ===\n')
    
    // 1. 获取所有现有订单号
    const existingOrders = await prisma.bookingData.findMany({
      select: {
        bookno: true
      }
    })
    
    const existingNumbers = existingOrders.map(o => {
      const match = o.bookno.match(/T(\d+)/)
      return match ? parseInt(match[1]) : null
    }).filter(n => n !== null)
    
    const minNum = Math.min(...existingNumbers)
    const maxNum = Math.max(...existingNumbers)
    
    console.log(`现有订单号范围: T${minNum} - T${maxNum}`)
    console.log(`共有 ${existingNumbers.length} 个订单\n`)
    
    // 2. 找出缺失的订单号
    const missingNumbers = []
    for (let i = minNum; i <= maxNum; i++) {
      if (!existingNumbers.includes(i)) {
        missingNumbers.push(i)
      }
    }
    
    if (missingNumbers.length === 0) {
      console.log('✅ 没有缺失的订单号！')
      return
    }
    
    console.log(`发现 ${missingNumbers.length} 个缺失的订单号:`)
    missingNumbers.forEach(n => console.log(`  T${n}`))
    console.log()
    
    // 3. 确保有占位客户
    const placeholderCustomer = '[PLACEHOLDER]'
    const existingCustomer = await prisma.customer.findUnique({
      where: { customer: placeholderCustomer }
    })
    
    if (!existingCustomer) {
      console.log('创建占位客户...')
      await prisma.customer.create({
        data: {
          customer: placeholderCustomer,
          tel: '00000000'
        }
      })
      console.log('✅ 占位客户已创建\n')
    } else {
      console.log('✅ 占位客户已存在\n')
    }
    
    // 4. 为每个缺失的订单号创建占位订单
    console.log('开始创建占位订单...\n')
    let created = 0
    
    for (const num of missingNumbers) {
      const bookno = `T${num}`
      
      try {
        // 检查是否已经存在（避免重复）
        const existing = await prisma.bookingData.findUnique({
          where: { bookno }
        })
        
        if (existing) {
          console.log(`⏭️  ${bookno}: 已存在，跳过`)
          continue
        }
        
        // 创建占位订单
        await prisma.bookingData.create({
          data: {
            bookno: bookno,
            display_no: bookno,
            bookdate: new Date('2000-01-01'), // 使用特殊日期标记占位订单
            customer: placeholderCustomer,
            status: 'Placeholder', // 特殊状态标记
            special: 'This is a placeholder order to maintain sequential numbering. Created automatically.'
          }
        })
        
        console.log(`✅ ${bookno}: 占位订单已创建`)
        created++
      } catch (error) {
        console.error(`❌ ${bookno}: 创建失败 -`, error.message)
      }
    }
    
    console.log(`\n=== 完成 ===`)
    console.log(`成功创建: ${created} 个占位订单`)
    console.log(`总订单数: ${existingNumbers.length + created}`)
    
    // 5. 验证完整性
    console.log('\n=== 验证完整性 ===')
    const allOrders = await prisma.bookingData.findMany({
      orderBy: { bookno: 'asc' },
      select: { bookno: true }
    })
    
    const allNumbers = allOrders.map(o => {
      const match = o.bookno.match(/T(\d+)/)
      return match ? parseInt(match[1]) : null
    }).filter(n => n !== null)
    
    let hasGap = false
    for (let i = 0; i < allNumbers.length - 1; i++) {
      if (allNumbers[i + 1] - allNumbers[i] !== 1) {
        console.log(`❌ 仍有跳号: T${allNumbers[i]} -> T${allNumbers[i + 1]}`)
        hasGap = true
      }
    }
    
    if (!hasGap) {
      console.log(`✅ 订单号完全连续！(T${allNumbers[0]} - T${allNumbers[allNumbers.length - 1]})`)
    }
    
  } catch (error) {
    console.error('填充失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fillMissingOrders()
