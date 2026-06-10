'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { notification } from 'antd'

interface MakePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  exchangeId: number
  exchangeNumber: string
  supplier: string
  totalAmount: number
  onPaymentAdded: () => void
}

export default function MakePaymentModal({
  isOpen,
  onClose,
  exchangeId,
  exchangeNumber,
  supplier,
  totalAmount,
  onPaymentAdded
}: MakePaymentModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split('T')[0],
    paytype: 'Cash',
    chequeno: '',
    amountpaid: '',
    remarks: '',
    issue: supplier,
    paidtext: ''
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        receiptDate: new Date().toISOString().split('T')[0],
        paytype: 'Cash',
        chequeno: '',
        amountpaid: '',
        remarks: '',
        issue: supplier,
        paidtext: ''
      })
    }
  }, [isOpen, supplier])

  const handleSave = async () => {
    // Validation
    if (!formData.amountpaid || parseFloat(formData.amountpaid) <= 0) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please enter a valid payment amount',
        placement: 'topRight',
      })
      return
    }

    if (!formData.receiptDate) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please select a receipt date',
        placement: 'topRight',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/exchange-orders/${exchangeId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          exchangeno: exchangeNumber,
          amountpaid: parseFloat(formData.amountpaid)
        })
      })

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Payment added successfully',
          placement: 'topRight',
        })
        onPaymentAdded()
        onClose()
      } else {
        const error = await response.json()
        notification.error({
          message: 'Failed to Add Payment',
          description: error.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      notification.error({
        message: 'Error',
        description: 'Error adding payment',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Payment</h2>
            <p className="text-sm text-gray-500">Exchange Order #{exchangeNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Exchange Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Supplier:</span>
                <span className="ml-2 font-medium text-gray-900">{supplier}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paytype}
                  onChange={(e) => setFormData({ ...formData, paytype: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Visa">Visa</option>
                  <option value="Debit">Debit</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {(formData.paytype === 'Cheque' || formData.paytype === 'Visa') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.paytype === 'Cheque' ? 'Cheque Number' : 'Card Number'}
                </label>
                <input
                  type="text"
                  value={formData.chequeno}
                  onChange={(e) => setFormData({ ...formData, chequeno: e.target.value })}
                  placeholder={formData.paytype === 'Cheque' ? 'Enter cheque number' : 'Enter last 4 digits'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (SGD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amountpaid}
                onChange={(e) => setFormData({ ...formData, amountpaid: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue To
              </label>
              <input
                type="text"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                placeholder="Supplier name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount in Words
              </label>
              <input
                type="text"
                value={formData.paidtext}
                onChange={(e) => setFormData({ ...formData, paidtext: e.target.value })}
                placeholder="e.g., Five Hundred Dollars"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
