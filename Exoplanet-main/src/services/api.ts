const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface PredictionInput {
  nasaConfidence?: number;
  signalToNoise?: number;
  transitDepth?: number;
  orbitalPeriod?: number;
  transitDuration?: number;
  planetRadius?: number;
  planetTemperature?: number;
  starTemperature?: number;
  starRadius?: number;
  starMass?: number;
  distance?: number;
  flagNotTransit?: boolean;
  flagStellarEclipse?: boolean;
  flagCentroidOffset?: boolean;
  flagEphemerisMatch?: boolean;
  impactParameter?: number;
  eccentricity?: number;
  inclination?: number;
  metallicity?: number;
  surfaceGravity?: number;
  age?: number;
}

export interface PredictionResult {
  status: 'candidate' | 'false_positive' | 'unknown';
  confidence: number;
  explanation: string;
  probabilities: Record<string, number>;
  feature_importance?: Array<{
    feature: string;
    importance: number;
  }>;
  prediction_id?: number;
}

export interface ModelInfo {
  name: string;
  description: string;
  year_of_operation: string;
  accuracy: number;
  f1_score: number;
  logo: string;
  features: string[];
}

export interface PredictionHistory {
  id: number;
  timestamp: string;
  model_name: string;
  input_data: PredictionInput;
  predicted_status: string;
  confidence: number;
  probabilities: Record<string, number>;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getModels(): Promise<Record<string, ModelInfo>> {
    return this.request<Record<string, ModelInfo>>('/models/');
  }

  async predict(input: PredictionInput, model: string = 'kepler'): Promise<PredictionResult> {
    return this.request<PredictionResult>('/predict/', {
      method: 'POST',
      body: JSON.stringify({
        model,
        signal_to_noise: input.signalToNoise,
        transit_depth: input.transitDepth,
        orbital_period: input.orbitalPeriod,
        transit_duration: input.transitDuration,
        planet_radius: input.planetRadius,
        planet_temperature: input.planetTemperature,
        // Detection flags and extended stellar/orbital params removed per requirements
      }),
    });
  }

  async getPredictionHistory(): Promise<PredictionHistory[]> {
    return this.request<PredictionHistory[]>('/history/');
  }

  async getFeatureExplanations(model: string = 'kepler'): Promise<Record<string, string>> {
    return this.request<Record<string, string>>(`/features/?model=${model}`);
  }
}

export const apiService = new ApiService();
