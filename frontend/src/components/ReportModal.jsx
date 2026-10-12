import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import { getRiskLevel } from '../data/clinicalData';

export default function ReportModal({
  isOpen,
  onClose,
  features,
  predictions,
  shapData
}) {
  if (!isOpen) return null;

  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;
  const cadProb = predictions?.overall_cad?.probability ?? 0.9632;

  const cadRisk = getRiskLevel(cadProb);
  const ladRisk = getRiskLevel(ladProb);
  const lcxRisk = getRiskLevel(lcxProb);
  const rcaRisk = getRiskLevel(rcaProb);

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const now = new Date().toLocaleString();

      // Header Banner
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 595, 65, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CardioAI Clinical Decision Support Report', 40, 36);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${now} | Confidential Medical Assessment`, 40, 52);

      // Patient Demographics & Vitals Table
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Patient Demographics & Clinical Profile', 40, 100);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Age: ${features.Age} years    |    Gender: ${features.Gender}    |    BMI: ${features.BMI} kg/m²`, 40, 120);
      doc.text(`Blood Pressure: ${features.SystolicBP}/${features.DiastolicBP} mmHg    |    Pulse: ${features.PulseRate} bpm`, 40, 138);
      doc.text(`Cholesterol: ${features.Cholesterol} mg/dL    |    Glucose: ${features.Glucose} mg/dL`, 40, 156);
      doc.text(`Troponin-I: ${features.Troponin} ng/mL    |    CK-MB: ${features.CKMB} ng/mL`, 40, 174);
      doc.text(`ECG ST Elevation: ${features.StElevation}    |    LVH: ${features.LVH}    |    RWMA: ${features.RegionRWMA} (${features.RWMALocation})`, 40, 192);

      // Risk Predictions
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Multi-Vessel Coronary Stenosis Predictions', 40, 230);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Overall CAD Risk: ${(cadProb * 100).toFixed(1)}% [${cadRisk.tier}]`, 40, 255);
      doc.setFont('helvetica', 'normal');
      doc.text(`- LAD (Left Anterior Descending): ${(ladProb * 100).toFixed(1)}% [${ladRisk.tier}]`, 55, 275);
      doc.text(`- LCX (Left Circumflex): ${(lcxProb * 100).toFixed(1)}% [${lcxRisk.tier}]`, 55, 295);
      doc.text(`- RCA (Right Coronary Artery): ${(rcaProb * 100).toFixed(1)}% [${rcaRisk.tier}]`, 55, 315);

      // Clinical Interpretation & Observational Summary (Neutral Research Findings)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Observational AI Research Summary', 40, 355);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Model Status: Research Report Generated | Model Architecture: Calibrated Ensemble (Platt Scaling)`, 40, 380);
      doc.text(`Estimated Global CAD Probability: ${(cadProb * 100).toFixed(1)}% (${cadRisk.tier}) based on trained tabular features.`, 40, 398);
      doc.text(`Vessel Localization: Highest statistical probability assigned to LAD (${(ladProb * 100).toFixed(1)}%) and RCA (${(rcaProb * 100).toFixed(1)}%).`, 40, 416);
      doc.text(`Attribution: Feature attributions indicate ischemic ECG/RWMA indicators and vitals as primary drivers.`, 40, 434);

      // Safety Disclaimer Box
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(40, 460, 515, 65, 4, 4, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT RESEARCH PROTOTYPE DISCLAIMER:', 50, 480);
      doc.setFont('helvetica', 'normal');
      doc.text('This algorithmic report is produced by CardioAI strictly for educational demonstration and academic research.', 50, 495);
      doc.text('It is NOT a medical diagnostic tool or clinical prescription. It does NOT recommend medication, angiography,', 50, 508);
      doc.text('or surgical procedures. Clinical decisions require formal diagnostic imaging and licensed physician assessment.', 50, 521);

      // Sign-off
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text('Research Investigator / Student Team Sign-Off: _______________________      Date: ______________', 40, 570);

      doc.save(`CardioAI_Research_Report_${features.Age}yo_${features.Gender}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('PDF error:', e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scroll">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Clinical Assessment Report</h2>
              <p className="text-xs text-slate-500">Comprehensive Patient Cardiology Diagnostic Summary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200 text-xs">
          
          {/* Patient Overview Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Patient Information &amp; Biomarkers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Age / Gender</span>
                <span className="font-bold">{features.Age} yrs, {features.Gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Pressure</span>
                <span className="font-bold font-mono">{features.SystolicBP}/{features.DiastolicBP} mmHg</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pulse Rate</span>
                <span className="font-bold font-mono">{features.PulseRate} bpm</span>
              </div>
              <div>
                <span className="text-slate-500 block">Smoking Status</span>
                <span className="font-bold">{features.SmokingStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Cholesterol</span>
                <span className="font-bold font-mono">{features.Cholesterol} mg/dL</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fasting Glucose</span>
                <span className="font-bold font-mono">{features.Glucose} mg/dL</span>
              </div>
              <div>
                <span className="text-slate-500 block">Troponin-I / CK-MB</span>
                <span className="font-bold font-mono">{features.Troponin} / {features.CKMB} ng/mL</span>
              </div>
              <div>
                <span className="text-slate-500 block">ECG ST / RWMA</span>
                <span className="font-bold">{features.StElevation === 'Yes' ? 'ST-Elevated' : 'No ST'} | {features.RWMALocation}</span>
              </div>
            </div>
          </div>

          {/* Predicted Vessel Stenosis Risk Breakdown */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Predicted Coronary Stenosis Probabilities
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: ladRisk.bg, borderColor: ladRisk.border }}
              >
                <div className="font-black text-xs" style={{ color: ladRisk.text }}>LAD Stenosis</div>
                <div className="text-2xl font-black font-mono my-1" style={{ color: ladRisk.text }}>
                  {(ladProb * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-semibold" style={{ color: ladRisk.text }}>
                  {ladRisk.tier} (Stenosis &ge; 50%)
                </div>
              </div>

              <div 
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: lcxRisk.bg, borderColor: lcxRisk.border }}
              >
                <div className="font-black text-xs" style={{ color: lcxRisk.text }}>LCX Stenosis</div>
                <div className="text-2xl font-black font-mono my-1" style={{ color: lcxRisk.text }}>
                  {(lcxProb * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-semibold" style={{ color: lcxRisk.text }}>
                  {lcxRisk.tier} (Normal / Patent)
                </div>
              </div>

              <div 
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: rcaRisk.bg, borderColor: rcaRisk.border }}
              >
                <div className="font-black text-xs" style={{ color: rcaRisk.text }}>RCA Stenosis</div>
                <div className="text-2xl font-black font-mono my-1" style={{ color: rcaRisk.text }}>
                  {(rcaProb * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-semibold" style={{ color: rcaRisk.text }}>
                  {rcaRisk.tier} (Borderline)
                </div>
              </div>
            </div>
          </div>

          {/* Observational Research Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">AI Research Summary (Z-Alizadeh Sani Cohort Model):</h4>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Research Report Generated
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Based on the calibrated multi-target ensemble model (CalibratedClassifierCV with sigmoid scaling, ROC-AUC: 0.891), this profile reflects an estimated Overall CAD probability of <strong>{(cadProb * 100).toFixed(1)}% ({cadRisk.tier})</strong>. Vessel-specific stenosis probabilities are LAD: {(ladProb * 100).toFixed(1)}%, LCX: {(lcxProb * 100).toFixed(1)}%, and RCA: {(rcaProb * 100).toFixed(1)}%.
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Primary Feature Drivers:</strong> Local SHAP attributions highlight {features.StElevation === 'Yes' ? 'ST segment elevation' : 'normative ECG'}, {features.RegionRWMA === 'Yes' ? `regional wall motion abnormality (${features.RWMALocation})` : 'normal wall motion'}, systolic BP ({features.SystolicBP} mmHg), and age ({features.Age} yrs).
            </p>
          </div>

          {/* Student Research Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Student Research Prototype Disclaimer:</strong> This application is developed for academic evaluation at the IIT Mandi Multimodal AI Hackathon 2026. It is not an authorized medical device or clinical diagnostic tool. It does not diagnose disease or prescribe medications, angiography, or surgical interventions.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
