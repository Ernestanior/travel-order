'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Edit2, Trash2, Plus, X, DollarSign } from 'lucide-react'
import { notification } from 'antd'
import MakePaymentModal from './MakePaymentModal'

interface Item {
  item: string
  quantity: number
  unitPrice: number
  price: number
}

interface Passenger {
  name: string
  passport: string
  birthdate: string
}

interface Payment {
  id: number
  receiptNo: string
  date: string
  type: string
  for: string
  amount: number
}

interface BookingOrder {
  id: number
  bookingNumber: string
  bookingDate: string
  customerName: string
  address: string
  tel: string
  discount: number
  staff: string
  tourCode: string
  tour: string
  special: string
  status: string
  departureDate: string
  departureTime: string
  departureFlight: string
  departureDest: string
  departureDate2: string
  departureTime2: string
  departureFlight2: string
  departureDest2: string
  arrivalDate: string
  arrivalTime: string
  arrivalFlight: string
  arrivalDest: string
  arrivalDate2: string
  arrivalTime2: string
  arrivalFlight2: string
  arrivalDest2: string
  totalCost: number
  totalAfterDiscount: number
  paid: number
  outstanding: number
  items: Item[]
  passengers: Passenger[]
  payments: Payment[]
}

export default function BookingOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<BookingOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  // 编辑状态的表单数据
  const [formData, setFormData] = useState<Partial<BookingOrder>>({})
  const [editItems, setEditItems] = useState<Item[]>([])
  const [editPassengers, setEditPassengers] = useState<Passenger[]>([])

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/booking-orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Load payments
        const paymentsResponse = await fetch(`/api/booking-orders/${params.id}/payments`)
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          // Map database field names to interface field names
          data.payments = (paymentsData.data || []).map((p: any) => ({
            id: p.id,
            receiptNo: p.receiptno || 'N/A',
            date: p.receiptdate,
            type: p.paytype || 'N/A',
            for: p.for || '',
            amount: parseFloat(p.amountpaid) || 0
          }))
          
          // Calculate paid amount
          const totalPaid = data.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
          data.paid = totalPaid
          data.outstanding = data.totalCost - totalPaid
        }
        
        setOrder(data)
        setFormData(data)
        setEditItems(data.items || [])
        setEditPassengers(data.passengers || [])
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
    setEditPassengers(order?.passengers || [])
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData(order || {})
    setEditItems(order?.items || [])
    setEditPassengers(order?.passengers || [])
  }

  const handleSave = async () => {
    if (!formData.customerName || !formData.tel) {
      notification.error({
        message: 'Validation Error',
        description: 'Customer Name and Tel are required',
        placement: 'topRight',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/booking-orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: editItems,
          passengers: editPassengers
        })
      })
      
      if (response.ok) {
        await loadOrder()
        setIsEditing(false)
        notification.success({
          message: 'Success',
          description: 'Order updated successfully',
          placement: 'topRight',
        })
      } else {
        const result = await response.json()
        notification.error({
          message: 'Failed to Update Order',
          description: result.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving:', error)
      notification.error({
        message: 'Error',
        description: 'Error updating order',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/booking-orders/${params.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Order deleted successfully',
          placement: 'topRight',
        })
        router.push('/booking-orders')
      } else {
        notification.error({
          message: 'Failed',
          description: 'Failed to delete order',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error deleting:', error)
      notification.error({
        message: 'Error',
        description: 'Error deleting order',
        placement: 'topRight',
      })
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  // Items 管理
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

  // Passengers 管理
  const addPassenger = () => {
    setEditPassengers([...editPassengers, { name: '', passport: '', birthdate: '' }])
  }

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...editPassengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setEditPassengers(newPassengers)
  }

  const removePassenger = (index: number) => {
    setEditPassengers(editPassengers.filter((_, i) => i !== index))
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/booking-orders" className="text-blue-600 hover:text-blue-700">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const displayData = isEditing ? formData : order
  const displayItems = isEditing ? editItems : order.items
  const displayPassengers = isEditing ? editPassengers : order.passengers

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/booking-orders" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Booking Orders
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Booking #{order.bookingNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Created on {order.bookingDate}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  {isEditing ? (
                    <input type="text" value={displayData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.customerName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea value={displayData.address || ''} rows={2}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.address || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tel / HP *</label>
                  {isEditing ? (
                    <input type="text" value={displayData.tel || ''}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.tel}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    {isEditing ? (
                      <input type="number" step="0.01" value={displayData.discount || 0}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    ) : (
                      <p className="text-sm text-gray-900">${order.discount.toFixed(2)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
                    {isEditing ? (
                      <input type="text" value={displayData.staff || ''}
                        onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    ) : (
                      <p className="text-sm text-gray-900">{order.staff || '-'}</p>
                    )}
                  </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Payment
                  </button>
                </div>
                
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-orange-600">-${order.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">Amount Due:</span>
                        <span className="text-sm font-bold text-gray-900">${order.totalAfterDiscount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Paid:</span>
                    <span className="text-sm font-medium text-green-600">${(order.paid || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">Outstanding:</span>
                    <span className={`text-lg font-bold ${(order.outstanding || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(order.outstanding || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Payment List */}
                {order.payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payments yet</p>
                ) : (
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.receiptNo || 'N/A'}
                            </p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              payment.type === 'Cash' ? 'bg-green-100 text-green-700' :
                              payment.type === 'Cheque' ? 'bg-blue-100 text-blue-700' :
                              payment.type === 'Credit Card' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {payment.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.date).toLocaleDateString()} {payment.for ? `• ${payment.for}` : ''}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tour Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tour Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Code</label>
                  {isEditing ? (
                    <input type="text" value={displayData.tourCode || ''}
                      onChange={(e) => setFormData({ ...formData, tourCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.tourCode || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                  {isEditing ? (
                    <input type="text" value={displayData.tour || ''}
                      onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  ) : (
                    <p className="text-sm text-gray-900">{order.tour || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Departure</h3>
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
                
                {(isEditing || order.departureDate2) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Departure 2</h3>
                    {isEditing ? (
                      <div className="grid grid-cols-4 gap-2">
                        <input type="date" value={displayData.departureDate2 || ''}
                          onChange={(e) => setFormData({ ...formData, departureDate2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureTime2 || ''}
                          onChange={(e) => setFormData({ ...formData, departureTime2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureFlight2 || ''}
                          onChange={(e) => setFormData({ ...formData, departureFlight2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.departureDest2 || ''}
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
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Arrival</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-4 gap-2">
                      <input type="date" value={displayData.arrivalDate || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      <input type="text" value={displayData.arrivalTime || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      <input type="text" value={displayData.arrivalFlight || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalFlight: e.target.value })}
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      <input type="text" value={displayData.arrivalDest || ''}
                        onChange={(e) => setFormData({ ...formData, arrivalDest: e.target.value })}
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {order.arrivalDate || '-'} • {order.arrivalTime || '-'} • {order.arrivalFlight || '-'} • {order.arrivalDest || '-'}
                    </p>
                  )}
                </div>
                
                {(isEditing || order.arrivalDate2) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Arrival 2</h3>
                    {isEditing ? (
                      <div className="grid grid-cols-4 gap-2">
                        <input type="date" value={displayData.arrivalDate2 || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalDate2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalTime2 || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalTime2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalFlight2 || ''}
                          onChange={(e) => setFormData({ ...formData, arrivalFlight2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        <input type="text" value={displayData.arrivalDest2 || ''}
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
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Passengers</h2>
                {isEditing && (
                  <button onClick={addPassenger} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                )}
              </div>
              
              {displayPassengers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No passengers</p>
              ) : (
                <div className="space-y-3">
                  {displayPassengers.map((passenger, index) => (
                    <div key={index} className={isEditing ? "border border-gray-200 rounded-lg p-3" : "py-2 border-b border-gray-100 last:border-0"}>
                      {isEditing ? (
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-5">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                            <input type="text" value={passenger.name} placeholder="Passenger name"
                              onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Passport</label>
                            <input type="text" value={passenger.passport || ''} placeholder="Passport #"
                              onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Birth Date</label>
                            <input type="date" value={passenger.birthdate || ''}
                              onChange={(e) => updatePassenger(index, 'birthdate', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <button onClick={() => removePassenger(index)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{passenger.name}</p>
                          {(passenger.passport || passenger.birthdate) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {passenger.passport && `Passport: ${passenger.passport}`}
                              {passenger.passport && passenger.birthdate && ' • '}
                              {passenger.birthdate && `DOB: ${passenger.birthdate}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instruction */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Instruction</h2>
              {isEditing ? (
                <textarea value={displayData.special || ''} rows={4}
                  onChange={(e) => setFormData({ ...formData, special: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.special || '-'}</p>
              )}
            </div>

            {/* Financial Summary */}
            {!isEditing && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Cost</dt>
                    <dd className="text-sm font-medium text-gray-900">${order.totalCost.toFixed(2)}</dd>
                  </div>
                  {order.discount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Discount</dt>
                        <dd className="text-sm font-medium text-orange-600">-${order.discount.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-gray-200">
                        <dt className="text-sm font-semibold text-gray-700">Amount Due</dt>
                        <dd className="text-sm font-bold text-gray-900">${order.totalAfterDiscount.toFixed(2)}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Paid</dt>
                    <dd className="text-sm font-medium text-green-600">${order.paid.toFixed(2)}</dd>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <dt className="text-base font-medium text-gray-900">Outstanding</dt>
                    <dd className={`text-base font-semibold ${order.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${order.outstanding.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Booking Order</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete booking #{order.bookingNumber}? This action cannot be undone and will delete all related items, passengers, and payment records.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Make Payment Modal */}
        <MakePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingId={order.id}
          bookingNumber={order.bookingNumber}
          customerName={order.customerName}
          tour={order.tour || 'N/A'}
          totalAmount={totalAmount}
          onPaymentAdded={loadOrder}
        />
      </div>
    </div>
  )
}
