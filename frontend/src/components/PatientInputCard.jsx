import React from 'react';
import { 
  User, 
  Play, 
  ChevronDown, 
  Activity, 
  ActivitySquare,
  Check
} from 'lucide-react';
import { SAMPLE_PATIENTS, getRiskLevel } from '../data/clinicalData';

export const CLINICAL_LIMITS = {
  Age: { min: 18, max: 105, default: 58, unit: 'yrs', rangeStr: '18–105 yrs' },
  SystolicBP: { min: 70, max: 240, default: 140, unit: 'mmHg', rangeStr: '70–240 mmHg' },
  DiastolicBP: { min: 40, max: 140, default: 88, unit: 'mmHg', rangeStr: '40–140 mmHg' },
  PulseRate: { min: 35, max: 220, default: 92, unit: 'bpm', rangeStr: '35–220 bpm' },
  Cholesterol: { min: 80, max: 550, default: 220, unit: 'mg/dL', rangeStr: '80–550 mg/dL' },
  Troponin: { min: 0.0, max: 25.0, default: 0.05, step: 0.01, unit: 'ng/mL', rangeStr: '0.0–25.0' },
  CKMB: { min: 0.1, max: 150.0, default: 5.2, step: 0.1, unit: 'ng/mL', rangeStr: '0.1–150' }
};

export default function PatientInputCard({
  features,
  setFeatures,
  inputMode,
  setInputMode,
  selectedSampleId,
  setSelectedSampleId,
  onSelectSample,
  onRunPrediction,
  isPredicting
}) {

  const handleInputChange = (field, rawVal) => {
    if (inputMode === 'sample') {
      setInputMode('manual');
    }
    const limits = CLINICAL_LIMITS[field];
    if (limits) {
      if (rawVal === '') {
        setFeatures(prev => ({ ...prev, [field]: '' }));
        return;
      }
      let num = Number(rawVal);
      // Strictly prevent negative inputs immediately
      if (num < 0) num = limits.min;
      setFeatures(prev => ({
        ...prev,
        [field]: num
      }));
    } else {
      setFeatures(prev => ({
        ...prev,
        [field]: rawVal
      }));
    }
  };

  const handleInputBlur = (field) => {
    const limits = CLINICAL_LIMITS[field];
    if (limits) {
      setFeatures(prev => {
        let val = Number(prev[field]);
        if (isNaN(val) || prev[field] === '' || val < limits.min) {
          val = limits.min;
        } else if (val > limits.max) {
          val = limits.max;
        }
        return {
          ...prev,
          [field]: val
        };
      });
    }
  };

  // Prevent entering negative sign '-' or exponential 'e' in numeric inputs
  const handleKeyDown = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleSelectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    if (onSelectSample) {
      onSelectSample(sampleId);
    } else {
      const sample = SAMPLE_PATIENTS.find(p => p.id === sampleId);
      if (sample) {
        setFeatures(sample.features);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-5 transition-all">
      
      {/* Card Header with Segmented Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-none">Patient Clinical Input</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Demographics, vitals &amp; laboratory markers</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Synced
          </span>
        </div>

        {/* Segmented Switch: Manual Input | Sample Patient */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              inputMode === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manual Input
          </button>
          <button
            type="button"
            onClick={() => setInputMode('sample')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              inputMode === 'sample'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sample Patient
          </button>
        </div>
      </div>

      {/* SAMPLE PATIENT SELECTOR */}
      {inputMode === 'sample' && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Select Sample Cohort Profile
            </span>
            <span className="text-[10px] text-blue-600 font-semibold font-mono">
              {selectedSampleId} Active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {SAMPLE_PATIENTS.map((p) => {
              const isSelected = selectedSampleId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSample(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 ring-1 ring-blue-500 text-slate-900 shadow-2xs'
                      : 'bg-slate-50/80 border-slate-200/90 hover:bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10.5px] font-mono font-bold text-blue-600">{p.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      p.predictions.overall_cad.tier === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.predictions.overall_cad.tier}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {p.name.replace('Sample Patient ', 'Patient ')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {p.features.Age}y {p.features.Gender} &bull; BP {p.features.SystolicBP}/{p.features.DiastolicBP} mmHg
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* INPUT FORM SECTIONS */}
      <div className="mt-3 space-y-3">
        
        {/* 1. Demographics */}
        <div>
          <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
            Demographics
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Age (years)</label>
                <span className="text-[9px] font-mono text-slate-400">18–105</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.Age.min}
                max={CLINICAL_LIMITS.Age.max}
                value={features.Age}
                onChange={(e) => handleInputChange('Age', e.target.value)}
                onBlur={() => handleInputBlur('Age')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <label className="text-[10px] text-slate-500 block leading-tight">Gender</label>
              <select
                value={features.Gender}
                onChange={(e) => handleInputChange('Gender', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Clinical Measurements */}
        <div>
          <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
            Clinical Measurements
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Row 1 - Col 1: Systolic BP */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Systolic BP (mmHg)</label>
                <span className="text-[9px] font-mono text-slate-400">70–240</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.SystolicBP.min}
                max={CLINICAL_LIMITS.SystolicBP.max}
                value={features.SystolicBP}
                onChange={(e) => handleInputChange('SystolicBP', e.target.value)}
                onBlur={() => handleInputBlur('SystolicBP')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
            {/* Row 1 - Col 2: Diastolic BP */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Diastolic BP (mmHg)</label>
                <span className="text-[9px] font-mono text-slate-400">40–140</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.DiastolicBP.min}
                max={CLINICAL_LIMITS.DiastolicBP.max}
                value={features.DiastolicBP}
                onChange={(e) => handleInputChange('DiastolicBP', e.target.value)}
                onBlur={() => handleInputBlur('DiastolicBP')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
            {/* Row 2 - Col 1: Pulse Rate */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Pulse Rate (bpm)</label>
                <span className="text-[9px] font-mono text-slate-400">35–220</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.PulseRate.min}
                max={CLINICAL_LIMITS.PulseRate.max}
                value={features.PulseRate}
                onChange={(e) => handleInputChange('PulseRate', e.target.value)}
                onBlur={() => handleInputBlur('PulseRate')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
            {/* Row 2 - Col 2: Cholesterol */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Cholesterol (mg/dL)</label>
                <span className="text-[9px] font-mono text-slate-400">80–550</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.Cholesterol.min}
                max={CLINICAL_LIMITS.Cholesterol.max}
                value={features.Cholesterol}
                onChange={(e) => handleInputChange('Cholesterol', e.target.value)}
                onBlur={() => handleInputBlur('Cholesterol')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* 3. Laboratory */}
        <div>
          <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
            Laboratory
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">Troponin (ng/mL)</label>
                <span className="text-[9px] font-mono text-slate-400">0.0–25.0</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.Troponin.min}
                max={CLINICAL_LIMITS.Troponin.max}
                step={CLINICAL_LIMITS.Troponin.step}
                value={features.Troponin}
                onChange={(e) => handleInputChange('Troponin', e.target.value)}
                onBlur={() => handleInputBlur('Troponin')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500 block leading-tight">CK-MB (Creatine Kinase-MB) (ng/mL)</label>
                <span className="text-[9px] font-mono text-slate-400">0.1–150</span>
              </div>
              <input
                type="number"
                min={CLINICAL_LIMITS.CKMB.min}
                max={CLINICAL_LIMITS.CKMB.max}
                step={CLINICAL_LIMITS.CKMB.step}
                value={features.CKMB}
                onChange={(e) => handleInputChange('CKMB', e.target.value)}
                onBlur={() => handleInputBlur('CKMB')}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* 4. ECG & Echocardiography */}
        <div>
          <span className="text-[11px] font-bold text-slate-800 block mb-1.5">
            Electrocardiogram (ECG) &amp; Echocardiography
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Row 1 - Col 1: ST Elevation */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5">
              <label className="text-[10px] text-slate-500 block leading-tight">ECG ST Elevation</label>
              <select
                value={features.StElevation}
                onChange={(e) => handleInputChange('StElevation', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {/* Row 1 - Col 2: T Inversion */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5">
              <label className="text-[10px] text-slate-500 block leading-tight">ECG T-Wave Inversion</label>
              <select
                value={features.TInversion}
                onChange={(e) => handleInputChange('TInversion', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {/* Row 2 - Col 1: LVH */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5">
              <label className="text-[10px] text-slate-500 block leading-tight">LVH (Left Ventricular Hypertrophy)</label>
              <select
                value={features.LVH}
                onChange={(e) => handleInputChange('LVH', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {/* Row 2 - Col 2: Region with RWMA */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-1.5">
              <label className="text-[10px] text-slate-500 block leading-tight">Region RWMA (Wall Motion Abnormality)</label>
              <select
                value={features.RegionRWMA}
                onChange={(e) => handleInputChange('RegionRWMA', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none mt-0.5 cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* FULL WIDTH VIBRANT BLUE ACTION BUTTON */}
      <div className="mt-4 pt-1">
        <button
          type="button"
          onClick={onRunPrediction}
          disabled={isPredicting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition duration-150 cursor-pointer disabled:opacity-70"
        >
          {isPredicting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Recalibrating Machine Learning Pipeline...</span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              <span>Recalculate Cardiovascular Risk &bull; Live ML Sync</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

// Auxiliary Card: Prediction Probabilities
export function PredictionProbabilitiesCard({ predictions }) {
  const overallCAD = predictions?.overall_cad?.probability ?? 0.9632;
  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;

  const getBarColor = (p) => {
    if (p >= 0.70) return 'bg-red-500';
    if (p >= 0.30) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 transition-colors">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="text-purple-600">
          <ActivitySquare className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-slate-900">Prediction Probabilities</h3>
      </div>

      <div className="space-y-2 text-xs">
        {/* Overall CAD */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-700 w-24">Overall CAD</span>
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getBarColor(overallCAD)} transition-all duration-500`} 
              style={{ width: `${Math.round(overallCAD * 100)}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[11px] text-slate-900 w-8 text-right">
            {overallCAD.toFixed(2)}
          </span>
        </div>

        {/* LAD Stenosis */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-700 w-24">LAD Stenosis</span>
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getBarColor(ladProb)} transition-all duration-500`} 
              style={{ width: `${Math.round(ladProb * 100)}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[11px] text-slate-900 w-8 text-right">
            {ladProb.toFixed(2)}
          </span>
        </div>

        {/* LCX Stenosis */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-700 w-24">LCX Stenosis</span>
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getBarColor(lcxProb)} transition-all duration-500`} 
              style={{ width: `${Math.round(lcxProb * 100)}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[11px] text-slate-900 w-8 text-right">
            {lcxProb.toFixed(2)}
          </span>
        </div>

        {/* RCA Stenosis */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-700 w-24">RCA Stenosis</span>
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getBarColor(rcaProb)} transition-all duration-500`} 
              style={{ width: `${Math.round(rcaProb * 100)}%` }}
            />
          </div>
          <span className="font-mono font-bold text-[11px] text-slate-900 w-8 text-right">
            {rcaProb.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
