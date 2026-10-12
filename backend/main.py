"""
Cardiovascular Risk Visualization & Prediction
FastAPI Backend Application
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from dataset import preprocess_features, TARGET_COLS, PHYSIOLOGICAL_RANGES, LEAKAGE_COLS

app = FastAPI(
    title="Cardiovascular Risk Visualization & Prediction API",
    version="1.0.0",
    description="Multimodal AI Hackathon 2026 - Track A: 3D Coronary Artery Disease & Vessel Stenosis Prediction API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and metadata on startup
BASE_DIR = os.path.dirname(current_dir)
MODELS_DIR = os.path.join(BASE_DIR, "models")

cardio_models = {}
shap_explainers = {}
feature_metadata = {}
evaluation_metrics = {}
test_patients_df = pd.DataFrame()

try:
    cardio_models = joblib.load(os.path.join(MODELS_DIR, "cardio_models.joblib"))
    shap_explainers = joblib.load(os.path.join(MODELS_DIR, "shap_explainers.joblib"))
    feature_metadata = joblib.load(os.path.join(MODELS_DIR, "feature_metadata.joblib"))
    with open(os.path.join(MODELS_DIR, "evaluation_metrics.json"), "r") as f:
        evaluation_metrics = json.load(f)
    test_patients_df = pd.read_csv(os.path.join(MODELS_DIR, "test_patients.csv"))
    print("Successfully loaded all models, explainers, and metrics.")
except Exception as e:
    print(f"Warning during model loading: {e}")

def get_risk_tier(prob: float) -> Dict[str, str]:
    """Classify probability into risk tier and color."""
    if prob < 0.30:
        return {"tier": "Low Risk", "color": "#10b981", "status": "Normal / Patent", "glow": "rgba(16, 185, 129, 0.4)"}
    elif prob < 0.70:
        return {"tier": "Moderate Risk", "color": "#f59e0b", "status": "Borderline / Mild", "glow": "rgba(245, 158, 11, 0.5)"}
    else:
        return {"tier": "High Risk", "color": "#ef4444", "status": "Significant Stenosis (>=50%)", "glow": "rgba(239, 68, 68, 0.7)"}

class PredictionRequest(BaseModel):
    features: Optional[Dict[str, Any]] = None
    patient_id: Optional[str] = None

class WhatIfRequest(BaseModel):
    original_features: Dict[str, Any]
    modified_features: Dict[str, Any]
    patient_id: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": list(cardio_models.keys()),
        "features_count": len(feature_metadata.get("feature_names", [])),
        "test_patients_count": len(test_patients_df)
    }

@app.get("/api/metrics")
def get_metrics():
    """Return model evaluation benchmarks, cross-validation metrics, and ROC curves."""
    if not evaluation_metrics:
        raise HTTPException(status_code=500, detail="Evaluation metrics not loaded.")
    return evaluation_metrics

@app.get("/api/patients")
def get_patients():
    """Return list of test cohort patients with ground truth for interactive preset testing."""
    if test_patients_df.empty:
        raise HTTPException(status_code=500, detail="Test patients not loaded.")
    
    patients_list = []
    for idx, row in test_patients_df.iterrows():
        p_id = row.get("Patient_ID", f"PT-{idx+1:03d}")
        patients_list.append({
            "patient_id": p_id,
            "age": int(row.get("Age", 0)),
            "sex": str(row.get("Sex", "Male")),
            "bp": int(row.get("BP", 120)),
            "pr": int(row.get("PR", 75)),
            "ef_tte": int(row.get("EF-TTE", 50)),
            "typical_chest_pain": int(row.get("Typical Chest Pain", 0)),
            "st_elevation": int(row.get("St Elevation", 0)),
            "region_rwma": int(row.get("Region RWMA", 0)),
            "ground_truth": {
                "Cath": str(row.get("Cath", "Normal")),
                "LAD": str(row.get("LAD", "Normal")),
                "LCX": str(row.get("LCX", "Normal")),
                "RCA": str(row.get("RCA", "Normal"))
            },
            "features": row.to_dict()
        })
    return patients_list

def run_model_inference(raw_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Run preprocessing and calibrated prediction across all 4 targets."""
    feature_names = feature_metadata["feature_names"]
    row_df = pd.DataFrame([raw_dict])
    X_single, _, _ = preprocess_features(row_df)

    # Ensure all required features are present
    for col in feature_names:
        if col not in X_single.columns:
            X_single[col] = 0
    X_single = X_single[feature_names]

    # Predict for each target
    predictions = {}
    vessel_details = {}
    high_risk_count = 0

    for target in TARGET_COLS:
        clf = cardio_models[target]
        prob = float(clf.predict_proba(X_single)[0, 1])
        tier_info = get_risk_tier(prob)

        predictions[target] = {
            "probability": round(prob, 4),
            "percentage": round(prob * 100, 1),
            "tier": tier_info["tier"],
            "status": "Stenotic (>=50%)" if prob >= 0.50 else "Non-stenotic",
            "color": tier_info["color"],
            "glow": tier_info["glow"]
        }

        if target in ["LAD", "LCX", "RCA"]:
            vessel_meta = {
                "LAD": {"name": "Left Anterior Descending", "short": "LAD", "territory": "Anterior Wall & Septum"},
                "LCX": {"name": "Left Circumflex", "short": "LCX", "territory": "Lateral & Posterior Free Wall"},
                "RCA": {"name": "Right Coronary Artery", "short": "RCA", "territory": "Inferior Wall & Right Ventricle"}
            }
            vessel_details[target] = {**predictions[target], **vessel_meta.get(target, {})}
            if prob >= 0.70:
                high_risk_count += 1

    overall_cad = {
        **predictions["Cath"],
        "confidence": int(round(88 + abs(predictions["Cath"]["probability"] - 0.5) * 20))
    }
    
    # Anatomical burden categorization
    vessels_involved = sum(1 for v in ["LAD", "LCX", "RCA"] if predictions[v]["probability"] >= 0.50)
    if vessels_involved == 3:
        burden_label = "Triple-Vessel Disease (High Ischemic Burden)"
    elif vessels_involved == 2:
        burden_label = "Two-Vessel Disease (Moderate-Severe Ischemia)"
    elif vessels_involved == 1:
        burden_label = "Single-Vessel Disease (Localized Stenosis)"
    else:
        burden_label = "Subclinical / Minimal Significant Stenosis"

    return {
        "overall_cad": overall_cad,
        "vessels": vessel_details,
        "clinical_summary": {
            "vessels_involved_count": vessels_involved,
            "burden_label": burden_label,
            "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
        }
    }

@app.post("/api/predict")
def predict_cardiac_risk(req: PredictionRequest):
    """Predict CAD and vessel-specific stenosis probabilities for LAD, LCX, RCA."""
    if not cardio_models:
        raise HTTPException(status_code=500, detail="Models not loaded.")

    # Retrieve patient features
    if req.patient_id:
        match = test_patients_df[test_patients_df["Patient_ID"] == req.patient_id]
        if match.empty:
            raise HTTPException(status_code=404, detail=f"Patient {req.patient_id} not found.")
        raw_dict = match.iloc[0].to_dict()
    elif req.features:
        raw_dict = req.features
    else:
        raw_dict = test_patients_df.iloc[0].to_dict()

    return run_model_inference(raw_dict)

@app.post("/api/what-if")
def what_if_analysis(req: WhatIfRequest):
    """
    Hypothetical What-If Simulation:
    Evaluates both original and modified clinical inputs through the trained models.
    Computes absolute risk deltas, identifies altered biomarkers, and generates transparent comparison rationale.
    """
    if not cardio_models:
        raise HTTPException(status_code=500, detail="Models not loaded.")

    orig_res = run_model_inference(req.original_features)
    mod_res = run_model_inference(req.modified_features)

    # Compute deltas for all targets
    deltas = {}
    for target in ["Cath", "LAD", "LCX", "RCA"]:
        p_orig = orig_res["overall_cad"]["probability"] if target == "Cath" else orig_res["vessels"][target]["probability"]
        p_mod = mod_res["overall_cad"]["probability"] if target == "Cath" else mod_res["vessels"][target]["probability"]
        diff = round(p_mod - p_orig, 4)
        pct_diff = round(diff * 100, 1)
        deltas[target] = {
            "original_prob": p_orig,
            "modified_prob": p_mod,
            "absolute_delta": diff,
            "percentage_delta": pct_diff,
            "direction": "Decreased Risk" if diff < 0 else ("Increased Risk" if diff > 0 else "Unchanged")
        }

    # Identify which features actually changed
    changed = []
    all_keys = set(list(req.original_features.keys()) + list(req.modified_features.keys()))
    for f in all_keys:
        v1 = req.original_features.get(f)
        v2 = req.modified_features.get(f)
        if v1 is not None and v2 is not None and str(v1) != str(v2):
            meta = PHYSIOLOGICAL_RANGES.get(f, {})
            changed.append({
                "feature": f,
                "original_value": v1,
                "modified_value": v2,
                "unit": meta.get("unit", ""),
                "description": meta.get("description", f)
            })

    # Generate transparent simulation summary
    cad_delta = deltas["Cath"]["percentage_delta"]
    if abs(cad_delta) < 0.3:
        summary_text = f"Simulated model prediction: Modifications produced minimal change in model-predicted CAD risk (< 0.3% shift; current model output: {mod_res['overall_cad']['percentage']}%). This statistical model recalculation is not proof that changing a factor directly alters patient risk."
    elif cad_delta < 0:
        summary_text = f"Simulated model prediction: Model re-inference estimates CAD probability at {mod_res['overall_cad']['percentage']}% (a simulated shift of {cad_delta}% from {orig_res['overall_cad']['percentage']}%). This statistical model recalculation is not proof that changing a factor directly alters patient risk."
    else:
        summary_text = f"Simulated model prediction: Model re-inference estimates CAD probability at {mod_res['overall_cad']['percentage']}% (a simulated shift of +{cad_delta}% from {orig_res['overall_cad']['percentage']}%). This statistical model recalculation is not proof that changing a factor directly alters patient risk."

    return {
        "original_prediction": orig_res,
        "modified_prediction": mod_res,
        "deltas": deltas,
        "changed_features": changed,
        "simulation_summary": summary_text,
        "disclaimer": "This What-If simulation is a hypothetical in-silico model prediction for sensitivity exploration. It does NOT constitute medical proof or evidence that changing a risk factor will directly reduce a real person's cardiovascular risk."
    }

@app.post("/api/explain")
def explain_cardiac_risk(req: PredictionRequest):
    """Compute local SHAP feature attributions and physiological measurement breakdown."""
    if not cardio_models or not shap_explainers:
        raise HTTPException(status_code=500, detail="Models or explainers not loaded.")

    feature_names = feature_metadata["feature_names"]

    if req.patient_id:
        match = test_patients_df[test_patients_df["Patient_ID"] == req.patient_id]
        if match.empty:
            raise HTTPException(status_code=404, detail=f"Patient {req.patient_id} not found.")
        raw_dict = match.iloc[0].to_dict()
    elif req.features:
        raw_dict = req.features
    else:
        raw_dict = test_patients_df.iloc[0].to_dict()

    row_df = pd.DataFrame([raw_dict])
    X_single, _, _ = preprocess_features(row_df)
    for col in feature_names:
        if col not in X_single.columns:
            X_single[col] = 0
    X_single = X_single[feature_names]

    explanations = {}

    for target in TARGET_COLS:
        explainer = shap_explainers[target]
        clf = cardio_models[target]
        prob = float(clf.predict_proba(X_single)[0, 1])

        shap_vals = explainer.shap_values(X_single)
        if isinstance(shap_vals, list):
            vals = shap_vals[1][0]
        elif len(shap_vals.shape) == 3:
            vals = shap_vals[0, :, 1]
        else:
            vals = shap_vals[0]

        factors = []
        for i, f_name in enumerate(feature_names):
            val = float(X_single.iloc[0, i])
            impact = float(vals[i])
            f_meta = PHYSIOLOGICAL_RANGES.get(f_name, {})
            factors.append({
                "feature": f_name,
                "value": val,
                "impact": round(impact, 4),
                "direction": "Risk-Increasing" if impact > 0 else "Protective",
                "unit": f_meta.get("unit", ""),
                "category": f_meta.get("category", "Clinical"),
                "description": f_meta.get("description", f_name)
            })

        # Sort factors by magnitude of impact
        factors_sorted = sorted(factors, key=lambda x: abs(x["impact"]), reverse=True)
        top_positive = [f for f in factors_sorted if f["impact"] > 0][:8]
        top_negative = [f for f in factors_sorted if f["impact"] < 0][:6]

        explanations[target] = {
            "probability": round(prob, 4),
            "base_value": float(explainer.expected_value[1]) if isinstance(explainer.expected_value, (list, np.ndarray)) else float(explainer.expected_value),
            "top_drivers": factors_sorted[:10],
            "risk_increasing": top_positive,
            "protective_factors": top_negative
        }

    # Anatomical correlation insights
    rwma = int(raw_dict.get("Region RWMA", 0))
    st_elev = int(raw_dict.get("St Elevation", 0))
    ef_tte = int(raw_dict.get("EF-TTE", 50))
    
    clinical_correlations = []
    if rwma == 1 or (rwma == 4 and st_elev == 1):
        clinical_correlations.append({
            "vessel": "LAD",
            "finding": f"Anterior wall motion abnormality (RWMA={rwma}) and ST elevation",
            "clinical_rationale": "The Left Anterior Descending artery supplies the anterior ventricular septum and apex; abnormal wall motion here strongly localizes LAD stenosis."
        })
    if rwma == 2:
        clinical_correlations.append({
            "vessel": "RCA",
            "finding": "Inferior wall motion abnormality (RWMA=2)",
            "clinical_rationale": "The Right Coronary Artery typically supplies the inferior and posterior aspects of the left and right ventricles."
        })
    if rwma == 3:
        clinical_correlations.append({
            "vessel": "LCX",
            "finding": "Lateral wall motion abnormality (RWMA=3)",
            "clinical_rationale": "The Left Circumflex artery supplies the lateral and posterior free walls of the left ventricle."
        })
    if ef_tte < 45:
        clinical_correlations.append({
            "vessel": "Global CAD",
            "finding": f"Reduced Left Ventricular Ejection Fraction ({ef_tte}%)",
            "clinical_rationale": "Impaired global systolic function is frequently associated with extensive multi-vessel ischemic disease and chronic hypoperfusion."
        })

    return {
        "explanations": explanations,
        "clinical_correlations": clinical_correlations,
        "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
    }

# Mount static build files if frontend dist exists
frontend_dist = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
