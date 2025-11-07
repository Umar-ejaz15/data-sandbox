import * as tf from '@tensorflow/tfjs';
import { CensusRegion } from './fetchCensusData';
import { PredictionData } from './predictionModel';

// Model cache to avoid retraining
let populationModel: tf.LayersModel | null = null;
let literacyModel: tf.LayersModel | null = null;
let isTraining = false;

/**
 * Normalize data to 0-1 range for better training
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Denormalize data back to original range
 */
function denormalize(value: number, min: number, max: number): number {
  return value * (max - min) + min;
}

/**
 * Prepare training data from historical census data
 */
function prepareTrainingData(regions: CensusRegion[]): {
  populationFeatures: number[][];
  populationLabels: number[];
  literacyFeatures: number[][];
  literacyLabels: number[];
  minMax: {
    population: { min: number; max: number };
    urban: { min: number; max: number };
    rural: { min: number; max: number };
    literacy: { min: number; max: number };
    growthRate: { min: number; max: number };
  };
} {
  const features: number[][] = [];
  const populationLabels: number[] = [];
  const literacyFeatures: number[][] = [];
  const literacyLabels: number[] = [];

  // Collect all values for normalization
  const populations: number[] = [];
  const urbanPops: number[] = [];
  const ruralPops: number[] = [];
  const literacyRates: number[] = [];
  const growthRates: number[] = [];

  regions.forEach(region => {
    populations.push(region.demographics.total_population);
    urbanPops.push(region.demographics.urban.population);
    ruralPops.push(region.demographics.rural.population);
    literacyRates.push(region.education.total.literacy_rate);
    growthRates.push(region.demographics.annual_growth_rate_2017_2023);
  });

  const minMax = {
    population: {
      min: Math.min(...populations),
      max: Math.max(...populations)
    },
    urban: {
      min: Math.min(...urbanPops),
      max: Math.max(...urbanPops)
    },
    rural: {
      min: Math.min(...ruralPops),
      max: Math.max(...ruralPops)
    },
    literacy: {
      min: Math.min(...literacyRates),
      max: Math.max(...literacyRates)
    },
    growthRate: {
      min: Math.min(...growthRates),
      max: Math.max(...growthRates)
    }
  };

  // Create training examples
  regions.forEach(region => {
    const currentPop = region.demographics.total_population;
    const currentUrban = region.demographics.urban.population;
    const currentRural = region.demographics.rural.population;
    const currentLiteracy = region.education.total.literacy_rate;
    const growthRate = region.demographics.annual_growth_rate_2017_2023;
    const urbanProportion = region.demographics.urban_proportion;
    const density = region.demographics.density_per_sq_km;

    // Features: current population, growth rate, urban proportion, density
    const features_normalized = [
      normalize(currentPop, minMax.population.min, minMax.population.max),
      normalize(growthRate, minMax.growthRate.min, minMax.growthRate.max),
      normalize(urbanProportion, 0, 100),
      normalize(density, 0, 2000)
    ];

    // Predict next year's population (using growth rate)
    const nextYearPop = currentPop * (1 + growthRate / 100);
    populationLabels.push(normalize(nextYearPop, minMax.population.min, minMax.population.max));
    features.push(features_normalized);

    // Literacy features
    literacyFeatures.push([
      normalize(currentLiteracy, minMax.literacy.min, minMax.literacy.max),
      normalize(urbanProportion, 0, 100),
      normalize(growthRate, minMax.growthRate.min, minMax.growthRate.max)
    ]);

    // Predict next year's literacy (assume gradual improvement)
    const nextYearLiteracy = Math.min(100, currentLiteracy + 0.5);
    literacyLabels.push(normalize(nextYearLiteracy, minMax.literacy.min, minMax.literacy.max));
  });

  return {
    populationFeatures: features,
    populationLabels,
    literacyFeatures,
    literacyLabels,
    minMax
  };
}

/**
 * Create and compile a neural network model for population prediction
 */
function createPopulationModel(): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [4],
        units: 32,
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 16,
        activation: 'relu'
      }),
      tf.layers.dense({
        units: 8,
        activation: 'relu'
      }),
      tf.layers.dense({
        units: 1,
        activation: 'linear'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['meanAbsoluteError']
  });

  return model;
}

/**
 * Create and compile a neural network model for literacy prediction
 */
function createLiteracyModel(): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [3],
        units: 16,
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 8,
        activation: 'relu'
      }),
      tf.layers.dense({
        units: 1,
        activation: 'linear'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['meanAbsoluteError']
  });

  return model;
}

/**
 * Train the TensorFlow.js models
 */
export async function trainModels(regions: CensusRegion[]): Promise<void> {
  if (isTraining) {
    return;
  }

  isTraining = true;
  try {
    const trainingData = prepareTrainingData(regions);

    // Train population model
    if (!populationModel) {
      populationModel = createPopulationModel();
    }

    const popFeatures = tf.tensor2d(trainingData.populationFeatures);
    const popLabels = tf.tensor1d(trainingData.populationLabels);

    await populationModel.fit(popFeatures, popLabels, {
      epochs: 100,
      batchSize: Math.min(32, regions.length),
      validationSplit: 0.2,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          // Silent training - no console logs
        }
      }
    });

    popFeatures.dispose();
    popLabels.dispose();

    // Train literacy model
    if (!literacyModel) {
      literacyModel = createLiteracyModel();
    }

    const litFeatures = tf.tensor2d(trainingData.literacyFeatures);
    const litLabels = tf.tensor1d(trainingData.literacyLabels);

    await literacyModel.fit(litFeatures, litLabels, {
      epochs: 100,
      batchSize: Math.min(32, regions.length),
      validationSplit: 0.2,
      verbose: 0
    });

    litFeatures.dispose();
    litLabels.dispose();
  } finally {
    isTraining = false;
  }
}

/**
 * Predict future population using TensorFlow.js model
 */
export async function predictPopulationWithTF(
  region: CensusRegion,
  years: number = 10,
  allRegions: CensusRegion[] = []
): Promise<PredictionData[]> {
  // Train models if not already trained
  if (!populationModel || !literacyModel) {
    const regionsToTrain = allRegions.length > 0 ? allRegions : [region];
    await trainModels(regionsToTrain);
  }

  const predictions: PredictionData[] = [];
  const baseYear = 2023;

  // Get normalization ranges
  const allRegionsForNorm = allRegions.length > 0 ? allRegions : [region];
  const trainingData = prepareTrainingData(allRegionsForNorm);
  const { minMax } = trainingData;

  // Current values
  let currentPop = region.demographics.total_population;
  let currentUrban = region.demographics.urban.population;
  let currentRural = region.demographics.rural.population;
  let currentLiteracy = region.education.total.literacy_rate;
  const currentMale = region.demographics.male;
  const currentFemale = region.demographics.female;
  const currentTrans = region.demographics.transgender;
  const currentHouseholds = region.housing.total.households;
  const baseGrowthRate = region.demographics.annual_growth_rate_2017_2023;
  const baseUrbanProportion = region.demographics.urban_proportion;
  const baseDensity = region.demographics.density_per_sq_km;

  // Gender ratios (maintain proportions)
  const maleRatio = currentMale / currentPop;
  const femaleRatio = currentFemale / currentPop;
  const transRatio = currentTrans / currentPop;
  const urbanRatio = currentUrban / currentPop;
  const ruralRatio = currentRural / currentPop;

  for (let i = 1; i <= years; i++) {
    const year = baseYear + i;

    // Predict population using neural network
    const features = tf.tensor2d([[
      normalize(currentPop, minMax.population.min, minMax.population.max),
      normalize(baseGrowthRate, minMax.growthRate.min, minMax.growthRate.max),
      normalize(baseUrbanProportion, 0, 100),
      normalize(baseDensity, 0, 2000)
    ]]);

    const popPrediction = populationModel!.predict(features) as tf.Tensor;
    const popValue = await popPrediction.data();
    currentPop = denormalize(popValue[0], minMax.population.min, minMax.population.max);

    features.dispose();
    popPrediction.dispose();

    // Predict literacy using neural network
    const litFeatures = tf.tensor2d([[
      normalize(currentLiteracy, minMax.literacy.min, minMax.literacy.max),
      normalize(baseUrbanProportion, 0, 100),
      normalize(baseGrowthRate, minMax.growthRate.min, minMax.growthRate.max)
    ]]);

    const litPrediction = literacyModel!.predict(litFeatures) as tf.Tensor;
    const litValue = await litPrediction.data();
    currentLiteracy = Math.min(100, Math.max(0, denormalize(litValue[0], minMax.literacy.min, minMax.literacy.max)));

    litFeatures.dispose();
    litPrediction.dispose();

    // Urban grows slightly faster (1.5% additional growth)
    const urbanGrowthFactor = 1.015;
    currentUrban = currentPop * urbanRatio * Math.pow(urbanGrowthFactor, i);
    currentRural = currentPop * ruralRatio * Math.pow(0.985, i);

    // Normalize to ensure urban + rural = total
    const totalUrbanRural = currentUrban + currentRural;
    if (totalUrbanRural > 0) {
      currentUrban = (currentUrban / totalUrbanRural) * currentPop;
      currentRural = (currentRural / totalUrbanRural) * currentPop;
    }

    predictions.push({
      year,
      total_population: Math.round(currentPop),
      male: Math.round(currentPop * maleRatio),
      female: Math.round(currentPop * femaleRatio),
      transgender: Math.round(currentPop * transRatio),
      urban: Math.round(currentUrban),
      rural: Math.round(currentRural),
      literacy_rate: Math.round(currentLiteracy * 10) / 10,
      households: Math.round(currentHouseholds * (currentPop / region.demographics.total_population))
    });
  }

  return predictions;
}

/**
 * Predict for multiple regions using TensorFlow.js
 */
export async function predictMultipleRegionsWithTF(
  regions: CensusRegion[],
  years: number = 10
): Promise<Map<string, PredictionData[]>> {
  // Train models once with all regions
  await trainModels(regions);

  const predictions = new Map<string, PredictionData[]>();

  // Predict for each region
  for (const region of regions) {
    const regionPredictions = await predictPopulationWithTF(region, years, regions);
    predictions.set(region.name, regionPredictions);
  }

  return predictions;
}

/**
 * Dispose models to free memory
 */
export function disposeModels(): void {
  if (populationModel) {
    populationModel.dispose();
    populationModel = null;
  }
  if (literacyModel) {
    literacyModel.dispose();
    literacyModel = null;
  }
}

