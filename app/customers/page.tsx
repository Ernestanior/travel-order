'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Search } from 'lucide-react'

interface Customer {
  id: string
  name: string
  tel: string
  address: string
  fax: string
  email: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 当搜索条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // 当页码或搜索条件变化时加载数据
  useEffect(() => {
    loadCustomers()
  }, [currentPage, searchTerm])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())
      
      const response = await fetch(`/api/customers?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setCustomers(result.data)
        setTotalRecords(result.pagination?.total || result.data.length)
      } else if (Array.isArray(result)) {
        setCustomers(result)
        setTotalRecords(result.length)
      } else {
        setCustomers([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // 后端分页，直接使用返回的数据
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = customers // 后端已经分页，直接使用

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
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        </div>

        {/* 客户列表 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading customers...</span>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No customers found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {currentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{customer.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {customer.tel && (
                        <div>
                          <span className="font-medium text-gray-500">Tel:</span> {customer.tel}
                        </div>
                      )}
                      {customer.address && (
                        <div>
                          <span className="font-medium text-gray-500">Address:</span> {customer.address}
                        </div>
                      )}
                      {customer.fax && (
                        <div>
                          <span className="font-medium text-gray-500">Fax:</span> {customer.fax}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页控制 */}
              <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of{' '}
                  <span className="font-medium">{totalRecords}</span> customers
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
