const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkBookingsDetail() {
  try {
    console.log('=== 详细检查 Booking Orders ===\n')
    
    // 查询所有 booking_data 记录
    const allBookings = await prisma.bookingData.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        bookno: true,
        bookdate: true,
        customer: true
      }
    })
    
    console.log('所有 Booking Orders (ID 和 BookNo 对应关系):')
    console.log('ID\t\tBookNo\t\tCustomer')
    console.log('----------------------------------------')
    allBookings.forEach(b => {
      console.log(`${b.id}\t\t${b.bookno}\t\t${b.customer.substring(0, 30)}`)
    })
    
    // 找出缺失的 ID 和 BookNo
    const ids = allBookings.map(b => b.id)
    const bookNos = allBookings.map(b => {
      const match = b.bookno.match(/T(\d+)/)
      return match ? parseInt(match[1]) : null
    }).filter(n => n !== null)
    
    const minId = Math.min(...ids)
    const maxId = Math.max(...ids)
    const minBookNo = Math.min(...bookNos)
    const maxBookNo = Math.max(...bookNos)
    
    console.log('\n=== 缺失分析 ===')
    console.log(`\nID 范围: ${minId} - ${maxId}`)
    console.log(`BookNo 范围: T${minBookNo} - T${maxBookNo}`)
    
    // 缺失的 ID
    const missingIds = []
    for (let i = minId; i <= maxId; i++) {
      if (!ids.includes(i)) {
        missingIds.push(i)
      }
    }
    
    // 缺失的 BookNo
    const missingBookNos = []
    for (let i = minBookNo; i <= maxBookNo; i++) {
      if (!bookNos.includes(i)) {
        missingBookNos.push(i)
      }
    }
    
    console.log(`\n缺失的 ID (${missingIds.length} 个):`)
    console.log(missingIds.join(', '))
    
    console.log(`\n缺失的 BookNo (${missingBookNos.length} 个):`)
    console.log(missingBookNos.map(n => `T${n}`).join(', '))
    
    // 特别关注 T100030-T100040 区间
    console.log('\n=== T100030-T100040 区间详情 ===')
    const range = allBookings.filter(b => {
      const match = b.bookno.match(/T(\d+)/)
      if (!match) return false
      const num = parseInt(match[1])
      return num >= 100028 && num <= 100042
    })
    
    range.forEach(b => {
      const num = b.bookno.match(/T(\d+)/)[1]
      console.log(`${b.bookno} (ID: ${b.id}): ${b.customer}`)
    })
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookingsDetail()
