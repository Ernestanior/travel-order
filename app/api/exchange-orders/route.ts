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

    let where: any = {}

    if (supplier) {
      where.supplier = {
        contains: supplier,
        mode: 'insensitive'
      }
    }

    const exchanges = await prisma.exchangeData.findMany({
      where,
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        exchangedate: 'desc'
      }
    })

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

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching exchange orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch exchange orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
