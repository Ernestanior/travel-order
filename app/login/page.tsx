'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plane } from 'lucide-react'
import { notification } from 'antd'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        notification.success({
          message: 'Welcome Back',
          description: `Logged in as ${data.user.name}`,
          placement: 'topRight',
        })

        router.push('/')
        router.refresh()
      } else {
        notification.error({
          message: 'Login Failed',
          description: data.error || 'Invalid credentials',
          placement: 'topRight',
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      notification.error({
        message: 'Error',
        description: 'Something went wrong',
        placement: 'topRight',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-zinc-50" strokeWidth={2} />
            </div>
            <h1 className="text-[28px] font-semibold text-zinc-900 tracking-tight leading-none">
              Travel Order
            </h1>
          </div>
          <p className="text-[15px] text-zinc-600 leading-relaxed">
            Sign in to manage bookings and orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-[13px] font-medium text-zinc-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-lg text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="Enter username"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-zinc-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-lg text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              placeholder="Enter password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:bg-zinc-400 disabled:cursor-not-allowed text-white text-[15px] font-medium rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Signing in</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-zinc-200">
          <p className="text-[13px] text-zinc-500 text-center">
            Internal use only · Contact admin for access
          </p>
        </div>
      </div>
    </div>
  )
}
