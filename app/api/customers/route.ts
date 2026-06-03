import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
