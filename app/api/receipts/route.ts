import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const receiptNo = searchParams.get('receiptNo') || ''
    const bookingNumber = searchParams.get('bookingNumber') || ''
    const customer = searchParams.get('customer') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (receiptNo) {
      where.receiptno = {
        contains: receiptNo,
        mode: 'insensitive'
      }
    }

    if (bookingNumber) {
      where.bookno = {
        contains: bookingNumber,
        mode: 'insensitive'
      }
    }

    if (customer) {
      where.customer = {
        contains: customer,
        mode: 'insensitive'
      }
    }

    if (dateFrom || dateTo) {
      where.receiptdate = {}
      if (dateFrom) {
        where.receiptdate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.receiptdate.lte = new Date(dateTo)
      }
    }

    // 获取总数
    const total = await prisma.bookingPaymentData.count({ where })

    // 获取分页数据
    const receipts = await prisma.bookingPaymentData.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        receiptdate: 'desc'
      },
      include: {
        booking: {
          select: {
            bookno: true,
            customerData: {
              select: {
                customer: true
              }
            }
          }
        }
      }
    })

    // 格式化数据
    const formattedReceipts = receipts.map((receipt) => ({
      id: receipt.id,
      receiptNo: receipt.receiptno || '',
      bookingNumber: receipt.bookno || '',
      receiptDate: receipt.receiptdate ? receipt.receiptdate.toISOString().split('T')[0] : '',
      paymentType: receipt.paytype || '',
      for: receipt.for || '',
      chequeNo: receipt.chequeno || '',
      visaNo: receipt.visano || '',
      amountPaid: receipt.amountpaid ? parseFloat(receipt.amountpaid.toString()) : 0,
      paidText: receipt.paidtext || '',
      customer: receipt.customer || (receipt.booking?.customerData?.customer) || '',
      payFor: receipt.payfor || ''
    }))

    return NextResponse.json({
      data: formattedReceipts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
