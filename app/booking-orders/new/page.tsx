'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { notification } from 'antd'

interface Customer {
  id: string
  name: string
  tel: string
  address?: string
  fax?: string
  email?: string
}

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

export default function NewBookingOrderPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  // Customer search
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    customerName: '',
    address: '',
    tel: '',
    fax: '',
    email: '',
    discount: 0,
    staff: '',
    tourCode: '',
    tour: '',
    special: '',
    
    // Departure
    departureDate: '',
    departureTime: '',
    departureFlight: '',
    departureDest: '',
    departureDate2: '',
    departureTime2: '',
    departureFlight2: '',
    departureDest2: '',
    
    // Arrival
    arrivalDate: '',
    arrivalTime: '',
    arrivalFlight: '',
    arrivalDest: '',
    arrivalDate2: '',
    arrivalTime2: '',
    arrivalFlight2: '',
    arrivalDest2: '',
  })
  
  const [items, setItems] = useState<Item[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])
  
  // Load customers when searching
  const loadCustomers = async (search: string) => {
    if (!search || search.length < 2) {
      setCustomers([])
      setShowCustomerDropdown(false)
      return
    }
    
    try {
      const params = new URLSearchParams()
      params.set('search', search)
      params.set('limit', '10')
      
      const response = await fetch(`/api/customers?${params}`)
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        setCustomers(result.data)
        setShowCustomerDropdown(true)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }
  
  // Select customer from dropdown
  const selectCustomer = (customer: Customer) => {
    setFormData({
      ...formData,
      customerName: customer.name,
      tel: customer.tel || '',
      address: customer.address || '',
      fax: customer.fax || '',
      email: customer.email || ''
    })
    setCustomerSearch('')
    setShowCustomerDropdown(false)
  }
  
  // Items 管理
  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, unitPrice: 0, price: 0 }])
  }
  
  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // 自动计算总价
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].price = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }
  
  // Passengers 管理
  const addPassenger = () => {
    setPassengers([...passengers, { name: '', passport: '', birthdate: '' }])
  }
  
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
  }
  
  const removePassenger = (index: number) => {
    setPassengers(passengers.filter((_, i) => i !== index))
  }
  
  // 计算总金额
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
  
  // 保存订单
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.customerName || !formData.tel) {
      notification.error({
        message: 'Validation Error',
        description: 'Please fill in Customer Name and Tel/HP (required fields)',
        placement: 'topRight',
      })
      return
    }
    
    if (items.length === 0) {
      notification.error({
        message: 'Validation Error',
        description: 'Please add at least one item',
        placement: 'topRight',
      })
      return
    }
    
    if (passengers.length === 0) {
      notification.error({
        message: 'Validation Error',
        description: 'Please add at least one passenger',
        placement: 'topRight',
      })
      return
    }
    
    // 验证每个 passenger 必须有 name
    const emptyPassenger = passengers.find(p => !p.name || p.name.trim() === '')
    if (emptyPassenger) {
      notification.error({
        message: 'Validation Error',
        description: 'All passengers must have a name',
        placement: 'topRight',
      })
      return
    }
    
    // 验证至少有 Tour Code 或 Tour Description
    if (!formData.tourCode && !formData.tour) {
      notification.error({
        message: 'Validation Error',
        description: 'Please fill in Tour Code or Tour Description',
        placement: 'topRight',
      })
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/booking-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          passengers
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Booking created successfully! Booking #: ${result.bookingNumber}`,
          placement: 'topRight',
        })
        router.push(`/booking-orders/${result.id}`)
      } else {
        notification.error({
          message: 'Failed to Create Booking',
          description: result.error || 'Unknown error',
          placement: 'topRight',
        })
      }
    } catch (error) {
      console.error('Error saving:', error)
      notification.error({
        message: 'Error',
        description: 'Error creating booking',
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
            href="/booking-orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Booking Orders
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">New Booking Order</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create a new booking order
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/booking-orders"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Booking'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Customer & Items */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearch || formData.customerName}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value)
                        setFormData({ ...formData, customerName: e.target.value })
                        loadCustomers(e.target.value)
                      }}
                      onFocus={() => {
                        if (customerSearch.length >= 2) {
                          loadCustomers(customerSearch)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Type to search or enter new customer"
                      required
                    />
                    
                    {/* Customer dropdown */}
                    {showCustomerDropdown && customers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {customers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => selectCustomer(customer)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">
                              Tel: {customer.tel} {customer.email && `• Email: ${customer.email}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Start typing to search existing customers or enter a new name
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tel / HP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tel}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fax
                    </label>
                    <input
                      type="text"
                      value={formData.fax}
                      onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Fax number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff
                    </label>
                    <input
                      type="text"
                      value={formData.staff}
                      onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Staff name"
                    />
                  </div>
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
                <p className="text-sm text-gray-500 text-center py-8">
                  No items added. Click "Add Item" to add items.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => updateItem(index, 'item', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="e.g., Air Ticket"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            value={`$${item.price.toFixed(2)}`}
                            readOnly
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 font-medium"
                          />
                        </div>
                        
                        <div className="col-span-1 flex items-end">
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

          {/* Right Column - Tour & Passengers */}
          <div className="space-y-6">
            {/* Tour Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tour Information <span className="text-sm text-red-500">(At least one required)</span>
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Code
                    </label>
                    <input
                      type="text"
                      value={formData.tourCode}
                      onChange={(e) => setFormData({ ...formData, tourCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., TW001"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Description
                  </label>
                  <input
                    type="text"
                    value={formData.tour}
                    onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., TW AIR TKT TO ICN BY SQ"
                  />
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Information</h2>
              
              <div className="space-y-4">
                {/* Departure */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Departure</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Date"
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

                {/* Departure 2 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Departure 2 (Optional)</h3>
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
                    />
                    <input
                      type="text"
                      value={formData.departureFlight2}
                      onChange={(e) => setFormData({ ...formData, departureFlight2: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.departureDest2}
                      onChange={(e) => setFormData({ ...formData, departureDest2: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Arrival */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Arrival</h3>
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
                    />
                    <input
                      type="text"
                      value={formData.arrivalFlight}
                      onChange={(e) => setFormData({ ...formData, arrivalFlight: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.arrivalDest}
                      onChange={(e) => setFormData({ ...formData, arrivalDest: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Arrival 2 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Arrival 2 (Optional)</h3>
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
                    />
                    <input
                      type="text"
                      value={formData.arrivalFlight2}
                      onChange={(e) => setFormData({ ...formData, arrivalFlight2: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.arrivalDest2}
                      onChange={(e) => setFormData({ ...formData, arrivalDest2: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Passengers</h2>
                <button
                  onClick={addPassenger}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Passenger
                </button>
              </div>
              
              {passengers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No passengers added. Click "Add Passenger" to add passengers.
                </p>
              ) : (
                <div className="space-y-3">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Passenger name (required)"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Passport (Optional)
                          </label>
                          <input
                            type="text"
                            value={passenger.passport}
                            onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Passport #"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Birth Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={passenger.birthdate}
                            onChange={(e) => updatePassenger(index, 'birthdate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-1 flex items-end pb-2">
                          <button
                            onClick={() => removePassenger(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instruction */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Instruction</h2>
              <textarea
                value={formData.special}
                onChange={(e) => setFormData({ ...formData, special: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter any special instructions or notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
