import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useListingDraftStore } from '@/store/listingDraftStore';
import { callAnalyseVehicle } from '@/services/functions/callable';
import { uploadPhoto } from '@/services/firebase/storage';
import { compressImage } from '@/utils/imageUtils';
import { doc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';

export type AnalysisStage =
  | 'idle'
  | 'uploading'
  | 'dvla'
  | 'analysing'
  | 'generating'
  | 'complete'
  | 'failed';

export function useListing() {
  const { user } = useAuthStore();
  const { plate, photoUris, mileage } = useListingDraftStore();
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [error, setError] = useState<string | null>(null);

  async function start(): Promise<{ listingId: string; jobId: string } | null> {
    if (!user) return null;
    setStage('uploading');
    setError(null);

    try {
      // We upload after getting the listing ID from Cloud Function.
      // The Cloud Function creates the listing doc, so we pass the local URIs first,
      // then upload using a temp folder, and the function receives the final URLs.
      // Simplified: compress first, upload to a temp path, then call the function.
      const tempId = `tmp_${Date.now()}`;
      setStage('uploading');
      const compressed = await Promise.all(photoUris.map(compressImage));
      const photoUrls = await Promise.all(
        compressed.map((uri, i) => uploadPhoto(user.uid, tempId, i, uri))
      );

      setStage('dvla');
      const result = await callAnalyseVehicle(plate, photoUrls, user.uid, mileage ?? undefined);
      setStage('complete');
      return result;
    } catch (err: any) {
      setStage('failed');
      setError(err.message ?? 'Analysis failed. Please try again.');
      return null;
    }
  }

  return { start, stage, error };
}
