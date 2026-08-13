import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - 获取所有模板
export async function GET() {
  try {
    const { prisma } = await import('@/lib/db')
    
    const templates = await prisma.bookingTemplate.findMany({
      include: {
        items: true,
        passengers: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST - 创建新模板
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    // 验证必填字段
    if (!body.name || !body.customer || !body.tel) {
      return NextResponse.json(
        { error: 'Template name, customer name, and tel are required' },
        { status: 400 }
      )
    }
    
    // 创建模板
    const template = await prisma.bookingTemplate.create({
      data: {
        name: body.name,
        description: body.description || null,
        customer: body.customer,
        tel: body.tel,
        address: body.address || null,
        email: body.email || null,
        discount: body.discount || 0,
        staff: body.staff || null,
        tourcode: body.tourcode || null,
        tour: body.tour || null,
        special: body.special || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            item: item.item,
            quantity: item.quantity || 0,
            unitprice: item.unitprice || 0,
            price: item.price || 0
          }))
        },
        passengers: {
          create: (body.passengers || []).map((passenger: any) => ({
            paxname: passenger.paxname,
            passport: passenger.passport || null,
            birthdate: passenger.birthdate ? new Date(passenger.birthdate) : null,
            passport_expiry_date: passenger.passport_expiry_date 
              ? new Date(passenger.passport_expiry_date) 
              : null
          }))
        }
      },
      include: {
        items: true,
        passengers: true
      }
    })
    
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error('Error creating template:', error)
    
    // 检查唯一约束错误
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
