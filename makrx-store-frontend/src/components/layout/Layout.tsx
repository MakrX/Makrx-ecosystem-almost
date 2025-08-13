'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './Header'
import Footer from './Footer'
import KeyboardShortcutsProvider from '@/components/KeyboardShortcuts'

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export default function Layout({ children, showHeader = true, showFooter = true }: LayoutProps) {
  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {showHeader && <Header />}
        <main className="flex-1">
          {children}
        </main>
        {showFooter && <Footer />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    </KeyboardShortcutsProvider>
  )
}
