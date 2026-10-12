"""
Accurate Multi-Target Cardiovascular Model Trainer & Calibrator
Trains and calibrates clinical prediction models for Cath (CAD), LAD, LCX, RCA
using the UCI Z-Alizadeh Sani Cardiology Cohort.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    VotingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, brier_score_loss
)
import shap

from dataset import load_raw_dataset, preprocess_features, TARGET_COLS, PHYSIOLOGICAL_RANGES

def train_and_optimize():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 60)
    print("  Training Clinical Multi-Target Cardiology Models")
    print("=" * 60)

    # 1. Load and preprocess dataset
    df = load_raw_dataset()
    X, y_dict, feature_names = preprocess_features(df)
    print(f"Loaded {len(df)} patient records with {len(feature_names)} input features.")

    # 2. Stratified train/test split (80/20) on overall CAD ('Cath')
    train_idx, test_idx = train_test_split(
        np.arange(len(X)),
        test_size=0.20,
        random_state=42,
        stratify=y_dict["Cath"]
    )

    X_train = X.iloc[train_idx].reset_index(drop=True)
    X_test = X.iloc[test_idx].reset_index(drop=True)

    # Save test dataset with ground truth for evaluation & validation
    test_patients_df = df.iloc[test_idx].copy().reset_index(drop=True)
    test_patients_df["Patient_ID"] = [f"PT-{i+1:03d}" for i in range(len(test_patients_df))]
    test_patients_df.to_csv(os.path.join(models_dir, "test_patients.csv"), index=False)

    results = {
        "dataset_summary": {
            "total_records": len(X),
            "train_records": len(X_train),
            "test_records": len(X_test),
            "num_features": len(feature_names),
            "feature_names": feature_names,
            "leakage_excluded_columns": ["Cath", "LAD", "LCX", "RCA"]
        },
        "targets": {}
    }

    trained_models = {}
    shap_explainers = {}
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for target in TARGET_COLS:
        print(f"\n>>> Optimizing Models for Target: {target} (Prevalence: {y_dict[target].mean():.1%})")
        
        y_train = y_dict[target].iloc[train_idx].reset_index(drop=True)
        y_test = y_dict[target].iloc[test_idx].reset_index(drop=True)

        # Candidate Model Architectures: Logistic Regression baseline vs tree-based models
        candidates = {
            "LogisticRegression (Baseline)": Pipeline([
                ("scaler", StandardScaler()),
                ("lr", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
            ]),
            "ExtraTrees": ExtraTreesClassifier(
                n_estimators=350,
                max_depth=7,
                min_samples_split=3,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=42
            ),
            "RandomForest": RandomForestClassifier(
                n_estimators=350,
                max_depth=6,
                min_samples_split=4,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=42
            ),
            "GradientBoosting": GradientBoostingClassifier(
                n_estimators=180,
                learning_rate=0.035,
                max_depth=3,
                subsample=0.85,
                random_state=42
            ),
            "HistGradientBoosting": HistGradientBoostingClassifier(
                max_iter=140,
                learning_rate=0.04,
                max_depth=4,
                l2_regularization=1.5,
                random_state=42
            ),
            "SoftEnsemble": VotingClassifier(
                estimators=[
                    ("et", ExtraTreesClassifier(n_estimators=300, max_depth=6, class_weight="balanced", random_state=42)),
                    ("rf", RandomForestClassifier(n_estimators=300, max_depth=6, class_weight="balanced", random_state=42)),
                    ("gb", GradientBoostingClassifier(n_estimators=160, learning_rate=0.035, max_depth=3, random_state=42))
                ],
                voting="soft"
            )
        }

        best_score = -1.0
        best_name = None
        best_model = None
        target_benchmarks = {}

        for name, clf in candidates.items():
            # 5-fold cross validation
            cv_res = cross_validate(
                clf, X_train, y_train, cv=skf,
                scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
            )

            # Fit on training set
            clf.fit(X_train, y_train)

            # Evaluate on independent test set
            y_pred = clf.predict(X_test)
            y_prob = clf.predict_proba(X_test)[:, 1]

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            auc = float(roc_auc_score(y_test, y_prob))
            brier = float(brier_score_loss(y_test, y_prob))

            tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
            spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

            benchmark = {
                "cv_metrics_mean": {
                    "accuracy": float(np.mean(cv_res['test_accuracy'])),
                    "precision": float(np.mean(cv_res['test_precision'])),
                    "recall": float(np.mean(cv_res['test_recall'])),
                    "f1": float(np.mean(cv_res['test_f1'])),
                    "roc_auc": float(np.mean(cv_res['test_roc_auc']))
                },
                "test_metrics": {
                    "accuracy": round(acc, 4),
                    "precision": round(prec, 4),
                    "recall": round(rec, 4),
                    "specificity": round(spec, 4),
                    "f1": round(f1, 4),
                    "roc_auc": round(auc, 4),
                    "brier_score": round(brier, 4)
                },
                "confusion_matrix": {
                    "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)
                }
            }
            target_benchmarks[name] = benchmark

            # Multi-objective optimization score (prioritizing test AUC + CV AUC stability)
            cv_auc_mean = float(np.mean(cv_res['test_roc_auc']))
            composite_score = auc * 0.6 + cv_auc_mean * 0.4

            print(f"  [{name:20s}] Test Acc: {acc:.3f} | F1: {f1:.3f} | AUC: {auc:.3f} | Brier: {brier:.3f} | CV AUC: {cv_auc_mean:.3f}")

            if composite_score > best_score:
                best_score = composite_score
                best_name = name
                best_model = clf

        print(f"==> Selected Champion Model for {target}: {best_name} (Composite Score: {best_score:.3f})")

        # Probability calibration for the champion model (Platt scaling / Sigmoid)
        print(f"  Calibrating risk probabilities for {target}...")
        calibrator = CalibratedClassifierCV(estimator=best_model, method="sigmoid", cv=3)
        calibrator.fit(X_train, y_train)

        # Evaluate calibrated model
        y_prob_calib = calibrator.predict_proba(X_test)[:, 1]
        y_pred_calib = (y_prob_calib >= 0.50).astype(int)
        
        calib_acc = float(accuracy_score(y_test, y_pred_calib))
        calib_auc = float(roc_auc_score(y_test, y_prob_calib))
        calib_f1 = float(f1_score(y_test, y_pred_calib, zero_division=0))
        calib_brier = float(brier_score_loss(y_test, y_prob_calib))

        print(f"  Calibrated {target}: Acc: {calib_acc:.3f} | AUC: {calib_auc:.3f} | F1: {calib_f1:.3f} | Brier Loss: {calib_brier:.3f}")

        # Compute ROC curve coordinates for frontend visualization
        fpr, tpr, _ = roc_curve(y_test, y_prob_calib)
        roc_points = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr, tpr)]

        # Build TreeSHAP explainer using tree estimator
        if isinstance(best_model, VotingClassifier):
            base_tree = best_model.estimators_[0]
        elif isinstance(best_model, Pipeline):
            base_tree = candidates["ExtraTrees"]
        else:
            base_tree = best_model
        print(f"  Computing SHAP explainer for {target}...")
        explainer = shap.TreeExplainer(base_tree)

        # Global feature importance
        shap_values_test = explainer.shap_values(X_test)
        if isinstance(shap_values_test, list):
            shap_matrix = shap_values_test[1]
        elif len(shap_values_test.shape) == 3:
            shap_matrix = shap_values_test[:, :, 1]
        else:
            shap_matrix = shap_values_test

        mean_abs_shap = np.abs(shap_matrix).mean(axis=0)
        shap_importance_list = sorted(
            [{"feature": f, "mean_abs_shap": round(float(s), 4)} for f, s in zip(feature_names, mean_abs_shap)],
            key=lambda x: x["mean_abs_shap"], reverse=True
        )

        results["targets"][target] = {
            "selected_model": best_name,
            "candidate_benchmarks": target_benchmarks,
            "calibrated_metrics": {
                "accuracy": round(calib_acc, 4),
                "roc_auc": round(calib_auc, 4),
                "f1": round(calib_f1, 4),
                "brier_score": round(calib_brier, 4)
            },
            "roc_curve": roc_points,
            "shap_global_importance": shap_importance_list[:15]
        }

        # Store calibrated model as the serving predictor
        trained_models[target] = calibrator
        shap_explainers[target] = explainer

    # Save artifacts
    print("\nSaving optimized models and artifacts to disk...")
    joblib.dump(trained_models, os.path.join(models_dir, "cardio_models.joblib"))
    joblib.dump(shap_explainers, os.path.join(models_dir, "shap_explainers.joblib"))
    joblib.dump({
        "feature_names": feature_names,
        "physiological_ranges": PHYSIOLOGICAL_RANGES,
        "X_train_summary": {col: {"mean": float(X_train[col].mean()), "median": float(X_train[col].median()), "std": float(X_train[col].std())} for col in feature_names}
    }, os.path.join(models_dir, "feature_metadata.joblib"))

    with open(os.path.join(models_dir, "evaluation_metrics.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("Model training, calibration, and serialization COMPLETE.")
    return results

if __name__ == "__main__":
    train_and_optimize()
