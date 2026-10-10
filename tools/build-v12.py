#!/usr/bin/env python3
"""v12 = the v10 brand site (motion, 3D, grain, red for home / black for business) as a multi-page corporate site + shop,
partly re-composed after the Zero Tech reference. Home = v10 (shortened) + showcase; inner pages share v10's chrome.
Run from the repo root: python3 tools/build-v12.py  (needs v12/home.tpl.html, made once from v10)."""
import importlib.util, os, re

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); OUT = os.path.join(ROOT, 'v12')
spec = importlib.util.spec_from_file_location('b11', os.path.join(HERE, 'build-v11.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
TPL = open(os.path.join(OUT, 'home.tpl.html')).read()
TEL, TEL_H, WA, TG, VK, ADDR, rub = b.TEL, b.TEL_H, b.WA, b.TG, b.VK, b.ADDR, b.rub
UR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
AR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def cut(start, end, s=TPL): i = s.index(start); return s[i:s.index(end, i) + len(end)]
PD = '<label class="pd"><input type="checkbox" class="pd-box" id="{i}"><span>Согласен на обработку персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>'
def pd(i): return PD.format(i=i)

# ---------------------------------------------------------------- chrome taken from the v10 home, verbatim
HEAD = TPL[:TPL.index('<title>')]
HUD = cut('<header class="hud"', '</header>').replace('href="#top"', 'href="index.html"')
MENU = cut('<div class="menu" id="menu"', '<div class="menu-foot mono" aria-hidden="true"><span>[ climate solutions ]</span><span>[ ЧЛБ · ЕКБ ]</span></div>\n</div>').replace('href="#top"', 'href="index.html"')
FOOT = cut('<footer class="foot-x"', '</footer>').replace('href="#top"', 'href="index.html"')
CM = cut('<dialog class="cm" id="ctaModal"', '</dialog>')
CK = cut('<div class="ck" id="ck"', '</div>\n')
MBAR = cut('<nav class="mbar"', '</nav>').replace('href="#contact"', 'href="#req"').replace('href="#b2b-form"', 'href="#req"')

def page(key, title, desc, body, aud='home', three=False, cur=None):
    hud = HUD
    if cur: hud = hud.replace(f'<a href="{cur}">', f'<a href="{cur}" class="on" aria-current="page">', 1)
    hud = hud.replace('href="#contact" data-aud-only="home" data-title="Оставить заявку"', 'href="#req" data-aud-only="home" data-title="Оставить заявку"').replace('href="#b2b-form" data-aud-only="biz"', 'href="#req" data-aud-only="biz" data-title="Запросить КП"')
    return f'''{HEAD.replace('<html lang="ru"', f'<html lang="ru" data-aud="{aud}"', 1)}<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="v12.css">
</head>
<body data-page="{key}" class="pg">
{hud}

{MENU}

<main id="top">
{body}
</main>

{FOOT}

{CM}
{CK}
{MBAR}
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
{'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' + chr(10) + '<script src="viewer.js"></script>' if three else ''}
<script src="products.js"></script>
<script src="chrome.js"></script>
<script src="shop.js"></script>
</body>
</html>
'''

def crumbs(*items):
    li = ''.join(f'<li><a href="{h}">{t}</a></li>' if h else f'<li aria-current="page">{t}</li>' for h, t in items)
    return f'<ol class="crumbs" aria-label="Навигация">{li}</ol>'
H = ('index.html', 'Главная')

def phx(title, sub='', count=None, crumb=(), extra='', cid=''):
    """Zero Tech page head: a dark grainy frame, giant uppercase word, counter in parentheses."""
    c = f'<sup{f" id={chr(34)}{cid}{chr(34)}" if cid else ""}>({count})</sup>' if count is not None else ''
    return f'''<section class="phx"><div class="phx-f">
  {crumbs(H, *crumb)}
  <h1 class="phx-t">{title}{c}</h1>
  {f'<p class="phx-s">{sub}</p>' if sub else ''}{extra}
</div></section>'''

def ticker(words=('climate', 'solutions')):
    item = ''.join(f'<span>{w}</span><i>/</i>' for w in words) * 4
    return f'<div class="tk" aria-hidden="true"><div class="tk-r">{item}{item}</div></div>'

def sec_t(h, aside='', right=''):
    return f'<div class="grid title"><h2>{h}</h2>{f"<p class={chr(34)}aside{chr(34)}>{aside}</p>" if aside else ""}{right}</div>'

# ---------------------------------------------------------------- home showcase (Zero Tech): framed slider + catalog grid + ticker
SLIDES = [('Системы', 'кондиционирования', 'outdoor', 'catalog.html?type=wall', 'Настенные сплит-системы с монтажом под ключ', 'В каталог'),
          ('Мульти-', 'сплит-системы', 'outdoor-multi', 'catalog.html?type=multi', 'Один наружный блок на несколько комнат', 'В каталог'),
          ('Полупромышленные', 'системы', 'cassette', 'catalog.html?type=cassette,ducted,floor', 'Кассетные, канальные и напольно-потолочные', 'В каталог'),
          ('Системы', 'вентиляции', 'ducted', 'services.html#vent', 'Проект, приточные установки и рекуператоры', 'Услуги')]
def slider():
    sl = ''.join(f'''<div class="hs{' on' if not i else ''}"{' aria-hidden="true"' if i else ''}>
      <img class="hs-img" src="../assets/shop/{img}.webp" alt="" width="800" height="600" loading="lazy">
      <h2 class="hs-t"><span>{a}</span>{w}</h2><p class="hs-s">{s}</p>
      <a class="hs-go" href="{href}"{' tabindex="-1"' if i else ''}>{go}</a></div>''' for i, (a, w, img, href, s, go) in enumerate(SLIDES))
    return f'''<section class="sec shw" aria-roledescription="карусель" aria-label="Каталог по направлениям"><div class="shw-f grain">
  <div class="shw-top"><span class="mono">магазин и монтаж</span><a class="mono" href="catalog.html">весь каталог ↗</a></div>
  <div class="shw-stage" aria-live="polite">{sl}</div>
  <div class="shw-bar"><span class="mono shw-n"><b id="hxN">01</b> / 0{len(SLIDES)} · далее: <span id="hxNext">{SLIDES[1][1]}</span></span>
    <div class="shw-arr"><button type="button" id="hxPrev" aria-label="Предыдущее направление">{AR}</button><button type="button" id="hxNextB" aria-label="Следующее направление">{AR}</button></div></div>
</div></section>'''

CATS = [('wall', 'Настенные сплит-системы', 'wall-white', 'для квартиры и дома'), ('multi', 'Мульти-сплит', 'outdoor-multi', 'несколько комнат на один блок'),
        ('cassette', 'Кассетные', 'cassette', 'в потолок офиса и зала'), ('ducted', 'Канальные', 'ducted', 'скрытый монтаж'),
        ('floor', 'Напольно-потолочные', 'floor-ceiling', 'для залов и магазинов'), ('mobile', 'Мобильные', 'mobile', 'без монтажа')]
def catgrid():
    t = ''.join(f'''<a class="cg" href="catalog.html?type={k}"><img src="../assets/shop/{img}.webp" alt="" loading="lazy" width="800" height="600">
      <span class="cg-b"><b>{n}</b><span>{d} · <em data-count="{k}">моделей</em></span></span><span class="cg-a">{UR}</span></a>''' for k, n, img, d in CATS)
    return f'''<section class="sec" aria-labelledby="cgH">{sec_t('<span id="cgH">Каталог</span>', 'Кондиционеры со склада и под заказ — с монтажом нашими бригадами и гарантией 3 года.')}
  <div class="cgrid">{t}</div></section>'''

SHOWCASE = slider() + '\n' + catgrid() + '\n' + ticker()

# ---------------------------------------------------------------- catalog
CATALOG = phx('Каталог', 'Кондиционеры с монтажом под ключ: выберите тип, площадь комнаты и бюджет.', 16, (( None, 'Каталог'),), cid='catN', extra='''
  <div class="phx-tabs" role="group" aria-label="Тип" id="fType"></div>''') + '''
<div class="fbar" id="flt"><div class="fbar-in">
  <div class="fbar-g"><span class="mono">площадь</span><div class="chips" id="fArea" role="group" aria-label="Площадь помещения"></div></div>
  <div class="fbar-g"><span class="mono">бюджет</span><div class="chips" id="fPrice" role="group" aria-label="Цена"></div></div>
  <div class="fbar-g"><label class="sw">Инвертор<input type="checkbox" id="fInv"></label><label class="sw">Wi-Fi<input type="checkbox" id="fWifi"></label></div>
  <div class="fbar-g fbar-end"><span class="mono" id="cnt" aria-live="polite"></span><label class="sr-only" for="sort">Сортировка</label><select class="sel" id="sort"><option value="pop">популярные</option><option value="cheap">дешевле</option><option value="exp">дороже</option><option value="area">по площади</option></select></div>
</div></div>
<section class="sec cat-sec"><div class="pgrid" id="grid"></div>
  <p class="demo mono">демо-каталог · бренды и серии реальные, цены и характеристики ориентировочные</p></section>'''

# ---------------------------------------------------------------- product (3D viewer)
PRODUCT = '''<section class="pp" id="pp">
  <div class="pp-stage grain" id="ppStage"><span class="pp-word" id="ppWord" aria-hidden="true"></span>
    <canvas id="pv" aria-label="3D-модель кондиционера — можно вращать"></canvas>
    <img id="pvFallback" alt="" hidden>
    <div class="pp-ctl"><div class="seg2" role="group" aria-label="Блок" id="pvSeg"><button type="button" aria-pressed="true" data-u="in">Внутренний блок</button><button type="button" aria-pressed="false" data-u="out">Наружный</button></div><span class="mono pp-hint">потяните, чтобы повернуть</span></div>
  </div>
  <div class="pp-i" id="ppInfo"></div>
</section>
<section class="sec pp-more"><div class="grid">
  <div class="pp-tabs c1-12" role="tablist" aria-label="О товаре"><button role="tab" aria-selected="true" aria-controls="tSpec" id="tb1">Характеристики</button><button role="tab" aria-selected="false" aria-controls="tInst" id="tb2">Что входит в монтаж</button><button role="tab" aria-selected="false" aria-controls="tDlv" id="tb3">Доставка и оплата</button></div>
  <div class="c1-8" role="tabpanel" id="tSpec" aria-labelledby="tb1"></div>
  <div class="c1-8 txt" role="tabpanel" id="tInst" aria-labelledby="tb2" hidden><p>Монтаж под ключ — ''' + rub(14900) + ''' для настенных сплит-систем:</p><ul><li>трасса до 3 м, медь в теплоизоляции, кабель и дренаж;</li><li>кронштейны для наружного блока;</li><li>штроба или декоративный короб — на выбор;</li><li>вакуумирование, проверка давления, запуск всех режимов;</li><li>инструктаж и уборка после работ.</li></ul><p>Дополнительный метр трассы — ''' + rub(1900) + ''', демонтаж старого — ''' + rub(3900) + '''. Длину считаем на замере и вносим в смету.</p></div>
  <div class="c1-8 txt" role="tabpanel" id="tDlv" aria-labelledby="tb3" hidden><ul><li>Доставка по Челябинску и области — вместе с монтажом в согласованный день.</li><li>Самовывоз — ''' + ADDR + ''', после звонка менеджера.</li><li>Оплата при получении наличными или картой, для юрлиц — по счёту.</li><li>Гарантия производителя на оборудование и 3 года на монтаж по договору.</li></ul></div>
</div></section>
<section class="sec">''' + sec_t('Похожие модели') + '''<div class="pgrid" id="sim"></div></section>'''

CART = phx('Корзина', '', 0, (('catalog.html', 'Каталог'), (None, 'Корзина')), cid='cartN') + '<section class="sec cart-sec"><div class="cart-l" id="cartBox"></div></section>'

# ---------------------------------------------------------------- services
def plist(rows): return '<table class="pl"><tbody>' + ''.join(f'<tr><th scope="row"><b>{a}</b>{f"<span>{c}</span>" if c else ""}</th><td>{p}</td></tr>' for a, c, p in rows) + '</tbody></table>'
DIRS = [
  ('ac', 'Кондиционеры', 'Подберём модель по площади и задачам, смонтируем за день и покажем управление.', 'split-wallpaper', 'Заказать монтаж',
   [('Монтаж сплит-системы под ключ', 'трасса до 3 м, кронштейны, вакуумирование, запуск', 'от ' + rub(14900)), ('Мульти-сплит, 2 комнаты', 'один наружный блок на несколько комнат', 'от ' + rub(32000)), ('Кассетные и канальные', 'скрыты в потолке', 'от ' + rub(38000)), ('Дополнительный метр трассы', 'медь в теплоизоляции', rub(1900)), ('Демонтаж и перенос', '', 'от ' + rub(3900))]),
  ('vent', 'Вентиляция', 'Считаем воздухообмен под помещение и проектируем до монтажа — свежий воздух без сквозняков и шума.', 'kitchen-ventilation', 'Рассчитать вентиляцию',
   [('Проект и расчёт воздухообмена', 'квартиры, офисы, торговые залы', 'от ' + rub(25000)), ('Приточная установка', 'тихая приточно-вытяжная система', 'от ' + rub(40000)), ('Рекуператор в дом', 'возвращает тепло вытяжного воздуха', 'от ' + rub(60000)), ('Вытяжка в санузле и на кухне', 'вентилятор, обратный клапан', 'от ' + rub(4500))]),
  ('el', 'Электрика', 'Щиты, проводка, освещение и розетки — для квартир, домов и коммерческих помещений, с протоколом замеров.', 'ceiling-ducts-wiring', 'Вызвать электрика',
   [('Электрощит с УЗО', 'сборка, маркировка, заземление', 'от ' + rub(12000)), ('Проводка в квартире', 'по проекту', 'от ' + rub(45000)), ('Розетка или выключатель', '', '350 ₽ / точка'), ('Светильник', '', '450 ₽ / точка'), ('Диагностика сети', 'замеры и протокол', 'от ' + rub(3500))]),
  ('service', 'Сервис', 'Чистим и проверяем кондиционеры и вентиляцию, ведём журнал работ. Для компаний — регламентное ТО по договору.', 'outdoor-brick', 'Записаться на чистку',
   [('Чистка и ТО сплит-системы', 'чистка блоков, давление, дозаправка', 'от ' + rub(2900)), ('Обслуживание вентиляции', 'фильтры, чистка, диагностика', 'от ' + rub(4500)), ('Регламентное ТО для бизнеса', 'график, журнал, аварийный выезд за 4 часа', 'по договору')]),
]
def dirs():
    return ''.join(f'''<section class="dr" id="{k}"><div class="dr-w">{w}</div>
  <div class="grid dr-g"><div class="dr-l"><p>{t}</p><button class="btn btn-ink" type="button" data-req data-title="{btn}">{btn} <i>↗</i></button></div>
  <figure class="dr-ph"><img src="../assets/photos/{img}-sm.webp" alt="" loading="lazy"></figure><div class="dr-p">{plist(rows)}</div></div></section>''' for k, w, t, img, btn, rows in DIRS)

COOP = [('Консультация', 'ico-cube', 'по телефону или в мессенджере, в день обращения'), ('Выезд и замер', 'ico-hex', 'бесплатно, в удобное время'), ('Смета и договор', 'ico-oct', 'цена фиксируется до начала работ'),
        ('Поставка', 'ico-dodeca', 'со склада или под заказ'), ('Монтаж', 'ico-torus', 'сплит — за 3–4 часа, без грязи'), ('Запуск и сдача', 'ico-ico', 'инструктаж, акт и гарантия 3 года')]
def coop(title='Как мы работаем'):
    t = ''.join(f'<li class="co-t"><span class="co-i">{i + 1:02d}</span><img src="../assets/shop/{img}.webp" alt="" loading="lazy" width="400" height="400"><b>{n}</b><span>{d}</span></li>' for i, (n, img, d) in enumerate(COOP))
    return f'''<section class="sec" id="process">{sec_t(title, 'Один подрядчик от первого звонка до сервиса — без стыков между бригадами.')}
  <ol class="coop"><li class="co-t co-d grain"><p>Берём объект целиком: от консультации и замера до пусконаладки, акта и обслуживания.</p></li>{t}
    <li class="co-t co-r"><a href="#req" data-req data-title="Записаться на замер"><img src="../assets/photos/alpinist-outdoor-unit-sm.webp" alt="" loading="lazy"><b>Записаться на замер {UR}</b></a></li></ol></section>'''

def faq(items, fid='faq'):
    return f'''<section class="sec" id="{fid}">{sec_t('Вопросы')}<div class="grid"><div class="fq c1-12">''' + ''.join(f'<details><summary><b>{q}</b><i aria-hidden="true"></i></summary><p>{a}</p></details>' for q, a in items) + '</div></div></section>'

def lead(title, sub, fid, kind='lead'):
    return f'''<section class="sec" id="req"><div class="ld grain">
  <div class="ld-l"><h2>{title}</h2><p>{sub}</p></div>
  <form class="ld-f" data-lead="{kind}" novalidate>
    <div class="field"><label class="mono" for="{fid}N">Имя</label><input id="{fid}N" name="name" autocomplete="name" required></div>
    <div class="field"><label class="mono" for="{fid}P">Телефон</label><input id="{fid}P" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"></div>
    {pd(fid + 'Pd')}<div class="err" role="alert"></div>
    <div class="ld-a"><button class="btn ld-btn" type="submit">Перезвоните мне <i>↗</i></button><a class="mono" href="{WA}" target="_blank" rel="noopener">WhatsApp ↗</a><a class="mono" href="tel:{TEL}">{TEL_H}</a></div>
  </form></div></section>'''

SERVICES = phx('Услуги', 'Цена фиксируется в смете до начала работ и не растёт на месте. Выезд и замер — бесплатно.', 4, ((None, 'Услуги'),),
  extra='<nav class="phx-tabs" aria-label="Направления"><a href="#ac">Кондиционеры</a><a href="#vent">Вентиляция</a><a href="#el">Электрика</a><a href="#service">Сервис</a></nav>') \
  + dirs() + ticker(('монтаж', 'вентиляция', 'электрика', 'сервис')) + coop() + faq(b.FAQ) + lead('Посчитаем монтаж под ваш объект', 'Пришлите фото места установки в WhatsApp или оставьте телефон — назовём цену и запишем на бесплатный замер.', 'sv')

# ---------------------------------------------------------------- business (black theme)
STATS = '''<section class="sec"><div class="ab grain">
  <div class="ab-l"><p class="ab-h">Climate Solutions — климат, вентиляция и электромонтаж для офисов, магазинов, общепита и сетей. По договору, со сметой по разделам и закрывающими документами.</p>
    <div class="ab-n"><div><b class="box">{a}</b><span>{at}</span></div><div><b>{b_}</b><span>{bt}</span></div></div></div>
  <div class="ab-r"><p>{txt}</p><a class="pill" href="{href}">{AR} {link}</a></div>
</div></section>'''
IND = [('retail', 'Ритейл и сети', 'Залы, склады и витрины: климат, вытяжка, свет. Монтаж ночью, тиражное решение для всех точек.'), ('food', 'Общепит', 'Кухонная вытяжка и приток, электрика под тепловое оборудование, паспорт системы.'),
       ('office', 'Офисы', 'Кондиционирование open space и переговорных, серверные, освещение и розеточные группы.'), ('storage', 'Склады и производство', 'Вентиляция и освещение пролётов, силовые линии, щиты и учёт.'),
       ('bank', 'Банки и отделения', 'Типовые решения по стандарту сети, работы вне часов приёма, регламентное ТО.'), ('med', 'Медицина и образование', 'Воздухообмен по нормам, документация для проверок, работа в каникулы.')]
PAINS = [('Монтаж остановит торговлю или офис', 'Работаем ночью и в выходные', 'График согласуем с управляющим объекта — к открытию зал чистый.'), ('Сорвём дату открытия', 'Срок и неустойка в договоре', 'График по этапам с ответственными, еженедельный отчёт с фото.'),
         ('Смета вырастет по ходу работ', 'Фиксированная смета по разделам', 'Дополнительные работы — только по письменному согласованию.'), ('Нет документов для бухгалтерии', 'Полный пакет документов', 'Договор, КС-2, КС-3, исполнительная схема, протоколы замеров.'),
         ('Три подрядчика — никто не отвечает за стыки', 'Один подрядчик на три системы', 'Климат, вентиляция и электрика в одном договоре и одной смете.'), ('Летом встал кондиционер в зале', 'Регламентное ТО и аварийный выезд', 'Обслуживание по графику, выезд по аварии в течение 4 часов.')]
BFAQ = [('Можно работать по нашему ТЗ и проекту?', 'Да. Проверим проект, предложим замечания до старта и зафиксируем объём в спецификации.'), ('Как быстро приедете по аварии?', 'В течение 4 часов в рабочее время по договору обслуживания, в остальное — по графику дежурств.'),
        ('Работаете в нескольких городах?', 'Челябинск, Екатеринбург и области. Для сетей — выезд на точки по согласованному графику.'), ('Передаёте исполнительную документацию?', 'Да: исполнительные схемы, акты, протоколы замеров и паспорта систем — в день сдачи.'),
        ('Можно договор только на обслуживание?', 'Да. Обследуем установленные системы, составим регламент и журнал работ.')]
def geo(title='География работ'):
    rows = [('Челябинск', 'ул. 5 Декабря, 32 · офис', 'oid=89687502787&z=12'), ('Челябинская область', 'выезд по графику', 'll=61.40,55.16&z=7'), ('Екатеринбург', 'объекты по договору', 'll=60.60,56.84&z=11')]
    li = ''.join(f'<li><button type="button" class="geo-r" aria-pressed="{str(not i).lower()}" data-map="https://yandex.ru/map-widget/v1/?{q}"><b>{c}</b><span>{a}</span>{UR}</button></li>' for i, (c, a, q) in enumerate(rows))
    return f'''<section class="sec" id="geo"><div class="geo">
  <div class="geo-l"><h2>{title}</h2><p>Кондиционеры и вентиляцию ставим в Челябинске и области, коммерческие объекты ведём и в Екатеринбурге.</p><ul class="geo-list">{li}</ul></div>
  <div class="geo-m"><iframe title="Climate Solutions на карте" src="https://yandex.ru/map-widget/v1/?oid=89687502787&amp;z=12" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></section>'''

BUSINESS = phx('Бизнесу', 'Климат, вентиляция и электромонтаж без остановки работы: смета по разделам, монтаж ночью, полный пакет документов.', None, ((None, 'Бизнесу'),),
  extra=f'<div class="phx-cta"><a class="btn phx-btn" href="#kp">Запросить КП <i>↗</i></a><a class="btn btn-soft" href="tel:{TEL}">{TEL_H}</a></div>') \
  + STATS.format(a='2 дня', at='КП по вашему ТЗ', b_='4 часа', bt='аварийный выезд по договору', txt='Обследуем объект, считаем по разделам и согласуем график под режим работы — ночью, в выходные, по этапам. После сдачи — регламентное ТО и журнал работ.', href='#terms', link='Условия договора', AR=AR) \
  + f'''<section class="sec">{sec_t('Отрасли', 'Знаем требования и режим работы каждой — от торгового зала до пищеблока.')}
  <div class="igrid">{''.join(f'<article class="ig"><img src="../assets/ill/v10/ind-{i}.webp" alt="" loading="lazy"><b>{t}</b><p>{d}</p></article>' for i, t, d in IND)}</div></section>''' \
  + f'''<section class="sec">{sec_t('Что мешает бизнесу', 'Типичные риски монтажа на работающем объекте — и как мы снимаем их договором.')}
  <ol class="pn2">{''.join(f'<li><span class="mono">{i + 1:02d}</span><s>{a}</s><b>{c}</b><p>{d}</p></li>' for i, (a, c, d) in enumerate(PAINS))}</ol></section>''' \
  + ticker(('офисы', 'магазины', 'общепит', 'склады', 'сети')) \
  + f'''<section class="sec" id="terms">{sec_t('Условия договора', 'Всё, что обсуждают юристы и бухгалтерия, — заранее и письменно.')}
  <dl class="tg">{''.join(f'<div><dt class="mono">{a}</dt><dd>{c}</dd></div>' for a, c in [('сроки', 'Фиксируем по этапам в договоре, неустойка за просрочку — с нашей стороны.'), ('цена', 'Смета по разделам: климат, вентиляция, электрика. Не меняется без допсоглашения.'), ('оплата', 'Безналичный расчёт, поэтапно: аванс на материалы, остаток — по актам.'), ('документы', 'Договор, спецификация, КС-2, КС-3, исполнительная схема, протоколы замеров.'), ('гарантия', '3 года на работы, гарантия производителя на оборудование.'), ('сервис', 'Регламентное ТО по графику, аварийный выезд в течение 4 часов.')])}</dl></section>''' \
  + geo() + faq(BFAQ) + f'''<section class="sec" id="kp"><div class="ld grain">
  <div class="ld-l"><h2>КП по вашему ТЗ за 2 дня</h2><p>Опишите объект и задачу — инженер свяжется в течение рабочего дня. ТЗ можно прислать в WhatsApp.</p></div>
  <form class="ld-f" data-lead="kp" novalidate>
    <div class="field"><label class="mono" for="kCo">Компания</label><input id="kCo" name="company" autocomplete="organization"></div>
    <div class="field"><label class="mono" for="kP">Телефон</label><input id="kP" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"></div>
    <div class="field"><label class="mono" for="kT">Объект и задача</label><input id="kT" placeholder="Город, площадь, что нужно и к какому сроку"></div>
    {pd('kPd')}<div class="err" role="alert"></div>
    <div class="ld-a"><button class="btn ld-btn" type="submit">Отправить запрос <i>↗</i></button><a class="mono" href="{WA}" target="_blank" rel="noopener">WhatsApp ↗</a></div>
  </form></div></section>'''

# ---------------------------------------------------------------- about
GUAR = [('Гарантия — 3 года', 'На все работы. Если что-то не так — приедем и устраним бесплатно.', 'договор'), ('Дата монтажа — в договоре', 'Фиксируем день заранее и приезжаем вовремя.', 'договор'), ('Цена не растёт', 'Смета согласована до начала работ и не меняется на месте.', 'смета'),
        ('Марка и модель — прямо', 'Проверенные производители, всё названо в смете.', 'смета'), ('Автоматы и УЗО', 'Защита и заземление в каждом электрощите.', 'проект'), ('Инструктаж при сдаче', 'Показываем управление и уход за системой.', 'акт')]
WORKS = [('alpinist-outdoor-unit', 'Наружный блок без автовышки', 'Челябинск · 9-й этаж'), ('alpinist-drilling-winter', 'Трасса по фасаду зимой', 'Екатеринбург · −15 °C'), ('store-ducts-1', 'Вентиляция и трассы зала', 'Екатеринбург · магазин'),
         ('split-wallpaper', 'Сплит 2,5 кВт, трасса в коробе', 'Челябинск · 3 часа'), ('bathroom-fan', 'Вытяжка в санузле', 'Челябинск · скрытая проводка'), ('garage-ceiling', 'Свет в потолке-грильято', 'Сосновка · линии и автоматы')]
def team():
    return '<section class="sec" id="team">' + sec_t('Команда', 'Один ответственный на весь объект и инженеры по каждому направлению.') + '<div class="tm3">' + ''.join(
        f'<article class="tm3-c"><div class="tm3-ph"><img src="../assets/team/{i}.webp" alt="{n}" width="1000" height="914" loading="lazy"></div><span class="mono">{r}</span><b>{n}</b><p>{d}</p></article>' for i, r, n, d in b.TEAM) + '</div></section>'
def reviews():
    return '<section class="sec" id="reviews">' + sec_t('Отзывы', 'Тексты с Яндекс Карт — как у авторов.', f'<a class="rate" href="{b.YM}" target="_blank" rel="noopener"><b>4,3</b><span>5 отзывов<br>на Яндекс Картах ↗</span></a>') + '<div class="rv3">' + ''.join(
        f'<blockquote class="rv3-c"><p>«{t}»</p><footer><b>{w}</b><span>Яндекс Карты · {d}</span><a href="{b.YM}?reviews%5BpublicId%5D={i}&amp;utm_source=review" target="_blank" rel="noopener">оригинал ↗</a></footer></blockquote>' for d, w, t, i in b.REVIEWS) + '</div></section>'
ABOUT = phx('О компании', 'Продаём и монтируем кондиционеры, проектируем вентиляцию и делаем электрику — для квартир, домов и бизнеса в Челябинске, Екатеринбурге и области.', None, ((None, 'О компании'),)) \
  + STATS.format(a='8+', at='лет монтируем климат и электрику', b_='1 200+', bt='объектов сдано по акту', txt='Подбираем технику под площадь и задачу, продаём со склада и под заказ, монтируем своими бригадами и обслуживаем по договору. Смета фиксируется до начала работ.', href='catalog.html', link='Перейти в каталог', AR=AR).replace('для офисов, магазинов, общепита и сетей. По договору, со сметой по разделам и закрывающими документами.', 'для квартир, домов и бизнеса — от подбора техники до сервиса.') \
  + team() + ticker() \
  + f'''<section class="sec" id="guarantee">{sec_t('Гарантии', 'Мы не обещаем «качество и профессионализм» — каждое условие записано в документ.')}
  <dl class="tg">{''.join(f'<div><dt class="mono">{c}</dt><dd><b>{a}</b>{d}</dd></div>' for a, d, c in GUAR)}</dl></section>''' \
  + f'''<section class="sec" id="works">{sec_t('Объекты', 'Фото с наших объектов: квартиры, дома, офисы и магазины.')}
  <div class="wk6">{''.join(f'<figure><img src="../assets/photos/{i}-sm.webp" alt="{t}" loading="lazy"><figcaption><b>{t}</b><span>{c}</span></figcaption></figure>' for i, t, c in WORKS)}</div></section>''' \
  + reviews() + f'''<section class="sec">{sec_t('Реквизиты')}<div class="grid"><dl class="req c1-8"><dt class="mono">наименование</dt><dd>ИП <span class="hl">[ФИО]</span></dd><dt class="mono">ИНН / ОГРНИП</dt><dd><span class="hl">[ИНН]</span> / <span class="hl">[ОГРНИП]</span></dd><dt class="mono">адрес</dt><dd>{ADDR}</dd><dt class="mono">телефон</dt><dd><a href="tel:{TEL}">{TEL_H}</a></dd></dl></div></section>'''

CONTACTS = phx('Контакты', 'Челябинск и область, по договору — по всей России. Звоните, пишите в мессенджер или приезжайте в офис.', None, ((None, 'Контакты'),),
  extra=f'<div class="phx-cta"><a class="phx-tel" href="tel:{TEL}">{TEL_H}</a></div>') \
  + f'''<section class="sec"><div class="grid"><dl class="req c1-8"><dt class="mono">второй номер</dt><dd><a href="tel:+79000800838">+7 (900) 080-08-38</a></dd><dt class="mono">адрес</dt><dd>{ADDR}</dd><dt class="mono">мессенджеры</dt><dd class="req-l"><a href="{WA}" target="_blank" rel="noopener">WhatsApp ↗</a><a href="{TG}" target="_blank" rel="noopener">Telegram ↗</a><a href="{VK}" target="_blank" rel="noopener">ВКонтакте ↗</a></dd><dt class="mono">для компаний</dt><dd>Реквизиты, допуски и образец договора отправим вместе с КП.</dd></dl></div></section>''' \
  + geo('Где мы работаем') + lead('Напишите нам', 'Ответим в течение 15 минут в рабочее время — про кондиционеры, вентиляцию, электрику и заказы из каталога.', 'ct')

NOTFOUND = f'''<section class="nf"><div class="nf-f grain"><img src="../assets/shop/outdoor.webp" alt="" class="nf-img"><b class="nf-n">404</b>
  <p>Такой страницы нет — возможно, она переехала. Кондиционеры на месте.</p><div class="phx-cta"><a class="nf-go" href="index.html">На главную</a><a class="btn btn-soft" href="catalog.html">В каталог <i>↗</i></a></div></div></section>'''

PAGES = {
  'catalog.html':  ('catalog', 'Каталог кондиционеров с установкой — Climate Solutions', 'Сплит-системы, мульти-сплит, кассетные, канальные и мобильные кондиционеры с монтажом в Челябинске.', CATALOG, 'home', False, 'catalog.html'),
  'product.html':  ('product', 'Кондиционер — Climate Solutions', 'Кондиционер с монтажом под ключ в Челябинске.', PRODUCT, 'home', True, 'catalog.html'),
  'cart.html':     ('cart', 'Корзина — Climate Solutions', 'Корзина и оформление заказа.', CART, 'home', False, None),
  'services.html': ('services', 'Монтаж, вентиляция и электрика — цены · Climate Solutions', 'Цены на монтаж кондиционеров, вентиляцию, электромонтаж и сервис в Челябинске.', SERVICES, 'home', False, 'services.html'),
  'business.html': ('business', 'Климат и электрика для бизнеса — Climate Solutions', 'Кондиционирование, вентиляция и электромонтаж для офисов, магазинов, общепита и сетей. КП за 2 дня.', BUSINESS, 'biz', False, 'business.html'),
  'about.html':    ('about', 'О компании — Climate Solutions', 'Команда, гарантии, объекты, отзывы и реквизиты Climate Solutions.', ABOUT, 'home', False, 'about.html'),
  'contacts.html': ('contacts', 'Контакты — Climate Solutions', f'{ADDR}, {TEL_H}.', CONTACTS, 'home', False, 'contacts.html'),
  '404.html':      ('nf', 'Страница не найдена — Climate Solutions', 'Страница не найдена.', NOTFOUND, 'home', False, None),
}
if __name__ == '__main__':
    home = TPL.replace('<!--V12SHOWCASE-->', SHOWCASE, 1)
    tail = '<script src="products.js"></script>\n<script src="chrome.js"></script>\n<script src="shop.js"></script>\n'
    home = home.replace('</html>\n' + tail, tail.replace('<script src="chrome.js"></script>\n', '') + '</html>\n') if home.endswith(tail) else home
    home = home.replace('<body', '<body data-page="home"', 1)
    open(os.path.join(OUT, 'index.html'), 'w').write(home)
    for fn, (k, t, d, body, aud, three, cur) in PAGES.items():
        open(os.path.join(OUT, fn), 'w').write(page(k, t, d, body, aud, three, cur))
    print('built', len(PAGES) + 1, 'pages')
