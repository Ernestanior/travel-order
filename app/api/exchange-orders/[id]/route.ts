import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取单个 Exchange Order 详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    
    const exchange = await prisma.exchangeData.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        items: true,
        payments: true,
        supplierData: true,
        bookingData: {
          select: {
            bookno: true,
            customer: true,
          }
        }
      }
    })

    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 })
    }

    const totalCost = exchange.items.reduce((sum, item) => 
      sum + Number(item.price || 0), 0
    )
    const paid = exchange.payments.reduce((sum, payment) => 
      sum + Number(payment.amountpaid || 0), 0
    )
    const outstanding = totalCost - paid

    const formatted = {
      id: exchange.id,
      exchangeNumber: exchange.exchangeno,
      bookingNumber: exchange.bookno,
      exchangeDate: exchange.exchangedate?.toISOString().split('T')[0] || '',
      supplier: exchange.supplier,
      supplierAddress: exchange.supplierData?.address || '',
      supplierTel: exchange.supplierData?.tel || '',
      status: exchange.status || 'Open',
      
      // Customer info
      customer: exchange.customer || exchange.bookingData?.customer || '',
      
      // Flight info
      departureDate: exchange.deptdate?.toISOString().split('T')[0] || '',
      departureTime: exchange.depttime || '',
      departureFlight: exchange.deptflt || '',
      departureDest: exchange.deptdest || '',
      departureDate2: exchange.deptdate2?.toISOString().split('T')[0] || '',
      departureTime2: exchange.depttime2 || '',
      departureFlight2: exchange.deptflt2 || '',
      departureDest2: exchange.deptdest2 || '',
      
      arrivalDate: exchange.arrvdate?.toISOString().split('T')[0] || '',
      arrivalTime: exchange.arrvtime || '',
      arrivalFlight: exchange.arrvflt || '',
      arrivalDest: exchange.arrvdest || '',
      arrivalDate2: exchange.arrvdate2?.toISOString().split('T')[0] || '',
      arrivalTime2: exchange.arrvtime2 || '',
      arrivalFlight2: exchange.arrvflt2 || '',
      arrivalDest2: exchange.arrvdest2 || '',
      
      // Tour info
      tourCode: exchange.tourcode || '',
      tour: exchange.tour || '',
      special: exchange.special || '',
      
      // Financial
      totalCost,
      paid,
      outstanding,
      
      // Items
      items: exchange.items.map(item => ({
        item: item.item,
        quantity: item.quantity || 0,
        unitPrice: Number(item.unitprice || 0),
        price: Number(item.price || 0)
      })),
      
      // Payments
      payments: exchange.payments.map(payment => ({
        id: payment.id,
        date: payment.receiptdate?.toISOString().split('T')[0] || '',
        type: payment.paytype || '',
        amount: Number(payment.amountpaid || 0),
        remarks: payment.remarks || ''
      }))
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching exchange:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch exchange order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - 更新 Exchange Order
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 获取 exchange 的 exchangeno
    const existingExchange = await prisma.exchangeData.findUnique({
      where: { id: parseInt(params.id) },
      select: { exchangeno: true }
    })
    
    if (!existingExchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 })
    }
    
    // 先更新或创建 Supplier 记录（如果提供了 tel 或 address）
    if (body.supplier && (body.supplierTel || body.supplierAddress)) {
      await prisma.supplier.upsert({
        where: { supplier: body.supplier },
        update: {
          address: body.supplierAddress || null,
          tel: body.supplierTel || null,
        },
        create: {
          supplier: body.supplier,
          address: body.supplierAddress || null,
          tel: body.supplierTel || null,
        }
      })
    }
    
    // 更新主订单信息
    const exchange = await prisma.exchangeData.update({
      where: { id: parseInt(params.id) },
      data: {
        exchangedate: body.exchangeDate ? new Date(body.exchangeDate) : null,
        supplier: body.supplier,
        customer: body.customer || null,
        status: body.status || 'Open',
        
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
        special: body.special || null,
      }
    })
    
    // 更新 Items（如果提供）
    if (body.items && Array.isArray(body.items)) {
      // 删除现有 items
      await prisma.exchangeItemData.deleteMany({
        where: { exchangeno: existingExchange.exchangeno }
      })
      
      // 创建新 items
      if (body.items.length > 0) {
        await prisma.exchangeItemData.createMany({
          data: body.items.map((item: any) => ({
            exchangeno: existingExchange.exchangeno,
            item: item.item,
            quantity: item.quantity || 0,
            unitprice: item.unitPrice || 0,
            price: item.price || 0
          }))
        })
      }
    }

    return NextResponse.json({ success: true, id: exchange.id })
  } catch (error) {
    console.error('Error updating exchange:', error)
    return NextResponse.json({ 
      error: 'Failed to update exchange order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - 删除 Exchange Order
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const exchangeId = parseInt(params.id)
    
    // 先获取 exchangeno
    const exchange = await prisma.exchangeData.findUnique({
      where: { id: exchangeId },
      select: { exchangeno: true }
    })
    
    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 })
    }

    // 删除相关数据（按照外键依赖顺序）
    await prisma.exchangePaymentData.deleteMany({
      where: { exchangeno: exchange.exchangeno }
    })
    
    await prisma.exchangeItemData.deleteMany({
      where: { exchangeno: exchange.exchangeno }
    })
    
    // 最后删除主订单
    await prisma.exchangeData.delete({
      where: { id: exchangeId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exchange:', error)
    return NextResponse.json({ 
      error: 'Failed to delete exchange order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
