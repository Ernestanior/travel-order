'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { mockSuppliers } from '@/lib/mockData'
import { ArrowLeft, RefreshCw, Plus, Search, Filter, X } from 'lucide-react'

interface ExchangeOrder {
  id: number
  exchangeNumber: string
  bookingNumber: string
  supplierName: string
  agent: string
  date: string
  departureDate: string
  deptDate: string
  arrivalDate: string
  arvDate: string
  totalCost: number
  paid: number
  outstanding: number
  status: string
}

export default function ExchangeOrdersPage() {
  const [supplierSearch, setSupplierSearch] = useState('')
  const [orderNumberSearch, setOrderNumberSearch] = useState('')
  const [dateFromSearch, setDateFromSearch] = useState('')
  const [dateToSearch, setDateToSearch] = useState('')
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [exchangeOrders, setExchangeOrders] = useState<ExchangeOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 当搜索条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [supplierSearch, orderNumberSearch, dateFromSearch, dateToSearch])

  // 当页码或搜索条件变化时加载数据
  useEffect(() => {
    loadOrders()
  }, [currentPage, supplierSearch, orderNumberSearch, dateFromSearch, dateToSearch])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (supplierSearch) params.set('supplier', supplierSearch)
      if (orderNumberSearch) params.set('orderNumber', orderNumberSearch)
      if (dateFromSearch) params.set('dateFrom', dateFromSearch)
      if (dateToSearch) params.set('dateTo', dateToSearch)
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())

      const response = await fetch(`/api/exchange-orders?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setExchangeOrders(result.data)
        setTotalRecords(result.pagination?.total || result.data.length)
      } else if (Array.isArray(result)) {
        setExchangeOrders(result)
        setTotalRecords(result.length)
      } else {
        setExchangeOrders([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setExchangeOrders([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // 后端分页，直接使用返回的数据
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = exchangeOrders // 后端已经分页，直接使用

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

  // 供应商模糊搜索
  const matchedSuppliers = useMemo(() => {
    if (!supplierSearch) return []
    return mockSuppliers.filter(s =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase())
    ).slice(0, 5)
  }, [supplierSearch])

  const handleSupplierSelect = (supplierName: string) => {
    setSupplierSearch(supplierName)
    setShowSupplierDropdown(false)
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
            <h1 className="text-2xl font-semibold text-gray-900">Exchange Orders</h1>
            <Link href="/exchange-orders/new" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Exchange
            </Link>
          </div>
        </div>

        {/* 搜索区域 - Exchange Inquiry (Supplier) */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Exchange Inquiry (Supplier)</h3>

          <div className="space-y-4">
            {/* Supplier 搜索 */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-32">Supplier:</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value)
                      setShowSupplierDropdown(true)
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    placeholder="Type supplier name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  {supplierSearch && (
                    <button
                      onClick={() => {
                        setSupplierSearch('')
                        setShowSupplierDropdown(false)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* 供应商下拉列表 */}
                  {showSupplierDropdown && matchedSuppliers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                      {matchedSuppliers.map((supplier) => (
                        <button
                          key={supplier.id}
                          onClick={() => handleSupplierSelect(supplier.name)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors"
                        >
                          {supplier.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exchange # / Booking # 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Exchange # / Booking #:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={orderNumberSearch}
                  onChange={(e) => setOrderNumberSearch(e.target.value)}
                  placeholder="Type exchange or booking number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {orderNumberSearch && (
                  <button
                    onClick={() => setOrderNumberSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Range 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Departure Date:</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="date"
                  value={dateFromSearch}
                  onChange={(e) => setDateFromSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="From"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="date"
                  value={dateToSearch}
                  onChange={(e) => setDateToSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="To"
                />
                {(dateFromSearch || dateToSearch) && (
                  <button
                    onClick={() => {
                      setDateFromSearch('')
                      setDateToSearch('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 显示筛选结果统计 */}
          {(supplierSearch || orderNumberSearch || dateFromSearch || dateToSearch) && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              {loading ? 'Loading...' : (
                <>Found <span className="font-semibold text-gray-900">{totalRecords}</span> exchange order(s) • Showing page {currentPage} of {totalPages}</>
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
                    Exchange #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Dept Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Arv Date
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Booking #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3">Loading exchange orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : exchangeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No exchange orders found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/exchange-orders/${order.id}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.exchangeNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.agent || order.supplierName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {order.deptDate || order.departureDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {order.arvDate || order.arrivalDate || '-'}
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.bookingNumber}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页控制 */}
          {!loading && exchangeOrders.length > 0 && (
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

          {!loading && exchangeOrders.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
              Click on any row to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
