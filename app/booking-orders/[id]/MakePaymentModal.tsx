'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { notification } from 'antd'

interface MakePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: number
  bookingNumber: string
  customerName: string
  tour: string
  totalAmount: number
  onPaymentAdded: () => void
}

export default function MakePaymentModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  customerName,
  tour,
  totalAmount,
  onPaymentAdded
}: MakePaymentModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    receiptNo: '',
    receiptDate: new Date().toISOString().split('T')[0],
    receiveFrom: customerName,
    paymentOf: tour,
    paymentType: 'Cash',
    paymentFor: '',
    chequeNo: '',
    visaNo: '',
    amountPaid: '',
    discount: '0'
  })
  
  // 重置表单当模态框打开时
  useEffect(() => {
    if (isOpen) {
      setFormData({
        receiptNo: '',
        receiptDate: new Date().toISOString().split('T')[0],
        receiveFrom: customerName,
        paymentOf: tour,
        paymentType: 'Cash',
        paymentFor: '',
        chequeNo: '',
        visaNo: '',
        amountPaid: '',
        discount: '0'
      })
    }
  }, [isOpen, customerName, tour])
  
  const handleSave = async () => {
    // 验证
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      notification.error({
        message: 'Validation Error',
        description: 'Please enter a valid amount paid',
        placement: 'topRight',
      })
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/booking-orders/${bookingId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNo: formData.receiptNo,
          receiptDate: formData.receiptDate,
          receiveFrom: formData.receiveFrom,
          paymentOf: formData.paymentOf,
          paymentType: formData.paymentType,
          paymentFor: formData.paymentFor,
          chequeNo: formData.chequeNo,
          visaNo: formData.visaNo,
          amountPaid: formData.amountPaid,
          discount: formData.discount
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Payment recorded successfully',
          placement: 'topRight',
        })
        onPaymentAdded()
        onClose()
      } else {
        notification.error({
          message: 'Failed to Record Payment',
          description: result.details || result.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      notification.error({
        message: 'Error',
        description: 'Error recording payment',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payment Data Subform</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Booking # - Read only */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Booking #:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={bookingNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
            </div>
          </div>
          
          {/* Receipt # */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Receipt #:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Enter receipt number"
              />
            </div>
          </div>
          
          {/* Receipt Date */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Receipt Date:</label>
            <div className="col-span-2">
              <input
                type="date"
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          
          {/* Amount (Total) - Reference only */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Amount:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={`$${totalAmount.toFixed(2)}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-medium"
              />
            </div>
          </div>
          
          {/* Receive From */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Receive From:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={formData.receiveFrom}
                onChange={(e) => setFormData({ ...formData, receiveFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          
          {/* Payment of */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Payment of:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={formData.paymentOf}
                onChange={(e) => setFormData({ ...formData, paymentOf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          
          {/* Payment Type and For */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Payment Type:</label>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayNow">PayNow</option>
              </select>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">For:</label>
                <input
                  type="text"
                  value={formData.paymentFor}
                  onChange={(e) => setFormData({ ...formData, paymentFor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Purpose"
                />
              </div>
            </div>
          </div>
          
          {/* Cheque No / Visa No (conditional) */}
          {(formData.paymentType === 'Cheque' || formData.paymentType === 'Credit Card') && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">
                {formData.paymentType === 'Cheque' ? 'Cheque No:' : 'Card No:'}
              </label>
              <div className="col-span-2">
                <input
                  type="text"
                  value={formData.paymentType === 'Cheque' ? formData.chequeNo : formData.visaNo}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    ...(formData.paymentType === 'Cheque' 
                      ? { chequeNo: e.target.value } 
                      : { visaNo: e.target.value })
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder={formData.paymentType === 'Cheque' ? 'Enter cheque number' : 'Enter card number'}
                />
              </div>
            </div>
          )}
          
          {/* Amount Paid */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              Amount Paid: <span className="text-red-500">*</span>
            </label>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          {/* Discount */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Discount:</label>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Exit
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
