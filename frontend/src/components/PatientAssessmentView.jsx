import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Play, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Box, 
  Check, 
  ChevronRight,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  Users
} from 'lucide-react';
import { CLINICAL_LIMITS } from './PatientInputCard';
import { SAMPLE_PATIENTS, getRiskLevel } from '../data/clinicalData';

export default function PatientAssessmentView({
  features,
  setFeatures,
  predictions,
  selectedSampleId,
  setSelectedSampleId,
  onSelectSample,
  onRunPrediction,
  isPredicting,
  onOpenInsights,
  onOpen3D,
  onGenerateReport
}) {
  const [activeMode, setActiveMode] = useState(selectedSampleId ? 'sample' : 'manual');
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (field, rawVal) => {
    setActiveMode('manual');
    const limits = CLINICAL_LIMITS[field];
    if (limits) {
      if (rawVal === '') {
        setFeatures(prev => ({ ...prev, [field]: '' }));
        return;
      }
      let num = Number(rawVal);
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

  const handleKeyDown = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleSampleClick = (sampleId) => {
    setActiveMode('sample');
    setSelectedSampleId(sampleId);
    if (onSelectSample) {
      onSelectSample(sampleId);
    }
  };

  const handleResetForm = () => {
    handleSampleClick('PT-001');
  };

  // Prediction stats for side-panel preview
  const cadProb = predictions?.overall_cad?.probability ?? 0.9632;
  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;
  const cadRisk = getRiskLevel(cadProb);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Patient Assessment &amp; Clinical Telemetry Input
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Standard non-invasive cardiovascular examination form. Values entered here are evaluated through the trained machine-learning models to determine multi-vessel stenosis probabilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerateReport}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SAMPLE PATIENT SELECTOR (CLEARLY LABELED AS SAMPLE DATA) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Verified Cohort Sample Profiles
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select an anonymized record from the UCI Z-Alizadeh Sani cohort or manually customize values below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Sample Data (UCI Cohort)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PATIENTS.map(sample => {
            const isSelected = selectedSampleId === sample.id && activeMode === 'sample';
            const risk = getRiskLevel(sample.predictions.overall_cad.probability);
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleClick(sample.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-blue-600">{sample.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      risk.tier === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {risk.tier}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {sample.name.replace('Anonymous Record ', '')}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{sample.features.Age}y {sample.features.Gender} &bull; BP {sample.features.SystolicBP}/{sample.features.DiastolicBP}</span>
                  <span className="text-blue-600 font-semibold flex items-center">
                    Select <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN FORM & LIVE RESULTS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: ORGANIZED PATIENT FORM (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Clinical Data Form</h2>
              <span className="text-[11px] text-slate-500">
                Mode: <strong className="text-blue-600">{activeMode === 'sample' ? `Sample Preset (${selectedSampleId})` : 'Custom Manual Entry'}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          {/* GROUP 1: DEMOGRAPHICS */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. Demographics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Age */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Age (years)</label>
                  <span className="text-[9px] font-mono text-slate-400">18–105 yrs</span>
                </div>
                <input
                  type="number"
                  min={CLINICAL_LIMITS.Age.min}
                  max={CLINICAL_LIMITS.Age.max}
                  value={features.Age}
                  onChange={(e) => handleInputChange('Age', e.target.value)}
                  onBlur={() => handleInputBlur('Age')}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
              </div>

              {/* Gender */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <label className="text-[10px] text-slate-500 font-medium block">Gender</label>
                <select
                  value={features.Gender}
                  onChange={(e) => handleInputChange('Gender', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* BMI */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">BMI (kg/m²)</label>
                  <span className="text-[9px] font-mono text-slate-400">12–65</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="12"
                  max="65"
                  value={features.BMI}
                  onChange={(e) => handleInputChange('BMI', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
              </div>

              {/* Smoking Status */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <label className="text-[10px] text-slate-500 font-medium block">Smoking History</label>
                <select
                  value={features.SmokingStatus || 'Former Smoker'}
                  onChange={(e) => handleInputChange('SmokingStatus', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="Never">Never Smoker</option>
                  <option value="Former Smoker">Former Smoker</option>
                  <option value="Current Smoker">Current Smoker</option>
                </select>
              </div>
            </div>
          </div>

          {/* GROUP 2: CLINICAL MEASUREMENTS */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
              2. Clinical Measurements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Systolic BP */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Systolic BP</label>
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
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">mmHg</span>
              </div>

              {/* Diastolic BP */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Diastolic BP</label>
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
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">mmHg</span>
              </div>

              {/* Pulse Rate */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Pulse Rate</label>
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
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">bpm</span>
              </div>

              {/* Total Cholesterol */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Cholesterol</label>
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
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">mg/dL</span>
              </div>

              {/* Fasting Glucose */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Fasting Sugar</label>
                  <span className="text-[9px] font-mono text-slate-400">50–450</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="450"
                  value={features.Glucose}
                  onChange={(e) => handleInputChange('Glucose', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">mg/dL</span>
              </div>
            </div>
          </div>

          {/* GROUP 3: LABORATORY VALUES */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              3. Laboratory Values
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Troponin */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">Troponin-I (ng/mL)</label>
                  <span className="text-[9px] font-mono text-slate-400">0.0–25.0 (Normal &lt;0.04)</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min={CLINICAL_LIMITS.Troponin.min}
                  max={CLINICAL_LIMITS.Troponin.max}
                  value={features.Troponin}
                  onChange={(e) => handleInputChange('Troponin', e.target.value)}
                  onBlur={() => handleInputBlur('Troponin')}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
              </div>

              {/* CK-MB */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-medium">CK-MB Enzyme (ng/mL)</label>
                  <span className="text-[9px] font-mono text-slate-400">0.1–150.0 (Normal &lt;5.0)</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min={CLINICAL_LIMITS.CKMB.min}
                  max={CLINICAL_LIMITS.CKMB.max}
                  value={features.CKMB}
                  onChange={(e) => handleInputChange('CKMB', e.target.value)}
                  onBlur={() => handleInputBlur('CKMB')}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* GROUP 4: ECG & ECHOCARDIOGRAPHY */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              4. ECG &amp; Echocardiography Findings
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* ST Elevation */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-[10px] text-slate-500 font-medium block">ST Elevation</label>
                <select
                  value={features.StElevation}
                  onChange={(e) => handleInputChange('StElevation', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="Yes">Yes (Ischemia)</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* T Inversion */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-[10px] text-slate-500 font-medium block">T Inversion</label>
                <select
                  value={features.TInversion}
                  onChange={(e) => handleInputChange('TInversion', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Repolarization)</option>
                </select>
              </div>

              {/* LVH */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-[10px] text-slate-500 font-medium block">LV Hypertrophy</label>
                <select
                  value={features.LVH}
                  onChange={(e) => handleInputChange('LVH', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="Yes">Yes (LVH)</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Region RWMA */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-[10px] text-slate-500 font-medium block">Echo RWMA</label>
                <select
                  value={features.RegionRWMA}
                  onChange={(e) => handleInputChange('RegionRWMA', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-1 cursor-pointer"
                >
                  <option value="Yes">Yes (Wall Motion Abnormality)</option>
                  <option value="No">No (Preserved)</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN ACTION BUTTON: RUN ANALYSIS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Direct API execution with trained ExtraTrees &amp; Random Forest models.
            </span>

            <button
              type="button"
              onClick={onRunPrediction}
              disabled={isPredicting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition duration-150 cursor-pointer disabled:opacity-70"
            >
              {isPredicting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Telemetry with Model...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: ASSESSMENT PREDICTION SUMMARY CARD (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              Assessment Outcome
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current model evaluation based on entered parameters.
            </p>
          </div>

          {/* Overall CAD Score */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Global CAD Probability
            </span>
            <span className="text-3xl font-black font-mono text-slate-900 block my-1">
              {(cadProb * 100).toFixed(1)}%
            </span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              cadRisk.tier === 'High Risk' 
                ? 'bg-red-100 text-red-700' 
                : (cadRisk.tier === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
            }`}>
              {cadRisk.tier}
            </span>
            <span className="block text-[11px] text-slate-600 font-semibold mt-2">
              {predictions?.clinical_summary?.burden_label || 'Triple-Vessel Disease (High Ischemic Burden)'}
            </span>
          </div>

          {/* Vessel Probabilities List */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 block">Vessel-Specific Stenosis:</span>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">LAD (Anterior)</span>
                <span className="font-mono font-bold text-slate-900">{(ladProb * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(ladProb * 100)}%`, backgroundColor: getRiskLevel(ladProb).hex }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">LCX (Lateral)</span>
                <span className="font-mono font-bold text-slate-900">{(lcxProb * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(lcxProb * 100)}%`, backgroundColor: getRiskLevel(lcxProb).hex }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">RCA (Inferior)</span>
                <span className="font-mono font-bold text-slate-900">{(rcaProb * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(rcaProb * 100)}%`, backgroundColor: getRiskLevel(rcaProb).hex }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={onOpen3D}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                <span>Examine 3D Coronary Anatomy</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onOpenInsights}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>View Full AI Insights &amp; SHAP</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
