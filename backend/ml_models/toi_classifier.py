import os
from .base_classifier import BaseExoplanetClassifier

class TOIClassifier(BaseExoplanetClassifier):
    """TOI (TESS) exoplanet classifier"""
    
    def __init__(self):
        super().__init__("TOI")
        self.data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'TOI_2025.10.04_00.32.31.csv')
        self.target_column = 'tfopwg_disp'
        # Map TOI columns to standardized koi_* features (best-effort)
        self.column_mapping = {
            'pl_trandep': 'koi_depth',
            'pl_trandur': 'koi_duration',
            'pl_orbper': 'koi_period',
            'pl_rade': 'koi_prad',
            'st_teff': 'koi_teq',
            # SNR may not be present; leave koi_model_snr as NaN if missing
        }
    
    def load_and_train(self):
        """Load data and train the model"""
        df = self.load_data(self.data_file)
        X, y = self.preprocess_data(df, self.target_column)
        accuracy = self.train_model(X, y)
        return accuracy
    
    def get_feature_explanations(self):
        """Return detailed explanations for TOI features"""
        explanations = {
            'pl_pnum': "Number of planet candidates associated with the target star.",
            'pl_orbper': "Orbital period (days) — how long the candidate takes to orbit its star.",
            'pl_orbsmax': "Semi-major axis (AU) — average distance from the star.",
            'pl_rade': "Planet radius in Earth radii — estimated size of the candidate.",
            'pl_bmassj': "Planet mass in Jupiter masses (if available).",
            'st_teff': "Stellar effective temperature (K) — how hot the host star is.",
            'st_rad': "Stellar radius (Solar radii) — size of the host star.",
            'st_logg': "Stellar surface gravity — gives clues about star evolution.",
            'st_met': "Stellar metallicity — chemical composition; metal-rich stars often form more planets.",
            'toi_count': "Count of TOIs associated (system multiplicity).",
            'pl_trandep': "Transit depth (fraction) — how much starlight dims during transit.",
            'pl_trandur': "Transit duration (hours) — how long the dip lasts.",
            'pl_radj': "Planet radius in Jupiter radii (if present).",
            'ra': "Right Ascension of the target star (sky coordinate).",
            'dec': "Declination of the target star (sky coordinate).",
            'pl_tranmid': "Time of transit center — reference epoch for transit timing.",
            'pl_orbincl': "Orbital inclination in degrees",
            'pl_eccen': "Orbital eccentricity",
            'st_mass': "Stellar mass in solar masses",
            'st_age': "Stellar age in Gyr",
            'sy_dist': "Distance to the star in parsecs",
            'sy_gaiamag': "Gaia magnitude of the star",
            'sy_kmag': "K-band magnitude of the star",
            'sy_vmag': "V-band magnitude of the star"
        }
        return explanations
