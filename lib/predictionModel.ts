import { CensusRegion } from './fetchCensusData';

export interface PredictionData {
  year: number;
  total_population: number;
  male: number;
  female: number;
  transgender: number;
  urban: number;
  rural: number;
  literacy_rate: number;
  households: number;
}

/**
 * Predict future population using exponential growth model
 */
export function predictPopulation(
  region: CensusRegion,
  years: number = 10
): PredictionData[] {
  const predictions: PredictionData[] = [];
  const baseYear = 2023;
  
  // Get growth rate from historical data
  const growthRate = region.demographics.annual_growth_rate_2017_2023 || 2.1;
  const annualMultiplier = 1 + (growthRate / 100);
  
  // Urban grows faster than rural
  const urbanGrowthMultiplier = 1.02;
  const ruralGrowthMultiplier = 0.98;
  
  // Literacy rate improvement (assume 0.5% per year)
  const literacyImprovement = 0.5;
  
  for (let i = 1; i <= years; i++) {
    const year = baseYear + i;
    const multiplier = Math.pow(annualMultiplier, i);
    
    const currentPop = region.demographics.total_population;
    const currentMale = region.demographics.male;
    const currentFemale = region.demographics.female;
    const currentTrans = region.demographics.transgender;
    const currentUrban = region.demographics.urban.population;
    const currentRural = region.demographics.rural.population;
    const currentLiteracy = region.education.total.literacy_rate;
    const currentHouseholds = region.housing.total.households;
    
    predictions.push({
      year,
      total_population: Math.round(currentPop * multiplier),
      male: Math.round(currentMale * multiplier),
      female: Math.round(currentFemale * multiplier),
      transgender: Math.round(currentTrans * multiplier),
      urban: Math.round(currentUrban * multiplier * Math.pow(urbanGrowthMultiplier, i)),
      rural: Math.round(currentRural * multiplier * Math.pow(ruralGrowthMultiplier, i)),
      literacy_rate: Math.min(100, currentLiteracy + (literacyImprovement * i)),
      households: Math.round(currentHouseholds * multiplier)
    });
  }
  
  return predictions;
}

/**
 * Predict for multiple regions
 */
export function predictMultipleRegions(
  regions: CensusRegion[],
  years: number = 10
): Map<string, PredictionData[]> {
  const predictions = new Map<string, PredictionData[]>();
  
  for (const region of regions) {
    predictions.set(region.name, predictPopulation(region, years));
  }
  
  return predictions;
}

