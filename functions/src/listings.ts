import * as admin from 'firebase-admin';
import { DVLAVehicle } from './dvla';
import { ConditionResult, ListingResult } from './openai';

const db = () => admin.firestore();

export async function createListingDocument(
  userId: string,
  plate: string,
  photoUrls: string[]
): Promise<{ listingId: string; jobId: string }> {
  const listingRef = db().collection('listings').doc();
  const jobRef = db().collection('analysisJobs').doc();

  const now = admin.firestore.FieldValue.serverTimestamp();

  await listingRef.set({
    id: listingRef.id,
    userId,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    plate,
    photos: photoUrls,
    vehicle: null,
    condition: null,
    listing: null,
  });

  await jobRef.set({
    listingId: listingRef.id,
    userId,
    status: 'pending',
    step: 0,
    error: null,
  });

  return { listingId: listingRef.id, jobId: jobRef.id };
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  step: number,
  error: string | null = null
): Promise<void> {
  await db().collection('analysisJobs').doc(jobId).update({ status, step, error });
}

export async function saveVehicleData(listingId: string, vehicle: DVLAVehicle): Promise<void> {
  await db().collection('listings').doc(listingId).update({
    vehicle: {
      make: vehicle.make,
      colour: vehicle.colour,
      fuelType: vehicle.fuelType,
      yearOfManufacture: vehicle.yearOfManufacture,
      engineCapacity: vehicle.engineCapacity,
      taxStatus: vehicle.taxStatus,
      motStatus: vehicle.motStatus,
      motExpiryDate: vehicle.motExpiryDate ?? 'N/A',
      registrationNumber: vehicle.registrationNumber,
      monthOfFirstRegistration: vehicle.monthOfFirstRegistration,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function saveConditionAndListing(
  listingId: string,
  condition: ConditionResult,
  listing: ListingResult
): Promise<void> {
  await db().collection('listings').doc(listingId).update({
    condition,
    listing: {
      ...listing,
      userPriceGBP: null,
    },
    status: 'ready',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
