#!/usr/bin/env python3
"""Adds the shop (catalog, product with the live 3D unit, cart + checkout) to v10 without changing anything else in it.
v10/index.html only gains a «Каталог» link, a cart icon, menu entries and the scripts that keep the cart count;
the shop pages reuse v10's own header, menu, footer, popup and cookie notice. Run: python3 tools/build-v10-shop.py"""
import importlib.util, os, re

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); V10 = os.path.join(ROOT, 'v10')
CART = '<a class="hud-cart" href="catalog.html#cart" aria-label="Корзина"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg><b class="cart-n" data-n="0">0</b></a>'.replace('catalog.html#cart', 'cart.html')
MARK = '<!-- v10 shop -->'

# ---------------------------------------------------------------- 1. v10 home: minimal, idempotent additions
p = os.path.join(V10, 'index.html'); s = open(p).read()
if MARK not in s:
    def rep(a, b):
        global s
        assert s.count(a) == 1, a[:80]; s = s.replace(a, b)
    rep('<span class="hud-ind" id="hudInd" aria-hidden="true"></span>', '<span class="hud-ind" id="hudInd" aria-hidden="true"></span><a href="catalog.html">Каталог</a>')
    rep('    <a class="tel" href="tel:+79514596275">+7 951 459-62-75</a>\n', '    <a class="tel" href="tel:+79514596275">+7 951 459-62-75</a>\n    ' + CART + '\n')
    rep('<div class="mcol mcol-gen"><span class="mono mcol-h">о компании</span>', '<div class="mcol mcol-gen"><span class="mono mcol-h">о компании</span><a href="catalog.html" style="--i:10">Каталог</a><a href="cart.html" style="--i:10">Корзина</a>')
    # scrollspy only follows in-page links now that the header also links to a page
    rep("const hudSecs = hudLinks.map(a => document.querySelector(a.getAttribute('href')));", "const hudSecs = hudLinks.map(a => { const h = a.getAttribute('href'); return h.startsWith('#') ? document.querySelector(h) : null; });")
    rep("const last = hudSecs[hudSecs.length - 1]; if (k === hudSecs.length - 1 && last.getBoundingClientRect().bottom < innerHeight * .4) k = -1;", "const last = hudSecs[hudSecs.length - 1]; if (last && k === hudSecs.length - 1 && last.getBoundingClientRect().bottom < innerHeight * .4) k = -1;")
    rep('</style>', '</style>\n' + MARK + '\n<link rel="stylesheet" href="shop-hud.css">')
    rep('</script>\n</html>', '</script>\n<script src="products.js"></script>\n<script src="shop.js"></script>\n</html>')
    open(p, 'w').write(s)

# ---------------------------------------------------------------- 2. shop pages with v10's chrome
spec = importlib.util.spec_from_file_location('b13', os.path.join(HERE, 'build-v13.py')); b13 = importlib.util.module_from_spec(spec); spec.loader.exec_module(b13)
def cut(start, end): i = s.index(start); return s[i:s.index(end, i) + len(end)]
to_home = lambda h, keep=(): re.sub(r'href="#(?!req\b)([\w-]+)"', lambda m: m.group(0) if m.group(1) in keep else f'href="index.html#{m.group(1)}"', h)
b13.TPL = s
b13.HEAD = s[:s.index('<title>')]
b13.FONTS = cut('<link rel="preconnect" href="https://fonts.googleapis.com">', '&display=swap">')
b13.HUD = to_home(cut('<header class="hud"', '</header>'), keep=('contact', 'b2b-form')).replace('href="index.html#top"', 'href="index.html"')
b13.MENU = to_home(cut('<div class="menu" id="menu"', '<div class="menu-foot mono" aria-hidden="true"><span>[ climate solutions ]</span><span>[ ЧЛБ · ЕКБ ]</span></div>\n</div>')).replace('href="index.html#top"', 'href="index.html"')
b13.FOOT = to_home(cut('<footer class="foot-x"', '</footer>')).replace('href="index.html#top"', 'href="index.html"')
b13.CM = cut('<dialog class="cm" id="ctaModal"', '</dialog>')
b13.CK = cut('<div class="ck" id="ck"', '</div>\n')
b13.MBAR = cut('<nav class="mbar"', '</nav>').replace('href="#contact"', 'href="#req"').replace('href="#b2b-form"', 'href="#req"')
for fn in ['catalog.html', 'product.html', 'cart.html']:
    k, t, d, body, aud, three, cur = b13.PAGES[fn]
    html = b13.page(k, t, d, body, aud, three, cur).replace('<link rel="stylesheet" href="v12.css">\n<link rel="stylesheet" href="v13.css">', '<link rel="stylesheet" href="shop.css">')
    html = re.sub(r'\n<meta property="og:[^>]*>(?:<meta property="og:[^>]*>)*', '', html)
    html = html.replace('"assets/', '"../assets/')
    open(os.path.join(V10, fn), 'w').write(html)

# ---------------------------------------------------------------- 3. styles and scripts the shop pages need
a = s.index('<style>') + len('<style>'); z = s.index('</style>')
open(os.path.join(V10, 'base.css'), 'w').write('/* the v10 styles, extracted for the shop pages (index.html keeps its own inline copy) */\n' + s[a:z].strip() + '\n')
css13 = open(os.path.join(ROOT, 'v13', 'v13.css')).read().replace(':root { --air: #D9231A; --orange: #D9231A; }\n', '')  # keep v10's own red
open(os.path.join(V10, 'shop.css'), 'w').write('/* shop pages for v10: components from v12, audit fixes from v13 */\n' + open(os.path.join(ROOT, 'v13', 'v12.css')).read() + '\n' + css13)
open(os.path.join(V10, 'shop-hud.css'), 'w').write('''/* v10 + shop: the header cart */
.hud-cart { position: relative; display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 999px; color: var(--ink); text-decoration: none; transition: background .2s; }
.hud-cart:hover { background: rgba(36,54,63,.07); }
.hud-cart svg { width: 20px; height: 20px; }
.cart-n { position: absolute; top: 3px; right: 1px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--air); color: #fff; font: 500 11px/18px var(--sans); text-align: center; font-variant-numeric: tabular-nums; }
.cart-n[data-n="0"] { display: none; }
.hud-cart.bump .cart-n { animation: cartbump .45s cubic-bezier(.2,.7,.2,1); }
@keyframes cartbump { 40% { transform: scale(1.4); } }
''')
for f in ['chrome.js', 'shop.js', 'viewer.js', 'products.js']:
    open(os.path.join(V10, f), 'w').write(open(os.path.join(ROOT, 'v13', f)).read())
print('v10 shop built')
