'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, TrendingUp, Package, User, ArrowRight, X } from 'lucide-react'
import { products, categories, searchProducts, type Product } from '@/data/products'

interface SearchResult {
  type: 'product' | 'category' | 'brand' | 'suggestion'
  id: string
  title: string
  subtitle?: string
  image?: string
  price?: number
  category?: string
  url: string
}

interface SmartSearchProps {
  placeholder?: string
  onClose?: () => void
  autoFocus?: boolean
  className?: string
}

export default function SmartSearch({ 
  placeholder = "Search products, brands, or parts...", 
  onClose,
  autoFocus = false,
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches] = useState<string[]>(['Prusa MK4', 'PLA filament', 'Arduino UNO'])
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Synonyms and query understanding
  const synonymMap: { [key: string]: string[] } = {
    'pla-lw': ['lightweight pla', 'pla lw', 'light pla'],
    'fdm': ['fused deposition modeling', 'fused deposition', 'filament printer'],
    'sla': ['stereolithography', 'resin printer', 'resin'],
    'cnc': ['computer numerical control', 'milling', 'machining'],
    'pcb': ['printed circuit board', 'circuit board', 'board'],
    'mcu': ['microcontroller', 'microcontroller unit', 'controller'],
    'iot': ['internet of things', 'connected device', 'smart device']
  }

  // Expand query with synonyms
  const expandQuery = (searchTerm: string): string[] => {
    const terms = [searchTerm.toLowerCase()]
    
    Object.entries(synonymMap).forEach(([key, synonyms]) => {
      if (synonyms.some(synonym => searchTerm.toLowerCase().includes(synonym))) {
        terms.push(key)
      }
      if (searchTerm.toLowerCase().includes(key)) {
        terms.push(...synonyms)
      }
    })
    
    return terms
  }

  // Smart search function
  const performSearch = async (searchTerm: string): Promise<SearchResult[]> => {
    if (!searchTerm.trim()) return []
    
    setIsLoading(true)
    const results: SearchResult[] = []
    const expandedTerms = expandQuery(searchTerm)
    
    // Search products
    const foundProducts = products.filter(product => {
      return expandedTerms.some(term =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.tags.some(tag => tag.toLowerCase().includes(term)) ||
        product.sku.toLowerCase().includes(term)
      )
    }).slice(0, 6)

    foundProducts.forEach(product => {
      results.push({
        type: 'product',
        id: product.id,
        title: product.name,
        subtitle: `${product.brand} • $${product.price}`,
        image: product.images[0],
        price: product.price,
        category: product.category,
        url: `/product/${product.id}`
      })
    })

    // Search categories
    const foundCategories = categories.filter(category =>
      expandedTerms.some(term =>
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term)
      )
    ).slice(0, 3)

    foundCategories.forEach(category => {
      results.push({
        type: 'category',
        id: category.id,
        title: category.name,
        subtitle: `${category.productCount} products`,
        url: `/catalog/${category.slug}`
      })
    })

    // Search brands
    const brands = [...new Set(products.map(p => p.brand))]
    const foundBrands = brands.filter(brand =>
      expandedTerms.some(term => brand.toLowerCase().includes(term))
    ).slice(0, 2)

    foundBrands.forEach(brand => {
      const brandProducts = products.filter(p => p.brand === brand).length
      results.push({
        type: 'brand',
        id: brand.toLowerCase().replace(/\s+/g, '-'),
        title: brand,
        subtitle: `${brandProducts} products`,
        url: `/catalog?brand=${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`
      })
    })

    // Add search suggestions if few results
    if (results.length < 3) {
      const suggestions = [
        '3d printers',
        'arduino projects',
        'raspberry pi kits',
        'pla filament',
        'maker tools'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !results.some(r => r.title.toLowerCase().includes(suggestion))
      ).slice(0, 2)

      suggestions.forEach(suggestion => {
        results.push({
          type: 'suggestion',
          id: suggestion,
          title: suggestion,
          subtitle: 'Search suggestion',
          url: `/catalog?q=${encodeURIComponent(suggestion)}`
        })
      })
    }

    setIsLoading(false)
    return results
  }

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const searchResults = await performSearch(query)
        setResults(searchResults)
        setSelectedIndex(-1)
      } else {
        setResults([])
        setSelectedIndex(-1)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          } else if (query.trim()) {
            handleSearch()
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          inputRef.current?.blur()
          onClose?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, results, query])

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
    onClose?.()
  }

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
      onClose?.()
    }
  }

  const handleRecentSearch = (search: string) => {
    setQuery(search)
    inputRef.current?.focus()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return Package
      case 'category': return Package
      case 'brand': return User
      case 'suggestion': return TrendingUp
      default: return Search
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-store-primary focus:border-store-primary bg-white text-store-text font-medium transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-store-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
        >
          {query.trim() === '' ? (
            /* Empty State - Recent Searches */
            <div className="p-4">
              <h3 className="text-sm font-medium text-store-text mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-store-text-light">{search}</span>
                  </button>
                ))}
              </div>
              
              <h3 className="text-sm font-medium text-store-text mb-3 mt-6 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popular Searches
              </h3>
              <div className="space-y-2">
                {['3D Printers', 'Arduino Kits', 'PLA Filament', 'Raspberry Pi'].map((popular, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(popular)}
                    className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-store-text-light">{popular}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Search Results */
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type)
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`flex items-center w-full p-3 text-left rounded-lg transition-colors ${
                      selectedIndex === index ? 'bg-store-primary text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.title}
                        className="w-10 h-10 object-cover rounded-lg mr-3"
                      />
                    ) : (
                      <div className={`p-2 rounded-lg mr-3 ${
                        selectedIndex === index ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          selectedIndex === index ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className={`text-sm truncate ${
                          selectedIndex === index ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <ArrowRight className={`h-4 w-4 ml-2 ${
                      selectedIndex === index ? 'text-white' : 'text-gray-400'
                    }`} />
                  </button>
                )
              })}
              
              {/* Search All Results */}
              <button
                onClick={handleSearch}
                className={`flex items-center w-full p-3 text-left rounded-lg mt-2 border-t border-gray-200 transition-colors ${
                  selectedIndex === results.length ? 'bg-store-primary text-white' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${
                  selectedIndex === results.length ? 'bg-white/20' : 'bg-store-primary'
                }`}>
                  <Search className={`h-4 w-4 ${
                    selectedIndex === results.length ? 'text-white' : 'text-white'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Search for "{query}"</div>
                  <div className={`text-sm ${
                    selectedIndex === results.length ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    View all results
                  </div>
                </div>
                <ArrowRight className={`h-4 w-4 ml-2 ${
                  selectedIndex === results.length ? 'text-white' : 'text-gray-400'
                }`} />
              </button>
            </div>
          ) : query.length > 2 ? (
            /* No Results */
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-store-text mb-2">No results found</h3>
              <p className="text-store-text-muted mb-4">
                Try different keywords or check your spelling
              </p>
              <button
                onClick={handleSearch}
                className="text-store-primary hover:text-store-primary-dark font-medium"
              >
                Search anyway →
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// Global search hook for keyboard shortcut
export function useGlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isSearchOpen, setIsSearchOpen }
}
