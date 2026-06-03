'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockExchangeOrders, mockSuppliers } from '@/lib/mockData'
import { ArrowLeft, RefreshCw, Plus, Search, Filter, X } from 'lucide-react'

export default function ExchangeOrdersPage() {
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)

  // 按供应商筛选
  const filteredOrders = useMemo(() => {
    if (!supplierSearch) return mockExchangeOrders
    
    return mockExchangeOrders.filter(order =>
      order.supplierName.toLowerCase().includes(supplierSearch.toLowerCase())
    )
  }, [supplierSearch])

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
              <RefreshCw className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Exchange Order</h1>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center text-sm">
              <Plus className="w-4 h-4 mr-1" />
              New Exchange
            </button>
          </div>
        </div>

        {/* 搜索区域 - Exchange Inquiry (Supplier) */}
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Exchange Inquiry (Supplier)</h3>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-24">Supplier:</label>
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

          {/* 显示筛选结果统计 */}
          {supplierSearch && (
            <div className="mt-3 text-sm text-gray-600">
              Found <span className="font-bold text-purple-600">{filteredOrders.length}</span> exchange order(s)
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
                    Exchange #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Dept Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Arv Date
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Booking #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No exchange orders found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/exchange-orders/${order.id}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600">
                      {order.exchangeNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.agent || order.supplierName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.deptDate || order.departureDate || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {order.arvDate || order.arrivalDate || '-'}
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.bookingNumber}
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
