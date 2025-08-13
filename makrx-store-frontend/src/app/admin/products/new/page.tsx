'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import AdminAuth, { isAdminAuthenticated } from '@/components/AdminAuth'
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X,
  Plus,
  Minus,
  Eye,
  AlertCircle
} from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    brand: '',
    tags: [],
    specifications: [],
    images: []
  })
  const [currentTag, setCurrentTag] = useState('')
  const [currentSpec, setCurrentSpec] = useState({ key: '', value: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated()
      if (!authenticated) {
        router.push('/admin')
        return
      }
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-store-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-store-text-muted">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />
  }

  const categories = [
    { value: '3d-printers', label: '3D Printers' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'tools', label: 'Tools & Hardware' },
    { value: 'components', label: 'Components' },
    { value: 'materials', label: 'Materials' },
    { value: 'kits', label: 'Kits & Bundles' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addSpecification = () => {
    if (currentSpec.key.trim() && currentSpec.value.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, { ...currentSpec }]
      }))
      setCurrentSpec({ key: '', value: '' })
    }
  }

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would make an API call here
      console.log('Product data:', formData)
      
      // Redirect to admin portal on success
      router.push('/admin?success=Product added successfully')
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // In a real app, you would upload these to a cloud storage service
    console.log('Image files:', files)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                  <p className="text-gray-600 mt-1">Add a new item to your catalog</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Enter product description"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="Enter brand name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                          }`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="SKU-001"
                      />
                      {errors.sku && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sku}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h2>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
                    <p className="text-gray-500 mb-4">Drag and drop or click to upload product images</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Choose Files</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tags */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        placeholder="Add tag"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={currentSpec.key}
                        onChange={(e) => setCurrentSpec(prev => ({ ...prev, key: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        placeholder="Key"
                      />
                      <input
                        type="text"
                        value={currentSpec.value}
                        onChange={(e) => setCurrentSpec(prev => ({ ...prev, value: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        placeholder="Value"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={addSpecification}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Specification
                    </Button>
                    
                    <div className="space-y-2">
                      {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{spec.key}:</span>{' '}
                            <span className="text-gray-600">{spec.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitLoading}
                    loading={isSubmitLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitLoading ? 'Adding Product...' : 'Add Product'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
