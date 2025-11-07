import { create } from 'zustand';
import { CensusData, CensusRegion } from '@/lib/fetchCensusData';

interface AppState {
  censusData: CensusData | null;
  selectedRegion: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCensusData: (data: CensusData) => void;
  setSelectedRegion: (region: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  censusData: null,
  selectedRegion: 'Pakistan',
  isLoading: false,
  error: null,

  setCensusData: (data) => set({ censusData: data }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
