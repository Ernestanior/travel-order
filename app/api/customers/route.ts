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
      where.customer = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        customer: 'asc'
      },
      take: 100
    })

    const formatted = customers.map(customer => ({
      id: customer.customer,
      name: customer.customer,
      tel: customer.tel,
      address: customer.address || '',
      fax: customer.fax || '',
      email: ''
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
