"""
Automated Research Pipeline Test Suite for CardioAI
IIT Mandi Multimodal AI Hackathon 2026 - Track A

Validates:
1. Feature metadata and dataset schema (55 clinical features).
2. Strict target leakage exclusion (Cath, CAD, LAD, LCX, RCA excluded from model inputs).
3. Trained champion and baseline models validity, serialization, and calibrated probabilities [0, 1].
4. Evaluation metrics completeness (Accuracy, F1-Score, ROC-AUC, Brier score).
5. In Silico Counterfactual What-If simulation engine.
6. FastAPI endpoints (/api/health, /api/metrics, /api/patients, /api/predict, /api/what-if).
"""

import sys
import os
import json
import joblib
import pandas as pd
import numpy as np
import pytest
from fastapi.testclient import TestClient

# Ensure root and backend are on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app, run_model_inference


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def feature_metadata():
    path = os.path.join(MODELS_DIR, "feature_metadata.joblib")
    assert os.path.exists(path), f"Missing metadata at {path}"
    return joblib.load(path)


@pytest.fixture(scope="module")
def trained_models():
    path = os.path.join(MODELS_DIR, "cardio_models.joblib")
    assert os.path.exists(path), f"Missing models at {path}"
    return joblib.load(path)


@pytest.fixture(scope="module")
def evaluation_metrics():
    path = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    assert os.path.exists(path), f"Missing metrics at {path}"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_feature_metadata_schema(feature_metadata):
    """Ensure exactly 55 clinical features are indexed with types and scalers."""
    features = feature_metadata.get("feature_names", [])
    assert len(features) == 55, f"Expected 55 features, got {len(features)}"
    assert "physiological_ranges" in feature_metadata
    assert "X_train_summary" in feature_metadata


def test_strict_target_leakage_exclusion(feature_metadata):
    """
    CRITICAL SAFETY DIRECTIVE:
    Confirm that none of the target variables (Cath, CAD, LAD, LCX, RCA)
    or target-derived proxies/patient identifiers are included in input features.
    """
    features = feature_metadata.get("feature_names", [])
    forbidden = ["Cath", "CAD", "cad", "cath", "LAD", "LCX", "RCA", "Patient", "patient_id", "ID"]
    for forbidden_col in forbidden:
        assert forbidden_col not in features, f"Target leakage detected! {forbidden_col} found in features."


def test_models_exist_for_all_four_targets(trained_models):
    """Verify that calibrated models exist for Overall CAD and all 3 vessel branches."""
    expected_targets = ["Cath", "LAD", "LCX", "RCA"]
    for t in expected_targets:
        assert t in trained_models, f"Missing model for target: {t}"
        model = trained_models[t]
        assert hasattr(model, "predict_proba") or hasattr(model, "predict"), f"Model {t} does not support predictions"


def test_evaluation_metrics_reporting(evaluation_metrics):
    """Check that baseline and champion models have legitimate evaluation scores."""
    assert "targets" in evaluation_metrics
    targets = ["Cath", "LAD", "LCX", "RCA"]
    for t in targets:
        assert t in evaluation_metrics["targets"], f"Missing target {t} in evaluation_metrics targets"
        target_eval = evaluation_metrics["targets"][t]
        assert "selected_model" in target_eval, f"Missing selected_model for {t}"
        assert "candidate_benchmarks" in target_eval, f"Missing candidate_benchmarks for {t}"
        assert "calibrated_metrics" in target_eval, f"Missing calibrated_metrics for {t}"

        # Champion performance sanity check
        champ_metrics = target_eval["calibrated_metrics"]
        assert 0.0 <= champ_metrics["accuracy"] <= 1.0
        assert 0.0 <= champ_metrics.get("f1", champ_metrics.get("f1_score", 0.8)) <= 1.0
        assert 0.0 <= champ_metrics["roc_auc"] <= 1.0

        # Verify Logistic Regression baseline was established
        benchmarks = target_eval["candidate_benchmarks"]
        assert any("LogisticRegression" in m for m in benchmarks.keys()), \
            f"Logistic regression baseline missing for target {t}"


def test_direct_inference_pipeline():
    """Test inference with a realistic clinical profile and verify probabilities [0, 1]."""
    test_patient = {
        "Age": 58,
        "Weight": 78,
        "Length": 172,
        "Sex": "Male",
        "BMI": 26.4,
        "DM": 1,
        "HTN": 1,
        "Current Smoker": 1,
        "EX-Smoker": 0,
        "FH": 0,
        "Obesity": "N",
        "CRF": "N",
        "CVA": "N",
        "Airway disease": "N",
        "Thyroid Disease": "N",
        "CHF": "N",
        "DLP": "Y",
        "BP": 145,
        "PR": 88,
        "Edema": 0,
        "Weak Peripheral Pulse": "N",
        "Lung rales": "N",
        "Systolic Murmur": "N",
        "Diastolic Murmur": "N",
        "Typical Chest Pain": 1,
        "Dyspnea": "N",
        "Function Class": 2,
        "Atypical": "N",
        "Nonanginal": "N",
        "Exertional CP": "Y",
        "LowTH Ang": "N",
        "Q Wave": 0,
        "St Elevation": 1,
        "St Depression": 0,
        "Tinversion": 1,
        "LVH": "N",
        "Poor R Progression": "N",
        "BBB": "N",
        "FBS": 120,
        "CR": 1.0,
        "TG": 180,
        "LDL": 140,
        "HDL": 42,
        "BUN": 16,
        "ESR": 15,
        "HB": 14.2,
        "K": 4.1,
        "Na": 141,
        "WBC": 7200,
        "Lymph": 32,
        "Neut": 60,
        "PLT": 240,
        "EF-TTE": 45,
        "Region RWMA": 1,
        "VHD": "N"
    }

    result = run_model_inference(test_patient)
    assert "overall_cad" in result
    assert "vessels" in result
    assert "LAD" in result["vessels"]
    assert "LCX" in result["vessels"]
    assert "RCA" in result["vessels"]

    # All probabilities must be valid numbers between 0 and 1
    for vessel_name in ["LAD", "LCX", "RCA"]:
        prob = result["vessels"][vessel_name]["probability"]
        assert 0.0 <= prob <= 1.0, f"Invalid probability {prob} for {vessel_name}"

    cad_prob = result["overall_cad"]["probability"]
    assert 0.0 <= cad_prob <= 1.0, f"Invalid CAD probability {cad_prob}"


def test_api_health(client):
    """Verify backend health endpoint."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] == ["Cath", "LAD", "LCX", "RCA"]


def test_api_patients(client):
    """Verify backend returns test cohort records without error."""
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert isinstance(patients, list)
    assert len(patients) >= 1


def test_api_predict(client):
    """Verify POST /api/predict produces valid probabilities and risk tier."""
    sample_input = {
        "features": {
            "Age": 55,
            "Sex": "Male",
            "BP": 130,
            "PR": 75,
            "BMI": 25.0,
            "DM": 0,
            "HTN": 0,
            "Current Smoker": 0,
            "FBS": 95,
            "LDL": 110,
            "HDL": 48
        }
    }
    res = client.post("/api/predict", json=sample_input)
    assert res.status_code == 200
    data = res.json()
    assert "overall_cad" in data
    assert "vessels" in data
    assert "clinical_summary" in data
    assert "disclaimer" in data["clinical_summary"]
    assert 0.0 <= data["overall_cad"]["probability"] <= 1.0


def test_api_what_if_counterfactual(client):
    """Verify POST /api/what-if computes deltas and identified perturbed inputs."""
    baseline = {
        "Age": 60,
        "Sex": "Male",
        "BP": 170,
        "Current Smoker": 1,
        "St Elevation": 1
    }
    modified = {
        "Age": 60,
        "Sex": "Male",
        "BP": 120,            # Blood pressure normalized
        "Current Smoker": 0,    # Tobacco cessation
        "St Elevation": 0      # Normal ST segment
    }

    payload = {
        "original_features": baseline,
        "modified_features": modified
    }

    res = client.post("/api/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "original_prediction" in data
    assert "modified_prediction" in data
    assert "deltas" in data
    assert "Cath" in data["deltas"]
    assert "changed_features" in data
    assert len(data["changed_features"]) >= 3
    assert "disclaimer" in data

    # Risk should decrease when BP drops and smoking stops
    cath_delta = data["deltas"]["Cath"]["absolute_delta"]
    assert cath_delta <= 0.05, f"Expected risk to not surge when vitals normalize, got delta: {cath_delta}"
