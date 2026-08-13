'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'
import { notification, Modal } from 'antd'

interface Template {
  id: number
  name: string
  description: string | null
  customer: string
  tel: string
  email: string | null
  tourcode: string | null
  tour: string | null
  items: Array<{ item: string; quantity: number; unitprice: number; price: number }>
  passengers: Array<{ paxname: string }>
  createdAt: string
  updatedAt: string
}

export default function BookingTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/booking-templates')
      const result = await response.json()
      
      if (result.data) {
        setTemplates(result.data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to load templates',
        placement: 'topRight',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (template: Template) => {
    Modal.confirm({
      title: 'Delete Template',
      content: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/booking-templates/${template.id}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            notification.success({
              message: 'Success',
              description: 'Template deleted successfully',
              placement: 'topRight',
            })
            loadTemplates()
          } else {
            throw new Error('Failed to delete')
          }
        } catch (error) {
          console.error('Error deleting template:', error)
          notification.error({
            message: 'Error',
            description: 'Failed to delete template',
            placement: 'topRight',
          })
        }
      }
    })
  }

  const handleCreateFromTemplate = (template: Template) => {
    router.push(`/booking-orders/new?templateId=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Booking Templates</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create and manage order templates for quick booking
              </p>
            </div>
            
            <Link
              href="/booking-templates/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Link>
          </div>
        </div>

        {/* Templates List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first template to speed up your booking process
            </p>
            <Link
              href="/booking-templates/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Customer:</span>{' '}
                    <span className="font-medium text-gray-900">{template.customer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tel:</span>{' '}
                    <span className="text-gray-700">{template.tel}</span>
                  </div>
                  {template.tourcode && (
                    <div>
                      <span className="text-gray-500">Tour Code:</span>{' '}
                      <span className="text-gray-700">{template.tourcode}</span>
                    </div>
                  )}
                  {template.tour && (
                    <div>
                      <span className="text-gray-500">Tour:</span>{' '}
                      <span className="text-gray-700">{template.tour}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span>{template.items.length} items</span>
                  <span>•</span>
                  <span>{template.passengers.length} passengers</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateFromTemplate(template)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create Order
                  </button>
                  <Link
                    href={`/booking-templates/${template.id}/edit`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(template)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
