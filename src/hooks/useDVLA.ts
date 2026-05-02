import { useState } from 'react';
import { callDVLALookup } from '@/services/functions/callable';
import { DVLAResponse } from '@/types/vehicle';

export function useDVLA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(plate: string): Promise<DVLAResponse | null> {
    setLoading(true);
    setError(null);
    try {
      const vehicle = await callDVLALookup(plate);
      return vehicle;
    } catch (err: any) {
      const raw: string = err?.message ?? '';
      const friendly =
        raw === 'unauthenticated' || raw.includes('sign in')
          ? 'Please sign in again and retry.'
          : raw || 'Failed to look up vehicle. Check the plate and try again.';
      setError(friendly);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { lookup, loading, error };
}
