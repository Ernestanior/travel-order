import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured. Please add DATABASE_URL environment variable in Vercel.' 
      }, { status: 500 })
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
      id: customer.customer, // Using customer name as ID
      name: customer.customer,
      tel: customer.tel,
      address: customer.address || '',
      fax: customer.fax || '',
      email: '' // Not in original schema
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
