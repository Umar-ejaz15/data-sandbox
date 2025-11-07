export interface PopulationRecord {
  [key: string]: any;
  region?: string;
  region_type?: string;
  source_file?: string;
  table_type?: 'table_1' | 'table_2' | 'table_3' | 'table_4' | 'table_5' | 'table_6' | 'table_7' | 'table_8' | 'table_9' | 'table_10' | 'table_11' | 'table_12' | 'table_13' | 'table_14' | 'table_15' | 'table_16';
  level?: 'national' | 'province' | 'district';
  page?: number;
  table_index?: number;
}

export interface ProvinceData {
  province: string;
  totalPopulation: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
  households: number;
  averageHouseholdSize: number;
  area?: number;
  density?: number;
  sexRatio?: number;
  growthRate?: number;
}

export interface DistrictData {
  district: string;
  province: string;
  population: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
  households?: number;
  averageHouseholdSize?: number;
  area?: number;
  density?: number;
  sexRatio?: number;
  growthRate?: number;
}

export interface UrbanLocality {
  locality: string;
  province: string;
  district?: string;
  population: number;
  male: number;
  female: number;
  populationSize: string; // e.g., "100,000 - 500,000"
  growthRate?: number;
  householdSize?: number;
  households?: number;
}

export interface ForecastData {
  year: number;
  population: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
}

export interface TrendData {
  year: number;
  population: number;
  type: 'actual' | 'forecast';
}

export type DataLevel = 'national' | 'province' | 'district';
export type TableType = 'table_1' | 'table_2' | 'table_3' | 'table_4' | 'table_5' | 'table_6' | 'table_7' | 'table_8' | 'table_9' | 'table_10' | 'table_11' | 'table_12' | 'table_13' | 'table_14' | 'table_15' | 'table_16';
