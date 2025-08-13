'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface AdminAuthProps {
  onAuthenticated: () => void
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Simple demo admin password - in production this would be proper authentication
  const ADMIN_PASSWORD = 'admin123'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (password === ADMIN_PASSWORD) {
        // Store authentication in localStorage (simple demo)
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_auth_time', Date.now().toString())
        onAuthenticated()
      } else {
        setError('Invalid password. Please try again.')
        setPassword('')
      }
    } catch (error) {
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-store-primary to-store-secondary rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-store-text">
            Admin Access Required
          </h2>
          <p className="mt-2 text-sm text-store-text-muted">
            Please enter the admin password to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`relative block w-full px-4 py-3 border-2 rounded-lg placeholder-gray-500 text-store-text font-medium focus:outline-none focus:ring-2 focus:ring-store-primary focus:border-store-primary ${
                  error ? 'border-store-error bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-store-error flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full font-semibold"
              size="lg"
              disabled={isLoading || !password.trim()}
              loading={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </div>

          {/* Demo info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Use password "admin123" to access the admin panel.
              In production, this would be replaced with proper authentication.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper function to check if user is authenticated
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const isAuth = localStorage.getItem('admin_authenticated')
  const authTime = localStorage.getItem('admin_auth_time')
  
  if (!isAuth || !authTime) return false
  
  // Session expires after 24 hours
  const authTimestamp = parseInt(authTime)
  const now = Date.now()
  const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
  
  if (now - authTimestamp > sessionDuration) {
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_auth_time')
    return false
  }
  
  return isAuth === 'true'
}

// Helper function to logout admin
export function logoutAdmin(): void {
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_auth_time')
}
