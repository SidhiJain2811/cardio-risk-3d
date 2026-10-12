/**
 * CardioAI - AI-Powered Cardiovascular Risk Prediction & 3D Visualization
 * Multimodal AI Hackathon 2026 - Track A
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// API Base URL
const API_BASE = window.location.port === '5173' ? 'http://localhost:8000' : '';

// State
const state = {
  patients: [],
  currentPatientId: null,
  currentFeatures: {
    Age: 58,
    Sex: 1,
    BMI: 27.3,
    CurrentSmoker: 0,
    EXSmoker: 1,
    SystolicBP: 140,
    DiastolicBP: 88,
    Pulse: 92,
    Cholesterol: 220,
    Glucose: 110,
    Troponin: 0.05,
    CKMB: 5.2,
    StElevation: 1,
    TInversion: 0,
    LVH: 1,
    RWMA: 1
  },
  predictions: null,
  explanations: null,
  activeShapTarget: 'Cath',
  activeView: 'anterior',
  activeLayer: 'heart',
  showTorso: true,
  showAnatomy: true
};

// Three.js Globals
let scene, camera, renderer, controls;
let heartGroup, torsoGroup, bloodParticles;
let raycaster, mouse;
let vesselMeshes = { LAD: [], LCX: [], RCA: [] };
let vesselNodes3D = {
  LAD: new THREE.Vector3(-0.35, 0.15, 0.85),
  LCX: new THREE.Vector3(-1.15, 0.25, 0.1),
  RCA: new THREE.Vector3(1.1, 0.15, 0.45)
};
let chamberMeshes = [];
let clock = new THREE.Clock();

document.addEventListener('DOMContentLoaded', async () => {
  initThreeJS();
  initUIEventListeners();
  await loadCohortData();
  // Run initial prediction with default preset matching target design
  await runPrediction();
});

// ==========================================
// 1. THREE.JS 3D SCENE & ANATOMY ENGINE
// ==========================================
function initThreeJS() {
  const container = document.getElementById('canvasContainer');
  const canvas = document.getElementById('heartCanvas');
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 550;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090e18);
  scene.fog = new THREE.FogExp2(0x090e18, 0.04);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.8, 9.2);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // OrbitControls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3.5;
  controls.maxDistance = 20;
  controls.target.set(0, 0, 0);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.2;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
  mainLight.position.set(6, 10, 8);
  scene.add(mainLight);

  const blueFill = new THREE.DirectionalLight(0x38bdf8, 1.2);
  blueFill.position.set(-8, -4, -6);
  scene.add(blueFill);

  const redRim = new THREE.DirectionalLight(0xf43f5e, 1.4);
  redRim.position.set(0, -6, 6);
  scene.add(redRim);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  buildAnatomy();

  window.addEventListener('resize', onWindowResize);
  animate();
}

function buildAnatomy() {
  heartGroup = new THREE.Group();
  scene.add(heartGroup);

  // Myocardium Material (Realistic deep crimson with subsurface scattering feel)
  const myocardiumMat = new THREE.MeshPhysicalMaterial({
    color: 0x881337,
    roughness: 0.35,
    metalness: 0.1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    reflectivity: 0.8
  });

  // Ventricles & Atria
  const lvGeo = new THREE.SphereGeometry(1.4, 32, 32);
  lvGeo.scale(1.0, 1.45, 0.95);
  const lvMesh = new THREE.Mesh(lvGeo, myocardiumMat);
  lvMesh.position.set(-0.35, -0.6, 0.1);
  lvMesh.rotation.set(0.15, 0.1, 0.25);
  heartGroup.add(lvMesh);
  chamberMeshes.push(lvMesh);

  const rvGeo = new THREE.SphereGeometry(1.2, 32, 32);
  rvGeo.scale(0.85, 1.3, 0.8);
  const rvMesh = new THREE.Mesh(rvGeo, myocardiumMat.clone());
  rvMesh.position.set(0.7, -0.5, 0.35);
  rvMesh.rotation.set(0.1, -0.15, -0.2);
  heartGroup.add(rvMesh);
  chamberMeshes.push(rvMesh);

  const laGeo = new THREE.SphereGeometry(0.95, 24, 24);
  const laMesh = new THREE.Mesh(laGeo, myocardiumMat.clone());
  laMesh.position.set(-0.6, 0.85, -0.4);
  heartGroup.add(laMesh);
  chamberMeshes.push(laMesh);

  const raGeo = new THREE.SphereGeometry(1.0, 24, 24);
  const raMesh = new THREE.Mesh(raGeo, myocardiumMat.clone());
  raMesh.position.set(0.95, 0.75, -0.1);
  heartGroup.add(raMesh);
  chamberMeshes.push(raMesh);

  // Great Vessels: Aorta & Pulmonary Trunk
  const greatVesselMat = new THREE.MeshPhysicalMaterial({
    color: 0x9f1239,
    roughness: 0.25,
    metalness: 0.15,
    clearcoat: 0.6
  });

  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0.6, 0.2),
    new THREE.Vector3(0.0, 1.4, 0.3),
    new THREE.Vector3(-0.1, 2.2, 0.15),
    new THREE.Vector3(-0.6, 2.6, -0.2),
    new THREE.Vector3(-1.0, 2.3, -0.7),
    new THREE.Vector3(-1.1, 1.2, -0.9)
  ]);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.45, 20, false);
  const aortaMesh = new THREE.Mesh(aortaGeo, greatVesselMat);
  heartGroup.add(aortaMesh);

  // Aorta supra-branches
  [
    [new THREE.Vector3(-0.25, 2.5, 0.0), new THREE.Vector3(-0.2, 3.1, 0.1)],
    [new THREE.Vector3(-0.55, 2.65, -0.2), new THREE.Vector3(-0.6, 3.2, -0.15)],
    [new THREE.Vector3(-0.85, 2.5, -0.45), new THREE.Vector3(-0.95, 3.1, -0.4)]
  ].forEach(pts => {
    const bCurve = new THREE.CatmullRomCurve3(pts);
    const bMesh = new THREE.Mesh(new THREE.TubeGeometry(bCurve, 10, 0.12, 12, false), greatVesselMat);
    heartGroup.add(bMesh);
  });

  // Pulmonary Trunk
  const pulmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0.4, 0.5),
    new THREE.Vector3(0.05, 1.3, 0.45),
    new THREE.Vector3(-0.2, 1.7, 0.1),
    new THREE.Vector3(-0.4, 1.8, -0.4)
  ]);
  const pulmMesh = new THREE.Mesh(new THREE.TubeGeometry(pulmCurve, 24, 0.38, 16, false), new THREE.MeshPhysicalMaterial({ color: 0x1d4ed8, roughness: 0.3, metalness: 0.15 }));
  heartGroup.add(pulmMesh);

  // ----------------------------------------------------
  // CORONARY ARTERY TREES (LAD, LCX, RCA)
  // ----------------------------------------------------
  vesselMeshes = { LAD: [], LCX: [], RCA: [] };

  const makeVesselMat = (hex = 0x10b981) => {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.2,
      metalness: 0.35,
      emissive: hex,
      emissiveIntensity: 0.6
    });
  };

  // 1. LAD (Left Anterior Descending)
  const ladCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.8, 0.3),
    new THREE.Vector3(-0.45, 0.6, 0.55),
    vesselNodes3D.LAD,
    new THREE.Vector3(-0.2, -0.4, 0.95),
    new THREE.Vector3(-0.15, -1.1, 0.85),
    new THREE.Vector3(-0.25, -1.75, 0.5)
  ]);
  const ladMesh = new THREE.Mesh(new THREE.TubeGeometry(ladCurve, 50, 0.11, 16, false), makeVesselMat(0xef4444));
  heartGroup.add(ladMesh);
  vesselMeshes.LAD.push(ladMesh);

  // LAD Diagonal Branch (D1)
  const ladD1Curve = new THREE.CatmullRomCurve3([
    vesselNodes3D.LAD,
    new THREE.Vector3(-0.7, -0.2, 0.85),
    new THREE.Vector3(-1.0, -0.7, 0.65)
  ]);
  const ladD1Mesh = new THREE.Mesh(new THREE.TubeGeometry(ladD1Curve, 20, 0.07, 12, false), makeVesselMat(0xef4444));
  heartGroup.add(ladD1Mesh);
  vesselMeshes.LAD.push(ladD1Mesh);

  // 2. LCX (Left Circumflex)
  const lcxCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.45, 0.6, 0.55),
    new THREE.Vector3(-0.85, 0.55, 0.4),
    vesselNodes3D.LCX,
    new THREE.Vector3(-1.35, -0.1, -0.4),
    new THREE.Vector3(-1.15, -0.65, -0.75),
    new THREE.Vector3(-0.75, -1.0, -0.85)
  ]);
  const lcxMesh = new THREE.Mesh(new THREE.TubeGeometry(lcxCurve, 50, 0.10, 16, false), makeVesselMat(0x10b981));
  heartGroup.add(lcxMesh);
  vesselMeshes.LCX.push(lcxMesh);

  // LCX Obtuse Marginal Branch (OM1)
  const lcxOM1Curve = new THREE.CatmullRomCurve3([
    vesselNodes3D.LCX,
    new THREE.Vector3(-1.45, -0.2, -0.05),
    new THREE.Vector3(-1.35, -0.85, -0.15)
  ]);
  const lcxOM1Mesh = new THREE.Mesh(new THREE.TubeGeometry(lcxOM1Curve, 20, 0.065, 12, false), makeVesselMat(0x10b981));
  heartGroup.add(lcxOM1Mesh);
  vesselMeshes.LCX.push(lcxOM1Mesh);

  // 3. RCA (Right Coronary Artery)
  const rcaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 0.8, 0.3),
    new THREE.Vector3(0.65, 0.55, 0.45),
    vesselNodes3D.RCA,
    new THREE.Vector3(1.25, -0.35, 0.3),
    new THREE.Vector3(1.05, -0.9, -0.1),
    new THREE.Vector3(0.6, -1.25, -0.5),
    new THREE.Vector3(0.1, -1.45, -0.6)
  ]);
  const rcaMesh = new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 50, 0.10, 16, false), makeVesselMat(0xf59e0b));
  heartGroup.add(rcaMesh);
  vesselMeshes.RCA.push(rcaMesh);

  // Torso Silhouette & Ribcage
  torsoGroup = new THREE.Group();
  scene.add(torsoGroup);

  const torsoMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.12 });
  const torsoGeo = new THREE.CylinderGeometry(2.8, 2.3, 7.5, 20, 16, true);
  torsoGeo.scale(1.25, 1.0, 0.7);
  const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
  torsoMesh.position.set(0, 0.2, -0.1);
  torsoGroup.add(torsoMesh);

  for (let i = -3; i <= 3; i++) {
    const ribCurve = new THREE.EllipseCurve(0, 0, 2.6 - Math.abs(i) * 0.1, 1.6, 0, Math.PI, false, 0);
    const pts = ribCurve.getPoints(30).map(p => new THREE.Vector3(p.x, i * 0.65 + 0.3, p.y - 0.2));
    const ribGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const ribLine = new THREE.Line(ribGeo, new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.28 }));
    torsoGroup.add(ribLine);
  }

  // Blood flow particle simulation
  const pCount = 180;
  const positions = new Float32Array(pCount * 3);
  const colors = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    colors[i * 3] = 1.0;
    colors[i * 3 + 1] = 0.25;
    colors[i * 3 + 2] = 0.35;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
  bloodParticles = new THREE.Points(pGeo, pMat);
  heartGroup.add(bloodParticles);
}

function update3DCalloutsPositions() {
  const container = document.getElementById('canvasContainer');
  if (!container || !camera) return;

  const w = container.clientWidth;
  const h = container.clientHeight;

  const projectNode = (vec3) => {
    const v = vec3.clone();
    heartGroup.localToWorld(v);
    v.project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-(v.y * 0.5) + 0.5) * h,
      visible: v.z < 1.0
    };
  };

  const posLAD = projectNode(vesselNodes3D.LAD);
  const elLAD = document.getElementById('calloutLAD');
  if (elLAD && posLAD.visible) {
    elLAD.style.left = `${Math.max(20, Math.min(w - 140, posLAD.x - 70))}px`;
    elLAD.style.top = `${Math.max(20, Math.min(h - 80, posLAD.y - 75))}px`;
  }

  const posLCX = projectNode(vesselNodes3D.LCX);
  const elLCX = document.getElementById('calloutLCX');
  if (elLCX && posLCX.visible) {
    elLCX.style.left = `${Math.max(20, Math.min(w - 140, posLCX.x + 30))}px`;
    elLCX.style.top = `${Math.max(20, Math.min(h - 80, posLCX.y - 45))}px`;
  }

  const posRCA = projectNode(vesselNodes3D.RCA);
  const elRCA = document.getElementById('calloutRCA');
  if (elRCA && posRCA.visible) {
    elRCA.style.left = `${Math.max(20, Math.min(w - 140, posRCA.x - 110))}px`;
    elRCA.style.top = `${Math.max(20, Math.min(h - 80, posRCA.y + 20))}px`;
  }
}

function update3DVesselColors(vesselsData) {
  if (!vesselsData) return;

  ['LAD', 'LCX', 'RCA'].forEach(v => {
    const vData = vesselsData[v];
    if (!vData) return;

    const colorHex = new THREE.Color(vData.color);
    if (vesselMeshes[v]) {
      vesselMeshes[v].forEach(m => {
        m.material.color.copy(colorHex);
        m.material.emissive.copy(colorHex);
        m.material.emissiveIntensity = vData.probability >= 0.7 ? 0.8 : (vData.probability >= 0.3 ? 0.5 : 0.25);
      });
    }

    // Update 3D Callout Badges Text & Colors
    const probEl = document.getElementById(`calloutProb${v}`);
    if (probEl) probEl.textContent = vData.probability.toFixed(2);

    const calloutBox = document.getElementById(`callout${v}`);
    if (calloutBox) {
      calloutBox.style.borderColor = vData.color;
      const statusLabel = calloutBox.querySelector('.font-bold');
      if (statusLabel) {
        statusLabel.textContent = vData.tier;
        statusLabel.style.color = vData.color;
      }
      const dot = calloutBox.querySelector('.callout-pointer-dot');
      if (dot) dot.style.backgroundColor = vData.color;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Stable anatomical heart scale without pulsing for clear multi-angle analysis
  heartGroup.scale.set(1.0, 1.0, 1.0);

  if (bloodParticles) {
    const pos = bloodParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= 0.012;
      if (pos[i + 1] < -1.8) {
        pos[i + 1] = 1.6;
        pos[i] = (Math.random() - 0.5) * 1.0;
        pos[i + 2] = 0.2 + (Math.random() - 0.5) * 0.8;
      }
    }
    bloodParticles.geometry.attributes.position.needsUpdate = true;
  }

  controls.update();
  update3DCalloutsPositions();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvasContainer');
  if (!container || !renderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// ==========================================
// 2. API INTEGRATION & REAL-TIME PREDICTIONS
// ==========================================
async function loadCohortData() {
  try {
    const res = await fetch(`${API_BASE}/api/patients`);
    if (!res.ok) return;
    state.patients = await res.json();

    const select = document.getElementById('patientCohortSelect');
    if (!select) return;
    select.innerHTML = '';

    state.patients.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.patient_id;
      const cadTag = p.ground_truth.Cath === 'CAD' ? 'CAD+' : 'Normal';
      opt.textContent = `${p.patient_id} (${p.age}y, ${p.sex}, ${cadTag}) - LAD:${p.ground_truth.LAD}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading patients:', err);
  }
}

function gatherInputsFromUI() {
  const age = Number(document.getElementById('inputAge').value) || 58;
  const gender = document.getElementById('inputGender').value === 'Male' ? 1 : 0;
  const bmi = Number(document.getElementById('inputBMI').value) || 27.3;
  const smokingVal = document.getElementById('inputSmoking').value;
  const currentSmoker = smokingVal === 'Current' ? 1 : 0;
  const exSmoker = smokingVal === 'Former' ? 1 : 0;

  const sBP = Number(document.getElementById('inputSystolicBP').value) || 140;
  const dBP = Number(document.getElementById('inputDiastolicBP').value) || 88;
  const pulse = Number(document.getElementById('inputPulse').value) || 92;
  const chol = Number(document.getElementById('inputCholesterol').value) || 220;
  const fbs = Number(document.getElementById('inputGlucose').value) || 110;

  const trop = Number(document.getElementById('inputTroponin').value) || 0.05;
  const ckmb = Number(document.getElementById('inputCKMB').value) || 5.2;

  const stElev = document.getElementById('inputStElevation').value === 'Yes' ? 1 : 0;
  const tInv = document.getElementById('inputTInversion').value === 'Yes' ? 1 : 0;
  const lvh = document.getElementById('inputLVH').value === 'Yes' ? 1 : 0;
  const rwma = document.getElementById('inputRWMA').value === 'Yes' ? 1 : 0;

  return {
    Age: age,
    Sex: gender,
    BMI: bmi,
    'Current Smoker': currentSmoker,
    'EX-Smoker': exSmoker,
    BP: sBP,
    PR: pulse,
    FBS: fbs,
    TG: Math.round(chol * 0.65),
    LDL: Math.round(chol * 0.60),
    HDL: Math.round(chol * 0.20),
    'Typical Chest Pain': 1,
    'St Elevation': stElev,
    Tinversion: tInv,
    LVH: lvh,
    'Region RWMA': rwma ? 1 : 0,
    'EF-TTE': 45,
    // extra fields for UI display
    DiastolicBP: dBP,
    Troponin: trop,
    CKMB: ckmb,
    Cholesterol: chol,
    Pulse: pulse
  };
}

async function runPrediction() {
  const features = gatherInputsFromUI();
  state.currentFeatures = features;

  try {
    // 1. Fetch Predictions
    const predRes = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    if (!predRes.ok) throw new Error('Prediction API failed');
    state.predictions = await predRes.json();

    // 2. Fetch Explanations
    const expRes = await fetch(`${API_BASE}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    if (!expRes.ok) throw new Error('Explain API failed');
    state.explanations = await expRes.json();

    updateUIElements();
    update3DVesselColors(state.predictions.vessels);
  } catch (err) {
    console.error('Error during prediction:', err);
  }
}

function updateUIElements() {
  const p = state.predictions;
  const f = state.currentFeatures;
  if (!p) return;

  // 1. Overall Prediction Radial Gauge (Right Panel)
  const cad = p.overall_cad;
  const tierEl = document.getElementById('overallPredictionTier');
  tierEl.textContent = cad.tier;
  tierEl.style.color = cad.color;

  document.getElementById('overallPredictionProb').textContent = `${cad.probability.toFixed(2)} (${cad.percentage}%)`;

  // Radial Gauge Arc: circumference is 132 for r=42 half-circle
  const arc = document.getElementById('overallArc');
  if (arc) {
    const offset = 132 - (cad.probability * 132);
    arc.style.strokeDashoffset = offset;
    arc.style.stroke = cad.color;
  }

  // 2. Vessel-wise Stenosis Probability (Right Panel)
  ['LAD', 'LCX', 'RCA'].forEach(v => {
    const vData = p.vessels[v];
    if (vData) {
      document.getElementById(`vesselVal${v}`).textContent = vData.probability.toFixed(2);
      const bar = document.getElementById(`vesselBar${v}`);
      bar.style.width = `${vData.percentage}%`;
      bar.style.backgroundColor = vData.color;

      const badge = document.getElementById(`vesselBadge${v}`);
      badge.textContent = vData.tier;
      badge.style.backgroundColor = vData.color;
      badge.style.color = vData.probability >= 0.7 ? '#ffffff' : (vData.probability >= 0.3 ? '#0f172a' : '#ffffff');
    }
  });

  // 3. Mini Prediction Probabilities (Bottom-Left)
  document.getElementById('miniValCAD').textContent = cad.probability.toFixed(2);
  document.getElementById('miniBarCAD').style.width = `${cad.percentage}%`;
  document.getElementById('miniBarCAD').style.backgroundColor = cad.color;

  ['LAD', 'LCX', 'RCA'].forEach(v => {
    const vData = p.vessels[v];
    if (vData) {
      document.getElementById(`miniVal${v}`).textContent = vData.probability.toFixed(2);
      const mBar = document.getElementById(`miniBar${v}`);
      mBar.style.width = `${vData.percentage}%`;
      mBar.style.backgroundColor = vData.color;
    }
  });

  // 4. Key Patient Metrics Cards (Bottom-Center)
  document.getElementById('metricAge').textContent = f.Age;
  document.getElementById('metricBP').textContent = `${f.BP}/${f.DiastolicBP}`;
  document.getElementById('metricPulse').textContent = f.Pulse;
  document.getElementById('metricChol').textContent = f.Cholesterol;
  document.getElementById('metricTrop').textContent = f.Troponin;
  document.getElementById('metricCKMB').textContent = f.CKMB;

  // 5. SHAP Waterfall Bar Chart (Right Panel)
  renderSHAPBars();
}

function renderSHAPBars() {
  const container = document.getElementById('shapBarsList');
  if (!container || !state.explanations || !state.explanations.explanations) return;

  const targetKey = state.activeShapTarget;
  const expData = state.explanations.explanations[targetKey];
  if (!expData) return;

  container.innerHTML = '';
  const drivers = expData.top_drivers || [];

  // Match the visual format of screenshot
  drivers.slice(0, 8).forEach(d => {
    const isPositive = d.impact >= 0;
    const impactVal = Math.abs(d.impact);
    const barWidth = Math.min(100, Math.round((impactVal / 0.25) * 100));

    const row = document.createElement('div');
    row.className = 'space-y-0.5';
    row.innerHTML = `
      <div class="flex items-center justify-between text-[10px]">
        <span class="text-slate-300 font-medium truncate max-w-[110px]">${d.feature}</span>
        <span class="${isPositive ? 'text-rose-400' : 'text-blue-400'} font-bold">
          ${isPositive ? '+' : '-'}${impactVal.toFixed(2)}
        </span>
      </div>
      <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex ${isPositive ? 'justify-start' : 'justify-end'}">
        <div class="${isPositive ? 'bg-rose-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-300" style="width: ${barWidth}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

// ==========================================
// 3. UI EVENT LISTENERS & CAMERA PRESETS
// ==========================================
function initUIEventListeners() {
  // Run Prediction Button
  document.getElementById('btnRunPrediction').addEventListener('click', runPrediction);

  // Manual vs Sample Mode Switcher
  const btnManual = document.getElementById('btnManualMode');
  const btnSample = document.getElementById('btnSampleMode');
  const sampleRow = document.getElementById('sampleSelectorRow');

  btnManual.addEventListener('click', () => {
    btnManual.className = 'py-1.5 rounded-lg bg-blue-600 text-white font-semibold shadow-sm transition';
    btnSample.className = 'py-1.5 rounded-lg text-slate-400 hover:text-white transition';
    sampleRow.classList.add('hidden');
  });

  btnSample.addEventListener('click', () => {
    btnSample.className = 'py-1.5 rounded-lg bg-blue-600 text-white font-semibold shadow-sm transition';
    btnManual.className = 'py-1.5 rounded-lg text-slate-400 hover:text-white transition';
    sampleRow.classList.remove('hidden');
  });

  // Sample Cohort Dropdown
  document.getElementById('patientCohortSelect').addEventListener('change', e => {
    const pId = e.target.value;
    const patient = state.patients.find(p => p.patient_id === pId);
    if (!patient) return;

    const pf = patient.features;
    document.getElementById('inputAge').value = pf.Age || 58;
    document.getElementById('inputGender').value = pf.Sex === 'Male' || pf.Sex === 1 ? 'Male' : 'Fmale';
    document.getElementById('inputBMI').value = pf.BMI || 27.3;
    document.getElementById('inputSystolicBP').value = pf.BP || 140;
    document.getElementById('inputPulse').value = pf.PR || 92;
    document.getElementById('inputGlucose').value = pf.FBS || 110;
    document.getElementById('inputStElevation').value = pf['St Elevation'] ? 'Yes' : 'No';
    document.getElementById('inputTInversion').value = pf.Tinversion ? 'Yes' : 'No';
    document.getElementById('inputLVH').value = pf.LVH === 'Y' || pf.LVH === 1 ? 'Yes' : 'No';
    document.getElementById('inputRWMA').value = pf['Region RWMA'] ? 'Yes' : 'No';

    runPrediction();
  });

  // View Presets (Anterior, Posterior, Left, Right, Top)
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'btnLayersMenu') return;
      document.querySelectorAll('.view-btn').forEach(b => {
        b.className = 'view-btn px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition';
      });
      btn.className = 'view-btn px-2.5 py-1 rounded-md bg-blue-600 text-white font-medium transition';
      setViewAngle(btn.dataset.view);
    });
  });

  // Floating Tools
  document.getElementById('toolRotate').addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    document.getElementById('toolRotate').classList.toggle('active', controls.autoRotate);
  });
  document.getElementById('toolZoom').addEventListener('click', () => {
    camera.position.z = Math.max(4.0, camera.position.z - 1.2);
  });
  document.getElementById('toolPan').addEventListener('click', () => {
    camera.position.x += 0.8;
  });
  document.getElementById('toolReset').addEventListener('click', () => {
    setViewAngle('anterior');
    controls.autoRotate = false;
    document.getElementById('toolRotate').classList.remove('active');
  });
  document.getElementById('toolAnatomy').addEventListener('click', () => {
    state.showAnatomy = !state.showAnatomy;
    chamberMeshes.forEach(m => m.visible = state.showAnatomy);
    document.getElementById('toolAnatomy').classList.toggle('active', state.showAnatomy);
  });

  // Layer Selector Cards
  document.querySelectorAll('.layer-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.layer-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      setLayerMode(card.dataset.layer);
    });
  });

  // SHAP Target Switcher Pills
  document.querySelectorAll('.shap-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.shap-pill').forEach(p => {
        p.className = 'shap-pill px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition';
      });
      pill.className = 'shap-pill px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold transition';
      state.activeShapTarget = pill.dataset.target;
      renderSHAPBars();
    });
  });

  // Download / Export Actions
  document.getElementById('btnGenPDF').addEventListener('click', openReportModal);
  document.getElementById('btnCloseReport').addEventListener('click', closeReportModal);
  document.getElementById('btnSaveImage').addEventListener('click', saveVisualizationImage);
  document.getElementById('btnExportCSV').addEventListener('click', downloadModelOutputsCSV);
}

function setViewAngle(view) {
  state.activeView = view;
  switch (view) {
    case 'anterior':
      camera.position.set(0, 0.8, 9.2);
      controls.target.set(0, 0, 0);
      break;
    case 'posterior':
      camera.position.set(0, 0.8, -9.2);
      controls.target.set(0, 0, 0);
      break;
    case 'left':
      camera.position.set(-8.8, 0.6, 2.5);
      controls.target.set(0, 0, 0);
      break;
    case 'right':
      camera.position.set(8.8, 0.6, 2.5);
      controls.target.set(0, 0, 0);
      break;
    case 'top':
      camera.position.set(0, 9.5, 0.1);
      controls.target.set(0, 0, 0);
      break;
  }
}

function setLayerMode(layer) {
  state.activeLayer = layer;
  if (layer === 'coronary') {
    chamberMeshes.forEach(m => m.material.opacity = 0.25);
    chamberMeshes.forEach(m => m.material.transparent = true);
    if (torsoGroup) torsoGroup.visible = false;
  } else if (layer === 'torso') {
    if (torsoGroup) torsoGroup.visible = true;
    chamberMeshes.forEach(m => m.material.opacity = 0.85);
  } else if (layer === 'xray') {
    scene.background = new THREE.Color(0x020617);
    if (torsoGroup) torsoGroup.visible = true;
    chamberMeshes.forEach(m => {
      m.material.wireframe = true;
      m.material.color.setHex(0x38bdf8);
    });
  } else {
    // default 'heart'
    scene.background = new THREE.Color(0x090e18);
    chamberMeshes.forEach(m => {
      m.material.wireframe = false;
      m.material.transparent = false;
      m.material.opacity = 1.0;
      m.material.color.setHex(0x881337);
    });
    if (torsoGroup) torsoGroup.visible = true;
  }
}

function saveVisualizationImage() {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'cardio_3d_scan.png';
  a.click();
}

function downloadModelOutputsCSV() {
  if (!state.predictions) return;
  const p = state.predictions;
  const f = state.currentFeatures;

  const rows = [
    ['Metric', 'Value'],
    ['Patient Age', f.Age],
    ['Gender', f.Sex === 1 ? 'Male' : 'Female'],
    ['Systolic BP', f.BP],
    ['Pulse Rate', f.Pulse],
    ['Overall CAD Probability', p.overall_cad.probability],
    ['Overall CAD Tier', p.overall_cad.tier],
    ['LAD Stenosis Probability', p.vessels.LAD.probability],
    ['LAD Stenosis Tier', p.vessels.LAD.tier],
    ['LCX Stenosis Probability', p.vessels.LCX.probability],
    ['LCX Stenosis Tier', p.vessels.LCX.tier],
    ['RCA Stenosis Probability', p.vessels.RCA.probability],
    ['RCA Stenosis Tier', p.vessels.RCA.tier]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.href = encodedUri;
  a.download = 'cardio_ai_predictions.csv';
  a.click();
}

function openReportModal() {
  const modal = document.getElementById('reportModal');
  const container = document.getElementById('reportModalContent');
  if (!state.predictions || !modal || !container) return;

  const p = state.predictions;
  const f = state.currentFeatures;

  container.innerHTML = `
    <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
      <div class="flex justify-between items-center text-xs">
        <span class="font-bold text-white">Patient Record: Age ${f.Age} (${f.Sex === 1 ? 'Male' : 'Female'})</span>
        <span class="font-mono text-slate-400">Timestamp: ${new Date().toLocaleString()}</span>
      </div>
      <div class="grid grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
        <div>BP: <strong>${f.BP}/${f.DiastolicBP} mmHg</strong></div>
        <div>Pulse: <strong>${f.Pulse} bpm</strong></div>
        <div>Cholesterol: <strong>${f.Cholesterol} mg/dL</strong></div>
        <div>Glucose: <strong>${f.FBS} mg/dL</strong></div>
        <div>Troponin: <strong>${f.Troponin} ng/mL</strong></div>
        <div>CK-MB: <strong>${f.CKMB} ng/mL</strong></div>
        <div>ST Elevation: <strong>${f['St Elevation'] ? 'Yes' : 'No'}</strong></div>
        <div>RWMA: <strong>${f['Region RWMA'] ? 'Yes' : 'No'}</strong></div>
      </div>
    </div>

    <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
      <h4 class="font-bold text-slate-200">Vessel-wise Stenosis Risk Profile</h4>
      <div class="grid grid-cols-4 gap-2.5 text-center">
        <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
          <div class="text-[10px] text-slate-400">Overall CAD</div>
          <div class="text-lg font-bold font-mono" style="color: ${p.overall_cad.color}">${(p.overall_cad.probability * 100).toFixed(0)}%</div>
          <div class="text-[10px] font-semibold" style="color: ${p.overall_cad.color}">${p.overall_cad.tier}</div>
        </div>
        <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
          <div class="text-[10px] text-slate-400">LAD Stenosis</div>
          <div class="text-lg font-bold font-mono" style="color: ${p.vessels.LAD.color}">${(p.vessels.LAD.probability * 100).toFixed(0)}%</div>
          <div class="text-[10px] font-semibold" style="color: ${p.vessels.LAD.color}">${p.vessels.LAD.tier}</div>
        </div>
        <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
          <div class="text-[10px] text-slate-400">LCX Stenosis</div>
          <div class="text-lg font-bold font-mono" style="color: ${p.vessels.LCX.color}">${(p.vessels.LCX.probability * 100).toFixed(0)}%</div>
          <div class="text-[10px] font-semibold" style="color: ${p.vessels.LCX.color}">${p.vessels.LCX.tier}</div>
        </div>
        <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
          <div class="text-[10px] text-slate-400">RCA Stenosis</div>
          <div class="text-lg font-bold font-mono" style="color: ${p.vessels.RCA.color}">${(p.vessels.RCA.probability * 100).toFixed(0)}%</div>
          <div class="text-[10px] font-semibold" style="color: ${p.vessels.RCA.color}">${p.vessels.RCA.tier}</div>
        </div>
      </div>
    </div>

    <div class="bg-rose-950/30 border border-rose-600/40 p-2.5 rounded-xl text-[10px] text-rose-200">
      <strong>Clinical Disclaimer:</strong> Predictions are generated for clinical decision support and educational visualization only and are not a substitute for formal diagnostic imaging.
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.classList.add('hidden');
}
