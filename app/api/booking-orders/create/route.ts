import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新订单
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 生成新的唯一 booking number
    // 查询数据库中最大的数字订单号
    const maxBookingNumber = await prisma.$queryRaw<Array<{ max_bookno: string | null }>>`
      SELECT MAX(CAST(bookno AS INTEGER)) as max_bookno 
      FROM booking_data 
      WHERE bookno ~ '^[0-9]+$'
    `
    
    let nextNumber = 1043495 // 默认起始值
    if (maxBookingNumber && maxBookingNumber[0]?.max_bookno) {
      nextNumber = parseInt(maxBookingNumber[0].max_bookno) + 1
    }
    
    // 使用重试机制确保唯一性（防止并发冲突）
    let newBookingNumber: string = ''
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      newBookingNumber = `${nextNumber + attempts}`
      
      // 检查是否已存在
      const existing = await prisma.bookingData.findUnique({
        where: { bookno: newBookingNumber },
        select: { id: true }
      })
      
      if (!existing) {
        break // 找到唯一的订单号
      }
      
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('无法生成唯一的订单号，请稍后重试')
    }
    
    // 确保客户存在（如果不存在则创建）
    const customerName = body.customerName || ''
    const customerTel = body.tel || ''
    
    if (!customerName) {
      throw new Error('客户名称不能为空')
    }
    
    if (!customerTel) {
      throw new Error('客户电话不能为空')
    }
    
    // 检查客户是否存在
    const existingCustomer = await prisma.customer.findUnique({
      where: { customer: customerName }
    })
    
    if (!existingCustomer) {
      // 创建新客户
      await prisma.customer.create({
        data: {
          customer: customerName,
          tel: customerTel,
          address: body.address || null,
          fax: body.fax || null
        }
      })
    }
    
    // 创建主订单
    const booking = await prisma.bookingData.create({
      data: {
        bookno: newBookingNumber,
        bookdate: body.bookingDate ? new Date(body.bookingDate) : new Date(),
        customer: customerName,
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
