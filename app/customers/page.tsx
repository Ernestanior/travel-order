'use client'

import Link from 'next/link'
import { mockCustomers } from '@/lib/mockData'
import { ArrowLeft, Users, Search } from 'lucide-react'

export default function CustomersPage() {
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {mockCustomers.map((customer) => (
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
                  {customer.email && (
                    <div>
                      <span className="font-medium text-gray-500">Email:</span> {customer.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
