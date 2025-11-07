import { PopulationRecord, transformPopulationData, ProvinceData, DistrictData, UrbanLocality } from './transformData';

let cachedData: PopulationRecord[] | null = null;

/**
 * Fetch population data from JSON file
 */
export async function fetchPopulationData(): Promise<PopulationRecord[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data/population_2023.json');
    if (!response.ok) {
      throw new Error('Failed to fetch population data');
    }
    const data = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Error fetching population data:', error);
    return [];
  }
}

/**
 * Get transformed population data
 */
export async function getTransformedPopulationData(): Promise<{
  provinces: ProvinceData[];
  districts: DistrictData[];
  national: ProvinceData | null;
  urbanLocalities: UrbanLocality[];
}> {
  const rawData = await fetchPopulationData();
  console.log('Raw data loaded:', rawData.length, 'records');
  const transformed = transformPopulationData(rawData);
  console.log('Transformed data:', {
    provinces: transformed.provinces.length,
    districts: transformed.districts.length,
    national: transformed.national ? 'Yes' : 'No',
    urbanLocalities: transformed.urbanLocalities.length
  });
  return transformed;
}

/**
 * Get population by province
 */
export async function getPopulationByProvince(): Promise<Map<string, number>> {
  const data = await fetchPopulationData();
  const transformed = transformPopulationData(data);
  const result = new Map<string, number>();
  
  for (const province of transformed.provinces) {
    result.set(province.province, province.totalPopulation);
  }
  
  if (transformed.national) {
    result.set('Pakistan', transformed.national.totalPopulation);
  }
  
  return result;
}
