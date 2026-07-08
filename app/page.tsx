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
    <div className="min-h-[100dvh] bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-neutral-200/60 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div>
            <div className="text-[16px] font-semibold text-neutral-900 tracking-tight">Travel Order</div>
            <div className="text-[12px] text-neutral-600">Management System</div>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 px-3.5 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-10">
          <div className="bg-white border border-neutral-200/60 rounded-[14px] p-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-[0.08em] mb-2.5">
              Booking Orders
            </div>
            <div className="text-[32px] font-semibold text-neutral-900 tracking-tight leading-none">
              {loading ? '—' : stats.totalBookings.toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-neutral-200/60 rounded-[14px] p-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-[0.08em] mb-2.5">
              Exchange Orders
            </div>
            <div className="text-[32px] font-semibold text-neutral-900 tracking-tight leading-none">
              {loading ? '—' : stats.totalExchanges.toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-neutral-200/60 rounded-[14px] p-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-[0.08em] mb-2.5">
              Outstanding
            </div>
            <div className="text-[32px] font-semibold text-neutral-900 tracking-tight leading-none">
              {loading ? '—' : formatPrice(stats.outstandingAmount)}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white border border-neutral-200/60 hover:border-neutral-900 rounded-[14px] p-5 transition-all"
              >
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-all">
                    <Icon className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                </div>
                
                <h2 className="text-[16px] font-semibold text-neutral-900 mb-1.5 tracking-tight">
                  {item.title}
                </h2>
                <p className="text-[13px] text-neutral-600 leading-[1.6]">
                  {item.description}
                </p>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
