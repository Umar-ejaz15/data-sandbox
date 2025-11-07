export interface CensusRegion {
  name: string;
  area_sq_km: number;
  demographics: {
    total_population: number;
    male: number;
    female: number;
    transgender: number;
    sex_ratio: number;
    density_per_sq_km: number;
    urban_proportion: number;
    avg_household_size: number;
    population_2017: number;
    annual_growth_rate_2017_2023: number;
    rural: {
      population: number;
      male: number;
      female: number;
      transgender: number;
      sex_ratio: number;
      avg_household_size: number;
      population_2017: number;
      annual_growth_rate: number;
    };
    urban: {
      population: number;
      male: number;
      female: number;
      transgender: number;
      sex_ratio: number;
      avg_household_size: number;
      population_2017: number;
      annual_growth_rate: number;
    };
  };
  disability: {
    total: {
      population: number;
      disability: number;
      functional_limitation: number;
      seeing: number;
      hearing: number;
      walking_climbing: number;
      communication: number;
      memorization_focus: number;
      self_care: number;
    };
    rural: {
      population: number;
      disability: number;
      functional_limitation: number;
      seeing: number;
      hearing: number;
      walking_climbing: number;
      communication: number;
      memorization_focus: number;
      self_care: number;
    };
    urban: {
      population: number;
      disability: number;
      functional_limitation: number;
      seeing: number;
      hearing: number;
      walking_climbing: number;
      communication: number;
      memorization_focus: number;
      self_care: number;
    };
  };
  education: {
    total: {
      population_5_plus: number;
      population_10_plus: number;
      literate_10_plus: number;
      literacy_rate: number;
      ever_attended: number;
      primary_completed: number;
      enrolment_primary: number;
      enrolment_middle: number;
      enrolment_matric: number;
      enrolment_intermediate: number;
      enrolment_graduation_above: number;
      never_to_school_all: number;
      drop_out_5_16: number;
      never_to_school_5_16: number;
      out_of_school_5_16: number;
    };
    rural: any;
    urban: any;
  };
  housing: {
    total: {
      households: number;
      pakka: number;
      semi_pakka: number;
      kacha: number;
    };
    rural: any;
    urban: any;
  };
  structures: {
    total: {
      all_structures: number;
      residential: number;
      economic: number;
      residential_economic: number;
      high_rise: number;
      normal_structure: number;
      other: number;
      jughi_jhompri_tent_cave: number;
      under_construction: number;
    };
    rural: any;
    urban: any;
  };
}

export interface CensusData {
  census_year: number;
  country: string;
  regions: CensusRegion[];
  metadata: {
    source: string;
    tables_included: string[];
    note: string;
  };
}

let cachedData: CensusData | null = null;

export async function fetchCensusData(): Promise<CensusData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const isServer = typeof window === 'undefined';
    if (isServer) {
      const { readFile } = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'population_2023.json');
      const raw = await readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as CensusData;
      cachedData = data;
      return data;
    } else {
      const response = await fetch('/data/population_2023.json');
      if (!response.ok) {
        throw new Error('Failed to fetch census data');
      }
      const data = await response.json() as CensusData;
      cachedData = data;
      return data;
    }
  } catch (error) {
    console.error('Error fetching census data:', error);
    throw error;
  }
}

