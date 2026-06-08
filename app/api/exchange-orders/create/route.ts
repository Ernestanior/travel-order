import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新的 Exchange Order
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 生成新的唯一 exchange number
    // 查询数据库中最大的数字订单号
    const maxExchangeNumber = await prisma.$queryRaw<Array<{ max_exchangeno: string | null }>>`
      SELECT MAX(CAST(exchangeno AS INTEGER)) as max_exchangeno 
      FROM exchange_data 
      WHERE exchangeno ~ '^[0-9]+$'
    `
    
    let nextNumber = 1041744 // 默认起始值
    if (maxExchangeNumber && maxExchangeNumber[0]?.max_exchangeno) {
      nextNumber = parseInt(maxExchangeNumber[0].max_exchangeno) + 1
    }
    
    // 使用重试机制确保唯一性（防止并发冲突）
    let newExchangeNumber: string = ''
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      newExchangeNumber = `${nextNumber + attempts}`
      
      // 检查是否已存在
      const existing = await prisma.exchangeData.findUnique({
        where: { exchangeno: newExchangeNumber },
        select: { id: true }
      })
      
      if (!existing) {
        break // 找到唯一的订单号
      }
      
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('无法生成唯一的 Exchange Order 号，请稍后重试')
    }
    
    // 验证必填字段
    if (!body.bookingNumber) {
      throw new Error('必须选择一个 Booking Order')
    }
    
    if (!body.supplier) {
      throw new Error('供应商不能为空')
    }
    
    // 验证 Booking Order 是否存在
    const booking = await prisma.bookingData.findUnique({
      where: { bookno: body.bookingNumber },
      select: { bookno: true }
    })
    
    if (!booking) {
      throw new Error(`Booking Order ${body.bookingNumber} 不存在`)
    }
    
    // 确保供应商存在（如果不存在则创建）
    const existingSupplier = await prisma.supplier.findUnique({
      where: { supplier: body.supplier }
    })
    
    if (!existingSupplier) {
      // 创建新供应商（使用默认电话号码，因为 Supplier 表的 tel 字段不能为空）
      await prisma.supplier.create({
        data: {
          supplier: body.supplier,
          tel: 'N/A',  // 默认值，稍后可以更新
          address: null,
          fax: null
        }
      })
    }
    
    // 确保客户存在（如果提供了客户名称）
    if (body.customer) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { customer: body.customer }
      })
      
      if (!existingCustomer) {
        // 使用 Booking Order 中的客户信息
        const bookingWithCustomer = await prisma.bookingData.findUnique({
          where: { bookno: body.bookingNumber },
          include: {
            customerData: true
          }
        })
        
        if (bookingWithCustomer?.customerData) {
          // 客户已存在于 Booking 中，无需创建
        } else {
          // 创建新客户（需要电话）
          await prisma.customer.create({
            data: {
              customer: body.customer,
              tel: 'N/A',  // 默认值
              address: null,
              fax: null
            }
          })
        }
      }
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
