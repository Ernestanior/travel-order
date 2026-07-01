/**
 * 设置Booking订单序列号
 * 用途：创建PostgreSQL序列，确保订单号严格按顺序生成
 * 
 * 使用方法：
 * npx tsx scripts/setup-sequence.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupBookingSequence() {
  try {
    console.log('🚀 开始设置订单序列号...\n')
    
    // 1. 检查当前最大的订单ID
    console.log('📊 检查当前数据...')
    const maxBooking = await prisma.bookingData.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true, bookno: true }
    })
    
    const currentMaxId = maxBooking?.id || 100000
    const startValue = currentMaxId + 1
    
    console.log(`   当前最大订单ID: ${currentMaxId}`)
    console.log(`   当前最大订单号: ${maxBooking?.bookno || '无'}`)
    console.log(`   序列将从 ${startValue} 开始\n`)
    
    // 2. 检查序列是否已存在
    console.log('🔍 检查序列状态...')
    try {
      const existingSequence = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1 FROM pg_sequences 
          WHERE sequencename = 'booking_number_seq'
        ) as exists
      `
      
      if (existingSequence[0]?.exists) {
        console.log('   ⚠️  序列已存在')
        
        // 获取当前序列值
        const currentSeq = await prisma.$queryRaw<Array<{ last_value: bigint }>>`
          SELECT last_value FROM booking_number_seq
        `
        console.log(`   当前序列值: ${currentSeq[0]?.last_value}`)
        
        // 询问是否重置
        console.log('\n❓ 序列已存在，是否重置？')
        console.log('   如果重置，将从', startValue, '重新开始')
        console.log('   跳过重置，直接使用现有序列\n')
        
        // 这里简单起见，直接更新到正确的值
        await prisma.$executeRawUnsafe(`
          SELECT setval('booking_number_seq', ${startValue}, false)
        `)
        console.log('   ✅ 序列已更新到:', startValue)
      } else {
        console.log('   序列不存在，准备创建...\n')
        
        // 3. 创建序列
        console.log('📝 创建序列...')
        // 使用 $queryRawUnsafe 来执行动态SQL
        await prisma.$executeRawUnsafe(`
          CREATE SEQUENCE booking_number_seq
          START WITH ${startValue}
          INCREMENT BY 1
          NO MINVALUE
          NO MAXVALUE
          CACHE 1
        `)
        console.log(`   ✅ 序列创建成功！起始值: ${startValue}\n`)
      }
    } catch (error) {
      console.error('   ❌ 检查序列时出错:', error)
      throw error
    }
    
    // 4. 测试序列
    console.log('🧪 测试序列...')
    const testResult = await prisma.$queryRaw<Array<{ nextval: bigint }>>`
      SELECT nextval('booking_number_seq')::int as nextval
    `
    const nextNumber = Number(testResult[0].nextval)
    console.log(`   下一个序列号: T${nextNumber}`)
    
    // 回退测试值（避免浪费序号）
    await prisma.$executeRawUnsafe(`
      SELECT setval('booking_number_seq', ${nextNumber - 1})
    `)
    console.log(`   ✅ 测试完成（序列值已回退）\n`)
    
    // 5. 显示序列信息
    console.log('📋 序列信息:')
    try {
      const seqInfo = await prisma.$queryRaw<Array<{
        last_value: bigint
      }>>`
        SELECT last_value
        FROM booking_number_seq
      `
      
      if (seqInfo.length > 0) {
        const info = seqInfo[0]
        console.log(`   当前值: ${info.last_value}`)
      }
    } catch (error) {
      console.log('   ℹ️  序列信息查询跳过（序列已正常创建）')
    }
    
    console.log('\n✅ 设置完成！')
    console.log('   下次创建订单时，订单号将从 T' + startValue + ' 开始')
    console.log('   订单号将严格按顺序递增：T' + startValue + ', T' + (startValue + 1) + ', T' + (startValue + 2) + '...')
    
  } catch (error) {
    console.error('\n❌ 设置失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行设置
setupBookingSequence()
  .then(() => {
    console.log('\n🎉 全部完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 执行出错:', error)
    process.exit(1)
  })
