'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Scale, 
  Home, 
  Package,
  Keyboard,
  Command
} from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'G → H', description: 'Go to Home', icon: Home },
        { key: 'G → C', description: 'Go to Catalog', icon: Package },
        { key: 'G → Cart', description: 'Go to Cart', icon: ShoppingCart },
        { key: 'Esc', description: 'Close modals/overlays', icon: X }
      ]
    },
    {
      category: 'Search & Browse',
      shortcuts: [
        { key: '/', description: 'Focus search', icon: Search },
        { key: '⌘K', description: 'Open search (Mac)', icon: Search },
        { key: 'Ctrl+K', description: 'Open search (Windows)', icon: Search },
        { key: 'F', description: 'Toggle filters', icon: Filter },
        { key: '↑/↓', description: 'Navigate search results', icon: Search }
      ]
    },
    {
      category: 'Product Actions',
      shortcuts: [
        { key: 'A', description: 'Add to cart', icon: ShoppingCart },
        { key: 'W', description: 'Add to wishlist', icon: Heart },
        { key: 'C', description: 'Add to compare', icon: Scale },
        { key: 'Enter', description: 'Select/confirm action', icon: Command }
      ]
    },
    {
      category: 'View Controls',
      shortcuts: [
        { key: '1', description: 'Grid view', icon: Package },
        { key: '2', description: 'List view', icon: Package },
        { key: 'S → P', description: 'Sort by price', icon: Package },
        { key: 'S → R', description: 'Sort by rating', icon: Package }
      ]
    }
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-store-primary rounded-lg mr-3">
                <Keyboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-store-text">Keyboard Shortcuts</h2>
                <p className="text-store-text-muted">Navigate faster with these shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-store-text mb-4 flex items-center">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.shortcuts.map((shortcut, shortcutIndex) => {
                    const Icon = shortcut.icon
                    return (
                      <div
                        key={shortcutIndex}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                            <Icon className="h-4 w-4 text-store-primary" />
                          </div>
                          <span className="text-store-text font-medium">
                            {shortcut.description}
                          </span>
                        </div>
                        <kbd className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-mono text-store-text shadow-sm">
                          {shortcut.key}
                        </kbd>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-store-text mb-2">Pro Tips</h4>
            <ul className="text-sm text-store-text-light space-y-1">
              <li>• Press <kbd className="px-1 bg-white rounded border text-xs">?</kbd> anytime to open this shortcuts menu</li>
              <li>• Use Tab to navigate through form fields and buttons</li>
              <li>• Most shortcuts work on any page in the store</li>
              <li>• Shortcuts are disabled when typing in input fields</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center">
            <Button onClick={onClose} className="font-semibold">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Global keyboard shortcuts hook
export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()
      const metaKey = e.metaKey || e.ctrlKey

      switch (key) {
        case '?':
          e.preventDefault()
          setShowShortcuts(true)
          break
        
        case 'escape':
          e.preventDefault()
          setShowShortcuts(false)
          // Also close any open modals/overlays
          break

        case '/':
          e.preventDefault()
          // Focus search input
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
          break

        case 'k':
          if (metaKey) {
            e.preventDefault()
            // Open search modal (handled by SmartSearch component)
          }
          break

        case 'g':
          // Navigation shortcuts (g + h for home, g + c for catalog)
          e.preventDefault()
          const handleNavigation = (nextKey: string) => {
            const navigationHandler = (navE: KeyboardEvent) => {
              navE.preventDefault()
              switch (navE.key.toLowerCase()) {
                case 'h':
                  window.location.href = '/'
                  break
                case 'c':
                  window.location.href = '/catalog'
                  break
              }
              document.removeEventListener('keydown', navigationHandler)
            }
            document.addEventListener('keydown', navigationHandler)
            setTimeout(() => {
              document.removeEventListener('keydown', navigationHandler)
            }, 2000) // Remove listener after 2 seconds
          }
          handleNavigation(key)
          break

        case 'f':
          e.preventDefault()
          // Toggle filters (this would need to be implemented per page)
          const filterButton = document.querySelector('[data-filters-toggle]') as HTMLButtonElement
          if (filterButton) {
            filterButton.click()
          }
          break

        case 'a':
          e.preventDefault()
          // Add to cart (on product pages)
          const addToCartButton = document.querySelector('[data-add-to-cart]') as HTMLButtonElement
          if (addToCartButton && !addToCartButton.disabled) {
            addToCartButton.click()
          }
          break

        case 'w':
          e.preventDefault()
          // Add to wishlist
          const wishlistButton = document.querySelector('[data-wishlist]') as HTMLButtonElement
          if (wishlistButton) {
            wishlistButton.click()
          }
          break

        case '1':
          e.preventDefault()
          // Switch to grid view
          const gridViewButton = document.querySelector('[data-view="grid"]') as HTMLButtonElement
          if (gridViewButton) {
            gridViewButton.click()
          }
          break

        case '2':
          e.preventDefault()
          // Switch to list view
          const listViewButton = document.querySelector('[data-view="list"]') as HTMLButtonElement
          if (listViewButton) {
            listViewButton.click()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    showShortcuts,
    setShowShortcuts
  }
}

export default function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts()

  return (
    <>
      {children}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </>
  )
}
