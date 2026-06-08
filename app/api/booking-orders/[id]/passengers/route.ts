import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 添加乘客
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
    
    // 创建乘客
    await prisma.passengerData.create({
      data: {
        bookno: booking.bookno,
        paxname: body.name,
        passport: body.passport || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating passenger:', error)
    return NextResponse.json({ 
      error: 'Failed to create passenger',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - 删除乘客
export async function DELETE(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const { searchParams } = new URL(request.url)
    const bookno = searchParams.get('bookno')
    const paxname = searchParams.get('paxname')
    
    if (!bookno || !paxname) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    await prisma.passengerData.delete({
      where: {
        bookno_paxname: {
          bookno,
          paxname
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting passenger:', error)
    return NextResponse.json({ 
      error: 'Failed to delete passenger',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
