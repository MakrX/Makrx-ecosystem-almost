'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Filter,
  X,
  Grid3X3,
  List,
  Star,
  ShoppingCart,
  Heart,
  Scale,
  Eye,
  Package,
  Truck,
  ChevronDown,
  ArrowRight,
  Home
} from 'lucide-react'
import { products, categories, filters, filterProducts, sortProducts, type Product, getProductsByCategory } from '@/data/products'
import { getAllFiltersForCategory, type CategoryFilter } from '@/data/categoryFilters'

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorySlug = params.category as string
  
  // Find the category
  const category = categories.find(cat => cat.slug === categorySlug)
  
  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: any }>({
    category: [categorySlug]
  })
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Show filters by default on desktop, hide on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      setShowFilters(isDesktop);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [])
  const [compareList, setCompareList] = useState<string[]>([])

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categoryProductsCount, setCategoryProductsCount] = useState(0)

  // Update products when filters or search change
  useEffect(() => {
    // Get category products inside useEffect to avoid infinite loop
    const categoryProducts = getProductsByCategory(categorySlug)
    setCategoryProductsCount(categoryProducts.length)
    let filtered = categoryProducts

    // Apply search
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply filters (excluding category since we're already filtering by it)
    const filtersWithoutCategory = { ...selectedFilters }
    delete filtersWithoutCategory.category
    filtered = filterProducts(filtered, filtersWithoutCategory)

    // Apply sorting
    filtered = sortProducts(filtered, sortBy)

    setFilteredProducts(filtered)
  }, [searchQuery, selectedFilters, sortBy, categorySlug])

  const handleFilterChange = (filterId: string, value: any, checked?: boolean) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev }
      
      if (filterId === 'priceMin' || filterId === 'priceMax') {
        newFilters[filterId] = value
      } else {
        if (!newFilters[filterId]) newFilters[filterId] = []
        
        if (checked) {
          newFilters[filterId] = [...newFilters[filterId], value]
        } else {
          newFilters[filterId] = newFilters[filterId].filter((v: any) => v !== value)
        }
        
        if (newFilters[filterId].length === 0) {
          delete newFilters[filterId]
        }
      }
      
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters({ category: [categorySlug] })
    setSearchQuery('')
  }

  const toggleCompare = (productId: string) => {
    setCompareList(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : prev.length < 3 ? [...prev, productId] : prev
    )
  }

  const getActiveFilterCount = () => {
    const filtersWithoutCategory = { ...selectedFilters }
    delete filtersWithoutCategory.category
    return Object.keys(filtersWithoutCategory).length + (searchQuery ? 1 : 0)
  }

  // Get category-specific filters
  const categoryFilters = getAllFiltersForCategory(categorySlug)

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-store-text mb-2">Category Not Found</h1>
          <p className="text-store-text-muted mb-6">The category you're looking for doesn't exist.</p>
          <Link href="/catalog">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm text-store-text-light">
              <Link href="/" className="hover:text-store-primary">
                <Home className="h-4 w-4" />
              </Link>
              <ArrowRight className="h-3 w-3" />
              <Link href="/catalog" className="hover:text-store-primary">
                Catalog
              </Link>
              <ArrowRight className="h-3 w-3" />
              <span className="text-store-text font-medium">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-6">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-store-text mb-2">{category.name}</h1>
                <p className="text-lg text-store-text-muted mb-4">{category.description}</p>
                <div className="flex items-center gap-4 text-sm text-store-text-light">
                  <span>{category.productCount} products</span>
                  <span>•</span>
                  <span>Free shipping on orders over ₹6,225</span>
                  <span>•</span>
                  <span>Expert support available</span>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-store-text mb-3">Shop by Type:</h3>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcat) => (
                    <Link key={subcat} href={`/catalog/${categorySlug}?subcat=${subcat}`}>
                      <Button variant="outline" size="sm" className="capitalize">
                        {subcat.replace('-', ' ')}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-store-primary focus:border-store-primary bg-white text-store-text font-medium"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:hidden ${showFilters ? 'bg-store-primary text-white' : ''} relative`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-store-error text-white text-xs rounded-full flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </div>

            {/* Results and Sort */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-store-text-light">
                  <span className="font-semibold text-store-text">{filteredProducts.length}</span> of {categoryProductsCount} products
                  {searchQuery && <span> matching "{searchQuery}"</span>}
                </p>
                
                {/* Active Filters */}
                {getActiveFilterCount() > 0 && (
                  <div className="flex items-center gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-store-primary text-white">
                        Search: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-store-primary text-white' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-store-primary text-white' : 'text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-store-primary focus:border-store-primary bg-white text-store-text"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-store-text">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {categoryFilters.map(filter => (
                    <div key={filter.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-store-text">{filter.name}</h4>
                        {filter.required && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Required</span>
                        )}
                      </div>

                      {filter.helpText && (
                        <p className="text-xs text-gray-500 mb-3">{filter.helpText}</p>
                      )}

                      {filter.type === 'checkbox' && filter.options && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filter.options.map(option => (
                            <label key={option.value} className="flex items-center hover:bg-gray-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedFilters[filter.id]?.includes(option.value) || false}
                                onChange={(e) => handleFilterChange(filter.id, option.value, e.target.checked)}
                                className="rounded border-gray-300 text-store-primary focus:ring-store-primary h-4 w-4"
                              />
                              <span className="ml-3 text-sm text-store-text-light flex-1">
                                {option.label}
                                {option.count && <span className="text-gray-400 ml-1">({option.count})</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {filter.type === 'multiselect' && filter.options && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filter.options.map(option => (
                            <label key={option.value} className="flex items-center hover:bg-gray-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedFilters[filter.id]?.includes(option.value) || false}
                                onChange={(e) => handleFilterChange(filter.id, option.value, e.target.checked)}
                                className="rounded border-gray-300 text-store-primary focus:ring-store-primary h-4 w-4"
                              />
                              <span className="ml-3 text-sm text-store-text-light flex-1">
                                {option.label}
                                {option.count && <span className="text-gray-400 ml-1">({option.count})</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {filter.type === 'range' && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                placeholder={`Min${filter.unit ? ` (${filter.unit})` : ''}`}
                                min={filter.min}
                                max={filter.max}
                                value={selectedFilters[`${filter.id}Min`] || ''}
                                onChange={(e) => handleFilterChange(`${filter.id}Min`, e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                placeholder={`Max${filter.unit ? ` (${filter.unit})` : ''}`}
                                min={filter.min}
                                max={filter.max}
                                value={selectedFilters[`${filter.id}Max`] || ''}
                                onChange={(e) => handleFilterChange(`${filter.id}Max`, e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                              />
                            </div>
                          </div>
                          {filter.min !== undefined && filter.max !== undefined && (
                            <div className="text-xs text-gray-500">
                              Range: {filter.min}{filter.unit} - {filter.max}{filter.unit}
                            </div>
                          )}
                        </div>
                      )}

                      {filter.type === 'select' && filter.options && (
                        <select
                          value={selectedFilters[filter.id]?.[0] || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleFilterChange(filter.id, e.target.value, true)
                            } else {
                              setSelectedFilters(prev => {
                                const newFilters = { ...prev }
                                delete newFilters[filter.id]
                                return newFilters
                              })
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-store-primary focus:border-store-primary"
                        >
                          <option value="">All {filter.name}</option>
                          {filter.options.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                              {option.count && ` (${option.count})`}
                            </option>
                          ))}
                        </select>
                      )}

                      {filter.type === 'toggle' && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters[filter.id]?.[0] === 'true' || false}
                            onChange={(e) => handleFilterChange(filter.id, e.target.checked ? 'true' : 'false', true)}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedFilters[filter.id]?.[0] === 'true'
                              ? 'bg-store-primary'
                              : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedFilters[filter.id]?.[0] === 'true'
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-3 text-sm text-store-text">{filter.name}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-store-text mb-2">No products found</h3>
                  <p className="text-store-text-muted mb-6">Try adjusting your search or filters</p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Grid View */}
                          <div className="relative">
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                            {product.onSale && (
                              <span className="absolute top-2 left-2 bg-store-error text-white px-2 py-1 rounded text-xs font-semibold">
                                Sale
                              </span>
                            )}
                            {product.newArrival && (
                              <span className="absolute top-2 right-2 bg-store-primary text-white px-2 py-1 rounded text-xs font-semibold">
                                New
                              </span>
                            )}
                            <div className="absolute bottom-2 right-2 flex gap-1">
                              <button 
                                onClick={() => toggleCompare(product.id)}
                                className={`p-2 rounded-full ${compareList.includes(product.id) ? 'bg-store-primary text-white' : 'bg-white/90 text-gray-600'} hover:bg-store-primary hover:text-white transition-colors`}
                              >
                                <Scale className="h-4 w-4" />
                              </button>
                              <button className="p-2 bg-white/90 rounded-full text-gray-600 hover:bg-white hover:text-red-500 transition-colors">
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-store-text text-sm leading-tight line-clamp-2">
                                {product.name}
                              </h3>
                              {!product.inStock && (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            <p className="text-store-text-muted text-xs mb-2 line-clamp-2">
                              {product.shortDescription}
                            </p>
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-store-text-muted ml-1">
                                ({product.reviewCount})
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-store-text">
                                  ${product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through">
                                    ${product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-green-600">
                                <Truck className="h-3 w-3 mr-1" />
                                Free shipping
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/p/${product.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs font-semibold"
                                disabled={!product.inStock}
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View - Same as main catalog */}
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 ml-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-store-text mb-1">{product.name}</h3>
                                <p className="text-store-text-muted text-sm mb-2">{product.shortDescription}</p>
                                <div className="flex items-center gap-4 text-xs text-store-text-light">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                    <span className="ml-1">({product.reviewCount})</span>
                                  </div>
                                  <span>SKU: {product.sku}</span>
                                  {product.inStock ? (
                                    <span className="text-green-600">In Stock ({product.stockCount})</span>
                                  ) : (
                                    <span className="text-red-600">Out of Stock</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-lg text-store-text">${product.price}</span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => toggleCompare(product.id)}
                                    className={`p-2 rounded ${compareList.includes(product.id) ? 'bg-store-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                                  >
                                    <Scale className="h-4 w-4" />
                                  </button>
                                  <button className="p-2 bg-gray-100 rounded text-gray-600 hover:text-red-500">
                                    <Heart className="h-4 w-4" />
                                  </button>
                                  <Link href={`/p/${product.id}`}>
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                  <Button size="sm" disabled={!product.inStock} className="font-semibold">
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compare Drawer */}
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-store-text">
                    Compare ({compareList.length}/3)
                  </span>
                  <div className="flex gap-2">
                    {compareList.map(productId => {
                      const product = products.find(p => p.id === productId)
                      return product ? (
                        <div key={productId} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
                          <span className="text-sm">{product.name}</span>
                          <button onClick={() => toggleCompare(productId)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCompareList([])}>
                    Clear All
                  </Button>
                  <Button disabled={compareList.length < 2}>
                    Compare Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
