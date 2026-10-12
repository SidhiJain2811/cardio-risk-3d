import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Info, 
  Gauge
} from 'lucide-react';
import { getRiskLevel } from '../data/clinicalData';

export default function PredictionExplainabilityCard({
  predictions
}) {
  // Overall CAD Risk
  const overallCAD = predictions?.overall_cad?.probability ?? 0.9632;
  const overallPercentage = Math.round(overallCAD * 100);
  const confidence = predictions?.overall_cad?.confidence ?? 97;
  const cadRisk = getRiskLevel(overallCAD);

  // Vessels
  const lad = predictions?.vessels?.LAD ?? { probability: 0.9056, tier: 'High Risk' };
  const lcx = predictions?.vessels?.LCX ?? { probability: 0.6421, tier: 'Moderate Risk' };
  const rca = predictions?.vessels?.RCA ?? { probability: 0.5126, tier: 'Moderate Risk' };

  const ladRisk = getRiskLevel(lad.probability);
  const lcxRisk = getRiskLevel(lcx.probability);
  const rcaRisk = getRiskLevel(rca.probability);

  // Arc calculations for Gauge (radius 60, circumference ~188.5)
  const radius = 60;
  const semiCircumference = Math.PI * radius;
  const strokeDashoffset = semiCircumference * (1 - overallCAD);

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. TOP WIDGET: Overall Prediction */}
      <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-5 transition-all">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-none">Overall Coronary Artery Disease (CAD) Prediction</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Global ischemic burden estimation</p>
            </div>
          </div>
          <span 
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
            style={{ backgroundColor: cadRisk.bg, color: cadRisk.text, borderColor: cadRisk.border }}
          >
            {cadRisk.tier}
          </span>
        </div>

        {/* Semi-circle Gauge Meter & Confidence */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 pt-4 pb-2">
          {/* Left: Gauge Arc */}
          <div className="sm:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-44 h-24 flex items-end justify-center">
              <svg className="w-44 h-24 overflow-visible" viewBox="0 0 140 75">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                {/* Background Arc */}
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                {/* Gauge Indicator */}
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={semiCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Arc text: Dynamic Risk Tier */}
              <div className="absolute bottom-1 text-center">
                <div 
                  className="text-lg font-black leading-none tracking-tight font-mono"
                  style={{ color: cadRisk.hex }}
                >
                  {overallPercentage}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Probability
                </div>
              </div>
            </div>

            <p 
              className="text-xs font-bold mt-2"
              style={{ color: cadRisk.hex }}
            >
              Estimated Risk: <span className="font-mono">{overallCAD.toFixed(2)}</span> ({cadRisk.tier})
            </p>
          </div>

          {/* Right: Model Confidence */}
          <div className="sm:col-span-5 sm:pl-4 sm:border-l border-slate-100 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold mb-1">
              <span>Model Confidence</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {confidence}%
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${confidence}%`, backgroundColor: cadRisk.hex }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
              Cross-validated XGBoost/Random Forest consensus
            </p>
          </div>
        </div>

        {/* Clinical Safety Disclaimer Alert Box */}
        <div 
          className="mt-3 p-2.5 rounded-xl border flex items-start gap-2"
          style={{ backgroundColor: cadRisk.bg, borderColor: cadRisk.border }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cadRisk.hex }} />
          <p className="text-[10.5px] leading-relaxed font-medium" style={{ color: cadRisk.text }}>
            This statistical prediction is for research &amp; decision support only. Not a certified clinical device.
          </p>
        </div>
      </div>

      {/* 2. MIDDLE WIDGET: Vessel-wise Stenosis Probability */}
      <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-5 transition-all">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-none">
                Coronary Artery Stenosis Probabilities (LAD, LCX, RCA)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Stenosis threshold &ge; 50% luminal obstruction</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Independent Models</span>
        </div>

        <div className="space-y-3">
          {/* LAD */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="shrink-0" style={{ color: ladRisk.hex }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M12 12l5-5M12 12l-5-5" />
              </svg>
            </div>
            <div className="w-44">
              <span className="font-bold text-slate-900 block leading-tight">Left Anterior Descending (LAD)</span>
              <span className="text-[9.5px] text-slate-500 block leading-tight">Anterior Wall &amp; Septum Perfusion</span>
            </div>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden mx-1">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round(lad.probability * 100)}%`, backgroundColor: ladRisk.hex }}
              />
            </div>
            <span className="font-mono font-bold text-[11px] text-slate-900 w-7 text-right">
              {lad.probability.toFixed(2)}
            </span>
            <span 
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{ backgroundColor: ladRisk.bg, color: ladRisk.text, borderColor: ladRisk.border }}
            >
              {ladRisk.tier}
            </span>
          </div>

          {/* LCX */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="shrink-0" style={{ color: lcxRisk.hex }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M12 12l5-5M12 12l-5-5" />
              </svg>
            </div>
            <div className="w-44">
              <span className="font-bold text-slate-900 block leading-tight">Left Circumflex (LCX)</span>
              <span className="text-[9.5px] text-slate-500 block leading-tight">Lateral &amp; Posterior Left Ventricle</span>
            </div>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden mx-1">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round(lcx.probability * 100)}%`, backgroundColor: lcxRisk.hex }}
              />
            </div>
            <span className="font-mono font-bold text-[11px] text-slate-900 w-7 text-right">
              {lcx.probability.toFixed(2)}
            </span>
            <span 
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{ backgroundColor: lcxRisk.bg, color: lcxRisk.text, borderColor: lcxRisk.border }}
            >
              {lcxRisk.tier}
            </span>
          </div>

          {/* RCA */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="shrink-0" style={{ color: rcaRisk.hex }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M12 12l5-5M12 12l-5-5" />
              </svg>
            </div>
            <div className="w-44">
              <span className="font-bold text-slate-900 block leading-tight">Right Coronary Artery (RCA)</span>
              <span className="text-[9.5px] text-slate-500 block leading-tight">Right Ventricle &amp; Inferior Wall</span>
            </div>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden mx-1">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round(rca.probability * 100)}%`, backgroundColor: rcaRisk.hex }}
              />
            </div>
            <span className="font-mono font-bold text-[11px] text-slate-900 w-7 text-right">
              {rca.probability.toFixed(2)}
            </span>
            <span 
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{ backgroundColor: rcaRisk.bg, color: rcaRisk.text, borderColor: rcaRisk.border }}
            >
              {rcaRisk.tier}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
