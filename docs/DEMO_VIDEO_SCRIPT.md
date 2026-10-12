# Cardio3D Demonstration Video Script (3-5 Minutes)
## Multimodal AI Hackathon 2026 — Track A Presentation

**Title:** Cardio3D: Interactive 3D Cardiovascular Risk Visualization & Multi-Vessel Stenosis Intelligence  
**Duration:** ~3:45 minutes  
**Format:** Screen recording with voiceover narration and live web application interaction.  

---

### Scene 1: Introduction & Medical Context (0:00 - 0:40)
**Visual on Screen:**
- Start on the Cardio3D Web Application (`http://localhost:8000`).
- Show the 3D anatomical heart gently beating inside the semi-transparent thoracic ribcage, with glowing coronary arteries and the persistent Clinical Safety Disclaimer banner at the top.
- Mouse rotates the 3D model smoothly in 360 degrees.

**Voiceover Narration:**
> *"Welcome to our demonstration of **Cardio3D**, built for Track A of the Multimodal AI Hackathon 2026.
> Cardiovascular disease remains the number one killer worldwide. In clinical practice, clinicians are often handed risk percentages or complex laboratory tables. But numbers alone fail to provide an intuitive spatial understanding of where pathology is developing inside a patient's coronary anatomy.
> Cardio3D bridges this gap by combining machine learning on clinical data with an interactive 3D anatomical visualization system, mapping multi-vessel stenosis risks directly onto the Left Anterior Descending, Left Circumflex, and Right Coronary Arteries in real time."*

---

### Scene 2: The Multi-Target Prediction Pipeline (0:40 - 1:20)
**Visual on Screen:**
- Switch to the "Model Benchmarks" tab on the right dashboard.
- Highlight the evaluation table: CAD (85.2% accuracy, 0.882 AUC), LAD (72.1% accuracy, 0.817 AUC), LCX (70.5% accuracy), and RCA (70.5% accuracy).
- Show the interactive ROC curves rendered on the Chart.js canvas.
- Highlight the "Strict Leakage Prevention Protocol" banner.

**Voiceover Narration:**
> *"Our predictive pipeline is trained on the official Extension of the Z-Alizadeh Sani dataset from the UCI Machine Learning Repository, comprising 303 complete patient records.
> Crucially, to strictly prevent target leakage as required by the challenge, our pipeline excludes all downstream vessel labels—LAD, LCX, RCA, and Cath—from model input features.
> Models are evaluated using 5-Fold Stratified Cross-Validation on non-invasive inputs including demographics, vital signs, 12-lead ECG markers, and echocardiography.
> As you can see on our benchmark dashboard, our best-performing Extra Trees model achieves an ROC-AUC of 0.882 for overall CAD status, with an 83.3% sensitivity for LAD stenosis, ensuring high-risk anterior lesions are reliably detected."*

---

### Scene 3: Interactive 3D Anatomical Mapping (1:20 - 2:10)
**Visual on Screen:**
- Click the "Cohort Case" dropdown and select **Patient PT-001** (Triple-vessel CAD).
- Watch the 3D model dynamically update:
  - The LAD artery transitions to **Crimson Red (86.5% probability)** with an animated high-risk stenosis plaque node pulsing.
  - The LCX artery transitions to **Amber Gold (52.6% probability)**.
  - The RCA artery transitions to **Amber/Red (60.7% probability)**.
- Demonstrate camera view presets:
  - Click "LAD Focus": camera zooms smoothly to the anterior interventricular groove.
  - Click "LCX Focus": camera rotates to the lateral free wall.
  - Click "RCA Focus": camera flies to the right atrioventricular groove.
- Hover over the LAD artery to reveal the floating 3D HUD tooltip.
- Click the LAD artery to show the **Lumen Cross-Section Gauge** at the bottom, indicating 74% stenosis narrowing and critical hypoperfusion.

**Voiceover Narration:**
> *"Now let's examine the 3D visual mapping in action.
> Here we load Patient 1 from our test cohort. Instantly, our Three.js engine dynamically color-codes each major coronary vessel according to predicted stenosis probabilities:
> Green indicates a patent vessel under 30% risk; amber denotes borderline narrowing between 30 and 70%; and crimson red highlights significant stenosis over 70%, accompanied by an animated plaque constriction node.
> Notice our camera view presets: with one click, we can fly directly to the LAD territory, inspect the circumflex in the lateral AV groove, or view the RCA.
> Clicking any vessel highlights its anatomical segment and opens our cross-sectional lumen gauge, showing the estimated percentage narrowing and tissue perfusion state."*

---

### Scene 4: Clinical Interpretability with TreeSHAP (2:10 - 2:55)
**Visual on Screen:**
- Click the "SHAP Interpretability" tab on the right panel.
- Point to the **Clinical Correlation Insights**:
  - Alert showing "Anterior wall motion abnormality (RWMA=4) and ST elevation localizing LAD stenosis".
- Show the **SHAP Waterfall Bar Chart**:
  - Typical Chest Pain (+10.2% risk impact).
  - Region RWMA (+8.5% risk impact).
  - ST Elevation (+6.2% risk impact).
  - Ejection Fraction 20% (+7.1% risk impact).
- Switch the SHAP target buttons between "Overall CAD", "LAD", "LCX", and "RCA" to demonstrate target-specific feature attributions.

**Voiceover Narration:**
> *"A black-box prediction is insufficient in cardiology. Cardio3D features a built-in TreeSHAP interpretability engine that computes local feature attributions in less than 15 milliseconds.
> For this patient, the model explains that the severe CAD risk is driven primarily by Typical Chest Pain, an echocardiographic regional wall motion abnormality score of 4, and ST elevation.
> Notice our anatomical correlation engine: because the patient presents with anterior wall hypokinesis and ST elevation, the system explicitly flags the Left Anterior Descending territory as the anatomical culprit."*

---

### Scene 5: Real-Time Patient Risk Simulator & Report Export (2:55 - 3:45)
**Visual on Screen:**
- Switch to the "Patient Simulator" tab.
- Drag the **Age** slider from 60 to 45.
- Uncheck **Typical Chest Pain** and **ST Elevation**.
- Change **Region RWMA** to 0 (Normal).
- Watch the 3D heart dynamically update in real time: the LAD artery smoothly transitions from red back to **emerald green (< 30% risk)**, the overall CAD gauge drops to low risk, and the high-risk glow extinguishes!
- Click **"Clinical Summary"** button in the top navigation bar.
- The printable Clinical Summary Modal appears, complete with patient profile, vessel breakdown, and SHAP key drivers.

**Voiceover Narration:**
> *"Cardio3D also functions as an interactive clinical risk simulator.
> Watch what happens when a clinician adjusts parameters: if we simulate therapeutic stabilization—normalizing blood pressure, resolving chest pain, and eliminating acute ischemic changes—the model recalculates in real-time without delay. The 3D heart dynamically shifts from high-risk red to healthy patent green.
> Finally, clicking 'Clinical Summary' generates a printable decision support summary for patient records or multidisciplinary heart team review.
> In summary, Cardio3D combines leak-free multi-target machine learning, explainable AI, and interactive 3D WebGL anatomical mapping into a production-grade clinical tool. Thank you!"*
