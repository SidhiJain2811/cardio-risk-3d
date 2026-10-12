import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Lightbulb, 
  GitCompare, 
  Activity, 
  HelpCircle, 
  Sliders, 
  RefreshCw, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Info,
  Layers,
  Heart,
  TrendingUp,
  Check
} from 'lucide-react';
import { getRiskLevel, MODEL_VALIDATION_METRICS } from '../data/clinicalData';
import { runWhatIfApi } from '../services/api';

export default function AIInsightsView({
  features,
  predictions,
  shapData,
  initialSubTab = 'predictions',
  onOpenPatient,
  onOpen3D
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  
  // Explainability state
  const [activeTarget, setActiveTarget] = useState('Overall CAD');
  const [showAllShap, setShowAllShap] = useState(false);

  // What-If Simulation state
  const [modifiedFeatures, setModifiedFeatures] = useState({ ...features });
  const [whatIfData, setWhatIfData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Sync baseline features when patient changes
  useEffect(() => {
    setModifiedFeatures({ ...features });
    setActivePreset(null);
    setWhatIfData(null);
  }, [features]);

  // Debounced What-If simulation
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsSimulating(true);
      try {
        const res = await runWhatIfApi(features, modifiedFeatures);
        if (!isCancelled && res) {
          setWhatIfData(res);
        }
      } catch (err) {
        console.warn('What-If simulation error:', err);
      } finally {
        if (!isCancelled) setIsSimulating(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [features, modifiedFeatures]);

  // Presets
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
        SmokingStatus: 'Never',
        SystolicBP: 120,
        DiastolicBP: 78
      }));
    } else if (presetKey === 'acute_decompensation') {
      setModifiedFeatures(prev => ({
        ...prev,
        SystolicBP: 175,
        DiastolicBP: 102,
        StElevation: 'Yes',
        RegionRWMA: 'Yes',
        RWMALocation: 'Anterior'
      }));
    }
  };

  const handleResetWhatIf = () => {
    setModifiedFeatures({ ...features });
    setActivePreset(null);
  };

  // What-If simulation deltas
  const origPred = whatIfData?.original_prediction || predictions;
  const modPred = whatIfData?.modified_prediction || predictions;

  const whatIfTargets = [
    {
      key: 'Cath',
      label: 'Overall CAD',
      desc: 'Global Myocardial Risk',
      origProb: origPred?.overall_cad?.probability ?? 0.9632,
      modProb: modPred?.overall_cad?.probability ?? 0.9632
    },
    {
      key: 'LAD',
      label: 'LAD Vessel',
      desc: 'Anterior Wall & Septum',
      origProb: origPred?.vessels?.LAD?.probability ?? 0.9056,
      modProb: modPred?.vessels?.LAD?.probability ?? 0.9056
    },
    {
      key: 'LCX',
      label: 'LCX Vessel',
      desc: 'Lateral & Posterior Wall',
      origProb: origPred?.vessels?.LCX?.probability ?? 0.6421,
      modProb: modPred?.vessels?.LCX?.probability ?? 0.6421
    },
    {
      key: 'RCA',
      label: 'RCA Vessel',
      desc: 'Inferior Wall & RV',
      origProb: origPred?.vessels?.RCA?.probability ?? 0.5126,
      modProb: modPred?.vessels?.RCA?.probability ?? 0.5126
    }
  ];

  // List of modified parameters
  const changedList = useMemo(() => {
    const list = [];
    const fields = [
      { key: 'Age', label: 'Age', unit: 'yrs' },
      { key: 'SystolicBP', label: 'Systolic BP', unit: 'mmHg' },
      { key: 'DiastolicBP', label: 'Diastolic BP', unit: 'mmHg' },
      { key: 'Cholesterol', label: 'Total Cholesterol', unit: 'mg/dL' },
      { key: 'Glucose', label: 'Fasting Sugar', unit: 'mg/dL' },
      { key: 'SmokingStatus', label: 'Smoking Status', unit: '' },
      { key: 'StElevation', label: 'ST Elevation', unit: '' },
      { key: 'RegionRWMA', label: 'Region RWMA', unit: '' }
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

  // Overall and vessel prediction probabilities
  const overallCAD = predictions?.overall_cad?.probability ?? 0.9632;
  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;

  // Active SHAP drivers
  const currentTargetShap = shapData?.[activeTarget] || [];
  const maxImpact = useMemo(() => {
    if (!currentTargetShap.length) return 0.2;
    const maxVal = Math.max(...currentTargetShap.map(d => Math.abs(d.impact)));
    return maxVal > 0 ? maxVal : 0.2;
  }, [currentTargetShap]);

  const displayedShapFactors = showAllShap ? currentTargetShap : currentTargetShap.slice(0, 3);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER & 3 INTERNAL TABS SELECTOR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
              AI Insights &amp; Clinical Decision Support
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Deep machine-learning interpretability: predictions, game-theoretic SHAP attributions, and what-if counterfactual exploration.
            </p>
          </div>

          {/* Internal Tabs Switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSubTab('predictions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'predictions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Predictions</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('explainability')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'explainability'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Explainability (SHAP)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('whatif')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'whatif'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>What-If Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERNAL TAB 1: PREDICTIONS */}
      {/* ======================================================== */}
      {subTab === 'predictions' && (
        <div className="space-y-4">
          
          {/* Multi-Vessel Horizontal Bar Cards */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Coronary Stenosis Predictions by Vessel Territory</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calibrated output probabilities with plain-English clinical anatomical interpretations.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Calibrated ExtraTrees Ensembles
              </span>
            </div>

            <div className="space-y-4">
              {/* Overall CAD */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">Overall Coronary Artery Disease (CAD)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getRiskLevel(overallCAD).tier === 'High Risk' ? 'bg-red-100 text-red-700' : (getRiskLevel(overallCAD).tier === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                      }`}>
                        {getRiskLevel(overallCAD).tier}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Global Ischemic Burden (Angiographic Cath &ge;50% Stenosis)</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {(overallCAD * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(overallCAD * 100)}%`, backgroundColor: getRiskLevel(overallCAD).hex }}
                  />
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Clinical Meaning:</strong> The model estimates a <strong>{(overallCAD * 100).toFixed(1)}% probability</strong> of significant obstructive coronary artery disease. This reflects a {getRiskLevel(overallCAD).tier.toLowerCase()} state driven primarily by clinical telemetry, hypertension, and ischemic ECG indicators.
                </p>
              </div>

              {/* LAD */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">LAD — Left Anterior Descending</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getRiskLevel(ladProb).tier === 'High Risk' ? 'bg-red-100 text-red-700' : (getRiskLevel(ladProb).tier === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                      }`}>
                        {getRiskLevel(ladProb).tier}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Anterior Ventricular Wall, Interventricular Septum, and Apex</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {(ladProb * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(ladProb * 100)}%`, backgroundColor: getRiskLevel(ladProb).hex }}
                  />
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Clinical Meaning:</strong> The LAD supplies over 50% of left ventricular myocardium. An estimated risk of <strong>{(ladProb * 100).toFixed(1)}%</strong> indicates {ladProb >= 0.7 ? 'critical anterior ischemic vulnerability requiring urgent diagnostic attention' : (ladProb >= 0.3 ? 'borderline stenosis risk' : 'low likelihood of significant LAD occlusion')}.
                </p>
              </div>

              {/* LCX */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">LCX — Left Circumflex</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getRiskLevel(lcxProb).tier === 'High Risk' ? 'bg-red-100 text-red-700' : (getRiskLevel(lcxProb).tier === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                      }`}>
                        {getRiskLevel(lcxProb).tier}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Lateral Myocardial Wall &amp; Posterior Free Wall</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {(lcxProb * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(lcxProb * 100)}%`, backgroundColor: getRiskLevel(lcxProb).hex }}
                  />
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Clinical Meaning:</strong> The LCX supplies the posterolateral left ventricle. Model estimate of <strong>{(lcxProb * 100).toFixed(1)}%</strong> suggests {lcxProb >= 0.7 ? 'significant lateral ischemia' : (lcxProb >= 0.3 ? 'moderate risk of lateral plaque burden' : 'preserved lateral coronary perfusion')}.
                </p>
              </div>

              {/* RCA */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">RCA — Right Coronary Artery</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getRiskLevel(rcaProb).tier === 'High Risk' ? 'bg-red-100 text-red-700' : (getRiskLevel(rcaProb).tier === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                      }`}>
                        {getRiskLevel(rcaProb).tier}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Inferior Myocardial Wall, Sinus Node, &amp; Right Ventricle</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {(rcaProb * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(rcaProb * 100)}%`, backgroundColor: getRiskLevel(rcaProb).hex }}
                  />
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Clinical Meaning:</strong> The RCA supplies the inferior left ventricle, right ventricle, and SA/AV nodal conduction tissue. A probability of <strong>{(rcaProb * 100).toFixed(1)}%</strong> reflects {rcaProb >= 0.7 ? 'high inferior ischemic risk with potential conduction vulnerability' : (rcaProb >= 0.3 ? 'moderate inferior stenosis' : 'optimal inferior coronary flow')}.
                </p>
              </div>
            </div>
          </div>

          {/* Model Architecture & Validation Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Independent Model Validation Matrix (UCI Benchmark Cohort)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Target</th>
                    <th className="p-2.5">Champion Model</th>
                    <th className="p-2.5">Accuracy</th>
                    <th className="p-2.5">F1-Score</th>
                    <th className="p-2.5">ROC-AUC</th>
                    <th className="p-2.5">Improvement vs Baseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {MODEL_VALIDATION_METRICS.targetsComparison.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold font-sans text-slate-900">{row.target}</td>
                      <td className="p-2.5 font-sans text-blue-700 font-semibold">{row.championModel}</td>
                      <td className="p-2.5 font-bold text-slate-800">{row.championAcc}</td>
                      <td className="p-2.5 text-slate-700">{row.championF1}</td>
                      <td className="p-2.5 text-slate-700">{row.championAuc}</td>
                      <td className="p-2.5 font-sans text-emerald-700 font-semibold text-[11px]">{row.improvement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL TAB 2: EXPLAINABILITY (SHAP) */}
      {/* ======================================================== */}
      {subTab === 'explainability' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  SHAP Feature Impact Attribution Chart
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizes actual Shapley additive attributions computed for the active patient. Central zero line separates risk-increasing from protective factors.
                </p>
              </div>

              {/* Target Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {['Overall CAD', 'LAD', 'LCX', 'RCA'].map(target => (
                  <button
                    key={target}
                    onClick={() => setActiveTarget(target)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTarget === target
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            {/* Central Zero-Line SHAP Bar Chart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">
                <span className="text-emerald-700">&larr; Protective Factor (- SHAP)</span>
                <span className="text-slate-400 font-mono">Zero Impact (0.00)</span>
                <span className="text-red-700">Risk-Increasing (+ SHAP) &rarr;</span>
              </div>

              {displayedShapFactors.map((factor, idx) => {
                const impact = factor.impact;
                const isPositive = impact >= 0;
                const barWidthPct = Math.min(100, Math.round((Math.abs(impact) / maxImpact) * 100));

                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white transition-all space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{factor.feature}</span>
                        <span className="text-slate-500 font-mono text-[11px] ml-2">Value: {factor.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isPositive ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isPositive ? 'Risk-Increasing' : 'Protective'}
                        </span>
                        <span className="font-bold text-slate-800 w-16 text-right">
                          {impact > 0 ? `+${impact.toFixed(4)}` : impact.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Split Zero-Line Visual Track */}
                    <div className="grid grid-cols-2 gap-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                      {/* Left: Negative (Protective) */}
                      <div className="flex justify-end items-center h-full border-r border-slate-300">
                        {!isPositive && (
                          <div 
                            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                            style={{ width: `${barWidthPct}%` }}
                          />
                        )}
                      </div>

                      {/* Right: Positive (Risk) */}
                      <div className="flex justify-start items-center h-full">
                        {isPositive && (
                          <div 
                            className="h-full bg-red-500 rounded-r-full transition-all duration-500"
                            style={{ width: `${barWidthPct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expand / Collapse Full Feature List Button */}
            {currentTargetShap.length > 3 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllShap(!showAllShap)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  {showAllShap ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Top 3 Features Only</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Expand All {currentTargetShap.length} SHAP Features</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Explanatory Clinical Note */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <strong>Clinical Interpretation Guide:</strong> SHAP (Shapley Additive exPlanations) computes the exact marginal contribution of each diagnostic test. Red bars shift the patient's probability toward significant CAD (&ge;50% stenosis), while green bars lower estimated risk relative to population base rates.
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL TAB 3: WHAT-IF ANALYSIS */}
      {/* ======================================================== */}
      {subTab === 'whatif' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            
            {/* Header & Preset Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-blue-600" />
                  Counterfactual What-If Sensitivity Exploration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactively alter patient vitals to observe simulated shifts in calibrated multi-vessel risk probabilities.
                </p>
              </div>

              {/* Presets and Reset */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('bp_lipid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activePreset === 'bp_lipid' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Zap className="w-3 h-3" /> BP &amp; Lipid Target
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('smoking_normotensive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activePreset === 'smoking_normotensive' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" /> Smoking Cessation
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('acute_decompensation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activePreset === 'acute_decompensation' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" /> Acute Decompensation
                </button>
                <button
                  type="button"
                  onClick={handleResetWhatIf}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" /> Reset
                </button>
              </div>
            </div>

            {/* Baseline vs Simulated Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {whatIfTargets.map(t => {
                const delta = Math.round((t.modProb - t.origProb) * 1000) / 10;
                const isDecreased = delta < -0.1;
                const isIncreased = delta > 0.1;

                return (
                  <div key={t.key} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{t.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                          isDecreased ? 'bg-emerald-100 text-emerald-800' : (isIncreased ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700')
                        }`}>
                          {isDecreased && <ArrowDownRight className="w-3 h-3" />}
                          {isIncreased && <ArrowUpRight className="w-3 h-3" />}
                          &Delta; {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mb-2">{t.desc}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Baseline</span>
                        <span className="text-xs text-slate-500">{(t.origProb * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-slate-300 font-sans">&rarr;</span>
                      <div className="text-right">
                        <span className="text-[9px] text-blue-600 block uppercase font-bold">Simulated</span>
                        <span className="text-base font-bold text-slate-900">{(t.modProb * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Sliders & Parameter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              
              {/* Systolic BP Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Systolic Blood Pressure</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.SystolicBP} mmHg</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="220"
                  step="2"
                  value={modifiedFeatures.SystolicBP}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, SystolicBP: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>80 mmHg</span>
                  <span>Normal: 120</span>
                  <span>220 mmHg</span>
                </div>
              </div>

              {/* Diastolic BP Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Diastolic Blood Pressure</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.DiastolicBP} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="130"
                  step="2"
                  value={modifiedFeatures.DiastolicBP}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, DiastolicBP: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50 mmHg</span>
                  <span>Normal: 80</span>
                  <span>130 mmHg</span>
                </div>
              </div>

              {/* Total Cholesterol Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Total Cholesterol</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.Cholesterol} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="400"
                  step="5"
                  value={modifiedFeatures.Cholesterol}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, Cholesterol: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>120 mg/dL</span>
                  <span>Desirable: &lt;200</span>
                  <span>400 mg/dL</span>
                </div>
              </div>

              {/* Fasting Glucose Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Fasting Blood Glucose</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.Glucose} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="300"
                  step="5"
                  value={modifiedFeatures.Glucose}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, Glucose: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>70 mg/dL</span>
                  <span>Normal: 100</span>
                  <span>300 mg/dL</span>
                </div>
              </div>

              {/* Smoking Status Dropdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Smoking Status</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.SmokingStatus}</span>
                </div>
                <select
                  value={modifiedFeatures.SmokingStatus}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, SmokingStatus: e.target.value }))}
                  className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="Never">Never Smoker</option>
                  <option value="Former Smoker">Former Smoker</option>
                  <option value="Current Smoker">Current Smoker</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Tobacco cessation significantly reduces risk score.</span>
              </div>

              {/* ECG ST Elevation Dropdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>ECG ST Elevation</span>
                  <span className="font-mono text-blue-600">{modifiedFeatures.StElevation}</span>
                </div>
                <select
                  value={modifiedFeatures.StElevation}
                  onChange={(e) => setModifiedFeatures(prev => ({ ...prev, StElevation: e.target.value }))}
                  className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="No">No ST Elevation (Normal)</option>
                  <option value="Yes">Yes (Acute Ischemic Vector)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Acute ST elevation strongly increases LAD probability.</span>
              </div>
            </div>

            {/* Changed Features Registry */}
            {changedList.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-2">Simulated Parameter Changes ({changedList.length} altered):</span>
                <div className="flex flex-wrap gap-2">
                  {changedList.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                      <strong>{c.label}:</strong> <span className="text-slate-400 line-through">{c.orig}</span> &rarr; <strong className="text-blue-600">{c.mod}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hypothetical Simulation Disclosure */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Hypothetical In Silico Simulation Notice:</span>
              </div>
              <p className="text-[11px] text-amber-800/90">
                This What-If simulation calculates hypothetical mathematical projections based on model feature weights. It does <strong>NOT</strong> constitute medical evidence that altering a biometric measurement will produce the predicted outcome. Do not change medications or dosages based on this simulation.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
