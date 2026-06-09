import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id)

    // 首先获取booking的bookno
    const booking = await prisma.bookingData.findUnique({
      where: { id: bookingId },
      select: { bookno: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 根据bookno获取所有相关的exchange orders
    const exchanges = await prisma.exchangeData.findMany({
      where: {
        bookno: booking.bookno
      },
      include: {
        payments: true,
        supplierData: {
          select: {
            supplier: true
          }
        },
        items: true
      },
      orderBy: {
        exchangedate: 'desc'
      }
    })

    // 格式化数据
    const formattedExchanges = exchanges.map((exchange) => {
      // 计算总金额
      const totalAmount = exchange.items.reduce((sum, item) => 
        sum + Number(item.price || 0), 0
      )

      // 获取支付信息
      const totalPaid = exchange.payments.reduce((sum, payment) => 
        sum + Number(payment.amountpaid || 0), 0
      )

      // 获取最新的支付记录信息
      const latestPayment = exchange.payments.length > 0 
        ? exchange.payments[exchange.payments.length - 1]
        : null

      return {
        exchangeno: exchange.exchangeno,
        supplier: exchange.supplier || '',
        paidDate: latestPayment?.receiptdate 
          ? latestPayment.receiptdate.toISOString().split('T')[0] 
          : exchange.exchangedate?.toISOString().split('T')[0] || '',
        paymentMode: latestPayment?.paytype || 'N/A',
        amount: totalAmount,
        paid: totalPaid,
        outstanding: totalAmount - totalPaid
      }
    })

    return NextResponse.json({
      data: formattedExchanges
    })
  } catch (error) {
    console.error('Error fetching exchange orders:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch exchange orders', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
