import sys, os, json
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from main import run_model_inference, explain_cardiac_risk, PredictionRequest

patients = [
  {
    'id': 'PT-001',
    'name': 'Anonymous Record PT-001 (Anterior LAD)',
    'description': 'Anonymous research record from UCI Z-Alizadeh Sani cohort (58M, anterior ischemia pattern, ST elevation)',
    'features': {
      'Age': 58, 'Gender': 'Male', 'BMI': 27.3, 'SmokingStatus': 'Former Smoker',
      'SystolicBP': 140, 'DiastolicBP': 88, 'PulseRate': 92, 'Cholesterol': 220,
      'Glucose': 110, 'Troponin': 0.05, 'CKMB': 5.2, 'StElevation': 'Yes',
      'TInversion': 'No', 'LVH': 'Yes', 'RegionRWMA': 'Yes', 'RWMALocation': 'Anterior'
    }
  },
  {
    'id': 'PT-002',
    'name': 'Anonymous Record PT-002 (Inferior RCA)',
    'description': 'Anonymous research record from UCI Z-Alizadeh Sani cohort (64M, inferior wall motion abnormality, elevated Diastolic BP, RCA lesion)',
    'features': {
      'Age': 64, 'Gender': 'Male', 'BMI': 29.1, 'SmokingStatus': 'Current Smoker',
      'SystolicBP': 148, 'DiastolicBP': 94, 'PulseRate': 84, 'Cholesterol': 245,
      'Glucose': 135, 'Troponin': 0.08, 'CKMB': 6.8, 'StElevation': 'No',
      'TInversion': 'Yes', 'LVH': 'Yes', 'RegionRWMA': 'Yes', 'RWMALocation': 'Inferior'
    }
  },
  {
    'id': 'PT-003',
    'name': 'Anonymous Record PT-003 (Low Risk Baseline)',
    'description': 'Anonymous research record from UCI Z-Alizadeh Sani cohort (42F, normal ECG, preserved wall motion, patent coronaries)',
    'features': {
      'Age': 42, 'Gender': 'Female', 'BMI': 22.4, 'SmokingStatus': 'Never Smoker',
      'SystolicBP': 118, 'DiastolicBP': 74, 'PulseRate': 68, 'Cholesterol': 175,
      'Glucose': 88, 'Troponin': 0.01, 'CKMB': 1.8, 'StElevation': 'No',
      'TInversion': 'No', 'LVH': 'No', 'RegionRWMA': 'No', 'RWMALocation': 'None'
    }
  },
  {
    'id': 'PT-004',
    'name': 'Anonymous Record PT-004 (Lateral Circumflex)',
    'description': 'Anonymous research record from UCI Z-Alizadeh Sani cohort (52F, dyslipidemia, borderline lateral wall hypokinesia)',
    'features': {
      'Age': 52, 'Gender': 'Female', 'BMI': 25.8, 'SmokingStatus': 'Former Smoker',
      'SystolicBP': 132, 'DiastolicBP': 82, 'PulseRate': 76, 'Cholesterol': 208,
      'Glucose': 105, 'Troponin': 0.03, 'CKMB': 3.1, 'StElevation': 'No',
      'TInversion': 'No', 'LVH': 'No', 'RegionRWMA': 'Yes', 'RWMALocation': 'Lateral'
    }
  }
]

def format_api(f):
    age = f['Age']
    sysBp = f['SystolicBP']
    diaBp = f['DiastolicBP']
    pr = f['PulseRate']
    chol = f['Cholesterol']
    glu = f['Glucose']
    bmi = f['BMI']
    isMale = f['Gender'] == 'Male'
    isSmoker = f['SmokingStatus'] == 'Current Smoker'
    isFormer = f['SmokingStatus'] == 'Former Smoker'
    isStElev = 1 if f['StElevation'] == 'Yes' else 0
    isTInv = 1 if f['TInversion'] == 'Yes' else 0
    isLvh = 'Y' if f['LVH'] == 'Yes' else 'N'
    rwma = f['RegionRWMA'] == 'Yes'
    rwmaLoc = f['RWMALocation']
    rwmaScore = 1 if rwmaLoc == 'Anterior' else (2 if rwmaLoc == 'Inferior' else (3 if rwmaLoc == 'Lateral' else (4 if rwma else 0)))
    
    htn = 1 if (sysBp >= 140 or diaBp >= 90) else 0
    dm = 1 if glu >= 126 else 0
    dlp = 'Y' if chol >= 200 else 'N'
    obesity = 'Y' if bmi >= 30 else 'N'
    ldl = round(chol * 0.60)
    tg = round(chol * 0.75)
    hdl = 40 if isMale else 48
    
    hasTypicalCp = 1 if (isStElev or rwma or (sysBp >= 145 and age >= 55)) else 0
    exertionalCp = 'Y' if (isStElev or rwma or isSmoker) else 'N'
    funcClass = 2 if (isStElev or rwma) else 1
    
    return {
        'Age': age, 'Weight': round(bmi * (1.72**2)), 'Length': 172, 'Sex': 'Male' if isMale else 'Fmale',
        'BMI': bmi, 'DM': dm, 'HTN': htn, 'Current Smoker': 1 if isSmoker else 0, 'EX-Smoker': 1 if isFormer else 0,
        'FH': 0, 'Obesity': obesity, 'CRF': 'N', 'CVA': 'N', 'Airway disease': 'N', 'Thyroid Disease': 'N',
        'CHF': 'N', 'DLP': dlp, 'BP': sysBp, 'PR': pr, 'Edema': 0, 'Weak Peripheral Pulse': 'N',
        'Lung rales': 'N', 'Systolic Murmur': 'N', 'Diastolic Murmur': 'N', 'Typical Chest Pain': hasTypicalCp,
        'Dyspnea': 'N', 'Function Class': funcClass, 'Atypical': 'N', 'Nonanginal': 'N', 'Exertional CP': exertionalCp,
        'LowTH Ang': 'N', 'Q Wave': 0, 'St Elevation': isStElev, 'St Depression': 0, 'Tinversion': isTInv,
        'LVH': isLvh, 'Poor R Progression': 'N', 'BBB': 'N', 'FBS': glu, 'CR': 1.0, 'TG': tg, 'LDL': ldl,
        'HDL': hdl, 'BUN': 15, 'ESR': 15, 'HB': 14.0, 'K': 4.2, 'Na': 140, 'WBC': 7500, 'Lymph': 30,
        'Neut': 62, 'PLT': 230, 'EF-TTE': 45 if rwma else 55, 'Region RWMA': rwmaScore, 'VHD': 'N'
    }

if __name__ == '__main__':
    final_patients = []
    for p in patients:
        fmt = format_api(p['features'])
        pred = run_model_inference(fmt)
        exp = explain_cardiac_risk(PredictionRequest(features=fmt))
    
        def fmt_drivers(target_name):
            td = exp['explanations'][target_name]['top_drivers']
            return [{'feature': d['feature'], 'impact': d['impact'], 'unit': f"{d['value']} {d.get('unit','')}".strip(), 'direction': d['direction']} for d in td]
            
        p_data = {
            'id': p['id'],
            'name': p['name'],
            'description': p['description'],
            'features': p['features'],
            'predictions': pred,
            'shap': {
                'Overall CAD': fmt_drivers('Cath'),
                'LAD': fmt_drivers('LAD'),
                'LCX': fmt_drivers('LCX'),
                'RCA': fmt_drivers('RCA')
            }
        }
        final_patients.append(p_data)

    out_file = os.path.join(os.path.dirname(__file__), '..', 'scratch_final_patients.json')
    with open(out_file, 'w') as f:
        json.dump(final_patients, f, indent=2)

    print('Generated clean matching patient cohort:')
    for p in final_patients:
        cad = p['predictions']['overall_cad']['probability']
        lad = p['predictions']['vessels']['LAD']['probability']
        lcx = p['predictions']['vessels']['LCX']['probability']
        rca = p['predictions']['vessels']['RCA']['probability']
        print(f"{p['id']}: CAD={cad:.4f} ({p['predictions']['overall_cad']['tier']}), LAD={lad:.4f}, LCX={lcx:.4f}, RCA={rca:.4f}")

