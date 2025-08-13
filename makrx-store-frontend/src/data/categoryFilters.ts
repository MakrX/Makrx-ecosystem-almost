export interface CategoryFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'toggle' | 'multiselect';
  options?: { value: string; label: string; count?: number }[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  helpText?: string;
}

export interface CategoryFilterSet {
  category: string;
  filters: CategoryFilter[];
}

// 3D Printers Specific Filters
const printerFilters: CategoryFilter[] = [
  {
    id: 'printer-type',
    name: 'Printer Type',
    type: 'checkbox',
    options: [
      { value: 'fdm', label: 'FDM/FFF', count: 89 },
      { value: 'resin', label: 'Resin (SLA/DLP)', count: 34 },
      { value: 'industrial', label: 'Industrial', count: 12 },
      { value: 'multi-material', label: 'Multi-Material', count: 21 }
    ]
  },
  {
    id: 'build-volume',
    name: 'Build Volume',
    type: 'checkbox',
    options: [
      { value: 'compact', label: 'Compact (<200mm³)', count: 23 },
      { value: 'standard', label: 'Standard (200-250mm³)', count: 45 },
      { value: 'large', label: 'Large (250-350mm³)', count: 34 },
      { value: 'xl', label: 'XL (>350mm³)', count: 12 }
    ]
  },
  {
    id: 'layer-height',
    name: 'Min Layer Height',
    type: 'select',
    options: [
      { value: '0.05', label: '0.05mm (Ultra High)', count: 8 },
      { value: '0.1', label: '0.1mm (High)', count: 34 },
      { value: '0.2', label: '0.2mm (Standard)', count: 67 },
      { value: '0.3', label: '0.3mm+ (Fast)', count: 25 }
    ]
  },
  {
    id: 'features',
    name: 'Features',
    type: 'checkbox',
    options: [
      { value: 'auto-leveling', label: 'Auto Bed Leveling', count: 67 },
      { value: 'heated-bed', label: 'Heated Bed', count: 89 },
      { value: 'enclosed', label: 'Enclosed Chamber', count: 23 },
      { value: 'dual-extruder', label: 'Dual Extruder', count: 21 },
      { value: 'wifi', label: 'WiFi Connectivity', count: 45 },
      { value: 'touchscreen', label: 'Touchscreen', count: 56 },
      { value: 'power-recovery', label: 'Power Recovery', count: 34 },
      { value: 'filament-sensor', label: 'Filament Run-out Sensor', count: 43 }
    ]
  },
  {
    id: 'assembly',
    name: 'Assembly Level',
    type: 'select',
    options: [
      { value: 'assembled', label: 'Fully Assembled', count: 45 },
      { value: 'semi-kit', label: 'Semi-Kit (2-4 hours)', count: 34 },
      { value: 'diy-kit', label: 'DIY Kit (6+ hours)', count: 23 }
    ]
  },
  {
    id: 'compatibility',
    name: 'Filament Compatibility',
    type: 'checkbox',
    options: [
      { value: 'pla', label: 'PLA', count: 114 },
      { value: 'abs', label: 'ABS', count: 89 },
      { value: 'petg', label: 'PETG', count: 78 },
      { value: 'tpu', label: 'TPU/Flexible', count: 45 },
      { value: 'high-temp', label: 'High-Temp Materials', count: 23 }
    ]
  }
];

// Electronics Specific Filters
const electronicsFilters: CategoryFilter[] = [
  {
    id: 'component-type',
    name: 'Component Type',
    type: 'checkbox',
    options: [
      { value: 'microcontroller', label: 'Microcontrollers', count: 67 },
      { value: 'sensor', label: 'Sensors', count: 234 },
      { value: 'actuator', label: 'Actuators', count: 89 },
      { value: 'display', label: 'Displays', count: 56 },
      { value: 'module', label: 'Modules', count: 123 },
      { value: 'power', label: 'Power Supplies', count: 45 },
      { value: 'communication', label: 'Communication', count: 78 }
    ]
  },
  {
    id: 'platform',
    name: 'Platform',
    type: 'checkbox',
    options: [
      { value: 'arduino', label: 'Arduino Compatible', count: 156 },
      { value: 'raspberry-pi', label: 'Raspberry Pi', count: 89 },
      { value: 'esp32', label: 'ESP32', count: 67 },
      { value: 'micro-bit', label: 'Micro:bit', count: 34 },
      { value: 'jetson', label: 'NVIDIA Jetson', count: 12 }
    ]
  },
  {
    id: 'voltage',
    name: 'Operating Voltage',
    type: 'checkbox',
    options: [
      { value: '3.3v', label: '3.3V', count: 123 },
      { value: '5v', label: '5V', count: 156 },
      { value: '12v', label: '12V', count: 78 },
      { value: '24v', label: '24V', count: 34 },
      { value: 'variable', label: 'Variable', count: 45 }
    ]
  },
  {
    id: 'interface',
    name: 'Interface',
    type: 'checkbox',
    options: [
      { value: 'i2c', label: 'I2C', count: 89 },
      { value: 'spi', label: 'SPI', count: 67 },
      { value: 'uart', label: 'UART/Serial', count: 78 },
      { value: 'gpio', label: 'GPIO', count: 134 },
      { value: 'analog', label: 'Analog', count: 98 },
      { value: 'pwm', label: 'PWM', count: 56 }
    ]
  },
  {
    id: 'skill-level',
    name: 'Skill Level',
    type: 'select',
    options: [
      { value: 'beginner', label: 'Beginner', count: 145 },
      { value: 'intermediate', label: 'Intermediate', count: 198 },
      { value: 'advanced', label: 'Advanced', count: 89 },
      { value: 'expert', label: 'Expert', count: 34 }
    ]
  }
];

// Tools & Hardware Specific Filters
const toolsFilters: CategoryFilter[] = [
  {
    id: 'tool-type',
    name: 'Tool Type',
    type: 'checkbox',
    options: [
      { value: 'cutting', label: 'Cutting Tools', count: 89 },
      { value: 'measuring', label: 'Measuring Tools', count: 67 },
      { value: 'assembly', label: 'Assembly Tools', count: 134 },
      { value: 'soldering', label: 'Soldering Equipment', count: 45 },
      { value: 'drilling', label: 'Drilling Tools', count: 56 },
      { value: 'finishing', label: 'Finishing Tools', count: 34 }
    ]
  },
  {
    id: 'power-type',
    name: 'Power Type',
    type: 'checkbox',
    options: [
      { value: 'manual', label: 'Manual', count: 123 },
      { value: 'electric', label: 'Electric', count: 89 },
      { value: 'battery', label: 'Battery Powered', count: 67 },
      { value: 'pneumatic', label: 'Pneumatic', count: 23 }
    ]
  },
  {
    id: 'material-compatibility',
    name: 'Material Compatibility',
    type: 'checkbox',
    options: [
      { value: 'metal', label: 'Metal', count: 89 },
      { value: 'wood', label: 'Wood', count: 67 },
      { value: 'plastic', label: 'Plastic', count: 134 },
      { value: 'composite', label: 'Composite', count: 45 },
      { value: 'ceramic', label: 'Ceramic', count: 23 }
    ]
  },
  {
    id: 'precision',
    name: 'Precision Level',
    type: 'select',
    options: [
      { value: 'standard', label: 'Standard (±1mm)', count: 89 },
      { value: 'precision', label: 'Precision (±0.1mm)', count: 67 },
      { value: 'high-precision', label: 'High Precision (±0.01mm)', count: 23 }
    ]
  }
];

// Materials & Filament Specific Filters
const materialsFilters: CategoryFilter[] = [
  {
    id: 'material-type',
    name: 'Material Type',
    type: 'checkbox',
    options: [
      { value: 'pla', label: 'PLA', count: 156 },
      { value: 'abs', label: 'ABS', count: 89 },
      { value: 'petg', label: 'PETG', count: 67 },
      { value: 'tpu', label: 'TPU (Flexible)', count: 34 },
      { value: 'pva', label: 'PVA (Soluble)', count: 23 },
      { value: 'hips', label: 'HIPS', count: 45 },
      { value: 'wood-fill', label: 'Wood Fill', count: 28 },
      { value: 'metal-fill', label: 'Metal Fill', count: 19 },
      { value: 'carbon-fiber', label: 'Carbon Fiber', count: 15 }
    ]
  },
  {
    id: 'diameter',
    name: 'Filament Diameter',
    type: 'checkbox',
    options: [
      { value: '1.75mm', label: '1.75mm', count: 289 },
      { value: '2.85mm', label: '2.85mm', count: 67 },
      { value: '3mm', label: '3.0mm', count: 23 }
    ]
  },
  {
    id: 'temperature',
    name: 'Print Temperature',
    type: 'range',
    min: 180,
    max: 350,
    unit: '°C',
    helpText: 'Recommended printing temperature range'
  },
  {
    id: 'properties',
    name: 'Material Properties',
    type: 'checkbox',
    options: [
      { value: 'biodegradable', label: 'Biodegradable', count: 123 },
      { value: 'flexible', label: 'Flexible', count: 45 },
      { value: 'high-strength', label: 'High Strength', count: 67 },
      { value: 'transparent', label: 'Transparent', count: 34 },
      { value: 'conductive', label: 'Conductive', count: 12 },
      { value: 'food-safe', label: 'Food Safe', count: 56 },
      { value: 'chemical-resistant', label: 'Chemical Resistant', count: 23 }
    ]
  },
  {
    id: 'color-type',
    name: 'Color Type',
    type: 'checkbox',
    options: [
      { value: 'solid', label: 'Solid Colors', count: 234 },
      { value: 'transparent', label: 'Transparent', count: 45 },
      { value: 'metallic', label: 'Metallic', count: 67 },
      { value: 'glow', label: 'Glow in Dark', count: 23 },
      { value: 'wood-tone', label: 'Wood Tones', count: 34 },
      { value: 'multicolor', label: 'Multi-Color', count: 12 }
    ]
  }
];

// Kits & Bundles Specific Filters
const kitsFilters: CategoryFilter[] = [
  {
    id: 'kit-type',
    name: 'Kit Type',
    type: 'checkbox',
    required: true,
    options: [
      { value: 'starter', label: 'Starter Kits', count: 67 },
      { value: 'project', label: 'Project Kits', count: 89 },
      { value: 'educational', label: 'Educational Kits', count: 78 },
      { value: 'robotics', label: 'Robotics Kits', count: 45 },
      { value: 'iot', label: 'IoT Kits', count: 34 },
      { value: 'upgrade', label: 'Upgrade Kits', count: 56 },
      { value: '3d-printing', label: '3D Printing Kits', count: 23 },
      { value: 'electronics', label: 'Electronics Kits', count: 123 },
      { value: 'programming', label: 'Programming Kits', count: 45 },
      { value: 'science', label: 'Science Kits', count: 34 },
      { value: 'engineering', label: 'Engineering Kits', count: 29 },
      { value: 'maker', label: 'Maker Bundles', count: 67 }
    ]
  },
  {
    id: 'platform',
    name: 'Platform/System',
    type: 'checkbox',
    options: [
      { value: 'arduino', label: 'Arduino Based', count: 156 },
      { value: 'raspberry-pi', label: 'Raspberry Pi', count: 89 },
      { value: 'esp32', label: 'ESP32/IoT', count: 67 },
      { value: 'micro-bit', label: 'BBC Micro:bit', count: 45 },
      { value: 'jetson', label: 'NVIDIA Jetson', count: 12 },
      { value: 'fpga', label: 'FPGA', count: 8 },
      { value: 'standalone', label: 'Standalone/No Platform', count: 78 },
      { value: 'multiple', label: 'Multi-Platform', count: 34 }
    ]
  },
  {
    id: 'skill-level',
    name: 'Skill Level',
    type: 'select',
    options: [
      { value: 'beginner', label: 'Beginner (No Experience)', count: 89 },
      { value: 'novice', label: 'Novice (Some Experience)', count: 67 },
      { value: 'intermediate', label: 'Intermediate (1+ Years)', count: 78 },
      { value: 'advanced', label: 'Advanced (3+ Years)', count: 45 },
      { value: 'expert', label: 'Expert (5+ Years)', count: 23 }
    ]
  },
  {
    id: 'age-group',
    name: 'Age Group',
    type: 'checkbox',
    options: [
      { value: 'kids-6-9', label: 'Kids (6-9)', count: 23 },
      { value: 'kids-10-12', label: 'Kids (10-12)', count: 45 },
      { value: 'teens-13-15', label: 'Teens (13-15)', count: 56 },
      { value: 'teens-16-18', label: 'Teens (16-18)', count: 67 },
      { value: 'adults-18+', label: 'Adults (18+)', count: 234 },
      { value: 'all-ages', label: 'All Ages', count: 89 }
    ]
  },
  {
    id: 'complexity',
    name: 'Build Complexity',
    type: 'select',
    helpText: 'Estimated build time and difficulty',
    options: [
      { value: 'quick', label: 'Quick Build (30min-1hr)', count: 34 },
      { value: 'basic', label: 'Basic (1-3 hours)', count: 78 },
      { value: 'intermediate', label: 'Intermediate (3-8 hours)', count: 89 },
      { value: 'advanced', label: 'Advanced (8-20 hours)', count: 56 },
      { value: 'expert', label: 'Expert (20+ hours)', count: 23 },
      { value: 'multi-day', label: 'Multi-day Project', count: 12 }
    ]
  },
  {
    id: 'components-included',
    name: 'Components Included',
    type: 'checkbox',
    options: [
      { value: 'microcontroller', label: 'Microcontroller Board', count: 145 },
      { value: 'sensors', label: 'Sensors', count: 167 },
      { value: 'actuators', label: 'Motors/Actuators', count: 89 },
      { value: 'display', label: 'Display/Screen', count: 67 },
      { value: 'power-supply', label: 'Power Supply', count: 78 },
      { value: 'breadboard', label: 'Breadboard', count: 123 },
      { value: 'jumper-wires', label: 'Jumper Wires', count: 189 },
      { value: 'resistors', label: 'Resistors', count: 156 },
      { value: 'capacitors', label: 'Capacitors', count: 134 },
      { value: 'leds', label: 'LEDs', count: 178 },
      { value: 'buttons', label: 'Buttons/Switches', count: 145 },
      { value: 'enclosure', label: 'Enclosure/Case', count: 45 }
    ]
  },
  {
    id: 'tools-included',
    name: 'Tools Included',
    type: 'checkbox',
    options: [
      { value: 'soldering-iron', label: 'Soldering Iron', count: 23 },
      { value: 'screwdrivers', label: 'Screwdrivers', count: 67 },
      { value: 'pliers', label: 'Pliers', count: 45 },
      { value: 'multimeter', label: 'Multimeter', count: 34 },
      { value: 'wire-strippers', label: 'Wire Strippers', count: 29 },
      { value: 'hex-keys', label: 'Hex Keys', count: 56 },
      { value: 'no-tools', label: 'No Tools Required', count: 89 },
      { value: 'basic-tools', label: 'Basic Tool Set', count: 78 }
    ]
  },
  {
    id: 'learning-resources',
    name: 'Learning Resources',
    type: 'checkbox',
    options: [
      { value: 'printed-manual', label: 'Printed Manual', count: 234 },
      { value: 'online-tutorials', label: 'Online Tutorials', count: 156 },
      { value: 'video-course', label: 'Video Course', count: 89 },
      { value: 'interactive-lessons', label: 'Interactive Lessons', count: 67 },
      { value: 'community-support', label: 'Community Support', count: 123 },
      { value: 'instructor-support', label: 'Instructor Support', count: 34 },
      { value: 'quick-start', label: 'Quick Start Guide', count: 178 },
      { value: 'troubleshooting', label: 'Troubleshooting Guide', count: 145 }
    ]
  },
  {
    id: 'project-category',
    name: 'Project Category',
    type: 'checkbox',
    options: [
      { value: 'automation', label: 'Home Automation', count: 67 },
      { value: 'monitoring', label: 'Environmental Monitoring', count: 45 },
      { value: 'communication', label: 'Communication Systems', count: 34 },
      { value: 'robotics', label: 'Robotics & Movement', count: 78 },
      { value: 'gaming', label: 'Gaming & Entertainment', count: 56 },
      { value: 'wearables', label: 'Wearable Tech', count: 23 },
      { value: 'art-music', label: 'Art & Music', count: 29 },
      { value: 'security', label: 'Security Systems', count: 34 },
      { value: 'transportation', label: 'Transportation', count: 19 },
      { value: 'health-fitness', label: 'Health & Fitness', count: 25 },
      { value: 'education', label: 'Educational Tools', count: 89 },
      { value: 'productivity', label: 'Productivity Tools', count: 45 }
    ]
  },
  {
    id: 'programming-language',
    name: 'Programming Language',
    type: 'checkbox',
    helpText: 'Primary programming language used',
    options: [
      { value: 'c-cpp', label: 'C/C++', count: 156 },
      { value: 'python', label: 'Python', count: 123 },
      { value: 'javascript', label: 'JavaScript', count: 67 },
      { value: 'micropython', label: 'MicroPython', count: 89 },
      { value: 'scratch', label: 'Scratch/Block-based', count: 78 },
      { value: 'java', label: 'Java', count: 34 },
      { value: 'makecode', label: 'MakeCode', count: 45 },
      { value: 'ladder-logic', label: 'Ladder Logic', count: 12 },
      { value: 'no-programming', label: 'No Programming Required', count: 56 }
    ]
  },
  {
    id: 'connectivity',
    name: 'Connectivity Features',
    type: 'checkbox',
    options: [
      { value: 'wifi', label: 'WiFi', count: 89 },
      { value: 'bluetooth', label: 'Bluetooth', count: 78 },
      { value: 'ethernet', label: 'Ethernet', count: 34 },
      { value: 'lora', label: 'LoRa/Long Range', count: 23 },
      { value: 'zigbee', label: 'Zigbee', count: 19 },
      { value: 'cellular', label: 'Cellular/GSM', count: 15 },
      { value: 'nfc', label: 'NFC', count: 12 },
      { value: 'ir', label: 'Infrared', count: 45 },
      { value: 'serial', label: 'Serial/UART', count: 156 },
      { value: 'usb', label: 'USB', count: 134 }
    ]
  },
  {
    id: 'power-source',
    name: 'Power Source',
    type: 'checkbox',
    options: [
      { value: 'usb', label: 'USB Powered', count: 156 },
      { value: 'battery', label: 'Battery Powered', count: 123 },
      { value: 'wall-adapter', label: 'Wall Adapter', count: 89 },
      { value: 'solar', label: 'Solar Powered', count: 23 },
      { value: 'rechargeable', label: 'Rechargeable Battery', count: 67 },
      { value: 'multiple', label: 'Multiple Options', count: 45 }
    ]
  },
  {
    id: 'bundle-size',
    name: 'Bundle Size',
    type: 'select',
    helpText: 'Number of components in the kit',
    options: [
      { value: 'mini', label: 'Mini Kit (5-15 items)', count: 45 },
      { value: 'standard', label: 'Standard Kit (16-50 items)', count: 89 },
      { value: 'deluxe', label: 'Deluxe Kit (51-100 items)', count: 67 },
      { value: 'ultimate', label: 'Ultimate Kit (100+ items)', count: 34 },
      { value: 'mega', label: 'Mega Kit (200+ items)', count: 12 }
    ]
  },
  {
    id: 'certification',
    name: 'Educational Certification',
    type: 'checkbox',
    helpText: 'Recognized educational standards',
    options: [
      { value: 'stem-approved', label: 'STEM Approved', count: 78 },
      { value: 'classroom-ready', label: 'Classroom Ready', count: 89 },
      { value: 'curriculum-aligned', label: 'Curriculum Aligned', count: 67 },
      { value: 'teacher-resources', label: 'Teacher Resources', count: 56 },
      { value: 'assessment-tools', label: 'Assessment Tools', count: 34 },
      { value: 'no-certification', label: 'No Certification', count: 123 }
    ]
  }
];

// Electronic Components Specific Filters (moved to electronics category)
const electronicComponentsFilters: CategoryFilter[] = [
  {
    id: 'component-category',
    name: 'Component Category',
    type: 'checkbox',
    required: true,
    options: [
      { value: 'resistors', label: 'Resistors', count: 156 },
      { value: 'capacitors', label: 'Capacitors', count: 134 },
      { value: 'inductors', label: 'Inductors & Coils', count: 78 },
      { value: 'diodes', label: 'Diodes', count: 89 },
      { value: 'transistors', label: 'Transistors', count: 112 },
      { value: 'ics', label: 'Integrated Circuits', count: 234 },
      { value: 'microcontrollers', label: 'Microcontrollers', count: 67 },
      { value: 'sensors', label: 'Sensors', count: 145 },
      { value: 'connectors', label: 'Connectors', count: 123 },
      { value: 'switches', label: 'Switches & Buttons', count: 89 },
      { value: 'leds', label: 'LEDs & Displays', count: 156 },
      { value: 'crystals', label: 'Crystals & Oscillators', count: 45 },
      { value: 'transformers', label: 'Transformers', count: 34 },
      { value: 'relays', label: 'Relays', count: 56 },
      { value: 'fuses', label: 'Fuses & Protection', count: 67 },
      { value: 'cables', label: 'Cables & Wires', count: 89 },
      { value: 'enclosures', label: 'Enclosures', count: 67 }
    ]
  },
  {
    id: 'package-type',
    name: 'Package Type',
    type: 'checkbox',
    options: [
      { value: 'through-hole', label: 'Through-Hole (THT)', count: 234 },
      { value: 'smd', label: 'Surface Mount (SMD)', count: 189 },
      { value: 'sot', label: 'SOT (Small Outline)', count: 78 },
      { value: 'soic', label: 'SOIC', count: 67 },
      { value: 'qfp', label: 'QFP', count: 45 },
      { value: 'bga', label: 'BGA', count: 23 },
      { value: 'dip', label: 'DIP', count: 156 },
      { value: 'breadboard', label: 'Breadboard Friendly', count: 156 },
      { value: 'module', label: 'Module/Breakout', count: 89 }
    ]
  },
  {
    id: 'voltage-rating',
    name: 'Voltage Rating',
    type: 'checkbox',
    helpText: 'Maximum operating voltage',
    options: [
      { value: '3v3', label: '3.3V Logic', count: 145 },
      { value: '5v', label: '5V Logic', count: 167 },
      { value: '12v', label: '12V', count: 89 },
      { value: '24v', label: '24V', count: 67 },
      { value: '48v', label: '48V', count: 34 },
      { value: '100v', label: '100V+', count: 78 },
      { value: '250v', label: '250V+', count: 45 },
      { value: '500v', label: '500V+', count: 23 }
    ]
  },
  {
    id: 'power-rating',
    name: 'Power Rating',
    type: 'checkbox',
    helpText: 'Maximum power dissipation',
    options: [
      { value: '0.125w', label: '1/8W (0.125W)', count: 89 },
      { value: '0.25w', label: '1/4W (0.25W)', count: 156 },
      { value: '0.5w', label: '1/2W (0.5W)', count: 123 },
      { value: '1w', label: '1W', count: 78 },
      { value: '2w', label: '2W', count: 45 },
      { value: '5w', label: '5W+', count: 34 }
    ]
  },
  {
    id: 'tolerance',
    name: 'Tolerance',
    type: 'checkbox',
    helpText: 'Component value tolerance',
    options: [
      { value: '1%', label: '1% (Precision)', count: 67 },
      { value: '2%', label: '2%', count: 45 },
      { value: '5%', label: '5% (Standard)', count: 156 },
      { value: '10%', label: '10%', count: 89 },
      { value: '20%', label: '20%', count: 34 }
    ]
  },
  {
    id: 'operating-temp',
    name: 'Operating Temperature',
    type: 'checkbox',
    helpText: 'Temperature range',
    options: [
      { value: 'commercial', label: 'Commercial (0°C to 70°C)', count: 234 },
      { value: 'industrial', label: 'Industrial (-40°C to 85°C)', count: 145 },
      { value: 'automotive', label: 'Automotive (-40°C to 125°C)', count: 67 },
      { value: 'military', label: 'Military (-55°C to 125°C)', count: 23 }
    ]
  },
  {
    id: 'manufacturer',
    name: 'Manufacturer',
    type: 'checkbox',
    options: [
      { value: 'texas-instruments', label: 'Texas Instruments', count: 89 },
      { value: 'analog-devices', label: 'Analog Devices', count: 67 },
      { value: 'microchip', label: 'Microchip', count: 78 },
      { value: 'st-micro', label: 'STMicroelectronics', count: 156 },
      { value: 'infineon', label: 'Infineon', count: 45 },
      { value: 'vishay', label: 'Vishay', count: 123 },
      { value: 'murata', label: 'Murata', count: 89 },
      { value: 'yageo', label: 'Yageo', count: 67 },
      { value: 'kemet', label: 'KEMET', count: 34 },
      { value: 'nichicon', label: 'Nichicon', count: 23 }
    ]
  },
  {
    id: 'mounting-style',
    name: 'Mounting Style',
    type: 'checkbox',
    options: [
      { value: 'pcb-mount', label: 'PCB Mount', count: 345 },
      { value: 'panel-mount', label: 'Panel Mount', count: 123 },
      { value: 'wire-mount', label: 'Wire Mount', count: 89 },
      { value: 'chassis-mount', label: 'Chassis Mount', count: 67 },
      { value: 'socket-mount', label: 'Socket Mount', count: 45 }
    ]
  },
  {
    id: 'pin-count',
    name: 'Pin Count',
    type: 'select',
    helpText: 'Number of pins/connections',
    options: [
      { value: '2-pin', label: '2 Pin', count: 234 },
      { value: '3-pin', label: '3 Pin', count: 89 },
      { value: '4-pin', label: '4 Pin', count: 67 },
      { value: '6-pin', label: '6 Pin', count: 45 },
      { value: '8-pin', label: '8 Pin', count: 78 },
      { value: '14-pin', label: '14 Pin', count: 56 },
      { value: '16-pin', label: '16 Pin', count: 67 },
      { value: '20-pin', label: '20 Pin', count: 34 },
      { value: '28-pin', label: '28 Pin', count: 23 },
      { value: '40-pin', label: '40+ Pin', count: 45 }
    ]
  },
  {
    id: 'interface',
    name: 'Interface/Protocol',
    type: 'checkbox',
    helpText: 'Communication interface',
    options: [
      { value: 'i2c', label: 'I²C', count: 89 },
      { value: 'spi', label: 'SPI', count: 78 },
      { value: 'uart', label: 'UART/Serial', count: 67 },
      { value: 'usb', label: 'USB', count: 45 },
      { value: 'ethernet', label: 'Ethernet', count: 23 },
      { value: 'wifi', label: 'WiFi', count: 34 },
      { value: 'bluetooth', label: 'Bluetooth', count: 56 },
      { value: 'analog', label: 'Analog', count: 156 },
      { value: 'digital', label: 'Digital I/O', count: 123 }
    ]
  },
  {
    id: 'frequency',
    name: 'Frequency Range',
    type: 'checkbox',
    helpText: 'Operating frequency',
    options: [
      { value: 'dc', label: 'DC', count: 234 },
      { value: 'low-freq', label: 'Low Freq (<1kHz)', count: 89 },
      { value: 'audio', label: 'Audio (1kHz-20kHz)', count: 67 },
      { value: 'rf', label: 'RF (1MHz-1GHz)', count: 45 },
      { value: 'microwave', label: 'Microwave (>1GHz)', count: 23 }
    ]
  },
  {
    id: 'quantity',
    name: 'Package Quantity',
    type: 'select',
    options: [
      { value: 'single', label: 'Single Unit', count: 123 },
      { value: 'pack-5', label: '5-Pack', count: 89 },
      { value: 'pack-10', label: '10-Pack', count: 89 },
      { value: 'pack-25', label: '25-Pack', count: 67 },
      { value: 'pack-50', label: '50-Pack', count: 56 },
      { value: 'pack-100', label: '100-Pack', count: 45 },
      { value: 'pack-500', label: '500-Pack', count: 34 },
      { value: 'bulk', label: 'Bulk (1000+)', count: 23 }
    ]
  },
  {
    id: 'rohs-compliant',
    name: 'RoHS Compliant',
    type: 'toggle',
    helpText: 'Lead-free and environmentally friendly'
  },
  {
    id: 'development-friendly',
    name: 'Development Friendly',
    type: 'toggle',
    helpText: 'Suitable for prototyping and development'
  }
];

// Mechanical Components Specific Filters
const mechanicalComponentsFilters: CategoryFilter[] = [
  {
    id: 'component-type',
    name: 'Component Type',
    type: 'checkbox',
    required: true,
    options: [
      { value: 'fasteners', label: 'Fasteners', count: 234 },
      { value: 'bearings', label: 'Bearings', count: 156 },
      { value: 'linear-motion', label: 'Linear Motion', count: 123 },
      { value: 'rotary-motion', label: 'Rotary Motion', count: 89 },
      { value: 'structural', label: 'Structural Components', count: 178 },
      { value: 'power-transmission', label: 'Power Transmission', count: 67 },
      { value: 'seals-gaskets', label: 'Seals & Gaskets', count: 45 },
      { value: 'springs', label: 'Springs', count: 78 },
      { value: 'couplings', label: 'Couplings & Connectors', count: 56 },
      { value: 'hardware', label: 'General Hardware', count: 134 }
    ]
  },
  {
    id: 'material',
    name: 'Material',
    type: 'checkbox',
    options: [
      { value: 'stainless-steel', label: 'Stainless Steel', count: 289 },
      { value: 'carbon-steel', label: 'Carbon Steel', count: 234 },
      { value: 'aluminum', label: 'Aluminum', count: 178 },
      { value: 'brass', label: 'Brass', count: 89 },
      { value: 'bronze', label: 'Bronze', count: 67 },
      { value: 'plastic', label: 'Plastic/Polymer', count: 145 },
      { value: 'nylon', label: 'Nylon', count: 78 },
      { value: 'delrin', label: 'Delrin (POM)', count: 56 },
      { value: 'titanium', label: 'Titanium', count: 23 },
      { value: 'rubber', label: 'Rubber/Elastomer', count: 45 }
    ]
  },
  {
    id: 'thread-standard',
    name: 'Thread Standard',
    type: 'checkbox',
    helpText: 'Thread type and pitch standard',
    options: [
      { value: 'metric', label: 'Metric (M)', count: 234 },
      { value: 'imperial', label: 'Imperial/UNC', count: 156 },
      { value: 'unf', label: 'UNF (Fine)', count: 89 },
      { value: 'bsw', label: 'BSW (Whitworth)', count: 45 },
      { value: 'npt', label: 'NPT (Pipe)', count: 34 },
      { value: 'acme', label: 'ACME', count: 23 },
      { value: 'trapezoidal', label: 'Trapezoidal', count: 19 },
      { value: 'no-thread', label: 'No Thread', count: 67 }
    ]
  },
  {
    id: 'size-range',
    name: 'Size Range',
    type: 'checkbox',
    helpText: 'Diameter or primary dimension',
    options: [
      { value: 'micro', label: 'Micro (< 2mm)', count: 45 },
      { value: 'small', label: 'Small (2-6mm)', count: 178 },
      { value: 'medium', label: 'Medium (6-12mm)', count: 234 },
      { value: 'large', label: 'Large (12-25mm)', count: 156 },
      { value: 'xl', label: 'XL (25-50mm)', count: 89 },
      { value: 'xxl', label: 'XXL (> 50mm)', count: 67 }
    ]
  },
  {
    id: 'length',
    name: 'Length Range',
    type: 'select',
    helpText: 'Overall length dimension',
    options: [
      { value: 'short', label: 'Short (< 10mm)', count: 89 },
      { value: 'standard', label: 'Standard (10-30mm)', count: 234 },
      { value: 'long', label: 'Long (30-100mm)', count: 156 },
      { value: 'extra-long', label: 'Extra Long (> 100mm)', count: 78 },
      { value: 'custom', label: 'Custom Length', count: 45 }
    ]
  },
  {
    id: 'load-capacity',
    name: 'Load Capacity',
    type: 'checkbox',
    helpText: 'Maximum load rating',
    options: [
      { value: 'light', label: 'Light (< 10kg)', count: 123 },
      { value: 'medium', label: 'Medium (10-50kg)', count: 156 },
      { value: 'heavy', label: 'Heavy (50-200kg)', count: 89 },
      { value: 'industrial', label: 'Industrial (> 200kg)', count: 67 },
      { value: 'not-applicable', label: 'Not Applicable', count: 234 }
    ]
  },
  {
    id: 'precision-grade',
    name: 'Precision Grade',
    type: 'select',
    helpText: 'Manufacturing tolerance class',
    options: [
      { value: 'standard', label: 'Standard (±0.1mm)', count: 234 },
      { value: 'precision', label: 'Precision (±0.05mm)', count: 156 },
      { value: 'high-precision', label: 'High Precision (±0.02mm)', count: 89 },
      { value: 'ultra-precision', label: 'Ultra Precision (±0.01mm)', count: 45 },
      { value: 'custom', label: 'Custom Tolerance', count: 23 }
    ]
  },
  {
    id: 'finish',
    name: 'Surface Finish',
    type: 'checkbox',
    options: [
      { value: 'unfinished', label: 'Unfinished/Raw', count: 178 },
      { value: 'zinc-plated', label: 'Zinc Plated', count: 234 },
      { value: 'chrome-plated', label: 'Chrome Plated', count: 123 },
      { value: 'anodized', label: 'Anodized', count: 156 },
      { value: 'black-oxide', label: 'Black Oxide', count: 89 },
      { value: 'passivated', label: 'Passivated', count: 67 },
      { value: 'galvanized', label: 'Galvanized', count: 78 },
      { value: 'painted', label: 'Painted/Powder Coated', count: 45 },
      { value: 'polished', label: 'Polished', count: 56 }
    ]
  },
  {
    id: 'application',
    name: 'Application',
    type: 'checkbox',
    helpText: 'Primary use case',
    options: [
      { value: '3d-printer', label: '3D Printer Build', count: 123 },
      { value: 'cnc-machine', label: 'CNC Machine', count: 89 },
      { value: 'robotics', label: 'Robotics', count: 156 },
      { value: 'automation', label: 'Automation', count: 78 },
      { value: 'furniture', label: 'Furniture Assembly', count: 134 },
      { value: 'automotive', label: 'Automotive', count: 67 },
      { value: 'aerospace', label: 'Aerospace', count: 23 },
      { value: 'marine', label: 'Marine', count: 34 },
      { value: 'general', label: 'General Purpose', count: 234 }
    ]
  },
  {
    id: 'standards',
    name: 'Standards Compliance',
    type: 'checkbox',
    helpText: 'International standards',
    options: [
      { value: 'din', label: 'DIN (German)', count: 234 },
      { value: 'iso', label: 'ISO International', count: 289 },
      { value: 'ansi', label: 'ANSI (American)', count: 156 },
      { value: 'jis', label: 'JIS (Japanese)', count: 78 },
      { value: 'bs', label: 'BS (British)', count: 67 },
      { value: 'astm', label: 'ASTM', count: 89 },
      { value: 'mil-spec', label: 'MIL-SPEC', count: 23 },
      { value: 'custom', label: 'Custom/Proprietary', count: 45 }
    ]
  },
  {
    id: 'temperature-range',
    name: 'Operating Temperature',
    type: 'checkbox',
    helpText: 'Temperature range capability',
    options: [
      { value: 'cryogenic', label: 'Cryogenic (< -50°C)', count: 12 },
      { value: 'low-temp', label: 'Low Temp (-50°C to 0°C)', count: 34 },
      { value: 'standard', label: 'Standard (0°C to 80°C)', count: 234 },
      { value: 'elevated', label: 'Elevated (80°C to 200°C)', count: 123 },
      { value: 'high-temp', label: 'High Temp (200°C to 500°C)', count: 67 },
      { value: 'extreme', label: 'Extreme (> 500°C)', count: 23 }
    ]
  },
  {
    id: 'corrosion-resistance',
    name: 'Corrosion Resistance',
    type: 'select',
    helpText: 'Environmental protection level',
    options: [
      { value: 'none', label: 'No Protection', count: 123 },
      { value: 'basic', label: 'Basic (Indoor)', count: 178 },
      { value: 'moderate', label: 'Moderate (Outdoor)', count: 156 },
      { value: 'high', label: 'High (Marine/Chemical)', count: 89 },
      { value: 'extreme', label: 'Extreme (Industrial)', count: 67 }
    ]
  },
  {
    id: 'package-quantity',
    name: 'Package Quantity',
    type: 'select',
    options: [
      { value: 'single', label: 'Single Unit', count: 89 },
      { value: 'pack-5', label: '5-Pack', count: 123 },
      { value: 'pack-10', label: '10-Pack', count: 156 },
      { value: 'pack-25', label: '25-Pack', count: 134 },
      { value: 'pack-50', label: '50-Pack', count: 89 },
      { value: 'pack-100', label: '100-Pack', count: 78 },
      { value: 'bulk', label: 'Bulk (500+)', count: 67 }
    ]
  },
  {
    id: 'installation',
    name: 'Installation Method',
    type: 'checkbox',
    options: [
      { value: 'threaded', label: 'Threaded/Screwed', count: 234 },
      { value: 'press-fit', label: 'Press Fit', count: 123 },
      { value: 'snap-fit', label: 'Snap Fit', count: 89 },
      { value: 'welded', label: 'Welded', count: 67 },
      { value: 'bolted', label: 'Bolted', count: 156 },
      { value: 'adhesive', label: 'Adhesive/Bonded', count: 45 },
      { value: 'magnetic', label: 'Magnetic', count: 23 },
      { value: 'clamp', label: 'Clamped', count: 78 }
    ]
  }
];

// Export category filter sets
export const categoryFilterSets: CategoryFilterSet[] = [
  { category: '3d-printers', filters: printerFilters },
  { category: 'electronics', filters: electronicsFilters },
  { category: 'tools', filters: toolsFilters },
  { category: 'materials', filters: materialsFilters },
  { category: 'kits', filters: kitsFilters },
  { category: 'components', filters: mechanicalComponentsFilters }
];

// Helper function to get filters for a specific category
export function getFiltersForCategory(categorySlug: string): CategoryFilter[] {
  // First try to get filters from admin data service if available
  if (typeof window !== 'undefined') {
    try {
      const { adminDataService } = require('@/lib/adminData');
      const adminFilters = adminDataService.getFiltersForCategory(categorySlug);
      if (adminFilters.length > 0) {
        return adminFilters;
      }
    } catch (error) {
      // Fallback to static filters if admin service is not available
    }
  }

  // Fallback to static filters
  const filterSet = categoryFilterSets.find(set => set.category === categorySlug);
  return filterSet ? filterSet.filters : [];
}

// Common filters that appear in all categories
export const commonFilters: CategoryFilter[] = [
  {
    id: 'price',
    name: 'Price Range',
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
      { value: 'ultimaker', label: 'Ultimaker', count: 23 },
      { value: 'anycubic', label: 'Anycubic', count: 67 },
      { value: 'flashforge', label: 'FlashForge', count: 34 },
      { value: 'adafruit', label: 'Adafruit', count: 89 }
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
    id: 'rating',
    name: 'Customer Rating',
    type: 'checkbox',
    options: [
      { value: '4-stars', label: '4+ Stars', count: 1234 },
      { value: '3-stars', label: '3+ Stars', count: 1789 },
      { value: '2-stars', label: '2+ Stars', count: 1923 },
      { value: '1-star', label: '1+ Stars', count: 2156 }
    ]
  }
];

// Get all filters for a category (category-specific + common)
export function getAllFiltersForCategory(categorySlug: string): CategoryFilter[] {
  const categorySpecific = getFiltersForCategory(categorySlug);
  return [...categorySpecific, ...commonFilters];
}
