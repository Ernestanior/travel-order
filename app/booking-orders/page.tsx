'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockBookingOrders, mockCustomers } from '@/lib/mockData'
import { ArrowLeft, FileText, Plus, Search, Filter, X } from 'lucide-react'

export default function BookingOrdersPage() {
  const [searchType, setSearchType] = useState<'all' | 'date' | 'outstanding' | 'customer'>('all')
  const [departureDate, setDepartureDate] = useState('')
  const [outstandingBeforeDate, setOutstandingBeforeDate] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // 筛选订单
  const filteredOrders = useMemo(() => {
    let orders = mockBookingOrders

    if (searchType === 'date' && departureDate) {
      // Booking Inquiry (Departure) - 按出发日期搜索
      orders = orders.filter(order => order.departureDate === departureDate)
    } else if (searchType === 'outstanding' && outstandingBeforeDate) {
      // Outstanding Transactions Report: Before Departure - 出发日期之前且未付清的订单
      orders = orders.filter(order => {
        const hasOutstanding = order.outstanding > 0
        const beforeDate = order.departureDate && order.departureDate <= outstandingBeforeDate
        return hasOutstanding && beforeDate
      })
    } else if (searchType === 'customer' && customerSearch) {
      // Outstanding Transactions Report: By Customer - 按客户名搜索
      orders = orders.filter(order => 
        order.customerName.toLowerCase().includes(customerSearch.toLowerCase())
      )
    }

    return orders
  }, [searchType, departureDate, outstandingBeforeDate, customerSearch])

  // 客户名模糊搜索
  const matchedCustomers = useMemo(() => {
    if (!customerSearch) return []
    return mockCustomers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 5)
  }, [customerSearch])

  const handleCustomerSelect = (customerName: string) => {
    setCustomerSearch(customerName)
    setShowCustomerDropdown(false)
  }

  const clearFilters = () => {
    setSearchType('all')
    setDepartureDate('')
    setOutstandingBeforeDate('')
    setCustomerSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Main Menu
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Booking Order</h1>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center text-sm">
              <Plus className="w-4 h-4 mr-1" />
              New Booking
            </button>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Search & Reports</h3>
          </div>

          {/* 搜索类型选择 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <button
              onClick={() => clearFilters()}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                searchType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSearchType('date')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                searchType === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Departure Date
            </button>
            <button
              onClick={() => setSearchType('outstanding')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                searchType === 'outstanding'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Outstanding (Before Date)
            </button>
            <button
              onClick={() => setSearchType('customer')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                searchType === 'customer'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Customer
            </button>
          </div>

          {/* 搜索输入区域 */}
          {searchType === 'date' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Departure Date:</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              {departureDate && (
                <button
                  onClick={() => setDepartureDate('')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {searchType === 'outstanding' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Before Date:</label>
              <input
                type="date"
                value={outstandingBeforeDate}
                onChange={(e) => setOutstandingBeforeDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              {outstandingBeforeDate && (
                <button
                  onClick={() => setOutstandingBeforeDate('')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs text-gray-500 ml-2">
                (Shows unpaid orders departing before this date)
              </span>
            </div>
          )}

          {searchType === 'customer' && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-32">Customer:</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Type customer name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => {
                        setCustomerSearch('')
                        setShowCustomerDropdown(false)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* 客户下拉列表 */}
                  {showCustomerDropdown && matchedCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                      {matchedCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer.name)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                        >
                          {customer.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 显示筛选结果统计 */}
          {searchType !== 'all' && (
            <div className="mt-3 text-sm text-gray-600">
              Found <span className="font-bold text-blue-600">{filteredOrders.length}</span> order(s)
            </div>
          )}
        </div>

        {/* 订单表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Booking #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Depart Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Arrival Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No orders found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/booking-orders/${order.id}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.bookingNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.departureDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.arrivalDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${order.totalCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                      ${order.paid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                      <span className={order.outstanding > 0 ? 'text-red-600' : 'text-gray-500'}>
                        ${order.outstanding.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                          order.status === 'Close'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            N/B: Double-click on entry to view details.
          </div>
        </div>
      </div>
    </div>
  )
}
