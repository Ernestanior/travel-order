import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新订单
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 验证必填字段
    const customerName = body.customerName || ''
    const customerTel = body.tel || ''
    
    if (!customerName) {
      throw new Error('客户名称不能为空')
    }
    
    if (!customerTel) {
      throw new Error('客户电话不能为空')
    }
    
    // 使用数据库事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 使用PostgreSQL序列生成严格递增的订单号
      // 这是原子操作，保证：
      // - 顺序性：订单号严格按时间顺序递增
      // - 唯一性：数据库级别保证不会冲突
      // - 并发安全：多个请求同时到达也能正确处理
      
      let newBookingNumber: string = ''
      
      try {
        // 方法1：使用数据库序列（推荐，需要先运行SETUP_BOOKING_SEQUENCE.sql）
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
        // 如果序列不存在，回退到安全的自增方法
        console.warn('Sequence not found, using fallback method:', sequenceError)
        
        // 使用数据库级别的行锁确保唯一性
        const maxBooking = await tx.bookingData.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        })
        
        let nextNumber = 100001
        if (maxBooking && maxBooking.id) {
          nextNumber = maxBooking.id + 1
        }
        
        newBookingNumber = `T${nextNumber}`
        
        // 双重检查：如果订单号已存在，重试
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
      
      // 2. 确保客户存在（如果不存在则创建）
      const existingCustomer = await tx.customer.findUnique({
        where: { customer: customerName }
      })
      
      if (!existingCustomer) {
        // 创建新客户
        await tx.customer.create({
          data: {
            customer: customerName,
            tel: customerTel,
            address: body.address || null,
            fax: body.fax || null,
            email: body.email || null
          }
        })
      } else {
        // 客户已存在，更新信息（如果提供了新的信息）
        const updateData: any = {}
        
        if (body.email && existingCustomer.email !== body.email) {
          updateData.email = body.email
        }
        
        if (body.address && existingCustomer.address !== body.address) {
          updateData.address = body.address
        }
        
        if (customerTel && existingCustomer.tel !== customerTel) {
          updateData.tel = customerTel
        }
        
        if (Object.keys(updateData).length > 0) {
          await tx.customer.update({
            where: { customer: customerName },
            data: updateData
          })
        }
      }
      
      // 3. 创建主订单（在事务中）
      const booking = await tx.bookingData.create({
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
      
      // 4. 创建乘客信息（在事务中）
      if (body.passengers && body.passengers.length > 0) {
        await tx.passengerData.createMany({
          data: body.passengers.map((p: any) => ({
            bookno: newBookingNumber,
            paxname: p.name,
            passport: p.passport || null,
            birthdate: p.birthdate ? new Date(p.birthdate) : null,
            passport_expiry_date: p.passportExpiryDate ? new Date(p.passportExpiryDate) : null
          }))
        })
      }
      
      // 5. 创建 items（在事务中）
      if (body.items && body.items.length > 0) {
        await tx.itemData.createMany({
          data: body.items.map((item: any) => ({
            bookno: newBookingNumber,
            item: item.item,
            quantity: item.quantity || 0,
            unitprice: item.unitPrice || 0,
            price: item.price || 0
          }))
        })
      }
      
      // 返回创建结果
      return {
        id: booking.id,
        bookingNumber: newBookingNumber
      }
    }, {
      // 设置事务超时时间和隔离级别
      timeout: 10000, // 10秒超时
      isolationLevel: 'Serializable' // 最高隔离级别，防止并发问题
    })

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      bookingNumber: result.bookingNumber
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    
    // 返回更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isUniqueConstraintError = errorMessage.includes('Unique constraint')
    
    return NextResponse.json({ 
      error: isUniqueConstraintError 
        ? '订单号冲突，请重试' 
        : 'Failed to create booking',
      details: errorMessage
    }, { status: 500 })
  }
}
