import { useState } from 'react';
import { uploadPhoto } from '@/services/firebase/storage';
import { compressImage } from '@/utils/imageUtils';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadAll(
    uris: string[],
    userId: string,
    listingId: string
  ): Promise<string[]> {
    setUploading(true);
    setError(null);
    try {
      const compressed = await Promise.all(uris.map(compressImage));
      const urls = await Promise.all(
        compressed.map((uri, i) => uploadPhoto(userId, listingId, i, uri))
      );
      return urls;
    } catch (err: any) {
      setError(err.message ?? 'Photo upload failed.');
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return { uploadAll, uploading, error };
}
