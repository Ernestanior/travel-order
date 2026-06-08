import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExchangeNumbers() {
  try {
    // 获取最近的10个 Exchange Order 号
    const recentExchanges = await prisma.exchangeData.findMany({
      select: { exchangeno: true, id: true },
      orderBy: { id: 'desc' },
      take: 10
    })
    
    console.log('最近的 Exchange Order 号:')
    recentExchanges.forEach(e => {
      console.log(`  ID: ${e.id}, Exchangeno: ${e.exchangeno}`)
    })
    
    // 获取最大的纯数字 Exchange Order 号
    const numericExchangenos = recentExchanges
      .map(e => parseInt(e.exchangeno))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)
    
    console.log('\n纯数字 Exchange Order 号 (降序):')
    console.log(numericExchangenos.slice(0, 5))
    
    if (numericExchangenos.length > 0) {
      const nextExchangeno = numericExchangenos[0] + 1
      console.log(`\n建议下一个 Exchange Order 号: ${nextExchangeno}`)
    }
    
    // 检查是否有重复
    const allExchanges = await prisma.exchangeData.findMany({
      select: { exchangeno: true }
    })
    
    const exchangenoMap = new Map()
    allExchanges.forEach(e => {
      exchangenoMap.set(e.exchangeno, (exchangenoMap.get(e.exchangeno) || 0) + 1)
    })
    
    const duplicates = Array.from(exchangenoMap.entries())
      .filter(([_, count]) => count > 1)
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  发现重复的 Exchange Order 号:')
      duplicates.forEach(([no, count]) => {
        console.log(`  ${no}: ${count} 次`)
      })
    } else {
      console.log('\n✅ 没有重复的 Exchange Order 号')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExchangeNumbers()
