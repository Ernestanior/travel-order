import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Lazy import to avoid build-time execution
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

    let where: any = {}

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

    const bookings = await prisma.bookingData.findMany({
      where,
      include: {
        passengers: true,
        items: true,
        payments: true,
      },
      orderBy: {
        bookdate: 'desc'
      }
    })

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

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching booking orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch booking orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
