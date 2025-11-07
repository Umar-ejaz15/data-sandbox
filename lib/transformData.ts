export interface PopulationRecord {
  [key: string]: any;
  region?: string;
  region_type?: string;
  source_file?: string;
  table_type?: 'table_1' | 'table_2';
  level?: 'national' | 'province' | 'district';
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
  populationSize: string;
  growthRate?: number;
  householdSize?: number;
  households?: number;
}

/**
 * Extract numeric value from string (handles commas, spaces, etc.)
 */
function extractNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value).replace(/[,\s]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Transform Table-1 data
 */
export function transformTable1Data(rawData: PopulationRecord[]): {
  provinces: ProvinceData[];
  districts: DistrictData[];
  national: ProvinceData | null;
} {
  const provinces: Map<string, ProvinceData> = new Map();
  const districts: DistrictData[] = [];
  let national: ProvinceData | null = null;

  const table1Data = rawData.filter(r => r.table_type === 'table_1');

  for (const record of table1Data) {
    const region = record.region || 'Unknown';
    const region_type = record.region_type || 'unknown';
    const level = record.level || 'unknown';
    const columns = Object.keys(record).filter(k => 
      !['region', 'region_type', 'source_file', 'table_index', 'page', 'table_type', 'level'].includes(k)
    );

    // Get area/unit name - handle different column name formats
    const areaNameCol = columns.find(c => {
      const col = c.toLowerCase();
      return /name|administrative|unit|district|area|locality/i.test(c) && 
             !/population|sex|ratio|density|urban|rural|household|growth|rate|2017|2023/i.test(col);
    });
    const areaName = areaNameCol ? String(record[areaNameCol] || '').trim() : '';
    
    // Skip header rows and invalid data
    if (!areaName || 
        areaName === 'null' ||
        /all.*sexes|male|female|trans|gender|sex.*ratio|density|urban|rural|household|population.*2017|annual.*rate|proportion/i.test(areaName.toLowerCase()) ||
        /^\d+$/.test(areaName) ||
        areaName.length < 2) {
      continue;
    }
    
    // Find population columns
    const popCol = columns.find(c => /population.*2023/i.test(c)) || 
                   columns.find(c => /^population-2023$/i.test(c.trim())) ||
                   columns.find(c => /population/i.test(c) && !/2017/i.test(c));
    
    if (!popCol) continue;

    const totalPop = extractNumber(record[popCol]);
    if (totalPop === 0 || totalPop < 1000) continue;

    // Extract all fields - handle various column name formats
    const maleCol = columns.find(c => /^male$/i.test(c.trim()) || /^col_3$/i.test(c));
    const femaleCol = columns.find(c => /^female$/i.test(c.trim()) || /^col_4$/i.test(c));
    const urbanCol = columns.find(c => /^urban$/i.test(c.trim()) || (/urban/i.test(c) && !/proportion|rate/i.test(c)));
    const ruralCol = columns.find(c => /^rural$/i.test(c.trim()));
    const householdCol = columns.find(c => /household/i.test(c) && !/size|avg|average|h\.?hold/i.test(c));
    const avgHouseholdCol = columns.find(c => /avg.*household|household.*size|average.*household|h\.?hold.*size/i.test(c));
    const areaCol = columns.find(c => /area|sq\.?km|sq\.?k\.?m/i.test(c));
    const densityCol = columns.find(c => /density/i.test(c));
    const sexRatioCol = columns.find(c => /sex.*ratio|ratio/i.test(c) && !/growth/i.test(c));
    const growthRateCol = columns.find(c => /growth.*rate|annual.*growth|g\.?rate/i.test(c));

    const male = maleCol ? extractNumber(record[maleCol]) : (totalPop / 2);
    const female = femaleCol ? extractNumber(record[femaleCol]) : (totalPop / 2);
    const urban = urbanCol ? extractNumber(record[urbanCol]) : 0;
    const rural = ruralCol ? extractNumber(record[ruralCol]) : (totalPop - urban);
    const households = householdCol ? extractNumber(record[householdCol]) : 0;
    const avgHouseholdSize = avgHouseholdCol ? extractNumber(record[avgHouseholdCol]) : 
                            (households > 0 ? totalPop / households : 0);
    const area = areaCol ? extractNumber(record[areaCol]) : undefined;
    const density = densityCol ? extractNumber(record[densityCol]) : undefined;
    const sexRatio = sexRatioCol ? extractNumber(record[sexRatioCol]) : undefined;
    const growthRate = growthRateCol ? extractNumber(record[growthRateCol]) : undefined;

    if (region === 'National' && level === 'national') {
      national = {
        province: 'Pakistan',
        totalPopulation: totalPop,
        male,
        female,
        urban,
        rural,
        households,
        averageHouseholdSize: avgHouseholdSize,
        area,
        density,
        sexRatio,
        growthRate
      };
    } else if ((region_type === 'province' || region_type === 'capital') && level === 'province') {
      // Province level data
      const existing = provinces.get(region) || {
        province: region,
        totalPopulation: 0,
        male: 0,
        female: 0,
        urban: 0,
        rural: 0,
        households: 0,
        averageHouseholdSize: 0,
        area: 0,
        density: 0,
        sexRatio: 0,
        growthRate: 0
      };

      existing.totalPopulation += totalPop;
      existing.male += male;
      existing.female += female;
      existing.urban += urban;
      existing.rural += rural;
      existing.households += households;
      if (area) existing.area = (existing.area || 0) + area;

      provinces.set(region, existing);
    } else if (level === 'district' && areaName && 
               !/total|sum|grand|pakistan|punjab|sindh|balochistan|khyber|pakhtunkhwa|islamabad/i.test(areaName)) {
      // District level data
      districts.push({
        district: areaName,
        province: region,
        population: totalPop,
        male,
        female,
        urban,
        rural,
        households,
        averageHouseholdSize: avgHouseholdSize,
        area,
        density,
        sexRatio,
        growthRate
      });
    }
  }

  // Calculate averages for provinces
  for (const [key, province] of provinces.entries()) {
    if (province.households > 0) {
      province.averageHouseholdSize = province.totalPopulation / province.households;
    }
    if (province.area && province.area > 0) {
      province.density = province.totalPopulation / province.area;
    }
    if (province.female > 0) {
      province.sexRatio = (province.male / province.female) * 100;
    }
  }

  return {
    provinces: Array.from(provinces.values()),
    districts,
    national
  };
}

/**
 * Transform Table-2 data (Urban Localities)
 */
export function transformTable2Data(rawData: PopulationRecord[]): UrbanLocality[] {
  const localities: UrbanLocality[] = [];
  const table2Data = rawData.filter(r => r.table_type === 'table_2');

  for (const record of table2Data) {
    const region = record.region || 'Unknown';
    const columns = Object.keys(record).filter(k => 
      !['region', 'region_type', 'source_file', 'table_index', 'page', 'table_type', 'level'].includes(k)
    );

    // Get locality name - handle different column name formats
    const localityCol = columns.find(c => {
      const col = c.toLowerCase();
      return (/name|locality|urban|city|town/i.test(c)) && 
             !/population|sex|size|growth|household|rate|2017|2023/i.test(col);
    });
    const localityName = localityCol ? String(record[localityCol] || '').trim() : '';
    
    // Skip header rows and invalid data
    if (!localityName || 
        localityName === 'null' ||
        /all.*sexes|male|female|population|size|growth|household|rate|proportion/i.test(localityName.toLowerCase()) ||
        /^\d+$/.test(localityName) ||
        localityName.length < 2) {
      continue;
    }
    
    // Find population columns
    const popCol = columns.find(c => /population/i.test(c));
    if (!popCol) continue;

    const totalPop = extractNumber(record[popCol]);
    if (totalPop === 0 || totalPop < 100) continue; // Urban localities should have at least 100 people

    const maleCol = columns.find(c => /^male$/i.test(c.trim()) || /^col_3$/i.test(c));
    const femaleCol = columns.find(c => /^female$/i.test(c.trim()) || /^col_4$/i.test(c));
    const sizeCol = columns.find(c => /size|category/i.test(c) && !/household/i.test(c));
    const growthRateCol = columns.find(c => /growth.*rate|annual.*growth|g\.?rate/i.test(c));
    const householdCol = columns.find(c => /household/i.test(c) && !/size|avg|average|h\.?hold/i.test(c));
    const householdSizeCol = columns.find(c => /household.*size|avg.*household|h\.?hold.*size/i.test(c));

    const male = maleCol ? extractNumber(record[maleCol]) : (totalPop / 2);
    const female = femaleCol ? extractNumber(record[femaleCol]) : (totalPop / 2);
    const populationSize = sizeCol ? String(record[sizeCol] || '').trim() : '';
    const growthRate = growthRateCol ? extractNumber(record[growthRateCol]) : undefined;
    const households = householdCol ? extractNumber(record[householdCol]) : undefined;
    const householdSize = householdSizeCol ? extractNumber(record[householdSizeCol]) : undefined;

    // Determine district if available (from level or other columns)
    const districtCol = columns.find(c => /district/i.test(c));
    const district = districtCol ? String(record[districtCol] || '').trim() : undefined;

    localities.push({
      locality: localityName,
      province: region,
      district: district || undefined,
      population: totalPop,
      male,
      female,
      populationSize: populationSize || 'Unknown',
      growthRate,
      householdSize,
      households
    });
  }

  return localities;
}

/**
 * Transform all population data
 */
export function transformPopulationData(rawData: PopulationRecord[]): {
  provinces: ProvinceData[];
  districts: DistrictData[];
  national: ProvinceData | null;
  urbanLocalities: UrbanLocality[];
} {
  const table1 = transformTable1Data(rawData);
  const urbanLocalities = transformTable2Data(rawData);

  return {
    ...table1,
    urbanLocalities
  };
}
