import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Import prisma at the top level for better performance
    const { prisma } = await import('@/lib/db')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured. Please add DATABASE_URL environment variable in Vercel.' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const searchType = searchParams.get('searchType') || 'all'
    const departureDate = searchParams.get('departureDate')
    const outstandingBeforeDate = searchParams.get('outstandingBeforeDate')
    const customer = searchParams.get('customer')
    const bookingNumber = searchParams.get('bookingNumber')
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let where: any = {}

    // 直接搜索参数（优先级更高）
    if (bookingNumber) {
      where.bookno = {
        contains: bookingNumber,
        mode: 'insensitive'
      }
    }

    if (customer && searchType !== 'customer') {
      where.customer = {
        contains: customer,
        mode: 'insensitive'
      }
    }

    // 筛选类型参数
    if (searchType === 'date' && departureDate) {
      where.deptdate = new Date(departureDate)
    } else if (searchType === 'outstanding' && outstandingBeforeDate) {
      where.deptdate = {
        lte: new Date(outstandingBeforeDate)
      }
    } else if (searchType === 'customer' && customer) {
      where.customer = {
        contains: customer,
        mode: 'insensitive'
      }
    }

    // 并行执行 count 和 findMany 以提升性能
    const [total, bookings] = await Promise.all([
      prisma.bookingData.count({ where }),
      prisma.bookingData.findMany({
        where,
        select: {
          id: true,
          bookno: true,
          customer: true,
          bookdate: true,
          deptdate: true,
          arrvdate: true,
          status: true,
          tour: true,
          // 只选择需要的字段以减少数据传输
          passengers: {
            select: {
              paxname: true,
              passport: true
            }
          },
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
          bookdate: 'desc'
        },
        skip,
        take: limit
      })
    ])

    const formatted = bookings.map(booking => {
      const totalCost = booking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const paid = booking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = totalCost - paid

      if (searchType === 'outstanding' && outstanding <= 0) {
        return null
      }

      return {
        id: booking.id,
        bookingNumber: booking.bookno,
        customerName: booking.customer,
        date: booking.bookdate?.toISOString().split('T')[0] || '',
        bookingDate: booking.bookdate?.toISOString().split('T')[0] || '',
        departureDate: booking.deptdate?.toISOString().split('T')[0] || '',
        arrivalDate: booking.arrvdate?.toISOString().split('T')[0] || '',
        totalCost,
        paid,
        outstanding,
        status: booking.status || 'Open',
        tour: booking.tour || '',
        passengers: booking.passengers.map(p => ({
          name: p.paxname,
          passport: p.passport || ''
        })),
        passengerNames: booking.passengers.map(p => p.paxname).join(', ')
      }
    }).filter(Boolean)

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
    console.error('Error fetching booking orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch booking orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
