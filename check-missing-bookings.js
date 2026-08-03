const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkMissingBookings() {
  try {
    console.log('=== 检查 Booking Orders 数据 ===\n')
    
    // 1. 查询所有 booking_data 记录，按 ID 排序
    const allBookings = await prisma.bookingData.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        bookno: true,
        bookdate: true,
        customer: true,
        status: true
      }
    })
    
    console.log(`数据库中共有 ${allBookings.length} 条 Booking Order 记录\n`)
    
    // 2. 显示 ID 30-42 之间的记录
    console.log('=== ID 28-42 的记录 ===')
    const relevantBookings = allBookings.filter(b => b.id >= 28 && b.id <= 42)
    relevantBookings.forEach(b => {
      console.log(`ID: ${b.id}, BookNo: ${b.bookno}, Customer: ${b.customer}, Date: ${b.bookdate?.toISOString().split('T')[0] || 'N/A'}, Status: ${b.status}`)
    })
    
    // 3. 检查是否有缺失的 ID
    console.log('\n=== 检查缺失的记录 ===')
    const ids = allBookings.map(b => b.id).sort((a, b) => a - b)
    const minId = Math.min(...ids)
    const maxId = Math.max(...ids)
    
    const missingIds = []
    for (let i = minId; i <= maxId; i++) {
      if (!ids.includes(i)) {
        missingIds.push(i)
      }
    }
    
    if (missingIds.length > 0) {
      console.log(`发现缺失的 ID: ${missingIds.join(', ')}`)
      console.log(`可能原因：`)
      console.log(`  1. 这些记录被删除了`)
      console.log(`  2. 创建时出现错误，ID 被消耗但记录未成功创建`)
      console.log(`  3. 数据库序列跳号（sequence gap）`)
    } else {
      console.log('没有发现缺失的 ID')
    }
    
    // 4. 检查 BookNo 是否连续
    console.log('\n=== 检查 BookNo 连续性 ===')
    const bookNumbers = allBookings
      .map(b => {
        const match = b.bookno.match(/T(\d+)/)
        return match ? parseInt(match[1]) : null
      })
      .filter(n => n !== null)
      .sort((a, b) => a - b)
    
    const missingBookNos = []
    for (let i = 0; i < bookNumbers.length - 1; i++) {
      const current = bookNumbers[i]
      const next = bookNumbers[i + 1]
      if (next - current > 1) {
        for (let missing = current + 1; missing < next; missing++) {
          missingBookNos.push(`T${missing}`)
        }
      }
    }
    
    if (missingBookNos.length > 0) {
      console.log(`发现缺失的 BookNo: ${missingBookNos.join(', ')}`)
    } else {
      console.log('BookNo 是连续的')
    }
    
    // 5. 检查 sequence 当前值
    console.log('\n=== 检查数据库 Sequence ===')
    try {
      const seqResult = await prisma.$queryRaw`
        SELECT last_value, is_called 
        FROM booking_number_seq
      `
      console.log('booking_number_seq 当前值:', seqResult)
    } catch (err) {
      console.log('无法获取 sequence 信息（可能不存在）:', err.message)
    }
    
    // 6. 显示最近 10 条记录的创建时间
    console.log('\n=== 最近 10 条记录 ===')
    const recentBookings = allBookings.slice(-10)
    recentBookings.forEach(b => {
      console.log(`${b.bookno}: ${b.bookdate?.toISOString() || 'N/A'} - ${b.customer}`)
    })
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingBookings()
