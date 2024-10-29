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
      {
        id: 2,
        name: "Spring Garden Mix",
        price: 399.99,
        image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94",
        description: "Colorful mix of seasonal spring flowers",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 3,
        name: "Elegant White Orchids",
        price: 599.99,
        image: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d",
        description: "Pure white orchids in a ceramic pot",
        category: "Plants",
        inStock: true
      },
      {
        id: 4,
        name: "Tropical Paradise",
        price: 449.99,
        image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
        description: "Exotic arrangement with birds of paradise",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 5,
        name: "Succulent Garden",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1446071103084-c257b5f70672",
        description: "Mixed succulent arrangement in terrarium",
        category: "Plants",
        inStock: true
      },
      {
        id: 6,
        name: "Birthday Celebration",
        price: 449.99,
        image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
        description: "Festive arrangement perfect for birthdays",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 7,
        name: "Peace Lily Plant",
        price: 349.99,
        image: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d",
        description: "Air-purifying peace lily in decorative pot",
        category: "Plants",
        inStock: true
      },
      {
        id: 8,
        name: "Luxury Valentine's Special",
        price: 699.99,
        image: "https://images.unsplash.com/photo-1548386135-000f8f8b6308",
        description: "Premium roses with chocolates and wine",
        category: "Special",
        inStock: true
      }
    ]
  }
];

// Combine all stores for easy access
export const ALL_STORES: Store[] = [...CAPE_TOWN_STORES];

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
      return ALL_STORES;
    default:
      return ALL_STORES;
  }
} 