'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Search, Plus, Edit, Trash2, X } from 'lucide-react'
import { notification } from 'antd'

interface Supplier {
  id: string
  name: string
  telephone: string
  tel: string
  address: string
  fax: string
  email: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 50

  // 模态框状态
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    tel: '',
    fax: '',
    address: '',
    email: ''
  })

  // 当搜索条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // 当页码或搜索条件变化时加载数据
  useEffect(() => {
    loadSuppliers()
  }, [currentPage, searchTerm])

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

  // 打开新增模态框
  const handleAdd = () => {
    setIsEditing(false)
    setSelectedSupplier(null)
    setFormData({
      name: '',
      tel: '',
      fax: '',
      address: '',
      email: ''
    })
    setShowModal(true)
  }

  // 打开编辑模态框
  const handleEdit = (supplier: Supplier) => {
    setIsEditing(true)
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      tel: supplier.tel || supplier.telephone || '',
      fax: supplier.fax || '',
      address: supplier.address || '',
      email: supplier.email || ''
    })
    setShowModal(true)
  }

  // 保存供应商
  const handleSave = async () => {
    if (!formData.name.trim()) {
      notification.error({
        message: 'Validation Error',
        description: 'Supplier name is required',
        placement: 'topRight',
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isEditing 
        ? `/api/suppliers/${encodeURIComponent(selectedSupplier!.name)}`
        : '/api/suppliers/create'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Supplier ${isEditing ? 'updated' : 'created'} successfully`,
          placement: 'topRight',
        })
        setShowModal(false)
        loadSuppliers() // 重新加载列表
      } else {
        notification.error({
          message: 'Error',
          description: result.error || `Failed to ${isEditing ? 'update' : 'create'} supplier`,
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
      notification.error({
        message: 'Error',
        description: 'An error occurred while saving',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedSupplier(null)
    setFormData({
      name: '',
      tel: '',
      fax: '',
      address: '',
      email: ''
    })
  }

  // 打开删除确认框
  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteModal(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    if (!selectedSupplier) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/suppliers/${encodeURIComponent(selectedSupplier.name)}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Supplier deleted successfully',
          placement: 'topRight',
        })
        setShowDeleteModal(false)
        setSelectedSupplier(null)
        loadSuppliers() // 重新加载列表
      } else {
        notification.error({
          message: 'Error',
          description: result.error || 'Failed to delete supplier',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      notification.error({
        message: 'Error',
        description: 'An error occurred while deleting',
        placement: 'topRight',
      })
    } finally {
      setIsDeleting(false)
    }
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
            <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
            <button
              onClick={handleAdd}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Supplier
            </button>
          </div>
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
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3 text-gray-600">Loading suppliers...</span>
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
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
                        {supplier.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supplier.fax || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {supplier.address || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supplier)}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
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
        </div>

        {/* 新增/编辑模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Supplier' : 'New Supplier'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 模态框内容 */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                      placeholder="Enter supplier name"
                      disabled={isEditing} // 编辑时不能修改名称（因为是主键）
                    />
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">Supplier name cannot be changed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telephone
                    </label>
                    <input
                      type="text"
                      value={formData.tel}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                      placeholder="Enter telephone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                      placeholder="supplier@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fax
                    </label>
                    <input
                      type="text"
                      value={formData.fax}
                      onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                      placeholder="Enter fax number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              {/* 模态框底部 */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认模态框 */}
        {showDeleteModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Supplier
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedSupplier(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 模态框内容 */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete supplier <strong>{selectedSupplier.name}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. The supplier will be permanently deleted.
                </p>
              </div>

              {/* 模态框底部 */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedSupplier(null)
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
