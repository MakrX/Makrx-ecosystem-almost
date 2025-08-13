export interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  category: string
  subcategory: string
  price: number
  originalPrice?: number
  inStock: boolean
  stockCount: number
  brand: string
  model: string
  sku: string
  images: string[]
  rating: number
  reviewCount: number
  tags: string[]
  specifications: { [key: string]: string | number }
  compatibility: string[]
  featured: boolean
  popular: boolean
  newArrival: boolean
  onSale: boolean
  bundles?: string[]
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  shippingClass: 'standard' | 'express' | 'oversized'
  warranty: string
  origin: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  icon: string
  subcategories: string[]
  featured: boolean
  productCount: number
}

export interface Filter {
  id: string
  name: string
  type: 'checkbox' | 'range' | 'select' | 'toggle'
  options?: { value: string; label: string; count?: number }[]
  min?: number
  max?: number
  unit?: string
  category?: string[]
}

export const categories: Category[] = [
  {
    id: '3d-printers',
    name: '3D Printers',
    slug: '3d-printers',
    description: 'Professional and consumer 3D printers for all skill levels',
    image: '/placeholder.svg',
    icon: 'printer',
    subcategories: ['fdm-printers', 'resin-printers', 'industrial-printers'],
    featured: true,
    productCount: 156
  },
  {
    id: 'filament',
    name: 'Filament & Materials',
    slug: 'filament',
    description: 'High-quality 3D printing filaments and materials',
    image: '/placeholder.svg',
    icon: 'package',
    subcategories: ['pla-filament', 'abs-filament', 'petg-filament', 'specialty-filament'],
    featured: true,
    productCount: 432
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Arduino, Raspberry Pi, sensors, and electronic components',
    image: '/placeholder.svg',
    icon: 'cpu',
    subcategories: ['microcontrollers', 'sensors', 'displays', 'modules'],
    featured: true,
    productCount: 894
  },
  {
    id: 'tools',
    name: 'Tools & Hardware',
    slug: 'tools',
    description: 'Essential tools for makers and professionals',
    image: '/placeholder.svg',
    icon: 'wrench',
    subcategories: ['hand-tools', 'power-tools', 'measurement', 'hardware'],
    featured: true,
    productCount: 267
  },
  {
    id: 'components',
    name: 'Components',
    slug: 'components',
    description: 'Mechanical parts, fasteners, and building components',
    image: '/placeholder.svg',
    icon: 'package',
    subcategories: ['bearings', 'fasteners', 'motors', 'belts'],
    featured: false,
    productCount: 1234
  },
  {
    id: 'kits',
    name: 'Kits & Bundles',
    slug: 'kits',
    description: 'Complete starter kits and project bundles',
    image: '/placeholder.svg',
    icon: 'box',
    subcategories: ['starter-kits', 'project-kits', 'upgrade-kits'],
    featured: true,
    productCount: 89
  }
]

export const filters: Filter[] = [
  {
    id: 'category',
    name: 'Category',
    type: 'checkbox',
    options: categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      count: cat.productCount
    }))
  },
  {
    id: 'price',
    name: 'Price',
    type: 'range',
    min: 0,
    max: 5000,
    unit: '$'
  },
  {
    id: 'brand',
    name: 'Brand',
    type: 'checkbox',
    options: [
      { value: 'prusa', label: 'Prusa Research', count: 45 },
      { value: 'bambu', label: 'Bambu Lab', count: 38 },
      { value: 'arduino', label: 'Arduino', count: 156 },
      { value: 'raspberry-pi', label: 'Raspberry Pi', count: 67 },
      { value: 'elegoo', label: 'Elegoo', count: 89 },
      { value: 'creality', label: 'Creality', count: 124 },
      { value: 'ultimaker', label: 'Ultimaker', count: 23 }
    ]
  },
  {
    id: 'availability',
    name: 'Availability',
    type: 'checkbox',
    options: [
      { value: 'in-stock', label: 'In Stock', count: 2456 },
      { value: 'pre-order', label: 'Pre-order', count: 234 },
      { value: 'backorder', label: 'Backorder', count: 156 }
    ]
  },
  {
    id: 'compatibility',
    name: 'Compatibility',
    type: 'checkbox',
    category: ['3d-printers', 'filament'],
    options: [
      { value: 'bambu-x1', label: 'Bambu X1 Series', count: 234 },
      { value: 'prusa-mk4', label: 'Prusa MK4', count: 189 },
      { value: 'ender-3', label: 'Ender 3 Series', count: 445 },
      { value: 'ultimaker-s3', label: 'Ultimaker S3/S5', count: 67 }
    ]
  },
  {
    id: 'print-volume',
    name: 'Print Volume',
    type: 'select',
    category: ['3d-printers'],
    options: [
      { value: 'small', label: 'Small (< 200mm)', count: 45 },
      { value: 'medium', label: 'Medium (200-300mm)', count: 78 },
      { value: 'large', label: 'Large (> 300mm)', count: 33 }
    ]
  },
  {
    id: 'material-type',
    name: 'Material Type',
    type: 'checkbox',
    category: ['filament'],
    options: [
      { value: 'pla', label: 'PLA', count: 156 },
      { value: 'abs', label: 'ABS', count: 89 },
      { value: 'petg', label: 'PETG', count: 67 },
      { value: 'tpu', label: 'TPU (Flexible)', count: 34 },
      { value: 'wood', label: 'Wood Fill', count: 23 },
      { value: 'metal', label: 'Metal Fill', count: 12 }
    ]
  }
]

export const products: Product[] = [
  // 3D Printers
  {
    id: 'prusa-mk4',
    name: 'Prusa MK4 3D Printer',
    description: 'The latest flagship printer from Prusa Research featuring automatic bed leveling, advanced sensors, and exceptional print quality. Perfect for professionals and enthusiasts alike.',
    shortDescription: 'Professional-grade FDM printer with auto-leveling and advanced sensors',
    category: '3d-printers',
    subcategory: 'fdm-printers',
    price: 91217,
    originalPrice: 107817,
    inStock: true,
    stockCount: 15,
    brand: 'Prusa Research',
    model: 'MK4',
    sku: 'PRUSA-MK4-001',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.9,
    reviewCount: 847,
    tags: ['fdm', 'auto-leveling', 'professional', 'prusa', 'kit'],
    specifications: {
      'Print Volume': '250 × 210 × 220 mm',
      'Layer Height': '0.1 - 0.6 mm',
      'Print Speed': '200 mm/s',
      'Heated Bed': 'Yes (120°C)',
      'Auto Leveling': 'Yes',
      'Filament Diameter': '1.75 mm',
      'Connectivity': 'USB, Ethernet, WiFi',
      'Assembly': 'Kit (8-10 hours)'
    },
    compatibility: ['PLA', 'ABS', 'PETG', 'TPU', 'ASA'],
    featured: true,
    popular: true,
    newArrival: false,
    onSale: true,
    weight: 16.5,
    dimensions: { length: 550, width: 470, height: 470 },
    shippingClass: 'oversized',
    warranty: '2 years',
    origin: 'Czech Republic'
  },
  {
    id: 'bambu-x1-carbon',
    name: 'Bambu Lab X1 Carbon',
    description: 'Revolutionary 3D printer with automatic material system, AI-powered failure detection, and ultra-fast printing speeds. The future of 3D printing.',
    shortDescription: 'AI-powered printer with automatic material system and ultra-fast printing',
    category: '3d-printers',
    subcategory: 'fdm-printers',
    price: 116117,
    inStock: true,
    stockCount: 8,
    brand: 'Bambu Lab',
    model: 'X1 Carbon',
    sku: 'BAMBU-X1C-001',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 623,
    tags: ['fdm', 'ams', 'ai-detection', 'fast-printing', 'enclosed'],
    specifications: {
      'Print Volume': '256 × 256 × 256 mm',
      'Layer Height': '0.08 - 0.35 mm',
      'Print Speed': '500 mm/s',
      'Heated Bed': 'Yes (120°C)',
      'Enclosure': 'Yes',
      'AMS': 'Compatible',
      'AI Detection': 'Yes',
      'Connectivity': 'WiFi, Bambu Cloud'
    },
    compatibility: ['PLA', 'ABS', 'PETG', 'TPU', 'PC', 'PA', 'ASA'],
    featured: true,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 18.2,
    dimensions: { length: 389, width: 389, height: 457 },
    shippingClass: 'oversized',
    warranty: '1 year',
    origin: 'China'
  },
  {
    id: 'elegoo-mars-4-ultra',
    name: 'Elegoo Mars 4 Ultra',
    description: 'High-resolution resin 3D printer with 6K monochrome LCD and AI failure detection. Perfect for miniatures, jewelry, and detailed models.',
    shortDescription: '6K resin printer with AI detection for ultra-detailed prints',
    category: '3d-printers',
    subcategory: 'resin-printers',
    price: 24817,
    inStock: true,
    stockCount: 23,
    brand: 'Elegoo',
    model: 'Mars 4 Ultra',
    sku: 'ELEGOO-M4U-001',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 432,
    tags: ['resin', '6k', 'ai-detection', 'miniatures', 'high-detail'],
    specifications: {
      'Print Volume': '153.36 × 77.76 × 175 mm',
      'Layer Height': '0.01 - 0.2 mm',
      'LCD Resolution': '6480 × 3600',
      'Light Source': 'COB + Fresnel Lens',
      'Connectivity': 'USB',
      'AI Detection': 'Yes'
    },
    compatibility: ['Standard Resin', 'Tough Resin', 'Flexible Resin'],
    featured: false,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 6.8,
    dimensions: { length: 227, width: 227, height: 438 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'China'
  },

  // Filaments
  {
    id: 'prusament-pla-galaxy-silver',
    name: 'Prusament PLA Galaxy Silver',
    description: 'Premium PLA filament with unique galaxy sparkle effect. Excellent printability, vibrant colors, and consistent diameter tolerance.',
    shortDescription: 'Premium PLA with galaxy sparkle effect and excellent printability',
    category: 'filament',
    subcategory: 'pla-filament',
    price: 2738,
    inStock: true,
    stockCount: 156,
    brand: 'Prusa Research',
    model: 'Prusament PLA',
    sku: 'PRUSA-PLA-GAL-SIL',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 234,
    tags: ['pla', 'galaxy', 'sparkle', 'premium', '1.75mm'],
    specifications: {
      'Diameter': '1.75 mm ± 0.02 mm',
      'Weight': '1 kg',
      'Print Temperature': '215°C ± 10°C',
      'Bed Temperature': '60°C',
      'Color': 'Galaxy Silver',
      'Special Effect': 'Sparkle particles'
    },
    compatibility: ['Prusa MK4', 'Bambu X1', 'Ender 3', 'Most FDM printers'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 1.0,
    dimensions: { length: 200, width: 200, height: 70 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'Czech Republic'
  },
  {
    id: 'bambu-abs-matte-black',
    name: 'Bambu ABS Matte Black',
    description: 'High-quality ABS filament with matte finish. Excellent layer adhesion, chemical resistance, and perfect for functional parts.',
    shortDescription: 'Premium ABS with matte finish for functional parts',
    category: 'filament',
    subcategory: 'abs-filament',
    price: 2406,
    inStock: true,
    stockCount: 89,
    brand: 'Bambu Lab',
    model: 'ABS Matte',
    sku: 'BAMBU-ABS-MAT-BLK',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 156,
    tags: ['abs', 'matte', 'functional', 'chemical-resistant', '1.75mm'],
    specifications: {
      'Diameter': '1.75 mm ± 0.03 mm',
      'Weight': '1 kg',
      'Print Temperature': '260°C ± 10°C',
      'Bed Temperature': '90°C',
      'Finish': 'Matte',
      'Shore Hardness': 'D80'
    },
    compatibility: ['Bambu X1', 'Prusa MK4', 'Enclosed printers'],
    featured: false,
    popular: false,
    newArrival: true,
    onSale: false,
    weight: 1.0,
    dimensions: { length: 200, width: 200, height: 70 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'China'
  },

  // Electronics
  {
    id: 'arduino-uno-r4-wifi',
    name: 'Arduino UNO R4 WiFi',
    description: 'The latest Arduino UNO with built-in WiFi, improved performance, and enhanced connectivity. Perfect for IoT projects and learning.',
    shortDescription: 'Latest Arduino UNO with built-in WiFi and enhanced performance',
    category: 'electronics',
    subcategory: 'microcontrollers',
    price: 2283,
    inStock: true,
    stockCount: 234,
    brand: 'Arduino',
    model: 'UNO R4 WiFi',
    sku: 'ARDUINO-UNO-R4-WIFI',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.9,
    reviewCount: 1203,
    tags: ['arduino', 'microcontroller', 'wifi', 'iot', 'beginner-friendly'],
    specifications: {
      'Microcontroller': 'RA4M1 (Arm Cortex-M4)',
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '6',
      'WiFi': 'ESP32-S3',
      'USB': 'USB-C',
      'Flash Memory': '256 KB'
    },
    compatibility: ['Arduino IDE', 'PlatformIO', 'Most Arduino shields'],
    featured: true,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 0.025,
    dimensions: { length: 68.6, width: 53.4, height: 15 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'Italy'
  },
  {
    id: 'raspberry-pi-5-8gb',
    name: 'Raspberry Pi 5 8GB',
    description: 'The most powerful Raspberry Pi yet with 8GB RAM, improved performance, and enhanced connectivity options. Perfect for demanding projects.',
    shortDescription: 'Most powerful Raspberry Pi with 8GB RAM and enhanced performance',
    category: 'electronics',
    subcategory: 'microcontrollers',
    price: 7469,
    inStock: false,
    stockCount: 0,
    brand: 'Raspberry Pi Foundation',
    model: 'Pi 5',
    sku: 'RPI-5-8GB',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 567,
    tags: ['raspberry-pi', 'sbc', '8gb', 'powerful', 'linux'],
    specifications: {
      'CPU': 'Quad-core 64-bit Arm Cortex-A76 @ 2.4GHz',
      'RAM': '8GB LPDDR4X-4267 SDRAM',
      'Storage': 'MicroSD card slot',
      'USB': '2 × USB 3.0, 2 × USB 2.0',
      'Display': '2 × 4Kp60 HDMI',
      'Ethernet': 'Gigabit Ethernet',
      'WiFi': '802.11ac dual-band'
    },
    compatibility: ['Raspberry Pi OS', 'Ubuntu', 'Most Pi accessories'],
    featured: true,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 0.045,
    dimensions: { length: 85, width: 56, height: 17 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'UK'
  },

  // Tools
  {
    id: 'prusa-nozzle-kit',
    name: 'Prusa Nozzle Variety Kit',
    description: 'Complete set of hardened steel nozzles for Prusa printers. Includes 0.2mm to 1.0mm sizes for different applications.',
    shortDescription: 'Complete hardened steel nozzle set for Prusa printers',
    category: 'tools',
    subcategory: 'printer-parts',
    price: 3817,
    inStock: true,
    stockCount: 67,
    brand: 'Prusa Research',
    model: 'Nozzle Kit',
    sku: 'PRUSA-NOZZLE-KIT',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 189,
    tags: ['nozzles', 'hardened-steel', 'variety-pack', 'prusa'],
    specifications: {
      'Material': 'Hardened Steel',
      'Thread': 'M6',
      'Sizes Included': '0.2, 0.3, 0.4, 0.6, 0.8, 1.0 mm',
      'Compatible With': 'Prusa MK3S+, MK4, MINI',
      'Quantity': '6 nozzles'
    },
    compatibility: ['Prusa MK4', 'Prusa MK3S+', 'Prusa MINI'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.05,
    dimensions: { length: 100, width: 80, height: 20 },
    shippingClass: 'standard',
    warranty: '6 months',
    origin: 'Czech Republic'
  },

  // Starter Kits
  {
    id: '3d-printing-starter-kit',
    name: '3D Printing Starter Kit',
    description: 'Everything you need to start 3D printing: tools, filament samples, bed adhesion aids, and beginner guide.',
    shortDescription: 'Complete starter kit for 3D printing beginners',
    category: 'kits',
    subcategory: 'starter-kits',
    price: 6639,
    originalPrice: 8299,
    inStock: true,
    stockCount: 45,
    brand: 'MakrX',
    model: 'Starter Kit Pro',
    sku: 'MAKRX-STARTER-KIT',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 298,
    tags: ['starter-kit', 'beginner', 'tools', 'filament-samples'],
    specifications: {
      'Included Tools': 'Nozzle cleaning kit, spatula, hex keys',
      'Filament Samples': '5 × 50g PLA samples',
      'Bed Adhesion': 'PEI sheets, glue stick',
      'Documentation': 'Beginner guide, troubleshooting cards',
      'Storage': 'Organized tool case'
    },
    compatibility: ['Most FDM printers'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: true,
    bundles: ['prusa-mk4', 'bambu-x1-carbon'],
    weight: 1.2,
    dimensions: { length: 300, width: 200, height: 100 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'Global'
  },

  // Electronic Components
  {
    id: 'arduino-nano-33-iot',
    name: 'Arduino Nano 33 IoT',
    description: 'Compact microcontroller board with WiFi and Bluetooth connectivity. Perfect for IoT projects with integrated sensors and secure communication.',
    shortDescription: 'IoT-ready microcontroller with WiFi and Bluetooth',
    category: 'electronics',
    subcategory: 'microcontrollers',
    price: 2073,
    inStock: true,
    stockCount: 89,
    brand: 'Arduino',
    model: 'Nano 33 IoT',
    sku: 'ARD-NANO33-IOT',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 342,
    tags: ['microcontroller', 'iot', 'wifi', 'bluetooth', 'compact'],
    specifications: {
      'Microcontroller': 'SAMD21 Cortex M0+ 32bit ARM',
      'Operating Voltage': '3.3V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '8',
      'Flash Memory': '256 KB',
      'SRAM': '32 KB',
      'WiFi': '802.11 b/g/n',
      'Bluetooth': 'Bluetooth Low Energy',
      'Dimensions': '45 x 18 mm'
    },
    compatibility: ['Arduino IDE', '3.3V sensors', 'IoT platforms'],
    featured: true,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.005,
    dimensions: { length: 45, width: 18, height: 3 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'Italy'
  },
  {
    id: 'resistor-kit-600pcs',
    name: '600pcs Resistor Kit (1/4W)',
    description: 'Complete resistor kit with 30 different values from 10Ω to 1MΩ. Each value includes 20 pieces of 1/4W 5% tolerance carbon film resistors.',
    shortDescription: 'Complete resistor assortment for electronics projects',
    category: 'electronics',
    subcategory: 'resistors',
    price: 1245,
    inStock: true,
    stockCount: 156,
    brand: 'Electronic Components Pro',
    model: 'RK-600-14W',
    sku: 'ECP-RES-KIT-600',
    images: ['/placeholder.svg'],
    rating: 4.6,
    reviewCount: 278,
    tags: ['resistors', 'kit', 'assortment', 'carbon-film', 'through-hole'],
    specifications: {
      'Power Rating': '1/4W (0.25W)',
      'Tolerance': '±5%',
      'Temperature Coefficient': '±100ppm/°C',
      'Package Type': 'Through-hole',
      'Lead Type': 'Axial',
      'Total Pieces': '600 (30 values × 20pcs)',
      'Value Range': '10Ω to 1MΩ',
      'Material': 'Carbon Film'
    },
    compatibility: ['Breadboard', 'PCB', 'Perfboard', 'Arduino projects'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.12,
    dimensions: { length: 150, width: 100, height: 15 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'China'
  },
  {
    id: 'capacitor-electrolytic-kit',
    name: 'Electrolytic Capacitor Kit (120pcs)',
    description: 'Professional electrolytic capacitor kit with 12 common values from 1μF to 1000μF. 25V rated, radial lead type for general electronics use.',
    shortDescription: 'Essential electrolytic capacitor assortment',
    category: 'electronics',
    subcategory: 'capacitors',
    price: 873,
    inStock: true,
    stockCount: 234,
    brand: 'Nichicon',
    model: 'ELK-120-25V',
    sku: 'NICH-CAP-ELK-120',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 189,
    tags: ['capacitors', 'electrolytic', 'kit', 'radial', 'through-hole'],
    specifications: {
      'Type': 'Electrolytic',
      'Voltage Rating': '25V',
      'Capacitance Range': '1μF to 1000μF',
      'Tolerance': '±20%',
      'Temperature Range': '-40°C to +85°C',
      'Lead Type': 'Radial',
      'Package Type': 'Through-hole',
      'Total Pieces': '120 (12 values × 10pcs)',
      'Ripple Current': 'Standard'
    },
    compatibility: ['Power supplies', 'Audio circuits', 'General electronics'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.08,
    dimensions: { length: 120, width: 80, height: 25 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'Japan'
  },
  {
    id: 'led-assortment-500pcs',
    name: '500pcs LED Assortment Kit',
    description: 'Comprehensive LED kit with 5 colors (red, green, blue, yellow, white) in 3mm and 5mm sizes. High brightness, long lifespan LEDs for all projects.',
    shortDescription: '5-color LED kit for electronics projects',
    category: 'electronics',
    subcategory: 'leds',
    price: 1456,
    inStock: true,
    stockCount: 123,
    brand: 'Brightek',
    model: 'LED-500-MIX',
    sku: 'BRT-LED-500-AST',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.5,
    reviewCount: 298,
    tags: ['leds', 'kit', 'assortment', 'multicolor', 'through-hole'],
    specifications: {
      'LED Type': 'Standard Brightness',
      'Colors': '5 (Red, Green, Blue, Yellow, White)',
      'Sizes': '3mm and 5mm',
      'Forward Voltage': '1.8V to 3.3V',
      'Forward Current': '20mA',
      'Luminous Intensity': '8000-12000 mcd',
      'Viewing Angle': '15-25°',
      'Total Pieces': '500',
      'Lifespan': '50,000+ hours'
    },
    compatibility: ['Arduino', 'Raspberry Pi', 'Breadboard', 'PCB projects'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.15,
    dimensions: { length: 180, width: 120, height: 20 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'China'
  },
  {
    id: 'transistor-kit-200pcs',
    name: '200pcs Transistor Assortment Kit',
    description: 'Complete transistor kit with popular NPN and PNP types including 2N2222, 2N3904, 2N3906, BC547, BC557, and more. Essential for amplifier and switching circuits.',
    shortDescription: 'Essential NPN/PNP transistor collection',
    category: 'electronics',
    subcategory: 'transistors',
    price: 2184,
    inStock: true,
    stockCount: 89,
    brand: 'Fairchild Semiconductor',
    model: 'TRK-200-MIX',
    sku: 'FAIR-TRK-200',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 156,
    tags: ['transistors', 'npn', 'pnp', 'kit', 'to92'],
    specifications: {
      'Types': 'NPN and PNP BJT',
      'Package': 'TO-92',
      'Collector Current': '100mA to 600mA',
      'Collector-Emitter Voltage': '30V to 80V',
      'Power Dissipation': '500mW to 1W',
      'Common Types': '2N2222, 2N3904, 2N3906, BC547, BC557',
      'Total Pieces': '200 (10 types × 20pcs)',
      'Mounting': 'Through-hole'
    },
    compatibility: ['Amplifier circuits', 'Switching applications', 'Signal processing'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.06,
    dimensions: { length: 100, width: 80, height: 15 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'USA'
  },
  {
    id: 'sensor-module-kit',
    name: '37-in-1 Sensor Module Kit',
    description: 'Comprehensive sensor kit for Arduino and Raspberry Pi including temperature, humidity, light, motion, sound, and many more sensors with documentation.',
    shortDescription: 'Complete sensor collection for microcontroller projects',
    category: 'electronics',
    subcategory: 'sensors',
    price: 3729,
    inStock: true,
    stockCount: 67,
    brand: 'Elegoo',
    model: 'SNS-37-KIT',
    sku: 'ELG-SENSOR-37',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 445,
    tags: ['sensors', 'modules', 'arduino', 'raspberry-pi', 'kit'],
    specifications: {
      'Total Modules': '37',
      'Operating Voltage': '3.3V to 5V',
      'Interface': 'Digital and Analog',
      'Included Sensors': 'Temperature, Humidity, Light, Motion, Sound, Touch, etc.',
      'Compatibility': 'Arduino, Raspberry Pi, ESP32',
      'Documentation': 'Detailed tutorial included',
      'Connector Type': 'DuPont wires included',
      'Package Type': 'Modules with headers'
    },
    compatibility: ['Arduino UNO', 'Arduino Nano', 'Raspberry Pi', 'ESP32', 'Microbit'],
    featured: true,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 0.45,
    dimensions: { length: 250, width: 180, height: 40 },
    shippingClass: 'standard',
    warranty: '6 months',
    origin: 'China'
  },
  {
    id: 'ic-socket-kit',
    name: 'IC Socket Assortment Kit (180pcs)',
    description: 'Professional IC socket kit with DIP sockets from 8-pin to 40-pin. High-quality gold-plated contacts for reliable connections in prototyping and repair.',
    shortDescription: 'Complete DIP IC socket collection',
    category: 'electronics',
    subcategory: 'connectors',
    price: 1873,
    inStock: true,
    stockCount: 145,
    brand: 'Amphenol',
    model: 'ICS-180-DIP',
    sku: 'AMP-ICS-180',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 167,
    tags: ['ic-sockets', 'dip', 'connectors', 'gold-plated', 'through-hole'],
    specifications: {
      'Socket Types': 'DIP (Dual In-line Package)',
      'Pin Counts': '8, 14, 16, 18, 20, 24, 28, 32, 40 pins',
      'Contact Material': 'Gold-plated',
      'Pitch': '2.54mm (0.1")',
      'Operating Temperature': '-55°C to +125°C',
      'Contact Resistance': '<10mΩ',
      'Total Pieces': '180',
      'Mounting': 'Through-hole'
    },
    compatibility: ['Microprocessors', 'Memory chips', 'Logic ICs', 'Prototyping'],
    featured: false,
    popular: false,
    newArrival: false,
    onSale: false,
    weight: 0.25,
    dimensions: { length: 150, width: 100, height: 30 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'USA'
  },
  {
    id: 'breadboard-jumper-kit',
    name: 'Breadboard Jumper Wire Kit (350pcs)',
    description: 'Premium breadboard jumper wire kit with multiple lengths and colors. Solid core tinned copper wire with precision-cut lengths for clean prototyping.',
    shortDescription: 'Essential jumper wires for breadboard prototyping',
    category: 'electronics',
    subcategory: 'cables',
    price: 1245,
    inStock: true,
    stockCount: 234,
    brand: 'Adafruit',
    model: 'JMP-350-KIT',
    sku: 'ADA-JMP-350',
    images: ['/placeholder.svg'],
    rating: 4.9,
    reviewCount: 523,
    tags: ['jumper-wires', 'breadboard', 'prototyping', 'solid-core', 'tinned'],
    specifications: {
      'Wire Type': 'Solid core tinned copper',
      'AWG': '22 AWG',
      'Colors': '10 different colors',
      'Lengths': '6 different lengths (10-50mm)',
      'Total Pieces': '350',
      'Connector Type': 'Male-to-male',
      'Insulation': 'PVC',
      'Temperature Rating': '-40°C to +80°C'
    },
    compatibility: ['Breadboards', 'Arduino projects', 'Raspberry Pi', 'Prototyping'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.08,
    dimensions: { length: 120, width: 80, height: 15 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'USA'
  },
  {
    id: 'arduino-ultimate-starter-kit',
    name: 'Arduino Ultimate Starter Kit',
    description: 'Complete Arduino learning kit with UNO R4, comprehensive project book, and over 100 components. Perfect for beginners and educators with 15 guided projects.',
    shortDescription: 'Complete Arduino learning kit with 15 guided projects',
    category: 'kits',
    subcategory: 'starter-kits',
    price: 8729,
    inStock: true,
    stockCount: 67,
    brand: 'Arduino',
    model: 'Ultimate Starter Kit',
    sku: 'ARDUINO-ULTIMATE-KIT',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 1245,
    tags: ['arduino', 'starter-kit', 'educational', 'programming', 'electronics'],
    specifications: {
      'Microcontroller': 'Arduino UNO R4 WiFi',
      'Components': '100+ electronic components',
      'Projects': '15 guided projects',
      'Book': '170-page project book',
      'Online Resources': 'Video tutorials, code examples',
      'Age Range': '14+ years',
      'Skill Level': 'Beginner to Intermediate'
    },
    compatibility: ['Arduino IDE', 'Online simulators', 'Most Arduino shields'],
    featured: true,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 1.5,
    dimensions: { length: 350, width: 250, height: 80 },
    shippingClass: 'standard',
    warranty: '2 years',
    origin: 'Italy'
  },
  {
    id: 'raspberry-pi-iot-kit',
    name: 'Raspberry Pi IoT Maker Kit',
    description: 'Advanced IoT kit with Raspberry Pi 5, sensors, actuators, and cloud connectivity. Build smart home projects, environmental monitoring, and automation systems.',
    shortDescription: 'Advanced IoT kit for smart home and automation projects',
    category: 'kits',
    subcategory: 'project-kits',
    price: 12456,
    inStock: true,
    stockCount: 34,
    brand: 'Raspberry Pi Foundation',
    model: 'IoT Maker Kit',
    sku: 'RPI-IOT-MAKER-KIT',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.7,
    reviewCount: 567,
    tags: ['raspberry-pi', 'iot', 'smart-home', 'automation', 'sensors'],
    specifications: {
      'Main Board': 'Raspberry Pi 5 8GB',
      'Sensors': 'Temperature, humidity, motion, light, sound',
      'Actuators': 'Servo motors, relays, LED strips',
      'Connectivity': 'WiFi, Bluetooth, GPIO expansion',
      'Projects': '8 IoT projects included',
      'Cloud Integration': 'AWS IoT, Google Cloud IoT',
      'Programming': 'Python, Node.js examples'
    },
    compatibility: ['Raspberry Pi OS', 'Home Assistant', 'Node-RED'],
    featured: true,
    popular: true,
    newArrival: true,
    onSale: false,
    weight: 0.8,
    dimensions: { length: 280, width: 200, height: 60 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'UK'
  },
  {
    id: 'robotics-learning-kit',
    name: 'Robotics Learning Kit - Rover Bot',
    description: 'Build and program your own rover robot with obstacle avoidance, line following, and remote control. Includes chassis, motors, sensors, and comprehensive tutorials.',
    shortDescription: 'Build and program an autonomous rover robot',
    category: 'kits',
    subcategory: 'robotics-kits',
    price: 15678,
    inStock: true,
    stockCount: 23,
    brand: 'RoboticsEdu',
    model: 'Rover Bot Kit',
    sku: 'ROBO-ROVER-KIT',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.9,
    reviewCount: 234,
    tags: ['robotics', 'programming', 'autonomous', 'sensors', 'motors'],
    specifications: {
      'Chassis': 'Aluminum frame with wheels',
      'Motors': '4x DC geared motors with encoders',
      'Sensors': 'Ultrasonic, camera, IMU, line following',
      'Controller': 'Arduino Mega 2560',
      'Power': 'Rechargeable Li-ion battery pack',
      'Programming': 'C++, Python, Scratch support',
      'Features': 'Obstacle avoidance, line following, remote control'
    },
    compatibility: ['Arduino IDE', 'ROS', 'Scratch programming'],
    featured: true,
    popular: false,
    newArrival: true,
    onSale: false,
    weight: 2.8,
    dimensions: { length: 400, width: 300, height: 150 },
    shippingClass: 'oversized',
    warranty: '1 year',
    origin: 'USA'
  },
  {
    id: 'esp32-iot-development-kit',
    name: 'ESP32 IoT Development Kit',
    description: 'Professional ESP32 development kit with sensors, displays, and connectivity modules. Perfect for IoT prototyping with WiFi, Bluetooth, and cloud integration.',
    shortDescription: 'Professional ESP32 kit for IoT development',
    category: 'kits',
    subcategory: 'iot-kits',
    price: 7834,
    inStock: true,
    stockCount: 78,
    brand: 'Espressif',
    model: 'ESP32 Dev Kit Pro',
    sku: 'ESP32-DEV-KIT-PRO',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 445,
    tags: ['esp32', 'iot', 'wifi', 'bluetooth', 'development'],
    specifications: {
      'Main Module': 'ESP32-WROOM-32 development board',
      'Sensors': 'BME280, MPU6050, light sensor',
      'Display': '1.8" TFT LCD with touchscreen',
      'Connectivity': 'WiFi 802.11 b/g/n, Bluetooth 4.2',
      'Power': 'USB-C, battery connector',
      'Programming': 'Arduino IDE, ESP-IDF, MicroPython',
      'Cloud Support': 'AWS IoT, Google Cloud, Blynk'
    },
    compatibility: ['Arduino IDE', 'ESP-IDF', 'PlatformIO', 'MicroPython'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.35,
    dimensions: { length: 200, width: 150, height: 40 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'China'
  },
  {
    id: 'microbit-inventor-kit',
    name: 'BBC micro:bit Inventor Kit',
    description: 'Creative coding kit for kids with BBC micro:bit, LEDs, motors, sensors, and fun projects. Includes step-by-step tutorials and block-based programming.',
    shortDescription: 'Creative coding kit for kids with fun projects',
    category: 'kits',
    subcategory: 'educational-kits',
    price: 4567,
    inStock: true,
    stockCount: 89,
    brand: 'BBC',
    model: 'micro:bit Inventor Kit',
    sku: 'BBC-MICROBIT-INVENTOR',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 678,
    tags: ['microbit', 'kids', 'education', 'programming', 'block-coding'],
    specifications: {
      'Main Board': 'BBC micro:bit v2',
      'Components': '40+ electronic components',
      'Projects': '12 guided projects',
      'Programming': 'MakeCode (block-based)',
      'Age Range': '8-14 years',
      'Features': 'LED matrix, accelerometer, compass',
      'Connectivity': 'Bluetooth, radio communication'
    },
    compatibility: ['MakeCode', 'Scratch', 'Python (advanced)'],
    featured: true,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.4,
    dimensions: { length: 220, width: 160, height: 50 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'UK'
  },
  {
    id: 'ai-vision-kit',
    name: 'AI Vision Development Kit',
    description: 'Complete AI and computer vision kit with NVIDIA Jetson Nano, cameras, and pre-trained models. Build object detection, face recognition, and autonomous vehicle projects.',
    shortDescription: 'AI and computer vision kit with NVIDIA Jetson',
    category: 'kits',
    subcategory: 'ai-kits',
    price: 23456,
    inStock: true,
    stockCount: 18,
    brand: 'NVIDIA',
    model: 'AI Vision Kit',
    sku: 'NVIDIA-AI-VISION-KIT',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.9,
    reviewCount: 145,
    tags: ['ai', 'computer-vision', 'jetson', 'machine-learning', 'opencv'],
    specifications: {
      'Compute Module': 'NVIDIA Jetson Nano 4GB',
      'Cameras': '2x CSI cameras, USB webcam',
      'AI Framework': 'TensorFlow, PyTorch, OpenCV',
      'Pre-trained Models': 'Object detection, classification',
      'Storage': '64GB microSD card',
      'Projects': '6 AI vision projects',
      'Programming': 'Python, CUDA'
    },
    compatibility: ['JetPack SDK', 'TensorFlow', 'PyTorch', 'OpenCV'],
    featured: true,
    popular: false,
    newArrival: true,
    onSale: false,
    weight: 0.6,
    dimensions: { length: 180, width: 140, height: 60 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'USA'
  },
  {
    id: 'home-automation-bundle',
    name: 'Smart Home Automation Bundle',
    description: 'Complete home automation system with smart switches, sensors, hub, and mobile app. Control lights, temperature, security, and appliances from anywhere.',
    shortDescription: 'Complete smart home automation system',
    category: 'kits',
    subcategory: 'automation-kits',
    price: 18934,
    inStock: true,
    stockCount: 34,
    brand: 'SmartHome Pro',
    model: 'Automation Bundle',
    sku: 'SMART-HOME-BUNDLE',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 234,
    tags: ['smart-home', 'automation', 'iot', 'sensors', 'mobile-app'],
    specifications: {
      'Hub': 'Smart home hub with WiFi/Zigbee',
      'Switches': '6x smart light switches',
      'Sensors': 'Motion, door/window, temperature',
      'Outlets': '4x smart plugs',
      'Camera': 'Indoor security camera',
      'App': 'iOS/Android mobile app',
      'Voice Control': 'Alexa, Google Assistant compatible'
    },
    compatibility: ['Alexa', 'Google Assistant', 'Apple HomeKit'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 2.1,
    dimensions: { length: 400, width: 300, height: 100 },
    shippingClass: 'standard',
    warranty: '2 years',
    origin: 'USA'
  },
  {
    id: 'maker-toolkit-deluxe',
    name: 'Maker Toolkit Deluxe Bundle',
    description: 'Professional maker toolkit with precision tools, measuring instruments, soldering station, and storage organization. Everything a serious maker needs in one bundle.',
    shortDescription: 'Professional toolkit for serious makers',
    category: 'kits',
    subcategory: 'tool-bundles',
    price: 14578,
    originalPrice: 18234,
    inStock: true,
    stockCount: 45,
    brand: 'MakerPro',
    model: 'Deluxe Toolkit',
    sku: 'MAKER-TOOLKIT-DELUXE',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 167,
    tags: ['tools', 'maker', 'professional', 'soldering', 'precision'],
    specifications: {
      'Soldering': 'Digital soldering station with tips',
      'Measurement': 'Digital calipers, multimeter',
      'Hand Tools': 'Precision screwdrivers, pliers',
      'Cutting': 'Flush cutters, wire strippers',
      'Storage': 'Modular tool chest',
      'Safety': 'Safety glasses, anti-static mat',
      'Total Items': '50+ professional tools'
    },
    compatibility: ['Electronics work', '3D printing', 'Mechanical assembly'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: true,
    weight: 8.5,
    dimensions: { length: 500, width: 350, height: 200 },
    shippingClass: 'oversized',
    warranty: '3 years',
    origin: 'Germany'
  },
  {
    id: 'drone-build-kit',
    name: 'FPV Racing Drone Build Kit',
    description: 'Build your own racing drone with carbon fiber frame, brushless motors, flight controller, and FPV camera. Includes transmitter and comprehensive build guide.',
    shortDescription: 'Build a custom FPV racing drone from scratch',
    category: 'kits',
    subcategory: 'drone-kits',
    price: 28945,
    inStock: true,
    stockCount: 15,
    brand: 'DroneBuilder Pro',
    model: 'Racing Drone Kit',
    sku: 'DRONE-RACING-KIT',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviewCount: 123,
    tags: ['drone', 'fpv', 'racing', 'carbon-fiber', 'build-kit'],
    specifications: {
      'Frame': 'Carbon fiber racing frame (220mm)',
      'Motors': '4x 2300KV brushless motors',
      'ESC': '30A electronic speed controllers',
      'Flight Controller': 'F4 flight controller with OSD',
      'Camera': 'FPV camera with video transmitter',
      'Transmitter': '2.4GHz radio transmitter',
      'Build Time': '4-6 hours'
    },
    compatibility: ['Betaflight', 'OpenTX', 'FrSky'],
    featured: true,
    popular: false,
    newArrival: true,
    onSale: false,
    weight: 1.2,
    dimensions: { length: 350, width: 250, height: 80 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'China'
  },

  // Mechanical Components
  {
    id: 'aluminum-extrusion-2020',
    name: '2020 Aluminum Extrusion Profile',
    description: 'High-quality 6063-T5 aluminum extrusion profile with T-slot design. Perfect for building frames, workbenches, 3D printers, and CNC machines. 1000mm length.',
    shortDescription: 'T-slot aluminum extrusion for structural builds',
    category: 'components',
    subcategory: 'structural',
    price: 1245,
    inStock: true,
    stockCount: 89,
    brand: 'OpenBuilds',
    model: '2020 V-Slot',
    sku: 'ALU-2020-1000',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 156,
    tags: ['aluminum', 'extrusion', 'structural', 't-slot', 'cnc'],
    specifications: {
      'Profile': '20mm x 20mm',
      'Length': '1000mm',
      'Material': '6063-T5 Aluminum',
      'Slot Width': '6mm',
      'Weight': '0.49 kg/m',
      'Finish': 'Anodized',
      'Tolerance': '±0.1mm'
    },
    compatibility: ['V-wheels', 'T-nuts', 'Corner brackets', 'Linear bearings'],
    featured: true,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.49,
    dimensions: { length: 1000, width: 20, height: 20 },
    shippingClass: 'oversized',
    warranty: 'N/A',
    origin: 'China'
  },
  {
    id: 'bearing-608zz-pack',
    name: '608ZZ Ball Bearing Set (10pcs)',
    description: 'High-precision 608ZZ ball bearings with metal shields. Ideal for skateboard wheels, 3D printer idlers, pulleys, and general mechanical applications.',
    shortDescription: 'Precision ball bearings for mechanical applications',
    category: 'components',
    subcategory: 'bearings',
    price: 892,
    inStock: true,
    stockCount: 234,
    brand: 'SKF',
    model: '608ZZ',
    sku: 'BEAR-608ZZ-10',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 298,
    tags: ['bearings', 'ball-bearing', '608zz', 'metal-shield', 'precision'],
    specifications: {
      'Inner Diameter': '8mm',
      'Outer Diameter': '22mm',
      'Width': '7mm',
      'Type': 'Deep groove ball bearing',
      'Shield': 'Metal (ZZ)',
      'Tolerance': 'ABEC-7',
      'Material': 'Chrome steel',
      'Quantity': '10 pieces'
    },
    compatibility: ['Pulleys', '3D printers', 'Skateboards', 'Linear motion'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.08,
    dimensions: { length: 22, width: 22, height: 7 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'Sweden'
  },
  {
    id: 'metric-bolt-kit-m3-m8',
    name: 'Metric Bolt & Nut Kit (M3-M8)',
    description: 'Comprehensive metric fastener kit with socket head cap screws, hex nuts, and washers. Sizes M3, M4, M5, M6, and M8 in various lengths. Stainless steel A2.',
    shortDescription: 'Complete metric fastener kit for mechanical builds',
    category: 'components',
    subcategory: 'fasteners',
    price: 2345,
    inStock: true,
    stockCount: 67,
    brand: 'Fastenal',
    model: 'Metric Kit Pro',
    sku: 'BOLT-KIT-M3M8',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.9,
    reviewCount: 445,
    tags: ['bolts', 'nuts', 'metric', 'stainless-steel', 'fasteners'],
    specifications: {
      'Sizes': 'M3, M4, M5, M6, M8',
      'Material': 'Stainless Steel A2 (304)',
      'Head Type': 'Socket head cap screw',
      'Drive': 'Hex socket (Allen)',
      'Finish': 'Passivated',
      'Total Pieces': '200+ fasteners',
      'Lengths': '6mm to 50mm'
    },
    compatibility: ['3D printers', 'CNC machines', 'Robotics', 'General assembly'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 2.1,
    dimensions: { length: 200, width: 150, height: 50 },
    shippingClass: 'standard',
    warranty: 'N/A',
    origin: 'Germany'
  },
  {
    id: 'gt2-timing-belt-kit',
    name: 'GT2 Timing Belt & Pulley Kit',
    description: 'Complete GT2 timing belt system with 20-tooth pulleys, 2GT timing belt (2m), and belt tensioner. Perfect for 3D printers and CNC machines.',
    shortDescription: 'GT2 timing belt system for precise motion control',
    category: 'components',
    subcategory: 'motion',
    price: 1678,
    inStock: true,
    stockCount: 123,
    brand: 'Gates',
    model: 'GT2 Pro Kit',
    sku: 'GT2-BELT-KIT',
    images: ['/placeholder.svg', '/placeholder.svg'],
    rating: 4.6,
    reviewCount: 234,
    tags: ['timing-belt', 'gt2', 'pulleys', 'motion-control', '3d-printer'],
    specifications: {
      'Belt Type': 'GT2 (2mm pitch)',
      'Belt Width': '6mm',
      'Belt Length': '2000mm (2m)',
      'Pulley Teeth': '20 teeth',
      'Bore Size': '5mm',
      'Material': 'Reinforced rubber with fiberglass',
      'Includes': '2x pulleys, 1x belt, tensioner'
    },
    compatibility: ['3D printers', 'CNC machines', 'Linear actuators', 'CoreXY'],
    featured: false,
    popular: true,
    newArrival: false,
    onSale: false,
    weight: 0.15,
    dimensions: { length: 100, width: 100, height: 30 },
    shippingClass: 'standard',
    warranty: '1 year',
    origin: 'USA'
  },
  {
    id: 'linear-rod-8mm-kit',
    name: '8mm Linear Rod & Bearing Kit',
    description: 'Precision ground 8mm hardened steel rods with linear ball bearings. Complete linear motion kit for 3D printers, CNC machines, and automation projects.',
    shortDescription: 'Linear motion system with rods and bearings',
    category: 'components',
    subcategory: 'motion',
    price: 3456,
    inStock: true,
    stockCount: 45,
    brand: 'Misumi',
    model: 'Linear Kit 8mm',
    sku: 'LIN-ROD-8MM-KIT',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 167,
    tags: ['linear-rod', 'bearings', 'motion', 'cnc', 'precision'],
    specifications: {
      'Rod Diameter': '8mm',
      'Rod Length': '400mm (4 pieces)',
      'Material': 'Hardened steel, chrome plated',
      'Bearings': '8x LM8UU linear bearings',
      'Tolerance': 'h6 (-0.009/-0.020)',
      'Surface Finish': 'Ra 0.2μm',
      'Hardness': 'HRC 60-64'
    },
    compatibility: ['3D printers', 'CNC machines', 'Linear stages', 'Automation'],
    featured: false,
    popular: false,
    newArrival: true,
    onSale: false,
    weight: 1.2,
    dimensions: { length: 400, width: 50, height: 50 },
    shippingClass: 'standard',
    warranty: '2 years',
    origin: 'Japan'
  }
]

// Utility functions
export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(product => product.category === categoryId)
}

export function getKitProducts(): Product[] {
  return products.filter(product => product.category === 'kits')
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured)
}

export function getPopularProducts(): Product[] {
  return products.filter(product => product.popular)
}

export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase()
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

export function filterProducts(products: Product[], filters: { [key: string]: any }): Product[] {
  return products.filter(product => {
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(product.category)) return false
    }

    // Price range filter
    if (filters.priceMin !== undefined && product.price < filters.priceMin) return false
    if (filters.priceMax !== undefined && product.price > filters.priceMax) return false

    // Brand filter
    if (filters.brand && filters.brand.length > 0) {
      const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '-')
      if (!filters.brand.includes(brandSlug)) return false
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      if (filters.availability.includes('in-stock') && !product.inStock) return false
      if (filters.availability.includes('on-sale') && !product.onSale) return false
      if (filters.availability.includes('pre-order') && product.inStock) return false
      if (filters.availability.includes('backorder') && (product.inStock || product.stockCount > 0)) return false
    }

    // Kit-specific filters
    if (filters['kit-type'] && filters['kit-type'].length > 0) {
      const hasKitType = filters['kit-type'].some((type: string) =>
        product.tags.some(tag => tag.includes(type))
      )
      if (!hasKitType) return false
    }

    if (filters.platform && filters.platform.length > 0) {
      const hasPlatform = filters.platform.some((platform: string) =>
        product.tags.some(tag => tag.includes(platform)) ||
        product.description.toLowerCase().includes(platform)
      )
      if (!hasPlatform) return false
    }

    if (filters['skill-level'] && filters['skill-level'].length > 0) {
      const hasSkillLevel = filters['skill-level'].some((level: string) =>
        product.tags.some(tag => tag.includes(level)) ||
        product.description.toLowerCase().includes(level)
      )
      if (!hasSkillLevel) return false
    }

    // Compatibility filter
    if (filters.compatibility && filters.compatibility.length > 0) {
      const hasCompatibility = filters.compatibility.some((comp: string) =>
        product.compatibility.some(pc => pc.toLowerCase().includes(comp))
      )
      if (!hasCompatibility) return false
    }

    return true
  })
}

export function sortProducts(products: Product[], sortBy: string): Product[] {
  switch (sortBy) {
    case 'price-low':
      return [...products].sort((a, b) => a.price - b.price)
    case 'price-high':
      return [...products].sort((a, b) => b.price - a.price)
    case 'rating':
      return [...products].sort((a, b) => b.rating - a.rating)
    case 'popular':
      return [...products].sort((a, b) => b.reviewCount - a.reviewCount)
    case 'newest':
      return [...products].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0))
    case 'name':
      return [...products].sort((a, b) => a.name.localeCompare(b.name))
    default: // relevance
      return products
  }
}
