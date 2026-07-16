/**
 * 自动更新数据库中的 Exchange Order ID，添加 'E' 前缀
 * 执行命令: node update-exchange-ids.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateExchangeIds() {
  console.log('🚀 开始更新 Exchange Order IDs...\n')

  try {
    // 1. 更新 exchange_data 表
    console.log('📝 更新 exchange_data 表...')
    const exchangeDataResult = await prisma.$executeRaw`
      UPDATE "exchange_data"
      SET exchangeno = 'E' || exchangeno
      WHERE exchangeno NOT LIKE 'E%'
    `
    console.log(`✅ 更新了 ${exchangeDataResult} 条 exchange_data 记录\n`)

    // 2. 更新 exchange_item_data 表
    console.log('📝 更新 exchange_item_data 表...')
    const exchangeItemResult = await prisma.$executeRaw`
      UPDATE "exchange_item_data"
      SET exchangeno = 'E' || exchangeno
      WHERE exchangeno NOT LIKE 'E%'
    `
    console.log(`✅ 更新了 ${exchangeItemResult} 条 exchange_item_data 记录\n`)

    // 3. 更新 exchange_payment_data 表
    console.log('📝 更新 exchange_payment_data 表...')
    const exchangePaymentResult = await prisma.$executeRaw`
      UPDATE "exchange_payment_data"
      SET exchangeno = 'E' || exchangeno
      WHERE exchangeno NOT LIKE 'E%'
    `
    console.log(`✅ 更新了 ${exchangePaymentResult} 条 exchange_payment_data 记录\n`)

    // 4. 验证更新结果
    console.log('🔍 验证更新结果...\n')
    
    const exchangeDataCount = await prisma.exchangeData.count({
      where: {
        exchangeno: {
          startsWith: 'E'
        }
      }
    })
    console.log(`📊 ExchangeData: ${exchangeDataCount} 条记录以 'E' 开头`)

    const exchangeItemCount = await prisma.exchangeItemData.count({
      where: {
        exchangeno: {
          startsWith: 'E'
        }
      }
    })
    console.log(`📊 ExchangeItemData: ${exchangeItemCount} 条记录以 'E' 开头`)

    const exchangePaymentCount = await prisma.exchangePaymentData.count({
      where: {
        exchangeno: {
          startsWith: 'E'
        }
      }
    })
    console.log(`📊 ExchangePaymentData: ${exchangePaymentCount} 条记录以 'E' 开头\n`)

    // 5. 显示几个示例
    console.log('📋 示例数据：')
    const samples = await prisma.exchangeData.findMany({
      take: 5,
      select: {
        id: true,
        exchangeno: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    samples.forEach(sample => {
      console.log(`   ID: ${sample.id} -> Exchange #: ${sample.exchangeno}`)
    })

    console.log('\n✨ 更新完成！所有 Exchange Order ID 现在都以 "E" 开头了！')

  } catch (error) {
    console.error('❌ 更新失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行更新
updateExchangeIds()
  .then(() => {
    console.log('\n🎉 脚本执行成功！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error)
    process.exit(1)
  })
