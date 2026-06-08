import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新的 Exchange Order
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 生成新的 exchange number
    const lastExchange = await prisma.exchangeData.findFirst({
      orderBy: { id: 'desc' },
      select: { exchangeno: true }
    })
    
    let newExchangeNumber
    if (lastExchange && lastExchange.exchangeno) {
      // 从最后一个订单号提取数字并加1
      const match = lastExchange.exchangeno.match(/(\d+)/)
      if (match) {
        const lastNumber = parseInt(match[1])
        newExchangeNumber = `${lastNumber + 1}`
      } else {
        newExchangeNumber = `${Date.now()}`
      }
    } else {
      newExchangeNumber = `${Date.now()}`
    }
    
    // 创建 Exchange Order
    const exchange = await prisma.exchangeData.create({
      data: {
        exchangeno: newExchangeNumber,
        bookno: body.bookingNumber,
        exchangedate: body.exchangeDate ? new Date(body.exchangeDate) : new Date(),
        supplier: body.supplier,
        status: 'Open',
        
        // 从 Booking 复制的信息
        customer: body.customer || null,
        bookdate: body.bookingDate ? new Date(body.bookingDate) : null,
        
        // Flight info
        deptdate: body.departureDate ? new Date(body.departureDate) : null,
        depttime: body.departureTime || null,
        deptflt: body.departureFlight || null,
        deptdest: body.departureDest || null,
        deptdate2: body.departureDate2 ? new Date(body.departureDate2) : null,
        depttime2: body.departureTime2 || null,
        deptflt2: body.departureFlight2 || null,
        deptdest2: body.departureDest2 || null,
        
        arrvdate: body.arrivalDate ? new Date(body.arrivalDate) : null,
        arrvtime: body.arrivalTime || null,
        arrvflt: body.arrivalFlight || null,
        arrvdest: body.arrivalDest || null,
        arrvdate2: body.arrivalDate2 ? new Date(body.arrivalDate2) : null,
        arrvtime2: body.arrivalTime2 || null,
        arrvflt2: body.arrivalFlight2 || null,
        arrvdest2: body.arrivalDest2 || null,
        
        // Tour info
        tourcode: body.tourCode || null,
        tour: body.tour || null,
        discount: 0,
        staff: null,
        special: body.notes || null,
      }
    })
    
    // 创建一个 item 记录金额
    if (body.amount && body.amount > 0) {
      await prisma.exchangeItemData.create({
        data: {
          exchangeno: newExchangeNumber,
          item: body.tour || 'Service Fee',
          quantity: 1,
          unitprice: body.amount,
          price: body.amount,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      id: exchange.id,
      exchangeNumber: newExchangeNumber
    })
  } catch (error) {
    console.error('Error creating exchange:', error)
    return NextResponse.json({ 
      error: 'Failed to create exchange order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
