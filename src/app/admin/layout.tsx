'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      setError('')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
    setPassword('')
  }

  // Show loading state during hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🔒 DoMyHomework Admin</CardTitle>
            <p className="text-center text-sm text-gray-600">Enter password to access dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Admin Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                🔓 Login to Admin
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Authorized personnel only
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show admin dashboard if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">🎓 DoMyHomework Admin</h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            🚪 Logout
          </Button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}