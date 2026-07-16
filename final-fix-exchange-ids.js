/**
 * 最终修复 Exchange Order ID 格式，使用 ID 生成正确格式
 * 执行命令: node final-fix-exchange-ids.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function finalFixExchangeIds() {
  console.log('🚀 开始最终修复 Exchange Order IDs...\n')

  try {
    // 获取所有 exchange orders
    const exchanges = await prisma.exchangeData.findMany({
      select: {
        id: true,
        exchangeno: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    console.log(`📊 找到 ${exchanges.length} 条 Exchange Order 记录\n`)

    // 使用事务更新所有记录
    await prisma.$transaction(async (tx) => {
      // 临时禁用外键约束
      await tx.$executeRaw`SET CONSTRAINTS ALL DEFERRED`

      for (const exchange of exchanges) {
        const correctExchangeNo = `E${exchange.id}`
        
        if (exchange.exchangeno !== correctExchangeNo) {
          console.log(`修复: ID ${exchange.id}: ${exchange.exchangeno} -> ${correctExchangeNo}`)
          
          // 更新 exchange_data
          await tx.$executeRaw`
            UPDATE "exchange_data"
            SET exchangeno = ${correctExchangeNo}
            WHERE id = ${exchange.id}
          `
          
          // 更新 exchange_item_data
          await tx.$executeRaw`
            UPDATE "exchange_item_data"
            SET exchangeno = ${correctExchangeNo}
            WHERE exchangeno = ${exchange.exchangeno}
          `
          
          // 更新 exchange_payment_data
          await tx.$executeRaw`
            UPDATE "exchange_payment_data"
            SET exchangeno = ${correctExchangeNo}
            WHERE exchangeno = ${exchange.exchangeno}
          `
        }
      }
    })

    console.log('\n🔍 验证修复结果...\n')
    
    const samples = await prisma.exchangeData.findMany({
      take: 10,
      select: {
        id: true,
        exchangeno: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    console.log('📋 修复后的数据：')
    samples.forEach(sample => {
      console.log(`   ID: ${sample.id} -> Exchange #: ${sample.exchangeno}`)
    })

    console.log('\n✨ 修复完成！所有 Exchange Order ID 现在格式正确了！')
    console.log('格式: E + ID (例如: E100001, E100002, E100003)')

  } catch (error) {
    console.error('❌ 修复失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
finalFixExchangeIds()
  .then(() => {
    console.log('\n🎉 脚本执行成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error)
    process.exit(1)
  })
