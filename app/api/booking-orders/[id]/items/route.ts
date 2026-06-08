import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 添加 item
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
    
    // 创建 item
    await prisma.itemData.create({
      data: {
        bookno: booking.bookno,
        item: body.item,
        quantity: body.quantity || 1,
        unitprice: body.unitPrice || 0,
        price: body.price || 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ 
      error: 'Failed to create item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - 删除 item
export async function DELETE(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const { searchParams } = new URL(request.url)
    const bookno = searchParams.get('bookno')
    const item = searchParams.get('item')
    
    if (!bookno || !item) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    await prisma.itemData.delete({
      where: {
        bookno_item: {
          bookno,
          item
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ 
      error: 'Failed to delete item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
