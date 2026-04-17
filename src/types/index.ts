export type CuisineType =
  | 'coffee' | 'tacos' | 'bbq' | 'asian' | 'dessert'
  | 'burgers' | 'vegan' | 'pizza' | 'thai' | 'japanese'
  | 'fish-chips' | 'bubble-tea' | 'indian' | 'mexican' | 'other';

export type DietaryTag = 'vegan' | 'vegetarian' | 'halal' | 'gluten-free' | 'nut-free' | 'dairy-free';
export type PaymentMethod = 'eftpos' | 'cash' | 'apple-pay' | 'google-pay';
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

export interface VendorLocation {
  lat: number;
  lng: number;
  suburb: string;
  state: AustralianState;
  is_live: boolean;
  expires_at: string;
  event_name?: string;
  notes?: string;
  updated_at: string;
}

export interface ScheduleEntry {
  day_of_week: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  start_time: string;
  end_time: string;
  location_name: string;
  suburb: string;
  state: AustralianState;
  lat?: number;
  lng?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  photo_url?: string;
  dietary_tags: DietaryTag[];
  is_available: boolean;
}

export interface Review {
  id: string;
  user_display_name: string;
  rating: number;
  comment?: string;
  vendor_reply?: string;
  created_at: string;
}

export interface Market {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location_name: string;
  suburb: string;
  state: AustralianState;
  lat: number;
  lng: number;
  frequency: string;
  day_of_week?: string;
  cover_photo_url?: string;
  website_url?: string;
}

export interface Vendor {
  id: string;
  business_name: string;
  slug: string;
  cuisine_type: CuisineType[];
  description?: string;
  cover_photo_url?: string;
  logo_url?: string;
  dietary_tags: DietaryTag[];
  payment_methods: PaymentMethod[];
  price_range: 1 | 2 | 3 | 4;
  phone?: string;
  email?: string;
  website_url?: string;
  instagram_handle?: string;
  state: AustralianState;
  suburb: string;
  is_active: boolean;
  subscription_tier: 'basic' | 'pro' | 'premium';
  avg_rating?: number;
  review_count?: number;
  location?: VendorLocation;
  schedule?: ScheduleEntry[];
  menu_items?: MenuItem[];
  reviews?: Review[];
  distance_km?: number;
}

export interface FilterState {
  openNow: boolean;
  cuisineTypes: CuisineType[];
  dietaryTags: DietaryTag[];
  state: AustralianState | 'ALL';
  searchQuery: string;
  radius: 2 | 5 | 10 | 20;
}
