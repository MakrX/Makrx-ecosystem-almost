"use client";

import React, { useState, useEffect, useRef } from "react";
import { withAuth } from "@/contexts/AuthContext";
import QRCode from 'qrcode';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Save,
  Settings,
  Filter,
  Tag,
  Search,
  FolderPlus,
  Layers,
  X,
  Check,
  AlertTriangle,
  QrCode,
  Download,
  Eye,
  Copy
} from "lucide-react";

// Types for our admin system
interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  subcategories: string[];
  featured: boolean;
  productCount: number;
}

interface AdminFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'toggle' | 'multiselect';
  options?: { value: string; label: string; count?: number }[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  helpText?: string;
  categories: string[];
}

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount: number;
  brand: string;
  model: string;
  sku: string;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications: { [key: string]: string | number };
  compatibility: string[];
  featured: boolean;
  popular: boolean;
  newArrival: boolean;
  onSale: boolean;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass: 'standard' | 'express' | 'oversized';
  warranty: string;
  origin: string;
}

interface QRCodeData {
  id: string;
  type: 'product' | 'project' | 'category';
  title: string;
  content: string;
  data: any;
  qrCodeUrl: string;
  createdAt: string;
  expiresAt?: string;
}

type AdminTab = 'categories' | 'filters' | 'products' | 'qrcodes';

function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [filters, setFilters] = useState<AdminFilter[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/placeholder.svg',
    icon: 'package',
    subcategories: '',
    featured: false
  });

  // Filter management state
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState<AdminFilter | null>(null);
  const [filterForm, setFilterForm] = useState({
    name: '',
    type: 'checkbox' as const,
    options: '',
    min: 0,
    max: 100,
    unit: '',
    required: false,
    helpText: '',
    categories: [] as string[]
  });

  // Product management state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    price: 0,
    originalPrice: 0,
    inStock: true,
    stockCount: 0,
    brand: '',
    model: '',
    sku: '',
    images: '/placeholder.svg',
    tags: '',
    specifications: '',
    compatibility: '',
    featured: false,
    popular: false,
    newArrival: false,
    onSale: false,
    weight: 0,
    dimensions: '{"length": 0, "width": 0, "height": 0}',
    shippingClass: 'standard' as const,
    warranty: '',
    origin: ''
  });

  // QR Code management state
  const [showQRForm, setShowQRForm] = useState(false);
  const [qrForm, setQrForm] = useState({
    type: 'product' as const,
    title: '',
    productId: '',
    categoryId: '',
    customData: '',
    includeWarehouse: false,
    includeBilling: false,
    includeInventory: false,
    expirationDays: 0
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    // Load existing data from localStorage or API
    const savedCategories = localStorage.getItem('admin_categories');
    const savedFilters = localStorage.getItem('admin_filters');
    const savedProducts = localStorage.getItem('admin_products');
    const savedQRCodes = localStorage.getItem('admin_qrcodes');

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedQRCodes) {
      setQrCodes(JSON.parse(savedQRCodes));
    }
    setLoading(false);
  };

  const saveToStorage = (type: string, data: any) => {
    localStorage.setItem(type, JSON.stringify(data));
  };

  // Category Management Functions
  const handleSaveCategory = () => {
    const newCategory: AdminCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      description: categoryForm.description,
      image: categoryForm.image,
      icon: categoryForm.icon,
      subcategories: categoryForm.subcategories.split(',').map(s => s.trim()).filter(Boolean),
      featured: categoryForm.featured,
      productCount: 0
    };

    let updatedCategories;
    if (editingCategory) {
      updatedCategories = categories.map(cat => cat.id === editingCategory.id ? newCategory : cat);
    } else {
      updatedCategories = [...categories, newCategory];
    }

    setCategories(updatedCategories);
    saveToStorage('admin_categories', updatedCategories);
    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image: '/placeholder.svg',
      icon: 'package',
      subcategories: '',
      featured: false
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleEditCategory = (category: AdminCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      subcategories: category.subcategories.join(', '),
      featured: category.featured
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      saveToStorage('admin_categories', updatedCategories);
    }
  };

  // Filter Management Functions
  const handleSaveFilter = () => {
    const newFilter: AdminFilter = {
      id: editingFilter?.id || Date.now().toString(),
      name: filterForm.name,
      type: filterForm.type,
      options: filterForm.options ? filterForm.options.split('\n').map(line => {
        const [value, label] = line.split('|');
        return { value: value.trim(), label: (label || value).trim() };
      }) : undefined,
      min: filterForm.min,
      max: filterForm.max,
      unit: filterForm.unit,
      required: filterForm.required,
      helpText: filterForm.helpText,
      categories: filterForm.categories
    };

    let updatedFilters;
    if (editingFilter) {
      updatedFilters = filters.map(filter => filter.id === editingFilter.id ? newFilter : filter);
    } else {
      updatedFilters = [...filters, newFilter];
    }

    setFilters(updatedFilters);
    saveToStorage('admin_filters', updatedFilters);
    resetFilterForm();
  };

  const resetFilterForm = () => {
    setFilterForm({
      name: '',
      type: 'checkbox',
      options: '',
      min: 0,
      max: 100,
      unit: '',
      required: false,
      helpText: '',
      categories: []
    });
    setEditingFilter(null);
    setShowFilterForm(false);
  };

  const handleEditFilter = (filter: AdminFilter) => {
    setEditingFilter(filter);
    setFilterForm({
      name: filter.name,
      type: filter.type,
      options: filter.options ? filter.options.map(opt => `${opt.value}|${opt.label}`).join('\n') : '',
      min: filter.min || 0,
      max: filter.max || 100,
      unit: filter.unit || '',
      required: filter.required || false,
      helpText: filter.helpText || '',
      categories: filter.categories || []
    });
    setShowFilterForm(true);
  };

  const handleDeleteFilter = (filterId: string) => {
    if (confirm('Are you sure you want to delete this filter?')) {
      const updatedFilters = filters.filter(filter => filter.id !== filterId);
      setFilters(updatedFilters);
      saveToStorage('admin_filters', updatedFilters);
    }
  };

  // Product Management Functions
  const handleSaveProduct = () => {
    try {
      const newProduct: AdminProduct = {
        id: editingProduct?.id || Date.now().toString(),
        name: productForm.name,
        description: productForm.description,
        shortDescription: productForm.shortDescription,
        category: productForm.category,
        subcategory: productForm.subcategory,
        price: productForm.price,
        originalPrice: productForm.originalPrice || undefined,
        inStock: productForm.inStock,
        stockCount: productForm.stockCount,
        brand: productForm.brand,
        model: productForm.model,
        sku: productForm.sku,
        images: productForm.images.split(',').map(s => s.trim()).filter(Boolean),
        rating: 4.5,
        reviewCount: 0,
        tags: productForm.tags.split(',').map(s => s.trim()).filter(Boolean),
        specifications: productForm.specifications ? JSON.parse(productForm.specifications) : {},
        compatibility: productForm.compatibility.split(',').map(s => s.trim()).filter(Boolean),
        featured: productForm.featured,
        popular: productForm.popular,
        newArrival: productForm.newArrival,
        onSale: productForm.onSale,
        weight: productForm.weight,
        dimensions: JSON.parse(productForm.dimensions),
        shippingClass: productForm.shippingClass,
        warranty: productForm.warranty,
        origin: productForm.origin
      };

      let updatedProducts;
      if (editingProduct) {
        updatedProducts = products.map(prod => prod.id === editingProduct.id ? newProduct : prod);
      } else {
        updatedProducts = [...products, newProduct];
      }

      setProducts(updatedProducts);
      saveToStorage('admin_products', updatedProducts);
      
      // Update category product count
      const updatedCategories = categories.map(cat => {
        if (cat.slug === newProduct.category) {
          return { ...cat, productCount: cat.productCount + (editingProduct ? 0 : 1) };
        }
        return cat;
      });
      setCategories(updatedCategories);
      saveToStorage('admin_categories', updatedCategories);
      
      resetProductForm();
    } catch (error) {
      alert('Error saving product. Please check your JSON format in specifications and dimensions.');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      subcategory: '',
      price: 0,
      originalPrice: 0,
      inStock: true,
      stockCount: 0,
      brand: '',
      model: '',
      sku: '',
      images: '/placeholder.svg',
      tags: '',
      specifications: '',
      compatibility: '',
      featured: false,
      popular: false,
      newArrival: false,
      onSale: false,
      weight: 0,
      dimensions: '{"length": 0, "width": 0, "height": 0}',
      shippingClass: 'standard',
      warranty: '',
      origin: ''
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      inStock: product.inStock,
      stockCount: product.stockCount,
      brand: product.brand,
      model: product.model,
      sku: product.sku,
      images: product.images.join(', '),
      tags: product.tags.join(', '),
      specifications: JSON.stringify(product.specifications, null, 2),
      compatibility: product.compatibility.join(', '),
      featured: product.featured,
      popular: product.popular,
      newArrival: product.newArrival,
      onSale: product.onSale,
      weight: product.weight,
      dimensions: JSON.stringify(product.dimensions, null, 2),
      shippingClass: product.shippingClass,
      warranty: product.warranty,
      origin: product.origin
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(prod => prod.id !== productId);
      setProducts(updatedProducts);
      saveToStorage('admin_products', updatedProducts);
    }
  };

  // QR Code Management Functions
  const generateQRCode = async (data: any): Promise<string> => {
    try {
      const qrData = JSON.stringify(data);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleSaveQRCode = async () => {
    try {
      let qrData: any = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: qrForm.type,
        makrx_verified: true
      };

      if (qrForm.type === 'product' && qrForm.productId) {
        const product = products.find(p => p.id === qrForm.productId);
        if (product) {
          qrData = {
            ...qrData,
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              category: product.category,
              price: product.price,
              brand: product.brand,
              model: product.model
            },
            warehouse: qrForm.includeWarehouse,
            billing: qrForm.includeBilling,
            inventory: qrForm.includeInventory
          };
        }
      } else if (qrForm.type === 'category' && qrForm.categoryId) {
        const category = categories.find(c => c.id === qrForm.categoryId);
        if (category) {
          qrData = {
            ...qrData,
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description
            }
          };
        }
      } else if (qrForm.type === 'project') {
        qrData = {
          ...qrData,
          project: JSON.parse(qrForm.customData || '{}')
        };
      }

      const qrCodeUrl = await generateQRCode(qrData);

      const newQRCode: QRCodeData = {
        id: Date.now().toString(),
        type: qrForm.type,
        title: qrForm.title || `${qrForm.type.charAt(0).toUpperCase()}${qrForm.type.slice(1)} QR Code`,
        content: JSON.stringify(qrData, null, 2),
        data: qrData,
        qrCodeUrl,
        createdAt: new Date().toISOString(),
        expiresAt: qrForm.expirationDays > 0
          ? new Date(Date.now() + qrForm.expirationDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined
      };

      const updatedQRCodes = [...qrCodes, newQRCode];
      setQrCodes(updatedQRCodes);
      saveToStorage('admin_qrcodes', updatedQRCodes);
      resetQRForm();
    } catch (error) {
      alert('Error generating QR code. Please check your data.');
    }
  };

  const resetQRForm = () => {
    setQrForm({
      type: 'product',
      title: '',
      productId: '',
      categoryId: '',
      customData: '',
      includeWarehouse: false,
      includeBilling: false,
      includeInventory: false,
      expirationDays: 0
    });
    setShowQRForm(false);
  };

  const handleDeleteQRCode = (qrId: string) => {
    if (confirm('Are you sure you want to delete this QR code?')) {
      const updatedQRCodes = qrCodes.filter(qr => qr.id !== qrId);
      setQrCodes(updatedQRCodes);
      saveToStorage('admin_qrcodes', updatedQRCodes);
    }
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.download = `qr-${qrCode.type}-${qrCode.id}.png`;
    link.href = qrCode.qrCodeUrl;
    link.click();
  };

  const copyQRData = (qrCode: QRCodeData) => {
    navigator.clipboard.writeText(qrCode.content);
    alert('QR code data copied to clipboard!');
  };

  // Filter data based on search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFilters = filters.filter(filter => 
    filter.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQRCodes = qrCodes.filter(qr =>
    qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                MakrX Store Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage categories, filters, and products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'categories', label: 'Categories', icon: FolderPlus },
              { id: 'filters', label: 'Filters', icon: Filter },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'qrcodes', label: 'QR Codes', icon: QrCode }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'categories') setShowCategoryForm(true);
              else if (activeTab === 'filters') setShowFilterForm(true);
              else if (activeTab === 'products') setShowProductForm(true);
              else if (activeTab === 'qrcodes') setShowQRForm(true);
            }}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'qrcodes' ? 'Generate QR Code' : `Add ${activeTab.slice(0, -1)}`}
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.productCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFilters.map((filter) => (
                    <tr key={filter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{filter.name}</div>
                          {filter.helpText && (
                            <div className="text-sm text-gray-500">{filter.helpText}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="capitalize">{filter.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filter.categories.join(', ') || 'All'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          filter.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {filter.required ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditFilter(filter)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFilter(filter.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stockCount} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QR Codes Tab */}
        {activeTab === 'qrcodes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">QR Codes</h2>
              <p className="text-gray-600 mt-1">Generate QR codes for products, categories, and projects</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQRCodes.map((qrCode) => (
                    <tr key={qrCode.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={qrCode.qrCodeUrl}
                          alt="QR Code"
                          className="h-12 w-12 rounded border"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{qrCode.title}</div>
                        <div className="text-sm text-gray-500">ID: {qrCode.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          qrCode.type === 'product' ? 'bg-blue-100 text-blue-800' :
                          qrCode.type === 'category' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(qrCode.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qrCode.expiresAt ? new Date(qrCode.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => downloadQRCode(qrCode)}
                            className="text-green-600 hover:text-green-900"
                            title="Download QR Code"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyQRData(qrCode)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Copy QR Data"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQRCode(qrCode.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete QR Code"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredQRCodes.length === 0 && (
                <div className="text-center py-12">
                  <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No QR codes generated yet</p>
                  <p className="text-sm text-gray-500">Click "Generate QR Code" to create your first QR code</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={resetCategoryForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategories (comma-separated)</label>
                <input
                  type="text"
                  value={categoryForm.subcategories}
                  onChange={(e) => setCategoryForm({...categoryForm, subcategories: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="sub1, sub2, sub3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={categoryForm.featured}
                  onChange={(e) => setCategoryForm({...categoryForm, featured: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Category</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetCategoryForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Form Modal */}
      {showFilterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingFilter ? 'Edit Filter' : 'Add Filter'}
              </h3>
              <button onClick={resetFilterForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name</label>
                <input
                  type="text"
                  value={filterForm.name}
                  onChange={(e) => setFilterForm({...filterForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Filter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
                <select
                  value={filterForm.type}
                  onChange={(e) => setFilterForm({...filterForm, type: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="checkbox">Checkbox</option>
                  <option value="select">Select</option>
                  <option value="range">Range</option>
                  <option value="toggle">Toggle</option>
                  <option value="multiselect">Multi-select</option>
                </select>
              </div>
              {(filterForm.type === 'checkbox' || filterForm.type === 'select' || filterForm.type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (one per line, format: value|label)
                  </label>
                  <textarea
                    value={filterForm.options}
                    onChange={(e) => setFilterForm({...filterForm, options: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={5}
                    placeholder="option1|Option 1 Label&#10;option2|Option 2 Label"
                  />
                </div>
              )}
              {filterForm.type === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                    <input
                      type="number"
                      value={filterForm.min}
                      onChange={(e) => setFilterForm({...filterForm, min: parseInt(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                    <input
                      type="number"
                      value={filterForm.max}
                      onChange={(e) => setFilterForm({...filterForm, max: parseInt(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (optional)</label>
                <input
                  type="text"
                  value={filterForm.unit}
                  onChange={(e) => setFilterForm({...filterForm, unit: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., $, mm, kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Help Text (optional)</label>
                <input
                  type="text"
                  value={filterForm.helpText}
                  onChange={(e) => setFilterForm({...filterForm, helpText: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Additional help text for users"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apply to Categories</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterForm.categories.includes(category.slug)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterForm({
                              ...filterForm,
                              categories: [...filterForm.categories, category.slug]
                            });
                          } else {
                            setFilterForm({
                              ...filterForm,
                              categories: filterForm.categories.filter(c => c !== category.slug)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={filterForm.required}
                  onChange={(e) => setFilterForm({...filterForm, required: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">Required Filter</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetFilterForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={resetProductForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Brand name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={productForm.model}
                  onChange={(e) => setProductForm({...productForm, model: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Product model"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Product SKU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                <input
                  type="number"
                  value={productForm.stockCount}
                  onChange={(e) => setProductForm({...productForm, stockCount: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Brief product description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Detailed product description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (comma-separated URLs)</label>
                <input
                  type="text"
                  value={productForm.images}
                  onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="/placeholder.svg, /image2.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (JSON format)</label>
                <textarea
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({...productForm, specifications: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder='{"Material": "Steel", "Diameter": "8mm"}'
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Compatibility (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.compatibility}
                  onChange={(e) => setProductForm({...productForm, compatibility: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Product 1, Product 2, Product 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.weight}
                  onChange={(e) => setProductForm({...productForm, weight: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (JSON format)</label>
                <input
                  type="text"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder='{"length": 100, "width": 50, "height": 25}'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Class</label>
                <select
                  value={productForm.shippingClass}
                  onChange={(e) => setProductForm({...productForm, shippingClass: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="oversized">Oversized</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                <input
                  type="text"
                  value={productForm.warranty}
                  onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="1 year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  value={productForm.origin}
                  onChange={(e) => setProductForm({...productForm, origin: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Country of origin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <input
                  type="text"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Subcategory"
                />
              </div>
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={(e) => setProductForm({...productForm, inStock: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.popular}
                      onChange={(e) => setProductForm({...productForm, popular: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Popular</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.newArrival}
                      onChange={(e) => setProductForm({...productForm, newArrival: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">New Arrival</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.onSale}
                      onChange={(e) => setProductForm({...productForm, onSale: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetProductForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Form Modal */}
      {showQRForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate QR Code</h3>
              <button onClick={resetQRForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={qrForm.title}
                  onChange={(e) => setQrForm({...qrForm, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="QR Code title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Type</label>
                <select
                  value={qrForm.type}
                  onChange={(e) => setQrForm({...qrForm, type: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="product">Product QR Code</option>
                  <option value="category">Category QR Code</option>
                  <option value="project">Custom Project QR Code</option>
                </select>
              </div>

              {qrForm.type === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                    <select
                      value={qrForm.productId}
                      onChange={(e) => setQrForm({...qrForm, productId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Include Features</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeWarehouse}
                          onChange={(e) => setQrForm({...qrForm, includeWarehouse: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Warehouse Management (Billing In/Out)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeBilling}
                          onChange={(e) => setQrForm({...qrForm, includeBilling: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Billing Integration</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={qrForm.includeInventory}
                          onChange={(e) => setQrForm({...qrForm, includeInventory: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm">Makerspace Inventory Add</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {qrForm.type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                  <select
                    value={qrForm.categoryId}
                    onChange={(e) => setQrForm({...qrForm, categoryId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {qrForm.type === 'project' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Project Data (JSON format)
                  </label>
                  <textarea
                    value={qrForm.customData}
                    onChange={(e) => setQrForm({...qrForm, customData: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={6}
                    placeholder='{"project_name": "My Project", "description": "Project description", "components": []}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter project data in JSON format. This will be embedded in the QR code.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (days, 0 = never expires)
                </label>
                <input
                  type="number"
                  min="0"
                  value={qrForm.expirationDays}
                  onChange={(e) => setQrForm({...qrForm, expirationDays: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetQRForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQRCode}
                disabled={
                  (qrForm.type === 'product' && !qrForm.productId) ||
                  (qrForm.type === 'category' && !qrForm.categoryId) ||
                  (qrForm.type === 'project' && !qrForm.customData)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default withAuth(AdminManagementPage, ["admin"]);
