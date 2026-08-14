import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Step 1: 查看要删除的测试数据...\n')
  
  // 查看要删除的数据
  const testPayments = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, receiptdate, customer, amountpaid 
    FROM booking_payment_data 
    WHERE id BETWEEN 37 AND 41 
    ORDER BY id
  `
  
  console.log('要删除的记录：')
  console.table(testPayments)
  console.log(`共 ${(testPayments as any[]).length} 条记录\n`)
  
  console.log('🗑️  Step 2: 删除测试数据...\n')
  
  // 删除数据
  const deleteResult = await prisma.$executeRaw`
    DELETE FROM booking_payment_data 
    WHERE id BETWEEN 37 AND 41
  `
  
  console.log(`✅ 成功删除 ${deleteResult} 条记录\n`)
  
  console.log('🔄 Step 3: 重置序列...\n')
  
  // 重置序列
  await prisma.$executeRaw`
    ALTER SEQUENCE booking_payment_data_id_seq RESTART WITH 37
  `
  
  console.log('✅ 序列已重置，下一个 ID 将从 37 开始\n')
  
  console.log('🔍 Step 4: 验证结果...\n')
  
  // 验证最大 ID
  const maxIdResult = await prisma.$queryRaw`
    SELECT MAX(id) as max_id FROM booking_payment_data
  ` as any[]
  
  console.log(`当前最大 ID: ${maxIdResult[0].max_id}`)
  
  // 验证序列值
  const seqResult = await prisma.$queryRaw`
    SELECT last_value, is_called FROM booking_payment_data_id_seq
  ` as any[]
  
  console.log(`序列当前值: ${seqResult[0].last_value}, is_called: ${seqResult[0].is_called}`)
  
  // 检查是否还有 ID > 36 的记录
  const remainingCount = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM booking_payment_data WHERE id > 36
  ` as any[]
  
  console.log(`ID > 36 的记录数: ${remainingCount[0].count}`)
  
  // 显示最近的几条记录
  console.log('\n最近的 5 条记录：')
  const recentRecords = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, customer, receiptdate 
    FROM booking_payment_data 
    ORDER BY id DESC 
    LIMIT 5
  `
  console.table(recentRecords)
  
  console.log('\n✅ 操作完成！下一个 Payment Receipt 的 ID 将是 37')
  console.log('✅ 下一个 Receipt Number 将是 R100037')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
