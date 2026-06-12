import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取单个订单详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    
    const booking = await prisma.bookingData.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        passengers: true,
        items: true,
        payments: true,
        customerData: true,
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const totalCost = booking.items.reduce((sum, item) => 
      sum + Number(item.price || 0), 0
    )
    const discount = Number(booking.discount || 0)
    const paid = booking.payments.reduce((sum, payment) => 
      sum + Number(payment.amountpaid || 0), 0
    )
    const totalAfterDiscount = totalCost - discount
    const outstanding = totalAfterDiscount - paid

    const formatted = {
      id: booking.id,
      bookingNumber: booking.bookno,
      bookingDate: booking.bookdate?.toISOString().split('T')[0] || '',
      customerName: booking.customer,
      address: booking.customerData?.address || '',
      tel: booking.customerData?.tel || '',
      staff: booking.staff || '',
      tourCode: booking.tourcode || '',
      tour: booking.tour || '',
      special: booking.special || '',
      status: booking.status || 'Open',
      
      // Departure info
      departureDate: booking.deptdate?.toISOString().split('T')[0] || '',
      departureTime: booking.depttime || '',
      departureFlight: booking.deptflt || '',
      departureDest: booking.deptdest || '',
      departureDate2: booking.deptdate2?.toISOString().split('T')[0] || '',
      departureTime2: booking.depttime2 || '',
      departureFlight2: booking.deptflt2 || '',
      departureDest2: booking.deptdest2 || '',
      
      // Arrival info
      arrivalDate: booking.arrvdate?.toISOString().split('T')[0] || '',
      arrivalTime: booking.arrvtime || '',
      arrivalFlight: booking.arrvflt || '',
      arrivalDest: booking.arrvdest || '',
      arrivalDate2: booking.arrvdate2?.toISOString().split('T')[0] || '',
      arrivalTime2: booking.arrvtime2 || '',
      arrivalFlight2: booking.arrvflt2 || '',
      arrivalDest2: booking.arrvdest2 || '',
      
      // Financial
      totalCost,
      discount,
      totalAfterDiscount,
      paid,
      outstanding,
      
      // Related data
      passengers: booking.passengers.map(p => ({
        name: p.paxname,
        passport: p.passport || '',
        birthdate: p.birthdate?.toISOString().split('T')[0] || '',
        passportExpiryDate: p.passport_expiry_date?.toISOString().split('T')[0] || ''
      })),
      
      items: booking.items.map(item => ({
        item: item.item,
        quantity: item.quantity || 0,
        unitPrice: Number(item.unitprice || 0),
        price: Number(item.price || 0)
      })),
      
      payments: booking.payments.map(payment => ({
        id: payment.id,
        receiptNo: payment.receiptno || '',
        date: payment.receiptdate?.toISOString().split('T')[0] || '',
        type: payment.paytype || '',
        for: payment.for || '',
        chequeno: payment.chequeno || '',
        visano: payment.visano || '',
        amount: Number(payment.amountpaid || 0),
        payfor: payment.payfor || '',
        customer: payment.customer || ''
      }))
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - 更新订单
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 获取订单的 bookno
    const existingBooking = await prisma.bookingData.findUnique({
      where: { id: parseInt(params.id) },
      select: { bookno: true }
    })
    
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 先更新或创建 Customer 记录（如果提供了 address 或 tel）
    if (body.customerName && body.tel) {
      await prisma.customer.upsert({
        where: { customer: body.customerName },
        update: {
          address: body.address || null,
          tel: body.tel,
        },
        create: {
          customer: body.customerName,
          address: body.address || null,
          tel: body.tel,
        }
      })
    }
    
    // 更新主订单信息
    const booking = await prisma.bookingData.update({
      where: { id: parseInt(params.id) },
      data: {
        customer: body.customerName,
        bookdate: body.bookingDate ? new Date(body.bookingDate) : null,
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
        status: body.status || 'Open',
      }
    })
    
    // 更新 Items（如果提供）
    if (body.items && Array.isArray(body.items)) {
      // 删除现有 items
      await prisma.itemData.deleteMany({
        where: { bookno: existingBooking.bookno }
      })
      
      // 创建新 items
      if (body.items.length > 0) {
        await prisma.itemData.createMany({
          data: body.items.map((item: any) => ({
            bookno: existingBooking.bookno,
            item: item.item,
            quantity: item.quantity || 0,
            unitprice: item.unitPrice || 0,
            price: item.price || 0
          }))
        })
      }
    }
    
    // 更新 Passengers（如果提供）
    if (body.passengers && Array.isArray(body.passengers)) {
      // 删除现有 passengers
      await prisma.passengerData.deleteMany({
        where: { bookno: existingBooking.bookno }
      })
      
      // 创建新 passengers
      if (body.passengers.length > 0) {
        await prisma.passengerData.createMany({
          data: body.passengers.map((p: any) => ({
            bookno: existingBooking.bookno,
            paxname: p.name,
            passport: p.passport || null,
            birthdate: p.birthdate ? new Date(p.birthdate) : null,
            passport_expiry_date: p.passportExpiryDate ? new Date(p.passportExpiryDate) : null
          }))
        })
      }
    }

    return NextResponse.json({ success: true, id: booking.id })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ 
      error: 'Failed to update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - 删除订单
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const bookingId = parseInt(params.id)
    
    // 先获取 bookno
    const booking = await prisma.bookingData.findUnique({
      where: { id: bookingId },
      select: { bookno: true }
    })
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 删除相关数据（按照外键依赖顺序）
    await prisma.bookingPaymentData.deleteMany({
      where: { bookno: booking.bookno }
    })
    
    await prisma.itemData.deleteMany({
      where: { bookno: booking.bookno }
    })
    
    await prisma.passengerData.deleteMany({
      where: { bookno: booking.bookno }
    })
    
    // 最后删除主订单
    await prisma.bookingData.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ 
      error: 'Failed to delete booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
