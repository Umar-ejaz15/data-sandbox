import { ProvinceData } from './transformData';

export interface ForecastData {
  year: number;
  population: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
}

/**
 * Simple linear regression for forecasting
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculate compound annual growth rate (CAGR)
 */
function calculateCAGR(current: number, previous: number, years: number): number {
  if (previous === 0 || years === 0) return 0;
  return (Math.pow(current / previous, 1 / years) - 1) * 100;
}

/**
 * Forecast population using exponential growth model
 */
export function forecastPopulation(
  currentData: ProvinceData,
  years: number = 10,
  historicalGrowthRate?: number
): ForecastData[] {
  const forecasts: ForecastData[] = [];
  
  // Use provided growth rate or estimate from historical data
  // Default growth rate for Pakistan is approximately 2.1% annually
  const growthRate = historicalGrowthRate || 2.1;
  const annualMultiplier = 1 + (growthRate / 100);
  
  // Base year (2023)
  const baseYear = 2023;
  
  for (let i = 1; i <= years; i++) {
    const year = baseYear + i;
    const multiplier = Math.pow(annualMultiplier, i);
    
    forecasts.push({
      year,
      population: Math.round(currentData.totalPopulation * multiplier),
      male: Math.round(currentData.male * multiplier),
      female: Math.round(currentData.female * multiplier),
      urban: Math.round(currentData.urban * multiplier * 1.02), // Urban grows faster
      rural: Math.round(currentData.rural * multiplier * 0.98)  // Rural grows slower
    });
  }
  
  return forecasts;
}

/**
 * Forecast population for multiple provinces
 */
export function forecastMultipleProvinces(
  provinces: ProvinceData[],
  years: number = 10
): Map<string, ForecastData[]> {
  const forecasts = new Map<string, ForecastData[]>();
  
  for (const province of provinces) {
    // Adjust growth rate by province (urban provinces grow faster)
    const urbanRatio = province.totalPopulation > 0 
      ? province.urban / province.totalPopulation 
      : 0;
    
    // Higher urban ratio = slightly higher growth rate
    const adjustedGrowthRate = 2.1 + (urbanRatio * 0.5);
    
    forecasts.set(
      province.province,
      forecastPopulation(province, years, adjustedGrowthRate)
    );
  }
  
  return forecasts;
}

/**
 * Generate trend data for visualization
 */
export function generateTrendData(
  currentData: ProvinceData,
  forecasts: ForecastData[]
): Array<{ year: number; population: number; type: 'actual' | 'forecast' }> {
  const trend: Array<{ year: number; population: number; type: 'actual' | 'forecast' }> = [
    {
      year: 2023,
      population: currentData.totalPopulation,
      type: 'actual'
    }
  ];
  
  for (const forecast of forecasts) {
    trend.push({
      year: forecast.year,
      population: forecast.population,
      type: 'forecast'
    });
  }
  
  return trend;
}

