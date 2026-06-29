/**
 * Shared TypeScript types derived from the Supabase database schema.
 * Use these throughout the app instead of `any` for Supabase rows.
 */

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
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
  trust_score: number;
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
  risk_level: RiskLevel | null;
  resolution_status: ResolutionStatus;
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

/** A Property augmented with mock coordinates for the map view */
export interface PropertyWithCoords extends Property {
  latitude: number;
  longitude: number;
}
