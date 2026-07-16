/**
 * 修复 Exchange Order ID 格式，从 E1100001 改为 E100001
 * 执行命令: node fix-exchange-ids.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixExchangeIds() {
  console.log('🚀 开始修复 Exchange Order IDs...\n')

  try {
    // 使用事务一次性更新所有表，避免外键约束问题
    await prisma.$transaction(async (tx) => {
      // 1. 先禁用外键约束检查
      console.log('📝 临时禁用外键约束...')
      await tx.$executeRaw`SET CONSTRAINTS ALL DEFERRED`
      
      // 2. 修复 exchange_data 表 (E1100001 -> E100001)
      console.log('📝 修复 exchange_data 表...')
      const exchangeDataResult = await tx.$executeRaw`
        UPDATE "exchange_data"
        SET exchangeno = 'E' || SUBSTRING(exchangeno FROM 3)
        WHERE exchangeno LIKE 'E1%'
      `
      console.log(`✅ 修复了 ${exchangeDataResult} 条 exchange_data 记录\n`)

      // 3. 修复 exchange_item_data 表
      console.log('📝 修复 exchange_item_data 表...')
      const exchangeItemResult = await tx.$executeRaw`
        UPDATE "exchange_item_data"
        SET exchangeno = 'E' || SUBSTRING(exchangeno FROM 3)
        WHERE exchangeno LIKE 'E1%'
      `
      console.log(`✅ 修复了 ${exchangeItemResult} 条 exchange_item_data 记录\n`)

      // 4. 修复 exchange_payment_data 表
      console.log('📝 修复 exchange_payment_data 表...')
      const exchangePaymentResult = await tx.$executeRaw`
        UPDATE "exchange_payment_data"
        SET exchangeno = 'E' || SUBSTRING(exchangeno FROM 3)
        WHERE exchangeno LIKE 'E1%'
      `
      console.log(`✅ 修复了 ${exchangePaymentResult} 条 exchange_payment_data 记录\n`)
    })

    // 验证修复结果
    console.log('🔍 验证修复结果...\n')
    
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

    console.log('📋 修复后的数据示例：')
    samples.forEach(sample => {
      console.log(`   ID: ${sample.id} -> Exchange #: ${sample.exchangeno}`)
    })

    console.log('\n✨ 修复完成！所有 Exchange Order ID 现在格式正确了！')
    console.log('格式示例: E100001, E100002, E100003 ...')

  } catch (error) {
    console.error('❌ 修复失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixExchangeIds()
  .then(() => {
    console.log('\n🎉 脚本执行成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error)
    process.exit(1)
  })
