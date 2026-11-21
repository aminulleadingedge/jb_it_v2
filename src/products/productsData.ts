/**
 * ============================================================================
 * JB IT PRODUCTS CATALOG DATA
 * ============================================================================
 * 
 * HOW TO ADD A NEW PRODUCT:
 * 1. Place the product image in `/src/assets/products/`
 * 2. Add an entry to `PRODUCTS_CATALOG` below:
 *    {
 *      id: 'prod-my-unique-id',
 *      name: 'Full Name of the Product',
 *      category: 'ips-battery' | 'office-equipment' | 'it-accessories' | 'network-rack' | 'cctv-security',
 *      categoryLabel: 'Category Display Name',
 *      imageUrl: '/src/assets/products/my_product.png',
 *      specs: ['Spec 1', 'Spec 2', 'Spec 3'],
 *    }
 * ============================================================================
 */

import type { ProductCategoryTab, ProductCatalogItem, ProductCategoryId } from './types';

// Category Showcase Images (stored in /src/assets/products/)
export const IMG_IPS_BATTERY = '/src/assets/products/product_ips_battery_cutout.png';
export const IMG_OFFICE_PRINTER = '/src/assets/products/product_office_printer_cutout.png';
export const IMG_NETWORK_RACK = '/src/assets/products/product_network_rack_cutout.png';
export const IMG_IT_ACCESSORIES = '/src/assets/products/product_it_accessories_cutout.png';
export const IMG_CCTV_KIT = '/src/assets/products/product_cctv_kit_cutout.png';
export const IMG_BUSINESS_LAPTOP = '/src/assets/products/product_business_laptop.jpg';

export * from './types';

export const PRODUCT_CATEGORIES: ProductCategoryTab[] = [
  { id: 'all', label: 'All Products' },
  { id: 'ips-battery', label: 'IPS & Battery' },
  { id: 'office-equipment', label: 'Office Equipment' },
  { id: 'it-accessories', label: 'IT Accessories' },
  { id: 'network-rack', label: 'Network Accessories' },
  { id: 'cctv-security', label: 'CCTV & Security' },
];

export const PRODUCTS_CATALOG: ProductCatalogItem[] = [
  // 1. IPS & Battery
  {
    id: 'prod-ips-inverter',
    name: 'Luminous Zelio Pure Sine Wave IPS Inverter',
    category: 'ips-battery',
    categoryLabel: 'IPS & Battery',
    imageUrl: IMG_IPS_BATTERY,
    specs: [
      'Pure Sine Wave Output (Grid Quality)',
      'Smart Digital Display with Backup Time Indicator',
      'Supports 600VA to 2000VA Heavy-Duty Loads',
      'Advanced 32-bit Microcontroller Protection',
      '24 Months Official Warranty',
    ],
  },

  // 2. Office Equipment
  {
    id: 'prod-office-printer',
    name: 'Enterprise Duplex Laser Multifunction Printer',
    category: 'office-equipment',
    categoryLabel: 'Office Equipment',
    imageUrl: IMG_OFFICE_PRINTER,
    specs: [
      'Automatic Double-Sided Duplex Printing',
      'High-Speed Output Up to 42 Pages Per Minute',
      'Gigabit Ethernet & Secure Wi-Fi Network Ready',
      'High-Yield Genuine OEM Toner Compatible',
    ],
  },

  // 3. IT Accessories
  {
    id: 'prod-it-accessories',
    name: 'Logitech Wireless Keyboard & Optical Mouse Combo',
    category: 'it-accessories',
    categoryLabel: 'IT Accessories',
    imageUrl: IMG_IT_ACCESSORIES,
    specs: [
      '2.4GHz Nano USB Receiver with 10m Wireless Range',
      'Silent Whisper-Quiet Scissor/Membrane Keys',
      'Extended Battery Life Up to 36 Months',
      'Spill-Resistant Ergonomic Typing Deck',
    ],
  },

  // 4. Network Accessories
  {
    id: 'prod-network-router',
    name: 'High-Speed Dual-Band Gigabit Wi-Fi 6 Router',
    category: 'network-rack',
    categoryLabel: 'Network Accessories',
    imageUrl: IMG_NETWORK_RACK,
    specs: [
      'Full Gigabit WAN & 4x Gigabit LAN Ethernet Ports',
      '4x High-Gain Multi-Directional Antennas',
      'Hardware Firewall & WPA3 Enterprise Wireless Security',
      'Seamless Multi-Device Beamforming Technology',
    ],
  },

  // 5. CCTV & Security
  {
    id: 'prod-cctv-system',
    name: '4K Ultra HD PoE Security Camera System & NVR Box',
    category: 'cctv-security',
    categoryLabel: 'CCTV & Security',
    imageUrl: IMG_CCTV_KIT,
    specs: [
      'Ultra HD 4K (8MP) Crystal Clear Surveillance Resolution',
      'Single Cat6 Cable Transmits Both Power & 4K Video',
      '24/7 Mobile App Remote Live View & Instant Push Alerts',
      'Smart Motion Detection & Night Vision IR Cut Filter',
    ],
  },
];
