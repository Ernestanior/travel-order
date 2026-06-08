import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    let where: any = {}

    if (search) {
      where.supplier = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // 并行执行 count 和 findMany 以提升性能
    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        orderBy: {
          supplier: 'asc'
        },
        skip,
        take: limit
      })
    ])

    const formatted = suppliers.map(supplier => ({
      id: supplier.supplier,
      name: supplier.supplier,
      telephone: supplier.tel || '',
      tel: supplier.tel || '',
      address: supplier.address || '',
      fax: supplier.fax || ''
    }))

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch suppliers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
