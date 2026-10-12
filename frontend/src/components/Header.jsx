import React, { useState } from 'react';
import { 
  Heart, 
  LayoutDashboard, 
  Box, 
  BarChart3, 
  Lightbulb, 
  GitCompare, 
  User, 
  ChevronDown, 
  Check, 
  Activity,
  FileText
} from 'lucide-react';
import { SAMPLE_PATIENTS } from '../data/clinicalData';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isLiveServer,
  selectedSampleId = 'PT-001',
  onSelectSample = null,
  onOpenReport = null
}) {
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '3d', label: '3D Visualization', icon: Box },
    { id: 'predictions', label: 'Predictions', icon: BarChart3 },
    { id: 'explainability', label: 'Explainability', icon: Lightbulb },
    { id: 'whatif', label: 'What-If Analysis', icon: GitCompare }
  ];

  const currentPatient = SAMPLE_PATIENTS.find(p => p.id === selectedSampleId) || SAMPLE_PATIENTS[0];

  return (
    <>
      {/* DESKTOP & TABLET HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* LEFT: CardioAI Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center transition group-hover:scale-105">
              <Heart className="w-5 h-5 fill-blue-600 stroke-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  Cardio<span className="text-blue-600">AI</span>
                </span>
                {isLiveServer && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Model Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-none mt-1 hidden sm:block">
                Clinical Cardiology Intelligence
              </p>
            </div>
          </div>

          {/* CENTER: Segmented Pill Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/60 shadow-2xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Patient Profile Pill Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick Patient Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentPatient.features.Gender === 'Male' ? 'M' : 'F'}
                </div>
                <span className="hidden sm:inline font-mono">{currentPatient.id}</span>
                <span className="text-slate-500 font-normal hidden sm:inline">
                  ({currentPatient.features.Age}y)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {patientDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Clinical Case
                  </div>
                  {SAMPLE_PATIENTS.map((p) => {
                    const isSelected = p.id === currentPatient.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (onSelectSample) onSelectSample(p.id);
                          setPatientDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{p.id}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({p.features.Age}y, {p.features.Gender})
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 truncate max-w-[170px]">
                            {p.description}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Report Button */}
            {onOpenReport && (
              <button
                type="button"
                onClick={onOpenReport}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                title="Generate Diagnostic PDF Report"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Report</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MOBILE COMPACT BOTTOM NAVIGATION BAR (Consumer App Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around py-2 px-1 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
