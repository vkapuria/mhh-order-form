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
  brand?: string
}

interface SimpleOrdersTableProps {
  brandFilter: 'all' | 'MHH' | 'DMH'
}

interface FileAttachment {
  file_name: string
  file_size: number
  r2_url: string
}

export default function SimpleOrdersTable({ brandFilter }: SimpleOrdersTableProps) {
  const [allOrders, setAllOrders] = useState<Order[]>([]) // Store ALL orders
  const [files, setFiles] = useState<Record<string, FileAttachment[]>>({})
  const [abandonments, setAbandonments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // FETCH DATA ONLY ONCE - no dependencies
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Get ALL orders (no filtering at database level)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Get files
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

      // Get abandonments
      const { data: abandData, error: abandError } = await supabase
        .from('form_abandonment')
        .select('*')
        .order('last_activity', { ascending: false })
        .limit(10)
      
      if (abandError) throw abandError

      setAllOrders(ordersData || [])
      setFiles(filesByOrder)
      setAbandonments(abandData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // FILTER IN MEMORY - no database calls
  const filteredOrdersByBrand = allOrders.filter(order => {
    if (brandFilter === 'MHH') return order.brand === 'MHH'
    if (brandFilter === 'DMH') return order.brand === 'DMH'
    return true // 'all' shows everything
  })

  const filteredOrders = filteredOrdersByBrand.filter(order => 
    order.full_name.toLowerCase().includes(search.toLowerCase()) ||
    order.email.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  )

  // All your other functions remain the same...
  const formatVerboseDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

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

  const getBrandColor = (brand: string | undefined) => {
    switch (brand) {
      case 'MHH': return 'bg-blue-100 text-blue-800'
      case 'DMH': return 'bg-green-100 text-green-800'
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
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <Badge className={getBrandColor(order.brand)}>
                    {order.brand || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Rest of modal content same as before... */}
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
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">📉 Recent Form Abandonments</h3>
          {abandonments.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent abandonments</p>
          ) : (
            <div className="space-y-2">
              {abandonments.slice(0, 5).map((abandon) => (
                <div key={abandon.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <span className="font-medium">{abandon.full_name || 'Unknown'} ({abandon.email})</span>
                    {abandon.service_type && (
                      <span className="ml-2 text-gray-500">• {abandon.service_type}</span>
                    )}
                  </div>
                  <div className="text-right text-gray-500">
                    <div>Step: {abandon.current_step}</div>
                    <div className="text-xs">
                      {formatVerboseDate(abandon.last_activity)}
                      {abandon.admin_notified && <span className="ml-2 text-green-600">✓ Alerted</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Input
              placeholder="Search by name, email, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
  
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Service</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Brand</th>
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
                      <Badge className={getBrandColor(order.brand)}>
                        {order.brand || 'Unknown'}
                      </Badge>
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
  
          {filteredOrders.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
              Showing {filteredOrders.length} of {filteredOrdersByBrand.length} orders • 
              Total value: ${filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0).toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}