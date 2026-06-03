'use client'

import { use } from 'react'
import Link from 'next/link'
import { mockBookingOrders } from '@/lib/mockData'
import { ArrowLeft, Save, Printer, Plus, Minus, X } from 'lucide-react'

export default function BookingOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const order = mockBookingOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">订单未找到</h1>
          <Link href="/booking-orders" className="text-blue-600 hover:text-blue-800">
            返回订单列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* 头部 */}
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <Link
            href="/booking-orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to List
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Booking Order Detail</h1>
            <div className="flex gap-2">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center text-sm">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                Unlock Record
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧 - 客户信息 */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  Booking #:
                </label>
                <input
                  type="text"
                  value={order.bookingNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date:
                </label>
                <input
                  type="text"
                  value={order.date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Customer
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option>{order.customerName}</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-blue-700 mb-1">
                *Customer:
              </label>
              <input
                type="text"
                value={order.customerName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Address:
              </label>
              <textarea
                value={order.address || ''}
                readOnly
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  *Tel / HP:
                </label>
                <input
                  type="text"
                  value={order.tel || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fax:
                </label>
                <input
                  type="text"
                  value={order.fax || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Discount:
                </label>
                <input
                  type="text"
                  value={`$${order.discount.toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Staff:
                </label>
                <input
                  type="text"
                  value={order.staff || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
              <div></div>
            </div>

            <div className="flex gap-2 mb-3">
              <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                Item Data
              </button>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Booking Total Amount:
                </label>
                <input
                  type="text"
                  value={`$${order.bookingTotalAmount.toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-bold"
                />
              </div>
            </div>

            {/* Item Data 表格 */}
            {order.items && order.items.length > 0 && (
              <div className="mb-4">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                        Item
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-center font-semibold w-16">
                        Qty
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-right font-semibold w-24">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-right font-semibold w-24">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.description}
                          {item.note && (
                            <span className="text-xs text-gray-500 ml-2">({item.note})</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Receipt 表格 */}
            <div className="mb-4">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                      Receipt #
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                      Date
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                      Type
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-right font-semibold">
                      Paid
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-right font-semibold">
                      Balance Amt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.receipts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                        No receipts
                      </td>
                    </tr>
                  ) : (
                    order.receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="border border-gray-300 px-2 py-1">{receipt.receiptNumber}</td>
                        <td className="border border-gray-300 px-2 py-1">{receipt.date}</td>
                        <td className="border border-gray-300 px-2 py-1">{receipt.type}</td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          ${receipt.paid.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          ${receipt.balanceAmt.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 按钮 */}
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                  Account
                </button>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                  Refund
                </button>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                Make Payment
              </button>
            </div>
          </div>

          {/* 右侧 - 航班和乘客信息 */}
          <div className="space-y-4">
            {/* Tour 信息 */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tour Code:
                  </label>
                  <input
                    type="text"
                    value={order.tourCode || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                  />
                </div>
                <div></div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tour:
                </label>
                <input
                  type="text"
                  value={order.tour || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>

              {/* 航班信息表格 */}
              <div className="mb-4">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold w-16"></th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                        Date
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                        Time
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                        Flight
                      </th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
                        Dest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">Departure:</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.departureDate || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.departureTime || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.departureFlight || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.departureDest || ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">Depart2:</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.depart2Date || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.depart2Time || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.depart2Flight || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.depart2Dest || ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">Arrival:</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrivalDate || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrivalTime || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrivalFlight || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrivalDest || ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">Arrival 2:</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrival2Date || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrival2Time || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrival2Flight || ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.arrival2Dest || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 乘客信息 */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Passenger Data
                </label>
                <div className="flex gap-1">
                  <button className="p-1 bg-gray-200 hover:bg-gray-300 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 bg-gray-200 hover:bg-gray-300 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  Name:
                </label>
                <textarea
                  value={order.passengerNames || order.passengers.map(p => p.name).join('\n')}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
              </div>
            </div>

            {/* Special Instruction */}
            <div className="bg-white rounded-lg shadow p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Instruction:
              </label>
              <textarea
                value={order.specialInstruction || ''}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-2 justify-end">
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <Link
                href="/booking-orders"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
