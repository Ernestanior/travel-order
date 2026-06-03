'use client'

import Link from 'next/link'
import { mockCustomers } from '@/lib/mockData'
import { ArrowLeft, Users, Search } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Main Menu
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Customer</h1>
            </div>
          </div>
        </div>

        {/* 客户列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {mockCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <h3 className="font-bold text-gray-900 mb-2">{customer.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  {customer.tel && (
                    <div>
                      <span className="font-semibold">Tel:</span> {customer.tel}
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <span className="font-semibold">Address:</span> {customer.address}
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <span className="font-semibold">Email:</span> {customer.email}
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
