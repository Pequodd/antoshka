/* v12 shop + page behaviour: cart (localStorage), hairline product cells, catalog filters, product page, checkout,
   lead forms, home showcase slider, category counts, geography map. Works on the v10 home and on inner pages. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.CS_PRODUCTS || [], T = window.CS_TYPES || {}, INST = window.CS_INSTALL || 14900;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, page = document.body.dataset.page;
  const byId = id => P.find(p => p.id === id), rub = n => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽', kw = n => String(n).replace('.', ',');
  const IMG = k => `../assets/shop/${k}.webp`, instPrice = p => p.install === undefined ? INST : p.install;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (n, a, b, c) => n % 10 === 1 && n % 100 !== 11 ? a : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? b : c;
  const PLUS = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 3v12M3 9h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 9.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const mask = window.csMask || (() => {});

  /* ---------- cart ---------- */
  const cart = {
    items() { return store.get('cs12-cart', []).filter(i => byId(i.id)); },
    save(l) { store.set('cs12-cart', l); this.badge(); document.dispatchEvent(new CustomEvent('cartchange')); },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    has(id) { return this.items().some(i => i.id === id); },
    add(id, qty = 1, inst) { const l = this.items(), p = byId(id), it = l.find(i => i.id === id); if (it) it.qty = Math.min(20, it.qty + qty); else l.push({ id, qty, inst: inst ?? instPrice(p) > 0 }); this.save(l); },
    set(id, patch) { const l = this.items(), it = l.find(i => i.id === id); if (!it) return; Object.assign(it, patch); it.qty = Math.max(1, Math.min(20, it.qty)); this.save(l); },
    remove(id) { this.save(this.items().filter(i => i.id !== id)); }, clear() { this.save([]); },
    badge() { const n = this.count(); $$('.cart-n').forEach(b => { b.textContent = n; b.dataset.n = n; }); $$('.hud-cart').forEach(a => a.setAttribute('aria-label', n ? `Корзина, ${n} ${plural(n, 'товар', 'товара', 'товаров')}` : 'Корзина, пусто')); },
  };
  let tT; function toast(h) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.innerHTML = h; t.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), 3800); }
  const bump = () => $$('.hud-cart').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });

  /* ---------- product cell ---------- */
  const spec = p => `до ${p.area} м² · ${kw(p.kw)} кВт${p.inverter ? ' · инвертор' : ''}`;
  /* decibels in plain words: what the quietest mode sounds like, where it fits, and a short line for the catalog card */
  const noise = db => db <= 20 ? ['Тише шелеста листьев', 'Можно спать рядом и не заметить, что он работает.', 'почти бесшумный']
    : db <= 25 ? ['Как шелест листьев за окном', 'В спальне почти незаметен, сну не мешает.', 'тихий, как шелест листьев']
    : db <= 30 ? ['Как шёпот', 'Ночью слышно, только если прислушаться.', 'тихий, как шёпот']
    : db <= 40 ? ['Как в тихой библиотеке', 'Отлично для гостиной, кухни и офиса, для спальни громковато.', 'как в тихой библиотеке']
    : db <= 50 ? ['Как работающий холодильник', 'Подойдёт для дачи или кухни, спать рядом будет шумно.', 'шумит, как холодильник']
    : ['Как обычный разговор', 'Для жилых комнат шумновато.', 'шумный, как разговор'];
  /* a five-bar meter: how many bars are lit and the tone (quiet / medium / loud) */
  const nLvl = db => db <= 20 ? 1 : db <= 25 ? 2 : db <= 30 ? 3 : db <= 40 ? 4 : 5;
  const meter = db => { const l = nLvl(db); return `<i class="nm nm-${l <= 3 ? 'q' : l === 4 ? 'm' : 'l'}" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<b${i <= l ? ' class="on"' : ''}></b>`).join('')}</i>`; };
  const instLine = p => { const v = instPrice(p); return v === null ? 'монтаж по смете' : v === 0 ? 'без монтажа' : `+ монтаж ${rub(v)}`; };
  function addBtn(p) { const inC = cart.has(p.id); return `<button class="add${inC ? ' in' : ''}" type="button" data-add="${p.id}" aria-label="${inC ? 'В корзине — перейти в корзину' : 'Добавить в корзину: ' + esc(p.brand + ' ' + p.name)}">${inC ? CHECK : PLUS}</button>`; }
  function cell(p) {
    const tags = (p.tags || []).map(t => `<span class="tag${t === 'Хит' ? ' tag-hot' : ''}">${t}</span>`).join('') + (p.wifi ? '<span class="tag">wi-fi</span>' : '');
    return `<article class="pc"><div class="pc-top"><span class="mono">${esc(p.brand)}<br>${T[p.type]}</span><span class="pc-tags">${tags}</span></div>
      <div class="pc-img"><img src="${IMG(p.img)}" alt="" width="800" height="600" loading="lazy"></div>
      <div><a class="pc-n" href="product.html?id=${p.id}">${esc(p.name)}</a><div class="pc-area"><b>до ${p.area} м²</b><span>${kw(p.kw)} кВт${p.inverter ? ' · инвертор' : ''}</span></div><div class="pc-noise nz-${nLvl(p.db) <= 3 ? 'q' : nLvl(p.db) === 4 ? 'm' : 'l'}">${meter(p.db)}<b>${p.db} дБ</b> · ${noise(p.db)[2]}</div></div>
      <div class="pc-f"><div><span class="price">${rub(p.price)}</span><small>${instLine(p)}</small></div>${addBtn(p)}</div></article>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return; e.preventDefault();
    if (b.classList.contains('in')) { location.href = 'cart.html'; return; }
    const p = byId(b.dataset.add); cart.add(p.id); bump(); toast(`${esc(p.brand)} ${esc(p.name)} — в корзине <a href="cart.html">Оформить</a>`);
  });
  document.addEventListener('cartchange', () => $$('[data-add]').forEach(b => { const p = byId(b.dataset.add), inC = cart.has(p.id); b.classList.toggle('in', inC); b.innerHTML = inC ? CHECK : PLUS; b.setAttribute('aria-label', inC ? 'В корзине — перейти в корзину' : 'Добавить в корзину: ' + p.brand + ' ' + p.name); }));
  addEventListener('storage', e => { if (e.key === 'cs12-cart') { cart.badge(); document.dispatchEvent(new CustomEvent('cartchange')); } });
  cart.badge();

  /* ---------- forms ---------- */
  const phoneOk = ph => ph.value.replace(/\D/g, '').length >= 11;
  const bad = (el, err, m) => { err.textContent = m; el.setAttribute('aria-invalid', 'true'); el.focus(); return false; };
  const pdOk = (f, err) => { const b = $('.pd-box', f); if (!b || b.checked) { b && b.removeAttribute('aria-invalid'); return true; } return bad(b, err, 'Подтвердите согласие на обработку персональных данных.'); };
  document.addEventListener('change', e => { if (e.target.classList?.contains('pd-box') && e.target.checked) { e.target.removeAttribute('aria-invalid'); const er = e.target.closest('form')?.querySelector('.err'); if (er) er.textContent = ''; } });
  $$('form[data-lead] input[type="tel"]').forEach(mask);
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const err = $('.err', f), ph = $('input[type="tel"]', f), nm = $('input[name="name"]', f), co = $('input[name="company"]', f); err.textContent = '';
    if (co && !co.value.trim()) return bad(co, err, 'Укажите компанию.');
    if (nm && !nm.value.trim()) return bad(nm, err, 'Напишите, как к вам обращаться.');
    if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
    if (!pdOk(f, err)) return;
    const kp = f.dataset.lead === 'kp';
    f.innerHTML = `<div class="ld-done"><span class="mono">${kp ? 'запрос получен' : 'заявка принята'}</span><b>${kp ? 'Подготовим КП и свяжемся в течение рабочего дня' : 'Перезвоним в течение 15 минут'}</b><span>Прототип: данные никуда не отправляются.</span></div>`;
  }));

  /* ---------- home: showcase slider + category counts ---------- */
  $$('[data-count]').forEach(el => { const n = P.filter(p => p.type === el.dataset.count).length; el.textContent = `${n} ${plural(n, 'модель', 'модели', 'моделей')}`; });
  const slides = $$('.hs');
  if (slides.length) {
    let k = 0, timer = 0, hold = false; const names = slides.map(s => s.querySelector('.hs-t').lastChild.textContent.trim()), f = $('.shw-f');
    const show = i => { k = (i + slides.length) % slides.length; slides.forEach((s, j) => { const on = j === k; s.classList.toggle('on', on); s.toggleAttribute('aria-hidden', !on); $$('a', s).forEach(a => a.tabIndex = on ? 0 : -1); });
      $('#hxN').textContent = String(k + 1).padStart(2, '0'); $('#hxNext').textContent = names[(k + 1) % slides.length]; };
    const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => { if (!hold && !document.hidden) show(k + 1); }, 6000); };
    $('#hxPrev').addEventListener('click', () => { show(k - 1); play(); }); $('#hxNextB').addEventListener('click', () => { show(k + 1); play(); });
    ['mouseenter', 'focusin'].forEach(ev => f.addEventListener(ev, () => hold = true)); ['mouseleave', 'focusout'].forEach(ev => f.addEventListener(ev, () => hold = false));
    let x0 = null; f.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    f.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) { show(k + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
    show(0); play();
  }

  /* ---------- geography ---------- */
  /* geography: the map is a facade until asked for — rows switch the place, the button loads Yandex Maps */
  const geo = $$('.geo-r'), box = $('.geo-m');
  const mapSrc = () => ($('.geo-r[aria-pressed="true"]') || geo[0]).dataset.map;
  function loadMap() { if (!box || $('iframe', box)) return; const f = document.createElement('iframe'); f.title = 'Climate Solutions на Яндекс Картах'; f.src = mapSrc(); f.referrerPolicy = 'no-referrer-when-downgrade'; box.innerHTML = ''; box.appendChild(f); f.focus(); }
  if (box) box.addEventListener('click', e => { if (e.target.closest('.map-load')) loadMap(); });
  geo.forEach(b => b.addEventListener('click', () => { geo.forEach(x => x.setAttribute('aria-pressed', x === b)); const f = box && $('iframe', box);
    if (f) f.src = b.dataset.map; else if (box) { const t = $('.map-fac b', box); if (t) t.textContent = b.querySelector('b').textContent + ' · ' + b.querySelector('span').textContent; } }));

  /* ---------- catalog ---------- */
  if (page === 'catalog') {
    const grid = $('#grid'), sort = $('#sort');
    const AREAS = [[0, 20, 'до 20 м²'], [20, 30, '20–30 м²'], [30, 40, '30–40 м²'], [40, 60, '40–60 м²'], [60, 999, 'больше 60 м²']];
    const PRICES = [[0, 40000, 'до 40 000'], [40000, 80000, '40–80 000'], [80000, 1e9, 'от 80 000']];
    $('#fType').innerHTML = `<button type="button" aria-pressed="true" data-t="">Все <em>${P.length}</em></button>` + Object.entries(T).map(([k, v]) => `<button type="button" aria-pressed="false" data-t="${k}">${v} <em>${P.filter(p => p.type === k).length}</em></button>`).join('');
    $('#fArea').innerHTML = AREAS.map((a, i) => `<button type="button" aria-pressed="false" data-i="${i}">${a[2]}</button>`).join('');
    $('#fPrice').innerHTML = PRICES.map((a, i) => `<button type="button" aria-pressed="false" data-i="${i}">${a[2]}</button>`).join('');
    const q = new URLSearchParams(location.search), qt = (q.get('type') || '').split(',').filter(Boolean);
    if (qt.length) { $$('#fType button').forEach(b => b.setAttribute('aria-pressed', qt.includes(b.dataset.t))); }
    /* search: every word must match the brand, model, type, tags or features (inverter, wi-fi, area, power) */
    const norm = v => String(v).toLowerCase().replace(/ё/g, 'е').replace(/[‐-—]/g, '-');
    const RU = { 'Haier': 'хайер хаер хаир', 'Ballu': 'баллу балу', 'Royal Clima': 'роял клима ройал', 'Hisense': 'хайсенс хисенс хайсенс', 'Midea': 'мидеа мидея', 'LG': 'элджи лж лджи', 'Electrolux': 'электролюкс', 'Mitsubishi Electric': 'мицубиси митсубиси мицубиши мицубиси электрик', 'Daikin': 'дайкин' };
    const hay = p => norm([p.brand, RU[p.brand] || '', /black/i.test(p.name) || p.img === 'wall-black' ? 'черный чёрный black' : '', p.name, T[p.type], (p.tags || []).join(' '), p.inverter ? 'инвертор инверторный inverter' : '', p.wifi ? 'wi-fi wifi вайфай' : '', `${p.area} м2 м² кв`, `${String(p.kw).replace('.', ',')} квт ${p.kw}`, p.cls].join(' '));
    const qWords = () => norm($('#fQ').value.trim()).split(/\s+/).filter(Boolean);
    const st = () => ({ q: qWords(), types: $$('#fType [aria-pressed="true"]').map(b => b.dataset.t).filter(Boolean), areas: $$('#fArea [aria-pressed="true"]').map(b => AREAS[+b.dataset.i]),
      prices: $$('#fPrice [aria-pressed="true"]').map(b => PRICES[+b.dataset.i]), inv: $('#fInv').checked, wifi: $('#fWifi').checked });
    function render() {
      const s = st(); let l = P.filter(p => (!s.q.length || s.q.every(w => hay(p).includes(w))) && (!s.types.length || s.types.includes(p.type)) && (!s.areas.length || s.areas.some(([a, b]) => p.area > a && p.area <= b))
        && (!s.prices.length || s.prices.some(([a, b]) => p.price >= a && p.price < b)) && (!s.inv || p.inverter) && (!s.wifi || p.wifi));
      const o = sort.value; l.sort(o === 'cheap' ? (a, b) => a.price - b.price : o === 'exp' ? (a, b) => b.price - a.price : o === 'area' ? (a, b) => a.area - b.area : (a, b) => b.pop - a.pop);
      grid.innerHTML = l.length ? l.map(cell).join('') : `<div class="empty"><b>${s.q.length ? `По запросу «${esc($('#fQ').value.trim())}» ничего нет` : 'Под эти условия моделей нет'}</b><p>Уберите часть фильтров или позвоните — подберём кондиционер под вашу комнату и привезём под заказ.</p><button class="btn btn-ink" type="button" id="emptyReset">Сбросить фильтры</button></div>`;
      const n = l.length; $('#cnt').textContent = `${n} ${plural(n, 'модель', 'модели', 'моделей')}`; if ($('#catN')) $('#catN').textContent = `${n} ${plural(n, 'модель', 'модели', 'моделей')}`;
      const u = new URLSearchParams(); if (s.types.length) u.set('type', s.types.join(',')); history.replaceState(null, '', u.toString() ? '?' + u : location.pathname);
    }
    $('#fType').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
      if (!b.dataset.t) $$('#fType button').forEach(x => x.setAttribute('aria-pressed', x === b));
      else { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); const any = $$('#fType [data-t]:not([data-t=""])').some(x => x.getAttribute('aria-pressed') === 'true'); $('#fType [data-t=""]').setAttribute('aria-pressed', !any); }
      render(); });
    ['#fArea', '#fPrice'].forEach(id => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render(); }));
    [$('#fInv'), $('#fWifi'), sort].forEach(el => el.addEventListener('change', render));
    const fQ = $('#fQ'), fQx = $('#fQx');
    fQ.addEventListener('input', () => { fQx.hidden = !fQ.value; render(); });
    fQx.addEventListener('click', () => { fQ.value = ''; fQx.hidden = true; render(); fQ.focus(); });
    fQ.addEventListener('keydown', e => { if (e.key === 'Escape' && fQ.value) { e.preventDefault(); fQx.click(); } });
    document.addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); fQ.focus(); } });
    grid.addEventListener('click', e => { if (e.target.id !== 'emptyReset') return; fQ.value = ''; fQx.hidden = true; $$('#fType button').forEach(b => b.setAttribute('aria-pressed', !b.dataset.t)); $$('#fArea button, #fPrice button').forEach(b => b.setAttribute('aria-pressed', 'false')); $('#fInv').checked = $('#fWifi').checked = false; render(); });
    render();
  }

  /* ---------- product ---------- */
  if (page === 'product') {
    const p = byId(new URLSearchParams(location.search).get('id')) || byId('haier-coral-09'), ip = instPrice(p);
    document.title = `${p.brand} ${p.name} — купить с установкой · Climate Solutions`;
    $('#ppWord').textContent = p.brand;
    const tags = (p.tags || []).map(t => `<span class="tag${t === 'Хит' ? ' tag-hot' : ''}">${t}</span>`).join('') + (p.inverter ? '<span class="tag">инвертор</span>' : '') + (p.wifi ? '<span class="tag">wi-fi</span>' : '') + `<span class="tag">класс ${p.cls}</span>`;
    $('#ppInfo').innerHTML = `<ol class="crumbs" aria-label="Навигация"><li><a href="index.html">Главная</a></li><li><a href="catalog.html">Каталог</a></li><li><a href="catalog.html?type=${p.type}">${T[p.type]}</a></li></ol>
      <div><span class="mono">${esc(p.brand)} · ${T[p.type]}</span><h1>${esc(p.brand)} ${esc(p.name)}</h1></div><div class="pp-tags">${tags}</div>
      <div class="pp-key"><div><b>${p.area} м²</b><span>площадь до</span></div><div><b>${kw(p.kw)} кВт</b><span>охлаждение</span></div><div class="pp-nz"><b>${p.db} дБ ${meter(p.db)}</b><span>шум, от</span><em>${noise(p.db)[0]}</em><small>${noise(p.db)[1]}</small></div></div>
      <div class="buy-p"><span class="price" id="ppSum">${rub(p.price)}</span><small id="ppNote">за оборудование</small></div>
      ${ip > 0 ? `<label class="opt"><div><b>Монтаж под ключ, + ${rub(ip)}</b><span>Трасса до 3 м, кронштейны, вакуумирование, запуск. Гарантия на монтаж 3 года.</span></div><span class="sw"><input type="checkbox" id="ppInst" checked aria-label="Добавить монтаж под ключ"></span></label>`
        : ip === null ? `<div class="opt" style="cursor:default"><div><b>Монтаж — по смете</b><span>Инженер приедет на бесплатный замер и посчитает монтаж до покупки.</span></div></div>` : ''}
      <div class="buy-row"><div class="qty"><button type="button" id="qM" aria-label="Меньше">−</button><input id="qN" type="number" min="1" max="20" value="1" aria-label="Количество"><button type="button" id="qP" aria-label="Больше">+</button></div><button class="btn btn-red" type="button" id="ppAdd">В корзину <i>↗</i></button></div>
      <ul class="perks"><li>Выезд и замер — бесплатно</li><li>Доставка и монтаж в удобный вам день</li><li>Гарантия производителя и 3 года на монтаж</li></ul>`;
    const qN = $('#qN'), sum = () => { const q = Math.max(1, Math.min(20, +qN.value || 1)), inst = $('#ppInst')?.checked; qN.value = q;
      $('#ppSum').textContent = rub((p.price + (inst ? ip : 0)) * q); $('#ppNote').textContent = (inst ? 'с монтажом' : 'за оборудование') + (q > 1 ? ` · ${q} шт.` : ''); };
    $('#qM').addEventListener('click', () => { qN.value = +qN.value - 1; sum(); }); $('#qP').addEventListener('click', () => { qN.value = +qN.value + 1; sum(); });
    qN.addEventListener('change', sum); $('#ppInst')?.addEventListener('change', sum); sum();
    $('#ppAdd').addEventListener('click', () => { cart.add(p.id, +qN.value, $('#ppInst') ? $('#ppInst').checked : false); bump(); toast('Добавлено в корзину <a href="cart.html">Оформить</a>'); });
    $('#tSpec').innerHTML = `<table class="spec"><tbody><tr><th>Бренд</th><td>${esc(p.brand)}</td></tr><tr><th>Тип</th><td>${T[p.type]}</td></tr><tr><th>Площадь</th><td>до ${p.area} м²</td></tr><tr><th>Мощность охлаждения</th><td>${kw(p.kw)} кВт</td></tr>
      <tr><th>Компрессор</th><td>${p.inverter ? 'инверторный — плавно держит температуру и экономит электроэнергию' : 'on/off'}</td></tr><tr><th>Уровень шума</th><td>от ${p.db} дБ — ${noise(p.db)[0].toLowerCase()}</td></tr><tr><th>Энергоэффективность</th><td>${p.cls}</td></tr><tr><th>Wi-Fi</th><td>${p.wifi ? 'да, через приложение' : 'нет'}</td></tr><tr><th>Режимы</th><td>охлаждение, обогрев, осушение, вентиляция</td></tr></tbody></table>`;
    $$('.pp-tabs button').forEach(b => b.addEventListener('click', () => { $$('.pp-tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); $$('[role="tabpanel"]').forEach(t => t.hidden = t.id !== b.getAttribute('aria-controls')); }));
    $('#sim').innerHTML = P.filter(x => x.id !== p.id && (x.type === p.type || Math.abs(x.area - p.area) <= 10)).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4).map(cell).join('');
    if (window.csViewer) window.csViewer(p); else { const f = $('#pvFallback'); f.src = IMG(p.img); f.hidden = false; $('#pv').hidden = true; }
  }

  /* ---------- cart + checkout: goods, contacts and delivery as three compact steps; the total, consent and the button stay in view on the right ---------- */
  if (page === 'cart') {
    const box = $('#cartBox'), side = $('#cartSide'), form = $('#co');
    const X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    /* line icons for the delivery and payment options */
    const ICO = { install: '<path d="M2 6h11v9H2zM13 9h4l3 3v3h-7"/><circle cx="6" cy="17" r="1.8"/><circle cx="16" cy="17" r="1.8"/>',
      pickup: '<path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6"/>',
      cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M2.5 10h19M6 14.5h4"/>',
      invoice: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
      online: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>' };
    const opt = (name, v, b, s, on, off) => `<label class="bx-o${off ? ' off' : ''}"><input type="radio" name="${name}" value="${v}" data-k${on ? ' checked' : ''}${off ? ' disabled' : ''}>${ICO[v] ? `<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[v]}</svg>` : ''}<b>${b}</b><span>${s}</span></label>`;
    function draw() {
      const items = cart.items(), n = cart.count(); $('#cartN').textContent = `${n} ${plural(n, 'товар', 'товара', 'товаров')}`;
      if (!items.length) { side.innerHTML = ''; form.classList.add('bx-solo'); box.innerHTML = `<div class="bx-empty"><b>В корзине пока пусто</b><p>Выберите кондиционер в каталоге — монтаж добавится одной галочкой.</p><a class="btn btn-red" href="catalog.html">Перейти в каталог <i>↗</i></a></div>`; return; }
      let goods = 0, inst = 0, survey = false;
      const rows = items.map(i => { const p = byId(i.id), ip = instPrice(p); goods += p.price * i.qty; if (i.inst && ip > 0) inst += ip * i.qty; if (ip === null) survey = true;
        return `<div class="bx-it" data-id="${p.id}"><a class="bx-img" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${IMG(p.img)}" alt=""></a>
          <div class="bx-m"><span class="mono">${esc(p.brand)} · ${T[p.type]}</span><a class="bx-nm" href="product.html?id=${p.id}">${esc(p.name)}</a><span class="bx-sp">${spec(p)}</span>
          ${ip > 0 ? `<label class="sw bx-inst"><input type="checkbox" data-inst ${i.inst ? 'checked' : ''}>Монтаж под ключ <em>+ ${rub(ip)}</em></label>` : ip === null ? '<span class="bx-sp">монтаж — по смете после бесплатного замера</span>' : ''}</div>
          <div class="qty bx-q"><button type="button" data-q="-1" aria-label="Меньше">−</button><input type="number" min="1" max="20" value="${i.qty}" aria-label="Количество" data-qn><button type="button" data-q="1" aria-label="Больше">+</button></div>
          <div class="bx-pr"><b>${rub((p.price + (i.inst && ip > 0 ? ip : 0)) * i.qty)}</b>${i.qty > 1 ? `<small>${rub(p.price)} × ${i.qty}</small>` : ''}</div>
          <button class="bx-del" type="button" data-del aria-label="Удалить ${esc(p.name)}">${X}</button></div>`; }).join('');
      form.classList.remove('bx-solo');
      box.innerHTML = `<section class="bx-card bx-goods"><header class="bx-h"><span class="bx-n">01</span><h2>Товары</h2><a class="bx-add" href="catalog.html">+ добавить из каталога</a></header><div class="bx-list">${rows}</div>
        <ul class="bx-perks"><li><b>Замер бесплатно</b><span>инженер приедет и уточнит трассу</span></li><li><b>Гарантия на монтаж</b><span>и на оборудование от производителя</span></li><li><b>Оплата после звонка</b><span>менеджер подтвердит наличие</span></li></ul></section>`;
      side.innerHTML = `<div class="bx-card bx-side">
        <header class="bx-h"><span class="bx-n">02</span><h2>Контакты</h2></header>
        <div class="bx-2"><label class="bx-f"><span>Имя</span><input id="coName" data-k autocomplete="name" placeholder="Как к вам обращаться" required></label><label class="bx-f"><span>Телефон</span><input id="coPhone" data-k type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__" required></label></div>
        <header class="bx-h bx-sep"><span class="bx-n">03</span><h2>Получение и оплата</h2></header>
        <div class="bx-seg" role="radiogroup" aria-label="Получение">${opt('dlv', 'install', 'Доставка' + (inst ? ' и монтаж' : ''), 'Челябинск и область', true)}${opt('dlv', 'pickup', 'Самовывоз', 'ул. 5 Декабря, 32')}</div>
        <label class="bx-f" id="addrF"><span>Адрес</span><input id="coAddr" data-k autocomplete="street-address" placeholder="Город, улица, дом, квартира"></label>
        <div class="bx-seg bx-seg3" role="radiogroup" aria-label="Оплата">${opt('pay', 'cash', 'При получении', 'наличные, карта', true)}${opt('pay', 'invoice', 'По счёту', 'для юрлиц и ИП')}${opt('pay', 'online', 'Онлайн', 'скоро', false, true)}</div>
        <details class="bx-note"><summary>Комментарий к заказу</summary><textarea id="coNote" data-k rows="2" placeholder="Этаж, удобное время, нужен ли демонтаж старого"></textarea></details>
        <div class="bx-sum">
          <dl><div><dt>Товары, ${n} шт.</dt><dd>${rub(goods)}</dd></div>${inst ? `<div><dt>Монтаж под ключ</dt><dd>${rub(inst)}</dd></div>` : ''}${survey ? '<div><dt>Монтаж по смете</dt><dd>после замера</dd></div>' : ''}</dl>
          <div class="bx-tot"><span>Итого</span><b>${rub(goods + inst)}</b></div>
          <label class="pd"><input type="checkbox" class="pd-box" id="coPd" data-k><span>Согласен на обработку персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>
          <div class="err" id="coErr" role="alert"></div>
          <button class="btn btn-red bx-go" type="submit">Оформить заказ <i>↗</i></button>
          <p class="bx-fine">Это не оплата: менеджер перезвонит и подтвердит наличие${survey ? ', замер' : ''} и время доставки.</p></div></div>`;
      mask($('#coPhone'));
    }
    const addr = () => { const f = $('#addrF'); if (f) f.hidden = $('input[name="dlv"]:checked')?.value === 'pickup'; };
    /* redraws keep what was typed, the open comment and the focused control */
    function keep(fn) { const v = {}, note = $('.bx-note')?.open; $$('#co [data-k]').forEach(el => { v[el.id || el.name + ':' + el.value] = /radio|checkbox/.test(el.type) ? el.checked : el.value; });
      const a = document.activeElement, row = a?.closest?.('.bx-it')?.dataset.id, key = a ? ['data-q', 'data-inst', 'data-qn'].find(k => a.hasAttribute?.(k)) : null, kv = key ? a.getAttribute(key) : null;
      fn(); $$('#co [data-k]').forEach(el => { const k = el.id || el.name + ':' + el.value; if (k in v) { if (/radio|checkbox/.test(el.type)) el.checked = v[k]; else el.value = v[k]; } }); addr();
      if (note && $('.bx-note')) $('.bx-note').open = true;
      if (row && key) { const t = $(`.bx-it[data-id="${row}"] [${key}${kv ? `="${kv}"` : ''}]`); if (t) t.focus(); } }
    form.addEventListener('change', e => { if (e.target.name === 'dlv') addr(); const r = e.target.closest('.bx-it'); if (!r) return;
      if (e.target.matches('[data-inst]')) cart.set(r.dataset.id, { inst: e.target.checked }); if (e.target.matches('[data-qn]')) cart.set(r.dataset.id, { qty: +e.target.value || 1 }); });
    box.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-qn]')) { e.preventDefault(); e.target.blur(); } });
    box.addEventListener('click', e => { const r = e.target.closest('.bx-it'); if (!r) return; const it = cart.items().find(i => i.id === r.dataset.id), q = e.target.closest('[data-q]');
      if (q) cart.set(r.dataset.id, { qty: it.qty + +q.dataset.q }); if (e.target.closest('[data-del]')) cart.remove(r.dataset.id); });
    form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));
    document.addEventListener('cartchange', () => keep(draw));
    form.addEventListener('submit', e => {
      e.preventDefault(); const f = form, err = $('#coErr'), n = $('#coName'), ph = $('#coPhone'), ad = $('#coAddr'); err.textContent = '';
      if (!n.value.trim()) return bad(n, err, 'Напишите, как к вам обращаться.');
      if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
      if (!$('#addrF').hidden && !ad.value.trim()) return bad(ad, err, 'Укажите адрес доставки.');
      if (!pdOk(f, err)) return;
      const no = 'CS-' + String(Date.now()).slice(-6), name = n.value.trim(); cart.clear(); side.innerHTML = ''; form.classList.add('bx-solo');
      box.innerHTML = `<div class="bx-empty bx-ok"><span class="mono">заказ ${no} оформлен</span><b>Спасибо, ${esc(name)}! Перезвоним в течение 15 минут</b><p>Подтвердим наличие, время доставки и монтажа. Прототип: заказ никуда не отправлен.</p><a class="btn btn-ink" href="catalog.html">Вернуться в каталог <i>↗</i></a></div>`;
      $('#cartN').textContent = '0 товаров'; scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    draw(); addr();
  }
})();
