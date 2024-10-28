import { Store } from '@/types/store';

// You can organize stores by area/region if needed
export const CAPE_TOWN_STORES: Store[] = [
  {
    id: 1,
    name: "Fabulous Flowers",
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
    name: "Waterfront Blooms",
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1558024160-4bfcbc4ee607",
    coverImages: [
      "https://images.unsplash.com/photo-1558024160-4bfcbc4ee607",
      // Add more cover images...
    ],
    distance: "3.4",
    address: "Shop 123, Victoria Wharf Shopping Centre, V&A Waterfront, Cape Town",
    coordinates: {
      latitude: -33.9033,
      longitude: 18.4197
    },
    description: "Located in the heart of V&A Waterfront, offering premium floral designs",
    hours: {
      monday: "09:00-18:00",
      tuesday: "09:00-18:00",
      wednesday: "09:00-18:00",
      thursday: "09:00-18:00",
      friday: "09:00-19:00",
      saturday: "09:00-19:00",
      sunday: "10:00-17:00"
    },
    contact: {
      phone: "+27 21 418 2288",
      email: "info@waterfrontblooms.co.za",
      website: "https://waterfrontblooms.co.za",
      whatsapp: "+27 83 456 7890"
    },
    social: {
      instagram: "@waterfrontblooms",
      facebook: "WaterfrontBlooms",
      twitter: "@waterfrontbloom"
    },
    services: [
      "Luxury Bouquets",
      "Event Styling",
      "Hotel Flowers"
    ],
    specialties: [
      "Luxury Arrangements",
      "Indigenous Flowers",
      "European Style"
    ],
    priceRange: "$$$",
    paymentMethods: [
      "Credit Card",
      "EFT",
      "Cash",
      "Zapper"
    ],
    deliveryInfo: {
      available: true,
      fee: 75,
      minOrder: 350,
      areas: ["City Bowl", "Atlantic Seaboard", "V&A Waterfront"],
      estimatedTime: "45-60 minutes"
    },
    featured: true,
    products: [
      {
        id: 1,
        name: "Seasonal Mixed Bouquet",
        price: 399.99,
        image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
        description: "Beautiful mix of seasonal flowers",
        category: "Bouquets",
        inStock: true
      },
      // Add more products...
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