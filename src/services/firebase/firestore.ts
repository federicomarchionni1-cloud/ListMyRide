import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Listing, AnalysisJob } from '@/types/listing';

export async function getListing(listingId: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, 'listings', listingId));
  if (!snap.exists()) return null;
  return snap.data() as Listing;
}

export async function updateListing(listingId: string, data: Partial<Listing>): Promise<void> {
  await updateDoc(doc(db, 'listings', listingId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToListing(
  listingId: string,
  callback: (listing: Listing | null) => void
) {
  return onSnapshot(doc(db, 'listings', listingId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    } as Listing);
  });
}

export function subscribeToAnalysisJob(
  jobId: string,
  callback: (job: AnalysisJob | null) => void
) {
  return onSnapshot(doc(db, 'analysisJobs', jobId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(snap.data() as AnalysisJob);
  });
}

export function subscribeToUserListings(
  userId: string,
  callback: (listings: Listing[]) => void
) {
  const q = query(
    collection(db, 'listings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const listings = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      } as Listing;
    });
    callback(listings);
  });
}

export async function markExported(
  listingId: string,
  platform: string
): Promise<void> {
  await updateDoc(doc(db, 'listings', listingId), {
    [`exports.${platform}.exportedAt`]: serverTimestamp(),
    status: 'exported',
    updatedAt: serverTimestamp(),
  });
}
