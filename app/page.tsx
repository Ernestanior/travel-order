'use client'

import Link from 'next/link'
import { mockBookingOrders, mockExchangeOrders } from '@/lib/mockData'
import { Plane, FileText, RefreshCw, Users, Building2 } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-2">
            <Plane className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Main Menu</h1>
          </div>
          <p className="text-gray-600">旅行社订单管理系统</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Booking Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <FileText className="w-9 h-9 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Exchange Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalExchanges}</p>
              </div>
              <RefreshCw className="w-9 h-9 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Paid</p>
                <p className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Outstanding</p>
                <p className="text-xl font-bold text-red-600">${outstandingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主菜单选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/booking-orders"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-3">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Booking Order</h2>
            </div>
            <p className="text-gray-600 text-sm">
              管理客户预订订单，包括航班信息、乘客数据和付款记录
            </p>
          </Link>

          <Link
            href="/exchange-orders"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center mb-3">
              <RefreshCw className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Exchange Order</h2>
            </div>
            <p className="text-gray-600 text-sm">
              管理机票换票订单，包括供应商信息和改签详情
            </p>
          </Link>

          <Link
            href="/customers"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-3">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Customer</h2>
            </div>
            <p className="text-gray-600 text-sm">
              客户信息管理，查看和编辑客户联系方式
            </p>
          </Link>

          <Link
            href="/suppliers"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-orange-500"
          >
            <div className="flex items-center mb-3">
              <Building2 className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Supplier</h2>
            </div>
            <p className="text-gray-600 text-sm">
              供应商（航空公司）信息管理
            </p>
          </Link>

          <Link
            href="/passenger-inquiry"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-teal-500"
          >
            <div className="flex items-center mb-3">
              <Users className="w-8 h-8 text-teal-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Passenger Inquiry</h2>
            </div>
            <p className="text-gray-600 text-sm">
              按客户名搜索所有乘客信息
            </p>
          </Link>

          <Link
            href="/reports"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center mb-3">
              <FileText className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Reports / Printouts</h2>
            </div>
            <p className="text-gray-600 text-sm">
              其他报表查询和打印功能
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
