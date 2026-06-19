import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - 获取单个供应商
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const supplierName = decodeURIComponent(params.name)

    const supplier = await prisma.supplier.findUnique({
      where: { supplier: supplierName }
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: supplier.supplier,
      name: supplier.supplier,
      tel: supplier.tel || '',
      telephone: supplier.tel || '',
      fax: supplier.fax || '',
      address: supplier.address || '',
      email: supplier.email || ''
    })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch supplier',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - 更新供应商
export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const supplierName = decodeURIComponent(params.name)
    const body = await request.json()

    // 检查供应商是否存在
    const existing = await prisma.supplier.findUnique({
      where: { supplier: supplierName }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // 更新供应商
    const supplier = await prisma.supplier.update({
      where: { supplier: supplierName },
      data: {
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
    console.error('Error updating supplier:', error)
    return NextResponse.json({ 
      error: 'Failed to update supplier',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - 删除供应商
export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { prisma } = await import('@/lib/db')
    const supplierName = decodeURIComponent(params.name)

    // 检查供应商是否存在
    const existing = await prisma.supplier.findUnique({
      where: { supplier: supplierName }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // 检查是否有关联的exchange orders
    const exchangeCount = await prisma.exchangeData.count({
      where: { supplier: supplierName }
    })

    if (exchangeCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete supplier. ${exchangeCount} exchange order(s) are associated with this supplier.` 
      }, { status: 400 })
    }

    // 删除供应商
    await prisma.supplier.delete({
      where: { supplier: supplierName }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json({ 
      error: 'Failed to delete supplier',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
