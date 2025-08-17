import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateSTLFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.stl')) {
    return { valid: false, error: 'File must be an STL file' }
  }
  
  // Check file size (max 100MB for STL files)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' }
  }
  
  return { valid: true }
}

export function calculateShippingCost(weight: number, distance: number): number {
  // Basic shipping calculation
  const baseRate = 5.00
  const weightRate = weight * 0.50
  const distanceRate = distance * 0.01
  return Math.max(baseRate + weightRate + distanceRate, baseRate)
}

export function estimatePrintTime(volume: number, material: string): number {
  // Estimate print time in hours based on volume and material
  const baseRate = material === 'PLA' ? 0.5 : material === 'ABS' ? 0.7 : 0.9
  return Math.round((volume * baseRate) * 100) / 100
}

export function calculateMaterialCost(volume: number, material: string): number {
  // Calculate material cost based on volume and material type
  const materialCosts = {
    PLA: 0.025, // per cm³
    ABS: 0.030,
    PETG: 0.035,
    TPU: 0.050,
    'Wood Fill': 0.040,
    'Metal Fill': 0.080,
  }
  
  const costPerUnit = materialCosts[material as keyof typeof materialCosts] || 0.025
  return Math.round((volume * costPerUnit) * 100) / 100
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
