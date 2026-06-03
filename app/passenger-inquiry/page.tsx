'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { mockBookingOrders, mockCustomers } from '@/lib/mockData'
import { ArrowLeft, Users, Search, X } from 'lucide-react'

interface PassengerResult {
  bookingNumber: string
  bookingDate: string
  customerName: string
  passengerNames: string
  departureDate?: string
  tour?: string
}

export default function PassengerInquiryPage() {
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // 客户名模糊搜索
  const matchedCustomers = useMemo(() => {
    if (!customerSearch) return []
    return mockCustomers.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 10)
  }, [customerSearch])

  // 搜索结果：某个客户的所有订单及其乘客
  const passengerResults = useMemo(() => {
    if (!customerSearch) return []

    const results: PassengerResult[] = []
    
    // 查找匹配客户名的所有 booking orders
    const matchedOrders = mockBookingOrders.filter(order =>
      order.customerName.toLowerCase().includes(customerSearch.toLowerCase())
    )

    matchedOrders.forEach(order => {
      // 获取乘客信息
      let passengerNames = order.passengerNames || ''
      
      if (!passengerNames && order.passengers.length > 0) {
        passengerNames = order.passengers.map(p => p.name).join(', ')
      }

      if (!passengerNames) {
        passengerNames = '(No passengers listed)'
      }

      results.push({
        bookingNumber: order.bookingNumber,
        bookingDate: order.date,
        customerName: order.customerName,
        passengerNames: passengerNames,
        departureDate: order.departureDate,
        tour: order.tour,
      })
    })

    return results
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Passenger Inquiry</h1>
            <p className="text-sm text-gray-500">Search all passengers by customer name</p>
          </div>
        </div>

        {/* 搜索区域 */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Search by Customer</h3>

          <div className="relative">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-24">Customer:</label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Type customer name to search passengers..."
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                    {matchedCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer.name)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.tel && (
                          <div className="text-xs text-gray-500">{customer.tel}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 显示搜索结果统计 */}
          {customerSearch && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{passengerResults.length}</span> booking order(s) with passengers
            </div>
          )}
        </div>

        {/* 结果显示 */}
        {customerSearch && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {passengerResults.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-base font-medium mb-1">No passengers found</p>
                <p className="text-sm">No booking orders found for customer "{customerSearch}"</p>
              </div>
            ) : (
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
                        Passengers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Departure Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tour
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Booking Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {passengerResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            href={`/booking-orders/${mockBookingOrders.find(o => o.bookingNumber === result.bookingNumber)?.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-gray-700"
                          >
                            {result.bookingNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result.customerName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="max-w-md">
                            {result.passengerNames}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {result.departureDate || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result.tour || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {result.bookingDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 初始提示 */}
        {!customerSearch && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Search for Passengers
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Enter a customer name above to view all passengers from their booking orders.
            </p>
            <p className="text-xs text-gray-500">
              One customer can have multiple booking orders, each with multiple passengers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
