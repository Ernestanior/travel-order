'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, ExternalLink } from 'lucide-react'

const reportOptions = [
  { 
    id: 'A', 
    name: 'Booking Inquiry (Departure)', 
    implemented: true,
    link: '/booking-orders',
    description: 'Search booking orders by departure date'
  },
  { 
    id: 'B', 
    name: 'Exchange Inquiry (Supplier)', 
    implemented: true,
    link: '/exchange-orders',
    description: 'Search exchange orders by supplier'
  },
  { 
    id: 'D', 
    name: 'Outstanding Transactions Report: Before Departure',
    implemented: true,
    link: '/booking-orders',
    description: 'Show unpaid orders departing before a specific date'
  },
  { 
    id: 'E', 
    name: 'Outstanding Transactions Report: By Passenger',
    implemented: true,
    link: '/booking-orders',
    description: 'Search orders by customer name'
  },
  { 
    id: 'F', 
    name: 'Passenger Inquiry',
    implemented: true,
    link: '/passenger-inquiry',
    description: 'Search all passengers by customer name'
  },
  { id: 'G', name: 'Receipt Inquiry', implemented: false },
  { id: 'H', name: 'Receipt Transactions Report', implemented: false },
  { id: 'I', name: 'Printing of Receipt', implemented: false },
  { id: 'J', name: 'Printing of Booking', implemented: false },
  { id: 'K', name: 'Printing of EO', implemented: false },
  { id: 'L', name: 'Profit Report', implemented: false },
  { id: 'M', name: 'By Customer', implemented: false },
  { id: 'N', name: 'Closed Booking Transaction', implemented: false },
]

export default function ReportsPage() {
  const implementedReports = reportOptions.filter(r => r.implemented)
  const pendingReports = reportOptions.filter(r => !r.implemented)

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
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports / Printouts</h1>
              <p className="text-sm text-gray-600">
                Search and reporting functions
              </p>
            </div>
          </div>
        </div>

        {/* 已实现的报表功能 */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">Implemented Reports</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              These reports are integrated into their respective pages
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {implementedReports.map((option) => (
              <Link
                key={option.id}
                href={option.link || '#'}
                className="block px-4 py-4 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 font-bold rounded group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0">
                      {option.id}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium group-hover:text-green-600 transition-colors">
                          {option.name}
                        </span>
                        <ExternalLink className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 待实现的报表功能 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-900">Pending Reports</h2>
            <p className="text-sm text-gray-600 mt-1">
              These reports will be implemented in future updates
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {pendingReports.map((option) => (
              <div
                key={option.id}
                className="px-4 py-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 font-bold rounded">
                    {option.id}
                  </span>
                  <span className="text-gray-700">
                    {option.name}
                  </span>
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
