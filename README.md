# CardioAI — Explainable Cardiovascular Risk Prediction & 3D Visualization

**IIT Mandi Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction**  
*A Zero-Cost, Reproducible, and Explainable Student Research Prototype*

---

> [!IMPORTANT]
> **Research Prototype & Non-Diagnostic Disclosure:**  
> CardioAI is an academic research prototype developed strictly for decision support, risk sensitivity exploration, and educational visualization. It is **not** a certified medical device (not approved by CDSCO or FDA), has not been evaluated in registered clinical trials, and does not provide clinical prescriptions or confirm arterial occlusion. Model predictions are statistical estimates derived from tabular machine learning algorithms and must never replace formal coronary angiography or clinical judgement.

---

## 1. Problem Statement & Research Objective

Cardiovascular diseases (CVDs) remain the leading cause of global mortality, with coronary artery disease (CAD) accounting for a high proportion of premature deaths in India. Assessment in clinical settings involves dozens of heterogeneous measurements (demographics, vital signs, ECG waveforms, echocardiographic wall motion, and blood biomarkers) that are challenging to interpret in aggregate, particularly at resource-constrained Primary Health Centres (PHCs).

**CardioAI** addresses this challenge through a multi-modal, transparent research framework:
1. **Multi-Target Risk Estimation**: Simultaneously estimates overall CAD probability and branch-specific stenosis risk for the three primary coronary arteries (**LAD**, **LCX**, and **RCA**).
2. **Interactive 3D Anatomical Heart**: Translates tabular risk probabilities into an intuitive, color-mapped 3D myocardial and coronary tree schematic (built with Three.js/WebGL), enabling clinicians and patients to visualize territorial perfusion.
3. **Transparent Explainable AI (SHAP)**: Uses game-theoretic Shapley additive feature attributions to decompose predictions into positive risk drivers and protective factors for individual patient telemetry.
4. **Counterfactual What-If Exploration**: Provides interactive sensitivity modeling to simulate the impact of lifestyle modifications (e.g. smoking cessation, blood pressure normalization) without retraining.
5. **India Public Healthcare Roadmap**: Formulates a zero-cost, offline edge-triage architecture tailored for Ayushman Arogya Mandirs and rural Indian healthcare facilities.

---

## 2. Zero-Cost Engineering Architecture

CardioAI is built exclusively using free and open-source tools, designed to run 100% locally on an ordinary student laptop without external paid APIs, cloud servers, or specialized GPU hardware:

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Three.js / WebGL.
- **Backend**: Python 3.10+, FastAPI, Uvicorn.
- **Machine Learning**: scikit-learn (LogisticRegression, ExtraTrees, RandomForest, GradientBoosting, SoftEnsemble, CalibratedClassifierCV).
- **Explainable AI**: SHAP (TreeExplainer).
- **Testing & Quality Assurance**: pytest, pytest-cov, httpx.
- **Data Storage**: Local CSV, JSON, and serialized Joblib artifacts.
- **Total Operational & API Cost**: **$0.00 / ₹0.00**.

---

## 3. Dataset Attribution & Zero-Leakage Preprocessing

### Dataset Source
- **Dataset**: Extension of Z-Alizadeh Sani Dataset (303 patient records, 55 clinical features).
- **Source**: UCI Machine Learning Repository (Dataset ID: 411).
- **Citation**: Alizadeh Sani, Z., et al. (2017). *Computer-aided diagnosis of coronary artery disease using clinical data.*

### Strict Target Leakage Exclusion
To guarantee absolute clinical validity and prevent circular reasoning, the pipeline strictly excises:
- `Cath` (Overall CAD ground truth, 0/1)
- `LAD` (Left Anterior Descending stenosis, 0/1)
- `LCX` (Left Circumflex stenosis, 0/1)
- `RCA` (Right Coronary Artery stenosis, 0/1)
- `CAD` (Derived diagnostic labels)
- All patient identifiers (`Patient_ID`)

**Input Feature Vector ($N=55$):**
- Demographics: Age, Sex, BMI, Weight, Length.
- Vitals: Systolic BP, Diastolic BP, Pulse Rate.
- Medical History: Diabetes Mellitus (DM), Hypertension (HTN), Current Smoker, EX-Smoker, Family History (FH), Obesity, Chronic Renal Failure (CRF), Cerebrovascular Accident (CVA).
- Physical Symptoms: Typical Chest Pain, Exertional CP, Atypical, Nonanginal, LowTH Ang, Dyspnea, Murmurs.
- Laboratory Biomarkers: FBS, Total Cholesterol, LDL, HDL, Triglycerides (TG), Troponin-I, CK-MB, Creatinine, BUN, ESR, Hemoglobin, Potassium, Sodium, WBC, Neutrophils, Lymphocytes, Platelets.
- ECG / Echocardiography: ST-Elevation, ST-Depression, T-Inversion, Q-Wave, LVH, Poor R-Wave Progression, Bundle Branch Block (BBB), Ejection Fraction (EF-TTE), Regional Wall Motion Abnormality (Region RWMA score 0–4).

---

## 4. Machine Learning Benchmarks & Model Calibration

We established a standardized **Logistic Regression Baseline** for all 4 clinical targets and compared it against ensemble architectures (ExtraTrees, RandomForest, GradientBoosting, SoftEnsemble). To ensure reliable clinical probability interpretation, champions were post-calibrated using **Platt Sigmoid Scaling** (`CalibratedClassifierCV(method='sigmoid', cv=3)`).

Evaluated on an independent held-out test cohort ($N=61$) and 5-fold stratified cross-validation ($N=242$):

| Clinical Target | Baseline Model | Baseline Accuracy | Champion Architecture | Test Accuracy | Test F1-Score | Test ROC-AUC | Brier Loss |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **Cath (Overall CAD)** | LogisticRegression (Standardized) | 75.4% | **ExtraTrees (Calibrated)** | **86.9%** | **0.913** | **0.891** | 0.122 |
| **LAD Stenosis ($\ge 50\%$)** | LogisticRegression (Standardized) | 77.0% | **SoftEnsemble (Calibrated)** | **70.5%** | **0.763** | **0.794** | 0.187 |
| **LCX Stenosis ($\ge 50\%$)** | LogisticRegression (Standardized) | 62.3% | **RandomForest (Calibrated)** | **70.5%** | **0.625** | **0.680** | 0.198 |
| **RCA Stenosis ($\ge 50\%$)** | LogisticRegression (Standardized) | 68.9% | **ExtraTrees (Calibrated)** | **72.1%** | **0.605** | **0.768** | 0.184 |

*Note on Small Dataset Limitations: With $N=303$, scores reflect cohort-specific validation. External geographic validation is required before generalizable clinical deployment.*

---

## 5. Core Platform Capabilities

### 1. Unified Dashboard
- Real-time telemetry inputs (observed vs. preset cohort data).
- Instant multi-target predictions, calibrated risk tiers (Low, Moderate, High), and confidence metrics.
- Natural language clinical synthesis based on dynamic feature attributions.

### 2. Interactive 3D Heart Visualization
- Realistic, smooth rotating anatomical heart model with ventricular, atrial, and great vessel architecture.
- Anatomically informed coronary artery pathways for **LAD**, **LCX**, and **RCA**.
- Dynamic color-coding and pulsing risk indicators tied directly to model output probabilities.
- OrbitControls (360° mouse rotation, zoom, pan, camera view presets).
- Non-imaging disclaimer stating that visualizations represent model risk overlays, not radiological CT/angiography.

### 3. Dynamic Local & Global Explainability (TreeSHAP)
- Additive Shapley feature importance calculated dynamically for the active patient profile.
- Diverging attribution bars highlighting risk-increasing (red) vs. protective (green) factors.
- Multi-target filtering: toggle between Overall CAD, LAD, LCX, and RCA to review branch-specific drivers.

### 4. What-If Counterfactual Sensitivity Analysis (Track A Distinctive Feature)
- Allows clinicians to perturb vital signs and biomarkers (BP, Cholesterol, Glucose, Smoking, ECG, RWMA).
- Side-by-side comparative analysis of Baseline vs. Simulated probabilities.
- Instant delta badges ($\Delta\%$) with direction indicators.
- Quick preset scenarios: "BP & Lipid Target", "Smoking Cessation", and "Acute Decompensation".
- Simulation disclaimer highlighting exploratory in silico sensitivity nature.

### 5. Potential Public Healthcare Application (India Roadmap)
- Bilingual interface (English / हिन्दी).
- 6 Key Pillars exploring deployment at Primary Health Centres (PHCs) and Ayushman Arogya Mandirs.
- 100% offline edge execution (< 50MB RAM footprint).
- Proposed 3-phase clinical translation and CDSCO SaMD clearance roadmap.

### 6. Neutral Research Reporting & Audit Trail
- Patient summary export (PDF with print styling).
- Tabular CSV audit log export for cohort tracking.
- Removal of unsupported prescriptive recommendations (e.g. no automated drug dosing or invasive catheter lab bookings).

---

## 6. Installation & Local Execution

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ & npm

### Quickstart (Single-Command Run)

1. **Clone and navigate to repository**:
   ```bash
   cd cardio-risk-3d
   ```

2. **Install Python backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Run the Full-Stack Application**:
   ```bash
   python run_server.py
   ```
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173) (Vite dev) or [http://localhost:8000](http://localhost:8000) (FastAPI bundle)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 7. Automated Test Suite

Run the automated pytest test suite covering schema integrity, zero-leakage enforcement, model calibration, What-If counterfactuals, and FastAPI endpoints:

```bash
python -m pytest tests/ -v
```

**Verification Results:**
- `test_feature_metadata_schema`: PASSED (55 features, physiological ranges verified)
- `test_strict_target_leakage_exclusion`: PASSED (Cath, CAD, LAD, LCX, RCA strictly excluded)
- `test_models_exist_for_all_four_targets`: PASSED (all models loaded and callable)
- `test_evaluation_metrics_reporting`: PASSED (Logistic baseline vs champion verified)
- `test_direct_inference_pipeline`: PASSED (calibrated probabilities $\in [0, 1]$)
- `test_api_health`: PASSED (200 OK, healthy status)
- `test_api_patients`: PASSED (200 OK, test cohort accessible)
- `test_api_predict`: PASSED (200 OK, multi-vessel inference)
- `test_api_what_if_counterfactual`: PASSED (200 OK, risk delta and parameter tracking)

**Test Status**: **9/9 Passed (100%)**.

---

## 8. Limitations & Ethical Disclosures

1. **Cohort Sample Size**: Trained on the UCI Z-Alizadeh Sani cohort ($N=303$). While stratified cross-validation and calibration were enforced, prospective multi-center studies are necessary to evaluate demographic drift across diverse Indian populations.
2. **Tabular vs. Imaging**: Predictions are statistical estimates from clinical measurements. 3D heart visualizations are schematic overlays, not direct radiological reconstructions (CT/angiography).
3. **No Direct Interventions**: This software does not prescribe pharmacological treatments (statins, aspirin, beta-blockers) or book cath lab admissions.
4. **Regulatory Status**: Developed solely for the IIT Mandi Multimodal AI Hackathon 2026. Not cleared by CDSCO as Software as a Medical Device (SaMD).
