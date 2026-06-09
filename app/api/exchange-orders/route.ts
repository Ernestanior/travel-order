import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured.' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const supplier = searchParams.get('supplier')
    const orderNumber = searchParams.get('orderNumber')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let where: any = {}

    if (supplier) {
      where.supplier = {
        contains: supplier,
        mode: 'insensitive'
      }
    }

    // Exchange # 或 Booking # 搜索
    if (orderNumber) {
      where.OR = [
        {
          exchangeno: {
            contains: orderNumber,
            mode: 'insensitive'
          }
        },
        {
          bookno: {
            contains: orderNumber,
            mode: 'insensitive'
          }
        }
      ]
    }

    // 日期范围搜索
    if (dateFrom || dateTo) {
      where.deptdate = {}
      if (dateFrom) {
        where.deptdate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // 包含结束日期的全天
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.deptdate.lte = endDate
      }
    }

    // 并行执行 count 和 findMany 以提升性能
    const [total, exchanges] = await Promise.all([
      prisma.exchangeData.count({ where }),
      prisma.exchangeData.findMany({
        where,
        select: {
          id: true,
          exchangeno: true,
          bookno: true,
          supplier: true,
          exchangedate: true,
          deptdate: true,
          arrvdate: true,
          status: true,
          // 只选择需要的字段以减少数据传输
          items: {
            select: {
              price: true
            }
          },
          payments: {
            select: {
              amountpaid: true
            }
          }
        },
        orderBy: {
          exchangedate: 'desc'
        },
        skip,
        take: limit
      })
    ])

    const formatted = exchanges.map(exchange => {
      const totalCost = exchange.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const paid = exchange.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = totalCost - paid

      return {
        id: exchange.id,
        exchangeNumber: exchange.exchangeno,
        bookingNumber: exchange.bookno,
        supplierName: exchange.supplier,
        agent: exchange.supplier,
        date: exchange.exchangedate?.toISOString().split('T')[0] || '',
        departureDate: exchange.deptdate?.toISOString().split('T')[0] || '',
        deptDate: exchange.deptdate?.toISOString().split('T')[0] || '',
        arrivalDate: exchange.arrvdate?.toISOString().split('T')[0] || '',
        arvDate: exchange.arrvdate?.toISOString().split('T')[0] || '',
        totalCost,
        paid,
        outstanding,
        status: exchange.status || 'Open'
      }
    })

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching exchange orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch exchange orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
