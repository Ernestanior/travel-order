'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, Receipt, Printer, FileDown } from 'lucide-react'
import { generateReceiptPDF } from '@/lib/pdfGenerator'

interface ReceiptData {
  id: number
  receiptNo: string
  bookingNumber: string
  receiptDate: string
  paymentType: string
  'for': string
  chequeNo: string
  visaNo: string
  amountPaid: number
  paidText: string
  customer: string
  payFor: string
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 搜索过滤
  const [receiptNoSearch, setReceiptNoSearch] = useState('')
  const [bookingNumberSearch, setBookingNumberSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // 初始加载
  useEffect(() => {
    loadReceipts()
  }, [])

  // 当页码变化时加载数据
  useEffect(() => {
    if (currentPage > 1) {
      loadReceipts()
    }
  }, [currentPage])

  // 当搜索条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [receiptNoSearch, bookingNumberSearch, customerSearch, dateFrom, dateTo])

  const loadReceipts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())

      if (receiptNoSearch) params.set('receiptNo', receiptNoSearch)
      if (bookingNumberSearch) params.set('bookingNumber', bookingNumberSearch)
      if (customerSearch) params.set('customer', customerSearch)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/receipts?${params}`)
      const result = await response.json()

      if (result.data && Array.isArray(result.data)) {
        setReceipts(result.data)
        setTotalRecords(result.pagination?.total || result.data.length)
      } else {
        setReceipts([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading receipts:', error)
      setReceipts([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // 执行搜索
  const handleSearch = () => {
    setCurrentPage(1)
    loadReceipts()
  }

  // 清空筛选
  const clearFilters = () => {
    setReceiptNoSearch('')
    setBookingNumberSearch('')
    setCustomerSearch('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
    setTimeout(() => {
      loadReceipts()
    }, 0)
  }

  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

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

  // 查看收据详情 - 跳转到对应的Booking Order详情页
  const handleViewReceipt = (bookingNumber: string, receiptId: number) => {
    if (bookingNumber) {
      // 需要先获取booking ID，暂时先跳转到booking列表让用户手动查找
      // TODO: 可以改进为直接跳转到对应的booking详情页
      window.location.href = `/booking-orders`
    }
  }

  const handleExportReceipt = (receipt: ReceiptData, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止行点击事件
    
    generateReceiptPDF({
      receiptNo: receipt.receiptNo,
      bookingNumber: receipt.bookingNumber,
      date: receipt.receiptDate,
      customer: receipt.customer,
      paymentType: receipt.paymentType,
      'for': receipt['for'],
      amount: receipt.amountPaid,
      chequeNo: receipt.chequeNo,
      visaNo: receipt.visaNo,
      paidText: receipt.paidText
    })
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Payment Receipts</h1>
              <p className="text-sm text-gray-500 mt-1">View and print all payment receipts</p>
            </div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Search & Filters</h3>

          <div className="space-y-3">
            {/* Receipt Number 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Receipt #:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={receiptNoSearch}
                  onChange={(e) => setReceiptNoSearch(e.target.value)}
                  placeholder="Type receipt number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {receiptNoSearch && (
                  <button
                    onClick={() => setReceiptNoSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Booking Number 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Booking #:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={bookingNumberSearch}
                  onChange={(e) => setBookingNumberSearch(e.target.value)}
                  placeholder="Type booking number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {bookingNumberSearch && (
                  <button
                    onClick={() => setBookingNumberSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Customer 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Customer:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Type customer name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {customerSearch && (
                  <button
                    onClick={() => setCustomerSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Range 搜索 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-32">Date Range:</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setDateFrom('')
                      setDateTo('')
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 搜索和清空按钮 */}
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

          {/* 显示搜索结果统计 */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            {loading ? 'Loading...' : (
              <>Found <span className="font-semibold text-gray-900">{totalRecords}</span> receipt(s) • Showing page {currentPage} of {totalPages}</>
            )}
          </div>
        </div>

        {/* Receipts 表格 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Receipt #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Booking #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Payment Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    For
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Cheque / Visa No
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3">Loading receipts...</span>
                      </div>
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No receipts found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {receipt.receiptNo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {receipt.bookingNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {receipt.receiptDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {receipt.customer}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {receipt.paymentType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {receipt['for']}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${receipt.amountPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {receipt.chequeNo || receipt.visaNo || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => handleExportReceipt(receipt, e)}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          <FileDown className="w-3 h-3" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页控制 */}
          {!loading && receipts.length > 0 && (
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

          {!loading && receipts.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
              Click on any row to view related booking order
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
