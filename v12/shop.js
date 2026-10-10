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
  const instLine = p => { const v = instPrice(p); return v === null ? 'монтаж по смете' : v === 0 ? 'без монтажа' : `+ монтаж ${rub(v)}`; };
  function addBtn(p) { const inC = cart.has(p.id); return `<button class="add${inC ? ' in' : ''}" type="button" data-add="${p.id}" aria-label="${inC ? 'В корзине — перейти в корзину' : 'Добавить в корзину: ' + esc(p.brand + ' ' + p.name)}">${inC ? CHECK : PLUS}</button>`; }
  function cell(p) {
    const tags = (p.tags || []).map(t => `<span class="tag${t === 'Хит' ? ' tag-hot' : ''}">${t}</span>`).join('') + (p.wifi ? '<span class="tag">wi-fi</span>' : '');
    return `<article class="pc"><div class="pc-top"><span class="mono">${esc(p.brand)}<br>${T[p.type]}</span><span class="pc-tags">${tags}</span></div>
      <div class="pc-img"><img src="${IMG(p.img)}" alt="" width="800" height="600" loading="lazy"></div>
      <div><a class="pc-n" href="product.html?id=${p.id}">${esc(p.name)}</a><div class="pc-spec">${spec(p)}</div></div>
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
  const geo = $$('.geo-r'), map = $('.geo-m iframe');
  geo.forEach(b => b.addEventListener('click', () => { geo.forEach(x => x.setAttribute('aria-pressed', x === b)); if (map) map.src = b.dataset.map; }));

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
    const st = () => ({ types: $$('#fType [aria-pressed="true"]').map(b => b.dataset.t).filter(Boolean), areas: $$('#fArea [aria-pressed="true"]').map(b => AREAS[+b.dataset.i]),
      prices: $$('#fPrice [aria-pressed="true"]').map(b => PRICES[+b.dataset.i]), inv: $('#fInv').checked, wifi: $('#fWifi').checked });
    function render() {
      const s = st(); let l = P.filter(p => (!s.types.length || s.types.includes(p.type)) && (!s.areas.length || s.areas.some(([a, b]) => p.area > a && p.area <= b))
        && (!s.prices.length || s.prices.some(([a, b]) => p.price >= a && p.price < b)) && (!s.inv || p.inverter) && (!s.wifi || p.wifi));
      const o = sort.value; l.sort(o === 'cheap' ? (a, b) => a.price - b.price : o === 'exp' ? (a, b) => b.price - a.price : o === 'area' ? (a, b) => a.area - b.area : (a, b) => b.pop - a.pop);
      grid.innerHTML = l.length ? l.map(cell).join('') : `<div class="empty"><b>Под эти условия моделей нет</b><p>Уберите часть фильтров или позвоните — подберём кондиционер под вашу комнату и привезём под заказ.</p><button class="btn btn-ink" type="button" id="emptyReset">Сбросить фильтры</button></div>`;
      const n = l.length; $('#cnt').textContent = `${n} ${plural(n, 'модель', 'модели', 'моделей')}`; $('#catN').textContent = `(${n})`;
      const u = new URLSearchParams(); if (s.types.length) u.set('type', s.types.join(',')); history.replaceState(null, '', u.toString() ? '?' + u : location.pathname);
    }
    $('#fType').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
      if (!b.dataset.t) $$('#fType button').forEach(x => x.setAttribute('aria-pressed', x === b));
      else { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); const any = $$('#fType [data-t]:not([data-t=""])').some(x => x.getAttribute('aria-pressed') === 'true'); $('#fType [data-t=""]').setAttribute('aria-pressed', !any); }
      render(); });
    ['#fArea', '#fPrice'].forEach(id => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render(); }));
    [$('#fInv'), $('#fWifi'), sort].forEach(el => el.addEventListener('change', render));
    grid.addEventListener('click', e => { if (e.target.id !== 'emptyReset') return; $$('#fType button').forEach(b => b.setAttribute('aria-pressed', !b.dataset.t)); $$('#fArea button, #fPrice button').forEach(b => b.setAttribute('aria-pressed', 'false')); $('#fInv').checked = $('#fWifi').checked = false; render(); });
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
      <div class="pp-key"><div><b>${p.area} м²</b><span>площадь до</span></div><div><b>${kw(p.kw)} кВт</b><span>охлаждение</span></div><div><b>${p.db} дБ</b><span>шум, от</span></div></div>
      <div class="buy-p"><span class="price" id="ppSum">${rub(p.price)}</span><small id="ppNote">за оборудование</small></div>
      ${ip > 0 ? `<label class="opt"><div><b>Монтаж под ключ, + ${rub(ip)}</b><span>Трасса до 3 м, кронштейны, вакуумирование, запуск. Гарантия на монтаж 3 года.</span></div><span class="sw"><input type="checkbox" id="ppInst" checked aria-label="Добавить монтаж под ключ"></span></label>`
        : ip === null ? `<div class="opt" style="cursor:default"><div><b>Монтаж — по смете</b><span>Инженер приедет на бесплатный замер и посчитает монтаж до покупки.</span></div></div>` : ''}
      <div class="buy-row"><div class="qty"><button type="button" id="qM" aria-label="Меньше">−</button><input id="qN" type="number" min="1" max="20" value="1" aria-label="Количество"><button type="button" id="qP" aria-label="Больше">+</button></div><button class="btn btn-red" type="button" id="ppAdd">В корзину <i>↗</i></button></div>
      <button class="btn btn-soft" type="button" data-req data-title="Купить в 1 клик" data-kick="${esc(p.brand)} · ${rub(p.price)}" data-sub="${esc(p.brand)} ${esc(p.name)}. Оставьте телефон — перезвоним, уточним монтаж и доставку.">Купить в 1 клик</button>
      <ul class="perks"><li>Выезд и замер — бесплатно</li><li>Доставка и монтаж в удобный вам день</li><li>Гарантия производителя и 3 года на монтаж</li></ul>
      <p class="mono">демо-каталог · цена и наличие ориентировочные</p>`;
    const qN = $('#qN'), sum = () => { const q = Math.max(1, Math.min(20, +qN.value || 1)), inst = $('#ppInst')?.checked; qN.value = q;
      $('#ppSum').textContent = rub((p.price + (inst ? ip : 0)) * q); $('#ppNote').textContent = (inst ? 'с монтажом' : 'за оборудование') + (q > 1 ? ` · ${q} шт.` : ''); };
    $('#qM').addEventListener('click', () => { qN.value = +qN.value - 1; sum(); }); $('#qP').addEventListener('click', () => { qN.value = +qN.value + 1; sum(); });
    qN.addEventListener('change', sum); $('#ppInst')?.addEventListener('change', sum); sum();
    $('#ppAdd').addEventListener('click', () => { cart.add(p.id, +qN.value, $('#ppInst') ? $('#ppInst').checked : false); bump(); toast('Добавлено в корзину <a href="cart.html">Оформить</a>'); });
    $('#tSpec').innerHTML = `<table class="spec"><tbody><tr><th>Бренд</th><td>${esc(p.brand)}</td></tr><tr><th>Тип</th><td>${T[p.type]}</td></tr><tr><th>Площадь</th><td>до ${p.area} м²</td></tr><tr><th>Мощность охлаждения</th><td>${kw(p.kw)} кВт</td></tr>
      <tr><th>Компрессор</th><td>${p.inverter ? 'инверторный — плавно держит температуру и экономит электроэнергию' : 'on/off'}</td></tr><tr><th>Уровень шума</th><td>от ${p.db} дБ</td></tr><tr><th>Энергоэффективность</th><td>${p.cls}</td></tr><tr><th>Wi-Fi</th><td>${p.wifi ? 'да, через приложение' : 'нет'}</td></tr><tr><th>Режимы</th><td>охлаждение, обогрев, осушение, вентиляция</td></tr></tbody></table>`;
    $$('.pp-tabs button').forEach(b => b.addEventListener('click', () => { $$('.pp-tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); $$('[role="tabpanel"]').forEach(t => t.hidden = t.id !== b.getAttribute('aria-controls')); }));
    $('#sim').innerHTML = P.filter(x => x.id !== p.id && (x.type === p.type || Math.abs(x.area - p.area) <= 10)).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4).map(cell).join('');
    if (window.csViewer) window.csViewer(p); else { const f = $('#pvFallback'); f.src = IMG(p.img); f.hidden = false; $('#pv').hidden = true; }
  }

  /* ---------- cart + checkout ---------- */
  if (page === 'cart') {
    const box = $('#cartBox');
    function draw() {
      const items = cart.items(), n = cart.count(); $('#cartN').textContent = `(${n})`;
      if (!items.length) { box.innerHTML = `<div class="done"><b>В корзине пока пусто</b><p>Выберите кондиционер в каталоге — монтаж добавится одной галочкой.</p><a class="btn btn-red" href="catalog.html">Перейти в каталог <i>↗</i></a></div>`; return; }
      let goods = 0, inst = 0, survey = false;
      const rows = items.map(i => { const p = byId(i.id), ip = instPrice(p); goods += p.price * i.qty; if (i.inst && ip > 0) inst += ip * i.qty; if (ip === null) survey = true;
        return `<div class="ci" data-id="${p.id}"><a class="ci-img" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true"><img src="${IMG(p.img)}" alt=""></a>
          <div class="ci-m"><span class="mono">${esc(p.brand)} · ${T[p.type]}</span><a class="ci-n" href="product.html?id=${p.id}">${esc(p.name)}</a><span class="pc-spec">${spec(p)}</span>
          ${ip > 0 ? `<label class="sw"><input type="checkbox" data-inst ${i.inst ? 'checked' : ''}>Монтаж под ключ, + ${rub(ip)}</label>` : ip === null ? '<span class="pc-spec">монтаж — по смете после бесплатного замера</span>' : ''}</div>
          <div class="ci-r"><div class="qty"><button type="button" data-q="-1" aria-label="Меньше">−</button><input type="number" min="1" max="20" value="${i.qty}" aria-label="Количество" data-qn><button type="button" data-q="1" aria-label="Больше">+</button></div>
          <div style="text-align:right"><span class="price">${rub((p.price + (i.inst && ip > 0 ? ip : 0)) * i.qty)}</span>${i.qty > 1 ? `<small style="display:block">${rub(p.price)} × ${i.qty}</small>` : ''}</div><button class="ci-del" type="button" data-del>удалить</button></div></div>`; }).join('');
      box.innerHTML = `<div><div>${rows}</div>
        <form class="co" id="co" novalidate><h2>Оформление</h2>
          <div class="f2"><div class="field"><label class="mono" for="coName">Имя</label><input id="coName" autocomplete="name" required></div><div class="field"><label class="mono" for="coPhone">Телефон</label><input id="coPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__" required></div></div>
          <div class="field"><span class="mono" id="dlvL">получение</span><div class="seg3" role="radiogroup" aria-labelledby="dlvL"><label><input type="radio" name="dlv" value="install" checked><b>Доставка${inst ? ' и монтаж' : ''}</b><span>Челябинск и область</span></label><label><input type="radio" name="dlv" value="pickup"><b>Самовывоз</b><span>ул. 5 Декабря, 32</span></label></div></div>
          <div class="field" id="addrF"><label class="mono" for="coAddr">Адрес</label><input id="coAddr" autocomplete="street-address" placeholder="Город, улица, дом, квартира"></div>
          <div class="field"><span class="mono" id="payL">оплата</span><div class="seg3" role="radiogroup" aria-labelledby="payL"><label><input type="radio" name="pay" value="cash" checked><b>При получении</b><span>наличные или карта</span></label><label><input type="radio" name="pay" value="invoice"><b>По счёту</b><span>для юрлиц и ИП</span></label><label class="off"><input type="radio" name="pay" disabled><b>Онлайн</b><span>подключим при запуске</span></label></div></div>
          <div class="field"><label class="mono" for="coNote">Комментарий</label><textarea id="coNote" rows="2" placeholder="Этаж, удобное время, нужен ли демонтаж старого"></textarea></div>
          <label class="pd"><input type="checkbox" class="pd-box" id="coPd"><span>Согласен на обработку персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>
          <div class="err" id="coErr" role="alert"></div></form></div>
        <aside class="sum grain" aria-label="Итого"><span class="mono">ваш заказ</span><dl><div><dt>Товары, ${n} шт.</dt><dd>${rub(goods)}</dd></div>${inst ? `<div><dt>Монтаж под ключ</dt><dd>${rub(inst)}</dd></div>` : ''}${survey ? '<div><dt>Монтаж по смете</dt><dd>после замера</dd></div>' : ''}<div><dt>Выезд и замер</dt><dd>бесплатно</dd></div>
          <div class="tot"><dt>Итого</dt><dd>${rub(goods + inst)}</dd></div></dl><button class="btn btn-red" type="submit" form="co">Оформить заказ <i>↗</i></button>
          <span class="mono">это не оплата: менеджер перезвонит и подтвердит наличие${survey ? ', замер' : ''} и время доставки</span></aside>`;
      mask($('#coPhone'));
    }
    const addr = () => { const f = $('#addrF'); if (f) f.hidden = $('input[name="dlv"]:checked')?.value === 'pickup'; };
    function keep(fn) { const v = {}; $$('#co input, #co textarea').forEach(el => { v[el.id || el.name + ':' + el.value] = /radio|checkbox/.test(el.type) ? el.checked : el.value; });
      const a = document.activeElement, row = a?.closest?.('.ci')?.dataset.id, key = a ? ['data-q', 'data-inst', 'data-qn'].find(k => a.hasAttribute?.(k)) : null, kv = key ? a.getAttribute(key) : null;
      fn(); $$('#co input, #co textarea').forEach(el => { const k = el.id || el.name + ':' + el.value; if (k in v) { if (/radio|checkbox/.test(el.type)) el.checked = v[k]; else el.value = v[k]; } }); addr();
      if (row && key) { const t = $(`.ci[data-id="${row}"] [${key}${kv ? `="${kv}"` : ''}]`); if (t) t.focus(); } }
    box.addEventListener('change', e => { if (e.target.name === 'dlv') addr(); const r = e.target.closest('.ci'); if (!r) return;
      if (e.target.matches('[data-inst]')) cart.set(r.dataset.id, { inst: e.target.checked }); if (e.target.matches('[data-qn]')) cart.set(r.dataset.id, { qty: +e.target.value || 1 }); });
    box.addEventListener('click', e => { const r = e.target.closest('.ci'); if (!r) return; const it = cart.items().find(i => i.id === r.dataset.id), q = e.target.closest('[data-q]');
      if (q) cart.set(r.dataset.id, { qty: it.qty + +q.dataset.q }); if (e.target.closest('[data-del]')) cart.remove(r.dataset.id); });
    document.addEventListener('cartchange', () => keep(draw));
    box.addEventListener('submit', e => {
      e.preventDefault(); const f = $('#co'), err = $('#coErr'), n = $('#coName'), ph = $('#coPhone'), ad = $('#coAddr'); err.textContent = '';
      if (!n.value.trim()) return bad(n, err, 'Напишите, как к вам обращаться.');
      if (!phoneOk(ph)) return bad(ph, err, 'Проверьте номер: нужно 10 цифр после +7.');
      if (!$('#addrF').hidden && !ad.value.trim()) return bad(ad, err, 'Укажите адрес доставки.');
      if (!pdOk(f, err)) return;
      const no = 'CS-' + String(Date.now()).slice(-6), name = n.value.trim(); cart.clear();
      box.innerHTML = `<div class="done"><span class="mono">заказ ${no} оформлен</span><b>Спасибо, ${esc(name)}! Перезвоним в течение 15 минут</b><p>Подтвердим наличие, время доставки и монтажа. Прототип: заказ никуда не отправлен.</p><a class="btn btn-ink" href="catalog.html">Вернуться в каталог <i>↗</i></a></div>`;
      $('#cartN').textContent = '(0)'; scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    draw(); addr();
  }
})();
