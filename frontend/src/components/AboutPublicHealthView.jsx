import React, { useState } from 'react';
import { 
  Building2, 
  Languages, 
  Globe, 
  ShieldAlert, 
  Heart, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Stethoscope, 
  Scale, 
  Zap, 
  FileCheck,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AboutPublicHealthView() {
  const [lang, setLang] = useState('en');

  const content = {
    en: {
      badge: 'Academic Research Prototype — IIT Mandi Hackathon',
      title: 'About CardioAI & Indian Public Healthcare Application',
      subtitle: 'Conceptual design and research roadmap for accessible, zero-cost cardiovascular screening at Primary Health Centres (PHCs) and Ayushman Arogya Mandirs.',
      disclaimerTitle: 'Academic Research Prototype Notice',
      disclaimerBody: 'CardioAI has NOT been certified by the Central Drugs Standard Control Organisation (CDSCO) and is NOT currently deployed in live healthcare settings. This module represents an exploratory academic research submission for the IIT Mandi Hackathon 2026 examining how lightweight explainable machine learning could support non-invasive cardiovascular triage.',
      pillars: [
        {
          num: '01',
          title: 'The Clinical Problem in India',
          subtitle: 'Epidemic of Premature CAD & Rural Healthcare Deficit',
          desc: 'Cardiovascular disease (CVD) is the leading cause of mortality in India, accounting for over 28% of all deaths. In the Indian population, CAD manifests 10–15 years earlier than in Western nations. While tertiary metro hospitals offer advanced catheterization labs, over 70% of India’s rural and semi-urban population faces severe delays in accessing angiography, leading to missed windows for intervention.'
        },
        {
          num: '02',
          title: 'How CardioAI Works',
          subtitle: 'Multimodal Machine Learning on Tabular Biomarkers',
          desc: 'CardioAI uses calibrated ExtraTrees and Random Forest soft ensembles trained on clinical vitals (BP, pulse, BMI), serum biomarkers (cholesterol, glucose, troponin-I), and standard 12-lead ECG/Echo findings. Crucially, models are trained to eliminate target leakage by predicting vessel-specific stenosis (LAD, LCX, RCA) without relying on invasive catheterization ground truth as an input.'
        },
        {
          num: '03',
          title: 'Potential Future Use in Public Health',
          subtitle: 'Primary Health Centre (PHC) & Ayushman Arogya Mandir Triage',
          desc: 'Offers rapid decision-support triage for Medical Officers (MOs) and Community Health Officers (CHOs) evaluating symptomatic rural patients. By accurately identifying high-probability LAD (anterior wall) stenosis, the system can assist in prioritizing urgent tertiary center ambulance transfers while reducing unnecessary transfers for non-ischemic chest pain.'
        },
        {
          num: '04',
          title: 'Zero-Cost, Edge-First Architecture',
          subtitle: '100% Offline Browser / Device Execution',
          desc: 'Designed to execute entirely on standard sub-$300 refurbished laptops, tablets, or PHC desktop computers. CardioAI requires zero cloud GPU subscriptions, zero specialized imaging hardware, and zero recurring API fees. It functions with complete reliability even during rural internet and power disruptions.'
        },
        {
          num: '05',
          title: 'Proposed 3-Phase Validation Roadmap',
          subtitle: 'Structured Clinical Pathway from Lab to Clinic',
          desc: 'CardioAI outlines a rigorous evaluation protocol: Phase 1 (Multi-Center Retrospective Audit across diverse Indian cohorts), Phase 2 (Prospective Observational Triage Study under ICMR ethical guidelines), and Phase 3 (CDSCO Software-as-a-Medical-Device / SaMD regulatory clearance and ABDM integration).'
        },
        {
          num: '06',
          title: 'Limitations & Future Improvements',
          subtitle: 'Transparent Ethical AI Disclosure',
          desc: 'The current model is trained on the UCI Z-Alizadeh Sani benchmark (303 cases). Generalization across diverse Indian ethnic phenotypes requires fine-tuning on indigenous cohorts. CardioAI is purely an assistive screening tool and cannot, under any circumstances, replace formal invasive coronary angiography.'
        }
      ]
    },
    hi: {
      badge: 'शैक्षणिक अनुसंधान प्रोटोटाइप — IIT मंडी हैकाथॉन',
      title: 'CardioAI के बारे में और भारतीय सार्वजनिक स्वास्थ्य अनुप्रयोग',
      subtitle: 'प्राथमिक स्वास्थ्य केंद्रों (PHC) और आयुष्मान आरोग्य मंदिरों में सुलभ, शून्य-लागत हृदय जोखिम जांच के लिए एक अवधारणात्मक शोध योजना।',
      disclaimerTitle: 'शैक्षणिक अनुसंधान प्रोटोटाइप सूचना',
      disclaimerBody: 'CardioAI केंद्रीय औषधि मानक नियंत्रण संगठन (CDSCO) द्वारा प्रमाणित नहीं है और न ही यह वास्तविक अस्पतालों में लाइव तैनात है। यह मॉड्यूल IIT मंडी हैकाथॉन 2026 के लिए एक शैक्षणिक प्रोटोटाइप है, जो यह दर्शाता है कि कैसे व्याख्यात्मक AI ग्रामीण क्षेत्रों में प्राथमिक जांच में सहायता कर सकता है।',
      pillars: [
        {
          num: '01',
          title: 'भारत में नैदानिक समस्या',
          subtitle: 'असमय कोरोनरी धमनी रोग और ग्रामीण स्वास्थ्य सुविधाओं का अभाव',
          desc: 'भारत में कुल मौतों का 28% से अधिक हिस्सा हृदय रोगों (CVD) के कारण होता है। भारतीय आबादी में हृदय रोग पश्चिमी देशों की तुलना में 10-15 वर्ष पहले विकसित होता है। बड़े शहरों में आधुनिक कैथीटेराइजेशन लैब उपलब्ध हैं, लेकिन 70% से अधिक ग्रामीण आबादी के लिए एंजियोग्राफी तक पहुंच में भारी देरी होती है।'
        },
        {
          num: '02',
          title: 'CardioAI कैसे कार्य करता है',
          subtitle: 'बुनियादी परीक्षणों पर आधारित मल्टीमॉडल मशीन लर्निंग',
          desc: 'CardioAI रक्तचाप, पल्स, कोलेस्ट्रॉल, ट्रोपोनिन, ईसीजी और इको निष्कर्षों का उपयोग करके प्रशिक्षित मशीन लर्निंग मॉडल के माध्यम से धमनी-विशिष्ट (LAD, LCX, RCA) स्टेनोसिस जोखिम का अनुमान लगाता है।'
        },
        {
          num: '03',
          title: 'सार्वजनिक स्वास्थ्य में संभावित भविष्य',
          subtitle: 'प्राथमिक स्वास्थ्य केंद्र (PHC) और आयुष्मान आरोग्य मंदिर ट्राइएज',
          desc: 'ग्रामीण क्षेत्रों में मेडिकल अधिकारियों (MOs) को यह निर्णय लेने में मदद करता है कि किस मरीज को तुरंत बड़े जिला अस्पताल में रेफर करने की आवश्यकता है, विशेषकर जब LAD (प्रमुख धमनी) में उच्च जोखिम हो।'
        },
        {
          num: '04',
          title: 'शून्य-लागत एवं ऑफलाइन एज आर्किटेक्चर',
          subtitle: 'सस्ते कंप्यूटर पर 100% बिना इंटरनेट कार्य',
          desc: 'सस्ते लैपटॉप या टैबलेट पर बिना इंटरनेट या क्लाउड सर्वर के स्थानीय रूप से चलता है। इसमें किसी विशेष हार्डवेयर या आवर्ती सदस्यता शुल्क की आवश्यकता नहीं होती है।'
        },
        {
          num: '05',
          title: 'प्रस्तावित 3-चरणीय क्लिनिकल ट्रायल रोडमैप',
          subtitle: 'प्रयोगशाला से अस्पताल तक का व्यवस्थित मार्ग',
          desc: 'चरण 1: भारतीय अस्पतालों के डेटा पर पूर्वव्यापी ऑडिट। चरण 2: ICMR दिशानिर्देशों के तहत भावी अवलोकन अध्ययन। चरण 3: CDSCO मेडिकल डिवाइस नियमों के तहत विनियामक अनुमोदन।'
        },
        {
          num: '06',
          title: 'सीमाएं और भविष्य में सुधार',
          subtitle: 'पारदर्शी नैतिक AI प्रकटीकरण',
          desc: 'वर्तमान मॉडल 303 मामलों पर प्रशिक्षित है। वास्तविक उपयोग से पहले भारतीय आबादी पर व्यापक सत्यापन आवश्यक है। यह केवल एक सहायक स्क्रीनिंग टूल है और औपचारिक एंजियोग्राफी का विकल्प नहीं है।'
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 1. HEADER WITH LANGUAGE TOGGLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {t.badge}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Bilingual Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                lang === 'hi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* 2. ETHICAL ACADEMIC DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t.disclaimerTitle}</span>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          {t.disclaimerBody}
        </p>
      </div>

      {/* 3. SIX CORE PILLARS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {t.pillars.map((pillar, idx) => (
          <div 
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-black text-blue-600 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                  {pillar.num}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Research Pillar
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {pillar.title}
              </h3>
              <h4 className="text-[11px] font-semibold text-blue-700 mt-0.5">
                {pillar.subtitle}
              </h4>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {pillar.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>CardioAI Academic Architecture</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. CLINICAL TRIAL & VALIDATION ROADMAP DIAGRAM CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" />
          Structured Academic Validation Roadmap
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Before any real-world healthcare pilot can take place, CardioAI outlines three formal phases:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">Phase 1 (Months 1–6)</span>
            <h4 className="text-xs font-bold text-slate-900">Retrospective Multi-Center Audit</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Evaluating the ensemble on 2,500+ anonymized catheterization-correlated patient records across North, South, and East Indian hospital systems to assess demographic generalizability.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">Phase 2 (Months 7–18)</span>
            <h4 className="text-xs font-bold text-slate-900">Prospective Observational Triage Study</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Shadow screening study at select district hospitals alongside attending cardiologists to benchmark real-world sensitivity and specificity for critical LAD triage referrals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">Phase 3 (Months 19–24)</span>
            <h4 className="text-xs font-bold text-slate-900">CDSCO SaMD Compliance &amp; Pilot</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Formally submitting ISO 13485 and Medical Device Rules (MDR) documentation for Software as a Medical Device (SaMD) clearance and ABDM FHIR interoperability standards.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
