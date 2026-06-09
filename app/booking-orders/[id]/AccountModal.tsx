'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { notification } from 'antd'

interface ExchangeOrder {
  exchangeno: string
  supplier: string
  paidDate: string
  paymentMode: string
  amount: number
}

interface HotelVoucher {
  id: string
  voucherNo: string
  hotelName: string
  guest: string
  checkIn: string
  checkOut: string
  amount: number
}

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: number
  bookingNumber: string
  totalAmount: number
}

export default function AccountModal({ 
  isOpen, 
  onClose, 
  bookingId, 
  bookingNumber,
  totalAmount 
}: AccountModalProps) {
  const [exchangeOrders, setExchangeOrders] = useState<ExchangeOrder[]>([])
  const [hotelVouchers, setHotelVouchers] = useState<HotelVoucher[]>([])
  const [loading, setLoading] = useState(false)
  const [profit, setProfit] = useState(0)

  // 新增支付表单
  const [agent, setAgent] = useState('')
  const [eoNumber, setEoNumber] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [paidDate, setPaidDate] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadAccountData()
    }
  }, [isOpen, bookingId])

  useEffect(() => {
    calculateProfit()
  }, [totalAmount, exchangeOrders, hotelVouchers])

  const loadAccountData = async () => {
    setLoading(true)
    try {
      // Load exchange orders
      const exchangeResponse = await fetch(`/api/booking-orders/${bookingId}/exchanges`)
      if (exchangeResponse.ok) {
        const exchangeData = await exchangeResponse.json()
        setExchangeOrders(exchangeData.data || [])
      }

      // Load hotel vouchers (if you have this endpoint)
      // const voucherResponse = await fetch(`/api/booking-orders/${bookingId}/vouchers`)
      // if (voucherResponse.ok) {
      //   const voucherData = await voucherResponse.json()
      //   setHotelVouchers(voucherData.data || [])
      // }
    } catch (error) {
      console.error('Error loading account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProfit = () => {
    const exchangeTotal = exchangeOrders.reduce((sum, ex) => sum + ex.amount, 0)
    const voucherTotal = hotelVouchers.reduce((sum, v) => sum + v.amount, 0)
    setProfit(totalAmount - exchangeTotal - voucherTotal)
  }

  const handleAddVoucher = () => {
    const newVoucher: HotelVoucher = {
      id: Date.now().toString(),
      voucherNo: '',
      hotelName: '',
      guest: '',
      checkIn: '',
      checkOut: '',
      amount: 0
    }
    setHotelVouchers([...hotelVouchers, newVoucher])
  }

  const handleUpdateVoucher = (id: string, field: keyof HotelVoucher, value: any) => {
    setHotelVouchers(hotelVouchers.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const handleRemoveVoucher = (id: string) => {
    setHotelVouchers(hotelVouchers.filter(v => v.id !== id))
  }

  const handleAdd = async () => {
    if (!agent || !paymentMode || !paidDate || !amount) {
      notification.warning({
        message: 'Missing Information',
        description: 'Please fill in all required fields',
        placement: 'topRight',
      })
      return
    }

    // TODO: 这里需要添加API来保存支付记录
    notification.success({
      message: 'Success',
      description: 'Payment record added successfully',
      placement: 'topRight',
    })

    // 清空表单
    setAgent('')
    setEoNumber('')
    setPaymentMode('')
    setPaidDate('')
    setAmount('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
            <p className="text-sm text-gray-500">TBF: {bookingNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* TBF Amount */}
          <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-lg font-semibold text-gray-900">
              Total TBF Amount:
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Exchange Orders */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase">Exchange Orders (Expenses)</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : exchangeOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No exchange orders</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exchange #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {exchangeOrders.map((exchange, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{exchange.exchangeno}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{exchange.supplier}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{exchange.paidDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{exchange.paymentMode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          ${exchange.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        Total Exchange Amount:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        ${exchangeOrders.reduce((sum, ex) => sum + ex.amount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Hotel Vouchers */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase">Hotel Vouchers (Expenses)</h3>
              <button
                onClick={handleAddVoucher}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Voucher
              </button>
            </div>
            
            {hotelVouchers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hotel vouchers</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Hotel</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {hotelVouchers.map((voucher) => (
                      <tr key={voucher.id}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={voucher.voucherNo}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'voucherNo', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={voucher.hotelName}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'hotelName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={voucher.guest}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'guest', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={voucher.checkIn}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'checkIn', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={voucher.checkOut}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'checkOut', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={voucher.amount}
                            onChange={(e) => handleUpdateVoucher(voucher.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveVoucher(voucher.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        Total Hotel Amount:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        ${hotelVouchers.reduce((sum, v) => sum + v.amount, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Profit Calculation */}
          <div className="flex justify-end">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg px-6 py-4">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                Profit:
              </div>
              <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Add Payment Record</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent:</label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EO Number (Hand Written):</label>
                <input
                  type="text"
                  value={eoNumber}
                  onChange={(e) => setEoNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select payment mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Visa">Visa</option>
                  <option value="Debit">Debit</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date:</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
