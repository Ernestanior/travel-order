'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Edit2, Trash2, Plus, FileDown, DollarSign, X } from 'lucide-react'
import { notification } from 'antd'
import { generateExchangeInvoicePDF } from '@/lib/pdfGenerator'
import MakePaymentModal from './MakePaymentModal'

interface Item {
  item: string
  quantity: number
  unitPrice: number
  price: number
}

interface Payment {
  id: number
  date: string
  type: string
  amount: number
  remarks: string
}

interface ExchangeOrder {
  id: number
  exchangeNumber: string
  bookingNumber: string
  exchangeDate: string
  supplier: string
  supplierAddress: string
  supplierTel: string
  status: string
  customer: string
  departureDate: string
  departureTime: string
  departureFlight: string
  departureDest: string
  departureDate2: string
  departureTime2: string
  departureFlight2: string
  departureDest2: string
  departureDate3: string
  departureTime3: string
  departureFlight3: string
  departureDest3: string
  arrivalDate: string
  arrivalTime: string
  arrivalFlight: string
  arrivalDest: string
  arrivalDate2: string
  arrivalTime2: string
  arrivalFlight2: string
  arrivalDest2: string
  arrivalDate3: string
  arrivalTime3: string
  arrivalFlight3: string
  arrivalDest3: string
  tourCode: string
  tour: string
  special: string
  totalCost: number
  paid: number
  outstanding: number
  items: Item[]
  payments: Payment[]
}

export default function ExchangeOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<ExchangeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  const [formData, setFormData] = useState<Partial<ExchangeOrder>>({})
  const [editItems, setEditItems] = useState<Item[]>([])

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/exchange-orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setFormData(data)
        setEditItems(data.items || [])
      }
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData(order || {})
    setEditItems(order?.items || [])
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData(order || {})
    setEditItems(order?.items || [])
  }

  const handleSave = async () => {
    if (!formData.supplier) {
      notification.error({
        message: 'Validation Error',
        description: 'Supplier is required',
        placement: 'topRight',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/exchange-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: editItems
        })
      })
      
      if (response.ok) {
        await loadOrder()
        setIsEditing(false)
        notification.success({
          message: 'Success',
          description: 'Exchange order updated successfully',
          placement: 'topRight',
        })
      } else {
        const result = await response.json()
        notification.error({
          message: 'Failed to Update',
          description: result.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving:', error)
      notification.error({
        message: 'Error',
        description: 'Error updating exchange order',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/exchange-orders/${params.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Exchange order deleted successfully',
          placement: 'topRight',
        })
        router.push('/exchange-orders')
      } else {
        notification.error({
          message: 'Failed',
          description: 'Failed to delete exchange order',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error deleting:', error)
      notification.error({
        message: 'Error',
        description: 'Error deleting exchange order',
        placement: 'topRight',
      })
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleExportPDF = async () => {
    if (!order) return
    
    await generateExchangeInvoicePDF({
      exchangeNumber: order.exchangeNumber,
      bookingNumber: order.bookingNumber,
      date: order.exchangeDate,
      supplier: order.supplier,
      customer: order.customer,
      tourCode: order.tourCode,
      tour: order.tour,
      departureDate: order.departureDate,
      departureTime: order.departureTime,
      departureFlight: order.departureFlight,
      departureDest: order.departureDest,
      departureDate2: order.departureDate2,
      departureTime2: order.departureTime2,
      departureFlight2: order.departureFlight2,
      departureDest2: order.departureDest2,
      departureDate3: order.departureDate3,
      departureTime3: order.departureTime3,
      departureFlight3: order.departureFlight3,
      departureDest3: order.departureDest3,
      arrivalDate: order.arrivalDate,
      arrivalTime: order.arrivalTime,
      arrivalFlight: order.arrivalFlight,
      arrivalDest: order.arrivalDest,
      arrivalDate2: order.arrivalDate2,
      arrivalTime2: order.arrivalTime2,
      arrivalFlight2: order.arrivalFlight2,
      arrivalDest2: order.arrivalDest2,
      arrivalDate3: order.arrivalDate3,
      arrivalTime3: order.arrivalTime3,
      arrivalFlight3: order.arrivalFlight3,
      arrivalDest3: order.arrivalDest3,
      items: order.items,
      totalPrice: order.totalCost,
      discount: 0, // Exchange orders don't have discount field
      payment: order.paid,
      balance: order.outstanding
    })
    
    notification.success({
      message: 'Success',
      description: 'Invoice PDF generated successfully',
      placement: 'topRight',
    })
  }

  const addItem = () => {
    setEditItems([...editItems, { item: '', quantity: 1, unitPrice: 0, price: 0 }])
  }

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...editItems]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].price = newItems[index].quantity * newItems[index].unitPrice
    }
    setEditItems(newItems)
  }

  const removeItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index))
  }

  const totalAmount = (isEditing ? editItems : order?.items || [])
    .reduce((sum, item) => sum + item.price, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Exchange Order Not Found</h2>
          <Link href="/exchange-orders" className="text-blue-600 hover:text-blue-700">
            Back to Exchange Orders
          </Link>
        </div>
      </div>
    )
  }

  const displayData = isEditing ? formData : order
  const displayItems = isEditing ? editItems : order.items

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/exchange-orders" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Exchange Orders
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Exchange #{order.exchangeNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Related to Booking #{order.bookingNumber} • Created on {order.exchangeDate}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded ${
                order.status === 'Close' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
              }`}>
                {order.status}
              </span>
              
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={handleExportPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button onClick={() => setShowPaymentModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Make Payment
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Exchange Order?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. All associated items and payments will be deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Exchange Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exchange Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Date</label>
                  {isEditing ? (
                    <input type="date" value={displayData.exchangeDate || ''}
                      onChange={(e) => setFormData({ ...formData, exchangeDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.exchangeDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  {isEditing ? (
                    <input type="text" value={displayData.supplier || ''}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.supplier}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Address</label>
                  {isEditing ? (
                    <textarea value={displayData.supplierAddress || ''} rows={2}
                      onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.supplierAddress || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Tel</label>
                  {isEditing ? (
                    <input type="text" value={displayData.supplierTel || ''}
                      onChange={(e) => setFormData({ ...formData, supplierTel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.supplierTel || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer (from Booking)</label>
                  <p className="text-sm text-gray-900">{order.customer || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                {isEditing && (
                  <button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                )}
              </div>
              
              {displayItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No items</p>
              ) : (
                <div className="space-y-3">
                  {displayItems.map((item, index) => (
                    <div key={index} className={isEditing ? "border border-gray-200 rounded-lg p-3" : "flex justify-between py-2 border-b border-gray-100 last:border-0"}>
                      {isEditing ? (
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-5">
                            <input type="text" value={item.item} placeholder="Item name"
                              onChange={(e) => updateItem(index, 'item', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-2">
                            <input type="number" value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-2">
                            <input type="number" step="0.01" value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-2">
                            <input type="text" value={`$${item.price.toFixed(2)}`} readOnly
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 font-medium" />
                          </div>
                          <div className="col-span-1 flex items-center">
                            <button onClick={() => removeItem(index)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.item}</p>
                            <p className="text-xs text-gray-500">{item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payments */}
            {!isEditing && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
                {order.payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payments yet</p>
                ) : (
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.type || 'Payment'}</p>
                          <p className="text-xs text-gray-500">{payment.date}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium">${order.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">${order.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Outstanding:</span>
                    <span className="font-bold text-gray-900">${order.outstanding.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Flight Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Information</h2>
              
              <div className="space-y-4">
                {/* Departures */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Departures</h3>
                  
                  {/* Departure 1 - Always show */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Departure 1</span>
                    </div>
                    {isEditing ? (
                      <div className="grid grid-cols-4 gap-2">
                        <input type="date" value={displayData.departureDate || ''}
                          onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureTime || ''} placeholder="Time"
                          onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureFlight || ''} placeholder="Flight"
                          onChange={(e) => setFormData({ ...formData, departureFlight: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureDest || ''} placeholder="Dest"
                          onChange={(e) => setFormData({ ...formData, departureDest: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900">
                        {order.departureDate || '-'} • {order.departureTime || '-'} • {order.departureFlight || '-'} • {order.departureDest || '-'}
                      </p>
                    )}
                  </div>
                  
                  {/* Departure 2 */}
                  {(order.departureDate2 || (isEditing && displayData.departureDate)) && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Departure 2</span>
                        {isEditing && (
                          <button
                            onClick={() => setFormData({ 
                              ...formData, 
                              departureDate2: '', 
                              departureTime2: '', 
                              departureFlight2: '', 
                              departureDest2: '' 
                            })}
                            className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-4 gap-2">
                          <input type="date" value={displayData.departureDate2 || ''}
                            onChange={(e) => setFormData({ ...formData, departureDate2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureTime2 || ''} placeholder="Time"
                            onChange={(e) => setFormData({ ...formData, departureTime2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureFlight2 || ''} placeholder="Flight"
                            onChange={(e) => setFormData({ ...formData, departureFlight2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureDest2 || ''} placeholder="Dest"
                            onChange={(e) => setFormData({ ...formData, departureDest2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">
                          {order.departureDate2 || '-'} • {order.departureTime2 || '-'} • {order.departureFlight2 || '-'} • {order.departureDest2 || '-'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Departure 3 */}
                  {(order.departureDate3 || (isEditing && displayData.departureDate2)) && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Departure 3</span>
                        {isEditing && (
                          <button
                            onClick={() => setFormData({ 
                              ...formData, 
                              departureDate3: '', 
                              departureTime3: '', 
                              departureFlight3: '', 
                              departureDest3: '' 
                            })}
                            className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-4 gap-2">
                          <input type="date" value={displayData.departureDate3 || ''}
                            onChange={(e) => setFormData({ ...formData, departureDate3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureTime3 || ''} placeholder="Time"
                            onChange={(e) => setFormData({ ...formData, departureTime3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureFlight3 || ''} placeholder="Flight"
                            onChange={(e) => setFormData({ ...formData, departureFlight3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.departureDest3 || ''} placeholder="Dest"
                            onChange={(e) => setFormData({ ...formData, departureDest3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">
                          {order.departureDate3 || '-'} • {order.departureTime3 || '-'} • {order.departureFlight3 || '-'} • {order.departureDest3 || '-'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Arrivals */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Arrivals</h3>
                  
                  {/* Arrival 1 - Always show */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Arrival 1</span>
                    </div>
                    {isEditing ? (
                      <div className="grid grid-cols-4 gap-2">
                        <input type="date" value={displayData.arrivalDate || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalTime || ''} placeholder="Time"
                          onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalFlight || ''} placeholder="Flight"
                          onChange={(e) => setFormData({ ...formData, arrivalFlight: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalDest || ''} placeholder="Dest"
                          onChange={(e) => setFormData({ ...formData, arrivalDest: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900">
                        {order.arrivalDate || '-'} • {order.arrivalTime || '-'} • {order.arrivalFlight || '-'} • {order.arrivalDest || '-'}
                      </p>
                    )}
                  </div>
                  
                  {/* Arrival 2 */}
                  {(order.arrivalDate2 || (isEditing && displayData.arrivalDate)) && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Arrival 2</span>
                        {isEditing && (
                          <button
                            onClick={() => setFormData({ 
                              ...formData, 
                              arrivalDate2: '', 
                              arrivalTime2: '', 
                              arrivalFlight2: '', 
                              arrivalDest2: '' 
                            })}
                            className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-4 gap-2">
                          <input type="date" value={displayData.arrivalDate2 || ''}
                            onChange={(e) => setFormData({ ...formData, arrivalDate2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalTime2 || ''} placeholder="Time"
                            onChange={(e) => setFormData({ ...formData, arrivalTime2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalFlight2 || ''} placeholder="Flight"
                            onChange={(e) => setFormData({ ...formData, arrivalFlight2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalDest2 || ''} placeholder="Dest"
                            onChange={(e) => setFormData({ ...formData, arrivalDest2: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">
                          {order.arrivalDate2 || '-'} • {order.arrivalTime2 || '-'} • {order.arrivalFlight2 || '-'} • {order.arrivalDest2 || '-'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Arrival 3 */}
                  {(order.arrivalDate3 || (isEditing && displayData.arrivalDate2)) && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Arrival 3</span>
                        {isEditing && (
                          <button
                            onClick={() => setFormData({ 
                              ...formData, 
                              arrivalDate3: '', 
                              arrivalTime3: '', 
                              arrivalFlight3: '', 
                              arrivalDest3: '' 
                            })}
                            className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-4 gap-2">
                          <input type="date" value={displayData.arrivalDate3 || ''}
                            onChange={(e) => setFormData({ ...formData, arrivalDate3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalTime3 || ''} placeholder="Time"
                            onChange={(e) => setFormData({ ...formData, arrivalTime3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalFlight3 || ''} placeholder="Flight"
                            onChange={(e) => setFormData({ ...formData, arrivalFlight3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          <input type="text" value={displayData.arrivalDest3 || ''} placeholder="Dest"
                            onChange={(e) => setFormData({ ...formData, arrivalDest3: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">
                          {order.arrivalDate3 || '-'} • {order.arrivalTime3 || '-'} • {order.arrivalFlight3 || '-'} • {order.arrivalDest3 || '-'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tour Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tour Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Code</label>
                  <p className="text-sm text-gray-900">{order.tourCode || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                  <p className="text-sm text-gray-900">{order.tour || '-'}</p>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.special && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.special}</p>
              </div>
            )}
          </div>
        </div>

        {/* Make Payment Modal */}
        <MakePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          exchangeId={order.id}
          exchangeNumber={order.exchangeNumber}
          supplier={order.supplier}
          totalAmount={order.totalCost}
          onPaymentAdded={loadOrder}
        />
      </div>
    </div>
  )
}
