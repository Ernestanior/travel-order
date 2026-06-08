import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 添加付款记录
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 获取订单信息
    const booking = await prisma.bookingData.findUnique({
      where: { id: parseInt(params.id) },
      select: { bookno: true }
    })
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 生成 receipt number
    const lastPayment = await prisma.bookingPaymentData.findFirst({
      orderBy: { id: 'desc' },
      select: { receiptno: true }
    })
    
    let newReceiptNumber
    if (lastPayment && lastPayment.receiptno) {
      const match = lastPayment.receiptno.match(/(\d+)/)
      if (match) {
        const lastNumber = parseInt(match[1])
        newReceiptNumber = `${lastNumber + 1}`
      } else {
        newReceiptNumber = `R${Date.now()}`
      }
    } else {
      newReceiptNumber = `R${Date.now()}`
    }
    
    // 创建付款记录
    const payment = await prisma.bookingPaymentData.create({
      data: {
        receiptno: newReceiptNumber,
        bookno: booking.bookno,
        receiptdate: body.receiptDate ? new Date(body.receiptDate) : new Date(),
        paytype: body.paymentType || '',
        for: body.for || '',
        chequeno: body.chequeNo || null,
        visano: body.visaNo || null,
        amountpaid: body.amountPaid || 0,
        customer: body.customer || '',
        payfor: body.paymentOf || '',
        paidtext: body.paidText || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      id: payment.id,
      receiptNumber: newReceiptNumber
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ 
      error: 'Failed to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
