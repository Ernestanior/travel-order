import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}
