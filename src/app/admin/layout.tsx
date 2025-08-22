import SimpleOrdersTable from '@/components/admin/SimpleOrdersTable'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
        <p className="text-gray-600">View all customer order submissions</p>
      </div>
      
      <SimpleOrdersTable />
    </div>
  )
}