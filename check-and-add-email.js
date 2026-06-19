// 检查并添加email列到customer_data表
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking if email column exists...')
    
    // 检查列是否存在
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customer_data' 
      AND column_name = 'email'
    `
    
    if (result.length > 0) {
      console.log('✅ Email column already exists in customer_data table')
    } else {
      console.log('❌ Email column does not exist. Adding it now...')
      
      // 添加email列
      await prisma.$executeRaw`
        ALTER TABLE customer_data 
        ADD COLUMN email VARCHAR(255)
      `
      
      console.log('✅ Email column added successfully!')
    }
    
    // 验证
    const verify = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'customer_data'
      ORDER BY ordinal_position
    `
    
    console.log('\nCustomer_data table columns:')
    console.table(verify)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
