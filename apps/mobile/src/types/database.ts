/**
 * Shared TypeScript types derived from the Supabase database schema.
 * Use these throughout the app instead of `any` for Supabase rows.
 */

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'renter' | 'owner';
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  owner_id: string | null;
  trust_score: number;
  rent_price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  cover_image: string | null;
  description: string | null;
  is_listed: boolean;
  created_at: string;
  updated_at: string;
}

export type ReportType = 'noise' | 'maintenance' | 'safety' | 'management' | 'other';
export type AiAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type ResolutionStatus = 'unresolved' | 'resolving' | 'resolved';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Report {
  id: string;
  property_id: string;
  reporter_id: string | null;
  report_type: ReportType;
  description: string;
  ai_analysis_status: AiAnalysisStatus;
  ai_summary: string | null;
  risk_level: 'low' | 'medium' | 'high' | null;
  resolution_status: 'unresolved' | 'resolving' | 'resolved';
  resolution_text: string | null;
  resolution_media_urls: string[];
  media_urls: string[];
  created_at: string;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  // Joined data
  properties?: Property;
}

export interface RenterReview {
  id: string;
  property_id: string;
  renter_name: string;
  pros: string | null;
  cons: string | null;
  rating: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  property_id: string;
  renter_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  renter?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/** A Property augmented with mock coordinates for the map view */
export interface PropertyWithCoords extends Property {
  latitude: number;
  longitude: number;
}
