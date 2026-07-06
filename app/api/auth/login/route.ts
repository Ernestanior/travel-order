import { NextRequest, NextResponse } from 'next/server'

// Hardcoded users
const USERS = [
  { username: 'OP1', password: 'GSH111', name: 'Operator 1' },
  { username: 'OP2', password: 'GSH222', name: 'Operator 2' }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    const user = USERS.find(
      u => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        name: user.name
      }
    })

    // Set session cookie
    response.cookies.set('session', user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
