const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function verifyDisplayNumbers() {
  try {
    console.log('=== 验证 display_no 连续性 ===\n')
    
    // 获取所有订单，按 display_no 排序
    const allOrders = await prisma.bookingData.findMany({
      orderBy: {
        display_no: 'asc'
      },
      select: {
        id: true,
        bookno: true,
        display_no: true,
        customer: true
      }
    })
    
    console.log(`共有 ${allOrders.length} 个订单\n`)
    
    // 检查连续性
    const displayNumbers = allOrders
      .filter(o => o.display_no)
      .map(o => {
        const match = o.display_no.match(/T(\d+)/)
        return match ? parseInt(match[1]) : null
      })
      .filter(n => n !== null)
    
    console.log('Display Numbers (前10个):')
    displayNumbers.slice(0, 10).forEach(n => console.log(`  T${n}`))
    console.log('  ...')
    displayNumbers.slice(-10).forEach(n => console.log(`  T${n}`))
    
    // 检查是否有跳号
    console.log('\n=== 检查连续性 ===')
    let hasGap = false
    for (let i = 0; i < displayNumbers.length - 1; i++) {
      const current = displayNumbers[i]
      const next = displayNumbers[i + 1]
      if (next - current !== 1) {
        console.log(`❌ 发现跳号: T${current} -> T${next}`)
        hasGap = true
      }
    }
    
    if (!hasGap) {
      console.log('✅ 所有 display_no 都是连续的！')
    }
    
    // 显示统计
    console.log('\n=== 统计信息 ===')
    console.log(`最小 display_no: T${Math.min(...displayNumbers)}`)
    console.log(`最大 display_no: T${Math.max(...displayNumbers)}`)
    console.log(`总共订单数: ${displayNumbers.length}`)
    console.log(`下一个 display_no: T${Math.max(...displayNumbers) + 1}`)
    
    // 显示 bookno 和 display_no 的对应关系（前10个）
    console.log('\n=== bookno 和 display_no 对应关系 (前10个) ===')
    allOrders.slice(0, 10).forEach(o => {
      console.log(`${o.bookno} -> ${o.display_no} (ID: ${o.id})`)
    })
    
    // 检查是否有 null 的 display_no
    const nullCount = allOrders.filter(o => !o.display_no).length
    if (nullCount > 0) {
      console.log(`\n⚠️ 发现 ${nullCount} 个订单没有 display_no`)
    }
    
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDisplayNumbers()
