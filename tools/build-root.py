#!/usr/bin/env python3
"""The domain root (kliamatpro.ru) = a copy of v10 with the shop. v10/ itself is not changed.
Run after any v10 change: python3 tools/build-root.py
Root-only differences: asset paths, the home/business choice is remembered without ?aud= in the address,
the AI-upscaled hero video, a 404 page in v10's chrome, forwards from the old v12 pages, and noindex everywhere."""
import os, re, runpy

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); V10 = os.path.join(ROOT, 'v10')
g = runpy.run_path(os.path.join(HERE, 'build-v10-shop.py'))   # rebuilds v10's shop pages, gives us its v10-chrome page builder
b13 = g['b13']
to_root = lambda h: h.replace('../assets/', 'assets/')

def rep(s, a, b):
    assert s.count(a) == 1, a[:80]; return s.replace(a, b)

# home
s = to_root(open(os.path.join(V10, 'index.html')).read())
s = rep(s, "    const u = new URL(location.href); u.searchParams.set('aud', a); history.replaceState(null, '', u);",
        "    if (location.search.includes('aud=')) { const u = new URL(location.href); u.searchParams.delete('aud'); history.replaceState(null, '', u.pathname + (u.search === '?' ? '' : u.search) + u.hash); }")
s = rep(s, "const h = a.getAttribute('href') || ''; if (h.startsWith('?')) e.preventDefault(); audSet(a.dataset.setAud, h.startsWith('#'));",
        "const h = a.getAttribute('href') || ''; if (!h.startsWith('#')) e.preventDefault(); audSet(a.dataset.setAud, h.startsWith('#'));")
s = rep(s, '<a class="oa" href="?aud=biz" data-set-aud="biz"', '<a class="oa" href="index.html" data-set-aud="biz"')
s = rep(s, '<a class="oa" href="?aud=home" data-set-aud="home"', '<a class="oa" href="index.html" data-set-aud="home"')
s = rep(s, '<video data-src="assets/hero-v10.mp4" poster="assets/hero-v10-poster.jpg"', '<video data-src="assets/hero-hd.mp4" data-src-sm="assets/hero-1080.mp4" poster="assets/hero-hd-poster.jpg"')
s = rep(s, "  hcVid.src = hcVid.dataset.src;", "  /* AI-upscaled 1440p for wide or dense screens, 1080p for the rest */\n  hcVid.src = innerWidth * Math.min(2, devicePixelRatio || 1) > 2000 ? hcVid.dataset.src : hcVid.dataset.srcSm;")
s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<link rel="canonical" href="https://kliamatpro.ru/">', 1)
open(os.path.join(ROOT, 'index.html'), 'w').write(s)

# shop pages, styles, scripts — straight copies with root asset paths
for f in ['catalog.html', 'product.html', 'cart.html', 'privacy.html', 'base.css', 'shop.css', 'shop-hud.css', 'chrome.js', 'shop.js', 'viewer.js', 'products.js', 'menu.js']:
    open(os.path.join(ROOT, f), 'w').write(to_root(open(os.path.join(V10, f)).read()))

# 404 in v10's chrome (served for any missing path, so everything resolves from the root)
k, t, d, body, aud, three, cur = b13.PAGES['404.html']
nf = b13.page(k, t, d, body, aud, three, cur).replace('<link rel="stylesheet" href="v12.css">\n<link rel="stylesheet" href="v13.css">', '<link rel="stylesheet" href="shop.css">\n<link rel="stylesheet" href="shop-hud.css">')
nf = re.sub(r'\n<meta property="og:[^>]*>(?:<meta property="og:[^>]*>)*', '', nf).replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">', 1)
open(os.path.join(ROOT, '404.html'), 'w').write(to_root(nf))

# the old v12 pages forward to the matching part of the landing
FWD = {'services.html': ('home', '#services'), 'business.html': ('biz', '#industries'), 'about.html': ('home', '#team'), 'contacts.html': ('home', '#contacts')}
for fn, (a, h) in FWD.items():
    open(os.path.join(ROOT, fn), 'w').write(f'''<!doctype html><html lang="ru"><meta charset="utf-8"><title>Climate Solutions</title><meta name="robots" content="noindex">
<link rel="canonical" href="https://kliamatpro.ru/{h}"><meta http-equiv="refresh" content="0; url=index.html{h}">
<script>try {{ localStorage.setItem('csp-aud', '{a}'); }} catch (e) {{}} location.replace('index.html{h}');</script>
<a href="index.html{h}">Climate Solutions</a></html>
''')
for old in ['v12.css']:   # the v12 stylesheet is no longer used at the root
    pth = os.path.join(ROOT, old)
    if os.path.exists(pth): os.remove(pth)

# the site is a portfolio piece, not a live shop: kept out of search engines entirely —
# robots.txt closes every path, and every root page also carries noindex in case a link to it gets crawled
open(os.path.join(ROOT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
if os.path.exists(os.path.join(ROOT, 'sitemap.xml')): os.remove(os.path.join(ROOT, 'sitemap.xml'))
NOINDEX = '<meta name="robots" content="noindex, nofollow">'
for fn in os.listdir(ROOT):
    if not fn.endswith('.html'): continue
    pth = os.path.join(ROOT, fn); h = open(pth).read()
    h = re.sub(r'<meta name="robots" content="[^"]*">', NOINDEX, h)
    if NOINDEX not in h: h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + ('' if h.startswith('<!doctype html><html lang="ru"><meta') else '\n') + NOINDEX, 1)
    assert NOINDEX in h, fn
    open(pth, 'w').write(h)
_t = runpy.run_path(os.path.join(HERE, 'typograf.py'))['run']
for fn in os.listdir(ROOT):
    if fn.endswith('.html'): _t(os.path.join(ROOT, fn))
print('root built from v10')
