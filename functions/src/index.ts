import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { lookupPlate } from './dvla';
import { analyseCondition, generateListing } from './openai';
import {
  createListingDocument,
  updateJobStatus,
  saveVehicleData,
  saveConditionAndListing,
} from './listings';

admin.initializeApp();

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const DVLA_API_KEY = defineSecret('DVLA_API_KEY');

// Workaround for Firebase v12 + React Native initializeAuth: httpsCallable
// sometimes drops the ID token. The client passes it as `_authToken` in the
// request body and we verify it here when request.auth is missing.
async function resolveUid(request: CallableRequest): Promise<string> {
  if (request.auth?.uid) return request.auth.uid;
  const fallback = (request.data as { _authToken?: string })?._authToken;
  if (fallback) {
    try {
      const decoded = await admin.auth().verifyIdToken(fallback);
      return decoded.uid;
    } catch {
      throw new HttpsError('unauthenticated', 'Invalid authentication token.');
    }
  }
  throw new HttpsError('unauthenticated', 'Authentication required.');
}

// ── dvlaLookup ────────────────────────────────────────────────────────────────
export const dvlaLookup = onCall(
  { secrets: [DVLA_API_KEY], region: 'europe-west2' },
  async (request) => {
    await resolveUid(request);

    const { plate } = request.data as { plate: string };
    if (!plate || typeof plate !== 'string') {
      throw new HttpsError('invalid-argument', 'A plate number is required.');
    }

    try {
      const vehicle = await lookupPlate(plate, DVLA_API_KEY.value());
      return { vehicle };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        throw new HttpsError('not-found', 'Vehicle not found. Please check the registration number.');
      }
      throw new HttpsError('internal', 'Failed to look up vehicle. Please try again.');
    }
  }
);

// ── analyseVehicle ────────────────────────────────────────────────────────────
export const analyseVehicle = onCall(
  {
    secrets: [OPENAI_API_KEY, DVLA_API_KEY],
    region: 'europe-west2',
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async (request) => {
    const uid = await resolveUid(request);

    const { plate, photoUrls, userId, mileage } = request.data as {
      plate: string;
      photoUrls: string[];
      userId: string;
      mileage?: number;
    };

    if (userId !== uid) {
      throw new HttpsError('permission-denied', 'User ID mismatch.');
    }

    if (!plate || !photoUrls?.length || !userId) {
      throw new HttpsError('invalid-argument', 'plate, photoUrls, and userId are required.');
    }

    // Step 0 — Create listing + job documents
    const { listingId, jobId } = await createListingDocument(userId, plate, photoUrls);

    try {
      // Step 1 — DVLA lookup
      await updateJobStatus(jobId, 'dvla', 1);
      const vehicle = await lookupPlate(plate, DVLA_API_KEY.value());
      await saveVehicleData(listingId, vehicle);

      // Step 2 — Condition analysis (GPT-4o Vision)
      await updateJobStatus(jobId, 'analysing', 2);
      const condition = await analyseCondition(photoUrls, OPENAI_API_KEY.value());

      // Step 3 — Listing generation (GPT-4o text)
      await updateJobStatus(jobId, 'generating', 3);
      const listing = await generateListing(vehicle, condition, OPENAI_API_KEY.value(), mileage);

      // Step 4 — Save to Firestore
      await saveConditionAndListing(listingId, condition, listing);
      await updateJobStatus(jobId, 'complete', 4);

      return { listingId, jobId };
    } catch (err: any) {
      await updateJobStatus(jobId, 'failed', -1, err.message ?? 'Unknown error');
      throw new HttpsError('internal', err.message ?? 'Analysis failed. Please try again.');
    }
  }
);
