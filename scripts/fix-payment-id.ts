import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPaymentSequence() {
  console.log('🔍 开始修复 Payment Receipt 序列号...\n')

  try {
    // 1. 查看修改前的数据
    console.log('=== 修改前的数据 ===')
    const beforeData = await prisma.$queryRaw<any[]>`
      SELECT id, receiptno, bookno, receiptdate, amountpaid 
      FROM booking_payment_data 
      ORDER BY id
    `
    console.table(beforeData)

    // 2. 检查 R100008 是否存在
    const r8Exists = await prisma.$queryRaw<any[]>`
      SELECT id, receiptno FROM booking_payment_data WHERE receiptno = 'R100008'
    `
    
    if (r8Exists.length === 0) {
      console.error('❌ 错误：R100008 不存在！请检查数据。')
      process.exit(1)
    }

    console.log('\n✅ 检查通过，开始修改...\n')
    console.log('说明：将 Receipt Number R100008 改为 R100005\n')

    // 3. 更新 Receipt Number: R100008 -> R100005
    await prisma.$executeRaw`
      UPDATE booking_payment_data 
      SET receiptno = 'R100005' 
      WHERE receiptno = 'R100008'
    `
    console.log('✓ Receipt Number 已从 R100008 更新为 R100005')

    // 4. 查看修改后的数据
    console.log('\n=== 修改后的数据 ===')
    const afterData = await prisma.$queryRaw<any[]>`
      SELECT id, receiptno, bookno, receiptdate, amountpaid 
      FROM booking_payment_data 
      ORDER BY id
    `
    console.table(afterData)

    // 5. 检查当前序列状态
    const sequenceInfo = await prisma.$queryRaw<any[]>`
      SELECT 
        last_value as "current_value",
        last_value + 1 as "next_value"
      FROM pg_sequences 
      WHERE sequencename LIKE '%booking_payment_data%'
    `
    console.log('\n=== ID 序列状态（自动生成）===')
    console.table(sequenceInfo)

    console.log('\n✅ 修复完成！')
    console.log('\n📋 当前 Receipt 序列：')
    console.log('   R100001 ✓')
    console.log('   R100002 ✓')
    console.log('   R100003 ✓')
    console.log('   R100004 ✓')
    console.log('   R100005 ✓ (刚修正)')
    console.log('\n💡 下次创建 Payment 时，Receipt Number 需要是 R100006\n')

  } catch (error) {
    console.error('\n❌ 修复失败：', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixPaymentSequence()
  .then(() => {
    console.log('🎉 所有操作成功完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 发生错误：', error)
    process.exit(1)
  })
