/* v12 inner pages: the v10 chrome without the v10 home script — Lenis, header state, fullscreen menu, clocks,
   request popup (same markup as v10), cookie notice, audience switch that goes back to the home page. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const aud = document.documentElement.dataset.aud || 'home';

  if (window.Lenis && !reduce && !matchMedia('(pointer: coarse)').matches) {
    const lenis = new Lenis({ lerp: .1, anchors: { offset: -80 } }); window.__lenis = lenis;
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  }

  /* header */
  const hud = $('#hud'), sync = () => hud.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', sync, { passive: true }); sync();
  $$('.aud button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.aud === aud); b.addEventListener('click', () => { store.set('csp-aud', b.dataset.aud); location.href = 'index.html?aud=' + b.dataset.aud; }); });

  /* fullscreen menu */
  const menu = $('#menu'), mOpen = $('#menuOpen'), mClose = $('#menuClose');
  function menuSet(open) {
    if (open) { menu.hidden = false; document.documentElement.classList.add('menu-lock'); requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('open'))); menu.querySelector('.menu-links a').focus({ preventScroll: true }); }
    else { menu.classList.remove('open'); document.documentElement.classList.remove('menu-lock'); menu.hidden = true; mOpen.focus({ preventScroll: true }); }
    mOpen.setAttribute('aria-expanded', open); if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  window.menuSet = menuSet;
  mOpen.addEventListener('click', () => menuSet(true)); mClose.addEventListener('click', () => menuSet(false));
  addEventListener('keydown', e => {
    if (menu.hidden) return; if (e.key === 'Escape') menuSet(false);
    if (e.key === 'Tab') { const f = $$('a, button', menu), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  const tz = { timeZone: 'Asia/Yekaterinburg', hour: '2-digit', minute: '2-digit' }, f1 = new Intl.DateTimeFormat('ru-RU', tz), f2 = new Intl.DateTimeFormat('ru-RU', { ...tz, second: '2-digit' });
  const clock = $('#clock'), fx = $('#fxClock'), tick = () => { if (clock) clock.textContent = 'GMT+5 ' + f1.format(new Date()); if (fx) fx.textContent = f2.format(new Date()); };
  tick(); setInterval(tick, 1000);

  /* cookie notice */
  const ck = $('#ck');
  if (ck && store.get('cs-cookie') !== '1') { ck.hidden = false; setTimeout(() => ck.classList.add('on'), reduce ? 0 : 1000);
    $('#ckOk').addEventListener('click', () => { store.set('cs-cookie', '1'); ck.classList.remove('on'); setTimeout(() => { ck.hidden = true; }, reduce ? 0 : 400); }); }

  /* request popup — v10 markup, opened by [data-req], a[href="#req"] and the header/menu CTAs */
  const cm = $('#ctaModal'), form = $('#cmForm'), fresh = form.innerHTML; let back = null;
  const mask = ph => ph && ph.addEventListener('input', () => { let d = ph.value.replace(/\D/g, ''); if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1); d = d.slice(0, 10);
    ph.value = d ? '+7 ' + d.slice(0, 3) + (d.length > 3 ? ' ' + d.slice(3, 6) : '') + (d.length > 6 ? '-' + d.slice(6, 8) : '') + (d.length > 8 ? '-' + d.slice(8, 10) : '') : ''; });
  window.csMask = mask;
  function bind() { $('#cmClose').addEventListener('click', close); mask($('#cmPhone')); }
  function open(btn) {
    if (!$('#cmName', form)) { form.innerHTML = fresh; bind(); }
    $('#cmKick').textContent = btn.dataset.kick || (aud === 'biz' ? 'коммерческое предложение' : 'заявка');
    $('#cmTitle').textContent = btn.dataset.title || btn.textContent.replace('↗', '').trim() || 'Оставить заявку';
    $('#cmSub').textContent = btn.dataset.sub || (aud === 'biz' ? 'Оставьте контакты — инженер свяжется в течение рабочего дня, КП подготовим за 2 дня.' : 'Оставьте телефон — перезвоним в течение 15 минут и ответим на вопросы.');
    $('#cmErr').textContent = ''; back = btn; cm.showModal(); if (window.__lenis) window.__lenis.stop(); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => cm.classList.add('on')); setTimeout(() => { const f = $(aud === 'biz' ? '#cmCo' : '#cmName'); if (f) f.focus(); }, 60);
  }
  function close() { cm.classList.remove('on'); setTimeout(() => { if (cm.open) cm.close(); }, reduce ? 0 : 260); }
  window.csReq = open;
  cm.addEventListener('close', () => { if (window.__lenis) window.__lenis.start(); document.documentElement.style.overflow = ''; if (back) back.focus(); });
  cm.addEventListener('cancel', e => { e.preventDefault(); close(); });
  cm.addEventListener('click', e => { if (e.target === cm) close(); const ch = e.target.closest('.cm-chips button'); if (ch) $$('.cm-chips button', cm).forEach(b => b.setAttribute('aria-pressed', b === ch)); });
  bind();
  form.addEventListener('submit', e => {
    e.preventDefault(); const n = $('#cmName'), ph = $('#cmPhone'), err = $('#cmErr'), box = $('#cmPd'); [n, ph].forEach(f => f.removeAttribute('aria-invalid'));
    if (!n.value.trim()) { err.textContent = 'Напишите, как к вам обращаться.'; n.setAttribute('aria-invalid', 'true'); n.focus(); return; }
    if (ph.value.replace(/\D/g, '').length < 11) { err.textContent = 'Проверьте номер: нужно 10 цифр после +7.'; ph.setAttribute('aria-invalid', 'true'); ph.focus(); return; }
    if (box && !box.checked) { err.textContent = 'Подтвердите согласие на обработку персональных данных.'; box.setAttribute('aria-invalid', 'true'); box.focus(); return; }
    form.innerHTML = `<button class="cm-x" type="button" aria-label="Закрыть">×</button><div class="cm-done"><span class="mono cm-kick">заявка принята</span><b>${aud === 'biz' ? 'Свяжемся в течение рабочего дня' : 'Перезвоним в течение 15 минут'}</b><p>Прототип: данные никуда не отправляются.</p><button class="btn cm-go" type="button">Хорошо</button></div>`;
    $$('.cm-x, .cm-go', form).forEach(b => b.addEventListener('click', close)); $('.cm-go', form).focus();
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-req], a[href="#req"]'); if (!b || b.closest('form')) return;
    e.preventDefault(); if (b.closest('.menu') && !menu.hidden) menuSet(false); open(b);
  });
})();
