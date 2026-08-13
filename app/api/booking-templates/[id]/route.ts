import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - 获取单个模板
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const templateId = parseInt(params.id)
    
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }
    
    const template = await prisma.bookingTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: true,
        passengers: true
      }
    })
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

// PUT - 更新模板
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const templateId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }
    
    // 验证必填字段
    if (!body.name || !body.customer || !body.tel) {
      return NextResponse.json(
        { error: 'Template name, customer name, and tel are required' },
        { status: 400 }
      )
    }
    
    // 使用事务更新模板
    const template = await prisma.$transaction(async (tx) => {
      // 删除旧的 items 和 passengers
      await tx.bookingTemplateItem.deleteMany({
        where: { templateId }
      })
      
      await tx.bookingTemplatePassenger.deleteMany({
        where: { templateId }
      })
      
      // 更新模板并创建新的 items 和 passengers
      return await tx.bookingTemplate.update({
        where: { id: templateId },
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
    })
    
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error('Error updating template:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - 删除模板
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const templateId = parseInt(params.id)
    
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }
    
    await prisma.bookingTemplate.delete({
      where: { id: templateId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting template:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
