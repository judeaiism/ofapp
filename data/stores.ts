import { Store } from '@/types/store';

// You can organize stores by area/region if needed
export const CAPE_TOWN_STORES: Store[] = [
  {
    id: 1,
    name: "Fabulous Wiid",
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
    coverImages: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
      // Add more cover images...
    ],
    distance: "2.1",
    address: "Shop 4, Gardens Shopping Centre, Mill St, Gardens, Cape Town",
    coordinates: {
      latitude: -33.9271,
      longitude: 18.4173
    },
    description: "Premium florist offering bespoke arrangements and wedding services",
    hours: {
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
      saturday: "09:00-14:00",
      sunday: "Closed"
    },
    contact: {
      phone: "+27 21 424 5344",
      email: "info@fabulousflowers.co.za",
      website: "https://fabulousflowers.co.za",
      whatsapp: "+27 82 123 4567"
    },
    social: {
      instagram: "@fabulousflowerscpt",
      facebook: "FabulousFlowersCPT",
      twitter: "@fabulousflowerscpt"
    },
    services: [
      "Wedding Bouquets",
      "Corporate Events",
      "Gift Arrangements"
    ],
    specialties: [
      "Wedding Flowers",
      "Exotic Arrangements",
      "Corporate Services"
    ],
    priceRange: "$$",
    paymentMethods: [
      "Credit Card",
      "Debit Card",
      "Cash",
      "EFT"
    ],
    deliveryInfo: {
      available: true,
      fee: 50,
      minOrder: 200,
      areas: ["City Bowl", "Atlantic Seaboard", "Southern Suburbs"],
      estimatedTime: "45-60 minutes"
    },
    featured: true,
    products: [
      {
        id: 1,
        name: "Premium Rose Bouquet",
        price: 499.99,
        image: "https://images.unsplash.com/photo-1548386135-000f8f8b6308",
        description: "Luxurious arrangement of fresh red roses",
        category: "Bouquets",
        inStock: true
      },
      // Add more products...
    ]
  },
  {
    id: 2,
    name: "Wiid Accessories & More",
    rating: 4.7,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9",
    coverImages: [
      "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9"
    ],
    distance: "1.8",
    address: "Shop 7, V&A Waterfront, Cape Town",
    coordinates: {
      latitude: -33.9033,
      longitude: 18.4197
    },
    description: "Your one-stop shop for all wiid accessories, vases, ribbons, and flower care products",
    hours: {
      monday: "09:00-18:00",
      tuesday: "09:00-18:00",
      wednesday: "09:00-18:00",
      thursday: "09:00-18:00",
      friday: "09:00-19:00",
      saturday: "09:00-17:00",
      sunday: "10:00-14:00"
    },
    contact: {
      phone: "+27 21 424 9876",
      email: "info@wiidaccessories.co.za",
      website: "https://wiidaccessories.co.za",
      whatsapp: "+27 82 345 6789"
    },
    social: {
      instagram: "@wiidaccessoriescpt",
      facebook: "WiidAccessoriesCPT",
      twitter: "@wiidaccessoriescpt"
    },
    services: [
      "Vase Customization",
      "Gift Wrapping",
      "Bulk Orders",
      "Professional Advice"
    ],
    specialties: [
      "Premium Vases",
      "Flower Care Products",
      "Decorative Accessories"
    ],
    priceRange: "$$",
    paymentMethods: [
      "Credit Card",
      "Debit Card",
      "Cash",
      "EFT",
      "Snapscan"
    ],
    deliveryInfo: {
      available: true,
      fee: 45,
      minOrder: 150,
      areas: ["City Bowl", "Atlantic Seaboard", "Southern Suburbs"],
      estimatedTime: "30-45 minutes"
    },
    featured: true,
    products: [
      {
        id: 1,
        name: "Crystal Glass Vase",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5",
        description: "Elegant crystal vase perfect for long-stem roses",
        category: "Vases",
        inStock: true
      },
      {
        id: 2,
        name: "Ceramic Plant Pot",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
        description: "Modern ceramic pot with drainage hole",
        category: "Containers",
        inStock: true
      },
      {
        id: 3,
        name: "Flower Food Pack",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1620503374956-c942862f0372",
        description: "Professional flower food for longer lasting blooms",
        category: "Care Products",
        inStock: true
      },
      {
        id: 40,
        name: "Decorative Pebbles",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1",
        description: "Natural decorative pebbles for vase arrangements",
        category: "Decorative",
        inStock: true
      }
    ]
  }
];

// You can add more regions as needed
export const JOHANNESBURG_STORES: Store[] = [
  // ... Johannesburg stores
];

// Combine all stores for easy access
export const ALL_STORES: Store[] = [
  ...CAPE_TOWN_STORES,
  ...JOHANNESBURG_STORES
];

// Helper function to get store by ID
export function getStoreById(id: number): Store | undefined {
  return ALL_STORES.find(store => store.id === id);
}

// Helper function to get stores by region
export function getStoresByRegion(region: 'cape-town' | 'johannesburg'): Store[] {
  switch (region) {
    case 'cape-town':
      return CAPE_TOWN_STORES;
    case 'johannesburg':
      return JOHANNESBURG_STORES;
    default:
      return ALL_STORES;
  }
} 