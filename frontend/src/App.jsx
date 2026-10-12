import React, { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import Header from './components/Header';
import PatientInputCard from './components/PatientInputCard';
import Heart3DViewer, { KeyPatientMetricsCard } from './components/Heart3DViewer';
import PredictionExplainabilityCard from './components/PredictionExplainabilityCard';
import { 
  ModelPerformanceCard, 
  DownloadExportCard 
} from './components/BottomRowCards';
import ReportModal from './components/ReportModal';
import { 
  PredictionsFullView, 
  ExplainabilityFullView, 
  ReportsFullView,
  WhatIfAnalysisFullView,
  PublicHealthFullView 
} from './components/TabsViews';
import { 
  DEFAULT_PATIENT_FEATURES, 
  DEFAULT_PREDICTIONS, 
  DEFAULT_SHAP_DATA,
  SAMPLE_PATIENTS,
  computeDynamicShap
} from './data/clinicalData';
import { 
  runPredictionApi, 
  runExplainApi, 
  checkBackendHealth,
  computeLocalRiskEstimation 
} from './services/api';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Patient Input Form States
  const [inputMode, setInputMode] = useState('manual');
  const [selectedSampleId, setSelectedSampleId] = useState('PT-001');
  const [features, setFeatures] = useState(DEFAULT_PATIENT_FEATURES);
  
  // Predictions & Explainability
  const [predictions, setPredictions] = useState(DEFAULT_PREDICTIONS);
  const [shapData, setShapData] = useState(DEFAULT_SHAP_DATA);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLiveServer, setIsLiveServer] = useState(false);

  // PDF Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initial backend health check
  useEffect(() => {
    async function checkServer() {
      const res = await checkBackendHealth();
      if (res && res.status === 'healthy') {
        setIsLiveServer(true);
      }
    }
    checkServer();
  }, []);

  // Real-Time Reactive Predictions & Explainability
  // Debounced asynchronous server call directly to calibrated ML models (single source of truth)
  useEffect(() => {
    if (inputMode === 'sample') return;

    const timer = setTimeout(async () => {
      try {
        const [predRes, explainRes] = await Promise.all([
          runPredictionApi(features),
          runExplainApi(features)
        ]);

        if (predRes && predRes.overall_cad) {
          setPredictions(predRes);
        }
        if (explainRes && explainRes.explanations && Array.isArray(explainRes.explanations['Overall CAD'])) {
          setShapData(explainRes.explanations);
        }
      } catch (err) {
        console.warn('Real-time sync API fallback:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [features, inputMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sample Patient Selection: Immediately updates ALL results across dashboard & 3D heart
  const handleSelectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    setInputMode('sample');
    const sample = SAMPLE_PATIENTS.find(p => p.id === sampleId);
    if (!sample) return;

    // 1. Immediately update features to sample patient
    setFeatures(sample.features);

    // 2. Immediately update predictions to sample patient's predictions (calibrated ML model outputs)
    if (sample.predictions) {
      setPredictions(sample.predictions);
    }

    // 3. Immediately update SHAP explanations to sample patient's SHAP attributions
    if (sample.shap) {
      setShapData(sample.shap);
    }

    showToast(`Loaded ${sample.name} — Model predictions active.`);
  };

  // Run Prediction Handler
  const handleRunPrediction = async () => {
    setIsPredicting(true);
    try {
      const [predRes, explainRes] = await Promise.all([
        runPredictionApi(features),
        runExplainApi(features)
      ]);
      if (predRes && predRes.overall_cad) {
        setPredictions(predRes);
      }
      if (explainRes && explainRes.explanations && Array.isArray(explainRes.explanations['Overall CAD'])) {
        setShapData(explainRes.explanations);
      }
      showToast('Cardiovascular risk prediction updated.');
    } catch (err) {
      console.error(err);
      showToast('Error updating prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Save Visualization Screenshot (Image)
  const handleSaveVisualization = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      setActiveTab('3d');
      showToast('Opening 3D Studio to view and save 3D heart visualization...');
      return;
    }
    try {
      const imageURI = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `CardioAI_3D_Heart_${Date.now()}.png`;
      link.href = imageURI;
      link.click();
      showToast('3D Heart visualization image saved.');
    } catch (e) {
      console.error(e);
      showToast('Error saving visualization image.');
    }
  };

  // Download Model Outputs (CSV)
  const handleDownloadCSV = () => {
    const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
    const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
    const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;
    const cadProb = predictions?.overall_cad?.probability ?? 0.9632;

    const rows = [
      ['Metric', 'Value', 'Risk_Tier', 'Notes'],
      ['Overall_CAD_Probability', cadProb, predictions.overall_cad.tier, 'Global Ischemic Burden'],
      ['LAD_Stenosis_Probability', ladProb, predictions.vessels.LAD.tier, 'Left Anterior Descending'],
      ['LCX_Stenosis_Probability', lcxProb, predictions.vessels.LCX.tier, 'Left Circumflex'],
      ['RCA_Stenosis_Probability', rcaProb, predictions.vessels.RCA.tier, 'Right Coronary Artery'],
      ['Model_Confidence', `${predictions.overall_cad.confidence}%`, 'Confidence', 'XGBoost Validation AUC: 0.91'],
      ['Patient_Age', features.Age, 'Years', 'Demographics'],
      ['Patient_Gender', features.Gender, 'Sex', 'Demographics'],
      ['Blood_Pressure', `${features.SystolicBP}/${features.DiastolicBP}`, 'mmHg', 'Vitals'],
      ['Total_Cholesterol', features.Cholesterol, 'mg/dL', 'Biomarkers'],
      ['Troponin_I', features.Troponin, 'ng/mL', 'Enzymes'],
      ['CK_MB', features.CKMB, 'ng/mL', 'Enzymes']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CardioAI_Model_Outputs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Model predictions exported as CSV.');
  };

  return (
    <div className="min-h-screen bg-[#EEF4FA] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. TOP HEADER NAVIGATION BAR (2nd tab removed) */}
      <Header
        activeTab={activeTab === 'patient' ? 'dashboard' : activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        isLiveServer={isLiveServer}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            {toastMessage}
          </div>
        )}

        {/* TAB 1: DASHBOARD VIEW (Clean, Responsive, Self-Adjusting Workspace) */}
        {(activeTab === 'dashboard' || activeTab === 'patient') && (
          <div className="space-y-4 sm:space-y-5">
            
            {/* TOP CLINICAL TELEMETRY STRIP: 6 Key Patient Biomarkers */}
            <KeyPatientMetricsCard
              features={features}
            />

            {/* MAIN CLINICAL COLUMNS: Balanced 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
              
              {/* LEFT COLUMN: Patient Clinical Inputs */}
              <div className="w-full">
                <PatientInputCard
                  features={features}
                  setFeatures={setFeatures}
                  inputMode={inputMode}
                  setInputMode={setInputMode}
                  selectedSampleId={selectedSampleId}
                  setSelectedSampleId={setSelectedSampleId}
                  onSelectSample={handleSelectSample}
                  onRunPrediction={handleRunPrediction}
                  isPredicting={isPredicting}
                />
              </div>

              {/* RIGHT COLUMN: Prediction Assessment & 3D Studio Trigger */}
              <div className="w-full flex flex-col gap-4 sm:gap-5">
                <PredictionExplainabilityCard
                  predictions={predictions}
                />

                {/* Quick Link Card to 3D Visualization Studio */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs hover:border-blue-200 hover:shadow-sm transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-none">Dedicated 3D Heart Studio</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Interactive 360° anatomical heart with Left Anterior Descending (LAD), Left Circumflex (LCX), and Right Coronary Artery (RCA) perfusion mapping.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('3d')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <span>Open 3D Studio</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: Model Performance and Download/Export (Equal 50/50 Self-Adjusting Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
              
              <div className="h-full">
                <ModelPerformanceCard />
              </div>

              <div className="h-full">
                <DownloadExportCard
                  onGenerateReport={() => setIsReportOpen(true)}
                  onSaveVisualization={handleSaveVisualization}
                  onDownloadCSV={handleDownloadCSV}
                />
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DEDICATED 3D VISUALIZATION VIEW */}
        {activeTab === '3d' && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold mb-2">Expanded 3D Cardiology Studio</h2>
            <Heart3DViewer
              features={features}
              predictions={predictions}
            />
          </div>
        )}

        {/* TAB 3: PREDICTIONS FULL VIEW */}
        {activeTab === 'predictions' && (
          <PredictionsFullView predictions={predictions} />
        )}

        {/* TAB 4: EXPLAINABILITY FULL VIEW */}
        {activeTab === 'explainability' && (
          <ExplainabilityFullView
            features={features}
            predictions={predictions}
            shapData={shapData}
            selectedSampleId={selectedSampleId}
            inputMode={inputMode}
            onSelectSample={handleSelectSample}
          />
        )}

        {/* TAB 5: WHAT-IF ANALYSIS FULL VIEW */}
        {activeTab === 'whatif' && (
          <WhatIfAnalysisFullView
            features={features}
            predictions={predictions}
          />
        )}
      </main>

      {/* Clinical Diagnostic PDF Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        features={features}
        predictions={predictions}
        shapData={shapData}
      />

    </div>
  );
}

