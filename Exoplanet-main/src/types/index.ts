export interface PredictionInput {
  signalToNoise: number;
  transitDepth: number;
  orbitalPeriod: number;
  transitDuration: number;
  planetRadius: number;
  planetTemperature: number;
}

export interface PredictionResult {
  status: 'candidate' | 'false_positive' | 'unknown';
  confidence: number;
  explanation: string;
}

export interface Prediction {
  id: string;
  timestamp: string;
  modelName: string;
  input: PredictionInput;
  result: PredictionResult;
}

export type ModelType = 'K2' | 'TESS' | 'Kepler';

export interface ModelInfo {
  name: ModelType;
  description: string;
  yearOfOperation: string;
  accuracy: number;
  f1Score: number;
  logo: string;
}

export interface ModelSpecification {
  dataset: {
    size: string;
    source: string;
    features: string[];
  };
  architecture: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  confusionMatrix: number[][];
}
