import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase/config';
import { DVLAResponse, ConditionResult } from '@/types/vehicle';
import { Listing } from '@/types/listing';

interface DVLALookupRequest {
  plate: string;
}

interface DVLALookupResponse {
  vehicle: DVLAResponse;
}

interface AnalyseVehicleRequest {
  plate: string;
  photoUrls: string[];
  userId: string;
  mileage?: number;
}

interface AnalyseVehicleResponse {
  listingId: string;
  jobId: string;
}

export async function callDVLALookup(plate: string): Promise<DVLAResponse> {
  const fn = httpsCallable<DVLALookupRequest, DVLALookupResponse>(functions, 'dvlaLookup');
  const result = await fn({ plate });
  return result.data.vehicle;
}

export async function callAnalyseVehicle(
  plate: string,
  photoUrls: string[],
  userId: string,
  mileage?: number
): Promise<{ listingId: string; jobId: string }> {
  const fn = httpsCallable<AnalyseVehicleRequest, AnalyseVehicleResponse>(
    functions,
    'analyseVehicle',
    { timeout: 120000 }
  );
  const result = await fn({ plate, photoUrls, userId, mileage });
  return result.data;
}
