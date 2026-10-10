/* v11 — shared behaviour: cart (localStorage), product cards, catalog filters, product page, checkout, request popup, consent, cookie notice. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.CS_PRODUCTS || [], T = window.CS_TYPES || {}, INST = window.CS_INSTALL || 14900;
  const byId = id => P.find(p => p.id === id);
  const rub = n => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
  const kw = n => String(n).replace('.', ',');
  const IMG = k => `../assets/shop/${k}.webp`;
  const instPrice = p => p.install === undefined ? INST : p.install; // number, 0 = not needed, null = after survey
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- storage (never trusted to exist) ---------- */
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- cart ---------- */
  const cart = {
    items() { return store.get('cs11-cart', []).filter(i => byId(i.id)); },
    save(list) { store.set('cs11-cart', list); this.badge(); document.dispatchEvent(new CustomEvent('cartchange')); },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    has(id) { return this.items().some(i => i.id === id); },
    add(id, qty = 1, inst) { const list = this.items(), p = byId(id), it = list.find(i => i.id === id);
      if (it) it.qty = Math.min(20, it.qty + qty); else list.push({ id, qty, inst: inst ?? (instPrice(p) > 0) });
      this.save(list); },
    set(id, patch) { const list = this.items(), it = list.find(i => i.id === id); if (!it) return; Object.assign(it, patch); it.qty = Math.max(1, Math.min(20, it.qty)); this.save(list); },
    remove(id) { this.save(this.items().filter(i => i.id !== id)); },
    clear() { this.save([]); },
    badge() { const n = this.count(); $$('.cart-n').forEach(b => { b.textContent = n; b.dataset.n = n; }); $$('.cart-btn').forEach(b => b.setAttribute('aria-label', n ? `Корзина, товаров: ${n}` : 'Корзина, пусто')); },
  };
  window.csCart = cart;

  let toastT;
  function toast(html) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3800); }
  function bump() { $$('.cart-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }

  /* ---------- product card ---------- */
  function spec(p) { return `до ${p.area} м² · ${kw(p.kw)} кВт${p.inverter ? ' · инвертор' : ''}`; }
  function instLine(p) { const v = instPrice(p); return v === null ? 'монтаж — по смете после замера' : v === 0 ? 'монтаж не нужен' : `+ монтаж ${rub(v)}`; }
  function card(p) {
    const tags = (p.tags || []).map((t, i) => `<span class="tag${i === 0 && t === 'Хит' ? ' tag-red' : ''}">${t}</span>`).join('') + (p.wifi ? '<span class="tag">Wi-Fi</span>' : '');
    const inC = cart.has(p.id);
    return `<article class="pc"><a class="pc-img" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${IMG(p.img)}" alt="" width="800" height="600" loading="lazy"><span class="pc-tags">${tags}</span></a>
      <div class="pc-b"><span class="mono">${esc(p.brand)} · ${T[p.type]}</span><a class="pc-n" href="product.html?id=${p.id}">${esc(p.brand)} ${esc(p.name)}</a><span class="pc-spec">${spec(p)}</span>
      <div class="pc-f"><div><span class="price">${rub(p.price)}</span><small>${instLine(p)}</small></div>
      <button class="btn btn-s add${inC ? ' in' : ''}" type="button" data-add="${p.id}">${inC ? 'В корзине ✓' : 'В корзину'}</button></div></div></article>`;
  }
  window.csCard = card;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    if (b.classList.contains('in')) { location.href = 'cart.html'; return; }
    const p = byId(b.dataset.add); cart.add(p.id); b.classList.add('in'); b.textContent = 'В корзине ✓'; bump();
    toast(`${esc(p.brand)} ${esc(p.name)} — в корзине <a href="cart.html">Оформить</a>`);
  });
  function syncAddButtons() { $$('[data-add]').forEach(b => { const inC = cart.has(b.dataset.add); b.classList.toggle('in', inC); if (!b.dataset.keep) b.textContent = inC ? 'В корзине ✓' : 'В корзину'; }); }
  document.addEventListener('cartchange', syncAddButtons);
  addEventListener('storage', e => { if (e.key === 'cs11-cart') { cart.badge(); syncAddButtons(); document.dispatchEvent(new CustomEvent('cartchange')); } });

  /* ---------- phone mask + consent ---------- */
  function mask(ph) { ph.addEventListener('input', () => { let d = ph.value.replace(/\D/g, ''); if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1); d = d.slice(0, 10);
    ph.value = d ? '+7 ' + d.slice(0, 3) + (d.length > 3 ? ' ' + d.slice(3, 6) : '') + (d.length > 6 ? '-' + d.slice(6, 8) : '') + (d.length > 8 ? '-' + d.slice(8, 10) : '') : ''; }); }
  const phoneOk = ph => ph.value.replace(/\D/g, '').length >= 11;
  function bad(el, err, msg) { err.textContent = msg; el.setAttribute('aria-invalid', 'true'); el.focus(); return false; }
  function pdOk(form, err) { const b = $('.pd-box', form); if (!b || b.checked) { if (b) b.removeAttribute('aria-invalid'); return true; } return bad(b, err, 'Подтвердите согласие на обработку персональных данных.'); }
  document.addEventListener('change', e => { if (e.target.classList?.contains('pd-box') && e.target.checked) { e.target.removeAttribute('aria-invalid'); const er = e.target.closest('form')?.querySelector('.err'); if (er) er.textContent = ''; } });
  document.addEventListener('input', e => { if (e.target.getAttribute?.('aria-invalid') === 'true' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') e.target.removeAttribute('aria-invalid'); });
  $$('input[type="tel"]').forEach(mask);
  const PD = id => `<label class="pd"><input type="checkbox" class="pd-box" id="${id}"><span>Согласен на обработку персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>`;

  /* simple lead forms: [data-lead] with a phone (+ optional name) and the consent box */
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const err = $('.err', f), ph = $('input[type="tel"]', f), nm = $('input[name="name"]', f), co = $('input[name="company"]', f); err.textContent = '';
    if (co && !co.value.trim()) return bad(co, err, 'Укажите компанию.');
    if (nm && nm.required && !nm.value.trim()) return bad(nm, err, 'Напишите, как к вам обращаться.');
    if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
    if (!pdOk(f, err)) return;
    f.innerHTML = `<div class="done" style="padding:8px 0"><span class="mono">${f.dataset.lead === 'kp' ? 'запрос получен' : 'заявка принята'}</span><b>${f.dataset.lead === 'kp' ? 'Подготовим КП и свяжемся в течение рабочего дня' : 'Перезвоним в течение 15 минут'}</b><p>Прототип: данные никуда не отправляются.</p></div>`;
  }));

  /* ---------- request popup ---------- */
  const md = $('#md');
  if (md) {
    const fresh = $('#mdForm').innerHTML; let back = null;
    function mdOpen(btn) {
      const f = $('#mdForm'); if (!$('#mdPhone', f)) { f.innerHTML = fresh; mask($('#mdPhone')); $('#mdX').addEventListener('click', mdClose); }
      $('#mdT').textContent = btn.dataset.title || 'Оставить заявку';
      $('#mdS').textContent = btn.dataset.sub || 'Оставьте телефон — перезвоним в течение 15 минут в рабочее время.';
      $('#mdWhat').value = btn.dataset.what || btn.dataset.title || 'Заявка с сайта';
      $('#mdErr').textContent = ''; back = btn; md.showModal(); setTimeout(() => $('#mdName').focus(), 40);
    }
    function mdClose() { if (md.open) md.close(); }
    md.addEventListener('close', () => { if (back) back.focus(); });
    md.addEventListener('click', e => { if (e.target === md) mdClose(); });
    $('#mdX').addEventListener('click', mdClose); mask($('#mdPhone'));
    document.addEventListener('click', e => { const b = e.target.closest('[data-req]'); if (!b) return; e.preventDefault(); $('#drawer')?.classList.remove('on'); mdOpen(b); });
    md.addEventListener('submit', e => {
      e.preventDefault(); const f = $('#mdForm'), n = $('#mdName'), ph = $('#mdPhone'), err = $('#mdErr'); err.textContent = '';
      if (!n.value.trim()) return bad(n, err, 'Напишите, как к вам обращаться.');
      if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
      if (!pdOk(f, err)) return;
      f.innerHTML = `<button class="md-x" type="button" aria-label="Закрыть">×</button><div class="done" style="padding:8px 0"><span class="mono kick">заявка принята</span><b>Перезвоним в течение 15 минут</b><p>Прототип: данные никуда не отправляются.</p><button class="btn" type="button">Хорошо</button></div>`;
      $$('button', f).forEach(b => b.addEventListener('click', mdClose)); $('.btn', f).focus();
    });
  }

  /* ---------- mobile drawer ---------- */
  const dr = $('#drawer'), bg = $('.burger');
  if (dr && bg) {
    const set = on => { dr.classList.toggle('on', on); bg.setAttribute('aria-expanded', on); document.documentElement.style.overflow = on ? 'hidden' : ''; if (on) $('.x', dr).focus(); else bg.focus(); };
    bg.addEventListener('click', () => set(true)); $('.x', dr).addEventListener('click', () => set(false)); $('.drawer-bg', dr).addEventListener('click', () => set(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dr.classList.contains('on')) set(false); });
  }

  /* ---------- cookie notice ---------- */
  const ck = $('#ck');
  if (ck && !store.get('cs-cookie', 0)) { ck.hidden = false; setTimeout(() => ck.classList.add('on'), 900);
    $('#ckOk').addEventListener('click', () => { store.set('cs-cookie', 1); ck.classList.remove('on'); setTimeout(() => { ck.hidden = true; }, 400); }); }

  cart.badge();
  const page = document.body.dataset.page;

  /* ---------- home: bestsellers ---------- */
  if (page === 'home') { const g = $('#hits'); g.innerHTML = [...P].sort((a, b) => b.pop - a.pop).slice(0, 4).map(card).join(''); }

  /* ---------- catalog ---------- */
  if (page === 'catalog') {
    const grid = $('#grid'), cnt = $('#cnt'), flt = $('#flt'), sort = $('#sort');
    const brands = [...new Set(P.map(p => p.brand))].sort();
    $('#fType').innerHTML = Object.entries(T).map(([k, v]) => `<label class="chk"><input type="checkbox" name="type" value="${k}"> ${v}<em>${P.filter(p => p.type === k).length}</em></label>`).join('');
    $('#fBrand').innerHTML = brands.map(b => `<label class="chk"><input type="checkbox" name="brand" value="${esc(b)}"> ${esc(b)}<em>${P.filter(p => p.brand === b).length}</em></label>`).join('');
    const AREAS = [[0, 20, 'до 20 м²'], [20, 30, '20–30'], [30, 40, '30–40'], [40, 60, '40–60'], [60, 999, '60+']];
    $('#fArea').innerHTML = AREAS.map(([a, b, l], i) => `<button type="button" class="chip" aria-pressed="false" data-i="${i}">${l}</button>`).join('');
    const q = new URLSearchParams(location.search);
    (q.get('type') || '').split(',').filter(Boolean).forEach(t => { const c = $(`input[name="type"][value="${t}"]`); if (c) c.checked = true; });
    if (q.get('area')) { const a = +q.get('area'), i = AREAS.findIndex(([lo, hi]) => a > lo && a <= hi); if (i >= 0) $(`#fArea [data-i="${i}"]`).setAttribute('aria-pressed', 'true'); }
    function state() { return { types: $$('input[name="type"]:checked').map(c => c.value), brands: $$('input[name="brand"]:checked').map(c => c.value),
      areas: $$('#fArea [aria-pressed="true"]').map(b => AREAS[+b.dataset.i]), min: +$('#pMin').value || 0, max: +$('#pMax').value || Infinity,
      inv: $('#fInv').checked, wifi: $('#fWifi').checked }; }
    function render() {
      const s = state(); let list = P.filter(p => (!s.types.length || s.types.includes(p.type)) && (!s.brands.length || s.brands.includes(p.brand))
        && (!s.areas.length || s.areas.some(([lo, hi]) => p.area > lo && p.area <= hi)) && p.price >= s.min && p.price <= s.max && (!s.inv || p.inverter) && (!s.wifi || p.wifi));
      const o = sort.value; list.sort(o === 'cheap' ? (a, b) => a.price - b.price : o === 'exp' ? (a, b) => b.price - a.price : o === 'area' ? (a, b) => a.area - b.area : (a, b) => b.pop - a.pop);
      grid.innerHTML = list.length ? list.map(card).join('') : `<div class="empty card" style="grid-column:1/-1"><b>Ничего не нашлось</b><p>Попробуйте убрать часть фильтров — или позвоните, подберём модель под вашу комнату.</p><button class="btn btn-line" type="button" id="emptyReset">Сбросить фильтры</button></div>`;
      const n = list.length; cnt.textContent = `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'модель' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'модели' : 'моделей'}`;
      $('#fN').textContent = n; const act = s.types.length + s.brands.length + s.areas.length + (s.min ? 1 : 0) + (s.max < Infinity ? 1 : 0) + s.inv + s.wifi; $('#fAct').textContent = act ? ` · ${act}` : '';
      const u = new URLSearchParams(); if (s.types.length) u.set('type', s.types.join(',')); history.replaceState(null, '', u.toString() ? '?' + u : location.pathname);
    }
    flt.addEventListener('change', render); flt.addEventListener('input', e => { if (e.target.closest('.range')) render(); }); sort.addEventListener('change', render);
    $('#fArea').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render(); });
    function reset() { $$('input[type="checkbox"]', flt).forEach(c => c.checked = false); $$('#fArea .chip').forEach(b => b.setAttribute('aria-pressed', 'false')); $('#pMin').value = ''; $('#pMax').value = ''; render(); }
    $('#fReset').addEventListener('click', reset); grid.addEventListener('click', e => { if (e.target.id === 'emptyReset') reset(); });
    const openF = on => { flt.classList.toggle('on', on); $('#fOpen').setAttribute('aria-expanded', on); if (on) $('.flt-x', flt).focus(); };
    $('#fOpen').addEventListener('click', () => openF(true)); $$('.flt-x', flt).forEach(b => b.addEventListener('click', () => { openF(false); $('#fOpen').focus(); }));
    render();
  }

  /* ---------- product page ---------- */
  if (page === 'product') {
    const p = byId(new URLSearchParams(location.search).get('id')) || P[2], root = $('#pp');
    const ip = instPrice(p), gal = p.gallery || [p.img, 'outdoor'];
    document.title = `${p.brand} ${p.name} — купить с установкой в Челябинске · Climate Solutions`;
    $('#crumbP').textContent = `${p.brand} ${p.name}`;
    const tags = (p.tags || []).map((t, i) => `<span class="tag${i === 0 && t === 'Хит' ? ' tag-red' : ''}">${t}</span>`).join('') + (p.inverter ? '<span class="tag">Инвертор</span>' : '') + (p.wifi ? '<span class="tag">Wi-Fi</span>' : '') + `<span class="tag">Класс ${p.cls}</span>`;
    root.innerHTML = `
      <div class="pp-gal"><div class="pp-main"><img id="ppImg" src="${IMG(gal[0])}" alt="${esc(p.brand)} ${esc(p.name)}" width="800" height="600"></div>
        ${gal.length > 1 ? `<div class="pp-th" role="group" aria-label="Фото">${gal.map((g, i) => `<button type="button" aria-pressed="${!i}" data-g="${g}" aria-label="${i ? 'Наружный блок' : 'Внутренний блок'}"><img src="${IMG(g)}" alt=""></button>`).join('')}</div>` : ''}</div>
      <div class="pp-i">
        <span class="mono kick">${esc(p.brand)} · ${T[p.type]}</span>
        <h1>${esc(p.brand)} ${esc(p.name)}</h1>
        <div class="pp-tags">${tags}</div>
        <div class="pp-key"><div><b>до ${p.area} м²</b><span>площадь</span></div><div><b>${kw(p.kw)} кВт</b><span>охлаждение</span></div><div><b>${p.db} дБ</b><span>шум, мин.</span></div></div>
        <div class="card buy">
          <div class="buy-p"><span class="price" id="ppSum">${rub(p.price)}</span><small id="ppNote">за оборудование</small></div>
          ${ip > 0 ? `<label class="opt"><input type="checkbox" id="ppInst" checked><div><b>Монтаж под ключ</b><span>Трасса до 3 м, кронштейны, вакуумирование, запуск. Гарантия 3 года.</span></div><span class="price">+ ${rub(ip)}</span></label>`
            : ip === null ? `<div class="opt" style="cursor:default"><div><b>Монтаж — по смете</b><span>Инженер приедет на замер бесплатно и посчитает монтаж до покупки.</span></div></div>` : ''}
          <div class="buy-row"><div class="qty"><button type="button" id="qM" aria-label="Меньше">−</button><input id="qN" type="number" min="1" max="20" value="1" aria-label="Количество"><button type="button" id="qP" aria-label="Больше">+</button></div>
            <button class="btn btn-red" type="button" id="ppAdd">В корзину</button></div>
          <button class="btn btn-line" type="button" data-req data-title="Купить в 1 клик" data-what="Купить в 1 клик: ${esc(p.brand)} ${esc(p.name)}" data-sub="${esc(p.brand)} ${esc(p.name)} · ${rub(p.price)}. Оставьте телефон — перезвоним, уточним монтаж и доставку.">Купить в 1 клик</button>
          <ul class="perks"><li>Выезд и замер — бесплатно</li><li>Доставка и монтаж — в день, удобный вам</li><li>Гарантия производителя на оборудование, 3 года на монтаж</li></ul>
        </div>
        <span class="demo-note">Демо-каталог: цены и наличие ориентировочные, уточняем по телефону</span>
      </div>`;
    const qN = $('#qN'), sum = () => { const q = Math.max(1, Math.min(20, +qN.value || 1)), inst = $('#ppInst')?.checked; qN.value = q;
      $('#ppSum').textContent = rub((p.price + (inst ? ip : 0)) * q); $('#ppNote').textContent = (inst ? 'с монтажом' : 'за оборудование') + (q > 1 ? ` · ${q} шт.` : ''); };
    $('#qM').addEventListener('click', () => { qN.value = +qN.value - 1; sum(); }); $('#qP').addEventListener('click', () => { qN.value = +qN.value + 1; sum(); });
    qN.addEventListener('change', sum); $('#ppInst')?.addEventListener('change', sum); sum();
    $('#ppAdd').addEventListener('click', () => { cart.add(p.id, +qN.value, $('#ppInst') ? $('#ppInst').checked : false); bump(); toast(`Добавлено в корзину <a href="cart.html">Оформить</a>`); });
    root.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; $('#ppImg').src = IMG(b.dataset.g); $$('[data-g]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    // specs + tabs
    $('#tSpec').innerHTML = `<table class="spec"><tbody>
      <tr><th>Бренд</th><td>${esc(p.brand)}</td></tr><tr><th>Тип</th><td>${T[p.type]}</td></tr><tr><th>Рекомендуемая площадь</th><td>до ${p.area} м²</td></tr>
      <tr><th>Мощность охлаждения</th><td>${kw(p.kw)} кВт</td></tr><tr><th>Компрессор</th><td>${p.inverter ? 'инверторный — плавно держит температуру, экономит до 30% электроэнергии' : 'on/off'}</td></tr>
      <tr><th>Минимальный уровень шума</th><td>${p.db} дБ</td></tr><tr><th>Класс энергоэффективности</th><td>${p.cls}</td></tr><tr><th>Управление по Wi-Fi</th><td>${p.wifi ? 'да, через приложение' : 'нет'}</td></tr>
      <tr><th>Режимы</th><td>охлаждение, обогрев, осушение, вентиляция</td></tr></tbody></table><p class="demo-note" style="margin-top:16px">Характеристики ориентировочные — сверим с паспортом модели при заказе</p>`;
    $$('.tabs button').forEach(b => b.addEventListener('click', () => { $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); $$('[role="tabpanel"]').forEach(t => t.hidden = t.id !== b.getAttribute('aria-controls')); }));
    $('#sim').innerHTML = P.filter(x => x.id !== p.id && (x.type === p.type || Math.abs(x.area - p.area) <= 10)).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4).map(card).join('');
  }

  /* ---------- cart + checkout ---------- */
  if (page === 'cart') {
    const box = $('#cartBox');
    function draw() {
      const items = cart.items();
      if (!items.length) { box.innerHTML = `<div class="card empty" style="grid-column:1/-1"><b>В корзине пока пусто</b><p>Выберите кондиционер в каталоге — монтаж добавим одной галочкой.</p><a class="btn btn-red" href="catalog.html">Перейти в каталог</a></div>`; return; }
      let goods = 0, inst = 0, survey = false;
      const rows = items.map(i => { const p = byId(i.id), ip = instPrice(p); goods += p.price * i.qty; if (i.inst && ip > 0) inst += ip * i.qty; if (ip === null) survey = true;
        return `<div class="ci" data-id="${p.id}"><a class="ci-img" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${IMG(p.img)}" alt=""></a>
          <div class="ci-m"><span class="mono">${esc(p.brand)} · ${T[p.type]}</span><a class="ci-n" href="product.html?id=${p.id}">${esc(p.brand)} ${esc(p.name)}</a><span class="pc-spec">${spec(p)}</span>
          ${ip > 0 ? `<label class="ci-inst"><input type="checkbox" data-inst ${i.inst ? 'checked' : ''}> Монтаж под ключ, + ${rub(ip)}</label>` : ip === null ? '<span class="pc-spec">Монтаж — по смете после бесплатного замера</span>' : ''}</div>
          <div class="ci-r"><div class="qty"><button type="button" data-q="-1" aria-label="Меньше">−</button><input type="number" min="1" max="20" value="${i.qty}" aria-label="Количество" data-qn><button type="button" data-q="1" aria-label="Больше">+</button></div>
          <div style="text-align:right"><span class="price">${rub((p.price + (i.inst && ip > 0 ? ip : 0)) * i.qty)}</span>${i.qty > 1 ? `<small style="display:block">${rub(p.price)} × ${i.qty}</small>` : ''}</div><button class="ci-del" type="button" data-del>Удалить</button></div></div>`; }).join('');
      const n = cart.count();
      box.innerHTML = `<div><div class="card">${rows}</div>
        <form class="card co" id="co" novalidate>
          <h2>Оформление заказа</h2>
          <div class="f2"><div class="fld"><label for="coName">Имя *</label><input id="coName" autocomplete="name" required></div><div class="fld"><label for="coPhone">Телефон *</label><input id="coPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__" required></div></div>
          <div class="fld"><span class="lbl" id="dlvL">Получение</span><div class="seg" role="radiogroup" aria-labelledby="dlvL">
            <label><input type="radio" name="dlv" value="install" checked><b>Доставка ${inst ? 'и монтаж' : ''}</b><span>Челябинск и область, день согласуем</span></label>
            <label><input type="radio" name="dlv" value="pickup"><b>Самовывоз</b><span>Челябинск, ул. 5 Декабря, 32</span></label></div></div>
          <div class="fld" id="addrF"><label for="coAddr">Адрес доставки *</label><input id="coAddr" autocomplete="street-address" placeholder="Город, улица, дом, квартира"></div>
          <div class="fld"><span class="lbl" id="payL">Оплата</span><div class="seg" role="radiogroup" aria-labelledby="payL">
            <label><input type="radio" name="pay" value="cash" checked><b>При получении</b><span>Наличные или карта</span></label>
            <label><input type="radio" name="pay" value="invoice"><b>По счёту</b><span>Для юрлиц и ИП</span></label>
            <label class="off"><input type="radio" name="pay" value="online" disabled><b>Онлайн</b><span>Подключим при запуске</span></label></div></div>
          <div class="fld"><label for="coNote">Комментарий</label><textarea id="coNote" placeholder="Этаж, удобное время, нужен ли демонтаж старого кондиционера"></textarea></div>
          ${PD('coPd')}
          <div class="err" id="coErr" role="alert"></div>
          <p class="pc-spec">Это не оплата: после заказа менеджер перезвонит, подтвердит наличие${survey ? ', согласует замер' : ''} и время доставки.</p>
        </form></div>
        <aside class="card sum" aria-label="Итого"><b style="font-weight:500;font-size:20px;letter-spacing:-.02em">Ваш заказ</b>
          <dl><div><dt>Товары, ${n} шт.</dt><dd>${rub(goods)}</dd></div>${inst ? `<div><dt>Монтаж под ключ</dt><dd>${rub(inst)}</dd></div>` : ''}${survey ? '<div><dt>Монтаж по смете</dt><dd>после замера</dd></div>' : ''}<div><dt>Выезд и замер</dt><dd>бесплатно</dd></div>
          <div class="tot"><dt>Итого</dt><dd>${rub(goods + inst)}</dd></div></dl>
          <button class="btn btn-red" type="submit" form="co" style="width:100%;min-height:54px">Оформить заказ</button>
          <span class="demo-note">Прототип: заказ никуда не отправляется</span></aside>`;
      mask($('#coPhone'));
    }
    /* redraw on every cart change; keep what was typed in the checkout form and the focused control */
    function keep(fn) { const vals = {}; $$('#co input, #co textarea').forEach(el => { vals[el.id || el.name + ':' + el.value] = el.type === 'radio' || el.type === 'checkbox' ? el.checked : el.value; });
      const a = document.activeElement, row = a?.closest?.('.ci')?.dataset.id, key = a ? ['data-q', 'data-inst', 'data-qn', 'data-del'].find(k => a.hasAttribute?.(k)) : null, kv = key ? a.getAttribute(key) : null;
      fn();
      $$('#co input, #co textarea').forEach(el => { const k = el.id || el.name + ':' + el.value; if (k in vals) { if (el.type === 'radio' || el.type === 'checkbox') el.checked = vals[k]; else el.value = vals[k]; } }); addr();
      if (row && key && key !== 'data-del') { const t = $(`.ci[data-id="${row}"] [${key}${kv ? `="${kv}"` : ''}]`); if (t) t.focus(); } }
    const addr = () => { const f = $('#addrF'); if (f) f.hidden = $('input[name="dlv"]:checked')?.value === 'pickup'; };
    box.addEventListener('change', e => { if (e.target.name === 'dlv') addr();
      const row = e.target.closest('.ci'); if (!row) return; const id = row.dataset.id;
      if (e.target.matches('[data-inst]')) cart.set(id, { inst: e.target.checked });
      if (e.target.matches('[data-qn]')) cart.set(id, { qty: +e.target.value || 1 }); });
    box.addEventListener('click', e => { const row = e.target.closest('.ci'); if (!row) return; const id = row.dataset.id, it = cart.items().find(i => i.id === id);
      const q = e.target.closest('[data-q]'); if (q) cart.set(id, { qty: it.qty + +q.dataset.q });
      if (e.target.closest('[data-del]')) cart.remove(id); });
    document.addEventListener('cartchange', () => keep(draw));
    box.addEventListener('submit', e => {
      e.preventDefault(); const f = $('#co'), err = $('#coErr'), n = $('#coName'), ph = $('#coPhone'), ad = $('#coAddr'); err.textContent = '';
      if (!n.value.trim()) return bad(n, err, 'Напишите, как к вам обращаться.');
      if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
      if (!$('#addrF').hidden && !ad.value.trim()) return bad(ad, err, 'Укажите адрес доставки.');
      if (!pdOk(f, err)) return;
      const no = 'CS-' + String(Date.now()).slice(-6), name = n.value.trim();
      cart.clear();
      box.innerHTML = `<div class="card done" style="grid-column:1/-1"><span class="mono kick">заказ ${no} оформлен</span><b>Спасибо, ${esc(name)}! Перезвоним в течение 15 минут</b><p>Подтвердим наличие, время доставки и монтажа. Оплата — при получении или по счёту. Прототип: заказ никуда не отправлен.</p><a class="btn btn-line" href="catalog.html">Вернуться в каталог</a></div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    });
    draw(); addr();
  }
})();
