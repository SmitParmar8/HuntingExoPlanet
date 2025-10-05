import os
from .base_classifier import BaseExoplanetClassifier

class K2Classifier(BaseExoplanetClassifier):
    """K2 exoplanet classifier"""
    
    def __init__(self):
        super().__init__("K2")
        self.data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'k2pandc_2025.10.04_00.32.39.csv')
        self.target_column = 'disposition'
        # Map K2 column names to standardized koi_* features where possible
        self.column_mapping = {
            'snr': 'koi_model_snr',
            'depth': 'koi_depth',
            'prad': 'koi_prad',
            'teq': 'koi_teq',
            'duration': 'koi_duration',
            'period': 'koi_period',
        }
    
    def load_and_train(self):
        """Load data and train the model"""
        df = self.load_data(self.data_file)
        X, y = self.preprocess_data(df, self.target_column)
        accuracy = self.train_model(X, y)
        return accuracy
    
    def get_feature_explanations(self):
        """Return detailed explanations for K2 features"""
        explanations = {
            'period': "Orbital period of the candidate in days",
            'duration': "Transit duration in hours",
            'depth': "Transit depth in parts per million",
            'snr': "Signal-to-noise ratio of the detection",
            'teff': "Effective temperature of the host star in Kelvin",
            'logg': "Surface gravity of the host star",
            'radius': "Radius of the host star in solar radii",
            'mass': "Mass of the host star in solar masses",
            'metallicity': "Metallicity of the host star",
            'distance': "Distance to the star in parsecs",
            'impact': "Impact parameter of the transit",
            'sma': "Semi-major axis in AU",
            'eccentricity': "Orbital eccentricity",
            'inclination': "Orbital inclination in degrees",
            'age': "Age of the star in Gyr"
        }
        return explanations
