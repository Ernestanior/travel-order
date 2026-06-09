import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取下一个 Receipt No
export async function GET() {
  try {
    const { prisma } = await import('@/lib/db')
    
    // 查询最大的 receiptno（只查询数字型的）
    const result = await prisma.$queryRaw<any[]>`
      SELECT receiptno
      FROM booking_payment_data
      WHERE receiptno ~ '^[0-9]+$'
      ORDER BY CAST(receiptno AS INTEGER) DESC
      LIMIT 1
    `
    
    let nextReceiptNo = '1000001' // 默认起始编号
    
    if (result.length > 0 && result[0].receiptno) {
      const currentMax = parseInt(result[0].receiptno)
      nextReceiptNo = (currentMax + 1).toString()
    }
    
    return NextResponse.json({ 
      nextReceiptNo,
      success: true
    })
  } catch (error) {
    console.error('Error getting next receipt no:', error)
    // 如果出错，返回默认值
    return NextResponse.json({ 
      nextReceiptNo: '1000001',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
