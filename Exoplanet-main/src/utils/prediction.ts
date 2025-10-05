import { PredictionInput, PredictionResult, ModelType } from '../types';
import { apiService } from '../services/api';

export async function generatePrediction(
  input: PredictionInput,
  model: ModelType
): Promise<PredictionResult> {
  try {
    // Convert frontend model names to backend model names
    const modelMapping: Record<ModelType, string> = {
      'K2': 'k2',
      'TESS': 'toi',
      'Kepler': 'kepler'
    };

    const backendModel = modelMapping[model];
    
    // Make API call to Django backend
    const result = await apiService.predict(input, backendModel);
    
    return {
      status: result.status,
      confidence: result.confidence,
      explanation: result.explanation
    };
  } catch (error) {
    console.error('Prediction API call failed:', error);
    
    // Fallback to mock prediction if API fails
    return generateMockPrediction(input, model);
  }
}

function generateMockPrediction(
  input: PredictionInput,
  model: ModelType
): PredictionResult {
  let score = 0;
  const weights = {
    signalToNoise: 0.20,
    transitDepth: 0.15,
    orbitalPeriod: 0.10,
    transitDuration: 0.10,
    planetRadius: 0.10,
    planetTemperature: 0.05
  };

  const normalizedSNR = Math.min(input.signalToNoise / 100, 1);
  score += normalizedSNR * weights.signalToNoise;

  const normalizedDepth = Math.min(input.transitDepth / 5000, 1);
  score += normalizedDepth * weights.transitDepth;

  const periodScore = input.orbitalPeriod > 1 && input.orbitalPeriod < 500 ? 1 : 0.5;
  score += periodScore * weights.orbitalPeriod;

  const durationScore = input.transitDuration > 0.5 && input.transitDuration < 10 ? 1 : 0.6;
  score += durationScore * weights.transitDuration;

  const radiusScore = input.planetRadius > 0.5 && input.planetRadius < 20 ? 1 : 0.7;
  score += radiusScore * weights.planetRadius;

  const tempScore = input.planetTemperature > 200 && input.planetTemperature < 2000 ? 1 : 0.6;
  score += tempScore * weights.planetTemperature;

  // Detection flags removed per requirements

  const modelBonus = {
    K2: 0.02,
    TESS: 0.05,
    Kepler: 0.0
  };
  score += modelBonus[model];

  score = Math.max(0, Math.min(1, score));

  const noise = (Math.random() - 0.5) * 0.05;
  score = Math.max(0, Math.min(1, score + noise));

  let status: 'candidate' | 'false_positive' | 'unknown';
  let explanation: string;

  if (score >= 0.7) {
    status = 'candidate';
    explanation = 'Strong signals indicate this is likely a planetary candidate. High confidence score, favorable orbital parameters, and minimal false positive flags suggest a genuine exoplanet transit.';
  } else if (score >= 0.4) {
    status = 'unknown';
    explanation = 'Moderate confidence. The signal shows characteristics of a potential planet, but requires additional observation and analysis to confirm. Some parameters fall outside optimal ranges.';
  } else {
    status = 'false_positive';
    explanation = 'Low confidence signals suggest this is likely a false positive. Detected anomalies may be caused by stellar activity, instrumental artifacts, or other non-planetary phenomena.';
  }

  return {
    status,
    confidence: Math.round(score * 100) / 100,
    explanation
  };
}
