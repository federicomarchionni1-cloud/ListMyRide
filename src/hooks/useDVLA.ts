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
      setError(err.message ?? 'Failed to look up vehicle. Check the plate and try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { lookup, loading, error };
}
