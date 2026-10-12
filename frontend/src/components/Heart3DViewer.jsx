import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Move, 
  RefreshCw, 
  Eye, 
  ChevronDown, 
  Box, 
  Heart, 
  Activity, 
  Layers, 
  Maximize2,
  Stethoscope,
  User,
  Droplet,
  FlaskConical,
  BarChart2,
  Compass,
  Sliders,
  Check
} from 'lucide-react';
import { getRiskLevel } from '../data/clinicalData';

// Helper function: Shortest angular difference between target and current (-180 to +180)
function shortestAngleDiff(target, current) {
  let diff = (target - current) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

// Compute continuous, smooth blending weights for cardinal views (sum to 1.0)
function getViewWeights(yaw, isTopView) {
  if (isTopView) {
    return { anterior: 0, right: 0, posterior: 0, left: 0, top: 1 };
  }
  const cardinal = [
    { id: 'anterior', angle: 0 },
    { id: 'right', angle: 90 },
    { id: 'posterior', angle: 180 },
    { id: 'left', angle: 270 }
  ];
  const weights = { top: 0 };
  for (const c of cardinal) {
    const d = Math.abs(shortestAngleDiff(yaw, c.angle));
    if (d >= 90) {
      weights[c.id] = 0;
    } else {
      const rad = (d / 90) * (Math.PI / 2);
      weights[c.id] = Math.cos(rad) * Math.cos(rad);
    }
  }
  return weights;
}

// Real anatomical views of the heart from all cardinal angles
const REAL_HEART_VIEWS = {
  anterior: {
    id: 'anterior',
    label: 'Anterior (Frontal)',
    angleDeg: 0,
    image: '/assets/heart_anterior.jpg',
    description: 'Frontal anterior view showing the LAD artery, anterior interventricular groove, and apex.',
    primaryVessel: 'LAD',
    callouts: [
      {
        id: 'LAD',
        title: 'LAD (Left Anterior Descending)',
        type: 'vessel',
        x: 58,
        y: 62,
        riskTier: 'High Risk',
        riskColor: 'text-red-500',
        borderColor: '#DC2626',
        badgeBg: 'bg-red-600',
        vesselKey: 'LAD',
        detail: 'Courses down the anterior interventricular groove towards apex. High stenosis probability.'
      },
      {
        id: 'LCX_PROX',
        title: 'LCX (Circumflex Origin)',
        type: 'vessel',
        x: 68,
        y: 49,
        riskTier: 'Low Risk',
        riskColor: 'text-emerald-400',
        borderColor: '#10B981',
        badgeBg: 'bg-emerald-500',
        vesselKey: 'LCX',
        detail: 'Emerges from Left Main, winds along left atrioventricular groove. Patent.'
      },
      {
        id: 'RCA_PROX',
        title: 'RCA (Right Coronary)',
        type: 'vessel',
        x: 43,
        y: 53,
        riskTier: 'Moderate Risk',
        riskColor: 'text-amber-400',
        borderColor: '#F59E0B',
        badgeBg: 'bg-amber-500',
        vesselKey: 'RCA',
        detail: 'Arises from right aortic sinus, traverses right coronary sulcus.'
      }
    ]
  },
  right: {
    id: 'right',
    label: 'Right Lateral (RAO)',
    angleDeg: 90,
    image: '/assets/heart_right.jpg',
    description: 'Right cardiac margin showing the Right Coronary Artery (RCA) coursing to the acute margin.',
    primaryVessel: 'RCA',
    callouts: [
      {
        id: 'RCA_FULL',
        title: 'RCA (Right Coronary Artery)',
        type: 'vessel',
        x: 44,
        y: 56,
        riskTier: 'Moderate Risk',
        riskColor: 'text-amber-400',
        borderColor: '#F59E0B',
        badgeBg: 'bg-amber-500',
        vesselKey: 'RCA',
        detail: 'Traverses the right atrioventricular groove. Stenosis causes inferior myocardial ischemia.'
      },
      {
        id: 'RCA_ACUTE',
        title: 'Acute Marginal Branch',
        type: 'anatomy',
        x: 42,
        y: 69,
        riskTier: 'Branch',
        riskColor: 'text-amber-300',
        borderColor: '#D97706',
        badgeBg: 'bg-amber-600',
        detail: 'Perfuses the anterior and diaphragmatic wall of the right ventricle.'
      },
      {
        id: 'RA',
        title: 'Right Atrium (RA)',
        type: 'anatomy',
        x: 39,
        y: 43,
        riskTier: 'Chamber',
        riskColor: 'text-blue-300',
        borderColor: '#38BDF8',
        badgeBg: 'bg-blue-500',
        detail: 'Receives deoxygenated systemic venous return via SVC and IVC.'
      }
    ]
  },
  posterior: {
    id: 'posterior',
    label: 'Posterior (Back Wall)',
    angleDeg: 180,
    image: '/assets/heart_posterior.jpg',
    description: 'Posterior and diaphragmatic surface showing the Left Ventricle posterior wall, PDA, and Coronary Sinus.',
    primaryVessel: 'PDA',
    callouts: [
      {
        id: 'PDA',
        title: 'Posterior Descending Artery (PDA)',
        type: 'vessel',
        x: 52,
        y: 70,
        riskTier: 'Coronary Branch',
        riskColor: 'text-amber-400',
        borderColor: '#F59E0B',
        badgeBg: 'bg-amber-500',
        detail: 'Supplies the posterior 1/3 of the interventricular septum.'
      },
      {
        id: 'POST_LV',
        title: 'Posterior Wall (Left Ventricle)',
        type: 'anatomy',
        x: 38,
        y: 66,
        riskTier: 'Myocardium',
        riskColor: 'text-purple-300',
        borderColor: '#A855F7',
        badgeBg: 'bg-purple-600',
        detail: 'Crucial segment for detecting inferior-posterior myocardial infarction.'
      },
      {
        id: 'CORONARY_SINUS',
        title: 'Coronary Sinus',
        type: 'anatomy',
        x: 36,
        y: 52,
        riskTier: 'Venous Return',
        riskColor: 'text-blue-400',
        borderColor: '#60A5FA',
        badgeBg: 'bg-blue-600',
        detail: 'Large venous trunk collecting blood from myocardium into the Right Atrium.'
      }
    ]
  },
  left: {
    id: 'left',
    label: 'Left Lateral (LAO)',
    angleDeg: 270,
    image: '/assets/heart_left.jpg',
    description: 'Left cardiac margin highlighting the Left Circumflex Artery (LCX) and Obtuse Marginal branch (OM1).',
    primaryVessel: 'LCX',
    callouts: [
      {
        id: 'LCX_FULL',
        title: 'LCX (Left Circumflex Artery)',
        type: 'vessel',
        x: 63,
        y: 50,
        riskTier: 'Low Risk',
        riskColor: 'text-emerald-400',
        borderColor: '#10B981',
        badgeBg: 'bg-emerald-500',
        vesselKey: 'LCX',
        detail: 'Traverses left AV sulcus, perfusing lateral and posterior LV free walls.'
      },
      {
        id: 'OM1',
        title: 'OM1 (Obtuse Marginal Branch)',
        type: 'vessel',
        x: 64,
        y: 62,
        riskTier: 'Branch',
        riskColor: 'text-emerald-300',
        borderColor: '#059669',
        badgeBg: 'bg-emerald-600',
        vesselKey: 'LCX',
        detail: 'Major lateral branch perfusing the left ventricular free wall.'
      },
      {
        id: 'LAA',
        title: 'Left Atrial Appendage (LAA)',
        type: 'anatomy',
        x: 65,
        y: 38,
        riskTier: 'Structure',
        riskColor: 'text-indigo-300',
        borderColor: '#818CF8',
        badgeBg: 'bg-indigo-600',
        detail: 'Muscular sac projecting from left atrium; common site for thrombus in AFib.'
      }
    ]
  },
  top: {
    id: 'top',
    label: 'Superior (Aortic Arch)',
    angleDeg: 360,
    image: '/assets/heart_top.jpg',
    description: 'Superior cranial view displaying the ascending aorta, aortic arch, and pulmonary artery bifurcation.',
    primaryVessel: 'Aorta',
    callouts: [
      {
        id: 'AORTA_ARCH',
        title: 'Aortic Arch & Supra-Branches',
        type: 'great_vessel',
        x: 52,
        y: 32,
        riskTier: 'Great Vessel',
        riskColor: 'text-red-400',
        borderColor: '#EF4444',
        badgeBg: 'bg-red-600',
        detail: 'Supplies systemic circulation; gives off brachiocephalic, carotid, and subclavian trunks.'
      },
      {
        id: 'PULMONARY_TRUNK',
        title: 'Pulmonary Trunk & Conus',
        type: 'great_vessel',
        x: 43,
        y: 37,
        riskTier: 'Artery',
        riskColor: 'text-sky-400',
        borderColor: '#38BDF8',
        badgeBg: 'bg-sky-600',
        detail: 'Carries deoxygenated blood from right ventricle to the pulmonary vascular beds.'
      }
    ]
  }
};

export default function Heart3DViewer({
  features,
  predictions
}) {
  const containerRef = useRef(null);

  // Rotation & Physics States (Manual user-controlled rotation by default)
  const [currentYawDeg, setCurrentYawDeg] = useState(0);
  const [pitchOffset, setPitchOffset] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeView, setActiveView] = useState('Anterior');
  const [activePreset, setActivePreset] = useState('heart');
  const [showAnatomyLabels, setShowAnatomyLabels] = useState(true);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [selectedVesselInfo, setSelectedVesselInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // High-precision animation & physics refs
  const currentYawRef = useRef(0);
  const targetYawRef = useRef(0);
  const currentPitchRef = useRef(0);
  const targetPitchRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startYaw: 0, startPitch: 0 });
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef({ yaw: 0, pitch: 0 });

  // Extract risk probabilities
  const ladProb = predictions?.vessels?.LAD?.probability ?? 0.9056;
  const lcxProb = predictions?.vessels?.LCX?.probability ?? 0.6421;
  const rcaProb = predictions?.vessels?.RCA?.probability ?? 0.5126;

  const ladRisk = getRiskLevel(ladProb);
  const lcxRisk = getRiskLevel(lcxProb);
  const rcaRisk = getRiskLevel(rcaProb);

  // Static diagnostic images for non-heart options
  const diagnosticPresetImages = {
    heart: '/assets/heart_anterior.jpg',
    arteries: '/assets/coronary_tree.jpg',
    torso: '/assets/torso.jpg',
    xray: '/assets/xray.jpg',
    'cross-section': '/assets/cross_section.jpg'
  };

  // Preload all real heart images so transitions are zero-latency
  useEffect(() => {
    Object.values(REAL_HEART_VIEWS).forEach(v => {
      const img = new Image();
      img.src = v.image;
    });
    Object.values(diagnosticPresetImages).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Compute multi-view cross-fade weights continuously
  const viewWeights = useMemo(() => {
    return getViewWeights(currentYawDeg, activeView === 'Top');
  }, [currentYawDeg, activeView]);

  // Main 60fps Smooth Animation & Inertia Physics Loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const renderLoop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (activePreset === 'heart') {
        if (autoRotate && !isDraggingRef.current) {
          // Perfectly continuous, smooth 15 deg/sec turntable spin for optimal clinical analysis
          const nextYaw = (currentYawRef.current + 15 * dt) % 360;
          currentYawRef.current = nextYaw;
          targetYawRef.current = nextYaw;
          setCurrentYawDeg(nextYaw);
        } else if (isDraggingRef.current) {
          // While dragging: ultra-responsive follow with slight smoothing
          const diff = shortestAngleDiff(targetYawRef.current, currentYawRef.current);
          currentYawRef.current = (currentYawRef.current + diff * 0.8 + 360) % 360;
          currentPitchRef.current += (targetPitchRef.current - currentPitchRef.current) * 0.8;
          setCurrentYawDeg(currentYawRef.current);
          setPitchOffset(currentPitchRef.current);
        } else {
          // Inertial glide on release
          if (Math.abs(velocityRef.current.yaw) > 0.05) {
            targetYawRef.current = (targetYawRef.current + velocityRef.current.yaw * dt + 360) % 360;
            velocityRef.current.yaw *= Math.pow(0.89, dt * 60); // smooth air friction
          } else {
            velocityRef.current.yaw = 0;
          }

          // Smooth exponential spring lerp towards target angle
          const diff = shortestAngleDiff(targetYawRef.current, currentYawRef.current);
          const factor = 1 - Math.exp(-12 * dt);

          if (Math.abs(diff) > 0.02) {
            currentYawRef.current = (currentYawRef.current + diff * factor + 360) % 360;
          } else {
            currentYawRef.current = targetYawRef.current;
          }

          const pitchDiff = targetPitchRef.current - currentPitchRef.current;
          if (Math.abs(pitchDiff) > 0.02) {
            currentPitchRef.current += pitchDiff * factor;
          } else {
            currentPitchRef.current = targetPitchRef.current;
          }

          setCurrentYawDeg(currentYawRef.current);
          setPitchOffset(currentPitchRef.current);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, activePreset]);

  // Mouse & Touch Drag Handlers with Velocity Inertia
  const handleMouseDown = (e) => {
    if (activePreset !== 'heart') return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: targetYawRef.current,
      startPitch: targetPitchRef.current
    };
    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || activePreset !== 'heart') return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastPointerRef.current.time) / 1000);
    const dx = e.clientX - lastPointerRef.current.x;
    const totalDx = e.clientX - dragStartRef.current.x;
    const totalDy = e.clientY - dragStartRef.current.y;

    // 1px = 0.42 degrees of rotation
    const newYaw = (dragStartRef.current.startYaw + totalDx * 0.42 + 360) % 360;
    const newPitch = Math.max(-16, Math.min(16, dragStartRef.current.startPitch - totalDy * 0.12));

    targetYawRef.current = newYaw;
    targetPitchRef.current = newPitch;

    // Smooth velocity estimation
    const instVelocity = (dx * 0.42) / dt;
    velocityRef.current.yaw = velocityRef.current.yaw * 0.35 + instVelocity * 0.65;

    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // Clamp inertia velocity for smooth, controlled glide
    velocityRef.current.yaw = Math.max(-85, Math.min(85, velocityRef.current.yaw));
    if (Math.abs(velocityRef.current.yaw) < 3) {
      velocityRef.current.yaw = 0;
    }
  };

  const handleTouchStart = (e) => {
    if (activePreset !== 'heart' || e.touches.length !== 1) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      startYaw: targetYawRef.current,
      startPitch: targetPitchRef.current
    };
    lastPointerRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: performance.now()
    };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || activePreset !== 'heart') return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastPointerRef.current.time) / 1000);
    const dx = e.touches[0].clientX - lastPointerRef.current.x;
    const totalDx = e.touches[0].clientX - dragStartRef.current.x;
    const totalDy = e.touches[0].clientY - dragStartRef.current.y;

    const newYaw = (dragStartRef.current.startYaw + totalDx * 0.42 + 360) % 360;
    const newPitch = Math.max(-16, Math.min(16, dragStartRef.current.startPitch - totalDy * 0.12));

    targetYawRef.current = newYaw;
    targetPitchRef.current = newPitch;

    const instVelocity = (dx * 0.42) / dt;
    velocityRef.current.yaw = velocityRef.current.yaw * 0.35 + instVelocity * 0.65;

    lastPointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: now };
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Preset Angle Selection with Smooth Gliding Animation
  const handleSelectView = (viewName) => {
    setActiveView(viewName);
    setViewDropdownOpen(false);
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    targetPitchRef.current = 0;

    if (activePreset === 'heart') {
      let destDeg = 0;
      switch (viewName) {
        case 'Anterior': destDeg = 0; break;
        case 'Right': destDeg = 90; break;
        case 'Posterior': destDeg = 180; break;
        case 'Left': destDeg = 270; break;
        case 'Top': destDeg = 0; break;
        default: break;
      }
      targetYawRef.current = destDeg;
    }
  };

  // 90° Turn with Smooth Sweep
  const handleTurn90 = () => {
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    targetYawRef.current = (targetYawRef.current + 90) % 360;
    if (activeView === 'Top') setActiveView('Anterior');
  };

  // Slider Scrubber Handler
  const handleScrubRotation = (deg) => {
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    targetYawRef.current = deg;
    currentYawRef.current = deg;
    setCurrentYawDeg(deg);
    if (activeView === 'Top') setActiveView('Anterior');
  };

  // Zoom Handler
  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.max(0.75, Math.min(1.85, prev + delta)));
  };

  // Reset to 0° Frontal Position with Smooth Transition
  const handleReset = () => {
    setAutoRotate(false);
    velocityRef.current = { yaw: 0, pitch: 0 };
    targetYawRef.current = 0;
    targetPitchRef.current = 0;
    setZoomLevel(1);
    setActiveView('Anterior');
  };

  // Orientation text label
  const getOrientationLabel = (deg) => {
    if (activeView === 'Top') return 'Superior (Aortic Arch & Base)';
    const d = Math.round(deg);
    if (d >= 335 || d < 25) return 'Anterior (Front Wall - LAD)';
    if (d >= 25 && d < 65) return 'Right Anterior Oblique (RAO 45°)';
    if (d >= 65 && d < 115) return 'Right Margin (RCA Sulcus)';
    if (d >= 115 && d < 155) return 'Infero-Posterior Wall';
    if (d >= 155 && d < 205) return 'Posterior (Back Wall - PDA)';
    if (d >= 205 && d < 245) return 'Postero-Lateral Wall';
    if (d >= 245 && d < 295) return 'Left Margin (LCX Lateral Wall)';
    if (d >= 295 && d < 335) return 'Left Anterior Oblique (LAO 45°)';
    return 'Anterior';
  };

  // Heartbeat pulse calculation
  const bpm = features?.PulseRate || 92;
  const pulseDurationSec = 60 / bpm;

  return (
    <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-4 transition-colors">
      
      {/* 1. Header with title & top-right selectors */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Box className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-none">
              3D Heart Visualization
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {activePreset === 'heart' 
                ? 'High-fidelity anatomical real heart with smooth 360° rotational analysis inside thoracic cage' 
                : 'Diagnostic anatomical reference view'}
            </p>
          </div>
        </div>

        {/* Top-Right Controls: [View: Anterior ˇ] and [Layers ˇ] */}
        <div className="flex items-center gap-2">
          {/* View Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>View: {activeView}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 text-xs">
                {['Anterior', 'Posterior', 'Left', 'Right', 'Top'].map(v => (
                  <button
                    key={v}
                    onClick={() => handleSelectView(v)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between ${
                      activeView === v ? 'font-bold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{v}</span>
                    {activeView === v && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layers Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
              className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3 h-3 text-blue-600" />
              <span>Layers</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {layerDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40 text-xs">
                {[
                  { id: 'heart', label: 'Heart (Rotatable)' },
                  { id: 'arteries', label: 'Coronary Tree' },
                  { id: 'torso', label: 'Torso Anatomy' },
                  { id: 'xray', label: 'X-Ray View' },
                  { id: 'cross-section', label: 'Cross Section' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setActivePreset(l.id); setLayerDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between ${
                      activePreset === l.id ? 'font-bold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    {activePreset === l.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 3D Viewport Stage */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative my-2.5 w-full h-[400px] lg:h-[430px] rounded-xl overflow-hidden bg-[#040914] border border-slate-200/80 shadow-inner select-none ${
          activePreset === 'heart' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* OPTION 1: REAL HEART (ROTATES ONLY IN HEART PRESET, IMAGE LOOKS 100% REAL) */}
        {activePreset === 'heart' ? (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            
            {/* The Real Anatomical Heart Image Layers in Smooth 3D Perspective */}
            <div 
              className="w-full h-full relative flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
              style={{
                transform: `scale(${zoomLevel})`
              }}
            >
              {/* Stable Real Anatomical Heart Canvas Container (No Beating / Vibration) */}
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Continuous Multi-Angle Photorealistic Heart Views with Zero Snap & Zero Flash */}
                {Object.entries(REAL_HEART_VIEWS).map(([viewKey, viewData]) => {
                  const weight = viewWeights[viewKey] || 0;
                  if (weight <= 0.001) return null;

                  // Smooth 3D perspective parallax tilt
                  const cardinalDeg = viewData.angleDeg === 360 ? 0 : viewData.angleDeg;
                  const angleOffset = viewKey === 'top' ? 0 : shortestAngleDiff(currentYawDeg, cardinalDeg);
                  const perspectiveYaw = angleOffset * 0.38;

                  return (
                    <img 
                      key={viewKey}
                      src={viewData.image} 
                      alt={viewData.label}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl will-change-transform will-change-opacity"
                      style={{
                        opacity: weight,
                        transform: `perspective(1100px) rotateY(${perspectiveYaw}deg) rotateX(${pitchOffset}deg)`
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Live Rotation Degree & Orientation Badge (Center-Top Pill) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-700/80 text-[10px] text-white z-20 pointer-events-none shadow-md">
              <Compass className={`w-3.5 h-3.5 text-blue-400 ${autoRotate ? 'animate-spin' : ''}`} />
              <span className="font-mono font-bold">Heart Angle: {Math.round(currentYawDeg)}°</span>
              <span className="text-slate-500">|</span>
              <span className="text-blue-300 font-semibold">{getOrientationLabel(currentYawDeg)}</span>
            </div>

            {/* SMOOTH ANATOMICAL VESSEL CALLOUTS ON THE REAL HEART */}
            {showAnatomyLabels && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {Object.entries(REAL_HEART_VIEWS).map(([viewKey, viewData]) => {
                  const weight = viewWeights[viewKey] || 0;
                  if (weight <= 0.15 || !viewData.callouts) return null;

                  // Smooth opacity ramp for beacons as view comes into focus
                  const beaconOpacity = Math.min(1, Math.max(0, (weight - 0.15) / 0.35));
                  const cardinalDeg = viewData.angleDeg === 360 ? 0 : viewData.angleDeg;
                  const angleOffset = viewKey === 'top' ? 0 : shortestAngleDiff(currentYawDeg, cardinalDeg);
                  const horizontalParallax = angleOffset * 0.45;

                  return viewData.callouts.map((c) => {
                    let probDisplay = null;
                    let currentRisk = null;
                    if (c.vesselKey === 'LAD') {
                      probDisplay = ladProb.toFixed(2);
                      currentRisk = ladRisk;
                    } else if (c.vesselKey === 'LCX') {
                      probDisplay = lcxProb.toFixed(2);
                      currentRisk = lcxRisk;
                    } else if (c.vesselKey === 'RCA') {
                      probDisplay = rcaProb.toFixed(2);
                      currentRisk = rcaRisk;
                    }

                    const activeRiskTier = currentRisk ? currentRisk.tier : c.riskTier;
                    const activeBorderColor = currentRisk ? currentRisk.hex : c.borderColor;
                    const activeRiskColor = currentRisk 
                      ? (currentRisk.tier === 'High Risk' ? 'text-red-500' : currentRisk.tier === 'Moderate Risk' ? 'text-amber-400' : 'text-emerald-400')
                      : c.riskColor;

                    return (
                      <div
                        key={`${viewKey}-${c.id}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
                        style={{
                          left: `calc(${c.x}% + ${horizontalParallax}px)`,
                          top: `${c.y}%`,
                          opacity: beaconOpacity,
                          pointerEvents: beaconOpacity > 0.45 ? 'auto' : 'none'
                        }}
                        onClick={() => setSelectedVesselInfo({
                          name: c.title,
                          stenosis: probDisplay ? `${(Number(probDisplay) * 100).toFixed(0)}%` : activeRiskTier,
                          tier: activeRiskTier,
                          territory: c.detail,
                          implication: c.vesselKey === 'LAD'
                            ? `Anterior wall risk (${activeRiskTier}): ${ladProb >= 0.7 ? 'Critical stenosis carries high risk of anterior myocardial infarction.' : 'Patent / non-obstructive anterior perfusion.'}`
                            : c.vesselKey === 'RCA'
                            ? `Inferior wall risk (${activeRiskTier}): ${rcaProb >= 0.7 ? 'Severe right coronary stenosis correlates with inferior ischemic burden.' : 'Preserved inferior perfusion.'}`
                            : c.vesselKey === 'LCX'
                            ? `Lateral wall risk (${activeRiskTier}): ${lcxProb >= 0.7 ? 'Severe circumflex stenosis affecting posterior-lateral LV wall.' : 'Patent circumflex flow.'}`
                            : 'Key anatomical landmark for clinical orientation.'
                        })}
                      >
                        {/* Pulse anchor beacon */}
                        <div className="relative flex items-center justify-center">
                          <span 
                            className="w-3.5 h-3.5 rounded-full absolute animate-ping opacity-75"
                            style={{ backgroundColor: activeBorderColor }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full border-2 border-white shadow-md relative z-10 cursor-pointer"
                            style={{ backgroundColor: activeBorderColor }}
                          />
                          
                          {/* Callout Info Tag */}
                          <div 
                            className="callout-box-dark absolute bottom-4.5 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                            style={{ borderColor: activeBorderColor }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-white leading-none">
                                {c.id.startsWith('LAD')
                                  ? 'Left Anterior Descending (LAD)'
                                  : c.id.startsWith('LCX')
                                  ? 'Left Circumflex (LCX)'
                                  : c.id.startsWith('RCA')
                                  ? 'Right Coronary Artery (RCA)'
                                  : c.title || c.id}
                              </span>
                              <span className={`text-[9px] font-bold ${activeRiskColor}`}>
                                {activeRiskTier}
                              </span>
                            </div>
                            {probDisplay && (
                              <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                                P(stenosis): <span className="font-bold text-white font-mono">{probDisplay}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}

          </div>
        ) : (
          /* OPTION 2: STATIC DIAGNOSTIC REFERENCE VIEWS (DO NOT ROTATE) */
          <div className="w-full h-full relative flex items-center justify-center p-2">
            <img 
              src={diagnosticPresetImages[activePreset]} 
              alt={activePreset}
              className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            <div className="absolute top-3 left-4 bg-slate-900/85 px-3 py-1 rounded text-[11px] text-slate-200 font-semibold border border-slate-700 shadow-md">
              Diagnostic Mode: <strong className="text-blue-400 capitalize">{activePreset}</strong> (Fixed Reference View)
            </div>
          </div>
        )}

        {/* Floating Viewport Tools on left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-auto">
          {/* Rotate Button (Active strictly on Heart) */}
          {activePreset === 'heart' ? (
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`tool-pill-btn cursor-pointer ${autoRotate ? 'active ring-2 ring-blue-300' : ''}`}
              title="Toggle 360° Real Heart Turntable Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span>{autoRotate ? 'Stop Rotation' : 'Rotate Heart'}</span>
            </button>
          ) : null}

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            className="tool-pill-btn cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Zoom</span>
          </button>

          {/* Turn 90° with Smooth Sweep */}
          {activePreset === 'heart' && (
            <button
              type="button"
              onClick={handleTurn90}
              className="tool-pill-btn cursor-pointer"
              title="Smooth Turn 90° Clockwise"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Turn 90°</span>
            </button>
          )}

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="tool-pill-btn cursor-pointer"
            title="Reset Heart to 0° Frontal Position"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Show Anatomy Labels (Only for Heart) */}
          {activePreset === 'heart' && (
            <button
              type="button"
              onClick={() => setShowAnatomyLabels(!showAnatomyLabels)}
              className={`tool-pill-btn cursor-pointer ${showAnatomyLabels ? 'active' : ''}`}
              title="Toggle Anatomical Callouts"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Anatomy</span>
            </button>
          )}
        </div>

        {/* Right Thumbnail Presets Vertical Sidebar */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20 pointer-events-auto">
          {[
            { id: 'heart', label: 'Heart', img: '/assets/heart_anterior.jpg' },
            { id: 'arteries', label: 'Coronary', img: '/assets/coronary_tree.jpg' },
            { id: 'torso', label: 'Torso', img: '/assets/torso.jpg' },
            { id: 'xray', label: 'X-Ray View', img: '/assets/xray.jpg' },
            { id: 'cross-section', label: 'Cross Section', img: '/assets/cross_section.jpg' }
          ].map(preset => {
            const isSel = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset.id);
                  if (preset.id !== 'heart') setAutoRotate(false);
                }}
                className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition cursor-pointer w-14 backdrop-blur-md overflow-hidden ${
                  isSel
                    ? 'bg-blue-600/90 border-blue-400 text-white shadow-md ring-1 ring-blue-300'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={preset.label}
              >
                <div className="w-9 h-7 rounded overflow-hidden mb-0.5 border border-slate-700/60 bg-black/40">
                  <img src={preset.img} alt={preset.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-[8.5px] font-semibold leading-tight">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Legend Pills */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-md pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Low Risk (&lt; 0.3)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Moderate Risk (0.3 - 0.7)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              High Risk (&gt; 0.7)
            </span>
          </div>
        </div>

        {/* Vessel Clinical Briefing Modal if clicked */}
        {selectedVesselInfo && (
          <div className="absolute inset-x-6 bottom-14 p-3.5 bg-slate-900/95 border border-slate-700 rounded-xl backdrop-blur-md z-30 animate-fade-in text-white text-xs shadow-2xl">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
              <span className="font-bold text-sm text-blue-400">{selectedVesselInfo.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-red-400">{selectedVesselInfo.stenosis}</span>
                <button 
                  onClick={() => setSelectedVesselInfo(null)}
                  className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mb-0.5"><strong>Territory:</strong> {selectedVesselInfo.territory}</p>
            <p className="text-[11px] text-slate-300"><strong>Clinical Implication:</strong> {selectedVesselInfo.implication}</p>
          </div>
        )}

      </div>

      {/* 3. Interactive 360° Rotational Angle Scrubber Bar (ACTIVE EXCLUSIVELY IN HEART PRESET) */}
      {activePreset === 'heart' ? (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-800 text-[11px]">Smooth 360° Rotation Angle:</span>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">0°</span>
            <input
              type="range"
              min="0"
              max="360"
              value={Math.round(currentYawDeg)}
              onChange={(e) => handleScrubRotation(Number(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <span className="text-[10px] text-slate-500 font-mono">360°</span>
            <span className="w-12 text-right font-mono font-bold text-blue-600 text-xs">
              {Math.round(currentYawDeg)}°
            </span>
          </div>

          {/* Quick View Angle Buttons for Heart */}
          <div className="flex items-center gap-1">
            {[
              { id: 'Anterior', label: 'Anterior (0°)' },
              { id: 'Right', label: 'Right (90°)' },
              { id: 'Posterior', label: 'Posterior (180°)' },
              { id: 'Left', label: 'Left (270°)' },
              { id: 'Top', label: 'Top' }
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectView(v.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  activeView === v.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-200/60 text-slate-500 text-[11px] flex items-center justify-between">
          <span>Diagnostic Mode: <strong>{activePreset.toUpperCase()}</strong> (Fixed Reference View)</span>
          <button
            onClick={() => setActivePreset('heart')}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Switch to Rotatable Real Heart &rarr;
          </button>
        </div>
      )}

    </div>
  );
}

// Key Patient Metrics Card
export function KeyPatientMetricsCard({ features }) {
  return (
    <div className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-none">Key Patient Metrics</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time physiological biomarkers &amp; clinical telemetry</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          6 Biomarkers Loaded
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-center">
        
        {/* 1. Age (Blue Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <User className="w-4 h-4 text-blue-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">{features?.Age || 48}</div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">years</div>
          <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mt-1">Age</div>
        </div>

        {/* 2. Blood Pressure (Pink/Red Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50/60 border border-rose-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <Heart className="w-4 h-4 text-red-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">
            {features?.SystolicBP || 135}/{features?.DiastolicBP || 85}
          </div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">mmHg</div>
          <div className="text-[10px] font-bold text-red-900 uppercase tracking-wider mt-1">Blood Pressure</div>
        </div>

        {/* 3. Pulse Rate (Mint/Green Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <Activity className="w-4 h-4 text-emerald-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">{features?.PulseRate || 92}</div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">bpm</div>
          <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mt-1">Pulse Rate</div>
        </div>

        {/* 4. Cholesterol (Yellow/Gold Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/60 border border-amber-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <Droplet className="w-4 h-4 text-amber-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">{features?.Cholesterol || 215}</div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">mg/dL</div>
          <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mt-1">Cholesterol</div>
        </div>

        {/* 5. Troponin (Purple Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-50/60 border border-purple-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <FlaskConical className="w-4 h-4 text-purple-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">{features?.Troponin || 0.04}</div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">ng/mL</div>
          <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mt-1">Troponin</div>
        </div>

        {/* 6. CK-MB (Teal Card) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50/60 border border-teal-100/80 flex flex-col items-center justify-center hover:shadow-2xs transition">
          <BarChart2 className="w-4 h-4 text-teal-600 mb-1" />
          <div className="text-lg font-black text-slate-900 font-mono leading-none tracking-tight">{features?.CKMB || 24}</div>
          <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">ng/mL</div>
          <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider mt-1">CK-MB (Creatine Kinase-MB)</div>
        </div>

      </div>
    </div>
  );
}
