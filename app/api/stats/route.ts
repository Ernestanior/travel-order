import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured.',
        totalBookings: 0,
        totalExchanges: 0,
        totalRevenue: 0,
        outstandingAmount: 0
      }, { status: 500 })
    }

    const bookingCount = await prisma.bookingData.count()
    const exchangeCount = await prisma.exchangeData.count()

    const bookings = await prisma.bookingData.findMany({
      include: {
        items: true,
        payments: true,
      }
    })

    const exchanges = await prisma.exchangeData.findMany({
      include: {
        items: true,
        payments: true,
      }
    })

    let totalRevenue = 0
    let totalOutstanding = 0

    bookings.forEach(booking => {
      const totalCost = booking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const paid = booking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      totalRevenue += paid
      totalOutstanding += (totalCost - paid)
    })

    exchanges.forEach(exchange => {
      const totalCost = exchange.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const paid = exchange.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      totalRevenue += paid
      totalOutstanding += (totalCost - paid)
    })

    return NextResponse.json({
      totalBookings: bookingCount,
      totalExchanges: exchangeCount,
      totalRevenue,
      outstandingAmount: totalOutstanding
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error',
      totalBookings: 0,
      totalExchanges: 0,
      totalRevenue: 0,
      outstandingAmount: 0
    }, { status: 500 })
  }
}
