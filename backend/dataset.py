"""
Cardiovascular Risk Visualization & Prediction
Dataset Loader, Leakage-Free Preprocessing, and Clinical Metadata
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

# Target columns to predict
TARGET_COLS = ["Cath", "LAD", "LCX", "RCA"]

# Feature columns strictly excluded from model inputs to prevent target leakage and ID noise
LEAKAGE_COLS = ["Cath", "LAD", "LCX", "RCA", "Patient_ID"]

# Categorical mappings
BINARY_MAP_YN = {"Y": 1, "N": 0, "y": 1, "n": 0, 1: 1, 0: 0, "1": 1, "0": 0, "Yes": 1, "No": 0, "yes": 1, "no": 0, True: 1, False: 0}
SEX_MAP = {"Male": 1, "male": 1, "M": 1, "m": 1, "Fmale": 0, "Female": 0, "female": 0, "F": 0, "f": 0, 1: 1, 0: 0, "1": 1, "0": 0}
BBB_MAP = {"N": 0, "n": 0, "LBBB": 1, "lbbb": 1, "RBBB": 2, "rbbb": 2, 0: 0, 1: 1, 2: 2}
VHD_MAP = {"N": 0, "n": 0, "mild": 1, "Moderate": 2, "Severe": 3, 0: 0, 1: 1, 2: 2, 3: 3}
TARGET_MAP = {"CAD": 1, "Cad": 1, "Stenotic": 1, "stenotic": 1, "Normal": 0, "normal": 0, 1: 1, 0: 0}

# Clinical reference normal ranges for physiological & laboratory features
PHYSIOLOGICAL_RANGES = {
    "Age": {"unit": "years", "normal_min": 18, "normal_max": 60, "category": "Demographics", "description": "Patient age in years"},
    "Weight": {"unit": "kg", "normal_min": 50, "normal_max": 85, "category": "Demographics", "description": "Body weight"},
    "Length": {"unit": "cm", "normal_min": 150, "normal_max": 185, "category": "Demographics", "description": "Height in cm"},
    "BMI": {"unit": "kg/m²", "normal_min": 18.5, "normal_max": 24.9, "category": "Demographics", "description": "Body Mass Index"},
    "BP": {"unit": "mmHg", "normal_min": 90, "normal_max": 120, "category": "Vital Signs", "description": "Systolic Blood Pressure"},
    "PR": {"unit": "bpm", "normal_min": 60, "normal_max": 100, "category": "Vital Signs", "description": "Pulse Rate"},
    "EF-TTE": {"unit": "%", "normal_min": 50, "normal_max": 75, "category": "Echocardiography", "description": "Left Ventricular Ejection Fraction"},
    "FBS": {"unit": "mg/dL", "normal_min": 70, "normal_max": 100, "category": "Laboratory", "description": "Fasting Blood Sugar"},
    "CR": {"unit": "mg/dL", "normal_min": 0.6, "normal_max": 1.2, "category": "Laboratory", "description": "Serum Creatinine"},
    "TG": {"unit": "mg/dL", "normal_min": 50, "normal_max": 150, "category": "Laboratory", "description": "Triglycerides"},
    "LDL": {"unit": "mg/dL", "normal_min": 60, "normal_max": 100, "category": "Laboratory", "description": "Low-Density Lipoprotein"},
    "HDL": {"unit": "mg/dL", "normal_min": 40, "normal_max": 60, "category": "Laboratory", "description": "High-Density Lipoprotein"},
    "BUN": {"unit": "mg/dL", "normal_min": 7, "normal_max": 20, "category": "Laboratory", "description": "Blood Urea Nitrogen"},
    "ESR": {"unit": "mm/hr", "normal_min": 0, "normal_max": 20, "category": "Laboratory", "description": "Erythrocyte Sedimentation Rate"},
    "HB": {"unit": "g/dL", "normal_min": 12.0, "normal_max": 16.5, "category": "Laboratory", "description": "Hemoglobin concentration"},
    "K": {"unit": "mEq/L", "normal_min": 3.5, "normal_max": 5.0, "category": "Laboratory", "description": "Serum Potassium"},
    "Na": {"unit": "mEq/L", "normal_min": 135, "normal_max": 145, "category": "Laboratory", "description": "Serum Sodium"},
    "WBC": {"unit": "/mcL", "normal_min": 4000, "normal_max": 11000, "category": "Laboratory", "description": "White Blood Cell Count"},
    "Lymph": {"unit": "%", "normal_min": 20, "normal_max": 40, "category": "Laboratory", "description": "Lymphocyte percentage"},
    "Neut": {"unit": "%", "normal_min": 40, "normal_max": 70, "category": "Laboratory", "description": "Neutrophil percentage"},
    "PLT": {"unit": "10³/mcL", "normal_min": 150, "normal_max": 450, "category": "Laboratory", "description": "Platelet Count"},
    "Region RWMA": {"unit": "score (0-4)", "normal_min": 0, "normal_max": 0, "category": "Echocardiography", "description": "Regional Wall Motion Abnormality (0=None, 1=Anterior, 2=Inferior, 3=Lateral, 4=Multiple)"},
    "St Elevation": {"unit": "binary (0/1)", "normal_min": 0, "normal_max": 0, "category": "ECG", "description": "ST-Segment Elevation (indicating acute myocardial injury)"},
    "St Depression": {"unit": "binary (0/1)", "normal_min": 0, "normal_max": 0, "category": "ECG", "description": "ST-Segment Depression (indicating myocardial ischemia)"},
    "Tinversion": {"unit": "binary (0/1)", "normal_min": 0, "normal_max": 0, "category": "ECG", "description": "T-Wave Inversion (ischemic repolarization)"},
    "Q Wave": {"unit": "binary (0/1)", "normal_min": 0, "normal_max": 0, "category": "ECG", "description": "Pathologic Q Waves (prior infarction)"},
    "Typical Chest Pain": {"unit": "binary (0/1)", "normal_min": 0, "normal_max": 0, "category": "Symptoms", "description": "Substernal chest pressure triggered by exertion"}
}

def load_raw_dataset(csv_path: str = None) -> pd.DataFrame:
    """Load the Z-Alizadeh Sani extension dataset from CSV or Excel."""
    if csv_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        csv_path = os.path.join(base_dir, "data", "cardio_dataset.csv")
    
    if not os.path.exists(csv_path):
        excel_path = os.path.join(os.path.dirname(csv_path), "extention of Z-Alizadeh sani dataset.xlsx")
        if os.path.exists(excel_path):
            df = pd.read_excel(excel_path, sheet_name=0)
            df.to_csv(csv_path, index=False)
            return df
        raise FileNotFoundError(f"Dataset not found at {csv_path} or {excel_path}")
    
    return pd.read_csv(csv_path)

def preprocess_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, pd.Series], List[str]]:
    """
    Cleans and encodes features while strictly excluding target variables.
    Returns:
        X: Processed features DataFrame (numeric)
        y_dict: Dictionary of target Series {Cath: ..., LAD: ..., LCX: ..., RCA: ...}
        feature_names: List of final feature column names
    """
    df_clean = df.copy()

    # Targets extraction
    y_dict = {}
    for target in TARGET_COLS:
        if target in df_clean.columns:
            y_dict[target] = df_clean[target].map(lambda x: TARGET_MAP.get(str(x).strip(), 0)).astype(int)

    # Strictly drop all target & leakage columns
    X_raw = df_clean.drop(columns=[col for col in LEAKAGE_COLS if col in df_clean.columns])

    # Convert binary columns
    yn_cols = [
        "Obesity", "CRF", "CVA", "Airway disease", "Thyroid Disease", "CHF", "DLP",
        "Weak Peripheral Pulse", "Lung rales", "Systolic Murmur", "Diastolic Murmur",
        "Dyspnea", "Atypical", "Nonanginal", "Exertional CP", "LowTH Ang", "LVH",
        "Poor R Progression"
    ]
    for col in yn_cols:
        if col in X_raw.columns:
            X_raw[col] = X_raw[col].map(lambda x: BINARY_MAP_YN.get(str(x).strip(), 0)).fillna(0).astype(int)

    # Convert Sex
    if "Sex" in X_raw.columns:
        X_raw["Sex"] = X_raw["Sex"].map(lambda x: SEX_MAP.get(str(x).strip(), 1)).fillna(1).astype(int)

    # Convert BBB
    if "BBB" in X_raw.columns:
        X_raw["BBB"] = X_raw["BBB"].map(lambda x: BBB_MAP.get(str(x).strip(), 0)).fillna(0).astype(int)

    # Convert VHD
    if "VHD" in X_raw.columns:
        X_raw["VHD"] = X_raw["VHD"].map(lambda x: VHD_MAP.get(str(x).strip(), 0)).fillna(0).astype(int)

    # Ensure all columns are numeric
    X = X_raw.apply(pd.to_numeric, errors="coerce").fillna(0)

    feature_names = list(X.columns)
    return X, y_dict, feature_names

if __name__ == "__main__":
    df = load_raw_dataset()
    print("Loaded shape:", df.shape)
    X, y_dict, feature_names = preprocess_features(df)
    print("Processed X shape:", X.shape)
    print("Number of features:", len(feature_names))
    for t, y in y_dict.items():
        print(f"Target {t}: Positive={y.sum()}, Total={len(y)}, Ratio={y.mean():.3f}")
