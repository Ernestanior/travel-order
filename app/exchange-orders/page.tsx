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
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Exchange
            </button>
          </div>
        </div>

        {/* 搜索区域 - Exchange Inquiry (Supplier) */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Exchange Inquiry (Supplier)</h3>

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
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredOrders.length}</span> exchange order(s)
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No exchange orders found matching your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
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

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
            Click on any row to view details
          </div>
        </div>
      </div>
    </div>
  )
}
