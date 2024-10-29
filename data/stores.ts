import { Store } from '@/types/store';

// Import images
const storeImages = {
  onlyWiid: {
    main: require('../assets/images/stores/only-wiid/store.jpg'),
    covers: [
      require('../assets/images/stores/only-wiid/cover-1.jpg'),
      require('../assets/images/stores/only-wiid/cover-2.jpg'),
    ],
    products: {
      product1: require('@/assets/images/stores/only-wiid/products/product-1.jpg'),
      product2: require('@/assets/images/stores/only-wiid/products/product-2.jpg'),
      product3: require('@/assets/images/stores/only-wiid/products/product-3.jpg'),
      product4: require('@/assets/images/stores/only-wiid/products/product-4.jpg'),
      product5: require('@/assets/images/stores/only-wiid/products/product-5.jpg'),
      product6: require('@/assets/images/stores/only-wiid/products/product-6.jpg'),
      product7: require('@/assets/images/stores/only-wiid/products/product-7.jpg'),
      product8: require('@/assets/images/stores/only-wiid/products/product-8.jpg'),
    }
  }
};

// You can organize stores by area/region if needed
export const CAPE_TOWN_STORES: Store[] = [
  {
    id: 1,
    name: "Only Wiid",
    rating: 4.8,
    reviews: 156,
    image: storeImages.onlyWiid.main,
    coverImages: storeImages.onlyWiid.covers,
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
      phone: '+27 1-800 WiiD',
      email: "info@onlywiid.co.za",
      website: "https://onlywiid.co.za",
      whatsapp: "+27 82 123 4567"
    },
    social: {
      instagram: "@onlyWiid",
      facebook: "OnlyWiid",
      twitter: "@onlywiid"
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
      fee: 0,
      minOrder: 1000,
      areas: ["City Bowl", "Camps Bay", "SeaPoint", "Sandton", "Green Point", "Capetown CBD", "Atlantic Seaboard", "Southern Suburbs"],
      estimatedTime: "45-60 minutes"
    },
    featured: true,
    products: [
      {
        id: 1,
        name: "Black Afghan 11g",
        price: 3663.99,
        image: storeImages.onlyWiid.products.product1,
        description: "Luxurious arrangement of fresh red roses",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 2,
        name: "Power Outage 14g",
        price: 3500.99,
        image: storeImages.onlyWiid.products.product2,
        description: "Colorful mix of seasonal spring flowers",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 3,
        name: "Elegant White orchids 14g",
        price: 3500.99,
        image: storeImages.onlyWiid.products.product3,
        description: "Pure white orchids in a ceramic pot",
        category: "Plants",
        inStock: true
      },
      {
        id: 4,
        name: "Cocktail 14g",
        price: 2800.99,
        image: storeImages.onlyWiid.products.product4,
        description: "Exotic arrangement with birds of paradise",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 5,
        name: "Succulent Garden",
        price: 299.99,
        image: storeImages.onlyWiid.products.product5,
        description: "Mixed succulent arrangement in terrarium",
        category: "Plants",
        inStock: true
      },
      {
        id: 6,
        name: "Birthday Celebration",
        price: 449.99,
        image: storeImages.onlyWiid.products.product6,
        description: "Festive arrangement perfect for birthdays",
        category: "Bouquets",
        inStock: true
      },
      {
        id: 7,
        name: "Khalifa Kush",
        price: 800.99,
        image: storeImages.onlyWiid.products.product7,
        description: "Air-purifying peace lily in decorative pot",
        category: "Plants",
        inStock: true
      },
      {
        id: 8,
        name: "Luxury Valentine's Special",
        price: 999.99,
        image: storeImages.onlyWiid.products.product8,
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