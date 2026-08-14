import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Step 1: 查看要删除的测试数据 (Receipt R100036 - R100043)...\n')
  
  // 查看要删除的数据
  const testPayments = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, receiptdate, customer, amountpaid 
    FROM booking_payment_data 
    WHERE receiptno BETWEEN 'R100036' AND 'R100043'
    ORDER BY id
  `
  
  console.log('要删除的记录：')
  console.table(testPayments)
  console.log(`共 ${(testPayments as any[]).length} 条记录\n`)
  
  // 获取这些记录的 ID 范围
  const idRange = await prisma.$queryRaw`
    SELECT MIN(id) as min_id, MAX(id) as max_id 
    FROM booking_payment_data 
    WHERE receiptno BETWEEN 'R100036' AND 'R100043'
  ` as any[]
  
  console.log(`ID 范围: ${idRange[0].min_id} ~ ${idRange[0].max_id}\n`)
  
  console.log('🗑️  Step 2: 删除测试数据...\n')
  
  // 删除数据 - 使用 receipt number 来删除
  const deleteResult = await prisma.$executeRaw`
    DELETE FROM booking_payment_data 
    WHERE receiptno BETWEEN 'R100036' AND 'R100043'
  `
  
  console.log(`✅ 成功删除 ${deleteResult} 条记录\n`)
  
  console.log('🔄 Step 3: 重置序列到 100036，使下一个 ID 从 100036 开始...\n')
  
  // 重置序列
  await prisma.$executeRaw`
    ALTER SEQUENCE booking_payment_data_id_seq RESTART WITH 100036
  `
  
  console.log('✅ 序列已重置，下一个 ID 将从 100036 开始\n')
  
  console.log('🔍 Step 4: 验证结果...\n')
  
  // 验证最大 ID
  const maxIdResult = await prisma.$queryRaw`
    SELECT MAX(id) as max_id FROM booking_payment_data
  ` as any[]
  
  console.log(`当前最大 ID: ${maxIdResult[0].max_id}`)
  
  // 验证最大 Receipt Number
  const maxReceiptResult = await prisma.$queryRaw`
    SELECT MAX(receiptno) as max_receipt 
    FROM booking_payment_data 
    WHERE receiptno IS NOT NULL
  ` as any[]
  
  console.log(`当前最大 Receipt Number: ${maxReceiptResult[0].max_receipt}`)
  
  // 验证序列值
  const seqResult = await prisma.$queryRaw`
    SELECT last_value, is_called FROM booking_payment_data_id_seq
  ` as any[]
  
  console.log(`序列当前值: ${seqResult[0].last_value}, is_called: ${seqResult[0].is_called}`)
  
  // 检查是否还有被删除的 receipt number
  const deletedCheck = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM booking_payment_data 
    WHERE receiptno BETWEEN 'R100036' AND 'R100043'
  ` as any[]
  
  console.log(`剩余 R100036-R100043 的记录数: ${deletedCheck[0].count}`)
  
  // 显示最近的 10 条记录
  console.log('\n最新的 10 条记录：')
  const recentRecords = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, customer, receiptdate, amountpaid 
    FROM booking_payment_data 
    ORDER BY id DESC 
    LIMIT 10
  `
  console.table(recentRecords)
  
  console.log('\n✅ 操作完成！')
  console.log('✅ 已删除 Receipt Number R100036 ~ R100043')
  console.log('✅ 下一个 Payment Receipt 的 ID 将是 100036')
  console.log('✅ 下一个 Receipt Number 将是 R100036')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
