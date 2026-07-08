import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取下一个 Receipt No (格式: R100001, R100002, ...)
export async function GET() {
  try {
    const { prisma } = await import('@/lib/db')
    
    // 查询最大的 Receipt Number
    // 使用原生 SQL 来获取最大的 receiptno 数字部分
    const result = await prisma.$queryRaw<Array<{ max_receipt: string | null }>>`
      SELECT MAX(receiptno) as max_receipt 
      FROM booking_payment_data
      WHERE receiptno LIKE 'R%'
    `
    
    let nextNumber = 100001 // 默认起始编号
    
    if (result && result.length > 0 && result[0].max_receipt) {
      // 从 receiptno 中提取数字部分 (例如: R100005 -> 100005)
      const maxReceiptNo = result[0].max_receipt
      const numericPart = maxReceiptNo.replace(/\D/g, '') // 移除所有非数字字符
      
      if (numericPart) {
        const currentNumber = parseInt(numericPart, 10)
        nextNumber = currentNumber + 1
      }
    }
    
    const nextReceiptNo = `R${nextNumber}`
    
    return NextResponse.json({ 
      nextReceiptNo,
      success: true,
      debug: {
        maxReceiptFound: result && result.length > 0 ? result[0].max_receipt : null,
        nextNumber
      }
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
