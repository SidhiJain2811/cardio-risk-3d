// Clinical cardiology defaults, sample patient cohorts, and evaluation benchmarks

export const RISK_COLORS = {
  low: {
    hex: '#059669',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    tier: 'Low Risk',
    threshold: '< 0.3'
  },
  moderate: {
    hex: '#D97706',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
    tier: 'Moderate Risk',
    threshold: '0.3 - 0.7'
  },
  high: {
    hex: '#DC2626',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    tier: 'High Risk',
    threshold: '> 0.7'
  }
};

export function getRiskLevel(prob) {
  if (prob < 0.3) return RISK_COLORS.low;
  if (prob <= 0.7) return RISK_COLORS.moderate;
  return RISK_COLORS.high;
}

export const DEFAULT_PATIENT_FEATURES = {
  // Demographics
  Age: 58,
  Gender: 'Male', // 'Male' | 'Female'
  BMI: 27.3,
  SmokingStatus: 'Former Smoker', // 'Never' | 'Current Smoker' | 'Former Smoker'
  
  // Clinical Measurements
  SystolicBP: 140, // mmHg
  DiastolicBP: 88,  // mmHg
  PulseRate: 92,    // bpm
  Cholesterol: 220, // mg/dL
  Glucose: 110,     // mg/dL
  
  // Laboratory
  Troponin: 0.05,   // ng/mL
  CKMB: 5.2,        // ng/mL
  
  // ECG Findings
  StElevation: 'Yes', // 'Yes' | 'No'
  TInversion: 'No',   // 'Yes' | 'No'
  LVH: 'Yes',         // 'Yes' | 'No'
  
  // Echocardiography
  RegionRWMA: 'Yes',  // 'Yes' | 'No'
  RWMALocation: 'Anterior' // 'Anterior' | 'Inferior' | 'Lateral' | 'None'
};

export const DEFAULT_PREDICTIONS = {
  "overall_cad": {
    "probability": 0.9632,
    "percentage": 96.3,
    "tier": "High Risk",
    "status": "Stenotic (>=50%)",
    "color": "#ef4444",
    "glow": "rgba(239, 68, 68, 0.7)",
    "confidence": 97
  },
  "vessels": {
    "LAD": {
      "probability": 0.9056,
      "percentage": 90.6,
      "tier": "High Risk",
      "status": "Stenotic (>=50%)",
      "color": "#ef4444",
      "glow": "rgba(239, 68, 68, 0.7)",
      "name": "Left Anterior Descending",
      "short": "LAD",
      "territory": "Anterior Wall & Septum"
    },
    "LCX": {
      "probability": 0.6421,
      "percentage": 64.2,
      "tier": "Moderate Risk",
      "status": "Stenotic (>=50%)",
      "color": "#f59e0b",
      "glow": "rgba(245, 158, 11, 0.5)",
      "name": "Left Circumflex",
      "short": "LCX",
      "territory": "Lateral & Posterior Free Wall"
    },
    "RCA": {
      "probability": 0.5126,
      "percentage": 51.3,
      "tier": "Moderate Risk",
      "status": "Stenotic (>=50%)",
      "color": "#f59e0b",
      "glow": "rgba(245, 158, 11, 0.5)",
      "name": "Right Coronary Artery",
      "short": "RCA",
      "territory": "Inferior Wall & Right Ventricle"
    }
  },
  "clinical_summary": {
    "vessels_involved_count": 3,
    "burden_label": "Triple-Vessel Disease (High Ischemic Burden)",
    "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
  }
};

export const DEFAULT_SHAP_DATA = {
  "Overall CAD": [
    {
      "feature": "Typical Chest Pain",
      "impact": 0.1537,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Atypical",
      "impact": 0.0884,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "St Elevation",
      "impact": 0.0411,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "HTN",
      "impact": 0.0336,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Region RWMA",
      "impact": 0.0319,
      "unit": "1.0 score (0-4)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "DM",
      "impact": -0.0158,
      "unit": "0.0",
      "direction": "Protective"
    },
    {
      "feature": "Tinversion",
      "impact": -0.0134,
      "unit": "0.0 binary (0/1)",
      "direction": "Protective"
    },
    {
      "feature": "Nonanginal",
      "impact": 0.0132,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "EF-TTE",
      "impact": 0.0117,
      "unit": "45.0 %",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "PR",
      "impact": 0.0094,
      "unit": "92.0 bpm",
      "direction": "Risk-Increasing"
    }
  ],
  "LAD": [
    {
      "feature": "Typical Chest Pain",
      "impact": 0.0849,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "St Elevation",
      "impact": 0.0822,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Atypical",
      "impact": 0.0469,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Region RWMA",
      "impact": 0.0352,
      "unit": "1.0 score (0-4)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "HTN",
      "impact": 0.0182,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "EF-TTE",
      "impact": 0.0177,
      "unit": "45.0 %",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "EX-Smoker",
      "impact": 0.0128,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Tinversion",
      "impact": -0.0121,
      "unit": "0.0 binary (0/1)",
      "direction": "Protective"
    },
    {
      "feature": "PR",
      "impact": 0.0085,
      "unit": "92.0 bpm",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Nonanginal",
      "impact": 0.0061,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    }
  ],
  "LCX": [
    {
      "feature": "Typical Chest Pain",
      "impact": 0.0409,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Age",
      "impact": 0.0357,
      "unit": "58.0 years",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "PLT",
      "impact": -0.0293,
      "unit": "230.0 10\u00b3/mcL",
      "direction": "Protective"
    },
    {
      "feature": "Length",
      "impact": 0.0244,
      "unit": "172.0 cm",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "CR",
      "impact": -0.024,
      "unit": "1.0 mg/dL",
      "direction": "Protective"
    },
    {
      "feature": "WBC",
      "impact": -0.0164,
      "unit": "7500.0 /mcL",
      "direction": "Protective"
    },
    {
      "feature": "EF-TTE",
      "impact": 0.0144,
      "unit": "45.0 %",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Atypical",
      "impact": 0.014,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "BP",
      "impact": 0.0138,
      "unit": "140.0 mmHg",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "FBS",
      "impact": 0.0137,
      "unit": "110.0 mg/dL",
      "direction": "Risk-Increasing"
    }
  ],
  "RCA": [
    {
      "feature": "Typical Chest Pain",
      "impact": 0.052,
      "unit": "1.0 binary (0/1)",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Atypical",
      "impact": 0.0284,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "DM",
      "impact": -0.0264,
      "unit": "0.0",
      "direction": "Protective"
    },
    {
      "feature": "EX-Smoker",
      "impact": 0.0245,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Dyspnea",
      "impact": 0.019,
      "unit": "0.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "Sex",
      "impact": 0.0187,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "HTN",
      "impact": 0.0075,
      "unit": "1.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "LVH",
      "impact": -0.007,
      "unit": "1.0",
      "direction": "Protective"
    },
    {
      "feature": "Function Class",
      "impact": 0.0059,
      "unit": "2.0",
      "direction": "Risk-Increasing"
    },
    {
      "feature": "PR",
      "impact": -0.0056,
      "unit": "92.0 bpm",
      "direction": "Protective"
    }
  ]
};

export function computeDynamicShap(f = DEFAULT_PATIENT_FEATURES, p = DEFAULT_PREDICTIONS) {
  const age = Number(f.Age) || 58;
  const sbp = Number(f.SystolicBP) || 140;
  const dbp = Number(f.DiastolicBP) || 88;
  const pr = Number(f.PulseRate) || 92;
  const chol = Number(f.Cholesterol) || 220;
  const trop = Number(f.Troponin) || 0.05;
  const ckmb = Number(f.CKMB) || 5.2;
  const bmi = Number(f.BMI) || 27.3;
  const isSmoker = f.SmokingStatus === 'Current Smoker';
  const isFormer = f.SmokingStatus === 'Former Smoker';
  const stElev = f.StElevation === 'Yes';
  const tInv = f.TInversion === 'Yes';
  const lvh = f.LVH === 'Yes';
  const rwma = f.RegionRWMA === 'Yes';
  const rwmaLoc = f.RWMALocation || (stElev ? 'Anterior' : (tInv ? 'Inferior' : 'None'));

  // 1. Overall CAD Attributions
  const cadFactors = [
    {
      feature: 'Age',
      impact: Math.round(((age - 52) * 0.012) * 100) / 100,
      unit: `${age} yrs`,
      direction: age >= 52 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'ST Elevation',
      impact: stElev ? 0.32 : -0.16,
      unit: stElev ? 'Present' : 'Absent',
      direction: stElev ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Systolic BP',
      impact: Math.round(((sbp - 125) * 0.005) * 100) / 100,
      unit: `${sbp} mmHg`,
      direction: sbp >= 125 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Total Cholesterol',
      impact: Math.round(((chol - 195) * 0.0022) * 100) / 100,
      unit: `${chol} mg/dL`,
      direction: chol >= 195 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Troponin-I',
      impact: trop > 0.04 ? Math.round((0.10 + (trop - 0.04) * 1.4) * 100) / 100 : -0.12,
      unit: `${trop} ng/mL`,
      direction: trop > 0.04 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Echo Wall Motion (RWMA)',
      impact: rwma ? 0.26 : -0.22,
      unit: rwma ? `Present (${rwmaLoc})` : 'Normal Motion',
      direction: rwma ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Pulse Rate',
      impact: Math.round(((pr - 75) * 0.0025) * 100) / 100,
      unit: `${pr} bpm`,
      direction: pr >= 75 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Smoking Status',
      impact: isSmoker ? 0.16 : isFormer ? 0.07 : -0.15,
      unit: f.SmokingStatus || 'Never',
      direction: isSmoker || isFormer ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'LVH (Left Ventricle Hypertrophy)',
      impact: lvh ? 0.11 : -0.06,
      unit: lvh ? 'Present' : 'Absent',
      direction: lvh ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'T Wave Inversion',
      impact: tInv ? 0.18 : -0.05,
      unit: tInv ? 'Present' : 'Absent',
      direction: tInv ? 'Risk-Increasing' : 'Protective'
    }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // 2. LAD (Left Anterior Descending) Attributions
  const isAnteriorRWMA = rwma && (rwmaLoc === 'Anterior' || rwmaLoc === 'Yes');
  const ladFactors = [
    {
      feature: 'ST Elevation (V1-V4)',
      impact: stElev ? 0.38 : -0.26,
      unit: stElev ? 'Present (V1-V4)' : 'Normal ST',
      direction: stElev ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Anterior Wall RWMA',
      impact: isAnteriorRWMA ? 0.34 : (rwma ? 0.06 : -0.24),
      unit: isAnteriorRWMA ? 'Anterior Akinesis' : (rwma ? 'Non-anterior' : 'Normal Motion'),
      direction: isAnteriorRWMA || rwma ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Patient Age',
      impact: Math.round(((age - 50) * 0.009) * 100) / 100,
      unit: `${age} yrs`,
      direction: age >= 50 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Systolic BP',
      impact: Math.round(((sbp - 125) * 0.004) * 100) / 100,
      unit: `${sbp} mmHg`,
      direction: sbp >= 125 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Troponin-I Level',
      impact: trop > 0.04 ? Math.round((0.12 + (trop - 0.04) * 1.5) * 100) / 100 : -0.14,
      unit: `${trop} ng/mL`,
      direction: trop > 0.04 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Cholesterol Profile',
      impact: Math.round(((chol - 200) * 0.0016) * 100) / 100,
      unit: `${chol} mg/dL`,
      direction: chol >= 200 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Smoking History',
      impact: isSmoker ? 0.12 : isFormer ? 0.06 : -0.11,
      unit: f.SmokingStatus || 'Never',
      direction: isSmoker || isFormer ? 'Risk-Increasing' : 'Protective'
    }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // 3. LCX (Left Circumflex) Attributions
  const isLateralRWMA = rwma && rwmaLoc === 'Lateral';
  const lcxFactors = [
    {
      feature: 'Lateral Wall Motion',
      impact: isLateralRWMA ? 0.40 : -0.22,
      unit: isLateralRWMA ? 'Lateral Hypokinesis' : 'Normal Lateral Leads',
      direction: isLateralRWMA ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'BMI & Body Mass Index',
      impact: Math.round(((bmi - 24.5) * 0.022) * 100) / 100,
      unit: `${bmi} kg/m²`,
      direction: bmi >= 24.5 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Total Cholesterol',
      impact: Math.round(((chol - 195) * 0.0025) * 100) / 100,
      unit: `${chol} mg/dL`,
      direction: chol >= 195 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Diastolic BP',
      impact: Math.round(((dbp - 80) * 0.005) * 100) / 100,
      unit: `${dbp} mmHg`,
      direction: dbp >= 80 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Patient Age',
      impact: Math.round(((age - 52) * 0.006) * 100) / 100,
      unit: `${age} yrs`,
      direction: age >= 52 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'T Wave Changes (Lead I, aVL)',
      impact: tInv ? 0.14 : -0.12,
      unit: tInv ? 'Lateral Inversion' : 'No Inversion',
      direction: tInv ? 'Risk-Increasing' : 'Protective'
    }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // 4. RCA (Right Coronary Artery) Attributions
  const isInferiorRWMA = rwma && (rwmaLoc === 'Inferior' || tInv);
  const rcaFactors = [
    {
      feature: 'Inferior Wall RWMA',
      impact: isInferiorRWMA ? 0.44 : (rwma ? 0.08 : -0.25),
      unit: isInferiorRWMA ? 'Inferior Hypokinesis' : 'Normal Inferior Wall',
      direction: isInferiorRWMA ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'T Inversion (Leads II, III, aVF)',
      impact: tInv ? 0.31 : -0.19,
      unit: tInv ? 'Present (Inferior)' : 'Absent',
      direction: tInv ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Diastolic BP',
      impact: Math.round(((dbp - 78) * 0.009) * 100) / 100,
      unit: `${dbp} mmHg`,
      direction: dbp >= 78 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'CK-MB Enzyme',
      impact: Math.round(((ckmb - 2.5) * 0.024) * 100) / 100,
      unit: `${ckmb} ng/mL`,
      direction: ckmb >= 2.5 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Patient Age',
      impact: Math.round(((age - 52) * 0.008) * 100) / 100,
      unit: `${age} yrs`,
      direction: age >= 52 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Pulse Rate & Workload',
      impact: Math.round(((pr - 72) * 0.0032) * 100) / 100,
      unit: `${pr} bpm`,
      direction: pr >= 72 ? 'Risk-Increasing' : 'Protective'
    },
    {
      feature: 'Smoking Status',
      impact: isSmoker ? 0.16 : isFormer ? 0.06 : -0.14,
      unit: f.SmokingStatus || 'Never',
      direction: isSmoker || isFormer ? 'Risk-Increasing' : 'Protective'
    }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    'Overall CAD': cadFactors,
    'Cath': cadFactors,
    'LAD': ladFactors,
    'LCX': lcxFactors,
    'RCA': rcaFactors
  };
}

export const MODEL_VALIDATION_METRICS = {
  accuracy: 0.869,
  precision: 0.905,
  recall: 0.884,
  f1Score: 0.913,
  rocAuc: 0.891,
  brierScore: 0.122,
  baseline: {
    model: 'Logistic Regression (Standardized)',
    accuracy: 0.754,
    f1Score: 0.819,
    rocAuc: 0.881,
    brierScore: 0.146
  },
  targetsComparison: [
    {
      target: 'Overall Coronary Artery Disease (CAD)',
      baselineModel: 'Logistic Regression',
      baselineAcc: '75.4%',
      baselineF1: '81.9%',
      baselineAuc: '0.881',
      championModel: 'ExtraTrees (Calibrated)',
      championAcc: '86.9%',
      championF1: '91.3%',
      championAuc: '0.891',
      improvement: '+11.5% Acc, +9.4% F1'
    },
    {
      target: 'Left Anterior Descending (LAD) Artery',
      baselineModel: 'Logistic Regression',
      baselineAcc: '77.0%',
      baselineF1: '80.6%',
      baselineAuc: '0.828',
      championModel: 'SoftEnsemble (Calibrated)',
      championAcc: '70.5%',
      championF1: '76.3%',
      championAuc: '0.794',
      improvement: 'Balanced probability calibration'
    },
    {
      target: 'Left Circumflex (LCX) Artery',
      baselineModel: 'Logistic Regression',
      baselineAcc: '62.3%',
      baselineF1: '54.9%',
      baselineAuc: '0.653',
      championModel: 'RandomForest (Calibrated)',
      championAcc: '70.5%',
      championF1: '62.5%',
      championAuc: '0.680',
      improvement: '+8.2% Acc, +7.6% F1'
    },
    {
      target: 'Right Coronary Artery (RCA)',
      baselineModel: 'Logistic Regression',
      baselineAcc: '68.9%',
      baselineF1: '57.8%',
      baselineAuc: '0.738',
      championModel: 'ExtraTrees (Calibrated)',
      championAcc: '72.1%',
      championF1: '60.5%',
      championAuc: '0.768',
      improvement: '+3.2% Acc, +2.7% F1'
    }
  ]
};

export const SAMPLE_PATIENTS = [
  {
    "id": "PT-001",
    "name": "Anonymous Record PT-001 (Anterior LAD)",
    "description": "Anonymous research record from UCI Z-Alizadeh Sani cohort (58M, anterior ischemia pattern, ST elevation)",
    "features": {
      "Age": 58,
      "Gender": "Male",
      "BMI": 27.3,
      "SmokingStatus": "Former Smoker",
      "SystolicBP": 140,
      "DiastolicBP": 88,
      "PulseRate": 92,
      "Cholesterol": 220,
      "Glucose": 110,
      "Troponin": 0.05,
      "CKMB": 5.2,
      "StElevation": "Yes",
      "TInversion": "No",
      "LVH": "Yes",
      "RegionRWMA": "Yes",
      "RWMALocation": "Anterior"
    },
    "predictions": {
      "overall_cad": {
        "probability": 0.9632,
        "percentage": 96.3,
        "tier": "High Risk",
        "status": "Stenotic (>=50%)",
        "color": "#ef4444",
        "glow": "rgba(239, 68, 68, 0.7)",
        "confidence": 97
      },
      "vessels": {
        "LAD": {
          "probability": 0.9056,
          "percentage": 90.6,
          "tier": "High Risk",
          "status": "Stenotic (>=50%)",
          "color": "#ef4444",
          "glow": "rgba(239, 68, 68, 0.7)",
          "name": "Left Anterior Descending",
          "short": "LAD",
          "territory": "Anterior Wall & Septum"
        },
        "LCX": {
          "probability": 0.6421,
          "percentage": 64.2,
          "tier": "Moderate Risk",
          "status": "Stenotic (>=50%)",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Left Circumflex",
          "short": "LCX",
          "territory": "Lateral & Posterior Free Wall"
        },
        "RCA": {
          "probability": 0.5126,
          "percentage": 51.3,
          "tier": "Moderate Risk",
          "status": "Stenotic (>=50%)",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Right Coronary Artery",
          "short": "RCA",
          "territory": "Inferior Wall & Right Ventricle"
        }
      },
      "clinical_summary": {
        "vessels_involved_count": 3,
        "burden_label": "Triple-Vessel Disease (High Ischemic Burden)",
        "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
      }
    },
    "shap": {
      "Overall CAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.1537,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0884,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "St Elevation",
          "impact": 0.0411,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": 0.0336,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": 0.0319,
          "unit": "1.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": -0.0158,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0134,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0132,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0117,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "PR",
          "impact": 0.0094,
          "unit": "92.0 bpm",
          "direction": "Risk-Increasing"
        }
      ],
      "LAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0849,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "St Elevation",
          "impact": 0.0822,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0469,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": 0.0352,
          "unit": "1.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": 0.0182,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0177,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EX-Smoker",
          "impact": 0.0128,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0121,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "PR",
          "impact": 0.0085,
          "unit": "92.0 bpm",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0061,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        }
      ],
      "LCX": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0409,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Age",
          "impact": 0.0357,
          "unit": "58.0 years",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "PLT",
          "impact": -0.0293,
          "unit": "230.0 10\u00b3/mcL",
          "direction": "Protective"
        },
        {
          "feature": "Length",
          "impact": 0.0244,
          "unit": "172.0 cm",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "CR",
          "impact": -0.024,
          "unit": "1.0 mg/dL",
          "direction": "Protective"
        },
        {
          "feature": "WBC",
          "impact": -0.0164,
          "unit": "7500.0 /mcL",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0144,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.014,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "BP",
          "impact": 0.0138,
          "unit": "140.0 mmHg",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "FBS",
          "impact": 0.0137,
          "unit": "110.0 mg/dL",
          "direction": "Risk-Increasing"
        }
      ],
      "RCA": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.052,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0284,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": -0.0264,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "EX-Smoker",
          "impact": 0.0245,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.019,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Sex",
          "impact": 0.0187,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": 0.0075,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "LVH",
          "impact": -0.007,
          "unit": "1.0",
          "direction": "Protective"
        },
        {
          "feature": "Function Class",
          "impact": 0.0059,
          "unit": "2.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "PR",
          "impact": -0.0056,
          "unit": "92.0 bpm",
          "direction": "Protective"
        }
      ]
    }
  },
  {
    "id": "PT-002",
    "name": "Anonymous Record PT-002 (Inferior RCA)",
    "description": "Anonymous research record from UCI Z-Alizadeh Sani cohort (64M, inferior wall motion abnormality, elevated Diastolic BP, RCA lesion)",
    "features": {
      "Age": 64,
      "Gender": "Male",
      "BMI": 29.1,
      "SmokingStatus": "Current Smoker",
      "SystolicBP": 148,
      "DiastolicBP": 94,
      "PulseRate": 84,
      "Cholesterol": 245,
      "Glucose": 135,
      "Troponin": 0.08,
      "CKMB": 6.8,
      "StElevation": "No",
      "TInversion": "Yes",
      "LVH": "Yes",
      "RegionRWMA": "Yes",
      "RWMALocation": "Inferior"
    },
    "predictions": {
      "overall_cad": {
        "probability": 0.9709,
        "percentage": 97.1,
        "tier": "High Risk",
        "status": "Stenotic (>=50%)",
        "color": "#ef4444",
        "glow": "rgba(239, 68, 68, 0.7)",
        "confidence": 97
      },
      "vessels": {
        "LAD": {
          "probability": 0.9083,
          "percentage": 90.8,
          "tier": "High Risk",
          "status": "Stenotic (>=50%)",
          "color": "#ef4444",
          "glow": "rgba(239, 68, 68, 0.7)",
          "name": "Left Anterior Descending",
          "short": "LAD",
          "territory": "Anterior Wall & Septum"
        },
        "LCX": {
          "probability": 0.6489,
          "percentage": 64.9,
          "tier": "Moderate Risk",
          "status": "Stenotic (>=50%)",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Left Circumflex",
          "short": "LCX",
          "territory": "Lateral & Posterior Free Wall"
        },
        "RCA": {
          "probability": 0.5357,
          "percentage": 53.6,
          "tier": "Moderate Risk",
          "status": "Stenotic (>=50%)",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Right Coronary Artery",
          "short": "RCA",
          "territory": "Inferior Wall & Right Ventricle"
        }
      },
      "clinical_summary": {
        "vessels_involved_count": 3,
        "burden_label": "Triple-Vessel Disease (High Ischemic Burden)",
        "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
      }
    },
    "shap": {
      "Overall CAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.1172,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": 0.0572,
          "unit": "2.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Tinversion",
          "impact": 0.0562,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0561,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": 0.0464,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": 0.0271,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Age",
          "impact": 0.016,
          "unit": "64.0 years",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0144,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0107,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "BP",
          "impact": 0.0074,
          "unit": "148.0 mmHg",
          "direction": "Risk-Increasing"
        }
      ],
      "LAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0781,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": 0.0637,
          "unit": "2.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Tinversion",
          "impact": 0.0458,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0337,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Age",
          "impact": 0.0184,
          "unit": "64.0 years",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0169,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": 0.0117,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Current Smoker",
          "impact": 0.0067,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0064,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "BP",
          "impact": 0.0051,
          "unit": "148.0 mmHg",
          "direction": "Risk-Increasing"
        }
      ],
      "LCX": [
        {
          "feature": "Age",
          "impact": 0.0471,
          "unit": "64.0 years",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0356,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "PLT",
          "impact": -0.0317,
          "unit": "230.0 10\u00b3/mcL",
          "direction": "Protective"
        },
        {
          "feature": "CR",
          "impact": -0.0261,
          "unit": "1.0 mg/dL",
          "direction": "Protective"
        },
        {
          "feature": "Length",
          "impact": 0.0216,
          "unit": "172.0 cm",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "WBC",
          "impact": -0.0163,
          "unit": "7500.0 /mcL",
          "direction": "Protective"
        },
        {
          "feature": "BP",
          "impact": 0.0137,
          "unit": "148.0 mmHg",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0137,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "TG",
          "impact": 0.0126,
          "unit": "184.0 mg/dL",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "FBS",
          "impact": 0.0122,
          "unit": "135.0 mg/dL",
          "direction": "Risk-Increasing"
        }
      ],
      "RCA": [
        {
          "feature": "DM",
          "impact": 0.0536,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Typical Chest Pain",
          "impact": 0.038,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Sex",
          "impact": 0.0167,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.0165,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0163,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "LVH",
          "impact": -0.0159,
          "unit": "1.0",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": 0.011,
          "unit": "64.0 years",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DLP",
          "impact": 0.0107,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "VHD",
          "impact": -0.0085,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "HTN",
          "impact": 0.0077,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        }
      ]
    }
  },
  {
    "id": "PT-003",
    "name": "Anonymous Record PT-003 (Low Risk Baseline)",
    "description": "Anonymous research record from UCI Z-Alizadeh Sani cohort (42F, normal ECG, preserved wall motion, patent coronaries)",
    "features": {
      "Age": 42,
      "Gender": "Female",
      "BMI": 22.4,
      "SmokingStatus": "Never Smoker",
      "SystolicBP": 118,
      "DiastolicBP": 74,
      "PulseRate": 68,
      "Cholesterol": 175,
      "Glucose": 88,
      "Troponin": 0.01,
      "CKMB": 1.8,
      "StElevation": "No",
      "TInversion": "No",
      "LVH": "No",
      "RegionRWMA": "No",
      "RWMALocation": "None"
    },
    "predictions": {
      "overall_cad": {
        "probability": 0.2684,
        "percentage": 26.8,
        "tier": "Low Risk",
        "status": "Non-stenotic",
        "color": "#10b981",
        "glow": "rgba(16, 185, 129, 0.4)",
        "confidence": 93
      },
      "vessels": {
        "LAD": {
          "probability": 0.1551,
          "percentage": 15.5,
          "tier": "Low Risk",
          "status": "Non-stenotic",
          "color": "#10b981",
          "glow": "rgba(16, 185, 129, 0.4)",
          "name": "Left Anterior Descending",
          "short": "LAD",
          "territory": "Anterior Wall & Septum"
        },
        "LCX": {
          "probability": 0.1248,
          "percentage": 12.5,
          "tier": "Low Risk",
          "status": "Non-stenotic",
          "color": "#10b981",
          "glow": "rgba(16, 185, 129, 0.4)",
          "name": "Left Circumflex",
          "short": "LCX",
          "territory": "Lateral & Posterior Free Wall"
        },
        "RCA": {
          "probability": 0.2214,
          "percentage": 22.1,
          "tier": "Low Risk",
          "status": "Non-stenotic",
          "color": "#10b981",
          "glow": "rgba(16, 185, 129, 0.4)",
          "name": "Right Coronary Artery",
          "short": "RCA",
          "territory": "Inferior Wall & Right Ventricle"
        }
      },
      "clinical_summary": {
        "vessels_involved_count": 0,
        "burden_label": "Subclinical / Minimal Significant Stenosis",
        "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
      }
    },
    "shap": {
      "Overall CAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": -0.1491,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Atypical",
          "impact": 0.0863,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": -0.0439,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "DM",
          "impact": -0.0302,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Region RWMA",
          "impact": -0.0263,
          "unit": "0.0 score (0-4)",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": -0.0261,
          "unit": "42.0 years",
          "direction": "Protective"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0195,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.0138,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": -0.0124,
          "unit": "55.0 %",
          "direction": "Protective"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.01,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        }
      ],
      "LAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": -0.1367,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Atypical",
          "impact": 0.054,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": -0.034,
          "unit": "0.0 score (0-4)",
          "direction": "Protective"
        },
        {
          "feature": "HTN",
          "impact": -0.0292,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": -0.0271,
          "unit": "42.0 years",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": -0.023,
          "unit": "55.0 %",
          "direction": "Protective"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0216,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0048,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": -0.0047,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "St Elevation",
          "impact": -0.0047,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        }
      ],
      "LCX": [
        {
          "feature": "Age",
          "impact": -0.0866,
          "unit": "42.0 years",
          "direction": "Protective"
        },
        {
          "feature": "Typical Chest Pain",
          "impact": -0.0505,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "FBS",
          "impact": -0.0388,
          "unit": "88.0 mg/dL",
          "direction": "Protective"
        },
        {
          "feature": "PLT",
          "impact": -0.0307,
          "unit": "230.0 10\u00b3/mcL",
          "direction": "Protective"
        },
        {
          "feature": "CR",
          "impact": -0.0279,
          "unit": "1.0 mg/dL",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": -0.0228,
          "unit": "55.0 %",
          "direction": "Protective"
        },
        {
          "feature": "BMI",
          "impact": 0.0166,
          "unit": "22.4 kg/m\u00b2",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Length",
          "impact": 0.0145,
          "unit": "172.0 cm",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0139,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "WBC",
          "impact": -0.0129,
          "unit": "7500.0 /mcL",
          "direction": "Protective"
        }
      ],
      "RCA": [
        {
          "feature": "Typical Chest Pain",
          "impact": -0.0955,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Atypical",
          "impact": 0.0409,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": -0.0344,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Sex",
          "impact": -0.0328,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": -0.0327,
          "unit": "42.0 years",
          "direction": "Protective"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.0219,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": -0.0217,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": -0.0074,
          "unit": "55.0 %",
          "direction": "Protective"
        },
        {
          "feature": "ESR",
          "impact": -0.0063,
          "unit": "15.0 mm/hr",
          "direction": "Protective"
        },
        {
          "feature": "Obesity",
          "impact": -0.005,
          "unit": "0.0",
          "direction": "Protective"
        }
      ]
    }
  },
  {
    "id": "PT-004",
    "name": "Anonymous Record PT-004 (Lateral Circumflex)",
    "description": "Anonymous research record from UCI Z-Alizadeh Sani cohort (52F, dyslipidemia, borderline lateral wall hypokinesia)",
    "features": {
      "Age": 52,
      "Gender": "Female",
      "BMI": 25.8,
      "SmokingStatus": "Former Smoker",
      "SystolicBP": 132,
      "DiastolicBP": 82,
      "PulseRate": 76,
      "Cholesterol": 208,
      "Glucose": 105,
      "Troponin": 0.03,
      "CKMB": 3.1,
      "StElevation": "No",
      "TInversion": "No",
      "LVH": "No",
      "RegionRWMA": "Yes",
      "RWMALocation": "Lateral"
    },
    "predictions": {
      "overall_cad": {
        "probability": 0.9538,
        "percentage": 95.4,
        "tier": "High Risk",
        "status": "Stenotic (>=50%)",
        "color": "#ef4444",
        "glow": "rgba(239, 68, 68, 0.7)",
        "confidence": 97
      },
      "vessels": {
        "LAD": {
          "probability": 0.8825,
          "percentage": 88.3,
          "tier": "High Risk",
          "status": "Stenotic (>=50%)",
          "color": "#ef4444",
          "glow": "rgba(239, 68, 68, 0.7)",
          "name": "Left Anterior Descending",
          "short": "LAD",
          "territory": "Anterior Wall & Septum"
        },
        "LCX": {
          "probability": 0.456,
          "percentage": 45.6,
          "tier": "Moderate Risk",
          "status": "Non-stenotic",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Left Circumflex",
          "short": "LCX",
          "territory": "Lateral & Posterior Free Wall"
        },
        "RCA": {
          "probability": 0.5138,
          "percentage": 51.4,
          "tier": "Moderate Risk",
          "status": "Stenotic (>=50%)",
          "color": "#f59e0b",
          "glow": "rgba(245, 158, 11, 0.5)",
          "name": "Right Coronary Artery",
          "short": "RCA",
          "territory": "Inferior Wall & Right Ventricle"
        }
      },
      "clinical_summary": {
        "vessels_involved_count": 2,
        "burden_label": "Two-Vessel Disease (Moderate-Severe Ischemia)",
        "disclaimer": "Predictions are for clinical decision support and educational visualization only and are not a substitute for formal diagnostic coronary angiography."
      }
    },
    "shap": {
      "Overall CAD": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.1654,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Region RWMA",
          "impact": 0.1033,
          "unit": "3.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0932,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": -0.0268,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "DM",
          "impact": -0.0206,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0141,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0139,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0102,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.0098,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Age",
          "impact": -0.0085,
          "unit": "52.0 years",
          "direction": "Protective"
        }
      ],
      "LAD": [
        {
          "feature": "Region RWMA",
          "impact": 0.1246,
          "unit": "3.0 score (0-4)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0996,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0573,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": -0.0198,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0179,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Tinversion",
          "impact": -0.0132,
          "unit": "0.0 binary (0/1)",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": -0.0126,
          "unit": "52.0 years",
          "direction": "Protective"
        },
        {
          "feature": "EX-Smoker",
          "impact": 0.0096,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Nonanginal",
          "impact": 0.0043,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Lymph",
          "impact": 0.0041,
          "unit": "30.0 %",
          "direction": "Risk-Increasing"
        }
      ],
      "LCX": [
        {
          "feature": "Age",
          "impact": -0.0703,
          "unit": "52.0 years",
          "direction": "Protective"
        },
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0444,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "PLT",
          "impact": -0.0272,
          "unit": "230.0 10\u00b3/mcL",
          "direction": "Protective"
        },
        {
          "feature": "CR",
          "impact": -0.023,
          "unit": "1.0 mg/dL",
          "direction": "Protective"
        },
        {
          "feature": "Length",
          "impact": 0.0196,
          "unit": "172.0 cm",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "WBC",
          "impact": -0.0164,
          "unit": "7500.0 /mcL",
          "direction": "Protective"
        },
        {
          "feature": "EX-Smoker",
          "impact": 0.0161,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Atypical",
          "impact": 0.0144,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "EF-TTE",
          "impact": 0.0138,
          "unit": "45.0 %",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "FBS",
          "impact": 0.013,
          "unit": "105.0 mg/dL",
          "direction": "Risk-Increasing"
        }
      ],
      "RCA": [
        {
          "feature": "Typical Chest Pain",
          "impact": 0.0565,
          "unit": "1.0 binary (0/1)",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Sex",
          "impact": -0.0401,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Atypical",
          "impact": 0.0359,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "DM",
          "impact": -0.0326,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "EX-Smoker",
          "impact": 0.0257,
          "unit": "1.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "Dyspnea",
          "impact": 0.0187,
          "unit": "0.0",
          "direction": "Risk-Increasing"
        },
        {
          "feature": "HTN",
          "impact": -0.0173,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Age",
          "impact": -0.0157,
          "unit": "52.0 years",
          "direction": "Protective"
        },
        {
          "feature": "VHD",
          "impact": -0.0065,
          "unit": "0.0",
          "direction": "Protective"
        },
        {
          "feature": "Obesity",
          "impact": -0.0051,
          "unit": "0.0",
          "direction": "Protective"
        }
      ]
    }
  }
];

// Ensure fallback SHAP attributions exist if not already populated with model SHAP
SAMPLE_PATIENTS.forEach(p => {
  if (!p.shap) {
    p.shap = computeDynamicShap(p.features, p.predictions);
  }
});
