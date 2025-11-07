import { create } from 'zustand';
import { ProvinceData, DistrictData, ForecastData, UrbanLocality, DataLevel, TableType } from '@/types';

interface AppState {
  provinces: ProvinceData[];
  districts: DistrictData[];
  national: ProvinceData | null;
  urbanLocalities: UrbanLocality[];
  forecasts: Map<string, ForecastData[]>;
  
  // UI State
  selectedProvince: string | null;
  selectedDistrict: string | null;
  selectedLevel: DataLevel;
  selectedTable: TableType;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: { 
    provinces: ProvinceData[]; 
    districts: DistrictData[]; 
    national: ProvinceData | null;
    urbanLocalities: UrbanLocality[];
  }) => void;
  setForecasts: (forecasts: Map<string, ForecastData[]>) => void;
  setSelectedProvince: (province: string | null) => void;
  setSelectedDistrict: (district: string | null) => void;
  setSelectedLevel: (level: DataLevel) => void;
  setSelectedTable: (table: TableType) => void;
  setSelectedYear: (year: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  provinces: [],
  districts: [],
  national: null,
  urbanLocalities: [],
  forecasts: new Map(),
  
  selectedProvince: null,
  selectedDistrict: null,
  selectedLevel: 'national',
  selectedTable: 'table_1',
  selectedYear: 2023,
  isLoading: false,
  error: null,

  setData: (data) => set({ ...data }),
  setForecasts: (forecasts) => set({ forecasts }),
  setSelectedProvince: (province) => set({ selectedProvince: province, selectedDistrict: null }),
  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  setSelectedLevel: (level) => set({ selectedLevel: level }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
