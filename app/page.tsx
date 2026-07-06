'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, RefreshCw, Users, Building2, Receipt, BarChart3, LogOut, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/formatUtils'
import { notification } from 'antd'

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalExchanges: 0,
    totalRevenue: 0,
    outstandingAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading stats:', error)
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        notification.success({
          message: 'Signed Out',
          description: 'You have been signed out successfully',
          placement: 'topRight',
        })
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
      notification.error({
        message: 'Error',
        description: 'An error occurred during logout',
        placement: 'topRight',
      })
    }
  }

  const menuItems = [
    {
      href: '/booking-orders',
      icon: FileText,
      title: 'Booking Orders',
      description: '管理客户预订订单，包括航班信息、乘客数据和付款记录'
    },
    {
      href: '/exchange-orders',
      icon: RefreshCw,
      title: 'Exchange Orders',
      description: '管理机票换票订单，包括供应商信息和改签详情'
    },
    {
      href: '/customers',
      icon: Users,
      title: 'Customers',
      description: '客户信息管理，查看和编辑客户联系方式'
    },
    {
      href: '/suppliers',
      icon: Building2,
      title: 'Suppliers',
      description: '供应商（航空公司）信息管理'
    },
    {
      href: '/receipts',
      icon: Receipt,
      title: 'Payment Receipts',
      description: '查看和打印所有付款收据'
    },
    {
      href: '/reports',
      icon: BarChart3,
      title: 'Reports',
      description: '其他报表查询和打印功能'
    }
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight">Travel Order Management</h1>
            <p className="text-[13px] text-zinc-500">旅行社订单管理系统</p>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 px-4 text-[14px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.06em] mb-3">
              Booking Orders
            </div>
            <div className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {loading ? '—' : stats.totalBookings}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.06em] mb-3">
              Exchange Orders
            </div>
            <div className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {loading ? '—' : stats.totalExchanges}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.06em] mb-3">
              Outstanding
            </div>
            <div className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {loading ? '—' : formatPrice(stats.outstandingAmount)}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white border border-zinc-200 hover:border-zinc-900 rounded-xl p-6 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-[16px] font-semibold text-zinc-900 tracking-tight">
                        {item.title}
                      </h2>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" strokeWidth={2} />
                    </div>
                    <p className="text-[14px] text-zinc-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
