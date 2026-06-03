'use client'

import Link from 'next/link'
import { mockBookingOrders, mockExchangeOrders } from '@/lib/mockData'
import { FileText, RefreshCw, Users, Building2, Search, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const totalBookings = mockBookingOrders.length
  const totalExchanges = mockExchangeOrders.length
  const totalRevenue = [...mockBookingOrders, ...mockExchangeOrders].reduce(
    (sum, order) => sum + order.paid,
    0
  )
  const outstandingAmount = [...mockBookingOrders, ...mockExchangeOrders].reduce(
    (sum, order) => sum + order.outstanding,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Travel Order Management</h1>
          <p className="text-sm text-gray-500">旅行社订单管理系统</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Booking Orders</div>
            <div className="text-2xl font-semibold text-gray-900">{totalBookings}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Exchange Orders</div>
            <div className="text-2xl font-semibold text-gray-900">{totalExchanges}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Paid</div>
            <div className="text-2xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Outstanding</div>
            <div className="text-2xl font-semibold text-gray-900">${outstandingAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* 主菜单选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/booking-orders"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <FileText className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Booking Order</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  管理客户预订订单，包括航班信息、乘客数据和付款记录
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/exchange-orders"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Exchange Order</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  管理机票换票订单，包括供应商信息和改签详情
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/customers"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <Users className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Customer</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  客户信息管理，查看和编辑客户联系方式
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/suppliers"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <Building2 className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Supplier</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  供应商（航空公司）信息管理
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/passenger-inquiry"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <Search className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Passenger Inquiry</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  按客户名搜索所有乘客信息
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Reports / Printouts</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  其他报表查询和打印功能
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
