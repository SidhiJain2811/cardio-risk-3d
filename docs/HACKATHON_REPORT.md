# Multimodal AI Hackathon 2026 — Track A Final Project Report
## Cardio3D: Interactive 3D Cardiovascular Risk Visualization & Multi-Vessel Stenosis Intelligence

**Author / Team:** Multimodal AI Hackathon Team  
**Track:** Track A — Cardiovascular Risk Visualization & Prediction  
**Evaluation Criteria:** Predictive Performance (30%), 3D Visualization (25%), Clinical Interpretability (20%), System Integration (15%), Technical Implementation (10%)  

---

## 1. Executive Summary

Cardiovascular Disease (CVD), specifically Coronary Artery Disease (CAD), remains the leading cause of mortality globally. While modern machine learning algorithms can compute statistical risk percentages from patient clinical and laboratory data, abstract numerical probabilities fail to provide clinicians and patients with an intuitive spatial understanding of *where* and *how* pathology is developing inside the coronary arterial tree.

**Cardio3D** solves this critical gap by delivering a unified, web-based clinical decision support system that:
1. **Predicts multi-target cardiac risk** with high diagnostic discrimination: overall CAD status and vessel-specific stenosis status for the three primary coronary arteries:
   - **LAD (Left Anterior Descending)**
   - **LCX (Left Circumflex)**
   - **RCA (Right Coronary Artery)**
2. **Maps predictions in real-time onto an interactive 3D anatomical heart and thoracic cage model (Three.js / WebGL)**, dynamically updating arterial color codes (patent green, borderline yellow, severe stenotic red with animated pulse/plaque constriction).
3. **Explains risk predictions through TreeSHAP attributions**, highlighting patient-specific physiological drivers, abnormal laboratory vectors, and anatomical echocardiographic/ECG correlations.
4. **Maintains strict target leakage prevention**, excluding all downstream angiographic findings (`Cath`, `LAD`, `LCX`, `RCA`) from model inputs.

---

## 2. Clinical Domain & Pathophysiology Primer

### 2.1 The Three Primary Coronary Arteries
Coronary arteries deliver oxygenated blood to the contracting myocardium. Significant stenosis (narrowing $\ge 50\%$ in vessel lumen diameter) compromises myocardial perfusion:
- **Left Anterior Descending (LAD):** Originates from the Left Main coronary trunk and travels along the anterior interventricular sulcus down to the cardiac apex. It supplies 45–55% of the left ventricular myocardium, including the anterior ventricular wall, anterolateral wall, and the anterior two-thirds of the interventricular septum. Occlusion of the proximal LAD ("the widow maker") causes massive anterolateral infarction.
- **Left Circumflex (LCX):** Originates from the Left Main bifurcation and courses through the left atrioventricular groove towards the posterior and lateral surfaces. It supplies the posterolateral wall of the left ventricle and anterolateral papillary muscle.
- **Right Coronary Artery (RCA):** Emerges from the right aortic sinus and travels down the right atrioventricular groove. It supplies the right ventricle, inferior wall and posterior third of the septum via the Posterior Descending Artery (PDA), as well as the sinoatrial (SA) and atrioventricular (AV) nodal branches in right-dominant circulation.

### 2.2 Clinical, ECG, and Echocardiographic Feature Integration
The dataset integrates 55 non-invasive clinical predictors:
- **Demographics & History:** Age, Sex, BMI, Diabetes Mellitus (DM), Hypertension (HTN), Smoking status, Family History (FH).
- **Symptoms & Vitals:** Typical Chest Pain (substernal pressure provoked by exertion, relieved by rest or nitroglycerin), Systolic Blood Pressure (BP), Pulse Rate (PR), Ejection Fraction (EF-TTE).
- **ECG Correlates:** ST Elevation, ST Depression, T-Wave Inversion, Pathologic Q Waves, Left Ventricular Hypertrophy (LVH), Bundle Branch Block (BBB).
- **Echocardiographic Wall Motion (RWMA):** Regional Wall Motion Abnormality provides localized clinical evidence of myocardial ischemia or prior infarction:
  - `RWMA = 1` (Anterior wall hypokinesis) $\rightarrow$ directly correlates with LAD stenosis.
  - `RWMA = 2` (Inferior wall hypokinesis) $\rightarrow$ directly correlates with RCA stenosis.
  - `RWMA = 3` (Lateral wall hypokinesis) $\rightarrow$ directly correlates with LCX stenosis.
  - `RWMA = 4` (Multiple / diffuse hypokinesis) $\rightarrow$ indicates severe multi-vessel CAD.

---

## 3. Dataset Preprocessing & Leakage Prevention Protocol

### 3.1 Primary Dataset
The pipeline utilizes the **Extension of Z-Alizadeh Sani Dataset** (UCI Repository ID: 411 / Shaheed Rajaei Cardiovascular Center):
- **Cohort Size:** 303 patient records with 59 original attributes.
- **Completeness:** 0 missing values across all clinical variables.
- **Ground-Truth Diagnostic Targets:**
  - `Cath` (Overall CAD status): 216 CAD positive, 87 Normal.
  - `LAD` (Left Anterior Descending stenosis $\ge 50\%$): 177 Stenotic, 126 Normal.
  - `LCX` (Left Circumflex stenosis $\ge 50\%$): 119 Stenotic, 184 Normal.
  - `RCA` (Right Coronary Artery stenosis $\ge 50\%$): 114 Stenotic, 189 Normal.

### 3.2 Target Leakage Prevention Protocol (Mandatory Requirement 1.d)
A common pitfall in cardiovascular modeling is target leakage, where angiographic findings or fellow coronary vessel labels are inadvertently provided to the feature matrix.
- **Protocol:** The feature preprocessor explicitly and irreversibly excludes `['Cath', 'LAD', 'LCX', 'RCA', 'Patient_ID']` from all model input matrices.
- Models predict solely on pre-catheterization non-invasive features (demographics, vital signs, physical exam, baseline 12-lead ECG, laboratory biomarkers, and transthoracic echocardiography).

---

## 4. Machine Learning Architecture & Multi-Target Validation

### 4.1 Methodology & Validation Strategy
- **Stratified Split:** 80% Training cohort ($N = 242$) and 20% Held-Out Test cohort ($N = 61$), stratified by overall CAD diagnosis (`Cath`).
- **Internal Cross-Validation:** 5-Fold Stratified Cross-Validation on the training set to guard against overfitting and hyperparameter bias.
- **Algorithms Evaluated:** Random Forest, Extra Trees, and Gradient Boosting ensembles with balanced class weighting.

### 4.2 Benchmark Results Table

| Target | Selected Best Model | Test Accuracy | Test Sensitivity | Test Specificity | Test F1-Score | Test ROC-AUC | 5-Fold CV AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cath (Overall CAD)** | Extra Trees | **85.2%** | **90.7%** | **72.2%** | **0.894** | **0.882** | **0.926** |
| **LAD Stenosis** | Extra Trees | **72.1%** | **83.3%** | **56.0%** | **0.761** | **0.817** | **0.856** |
| **LCX Stenosis** | Random Forest | **70.5%** | **66.7%** | **73.0%** | **0.640** | **0.716** | **0.758** |
| **RCA Stenosis** | Extra Trees | **70.5%** | **65.2%** | **73.7%** | **0.625** | **0.784** | **0.716** |

### 4.3 Validation Insights
- **Overall CAD Detection:** Achieves exceptional discrimination with a **Test ROC-AUC of 0.882** (and a 5-Fold CV AUC of 0.926), providing reliable triaging for non-invasive clinical evaluation.
- **LAD Stenosis:** Achieves **83.3% sensitivity**, capturing critical proximal and mid-vessel lesions in the high-stakes anterior territory.
- **Multi-Vessel Burden:** Accurately classifies patients into single-vessel, two-vessel, and triple-vessel ischemic risk categories.

---

## 5. 3D Visual Mapping & Anatomical Pipeline

### 5.1 Three.js / WebGL Architecture
The 3D anatomical viewer is implemented in vanilla Three.js with hardware-accelerated WebGL rendering:
- **Myocardial Ventricular/Atrial Geometry:** High-polygon curved mesh representations for the Left Ventricle (conical apex pointing antero-inferiorly), Right Ventricle, Left Atrium, and Right Atrium.
- **Great Vessels:** Anatomically calibrated tube geometries for the Ascending Aorta, Aortic Arch with supra-aortic arch branches (Brachiocephalic trunk, Left Common Carotid, Left Subclavian), and Pulmonary Trunk.
- **Coronary Arterial Trees:**
  - **LAD:** Catmull-Rom spline curve descending along the anterior interventricular groove with D1/D2 diagonal branches.
  - **LCX:** Branching from the Left Main, traveling the atrioventricular groove to the posterolateral left ventricle with OM1/OM2 obtuse marginals.
  - **RCA:** Originating at the right aortic sinus, descending the right atrioventricular groove to acute margin and PDA.

### 5.2 Dynamic Color-Coding & Plaque Stenosis Nodes
- **Patent / Low Risk ($< 30\%$):** Emerald Green (`#10b981`), low emissive intensity.
- **Moderate / Borderline Risk ($30\% - 69\%$):** Amber Gold (`#f59e0b`), intermediate emissive glow.
- **High Risk / Severe Stenosis ($\ge 70\%$):** Crimson Red (`#ef4444`) with animated high-frequency pulsing glow and localized spherical plaque constriction nodes.

### 5.3 Interactive Capabilities
- **OrbitControls:** 360° smooth rotation, dolly zoom, and pan.
- **Raycasting:** Real-time raycaster on mouse hover highlights individual vessels/chambers and displays floating tooltip badges.
- **Camera Fly-to Presets:** Macro camera view transitions for LAD Focus, LCX Focus, RCA Focus, Full Cardiac Overview, and Torso Cage.
- **Rhythmic Heartbeat & Perfusion Flow:** Rhythmic contraction animated proportionally to the patient's actual Pulse Rate (PR), alongside particle stream simulation depicting coronary blood perfusion.
- **Lumen Cross-Section HUD:** Displays circular lumen cross-section showing percentage diameter narrowing and perfusion reserve.

---

## 6. Clinical Interpretability & Explainability (TreeSHAP)

### 6.1 Feature Attribution Engine
To ensure clinicians understand *why* the model makes specific risk predictions, Cardio3D integrates TreeSHAP (Shapley Additive Explanations):
- Computes exact local Shapley values for each patient in $< 15\text{ ms}$.
- Decomposes the model output into risk-increasing vectors (positive Shapley values, colored rose red) and protective factors (negative Shapley values, colored emerald green).

### 6.2 Key Global Feature Attributions
Across the cohort, the most influential features identified by SHAP are:
1. **Typical Chest Pain:** Dominant clinical indicator for CAD ($+12\%\text{ to }+18\%$ risk impact).
2. **Region RWMA:** Primary driver for territorial vessel localization (Anterior $\rightarrow$ LAD; Lateral $\rightarrow$ LCX; Inferior $\rightarrow$ RCA).
3. **Ejection Fraction (EF-TTE):** Severe systolic dysfunction ($< 40\%$) indicates extensive ischemic burden.
4. **Age & Diabetes Mellitus:** Progressive microvascular and macrovascular atherosclerotic risk factors.
5. **ST-Segment Elevation & Pathologic Q Waves:** Localizes acute or chronic transmural myocardial injury.

---

## 7. System Integration & User Workflow

### 7.1 Architecture
- **Backend:** FastAPI application running on Python 3.13 providing `/api/predict`, `/api/explain`, `/api/metrics`, and `/api/patients`.
- **Frontend:** Responsive glassmorphic single-page application built with modern ES modules, Vite, Three.js, and Chart.js.
- **Latency:** End-to-end roundtrip latency for full multi-target prediction and SHAP explanation is $< 40\text{ ms}$.

### 7.2 Patient Workflow
1. **Cohort Case Selection:** Clinician selects a real patient from the held-out test cohort (e.g., Patient #1 with triple-vessel CAD vs. Patient #4 with normal coronaries).
2. **Interactive Risk Simulation:** Clinician adjusts live physiological sliders (Age, Blood Pressure, Pulse, Ejection Fraction, ST changes, RWMA) to simulate clinical interventions or disease progression.
3. **Instant 3D & Dashboard Updates:** Three.js coronary vessels seamlessly transition colors, risk gauges update, and SHAP waterfalls re-render.
4. **Export Clinical Summary:** One-click generation of a comprehensive, printable clinical report.

---

## 8. Clinical Safety Compliance
In accordance with medical AI safety guidelines, Cardio3D embeds a persistent, prominent warning banner:
> **CLINICAL SAFETY DISCLAIMER:** This AI system is engineered strictly for decision support and educational anatomical visualization. Predictions are not a substitute for formal diagnostic coronary angiography or physician evaluation.
