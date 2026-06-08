import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 一次性使用的管理端点，用于添加 email 字段
export async function POST(request: Request) {
  try {
    const { prisma } = await import('@/lib/db')
    
    // 检查 email 列是否已存在
    const checkResult = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customer_data' 
      AND column_name = 'email'
    `
    
    if (checkResult.length > 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Email column already exists',
        alreadyExists: true
      })
    }
    
    // 添加 email 列
    await prisma.$executeRaw`
      ALTER TABLE customer_data 
      ADD COLUMN email VARCHAR(255)
    `
    
    // 验证
    const verifyResult = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'customer_data'
      ORDER BY ordinal_position
    `
    
    return NextResponse.json({ 
      success: true,
      message: 'Email column added successfully',
      columns: verifyResult.map(col => ({
        name: col.column_name,
        type: col.data_type,
        maxLength: col.character_maximum_length
      }))
    })
  } catch (error) {
    console.error('Error adding email column:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add email column',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
