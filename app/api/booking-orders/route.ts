import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchType = searchParams.get('searchType') || 'all'
    const departureDate = searchParams.get('departureDate')
    const outstandingBeforeDate = searchParams.get('outstandingBeforeDate')
    const customer = searchParams.get('customer')

    let where: any = {}

    if (searchType === 'date' && departureDate) {
      // By departure date
      where.deptdate = new Date(departureDate)
    } else if (searchType === 'outstanding' && outstandingBeforeDate) {
      // Outstanding before date - need to calculate from payments
      where.deptdate = {
        lte: new Date(outstandingBeforeDate)
      }
    } else if (searchType === 'customer' && customer) {
      // By customer name (fuzzy search)
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
      },
      take: 100 // Limit results
    })

    // Transform to match frontend format
    const formatted = bookings.map(booking => {
      const totalCost = booking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const paid = booking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = totalCost - paid

      // Only include if has outstanding for outstanding search
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
    return NextResponse.json({ error: 'Failed to fetch booking orders' }, { status: 500 })
  }
}
