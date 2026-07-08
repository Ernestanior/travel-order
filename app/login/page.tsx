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
    <div className="min-h-[100dvh] bg-[#fafaf9] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[42%] bg-white p-12 flex-col justify-between border-r border-neutral-200/60">
        <div>
          <div className="inline-flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 bg-neutral-900 rounded-[9px] flex items-center justify-center">
              <Plane className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <div className="text-[19px] font-semibold text-neutral-900 tracking-tight">
              Travel Order
            </div>
          </div>
          
          <div className="space-y-5 max-w-[380px]">
            <h1 className="text-[36px] font-semibold text-neutral-900 tracking-tight leading-[1.15]">
              Order management
              <br />
              for travel agencies
            </h1>
            <p className="text-[15px] text-neutral-600 leading-[1.7]">
              Streamline bookings, track payments, and manage customer relationships in one place.
            </p>
          </div>
        </div>
        
        <div className="space-y-3 max-w-[380px]">
          <div className="flex items-start gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-[14px] font-medium text-neutral-900 mb-0.5">Real-time updates</div>
              <div className="text-[13px] text-neutral-600 leading-[1.6]">Instant sync across devices</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-[14px] font-medium text-neutral-900 mb-0.5">Secure by default</div>
              <div className="text-[13px] text-neutral-600 leading-[1.6]">Enterprise-grade encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <Plane className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
              </div>
              <div className="text-[18px] font-semibold text-neutral-900 tracking-tight">
                Travel Order
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-semibold text-neutral-900 tracking-tight mb-1.5">
              Sign in
            </h2>
            <p className="text-[14px] text-neutral-600">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[13px] font-medium text-neutral-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="your_username"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-[10px] transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Signing in</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-[12px] text-neutral-500 text-center">
              Internal use only · Contact administrator for access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
