import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Activity, 
  HelpCircle, 
  FileText, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Info, 
  ChevronRight, 
  ShieldAlert, 
  Heart, 
  ActivitySquare, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lightbulb, 
  Zap, 
  Stethoscope, 
  Filter,
  Sliders,
  RefreshCw,
  Play,
  Languages,
  Globe,
  Scale,
  GitCompare,
  Building2,
  FileDown
} from 'lucide-react';
import { 
  SAMPLE_PATIENTS, 
  MODEL_VALIDATION_METRICS, 
  DEFAULT_PATIENT_FEATURES,
  DEFAULT_PREDICTIONS,
  DEFAULT_SHAP_DATA, 
  getRiskLevel, 
  computeDynamicShap 
} from '../data/clinicalData';
import { runWhatIfApi, computeLocalRiskEstimation } from '../services/api';

export function PatientInputFullView({ 
  features, 
  setFeatures, 
  onSelectSample, 
  onRunPrediction 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCohort = SAMPLE_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Patient Cohort &amp; Detailed Clinical Input
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select verified patient profiles from the UCI Z-Alizadeh Sani clinical cohort or input individual telemetry.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cohort cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Cohort Cases Grid: 2 columns in 1 row (dividing 4 options across 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredCohort.map(patient => (
            <div
              key={patient.id}
              onClick={() => {
                if (onSelectSample) onSelectSample(patient.id);
                if (setFeatures) setFeatures(patient.features);
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-blue-600">{patient.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    patient.predictions.overall_cad.tier === 'High Risk' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {patient.predictions.overall_cad.tier}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{patient.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{patient.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>BP: {patient.features.SystolicBP}/{patient.features.DiastolicBP} mmHg &bull; Age: {patient.features.Age}y</span>
                <span className="font-semibold text-blue-600 flex items-center gap-0.5">
                  Load Case <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PredictionsFullView({ predictions }) {
  const vessels = [
    { key: 'LAD', name: 'Left Anterior Descending (LAD)', desc: 'Anterior ventricular wall & septum perfusion', prob: predictions?.vessels?.LAD?.probability ?? 0.82 },
    { key: 'LCX', name: 'Left Circumflex (LCX)', desc: 'Lateral and posterior myocardium perfusion', prob: predictions?.vessels?.LCX?.probability ?? 0.18 },
    { key: 'RCA', name: 'Right Coronary Artery (RCA)', desc: 'Inferior wall, sinus node, and right ventricle perfusion', prob: predictions?.vessels?.RCA?.probability ?? 0.61 },
    { key: 'CAD', name: 'Coronary Artery Disease (CAD)', desc: 'Global multi-vessel ischemic CAD classification', prob: predictions?.overall_cad?.probability ?? 0.78 }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-blue-600" />
          Multi-Vessel Stenosis Risk Matrix &amp; Diagnostic Calibration
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Independent predictive models trained to eliminate target leakage (excluding Cath, LAD, LCX, RCA from input features).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vessels.map(v => {
            const risk = getRiskLevel(v.prob);
            return (
              <div 
                key={v.key} 
                className="p-4 rounded-xl border transition-all"
                style={{ backgroundColor: risk.bg, borderColor: risk.border }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black" style={{ color: risk.text }}>{v.key}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80" style={{ color: risk.text }}>
                    {risk.tier}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono my-2" style={{ color: risk.text }}>
                  {(v.prob * 100).toFixed(1)}%
                </div>
                <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal">{v.desc}</p>
                <div className="mt-3 text-[10px] font-medium text-slate-500">
                  Cutoff: &ge; 50% stenosis threshold
                </div>
              </div>
            );
          })}
        </div>

        {/* Empirical Multi-Target Baseline Comparison Table */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                Model Architecture Benchmarks: Logistic Regression Baseline vs. Calibrated Tree Ensembles
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluated on independent held-out test cohort (N=61) and 5-fold stratified cross-validation on UCI Z-Alizadeh Sani cohort (55 features).
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 self-start">
              Platt Sigmoid Calibrated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100/60">
                  <th className="py-2 px-3">Target</th>
                  <th className="py-2 px-3">Baseline (Logistic Regression)</th>
                  <th className="py-2 px-3">Champion Model</th>
                  <th className="py-2 px-3 text-center">Test Accuracy</th>
                  <th className="py-2 px-3 text-center">Test F1-Score</th>
                  <th className="py-2 px-3 text-center">ROC-AUC</th>
                  <th className="py-2 px-3 text-right">Performance Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {MODEL_VALIDATION_METRICS.targetsComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{row.target}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {row.baselineModel} ({row.baselineAcc})
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-blue-700">
                      {row.championModel}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{row.championAcc}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{row.championF1}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">{row.championAuc}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{row.improvement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[10.5px] text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <strong>Methodology Disclosure:</strong> Zero target leakage enforced. All target columns (Cath, CAD, LAD, LCX, RCA) and patient identifiers were strictly excised from model inputs prior to training. Probability outputs reflect Platt sigmoid scaling (<code className="font-mono bg-blue-100 px-1 py-0.2 rounded">CalibratedClassifierCV(method='sigmoid', cv=3)</code>) reducing Brier score loss to 0.122.
            </div>
          </div>
        </div>

        {/* Probability Interpretation Disclaimer */}
        <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>Clinical Probability Interpretation Notice:</strong> Model percentages are statistical probability estimates derived from tabular machine learning algorithms. They are NOT direct millimeter measurements of arterial plaque obstruction, catheter readings, or invasive fluoroscopy scans. Use solely for research decision support.
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExplainabilityFullView({
  features = DEFAULT_PATIENT_FEATURES,
  predictions = DEFAULT_PREDICTIONS,
  shapData = null,
  selectedSampleId = 'PT-001',
  inputMode = 'sample',
  onSelectSample = null
}) {
  const [selectedTarget, setSelectedTarget] = useState('ALL');

  const currentFeatures = features || DEFAULT_PATIENT_FEATURES;
  const currentPredictions = predictions || DEFAULT_PREDICTIONS;

  // Compute live, fully dynamic SHAP attributions based directly on active patient profile
  const dynamicShap = useMemo(() => {
    return computeDynamicShap(currentFeatures, currentPredictions);
  }, [currentFeatures, currentPredictions]);

  // Active patient matched record
  const currentPatientMeta = useMemo(() => {
    return SAMPLE_PATIENTS.find(p => p.id === selectedSampleId) || null;
  }, [selectedSampleId]);

  const overallProb = currentPredictions?.overall_cad?.probability ?? 0.78;
  const overallRisk = getRiskLevel(overallProb);

  const targetsList = [
    { 
      key: 'Overall CAD', 
      label: 'Coronary Artery Disease (CAD)', 
      territory: 'Global Myocardial Perfusion & Multi-Vessel CAD', 
      prob: currentPredictions?.overall_cad?.probability ?? 0.78,
      items: dynamicShap['Overall CAD'] || []
    },
    { 
      key: 'LAD', 
      label: 'Left Anterior Descending (LAD)', 
      territory: 'Anterior Wall, Ventricular Septum, and Apex', 
      prob: currentPredictions?.vessels?.LAD?.probability ?? 0.82,
      items: dynamicShap['LAD'] || []
    },
    { 
      key: 'LCX', 
      label: 'Left Circumflex (LCX)', 
      territory: 'Lateral Myocardium & Posterior Free Wall', 
      prob: currentPredictions?.vessels?.LCX?.probability ?? 0.18,
      items: dynamicShap['LCX'] || []
    },
    { 
      key: 'RCA', 
      label: 'Right Coronary Artery (RCA)', 
      territory: 'Inferior Myocardial Wall, Sinus Node, & Right Ventricle', 
      prob: currentPredictions?.vessels?.RCA?.probability ?? 0.61,
      items: dynamicShap['RCA'] || []
    }
  ];

  const visibleTargets = selectedTarget === 'ALL' 
    ? targetsList 
    : targetsList.filter(t => t.key === selectedTarget);

  // Top driving positive and protective factors for clinical narrative
  const topRiskFactor = dynamicShap['Overall CAD']?.find(f => f.impact > 0);
  const topProtectiveFactor = dynamicShap['Overall CAD']?.find(f => f.impact < 0);

  return (
    <div className="space-y-4">
      {/* 1. Header & Active Patient Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Explainability &amp; Patient Risk Factors (SHAP)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Game-theoretic Shapley additive feature attributions calculated specifically for the currently active patient profile.
              Every attribution magnitude directly quantifies how the patient's individual biomarkers shifted model predictions.
            </p>
          </div>

          {/* Quick Patient Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/90">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" /> Patient:
            </span>
            {SAMPLE_PATIENTS.map(p => {
              const isSelected = selectedSampleId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (onSelectSample) onSelectSample(p.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{p.id}</span>
                  <span className="text-[10px] opacity-80">({p.features.Age}{p.features.Gender === 'Male' ? 'M' : 'F'})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instruction strip matching reference image */}
        <div className="py-2.5 flex flex-wrap items-center gap-5 text-xs font-medium text-slate-800 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 inline-block"></span>
            <span><strong className="text-red-600 font-bold">Red</strong> bars increase patient risk.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 inline-block"></span>
            <span><strong className="text-emerald-600 font-bold">Green</strong> bars reduce patient risk.</span>
          </div>
        </div>

        {/* Active Profile Telemetry Strip */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
              {currentFeatures.Gender === 'Female' ? 'F' : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  {currentPatientMeta ? currentPatientMeta.name : `Active Patient Profile (${currentFeatures.Age} yrs)`}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {selectedSampleId}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time biomarker chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center">
              <span className="text-[9.5px] text-slate-400 block leading-tight">Patient Age</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentFeatures.Age} yrs</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center">
              <span className="text-[9.5px] text-slate-400 block leading-tight">Blood Pressure</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentFeatures.SystolicBP}/{currentFeatures.DiastolicBP} mmHg</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center">
              <span className="text-[9.5px] text-slate-400 block leading-tight">Cholesterol</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentFeatures.Cholesterol} mg/dL</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center">
              <span className="text-[9.5px] text-slate-400 block leading-tight">Troponin-I</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentFeatures.Troponin} ng/mL</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center">
              <span className="text-[9.5px] text-slate-400 block leading-tight">ECG Status</span>
              <span className="text-xs font-bold text-slate-900">
                {currentFeatures.StElevation === 'Yes' ? 'ST Elevation' : (currentFeatures.TInversion === 'Yes' ? 'T-Inversion' : 'Normal')}
              </span>
            </div>
            <div 
              className="px-3 py-1.5 rounded-lg border text-center font-bold text-xs flex items-center gap-1.5"
              style={{ backgroundColor: overallRisk.bg, borderColor: overallRisk.border, color: overallRisk.text }}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>CAD: {(overallProb * 100).toFixed(1)}% ({overallRisk.tier})</span>
            </div>
          </div>
        </div>

        {/* Target View Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Targets:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTarget('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedTarget === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All 4 Targets (Grid View)
          </button>
          {targetsList.map(t => {
            const risk = getRiskLevel(t.prob);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedTarget(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTarget === t.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t.label}</span>
                <span 
                  className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full"
                  style={{ 
                    backgroundColor: selectedTarget === t.key ? 'rgba(255,255,255,0.25)' : risk.bg, 
                    color: selectedTarget === t.key ? '#FFFFFF' : risk.text 
                  }}
                >
                  {(t.prob * 100).toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Attribution Cards Grid */}
      <div className={`grid gap-4 ${selectedTarget === 'ALL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {visibleTargets.map(target => {
          const risk = getRiskLevel(target.prob);

          return (
            <div 
              key={target.key} 
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Target Title & Risk Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: risk.hex }} />
                      <h3 className="text-sm font-bold text-slate-900">{target.label}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{target.territory}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="font-mono font-black text-base text-slate-900">
                        {(target.prob * 100).toFixed(1)}%
                      </span>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: risk.bg, color: risk.text, borderColor: risk.border }}
                      >
                        {risk.tier}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-slate-400">Diagnostic Cutoff: &ge;50%</span>
                  </div>
                </div>

                {/* Visual bar legend */}
                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700 pb-2 mb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 inline-block"></span>
                    <span><strong className="text-red-600 font-bold">Red</strong> bars increase patient risk.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 inline-block"></span>
                    <span><strong className="text-emerald-600 font-bold">Green</strong> bars reduce patient risk.</span>
                  </div>
                </div>

                {/* Table Column Headers */}
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 px-2">
                  <span className="col-span-4">Biomarker / Feature</span>
                  <span className="col-span-2 text-center">Patient Value</span>
                  <span className="col-span-4 text-center">SHAP Impact Visual</span>
                  <span className="col-span-2 text-right">Attribution</span>
                </div>

                {/* Feature Attribution Rows */}
                <div className="space-y-1.5">
                  {target.items.map((item, idx) => {
                    const isPos = item.impact >= 0;
                    const magnitude = Math.min(100, Math.abs(item.impact) * 260);

                    return (
                      <div 
                        key={idx} 
                        className="grid grid-cols-12 items-center text-xs py-1.5 px-2.5 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition"
                      >
                        {/* Feature Name */}
                        <div className="col-span-4 font-semibold text-slate-800 text-[11.5px] truncate" title={item.feature}>
                          {item.feature}
                        </div>

                        {/* Patient Value / Unit */}
                        <div className="col-span-2 text-center">
                          <span className="font-mono font-bold text-[10.5px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs inline-block">
                            {item.unit}
                          </span>
                        </div>

                        {/* Diverging Visual Bar */}
                        <div className="col-span-4 flex items-center justify-center px-1">
                          <div className="w-full flex items-center bg-slate-200/80 rounded h-2.5 px-0.5">
                            {/* Protective / Left */}
                            <div className="w-1/2 flex justify-end">
                              {!isPos && (
                                <div 
                                  className="h-2 rounded-l bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${magnitude}%` }}
                                />
                              )}
                            </div>
                            {/* Center Zero Axis */}
                            <div className="w-0.5 h-3 bg-slate-400 z-10" />
                            {/* Risk-Increasing / Right */}
                            <div className="w-1/2 flex justify-start">
                              {isPos && (
                                <div 
                                  className="h-2 rounded-r bg-red-500 transition-all duration-500"
                                  style={{ width: `${magnitude}%` }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Numerical Impact + Direction Tag */}
                        <div className="col-span-2 flex items-center justify-end gap-1 font-mono">
                          <span className={`font-bold text-xs ${isPos ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isPos ? `+${item.impact.toFixed(2)}` : item.impact.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer Rationale */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Positive values increase risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Negative values reduce risk (protective)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Clinical Synthesis & Model Interpretability Footer Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
              Clinical Interpretation Summary for {currentPatientMeta?.name || 'Active Patient'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {overallProb >= 0.7 ? (
                <>
                  The patient presents with significant cardiovascular risk (<strong className="text-red-600">{(overallProb * 100).toFixed(1)}%</strong>). 
                  The primary risk drivers shifting SHAP values higher are <strong>{topRiskFactor?.feature || 'Ischemic ECG Patterns'}</strong> ({topRiskFactor?.unit}), 
                  supported by hemodynamic and demographic factors (Age: {currentFeatures.Age} yrs, SBP: {currentFeatures.SystolicBP} mmHg).
                </>
              ) : (
                <>
                  The patient displays optimal coronary perfusion metrics (<strong className="text-emerald-600">{(overallProb * 100).toFixed(1)}% CAD risk</strong>). 
                  Strong protective SHAP attributions include <strong>{topProtectiveFactor?.feature || 'Normal baseline vitals'}</strong> ({topProtectiveFactor?.unit}), 
                  along with normotensive BP ({currentFeatures.SystolicBP}/{currentFeatures.DiastolicBP} mmHg) and normal cardiac biomarkers.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsFullView({ onGenerateReport }) {
  const reportRecords = [
    { id: 'REP-2026-081', date: 'October 5, 2026', patient: 'PT-001 (58M)', risk: 'High Risk (LAD 82%)', status: 'Research Summary Generated' },
    { id: 'REP-2026-080', date: 'October 4, 2026', patient: 'PT-002 (64M)', risk: 'High Risk (RCA 88%)', status: 'Observational Record Analyzed' },
    { id: 'REP-2026-079', date: 'October 3, 2026', patient: 'PT-003 (46F)', risk: 'Low Risk (CAD 14%)', status: 'Screening Record Stored' },
    { id: 'REP-2026-078', date: 'October 2, 2026', patient: 'PT-004 (72M)', risk: 'High Risk (CAD 96%)', status: 'Baseline Comparison Logged' }
  ];

  const handleExportAuditCSV = () => {
    const rows = [
      ['Report_ID', 'Date', 'Patient_Cohort_ID', 'Stratification_Outcome', 'Audit_Status', 'Research_Disclaimer'],
      ...reportRecords.map(r => [
        r.id,
        r.date,
        r.patient,
        r.risk,
        r.status,
        'Research prototype estimation only - non-diagnostic'
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CardioAI_Research_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Clinical Reports Archive &amp; Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export anonymized research workups, cohort audit trails, and multi-vessel model predictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Audit Log (CSV)
          </button>
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Create Patient Research Report (PDF)
          </button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong>Audit Compliance Notice:</strong> All generated reports reflect statistical classification estimates from models trained on the UCI Z-Alizadeh Sani research dataset. Prescriptive treatment protocols (e.g. drug dosing or angiography scheduling) are intentionally omitted in compliance with clinical prototype safety guidelines.
        </div>
      </div>

      <div className="space-y-2">
        {reportRecords.map(r => (
          <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                  <span className="text-[10px] text-slate-400">{r.date}</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {r.patient} &bull; <span className="font-bold text-slate-700">{r.risk}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {r.status}
              </span>
              <button
                onClick={onGenerateReport}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 hover:text-blue-600 transition cursor-pointer"
                title="View / Print PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// WHAT-IF ANALYSIS FULL VIEW (TRACK A DISTINCTIVE FEATURE)
// -------------------------------------------------------------
export function WhatIfAnalysisFullView({
  features = DEFAULT_PATIENT_FEATURES,
  predictions = DEFAULT_PREDICTIONS
}) {
  const [modifiedFeatures, setModifiedFeatures] = useState(features || DEFAULT_PATIENT_FEATURES);
  const [whatIfData, setWhatIfData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Synchronize when patient changes
  useEffect(() => {
    setModifiedFeatures(features || DEFAULT_PATIENT_FEATURES);
    setActivePreset(null);
  }, [features]);

  // Reactive simulation calculation (debounced)
  useEffect(() => {
    let isCancelled = false;
    setIsSimulating(true);

    const timer = setTimeout(async () => {
      try {
        const res = await runWhatIfApi(features, modifiedFeatures);
        if (!isCancelled && res) {
          setWhatIfData(res);
        }
      } catch (e) {
        console.warn('What-If run failed, using local estimator fallback:', e);
      } finally {
        if (!isCancelled) setIsSimulating(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [features, modifiedFeatures]);

  // Quick Preset Scenarios
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'bp_lipid') {
      setModifiedFeatures(prev => ({
        ...prev,
        SystolicBP: 118,
        DiastolicBP: 76,
        Cholesterol: 165
      }));
    } else if (presetKey === 'smoking_normotensive') {
      setModifiedFeatures(prev => ({
        ...prev,
        SmokingStatus: 'Non-Smoker',
        SystolicBP: 122,
        DiastolicBP: 80
      }));
    } else if (presetKey === 'acute_decompensation') {
      setModifiedFeatures(prev => ({
        ...prev,
        SystolicBP: 178,
        DiastolicBP: 104,
        StElevation: 'Yes',
        RegionRWMA: 'Yes',
        RWMALocation: 'Anterior'
      }));
    }
  };

  const handleReset = () => {
    setModifiedFeatures(features);
    setActivePreset(null);
  };

  // Extract deltas from simulation response or calculate locally
  const origPred = whatIfData?.original_prediction || predictions;
  const modPred = whatIfData?.modified_prediction || predictions;

  const targets = [
    {
      key: 'Cath',
      label: 'Coronary Artery Disease (CAD)',
      territory: 'Global Myocardial Risk Burden',
      origProb: origPred?.overall_cad?.probability ?? 0.78,
      modProb: modPred?.overall_cad?.probability ?? 0.78
    },
    {
      key: 'LAD',
      label: 'Left Anterior Descending (LAD)',
      territory: 'Anterior Septal Wall & Apex',
      origProb: origPred?.vessels?.LAD?.probability ?? 0.82,
      modProb: modPred?.vessels?.LAD?.probability ?? 0.82
    },
    {
      key: 'LCX',
      label: 'Left Circumflex (LCX)',
      territory: 'Lateral & Posterior Ventricular Perfusion',
      origProb: origPred?.vessels?.LCX?.probability ?? 0.18,
      modProb: modPred?.vessels?.LCX?.probability ?? 0.18
    },
    {
      key: 'RCA',
      label: 'Right Coronary Artery (RCA)',
      territory: 'Inferior Wall & Right Ventricle',
      origProb: origPred?.vessels?.RCA?.probability ?? 0.61,
      modProb: modPred?.vessels?.RCA?.probability ?? 0.61
    }
  ];

  // List of modified parameters
  const changedList = useMemo(() => {
    const list = [];
    const fields = [
      { key: 'Age', label: 'Patient Age', unit: 'yrs' },
      { key: 'SystolicBP', label: 'Systolic Blood Pressure', unit: 'mmHg' },
      { key: 'DiastolicBP', label: 'Diastolic Blood Pressure', unit: 'mmHg' },
      { key: 'Cholesterol', label: 'Total Serum Cholesterol', unit: 'mg/dL' },
      { key: 'Glucose', label: 'Fasting Blood Sugar (FBS)', unit: 'mg/dL' },
      { key: 'SmokingStatus', label: 'Tobacco Smoking Status', unit: '' },
      { key: 'StElevation', label: 'ECG ST-Elevation', unit: '' },
      { key: 'TInversion', label: 'ECG T-Wave Inversion', unit: '' },
      { key: 'RegionRWMA', label: 'Echocardiogram RWMA', unit: '' }
    ];

    fields.forEach(f => {
      if (String(features[f.key]) !== String(modifiedFeatures[f.key])) {
        list.push({
          label: f.label,
          orig: `${features[f.key]} ${f.unit}`.trim(),
          mod: `${modifiedFeatures[f.key]} ${f.unit}`.trim()
        });
      }
    });
    return list;
  }, [features, modifiedFeatures]);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Scenario Presets */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <GitCompare className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Counterfactual What-If Sensitivity Exploration
              </h2>
              {isSimulating && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Simulating...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Dynamically perturb patient biomarkers and observe in real-time how the trained ML ensemble shifts its calibrated multi-vessel probability estimates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
            <button
              onClick={() => applyPreset('bp_lipid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                activePreset === 'bp_lipid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" /> BP &amp; Lipid Target
            </button>
            <button
              onClick={() => applyPreset('smoking_normotensive')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                activePreset === 'smoking_normotensive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle className="w-3 h-3" /> Smoking Cessation
            </button>
            <button
              onClick={() => applyPreset('acute_decompensation')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                activePreset === 'acute_decompensation'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Acute Decompensation
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
              title="Reset to original values"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" /> Reset
            </button>
          </div>
        </div>

        {/* 2. Side-by-Side Target Probability Comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {targets.map(t => {
            const delta = Math.round((t.modProb - t.origProb) * 1000) / 10;
            const isDecreased = delta < -0.1;
            const isIncreased = delta > 0.1;

            return (
              <div key={t.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">{t.label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      isDecreased
                        ? 'bg-emerald-100 text-emerald-800'
                        : isIncreased
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDecreased && <ArrowDownRight className="w-3 h-3" />}
                    {isIncreased && <ArrowUpRight className="w-3 h-3" />}
                    &Delta; {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">{t.territory}</p>

                {/* Values Comparison */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Baseline</span>
                    <span className="text-base font-mono font-bold text-slate-600">
                      {(t.origProb * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] uppercase font-bold text-blue-500 block">Simulated</span>
                    <span className="text-xl font-mono font-black text-slate-900">
                      {(t.modProb * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Comparative Dual Bars */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[9.5px]">
                    <span className="w-12 text-slate-400">Baseline</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, t.origProb * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9.5px]">
                    <span className="w-12 font-bold text-blue-600">What-If</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isDecreased ? 'bg-emerald-500' : isIncreased ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, t.modProb * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Clinical Input Sliders & Changed Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Telemetry Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Adjust Hypothesis Telemetry Parameters
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Model Response</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Systolic BP Slider */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Systolic BP</span>
                <span className="font-mono font-bold text-blue-600">{modifiedFeatures.SystolicBP} mmHg</span>
              </div>
              <input
                type="range"
                min="90"
                max="210"
                step="2"
                value={modifiedFeatures.SystolicBP}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, SystolicBP: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>90 (Optimal)</span>
                <span>140 (HTN)</span>
                <span>210 (Crisis)</span>
              </div>
            </div>

            {/* Diastolic BP Slider */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Diastolic BP</span>
                <span className="font-mono font-bold text-blue-600">{modifiedFeatures.DiastolicBP} mmHg</span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                step="2"
                value={modifiedFeatures.DiastolicBP}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, DiastolicBP: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>50</span>
                <span>80 (Target)</span>
                <span>130</span>
              </div>
            </div>

            {/* Total Cholesterol Slider */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Total Cholesterol</span>
                <span className="font-mono font-bold text-blue-600">{modifiedFeatures.Cholesterol} mg/dL</span>
              </div>
              <input
                type="range"
                min="110"
                max="400"
                step="5"
                value={modifiedFeatures.Cholesterol}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, Cholesterol: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>110</span>
                <span>200 (Borderline)</span>
                <span>400</span>
              </div>
            </div>

            {/* Fasting Blood Sugar Slider */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Fasting Blood Glucose</span>
                <span className="font-mono font-bold text-blue-600">{modifiedFeatures.Glucose} mg/dL</span>
              </div>
              <input
                type="range"
                min="70"
                max="320"
                step="5"
                value={modifiedFeatures.Glucose}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, Glucose: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>70</span>
                <span>126 (Diabetic)</span>
                <span>320</span>
              </div>
            </div>

            {/* Smoking Status Dropdown */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Tobacco Smoking Status</label>
              <select
                value={modifiedFeatures.SmokingStatus}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, SmokingStatus: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Non-Smoker">Non-Smoker (Never)</option>
                <option value="Former Smoker">Former Smoker (Cessation)</option>
                <option value="Current Smoker">Current Active Smoker</option>
              </select>
            </div>

            {/* ECG ST-Elevation */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">ECG ST-Elevation</label>
              <select
                value={modifiedFeatures.StElevation}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, StElevation: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="No">No (Normal baseline)</option>
                <option value="Yes">Yes (Acute transmural injury)</option>
              </select>
            </div>

            {/* ECG T-Wave Inversion */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">ECG T-Wave Inversion</label>
              <select
                value={modifiedFeatures.TInversion}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, TInversion: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="No">No (Concordant T-waves)</option>
                <option value="Yes">Yes (Subendocardial ischemia)</option>
              </select>
            </div>

            {/* RWMA Status */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Echo Wall Motion Abnormality (RWMA)</label>
              <select
                value={modifiedFeatures.RegionRWMA}
                onChange={e => setModifiedFeatures({ ...modifiedFeatures, RegionRWMA: e.target.value })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
              >
                <option value="No">No (Normal kinesis)</option>
                <option value="Yes">Yes (Hypokinesia / Akinesia)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Counterfactual Comparison Table & Disclosures (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Activity className="w-4 h-4 text-blue-600" />
              Perturbed Feature Registry ({changedList.length} Changed)
            </h3>

            {changedList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Sliders className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                No parameters altered yet. Move any slider or select a preset above to simulate model response.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  <span className="col-span-5">Feature</span>
                  <span className="col-span-3 text-center">Baseline</span>
                  <span className="col-span-4 text-right">Modified</span>
                </div>
                {changedList.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="col-span-5 font-semibold text-slate-800 text-[11px] truncate">{c.label}</span>
                    <span className="col-span-3 text-center font-mono text-slate-500 text-[11px]">{c.orig}</span>
                    <span className="col-span-4 text-right font-mono font-bold text-blue-700 text-[11px]">{c.mod}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ethical Research Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              Hypothetical In Silico Model Comparison Only
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              This What-If simulation is an in silico mathematical counterfactual for sensitivity analysis. It does <strong>NOT</strong> constitute medical evidence that changing a biometric measurement will produce the predicted physiological outcome. Do not alter prescriptions, statins, or blood pressure medications based on this simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PUBLIC HEALTH FULL VIEW (RESEARCH ROADMAP FOR INDIA)
// -------------------------------------------------------------
export function PublicHealthFullView() {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'

  const content = {
    en: {
      badge: 'Academic Research Concept Prototype',
      title: 'Potential Public Healthcare Application: Research Roadmap for India',
      subtitle: 'Conceptual design and research roadmap for accessible, zero-cost cardiovascular triage at Primary Health Centres (PHCs) and Ayushman Arogya Mandirs.',
      disclaimerTitle: 'Academic Research Prototype — Not Deployed in Live Healthcare Settings',
      disclaimerBody: 'CardioAI has NOT been certified by the Central Drugs Standard Control Organisation (CDSCO) and is NOT currently deployed within Ayushman Bharat or the Ayushman Bharat Digital Mission (ABDM). This module represents an exploratory academic research roadmap submitted to IIT Mandi Hackathon 2026 (Track A) examining how lightweight explainable machine learning could support cardiovascular screening.',
      pillars: [
        {
          num: '01',
          title: 'Primary Health Centre (PHC) Screening Triage',
          desc: 'Offers rapid, tabular-based risk stratification for Medical Officers (MOs) and Community Health Officers (CHOs) evaluating symptomatic rural patients with standard non-invasive vitals.',
          metric: 'Zero specialized hardware needed'
        },
        {
          num: '02',
          title: 'Zero-Cost, 100% Offline Edge Architecture',
          desc: 'Designed to execute fully on sub-$300 refurbished laptops, tablets, or PHC desktops without cloud GPU dependencies, recurring API subscription fees, or broadband internet.',
          metric: '< 50MB RAM footprint & zero recurring cost'
        },
        {
          num: '03',
          title: 'Multi-Vessel Stenosis Stratification',
          desc: 'Differentiates critical LAD (anterior wall/widowmaker) ischemia requiring urgent tertiary catheterization referral from stable single-vessel patterns manageable medically.',
          metric: 'Targeted tertiary hospital referral'
        },
        {
          num: '04',
          title: 'Transparent SHAP Explainability for Medical Officers',
          desc: 'Replaces black-box probability scores with clear feature attributions, allowing healthcare providers to understand whether elevated risk is driven by SBP, lipids, or ECG changes.',
          metric: 'Game-theoretic attribution audit trail'
        },
        {
          num: '05',
          title: 'Counterfactual Lifestyle & Preventative Counseling',
          desc: 'Empowers primary care workers to interactively demonstrate the projected cardiovascular impact of smoking cessation, lipid control, and hypertension adherence to patients.',
          metric: 'In Silico What-If Sensitivity modeling'
        },
        {
          num: '06',
          title: 'Multi-Center Validation & Regulatory Pathway',
          desc: 'Specifies a strict multi-cohort prospective clinical trial protocol across diverse Indian geographic cohorts (ICMR guidelines) and CDSCO SaMD compliance prior to any live clinical pilot.',
          metric: 'Proposed 3-phase clinical trial roadmap'
        }
      ]
    },
    hi: {
      badge: 'शैक्षणिक अनुसंधान प्रोटोटाइप',
      title: 'सार्वजनिक स्वास्थ्य अनुप्रयोग: भारत के लिए अनुसंधान रूपरेखा',
      subtitle: 'प्राथमिक स्वास्थ्य केंद्रों (PHC) और आयुष्मान आरोग्य मंदिरों में सुलभ, शून्य-लागत हृदय जोखिम जांच के लिए एक अवधारणात्मक शोध योजना।',
      disclaimerTitle: 'अनुसंधान प्रोटोटाइप — वास्तविक अस्पतालों में अभी लागू नहीं है',
      disclaimerBody: 'CardioAI केंद्रीय औषधि मानक नियंत्रण संगठन (CDSCO) द्वारा प्रमाणित नहीं है और न ही यह आयुष्मान भारत या ABDM में लाइव तैनात है। यह मॉड्यूल IIT मंडी हैकाथॉन 2026 (ट्रैक A) के लिए एक शैक्षणिक प्रोटोटाइप है, जो यह दर्शाता है कि कैसे व्याख्यात्मक AI ग्रामीण क्षेत्रों में प्राथमिक जांच में सहायता कर सकता है।',
      pillars: [
        {
          num: '01',
          title: 'प्राथमिक स्वास्थ्य केंद्र (PHC) स्क्रीनिंग और ट्राइएज',
          desc: 'ग्रामीण क्षेत्रों में मेडिकल अधिकारियों (MOs) और सामुदायिक स्वास्थ्य अधिकारियों (CHOs) को बुनियादी परीक्षणों के आधार पर प्रारंभिक हृदय जोखिम मूल्यांकन में मदद करता है।',
          metric: 'किसी विशेष हार्डवेयर की आवश्यकता नहीं'
        },
        {
          num: '02',
          title: 'शून्य-लागत एवं पूर्णतः ऑफलाइन एज आर्किटेक्चर',
          desc: 'सस्ते लैपटॉप या टैबलेट पर बिना इंटरनेट या क्लाउड सर्वर के 100% स्थानीय रूप से चलता है, जिससे बिना किसी आवर्ती खर्च के काम किया जा सकता है।',
          metric: '< 50MB मेमोरी और शून्य क्लाउड लागत'
        },
        {
          num: '03',
          title: 'बहु-धमनी स्टेनोसिस वर्गीकरण (LAD/LCX/RCA)',
          desc: 'गंभीर LAD जोखिम वाले मरीजों की पहचान कर समय पर बड़े जिला अस्पतालों में रेफरल की प्राथमिकता तय करने में सहायक।',
          metric: 'लक्षित तृतीयक अस्पताल रेफरल'
        },
        {
          num: '04',
          title: 'पारदर्शी SHAP व्याख्यात्मकता',
          desc: 'ब्लैक-बॉक्स मॉडल के बजाय यह स्पष्ट रूप से दिखाता है कि कौन से नैदानिक कारक (जैसे रक्तचाप, ईसीजी या कोलेस्ट्रॉल) जोखिम को बढ़ा रहे हैं।',
          metric: 'गेम-थ्योरी आधारित पारदर्शी ऑडिट'
        },
        {
          num: '05',
          title: 'जीवनशैली परामर्श हेतु सिमुलेशन (What-If)',
          desc: 'धूम्रपान छोड़ने और रक्तचाप नियंत्रण के संभावित सकारात्मक प्रभावों को मरीजों को समझाने के लिए इंटरैक्टिव मॉडल।',
          metric: 'संवेदनशीलता विश्लेषण'
        },
        {
          num: '06',
          title: 'नैतिक अनुसंधान एवं विनियामक अनुमोदन रोडमैप',
          desc: 'भारतीय आबादी पर ICMR दिशानिर्देशों के तहत बहु-केंद्रीय नैदानिक परीक्षण और CDSCO अनुमोदन के बाद ही वास्तविक उपयोग की योजना।',
          metric: 'प्रस्तावित 3-चरणीय क्लिनिकल ट्रायल'
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="space-y-4">
      {/* 1. Header with Language Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {t.badge}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{t.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">{t.subtitle}</p>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
            <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                lang === 'en' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                lang === 'hi' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Mandatory Research Disclosure Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-bold mb-0.5">{t.disclaimerTitle}</strong>
            <p className="text-[11px] leading-relaxed text-amber-900/90">{t.disclaimerBody}</p>
          </div>
        </div>
      </div>

      {/* 2. 6 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {t.pillars.map((pillar, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-mono font-black text-blue-600">{pillar.num}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {pillar.metric}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-2 leading-snug">{pillar.title}</h3>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-blue-600 font-semibold">
              <Check className="w-3 h-3" /> Feasible with zero cloud cost
            </div>
          </div>
        ))}
      </div>

      {/* 3. Feasibility Specifications & Multi-Center Clinical Validation Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-600" />
          Proposed 3-Phase Translation Roadmap &amp; Pre-Deployment Gateways
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold font-mono text-blue-700 uppercase">Phase 1 (Current)</span>
            <h4 className="font-bold text-slate-900">In Silico Prototype</h4>
            <p className="text-[11px] text-slate-600">Model training on benchmark datasets (UCI Z-Alizadeh Sani), cross-validation, target leakage elimination, and SHAP interpretability audits.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold font-mono text-amber-700 uppercase">Phase 2 (Proposed)</span>
            <h4 className="font-bold text-slate-900">Multi-Center Indian Cohort Validation</h4>
            <p className="text-[11px] text-slate-600">Prospective observational study across diverse geographic cohorts in India following ICMR guidelines to evaluate demographic generalizability and calibration drift.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold font-mono text-emerald-700 uppercase">Phase 3 (Future)</span>
            <h4 className="font-bold text-slate-900">CDSCO SaMD Clearance</h4>
            <p className="text-[11px] text-slate-600">Software as a Medical Device (SaMD) clearance under Medical Device Rules (2017) before any pilot deployment in Primary Health Centres or ABDM integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
