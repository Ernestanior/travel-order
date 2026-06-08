import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新订单
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 生成新的 booking number
    const lastBooking = await prisma.bookingData.findFirst({
      orderBy: { id: 'desc' },
      select: { bookno: true }
    })
    
    let newBookingNumber
    if (lastBooking && lastBooking.bookno) {
      // 从最后一个订单号提取数字并加1
      const match = lastBooking.bookno.match(/(\d+)/)
      if (match) {
        const lastNumber = parseInt(match[1])
        newBookingNumber = `${lastNumber + 1}`
      } else {
        newBookingNumber = `${Date.now()}`
      }
    } else {
      newBookingNumber = `${Date.now()}`
    }
    
    // 创建主订单
    const booking = await prisma.bookingData.create({
      data: {
        bookno: newBookingNumber,
        bookdate: body.bookingDate ? new Date(body.bookingDate) : new Date(),
        customer: body.customerName || '',
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
        discount: body.discount || 0,
        tourcode: body.tourCode || null,
        tour: body.tour || null,
        staff: body.staff || null,
        special: body.special || null,
        status: 'Open',
      }
    })
    
    // 创建乘客信息
    if (body.passengers && body.passengers.length > 0) {
      await prisma.passengerData.createMany({
        data: body.passengers.map((p: any) => ({
          bookno: newBookingNumber,
          paxname: p.name,
          passport: p.passport || null,
          birthdate: p.birthdate ? new Date(p.birthdate) : null
        }))
      })
    }
    
    // 创建 items
    if (body.items && body.items.length > 0) {
      await prisma.itemData.createMany({
        data: body.items.map((item: any) => ({
          bookno: newBookingNumber,
          item: item.item,
          quantity: item.quantity || 0,
          unitprice: item.unitPrice || 0,
          price: item.price || 0
        }))
      })
    }

    return NextResponse.json({ 
      success: true, 
      id: booking.id,
      bookingNumber: newBookingNumber
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
