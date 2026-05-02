import { create } from 'zustand';
import { VehicleData } from '@/types/vehicle';

interface ListingDraftState {
  plate: string;
  vehicle: VehicleData | null;
  photoUris: string[];
  draftId: string | null;
  mileage: number | null;
  setPlate: (plate: string) => void;
  setVehicle: (vehicle: VehicleData | null) => void;
  setPhotoUris: (uris: string[]) => void;
  addPhotoUri: (uri: string) => void;
  removePhotoUri: (uri: string) => void;
  setDraftId: (id: string | null) => void;
  setMileage: (mileage: number | null) => void;
  reset: () => void;
}

const initialState = {
  plate: '',
  vehicle: null,
  photoUris: [],
  draftId: null,
  mileage: null,
};

export const useListingDraftStore = create<ListingDraftState>((set) => ({
  ...initialState,
  setPlate: (plate) => set({ plate: plate.toUpperCase().replace(/\s/g, '') }),
  setVehicle: (vehicle) => set({ vehicle }),
  setPhotoUris: (photoUris) => set({ photoUris }),
  addPhotoUri: (uri) =>
    set((state) => ({
      photoUris: state.photoUris.length < 10 ? [...state.photoUris, uri] : state.photoUris,
    })),
  removePhotoUri: (uri) =>
    set((state) => ({ photoUris: state.photoUris.filter((u) => u !== uri) })),
  setDraftId: (draftId) => set({ draftId }),
  setMileage: (mileage) => set({ mileage }),
  reset: () => set(initialState),
}));
