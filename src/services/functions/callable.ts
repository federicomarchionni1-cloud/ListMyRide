import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/services/firebase/config';
import { DVLAResponse } from '@/types/vehicle';

interface DVLALookupResponse {
  vehicle: DVLAResponse;
}

interface AnalyseVehicleResponse {
  listingId: string;
  jobId: string;
}

// Workaround: Firebase v12 + React Native initializeAuth doesn't reliably attach
// the ID token to httpsCallable requests. We pass it explicitly in the body and
// the function falls back to verifying it manually if request.auth is missing.
async function authedCall<TData extends object, TResult>(
  name: string,
  data: TData,
  options?: { timeout?: number }
): Promise<TResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to continue.');
  const _authToken = await user.getIdToken();

  const fn = httpsCallable<TData & { _authToken: string }, TResult>(functions, name, options);
  const result = await fn({ ...data, _authToken });
  return result.data;
}

export async function callDVLALookup(plate: string): Promise<DVLAResponse> {
  const result = await authedCall<{ plate: string }, DVLALookupResponse>('dvlaLookup', { plate });
  return result.vehicle;
}

export async function callAnalyseVehicle(
  plate: string,
  photoUrls: string[],
  userId: string,
  mileage?: number
): Promise<{ listingId: string; jobId: string }> {
  return authedCall<
    { plate: string; photoUrls: string[]; userId: string; mileage?: number },
    AnalyseVehicleResponse
  >('analyseVehicle', { plate, photoUrls, userId, mileage }, { timeout: 120000 });
}
