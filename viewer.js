/* v10 product page: a live 3D model of each unit, built from its own spec (series look: side profile, finish, grille,
   display, brand mark, size by capacity, its own outdoor unit). Drag to turn, idles into a slow turn, indoor / outdoor switch.
   CSModels.build(scene-free) is shared with tools/model-render.html, which renders the catalog pictures from the same models. */
(function () {
  if (!window.THREE) return;
  const T3 = THREE;
  const M = (c, r = .45, m = 0, extra) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m, envMapIntensity: m > .5 ? 1 : .55 }, extra));
  const PAINT = {
    white: () => M('#F4F5F5', .32, 0), gloss: () => M('#FAFAFA', .14, 0), matte: () => M('#EEF0F0', .6, 0),
    black: () => M('#141618', .55, .1), mirror: () => M('#0A0B0C', .04, .85), silver: () => M('#C9CED1', .26, .7),
    pearl: () => M('#EDEBE6', .22, .15), dark: () => M('#1B2328', .7, 0), grey: () => M('#9AA4A9', .45, .4),
  };

  /* side profile of a wall unit (z = depth toward the room, y = height), extruded along its width */
  function sideShape(o) {
    const d = o.d, h = o.h, b = o.bulge || 0, rt = o.rt ?? .1, hb = o.hb ?? h * .3, zs = d / 2 - (o.under ?? .42) * d;
    const front = y => d / 2 - b * Math.pow((y - (o.peak ?? 0)) / (h / 2), 2);
    const s = new T3.Shape(), yb = -h / 2 + hb, rb = o.rb ?? .06;
    s.moveTo(-d / 2, -h / 2); s.lineTo(-d / 2, h / 2 - .03); s.quadraticCurveTo(-d / 2, h / 2, -d / 2 + .03, h / 2);
    s.lineTo(front(h / 2) - rt, h / 2); s.quadraticCurveTo(front(h / 2), h / 2, front(h / 2 - rt), h / 2 - rt);
    for (let i = 1; i <= 16; i++) { const y = h / 2 - rt - (h / 2 - rt - yb - rb) * i / 16; s.lineTo(front(y), y); }
    const A = [front(yb), yb], B = [zs, -h / 2], k = rb / Math.hypot(A[0] - B[0], A[1] - B[1]);
    s.quadraticCurveTo(front(yb + rb * .2), yb, A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k);
    if (o.bot === 'round') s.quadraticCurveTo(B[0] + .02, B[1] + .01, B[0] - .06, B[1]); else s.lineTo(B[0], B[1]);
    s.lineTo(-d / 2, -h / 2);
    return { shape: s, front, A, B, yb };
  }
  function extrudeX(shape, w, bv = .03) {
    const g = new T3.ExtrudeGeometry(shape, { depth: w - bv * 2, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 5, curveSegments: 12 });
    g.translate(0, 0, -(w - bv * 2) / 2); g.rotateY(-Math.PI / 2); return g;
  }
  function roundRect(w, h, r) { const s = new T3.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rbox(w, h, d, r, bv = .02) { const g = new T3.ExtrudeGeometry(roundRect(w - bv * 2, h - bv * 2, Math.max(.001, Math.min(r, w / 2, h / 2) - bv)), { depth: Math.max(.001, d - bv * 2), bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 4, curveSegments: 10 }); g.translate(0, 0, -(d - bv * 2) / 2); return g; }

  /* canvas decals: brand marks, displays, perforation */
  function decal(wpx, hpx, draw) { const c = document.createElement('canvas'); c.width = wpx; c.height = hpx; const x = c.getContext('2d'); draw(x, wpx, hpx);
    const t = new T3.CanvasTexture(c); t.encoding = T3.sRGBEncoding; t.anisotropy = 4; return t; }
  /* brand mark sized by its letter height: returns a plane of height hgt */
  function logo(G, text, color, font, hgt, x, y, z, rx = 0, maxW = 9) {
    const f = font || '600 104px Helvetica, Arial, sans-serif', m = document.createElement('canvas').getContext('2d'); m.font = f;
    const tw = Math.ceil(m.measureText(text).width) + 24; hgt = Math.min(hgt, maxW * 160 / tw); const tex = decal(tw, 160, (c, w, h) => { c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = f; c.fillText(text, w / 2, h / 2 + 4); });
    return plane(G, tex, hgt * tw / 160, hgt, x, y, z, rx, { toneMapped: true }); }
  function displayTex(kind, color) { return decal(256, 96, (x, w, h) => {
    x.shadowColor = color; x.shadowBlur = 14; x.fillStyle = color;
    if (kind === 'digits') { x.font = '500 70px "Courier New", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('24°', w / 2, h / 2 + 4); }
    else if (kind === 'dots') { [-1, 0, 1].forEach(i => { x.beginPath(); x.arc(w / 2 + i * 34, h / 2, 7, 0, 7); x.fill(); }); }
    else if (kind === 'line') { x.fillRect(w * .2, h / 2 - 3, w * .6, 6); }
    else if (kind === 'dot') { x.beginPath(); x.arc(w / 2, h / 2, 8, 0, 7); x.fill(); } }); }
  function perfTex(color) { return decal(1024, 256, (x, w, h) => { x.fillStyle = color; for (let r = 0; r < 20; r++) for (let c = 0; c < 90; c++) { x.beginPath(); x.arc(8 + c * 11.3 + (r % 2) * 5.6, 8 + r * 12.4, 2.6, 0, 7); x.fill(); } }); }
  function grilleTex() { return decal(512, 512, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 2, 0, 7); x.clip(); x.strokeStyle = '#7B878D'; x.lineWidth = 5; for (let i = 8; i < w; i += 22) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }); }

  function plane(G, tex, w, h, x, y, z, rx = 0, opts) { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial(Object.assign({ map: tex, transparent: true, depthWrite: false, toneMapped: false }, opts)));
    m.position.set(x, y, z); m.rotation.x = rx; G.add(m); return m; }
  const add = (G, geom, mat, x = 0, y = 0, z = 0, rot) => { const m = new T3.Mesh(geom, mat); m.position.set(x, y, z); if (rot) m.rotation.set(...rot); G.add(m); return m; };

  /* ---------------- wall unit ---------------- */
  function wall(G, o) {
    const kw = o.kw || 2.6, w = o.w || Math.min(3.1, 2.2 + (kw - 2) * .17), h = o.h || Math.min(1, .72 + (kw - 2) * .045), d = o.d || .5 + Math.min(.12, (kw - 2) * .02);
    const P = Object.assign({ d, h }, o.profile), S = sideShape(P), body = PAINT[o.body || 'white']();
    const BV = .035; add(G, extrudeX(S.shape, w, BV), body);   // the bevel pushes every face out by BV
    const at = (y, lift = .004) => { const e = .002, f1 = S.front(y + e), f0 = S.front(y - e); return { z: S.front(y) + BV + lift, rx: Math.atan((f0 - f1) / (2 * e)) * -1 }; };
    /* a separate front panel (flat finishes): a thin slab on the face */
    if (o.panel) { const ph = (h / 2 - (P.rt ?? .1)) - S.yb - .02, py = S.yb + .01 + ph / 2, pm = PAINT[o.panel]();
      add(G, rbox(w - .07, ph, .03, .03, .01), pm, 0, py, S.front(py) + BV + .012); }
    /* seam lines across the face */
    (o.seams || []).forEach(t => { const y = S.yb + (h / 2 - S.yb) * t, a = at(y, .002); add(G, new T3.BoxGeometry(w - .08, .007, .006), PAINT.dark(), 0, y, a.z, [a.rx, 0, 0]); });
    /* trim stripe */
    if (o.trim) { const y = S.yb + (h / 2 - S.yb) * o.trim.at, a = at(y, o.panel ? .03 : .003); add(G, rbox(w * (o.trim.len || .96), o.trim.h || .018, .012, .006, .003), o.trim.m ? PAINT[o.trim.m]() : M(o.trim.c, .25, .6), 0, y, a.z, [a.rx, 0, 0]); }
    /* air outlet on the underside slope: dark slot, horizontal louvre, the flap */
    const [Az, Ay] = S.A, [Bz, By] = S.B, L = Math.hypot(Az - Bz, Ay - By), ny = (Ay - By) / L, nz = (Az - Bz) / L, phi = Math.atan2(-ny, nz);
    const on = { y: -nz, z: ny }, mz = (Az + Bz) / 2 + on.z * BV, my = (Ay + By) / 2 + on.y * BV;   // on: outward normal of the slope (down-front)
    const sw = w * (o.outlet || .9);
    add(G, new T3.BoxGeometry(sw, .006, L * .78), PAINT.dark(), 0, my + on.y * .002, mz + on.z * .002, [phi, 0, 0]);
    for (let i = -2; i <= 2; i++) add(G, new T3.BoxGeometry(sw * .98, .004, .012), M('#39444A', .6), 0, my + on.y * .01 + ny * i * L * .12, mz + on.z * .01 + nz * i * L * .12, [phi + .6, 0, 0]);
    const flapL = L * (o.flap || .62), fy = my + ny * L * .18 + on.y * .03, fz = mz + nz * L * .18 + on.z * .03;
    add(G, rbox(sw + .02, flapL, .022, .02, .008), o.flapM ? PAINT[o.flapM]() : body, 0, fy, fz, [phi + Math.PI / 2 - .28, 0, 0]);
    /* perforated panel (Midea Breezeless) */
    if (o.perf) { const y = S.yb + (h / 2 - S.yb) * o.perf.at, a = at(y, .004); plane(G, perfTex('#7D888D'), w * .9, (h / 2 - S.yb) * o.perf.h, 0, y, a.z, a.rx, { toneMapped: true }); }
    /* display and brand mark */
    if (o.display) { const y = S.yb + (h / 2 - S.yb) * (o.display.y ?? .25), a = at(y, o.panel ? .03 : .005), x = w / 2 * (o.display.x ?? 0);
      if (o.display.window) add(G, rbox(.34, .1, .01, .03, .004), M('#0D1114', .18, .3), x, y, a.z - .003, [a.rx, 0, 0]);
      plane(G, displayTex(o.display.kind, o.display.c || '#FFFFFF'), .3, .11, x, y, a.z + .004, a.rx); }
    if (o.logo) { const y = S.yb + (h / 2 - S.yb) * (o.logo.y ?? .78), a = at(y, o.panel ? .03 : .005), x = w / 2 * (o.logo.x ?? 0);
      logo(G, o.logo.t, o.logo.c || '#8A949A', o.logo.font, o.logo.s || .1, x, y, a.z + .002, a.rx); }
    /* the wall-side mounting plate shadow line */
    add(G, new T3.BoxGeometry(w - .2, h - .1, .01), PAINT.dark(), 0, 0, -d / 2 - .004);
  }

  /* ---------------- outdoor unit ---------------- */
  function outdoor(G, o) {
    const kw = o.kw || 2.6, fans = o.fans || 1, w = o.w || 1.75 + Math.min(.9, kw * .09), h = o.h || (fans === 2 ? 2.3 : 1.25 + Math.min(.6, kw * .06)), d = o.d || .66 + Math.min(.25, kw * .02);
    const body = PAINT[o.body || 'matte'](), dark = M('#283238', .7), metal = M('#59666C', .5, .3), fx = -w * .12, fr = Math.min(h / fans * .36, w * .27);
    add(G, rbox(w, h, d, .05, .025), body);
    add(G, new T3.BoxGeometry(w * .2, h * .92, .02), M('#E1E4E5', .55), w / 2 - w * .13, 0, d / 2 + .006);   // service panel
    add(G, rbox(.2, .14, .03, .03, .008), M('#B8C0C4', .4, .4), w / 2 - w * .13, -h * .3, d / 2 + .02);
    for (let f = 0; f < fans; f++) {
      const y = fans === 2 ? (f ? -h * .24 : h * .24) : 0;
      /* the opening reads as a hole: a near-black disc on the face, a raised rim, the blades and hub in it, the guard on top */
      add(G, new T3.CircleGeometry(fr * 1.04, 64), M('#0B0F11', .9), fx, y, d / 2 + .003);
      add(G, new T3.TorusGeometry(fr * 1.05, .022, 10, 72), body, fx, y, d / 2 + .006);
      add(G, new T3.CylinderGeometry(fr * .17, fr * .2, .05, 32), M('#3A464C', .45, .2), fx, y, d / 2 + .02, [Math.PI / 2, 0, 0]);
      for (let b = 0; b < 3; b++) { const bl = new T3.Mesh(new T3.CircleGeometry(fr * .82, 24, -.32, .64), M('#55636A', .45, .15, { side: T3.DoubleSide })); bl.position.set(fx, y, d / 2 + .012); bl.rotation.set(0, 0, b * Math.PI * 2 / 3 + .4); bl.scale.set(1, .55, 1); G.add(bl); }
      if (o.grille === 'bars') for (let i = -7; i <= 7; i++) { const yy = i * fr * .135, len = 2 * Math.sqrt(Math.max(0, (fr * 1.04) ** 2 - yy * yy)); if (len > .02) add(G, new T3.BoxGeometry(len, .012, .012), metal, fx, y + yy, d / 2 + .03); }
      else if (o.grille === 'grid') plane(G, grilleTex(), fr * 2.08, fr * 2.08, fx, y, d / 2 + .03, 0, { toneMapped: true });
      else { for (let i = 0; i < 9; i++) add(G, new T3.TorusGeometry(fr * (.2 + i * .1), .006, 6, 64), metal, fx, y, d / 2 + .03);
        add(G, new T3.BoxGeometry(.03, fr * 2, .012), metal, fx, y, d / 2 + .032); add(G, new T3.BoxGeometry(fr * 2, .03, .012), metal, fx, y, d / 2 + .032); }
    }
    if (o.side) add(G, new T3.BoxGeometry(.012, h * .9, d * .9), PAINT[o.side](), -w / 2 - .004, 0, 0);
    for (let i = 0; i < 14; i++) add(G, new T3.BoxGeometry(.01, h * .8, .012), M('#C8CED1', .6), w / 2 + .004, 0, -d / 2 + .06 + i * (d - .12) / 13, [0, 0, 0]);   // side fins
    if (o.logo) logo(G, o.logo.t, o.logo.c || '#6C777C', o.logo.font, .085, w / 2 - w * .13, h / 2 - .14, d / 2 + .02, 0, w * .18);   // on the service panel
    [-w * .32, w * .32].forEach(x => add(G, new T3.BoxGeometry(.16, .08, d + .14), M('#8E989D', .5, .4), x, -h / 2 - .04, 0));
  }

  /* ---------------- other types ---------------- */
  function cassette(G, o) { const b = PAINT.white(), s = 2.2;
    add(G, rbox(s, s, .14, .06, .03), b, 0, 0, 0, [Math.PI / 2, 0, 0]);
    add(G, new T3.BoxGeometry(1.24, .02, 1.24), M('#E3E6E7', .6), 0, -.08, 0);
    for (let i = -6; i <= 6; i++) add(G, new T3.BoxGeometry(1.2, .012, .018), M('#C3C9CC', .6), 0, -.09, i * .09);
    [[0, .86, 1.62, .16, 0], [0, -.86, 1.62, .16, 0], [.86, 0, .16, 1.62, 1], [-.86, 0, .16, 1.62, 1]].forEach(([x, z, a, c, r]) => { add(G, new T3.BoxGeometry(a, .02, c), M('#26323A', .7), x, -.075, z); add(G, new T3.BoxGeometry(r ? .12 : a * .98, .014, r ? c * .98 : .12), b, x, -.1, z, r ? [0, 0, x > 0 ? -.35 : .35] : [z > 0 ? .35 : -.35, 0, 0]); });
    add(G, new T3.BoxGeometry(1.7, .5, 1.7), M('#D7DCDE', .7, .1), 0, .32, 0);
    plane(G, displayTex('dots', '#3DA5FF'), .22, .08, .78, -.09, .78, -Math.PI / 2);
    if (o.logo) logo(G, o.logo.t, '#7A858A', null, .08, -.6, -.091, .96, -Math.PI / 2);
    G.rotation.x = -.9; }
  function ducted(G, o) { const b = M('#C9D0D3', .4, .55);
    add(G, rbox(2.6, .5, 1.5, .03, .015), b, 0, 0, 0);
    add(G, new T3.BoxGeometry(2.2, .38, .1), M('#9AA4A9', .45, .5), 0, 0, .8);
    for (let i = -10; i <= 10; i++) add(G, new T3.BoxGeometry(.02, .32, .02), M('#2A3940', .6), i * .1, 0, .86);
    add(G, new T3.BoxGeometry(2.2, .38, .08), M('#9AA4A9', .45, .5), 0, 0, -.79);
    add(G, new T3.BoxGeometry(.36, .4, .24), M('#E2E6E8', .5), 1.42, 0, .2);
    [-1.1, 1.1].forEach(x => add(G, new T3.BoxGeometry(.18, .06, 1.7), M('#7E888D', .5, .5), x, .28, 0));
    if (o.logo) logo(G, o.logo.t, '#4E5A60', null, .08, -.7, .02, .752, 0);
    G.rotation.x = .32; }
  function floorCeiling(G, o) { const b = PAINT.white(), w = 2.7, h = .72, d = 1.25;
    const S = sideShape({ d, h, bulge: .03, rt: .2, hb: h * .42, under: .5, rb: .1 }); G.rotation.x = .28;   // seen from below, as it hangs under the ceiling
    add(G, extrudeX(S.shape, w, .06), b);
    const y = S.yb - .06, z = S.front(S.yb) - .14; add(G, new T3.BoxGeometry(w * .86, .006, .4), PAINT.dark(), 0, y, z - .02, [.6, 0, 0]);
    add(G, rbox(w * .88, .16, .02, .03, .008), b, 0, y - .05, z + .08, [-.4, 0, 0]);
    plane(G, displayTex('digits', '#3DA5FF'), .3, .11, w * .32, .08, S.front(.08) + .066);
    if (o.logo) logo(G, o.logo.t, '#7A858A', null, .08, -w * .32, .16, S.front(.16) + .066, 0); }
  function mobile(G, o) { const b = PAINT.white(), w = 1.05, h = 2.5, d = .85;
    add(G, rbox(w, h, d, .22, .08), b);
    add(G, rbox(w * .8, .5, .04, .1, .015), M('#2B363C', .6), 0, h * .32, d / 2 + .005);
    for (let i = 0; i < 6; i++) add(G, new T3.BoxGeometry(w * .76, .022, .03), M('#5A676D', .55), 0, h * .25 + i * .075, d / 2 + .03, [-.4, 0, 0]);
    add(G, rbox(.52, .14, .02, .05, .005), M('#0E1215', .2, .2), 0, h * .1, d / 2 + .01);
    plane(G, displayTex('digits', '#E2261C'), .4, .14, 0, h * .1, d / 2 + .022);
    add(G, rbox(w * .7, h * .42, .02, .08, .006), M('#E6E9EA', .5), 0, -h * .18, d / 2 + .002);
    for (let i = 0; i < 10; i++) add(G, new T3.BoxGeometry(w * .6, .012, .012), M('#C0C7CA', .6), 0, -h * .36 + i * .08, d / 2 + .014);
    [-.36, .36].forEach(x => [-.28, .28].forEach(z => add(G, new T3.CylinderGeometry(.06, .06, .05, 20), M('#2A3238', .6), x, -h / 2 - .02, z, [0, 0, Math.PI / 2])));
    if (o.logo) logo(G, o.logo.t, '#7A858A', null, .08, 0, h * .43, d / 2 + .005, 0); }

  /* ---------------- per-product looks (indicative, after each series' real styling) ---------------- */
  const LG_FONT = '700 120px Helvetica, Arial, sans-serif', SERIF = '600 96px Georgia, serif';
  const SPEC = {
    'ballu-olympio-07':      { body: 'gloss', profile: { bulge: 0, rt: .04, hb: .2, under: .34, rb: .02 }, seams: [.18], display: { kind: 'digits', c: '#56B4FF', x: .55, y: .45 }, logo: { t: 'BALLU', x: -.62, y: .82, w: 0.54, c: '#9AA3A8', font: '700 110px Helvetica, Arial' } },
    'royal-clima-gloria-09': { body: 'white', profile: { bulge: .03, rt: .14, hb: .3 }, trim: { at: .55, c: '#B9C0C4', h: .02 }, display: { kind: 'digits', c: '#5AC8FF', x: 0, y: .32, window: true }, logo: { t: 'ROYAL CLIMA', x: -.6, y: .84, w: 0.64, c: '#9AA3A8', font: '500 92px Helvetica, Arial' } },
    'haier-coral-09':        { body: 'white', profile: { bulge: .06, rt: .2, hb: .34, rb: .1 }, seams: [.22], display: { kind: 'digits', c: '#5AC8FF', x: .5, y: .5 }, logo: { t: 'Haier', x: -.6, y: .8, w: 0.51, c: '#0B5CAD', font: 'italic 700 120px Helvetica, Arial' } },
    'hisense-expert-12':     { body: 'white', panel: 'gloss', profile: { bulge: 0, rt: .06, hb: .26, under: .38 }, display: { kind: 'digits', c: '#FFFFFF', x: .6, y: .45, window: true }, logo: { t: 'Hisense', x: -.62, y: .72, w: 0.54, c: '#00A6A0', font: '600 110px Helvetica, Arial' } },
    'midea-breezeless-09':   { body: 'gloss', profile: { bulge: .015, rt: .08, hb: .24, under: .36 }, perf: { at: .3, h: .42 }, display: { kind: 'line', c: '#7FD0FF', x: 0, y: .66 }, logo: { t: 'Midea', x: 0, y: .86, w: 0.42, c: '#2C8CD6', font: '700 112px Helvetica, Arial' }, outlet: .94 },
    'lg-artcool-09':         { body: 'black', panel: 'mirror', profile: { bulge: 0, rt: .03, hb: .2, under: .3, rb: .02 }, flapM: 'mirror', display: { kind: 'digits', c: '#FFFFFF', x: .62, y: .4 }, logo: { t: 'LG', x: -.72, y: .55, s: .16, c: '#C9CED1', font: LG_FONT } },
    'haier-flexis-12':       { body: 'black', profile: { bulge: .09, rt: .28, hb: .4, rb: .16, bot: 'round', peak: .05 }, flapM: 'black', display: { kind: 'digits', c: '#FFFFFF', x: 0, y: .3 }, logo: { t: 'Haier', x: 0, y: .78, w: 0.48, c: '#8E989D', font: 'italic 700 120px Helvetica, Arial' } },
    'electrolux-fusion-18':  { body: 'white', profile: { bulge: .04, rt: .16, hb: .3 }, trim: { at: .08, m: 'silver', h: .05, len: .9 }, display: { kind: 'digits', c: '#5AC8FF', x: .5, y: .45 }, logo: { t: 'Electrolux', x: -.55, y: .8, w: 0.67, c: '#1D3B6E', font: '500 100px Helvetica, Arial' } },
    'mitsubishi-ln-25':      { body: 'silver', profile: { bulge: 0, rt: .05, hb: .4, under: .5, rb: .03 }, seams: [.3], flapM: 'silver', display: { kind: 'dots', c: '#7CFFB0', x: .7, y: .5 }, logo: { t: 'MITSUBISHI ELECTRIC', x: -.5, y: .78, w: 0.90, c: '#4A5358', font: '600 74px Helvetica, Arial' }, outlet: .94, flap: .8 },
    'daikin-perfera-35':     { body: 'white', profile: { bulge: .05, rt: .18, hb: .32, rb: .09 }, seams: [.2], display: { kind: 'dot', c: '#4CD964', x: .78, y: .12 }, logo: { t: 'DAIKIN', x: 0, y: .12, w: 0.48, c: '#0097DB', font: '800 112px Helvetica, Arial' }, flap: .72 },
    'ballu-igreen-24':       { body: 'white', profile: { bulge: .02, rt: .12, hb: .28 }, seams: [.2], display: { kind: 'digits', c: '#56B4FF', x: .52, y: .45 }, logo: { t: 'BALLU', x: -.62, y: .8, w: 0.54, c: '#9AA3A8', font: '700 110px Helvetica, Arial' } },
    'haier-multi-2':         { multi: true, body: 'white', profile: { bulge: .05, rt: .18, hb: .32, rb: .08 }, seams: [.22], display: { kind: 'digits', c: '#5AC8FF', x: .5, y: .5 }, logo: { t: 'Haier', x: -.6, y: .8, w: 0.51, c: '#0B5CAD', font: 'italic 700 120px Helvetica, Arial' } },
  };
  const OUT = {
    'ballu-olympio-07': { grille: 'bars', logo: { t: 'BALLU' } }, 'royal-clima-gloria-09': { grille: 'round', logo: { t: 'ROYAL CLIMA', font: '500 92px Helvetica' } },
    'haier-coral-09': { grille: 'round', logo: { t: 'Haier', c: '#0B5CAD', font: 'italic 700 120px Helvetica' } }, 'hisense-expert-12': { grille: 'grid', logo: { t: 'Hisense', c: '#00A6A0' } },
    'midea-breezeless-09': { grille: 'grid', logo: { t: 'Midea', c: '#2C8CD6' } }, 'lg-artcool-09': { grille: 'round', side: 'black', logo: { t: 'LG', font: LG_FONT } },
    'haier-flexis-12': { grille: 'round', side: 'black', logo: { t: 'Haier', font: 'italic 700 120px Helvetica' } }, 'electrolux-fusion-18': { grille: 'bars', logo: { t: 'Electrolux', c: '#1D3B6E' } },
    'mitsubishi-ln-25': { grille: 'bars', body: 'white', logo: { t: 'MITSUBISHI ELECTRIC', font: '600 70px Helvetica' } }, 'daikin-perfera-35': { grille: 'round', logo: { t: 'DAIKIN', c: '#0097DB', font: '800 112px Helvetica' } },
    'ballu-igreen-24': { grille: 'bars', logo: { t: 'BALLU' } }, 'haier-multi-2': { grille: 'round', h: 1.95, logo: { t: 'Haier', c: '#0B5CAD', font: 'italic 700 120px Helvetica' } },
    'royal-clima-cassette-36': { grille: 'round', fans: 2, logo: { t: 'ROYAL CLIMA', font: '500 92px Helvetica' } }, 'midea-ducted-24': { grille: 'grid', logo: { t: 'Midea', c: '#2C8CD6' } },
    'ballu-floor-18': { grille: 'bars', logo: { t: 'BALLU' } },
  };
  const BRAND = { 'Royal Clima': 'ROYAL CLIMA', Ballu: 'BALLU', Midea: 'Midea' };
  /* real sizes from the spec sheets, mm, width × height × depth (indoor, outdoor); 1 scene unit = 350 mm.
     Where the exact model's sheet was not found, the nearest model of the same series stands in (noted). */
  const DIM = {
    'lg-artcool-09':         { in: [837, 308, 192], out: [717, 483, 230] },   // LG, AC09BQ
    'mitsubishi-ln-25':      { in: [890, 307, 233], out: [800, 550, 285] },   // MSZ-LN25VG / MUZ-LN25VG
    'hisense-expert-12':     { in: [978, 313, 217], out: [810, 585, 280] },   // same series, AS-13UW4RXVQF00
    'midea-breezeless-09':   { in: [940, 325, 193] },                         // same series, MSFA2-09N8D6
    'royal-clima-gloria-09': { in: [777, 250, 205] },                         // Gloria RC-GL28HN
    'daikin-perfera-35':     { in: [804, 298, 252] },                         // Perfera FTXM35A
    'haier-flexis-12':       { in: [856, 300, 197] },                         // same series, AS35S2SF4FA
    'haier-coral-09':        { in: [800, 290, 200] },                         // Haier 2.0–2.5 kW wall unit of the same class
    'ballu-olympio-07':      { in: [715, 285, 194] },                         // Ballu 07 wall unit of the same class
    'ballu-igreen-24':       { in: [1080, 335, 226], out: [890, 673, 342] },  // Ballu 24 wall unit of the same class
  };
  const U = mm => mm / 350;

  /* builds the unit into a new group; returns { group, radius } */
  function build(p, which) {
    const G = new T3.Group(), id = p.id;
    const dm = DIM[id] || {}, sized = (a, o) => a ? Object.assign(o, { w: U(a[0]), h: U(a[1]), d: U(a[2]) }) : o;
    if (which === 'out') outdoor(G, sized(dm.out, Object.assign({ kw: p.kw }, OUT[id] || { grille: 'round', logo: { t: p.brand } })));
    else if (p.type === 'wall' || p.type === 'multi') {
      const o = sized(dm.in, Object.assign({ kw: p.type === 'multi' ? 2.6 : p.kw }, SPEC[id] || { display: { kind: 'digits', c: '#5AC8FF', x: .5, y: .45 }, logo: { t: p.brand, x: -.6, y: .8, w: .34 } }));
      if (o.multi) { const a = new T3.Group(), b = new T3.Group(); wall(a, o); wall(b, Object.assign({}, o, { kw: 3.5 })); a.position.set(-.35, .62, .35); b.position.set(.35, -.55, -.35); G.add(a, b); }
      else wall(G, o);
    }
    else ({ cassette, ducted, floor: floorCeiling, mobile })[p.type](G, { logo: { t: BRAND[p.brand] || p.brand } });
    const tilt = G.rotation.x; G.rotation.x = 0; G.updateMatrixWorld(true);
    const box = new T3.Box3().setFromObject(G), c = box.getCenter(new T3.Vector3()), r = box.getSize(new T3.Vector3()).length() / 2;
    G.children.forEach(ch => ch.position.sub(c));
    const holder = new T3.Group(); holder.add(G); holder.rotation.x = tilt;
    return { group: holder, radius: r };
  }

  /* a soft studio environment so gloss, mirror and metal finishes read */
  function studio(renderer) {
    const env = new T3.Scene(), pm = new T3.PMREMGenerator(renderer);
    const sky = new T3.Mesh(new T3.SphereGeometry(20, 32, 16), new T3.MeshBasicMaterial({ side: T3.BackSide, map: decal(16, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f2f4f5'); g.addColorStop(.45, '#b3bbbf'); g.addColorStop(1, '#4a5257'); x.fillStyle = g; x.fillRect(0, 0, w, h); }) }));
    env.add(sky);
    [[-6, 6, 6, 8, 3], [7, 3, 2, 3, 6], [0, 8, -4, 10, 2]].forEach(([x, y, z, a, b]) => { const s = new T3.Mesh(new T3.PlaneGeometry(a, b), new T3.MeshBasicMaterial({ color: '#ffffff', side: T3.DoubleSide })); s.position.set(x, y, z); s.lookAt(0, 0, 0); env.add(s); });
    const t = pm.fromScene(env, .04).texture; pm.dispose(); return t;
  }
  function lights(scene) {
    scene.add(new T3.HemisphereLight('#ffffff', '#8a959b', .25));
    const key = new T3.DirectionalLight('#ffffff', .85); key.position.set(-3, 5, 6); scene.add(key);
    const rim = new T3.DirectionalLight('#eef3ff', .35); rim.position.set(4, 2, -5); scene.add(rim);
  }
  window.CSModels = { build, studio, lights };
})();

window.csViewer = function (p) {
  const canvas = document.getElementById('pv'), stage = document.getElementById('ppStage'), seg = document.getElementById('pvSeg');
  const fallback = () => { const f = document.getElementById('pvFallback'); f.src = `assets/shop/${p.img}.webp`; f.hidden = false; canvas.hidden = true; };
  if (!window.THREE || !window.CSModels) return fallback();
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return fallback(); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setClearColor(0, 0); renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  scene.environment = CSModels.studio(renderer); CSModels.lights(scene);
  let H, dist = 1.75;
  function build(which) { if (H) { scene.remove(H); H.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
    const m = CSModels.build(p, which); H = m.group; dist = m.radius * 1.32; scene.add(H); ry = -.5; }
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
      if (dirty) { const base = H.userData.base ?? (H.userData.base = H.rotation.x); H.rotation.y = ry; H.rotation.x = base + rx;
        const ar = camera.aspect, z = (ar < 1 ? 6.4 / ar * .62 : 6.2) * dist; camera.position.set(0, .35 * dist, z); camera.lookAt(0, 0, 0); renderer.render(scene, camera); dirty = false; }
    }
    requestAnimationFrame(loop);
  })(last);
};
