import { auth } from '@/services/firebase/config';
import { DVLAResponse } from '@/types/vehicle';

const FUNCTIONS_BASE = 'https://europe-west2-listmyride-c8f1.cloudfunctions.net';

async function callFunction<TData, TResult>(name: string, data: TData): Promise<TResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to continue.');

  const token = await user.getIdToken();

  const response = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message ?? 'Something went wrong.');
  return json.result as TResult;
}

interface DVLALookupResponse {
  vehicle: DVLAResponse;
}

interface AnalyseVehicleResponse {
  listingId: string;
  jobId: string;
}

export async function callDVLALookup(plate: string): Promise<DVLAResponse> {
  const result = await callFunction<{ plate: string }, DVLALookupResponse>('dvlaLookup', { plate });
  return result.vehicle;
}

export async function callAnalyseVehicle(
  plate: string,
  photoUrls: string[],
  userId: string,
  mileage?: number
): Promise<{ listingId: string; jobId: string }> {
  return callFunction('analyseVehicle', { plate, photoUrls, userId, mileage });
}
