/* v12 product page: a live 3D model of the unit on the dark stage. Same parametric models as tools/product-render.html.
   Drag to turn (pointer or touch), idles into a slow turn, indoor / outdoor unit switch. Falls back to the render image. */
window.csViewer = function (p) {
  const canvas = document.getElementById('pv'), stage = document.getElementById('ppStage'), seg = document.getElementById('pvSeg');
  const fallback = () => { const f = document.getElementById('pvFallback'); f.src = `../assets/shop/${p.img}.webp`; f.hidden = false; canvas.hidden = true; };
  if (!window.THREE) return fallback();
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return fallback(); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setClearColor(0, 0); renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  scene.add(new THREE.HemisphereLight('#ffffff', '#20303a', .8));
  const key = new THREE.DirectionalLight('#ffffff', 1.1); key.position.set(-3, 5, 6); scene.add(key);
  const blue = new THREE.DirectionalLight('#6f86ff', .55); blue.position.set(4, 1, -4); scene.add(blue);
  const red = new THREE.DirectionalLight('#ff6a5c', .35); red.position.set(3, -3, 3); scene.add(red);
  const M = (c, r = .45, m = .05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  function roundRect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rbox(w, h, d, r, bv = .02) { const g = new THREE.ExtrudeGeometry(roundRect(w - bv * 2, h - bv * 2, Math.max(.001, r - bv)), { depth: d - bv * 2, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 4, curveSegments: 10 }); g.translate(0, 0, -(d - bv * 2) / 2); return g; }
  let G;
  const add = (geom, mat, x = 0, y = 0, z = 0, rot) => { const m = new THREE.Mesh(geom, mat); m.position.set(x, y, z); if (rot) m.rotation.set(...rot); G.add(m); return m; };
  const LOOK = {
    'wall-white': [M('#F5F6F6', .42), M('#FFFFFF', .35), '#3DA5FF', {}], 'wall-pro': [M('#F2F3F3', .38), M('#FAFAFA', .2), '#E2261C', { r: .06, stripe: '#C9CFD3' }],
    'wall-black': [M('#0B0D0E', .3, .3), M('#060708', .18, .35), '#FFFFFF', { r: .08, stripe: '#5A646A' }], 'wall-silver': [M('#C5CBCE', .3, .55), M('#D9DDDF', .25, .6), '#3DA5FF', { r: .12 }],
    'wall-compact': [M('#F5F6F6', .45), M('#FFFFFF', .4), '#3DA5FF', { w: 2.1, h: .72, r: .2 }],
  };
  function wall(body, panel, accent, o) { const w = o.w || 2.4, h = o.h || .78, d = .56;
    add(rbox(w, h, d, o.r ?? .16, .05), body); add(rbox(w - .04, h * .74, .04, .08, .015), panel, 0, h * .1, d / 2 + .005);
    add(rbox(w * .88, .07, .05, .03, .01), M('#1A2226', .7), 0, -h * .36, d * .28, [-.5, 0, 0]); add(rbox(w * .9, .1, .03, .04, .01), body, 0, -h * .42, d * .38, [-.9, 0, 0]);
    add(rbox(.26, .07, .02, .03, .005), M('#0E1215', .3, .2), w * .3, -h * .05, d / 2 + .03); add(new THREE.CircleGeometry(.012, 16), new THREE.MeshBasicMaterial({ color: accent }), w * .3 + .08, -h * .05, d / 2 + .042);
    if (o.stripe) add(rbox(w - .1, .012, .01, .005, .002), M(o.stripe, .35, .5), 0, h * .2, d / 2 + .03); return 1.75; }
  function cassette() { add(new THREE.BoxGeometry(2.3, .22, 2.3), M('#F4F5F5', .5)); add(new THREE.BoxGeometry(1.2, .02, 1.2), M('#E3E6E7', .6), 0, -.12, 0);
    for (let i = -5; i <= 5; i++) add(new THREE.BoxGeometry(1.14, .012, .02), M('#C7CDD0', .6), 0, -.13, i * .1);
    const sl = M('#2A3940', .6); [[0, .85, 1.7, .12], [0, -.85, 1.7, .12], [.85, 0, .12, 1.7], [-.85, 0, .12, 1.7]].forEach(([x, z, a, b]) => add(new THREE.BoxGeometry(a, .02, b), sl, x, -.115, z));
    add(new THREE.BoxGeometry(1.6, .45, 1.6), M('#DADFE1', .7), 0, .33, 0); G.rotation.x = -.85; return 2.0; }
  function floorCeiling() { const b = M('#F3F4F4', .45); add(rbox(2.6, .7, 1.25, .2, .06), b); add(rbox(2.3, .12, .05, .05, .015), M('#1A2226', .7), 0, -.12, .64, [-.4, 0, 0]); add(rbox(2.4, .14, .03, .05, .01), b, 0, -.2, .68, [-.9, 0, 0]); add(rbox(.3, .08, .02, .03, .005), M('#0E1215', .3, .2), .85, .14, .64); return 1.8; }
  function ducted() { add(new THREE.BoxGeometry(2.6, .55, 1.5), M('#D5DADC', .55, .25)); const fl = M('#9AA4A9', .5, .4); add(new THREE.BoxGeometry(2.2, .42, .08), fl, 0, 0, .78); add(new THREE.BoxGeometry(2.2, .42, .08), fl, 0, 0, -.78);
    for (let i = -8; i <= 8; i++) add(new THREE.BoxGeometry(.03, .36, .02), M('#2A3940', .6), i * .12, 0, .83); G.rotation.x = .3; return 1.9; }
  function outdoor(fans) { const body = M('#F1F2F2', .55), dark = M('#2A3940', .6), w = fans === 2 ? 2.3 : 2.0, h = fans === 2 ? 2.2 : 1.45;
    add(new THREE.BoxGeometry(w, h, .82), body);
    for (let f = 0; f < fans; f++) { const y = fans === 2 ? (f ? -.5 : .5) : 0, x = -.22; add(new THREE.CylinderGeometry(.56, .56, .05, 48), dark, x, y, .4, [Math.PI / 2, 0, 0]);
      for (let i = 0; i < 9; i++) add(new THREE.TorusGeometry(.12 + i * .052, .008, 6, 48), M('#59666C', .5, .3), x, y, .44);
      add(new THREE.BoxGeometry(.04, 1.1, .02), M('#59666C', .5, .3), x, y, .45); add(new THREE.BoxGeometry(1.1, .04, .02), M('#59666C', .5, .3), x, y, .45); }
    add(new THREE.BoxGeometry(.42, h * .8, .02), M('#E2E5E6', .6), w / 2 - .3, -.02, .42); [-.7, .7].forEach(x => add(new THREE.BoxGeometry(.18, .08, .9), M('#9AA4A9', .5, .4), x, -h / 2 - .04, 0)); return fans === 2 ? 2.1 : 1.7; }
  function mobile() { const b = M('#F4F5F5', .45); add(rbox(1.05, 2.4, .9, .24, .06), b); add(rbox(.82, .5, .04, .08, .01), M('#2A3940', .6), 0, .82, .45);
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(.78, .025, .02), M('#59666C', .6), 0, .64 + i * .075, .47);
    add(rbox(.5, .12, .02, .04, .005), M('#0E1215', .3, .2), 0, .38, .46); add(new THREE.CircleGeometry(.014, 16), new THREE.MeshBasicMaterial({ color: '#E2261C' }), .17, .38, .472); return 1.7; }
  const indoor = () => p.type === 'wall' ? wall(...LOOK[p.img] || LOOK['wall-white']) : p.type === 'multi' ? wall(...LOOK['wall-pro']) : p.type === 'cassette' ? cassette() : p.type === 'ducted' ? ducted() : p.type === 'floor' ? floorCeiling() : mobile();
  const outer = () => outdoor(p.type === 'multi' ? 2 : 1);
  let dist = 1;
  function build(which) { if (G) { scene.remove(G); G.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } G = new THREE.Group(); scene.add(G); dist = which === 'out' ? outer() : indoor(); G.rotation.y = -.5; ry = -.5; }
  if (p.type === 'mobile') seg.hidden = true;
  if (p.type === 'multi') { seg.querySelector('[data-u="in"]').textContent = 'Внутренние блоки'; }
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); build(b.dataset.u); dirty = true; });
  let ry = -.5, vy = 0, rx = 0, drag = null, last = performance.now(), idle = 0, dirty = true;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); idle = 0; });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; vy = dx * .008; ry += vy; rx = Math.max(-.35, Math.min(.45, rx + dy * .004)); dirty = true; });
  ['pointerup', 'pointercancel'].forEach(t => canvas.addEventListener(t, () => { drag = null; }));
  canvas.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { ry -= .2; dirty = true; } if (e.key === 'ArrowRight') { ry += .2; dirty = true; } });
  canvas.tabIndex = 0;
  function size() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  new ResizeObserver(size).observe(stage);
  let visible = true; new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
  build('in'); size();
  (function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) {
      if (!drag) { vy *= .92; ry += vy; idle += dt; if (!reduce && idle > 1.2) { ry += dt * .25; dirty = true; } if (Math.abs(vy) > 1e-4) dirty = true; }
      if (dirty) { const base = G.userData.base ?? (G.userData.base = G.rotation.x); G.rotation.y = ry; G.rotation.x = base + rx;
        const ar = camera.aspect, z = (ar < 1 ? 6.4 / ar * .62 : 6.2) * dist; camera.position.set(0, .35 * dist, z); camera.lookAt(0, 0, 0); renderer.render(scene, camera); dirty = false; }
    }
    requestAnimationFrame(loop);
  })(last);
};
