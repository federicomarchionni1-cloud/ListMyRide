import { VehicleData, ConditionResult } from './vehicle';

export type ListingStatus = 'draft' | 'ready' | 'exported';

export type Platform = 'ebay' | 'facebook' | 'autotrader' | 'gumtree' | 'generic';

export interface ListingSpecs {
  make: string;
  model: string;
  year: number;
  engineCC: number;
  fuelType: string;
  colour: string;
  mileage: number | null;
  motExpiry: string;
  taxStatus: string;
}

export interface ListingContent {
  title: string;
  description: string;
  suggestedPriceGBP: number;
  userPriceGBP: number | null;
  priceRationale: string;
  mileage: number | null;
  keySellingPoints: string[];
  specs: ListingSpecs;
  tags: string[];
  ebayCategory: string;
}

export interface Listing {
  id: string;
  userId: string;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  plate: string;
  vehicle: VehicleData;
  photos: string[];
  condition: ConditionResult;
  listing: ListingContent;
}

export interface ListingDraft {
  plate: string | null;
  vehicle: VehicleData | null;
  photoUris: string[];
  draftId: string | null;
}

export interface PlatformExport {
  platform: Platform;
  title: string;
  description: string;
  price: number;
  metadata?: Record<string, string>;
}

export interface AnalysisJob {
  listingId: string;
  userId: string;
  status: 'pending' | 'uploading' | 'dvla' | 'analysing' | 'generating' | 'complete' | 'failed';
  step: number;
  error: string | null;
}
