/*
  Couloir 3D "Chantier OZEP" — scroll infini en profondeur
  VERSION LUMINEUSE : ambiance plus claire, lumières renforcées
*/

(function () {
  const PROJECTS = [
    { src: 'assets/5922393493689011610_121.jpg', tag: 'Mines', title: 'Site de Kollo — traitement du minerai' },
    { src: 'assets/5922393493689011620_121.jpg', tag: 'Hydraulique', title: 'Ouvrage hydraulique' },
    { src: 'assets/5922393493689011625_121.jpg', tag: 'BTP', title: 'Chantier de construction' },
    { src: 'assets/mine-etude-mineraux.jpg', tag: 'Mines', title: 'Étude de minerais' },
    { src: 'assets/mine-etude-du-sol-par-membre-ozep1.png', tag: 'Géotechnique', title: 'Étude géotechnique du sol' },
    { src: 'assets/mine-membre-ozep-explotation-d-un-puit-creusere.jpg', tag: 'Mines', title: 'Exploitation d\'un puits' },
    { src: 'assets/mine-personne-non-ozep-en-collaboration-etude-de-mineraux.jpg', tag: 'Mines', title: 'Recherche géologique — petite mine' },
    { src: 'assets/btp-complexe-fini-et-construit1.png', tag: 'BTP', title: 'Complexe BTP livré' },
    { src: 'assets/btp-memebre-osep-su-chntier.jpg', tag: 'BTP', title: 'Équipe OZEP sur chantier' },
    { src: 'assets/5922393493689011630_121.jpg', tag: 'Mines', title: 'Bassin de cyanuration' },
    { src: 'assets/5922393493689011609_121.jpg', tag: 'BTP', title: 'Génie civil' },
    { src: 'assets/etude-geotechnique.png', tag: 'Géotechnique', title: 'Étude géotechnique' }
  ];

  const ORANGE = 0xf87d02;
  const CHARCOAL = 0x1e1e1e;
  const BLACK = 0x141414;

  const GAP = 4.6;
  const CORRIDOR_WIDTH = 10;
  const WALL_HEIGHT = 5.2;
  const FLOOR_Y = -1.1;
  const FOG_NEAR = 10;
  const FOG_FAR = 40;
  const SCROLL_SENSITIVITY = 0.001;
  const TOUCH_SENSITIVITY = 0.06;
  const SMOOTHING = 0.08;

  const MOUSE_SMOOTH = 0.05;
  const MOUSE_PARALLAX_X = 0.35;
  const MOUSE_PARALLAX_Y = 0.12;
  const MOUSE_YAW = 0.05;

  let mouseTargetX = 0, mouseTargetY = 0;
  let mouseX = 0, mouseY = 0;

  function pseudoRandom(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function tex(draw, w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function darkPanelTexture() {
    return tex((ctx, w, h) => {
      // Fond plus clair
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, '#3a3a3e');
      base.addColorStop(1, '#2a2a2c');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) {
        const g = 60 + pseudoRandom(i * 3.3) * 30;
        ctx.fillStyle = `rgba(${g},${g},${g + 2},${0.05 + pseudoRandom(i) * 0.05})`;
        const s = 1 + pseudoRandom(i * 7) * 2;
        ctx.fillRect(pseudoRandom(i * 5.1) * w, pseudoRandom(i * 8.4) * h, s, s);
      }
      const nPanels = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      for (let i = 1; i < nPanels; i++) {
        const x = (w / nPanels) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(248,125,2,0.35)';
      ctx.lineWidth = 1;
      for (let i = 1; i < nPanels; i++) {
        const x = (w / nPanels) * i + 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      const bandY = h * 0.5;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, bandY - 1, w, 2);
    }, 256, 256);
  }

  function metalTexture() {
    return tex((ctx, w, h) => {
      ctx.fillStyle = '#4a4d50';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 10) {
        const g = ctx.createLinearGradient(x, 0, x + 10, 0);
        g.addColorStop(0, 'rgba(255,255,255,0.08)');
        g.addColorStop(0.5, 'rgba(0,0,0,0.12)');
        g.addColorStop(1, 'rgba(255,255,255,0.08)');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 10, h);
      }
      const bandY = h * 0.72, bandH = h * 0.14;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, bandY, w, bandH);
      ctx.clip();
      const step = 20;
      for (let x = -h; x < w + h; x += step * 2) {
        ctx.fillStyle = '#f87d02';
        ctx.beginPath();
        ctx.moveTo(x, bandY + bandH);
        ctx.lineTo(x + step, bandY + bandH);
        ctx.lineTo(x + step + bandH, bandY);
        ctx.lineTo(x + bandH, bandY);
        ctx.fill();
      }
      ctx.fillStyle = '#2a2a2a';
      for (let x = -h + step; x < w + h; x += step * 2) {
        ctx.beginPath();
        ctx.moveTo(x, bandY + bandH);
        ctx.lineTo(x + step, bandY + bandH);
        ctx.lineTo(x + step + bandH, bandY);
        ctx.lineTo(x + bandH, bandY);
        ctx.fill();
      }
      ctx.restore();
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc((i + 0.5) * (w / 14), h * 0.12, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 256, 256);
  }

  function floorTexture() {
    return tex((ctx, w, h) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 120; i++) {
        const g = 20 + Math.random() * 20;
        ctx.fillStyle = `rgba(${g},${g},${g},0.06)`;
        const x = Math.random() * w, y = Math.random() * h;
        ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
      }
      for (let i = 0; i < 3; i++) {
        const px = pseudoRandom(i * 12.3) * w;
        const py = pseudoRandom(i * 7.7) * h;
        const pr = 40 + pseudoRandom(i * 4.4) * 60;
        const puddle = ctx.createRadialGradient(px, py, 0, px, py, pr);
        puddle.addColorStop(0, 'rgba(80,70,50,0.4)');
        puddle.addColorStop(0.7, 'rgba(50,45,35,0.25)');
        puddle.addColorStop(1, 'rgba(20,20,20,0)');
        ctx.fillStyle = puddle;
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * 0.55, pseudoRandom(i * 6) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 256, 256);
  }

  function skyTexture() {
    return tex((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#5a4a3a');
      g.addColorStop(0.55, '#7a5a3a');
      g.addColorStop(1, '#9a6a3a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }, 64, 256);
  }

  function glowTexture() {
    return tex((ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(248,125,2,0.7)');
      g.addColorStop(0.5, 'rgba(248,125,2,0.3)');
      g.addColorStop(1, 'rgba(248,125,2,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }, 128, 128);
  }

  function distantGlowTexture() {
    return tex((ctx, w, h) => {
      const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
      g.addColorStop(0, 'rgba(255, 200, 120, 0.9)');
      g.addColorStop(0.6, 'rgba(248, 125, 2, 0.5)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }, 512, 512);
  }

  function ozepSignTexture() {
    return tex((ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(248,125,2,0.85)';
      ctx.fillText('OZEP', w / 2, h / 2);
    }, 512, 160);
  }

  // ---------- CADRE ORANGE PUR ----------
  function makeGlowFrame(w, h, thickness, depth, color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + thickness, thickness, depth), mat);
    top.position.y = h / 2;
    g.add(top);
    const bottom = top.clone();
    bottom.position.y = -h / 2;
    g.add(bottom);
    const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, h + thickness, depth), mat);
    left.position.x = -w / 2;
    g.add(left);
    const right = left.clone();
    right.position.x = w / 2;
    g.add(right);
    g.userData.material = mat;
    return g;
  }

  function makeHelmet() {
    const g = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.35, metalness: 0.15 });
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
      shellMat
    );
    g.add(shell);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 24), shellMat);
    brim.rotation.x = Math.PI / 2;
    brim.position.y = 0.01;
    g.add(brim);
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xc76400, roughness: 0.4 })
    );
    rib.position.y = 0.16;
    g.add(rib);
    for (let s = -1; s <= 1; s += 2) {
      const vent = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })
      );
      vent.position.set(s * 0.08, 0.21, 0.02);
      g.add(vent);
    }
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.03), strapMat);
    strap.position.set(0.19, -0.06, 0.1);
    strap.rotation.z = 0.3;
    g.add(strap);
    g.rotation.z = 0.25;
    g.rotation.x = -0.1;
    return g;
  }

  function makeBoots() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a322a, roughness: 0.8 });
    for (let i = -1; i <= 1; i += 2) {
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.36), mat);
      boot.position.set(i * 0.13, 0.1, 0);
      boot.rotation.y = i * 0.15;
      g.add(boot);
    }
    return g;
  }

  function makePickaxe() {
    const g = new THREE.Group();
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x7a5a30, roughness: 0.7 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.4, metalness: 0.6 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.15, 8), handleMat);
    handle.position.y = 0.55;
    g.add(handle);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 6), headMat);
    head.rotation.z = Math.PI / 2;
    head.position.y = 1.12;
    g.add(head);
    const head2 = head.clone();
    head2.rotation.z = -Math.PI / 2;
    head2.position.x = 0.001;
    g.add(head2);
    g.rotation.z = 0.5;
    return g;
  }

  function makeTapeMeasure() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.11, 20),
      new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.5 })
    );
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.012, 8, 24),
      new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.5 })
    );
    g.add(band);
    return g;
  }

  function makePump() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5a6a72, roughness: 0.45, metalness: 0.4 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.35, metalness: 0.7 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.4, metalness: 0.2 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 }));
    base.position.y = 0.03;
    g.add(base);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 16), bodyMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(0, 0.22, 0);
    g.add(motor);
    for (let i = 0; i < 6; i++) {
      const fin = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.008, 6, 16), metalMat);
      fin.rotation.y = Math.PI / 2;
      fin.position.set(-0.13 + i * 0.05, 0.22, 0);
      g.add(fin);
    }
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.163, 0.163, 0.05, 16), orangeMat);
    stripe.rotation.z = Math.PI / 2;
    stripe.position.set(0, 0.22, 0);
    g.add(stripe);
    const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 10), metalMat);
    inlet.position.set(-0.16, 0.11, 0);
    g.add(inlet);
    const inletElbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), metalMat);
    inletElbow.position.set(-0.16, 0.22, 0);
    g.add(inletElbow);
    const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10), metalMat);
    outlet.rotation.z = Math.PI / 2.3;
    outlet.position.set(0.22, 0.36, 0);
    g.add(outlet);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    for (let s = -1; s <= 1; s += 2) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(s * 0.2, 0.05, 0.14);
      g.add(wheel);
    }
    return g;
  }

  function makeWheelbarrow() {
    const g = new THREE.Group();
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x9a9fa2, roughness: 0.5, metalness: 0.5 });
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.32, 12, 1, true, 0, Math.PI), trayMat);
    tray.rotation.z = Math.PI / 2;
    tray.rotation.y = Math.PI / 2;
    tray.position.set(0, 0.34, 0);
    g.add(tray);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.4 });
    for (let s = -1; s <= 1; s += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), legMat);
      leg.position.set(s * 0.16, 0.15, -0.28);
      leg.rotation.x = 0.5;
      g.add(leg);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), legMat);
      handle.position.set(s * 0.16, 0.32, -0.5);
      handle.rotation.x = 1.35;
      g.add(handle);
    }
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.045, 8, 16), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }));
    wheel.position.set(0, 0.14, 0.32);
    wheel.rotation.y = Math.PI / 2;
    g.add(wheel);
    return g;
  }

  function makeCementSacks() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xd0c0a0, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const sack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.34), mat);
      sack.position.set((pseudoRandom(i * 2.1) - 0.5) * 0.08, 0.09 + i * 0.15, (pseudoRandom(i * 3.3) - 0.5) * 0.06);
      sack.rotation.y = (pseudoRandom(i * 5.5) - 0.5) * 0.4;
      g.add(sack);
    }
    return g;
  }

  function makeCone() {
    const g = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 12), new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.6 }));
    cone.position.y = 0.21;
    g.add(cone);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.07, 12), new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.5 }));
    stripe.position.y = 0.26;
    g.add(stripe);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.3), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7 }));
    base.position.y = 0.02;
    g.add(base);
    return g;
  }

  function makeLadder() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xd68a2b, roughness: 0.5, metalness: 0.3 });
    for (let s = -1; s <= 1; s += 2) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.05), mat);
      rail.position.set(s * 0.22, 0.95, 0);
      g.add(rail);
    }
    for (let r = 0; r < 7; r++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.04), mat);
      rung.position.set(0, 0.2 + r * 0.26, 0);
      g.add(rung);
    }
    g.rotation.x = -0.3;
    return g;
  }

  function makeBrickStack() {
    const g = new THREE.Group();
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xac5a3e, roughness: 0.85 });
    const brickMatAlt = new THREE.MeshStandardMaterial({ color: 0x9a5138, roughness: 0.85 });
    const rows = 3, perRow = 3;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * 0.06;
      for (let c = 0; c < perRow; c++) {
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.09, 0.1),
          (c + r) % 2 === 0 ? brickMat : brickMatAlt
        );
        brick.position.set(
          c * 0.21 - 0.21 + offset + (pseudoRandom(r * 3 + c) - 0.5) * 0.015,
          0.045 + r * 0.095,
          (pseudoRandom(r * 5 + c * 2) - 0.5) * 0.02
        );
        brick.rotation.y = (pseudoRandom(r * 7 + c) - 0.5) * 0.06;
        g.add(brick);
      }
    }
    return g;
  }

  const PROP_BUILDERS = [makeHelmet, makeBoots, makePickaxe, makeTapeMeasure, makePump, makeWheelbarrow, makeCementSacks, makeCone, makeLadder, makeBrickStack];
  const animatedProps = [];

  function init() {
    if (typeof THREE === 'undefined') return;
    const stage = document.getElementById('corridor-3d-stage');
    if (!stage) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; display:block;';
    stage.style.position = stage.style.position || 'relative';
    stage.style.overflow = 'hidden';
    stage.appendChild(canvas);

    function getSize() {
      const rect = stage.getBoundingClientRect();
      return { w: Math.max(rect.width, 300), h: Math.max(rect.height, 180) };
    }

    const scene = new THREE.Scene();
    // Brouillard moins opaque, couleur plus claire
    scene.fog = new THREE.Fog(0x5a4a3a, FOG_NEAR, FOG_FAR);

    let size = getSize();
    const camera = new THREE.PerspectiveCamera(56, size.w / size.h, 0.1, 100);
    camera.position.set(0, 0.4, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.4; // plus lumineux
    renderer.setSize(size.w, size.h, false);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    function buildEnvTexture() {
      return tex((ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#7a5a3a');
        g.addColorStop(0.5, '#3a3a3c');
        g.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(248,125,2,0.4)';
        ctx.fillRect(0, h * 0.42, w, h * 0.05);
      }, 4, 128);
    }
    const envRawTex = buildEnvTexture();
    envRawTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmremGenerator.fromEquirectangular(envRawTex).texture;
    pmremGenerator.dispose();

    // Lumières plus intenses
    scene.add(new THREE.AmbientLight(0xfff0dd, 1.1));
    const sunLight = new THREE.DirectionalLight(0xffb066, 0.1);
    sunLight.position.set(2, 6, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -5;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const followLight = new THREE.PointLight(ORANGE, 0.0, 18, 2);
    camera.add(followLight);
    scene.add(camera);

    const composer = new THREE.EffectComposer(renderer);
    composer.setSize(size.w, size.h);
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(size.w, size.h), 0.7, 1, 0.4);
    composer.addPass(bloomPass);
    const vignettePass = new THREE.ShaderPass({
      uniforms: { tDiffuse: { value: null }, darkness: { value: 0.10 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float darkness; varying vec2 vUv; void main() { vec4 color = texture2D(tDiffuse, vUv); float dist = length(vUv-0.5); color.rgb *= 1.0 - darkness * pow(dist,2.5); gl_FragColor = color; }`
    });
    vignettePass.renderToScreen = true;
    composer.addPass(vignettePass);

    const NUM = PROJECTS.length;
    const PERIOD = NUM * GAP;
    const DECOR_LENGTH = PERIOD * 1.5;

    const decorGroup = new THREE.Group();
    scene.add(decorGroup);

    // Lueur lointaine plus visible
    const distantGlowTex = distantGlowTexture();
    const baseZ = -24;
    const glowMaterial = new THREE.MeshBasicMaterial({
      map: distantGlowTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      fog: false,
      opacity: 0.9
    });
    for (let k = -3; k <= 3; k++) {
      const glowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(CORRIDOR_WIDTH * 1.8, WALL_HEIGHT * 1.4),
        glowMaterial
      );
      glowPlane.position.set(0, FLOOR_Y + WALL_HEIGHT / 2, baseZ + k * PERIOD);
      glowPlane.rotation.y = Math.PI;
      decorGroup.add(glowPlane);
    }

    const leftWallTex = darkPanelTexture();
    leftWallTex.repeat.set(DECOR_LENGTH / 5, 1);
    const rightWallTex = darkPanelTexture();
    rightWallTex.repeat.set(DECOR_LENGTH / 5, 1);
    const wallGeo = new THREE.PlaneGeometry(DECOR_LENGTH, WALL_HEIGHT);

    const leftWall = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ map: leftWallTex, roughness: 0.8 }));
    leftWall.position.set(-CORRIDOR_WIDTH / 2, WALL_HEIGHT / 2 + FLOOR_Y, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    decorGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo.clone(), new THREE.MeshStandardMaterial({ map: rightWallTex, roughness: 0.8 }));
    rightWall.position.set(CORRIDOR_WIDTH / 2, WALL_HEIGHT / 2 + FLOOR_Y, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    decorGroup.add(rightWall);

    const bandTex = metalTexture();
    bandTex.repeat.set(DECOR_LENGTH / 5, 1);
    const bandGeo = new THREE.PlaneGeometry(DECOR_LENGTH, 0.9);
    for (let side = -1; side <= 1; side += 2) {
      const band = new THREE.Mesh(bandGeo.clone(), new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.6, metalness: 0.4 }));
      band.position.set(side * (CORRIDOR_WIDTH / 2 - 0.01), FLOOR_Y + 0.55, 0);
      band.rotation.y = side * -Math.PI / 2;
      band.castShadow = true;
      band.receiveShadow = true;
      decorGroup.add(band);
    }

    const nPatches = Math.round(DECOR_LENGTH / GAP);

    const floorTex = floorTexture();
    floorTex.repeat.set(1.4, DECOR_LENGTH / 5);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, DECOR_LENGTH),
      new THREE.MeshStandardMaterial({ map: floorTex, color: 0x222222, roughness: 0.12, metalness: 0.6, envMapIntensity: 1.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, 0);
    floor.receiveShadow = true;
    decorGroup.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH * 1.4, DECOR_LENGTH),
      new THREE.MeshBasicMaterial({ map: skyTexture(), fog: false })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, WALL_HEIGHT + FLOOR_Y - 0.1, 0);
    ceiling.receiveShadow = true;
    decorGroup.add(ceiling);

    const beamMat = new THREE.MeshStandardMaterial({ color: CHARCOAL, roughness: 0.5, metalness: 0.6 });
    const beamAccentMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.4, metalness: 0.3 });
    const nBeams = Math.round(DECOR_LENGTH / GAP);
    for (let i = 0; i <= nBeams; i++) {
      const z = -i * GAP + DECOR_LENGTH / 2;
      const beam = new THREE.Mesh(new THREE.BoxGeometry(CORRIDOR_WIDTH + 0.4, 0.16, 0.16), beamMat);
      beam.position.set(0, WALL_HEIGHT + FLOOR_Y - 0.15, z);
      beam.castShadow = true;
      beam.receiveShadow = true;
      decorGroup.add(beam);
      const diag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, GAP * 1.05), beamAccentMat);
      diag.position.set((i % 2 === 0 ? 1 : -1) * (CORRIDOR_WIDTH / 2 - 0.1), WALL_HEIGHT + FLOOR_Y - 0.3, z - GAP / 2);
      diag.rotation.x = Math.PI / 5.2;
      diag.castShadow = true;
      diag.receiveShadow = true;
      decorGroup.add(diag);
    }

    const drips = [];
    function attachWallTap(x, y, z, side) {
      const tapGroup = new THREE.Group();
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.3, metalness: 0.75 });
      const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.4, metalness: 0.6 });

      const armLength = 0.28;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, armLength, 12), pipeMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.x = -side * (armLength / 2);
      tapGroup.add(arm);

      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), darkMetalMat);
      collar.rotation.z = Math.PI / 2;
      tapGroup.add(collar);

      const bodyPos = -side * armLength;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 12), darkMetalMat);
      body.rotation.z = Math.PI / 2;
      body.position.x = bodyPos;
      tapGroup.add(body);

      const wheelMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.45, metalness: 0.2 });
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), wheelMat);
      wheel.position.set(bodyPos, 0.08, 0);
      tapGroup.add(wheel);
      for (let i = 0; i < 4; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.11, 0.012), wheelMat);
        spoke.position.set(bodyPos, 0.08, 0);
        spoke.rotation.z = (Math.PI / 4) * i;
        tapGroup.add(spoke);
      }
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), darkMetalMat);
      stem.position.set(bodyPos, 0.03, 0);
      tapGroup.add(stem);

      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 10), pipeMat);
      spout.position.set(bodyPos - side * 0.02, -0.07, 0);
      tapGroup.add(spout);
      const spoutTip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.02, 0.03, 10), darkMetalMat);
      spoutTip.position.set(bodyPos - side * 0.02, -0.14, 0);
      tapGroup.add(spoutTip);

      tapGroup.position.set(x, y, z);
      tapGroup.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      decorGroup.add(tapGroup);

      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x9fd3e8, transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.1 })
      );
      const startY = y - 0.16;
      const dropX = x - side * 0.02;
      drop.position.set(dropX, startY, z);
      drop.castShadow = true; drop.receiveShadow = true;
      decorGroup.add(drop);
      drips.push({ mesh: drop, startY, x: dropX, z, speed: 0.012 + pseudoRandom(x * z + 1) * 0.008, offset: pseudoRandom(x + z) * 40 });
    }

    const nTaps = Math.round(DECOR_LENGTH / (GAP * 2.5));
    for (let i = 0; i < nTaps; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      attachWallTap(
        side * (CORRIDOR_WIDTH / 2 - 0.03),
        FLOOR_Y + 1.5 + pseudoRandom(i * 6.2) * 0.6,
        -i * GAP * 2.5 + DECOR_LENGTH / 2 - GAP,
        side
      );
    }

    animatedProps.length = 0;
    for (let i = 0; i < nPatches; i++) {
      if (pseudoRandom(i * 13.3) > 0.55) continue;
      const builder = PROP_BUILDERS[Math.floor(pseudoRandom(i * 17.7) * PROP_BUILDERS.length)];
      const prop = builder();
      const side = pseudoRandom(i * 4.1) > 0.5 ? 1 : -1;
      const x = side * (0.9 + pseudoRandom(i * 6.6) * (CORRIDOR_WIDTH / 2 - 1.2));
      prop.position.set(x, FLOOR_Y, -i * GAP + DECOR_LENGTH / 2 + (pseudoRandom(i * 8.8) - 0.5) * GAP * 0.6);
      prop.rotation.y = pseudoRandom(i * 9.9) * Math.PI * 2;
      const scale = 0.85 + pseudoRandom(i * 5.5) * 0.4;
      prop.scale.setScalar(scale);
      prop.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      decorGroup.add(prop);
      animatedProps.push({
        mesh: prop,
        rotSpeedY: (pseudoRandom(i * 42) - 0.5) * 0.01,
        rotSpeedX: (pseudoRandom(i * 73) - 0.5) * 0.005,
        rotSpeedZ: (pseudoRandom(i * 17) - 0.5) * 0.005,
        bobSpeed: 0.5 + pseudoRandom(i * 31) * 0.5,
        bobAmp: 0.01 + pseudoRandom(i * 19) * 0.03,
        phase: pseudoRandom(i * 99) * Math.PI * 2
      });
    }

    const ozepTex = ozepSignTexture();
    const nSigns = Math.round(DECOR_LENGTH / (GAP * 4));
    for (let i = 0; i < nSigns; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.47),
        new THREE.MeshBasicMaterial({ map: ozepTex, transparent: true, fog: false })
      );
      sign.position.set(
        side * (CORRIDOR_WIDTH / 2 - 0.02),
        FLOOR_Y + 2.6,
        -i * GAP * 4 + DECOR_LENGTH / 2 - GAP * 2
      );
      sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      decorGroup.add(sign);
    }

    const loader = new THREE.TextureLoader();
    const paintings = [];
    const sharedGlowTex = glowTexture();

    function buildReflectionTexture(image) {
      const w = 256, h = 140;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      const cropFrac = 0.32;
      const sw = image.width, sh = image.height;
      const sCropH = sh * cropFrac;
      const sy = sh - sCropH;
      ctx.save();
      ctx.translate(0, h);
      ctx.scale(1, -1);
      ctx.drawImage(image, 0, sy, sw, sCropH, 0, 0, w, h);
      ctx.restore();
      ctx.globalCompositeOperation = 'destination-in';
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      return t;
    }

    function makePanel(project, i) {
      const side = i % 2 === 0 ? -1 : 1;
      const panelH = 2, panelW = 1.7;
      const xBase = side * (CORRIDOR_WIDTH / 2 - 3);
      const container = new THREE.Group();
      const g = new THREE.Group();
      container.add(g);
      const content = new THREE.Group();
      content.position.y = panelH / 2 + 0.06;
      g.add(content);

      const glowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(panelW * 1.9, panelH * 1.5),
        new THREE.MeshBasicMaterial({ map: sharedGlowTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
      );
      glowPlane.position.z = -0.12;
      content.add(glowPlane);

      const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW + 0.16, panelH + 0.16, 0.14),
        new THREE.MeshStandardMaterial({ color: BLACK, roughness: 0.3, metalness: 0.7 })
      );
      bezel.position.z = -0.08;
      bezel.castShadow = true; bezel.receiveShadow = true;
      content.add(bezel);

      const screenMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.12, metalness: 0.05,
        emissive: 0x222222, emissiveIntensity: 0.2, transparent: true, side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(panelW - 0.1, panelH - 0.1), screenMat);
      screen.position.z = 0.005;
      screen.castShadow = true; screen.receiveShadow = true;
      content.add(screen);

      const glowFrame = makeGlowFrame(panelW, panelH, 0.045, 0.07, ORANGE);
      glowFrame.position.z = 0.035;
      glowFrame.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      content.add(glowFrame);

      const cornerMat = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false });
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy]) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), cornerMat);
        dot.position.set(sx * (panelW/2+0.03), sy * (panelH/2+0.03), 0.04);
        dot.castShadow = true; dot.receiveShadow = true;
        content.add(dot);
      });

      const reflectionMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, fog: false, side: THREE.FrontSide
      });
      const refPlane = new THREE.Mesh(new THREE.PlaneGeometry(panelW-0.1, 1), reflectionMat);
      refPlane.rotation.x = -Math.PI/2;
      const reflectGroup = new THREE.Group();
      reflectGroup.position.set(0, -0.02, 0.2);
      reflectGroup.add(refPlane);
      g.add(reflectGroup);

      const jitterZ = (pseudoRandom(i * 3.7) - 0.5) * 0.6;
      container.userData.baseZ = -i * GAP;
      container.userData.side = side;
      container.userData.jitterZ = jitterZ;
      container.userData.project = project;
      container.userData.materials = [screenMat, glowFrame.userData.material];
      container.userData.reflectionMat = reflectionMat;
      container.userData.reflectGroup = reflectGroup;
      g.userData.tiltAway = -side * 0.85;
      container.position.set(xBase, FLOOR_Y, 0);

      loader.load(project.src, texture => {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.encoding = THREE.sRGBEncoding;
        screenMat.map = texture;
        screenMat.color.set(0xffffff);
        screenMat.emissive.set(0x000000);
        screenMat.needsUpdate = true;
        reflectionMat.map = buildReflectionTexture(texture.image);
        reflectionMat.needsUpdate = true;
      });

      scene.add(container);
      paintings.push(container);
    }

    PROJECTS.forEach(makePanel);

    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 200;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i*3] = (Math.random() - 0.5) * CORRIDOR_WIDTH;
      dustPositions[i*3+1] = FLOOR_Y + Math.random() * (WALL_HEIGHT - 0.5);
      dustPositions[i*3+2] = (Math.random() - 0.5) * DECOR_LENGTH;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xffd8a8, size: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, transparent: true, opacity: 0.35 });
    const dustParticles = new THREE.Points(dustGeometry, dustMat);
    decorGroup.add(dustParticles);

    let targetScroll = 0, currentScroll = 0;
    stage.addEventListener('wheel', e => { e.preventDefault(); targetScroll += e.deltaY * SCROLL_SENSITIVITY; }, { passive: false });
    let touchStartY = null;
    stage.addEventListener('touchstart', e => { if (e.touches.length === 1) touchStartY = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchmove', e => {
      if (touchStartY === null || e.touches.length !== 1) return;
      targetScroll += (touchStartY - e.touches[0].clientY) * TOUCH_SENSITIVITY;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', () => { touchStartY = null; });

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      mouseTargetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTargetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    });
    stage.addEventListener('mouseleave', () => {
      mouseTargetX = 0;
      mouseTargetY = 0;
    });

    window.addEventListener('resize', () => {
      size = getSize();
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      renderer.setSize(size.w, size.h, false);
      composer.setSize(size.w, size.h);
      bloomPass.setSize(size.w, size.h);
      sunLight.shadow.camera.updateProjectionMatrix();
    });

    function smoothstep(edge0, edge1, x) {
      const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }

    let panState = 0, tiltState = 0;

    function animate() {
      requestAnimationFrame(animate);
      currentScroll += (targetScroll - currentScroll) * SMOOTHING;

      const t = performance.now() * 0.001;
      const sc = currentScroll;
      const campZ = 6 - sc;
      const SWITCH_EPS = -GAP * 0.8;

      let panTarget = 0, bestDiff = -Infinity;
      paintings.forEach(container => {
        let diff = (container.userData.baseZ - campZ) % PERIOD;
        if (diff <= -PERIOD/2) diff += PERIOD;
        if (diff > PERIOD/2) diff -= PERIOD;
        if (diff < SWITCH_EPS && diff > bestDiff) {
          bestDiff = diff;
          panTarget = container.userData.side;
        }
      });

      const headTiltFactor = bestDiff > -Infinity ? smoothstep(GAP*0.85, 0, Math.abs(bestDiff)) : 0;
      const PAN_SMOOTH = 0.035;
      panState += (panTarget - panState) * PAN_SMOOTH;
      tiltState += (panTarget - tiltState) * PAN_SMOOTH;

      mouseX += (mouseTargetX - mouseX) * MOUSE_SMOOTH;
      mouseY += (mouseTargetY - mouseY) * MOUSE_SMOOTH;

      const idleX = Math.sin(t*0.35)*0.10, idleY = Math.sin(t*0.5)*0.05;
      const idleTiltZ = Math.sin(t*0.3)*0.01, idleTiltX = Math.sin(t*0.45)*0.015;

      const dx = panState * 0.55 + idleX + mouseX * MOUSE_PARALLAX_X;
      const dy = 0.6 + idleY + Math.sin(sc*0.05)*0.05 - mouseY * MOUSE_PARALLAX_Y;
      const dz = campZ;

      camera.position.set(dx, dy, dz);
      camera.rotation.y = -tiltState * 0.10 + mouseX * MOUSE_YAW;
      camera.rotation.x = idleTiltX + 0.12 * headTiltFactor;
      camera.rotation.z = idleTiltZ;

      decorGroup.position.z = Math.round(camera.position.z / PERIOD) * PERIOD;

      drips.forEach(d => {
        d.mesh.position.y -= d.speed;
        if (d.mesh.position.y < FLOOR_Y + 0.02) d.mesh.position.y = d.startY;
      });

      const dustPos = dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        dustPos[i*3+1] += 0.002;
        if (dustPos[i*3+1] > FLOOR_Y + WALL_HEIGHT - 0.5) dustPos[i*3+1] = FLOOR_Y;
        dustPos[i*3] += (Math.random()-0.5)*0.003;
        dustPos[i*3+2] += (Math.random()-0.5)*0.003;
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;

      animatedProps.forEach(p => {
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.x = p.rotSpeedX * Math.sin(t * p.bobSpeed + p.phase);
        p.mesh.rotation.z = p.rotSpeedZ * Math.cos(t * p.bobSpeed + p.phase);
        p.mesh.position.y = FLOOR_Y + p.bobAmp * Math.sin(t * p.bobSpeed * 2 + p.phase);
      });

      paintings.forEach((container, idx) => {
        const panel = container.children[0];
        let diff = (container.userData.baseZ - camera.position.z) % PERIOD;
        if (diff <= -PERIOD/2) diff += PERIOD;
        if (diff > PERIOD/2) diff -= PERIOD;
        container.position.z = camera.position.z + diff + container.userData.jitterZ;

        const idle = Math.sin(t*0.8 + idx)*0.05;
        panel.position.y = 0.1 + idle;
        panel.rotation.z = Math.sin(t*0.45 + idx)*0.02;
        panel.rotation.x = Math.sin(t*0.35 + idx)*0.01;

        const dist = Math.abs(diff);
        const proximity = smoothstep(GAP*1.5, GAP*0.9, dist);
        const scale = 0.94 + proximity * 0.08;
        panel.scale.set(scale, scale, scale);
        panel.rotation.y = panel.userData.tiltAway * (1 - proximity);
        if (container.userData.reflectGroup) container.userData.reflectGroup.rotation.y = -panel.rotation.y;

        container.userData.materials.forEach(m => m.opacity = 0.45 + proximity * 0.55);
        container.userData.materials[0].emissiveIntensity = 0.05 + proximity * 0.40;
        const ref = container.userData.reflectionMat;
        if (ref) ref.opacity = THREE.MathUtils.clamp(1 - panel.position.y/3, 0.2, 1) * (0.35 + proximity*0.65);
      });

      composer.render();
    }

    animate();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    requestAnimationFrame(init);
  } else {
    window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(init));
  }
})();