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

  useEffect(() => {
    loadCustomers()
  }, [searchTerm])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      
      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
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
            <div className="divide-y divide-gray-100">
              {customers.map((customer) => (
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
          )}
        </div>
      </div>
    </div>
  )
}
