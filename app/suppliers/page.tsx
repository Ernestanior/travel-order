'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Search } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  telephone: string
  tel: string
  address: string
  fax: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 当搜索条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // 当页码变化时加载数据
  useEffect(() => {
    loadSuppliers()
  }, [currentPage])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())
      
      const response = await fetch(`/api/suppliers?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setSuppliers(result.data)
        setTotalRecords(result.pagination?.total || result.data.length)
      } else if (Array.isArray(result)) {
        setSuppliers(result)
        setTotalRecords(result.length)
      } else {
        setSuppliers([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // 后端分页，直接使用返回的数据
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSuppliers = suppliers // 后端已经分页，直接使用

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
          <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        </div>

        {/* 供应商表格 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Telephone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3 text-gray-600">Loading suppliers...</span>
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No suppliers found</p>
                    </td>
                  </tr>
                ) : (
                  currentSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {supplier.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supplier.telephone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supplier.fax || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supplier.address || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页控制 */}
          {!loading && suppliers.length > 0 && (
            <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of{' '}
                <span className="font-medium">{totalRecords}</span> suppliers
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

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Click on any row to view details
            </span>
            <button className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
