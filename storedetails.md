{
  // Basic Information
  id: number,                    // Unique identifier for the store
  name: string,                  // Store name
  rating: number,                // Store rating (e.g., 4.8)
  reviews: number,               // Number of reviews
  image: string,                 // Main store image URL
  coverImages: string[],         // Array of image URLs for store gallery
  distance: string,              // Distance (e.g., "2.1")
  address: string,               // Full store address
  
  // Location
  coordinates: {
    latitude: number,            // Store latitude
    longitude: number,           // Store longitude
  },
  
  // Store Details
  description: string,           // Store description
  
  // Operating Hours
  hours: {
    monday: string,              // Format: "HH:MM-HH:MM" or "Closed"
    tuesday: string,
    wednesday: string,
    thursday: string,
    friday: string,
    saturday: string,
    sunday: string,
  },
  
  // Contact Information
  contact: {
    phone: string,               // Phone number
    email: string,               // Email address
    website?: string,            // Optional website URL
    whatsapp?: string,          // Optional WhatsApp number
  },
  
  // Social Media (all optional)
  social?: {
    instagram?: string,          // Instagram handle
    facebook?: string,          // Facebook page name
    twitter?: string,           // Twitter handle
  },
  
  // Store Features
  services: string[],            // Array of services offered
  specialties: string[],         // Array of store specialties
  priceRange: '$' | '$$' | '$$$' | '$$$$',  // Price category
  paymentMethods: string[],      // Array of accepted payment methods
  
  // Delivery Information
  deliveryInfo: {
    available: boolean,          // Whether delivery is available
    fee: number,                // Delivery fee amount
    minOrder: number,           // Minimum order amount
    areas: string[],            // Array of delivery areas
    estimatedTime: string,      // Estimated delivery time
  },
  
  featured?: boolean,            // Whether the store is featured
  
  // Products
  products: {
    id: number,                  // Unique product identifier
    name: string,                // Product name
    price: number,               // Product price
    image: string,               // Product image URL
    description: string,         // Product description
    category: string,            // Product category
    inStock: boolean,            // Whether product is in stock
  }[]
}