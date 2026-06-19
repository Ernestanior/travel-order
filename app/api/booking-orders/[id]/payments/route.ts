import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取订单的所有付款记录
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const id = parseInt(params.id)
    
    // 获取订单信息
    const booking = await prisma.bookingData.findUnique({
      where: { id },
      select: { bookno: true }
    })
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 获取所有付款记录
    const payments = await prisma.bookingPaymentData.findMany({
      where: { bookno: booking.bookno },
      orderBy: { receiptdate: 'desc' }
    })
    
    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - 添加新的付款记录
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const id = parseInt(params.id)
    const body = await request.json()
    
    // 获取订单信息
    const booking = await prisma.bookingData.findUnique({
      where: { id },
      select: { 
        bookno: true,
        customer: true
      }
    })
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 验证必填字段
    if (!body.amountPaid || parseFloat(body.amountPaid) <= 0) {
      throw new Error('Amount Paid must be greater than 0')
    }
    
    if (!body.receiptDate) {
      throw new Error('Receipt Date is required')
    }
    
    // 创建付款记录
    const payment = await prisma.bookingPaymentData.create({
      data: {
        bookno: booking.bookno,
        receiptno: body.receiptNo || null,
        receiptdate: new Date(body.receiptDate),
        paytype: body.paymentType || null,
        for: body.paymentFor || null,
        chequeno: body.chequeNo || null,
        visano: body.visaNo || null,
        amountpaid: parseFloat(body.amountPaid),
        paidtext: body.amountPaidText || null,
        customer: booking.customer || body.receiveFrom || null,
        payfor: body.paymentOf || null,
      }
    })
    
    // 计算outstanding并更新status
    const fullBooking = await prisma.bookingData.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true
      }
    })
    
    if (fullBooking) {
      const totalCost = fullBooking.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const discount = Number(fullBooking.discount || 0)
      const paid = fullBooking.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = (totalCost - discount) - paid
      
      // 如果outstanding <= 0，自动设置status为Close
      if (outstanding <= 0.001) {
        await prisma.bookingData.update({
          where: { id },
          data: { status: 'Close' }
        })
      }
    }
    
    return NextResponse.json({ 
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ 
      error: 'Failed to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
