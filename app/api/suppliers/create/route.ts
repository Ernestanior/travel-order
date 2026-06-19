import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - 创建新供应商
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    // 检查供应商是否已存在
    const existing = await prisma.supplier.findUnique({
      where: { supplier: body.name }
    })

    if (existing) {
      return NextResponse.json({ error: 'Supplier already exists' }, { status: 400 })
    }

    // 创建供应商
    const supplier = await prisma.supplier.create({
      data: {
        supplier: body.name,
        tel: body.tel || null,
        fax: body.fax || null,
        address: body.address || null,
        email: body.email || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      supplier: {
        id: supplier.supplier,
        name: supplier.supplier,
        tel: supplier.tel || '',
        fax: supplier.fax || '',
        address: supplier.address || '',
        email: supplier.email || ''
      }
    })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json({ 
      error: 'Failed to create supplier',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
