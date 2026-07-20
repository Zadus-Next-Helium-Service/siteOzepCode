/* ============================================================
   OZEP 3D — compagnon de scroll pour la page Services
   VERSION SIMPLIFIÉE :
   - le 3D détecte la section active UNE FOIS (IntersectionObserver),
     pas de calcul continu au scroll
   - à chaque changement de section : arrivée en cascade (lettres +
     objet métier) sur une durée fixe, avec un léger rebond
   - une fois arrivé, il reste FIXE et STABLE, quel que soit le
     scroll à l'intérieur de la section
   - seule une respiration légère (flottement + scale) continue,
     jamais liée au scroll
   ============================================================ */

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const canvas = document.getElementById('canvas3d');
const canvasWrap = document.getElementById('canvas3dWrap');
const loadingEl = document.getElementById('loading');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 22);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(6, 8, 10);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xf87d02, 2.4, 60);
rimLight.position.set(-8, -4, 6);
scene.add(rimLight);

const wordGroup = new THREE.Group();
scene.add(wordGroup);

const material = new THREE.MeshStandardMaterial({
  color: 0xf87d02, metalness: 0.35, roughness: 0.35,
  emissive: 0x3a1900, emissiveIntensity: 0.4,
  transparent: true, opacity: 1
});
const sideMaterial = new THREE.MeshStandardMaterial({
  color: 0xbe6103, metalness: 0.3, roughness: 0.55,
  transparent: true, opacity: 1
});

const letterMeshes = [];
const word = "OZEP";

/* ============================================================
   PROPS PAR MÉTIER — enfants de wordGroup pour suivre la même
   position / échelle / rotation que le texte OZEP
   Tous les matériaux "solides" sont passés en transparent:true
   pour pouvoir être fondus en fonction de fadeBtp/Mines/Geo/Hydro.
   ============================================================ */

/* --- BTP : mur de briques qui se construit --- */
const bricksGroup = new THREE.Group();
wordGroup.add(bricksGroup);
const brickMat = new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.85, transparent: true, opacity: 1 });
const brickRows = 4, brickCols = 8;
const brickW = 1.3, brickGap = 1.4;
const bricks = [];
for (let r = 0; r < brickRows; r++) {
  for (let c = 0; c < brickCols; c++) {
    const geo = new THREE.BoxGeometry(brickW, 0.7, 1);
    const b = new THREE.Mesh(geo, brickMat);
    const rowOffset = (r % 2 === 0) ? 0 : brickGap / 2;
    const startX = -(brickCols * brickGap) / 2 + brickGap / 2;
    b.position.x = startX + c * brickGap + rowOffset;
    const targetY = -5.6 + r * 0.75;
    b.userData.targetY = targetY;
    b.userData.startY = -11 - r * 0.6;
    b.position.y = b.userData.startY;
    b.position.z = 0;
    b.visible = false;
    bricksGroup.add(b);
    bricks.push(b);
  }
}
bricksGroup.visible = false;

/* --- Mines : terre + pépites d'or qui sortent du sol --- */
const minesGroup = new THREE.Group();
wordGroup.add(minesGroup);
const dirtMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 1, transparent: true, opacity: 1 });
const dirtMesh = new THREE.Mesh(new THREE.BoxGeometry(15, 3, 6), dirtMat);
dirtMesh.position.y = -6.2;
minesGroup.add(dirtMesh);

const goldMat = new THREE.MeshStandardMaterial({
  color: 0xffd700, metalness: 0.85, roughness: 0.25,
  emissive: 0x4a2e00, emissiveIntensity: 0.35,
  transparent: true, opacity: 1
});
const nuggets = [];
for (let i = 0; i < 6; i++) {
  const n = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), goldMat);
  n.position.set(-6 + i * 2.2, -6.2, (Math.random() - 0.5) * 3);
  n.userData.baseY = -6.2;
  n.userData.delay = i * 0.5;
  n.visible = false;
  minesGroup.add(n);
  nuggets.push(n);
}
minesGroup.visible = false;

/* --- particules de poussière (zone Mines) --- */
const dustCount = 60;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
const dustLife = new Float32Array(dustCount);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 10;
  dustPos[i * 3 + 1] = -6 + Math.random() * 1;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
  dustLife[i] = Math.random();
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ color: 0xd88a3a, size: 0.22, transparent: true, opacity: 0 });
const dustPoints = new THREE.Points(dustGeo, dustMat);
minesGroup.add(dustPoints);

/* --- Géotechnique : coupe de sol en couches + loupe/scanner --- */
const geoGroup = new THREE.Group();
wordGroup.add(geoGroup);

const soilColors = [0x3d2a18, 0x5a3b1f, 0x8a6b3d, 0x9a8060, 0x6e6e6e];
const soilLayerHeight = 0.55;
const soilMaterials = [];
soilColors.forEach((color, i) => {
  const layerMat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, transparent: true, opacity: 1 });
  soilMaterials.push(layerMat);
  const layer = new THREE.Mesh(new THREE.BoxGeometry(11, soilLayerHeight, 4), layerMat);
  layer.position.set(0, -6.5 + i * soilLayerHeight, 0);
  geoGroup.add(layer);
});

const magnifierGroup = new THREE.Group();
const lensGlassMat = new THREE.MeshStandardMaterial({
  color: 0x9fd8ff, transparent: true, opacity: 0.28, metalness: 0.1, roughness: 0.05, side: THREE.DoubleSide
});
const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.12, 32), lensGlassMat);
lensGlass.rotation.x = Math.PI / 2;
magnifierGroup.add(lensGlass);

const lensFrameMat = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 1 });
const lensFrame = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.13, 10, 32), lensFrameMat);
magnifierGroup.add(lensFrame);

const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.6, 10), lensFrameMat);
handle.position.set(1.35, -1.9, 0);
handle.rotation.z = Math.PI / 4.2;
magnifierGroup.add(handle);

magnifierGroup.position.set(0, 3, 1.2);
geoGroup.add(magnifierGroup);

const scanGlowMat = new THREE.MeshBasicMaterial({ color: 0xf87d02, transparent: true, opacity: 0.5 });
const scanGlow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), scanGlowMat);
scanGlow.rotation.x = -Math.PI / 2;
scanGlow.position.set(0, -3.4, 1.2);
geoGroup.add(scanGlow);

geoGroup.visible = false;

/* --- Hydraulique : pompe à puits + eau bleutée --- */
const hydroGroup = new THREE.Group();
wordGroup.add(hydroGroup);
const pumpMat = new THREE.MeshStandardMaterial({ color: 0x4a4f57, metalness: 0.7, roughness: 0.35, transparent: true, opacity: 1 });
const pumpMatDark = new THREE.MeshStandardMaterial({ color: 0x2c2f34, metalness: 0.6, roughness: 0.45, transparent: true, opacity: 1 });

const pumpX = 6.5, pumpZ = 0.6;
const groundY = -6.3;

const groundPatchMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1c, roughness: 1, transparent: true, opacity: 1 });
const groundPatch = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 1.4, 24), groundPatchMat);
groundPatch.position.set(pumpX, groundY - 0.7, pumpZ);
hydroGroup.add(groundPatch);

const wellPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3, 12), pumpMatDark);
wellPipe.position.set(pumpX, groundY - 0.4, pumpZ);
hydroGroup.add(wellPipe);

const pumpBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.4), pumpMat);
pumpBase.position.set(pumpX, groundY + 0.2, pumpZ);
hydroGroup.add(pumpBase);

const pumpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 2.2, 16), pumpMat);
pumpBody.position.set(pumpX, groundY + 1.5, pumpZ);
hydroGroup.add(pumpBody);

const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.1, 12), pumpMatDark);
nozzle.position.set(pumpX + 0.9, groundY + 0.9, pumpZ + 0.5);
nozzle.rotation.z = Math.PI / 2.3;
hydroGroup.add(nozzle);

const leverPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 10), pumpMatDark);
leverPivot.rotation.z = Math.PI / 2;
leverPivot.position.set(pumpX - 0.3, groundY + 2.7, pumpZ);
hydroGroup.add(leverPivot);

const leverGroup = new THREE.Group();
leverGroup.position.set(pumpX - 0.3, groundY + 2.7, pumpZ);
hydroGroup.add(leverGroup);
const leverArm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.18), pumpMat);
leverArm.position.set(-1.2, 0, 0);
leverGroup.add(leverArm);
const leverHandle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), pumpMatDark);
leverHandle.position.set(-2.35, 0, 0);
leverGroup.add(leverHandle);

const waterMat = new THREE.MeshStandardMaterial({
  color: 0x3fa8e0, transparent: true, opacity: 0.65, metalness: 0.1, roughness: 0.1
});
const dropStartY = groundY + 0.55;
const puddleY = groundY - 0.02;
const dropX = pumpX + 1.3, dropZ = pumpZ + 0.9;

const threadMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1, 8), waterMat);
threadMesh.position.set(dropX, dropStartY, dropZ);
hydroGroup.add(threadMesh);

const dropMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), waterMat);
dropMesh.position.set(dropX, dropStartY, dropZ);
hydroGroup.add(dropMesh);

const splashMat = new THREE.MeshBasicMaterial({ color: 0x3fa8e0, transparent: true, opacity: 0 });
const splashRing = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.45, 20), splashMat);
splashRing.rotation.x = -Math.PI / 2;
splashRing.position.set(dropX, puddleY + 0.02, dropZ);
hydroGroup.add(splashRing);

const liquidGeo = new THREE.PlaneGeometry(4.5, 2.6);
const liquidMat = new THREE.MeshStandardMaterial({ color: 0x2f8fce, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
liquidMesh.rotation.x = -Math.PI / 2;
liquidMesh.position.set(dropX, puddleY, dropZ);
liquidMesh.scale.y = 0.01;
hydroGroup.add(liquidMesh);

const suctionMat = new THREE.MeshStandardMaterial({ color: 0x6fc3f0, transparent: true, opacity: 0.85 });
const suctionBubbles = [];
for (let i = 0; i < 3; i++) {
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), suctionMat);
  bub.position.set(pumpX, groundY - 1.8, pumpZ);
  bub.userData.delay = i * 0.5;
  bub.visible = false;
  hydroGroup.add(bub);
  suctionBubbles.push(bub);
}

hydroGroup.visible = false;

/* --- Overview : nuage "Nos services" --- */
const cloudGroup = new THREE.Group();
wordGroup.add(cloudGroup);
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.9 });
const puffData = [
  { x: -2.2, y: 0, z: 0, r: 1.3 },
  { x: -0.8, y: 0.6, z: 0.3, r: 1.6 },
  { x: 0.8, y: 0.7, z: -0.2, r: 1.7 },
  { x: 2.2, y: 0.1, z: 0.2, r: 1.3 },
  { x: 0, y: -0.3, z: 0.4, r: 1.5 },
];
const puffs = [];
puffData.forEach((p, i) => {
  const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(p.r, 1), cloudMat);
  puff.position.set(p.x, p.y, p.z);
  puff.userData.baseY = p.y;
  puff.userData.phase = i * 0.8;
  cloudGroup.add(puff);
  puffs.push(puff);
});

function makeCloudLabelTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 300;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '120px sans-serif';
  ctx.fillText('😊', c.width / 2, 110);
  ctx.font = 'bold 58px Arial, sans-serif';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('NOS SERVICES', c.width / 2, 235);
  return new THREE.CanvasTexture(c);
}
const cloudLabelMat = new THREE.SpriteMaterial({ map: makeCloudLabelTexture(), transparent: true });
const cloudLabel = new THREE.Sprite(cloudLabelMat);
cloudLabel.scale.set(6.5, 3.8, 1);
cloudLabel.position.set(0, 0, 1.9);
cloudGroup.add(cloudLabel);

cloudGroup.position.set(0, 3, 0);
cloudGroup.scale.setScalar(0.01);
cloudGroup.visible = false;

const fontLoader = new FontLoader();
fontLoader.load(
  'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
  (font) => {
    const letterSpacing = 6.4;
    const totalWidth = (word.length - 1) * letterSpacing;
    word.split('').forEach((char, i) => {
      const geometry = new TextGeometry(char, {
        font, size: 5, height: 1.6, curveSegments: 8,
        bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.14, bevelSegments: 4
      });
      geometry.computeBoundingBox();
      geometry.center();
      const mesh = new THREE.Mesh(geometry, [material, sideMaterial]);
      mesh.position.x = -totalWidth / 2 + i * letterSpacing;
      mesh.userData.baseX = mesh.position.x;
      wordGroup.add(mesh);
      letterMeshes.push(mesh);
    });

    loadingEl.classList.add('is-hidden');
    setTimeout(() => { loadingEl.style.display = 'none'; }, 500);
    animate();
  },
  undefined,
  (err) => { loadingEl.textContent = "Erreur de chargement du modèle 3D"; console.error(err); }
);

/* ============================================================
   CONFIG DES ZONES
   "travelState" = point de départ de l'arrivée en cascade
   "arrivedState" = position finale, fixe, où le 3D reste
   ============================================================ */
const travelState  = { x: -5.5, y: -1,   z: -4, scale: 0.16, rotZ: Math.PI / 2 };
const arrivedState = { x: 0,    y: -3.5, z: 0,  scale: 0.35, rotZ: 0 };

const zones = {
  hero: { x: 0, y: 0, z: 0, scale: 0.001 },
  overview: { x: 0, y: -3.5, z: 0, scale: 0.28 }
};

const serviceModes = {
  service1: 'btp',
  service2: 'mines',
  service3: 'geo',
  service4: 'hydro'
};

let currentZone = 'hero';
let zoneEnteredAt = performance.now();

const cur = { x: 0, y: 0, z: 0, scale: 0.001, rotZ: 0 };

const zoneEls = Array.from(document.querySelectorAll('[data-zone]'))
  .filter(el => el.dataset.zone !== 'hero');
const lastZoneEl = document.querySelector('[data-zone="service4"]');

/* ============================================================
   ANCRAGE AU TEXTE — le 3D suit la position réelle (à l'écran)
   du bloc de texte de la section active, comme s'il en faisait
   partie. Il défile donc AVEC la page (normal, comme du texte),
   mais aucune animation de repositionnement indépendante ne
   vient s'ajouter par-dessus : le mouvement vient uniquement
   du scroll lui-même, jamais d'un effet "chasing" séparé.
   ============================================================ */
const anchorElByZone = {
  service1: document.querySelector('#genie-civil .expertise-text'),
  service2: document.querySelector('#mines .expertise-text'),
  service3: document.querySelector('#geotechnique .expertise-text'),
  service4: document.querySelector('#hydraulique .expertise-text'),
  overview: document.querySelector('[data-zone="overview"] .services-head'),
};

// convertit un point écran (pixels) en position 3D à une profondeur donnée
function unprojectAtZ(screenX, screenY, worldZ) {
  const ndcX = (screenX / window.innerWidth) * 2 - 1;
  const ndcY = -(screenY / window.innerHeight) * 2 + 1;
  const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
  const dir = vec.sub(camera.position).normalize();
  const dist = (worldZ - camera.position.z) / dir.z;
  return camera.position.clone().addScaledVector(dir, dist);
}

/* ============================================================
   DÉTECTION DE ZONE — une seule fois par changement de section.
   Plus aucun calcul de position lié à l'avancement du scroll
   à l'intérieur d'une section : IntersectionObserver se charge
   juste de dire "on est entré dans telle section", point.
   ============================================================ */
function enterZone(zone) {
  if (zone !== currentZone) {
    currentZone = zone;
    zoneEnteredAt = performance.now();
  }
}

const zoneObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
      const zone = entry.target.dataset.zone;
      if (zone && window.scrollY >= window.innerHeight * 0.3) {
        enterZone(zone);
      }
    }
  });
}, { threshold: [0.45] });
zoneEls.forEach(el => zoneObserver.observe(el));

/* Le hero et la visibilité globale du canvas restent liés au
   scroll (c'est juste un show/hide, pas un repositionnement du 3D) */
function checkHeroAndVisibility() {
  const inHeroZone = window.scrollY < window.innerHeight * 0.3;
  const tooNarrow = window.innerWidth < 900;

  if (inHeroZone) enterZone('hero');

  let pastLastService = false;
  if (lastZoneEl) {
    const rect = lastZoneEl.getBoundingClientRect();
    pastLastService = rect.bottom < window.innerHeight * 0.35;
  }

  canvasWrap.classList.toggle('canvas-hidden', inHeroZone || pastLastService || tooNarrow);
}
window.addEventListener('scroll', checkHeroAndVisibility, { passive: true });
checkHeroAndVisibility();

/* ============================================================
   ANIMATION
   ============================================================ */
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const clock = new THREE.Clock();
const lerpSpeed = reduceMotion ? 0.25 : 0.12;

// fondus indépendants par groupe métier (0 = invisible, 1 = pleinement visible)
let fadeBtp = 0, fadeMines = 0, fadeGeo = 0, fadeHydro = 0;
const fadeLerp = 0.08;

// durée / décalage de l'apparition en cascade des lettres
const INTRO_DURATION = 0.55;
const INTRO_STAGGER = 0.06;

// durée de l'arrivée en position finale (indépendante du scroll,
// uniquement basée sur le temps écoulé depuis l'entrée dans la zone)
const ENTRY_DURATION = 0.9;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const timeInZone = (performance.now() - zoneEnteredAt) / 1000;

  // progression de l'arrivée : 0 -> 1 une fois, sur une durée fixe,
  // avec un léger rebond (easeOutBack) pour l'effet cascade
  const entryRaw = Math.min(timeInZone / ENTRY_DURATION, 1);
  const entryEase = easeOutBack(entryRaw);
  const entrySettled = Math.min(Math.max(entryRaw, 0), 1); // 0→1 propre, sans dépassement

  const propMode = serviceModes[currentZone] || 'idle';

  let targetX, targetY, targetZ, targetScale, targetRotZ;
  const anchorEl = anchorElByZone[currentZone];

  if (serviceModes[currentZone]) {
    // échelle / rotation / profondeur : animation d'entrée classique (une fois, dans le temps)
    const p = entryEase;
    targetZ     = travelState.z     + (arrivedState.z     - travelState.z)     * p;
    targetScale = travelState.scale + (arrivedState.scale - travelState.scale) * p;
    targetRotZ  = travelState.rotZ  + (arrivedState.rotZ  - travelState.rotZ)  * p;

    // position X/Y : ancrée à l'écran juste sous le texte de la section active.
    // Ça bouge AVEC le scroll (normal, comme du texte), mais ce n'est pas une
    // animation séparée : c'est la même position que le texte, point.
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const world = unprojectAtZ(rect.left + rect.width / 2, rect.bottom + 55, targetZ);
      // pendant la cascade d'entrée seulement, léger décalage de départ qui s'efface avec p
      targetX = world.x + (1 - p) * travelState.x;
      targetY = world.y + (1 - p) * -6;
    } else {
      targetX = arrivedState.x;
      targetY = arrivedState.y;
    }
  } else {
    const zoneCfg = zones[currentZone] || zones.hero;
    targetZ = zoneCfg.z; targetScale = zoneCfg.scale;
    targetRotZ = 0;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const world = unprojectAtZ(rect.left + rect.width / 2, rect.bottom + 55, targetZ);
      targetX = world.x;
      targetY = world.y;
    } else {
      targetX = zoneCfg.x;
      targetY = zoneCfg.y;
    }
  }

  // X/Y suivent directement l'ancre (donc le scroll) — pas de lissage qui
  // créerait un effet de "poursuite" visible et donnerait l'impression que
  // le 3D bouge tout seul, séparément du texte.
  cur.x = targetX;
  cur.y = targetY;
  // profondeur / échelle / rotation : lissées, c'est l'animation d'entrée
  cur.z += (targetZ - cur.z) * lerpSpeed;
  cur.scale += (targetScale - cur.scale) * lerpSpeed;
  cur.rotZ += (targetRotZ - cur.rotZ) * lerpSpeed;

  // effet "vivant" une fois arrivé — reste CONSTANT ensuite,
  // ne dépend plus jamais du scroll, seulement du temps
  const aliveAmount = entrySettled * entrySettled;
  const floatY = !reduceMotion ? Math.sin(t * 1.4) * 0.25 * aliveAmount : 0;
  const breathScale = !reduceMotion ? 1 + Math.sin(t * 1.8) * 0.04 * aliveAmount : 1;

  // fondu du mot pendant le "flip" vertical <-> horizontal (uniquement
  // pendant la phase d'arrivée, puis se stabilise à opacité pleine)
  const rotRatio = Math.min(Math.abs(cur.rotZ) / (Math.PI / 2), 1);
  const wordOpacity = 1 - Math.sin(rotRatio * Math.PI) * 0.55;
  material.opacity = wordOpacity;
  sideMaterial.opacity = wordOpacity;

  wordGroup.position.set(cur.x, cur.y + floatY, cur.z);
  wordGroup.scale.setScalar(cur.scale * breathScale);
  wordGroup.rotation.z = cur.rotZ;
  if (!reduceMotion) {
    wordGroup.rotation.y = Math.sin(t * 0.25) * 0.08;
    wordGroup.rotation.x = Math.sin(t * 0.3) * 0.05;
  }

  // --- fondus des groupes métiers ---
  const fadeTarget = { btp: 0, mines: 0, geo: 0, hydro: 0 };
  if (propMode !== 'idle') fadeTarget[propMode] = entrySettled;
  fadeBtp   += (fadeTarget.btp   - fadeBtp)   * fadeLerp;
  fadeMines += (fadeTarget.mines - fadeMines) * fadeLerp;
  fadeGeo   += (fadeTarget.geo   - fadeGeo)   * fadeLerp;
  fadeHydro += (fadeTarget.hydro - fadeHydro) * fadeLerp;

  bricksGroup.visible = fadeBtp > 0.01;
  minesGroup.visible  = fadeMines > 0.01;
  geoGroup.visible    = fadeGeo > 0.01;
  hydroGroup.visible  = fadeHydro > 0.01;
  cloudGroup.visible  = currentZone === 'overview';

  brickMat.opacity = fadeBtp;

  dirtMat.opacity = fadeMines;
  goldMat.opacity = fadeMines;

  soilMaterials.forEach(m => { m.opacity = fadeGeo; });
  lensGlassMat.opacity = 0.28 * fadeGeo;
  lensFrameMat.opacity = fadeGeo;

  pumpMat.opacity = fadeHydro;
  pumpMatDark.opacity = fadeHydro;
  groundPatchMat.opacity = fadeHydro;
  waterMat.opacity = 0.65 * fadeHydro;

  if (currentZone === 'overview') {
    const cycleLen = 4.6;
    const cycleT = timeInZone % cycleLen;
    let s;
    if (cycleT < 1.0) s = easeOutBack(cycleT / 1.0);
    else if (cycleT < 3.0) s = 1;
    else if (cycleT < 3.7) s = 1 - (cycleT - 3.0) / 0.7;
    else s = 0;
    cloudGroup.scale.setScalar(Math.max(s, 0.001));
    puffs.forEach(p => {
      p.position.y = p.userData.baseY + Math.sin(t * 1.2 + p.userData.phase) * 0.15;
    });
    cloudGroup.rotation.y = Math.sin(t * 0.15) * 0.1;
  } else {
    cloudGroup.scale.setScalar(0.001);
  }

  // --- lettres : animation par mode + apparition en cascade ---
  letterMeshes.forEach((mesh, i) => {
    mesh.material[0].wireframe = false;

    let baseY = 0;
    if (propMode === 'idle') {
      baseY = Math.sin(t * 0.8 + i * 0.8) * 0.3;
      mesh.rotation.x = 0; mesh.rotation.z = 0;
    }
    if (propMode === 'btp') {
      baseY = Math.abs(Math.sin(t * 3 + i * 0.5)) * 1.1;
      mesh.rotation.z = Math.sin(t * 3 + i) * 0.05;
      mesh.rotation.x = 0;
    }
    if (propMode === 'mines') {
      baseY = Math.sin(t * 1.6 + i * 0.6) * 0.3 - 0.2;
      mesh.rotation.x = Math.sin(t * 0.6 + i) * 0.12;
    }
    if (propMode === 'geo') {
      const flip = (Math.sin(timeInZone * 1.5) > 0.3) && timeInZone < 2.2;
      mesh.material[0].wireframe = flip;
      baseY = Math.sin(t * 0.8 + i * 0.8) * 0.25;
      mesh.rotation.x = 0;
    }
    if (propMode === 'hydro') {
      baseY = Math.sin(t * 0.8 + i * 0.8) * 0.2;
      mesh.rotation.x = 0;
    }

    // apparition en cascade : chaque lettre part d'un peu plus bas
    // et légèrement réduite, puis "rebondit" à sa place avec un délai
    const introDelay = i * INTRO_STAGGER;
    const introT = Math.min(Math.max((timeInZone - introDelay) / INTRO_DURATION, 0), 1);
    const introEase = easeOutBack(introT);
    const introOffsetY = (1 - introEase) * -3.5;
    const introScale = reduceMotion ? 1 : Math.max(introEase, 0.001);

    mesh.position.y = baseY + introOffsetY;
    mesh.scale.setScalar(introScale);
  });

  if (propMode === 'btp') {
    bricks.forEach((b, idx) => {
      const revealTime = idx * 0.07;
      const progress = Math.min(Math.max((timeInZone - revealTime) / 0.5, 0), 1);
      const eased = easeOutBack(progress);
      b.visible = progress > 0;
      b.position.y = b.userData.startY + (b.userData.targetY - b.userData.startY) * eased;
    });
  }

  if (propMode === 'mines') {
    dustMat.opacity = 0.6 * fadeMines;
    const pos = dustGeo.attributes.position.array;
    for (let p = 0; p < dustCount; p++) {
      dustLife[p] += 0.006;
      if (dustLife[p] > 1) { dustLife[p] = 0; pos[p * 3 + 1] = -6; pos[p * 3] = (Math.random() - 0.5) * 10; }
      pos[p * 3 + 1] += 0.02;
    }
    dustGeo.attributes.position.needsUpdate = true;

    nuggets.forEach((n) => {
      const cycle = ((timeInZone - n.userData.delay) % 3 + 3) % 3;
      n.visible = cycle < 1.8;
      const progress = Math.min(Math.max(cycle / 1.2, 0), 1);
      n.position.y = n.userData.baseY + Math.sin(progress * Math.PI) * 2.8;
      n.rotation.y += 0.05;
      n.rotation.x += 0.03;
    });
  } else {
    dustMat.opacity = 0;
  }

  if (propMode === 'geo') {
    const sweepX = Math.sin(t * 0.6) * 4;
    magnifierGroup.position.x = sweepX;
    magnifierGroup.position.y = 3 + Math.sin(t * 1.5) * 0.15;
    magnifierGroup.rotation.z = Math.sin(t * 0.6) * 0.15;
    scanGlow.position.x = sweepX;
    scanGlowMat.opacity = (0.35 + Math.sin(t * 3) * 0.15) * fadeGeo;
    scanGlow.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
  } else {
    scanGlowMat.opacity = 0;
  }

  if (propMode === 'hydro') {
    const pumpCycle = Math.sin(t * 2.2);
    leverGroup.rotation.z = pumpCycle * 0.35;

    const suctionDuration = 1.4;
    suctionBubbles.forEach(bub => {
      const cycle = ((t - bub.userData.delay) % suctionDuration + suctionDuration) % suctionDuration;
      const progress = cycle / suctionDuration;
      bub.visible = progress < 0.85;
      bub.position.y = (groundY - 1.8) + progress * 3.6;
      bub.material.opacity = 0.9 * (1 - progress * 0.4) * fadeHydro;
    });

    const dripDuration = 1.6;
    const cycleT = (t % dripDuration) / dripDuration;

    if (cycleT < 0.7) {
      const stretch = cycleT / 0.7;
      const dY = dropStartY - stretch * 1.3;
      dropMesh.position.y = dY;
      dropMesh.scale.set(1 - stretch * 0.35, 1 + stretch * 0.6, 1 - stretch * 0.35);
      dropMesh.visible = true;

      const threadLen = dropStartY - dY;
      threadMesh.visible = threadLen > 0.05;
      threadMesh.scale.y = threadLen;
      threadMesh.position.y = dropStartY - threadLen / 2;
      splashMat.opacity = 0;
    } else {
      const fall = (cycleT - 0.7) / 0.3;
      threadMesh.visible = false;
      dropMesh.visible = fall < 0.85;
      dropMesh.position.y = (dropStartY - 1.3) + (puddleY - (dropStartY - 1.3)) * fall;
      dropMesh.scale.set(0.85, 1.2 - fall * 0.5, 0.85);

      splashMat.opacity = (fall > 0.75 ? (1 - fall) * 3 : 0) * fadeHydro;
      splashRing.scale.setScalar(1 + fall * 3);
    }

    const fillProgress = Math.min(timeInZone / 1.4, 1);
    liquidMesh.scale.set(fillProgress, fillProgress, 1);
    liquidMat.opacity = (0.45 + Math.sin(t * 2) * 0.05) * fadeHydro;
  } else {
    liquidMesh.scale.x += (0.01 - liquidMesh.scale.x) * 0.1;
    liquidMesh.scale.y += (0.01 - liquidMesh.scale.y) * 0.1;
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  checkHeroAndVisibility();
});
