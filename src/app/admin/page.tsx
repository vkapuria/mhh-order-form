
'use client'

import { useState } from 'react'
import SimpleOrdersTable from '@/components/admin/SimpleOrdersTable'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkAbandonment = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/check-abandonments', { method: 'POST' })
      const data = await response.json()
      setResult(data)
      console.log('Abandonment check result:', data)
    } catch (error) {
      console.error('Error checking abandonments:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
        <p className="text-gray-600">View all customer order submissions</p>
      </div>

      {/* Abandonment Check Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">🚨 Check Form Abandonments</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Manually check for users who abandoned the form and need follow-up
        </p>
        <Button 
          onClick={checkAbandonment} 
          disabled={checking}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {checking ? 'Checking...' : 'Check Abandonments Now'}
        </Button>
        
        {result && (
          <div className="mt-3 p-2 bg-white border rounded text-sm">
            <strong>Result:</strong> Found {result.abandonments} abandonments
            {result.processed?.length > 0 && (
              <ul className="mt-1">
                {result.processed.map((p: any, i: number) => (
                  <li key={i}>• {p.email} (step: {p.step})</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      <SimpleOrdersTable />
    </div>
  )
}