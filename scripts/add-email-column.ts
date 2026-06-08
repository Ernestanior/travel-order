import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addEmailColumn() {
  try {
    console.log('🔍 Checking if email column exists...')
    
    // Check if email column already exists
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customer_data' 
      AND column_name = 'email'
    `
    
    if (result.length > 0) {
      console.log('✅ Email column already exists!')
      return
    }
    
    console.log('➕ Adding email column to customer_data table...')
    
    // Add email column
    await prisma.$executeRaw`
      ALTER TABLE customer_data 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `
    
    console.log('✅ Email column added successfully!')
    
    // Verify
    const verify = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'customer_data'
      ORDER BY ordinal_position
    `
    
    console.log('\n📋 Current columns in customer_data:')
    verify.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addEmailColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
