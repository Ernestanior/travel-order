import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - 从模板创建订单
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const templateId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }
    
    // 获取模板
    const template = await prisma.bookingTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: true,
        passengers: true
      }
    })
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    // 使用数据库事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 生成订单号
      let newBookingNumber: string = ''
      
      try {
        const sequenceResult = await tx.$queryRaw<Array<{ nextval: bigint }>>`
          SELECT nextval('booking_number_seq')::int as nextval
        `
        
        if (sequenceResult && sequenceResult.length > 0) {
          const nextNumber = Number(sequenceResult[0].nextval)
          newBookingNumber = `T${nextNumber}`
        } else {
          throw new Error('Failed to get sequence value')
        }
      } catch (sequenceError) {
        console.warn('Sequence not found, using fallback method:', sequenceError)
        
        const maxBooking = await tx.bookingData.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        })
        
        let nextNumber = 100001
        if (maxBooking && maxBooking.id) {
          nextNumber = maxBooking.id + 1
        }
        
        newBookingNumber = `T${nextNumber}`
        
        let attempts = 0
        while (attempts < 5) {
          const existing = await tx.bookingData.findUnique({
            where: { bookno: newBookingNumber },
            select: { id: true }
          })
          
          if (!existing) {
            break
          }
          
          attempts++
          nextNumber++
          newBookingNumber = `T${nextNumber}`
        }
        
        if (attempts >= 5) {
          throw new Error('无法生成唯一的订单号，请稍后重试')
        }
      }
      
      const newDisplayNo = newBookingNumber
      
      // 2. 确保客户存在
      const existingCustomer = await tx.customer.findUnique({
        where: { customer: template.customer }
      })
      
      if (!existingCustomer) {
        await tx.customer.create({
          data: {
            customer: template.customer,
            tel: template.tel,
            address: template.address,
            email: template.email
          }
        })
      } else {
        // 更新客户信息
        const updateData: any = {}
        
        if (template.email && existingCustomer.email !== template.email) {
          updateData.email = template.email
        }
        
        if (template.address && existingCustomer.address !== template.address) {
          updateData.address = template.address
        }
        
        if (template.tel && existingCustomer.tel !== template.tel) {
          updateData.tel = template.tel
        }
        
        if (Object.keys(updateData).length > 0) {
          await tx.customer.update({
            where: { customer: template.customer },
            data: updateData
          })
        }
      }
      
      // 3. 创建主订单（使用模板数据 + 用户传入的日期等信息）
      const booking = await tx.bookingData.create({
        data: {
          bookno: newBookingNumber,
          display_no: newDisplayNo,
          bookdate: body.bookingDate ? new Date(body.bookingDate) : new Date(),
          customer: template.customer,
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
          discount: template.discount,
          tourcode: template.tourcode,
          tour: template.tour,
          staff: template.staff,
          special: template.special,
          status: 'Open',
        }
      })
      
      // 4. 创建 items（从模板）
      if (template.items && template.items.length > 0) {
        await tx.itemData.createMany({
          data: template.items.map((item) => ({
            bookno: newBookingNumber,
            item: item.item,
            quantity: item.quantity,
            unitprice: item.unitprice,
            price: item.price
          }))
        })
      }
      
      // 5. 创建 passengers（从模板）
      if (template.passengers && template.passengers.length > 0) {
        await tx.passengerData.createMany({
          data: template.passengers.map((passenger) => ({
            bookno: newBookingNumber,
            paxname: passenger.paxname,
            passport: passenger.passport,
            birthdate: passenger.birthdate,
            passport_expiry_date: passenger.passport_expiry_date
          }))
        })
      }
      
      return {
        id: booking.id,
        bookingNumber: newBookingNumber,
        displayNo: newDisplayNo
      }
    }, {
      timeout: 10000,
      isolationLevel: 'Serializable'
    })

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      bookingNumber: result.bookingNumber,
      displayNo: result.displayNo
    })
  } catch (error) {
    console.error('Error creating booking from template:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isUniqueConstraintError = errorMessage.includes('Unique constraint')
    
    return NextResponse.json({ 
      error: isUniqueConstraintError 
        ? '订单号冲突，请重试' 
        : 'Failed to create booking from template',
      details: errorMessage
    }, { status: 500 })
  }
}
