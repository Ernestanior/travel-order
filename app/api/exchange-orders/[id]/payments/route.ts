import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET - 获取exchange order的所有payments
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exchangeId = parseInt(params.id)

    // 获取exchange order的exchangeno
    const exchange = await prisma.exchangeData.findUnique({
      where: { id: exchangeId },
      select: { exchangeno: true }
    })

    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 })
    }

    const payments = await prisma.exchangePaymentData.findMany({
      where: {
        exchangeno: exchange.exchangeno
      },
      orderBy: {
        receiptdate: 'desc'
      }
    })

    const formatted = payments.map(payment => ({
      id: payment.id,
      receiptdate: payment.receiptdate?.toISOString().split('T')[0] || '',
      paytype: payment.paytype || 'N/A',
      chequeno: payment.chequeno || '',
      amountpaid: parseFloat(payment.amountpaid?.toString() || '0'),
      remarks: payment.remarks || '',
      issue: payment.issue || '',
      paidtext: payment.paidtext || ''
    }))

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 添加新的payment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exchangeId = parseInt(params.id)
    const body = await request.json()

    // 获取exchange order
    const exchange = await prisma.exchangeData.findUnique({
      where: { id: exchangeId },
      select: { exchangeno: true, bookno: true }
    })

    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 })
    }

    // 创建payment记录
    const payment = await prisma.exchangePaymentData.create({
      data: {
        exchangeno: exchange.exchangeno,
        bookno: body.bookno || exchange.bookno,
        receiptdate: body.receiptDate ? new Date(body.receiptDate) : new Date(),
        paytype: body.paytype || 'Cash',
        chequeno: body.chequeno || null,
        amountpaid: parseFloat(body.amountpaid) || 0,
        remarks: body.remarks || null,
        issue: body.issue || null,
        paidtext: body.paidtext || null
      }
    })
    
    // 计算outstanding并更新status
    const fullExchange = await prisma.exchangeData.findUnique({
      where: { id: exchangeId },
      include: {
        items: true,
        payments: true
      }
    })
    
    if (fullExchange) {
      const totalCost = fullExchange.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )
      const discount = Number(fullExchange.discount || 0)
      const paid = fullExchange.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )
      const outstanding = (totalCost - discount) - paid
      
      // 如果outstanding <= 0，自动设置status为Close
      if (outstanding <= 0.001) {
        await prisma.exchangeData.update({
          where: { id: exchangeId },
          data: { status: 'Close' }
        })
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        receiptdate: payment.receiptdate?.toISOString().split('T')[0] || '',
        paytype: payment.paytype,
        amountpaid: parseFloat(payment.amountpaid?.toString() || '0')
      }
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
