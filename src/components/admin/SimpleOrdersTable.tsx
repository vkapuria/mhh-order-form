'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  full_name: string
  email: string
  service_type: string
  subject: string
  document_type: string
  pages: number
  deadline: string
  reference_style: string
  instructions: string
  total_price: number
  base_price: number
  discount_amount: number
  rush_fee: number
  status: string
  created_at: string
  country: string
  has_files: boolean
}

interface FileAttachment {
  file_name: string
  file_size: number
  r2_url: string
}

export default function SimpleOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [files, setFiles] = useState<Record<string, FileAttachment[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Get orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Get files for all orders
      const { data: filesData, error: filesError } = await supabase
        .from('file_attachments')
        .select('order_id, file_name, file_size, r2_url')

      if (filesError) throw filesError

      // Group files by order_id
      const filesByOrder: Record<string, FileAttachment[]> = {}
      filesData?.forEach(file => {
        if (!filesByOrder[file.order_id]) {
          filesByOrder[file.order_id] = []
        }
        filesByOrder[file.order_id].push(file)
      })

      setOrders(ordersData || [])
      setFiles(filesByOrder)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.full_name.toLowerCase().includes(search.toLowerCase()) ||
    order.email.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  )

  // Format date as "22 Aug 2025"
  const formatVerboseDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get country flag emoji
  const getCountryFlag = (country: string) => {
    const flagMap: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'India': '🇮🇳',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Poland': '🇵🇱',
      'Ireland': '🇮🇪',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'South Africa': '🇿🇦',
      'New Zealand': '🇳🇿',
      'Singapore': '🇸🇬',
      'Malaysia': '🇲🇾',
      'Philippines': '🇵🇭',
      'Thailand': '🇹🇭',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Colombia': '🇨🇴',
      'Peru': '🇵🇪',
      'Unknown': '🌍'
    }
    return flagMap[country] || '🌍'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const OrderDetailsModal = ({ order }: { order: Order }) => {
    const orderFiles = files[order.id] || []

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Order Details - #{order.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{order.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{order.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Country:</span>
                  <p className="font-medium">{getCountryFlag(order.country)} {order.country}</p>
                </div>
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <p className="font-medium">{formatVerboseDate(order.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Assignment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Service:</span>
                  <p className="font-medium capitalize">{order.service_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Subject:</span>
                  <p className="font-medium capitalize">{order.subject}</p>
                </div>
                <div>
                  <span className="text-gray-500">Document Type:</span>
                  <p className="font-medium capitalize">{order.document_type?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pages:</span>
                  <p className="font-medium">{order.pages} pages</p>
                </div>
                <div>
                  <span className="text-gray-500">Deadline:</span>
                  <p className="font-medium">{order.deadline} days</p>
                </div>
                <div>
                  <span className="text-gray-500">Reference Style:</span>
                  <p className="font-medium uppercase">{order.reference_style}</p>
                </div>
              </div>
              
              {order.instructions && (
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Instructions:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                    {order.instructions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>${order.base_price?.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${order.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                {order.rush_fee > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Rush Fee:</span>
                    <span>+${order.rush_fee?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${order.total_price?.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          {orderFiles.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Uploaded Files ({orderFiles.length})</h3>
                <div className="space-y-2">
                  {orderFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{file.file_name}</p>
                        <p className="text-xs text-gray-500">{(file.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.r2_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Order ID</th>
                <th className="text-left py-3 px-2">Customer</th>
                <th className="text-left py-3 px-2">Service</th>
                <th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Country</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium">{order.full_name}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="capitalize">{order.service_type}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-semibold text-green-600">
                      ${order.total_price?.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm">{formatVerboseDate(order.created_at)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(order.country)}</span>
                      <span className="text-sm">{order.country}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </DialogTrigger>
                      <OrderDetailsModal order={order} />
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? 'No orders found matching your search.' : 'No orders yet.'}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            Showing {filteredOrders.length} of {orders.length} orders • 
            Total value: ${filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0).toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}