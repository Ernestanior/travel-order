'use client'

import Link from 'next/link'
import { mockSuppliers } from '@/lib/mockData'
import { ArrowLeft, Building2, Search } from 'lucide-react'

export default function SuppliersPage() {
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
              <Building2 className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Supplier</h1>
            </div>
          </div>
        </div>

        {/* 供应商表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Supplier..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Telephone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Fax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {supplier.telephone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {supplier.fax || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {supplier.address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              N/B: Double-click on entry to view details.
            </span>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
