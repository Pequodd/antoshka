#!/usr/bin/env python3
"""Builds v11/*.html: one shared head, header, drawer, footer, request popup and cookie notice around each page body.
Run from the repo root: python3 tools/build-v11.py"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'v11')
TEL, TEL_H = '+79514596275', '+7 (951) 459-62-75'
WA, TG, VK = 'https://wa.me/79514596275', 'https://t.me/+79514596275', 'https://vk.com/tim_antonov'
ADDR = 'Челябинск, ул. 5 Декабря, 32'
NAV = [('catalog', 'catalog.html', 'Каталог'), ('services', 'services.html', 'Монтаж и услуги'), ('business', 'business.html', 'Бизнесу'),
       ('about', 'about.html', 'О компании'), ('contacts', 'contacts.html', 'Контакты')]
CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>'
PD = '<label class="pd{cls}"><input type="checkbox" class="pd-box" id="{id}"><span>Согласен на обработку персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>'
def pd(i, cls=''): return PD.format(id=i, cls=cls)
def rub(n): return f'{n:,}'.replace(',', ' ') + ' ₽'

CUR = ' aria-current="page"'
def page(key, title, desc, body, scripts=True):
    nav = ''.join(f'<a href="{h}"{CUR if k == key else ""}>{t}</a>' for k, h, t in NAV)
    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" href="../assets/brand/mark-64.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap">
<link rel="stylesheet" href="site.css">
</head>
<body data-page="{key}">
<a class="sr-only" href="#main">К содержанию</a>
<div class="topbar"><div class="wrap"><span class="tb-addr">{ADDR} · Челябинск и область</span><nav aria-label="Связь"><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a><a href="{TG}" target="_blank" rel="noopener">Telegram</a><a href="tel:{TEL}">{TEL_H}</a></nav></div></div>
<header class="hdr"><div class="wrap">
  <a class="brand" href="index.html" aria-label="Climate Solutions — на главную"><img src="../assets/brand/mark.png" alt="" width="253" height="410"><b>climate solutions<small>for home &amp; business</small></b></a>
  <nav class="nav" aria-label="Разделы">{nav}</nav>
  <a class="hdr-tel" href="tel:{TEL}">{TEL_H}</a>
  <a class="cart-btn" href="cart.html" aria-label="Корзина">{CART_SVG}<span class="cart-t">Корзина</span><span class="cart-n" data-n="0">0</span></a>
  <button class="btn btn-red" type="button" data-req data-title="Оставить заявку">Заявка</button>
  <button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="drawer"><span></span></button>
</div></header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Меню"><div class="drawer-bg"></div><div class="drawer-p">
  <button class="x" type="button" aria-label="Закрыть меню">×</button>
  <nav aria-label="Разделы"><a href="index.html"{CUR if key == 'home' else ""}>Главная</a>{nav}<a href="cart.html"{CUR if key == 'cart' else ""}>Корзина</a></nav>
  <a class="dr-tel" href="tel:{TEL}">{TEL_H}</a>
  <button class="btn btn-red" type="button" data-req data-title="Оставить заявку">Оставить заявку</button>
  <a class="btn btn-line" href="{WA}" target="_blank" rel="noopener">Написать в WhatsApp</a>
</div></div>
<main id="main">
{body}
</main>
<footer class="ftr"><div class="wrap">
  <div class="ftr-g">
    <div><a class="brand" href="index.html"><img src="../assets/brand/mark-light.png" alt="" width="253" height="410"><b>climate solutions<small>for home &amp; business</small></b></a>
      <a class="ftr-tel" href="tel:{TEL}">{TEL_H}</a><p style="margin-top:8px;font-size:14px">{ADDR}</p></div>
    <div><h3>Каталог</h3><ul><li><a href="catalog.html?type=wall">Настенные сплит-системы</a></li><li><a href="catalog.html?type=multi">Мульти-сплит</a></li><li><a href="catalog.html?type=cassette,ducted,floor">Полупромышленные</a></li><li><a href="catalog.html?type=mobile">Мобильные</a></li></ul></div>
    <div><h3>Услуги</h3><ul><li><a href="services.html#ac">Монтаж кондиционеров</a></li><li><a href="services.html#vent">Вентиляция</a></li><li><a href="services.html#el">Электромонтаж</a></li><li><a href="services.html#service">Обслуживание</a></li></ul></div>
    <div><h3>Компания</h3><ul><li><a href="about.html">О компании</a></li><li><a href="about.html#team">Команда</a></li><li><a href="about.html#reviews">Отзывы</a></li><li><a href="business.html">Для бизнеса</a></li></ul></div>
    <div><h3>Связь</h3><ul><li><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="{TG}" target="_blank" rel="noopener">Telegram</a></li><li><a href="{VK}" target="_blank" rel="noopener">ВКонтакте</a></li><li><a href="contacts.html">Контакты и карта</a></li></ul></div>
  </div>
  <div class="ftr-b"><span>Climate Solutions © 2026 · ИП [ФИО] · ИНН [—]</span><span><a href="privacy.html">Политика конфиденциальности</a></span></div>
</div></footer>
<dialog class="md" id="md" aria-labelledby="mdT"><form class="md-box" id="mdForm" novalidate>
  <button class="md-x" id="mdX" type="button" aria-label="Закрыть">×</button>
  <span class="mono kick">заявка</span><h2 class="md-t" id="mdT">Оставить заявку</h2><p class="md-s" id="mdS">Оставьте телефон — перезвоним в течение 15 минут в рабочее время.</p>
  <input type="hidden" id="mdWhat">
  <div class="fld"><label for="mdName">Имя *</label><input id="mdName" autocomplete="name" required></div>
  <div class="fld"><label for="mdPhone">Телефон *</label><input id="mdPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__" required></div>
  {pd('mdPd')}
  <div class="err" id="mdErr" role="alert"></div>
  <button class="btn btn-red" type="submit">Отправить</button>
</form></dialog>
<div class="ck" id="ck" role="region" aria-label="Уведомление о cookie" hidden><p>Мы используем cookie, чтобы сайт и корзина работали корректно. Подробнее — в <a href="privacy.html" target="_blank" rel="noopener">политике конфиденциальности</a>.</p><button class="btn btn-s" type="button" id="ckOk">Хорошо</button></div>
{'<script src="products.js"></script>' + chr(10) + '<script src="site.js"></script>' if scripts else ''}
</body>
</html>
'''

def crumbs(*items):
    """items: (href, text) for links, (None, text) or (None, text, id) for the current page."""
    li = ''
    for it in items:
        href, text, cid = (list(it) + [None])[:3]
        li += f'<li><a href="{href}">{text}</a></li>' if href else '<li aria-current="page"' + (' id="' + cid + '"' if cid else '') + f'>{text}</li>'
    return f'<ol class="crumbs" aria-label="Навигация">{li}</ol>'

def cta(title='Не знаете, какую модель выбрать?', sub='Оставьте телефон — инженер перезвонит за 15 минут, подберёт кондиционер по площади и посчитает монтаж.', fid='ctaPd'):
    return f'''<section class="sec" style="padding-top:0"><div class="wrap"><div class="cta">
  <div><h2>{title}</h2><p class="lead">{sub}</p></div>
  <form data-lead novalidate><div class="cta-row"><label class="sr-only" for="{fid}Ph">Телефон</label><input id="{fid}Ph" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"><button class="btn" type="submit">Перезвоните мне</button></div>
    {pd(fid, ' pd-dark')}<div class="err" role="alert"></div>
    <div class="cta-alt"><a href="{WA}" target="_blank" rel="noopener">WhatsApp ↗</a><a href="{TG}" target="_blank" rel="noopener">Telegram ↗</a><a href="tel:{TEL}">{TEL_H}</a></div></form>
</div></div></section>'''

REVIEWS = [
  ('июль 2024', 'Марина Р.', 'Тимур Викторович, огромное вам спасибо. Вы самые лучшие! Внимательный, вежливый и отзывчивый руководитель. Подобрал кондиционер по всем параметрам моих пожеланий. Установку провели быстро и качественно.', 'GWY7PGqs4gR8l2Q-euQ1iQwS1H2OqaZ'),
  ('июнь 2022', 'Zab Zoog', 'Понравилось особо вежливое общение с Тимуром по телефону при обращении! Смета по выполнении работ не возросла! Установка прошла быстро, качественно. Всем спасибо, так держать!)', 'OWemK3mmFVYA_yHRaFU3NZCGdz8pGLv'),
  ('май 2022', 'Николай Б.', 'Хорошие мастера, сделали всё быстро, всё объяснили, показали, учли все мои пожелания.', 'M3r7GeejMm3CKm_PuFPJ3xLw7V5Xwb'),
]
YM = 'https://yandex.ru/maps/org/climate_solutions/89687502787/reviews/'
def reviews(n=3):
    cards = ''.join(f'<article class="card rv"><p>«{t}»</p><div class="rv-who"><div><b>{who}</b><br><span>Яндекс Карты · {d}</span></div><a href="{YM}?reviews%5BpublicId%5D={i}&amp;utm_source=review" target="_blank" rel="noopener">Оригинал ↗</a></div></article>' for d, who, t, i in REVIEWS[:n])
    return f'''<section class="sec" id="reviews"><div class="wrap">
  <div class="sec-t"><div><span class="mono kick">отзывы</span><h2>Что говорят клиенты</h2></div><a class="rating" href="{YM}" target="_blank" rel="noopener" style="text-decoration:none"><b>4,3</b><span>5 отзывов<br>на Яндекс Картах ↗</span></a></div>
  <div class="grid3">{cards}</div></div></section>'''

WORKS = [('alpinist-outdoor-unit', 'Наружный блок без автовышки', 'Челябинск · 9-й этаж'), ('split-wallpaper', 'Сплит 2,5 кВт, трасса в коробе', 'Челябинск · 3 часа'),
         ('store-ducts-1', 'Вентиляция и трассы зала', 'Екатеринбург · магазин'), ('alpinist-drilling-winter', 'Трасса по фасаду зимой', 'Екатеринбург · −15 °C')]
def works():
    f = ''.join(f'<figure class="work" style="margin:0"><img src="../assets/photos/{img}-sm.webp" alt="{t}" loading="lazy"><figcaption><b>{t}</b><span>{c}</span></figcaption></figure>' for img, t, c in WORKS)
    return f'''<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-t"><div><span class="mono kick">объекты</span><h2>Наша работа — вблизи</h2></div><a class="link" href="services.html">Все услуги →</a></div>
  <div class="works">{f}</div></div></section>'''

STEPS = [('Выбор', 'В каталоге или с инженером по телефону — подберём модель по площади и задачам.'),
         ('Замер — бесплатно', 'Приедем, посмотрим место установки и зафиксируем смету в договоре.'),
         ('Монтаж за день', 'Сплит-система — за 3–4 часа. Накрываем мебель, после себя убираем.'),
         ('Гарантия 3 года', 'На монтаж по договору. На оборудование — гарантия производителя.')]
def steps(title='Кондиционер под ключ — в четыре шага'):
    s = ''.join(f'<div class="card step"><b>{a}</b><p>{b}</p></div>' for a, b in STEPS)
    return f'<section class="sec"><div class="wrap"><div class="sec-t"><div><span class="mono kick">как мы работаем</span><h2>{title}</h2></div></div><div class="steps">{s}</div></div></section>'

# ---------------------------------------------------------------- pages
HOME = f'''<section class="hero"><div class="wrap"><div class="hero-g">
  <div class="hero-l">
    <div><span class="mono kick">магазин и монтаж · Челябинск</span>
      <h1 style="margin-top:16px">Кондиционеры <em>с установкой</em> под ключ</h1>
      <p class="lead">Продаём сплит-системы и ставим их сами: подбор по площади, бесплатный замер, монтаж за день и гарантия 3 года на работы. Плюс вентиляция и электрика — для квартир, домов и бизнеса.</p>
      <div class="hero-cta"><a class="btn btn-red" href="catalog.html">Перейти в каталог</a><button class="btn btn-line" type="button" data-req data-title="Подобрать кондиционер" data-sub="Скажите площадь комнаты — инженер перезвонит и предложит 2–3 модели с ценой монтажа.">Подобрать с инженером</button></div></div>
    <div class="hero-facts"><div><b>3–4 часа</b><span>монтаж сплит-системы</span></div><div><b>0 ₽</b><span>выезд и замер</span></div><div><b>3 года</b><span>гарантия на работы</span></div></div>
  </div>
  <div class="hero-r"><img src="../assets/photos/split-bedroom.webp" alt="Сплит-система в спальне после монтажа" fetchpriority="high">
    <a class="hero-pick" href="product.html?id=haier-coral-09"><img src="../assets/shop/wall-pro.webp" alt=""><div><span class="mono kick">хит сезона</span><b>Haier Coral DC Inverter 09</b><span>до 25 м² · инвертор · Wi-Fi</span></div><span class="price">{rub(39990)}</span></a></div>
</div>
<div class="cats">
  <a class="cat" href="catalog.html?type=wall"><img src="../assets/shop/wall-white.webp" alt="" loading="lazy"><div><b>Настенные сплит-системы</b><span>для квартиры и дома</span></div></a>
  <a class="cat" href="catalog.html?type=multi"><img src="../assets/shop/outdoor-multi.webp" alt="" loading="lazy"><div><b>Мульти-сплит</b><span>один блок на несколько комнат</span></div></a>
  <a class="cat" href="catalog.html?type=cassette,ducted,floor"><img src="../assets/shop/cassette.webp" alt="" loading="lazy"><div><b>Кассетные и канальные</b><span>для офиса и магазина</span></div></a>
  <a class="cat" href="catalog.html?type=mobile"><img src="../assets/shop/mobile.webp" alt="" loading="lazy"><div><b>Мобильные</b><span>без монтажа, для аренды</span></div></a>
  <a class="cat cat-svc" href="services.html"><span class="mono">услуги</span><div><b>Монтаж, вентиляция и электрика</b><span>от {rub(14900)} под ключ</span></div></a>
</div></div></section>

<section class="sec"><div class="wrap">
  <div class="sec-t"><div><span class="mono kick">популярное</span><h2>Хиты продаж</h2></div><a class="link" href="catalog.html">Весь каталог →</a></div>
  <div class="pgrid p4" id="hits"></div>
</div></section>

{steps()}

<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-t"><div><span class="mono kick">услуги</span><h2>Не только кондиционеры</h2><p class="lead">Один подрядчик на климат, воздух и электрику — одна смета и одна гарантия.</p></div><a class="link" href="services.html">Все услуги и цены →</a></div>
  <div class="grid3">
    <a class="card svc" href="services.html#ac"><img src="../assets/photos/alpinist-outdoor-unit-sm.webp" alt="" loading="lazy"><div class="svc-b"><h3>Монтаж кондиционеров</h3><p>Сплит, мульти-сплит, кассетные и канальные. Демонтаж, перенос, чистка.</p><span class="price">от {rub(14900)}</span></div></a>
    <a class="card svc" href="services.html#vent"><img src="../assets/photos/kitchen-ventilation-sm.webp" alt="" loading="lazy"><div class="svc-b"><h3>Вентиляция</h3><p>Проект, приточные установки, рекуператоры, вытяжка в санузле и на кухне.</p><span class="price">от {rub(4500)}</span></div></a>
    <a class="card svc" href="services.html#el"><img src="../assets/photos/ceiling-ducts-wiring-sm.webp" alt="" loading="lazy"><div class="svc-b"><h3>Электромонтаж</h3><p>Щиты с УЗО, проводка, освещение и розетки — с протоколом замеров.</p><span class="price">от 350 ₽ / точка</span></div></a>
  </div></div></section>

<section class="sec" style="padding-top:0"><div class="wrap"><div class="biz">
  <div><span class="mono" style="color:rgba(255,255,255,.55)">для бизнеса</span><h2 style="margin-top:12px">Климат и электрика для офисов, магазинов и сетей</h2>
    <p class="lead">Договор, смета по разделам, монтаж ночью без остановки работы, закрывающие документы и регламентное обслуживание.</p>
    <div class="hero-cta"><a class="btn btn-white" href="business.html">Решения для бизнеса</a><a class="btn btn-line" style="--fg:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)" href="business.html#kp">Запросить КП</a></div></div>
  <ul><li><b>2 дня</b><span>КП по вашему ТЗ</span></li><li><b>4 часа</b><span>аварийный выезд по договору</span></li><li><b>24/7</b><span>монтаж ночью и в выходные</span></li><li><b>3 года</b><span>гарантия на работы</span></li></ul>
</div></div></section>

{works()}
{reviews()}
{cta()}'''

CATALOG = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), (None, 'Каталог'))}
<div class="ph"><h1>Кондиционеры</h1><p class="lead">Сплит-системы, мульти-сплит и полупромышленные модели — с монтажом под ключ. Не нашли нужную модель? Привезём под заказ.</p></div>
<div class="cat-l">
  <form class="card flt" id="flt" aria-label="Фильтры" onsubmit="return false">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2>Фильтры</h2><button class="md-x flt-x" type="button" aria-label="Закрыть фильтры" style="position:static;display:none">×</button></div>
    <fieldset><legend>Тип</legend><div id="fType"></div></fieldset>
    <fieldset><legend>Площадь помещения</legend><div class="chips" id="fArea" role="group" aria-label="Площадь"></div></fieldset>
    <fieldset><legend>Цена, ₽</legend><div class="range"><label class="sr-only" for="pMin">от</label><input id="pMin" type="number" inputmode="numeric" placeholder="от 20 000" min="0" step="1000"><label class="sr-only" for="pMax">до</label><input id="pMax" type="number" inputmode="numeric" placeholder="до 160 000" min="0" step="1000"></div></fieldset>
    <fieldset><legend>Возможности</legend><label class="sw">Инверторный компрессор<input type="checkbox" id="fInv"></label><label class="sw">Управление по Wi-Fi<input type="checkbox" id="fWifi"></label></fieldset>
    <fieldset><legend>Бренд</legend><div id="fBrand"></div></fieldset>
    <button class="flt-reset" type="button" id="fReset">Сбросить фильтры</button>
    <button class="btn flt-x" type="button" style="display:none;width:100%;margin-top:8px">Показать <span id="fN">0</span></button>
  </form>
  <div>
    <div class="bar"><span class="bar-n" id="cnt" aria-live="polite"></span>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line btn-s flt-open" type="button" id="fOpen" aria-expanded="false" aria-controls="flt">Фильтры<span id="fAct"></span></button>
      <label class="sr-only" for="sort">Сортировка</label><select class="sel" id="sort"><option value="pop">Сначала популярные</option><option value="cheap">Сначала дешевле</option><option value="exp">Сначала дороже</option><option value="area">По площади</option></select></div></div>
    <div class="pgrid" id="grid"></div>
    <p class="demo-note" style="margin-top:20px">Демо-каталог: бренды и серии реальные, цены и характеристики ориентировочные — пришлите прайс, заменим</p>
  </div>
</div></div>'''

PRODUCT = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), ('catalog.html', 'Каталог'), (None, '', 'crumbP'))}
<div class="pp" id="pp"></div>
<section style="padding-bottom:56px">
  <div class="tabs" role="tablist" aria-label="О товаре"><button role="tab" aria-selected="true" aria-controls="tSpec" id="tb1">Характеристики</button><button role="tab" aria-selected="false" aria-controls="tInst" id="tb2">Что входит в монтаж</button><button role="tab" aria-selected="false" aria-controls="tDlv" id="tb3">Доставка и оплата</button></div>
  <div role="tabpanel" id="tSpec" aria-labelledby="tb1" style="max-width:820px"></div>
  <div role="tabpanel" id="tInst" aria-labelledby="tb2" hidden><div class="txt"><p>Монтаж под ключ стоит {rub(14900)} для настенных сплит-систем и включает:</p><ul><li>выезд и консультацию на месте;</li><li>трассу до 3 м (медь в теплоизоляции), кабель и дренаж;</li><li>кронштейны для наружного блока;</li><li>штробу или декоративный короб — на выбор;</li><li>вакуумирование и проверку давления;</li><li>запуск, проверку всех режимов и инструктаж;</li><li>уборку после работ.</li></ul><p>Дополнительный метр трассы — {rub(1900)}, демонтаж старого кондиционера — {rub(3900)}. Длину трассы считаем на замере и сразу вносим в смету.</p></div></div>
  <div role="tabpanel" id="tDlv" aria-labelledby="tb3" hidden><div class="txt"><ul><li><b>Доставка</b> по Челябинску и области — вместе с монтажом в согласованный день.</li><li><b>Самовывоз</b> — {ADDR}, после звонка менеджера.</li><li><b>Оплата</b> при получении наличными или картой, для юрлиц — по счёту.</li><li><b>Гарантия</b> производителя на оборудование и 3 года на монтаж по договору.</li></ul></div></div>
</section>
<section style="padding-bottom:96px"><div class="sec-t"><div><h2>Похожие модели</h2></div></div><div class="pgrid" id="sim"></div></section>
</div>'''

CART = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), ('catalog.html', 'Каталог'), (None, 'Корзина'))}
<div class="ph"><h1>Корзина</h1></div>
<div class="cart-l" id="cartBox"></div></div>'''

def plist(rows): return '<div class="card plist"><table><tbody>' + ''.join(f'<tr><td><b>{a}</b>{f"<span>{b}</span>" if b else ""}</td><td>{c}</td></tr>' for a, b, c in rows) + '</tbody></table></div>'
FAQ = [('Сколько длится монтаж?', 'Сплит-система в квартире — 3–4 часа. Мульти-сплит или канальная система — от одного до трёх дней, точный срок пишем в договоре.'),
       ('Что если трасса длиннее 3 метров?', 'Каждый дополнительный метр — 1 900 ₽, медь в теплоизоляции. Длину считаем на замере и сразу вносим в смету.'),
       ('Можно поставить кондиционер, купленный не у вас?', 'Да, по тем же ценам. Перед монтажом проверим комплектацию и совместимость, гарантия на работы — те же 3 года.'),
       ('Монтируете зимой?', 'Да, круглый год. При минусовой температуре ставим зимний комплект, чтобы кондиционер работал и на обогрев, и без вреда компрессору.'),
       ('Будет ли пыль и грязь?', 'Мебель и пол накрываем плёнкой, сверлим с пылесосом. После работ убираем за собой — это входит в каждый пакет.'),
       ('Нужен ли проект вентиляции для квартиры?', 'Для вытяжки в санузле — нет. Для приточной системы или рекуператора — да: считаем воздухообмен и показываем схему до монтажа.')]
def faq(items): return '<div class="faq">' + ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in items) + '</div>'

SERVICES = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), (None, 'Монтаж и услуги'))}
<div class="ph"><h1>Монтаж и услуги</h1><p class="lead">Цена фиксируется в смете до начала работ и не растёт на месте. Выезд и замер — бесплатно.</p>
  <nav class="anchors" aria-label="Направления"><a href="#ac">Кондиционеры</a><a href="#vent">Вентиляция</a><a href="#el">Электромонтаж</a><a href="#service">Обслуживание</a></nav></div>
<div class="dir" id="ac"><div class="card dir-l"><span class="mono kick">01 · климат</span><h2>Монтаж кондиционеров</h2><p>Подберём модель по площади и задачам, смонтируем за день и покажем управление. Для квартир, домов и офисов.</p>
  <div class="hero-cta" style="margin:0"><button class="btn btn-red" type="button" data-req data-title="Заказать монтаж кондиционера">Заказать монтаж</button><a class="btn btn-line" href="catalog.html">Каталог техники</a></div><img src="../assets/photos/split-wallpaper-sm.webp" alt="Сплит-система после монтажа" loading="lazy"></div>
  {plist([('Монтаж сплит-системы под ключ', 'трасса до 3 м, кронштейны, вакуумирование, запуск', 'от ' + rub(14900)), ('Мульти-сплит, 2 комнаты', 'один наружный блок на несколько комнат', 'от ' + rub(32000)), ('Кассетные и канальные', 'скрыты в потолке, для домов и офисов', 'от ' + rub(38000)), ('Мобильные и оконные', 'подбор и установка', 'от ' + rub(3900)), ('Дополнительный метр трассы', 'медь в теплоизоляции', rub(1900)), ('Демонтаж и перенос', 'аккуратно снимем и переустановим', 'от ' + rub(3900))])}</div>
<div class="dir" id="vent"><div class="card dir-l"><span class="mono kick">02 · воздух</span><h2>Вентиляция</h2><p>Свежий воздух без сквозняков и шума: считаем воздухообмен под помещение и проектируем до монтажа.</p>
  <div class="hero-cta" style="margin:0"><button class="btn btn-red" type="button" data-req data-title="Рассчитать вентиляцию">Рассчитать вентиляцию</button></div><img src="../assets/photos/kitchen-ventilation-sm.webp" alt="Вытяжка на кухне" loading="lazy"></div>
  {plist([('Проект и расчёт воздухообмена', 'для квартир, офисов, торговых залов', 'от ' + rub(25000)), ('Приточная установка', 'механическая приточно-вытяжная система, тихая работа', 'от ' + rub(40000)), ('Рекуператор в дом', 'возвращает тепло вытяжного воздуха', 'от ' + rub(60000)), ('Вытяжка в санузле и на кухне', 'вентилятор, обратный клапан, отдельная линия', 'от ' + rub(4500)), ('Обслуживание и ремонт', 'чистка воздуховодов, фильтры, диагностика', 'от ' + rub(4500))])}</div>
<div class="dir" id="el"><div class="card dir-l"><span class="mono kick">03 · энергия</span><h2>Электромонтаж</h2><p>Щиты, проводка, освещение и розетки — для квартир, домов и коммерческих помещений. С протоколом замеров.</p>
  <div class="hero-cta" style="margin:0"><button class="btn btn-red" type="button" data-req data-title="Вызвать электрика">Вызвать электрика</button></div><img src="../assets/photos/ceiling-ducts-wiring-sm.webp" alt="Проводка до отделки" loading="lazy"></div>
  {plist([('Электрощит с УЗО', 'сборка, маркировка, защита и заземление', 'от ' + rub(12000)), ('Проводка в квартире', 'по проекту, скрытая или открытая', 'от ' + rub(45000)), ('Розетка или выключатель', '', '350 ₽ / точка'), ('Светильник', '', '450 ₽ / точка'), ('Диагностика сети', 'замеры и протокол', 'от ' + rub(3500))])}</div>
<div class="dir" id="service"><div class="card dir-l"><span class="mono kick">04 · сервис</span><h2>Обслуживание</h2><p>Чистим и проверяем кондиционеры и вентиляцию, ведём журнал работ. Для компаний — регламентное ТО по договору.</p>
  <div class="hero-cta" style="margin:0"><button class="btn btn-red" type="button" data-req data-title="Записаться на чистку">Записаться на чистку</button></div></div>
  {plist([('Чистка и ТО сплит-системы', 'чистка блоков, проверка давления, дозаправка', 'от ' + rub(2900)), ('Обслуживание вентиляции', 'фильтры, чистка, диагностика', 'от ' + rub(4500)), ('Регламентное ТО для бизнеса', 'по графику, журнал работ, аварийный выезд за 4 часа', 'по договору')])}</div>
</div>
{steps('Как проходит монтаж')}
<section class="sec" style="padding-top:0"><div class="wrap"><div class="sec-t"><div><span class="mono kick">вопросы</span><h2>Частые вопросы</h2></div></div>{faq(FAQ)}</div></section>
{cta('Посчитаем монтаж под ваш объект', 'Пришлите фото места установки в WhatsApp или оставьте телефон — назовём цену и запишем на бесплатный замер.')}'''

BUSINESS = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), (None, 'Бизнесу'))}
<div class="ph"></div>
<div class="biz" style="align-items:center"><div><span class="mono" style="color:rgba(255,255,255,.55)">для бизнеса · Челябинск · Екатеринбург</span><h1 style="margin-top:14px;font-size:clamp(34px,4.4vw,60px)">Инженерные системы для бизнеса — без остановки работы</h1>
  <p class="lead">Климат, вентиляция и электромонтаж для офисов, магазинов, общепита и сетей. Смета по разделам, монтаж ночью, полный пакет документов.</p>
  <div class="hero-cta"><a class="btn btn-red" href="#kp">Запросить КП</a><a class="btn btn-line" style="--fg:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)" href="tel:{TEL}">{TEL_H}</a></div></div>
  <ul><li><b>2 дня</b><span>КП по вашему ТЗ</span></li><li><b>4 часа</b><span>аварийный выезд</span></li><li><b>24/7</b><span>ночью и в выходные</span></li><li><b>3 года</b><span>гарантия на работы</span></li></ul></div>
</div>
<section class="sec"><div class="wrap"><div class="sec-t"><div><span class="mono kick">отрасли</span><h2>Знаем режим работы каждой</h2></div></div>
<div class="grid3">{''.join(f'<div class="card feat"><img src="../assets/ill/v10/ind-{i}.webp" alt="" loading="lazy" style="width:100%;aspect-ratio:16/10;object-fit:contain;margin-bottom:6px"><b>{t}</b><p>{d}</p></div>' for i, t, d in [('retail', 'Ритейл и сети', 'Залы, склады и витрины: климат, вытяжка, свет. Монтаж ночью, тиражное решение для всех точек.'), ('food', 'Общепит', 'Кухонная вытяжка и приток, электрика под тепловое оборудование, паспорт системы.'), ('office', 'Офисы', 'Кондиционирование open space и переговорных, серверные, освещение и розеточные группы.'), ('storage', 'Склады и производство', 'Вентиляция и освещение пролётов, силовые линии, щиты и учёт.'), ('bank', 'Банки и отделения', 'Типовые решения по стандарту сети, работы вне часов приёма, регламентное ТО.'), ('med', 'Медицина и образование', 'Воздухообмен по нормам, документация для проверок, работа в каникулы и выходные.')])}</div></div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="sec-t"><div><span class="mono kick">условия</span><h2>Всё, что обсуждают юристы и бухгалтерия, — заранее</h2></div></div>
<div class="grid3">{''.join(f'<div class="card feat"><span class="mono">{a}</span><b>{b}</b><p>{c}</p></div>' for a, b, c in [('сроки', 'Неустойка — с нашей стороны', 'Фиксируем сроки по этапам в договоре, еженедельный отчёт с фото.'), ('цена', 'Смета по разделам', 'Климат, вентиляция, электрика. Не меняется без допсоглашения.'), ('оплата', 'Безнал, поэтапно', 'Аванс на материалы, остаток — по актам.'), ('документы', 'Полный пакет', 'Договор, спецификация, КС-2, КС-3, исполнительная схема, протоколы замеров.'), ('гарантия', '3 года на работы', 'Гарантия производителя на оборудование, регламентное ТО по графику.'), ('один подрядчик', 'Без стыков между бригадами', 'Климат, вентиляция и электрика в одном договоре и одной смете.')])}</div></div></section>
<section class="sec" id="kp" style="padding-top:0;scroll-margin-top:80px"><div class="wrap"><div class="dir"><div class="card dir-l"><span class="mono kick">коммерческое предложение</span><h2>КП по вашему ТЗ за 2 дня</h2><p>Опишите объект и задачу — инженер свяжется в течение рабочего дня. ТЗ можно прислать в ответ на звонок или в WhatsApp.</p></div>
<form class="card kp" data-lead="kp" novalidate>
  <div class="f2"><div class="fld"><label for="kCo">Компания *</label><input id="kCo" name="company" autocomplete="organization"></div><div class="fld"><label for="kInn">ИНН · необязательно</label><input id="kInn" inputmode="numeric"></div></div>
  <div class="fld"><label for="kTask">Задача</label><select id="kTask"><option>Кондиционирование</option><option>Вентиляция</option><option>Электромонтаж</option><option>Комплексно: климат и электрика</option><option>Регламентное ТО</option></select></div>
  <div class="f2"><div class="fld"><label for="kName">Контактное лицо</label><input id="kName" autocomplete="name"></div><div class="fld"><label for="kPhone">Телефон *</label><input id="kPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"></div></div>
  <div class="fld"><label for="kNote">Объект и задача</label><textarea id="kNote" placeholder="Город, площадь, что нужно сделать и к какому сроку"></textarea></div>
  {pd('kPd')}<div class="err" role="alert"></div>
  <button class="btn btn-red" type="submit" style="justify-self:start">Отправить запрос</button>
</form></div></div></section>'''

TEAM = [('timur-antonov', 'надзиратель Антона', 'Тимур Антонов', 'Подбирает решение, считает смету и отвечает за объект от выезда до акта.'),
        ('anton-dikarev', 'главный инженер', 'Антон Дикарев', 'Считает мощность и воздухообмен, подбирает оборудование и ведёт проект по климату и вентиляции.'),
        ('nikolay-dikarev', 'надзиратель Антона', 'Николай Дикарев', 'Ведёт бригады на объекте: монтаж, электрика, пусконаладка и сдача работ с актом.')]
ABOUT = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), (None, 'О компании'))}
<div class="ph"><h1>О компании</h1><p class="lead">Climate Solutions — продаём и монтируем кондиционеры, проектируем вентиляцию и делаем электрику. Для квартир, домов и бизнеса в Челябинске, Екатеринбурге и области.</p></div>
<div class="grid4">{''.join(f'<div class="card feat"><span class="mono">{a}</span><b style="font-weight:300;font-size:36px;letter-spacing:-.04em">{b}</b><p>{c}</p></div>' for a, b, c in [('опыт', '8 лет', 'монтируем климат и электрику'), ('объекты', '1 200+', 'сдано по акту'), ('гарантия', '3 года', 'на все работы по договору'), ('ответ', '15 минут', 'перезваниваем после заявки')])}</div>
</div>
<section class="sec" id="team" style="scroll-margin-top:80px"><div class="wrap"><div class="sec-t"><div><span class="mono kick">команда</span><h2>Люди, которые отвечают за объект</h2></div></div>
<div class="team">{''.join(f'<article class="card tm"><div class="tm-ph"><img src="../assets/team/{i}.webp" alt="{n}" width="1000" height="914"></div><div><span class="mono">{r}</span><b>{n}</b><p>{d}</p></div></article>' for i, r, n, d in TEAM)}</div></div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="sec-t"><div><span class="mono kick">гарантии</span><h2>Каждое условие — в документе</h2></div></div>
<div class="grid3">{''.join(f'<div class="card feat"><span class="mono">{a}</span><b>{b}</b><p>{c}</p></div>' for a, b, c in [('договор', 'Гарантия — 3 года', 'На все работы. Если что-то не так — приедем и устраним бесплатно.'), ('договор', 'Дата монтажа — в договоре', 'Фиксируем день заранее и приезжаем вовремя.'), ('смета', 'Цена не растёт', 'Согласована до начала работ и не меняется на месте.'), ('смета', 'Марка и модель — прямо', 'Проверенные производители, всё названо в смете.'), ('проект', 'Автоматы и УЗО', 'Защита и заземление в каждом электрощите.'), ('акт', 'Инструктаж при сдаче', 'Показываем управление и уход за системой.')])}</div></div></section>
{reviews()}
<section class="sec" style="padding-top:0"><div class="wrap"><div class="sec-t"><div><span class="mono kick">реквизиты</span><h2>Данные компании</h2></div></div>
<div class="card" style="padding:8px 24px"><dl class="req"><dt>Наименование</dt><dd>ИП <span class="hl">[ФИО]</span></dd><dt>ИНН / ОГРНИП</dt><dd><span class="hl">[ИНН]</span> / <span class="hl">[ОГРНИП]</span></dd><dt>Адрес</dt><dd>{ADDR}</dd><dt>Телефон</dt><dd><a class="link" href="tel:{TEL}">{TEL_H}</a></dd></dl></div></div></section>
{cta('Обсудим вашу задачу', 'Оставьте телефон — перезвоним за 15 минут и подскажем, с чего начать.', 'ctaPd2')}'''

CONTACTS = f'''<div class="wrap">{crumbs(('index.html', 'Главная'), (None, 'Контакты'))}
<div class="ph"><h1>Контакты</h1><p class="lead">Челябинск и область, по договору — по всей России. Звоните, пишите в мессенджер или приезжайте в офис.</p></div>
<div class="contacts" style="padding-bottom:16px"><div class="card cn">
  <a class="cn-tel" href="tel:{TEL}">{TEL_H}</a>
  <dl><div><dt>Второй номер</dt><dd><a class="link" href="tel:+79000800838">+7 (900) 080-08-38</a></dd></div><div><dt>Адрес</dt><dd>{ADDR}</dd></div>
  <div><dt>Мессенджеры</dt><dd style="display:flex;gap:6px 14px;flex-wrap:wrap"><a class="link" href="{WA}" target="_blank" rel="noopener">WhatsApp ↗</a><a class="link" href="{TG}" target="_blank" rel="noopener">Telegram ↗</a><a class="link" href="{VK}" target="_blank" rel="noopener">ВКонтакте ↗</a></dd></div>
  <div><dt>Для компаний</dt><dd>Реквизиты, допуски и образец договора отправим вместе с КП.</dd></div></dl>
  <div class="hero-cta" style="margin:0"><a class="btn btn-red" href="tel:{TEL}">Позвонить</a><a class="btn btn-line" href="https://yandex.ru/maps/org/climate_solutions/89687502787/" target="_blank" rel="noopener">Маршрут ↗</a></div></div>
  <div class="map"><iframe title="Climate Solutions на Яндекс Картах" src="https://yandex.ru/map-widget/v1/?oid=89687502787&amp;z=16" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></div>
<section class="sec"><div class="wrap"><div class="dir"><div class="card dir-l"><span class="mono kick">обратная связь</span><h2>Напишите нам</h2><p>Ответим в течение 15 минут в рабочее время — про кондиционеры, вентиляцию, электрику и заказы из каталога.</p></div>
<form class="card kp" data-lead novalidate><div class="f2"><div class="fld"><label for="cName">Имя *</label><input id="cName" name="name" autocomplete="name" required></div><div class="fld"><label for="cPhone">Телефон *</label><input id="cPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"></div></div>
<div class="fld"><label for="cMsg">Сообщение</label><textarea id="cMsg" placeholder="Что нужно сделать"></textarea></div>{pd('cPd')}<div class="err" role="alert"></div><button class="btn btn-red" type="submit" style="justify-self:start">Отправить</button></form></div></div></section>'''

PAGES = {
  'index.html':    ('home', 'Climate Solutions — кондиционеры с установкой в Челябинске', 'Магазин кондиционеров с монтажом под ключ: подбор по площади, бесплатный замер, монтаж за день, гарантия 3 года. Вентиляция и электрика.', HOME),
  'catalog.html':  ('catalog', 'Каталог кондиционеров с установкой — Climate Solutions', 'Сплит-системы, мульти-сплит, кассетные, канальные и мобильные кондиционеры с монтажом в Челябинске.', CATALOG),
  'product.html':  ('product', 'Кондиционер — Climate Solutions', 'Кондиционер с монтажом под ключ в Челябинске.', PRODUCT),
  'cart.html':     ('cart', 'Корзина — Climate Solutions', 'Корзина и оформление заказа.', CART),
  'services.html': ('services', 'Монтаж кондиционеров, вентиляция и электрика — цены · Climate Solutions', 'Цены на монтаж кондиционеров, вентиляцию, электромонтаж и обслуживание в Челябинске.', SERVICES),
  'business.html': ('business', 'Климат и электрика для бизнеса — Climate Solutions', 'Кондиционирование, вентиляция и электромонтаж для офисов, магазинов, общепита и сетей. КП за 2 дня.', BUSINESS),
  'about.html':    ('about', 'О компании — Climate Solutions', 'Команда, гарантии, отзывы и реквизиты Climate Solutions.', ABOUT),
  'contacts.html': ('contacts', 'Контакты — Climate Solutions', f'{ADDR}, {TEL_H}.', CONTACTS),
}
for fn, (k, t, d, b) in PAGES.items():
    open(os.path.join(OUT, fn), 'w').write(page(k, t, d, b))
print('built', len(PAGES), 'pages')
