'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { mockCustomers } from '@/lib/mockData'
import { ArrowLeft, FileText, Plus, Search, Filter, X } from 'lucide-react'

interface BookingOrder {
  id: number
  bookingNumber: string
  customerName: string
  date: string
  departureDate: string
  arrivalDate: string
  totalCost: number
  paid: number
  outstanding: number
  status: string
  tour: string
  passengers: { name: string; passport: string }[]
  passengerNames: string
}

export default function BookingOrdersPage() {
  const [searchType, setSearchType] = useState<'all' | 'date' | 'outstanding' | 'customer'>('all')
  const [departureDate, setDepartureDate] = useState('')
  const [outstandingBeforeDate, setOutstandingBeforeDate] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [bookingOrders, setBookingOrders] = useState<BookingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 初始加载
  useEffect(() => {
    loadOrders()
  }, [])

  // 当页码变化时加载数据
  useEffect(() => {
    if (currentPage > 1) {
      loadOrders()
    }
  }, [currentPage])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('searchType', searchType)
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())
      
      if (searchType === 'date' && departureDate) {
        params.set('departureDate', departureDate)
      } else if (searchType === 'outstanding' && outstandingBeforeDate) {
        params.set('outstandingBeforeDate', outstandingBeforeDate)
      } else if (searchType === 'customer' && customerSearch) {
        params.set('customer', customerSearch)
      }

      const response = await fetch(`/api/booking-orders?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setBookingOrders(result.data)
        setTotalRecords(result.pagination?.total || result.data.length)
      } else if (Array.isArray(result)) {
        setBookingOrders(result)
        setTotalRecords(result.length)
      } else {
        // 如果返回的不是数组，设置为空数组
        setBookingOrders([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setBookingOrders([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // 执行搜索
  const handleSearch = () => {
    setCurrentPage(1)
    loadOrders()
  }

  // 清空筛选
  const clearFilters = () => {
    setSearchType('all')
    setDepartureDate('')
    setOutstandingBeforeDate('')
    setCustomerSearch('')
    setCurrentPage(1)
    // 需要延迟一下让状态更新
    setTimeout(() => {
      loadOrders()
    }, 0)
  }

  const filteredOrders = bookingOrders

  // 后端分页，直接使用返回的数据
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = bookingOrders // 后端已经分页，直接使用

  // 分页控制
  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 头部 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Main Menu
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Booking Orders</h1>
            <Link 
              href="/booking-orders/new"
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Search & Filters</h3>

          {/* 搜索类型选择 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => clearFilters()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSearchType('date')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'date'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              By Departure Date
            </button>
            <button
              onClick={() => setSearchType('outstanding')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'outstanding'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Outstanding (Before Date)
            </button>
            <button
              onClick={() => setSearchType('customer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'customer'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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

          {/* 搜索和清空按钮 */}
          {searchType !== 'all' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          )}

          {/* 显示筛选结果统计 */}
          {searchType !== 'all' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              {loading ? 'Loading...' : (
                <>Found <span className="font-semibold text-gray-900">{totalRecords}</span> order(s) • Showing page {currentPage} of {totalPages}</>
              )}
            </div>
          )}
        </div>

        {/* 订单表格 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Booking #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Depart Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Arrival Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Outstanding
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No orders found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/booking-orders/${order.id}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.bookingNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {order.departureDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {order.arrivalDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${order.totalCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${order.paid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                      <span className={order.outstanding > 0 ? 'text-gray-900' : 'text-gray-400'}>
                        ${order.outstanding.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          order.status === 'Close'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-gray-900 text-white'
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

          {/* 分页控制 */}
          {!loading && bookingOrders.length > 0 && (
            <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of{' '}
                <span className="font-medium">{totalRecords}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page as number)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!loading && bookingOrders.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
              Click on any row to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
