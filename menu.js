/* v10 + shop: when the version changes, the header section links visibly swap */
(() => {
  const links = document.querySelector('.hud-links'); if (!links) return;
  document.addEventListener('audchange', () => { if (!window.__audInit) return; links.classList.remove('swap'); void links.offsetWidth; links.classList.add('swap'); });
  const pg = document.body && document.body.dataset.page;
  if (pg === 'catalog') document.querySelectorAll('.hud-cat').forEach(a => a.setAttribute('aria-current', 'page'));
  if (pg === 'cart') document.querySelectorAll('.hud-cart').forEach(a => a.setAttribute('aria-current', 'page'));
})();
