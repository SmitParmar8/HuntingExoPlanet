import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

class BaseExoplanetClassifier:
    """Base class for exoplanet classification models"""
    
    def __init__(self, model_name):
        self.model_name = model_name
        self.model = None
        self.scaler = None
        self.target_encoder = None
        self.feature_names = None
        self.is_trained = False
        # Standardized feature set we will train on across datasets
        self.desired_features = [
            'koi_model_snr',
            'koi_depth',
            'koi_prad',
            'koi_teq',
            'koi_duration',
            'koi_period',
        ]
        # Subclasses can set a mapping from dataset-specific columns to standardized names
        self.column_mapping = {}
        
    def load_data(self, file_path):
        """Load dataset from CSV file"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Data file not found: {file_path}")
        
        df = pd.read_csv(file_path, comment='#')
        return df
    
    def _standardize_target(self, y_series):
        """Map target labels from various datasets to standardized set."""
        mapping = {
            # Kepler/K2 common strings
            'CANDIDATE': 'candidate',
            'CONFIRMED': 'confirmed',
            'FALSE POSITIVE': 'false_positive',
            # TESS/TOI shorthand
            'PC': 'candidate',  # Planet Candidate
            'CP': 'confirmed',
            'FP': 'false_positive',
            # Lowercase fallbacks
            'candidate': 'candidate',
            'confirmed': 'confirmed',
            'false positive': 'false_positive',
            'false_positive': 'false_positive',
            'unknown': 'unknown',
        }
        def map_label(v):
            if pd.isna(v):
                return 'unknown'
            key = str(v).strip()
            return mapping.get(key, mapping.get(key.upper(), 'unknown'))
        return y_series.apply(map_label)

    def preprocess_data(self, df, target_column):
        """Preprocess the dataset"""
        # Drop rows where target is missing
        df = df.dropna(subset=[target_column])
        
        # Separate features and target
        X = df.drop(columns=[target_column]).copy()
        y = df[target_column]
        # Normalize target labels
        y = self._standardize_target(y)
        
        # Map dataset-specific columns to standardized koi_* names
        if self.column_mapping:
            present_mappings = {src: dst for src, dst in self.column_mapping.items() if src in X.columns}
            if present_mappings:
                X = X.rename(columns=present_mappings)
        
        # Remove identifier columns
        id_cols = [col for col in X.columns if col.lower() in 
                  ['id', 'kepid', 'rowid', 'index', 'kepoi_name', 'kepler_name', 'toi', 'toi_name']]
        if id_cols:
            X = X.drop(columns=id_cols)
        
        # Keep only desired features if available; create missing ones as NaN
        for feat in self.desired_features:
            if feat not in X.columns:
                X[feat] = np.nan
        X = X[self.desired_features]

        # Handle missing values
        numerical_cols = X.select_dtypes(include=[np.number]).columns
        categorical_cols = X.select_dtypes(include=['object']).columns
        
        # Fill missing values
        X[numerical_cols] = X[numerical_cols].fillna(X[numerical_cols].median())
        X[categorical_cols] = X[categorical_cols].fillna('Unknown')
        
        # Encode categorical columns
        for col in categorical_cols:
            if X[col].nunique() <= 10:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
        
        # Encode target
        self.target_encoder = LabelEncoder()
        y_encoded = self.target_encoder.fit_transform(y)
        
        self.feature_names = X.columns.tolist()
        return X, y_encoded
    
    def train_model(self, X, y):
        """Train the Random Forest model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        self.is_trained = True
        return accuracy
    
    def predict(self, input_data):
        """Make prediction on input data"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Convert input to DataFrame
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data
        
        # Ensure all required features are present
        missing_features = set(self.feature_names) - set(input_df.columns)
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        
        # Select only the features used in training
        input_df = input_df[self.feature_names]
        
        # Scale the input
        input_scaled = self.scaler.transform(input_df)
        
        # Make prediction
        prediction_proba = self.model.predict_proba(input_scaled)[0]
        predicted_class_idx = np.argmax(prediction_proba)
        predicted_class = self.target_encoder.classes_[predicted_class_idx]
        confidence = prediction_proba[predicted_class_idx]
        
        return {
            'predicted_class': predicted_class,
            'confidence': float(confidence),
            'probabilities': {
                class_name: float(prob) 
                for class_name, prob in zip(self.target_encoder.classes_, prediction_proba)
            }
        }
    
    def get_feature_importance(self, top_n=10):
        """Get feature importance scores"""
        if not self.is_trained:
            raise ValueError("Model must be trained before getting feature importance")
        
        importance_scores = self.model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importance_scores
        }).sort_values('importance', ascending=False)
        
        return feature_importance.head(top_n).to_dict('records')
