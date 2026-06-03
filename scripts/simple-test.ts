import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  console.log('Testing database connection...')
  
  const customers = await prisma.customer.findMany({
    take: 5
  })
  
  console.log('Found', customers.length, 'customers')
  console.log('Connection successful!')
  
  await prisma.$disconnect()
}

test()
