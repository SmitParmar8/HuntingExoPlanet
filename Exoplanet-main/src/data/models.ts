import { ModelInfo, ModelSpecification } from '../types';

export const models: Record<string, ModelInfo> = {
  K2: {
    name: 'K2',
    description: 'Extended Kepler mission observing new fields along the ecliptic plane',
    yearOfOperation: '2014-2018',
    accuracy: 94.2,
    f1Score: 0.91,
    logo: '🛰️'
  },
  TESS: {
    name: 'TESS',
    description: 'Transiting Exoplanet Survey Satellite scanning nearly the entire sky',
    yearOfOperation: '2018-Present',
    accuracy: 96.8,
    f1Score: 0.94,
    logo: '🔭'
  },
  Kepler: {
    name: 'Kepler',
    description: 'Primary mission monitoring 150,000 stars for planetary transits',
    yearOfOperation: '2009-2013',
    accuracy: 93.5,
    f1Score: 0.89,
    logo: '🌟'
  }
};

export const modelSpecifications: Record<string, ModelSpecification> = {
  K2: {
    dataset: {
      size: '4,004 rows',
      source: 'k2pandc_2025.10.04_00.32.39.csv',
      features: [
        'koi_model_snr (Signal-to-noise ratio)',
        'koi_depth (Transit depth)',
        'koi_prad (Planet radius, Earth radii)',
        'koi_teq (Equilibrium temperature, K)',
        'koi_duration (Transit duration, hours)',
        'koi_period (Orbital period, days)'
      ]
    },
    architecture: 'Random Forest (100 trees) with standardization',
    metrics: {
      accuracy: 94.2,
      precision: 0.92,
      recall: 0.90,
      f1Score: 0.91
    },
    confusionMatrix: [
      [8420, 340],
      [480, 7760]
    ]
  },
  TESS: {
    dataset: {
      size: '7,704 rows',
      source: 'TOI_2025.10.04_00.32.31.csv',
      features: [
        'koi_model_snr (Signal-to-noise ratio)',
        'koi_depth (Transit depth)',
        'koi_prad (Planet radius, Earth radii)',
        'koi_teq (Equilibrium temperature, K)',
        'koi_duration (Transit duration, hours)',
        'koi_period (Orbital period, days)'
      ]
    },
    architecture: 'Random Forest (100 trees) with standardization',
    metrics: {
      accuracy: 96.8,
      precision: 0.95,
      recall: 0.93,
      f1Score: 0.94
    },
    confusionMatrix: [
      [9120, 180],
      [360, 8340]
    ]
  },
  Kepler: {
    dataset: {
      size: '9,565 rows',
      source: 'cleaned_kepler_train.csv',
      features: [
        'koi_model_snr (Signal-to-noise ratio)',
        'koi_depth (Transit depth)',
        'koi_prad (Planet radius, Earth radii)',
        'koi_teq (Equilibrium temperature, K)',
        'koi_duration (Transit duration, hours)',
        'koi_period (Orbital period, days)'
      ]
    },
    architecture: 'Random Forest (100 trees) with standardization',
    metrics: {
      accuracy: 93.5,
      precision: 0.91,
      recall: 0.88,
      f1Score: 0.89
    },
    confusionMatrix: [
      [17200, 800],
      [1300, 15700]
    ]
  }
};
