// ScienceLab · ортақ 3D құралдар (Three.js 0.160)
// Кәдімгі скрипт: file:// арқылы ашқанда да жұмыс істейді. Бетте: const K = await window.SLkit;
window.SLkit = (async () => {
const THREE = await import("three");
const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const fmt = (n, d = 2) => n.toFixed(d).replace(".", ",");

/* ---------- сахна ---------- */
function makeWorld(stage, o) {
  o = Object.assign({ fov: 26, cam: V(0, 4, 15), look: V(0, 1.3, 0), controls: false, exposure: 0.95 }, o);
  const canvas = document.createElement("canvas");
  stage.prepend(canvas);
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = o.exposure;
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(o.fov, 1, 0.1, 100);
  cam.position.copy(o.cam); cam.lookAt(o.look);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2f33, 0.55));
  const d = new THREE.DirectionalLight(0xffffff, 2.4);
  d.position.set(-6, 11, 6); d.castShadow = true;
  d.shadow.mapSize.set(2048, 2048); d.shadow.radius = 6; d.shadow.bias = -0.0004;
  Object.assign(d.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  scene.add(d);
  const rim = new THREE.DirectionalLight(0xfff1d6, 1.2); rim.position.set(7, 4, -6); scene.add(rim);

  let ctl = null;
  if (o.controls) {
    ctl = new OrbitControls(cam, canvas);
    ctl.target.copy(o.look); ctl.enableDamping = true; ctl.enablePan = false;
    Object.assign(ctl, o.controls);
    ctl.update();
  }

  // белгілер қабаты
  const ov = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ov.setAttribute("class", "ov"); stage.appendChild(ov);
  const labels = [];
  const W = { r, scene, cam, ctl, stage, canvas, w: 1, h: 1, frames: [], labels };
  W.proj = (v) => { const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W.w, y: (1 - p.y) / 2 * W.h, vis: p.z < 1 }; };
  W.label = (pos, html, dx, dy) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = `<polyline fill="none" stroke="rgba(236,233,227,.5)" stroke-width="1"/><circle r="3" fill="none" stroke="rgba(236,233,227,.6)" stroke-width="1.2"/>`;
    ov.appendChild(g);
    const el = document.createElement("div"); el.className = "lb"; el.innerHTML = html; stage.appendChild(el);
    const L = { pos, el, g, dx, dy, on: true }; labels.push(L); return L;
  };
  function placeLabels() {
    const sm = W.w < 600 ? 0.6 : 1;
    labels.forEach(L => {
      const v = typeof L.pos === "function" ? L.pos() : L.pos;
      const p = W.proj(v), show = L.on && p.vis;
      L.el.style.display = show ? "" : "none"; L.g.style.display = show ? "" : "none";
      if (!show) return;
      const dx = L.dx * sm, dy = L.dy * sm, ex = p.x + dx, ey = p.y + dy, hx = ex + (dx > 0 ? 16 : -16);
      L.g.children[0].setAttribute("points", `${p.x},${p.y} ${ex},${ey} ${hx},${ey}`);
      L.g.children[1].setAttribute("cx", p.x); L.g.children[1].setAttribute("cy", p.y);
      L.el.style.left = (dx > 0 ? hx + 8 : hx - 8) + "px"; L.el.style.top = ey + "px";
      L.el.style.transform = `translate(${dx > 0 ? 0 : "-100%"},-50%)`; L.el.style.textAlign = dx > 0 ? "left" : "right";
    });
  }
  function resize() {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    W.w = w; W.h = h; r.setSize(w, h, false); cam.aspect = w / h;
    if (o.hfov) { const a = w / h, t = Math.tan(o.hfov * Math.PI / 360); cam.fov = Math.min(o.maxV || 60, Math.max(o.fov, 2 * Math.atan(t / a) * 180 / Math.PI)); }
    if (o.fit) o.fit(W);
    cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();
  const clock = new THREE.Clock();
  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    W.frames.forEach(f => f(dt, t));
    if (ctl) ctl.update();
    r.render(scene, cam); placeLabels();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  W.shadows = (root) => root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return W;
}

/* ---------- материалдар ---------- */
const M = {
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transmission: 1, thickness: 0.12, ior: 1.45, transparent: true, side: THREE.DoubleSide, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.05 }),
  liquid: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.2, transmission: 0, emissive: c, emissiveIntensity: 0.18, clearcoat: 1 }),
  matte: (c, r) => new THREE.MeshStandardMaterial({ color: c, roughness: r === undefined ? 0.7 : r, metalness: 0 }),
  gloss: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
  chrome: (c) => new THREE.MeshStandardMaterial({ color: c || 0xcfd3da, roughness: 0.2, metalness: 1, envMapIntensity: 1.2 }),
};

/* ---------- ыдыстар ---------- */
function table(W, w, d, color) {
  const t = new THREE.Mesh(new RoundedBoxGeometry(w, 0.3, d, 4, 0.04), M.matte(color || 0x1d2124, 0.82));
  t.position.y = -0.15; W.scene.add(t); return t;
}

// Эрленмейер колбасы; setLevel(0..1), setColor(hex)
function erlen(s) {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.92, 0], [0.99, 0.05], [1.0, 0.12], [0.34, 1.32], [0.3, 1.36], [0.3, 1.92], [0.36, 1.96], [0.37, 2.02]].map(p => new THREE.Vector2(p[0], p[1]));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 96), M.glass()));
  const mat = M.liquid(0xffffff);
  const lq = new THREE.Mesh(new THREE.BufferGeometry(), mat); g.add(lq);
  g.scale.setScalar(s);
  let lvl = -1;
  g.userData.setLevel = (f) => {
    f = Math.max(0, Math.min(1, f));
    if (Math.abs(f - lvl) < 0.002) return; lvl = f;
    lq.visible = f > 0.01; if (!lq.visible) return;
    const top = 0.05 + f * 1.2, rt = 0.97 - Math.max(0, top - 0.12) * (0.63 / 1.2);
    const lp = [[0, 0.035], [0.9, 0.035], [0.95, 0.08], [Math.min(0.955, rt + 0.02), Math.min(0.13, top)], [rt, top], [0, top]].map(p => new THREE.Vector2(p[0], p[1]));
    lq.geometry.dispose(); lq.geometry = new THREE.LatheGeometry(lp, 96);
  };
  g.userData.mat = mat;
  g.userData.top = () => 0.05 + Math.max(lvl, 0) * 1.2;
  g.userData.setLevel(0);
  return g;
}

// химиялық стакан; setLevel(0..1)
function beaker(s, color) {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.68, 0], [0.72, 0.04], [0.72, 1.45], [0.8, 1.52]].map(p => new THREE.Vector2(p[0], p[1]));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 96), M.glass()));
  const lq = new THREE.Mesh(new THREE.CylinderGeometry(0.69, 0.69, 1, 96), M.liquid(color)); g.add(lq);
  const tk = new THREE.MeshBasicMaterial({ color: 0xcfcfcf });
  for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 0.16 : 0.28, 0.018, 0.02), tk); t.position.set(0.18, 0.35 + i * 0.18, 0.72); g.add(t); }
  g.scale.setScalar(s);
  g.userData.setLevel = (f) => { const h = Math.max(0.001, f * 1.3); lq.scale.y = h; lq.position.y = h / 2 + 0.03; lq.visible = f > 0.005; };
  g.userData.mat = lq.material;
  return g;
}

function tube(color, h) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * 0.14, 0.14 + Math.sin(a) * 0.14)); }
  pts.push(new THREE.Vector2(0.14, 1.6), new THREE.Vector2(0.165, 1.64));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), M.glass()));
  const lp = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI / 2; lp.push(new THREE.Vector2(Math.cos(a) * 0.125, 0.15 + Math.sin(a) * 0.125)); }
  lp.push(new THREE.Vector2(0.125, h), new THREE.Vector2(0, h));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(lp, 48), M.liquid(color)));
  return g;
}

function gradCyl(color, f) {
  const g = new THREE.Group();
  const cpts = [[0, 0.12], [0.3, 0.12], [0.3, 3.1], [0.36, 3.18]].map(p => new THREE.Vector2(p[0], p[1]));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(cpts, 64), M.glass()));
  const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.12, 6), M.matte(0xe9e7e2, 0.4)); cb.position.y = 0.06; g.add(cb);
  const h = 2.9 * f, cl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, h, 48), M.liquid(color)); cl.position.y = 0.12 + h / 2; g.add(cl);
  const tk = new THREE.MeshBasicMaterial({ color: 0xcfcfcf });
  for (let i = 0; i < 12; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 0.1 : 0.18, 0.012, 0.01), tk); t.position.set(-0.12, 0.5 + i * 0.22, 0.3); g.add(t); }
  return g;
}

function rack(colors) {
  const g = new THREE.Group();
  const rm = M.matte(0x6b5038, 0.7);
  [1.0, 0.05].forEach(y => { const b = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.1, 0.55, 2, 0.02), rm); b.position.y = y; g.add(b); });
  [-1.15, 1.15].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.5), rm); s.position.set(x, 0.5, 0); g.add(s); });
  colors.forEach((c, i) => { const t = tube(c[0], c[1]); t.scale.setScalar(0.9); t.position.set(-0.81 + i * 0.54, 0.1, 0); g.add(t); });
  return g;
}

/* ---------- интерфейс ---------- */
function initNav() {
  if (window.SLsync) window.SLsync.onReady(showPts);
  const b = document.querySelector(".menu-btn"), n = document.querySelector(".nv");
  if (b && n) b.addEventListener("click", () => n.classList.toggle("open"));
  showPts();
}
function getPts() { try { return Number(localStorage.getItem("sl_pts") || 0); } catch (e) { return 0; } }
function showPts() {
  const Y = window.SLsync; if (Y && Y.data) { Y.showPts(); return; }
  const el = document.querySelector(".pts b"); if (el) el.textContent = getPts();
}
// Ұпай қосу. key: жетістіктің бірегей аты, бір жетістікке бір рет қана ұпай беріледі.
// Кірген оқушыда ұпай Firebase-ке, қонақта осы браузерге сақталады.
function addPts(n, title, key) {
  const Y = window.SLsync;
  if (Y && Y.data) { const r = Y.award(key || title, n, title); if (r === "dup") { toast(title, "бұрын алынған"); return; } toast(title, `+${n} ұпай`); return; }
  let keys = {}; try { keys = JSON.parse(localStorage.getItem("sl_keys") || "{}"); } catch (e) { }
  if (keys[key || title]) { toast(title, "бұрын алынған"); return; }
  keys[key || title] = 1;
  try { localStorage.setItem("sl_keys", JSON.stringify(keys)); localStorage.setItem("sl_pts", getPts() + n); } catch (e) { }
  showPts(); toast(title, `+${n} ұпай`);
}
let tt;
function toast(text, sub) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.innerHTML = `${sub ? `<small>${sub}</small>` : ""}${text}`;
  el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2600);
}
function quiz(root, onOk) {
  root.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    if (root.classList.contains("done") || b.classList.contains("no")) return;
    const ok = b.dataset.ok !== undefined;
    if (window.SLsync) window.SLsync.quiz(document.body.dataset.exp, ok);
    if (ok) { b.classList.add("ok"); root.classList.add("done"); onOk && onOk(); }
    else b.classList.add("no");
  }));
}
function progress(obj) { if (window.SLsync) window.SLsync.progress(document.body.dataset.exp, obj); }
function rangeFill(inp) {
  const f = () => inp.style.setProperty("--p", ((inp.value - inp.min) / (inp.max - inp.min) * 100) + "%");
  inp.addEventListener("input", f); f();
}

return { THREE, RoundedBoxGeometry, OrbitControls, V, fmt, makeWorld, M, table, erlen, beaker, tube, gradCyl, rack, initNav, addPts, toast, quiz, rangeFill, progress };
})();
