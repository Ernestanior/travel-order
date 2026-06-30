import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取下一个 Receipt No (格式: R100001, R100002, ...)
export async function GET() {
  try {
    const { prisma } = await import('@/lib/db')
    
    // 查询最大的 ID
    const maxPayment = await prisma.bookingPaymentData.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    })
    
    let nextNumber = 100001 // 默认起始编号
    if (maxPayment && maxPayment.id) {
      nextNumber = maxPayment.id + 1
    }
    
    const nextReceiptNo = `R${nextNumber}`
    
    return NextResponse.json({ 
      nextReceiptNo,
      success: true
    })
  } catch (error) {
    console.error('Error getting next receipt no:', error)
    // 如果出错，返回默认值
    return NextResponse.json({ 
      nextReceiptNo: 'R100001',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
