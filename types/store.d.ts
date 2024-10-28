export interface Store {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  coverImages: string[];
  distance: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  services: string[];
  specialties: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  paymentMethods: string[];
  deliveryInfo: {
    available: boolean;
    fee: number;
    minOrder: number;
    areas: string[];
    estimatedTime: string;
  };
  featured?: boolean;
  products: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
    inStock: boolean;
  }[];
} 