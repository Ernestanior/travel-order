const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Setting up booking templates tables...')
    
    const sql = fs.readFileSync(path.join(__dirname, 'create_templates_tables.sql'), 'utf8')
    
    // 分割SQL语句并逐个执行
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      await prisma.$executeRawUnsafe(statement)
    }
    
    console.log('✅ Booking templates tables created successfully!')
  } catch (error) {
    console.error('Error setting up tables:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
