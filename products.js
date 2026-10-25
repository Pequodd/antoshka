/* v10 catalog — demo assortment: real brands and series, prices and specs are indicative until the price list arrives.
   img: a picture rendered from the product's own 3D model (tools/model-render.html → assets/shop/p/<id>.webp). */
window.CS_INSTALL = 14900; // wall split, turnkey, line up to 3 m
window.CS_TYPES = {
  wall: 'Настенная сплит-система',
  multi: 'Мульти-сплит',
  cassette: 'Кассетный',
  ducted: 'Канальный',
  floor: 'Напольно-потолочный',
  mobile: 'Мобильный',
};
window.CS_PRODUCTS = [
  { id: 'ballu-olympio-07', brand: 'Ballu', name: 'Olympio Edge 07', type: 'wall', area: 20, kw: 2.1, inverter: false, wifi: false, db: 24, cls: 'A', price: 21990, img: 'p/ballu-olympio-07', pop: 9, tags: ['Хит'] },
  { id: 'royal-clima-gloria-09', brand: 'Royal Clima', name: 'Gloria Inverter 09', type: 'wall', area: 28, kw: 2.8, inverter: true, wifi: false, db: 22, cls: 'A++', price: 34990, img: 'p/royal-clima-gloria-09', pop: 8 },
  { id: 'haier-coral-09', brand: 'Haier', name: 'Coral DC Inverter 09', type: 'wall', area: 25, kw: 2.6, inverter: true, wifi: true, db: 21, cls: 'A++', price: 39990, img: 'p/haier-coral-09', pop: 10, tags: ['Хит'] },
  { id: 'hisense-expert-12', brand: 'Hisense', name: 'Expert Pro DC 12', type: 'wall', area: 35, kw: 3.5, inverter: true, wifi: true, db: 23, cls: 'A++', price: 46990, img: 'p/hisense-expert-12', pop: 7 },
  { id: 'midea-breezeless-09', brand: 'Midea', name: 'Breezeless+ 09', type: 'wall', area: 25, kw: 2.6, inverter: true, wifi: true, db: 19, cls: 'A+++', price: 59990, img: 'p/midea-breezeless-09', pop: 6, tags: ['Новинка'] },
  { id: 'lg-artcool-09', brand: 'LG', name: 'ARTCOOL Mirror 09', type: 'wall', area: 25, kw: 2.5, inverter: true, wifi: true, db: 19, cls: 'A++', price: 74990, img: 'p/lg-artcool-09', pop: 6 },
  { id: 'haier-flexis-12', brand: 'Haier', name: 'Flexis Super Match 12 Black', type: 'wall', area: 35, kw: 3.5, inverter: true, wifi: true, db: 20, cls: 'A+++', price: 79990, img: 'p/haier-flexis-12', pop: 7, tags: ['Дизайн'] },
  { id: 'electrolux-fusion-18', brand: 'Electrolux', name: 'Fusion Ultra 18', type: 'wall', area: 50, kw: 5.3, inverter: true, wifi: false, db: 28, cls: 'A++', price: 62990, img: 'p/electrolux-fusion-18', pop: 5 },
  { id: 'mitsubishi-ln-25', brand: 'Mitsubishi Electric', name: 'MSZ-LN 25 Premium', type: 'wall', area: 25, kw: 2.5, inverter: true, wifi: true, db: 19, cls: 'A+++', price: 129990, img: 'p/mitsubishi-ln-25', pop: 5, tags: ['Премиум'] },
  { id: 'daikin-perfera-35', brand: 'Daikin', name: 'Perfera 35', type: 'wall', area: 35, kw: 3.5, inverter: true, wifi: true, db: 20, cls: 'A+++', price: 119990, img: 'p/daikin-perfera-35', pop: 6 },
  { id: 'ballu-igreen-24', brand: 'Ballu', name: 'iGreen Pro 24', type: 'wall', area: 70, kw: 7.0, inverter: false, wifi: false, db: 33, cls: 'A', price: 69990, img: 'p/ballu-igreen-24', pop: 4 },
  { id: 'haier-multi-2', brand: 'Haier', name: 'Мульти-сплит на 2 комнаты, 4,0 кВт', type: 'multi', area: 50, kw: 4.0, inverter: true, wifi: true, db: 22, cls: 'A++', price: 89990, img: 'p/haier-multi-2', pop: 6, install: null },
  { id: 'royal-clima-cassette-36', brand: 'Royal Clima', name: 'Кассетный 36, 10,5 кВт', type: 'cassette', area: 100, kw: 10.5, inverter: true, wifi: false, db: 38, cls: 'A', price: 159990, img: 'p/royal-clima-cassette-36', pop: 5, install: null },
  { id: 'midea-ducted-24', brand: 'Midea', name: 'Канальный 24, 7,0 кВт', type: 'ducted', area: 70, kw: 7.0, inverter: true, wifi: false, db: 30, cls: 'A', price: 119990, img: 'p/midea-ducted-24', pop: 4, install: null },
  { id: 'ballu-floor-18', brand: 'Ballu', name: 'Напольно-потолочный 18, 5,3 кВт', type: 'floor', area: 50, kw: 5.3, inverter: false, wifi: false, db: 36, cls: 'A', price: 99990, img: 'p/ballu-floor-18', pop: 3, install: null },
  { id: 'ballu-mobile-09', brand: 'Ballu', name: 'Smart Electronic, мобильный 09', type: 'mobile', area: 25, kw: 2.6, inverter: false, wifi: false, db: 48, cls: 'A', price: 29990, img: 'p/ballu-mobile-09', pop: 5, install: 0 },
];
