import { PopulationRecord, transformPopulationData, ProvinceData, DistrictData, UrbanLocality } from './transformData';

let cachedData: PopulationRecord[] | null = null;

// Heuristic normalization so records missing metadata still render
function normalizePopulationRecords(records: PopulationRecord[]): PopulationRecord[] {
  const provinces = new Set([
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad'
  ]);

  return records.map((rec: PopulationRecord) => {
    const normalized: PopulationRecord = { ...rec };

    // Infer table_type
    if (!normalized.table_type) {
      const keys = Object.keys(normalized).map(k => k.toLowerCase());
      const looksLikeTable2 = keys.some(k => /urban locality|population size|city|town/.test(k))
        || 'URBAN LOCALITY' in normalized
        || 'POPULATION SIZE' in normalized;
      normalized.table_type = looksLikeTable2 ? 'table_2' : 'table_1';
    }

    // Determine area name field
    const keys = Object.keys(normalized);
    const nameKey = keys.find(k => {
      const l = k.toLowerCase();
      return (
        /name|administrative|unit|district|area|locality/.test(l) &&
        !/population|sex|ratio|density|urban|rural|household|growth|rate|2017|2023/.test(l)
      );
    });
    const areaName = nameKey ? String(normalized[nameKey] || '').trim() : '';

    // Infer region if missing using known provinces or Pakistan
    if (!normalized.region) {
      if (/^pakistan$/i.test(areaName)) {
        normalized.region = 'National';
      } else if (provinces.has(areaName)) {
        normalized.region = areaName;
      } else if (typeof normalized['Province'] === 'string') {
        normalized.region = String(normalized['Province']);
      } else if (typeof normalized['REGION'] === 'string') {
        normalized.region = String(normalized['REGION']);
      }
    }

    // Infer region_type
    if (!normalized.region_type) {
      if (normalized.region === 'National') {
        normalized.region_type = 'country';
      } else if (normalized.region === 'Islamabad') {
        normalized.region_type = 'capital';
      } else if (normalized.region && provinces.has(normalized.region)) {
        normalized.region_type = 'province';
      }
    }

    // Infer level
    if (!normalized.level) {
      if (normalized.region_type === 'country') {
        normalized.level = 'national';
      } else if (normalized.region_type === 'province' || normalized.region_type === 'capital') {
        // If the area name equals the province, treat as province; otherwise district
        if (areaName && normalized.region && areaName === normalized.region) {
          normalized.level = 'province';
        } else {
          normalized.level = 'district';
        }
      }
    }

    return normalized;
  });
}

/**
 * Fetch population data from JSON file
 */
export async function fetchPopulationData(): Promise<PopulationRecord[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Use filesystem on the server, fetch on the client
    const isServer = typeof window === 'undefined';
    if (isServer) {
      const { readFile } = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'population_2023.json');
      const raw = await readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const normalized = Array.isArray(data) ? normalizePopulationRecords(data) : [];
      cachedData = normalized;
      return normalized;
    } else {
      const response = await fetch('/data/population_2023.json');
      if (!response.ok) {
        throw new Error('Failed to fetch population data');
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? normalizePopulationRecords(data) : [];
      cachedData = normalized;
      return normalized;
    }
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
  otherTables: Record<string, PopulationRecord[]>;
}> {
  const rawData = await fetchPopulationData();
  console.log('Raw data loaded:', rawData.length, 'records');
  const transformed = transformPopulationData(rawData);
  console.log('Transformed data:', {
    provinces: transformed.provinces.length,
    districts: transformed.districts.length,
    national: transformed.national ? 'Yes' : 'No',
    urbanLocalities: transformed.urbanLocalities.length,
    otherTables: Object.keys(transformed.otherTables).length
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
