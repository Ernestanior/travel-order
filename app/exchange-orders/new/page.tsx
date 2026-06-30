'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Search, X, Plus, Trash2 } from 'lucide-react'
import { notification } from 'antd'

interface BookingOrder {
  id: number
  bookingNumber: string
  customerName: string
  date: string
  departureDate: string
  arrivalDate: string
  tour: string
  totalCost: number
}

interface BookingItem {
  item: string
  quantity: number
  unitPrice: number
  price: number
}

interface Supplier {
  id: string
  name: string
  tel: string
  address?: string
}

export default function NewExchangeOrderPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [step, setStep] = useState<'selectBooking' | 'fillDetails'>('selectBooking')
  
  // Step 1: 选择 Booking Order
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingOrders, setBookingOrders] = useState<BookingOrder[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null)
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([])
  
  // Step 2: 填写 Exchange 详情
  const [supplierSearch, setSupplierSearch] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [items, setItems] = useState<{ item: string; quantity: number; unitPrice: number; price: number }[]>([
    { item: '', quantity: 1, unitPrice: 0, price: 0 }
  ])
  
  const [formData, setFormData] = useState({
    exchangeDate: new Date().toISOString().split('T')[0],
    supplier: '',
    supplierAddress: '',
    supplierTel: '',
    notes: '',
    // 这些会从 Booking 自动填充
    customer: '',
    tour: '',
    tourCode: '',
    departureDate: '',
    departureTime: '',
    departureFlight: '',
    departureDest: '',
    departureDate2: '',
    departureTime2: '',
    departureFlight2: '',
    departureDest2: '',
    departureDate3: '',
    departureTime3: '',
    departureFlight3: '',
    departureDest3: '',
    arrivalDate: '',
    arrivalTime: '',
    arrivalFlight: '',
    arrivalDest: '',
    arrivalDate2: '',
    arrivalTime2: '',
    arrivalFlight2: '',
    arrivalDest2: '',
    arrivalDate3: '',
    arrivalTime3: '',
    arrivalFlight3: '',
    arrivalDest3: '',
  })

  // 搜索 Booking Orders
  const searchBookings = async () => {
    if (!bookingSearch) return
    
    setLoadingBookings(true)
    try {
      const params = new URLSearchParams()
      params.set('searchType', 'all')
      params.set('limit', '50')
      
      // 同时按booking number和customer搜索
      // API会返回匹配任一条件的结果
      params.set('bookingNumber', bookingSearch)
      params.set('customer', bookingSearch)
      
      const response = await fetch(`/api/booking-orders?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setBookingOrders(result.data)
      } else {
        setBookingOrders([])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      setBookingOrders([])
    } finally {
      setLoadingBookings(false)
    }
  }

  // 加载供应商列表
  useEffect(() => {
    if (supplierSearch && supplierSearch.length > 0) {
      loadSuppliers()
    } else {
      setSuppliers([])
      setShowSupplierDropdown(false)
    }
  }, [supplierSearch])

  const loadSuppliers = async () => {
    try {
      const params = new URLSearchParams()
      params.set('search', supplierSearch)
      params.set('limit', '10')
      
      const response = await fetch(`/api/suppliers?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setSuppliers(result.data)
      } else if (Array.isArray(result)) {
        setSuppliers(result)
      }
      setShowSupplierDropdown(true)
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  // 选择 Booking Order
  const handleSelectBooking = async (booking: BookingOrder) => {
    setSelectedBooking(booking)
    
    // 加载完整的 booking 详情以获取所有字段
    try {
      const response = await fetch(`/api/booking-orders/${booking.id}`)
      const fullBooking = await response.json()
      
      // 存储 booking items（仅供参考显示）
      setBookingItems(fullBooking.items || [])
      
      // Exchange Order 的 items 不从 Booking Order 复制
      // 因为 Exchange Order 是发给供应商的，items 与 Booking Order 不同
      // 保持空白，让用户自己填写
      setItems([{ item: '', quantity: 1, unitPrice: 0, price: 0 }])
      
      // 自动填充表单
      setFormData({
        ...formData,
        customer: fullBooking.customerName || '',
        tour: fullBooking.tour || '',
        tourCode: fullBooking.tourCode || '',
        departureDate: fullBooking.departureDate || '',
        departureTime: fullBooking.departureTime || '',
        departureFlight: fullBooking.departureFlight || '',
        departureDest: fullBooking.departureDest || '',
        departureDate2: fullBooking.departureDate2 || '',
        departureTime2: fullBooking.departureTime2 || '',
        departureFlight2: fullBooking.departureFlight2 || '',
        departureDest2: fullBooking.departureDest2 || '',
        departureDate3: fullBooking.departureDate3 || '',
        departureTime3: fullBooking.departureTime3 || '',
        departureFlight3: fullBooking.departureFlight3 || '',
        departureDest3: fullBooking.departureDest3 || '',
        arrivalDate: fullBooking.arrivalDate || '',
        arrivalTime: fullBooking.arrivalTime || '',
        arrivalFlight: fullBooking.arrivalFlight || '',
        arrivalDest: fullBooking.arrivalDest || '',
        arrivalDate2: fullBooking.arrivalDate2 || '',
        arrivalTime2: fullBooking.arrivalTime2 || '',
        arrivalFlight2: fullBooking.arrivalFlight2 || '',
        arrivalDest2: fullBooking.arrivalDest2 || '',
        arrivalDate3: fullBooking.arrivalDate3 || '',
        arrivalTime3: fullBooking.arrivalTime3 || '',
        arrivalFlight3: fullBooking.arrivalFlight3 || '',
        arrivalDest3: fullBooking.arrivalDest3 || '',
      })
      
      setStep('fillDetails')
    } catch (error) {
      console.error('Error loading booking details:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to load booking details',
        placement: 'topRight',
      })
    }
  }

  // Item 操作
  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, unitPrice: 0, price: 0 }])
  }

  const updateItem = (index: number, field: 'item' | 'quantity' | 'unitPrice', value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // 自动计算 price
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].price = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)

  // 保存 Exchange Order
  const handleSave = async () => {
    if (!selectedBooking) {
      notification.error({
        message: 'Validation Error',
        description: 'Please select a booking order',
        placement: 'topRight',
      })
      return
    }
    
    if (!formData.supplier) {
      notification.error({
        message: 'Validation Error',
        description: 'Please select a supplier',
        placement: 'topRight',
      })
      return
    }
    
    // 验证 items
    const validItems = items.filter(item => item.item.trim() !== '' && item.quantity > 0)
    if (validItems.length === 0) {
      notification.error({
        message: 'Validation Error',
        description: 'Please add at least one item',
        placement: 'topRight',
      })
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/exchange-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingNumber: selectedBooking.bookingNumber,
          exchangeDate: formData.exchangeDate,
          supplier: formData.supplier,
          items: validItems, // 发送 items 数组
          customer: formData.customer,
          tour: formData.tour,
          tourCode: formData.tourCode,
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
          departureFlight: formData.departureFlight,
          departureDest: formData.departureDest,
          departureDate2: formData.departureDate2,
          departureTime2: formData.departureTime2,
          departureFlight2: formData.departureFlight2,
          departureDest2: formData.departureDest2,
          departureDate3: formData.departureDate3,
          departureTime3: formData.departureTime3,
          departureFlight3: formData.departureFlight3,
          departureDest3: formData.departureDest3,
          arrivalDate: formData.arrivalDate,
          arrivalTime: formData.arrivalTime,
          arrivalFlight: formData.arrivalFlight,
          arrivalDest: formData.arrivalDest,
          arrivalDate2: formData.arrivalDate2,
          arrivalTime2: formData.arrivalTime2,
          arrivalFlight2: formData.arrivalFlight2,
          arrivalDest2: formData.arrivalDest2,
          arrivalDate3: formData.arrivalDate3,
          arrivalTime3: formData.arrivalTime3,
          arrivalFlight3: formData.arrivalFlight3,
          arrivalDest3: formData.arrivalDest3,
          notes: formData.notes,
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Exchange order created successfully! Exchange #: ${result.exchangeNumber}`,
          placement: 'topRight',
        })
        router.push(`/exchange-orders/${result.id}`)
      } else {
        notification.error({
          message: 'Failed to Create Exchange Order',
          description: result.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving:', error)
      notification.error({
        message: 'Error',
        description: 'Error creating exchange order',
        placement: 'topRight',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/exchange-orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Exchange Orders
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">New Exchange Order</h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 'selectBooking' 
                  ? 'Step 1: Select a Booking Order' 
                  : `Step 2: Create Exchange for Booking #${selectedBooking?.bookingNumber}`
                }
              </p>
            </div>
            
            {step === 'fillDetails' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStep('selectBooking')
                    setSelectedBooking(null)
                    setBookingItems([])
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Change Booking
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Exchange'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: 选择 Booking Order */}
        {step === 'selectBooking' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search and Select Booking Order</h2>
            
            {/* 搜索框 */}
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchBookings()}
                  placeholder="Search by customer name or booking number..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={searchBookings}
                  disabled={!bookingSearch || loadingBookings}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* 搜索结果 */}
            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-500">Searching...</p>
              </div>
            ) : bookingOrders.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">Found {bookingOrders.length} booking order(s)</p>
                <div className="space-y-3">
                  {bookingOrders.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => handleSelectBooking(booking)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Booking #{booking.bookingNumber}
                            </span>
                            <span className="text-sm text-gray-600">
                              {booking.customerName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-x-4">
                            <span>Tour: {booking.tour || 'N/A'}</span>
                            <span>Departure: {booking.departureDate || 'N/A'}</span>
                            <span className="font-medium text-gray-700">Total: ${booking.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium">
                            Select →
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : bookingSearch && !loadingBookings ? (
              <div className="text-center py-12">
                <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No booking orders found. Try a different search term.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Enter customer name or booking number to search</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 填写 Exchange 详情 */}
        {step === 'fillDetails' && selectedBooking && (
          <div className="space-y-6">
            {/* Selected Booking 信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Selected Booking Order</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Booking #:</span>
                  <span className="ml-2 font-medium text-blue-900">{selectedBooking.bookingNumber}</span>
                </div>
                <div>
                  <span className="text-blue-700">Customer:</span>
                  <span className="ml-2 font-medium text-blue-900">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-blue-700">Tour:</span>
                  <span className="ml-2 text-blue-900">{selectedBooking.tour || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-700">Total Cost:</span>
                  <span className="ml-2 font-medium text-blue-900">${selectedBooking.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 两列布局 - 与编辑页面一致 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Exchange Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Exchange Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Date</label>
                      <input
                        type="date"
                        value={formData.exchangeDate}
                        onChange={(e) => setFormData({ ...formData, exchangeDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={supplierSearch || formData.supplier}
                          onChange={(e) => {
                            setSupplierSearch(e.target.value)
                            setFormData({ ...formData, supplier: e.target.value })
                          }}
                          onFocus={() => setShowSupplierDropdown(true)}
                          placeholder="Type supplier name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {(supplierSearch || formData.supplier) && (
                          <button
                            onClick={() => {
                              setSupplierSearch('')
                              setFormData({ 
                                ...formData, 
                                supplier: '', 
                                supplierAddress: '', 
                                supplierTel: '' 
                              })
                              setShowSupplierDropdown(false)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* 供应商下拉列表 */}
                        {showSupplierDropdown && suppliers.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                            {suppliers.map((supplier) => (
                              <button
                                key={supplier.id}
                                onClick={() => {
                                  setFormData({ 
                                    ...formData, 
                                    supplier: supplier.name,
                                    supplierAddress: supplier.address || '',
                                    supplierTel: supplier.tel || ''
                                  })
                                  setSupplierSearch('')
                                  setShowSupplierDropdown(false)
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                              >
                                <div className="font-medium">{supplier.name}</div>
                                {supplier.tel && (
                                  <div className="text-xs text-gray-500">{supplier.tel}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Address</label>
                      <textarea
                        value={formData.supplierAddress}
                        onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Supplier address..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Tel</label>
                      <input
                        type="text"
                        value={formData.supplierTel}
                        onChange={(e) => setFormData({ ...formData, supplierTel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Supplier telephone..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer (from Booking)</label>
                      <p className="text-sm text-gray-900">{formData.customer || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                    <button
                      onClick={addItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No items</p>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-12 gap-2 items-start">
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={item.item}
                                onChange={(e) => updateItem(index, 'item', e.target.value)}
                                placeholder="Item name"
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={`$${item.price.toFixed(2)}`}
                                readOnly
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 font-medium"
                              />
                            </div>
                            <div className="col-span-1 flex items-center">
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
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
                  
                      {/* Departure 1 - Always visible */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Departure 1</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="date"
                            value={formData.departureDate}
                            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Time"
                          />
                          <input
                            type="text"
                            value={formData.departureFlight}
                            onChange={(e) => setFormData({ ...formData, departureFlight: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Flight"
                          />
                          <input
                            type="text"
                            value={formData.departureDest}
                            onChange={(e) => setFormData({ ...formData, departureDest: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Dest"
                          />
                        </div>
                      </div>
                      
                      {/* Departure 2 - Shows when Departure 1 has date */}
                      {formData.departureDate && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Departure 2</span>
                            <button
                              onClick={() => setFormData({ 
                                ...formData, 
                                departureDate2: '', 
                                departureTime2: '', 
                                departureFlight2: '', 
                                departureDest2: '' 
                              })}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="date"
                              value={formData.departureDate2}
                              onChange={(e) => setFormData({ ...formData, departureDate2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={formData.departureTime2}
                              onChange={(e) => setFormData({ ...formData, departureTime2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={formData.departureFlight2}
                              onChange={(e) => setFormData({ ...formData, departureFlight2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Flight"
                            />
                            <input
                              type="text"
                              value={formData.departureDest2}
                              onChange={(e) => setFormData({ ...formData, departureDest2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Dest"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Departure 3 - Shows when Departure 2 has date */}
                      {formData.departureDate2 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Departure 3</span>
                            <button
                              onClick={() => setFormData({ 
                                ...formData, 
                                departureDate3: '', 
                                departureTime3: '', 
                                departureFlight3: '', 
                                departureDest3: '' 
                              })}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="date"
                              value={formData.departureDate3}
                              onChange={(e) => setFormData({ ...formData, departureDate3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={formData.departureTime3}
                              onChange={(e) => setFormData({ ...formData, departureTime3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={formData.departureFlight3}
                              onChange={(e) => setFormData({ ...formData, departureFlight3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Flight"
                            />
                            <input
                              type="text"
                              value={formData.departureDest3}
                              onChange={(e) => setFormData({ ...formData, departureDest3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Dest"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Arrivals */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Arrivals</h3>
                      
                      {/* Arrival 1 - Always visible */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Arrival 1</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="date"
                            value={formData.arrivalDate}
                            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            value={formData.arrivalTime}
                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Time"
                          />
                          <input
                            type="text"
                            value={formData.arrivalFlight}
                            onChange={(e) => setFormData({ ...formData, arrivalFlight: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Flight"
                          />
                          <input
                            type="text"
                            value={formData.arrivalDest}
                            onChange={(e) => setFormData({ ...formData, arrivalDest: e.target.value })}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Dest"
                          />
                        </div>
                      </div>
                      
                      {/* Arrival 2 - Shows when Arrival 1 has date */}
                      {formData.arrivalDate && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Arrival 2</span>
                            <button
                              onClick={() => setFormData({ 
                                ...formData, 
                                arrivalDate2: '', 
                                arrivalTime2: '', 
                                arrivalFlight2: '', 
                                arrivalDest2: '' 
                              })}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="date"
                              value={formData.arrivalDate2}
                              onChange={(e) => setFormData({ ...formData, arrivalDate2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={formData.arrivalTime2}
                              onChange={(e) => setFormData({ ...formData, arrivalTime2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={formData.arrivalFlight2}
                              onChange={(e) => setFormData({ ...formData, arrivalFlight2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Flight"
                            />
                            <input
                              type="text"
                              value={formData.arrivalDest2}
                              onChange={(e) => setFormData({ ...formData, arrivalDest2: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Dest"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Arrival 3 - Shows when Arrival 2 has date */}
                      {formData.arrivalDate2 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Arrival 3</span>
                            <button
                              onClick={() => setFormData({ 
                                ...formData, 
                                arrivalDate3: '', 
                                arrivalTime3: '', 
                                arrivalFlight3: '', 
                                arrivalDest3: '' 
                              })}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="date"
                              value={formData.arrivalDate3}
                              onChange={(e) => setFormData({ ...formData, arrivalDate3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={formData.arrivalTime3}
                              onChange={(e) => setFormData({ ...formData, arrivalTime3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={formData.arrivalFlight3}
                              onChange={(e) => setFormData({ ...formData, arrivalFlight3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Flight"
                            />
                            <input
                              type="text"
                              value={formData.arrivalDest3}
                              onChange={(e) => setFormData({ ...formData, arrivalDest3: e.target.value })}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                              placeholder="Dest"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes - 移到两列布局之外 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Add any notes or special instructions..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
