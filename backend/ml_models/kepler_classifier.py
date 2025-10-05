import os
from .base_classifier import BaseExoplanetClassifier

class KeplerClassifier(BaseExoplanetClassifier):
    """Kepler exoplanet classifier"""
    
    def __init__(self):
        super().__init__("Kepler")
        self.data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'cleaned_kepler_train.csv')
        self.target_column = 'koi_disposition'
        # Kepler already uses koi_* naming; no mapping needed
        self.column_mapping = {}
    
    def load_and_train(self):
        """Load data and train the model"""
        df = self.load_data(self.data_file)
        X, y = self.preprocess_data(df, self.target_column)
        accuracy = self.train_model(X, y)
        return accuracy
    
    def get_feature_explanations(self):
        """Return detailed explanations for features"""
        explanations = {
            'koi_score': "NASA's Confidence Score (0-1): How confident NASA is that this is a real planet. Higher = more reliable.",
            'koi_fpflag_nt': "Not Transit Flag (0/1): 1 means it doesn't look like a planet transit (probably false positive).",
            'koi_fpflag_ss': "Stellar Eclipse Flag (0/1): 1 means it's likely binary stars eclipsing, not a planet.",
            'koi_depth': "Transit Depth (ppm): How much the star dims when object passes. Deeper = larger object.",
            'koi_period': "Orbital Period (days): How long it takes to orbit the star. Shorter = closer to star.",
            'koi_model_snr': "Signal-to-Noise Ratio: How clear the detection is. Higher = more reliable signal.",
            'koi_fpflag_co': "Centroid Offset Flag (0/1): 1 means signal comes from different star, not the target.",
            'koi_duration': "Transit Duration (hours): How long the dimming lasts. Affected by orbit geometry.",
            'koi_teq': "Planet Temperature (K): Estimated temperature. Hotter = closer to star.",
            'koi_fpflag_ec': "Ephemeris Match Flag (0/1): 1 matches known instrument errors (false positive).",
            'koi_steff': "Star Temperature (K): Temperature of the host star.",
            'koi_impact': "Impact Parameter: How centrally it transits (0=center, 1=edge).",
            'koi_ror': "Planet/Star Size Ratio: Relative sizes. Larger = bigger planet or smaller star.",
            'koi_sma': "Orbit Distance (AU): Distance from star. 1 AU = Earth-Sun distance.",
            'koi_slogg': "Star Surface Gravity: Indicates star's evolutionary stage.",
            'koi_prad': "Planet Radius (Earth radii): Estimated size of the candidate planet.",
            'koi_insol': "Stellar Flux: Amount of energy received from star.",
            'koi_srad': "Star Radius (Solar radii): Size of the host star.",
            'koi_smet': "Star Metallicity: Chemical composition. Metal-rich stars may form more planets.",
            'koi_incl': "Orbital Inclination: Orbit angle relative to our view. 90° = perfect for detection.",
            'koi_num_transits': "Number of Transits: How many times observed. More = more reliable.",
            'koi_count': "Planets in System: Number of candidate planets in this star system.",
            'koi_max_sngle_ev': "Single Event Significance: Strength of strongest individual transit.",
            'koi_max_mult_ev': "Multiple Event Significance: Combined strength of all transits.",
            'koi_bin_oedp_sig': "Odd-Even Test: Checks if alternate transits differ (binary star indicator)."
        }
        return explanations
