import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/services/firebase/config';
import { DVLAResponse } from '@/types/vehicle';

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

async function requireToken(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to continue.');
  // Force-refreshes the token so Firebase's internal cache has it ready for httpsCallable.
  // Without this, Firebase v12 + React Native initializeAuth can race and send no token.
  await user.getIdToken(true);
}

export async function callDVLALookup(plate: string): Promise<DVLAResponse> {
  await requireToken();
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
  await requireToken();
  const fn = httpsCallable<AnalyseVehicleRequest, AnalyseVehicleResponse>(
    functions,
    'analyseVehicle',
    { timeout: 120000 }
  );
  const result = await fn({ plate, photoUrls, userId, mileage });
  return result.data;
}
