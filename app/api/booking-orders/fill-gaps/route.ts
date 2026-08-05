import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 填充跳号（创建占位订单）
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    
    // 获取所有 Booking Orders，按 bookno 排序
    const allOrders = await prisma.bookingData.findMany({
      select: {
        bookno: true,
        display_no: true,
        customer: true,
        status: true
      },
      orderBy: {
        bookno: 'asc'
      }
    })

    if (allOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有订单需要填充',
        filled: []
      })
    }

    // 提取订单号数字部分
    const orderNumbers = allOrders
      .map(order => {
        const match = order.bookno.match(/^T(\d+)$/)
        return match ? parseInt(match[1]) : null
      })
      .filter(num => num !== null) as number[]

    if (orderNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有有效的订单号',
        filled: []
      })
    }

    // 找出最小和最大订单号
    const minNumber = Math.min(...orderNumbers)
    const maxNumber = Math.max(...orderNumbers)

    // 找出缺失的订单号
    const missingNumbers: number[] = []
    for (let i = minNumber; i <= maxNumber; i++) {
      if (!orderNumbers.includes(i)) {
        missingNumbers.push(i)
      }
    }

    if (missingNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有跳号需要填充',
        filled: []
      })
    }

    console.log(`发现 ${missingNumbers.length} 个跳号: ${missingNumbers.map(n => `T${n}`).join(', ')}`)

    // 使用事务创建占位订单
    const filledOrders = await prisma.$transaction(async (tx) => {
      const created = []
      
      for (const number of missingNumbers) {
        const bookno = `T${number}`
        const display_no = bookno
        
        // 检查订单是否已存在（双重检查）
        const existing = await tx.bookingData.findUnique({
          where: { bookno },
          select: { id: true }
        })
        
        if (existing) {
          console.log(`订单 ${bookno} 已存在，跳过`)
          continue
        }
        
        // 创建占位订单
        const placeholder = await tx.bookingData.create({
          data: {
            bookno,
            display_no,
            customer: '[PLACEHOLDER]',
            status: 'Placeholder',
            bookdate: new Date('2000-01-01'),
            deptdate: null,
            arrvdate: null,
            discount: 0,
            tour: null,
            staff: null,
            tourcode: null,
            special: 'Auto-filled placeholder order'
          }
        })
        
        created.push(bookno)
        console.log(`✓ 创建占位订单: ${bookno}`)
      }
      
      return created
    })

    return NextResponse.json({
      success: true,
      message: `成功填充 ${filledOrders.length} 个跳号`,
      filled: filledOrders,
      total: missingNumbers.length
    })

  } catch (error) {
    console.error('Error filling gaps:', error)
    return NextResponse.json({
      error: 'Failed to fill gaps',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
