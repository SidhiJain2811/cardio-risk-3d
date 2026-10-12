import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  ZoomIn, 
  Activity,
  Heart,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import Heart3DViewer from './Heart3DViewer';
import { getRiskLevel } from '../data/clinicalData';

export default function Heart3DView({
  features,
  predictions,
  onOpenReport
}) {
  const [selectedVessel, setSelectedVessel] = useState('ALL'); // 'ALL' | 'LAD' | 'LCX' | 'RCA'

  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;
  const cadProb = predictions?.overall_cad?.probability ?? 0.9632;

  const ladRisk = getRiskLevel(ladProb);
  const lcxRisk = getRiskLevel(lcxProb);
  const rcaRisk = getRiskLevel(rcaProb);
  const cadRisk = getRiskLevel(cadProb);

  const vesselDetails = {
    ALL: {
      name: 'All Coronary Arteries',
      prob: cadProb,
      risk: cadRisk,
      territory: 'Global Myocardial Perfusion Network',
      description: 'Comprehensive 3D anatomical view showing the left and right coronary arterial trees mapped across the myocardium.',
      clinicalNote: 'Multi-vessel ischemic risk pattern detected.'
    },
    LAD: {
      name: 'Left Anterior Descending (LAD)',
      prob: ladProb,
      risk: ladRisk,
      territory: 'Anterior Wall, Ventricular Septum, & Cardiac Apex',
      description: 'Courses down the anterior interventricular groove. Supplies roughly 45–55% of the left ventricular myocardial mass.',
      clinicalNote: 'High stenosis probability (≥50% obstruction threshold exceeded).'
    },
    LCX: {
      name: 'Left Circumflex (LCX)',
      prob: lcxProb,
      risk: lcxRisk,
      territory: 'Lateral & Posterior Free Wall of Left Ventricle',
      description: 'Runs along the left atrioventricular groove. Supplies lateral and posterior ventricular walls.',
      clinicalNote: 'Moderate stenosis probability; clinical monitoring indicated.'
    },
    RCA: {
      name: 'Right Coronary Artery (RCA)',
      prob: rcaProb,
      risk: rcaRisk,
      territory: 'Inferior Wall, Right Ventricle, & Conduction System',
      description: 'Courses in the right atrioventricular groove. Supplies the right ventricle, inferior wall, and SA/AV nodes.',
      clinicalNote: 'Borderline ischemic risk with moderate probability.'
    }
  };

  const currentInfo = vesselDetails[selectedVessel];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      
      {/* 1. TOP HEADER & SELECTABLE ARTERY LABELS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <Box className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              3D Anatomical Heart Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rotate 360° and zoom to inspect model-predicted coronary stenosis localization.
          </p>
        </div>

        {/* Simple Selectable Artery Labels (Clean Segmented Control) */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-2xs self-start md:self-auto">
          {[
            { id: 'ALL', label: 'All Vessels' },
            { id: 'LAD', label: 'LAD Artery' },
            { id: 'LCX', label: 'LCX Artery' },
            { id: 'RCA', label: 'RCA Artery' }
          ].map((tab) => {
            const isSelected = selectedVessel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedVessel(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN 3D HEART STAGE (Gives interactive heart most of the screen space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Center Canvas Stage (Takes 8-9 cols for large, immersive 3D view) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 overflow-hidden">
          <Heart3DViewer
            features={features}
            predictions={predictions}
          />
        </div>

        {/* Small Result Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Focused Vessel Result Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Artery Assessment
              </span>
              <span 
                className="text-xs font-bold px-2.5 py-1 rounded-full border"
                style={{ 
                  backgroundColor: currentInfo.risk.bg, 
                  color: currentInfo.risk.text, 
                  borderColor: currentInfo.risk.border 
                }}
              >
                {currentInfo.risk.tier}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentInfo.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black font-mono text-slate-900">
                  {(currentInfo.prob * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Stenosis Probability
                </span>
              </div>
            </div>

            {/* Simple Progress Indicator */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${Math.round(currentInfo.prob * 100)}%`, 
                  backgroundColor: currentInfo.risk.hex 
                }}
              />
            </div>

            {/* Perfusion Territory */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Perfusion Territory
              </span>
              <p className="text-xs text-slate-700 font-medium">
                {currentInfo.territory}
              </p>
            </div>

            {/* Clinical Note */}
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentInfo.description}
            </p>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
              Drag on heart to rotate 360° &bull; Scroll to zoom
            </div>
          </div>

          {/* Quick Artery Comparison Pills */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Quick Vessel Switch
            </span>
            {[
              { id: 'LAD', name: 'LAD Artery', prob: ladProb, risk: ladRisk },
              { id: 'LCX', name: 'LCX Artery', prob: lcxProb, risk: lcxRisk },
              { id: 'RCA', name: 'RCA Artery', prob: rcaProb, risk: rcaRisk }
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVessel(v.id)}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  selectedVessel === v.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{v.name}</span>
                  <span className="text-[11px] font-mono text-slate-500">{(v.prob * 100).toFixed(1)}%</span>
                </div>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: v.risk.bg, color: v.risk.text }}
                >
                  {v.risk.tier}
                </span>
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
