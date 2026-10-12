import React from 'react';
import { 
  X, 
  User, 
  Activity, 
  Play, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SAMPLE_PATIENTS } from '../data/clinicalData';
import { CLINICAL_LIMITS } from './PatientInputCard';

export default function PatientVitalsModal({
  isOpen,
  onClose,
  features,
  setFeatures,
  onSelectSample,
  selectedSampleId,
  onRunPrediction,
  isPredicting
}) {
  if (!isOpen) return null;

  const handleInputChange = (field, rawVal) => {
    const limits = CLINICAL_LIMITS[field];
    if (limits) {
      if (rawVal === '') {
        setFeatures(prev => ({ ...prev, [field]: '' }));
        return;
      }
      let num = Number(rawVal);
      if (num < 0) num = limits.min;
      setFeatures(prev => ({ ...prev, [field]: num }));
    } else {
      setFeatures(prev => ({ ...prev, [field]: rawVal }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Clinical Measurements</h3>
              <p className="text-[11px] text-slate-500">Live feature inputs evaluated by trained ML models</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Sample Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Load Preset Case
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PATIENTS.map(p => {
                const isSelected = selectedSampleId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectSample(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{p.id}</span>
                    <span className="text-[10px] opacity-80">({p.features.Age}y)</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Age */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Age (years)</label>
              <input
                type="number"
                min="18"
                max="105"
                value={features.Age}
                onChange={e => handleInputChange('Age', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Biological Sex</label>
              <select
                value={features.Gender}
                onChange={e => setFeatures(prev => ({ ...prev, Gender: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Systolic BP */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                min="70"
                max="240"
                value={features.SystolicBP}
                onChange={e => handleInputChange('SystolicBP', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                min="40"
                max="140"
                value={features.DiastolicBP}
                onChange={e => handleInputChange('DiastolicBP', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Pulse Rate */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Pulse Rate (bpm)</label>
              <input
                type="number"
                min="35"
                max="220"
                value={features.PulseRate}
                onChange={e => handleInputChange('PulseRate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Cholesterol */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                min="80"
                max="550"
                value={features.Cholesterol}
                onChange={e => handleInputChange('Cholesterol', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Glucose */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                min="50"
                max="450"
                value={features.Glucose || 110}
                onChange={e => handleInputChange('Glucose', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Smoking Status */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tobacco Smoking</label>
              <select
                value={features.SmokingStatus || 'Current Smoker'}
                onChange={e => setFeatures(prev => ({ ...prev, SmokingStatus: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="Non-Smoker">Non-Smoker</option>
                <option value="Former Smoker">Former Smoker</option>
                <option value="Current Smoker">Current Smoker</option>
              </select>
            </div>

            {/* ECG ST-Elevation */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ECG ST-Elevation</label>
              <select
                value={features.StElevation || 'No'}
                onChange={e => setFeatures(prev => ({ ...prev, StElevation: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="No">No (Normal)</option>
                <option value="Yes">Yes (Injury/STEMI)</option>
              </select>
            </div>

            {/* Echo RWMA */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Echo Wall Motion (RWMA)</label>
              <select
                value={features.RegionRWMA || 'No'}
                onChange={e => setFeatures(prev => ({ ...prev, RegionRWMA: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="No">No (Normal)</option>
                <option value="Yes">Yes (Hypokinesia)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Real-time ML sync active
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onRunPrediction();
                onClose();
              }}
              disabled={isPredicting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Update Predictions</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
