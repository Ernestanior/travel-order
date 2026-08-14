import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查 Payment Receipt 数据...\n')
  
  // 查看总记录数
  const totalCount = await prisma.bookingPaymentData.count()
  console.log(`总记录数: ${totalCount}\n`)
  
  // 查看 ID 范围
  const idRange = await prisma.$queryRaw`
    SELECT MIN(id) as min_id, MAX(id) as max_id FROM booking_payment_data
  ` as any[]
  console.log(`ID 范围: ${idRange[0].min_id} ~ ${idRange[0].max_id}\n`)
  
  // 查看 Receipt Number 范围
  const receiptRange = await prisma.$queryRaw`
    SELECT MIN(receiptno) as min_receipt, MAX(receiptno) as max_receipt 
    FROM booking_payment_data 
    WHERE receiptno IS NOT NULL
  ` as any[]
  console.log(`Receipt Number 范围: ${receiptRange[0].min_receipt} ~ ${receiptRange[0].max_receipt}\n`)
  
  // 查看 ID 30-50 的记录
  console.log('ID 30-50 的记录：')
  const records30to50 = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, customer, amountpaid, receiptdate 
    FROM booking_payment_data 
    WHERE id BETWEEN 30 AND 50
    ORDER BY id
  `
  console.table(records30to50)
  
  // 查看最新的 10 条记录
  console.log('\n最新的 10 条记录：')
  const latest = await prisma.$queryRaw`
    SELECT id, receiptno, bookno, customer, amountpaid, receiptdate 
    FROM booking_payment_data 
    ORDER BY id DESC 
    LIMIT 10
  `
  console.table(latest)
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
