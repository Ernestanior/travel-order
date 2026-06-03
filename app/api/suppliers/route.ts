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

    let where: any = {}

    if (search) {
      where.supplier = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: {
        supplier: 'asc'
      },
      take: 100
    })

    const formatted = suppliers.map(supplier => ({
      id: supplier.supplier,
      name: supplier.supplier,
      telephone: supplier.tel || '',
      tel: supplier.tel || '',
      address: supplier.address || '',
      fax: supplier.fax || ''
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch suppliers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
