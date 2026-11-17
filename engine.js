/* ERAS: Simulador do Mundo — motor de simulação (sem DOM). Jogo original. */
(function (root) {
'use strict';
const NEU = 0, REB = 1;
const TER = {
  pla: { n: 'Planície', def: 1, gr: 1.15, eco: 1.1, mv: 1, c: [150, 190, 105] },
  flo: { n: 'Floresta', def: 1.2, gr: .95, eco: .95, mv: 1.3, c: [70, 130, 75] },
  hil: { n: 'Colinas', def: 1.3, gr: .9, eco: 1, mv: 1.4, c: [165, 150, 95] },
  mou: { n: 'Montanhas', def: 1.65, gr: .6, eco: .8, mv: 2, c: [130, 120, 115] },
  des: { n: 'Deserto', def: 1.05, gr: .5, eco: .75, mv: 1.5, c: [225, 200, 130] },
  tun: { n: 'Tundra', def: 1.15, gr: .55, eco: .7, mv: 1.5, c: [205, 215, 220] }
};
const IDEO = {
  mon: { n: 'Monarquia', atk: 1, eco: 1, res: 1, st: .04, up: 1, agg: .6, dip: .6, build: .6 },
  rep: { n: 'República', atk: .95, eco: 1.12, res: 1.12, st: .02, up: 1.05, agg: .35, dip: .9, build: .9 },
  com: { n: 'Comunismo', atk: 1.05, eco: .95, res: 1.05, st: .03, up: .85, agg: .7, dip: .4, build: .8 },
  fas: { n: 'Fascismo', atk: 1.18, eco: .98, res: .92, st: .01, up: .95, agg: 1, dip: .25, build: .45 },
  tri: { n: 'Tribalismo', atk: 1.05, eco: .75, res: .65, st: .05, up: .7, agg: .7, dip: .4, build: .25 },
  hor: { n: 'Horda', atk: 1.25, eco: .6, res: .55, st: -.02, up: .75, agg: 1, dip: .15, build: .1 },
  cid: { n: 'Cidade-Estado', atk: .9, eco: 1.25, res: 1.15, st: .05, up: 1.2, agg: .2, dip: 1, build: 1 },
  teo: { n: 'Teocracia', atk: 1.04, eco: .92, res: .85, st: .08, up: .95, agg: .55, dip: .55, build: .55 },
  dit: { n: 'Ditadura', atk: 1.12, eco: .97, res: .92, st: .03, up: .9, agg: .85, dip: .3, build: .5 },
  ari: { n: 'Aristocracia', atk: 1.02, eco: 1.08, res: 1, st: .05, up: 1, agg: .5, dip: .7, build: .7 },
  ana: { n: 'Anarquia', atk: .7, eco: .55, res: .5, st: -.2, up: 1, agg: .1, dip: .1, build: .05 }
};
const RELIG_R = [['Catolicismo', [232, 196, 64]], ['Protestantismo', [72, 120, 214]], ['Ortodoxia', [150, 84, 184]], ['Islã', [42, 150, 84]], ['Hinduísmo', [240, 124, 40]], ['Budismo', [204, 70, 70]], ['Judaísmo', [84, 196, 226]], ['Sem religião', [150, 152, 160]], ['Religiões tradicionais', [140, 100, 62]], ['Paganismo', [178, 112, 162]], ['Zoroastrismo', [245, 226, 142]]];
const REL_SET = (s, v) => s.split(' ').forEach(a => REL_A3[a] = v), REL_A3 = {};
REL_SET('MAR DZA TUN LBY EGY SDN MRT MLI NER TCD SEN GMB GIN SLE SOM DJI BFA NGA TUR SYR IRQ IRN SAU YEM OMN ARE QAT BHR KWT JOR PSX PSE AFG PAK BGD MDV IDN MYS BRN AZE KAZ UZB TKM KGZ TJK ALB KOS XKX BIH LBN COM SOL SAH ESH CYN', 3);
REL_SET('RUS UKR BLR SRB GRC ROU BGR MKD MNE GEO ARM MDA CYP ETH ERI', 2);
REL_SET('USA GBR NOR SWE DNK FIN ISL LVA DEU NLD CHE AUS NZL CAN ZAF NAM BWA ZWE ZMB MWI KEN UGA GHA LBR PNG FJI SLB VUT WSM TON JAM BHS BRB TTO GRL FRO BMU FLK SHN', 1);
REL_SET('IND NPL MUS', 4); REL_SET('THA MMR KHM LKA BTN MNG LAO JPN VNM SGP TWN MAC HKG', 5); REL_SET('CHN PRK CZE EST KOR', 7); REL_SET('ISR', 6);
const SSA = new Set('AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COD COG CIV DJI GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR MDG MWI MLI MRT MOZ NAM NER NGA RWA STP SEN SYC SLE SOM SSD SDS ZAF SDN TZA TGO UGA ZMB ZWE SOL'.split(' ')), OCE = new Set('AUS NZL PNG FJI SLB VUT WSM TON NCL PYF KIR FSM MHL PLW NRU TUV'.split(' '));
function relFor(a3, y, americas, h) { let r = REL_A3[a3] != null ? REL_A3[a3] : 0; if (a3 === 'BRA' && y >= 1990 && h % 10 < 3) r = 1; if (r === 7 && y < 1950) r = a3 === 'CZE' ? 0 : a3 === 'EST' ? 1 : 5; if (r === 6 && y < 1948) r = 3; if (r === 1 && y < 1517) r = 0;
  if (americas && y <= 1520) r = 8; if (OCE.has(a3) && y < 1800) r = 8; if (SSA.has(a3) && r !== 3 && a3 !== 'ETH' && a3 !== 'ERI' && (y < 1950 && a3 !== 'ZAF' && a3 !== 'LBR' || y < 1800)) r = 8;
  if (y < 630 && r === 3) r = a3 === 'IRN' || a3 === 'IRQ' || a3 === 'AFG' ? 10 : 9; if (y < 380 && r <= 2) r = 9; if (y < 500 && (a3 === 'CHN' || a3 === 'JPN' || a3 === 'KOR' || a3 === 'PRK')) r = 8; return r; }
let relReal = false; function setRelig(real) { real = !!real; if (real === relReal && RELIG.length) return; relReal = real; RELIG.length = 0; (real ? RELIG_R : RELIG_F).forEach(x => RELIG.push(x)); }
const RELIG = [['Banana Sagrada', [240, 200, 40]], ['Igreja do Cartola', [60, 90, 200]], ['Culto do Mar', [40, 170, 190]], ['Fé do Sol', [230, 120, 40]], ['Caminho Antigo', [120, 70, 160]]];
const RELIG_F = RELIG.map(x => x.slice());
const AGES = [[1, 'Era Feudal'], [5, 'Renascença'], [10, 'Era da Pólvora'], [16, 'Era Industrial'], [24, 'Era Atômica'], [34, 'Era Digital'], [46, 'Era Estelar']];
const BLD = {
  farm: { n: 'Fazenda', c: 90, t: 3, tech: 1, d: '+crescimento da população' },
  work: { n: 'Oficina', c: 140, t: 4, tech: 2, d: '+25% de produção' },
  lib: { n: 'Biblioteca', c: 130, t: 4, tech: 2, d: '+pesquisa e desenvolvimento' },
  fort: { n: 'Fortaleza', c: 170, t: 5, tech: 1, d: '+35% de defesa' },
  tower: { n: 'Torre de Vigia', c: 60, t: 2, tech: 1, d: '+10% de defesa, revela ameaças' },
  arm: { n: 'Arsenal', c: 150, t: 4, tech: 3, d: 'recrutamento 25% mais barato' },
  port: { n: 'Porto', c: 120, t: 4, tech: 2, d: 'movimento marítimo e comércio' },
  sup: { n: 'Depósito', c: 80, t: 3, tech: 2, d: 'reduz atrito e doenças' }
};
const WONDERS = [['Grande Biblioteca', 'res', .15, 3], ['Colosso Dourado', 'eco', .12, 3], ['Muralha Infinita', 'def', .15, 5], ['Templo da Banana', 'st', .06, 4], ['Mercado Universal', 'eco', .18, 8], ['Observatório', 'res', .2, 10], ['Arena dos Campeões', 'atk', .1, 7], ['Torre Celeste', 'st', .08, 14]];
const SKILLS = { adm: 'Administração', eco: 'Economia', mil: 'Militar', prod: 'Produção', res: 'Pesquisa', tax: 'Tributação' };
const DIS = [["Peste Negra",0.00121,0.05077,0.6,14,[165,35,20],960,1820],
  ["Varíola",0.01906,0.00501,0.238,10,[99,215,178],-5000,5000],
  ["Sarampo",0.01559,0.00611,0.292,12,[198,194,22],-5000,5000],
  ["Tuberculose",0.01732,0.00545,0.167,14,[8,97,56],-5000,5000],
  ["Disenteria",0.01559,0.00237,0.49,11,[22,20,186],-5000,5000],
  ["Escorbuto",0.00087,0.0005,0.112,14,[190,85,199],-5000,5000],
  ["Peste Bubônica",0.00398,0.00549,0.419,12,[247,135,6],-5000,5000],
  ["Febre Amarela",0.01039,0.00171,0.131,10,[133,117,152],-5000,1900],
  ["Gripe",0.00866,0.0005,0.08,10,[95,110,82],-5000,5000],
  ["COVID-19",0.00935,0.00522,0.257,24,[210,25,25],2019,5000],
  ["Dengue",0.01802,0.00117,0.342,10,[230,120,30],2017,5000],
  ["Zika",0.0097,0.0005,0.27,10,[190,120,210],2017,5000],
  ["Chikungunya",0.01039,0.00051,0.288,10,[240,170,60],2017,5000],
  ["Febre Amarela",0.00624,0.00472,0.198,10,[235,215,40],2017,5000],
  ["Cólera",0.00762,0.00563,0.432,10,[70,170,200],2017,5000],
  ["Malária",0.00901,0.0034,0.162,12,[120,150,50],2017,5000],
  ["Ebola",0.00139,0.0345,0.324,10,[120,10,30],2017,5000],
  ["Hanseníase",0.00346,0.0005,0.09,16,[170,150,120],2017,5000],
  ["Raiva",0.00208,0.00195,0.08,9,[90,90,90],2017,5000],
  ["Doença de Chagas",0.00485,0.0014,0.09,16,[110,70,40],2017,5000],
  ["Meningite",0.00554,0.00448,0.234,9,[80,120,220],2017,5000],
  ["AIDS II",0.00416,0.1035,0.6,26,[10,0,20],2017,5000],
  ["HIV",0.00346,0.01138,0.252,20,[150,20,70],2017,5000],
  ["Sífilis",0.01109,0.0034,0.27,16,[180,60,110],2017,5000],
  ["Hepatite B",0.00693,0.00448,0.198,14,[200,170,30],2017,5000],
  ["HPV",0.01386,0.00093,0.324,16,[225,120,170],2017,5000],
  ["Gonorreia",0.01663,0.0005,0.396,10,[235,225,150],2017,5000],
  ["Clamídia",0.01732,0.0005,0.36,10,[150,200,120],2017,5000],
  ["Herpes",0.01524,0.0005,0.306,14,[245,110,110],2017,5000],
  ["Tricomoníase",0.01247,0.0005,0.288,9,[110,210,190],2017,5000],
  ["Cancro Mole",0.00485,0.0005,0.18,9,[140,90,130],2017,5000],
  ["Donovanose",0.00277,0.0005,0.126,12,[160,110,80],2017,5000],
  ["Chato",0.0194,0.0005,0.432,8,[120,100,60],2017,5000],
  ["Embucete",0.0097,0.00391,0.27,12,[205,60,150],2017,5000],
  ["Vaginismo",0.00901,0.00352,0.252,12,[150,50,190],2017,5000],
  ["Virose do Bonga",0.0027,0.003,0.5,4,[250,210,60],-5000,5000]];

function R(g) { g.s = (g.s + 0x6D2B79F5) | 0; let t = g.s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const ri = (g, a, b) => a + Math.floor(R(g) * (b - a + 1));
const pick = (g, a) => a[Math.floor(R(g) * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SUF = ['', 'k', 'mi', 'bi', 'tri', 'quatri', 'quint', 'sext'], fmt = n => { if (!isFinite(n)) return '0'; const a = Math.abs(n); if (a < 1e3) return Math.round(n) + ''; const i = Math.min(SUF.length - 1, Math.floor(Math.log10(a) / 3)), v = n / Math.pow(1e3, i); return (Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1)).toString().replace('.', ',') + SUF[i]; };
function shuffle(g, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R(g) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- MAPA PROCEDURAL ---------- */
function genMap(seed, nP) {
  const g = { s: seed | 0 }, MS = nP <= 420 ? 1 : Math.sqrt(nP / 300), W = Math.round(460 * MS), H = Math.round(280 * MS), N = W * H;
  const lat = 40, tbl = new Float32Array(lat * lat); for (let i = 0; i < tbl.length; i++) tbl[i] = R(g);
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v = (a, b) => tbl[((a % lat) + lat) % lat + (((b % lat) + lat) % lat) * lat];
    return (v(xi, yi) * (1 - sx) + v(xi + 1, yi) * sx) * (1 - sy) + (v(xi, yi + 1) * (1 - sx) + v(xi + 1, yi + 1) * sx) * sy;
  };
  const fbm = (x, y, o) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f); a *= .5; f *= 2; } return s; };
  const h = new Float32Array(N), cell = new Int16Array(N).fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W * 2 - 1, ny = y / H * 2 - 1, fall = Math.max(Math.abs(nx) ** 3, Math.abs(ny) ** 3);
    h[x + y * W] = fbm(x / (52 * MS) + 3, y / (52 * MS) + 7, 5) - fall * .34;
  }
  const sorted = Float32Array.from(h).sort(), sea = sorted[Math.floor(N * .52)];
  const land = []; for (let i = 0; i < N; i++) if (h[i] > sea) land.push(i);
  const seeds = []; let tries = 0, minD = 15;
  while (seeds.length < nP && tries < 40000) {
    tries++; if (tries % 4000 === 0) minD *= .86;
    const c = pick(g, land), x = c % W, y = (c / W) | 0;
    if (seeds.every(s => (s % W - x) ** 2 + (((s / W) | 0) - y) ** 2 > minD * minD)) seeds.push(c);
  }
  let q = []; seeds.forEach((c, i) => { cell[c] = i; q.push(c); });
  const dirs = [1, -1, W, -W];
  while (q.length) {
    const nq = []; shuffle(g, q);
    for (const c of q) for (const d of dirs) {
      const n = c + d; if (n < 0 || n >= N || (d === 1 && n % W === 0) || (d === -1 && c % W === 0)) continue;
      if (h[n] > sea && cell[n] < 0) { cell[n] = cell[c]; nq.push(n); }
    }
    q = nq;
  }
  const P = seeds.length, cx = new Float32Array(P), cy = new Float32Array(P), area = new Int32Array(P), hs = new Float32Array(P);
  const nb = Array.from({ length: P }, () => new Set()), coast = new Uint8Array(P);
  for (let i = 0; i < N; i++) {
    const c = cell[i]; if (c < 0) continue; const x = i % W, y = (i / W) | 0;
    cx[c] += x; cy[c] += y; area[c]++; hs[c] += h[i];
    for (const d of [1, W]) { const n = i + d; if (n >= N || (d === 1 && n % W === 0)) continue; const o = cell[n]; if (o >= 0 && o !== c) { nb[c].add(o); nb[o].add(c); } }
    for (const d of dirs) { const n = i + d; if (n >= 0 && n < N && cell[n] < 0) coast[c] = 1; }
  }
  const ter = [];
  for (let i = 0; i < P; i++) {
    cx[i] /= area[i]; cy[i] /= area[i]; hs[i] /= area[i];
    const l = Math.abs(cy[i] / H - .5) * 2, el = (hs[i] - sea) / (1 - sea), m = noise(cx[i] / (26 * MS) + 11, cy[i] / (26 * MS) + 19);
    ter.push(l > .82 ? 'tun' : el > .21 ? 'mou' : el > .13 ? 'hil' : (l < .4 && m < .42) ? 'des' : m > .55 ? 'flo' : 'pla');
  }
  const neigh = nb.map(s => [...s]), seaL = neigh.map(() => []);
  for (let a = 0; a < P; a++) if (coast[a]) for (let b = a + 1; b < P; b++) if (coast[b] && !nb[a].has(b) && (cx[a] - cx[b]) ** 2 + (cy[a] - cy[b]) ** 2 < (75 * Math.min(1.3, MS)) ** 2) { seaL[a].push(b); seaL[b].push(a); }
  return { W, H, cell, ter, neigh, sea: seaL, cx: [...cx], cy: [...cy], area: [...area], coast: [...coast], P };
}

/* ---------- ILHA DE BONGÁLIA (mapa vetorial gerado) ----------
   Ilha circular com um mar interno no meio cercado de terras férteis.
   Cada reino recebe uma fatia idêntica do litoral (o terreno e o recorte se repetem a cada fatia);
   entre o litoral e o centro ficam biomas variados, livres para colonizar. */
function genIsland(seed, nP, nC, Kc) {
  nC = Math.max(2, nC | 0); Kc = Math.max(3, Kc | 0);
  const g = { s: (seed | 0) ^ 0x2f6b1d }, GW = clamp(Math.round(760 * Math.sqrt(nP / 1200)), 520, 980), GH = GW, N = GW * GH, C0 = GW / 2, R0 = GW * .42, TAU = Math.PI * 2, w = TAU / nC, S = 6000 / GW;
  const lat = 64, tbl = new Float32Array(lat * lat); for (let i = 0; i < tbl.length; i++) tbl[i] = R(g);
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), v = (a, b) => tbl[((a % lat) + lat) % lat + (((b % lat) + lat) % lat) * lat]; return (v(xi, yi) * (1 - sx) + v(xi + 1, yi) * sx) * (1 - sy) + (v(xi, yi + 1) * (1 - sx) + v(xi + 1, yi + 1) * sx) * sy; };
  const fbm = (x, y, o) => { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f); n += a; a *= .5; f *= 2; } return s / n; };
  const rl = .25, Rlm = R0 * rl;
  /* recorte do litoral: depende so da posicao dentro da fatia (u espelhado), entao toda fatia e igual */
  const coastR = (u, r) => R0 * (1 + .05 * Math.cos(u * Math.PI) + .07 * (fbm(u * 2.4 + 5, 3.1, 3) - .5) + .022 * (fbm(u * 6 + 1, r / R0 * 4 + 2, 2) - .5));
  const lakeR = th => Rlm * (1 + .45 * (fbm(Math.cos(th) * 1.6 + 9, Math.sin(th) * 1.6 + 9, 4) - .5));
  const f = nC * Kc / nP, rb = Math.sqrt(R0 * R0 - Math.min(.8, f) * (R0 * R0 - Rlm * Rlm)), tc = (rb - Rlm) / (R0 - Rlm), rMid = (rb + R0) / 2;
  const lab = new Int32Array(N).fill(-1), PU = new Float32Array(N), PA = new Float32Array(N), PT = new Float32Array(N), PJ = new Int16Array(N);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = x + y * GW, dx = x + .5 - C0, dy = y + .5 - C0, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) + Math.PI, j = Math.min(nC - 1, Math.floor(th / w)), a = th / w - j, u = Math.abs(a - .5) * 2;
    const Rc = coastR(u, r), Rl = lakeR(th); if (r >= Rc || r <= Rl) continue;
    lab[i] = -2; PU[i] = u; PA[i] = a; PJ[i] = j; PT[i] = (r - Rl) / (Rc - Rl);
  }
  /* sementes do litoral: o mesmo conjunto em coordenadas locais, repetido em cada fatia */
  const bandW = R0 - rb, cs = []; let md = Math.sqrt(w * rMid * bandW / Kc) * .85, tries = 0;
  while (cs.length < Kc && tries < 60000) { tries++; if (tries % 3000 === 0) md *= .9; const a = .04 + R(g) * .92, s = tc + .1 * (1 - tc) + R(g) * (1 - tc) * .75, X = a * w * rMid, Y = (s - tc) / (1 - tc) * bandW;
    if (cs.every(q => [0, 1, -1].every(sh => ((q[0] + sh) * w * rMid - X) ** 2 + ((q[1] - tc) / (1 - tc) * bandW - Y) ** 2 > md * md))) cs.push([a, s]); }
  const nCo = nC * cs.length, KC = cs.length;
  /* sementes do interior */
  const inner = []; for (let i = 0; i < N; i++) if (lab[i] === -2 && PT[i] < tc) inner.push(i);
  const Ki = Math.max(nC, nP - nCo), area0 = inner.length, is = []; md = Math.sqrt(area0 / Ki) * .8; tries = 0;
  while (is.length < Ki && tries < 200000 && inner.length) { tries++; if (tries % 5000 === 0) md *= .9; const c = inner[Math.floor(R(g) * inner.length)], x = c % GW, y = (c / GW) | 0;
    if (PT[c] > tc - .02) continue; let ok = true; const B = is.bk || (is.bk = new Map()), bs = Math.max(4, md), kx = Math.floor(x / bs), ky = Math.floor(y / bs);
    for (let a = -1; a <= 1 && ok; a++) for (let b = -1; b <= 1 && ok; b++) for (const q of B.get((kx + a) + ',' + (ky + b)) || []) if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < md * md) { ok = false; break; }
    if (!ok) continue; is.push([x, y]); const key = kx + ',' + ky; (B.get(key) || B.set(key, []).get(key)).push([x, y]); }
  delete is.bk;
  const bsz = Math.max(6, Math.sqrt(area0 / Math.max(1, is.length)) * 1.2), bk = new Map(); is.forEach((q, k) => { const key = Math.floor(q[0] / bsz) + ',' + Math.floor(q[1] / bsz); (bk.get(key) || bk.set(key, []).get(key)).push(k); });
  /* atribuicao dos pixels: vizinho mais proximo com distorcao (fronteiras organicas) */
  for (let i = 0; i < N; i++) { if (lab[i] !== -2) continue; const x = i % GW, y = (i / GW) | 0;
    if (PT[i] >= tc) { const u = PU[i], s = PT[i], da = .05 * (fbm(u * 5 + 3, s * 5 + 1, 3) - .5), dt = .35 * (fbm(u * 5 + 8, s * 5 + 6, 3) - .5), X = (PA[i] + da) * w * rMid, Y = ((s - tc) / (1 - tc) + dt) * bandW; let best = 0, bv = 1e18;
      for (let sh = -1; sh <= 1; sh++) for (let k = 0; k < KC; k++) { const v = ((cs[k][0] + sh) * w * rMid - X) ** 2 + ((cs[k][1] - tc) / (1 - tc) * bandW - Y) ** 2; if (v < bv) { bv = v; best = ((PJ[i] + sh + nC) % nC) * KC + k; } } lab[i] = best; }
    else { const wx = x + 9 * (fbm(x / 40 + 1, y / 40 + 3, 3) - .5) * bsz / 6, wy = y + 9 * (fbm(x / 40 + 7, y / 40 + 2, 3) - .5) * bsz / 6, kx = Math.floor(wx / bsz), ky = Math.floor(wy / bsz); let best = -1, bv = 1e18;
      for (let r = 1; r <= 3 && best < 0; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) for (const k of bk.get((kx + a) + ',' + (ky + b)) || []) { const v = (is[k][0] - wx) ** 2 + (is[k][1] - wy) ** 2; if (v < bv) { bv = v; best = k; } }
      lab[i] = best < 0 ? -1 : nCo + best; } }
  /* compacta ids (sementes sem pixels somem) */
  const cnt = new Int32Array(nCo + is.length); for (let i = 0; i < N; i++) if (lab[i] >= 0) cnt[lab[i]]++;
  const remap = new Int32Array(cnt.length).fill(-1); let P = 0; for (let k = 0; k < cnt.length; k++) if (cnt[k] > 0) remap[k] = P++;
  const slot = []; for (let k = 0; k < cnt.length; k++) if (remap[k] >= 0) slot.push(k < nCo ? Math.floor(k / KC) : -1);
  for (let i = 0; i < N; i++) if (lab[i] >= 0) lab[i] = remap[lab[i]];
  /* corpos d'agua: oceano (borda) e lagos */
  const wb = new Int32Array(N).fill(-1); let nW = 0; for (let s0 = 0; s0 < N; s0++) { if (lab[s0] >= 0 || wb[s0] >= 0) continue; const id = nW++, st = [s0]; wb[s0] = id; while (st.length) { const c = st.pop(), x = c % GW; for (const n of [x > 0 ? c - 1 : -1, x < GW - 1 ? c + 1 : -1, c - GW, c + GW]) if (n >= 0 && n < N && lab[n] < 0 && wb[n] < 0) { wb[n] = id; st.push(n); } } }
  /* arestas entre pixels de rotulos diferentes */
  const VW = GW + 1, E0 = [], E1 = [], EA = [], EB = [], EW = [];
  const L = (x, y) => x < 0 || y < 0 || x >= GW || y >= GH ? -1 : lab[x + y * GW], Wb = (x, y) => x < 0 || y < 0 || x >= GW || y >= GH ? 0 : wb[x + y * GW];
  for (let y = 0; y < GH; y++) for (let x = 0; x <= GW; x++) { const a = L(x - 1, y), b = L(x, y); if (a === b || a < 0 && b < 0) continue; E0.push(x + y * VW); E1.push(x + (y + 1) * VW); EA.push(Math.min(a, b)); EB.push(Math.max(a, b)); EW.push(a < 0 ? Wb(x - 1, y) : b < 0 ? Wb(x, y) : -1); }
  for (let y = 0; y <= GH; y++) for (let x = 0; x < GW; x++) { const a = L(x, y - 1), b = L(x, y); if (a === b || a < 0 && b < 0) continue; E0.push(x + y * VW); E1.push(x + 1 + y * VW); EA.push(Math.min(a, b)); EB.push(Math.max(a, b)); EW.push(a < 0 ? Wb(x, y - 1) : b < 0 ? Wb(x, y) : -1); }
  const NE = E0.length, inc = new Map(); for (let e = 0; e < NE; e++) for (const v of [E0[e], E1[e]]) (inc.get(v) || inc.set(v, []).get(v)).push(e);
  const junc = v => { const l = inc.get(v); return l.length !== 2 || EA[l[0]] !== EA[l[1]] || EB[l[0]] !== EB[l[1]]; };
  const used = new Uint8Array(NE), arcs = [];
  const walk = (v0, e0) => { const pts = [v0]; let v = v0, e = e0; for (;;) { used[e] = 1; v = E0[e] === v ? E1[e] : E0[e]; pts.push(v); if (v === v0 || junc(v)) break; const nx = inc.get(v).find(q => !used[q]); if (nx == null) break; e = nx; } arcs.push({ pts, a: EA[e0], b: EB[e0], w: EW[e0] }); };
  for (const [v, l] of inc) if (junc(v)) for (const e of l) if (!used[e]) walk(v, e);
  for (let e = 0; e < NE; e++) if (!used[e]) walk(E0[e], e);
  /* suaviza (Chaikin com pontas fixas) e simplifica */
  const sm = (pts, closed) => { let q = pts.map(v => [v % VW, Math.floor(v / VW)]); if (q.length > 4) { const st = q.length > 12 ? 3 : 2, o = [q[0]]; for (let i = st; i < q.length - 1; i += st) o.push(q[i]); o.push(q[q.length - 1]); q = o; } for (let it = 0; it < 3; it++) { const o = [q[0]]; for (let i = 0; i < q.length - 1; i++) { const A = q[i], B = q[i + 1]; o.push([A[0] * .75 + B[0] * .25, A[1] * .75 + B[1] * .25], [A[0] * .25 + B[0] * .75, A[1] * .25 + B[1] * .75]); } o.push(q[q.length - 1]); q = o; }
    const keep = new Uint8Array(q.length); keep[0] = keep[q.length - 1] = 1; const rdp = (i0, i1) => { let mx = 0, mi = -1; const [x0, y0] = q[i0], [x1, y1] = q[i1], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1; for (let i = i0 + 1; i < i1; i++) { const d = Math.abs((q[i][0] - x0) * dy - (q[i][1] - y0) * dx) / l; if (d > mx) { mx = d; mi = i; } } if (mx > .35 && mi > 0) { keep[mi] = 1; rdp(i0, mi); rdp(mi, i1); } };
    if (closed && q.length > 3) { const m = q.length >> 1; keep[m] = 1; rdp(0, m); rdp(m, q.length - 1); } else rdp(0, q.length - 1); return q.filter((_, i) => keep[i]).map(([x, y]) => [Math.round(x * S), Math.round(y * S)]); };
  const enc = []; arcs.forEach(A => { const q = sm(A.pts, A.pts[0] === A.pts[A.pts.length - 1]), o = []; let px = 0, py = 0; for (const [x, y] of q) { o.push(x - px, y - py); px = x; py = y; } enc.push(o.join(',')); A.v0 = A.pts[0]; A.v1 = A.pts[A.pts.length - 1]; });
  /* aneis de cada provincia */
  const byP = Array.from({ length: P }, () => []); arcs.forEach((A, i) => { if (A.a >= 0) byP[A.a].push(i); if (A.b >= 0) byP[A.b].push(i); });
  const rings = byP.map(list => { const at = new Map(), u2 = new Set(), loops = []; for (const i of list) for (const v of [arcs[i].v0, arcs[i].v1]) (at.get(v) || at.set(v, []).get(v)).push(i);
    for (const i0 of list) { if (u2.has(i0)) continue; u2.add(i0); const ring = [i0], st = arcs[i0].v0; let cur = arcs[i0].v1, guard = 0; while (cur !== st && guard++ < 5000) { const nx = (at.get(cur) || []).find(i => !u2.has(i)); if (nx == null) break; u2.add(nx); if (arcs[nx].v0 === cur) { ring.push(nx); cur = arcs[nx].v1; } else { ring.push(~nx); cur = arcs[nx].v0; } } loops.push(ring); }
    return [loops]; });
  /* dados das provincias */
  const sx = new Float64Array(P), sy = new Float64Array(P), ar = new Int32Array(P), st = new Float64Array(P), su = new Float64Array(P); for (let i = 0; i < N; i++) { const l = lab[i]; if (l < 0) continue; sx[l] += i % GW + .5; sy[l] += ((i / GW) | 0) + .5; ar[l]++; st[l] += PT[i]; su[l] += PU[i]; }
  const nb = Array.from({ length: P }, () => new Set()), coast = new Uint8Array(P), wOf = Array.from({ length: P }, () => new Set());
  for (const A of arcs) { if (A.a >= 0 && A.b >= 0) { nb[A.a].add(A.b); nb[A.b].add(A.a); } else { const p = A.a >= 0 ? A.a : A.b; coast[p] = 1; wOf[p].add(A.w); } }
  const ps = []; for (let i = 0; i < P; i++) { const x = sx[i] / ar[i], y = sy[i] / ar[i], t = st[i] / ar[i], u = su[i] / ar[i], sl = slot[i]; let ter, fert = 1;
    if (sl >= 0) { const v = fbm(u * 3 + 21, t * 4 + 13, 3), h = fbm(u * 4 + 31, t * 3 + 7, 3); ter = h > .64 ? 'hil' : v > .5 ? 'flo' : 'pla'; fert = 1.05; }
    else { const X = x / GW * 5, Y = y / GW * 5, ridge = 1 - Math.abs(fbm(X + 40, Y + 40, 4) * 2 - 1), moist = fbm(X * .8 + 60, Y * .8 + 10, 3), cold = fbm(X * .6 + 80, Y * .6 + 80, 3);
      ter = null; if (t < .22) fert = 1.6; (ps.bio || (ps.bio = [])).push([i, ridge, moist, cold, t < .22]); }
    ps.push({ n: '', r: '', c: sl, x: Math.round(x * S), y: Math.round(y * S), km: Math.round(ar[i] * S * S * 44), t: ter, co: coast[i], cs: [], fert, sl }); }
  { const B = ps.bio || [], q = (k, f) => { const v = B.map(b => b[k]).sort((a, b) => a - b); return v[Math.floor(f * (v.length - 1))] || 0; }, rM = q(1, .86), rH = q(1, .74), cT = q(3, .93), mD = q(2, .2), mF = q(2, .7), mFe = q(2, .45);
    for (const [i, ridge, moist, cold, fer] of B) ps[i].t = fer ? (moist > mFe ? 'flo' : 'pla') : ridge > rM ? 'mou' : ridge > rH ? 'hil' : cold > cT ? 'tun' : moist < mD ? 'des' : moist > mF ? 'flo' : 'pla'; delete ps.bio; }
  const neigh = nb.map(s => [...s]), sea = neigh.map(() => []);
  for (let a = 0; a < P; a++) { if (!coast[a]) continue; for (const wid of wOf[a]) { const lim = wid === 0 ? (R0 * .28) ** 2 : 1e18, c = []; for (let b = 0; b < P; b++) if (b !== a && coast[b] && wOf[b].has(wid) && !nb[a].has(b)) { const v = ((sx[a] / ar[a]) - (sx[b] / ar[b])) ** 2 + ((sy[a] / ar[a]) - (sy[b] / ar[b])) ** 2; if (v < lim) c.push([v, b]); } c.sort((x, y) => x[0] - y[0]); for (const [, b] of c.slice(0, wid === 0 ? 3 : 4)) { if (!sea[a].includes(b)) sea[a].push(b); if (!sea[b].includes(a)) sea[b].push(a); } } }
  /* capital de cada fatia: a provincia do litoral mais perto do centro da fatia */
  const slotCap = []; for (let j = 0; j < nC; j++) { let best = -1, bv = 1e18; for (let i = 0; i < P; i++) if (ps[i].sl === j) { const v = Math.abs(su[i] / ar[i]) + Math.abs(st[i] / ar[i] - (tc + 1) / 2); if (v < bv) { bv = v; best = i; } } slotCap.push(best); }
  const d = { W: GW * S, H: GH * S, arcs: enc.join(';'), rings, neigh, sea, p: ps, ilha: 1 }, avg = ps.reduce((s, p) => s + p.km, 0) / P;
  return { vec: 1, W: d.W, H: d.H, P, neigh, sea, cx: ps.map(p => p.x), cy: ps.map(p => p.y), area: ps.map(p => clamp(110 * Math.sqrt((p.km + 1) / avg), 66, 200)), coast: [...coast], ter: ps.map(p => p.t), data: d, ps, hist: [], histAt: {}, ilha: { nC, Kc: KC, slotCap }, view: [ (C0 - R0 * 1.12) * S, (C0 - R0 * 1.12) * S, (C0 + R0 * 1.12) * S, (C0 + R0 * 1.12) * S ] };
}

/* ---------- ESTADO ---------- */
const SYL = ['Tar', 'Vel', 'Mor', 'Kal', 'Ser', 'Lun', 'Dra', 'Fen', 'Or', 'Ast', 'Bri', 'Zan', 'Eri', 'Gal', 'Nor', 'Thal', 'Quin', 'Rho', 'Ix', 'Sol'];
const END = ['ândia', 'ória', 'ânia', 'íria', 'osa', 'ara', 'ém', 'undo', 'ília', 'eda'];
const PRE = ['Monte', 'Vale', 'Porto', 'Nova', 'São', 'Alto', 'Baixa', 'Ilha', 'Forte', 'Campos'];
const PNM = ['Banana', 'Cartola', 'Verde', 'Sombria', 'Dourado', 'Azul', 'do Norte', 'do Sul', 'Real', 'Antiga', 'das Pedras', 'dos Ventos', 'Grande', 'Bonita', 'do Rei', 'Serena'];
const NAMES = ['Aldo', 'Berta', 'Caio', 'Dara', 'Ezio', 'Fia', 'Gil', 'Hana', 'Ivo', 'Jade', 'Lino', 'Mira', 'Nilo', 'Olga', 'Pio', 'Rui', 'Tess', 'Ugo', 'Vera', 'Yuri'];
const skills0 = () => ({ adm: 0, eco: 0, mil: 0, prod: 0, res: 0, tax: 0 });
function mkCiv(g, id, n, col, extra) {
  const ids = Object.keys(IDEO).filter(k => k !== 'hor' && k !== 'ana');
  return Object.assign({
    id, n, col, cap: -1, gold: 450, loan: 0, tech: 1, resP: 0, skP: 1, sk: skills0(), ideo: pick(g, ids), rel: ri(g, 0, RELIG.length - 1),
    tax: .4, bRes: .25, bInv: .25, bGoods: .15, infl: 0, hap: .7, dp: 12, mp: 6, mpMax: 6, ally: null, lord: null, alive: true, inf: 0,
    leader: { n: pick(g, NAMES), img: null, atk: 0, eco: 0 }, per: { agg: .3 + R(g) * .7, cau: R(g), dip: R(g) }, plan: null, rival: null, gold_age: 0, festival: 0, score: 0, won: [], flags: {}, h: []
  }, extra || {});
}
function newGame(o) {
  const seed = o.seed | 0, nCiv_ = (o.roster || []).filter(r => !r.rm).length + (o.realms || 0), m = o.ilha ? genIsland(seed, o.nProv || 300, nCiv_, o.startP || 5) : genMap(seed, o.nProv || 300);
  const g = { ini: null, s: seed ^ 0x51ed27, seed, nProv: o.nProv || 300, turn: 0, startY: o.startY || 2026, diff: o.diff || 1, player: -1, c: [], p: [], rel: [], dip: {}, wars: [], al: {}, alN: 1, wN: 1, orders: [], log: [], inbox: [], over: null, tl: [], flagsW: {}, council: null, even: o.even !== false, vic: o.vic || { dom: .6, year: 0 } };
  if (m.ilha) { g.ilha = { nC: nCiv_, Kc: o.startP || 5 }; g.view = m.view; } g.c.push(mkCiv(g, NEU, 'Terras Livres', [150, 150, 140], { alive: false })); g.c.push(mkCiv(g, REB, 'Rebeldes', [40, 40, 40], { alive: false }));
  (o.roster || []).filter(r => !r.rm).forEach(r => { g.c.push(mkCiv(g, g.c.length, r.n, r.col, { flag: r.flag, bonga: 1, leader: { n: r.ln, img: r.img, ini: r.ini, atk: 0, eco: 0 } })); });
  for (let i = 0; i < (o.realms || 0); i++) {
    const col = [40 + ri(g, 0, 200), 40 + ri(g, 0, 200), 40 + ri(g, 0, 200)];
    g.c.push(mkCiv(g, g.c.length, 'Reino de ' + pick(g, SYL) + pick(g, END), col, { bands: [col, [ri(g, 0, 255), ri(g, 0, 255), ri(g, 0, 255)], [250, 250, 245]] }));
  }
  for (let a = 0; a < g.c.length; a++) g.rel.push(new Array(g.c.length).fill(0));
  for (let i = 0; i < m.P; i++) {
    const t = TER[m.ter[i]], ar = m.area[i] / 150;
    const fe = m.ps ? m.ps[i].fert || 1 : 1; g.p.push({ id: i, n: pick(g, PRE) + ' ' + pick(g, PNM), t: m.ter[i], own: NEU, ctrl: NEU, core: [], pop: Math.round((3000 + R(g) * 14000) * t.gr * clamp(ar, .6, 1.5) * fe), eco: Math.round((900 + R(g) * 3600) * t.eco * fe), ci: {}, dev: .15 + R(g) * .2, st: .7, rel: ri(g, 0, RELIG.length - 1), a: {}, b: {}, q: null, dz: null, won: null, rev: 0, as: 0 });
  }
  const cand = shuffle(g, [...Array(m.P).keys()]), caps = [], civs = g.c.filter(c => c.id > 1);
  if (m.ilha) { const sl = shuffle(g, [...Array(m.ilha.nC).keys()]); civs.forEach((c, ci) => { const j = sl[ci % sl.length]; for (let i = 0; i < m.P; i++) if (m.ps[i].sl === j) g.p[i].own = g.p[i].ctrl = c.id; c.cap = m.ilha.slotCap[j]; caps.push(c.cap); }); }
  for (const c of m.ilha ? [] : civs) {
    let best = -1, bd = -1;
    for (const p of cand.slice(0, Math.min(150, cand.length))) {
      if (caps.includes(p) || !m.neigh[p].length) continue;
      let d = 1e9; for (const q of caps) d = Math.min(d, (m.cx[p] - m.cx[q]) ** 2 + (m.cy[p] - m.cy[q]) ** 2);
      d += R(g) * 20; if (d > bd) { bd = d; best = p; }
    }
    caps.push(best); c.cap = best; g.p[best].own = g.p[best].ctrl = c.id;
  }
  const target = o.startP || 5; let grew = true;
  while (grew) {
    grew = false;
    for (const c of civs) {
      const mine = g.p.filter(p => p.own === c.id); if (mine.length >= target) continue;
      const fr = []; mine.forEach(p => m.neigh[p.id].forEach(n => { if (g.p[n].own === NEU) fr.push(n); }));
      if (fr.length) { const n = pick(g, fr); g.p[n].own = g.p[n].ctrl = c.id; grew = true; }
    }
  }
  for (const c of civs) {
    const mine = g.p.filter(p => p.own === c.id), rel = c.rel;
    mine.forEach(p => { p.core = [c.id]; p.rel = rel; p.dev = .3; p.a[c.id] = p.id === c.cap ? 1600 : 350; });
    if (g.even) {
      const tp = mine.reduce((s, p) => s + p.pop, 0) || 1, te = mine.reduce((s, p) => s + p.eco, 0) || 1;
      mine.forEach(p => { p.pop = Math.round(p.pop * 62000 / tp); p.eco = Math.round(p.eco * 15000 / te); });
    } else { c.per.agg = R(g); }
  }
  for (let a = 2; a < g.c.length; a++) for (let b = a + 1; b < g.c.length; b++) { const v = ri(g, -20, 30); g.rel[a][b] = g.rel[b][a] = v; }
  g.ini = g.p.map(p => p.own); g.player = o.player >= 0 ? o.player : -1; g.humans = g.player >= 0 ? [g.player] : []; g.opt = { ev: 1, rev: 1, hist: false, free: !!o.free }; g.resMul = .45; g.maxC = 70;
  attach(g, m); log(g, 'A história do Reino IOS começa em ' + g.startY + '.', 'big');
  return g;
}
function attach(g, m) { Object.defineProperty(g, 'map', { value: m || (g.scn ? scnMap(g.scn.map) : g.ilha ? genIsland(g.seed, g.nProv, g.ilha.nC, g.ilha.Kc) : genMap(g.seed, g.nProv)), enumerable: false, writable: true }); indexProvs(g); rebuildW(g); }
function save(g) { return JSON.stringify(g); }
function load(s) { const g = JSON.parse(s); setRelig(g.relR); attach(g); return g; }
const lv = (p, k) => (p.ci && p.ci[k]) || 0, cm = (p, k, v) => 1 + lv(p, k) * v;
const isH = (g, c) => g.humans.includes(c);
function indexProvs(g) { const ix = {}; for (const p of g.p) { let v = p.own; if (!ix[v]) ix[v] = new Set(); ix[v].add(p.id); Object.defineProperty(p, 'own', { enumerable: true, configurable: true, get() { return v; }, set(n) { if (n === v) return; const C_ = g._c; if (C_) { if (C_.ic) { C_.ic[v] = C_.ic[n] = undefined; } if (C_.st) { C_.st[v] = C_.st[n] = undefined; } } ix[v] && ix[v].delete(p.id); (ix[n] || (ix[n] = new Set())).add(p.id); v = n; } }); } Object.defineProperty(g, 'ix', { value: ix, enumerable: false, configurable: true, writable: true }); Object.defineProperty(g, '_c', { value: null, enumerable: false, configurable: true, writable: true }); }

/* ---------- AUXILIARES ---------- */
const dk = (a, b) => a < b ? a + '_' + b : b + '_' + a;
function dip(g, a, b) { const k = dk(a, b); return g.dip[k] || (g.dip[k] = {}); }
const hasD = (g, a, b, f) => (dip(g, a, b)[f] || 0) > g.turn;
function setD(g, a, b, f, t) { dip(g, a, b)[f] = g.turn + t; }
function log(g, t, k, civ) { g.log.push({ t: g.turn, m: t, k: k || '', c: civ == null ? -1 : civ }); if (g.log.length > 900) g.log.splice(0, 200); }
function rebuildW(g) { const n = g.c.length, m = new Uint8Array(n * n); for (const w of g.wars) for (const a of w.a) for (const b of w.b) { m[a * n + b] = 1; m[b * n + a] = 1; } Object.defineProperty(g, 'wm', { value: m, enumerable: false, writable: true, configurable: true }); }
const atWar = (g, a, b) => a !== b && a > 0 && b > 0 && (a === REB || b === REB || g.wm[a * g.c.length + b] === 1);
const sameAl = (g, a, b) => g.c[a].ally != null && g.c[a].ally === g.c[b].ally;
const isVas = (g, a, b) => g.c[a].lord === b || g.c[b].lord === a;
const friendly = (g, a, b) => a === b || sameAl(g, a, b) || isVas(g, a, b);
const wmCount = (g, c) => g.wars.filter(w => w.a.includes(c) || w.b.includes(c)).length;
function warOf(g, a, b) { return g.wars.find(w => (w.a.includes(a) && w.b.includes(b)) || (w.b.includes(a) && w.a.includes(b))); }
const provs = (g, c) => { const s = g.ix[c]; return s ? [...s].map(i => g.p[i]) : []; };
function canEnter(g, c, p) { return p.ctrl === c || p.own === c || friendly(g, c, p.ctrl) || friendly(g, c, p.own) || hasD(g, c, p.own, 'acc') || atWar(g, c, p.ctrl) || atWar(g, c, p.own); }
function canStay(g, c, p) { return canEnter(g, c, p); }
function links(g, p, c) { const m = g.map, l = m.neigh[p.id]; if (p.b.port && g.p[p.id].ctrl === c) return l.concat(m.sea[p.id].filter(i => g.p[i].b.port || atWar(g, c, g.p[i].ctrl))); return l; }
function pw(g, c) { let s = 0; if (g._c) s = g._c.arm[c] || 0; else for (const p of g.p) s += p.a[c] || 0; return s * techM(g, c); }
const armyOf = (g, c) => g.p.reduce((s, p) => s + (p.a[c] || 0), 0);
function techM(g, c) { const k = g.c[c]; return (1 + .09 * (k.tech - 1)) * (1 + .04 * k.sk.mil) * (IDEO[k.ideo].atk) * (1 + (k.leader.atk || 0)) * (k.gold_age > 0 ? 1.12 : 1) * wonderB(k, 'atk'); }
const wonderB = (k, f) => k.won.reduce((v, id) => WONDERS[id][1] === f ? v * (1 + WONDERS[id][2]) : v, 1);
const defM = (g, p, c) => TER[p.t].def * (1 + .35 * (p.b.fort || 0)) * (1 + .1 * (p.b.tower || 0)) * (p.ctrl === c ? wonderB(g.c[c], 'def') : 1);
function stats(g, c) {
  const k = g.c[c]; let pop = 0, eco = 0, n = 0, army = 0, dev = 0, st = 0, bld = 0;
  if (g._c) army = g._c.arm[c] || 0; else for (const p of g.p) army += p.a[c] || 0;
  const C_ = g._c && (g._c.st || (g._c.st = [])), m_ = C_ && C_[c]; if (m_) { pop = m_[0]; eco = m_[1]; n = m_[2]; dev = m_[3]; st = m_[4]; bld = m_[5]; } else { for (const p of provs(g, c)) { pop += p.pop; eco += p.eco; n++; dev += p.dev; st += p.st; for (const b in p.b) bld += p.b[b]; } if (C_) C_[c] = [pop, eco, n, dev, st, bld]; }
  return { pop, eco, n, army, dev: n ? dev / n : 0, st: n ? st / n : 0, bld, power: army * techM(g, c), tribute: 0, tot: k.gold };
}
function income(g, c) {
  const k = g.c[c], I = IDEO[k.ideo]; let tax = 0, prod = 0, up = 0, div = 0;
  if (g._c) { up = g._c.arm[c] || 0; div = g._c.div[c] || 0; }
  const IC_ = g._c && (g._c.ic || (g._c.ic = [])), im_ = IC_ && IC_[c]; let tb = 0, pb = 0, tu = 0;
  if (im_) { tb = im_[0]; pb = im_[1]; tu = im_[2]; } else { for (const p of g._c ? provs(g, c) : g.p) {
    if (!g._c) { up += (p.a[c] || 0); if (p.fi && p.fi[c]) div += p.fi[c] * .03; }
    if (p.own !== c || p.ctrl !== c) continue;
    const sM = .4 + .6 * p.st;
    const cF = p.core.includes(c) ? 1 : .55; tb += p.pop * .0022 * (p.pc0 ? Math.pow(clamp(p.eco / Math.max(1, p.pop) / p.pc0, .25, 16), .85) : 1) * sM * cF * cm(p, 'com', .08);
    pb += cF * p.eco * .0058 * (1 + .25 * (p.b.work || 0)) * sM * (p.b.port ? 1.12 : 1) * cm(p, 'ind', .1) * cm(p, 'inf', .05) * cm(p, 'ene', .04); tu += lv(p, 'tur') * (6 + p.dev * 14);
  } if (IC_) IC_[c] = [tb, pb, tu]; }
  tax = tb * k.tax * (1 + .05 * k.sk.tax); prod = pb * (1 + .05 * k.sk.prod) + tu;
  const em = I.eco * (1 + .05 * k.sk.eco) * wonderB(k, 'eco') * (k.gold_age > 0 ? 1.2 : 1) * (!isH(g, c) ? [.9, 1, 1.15, 1.35][g.diff] : 1) * (1 - k.infl) * (k.recon > 0 ? .72 : 1) * lawEco(k);
  tax *= em; prod *= em;
  let trib = div + tradeInc(g, c); for (const v of g.c) if (v.alive && v.lord === c) trib += (provs(g, v.id).reduce((s, p) => s + p.eco * .0058 + p.pop * .001, 0)) * .15;
  const paid = k.lord != null ? (tax + prod) * .15 : 0;
  const wage = g._wpc0 ? Math.pow(Math.max(1, g._wpc / g._wpc0), .85) : 1, upk = up * .0145 * I.up * (1 + .02 * (k.tech - 1)) * wage, inte = k.loan * .03;
  return { tax, prod, trib, paid, upk, inte, gross: tax + prod + trib - paid, net: tax + prod + trib - paid - upk - inte };
}
const techCost = l => 120 * Math.pow(Math.max(l, 15), 1.95) * (l > 30 ? Math.pow(1.3, l - 30) : 1);
function ageName(k) { let n = AGES[0][1]; for (const a of AGES) if (k.tech >= a[0]) n = a[1]; return n; }
const dateStr = g => { const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']; return m[g.turn % 12] + ' ' + (g.startY + Math.floor(g.turn / 12)); };
const year = g => g.startY + Math.floor(g.turn / 12);

/* ---------- AÇÕES ---------- */
function recruitCost(g, c, p) { return .12 * (g._wpc0 ? Math.pow(Math.max(1, g._wpc / g._wpc0), .85) : 1) * (p.b.arm ? .75 : 1) * (1 + g.c[c].infl) * (LW(g.c[c], 'mil') === 'obr' ? .75 : 1); }
function recruit(g, c, pid, n) {
  const p = g.p[pid], k = g.c[c]; if (p.ctrl !== c || n <= 0) return false;
  n = Math.min(Math.floor(n), Math.floor(k.gold / recruitCost(g, c, p)), Math.floor(p.pop * .12)); if (n <= 0) return false;
  k.gold -= n * recruitCost(g, c, p); p.pop -= n; p.a[c] = (p.a[c] || 0) + n; return true;
}
function disband(g, c, pid, n) { const p = g.p[pid]; n = Math.min(n, p.a[c] || 0); p.a[c] -= n; if (p.ctrl === c) p.pop += n; return n; }
function order(g, c, from, to, n) {
  const pf = g.p[from], pt = g.p[to], k = g.c[c]; n = Math.floor(n);
  const pend = g.orders.filter(o => o.c === c && o.f === from).reduce((s, o) => s + o.n, 0), av = (pf.a[c] || 0) - pend;
  if (n <= 0 || av < n || !canEnter(g, c, pt)) return 'Movimento inválido.';
  const cost = Math.ceil(TER[pt.t].mv); if (k.mp < cost) return 'Sem pontos de movimento.';
  if (!links(g, pf, c).includes(to) && !reachOwn(g, c, from, to)) return 'Muito longe: só vizinhos, ou reagrupe dentro do seu território.';
  k.mp -= cost; g.orders.push({ c, f: from, t: to, n }); return null;
}
function reachOwn(g, c, a, b) { const ok = p => p.ctrl === c; if (!ok(g.p[a]) || !ok(g.p[b])) return false; const v = new Set([a]), q = [a]; while (q.length) { const x = q.pop(); if (x === b) return true; for (const n of g.map.neigh[x]) if (!v.has(n) && ok(g.p[n])) { v.add(n); q.push(n); } } return false; }
function build(g, c, pid, b) {
  const p = g.p[pid], k = g.c[c], B = BLD[b]; if (p.ctrl !== c || p.own !== c) return 'Província não é sua.';
  if (p.q) return 'Já há obra aqui.'; if (k.tech < B.tech) return 'Tecnologia insuficiente.'; if ((p.b[b] || 0) >= 1 + (b === 'fort' ? 1 : 0)) return 'Nível máximo.'; if (b === 'port' && !g.map.coast[pid]) return 'Província sem litoral.';
  const cost = B.c * (1 + (p.b[b] || 0)); if (k.gold < cost) return 'Ouro insuficiente.'; k.gold -= cost; p.q = { b, t: B.t }; return null;
}
function demolish(g, c, pid, b) { const p = g.p[pid]; if (p.own === c && p.b[b]) { p.b[b]--; return true; } return false; }
function wonder(g, c, pid, id) {
  const p = g.p[pid], k = g.c[c], W = WONDERS[id]; if (g.flagsW[id] != null) return 'Já foi construída.'; if (p.own !== c) return 'Província não é sua.'; if (k.tech < W[3]) return 'Tecnologia insuficiente.'; const cost = 1400; if (k.gold < cost) return 'Ouro insuficiente.'; if (p.won != null) return 'Já há maravilha aqui.';
  k.gold -= cost; g.flagsW[id] = c; p.won = id; k.won.push(id); log(g, k.n + ' ergueu ' + W[0] + '!', 'big', c); return null;
}
function colCost(g, c) { const n = provs(g, c).length; return g.opt.free ? 150 + n * 3 : 260 + n * 14; }
/* nativos: toda terra sem dono tem povos que resistem. A forca cresce com a populacao local,
   o terreno e o tamanho da regiao selvagem em volta (povos de uma area grande se unem) */
function wildSize(g, pid) { const seen = new Set([pid]), q = [pid]; while (q.length && seen.size < 40) { const x = q.pop(); for (const n of g.map.neigh[x]) if (!seen.has(n) && g.p[n].own === NEU) { seen.add(n); q.push(n); } } return seen.size; }
function natives(g, pid) { const p = g.p[pid]; if (p.own !== NEU) return 0; const ws = wildSize(g, pid); return Math.round(p.pop * .05 * TER[p.t].def * (1 + .45 * Math.log2(1 + ws / 3)) * (p.natW == null ? 1 : p.natW)); }
function expedition(g, c) { const war = wmCount(g, c) > 0; let s = 0; for (const p of provs(g, c)) if (p.ctrl === c) s += p.a[c] || 0; return s * (war ? .3 : .6); }
function colonize(g, c, pid) { if (g.opt && g.opt.noCol && g.outP && g.outP.includes(pid)) return 'Fora do continente deste cenário.';
  const p = g.p[pid], k = g.c[c]; if (p.own !== NEU) return 'Já tem dono.'; if (!g.map.neigh[pid].some(n => g.p[n].own === c) && !g.map.sea[pid].some(n => g.p[n].own === c)) return 'Precisa fazer fronteira ou ter litoral próximo.';
  const cost = Math.round(colCost(g, c) * .7); if (k.gold < cost) return 'Ouro insuficiente (' + cost + ').';
  const N = natives(g, pid), T = techM(g, c), av = expedition(g, c), A = av * T; if (A < N * 1.1) return 'Os nativos de ' + p.n + ' são fortes demais: cerca de ' + N + ' guerreiros. Sua expedição tem ' + Math.round(av) + ' soldados' + (T > 1.05 ? ' (valendo ' + Math.round(A) + ' pela tecnologia)' : '') + '.';
  k.gold -= cost; const luck = .8 + R(g) * .45, win = A > N * luck * 1.25 || R(g) < clamp((A / (N * luck) - 1.1) * 2, 0, 1), loss = Math.round(N * luck * clamp(N / A, .25, 1) * (win ? .75 : 1.1) / Math.max(1, T * .8));
  /* baixas saem do exercito proporcionalmente */ { const mine = provs(g, c).filter(q => q.ctrl === c && (q.a[c] || 0) > 0), tot = mine.reduce((s_, q) => s_ + q.a[c], 0) || 1; for (const q of mine) q.a[c] = Math.max(0, q.a[c] - loss * q.a[c] / tot); }
  if (!win) { p.natW = (p.natW == null ? 1 : p.natW) * .85; log(g, 'Os nativos de ' + p.n + ' repeliram a expedição de ' + k.n + ' (' + loss + ' baixas).', '', c); return 'A expedição foi repelida pelos nativos (' + loss + ' baixas). Eles ficaram mais fracos para a próxima tentativa.'; }
  p.own = p.ctrl = c; p.core = [c]; p.st = .4; p.pop = Math.max(200, p.pop * .88); p.natW = null; const gar = Math.min(Math.round((av - loss) * .15), 800); if (gar > 0) { const src = provs(g, c).filter(q => q.ctrl === c && (q.a[c] || 0) > gar).sort((x, y) => y.a[c] - x.a[c])[0]; if (src) { src.a[c] -= gar; p.a[c] = (p.a[c] || 0) + gar; } }
  log(g, k.n + ' venceu os nativos e colonizou ' + p.n + ' (' + loss + ' baixas).', '', c); return null;
}
function invest(g, c, pid, kind) { const p = g.p[pid], k = g.c[c]; if (p.own !== c) return 'Não é sua.'; const cost = 110; if (k.gold < cost) return 'Ouro insuficiente.'; k.gold -= cost; if (kind === 'dev') { dvAdd(p, .02); p.dev = clamp(p.dev + .02, 0, 1); } else p.eco += 150 * (1 + p.dev * .5) * eraF(g); return null; }
function assimilate(g, c, pid) { const p = g.p[pid], k = g.c[c]; if (p.own !== c || p.core.includes(c)) return 'Já assimilada.'; if (k.gold < 180) return 'Ouro insuficiente.'; k.gold -= 180; p.as = 36; return null; }
function festival(g, c) { const k = g.c[c]; if (k.gold < 130 || k.festival > 0) return 'Indisponível.'; k.gold -= 130; k.festival = 6; return null; }
function loan(g, c, a) { const k = g.c[c]; const cap = Math.max(200, income(g, c).gross * 14); if (k.loan + a > cap) return 'Limite de crédito.'; k.loan += a; k.gold += a; k.infl = clamp(k.infl + .001, 0, .5); return null; }
function repay(g, c, a) { const k = g.c[c]; a = Math.min(a, k.loan, k.gold); k.gold -= a; k.loan -= a; return null; }
function moveCap(g, c, pid) { const k = g.c[c], p = g.p[pid]; if (p.own !== c || k.gold < 300) return 'Indisponível.'; k.gold -= 300; k.cap = pid; return null; }
function setIdeo(g, c, id) { const k = g.c[c]; if (k.ideo === id) return 'Já é esse governo.'; if (k.gold < 240) return 'Ouro insuficiente.'; k.gold -= 240; k.ideo = id; provs(g, c).forEach(p => p.st = clamp(p.st - .18, 0, 1)); log(g, k.n + ' adotou ' + IDEO[id].n + '.', 'pol', c); return null; }
function spendSkill(g, c, s) { const k = g.c[c]; if (k.skP <= 0) return 'Sem pontos.'; k.skP--; k.sk[s]++; return null; }
function relCh(g, a, b, v) { if (a < 2 || b < 2) return; const n = clamp(g.rel[a][b] + v, -100, 100); g.rel[a][b] = g.rel[b][a] = n; }

function canDeclare(g, a, b) {
  if (a === b || !g.c[b].alive) return 'Alvo inválido.'; if (atWar(g, a, b)) return 'Já em guerra.'; if (hasD(g, a, b, 'truce')) return 'Trégua ativa.'; if (friendly(g, a, b)) return 'Desfaça a aliança ou vassalagem antes.';
  if (g.c[a].lord != null) return 'Vassalos não declaram guerra.'; return null;
}
function declareWar(g, a, b, why) {
  const err = canDeclare(g, a, b); if (err) return err; const ka = g.c[a], kb = g.c[b];
  if (hasD(g, a, b, 'nap')) { ka.inf += 18; dip(g, a, b).nap = 0; for (const o of g.c) if (o.alive && o.id > 1 && o.id !== a) relCh(g, a, o.id, -6); }
  const w = { id: g.wN++, a: [a], b: [b], t: g.turn, sc: 0, why: why || '' }; g.wars.push(w);
  const addD = x => { if (x !== a && !w.b.includes(x) && !w.a.includes(x) && g.c[x].alive) w.b.push(x); };
  const addA = x => { if (x !== b && !w.a.includes(x) && !w.b.includes(x) && g.c[x].alive) w.a.push(x); };
  for (const o of g.c) { if (!o.alive || o.id < 2) continue; if (o.lord === b) addD(o.id); if (o.lord === a) addA(o.id); if (hasD(g, b, o.id, 'dp') || (hasD(g, b, o.id, 'gua') && o.id !== a)) addD(o.id); }
  for (const o of g.c) { if (!o.alive || o.id < 2) continue; if (kb.ally != null && o.ally === kb.ally && o.id !== b && o.id !== a) addD(o.id); else if (ka.ally != null && o.ally === ka.ally && o.id !== a && !w.b.includes(o.id)) { if (isH(g, o.id)) { g.inbox.push({ to: o.id, k: 'call', title: 'Chamado às armas', text: ka.n + ' pediu sua ajuda contra ' + kb.n + '.', w: w.id }); } else if (R(g) < .55 + o.per.agg * .35) addA(o.id); } }
  ka.inf += 6; relCh(g, a, b, -45); rebuildW(g);
  log(g, ka.n + ' declarou guerra a ' + kb.n + (why ? ' (' + why + ')' : '') + '!', 'war', a); evict(g); return null;
}
function warScore(g, w) {
  let a = 0, b = 0, tA = 1, tB = 1;
  for (const p of g.p) { const v = 1 + p.dev; if (w.a.includes(p.own)) tA += v * (p.id === g.c[p.own].cap ? 3 : 1); else if (w.b.includes(p.own)) tB += v * (p.id === g.c[p.own].cap ? 3 : 1); if (p.ctrl === p.own) continue; if (w.a.includes(p.ctrl) && w.b.includes(p.own)) a += v * (p.id === g.c[p.own].cap ? 3 : 1); if (w.b.includes(p.ctrl) && w.a.includes(p.own)) b += v * (p.id === g.c[p.own].cap ? 3 : 1); }
  /* como no AoH2: parte do territorio INIMIGO ocupada + batalhas */ return clamp(a / tB - b / tA + w.sc / Math.max(4000, (w.casu || 4000)), -1, 1);
}
function linePeace(g, w) { if (w.a.concat(w.b).some(c => isH(g, c))) return applyPeace(g, w, 'sq', 'a'); const lim = {}, got = {}, cpt = new Set(); for (const c of w.a.concat(w.b)) { lim[c] = Math.floor(provs(g, c).length * ((g._few || 99) <= 4 ? .6 : .3)); got[c] = 0; if (capit(g, c, w.a.includes(c) ? w.b : w.a)) { cpt.add(c); lim[c] = 1e9; } } let n = 0; for (const p of g.p) { if (p.ctrl === p.own) continue; const ab = w.a.includes(p.ctrl) && w.b.includes(p.own), ba = w.b.includes(p.ctrl) && w.a.includes(p.own); if (!ab && !ba) continue; const L = g.c[p.own]; if (p.id === L.cap && provs(g, p.own).length > 2 && !cpt.has(p.own)) continue; if (got[p.own] >= Math.max(1, lim[p.own])) continue; got[p.own]++; g.c[p.ctrl].inf += 1; p.own = p.ctrl; p.st = clamp(p.st - .2, .05, 1); n++; } applyPeace(g, w, 'sq', 'a'); if (n) { const A = g.c[w.a[0]], B = g.c[w.b[0]], m = 'Cessar-fogo entre ' + A.n + ' e ' + B.n + ' nas linhas de frente: ' + n + (n === 1 ? ' território mudou' : ' territórios mudaram') + ' de dono.'; log(g, m, 'peace', A.id); if (w.big || rankTop(g, A.id) || rankTop(g, B.id)) tle(g, 'peace', m, A.id, A.cap); } }
function applyPeace(g, w, type, winSide) {
  const wn = winSide === 'a' ? w.a : w.b, ls = winSide === 'a' ? w.b : w.a, leadW = wn[0], leadL = ls[0];
  for (const p of g.p) {
    if (p.ctrl === p.own) continue;
    const inv = (wn.includes(p.ctrl) && ls.includes(p.own)) || (ls.includes(p.ctrl) && wn.includes(p.own)); if (!inv) continue;
    if (type === 'annex' && wn.includes(p.ctrl) && ls.includes(p.own)) { g.c[p.ctrl].inf += 1.6; if (p.id === g.c[p.own].cap) g.c[p.own].cap = -1; p.own = p.ctrl; p.st = clamp(p.st - .22, .05, 1); if (!p.core.includes(p.own)) p.core = p.core.concat([]); }
    else p.ctrl = p.own;
  }
  if (type === 'vassal' && g.c[leadL].alive) { g.c[leadL].lord = leadW; log(g, g.c[leadL].n + ' tornou-se vassalo de ' + g.c[leadW].n + '.', 'pol', leadW); }
  if (type === 'repar') { const v = Math.max(120, income(g, leadL).gross * 7); g.c[leadL].gold -= v; g.c[leadW].gold += v; }
  for (const a of w.a) for (const b of w.b) { setD(g, a, b, 'truce', 60); relCh(g, a, b, 10); }
  g.wars = g.wars.filter(x => x !== w); rebuildW(g); evict(g); fixCaps(g); checkDead(g);
  log(g, 'Paz: ' + g.c[leadW].n + ' × ' + g.c[leadL].n + ' — ' + ({ annex: 'províncias anexadas', vassal: 'vassalagem', repar: 'reparações', sq: 'status quo' }[type]) + '.', 'peace', leadW);
}
function evict(g) { for (const p of g.p) for (const s in p.a) { const c = +s; if (c === REB || !(p.a[c] > 0)) continue; if (!canStay(g, c, p)) { const n = p.a[c]; delete p.a[c]; const hm = g.c[c].cap; if (hm >= 0 && g.p[hm].own === c) g.p[hm].a[c] = (g.p[hm].a[c] || 0) + Math.floor(n * .8); } } }
function fixCaps(g) { for (const k of g.c) if (k.alive && (k.cap < 0 || g.p[k.cap].own !== k.id)) { const m = provs(g, k.id).sort((a, b) => b.pop - a.pop)[0]; k.cap = m ? m.id : -1; if (m) m.st = clamp(m.st - .05, 0, 1); } }
function checkDead(g) { for (const k of g.c) if (!k.alive && k.h && k.h.length > 60) k.h = k.h.filter((_, i, A) => i % Math.ceil(A.length / 60) === 0 || i === A.length - 1);
  for (const k of g.c) if (k.alive && k.id > 1 && !(g.ix[k.id] && g.ix[k.id].size)) {
    k.alive = false; k.dead = g.turn; g.dN = (g.dN || 0) + 1; log(g, k.n + ' deixou de existir.', 'big', k.id); tle(g, 'dead', k.n + ' deixou de existir.', k.id, k.cap);
    for (const p of g.p) { delete p.a[k.id]; if (p.ctrl === k.id) p.ctrl = p.own; }
    for (const v of g.c) if (v.lord === k.id) v.lord = null; k.ally = null; k.lord = null;
    g.wars.forEach(w => { w.a = w.a.filter(x => x !== k.id); w.b = w.b.filter(x => x !== k.id); });
    g.wars = g.wars.filter(w => w.a.length && w.b.length); g.orders = g.orders.filter(o => o.c !== k.id); rebuildW(g); cleanAl(g);
  }
  /* Bongalia e Regioes: ninguem nasce, entao quando sobra um reino a partida termina (pedido do dono) */
  if (!g.over && (!g.scn || g.scn.kind === 'reg')) { const vv = g.c.filter(k => k.alive && k.id > 1); if (vv.length === 1) { const w = vv[0]; g.over = { w: w.id, r: (!g.scn ? 'unificou o Reino IOS' : 'unificou o Brasil') + ' e é o último reino de pé', t: g.turn }; const m = w.n + ' venceu: é o último reino de pé.'; log(g, m, 'big', w.id); tle(g, 'unif', m, w.id, w.cap); } }
}
function cleanAl(g) { for (const id in g.al) { g.al[id].m = g.al[id].m.filter(x => g.c[x].alive && g.c[x].ally == id); if (g.al[id].m.length < (g.al[id].lead != null ? 1 : 2)) { g.al[id].m.forEach(x => g.c[x].ally = null); delete g.al[id]; } } }

/* ---------- ACEITAÇÃO DIPLOMÁTICA ---------- */
function threatOf(g, c) { let t = 0, tt = 0; const me = stats(g, c).power + 1; for (const k of g.c) { if (!k.alive || k.id < 2 || k.id === c) continue; if (!bord(g, c, k.id)) continue; const s = pw(g, k.id) / me; const hos = clamp((30 - g.rel[c][k.id]) / 100, 0, 1) + k.inf / 80; const v = s * hos; if (v > t) { t = v; tt = k.id; } } return { v: t, id: tt }; }
function bord(g, a, b) { const C = g._c; if (C) return !!(C.nb[a] && C.nb[a].has(b)); for (const p of provs(g, a)) for (const n of g.map.neigh[p.id]) if (g.p[n].own === b) return true; return false; }
function buildCache(g) { const arm = [], div = [], nb = [], ap = [], cp = []; for (const p of g.p) { for (const s in p.a) { arm[s] = (arm[s] || 0) + (p.a[s] || 0); if (p.a[s] > 0) (ap[s] || (ap[s] = [])).push(p); } (cp[p.ctrl] || (cp[p.ctrl] = [])).push(p); if (p.fi) for (const s in p.fi) div[s] = (div[s] || 0) + p.fi[s] * .03; const o = p.own; for (const n of g.map.neigh[p.id]) { const q = g.p[n].own; if (q !== o) (nb[o] || (nb[o] = new Set())).add(q); } } g._c = { arm, div, nb, ap, cp }; }
function accepts(g, kind, from, to, x) {
  const K = g.c[to], F = g.c[from], r = g.rel[from][to], pF = pw(g, from) + 1, pT = pw(g, to) + 1, ratio = pF / pT;
  const th = threatOf(g, to), inf = F.inf * .8, dipp = K.per.dip * 18 + IDEO[K.ideo].dip * 10;
  switch (kind) {
    case 'nap': return r + dipp - inf + (ratio > 1 ? 12 : -2) - (K.plan && K.plan.t === from ? 80 : 0) > 18;
    case 'dp': return r + dipp - inf + (th.v > .6 ? 20 : 0) > 42;
    case 'ally': return K.ally != null && F.ally != null ? false : r + dipp - inf + (th.v > .7 && th.id !== from ? 28 : 0) + (ratio > .6 ? 8 : -10) > 48;
    case 'acc': return r + dipp - inf > 22 && !atWar(g, to, from);
    case 'gua': return r > 30 && ratio > 1;
    case 'vassal': return ratio > 4 && r + dipp > 14 && wmCount(g, to) === 0 || (ratio > 8);
    case 'union': return r > 70 && ratio > 3 && K.per.dip > .55;
    case 'gift': return true;
    case 'trade': return (x && x.give > 0 && x.get === 0) || (r > -20 && x && x.give >= x.get);
    case 'ultimatum': return ratio > 2.2 && r > -60 && !wmCount(g, to) === false || ratio > 3;
    case 'indep': return ratio > .8 || r > 60;
    default: return false;
  }
}
function action(g, kind, from, to, x) {
  const F = g.c[from], T_ = g.c[to], cost = { imp: 2, ins: 1, nap: 4, dp: 5, ally: 6, acc: 2, gua: 3, gift: 1, sup: 3, vassal: 8, union: 10, trade: 2, ultimatum: 4, indep: 3 }[kind] || 0;
  if (to === from || !T_.alive || to < 2) return { e: 'Alvo inválido.' }; if (F.dp < cost) return { e: 'Pontos de diplomacia insuficientes.' }; const say = (ok, m) => ({ ok, m });
  if (kind !== 'indep' && atWar(g, from, to) && kind !== 'gift') return { e: 'Vocês estão em guerra.' };
  F.dp -= cost;
  switch (kind) {
    case 'imp': relCh(g, from, to, 7 + ri(g, 0, 4)); return say(true, 'Relações melhoraram.');
    case 'ins': relCh(g, from, to, -18); return say(true, 'Insulto enviado.');
    case 'gift': { const a = Math.min(F.gold, x || 100); F.gold -= a; T_.gold += a; relCh(g, from, to, clamp(a / 18, 1, 30)); return say(true, 'Presente entregue.'); }
    case 'nap': if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); setD(g, from, to, 'nap', 36); relCh(g, from, to, 6); log(g, F.n + ' e ' + T_.n + ' assinaram não agressão.', 'dip', from); return say(true, 'Pacto assinado.');
    case 'dp': if (noAl(g)) return say(false, 'Este mapa não tem pactos defensivos.'); if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); setD(g, from, to, 'dp', 60); relCh(g, from, to, 8); return say(true, 'Pacto defensivo assinado.');
    case 'acc': if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); setD(g, from, to, 'acc', 24); return say(true, 'Acesso militar concedido.');
    case 'gua': if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); setD(g, from, to, 'gua', 60); return say(true, 'Garantia dada.');
    case 'ally': { if (noAl(g)) return say(false, 'Este mapa não tem alianças.');
      if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); let id = F.ally != null ? F.ally : T_.ally; if (id == null) { id = g.alN++; g.al[id] = { n: alName(g, from, to), m: [] }; }
      for (const c of [F, T_]) { if (c.ally !== id) { c.ally = id; g.al[id].m.push(c.id); } } relCh(g, from, to, 14); log(g, F.n + ' e ' + T_.n + ' formaram aliança: ' + g.al[id].n + '.', 'dip', from); return say(true, 'Aliança formada.');
    }
    case 'vassal': if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); T_.lord = from; log(g, T_.n + ' aceitou ser vassalo de ' + F.n + '.', 'pol', from); return say(true, 'Vassalo conquistado.');
    case 'union': if (!accepts(g, kind, from, to)) return say(false, T_.n + ' recusou.'); provs(g, to).forEach(p => { p.own = from; if (p.ctrl === to) p.ctrl = from; }); g.p.forEach(p => { if (p.a[to]) { p.a[from] = (p.a[from] || 0) + p.a[to]; delete p.a[to]; } }); log(g, F.n + ' uniu-se a ' + T_.n + '!', 'big', from); checkDead(g); return say(true, 'União concluída.');
    case 'sup': T_.flags.rebelS = g.turn + 12; relCh(g, from, to, -14); return say(true, 'Rebeldes financiados.');
    case 'ultimatum': { const best = g.p.filter(p => p.own === to && g.map.neigh[p.id].some(n => g.p[n].own === from) && p.id !== T_.cap)[0]; if (!best) return say(false, 'Sem fronteira para exigir.'); if (accepts(g, kind, from, to)) { best.own = best.ctrl = from; relCh(g, from, to, -25); F.inf += 3; log(g, T_.n + ' cedeu ' + best.n + ' a ' + F.n + '.', 'pol', from); return say(true, 'Exigência aceita: ' + best.n + '.'); } relCh(g, from, to, -30); return say(false, T_.n + ' rejeitou o ultimato.'); }
    case 'indep': if (F.lord !== to) return say(false, 'Você não é vassalo dele.'); F.lord = null; log(g, F.n + ' proclamou independência de ' + T_.n + '.', 'pol', from); relCh(g, from, to, -35); return say(true, 'Independência proclamada.');
  }
  return { e: 'Ação desconhecida.' };
}
function releaseVassal(g, lord, v) { if (g.c[v].lord !== lord) return; g.c[v].lord = null; relCh(g, lord, v, 20); log(g, g.c[v].n + ' foi libertado por ' + g.c[lord].n + '.', 'pol', lord); }
/* aliancas nao sao eternas: com o tempo, relacoes ruins, governos diferentes ou fim da ameaca, os membros saem e o bloco se desfaz */
/* relacoes esfriam: sem cuidado voltam para perto de zero; rivais esfriam mais */
/* imperios grandes demais racham: com quase o mundo todo e poucos rivais, guerras civis aparecem */
function empireTick(g) { if (g.turn % 12) return; const L = g.c.filter(k => k.alive && k.id > 1); if (L.length > 6) return; let own = 0; for (const p of g.p) if (p.own > 1) own++; const lim = L.length <= 3 ? .6 : .45; for (const k of L) { const n = (g.ix[k.id] || { size: 0 }).size; if (n > own * lim && n >= 8 && !wmCount(g, k.id) && R(g) < .025 + (n / own - lim) * .1) { civilWar(g, k); break; } } }
function relDrift(g) { if (g.turn % 12) return; const L = g.c.filter(k => k.alive && k.id > 1); for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i].id, b = L[j].id; if (sameAl(g, a, b) || isVas(g, a, b) || atWar(g, a, b)) continue; let v = g.rel[a][b] * (L.length <= 6 ? .82 : .9); if (L[i].rival === b || L[j].rival === a) v -= L.length <= 6 ? 8 : 4; g.rel[a][b] = g.rel[b][a] = clamp(v, -100, 100); } }
function alTick(g) { if (g.turn % 6 || !g.al) return; for (const id of Object.keys(g.al)) { const A = g.al[id]; if (!A) continue; if (A.t0 == null) A.t0 = g.turn - (A.n === 'OTAN' ? 120 : 0); const age = (g.turn - A.t0) / 12;
  const inWar = c => g.wars.some(w => (w.a.includes(c) || w.b.includes(c)) && A.m.some(o => o !== c && (w.a.includes(c) ? w.a : w.b).includes(o)));
  /* o bloco inteiro pode acabar */
  if (age > 12 && !A.m.some(inWar) && R(g) < Math.min(.06, .004 + (age - 12) * .0012)) { const n = A.n, l = A.lead != null ? A.lead : A.m[0]; A.m.forEach(x => { g.c[x].ally = null; }); delete g.al[id]; const m = 'A ' + n + ' foi dissolvida depois de ' + Math.round(age) + ' anos.'; log(g, m, 'dip', l); tle(g, 'al', m, l, g.c[l] ? g.c[l].cap : -1); continue; }
  for (const c of A.m.slice()) { const k = g.c[c]; if (!k || !k.alive || isH(g, c) || inWar(c)) continue; const oth = A.m.filter(o => o !== c); if (!oth.length) continue;
    const rel = oth.reduce((s, o) => s + (g.rel[c][o] || 0), 0) / oth.length, L = A.lead != null && A.lead !== c ? g.c[A.lead] : null, idf = L && L.ideo !== k.ideo ? 1 : 0;
    const p = .002 + Math.max(0, age - 8) * .00035 + (rel < 25 ? .014 : 0) + (rel < 0 ? .06 : 0) + idf * .006 + (k.leader && k.leader.since > g.turn - 6 && k.leader.since > 0 ? .03 : 0);
    if (R(g) < Math.min(.25, p)) { k.ally = null; A.m = A.m.filter(x => x !== c); if (A.lead === c) A.lead = A.m[0]; for (const o of A.m) relCh(g, c, o, -8); const why = rel < 0 ? 'após brigas com os aliados' : idf ? 'por divergências com ' + L.n : k.leader && k.leader.since > g.turn - 6 && k.leader.since > 0 ? 'com o novo governo' : 'para seguir sozinho'; const m = k.n + ' deixou ' + (/^(Pacto|Eixo|Conselho|Círculo|Bloco|Tratado|Grupo|Clube|Acordo|Concerto|Núcleo|Arco|Cinturão|Escudo|Front|Fórum)/.test(A.n) ? 'o ' : 'a ') + A.n + ' ' + why + '.'; log(g, m, 'dip', c); tle(g, 'al', m, c, k.cap); } }
} cleanAl(g); }
function leaveAlliance(g, c) { const k = g.c[c]; if (k.ally != null) { k.ally = null; cleanAl(g); } }
function playerPeace(g, w, type) {
  const c = g.player, side = w.a.includes(c) ? 'a' : 'b', other = side === 'a' ? w.b : w.a, sc = warScore(g, w) * (side === 'a' ? 1 : -1), ldr = other[0];
  if (type === 'surrender') { applyPeace(g, w, 'annex', side === 'a' ? 'b' : 'a'); return { ok: true, m: 'Você se rendeu.' }; }
  const need = { sq: -.15, repar: .12, annex: .28, vassal: .62 }[type], ex = (g.turn - w.t) * .004;
  if (sc + ex >= need) { applyPeace(g, w, type, side); return { ok: true, m: 'Paz assinada.' }; }
  return { ok: false, m: g.c[ldr].n + ' rejeitou (pontuação de guerra ' + Math.round(sc * 100) + '%).' };
}

/* ---------- IA ---------- */
function aiEstimate(g, c, pid) { const p = g.p[pid]; let d = 0; for (const s in p.a) { const o = +s; if (o !== c && (atWar(g, c, o))) d += (p.a[o] || 0) * techM(g, o); } const def = g.c[p.ctrl]; if (p.ctrl > 1 && p.ctrl !== c && atWar(g, c, p.ctrl)) d = d * defM(g, p, p.ctrl); return Math.max(d, 15); }
function aiTurn(g, k) {
  const c = k.id; const mine = provs(g, c); if (!mine.length) return;
  aiEcon(g, k, mine); aiDiplo(g, k, mine); aiWarChoice(g, k, mine); aiMil(g, k); aiColonize(g, k, mine);
}
function aiEcon(g, k, mine) {
  const c = k.id, inc = income(g, c), st = stats(g, c), I = IDEO[k.ideo], war = wmCount(g, c) > 0;
  const stLow = st.st < .5; const rich = k.gold > 2500; k.tax = clamp(stLow || rich ? .22 : (inc.net < 0 ? .55 : .4), .15, .7);
  k.bGoods = stLow ? .3 : .12; k.bRes = war ? .12 : .18 + I.build * .14; k.bInv = war ? .08 : .1 + I.build * .18; if (rich) { k.bRes += .18; k.bInv += .25; k.bGoods += .1; }
  if (k.skP > 0) { const pr = war ? ['mil', 'prod', 'tax', 'adm', 'eco', 'res'] : I.build > .7 ? ['res', 'eco', 'prod', 'adm', 'tax', 'mil'] : ['eco', 'mil', 'res', 'prod', 'tax', 'adm']; let s = pr[0]; for (const x of pr) if (k.sk[x] * 1.3 < k.sk[s]) { s = x; } spendSkill(g, c, s); }
  if (k.gold < 0 && inc.net < 0) { loan(g, c, Math.min(200, -k.gold + 80)); }
  if (k.loan > 0 && k.gold > 500) repay(g, c, Math.min(k.loan, k.gold - 400));
  const reserve = war ? 340 : 240;
  if (k.gold > reserve && mine.length) {
    let best = null, bv = 0;
    for (const p of mine) { if (p.q || p.ctrl !== c) continue;
      const front = g.map.neigh[p.id].some(n => { const o = g.p[n].own; return o > 1 && o !== c && !friendly(g, c, o); });
      for (const b in BLD) { const B = BLD[b]; if (k.tech < B.tech || (p.b[b] || 0) >= 1 + (b === 'fort' ? 1 : 0) || B.c > k.gold - reserve + 50) continue; if (b === 'port' && !g.map.coast[p.id]) continue;
        let v = b === 'farm' ? p.pop / 300 * TER[p.t].gr : b === 'work' ? p.eco / 12 * (1 + I.build) : b === 'lib' ? 30 * (1 + I.build) + p.pop / 800 : b === 'fort' ? (front ? 58 + 18 * I.agg + (p.id === k.cap ? 60 : 0) : 1) : b === 'tower' ? (front ? 14 : 0) : b === 'arm' ? (p.id === k.cap ? 60 * I.agg : 0) : b === 'port' ? (p.eco / 40) * (mine.length > 4 ? 1 : .5) + (g.map.sea[p.id].some(i => g.p[i].own > 1 && g.p[i].own !== k.id) && !mine.some(q => q.b.port) ? 40 + 30 * I.agg : 0) : b === 'sup' ? (p.dz ? 60 : front ? 12 : 3) : 0;
        v = v / B.c * (1 + R(g) * .15); if (v > bv) { bv = v; best = [p.id, b]; } } }
    if (best && build(g, c, best[0], best[1]) === null && k.gold > reserve * 4) { const alt = mine.find(p => !p.q && p.ctrl === c && !p.b.farm); if (alt) build(g, c, alt.id, 'farm'); }
  }
  if (k.gold > 1900 && !war) for (let i = 0; i < WONDERS.length; i++) if (g.flagsW[i] == null && k.tech >= WONDERS[i][3]) { wonder(g, c, k.cap, i); break; }
  if (k.gold > 600 && !war && R(g) < .4) { const p = mine.slice().sort((a, b) => a.dev - b.dev)[0]; invest(g, c, p.id, R(g) < .5 ? 'dev' : 'eco'); }
  aiInvest(g, k, mine, war); { const tg = Math.max(400, inc.gross * (war ? 4 : 8)); if (k.gold > tg) { const ex = Math.min(.45, (k.gold - tg) / Math.max(1, inc.gross) * .03); k.bRes = Math.min(.75, k.bRes + ex * .6); k.bInv = Math.min(.6, k.bInv + ex * .4); } } { /* AoH2 TOTAL_BUDGET_BASE: gasto total (com exercito) ~90% da renda; o resto vira reserva */ const tgR = Math.max(400, inc.gross * (war ? 4 : 8)), room = Math.max(.1, (k.gold > tgR ? 1 + Math.min(.9, (k.gold - tgR) / Math.max(1, inc.gross) * .06) : .9) - inc.upk / Math.max(1, inc.gross)), tot = k.bRes + k.bInv; if (tot + k.bGoods > room) { const f_ = Math.max(0, room - k.bGoods) / Math.max(.01, tot); k.bRes *= f_; k.bInv *= f_; } }
  if (st.st < .42 && !k.festival && k.gold > 300) festival(g, c);
  for (const p of mine) if (!p.core.includes(c) && !p.as && k.gold > 260 && R(g) < .4) assimilate(g, c, p.id);
  const hu = I.agg; if (k.tech > 8 && k.ideo === 'tri') setIdeo(g, c, ['mon', 'rep'][ri(g, 0, 1)]);
}
function aiDiplo(g, k, mine) {
  const c = k.id, I = IDEO[k.ideo], th = threatOf(g, c);
  let rv = -1, rvv = 1e9; for (const o of g.c) { if (!o.alive || o.id < 2 || o.id === c || !bord(g, c, o.id)) continue; const v = g.rel[c][o.id] - o.inf * .5 + (pw(g, o.id) * .00001); if (v < rvv) { rvv = v; rv = o.id; } } k.rival = rv;
  if (k.dp >= 2 && R(g) < .55) {
    const others = g.c.filter(o => o.alive && o.id > 1 && o.id !== c && !atWar(g, c, o.id) && bord(g, c, o.id));
    shuffle(g, others);
    for (const o of others.slice(0, 5)) {
      if (isH(g, o.id)) { if (R(g) < .05 && g.rel[c][o.id] > 25 && !hasD(g, c, o.id, 'nap')) g.inbox.push({ to: o.id, k: 'prop', p: 'nap', from: c, title: 'Proposta de ' + k.n, text: k.n + ' propõe um pacto de não agressão.' }); continue; }
      const r = g.rel[c][o.id];
      if (th.id === o.id && !hasD(g, c, o.id, 'nap') && pw(g, o.id) > pw(g, c) * 1.1 && !k.plan && k.dp >= 4) action(g, 'nap', c, o.id);
      else if (k.dp >= 2 && r > -15 && r < 35 && o.id !== k.rival && (!k.plan || k.plan.t !== o.id) && R(g) < .12 + I.dip * .2) action(g, 'imp', c, o.id);
    }
    if (th.v > .55 && k.dp >= 6) {
      const can = g.c.filter(o => o.alive && o.id > 1 && o.id !== c && o.id !== th.id && !isH(g, o.id) && !atWar(g, c, o.id) && (bord(g, o.id, th.id) || bord(g, c, o.id)) && (k.ally == null || o.ally == null));
      const afin = o => (o.rel === k.rel ? 15 : -10) + (o.ideo === k.ideo ? 15 : IDEO[o.ideo] && IDEO[k.ideo] && (o.ideo === 'dit') === (k.ideo === 'dit') ? 0 : -8); can.sort((a, b) => (g.rel[c][b.id] + afin(b) + (bord(g, b.id, th.id) ? 25 : 0) + pw(g, b.id) * .0001) - (g.rel[c][a.id] + afin(a) + (bord(g, a.id, th.id) ? 25 : 0) + pw(g, a.id) * .0001));
      if (can[0] && !friendly(g, c, can[0].id)) action(g, 'ally', c, can[0].id);
    }
    if (k.lord != null) { const lk = g.c[k.lord]; if ((pw(g, c) > pw(g, k.lord) * .85 || g.rel[c][k.lord] < -30) && k.dp >= 3 && wmCount(g, k.lord) > 0) action(g, 'indep', c, k.lord); }
  }
  for (const w of g.wars.slice()) {
    if (!(w.a.includes(c) || w.b.includes(c)) || (w.a[0] !== c && w.b[0] !== c)) continue;
    const side = w.a[0] === c ? 'a' : 'b', other = (side === 'a' ? w.b : w.a)[0]; if (isH(g, other)) { aiOfferPlayer(g, w, k, side); continue; } if (!w.a.concat(w.b).some(x => isH(g, x))) continue;
    const raw = warScore(g, w), sc = raw * (side === 'a' ? 1 : -1), age = g.turn - w.t; if (w.ls == null || Math.abs(raw - w.ls) > .03) { w.ls = raw; w.lt = g.turn; } const stall = g.turn - w.lt;
    if (age < 9) continue; if (age > 150) { linePeace(g, w); continue; }
    const fatigue = age * .006;
    const ours = (side === 'a' ? w.a : w.b).reduce((s, x) => s + pw(g, x), 0), theirs = (side === 'a' ? w.b : w.a).reduce((s, x) => s + pw(g, x), 0);
    if (sc > .55 && ours > theirs * 3 && age > 15) { applyPeace(g, w, 'vassal', side); continue; }
    if (sc > .3 && age > 12 || sc > .16 && (stall > 10 || age > 30 || ours < theirs * 1.1)) { applyPeace(g, w, 'annex', side); continue; }
    if (sc > .12 && age > 24 && R(g) < .35) { applyPeace(g, w, 'repar', side); continue; }
    if (Math.abs(sc) < .15 && ((g._few || 99) <= 4 ? stall > 60 : (stall > 25 || age > 36 + k.per.agg * 18)) && R(g) < .25) { linePeace(g, w); continue; }
    if (sc < -.5 && ours < theirs * .4 && R(g) < .25 + fatigue) { applyPeace(g, w, 'annex', side === 'a' ? 'b' : 'a'); continue; }
  }
}
function aiOfferPlayer(g, w, k, side) { const sc = warScore(g, w) * (side === 'a' ? 1 : -1), age = g.turn - w.t; if (age > 8 && R(g) < .1 && !g.inbox.some(m => m.k === 'peace' && m.w === w.id)) { const t = sc > .3 ? 'annex' : sc > .12 ? 'repar' : sc < -.3 ? 'repar_w' : 'sq'; if (t === 'sq' && age < 20) return; g.inbox.push({ to: (side === 'a' ? w.b : w.a)[0], k: 'peace', w: w.id, t, side, title: 'Oferta de paz de ' + k.n, text: k.n + ' propõe: ' + ({ annex: 'ceder as províncias ocupadas por eles', repar: 'pagar reparações a eles', repar_w: 'receber reparações deles e encerrar', sq: 'status quo (voltar ao que era)' }[t]) + '.' }); } }
/* Regras de guerra do Age of History II (valores de gameValues/gvAiDeclareWar.json) */
const AOH = { checkBase: 18, checkRand: 18, checkAfterPrep: 12, aggMin: .4, aggRand: .5, maxRel: 25, maxRelPlayer: 15, closest: 3, alliesAtk: .9, alliesDef: 1, prepMin: 5, prepRand: 10, targetRel: -40,
  capDef: .65, capAgg: -.35, capLeft: .35, sqNoAttack: 25, sqNoOneAttacked: 15, sqNoProgress: 35, sqTooLong: 150, truce: 100, wwWar: .0085, wwPeace: .015, wwScale: 12.5, wwLimit: 3.5 };
function aiWarChoice(g, k, mine) {
  const c = k.id; if (wmCount(g, c) > 0 || k.lw == null) k.lw = g.turn; if (k.lord != null || g.turn - (g.t0War == null ? (g.t0War = g.turn) : g.t0War) < 36) return;
  /* fim de jogo agitado: muitos anos de paz e poucas nacoes deixam a IA inquieta */ const nV = g._nV != null && g._nVt === g.turn ? g._nV : (g._nVt = g.turn, g._nV = g.c.filter(o => o.alive && o.id > 1).length), pyr = (g.turn - k.lw) / 12, inq = Math.min(nV <= 6 ? .45 : nV <= 15 ? .25 : .12, pyr * (nV <= 6 ? .02 : .008));
  const atk = () => pw(g, c) + allySt(g, c) * AOH.alliesAtk, def = o => (pw(g, o) * (wmCount(g, o) ? .6 : 1) + allySt(g, o) * AOH.alliesDef), need = o => clamp(1.2 - (k.aggP || .6) * .7 - (o === k.rival ? .15 : 0) - (wmCount(g, o) ? .1 : 0) + (bord(g, c, o) ? 0 : .45) - inq, .4, 1.6), ok = o => atk() > def(o) * need(o);
  if (k.plan) { const t = g.c[k.plan.t]; if (!t || !t.alive || atWar(g, c, t.id) || canDeclare(g, c, t.id)) { k.plan = null; return; }
    if (g.rel[c][t.id] > AOH.targetRel) relCh(g, c, t.id, -4); /* preparacao: relacao cai ate -40 */
    if (g.turn >= k.plan.u) { if (ok(t.id)) declareWar(g, c, t.id, k.plan.w); k.plan = null; k.wcT = g.turn + AOH.checkBase + ri(g, 0, AOH.checkAfterPrep); } return; }
  if (k.wcT == null) k.wcT = g.turn + ri(g, 0, AOH.checkBase + AOH.checkRand); if (g.turn < k.wcT) return; k.wcT = g.turn + Math.round((AOH.checkBase + ri(g, 0, AOH.checkRand)) * (1 - inq));
  if (wmCount(g, c) > 0 || (k.ww || 0) > .5) return;
  /* AI_DECLARE_WAR_ONLY_IF_GOLD/STABILITY/HAPPINESS_OVER; ouro relativo como WAR_PREPARATION_MIN_BUDGET_RATIO .75 */
  if (k.gold < Math.max(80, income(g, c).gross * .25) || stats(g, c).st < .55 || k.hap < .38) return;
  if (k.aggP == null) k.aggP = AOH.aggMin + R(g) * AOH.aggRand; if (R(g) > k.aggP + inq) return;
  const sea_ = new Set(); if (R(g) < .3) for (const p of mine) if (p.b.port) for (const i of g.map.sea[p.id]) { const o = g.p[i].own; if (o > 1 && o !== c) sea_.add(o); }
  const cand = g.c.filter(o => o.alive && o.id > 1 && o.id !== c && (bord(g, c, o.id) || sea_.has(o.id)) && !friendly(g, c, o.id) && !hasD(g, c, o.id, 'truce') && !hasD(g, c, o.id, 'nap') && g.rel[c][o.id] <= (isH(g, o.id) ? AOH.maxRelPlayer : AOH.maxRel + 25 * ((k.aggP || .6) - .4) + inq * 60)); if (!cand.length) return;
  const cx = g.map.cx, cy = g.map.cy, dist = o => k.cap >= 0 && o.cap >= 0 ? (cx[k.cap] - cx[o.cap]) ** 2 + (cy[k.cap] - cy[o.cap]) ** 2 : 1e15;
  const near = cand.sort((a, b) => dist(a) - dist(b)).slice(0, AOH.closest); const rv = cand.find(o => o.id === k.rival); if (rv && !near.includes(rv)) near.push(rv);
  const val = o => provs(g, o.id).reduce((s, p) => s + p.eco + p.pop * .05, 0), sco = o => Math.log(1 + val(o)) * Math.sqrt(atk() / Math.max(1, def(o.id) * need(o.id))) * (o.id === k.rival ? 1.4 : 1) * (1 + (25 - g.rel[c][o.id]) / 150) * (.75 + R(g) * .5);
  const ok_ = near.filter(o => ok(o.id)); if (!ok_.length) return; const t = ok_.sort((a, b) => sco(b) - sco(a))[0]; /* vale a pena: riqueza, rival, inimizade e chance de vencer */
  k.plan = { t: t.id, u: g.turn + AOH.prepMin + ri(g, 0, AOH.prepRand), w: t.id === k.rival ? 'rivalidade' : wmCount(g, t.id) ? 'oportunismo' : 'expansão' };
}
/* Paz com as regras do AoH2 (gvCapitulation, gvAiWar, gvCeasefire) */
function capitulate(g, w, winSide) { const wn = winSide === 'a' ? w.a : w.b, ls = winSide === 'a' ? w.b : w.a, W = g.c[wn[0]], L = g.c[ls[0]]; if (!W || !L || !L.alive) { applyPeace(g, w, 'sq', winSide); return; }
  const mine = provs(g, L.id), keep = mine.length <= 2 ? 0 : Math.ceil(mine.length * AOH.capLeft); let give = mine.length - keep, n = 0; const taken = new Set();
  const take = (p, to) => { if (taken.has(p.id)) return; taken.add(p.id); if (p.id === L.cap) L.cap = -1; g.c[to].inf += 1; p.own = to; p.ctrl = to; p.st = clamp(p.st - .22, .05, 1); n++; };
  for (const p of mine.filter(p => wn.includes(p.ctrl) && p.id !== L.cap)) { if (give <= 0) break; take(p, p.ctrl); give--; }
  while (give > 0) { const nx = mine.filter(p => !taken.has(p.id) && (p.id !== L.cap || keep === 0) && g.map.neigh[p.id].some(i => wn.includes(g.p[i].own))); if (!nx.length) break; for (const p of nx) { if (give <= 0) break; take(p, g.map.neigh[p.id].map(i => g.p[i].own).find(o => wn.includes(o))); give--; } }
  w.big = 0; applyPeace(g, w, 'sq', winSide); for (const a of w.a) for (const b of w.b) setD(g, a, b, 'truce', AOH.truce); S(W, g).won++; S(L, g).lost++;
  const m = L.n + ' capitulou para ' + W.n + ' e cedeu ' + n + (n === 1 ? ' província.' : ' províncias.'); log(g, m, 'peace', W.id); tle(g, 'peace', m, W.id, W.cap); rebuildW(g); }
function aohPeace(g) { for (const w of g.wars.slice()) { if (w.a.concat(w.b).some(c => isH(g, c))) continue; const age = g.turn - w.t, sc = warScore(g, w); let oc = 0;
  for (const p of g.p) if (p.ctrl !== p.own && (w.a.includes(p.ctrl) && w.b.includes(p.own) || w.b.includes(p.ctrl) && w.a.includes(p.own))) oc++;
  if (w.oc !== oc) { w.oc = oc; w.la = g.turn; } if (w.la == null) w.la = w.t; if (w.ls == null || Math.abs(sc - w.ls) > .03) { w.ls = sc; w.lt = g.turn; }
  if (age < 6) continue;
  if (sc >= AOH.capDef) { capitulate(g, w, 'a'); continue; } if (sc <= AOH.capAgg) { capitulate(g, w, 'b'); continue; }
  const losers = sc >= 0 ? w.b : w.a, wwL = Math.max(...losers.map(c => g.c[c].ww || 0)); /* o perdedor cansado oferece o que esta ocupado */
  if (Math.abs(sc) > .3 && wwL > .4 && R(g) < .1) { const side = sc >= 0 ? 'a' : 'b', occ = occupiedBy(g, w, side); if (occ.length) { applyTreaty(g, w, side, occ.map(p => p.id)); for (const a of w.a) for (const b of w.b) setD(g, a, b, 'truce', AOH.truce); continue; } }
  if ((g.turn - w.la > AOH.sqNoAttack && g.turn - w.lt > AOH.sqNoOneAttacked) || g.turn - w.lt > AOH.sqNoProgress || age > AOH.sqTooLong) { applyPeace(g, w, 'sq', 'a'); for (const a of w.a) for (const b of w.b) setD(g, a, b, 'truce', AOH.truce); } } }
const topMemo = new WeakMap(); function topSet(g) { const c0 = topMemo.get(g); if (c0 && c0.t === g.turn) return c0.s; const s = new Set(rank(g).slice(0, 5).map(x => x.id)); topMemo.set(g, { t: g.turn, s }); return s; }
const allySt = (g, c) => { const k = g.c[c]; let s = 0; for (const o of g.c) if (o.alive && o.id !== c && o.id > 1 && (friendly(g, c, o.id) || hasD(g, c, o.id, 'dp'))) s += pw(g, o.id) * .55; return s; };
function aiColonize(g, k, mine) { if (R(g) > .08) return; const cc = colCost(g, k.id); if (k.gold < cc + 40) return; if (g.opt.noCol) return; const fr = new Set(); mine.forEach(p => { g.map.neigh[p.id].forEach(n => { if (g.p[n].own === NEU) fr.add(n); }); if (g.map.coast[p.id]) g.map.sea[p.id].forEach(n => { if (g.p[n].own === NEU) fr.add(n); }); }); const A = expedition(g, k.id) * techM(g, k.id), l = [...fr].map(i => [i, natives(g, i)]).filter(([, n]) => A > n * (1.35 + (1 - k.per.agg) * .5)).sort((a, b) => (g.p[b[0]].pop + g.p[b[0]].eco * 3) / (1 + b[1]) - (g.p[a[0]].pop + g.p[a[0]].eco * 3) / (1 + a[1])); if (l.length) colonize(g, k.id, l[0][0]); }
function aiMil(g, k) {
  const c = k.id, hostile = o => atWar(g, c, o), T = techM(g, c), planT = k.plan ? k.plan.t : -1;
  const my = g._c && g._c.ap ? [...new Set([...(g._c.ap[c] || []), ...(g._c.cp[c] || [])])] : g.p.filter(p => (p.a[c] || 0) > 0 || p.ctrl === c);
  const info = {}, srcOf = {}, calm_ = !wmCount(g, c) && !!g._c && !((g._c.ap[REB] || []).length || (g._c.cp[REB] || []).length);
  for (const p of my) {
    if (p.ctrl !== c && !(p.a[c] > 0)) continue;
    let enemy = 0, adj = [];
    if (calm_) { info[p.id] = { p, enemy, adj, front: false }; continue; }
    for (const n of g.map.neigh[p.id]) { const q = g.p[n]; for (const s in q.a) if (hostile(+s)) enemy += q.a[+s] * techM(g, +s); } for (const n of links(g, p, c)) if (hostile(g.p[n].ctrl)) { adj.push(n); (srcOf[n] = srcOf[n] || []).push(p.id); }
    info[p.id] = { p, enemy, adj, front: adj.length > 0 || enemy > 0 };
  }
  const popCap = stats(g, c).pop * (g.scn && g.scn.map === 'brazil' ? .3 : .16); const ar = g._c ? (g._c.arm[c] || 0) : armyOf(g, c), inWar = wmCount(g, c) > 0 || !!k.plan, inc_ = income(g, c), perS = ar > 50 ? inc_.upk / ar : .0145 * IDEO[k.ideo].up;
  /* orcamento militar (AoH2): ~25% da renda na paz, ~55% em guerra ou preparando guerra */
  const wants = g.turn === 0 ? 0 : Math.min(popCap, Math.max(0, inc_.gross * (inWar ? .55 : .25) / Math.max(1e-6, perS))), wantX = wants, share = 1;
  if (k.gold > (inWar ? 120 : 400) && ar < wantX * share) {
    const ps = provs(g, c).filter(p => p.ctrl === c && !p.rev).sort((a, b) => (info[b.id] ? info[b.id].enemy : 0) + (b.id === k.cap ? 4000 : 0) - (info[a.id] ? info[a.id].enemy : 0) - (a.id === k.cap ? 4000 : 0));
    const n = Math.min(wantX * share - ar, (k.gold - (inWar ? 60 : 300)) / .12); if (ps[0] && n > 50) recruit(g, c, ps[0].id, n);
  }
  if (!Object.keys(info).length) return;
  const avail = {}; for (const id in info) avail[id] = info[id].p.a[c] || 0;
  const targets = [];
  for (const id in info) for (const n of info[id].adj) { const p = g.p[n]; if (!targets.some(t => t.id === n)) { const d = aiEstimate(g, c, n); const val = (1 + p.dev * 2) * (p.id === g.c[p.own].cap ? 5 : 1) * (p.own === c ? 3 : 1) * (p.b.fort ? .8 : 1) * (1 + p.pop / 40000); targets.push({ id: n, d, val, sc: val / (d + 180) }); } }
  targets.sort((a, b) => b.sc - a.sc);
  for (const t of targets) {
    const srcs = (srcOf[t.id] || []).filter(n => info[n] && avail[n] > 0).map(n => ({ n, a: avail[n], keep: Math.min(avail[n], info[n].enemy * .25 / T + (info[n].p.id === k.cap ? 300 : 30)) }));
    let sum = srcs.reduce((s, x) => s + Math.max(0, x.a - x.keep), 0);
    const need = t.d * 1.28 / T;
    if (sum < need || k.mp < 1) continue;
    srcs.sort((a, b) => b.a - a.a); let left = need * 1.15;
    for (const x of srcs) { if (left <= 0 || k.mp < 1) break; const send = Math.min(Math.max(0, x.a - x.keep), left); if (send < 10) continue; if (!order(g, c, x.n, t.id, send)) { avail[x.n] -= send; left -= send; } }
  }
  const dist = bfsFront(g, c, info, planT), war_ = wmCount(g, c) > 0 || !!k.plan, fronts = war_ ? Object.keys(info).filter(id => dist[id] === 0 && info[id].p.ctrl === c).map(Number).sort((x, y) => info[y].enemy - info[x].enemy) : [];
  for (const id in info) {
    const I_ = info[id]; let a = avail[id]; if (a < 40) continue;
    const here = dist[id];
    if (I_.p.ctrl !== c) continue;
    if (here === 0) {
      const eH = (I_.enemy) * 1.6; if (eH > a * T * defM(g, I_.p, c) * 1.7 && !I_.p.b.fort && R(g) < .6) { const rt = g.map.neigh[I_.p.id].filter(n => info[n] && g.p[n].ctrl === c && info[n].enemy < eH * .6).sort((x, y) => (avail[y] || 0) - (avail[x] || 0))[0]; if (rt != null && k.mp > 0) order(g, c, +id, rt, a); }
      continue;
    }
    if (here == null || k.mp < 1) continue;
    /* em guerra: a retaguarda reagrupa direto na frente mais pressionada (marcha interna em uma ordem) */
    if (war_ && here >= 2 && a > 30 && fronts.length) { const keep = I_.p.id === k.cap ? Math.min(a * .25, 400) : 0; let done = false; for (const f of fronts.slice(0, 4)) { if (!order(g, c, +id, f, a - keep)) { done = true; avail[id] -= a - keep; break; } } if (done) continue; }
    let bestN = -1, bd = here;
    for (const n of g.map.neigh[id]) if (dist[n] != null && dist[n] < bd && info[n]) { bd = dist[n]; bestN = n; }
    if (bestN >= 0 && a > 30) order(g, c, +id, bestN, a - (I_.p.id === k.cap ? Math.min(a * .25, 400) : 0));
  }
}
function bfsFront(g, c, info, planT) {
  const dist = {}; let q = [];
  for (const id in info) { const I = info[id]; const planB = planT >= 0 && g.map.neigh[id].some(n => g.p[n].own === planT); if (I.front || planB) { dist[id] = 0; q.push(+id); } }
  if (!q.length && planT < 0) { const k = g.c[c]; for (const id in info) { if (g.map.neigh[id].some(n => g.p[n].own !== c && g.p[n].own > 1 && !friendly(g, c, g.p[n].own))) { dist[id] = 0; q.push(+id); } } }
  while (q.length) { const nq = []; for (const x of q) for (const n of g.map.neigh[x]) if (info[n] && dist[n] == null && g.p[n].ctrl === c) { dist[n] = dist[x] + 1; nq.push(n); } q = nq; }
  return dist;
}

/* ---------- RESOLUÇÃO ---------- */
function resolveMoves(g) {
  const arrivals = [];
  for (const o of g.orders) { const p = g.p[o.f]; const n = Math.min(o.n, p.a[o.c] || 0); if (n <= 0 || !g.c[o.c].alive && o.c !== REB) continue; p.a[o.c] -= n; arrivals.push([o.t, o.c, n, o.f]); }
  for (const [t, c, n] of arrivals) { const p = g.p[t]; if (canEnter(g, c, p) || c === REB) p.a[c] = (p.a[c] || 0) + n; else { const hm = g.c[c].cap; if (hm >= 0) g.p[hm].a[c] = (g.p[hm].a[c] || 0) + n; } }
  g.orders = [];
  for (const p of g.p) battle(g, p);
  for (const p of g.p) { for (const s in p.a) if (!(p.a[s] >= 1)) delete p.a[s]; }
}
function battle(g, p) {
  let loops = 0;
  for (; ;) {
    const sides = Object.keys(p.a).map(Number).filter(s => p.a[s] >= 1); let pair = null, bv = 0;
    for (let i = 0; i < sides.length; i++) for (let j = i + 1; j < sides.length; j++) if (atWar(g, sides[i], sides[j])) { const v = p.a[sides[i]] + p.a[sides[j]]; if (v > bv) { bv = v; pair = [sides[i], sides[j]]; } }
    if (!pair || loops++ > 6) break;
    let [a, b] = pair; if (b === p.ctrl || friendly(g, b, p.ctrl) && !friendly(g, a, p.ctrl)) { const x = a; a = b; b = x; }
    // a defende se controla
    const defA = (a === p.ctrl || friendly(g, a, p.ctrl)) ? defM(g, p, a) : 1, defB = (b === p.ctrl) ? defM(g, p, b) : 1;
    const pa = p.a[a] * techM(g, a) * defA * (.85 + R(g) * .3), pb = p.a[b] * techM(g, b) * defB * (.85 + R(g) * .3);
    const la = Math.min(p.a[a], pb * .34 / Math.max(.5, techM(g, a) * .9)), lb = Math.min(p.a[b], pa * .34 / Math.max(.5, techM(g, b) * .9));
    p.a[a] -= la; p.a[b] -= lb; p.pop = Math.max(200, p.pop - (la + lb) * .02); p.eco = Math.max(100, p.eco * .994);
    const w = g.wars.find(w => (w.a.includes(a) && w.b.includes(b)) || (w.b.includes(a) && w.a.includes(b)));
    if (w) { const sA = w.a.includes(a); w.sc += (sA ? 1 : -1) * (lb - la) * .35; w.casu = (w.casu || 0) + la + lb; }
    if (p.a[a] < p.a[b] * .1 || p.a[a] < 1) { retreat(g, p, a); }
    else if (p.a[b] < p.a[a] * .1 || p.a[b] < 1) { retreat(g, p, b); }
  }
  occupy(g, p);
}
function retreat(g, p, c) { const n = p.a[c]; delete p.a[c]; if (!(n >= 1) || c === REB) return; const t = g.map.neigh[p.id].map(i => g.p[i]).filter(q => q.ctrl === c); if (t.length) t[0].a[c] = (t[0].a[c] || 0) + Math.floor(n * .7); }
function occupy(g, p) {
  const pres = Object.keys(p.a).map(Number).filter(s => p.a[s] >= 1); if (!pres.length) return;
  const friendlyToCtrl = pres.some(s => s === p.ctrl || friendly(g, s, p.ctrl)); if (friendlyToCtrl && p.ctrl === p.own) return;
  if (p.ctrl !== p.own) { const lib = pres.filter(s => s === p.own || friendly(g, s, p.own)); if (lib.length && !pres.some(s => s === p.ctrl)) { p.ctrl = p.own; p.st = clamp(p.st - .03, 0, 1); return; } }
  const occ = pres.filter(s => atWar(g, s, p.ctrl) && !friendly(g, s, p.ctrl)).sort((a, b) => p.a[b] - p.a[a]);
  if (occ.length && !pres.some(s => s === p.ctrl)) { const prev = p.ctrl; p.ctrl = occ[0]; p.st = clamp(p.st - .12, 0, 1); if (p.q) p.q = null; if (p.id === g.c[p.own].cap && p.own > 1) { log(g, g.c[occ[0]].n + ' ocupou a capital de ' + g.c[p.own].n + '!', 'war', occ[0]); provs(g, p.own).forEach(q => q.st = clamp(q.st - .05, 0, 1)); } if (occ[0] === REB && prev !== REB) log(g, 'Rebeldes tomaram ' + p.n + ' (' + g.c[p.own].n + ').', 'rev', p.own); }
}
function nextEcon(g) {
  for (const k of g.c) {
    if (!k.alive || k.id < 2) continue; const c = k.id, inc = income(g, c);
    k.gold += inc.net; k.lastInc = Math.round(inc.net);
    const res = inc.gross * k.bRes, invB = inc.gross * k.bInv, goods = inc.gross * k.bGoods; k.gold -= res + invB + goods;
    const m = provs(g, c); const libs = m.filter(p => p.b.lib).length;
    k.resP += res * .85 * techFr(g, k) * IDEO[k.ideo].res * (1 + .06 * k.sk.res) * 0.26 * (g.resMul || 1) * lawRes(k) * (1 + libs * .05 + m.reduce((s, p) => s + lv(p, 'edu'), 0) * .012) * wonderB(k, 'res') * (k.gold_age > 0 ? 1.2 : 1);
    if ((g.scn && g.tf0 != null && k.tech >= g.tf0 + techA(year(g)) - g.ta0 + 2) || (!g.scn && k.tech >= 64)) k.resP = Math.min(k.resP, techCost(k.tech) * .95); while (k.resP >= techCost(k.tech)) { k.resP -= techCost(k.tech); k.tech++; k.skP++; const nb = ageName(k); if (AGES.some(a => a[0] === k.tech)) log(g, k.n + ' entrou na ' + nb + '.', 'tech', c); }
    if (m.length && invB > 0) { const ec = invB * .07 * eraF(g) / m.length; m.forEach(p => { p.eco += ec * (1 + p.dev * .4) * clamp(1.6 - p.eco / Math.max(1, p.pop) / Math.max(1e-6, g._wpc || 1) * .3, .2, 1.6); dvAdd(p, invB * .000004 / m.length); }); }
    k.hap = clamp(.5 + k.bGoods * 1.3 - k.tax * .5 + (k.festival > 0 ? .1 : 0) - wmCount(g, c) * .05 - (k.ww || 0) * .25 - (k.gold < 0 ? .15 : 0) + lawHap(k) - (k.pov || 0) * .15, 0, 1);
    if (k.festival > 0) k.festival--; if (k.gold_age > 0) k.gold_age--;
    k.dp = clamp(k.dp + 1.2 + k.sk.adm * .15 + IDEO[k.ideo].dip * .5, 0, 40); k.mpMax = 6 + Math.floor(m.length / 3) + k.sk.mil; if (!isH(g, c) && wmCount(g, c) > 0) k.mpMax = Math.round(k.mpMax * 1.6 + 4); k.mp = k.mpMax;
    k.infl = clamp(k.infl + (k.gold > Math.max(1000, inc.gross * 12) ? .002 : -.0015), 0, .5); k.inf = Math.max(0, k.inf - .18);
    if (k.gold < -200) { const ar = g.p.filter(p => p.a[c] > 0); ar.forEach(p => p.a[c] = Math.floor(p.a[c] * .92)); if (isH(g, c)) log(g, 'Tesouro negativo: soldados desertam!', 'bad', c); k.gold = Math.max(k.gold, -1500); }
    if (R(g) < .004 && k.gold_age <= 0) { k.gold_age = 18; log(g, k.n + ' vive uma Era de Ouro!', 'big', c); }
    if (R(g) < .012) { const old = k.leader.n; if (!k.leader.img && !k.leader.ini) { k.leader.n = pick(g, NAMES); k.leader.atk = (R(g) - .4) * .12; k.leader.eco = (R(g) - .4) * .12; log(g, k.leader.n + ' sucedeu ' + old + ' em ' + k.n + '.', 'pol', c); } }
  }
  for (const k of g.c) if (k.alive && k.id > 1 && k.tech > 1) { }
  for (const k of g.c) { if (!k.alive || k.id < 2) continue; let best = 0; for (const o of g.c) if (o.alive && o.id > 1 && o.tech > best && bord(g, k.id, o.id)) best = o.tech; if (best > k.tech + 2) k.resP += techCost(k.tech) * .008 * (g.resMul || 1) * Math.min(1, techFr(g, k)); }
}
const ECO_R = [[1500, .0025], [1750, .0015], [1850, .004], [1914, .008], [1950, .009], [1973, .022], [2008, .014], [2050, .022], [2150, .012], [2300, .005], [2600, .002], [3000, .0008], [1e9, .0003]], POP_R = [[1700, .002], [1800, .004], [1900, .006], [1950, .011], [1970, .02], [2000, .018], [2030, .008], [2060, .005], [2100, .0025], [1e9, .0006]];
const rateAt = (T, y) => { for (const [a, v] of T) if (y < a) return v; return T[T.length - 1][1]; }, eraF = g => clamp(rateAt(ECO_R, year(g)) / .011, .08, 1.3);
const POP_W = [[117, .25], [1000, .3], [1500, .45], [1700, .6], [1805, 1], [1900, 1.6], [1914, 1.8], [1939, 2.3], [1962, 3.1], [1990, 5.3], [2026, 8.2]];
function popAtY(y) { if (y <= POP_W[0][0]) return POP_W[0][1]; for (let i = 1; i < POP_W.length; i++) if (y <= POP_W[i][0]) { const [a, x] = POP_W[i - 1], [b, z] = POP_W[i]; return x + (z - x) * (y - a) / (b - a); } return 8.2; }
/* capacidade de carga do planeta: populacao mundial no maximo ~11,5 bilhoes, proporcional ao ano em que o cenario comeca */
const pfMax = g => g.pfMax || (g.pfMax = 11.5 / popAtY(g.startY));
function popRate(y, dev) { const r = rateAt(POP_R, y); return y < 1950 ? r : r * clamp(2.6 - 3 * dev, .35, 2.2); }
const TECH_A = [[117, 4], [1500, 7], [1805, 12], [1914, 15], [1939, 23], [1962, 26], [2026, 40]];
function techA(y) { if (y >= 2026) return 40 + 26 * (1 - Math.exp(-(y - 2026) / 350)); if (y <= 117) return 4; for (let i = 1; i < TECH_A.length; i++) if (y <= TECH_A[i][0]) { const [a, x] = TECH_A[i - 1], [b, z] = TECH_A[i]; return x + (z - x) * (y - a) / (b - a); } return 40; }
/* ritmo historico da tecnologia (como as Eras do AoH2): quem passa a frente do seu tempo pesquisa mais devagar, quem esta atras alcanca */
function techFr(g, k) { if (!g.scn) return k.tech >= 58 ? clamp(Math.exp((58 - k.tech) * .8), .001, 1) : 1; if (g.tf0 == null) { g.tf0 = Math.max(1, ...g.c.filter(o => o.alive && o.id > 1).map(o => o.tech)); g.ta0 = techA(g.startY); } const f = g.tf0 + techA(year(g)) - g.ta0; return clamp(Math.exp((f + .5 - k.tech) * 1.4), .002, 1.6); }
const devCap = (p, k) => clamp(.18 + (k ? k.tech : 1) * .0145 + (p.dvB || 0), .15, .95), dvAdd = (p, v) => { p.dvB = Math.min(.15, (p.dvB || 0) + v); };
function provTick(g) {
  const m = g.map, yy_ = year(g), er_ = rateAt(ECO_R, yy_); if (!g._wpc || g.turn % 12 === 0) { let e = 0, q = 0; for (const p of g.p) if (p.own > 1) { e += p.eco; q += p.pop; } g._wpc = e / Math.max(1, q); if (!g._wpc0) g._wpc0 = g._wpc; }
  for (const p of g.p) {
    if (p.own <= NEU) { if (p.own === NEU) { if (!p.pn0) p.pn0 = p.pop; if (p.pop < p.pn0 * 2.5) p.pop *= 1.0002; } continue; }
    const k = g.c[p.own], I = IDEO[k.ideo];
    const occ = p.ctrl !== p.own, core = p.core.includes(p.own), rlg = p.rel === k.rel;
    const nonLock = occ ? -.04 : 0;
    const tgt = clamp(.42 + k.hap * .32 + (core ? .12 : -.2) + (rlg ? .06 : -.05) + I.st - Math.min(.18, Math.max(0, g.ix[p.own].size - 35) * .002) + (k.sk.adm * .012) + lv(p, 'seg') * .018 + lawSt(k) + (p.id === k.cap ? .1 : 0) + wonderB(k, 'st') - 1 + (k.lord != null ? -.04 : 0) + (k.flags.rebelS > g.turn ? -.14 : 0), .05, 1);
    p.st += (tgt - p.st) * .08 + nonLock * .3; p.st = clamp(p.st, 0, 1);
    if (!p.p0) p.p0 = p.pop; const pr_ = g.scn ? popRate(yy_, p.dev) / 12 * clamp((pfMax(g) - (p.pf || 1)) / Math.max(.1, pfMax(g) - 1) * 1.5, 0, 1) : 0, popT = p.p0 * (g.scn ? (p.pf = (p.pf || 1) * (1 + pr_)) : 1.45 - .45 * Math.exp(-g.turn / 1440)) * (1 + lv(p, 'mor') * .1 + (p.fc || 0) * .1 + (p.b.farm ? .08 : 0) + lv(p, 'sau') * .02) * (occ ? .8 : 1) * (k.hap > .45 ? 1 : .92) * lawPop(k);
    if (!p.pc0) p.pc0 = p.eco / Math.max(1, p.pop); const pb_ = p.pop; p.pop += (popT - p.pop) * (p.pop < popT ? .006 : .002); if (pr_ > 0 && !occ && p.pop < popT * 1.03) p.pop *= 1 + pr_; if (g.scn && p.pop > p.p0 * pfMax(g) * 2) p.pop = p.p0 * pfMax(g) * 2; if (pb_ > 0) { const rt_ = p.pop / pb_, ph = p.ph || pb_; /* recuperar a populacao perdida devolve a economia; so o crescimento acima do pico e limitado */ p.eco *= rt_ > 1 ? (pb_ < ph ? Math.min(rt_, ph / pb_) * (p.pop > ph ? Math.min(p.pop / ph, 1 + Math.max(pr_, 0)) : 1) : Math.min(rt_, 1 + Math.max(pr_, 0))) : rt_; p.ph = Math.max(ph * .9998, p.pop); }
    /* economia como no AoH2: cresce pela produtividade da epoca, regioes pobres alcancam as ricas (convergencia) e ha saturacao */
    if (g.tA0 == null) { const L0 = g.c.filter(o => o.alive && o.id > 1); g.tA0 = L0.reduce((x, o) => x + o.tech, 0) / Math.max(1, L0.length); }
    if (!occ) { const pc = p.eco / Math.max(1, p.pop), pcCap = (g._wpc0 || g._wpc) * 3 * Math.pow(1.055, k.tech - g.tA0), sat_ = 1 - Math.pow(clamp(pc / pcCap, 0, 1.6), 3), conv = clamp(1 + .45 * Math.log(g._wpc / Math.max(pc, 1e-6)), .4, 2.2), gr = er_ * (.6 + .8 * p.dev) * (.5 + .5 * p.st) * conv * (p.b.work ? 1.15 : 1) * (1 + lv(p, 'ind') * .02 + lv(p, 'inf') * .01) * (sat_ < 0 ? 1 : sat_); p.eco *= 1 + (sat_ < 0 ? sat_ * .02 : gr) / 12; }
    p.eco = Math.min(p.eco, p.pop * Math.max(3.2, g._wpc * 7));
    { const dc = devCap(p, k); p.dev = clamp(p.dev + (dc - p.dev) * (p.dev < dc ? .0007 + (p.b.lib ? .0012 : 0) + lv(p, 'edu') * .00015 : .0015), 0, 1); }
    if (p.q && (p.q.t -= 1) <= 0) { p.b[p.q.b] = (p.b[p.q.b] || 0) + 1; p.q = null; }
    if (p.as > 0) { p.as--; if (p.as === 0) { p.core = p.core.concat([p.own]); p.rel = k.rel; } }
    if (p.st < .22 && p.ctrl === p.own && !p.rev && R(g) < (.018 + (.22 - p.st) * .2) * g.opt.rev) { p.rev = 24; const n = Math.round(p.pop * .025) + 120; p.a[REB] = (p.a[REB] || 0) + n; p.rf = p.rf || rebFaction(g, p); if (isH(g, p.own)) log(g, 'Revolta em ' + p.n + '!', 'rev', p.own); }
    if (p.rev > 0) p.rev--;
    if (p.ctrl === REB && (p.a[REB] || 0) < 2) { p.ctrl = p.own; }
    if (p.ctrl === REB && p.id !== k.cap && g.turn % 6 === 0 && R(g) < .08 * g.opt.rev) splinter(g, p);
    if (p.a[REB] && R(g) < .1) p.a[REB] = Math.floor(p.a[REB] * .9);
    if (p.a[p.own] && p.ctrl !== p.own) { }
    for (const s in p.a) { const c = +s; if (c === REB || !(p.a[c] >= 1) || p.ctrl === c || friendly(g, c, p.ctrl)) continue; const supp = (p.b.sup && p.own === c) ? .4 : 1; p.a[c] *= 1 - .012 * supp; }
    if (R(g) < .002 && p.pop > 1500) { const r = pick(g, m.neigh[p.id] || [p.id]); if (r != null && g.p[r].own === p.own) g.p[r].pop += p.pop * .02; p.pop *= .98; }
    if (g.p[p.id].pop > 800 && k.rel !== p.rel && R(g) < .003 && p.st > .55) p.rel = k.rel;
  }
  for (const k of g.c) if (k.alive && k.lord != null && !g.c[k.lord].alive) k.lord = null;
}
function dzTick(g) {
  const m = g.map;
  const yy = year(g); if (g.dzY !== yy) { g.dzY = yy; g.dzNorm = .33 / Math.max(.01, DIS.reduce((a, d) => a + (yy >= d[6] && yy <= d[7] ? d[1] : 0), 0)); } for (let i = 0; i < DIS.length; i++) if (yy >= DIS[i][6] && yy <= DIS[i][7] && R(g) < DIS[i][1] * g.dzNorm * .12 * g.opt.ev) { const c = g.p.filter(p => !p.dz && p.own > 1 && p.pop > 1500); if (!c.length) break; const p0 = pick(g, c), n = ri(g, 2, 6), q = [p0]; g.dzN = (g.dzN || 0) + 1; while (q.length < n) { const nb = g.map.neigh[pick(g, q).id].map(x => g.p[x]).filter(x => !q.includes(x) && !x.dz); if (!nb.length) break; q.push(pick(g, nb)); } q.forEach(p => p.dz = { i, t: DIS[i][4] + ri(g, 0, 8) }); if (isH(g, p0.own)) log(g, 'Surto de ' + DIS[i][0] + ' em ' + p0.n + '!', 'bad', p0.own); }
  const nw = [];
  for (const p of g.p) {
    if (!p.dz) continue; const D = DIS[p.dz.i], k = g.c[p.own];
    const res = (p.b.sup ? .55 : 1) * (1 - lv(p, 'sau') * .06) * (1 - p.dev * .35) * (k.tech > 6 ? .8 : 1);
    { const dead = p.pop * D[2] * res * .8 * (year(g) < 1945 ? 2.5 : 1) * (LW(k, 'sau') === 'pub' ? .7 : 1); if (p.own > 1) { const z = S(k, g).dzk; z[p.dz.i] = (z[p.dz.i] || 0) + dead; } p.pop = Math.max(150, p.pop - dead); } p.st = clamp(p.st - .01 - D[2] * .3, 0, 1); p.eco *= 1 - D[2] * .25 * res;
    for (const n of m.neigh[p.id]) if (!g.p[n].dz && R(g) < D[3] * .017) nw.push([n, p.dz.i]);
    if ((--p.dz.t) <= 0) p.dz = null;
  }
  for (const [n, i] of nw) if (!g.p[n].dz) g.p[n].dz = { i, t: DIS[i][4] };
}

/* ---------- EVENTOS ---------- */
const prov0 = (g, c) => pick(g, provs(g, c));
const nbC = (g, c) => g.c.filter(o => o.alive && o.id > 1 && o.id !== c && bord(g, c, o.id));
const EV = [
  { id: 'colheita', t: 'Colheita abundante', x: 'Os celeiros transbordam este ano.', ch: [{ t: 'Distribuir ao povo (+estabilidade)', f: (g, k) => mStab(g, k, .07), ai: 2 }, { t: 'Vender o excedente (+ouro)', f: (g, k) => k.gold += 190, ai: 3 }] },
  { id: 'fome', t: 'Fome', x: 'As chuvas falharam e o povo passa fome.', w: (g, k) => k.hap < .7, ch: [{ t: 'Comprar grãos (-200 ouro)', f: (g, k) => { k.gold -= 200; }, ai: 3 }, { t: 'Deixar como está', f: (g, k) => { mPop(g, k, -.05); mStab(g, k, -.1); }, ai: 1 }] },
  { id: 'ouro', t: 'Veio de ouro', x: 'Mineiros acharam um veio riquíssimo.', ch: [{ t: 'Explorar (+350 ouro, +inflação)', f: (g, k) => { k.gold += 350; k.infl += .02; }, ai: 3 }, { t: 'Explorar com calma (+150 ouro)', f: (g, k) => k.gold += 150, ai: 2 }] },
  { id: 'terremoto', t: 'Terremoto', x: 'A terra tremeu e cidades ruíram.', ch: [{ t: 'Reconstruir (-150 ouro)', f: (g, k) => { k.gold -= 150; hit(g, k, .04, .04); }, ai: 3 }, { t: 'Rezar', f: (g, k) => hit(g, k, .14, .14), ai: 1 }] },
  { id: 'peste', t: 'Boatos de peste', x: 'Viajantes chegam tossindo pelas estradas.', ch: [{ t: 'Fechar as fronteiras (-100 ouro)', f: (g, k) => { k.gold -= 100; }, ai: 2 }, { t: 'Ignorar', f: (g, k) => { const p = prov0(g, k.id); if (p) p.dz = { i: ri(g, 0, DIS.length - 2), t: 10 }; }, ai: 1 }] },
  { id: 'sabio', t: 'Sábio errante', x: 'Um sábio oferece seus conhecimentos.', ch: [{ t: 'Patrocinar (-120 ouro, +pesquisa)', f: (g, k) => { k.gold -= 120; k.resP += techCost(k.tech) * .4 * Math.min(1, techFr(g, k)); }, ai: 3 }, { t: 'Mandar embora', f: () => { }, ai: 0 }] },
  { id: 'general', t: 'General brilhante', x: 'Um oficial se destaca nas campanhas.', ch: [{ t: 'Promover (+bônus militar)', f: (g, k) => { k.leader.atk = clamp((k.leader.atk || 0) + .05, -.1, .25); }, ai: 3 }, { t: 'Temer um golpe', f: (g, k) => mStab(g, k, .03), ai: 1 }] },
  { id: 'golpe', t: 'Conspiração no palácio', x: 'Generais ambiciosos planejam um golpe.', w: (g, k) => k.hap < .55, ch: [{ t: 'Purga (-exército, +estabilidade)', f: (g, k) => { mArmy(g, k, .85); mStab(g, k, .08); }, ai: 3 }, { t: 'Ceder aos generais (muda o governo)', f: (g, k) => { if (k.bonga) return; setGov(g, k, 'dit', 'golpe'); mStab(g, k, -.05); }, ai: 1 }] },
  { id: 'revolucao', t: 'Revolução popular', x: 'O povo marcha contra o regime.', w: (g, k) => k.hap < .45 && k.ideo !== 'com' && k.ideo !== 'rep', ch: [{ t: 'Reprimir', f: (g, k) => { mStab(g, k, -.12); mPop(g, k, -.02); }, ai: 1 }, { t: 'Aceitar a república', f: (g, k) => { if (k.bonga) { mStab(g, k, .05); return; } k.ideo = 'rep'; mStab(g, k, .1); log(g, k.n + ' tornou-se República.', 'pol', k.id); }, ai: 2 }] },
  { id: 'comercio', t: 'Caravana estrangeira', x: 'Mercadores pedem passagem.', ch: [{ t: 'Cobrar pedágio (+120 ouro)', f: (g, k) => k.gold += 120, ai: 2 }, { t: 'Deixar passar (+relações)', f: (g, k) => nbC(g, k.id).forEach(o => relCh(g, k.id, o.id, 5)), ai: 2 }] },
  { id: 'casamento', t: 'Casamento real', x: 'Um vizinho propõe união entre as casas.', w: (g, k) => nbC(g, k.id).length > 0, ch: [{ t: 'Aceitar (+relações com vizinho)', f: (g, k) => { relCh(g, k.id, pick(g, nbC(g, k.id)).id, 35); }, ai: 3 }, { t: 'Recusar', f: (g, k) => { relCh(g, k.id, pick(g, nbC(g, k.id)).id, -12); }, ai: 0 }] },
  { id: 'fronteira', t: 'Incidente de fronteira', x: 'Patrulhas se enfrentaram na fronteira.', w: (g, k) => nbC(g, k.id).length > 0, ch: [{ t: 'Pedir desculpas (-50 ouro)', f: (g, k) => k.gold -= 50, ai: 2 }, { t: 'Exigir retratação', f: (g, k) => { relCh(g, k.id, pick(g, nbC(g, k.id)).id, -30); }, ai: 1 }] },
  { id: 'espiao', t: 'Espião capturado', x: 'Um agente estrangeiro foi preso.', w: (g, k) => nbC(g, k.id).length > 0, ch: [{ t: 'Executar', f: (g, k) => { relCh(g, k.id, pick(g, nbC(g, k.id)).id, -22); mStab(g, k, .03); }, ai: 1 }, { t: 'Trocar por informações (+pesquisa)', f: (g, k) => k.resP += techCost(k.tech) * .25 * Math.min(1, techFr(g, k)), ai: 3 }] },
  { id: 'greve', t: 'Greve geral', x: 'Trabalhadores cruzaram os braços.', w: (g, k) => k.tax > .45, ch: [{ t: 'Reduzir impostos', f: (g, k) => { k.tax = clamp(k.tax - .1, .1, .9); mStab(g, k, .06); }, ai: 3 }, { t: 'Ignorar (-economia)', f: (g, k) => hit(g, k, 0, .05), ai: 1 }] },
  { id: 'heresia', t: 'Heresia', x: 'Uma seita ganha fiéis nas províncias.', ch: [{ t: 'Tolerar', f: (g, k) => { const p = prov0(g, k.id); if (p) p.rel = relReal ? (year(g) < 1500 ? ri(g, 0, 9) : year(g) < 1517 ? pick(g, [0, 2, 3, 4, 5, 6]) : ri(g, 0, 7)) : ri(g, 0, RELIG.length - 1); }, ai: 2 }, { t: 'Perseguir', f: (g, k) => mStab(g, k, -.06), ai: 1 }] },
  { id: 'invencao', t: 'Invenção revolucionária', x: 'Um inventor local maravilha a corte.', ch: [{ t: 'Investir na fábrica (+economia)', f: (g, k) => provs(g, k.id).forEach(p => p.eco *= 1 + .07 * eraF(g)), ai: 2 }, { t: 'Publicar (+pesquisa)', f: (g, k) => k.resP += techCost(k.tech) * .55 * Math.min(1, techFr(g, k)), ai: 3 }] },
  { id: 'corrupcao', t: 'Escândalo de corrupção', x: 'Ministros desviaram o tesouro.', w: (g, k) => k.gold > 300, ch: [{ t: 'Prender os culpados', f: (g, k) => { k.gold -= 80; mStab(g, k, .05); }, ai: 3 }, { t: 'Abafar o caso', f: (g, k) => { k.gold *= .75; }, ai: 1 }] },
  { id: 'imigracao', t: 'Onda migratória', x: 'Refugiados pedem abrigo.', ch: [{ t: 'Acolher (+população)', f: (g, k) => { mPop(g, k, .05); mStab(g, k, -.03); }, ai: 3 }, { t: 'Fechar a porta', f: (g, k) => mStab(g, k, .02), ai: 1 }] },
  { id: 'piratas', t: 'Piratas no litoral', x: 'Saqueadores atacam nossos portos.', w: (g, k) => provs(g, k.id).some(p => p.b.port || g.map.coast[p.id]), ch: [{ t: 'Enviar frota (-120 ouro)', f: (g, k) => k.gold -= 120, ai: 2 }, { t: 'Pagar resgate', f: (g, k) => k.gold -= 220, ai: 0 }] },
  { id: 'motim', t: 'Motim nos quartéis', x: 'Soldados exigem soldo atrasado.', w: (g, k) => k.gold < 150, ch: [{ t: 'Dispensar parte da tropa', f: (g, k) => mArmy(g, k, .82), ai: 2 }, { t: 'Prometer pagamento (-estabilidade)', f: (g, k) => mStab(g, k, -.1), ai: 1 }] },
  { id: 'festa', t: 'Festival popular', x: 'O povo quer uma grande festa.', ch: [{ t: 'Bancar (-90 ouro, +felicidade)', f: (g, k) => { k.gold -= 90; k.festival = 6; }, ai: 3 }, { t: 'Economizar', f: () => { }, ai: 1 }] },
  { id: 'cartola', t: 'Febre do Cartola', x: 'Ninguém trabalha: só se fala na escalação da rodada.', ch: [{ t: 'Decretar feriado', f: (g, k) => { hit(g, k, 0, .03); mStab(g, k, .08); }, ai: 2 }, { t: 'Proibir o jogo', f: (g, k) => mStab(g, k, -.07), ai: 1 }] },
  { id: 'banana', t: 'Superssafra de banana', x: 'As bananeiras nunca produziram tanto.', ch: [{ t: 'Exportar (+240 ouro)', f: (g, k) => k.gold += 240, ai: 3 }, { t: 'Banana para todos (+população)', f: (g, k) => mPop(g, k, .03), ai: 2 }] },
  { id: 'rebelfront', t: 'Fervor separatista', x: 'Uma província exige autonomia.', w: (g, k) => provs(g, k.id).length > 6, ch: [{ t: 'Conceder autonomia (-estabilidade local)', f: (g, k) => { const p = prov0(g, k.id); if (p) p.st = .3; }, ai: 2 }, { t: 'Enviar tropas', f: (g, k) => { const p = prov0(g, k.id); if (p) { p.a[k.id] = (p.a[k.id] || 0) + 100; p.st = .5; } k.gold -= 100; }, ai: 3 }] }
];
function mStab(g, k, v) { provs(g, k.id).forEach(p => p.st = clamp(p.st + v, 0, 1)); }
function mPop(g, k, v) { provs(g, k.id).forEach(p => p.pop = Math.max(150, p.pop * (1 + v))); }
function mArmy(g, k, v) { g.p.forEach(p => { if (p.a[k.id]) p.a[k.id] = Math.floor(p.a[k.id] * v); }); }
function hit(g, k, pv, ev) { const p = prov0(g, k.id); if (!p) return; p.pop = Math.max(150, p.pop * (1 - pv)); p.eco *= 1 - ev; }
const GEV = [
  { t: 'Meteoro!', w: .1, f: g => { const p = pick(g, g.p.filter(x => x.own > 1)); if (!p) return; p.pop *= .3; p.eco *= .3; p.b = {}; g.map.neigh[p.id].forEach(n => g.p[n].pop *= .75); return 'Um meteoro devastou ' + p.n + ' (' + g.c[p.own].n + ').'; } },
  { t: 'Vulcão', w: .15, f: g => { const c = g.p.filter(x => x.t === 'mou' && x.own > 1); if (!c.length) return; const p = pick(g, c); p.pop *= .55; p.eco *= .6; return 'Erupção em ' + p.n + '.'; } },
  { t: 'Grande depressão', w: .1, f: g => { g.c.forEach(k => { if (k.alive && k.id > 1) k.gold *= .75; }); g.p.forEach(p => p.eco *= .96); return 'A grande depressão atingiu os mercados do mundo.'; } },
  { t: 'Pandemia', w: .12, f: g => { const c = g.p.filter(x => x.own > 1); const i = ri(g, 0, DIS.length - 1); for (let j = 0; j < 6; j++) pick(g, c).dz = { i, t: DIS[i][4] + 6 }; return 'Pandemia de ' + DIS[i][0] + '!'; } },
  { t: 'Era das Navegações', w: .1, f: g => { g.c.forEach(k => { if (k.alive && k.id > 1) k.dp = clamp(k.dp + 5, 0, 40); }); return 'Novas rotas aproximam os reinos: +diplomacia para todos.'; } },
  { t: 'Inverno rigoroso', w: .2, f: g => { g.p.forEach(p => { if (p.t === 'tun' || p.t === 'mou') { p.pop *= .96; for (const s in p.a) p.a[s] *= .85; } }); return 'Um inverno terrível castigou o norte e as montanhas.'; } },
  { t: 'Boom comercial', w: .15, f: g => { g.p.forEach(p => { if (p.b.port) p.eco *= 1.08; }); return 'As rotas marítimas vivem um boom.'; } },
  { t: 'Cruzada', w: .1, f: g => { const rs = g.c.filter(k => k.alive && k.id > 1 && k.ideo === 'teo' && k.lord == null); if (rs.length < 1) return; const a = pick(g, rs), cand = nbC(g, a.id).filter(o => o.rel !== a.rel && !atWar(g, a.id, o.id) && !canDeclare(g, a.id, o.id) && !isH(g, o.id)); if (!cand.length) return; declareWar(g, a.id, pick(g, cand).id, 'cruzada'); return a.n + ' convocou uma cruzada!'; } },
  { t: 'Coalizão', w: .12, f: g => { const v = g.c.filter(k => k.alive && k.id > 1).sort((a, b) => b.inf - a.inf)[0]; if (!v || v.inf < 22) return; let n = 0; for (const o of nbC(g, v.id)) { relCh(g, o.id, v.id, -35); n++; } return n ? 'Reinos se indignam com ' + v.n + ' e pregam uma coalizão.' : null; } }
];
function runEvents(g) {
  for (const k of g.c) {
    if (!k.alive || k.id < 2 || R(g) > (isH(g, k.id) ? .05 : .035) * g.opt.ev) continue;
    const pool = EV.filter(e => !e.w || e.w(g, k)); if (!pool.length) continue; const e = pick(g, pool), id = EV.indexOf(e);
    if (isH(g, k.id)) { g.inbox.push({ to: k.id, k: 'ev', ev: id, title: e.t, text: e.x, ch: e.ch.map(c => c.t) }); }
    else { let best = e.ch[0], v = -1e9; for (const c of e.ch) { const s = c.ai + R(g) * 1.5 + (c.t.includes('-') && k.gold < 200 ? -2 : 0); if (s > v) { v = s; best = c; } } best.f(g, k); }
  }
  if (R(g) < .08 * g.opt.ev) { const ev = pick(g, GEV); if (R(g) < ev.w * 6) { const m = ev.f(g); if (m) log(g, ev.t + ': ' + m, 'big'); } }
}
function councilTick(g) {
  if (!g.council && g.turn === 24) { const mem = g.c.filter(k => k.alive && k.id > 1).map(k => k.id); g.council = { em: mem[0], m: mem, next: g.turn }; log(g, 'Fundou-se o ' + (g.councilN || 'Grande Conselho dos Bongas') + '.', 'big'); }
  const C = g.council; if (!C) return; C.m = C.m.filter(x => g.c[x].alive);
  if (!C.m.length) { g.council = null; return; }
  if (g.turn >= C.next) { const votes = {}; for (const v of C.m) { let bid = -1, bb = -1e9; for (const c of C.m) { const s = pw(g, c) * .001 + g.rel[v][c] * 2 + (c === v ? 24 : 0); if (s > bb) { bb = s; bid = c; } } votes[bid] = (votes[bid] || 0) + 1; } let w = C.m[0], ww = -1; for (const c in votes) if (votes[c] > ww) { ww = votes[c]; w = +c; } C.em = w; C.next = g.turn + 60; log(g, g.c[w].n + ' foi eleito Imperador do Conselho!', 'big', w); }
  const E0 = g.c[C.em]; if (E0 && E0.alive) { E0.dp = clamp(E0.dp + .7, 0, 40); E0.gold += 15 + C.m.length * 3; }
}
function checkOver(g) { /* mundo sem fim: nao ha vitoria nem data final */ const live = g.humans.filter(h => g.c[h].alive); if (live.length !== g.humans.length) { g.humans.filter(h => !g.c[h].alive).forEach(h => log(g, g.c[h].n + ' caiu. O mundo segue sem ela.', 'big', h)); g.humans = live; if (!live.includes(g.player)) g.player = live.length ? live[0] : -1; } }
function score(g, c) { const r = scoreAll(g).get(c); return r ? r.t : 0; }
/* ranking guardado por mes: era recalculado dezenas de vezes por turno */
function rank(g) { if (g._rk && g._rkT === g.turn && g._rkN === g.c.length) return g._rk.slice(); const r = g.c.filter(k => k.alive && k.id > 1).map(k => ({ id: k.id, score: score(g, k.id) })).sort((a, b) => b.score - a.score); g._rk = r; g._rkT = g.turn; g._rkN = g.c.length; return r.slice(); }

function endTurn(g) {
  if (g.over && !g.cont) return;
  const before = g.p.map(p => p.own);
  const ais = shuffle(g, g.c.filter(k => k.alive && k.id > 1 && !isH(g, k.id)));
  { const pa = preAI.get(g); if (pa && pa.done) { preAI.delete(g); buildCache(g); } else { preAI.delete(g); buildCache(g); for (const k of ais) aiTurn(g, k); } }
  rebelsAI(g);
  resolveMoves(g); fixCaps(g); checkDead(g); buildCache(g);
  nextEcon(g); provTick(g); dzTick(g); checkDead(g); fixCaps(g);
  runEvents(g); councilTick(g); upheaval(g); g._c = null; sysTick(g); govTick(g); catTick(g); nukeTick(g); treatyTick(g); rareTick(g); cupTick(g); olyTick(g); alTick(g); relDrift(g); empireTick(g); worldSample(g);
  g.turn++;
  for (const k in g.dip) { const d = g.dip[k]; if (d.nap && d.nap <= g.turn) delete d.nap; }
  for (const k of g.c) { if (!k.alive || k.id < 2) continue; if (g.turn % 3 === 0) { const s = stats(g, k.id); k.h.push([g.turn, Math.round(s.pop), Math.round(s.eco), Math.round(s.army), s.n, Math.round(k.gold), k.tech, score(g, k.id)]); if (k.h.length > 300) k.h = k.h.filter((_, i) => i % 2 === 0 || i > 200); } }
  const ch = []; g.p.forEach((p, i) => { if (p.own !== before[i]) ch.push([i, p.own]); }); if (ch.length) g.tl.push([g.turn, ch]); if (g.tl.length > 3000) { /* nada se perde: o passado e agrupado de 4 em 4 (menos detalhe de tempo, mesmo comeco e mesmo fim) */ const old = g.tl.splice(0, 2000), mg = []; for (let i = 0; i < old.length; i += 4) { const M = new Map(); let t = 0; for (const e of old.slice(i, i + 4)) { t = e[0]; for (const [p, o] of e[1]) M.set(p, o); } mg.push([t, [...M]]); } g.tl.unshift(...mg); }
  checkOver(g);
}
function rebelsAI(g) { for (const p of g.p) { if (!(p.a[REB] >= 1)) continue; if (p.ctrl !== REB && R(g) < .4) { /* já ocupará */ } const n = g.map.neigh[p.id].filter(i => g.p[i].ctrl !== REB && g.p[i].own > 1 && (g.p[i].a[g.p[i].ctrl] || 0) < p.a[REB] * .5); if (p.ctrl === REB && n.length && p.a[REB] > 600 && R(g) < .25) { const t = pick(g, n), m = Math.floor(p.a[REB] * .5); p.a[REB] -= m; g.p[t].a[REB] = (g.p[t].a[REB] || 0) + m; if (p.rf && !g.p[t].rf) g.p[t].rf = p.rf; } } }

/* --- caixa de entrada do jogador --- */
function answer(g, idx, ch) {
  const m = g.inbox[idx]; if (!m) return; g.inbox.splice(idx, 1); const k = g.c[m.to];
  if (m.k === 'ev') { EV[m.ev].ch[ch].f(g, k); }
  else if (m.k === 'call') { const w = g.wars.find(x => x.id === m.w); if (w && ch === 0) { w.a.push(m.to); rebuildW(g); log(g, k.n + ' entrou na guerra ao lado da aliança.', 'war', m.to); } }
  else if (m.k === 'prop' && ch === 0) { if (m.p === 'nap') { setD(g, m.to, m.from, 'nap', 36); log(g, 'Pacto com ' + g.c[m.from].n + '.', 'dip', m.to); } }
  else if (m.k === 'peace') { const w = g.wars.find(x => x.id === m.w); if (w && ch === 0 && m.t === 'treaty') applyTreaty(g, w, m.side, m.ids); else if (w && ch === 0) { if (m.t === 'repar_w') applyPeace(g, w, 'repar', m.side === 'a' ? 'b' : 'a'); else if (m.t === 'sq') applyPeace(g, w, 'sq', m.side); else applyPeace(g, w, m.t, m.side); } }
}
function console_(g, line) {
  const [cmd, ...a] = line.trim().split(/\s+/), k = g.c[g.player >= 0 ? g.player : 2];
  if (cmd === 'ouro') { k.gold += +a[0] || 1000; return 'Ouro adicionado.'; } if (cmd === 'tech') { k.tech += +a[0] || 1; return 'Tecnologia aumentada.'; } if (cmd === 'exercito') { const p = g.p[k.cap]; p.a[k.id] = (p.a[k.id] || 0) + (+a[0] || 5000); return 'Tropas na capital.'; }
  if (cmd === 'evento') { const e = pick(g, EV); if (g.player >= 0) g.inbox.push({ to: g.player, k: 'ev', ev: EV.indexOf(e), title: e.t, text: e.x, ch: e.ch.map(c => c.t) }); return 'Evento disparado.'; }
  if (cmd === 'meteoro') { const m = GEV[0].f(g); log(g, m, 'big'); return m; } if (cmd === 'pandemia') { const m = GEV[3].f(g); log(g, m, 'big'); return m; }
  return 'Comandos: ouro N, tech N, exercito N, evento, meteoro, pandemia';
}
/* ---------- CIDADES E INVESTIMENTO ---------- */
const INV = {
  inf: { n: 'Infraestrutura', c: 120, d: '+5% de produção por nível, economia cresce mais rápido', i: '🛣' },
  ind: { n: 'Indústria', c: 170, d: '+10% de produção por nível', i: '🏭' },
  com: { n: 'Comércio', c: 140, d: '+8% de impostos por nível', i: '🏬' },
  ene: { n: 'Energia', c: 150, d: '+4% de produção por nível', i: '⚡' },
  edu: { n: 'Educação', c: 150, d: '+1,2% de pesquisa nacional por nível', i: '🎓' },
  sau: { n: 'Saúde', c: 130, d: 'população cresce mais e doenças matam menos', i: '🏥' },
  mor: { n: 'Moradia', c: 110, d: '+12% de limite populacional por nível', i: '🏘' },
  tur: { n: 'Turismo', c: 130, d: 'renda fixa por nível, maior em cidades desenvolvidas', i: '🎡' },
  seg: { n: 'Segurança', c: 120, d: 'estabilidade local maior e menos revoltas', i: '🛡' }
};
const MAXLV = 10, cityPop = p => p.pop / 1000;
function cityTier(p) { const v = cityPop(p) + lv(p, 'mor') * 3 + (p.fc || 0) * 4; return v < 5 ? 'Vila' : v < 14 ? 'Cidade' : v < 32 ? 'Grande cidade' : v < 60 ? 'Metrópole' : 'Megalópole'; }
function cityCost(p, k) { return Math.round(INV[k].c * Math.pow(1.5, lv(p, k)) * (1 + cityPop(p) / 60)); }
function investCity(g, c, pid, key) {
  const p = g.p[pid], K = g.c[c]; if (p.own !== c || p.ctrl !== c) return 'Essa cidade não é sua.'; if (lv(p, key) >= MAXLV) return 'Nível máximo.';
  const v = cityCost(p, key); if (K.gold < v) return 'Ouro insuficiente (' + v + ').'; K.gold -= v; p.ci[key] = lv(p, key) + 1; dvAdd(p, .004); p.dev = clamp(p.dev + .006, 0, 1); return null;
}
function foreignInvest(g, c, pid, amt) {
  const p = g.p[pid], K = g.c[c]; if (p.own === c || p.own < 2) return 'Só em cidades estrangeiras.'; if (atWar(g, c, p.own)) return 'Vocês estão em guerra.'; if (K.gold < amt) return 'Ouro insuficiente.';
  K.gold -= amt; (p.fi = p.fi || {})[c] = (p.fi[c] || 0) + amt; p.eco += amt * .5 * eraF(g); dvAdd(p, amt * .00002); p.dev = clamp(p.dev + amt * .00002, 0, 1); relCh(g, c, p.own, Math.min(8, Math.round(amt / 60))); return null;
}
function nationalize(g, c, pid) { const p = g.p[pid]; if (p.own !== c || !p.fi) return 'Nada para estatizar.'; for (const f in p.fi) { relCh(g, c, +f, -35); } p.fi = null; provs(g, c).forEach(q => q.st = clamp(q.st + .01, 0, 1)); log(g, g.c[c].n + ' estatizou investimentos estrangeiros em ' + p.n + '.', 'pol', c); return null; }
function foundCity(g, c, pid) { const p = g.p[pid], K = g.c[c], n = p.fc || 0; if (p.own !== c || p.ctrl !== c) return 'Essa província não é sua.'; if (n >= 3) return 'Já há cidades demais aqui.'; const v = 350 * (n + 1); if (K.gold < v) return 'Ouro insuficiente (' + v + ').'; K.gold -= v; p.fc = n + 1; p.pop += 1800; p.eco += 500; log(g, K.n + ' fundou uma cidade nova em ' + p.n + '.', 'pol', c); return null; }
function aiInvest(g, k, mine, war) {
  const c = k.id; if (war || k.gold < 700 || R(g) > .55) return;
  const top = mine.filter(p => p.ctrl === c).sort((a, b) => b.pop - a.pop).slice(0, 5); if (!top.length) return;
  const p = pick(g, top), st = p.st < .5, keys = st ? ['seg', 'sau'] : ['ind', 'inf', 'com', 'edu', 'ene', 'sau', 'mor', 'tur'], key = keys.slice().sort((a, b) => lv(p, a) - lv(p, b) + (R(g) - .5) * 2)[0];
  if (cityCost(p, key) < k.gold - 350) investCity(g, c, p.id, key);
  if (k.gold > 2400 && R(g) < .07) { const fr = g.c.filter(o => o.alive && o.id > 1 && o.id !== c && g.rel[c][o.id] > 30); if (fr.length) { const t = pick(g, provs(g, pick(g, fr).id)); if (t) foreignInvest(g, c, t.id, 300); } }
}

/* ---------- REVOLTAS, RENASCIMENTOS, GUERRAS CIVIS ---------- */
const HIST_BR = [['República Rio-Grandense', 'Porto Alegre'], ['República Juliana', 'Criciúma'], ['Confederação do Equador', 'Recife'], ['Brasil Holandês', 'Recife'], ['República do Acre', 'Rio Branco'], ['Província Cisplatina', 'Uruguaiana'], ['Quilombo dos Palmares', 'União dos Palmares'], ['República de Canudos', 'Euclides da Cunha'], ['República Cabana', 'Belém'], ['Estado do Grão-Pará', 'Belém'], ['República Bahiense', 'Salvador'], ['República Bracarense', 'Ouro Preto'], ['República Mineira', 'Belo Horizonte'], ['República Paulista', 'São Paulo'], ['Monarquia Sul-Brasileira', 'Caçador'], ['França Antártica', 'Rio de Janeiro'], ['Império do Brasil', 'Rio de Janeiro'], ['Estado da Guanabara', 'Rio de Janeiro'], ['Território de Ponta Porã', 'Ponta Porã'], ['Território do Iguaçu', 'Foz do Iguaçu'], ['Capitania de São Vicente', 'Santos'], ['República de Pernambuco', 'Caruaru'], ['Balaiada Livre', 'Caxias'], ['Estado do Maranhão', 'São Luís'], ['Capitania do Ceará', 'Sobral'], ['Nação Tupinambá', 'Porto Seguro'], ['Nação Guarani', 'Dourados'], ['Nação Yanomami', 'Boa Vista'], ['Nação Xavante', 'Barra do Garças'], ['República do Cunani', 'Oiapoque']];
function pal(g) { const h = R(g), s = .5 + R(g) * .3, l = .4 + R(g) * .2; return hsl(h, s, l); }
function hsl(h, s, l) { const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; }
function addCiv(g, n, tech, extra) { const k_ = addCiv0(g, n, tech, extra); if (k_) k_.relNew = 1; return k_; }
function addCiv0(g, n, tech, extra) {
  const id = g.c.length, col = pal(g), k = mkCiv(g, id, n, col, Object.assign({ bands: [col, pal(g), [245, 243, 235]], tech, gold: 260 }, extra || {}));
  g.c.push(k); g.c.forEach((_, i) => { if (i < id) g.rel[i].push(-10); }); g.rel.push(new Array(id + 1).fill(-10)); rebuildW(g); return k;
}
function grabNear(g, p, k, old, max) { const seen = new Set([p.id]), q = [p.id]; let n = 1; while (q.length && n < max) { const x = q.shift(); for (const b of g.map.neigh[x]) { const o = g.p[b]; if (seen.has(b) || o.own !== old || o.id === g.c[old].cap) continue; seen.add(b); if (o.st < .55 || R(g) < .25) { o.own = o.ctrl = k.id; o.core = o.core.concat([k.id]); o.a[k.id] = Math.round(o.pop * .02); n++; q.push(b); if (n >= max) break; } } } return n; }
function findHist(g, p) { if (!g.opt.hist) return null; const m = g.map, seen = new Set([p.id]); let fr = [p.id]; for (let d = 0; d < 4; d++) { const c = []; fr.forEach(i => (m.histAt[i] || []).forEach(h => { if (!g.histUsed[h]) c.push(h); })); if (c.length) return pick(g, c); const nx = []; fr.forEach(i => m.neigh[i].forEach(n => { if (!seen.has(n)) { seen.add(n); nx.push(n); } })); fr = nx; } return null; }
function birth(g, p, k, old, msg) { p.own = p.ctrl = k.id; p.core = p.core.concat([k.id]); p.st = .6; delete p.a[REB]; p.a[k.id] = Math.max(300, Math.round(p.pop * .05)); k.cap = p.id; g.p.forEach(q => { if (q.a[REB] && q.own === k.id) delete q.a[REB]; }); log(g, msg, 'rev', k.id); }
function revive(g, id, p) { g.c[id].relNew = 1; const k = g.c[id], old = p.own, tech = g.c[old].tech; k.alive = true; k.gold = 320; k.tech = Math.max(k.tech, tech - 2); k.lord = null; k.ally = null; k.dead = null; k.back = (k.back || 0) + 1; birth(g, p, k, old, k.n + ' ressurgiu das cinzas, libertando ' + p.n + '!'); tle(g, 'back', k.n + ' voltou a existir em ' + p.n + '.', id, p.id); let n = 1; for (const q of provs(g, old)) { if (n >= 10) break; if (q.core.includes(id) && q.id !== g.c[old].cap) { q.own = q.ctrl = id; q.a[id] = Math.round(q.pop * .03); n++; } } if (old > 1) declareWarSafe(g, id, old, 'guerra de restauração'); }
function splinter(g, p) {
  const old = p.own, O = g.c[old]; if (old < 2 || !canBirth(g)) return; const dead = p.core.filter(c => c > 1 && c !== old && !g.c[c].alive);
  if (dead.length && g.opt.hist !== null && R(g) < .75) return revive(g, pick(g, dead), p);
  if (g.c.length >= g.maxC) return; /* tabela cheia: so nacoes extintas podem voltar */
  const h = findHist(g, p); let name = null;
  if (h != null) { g.histUsed[h] = 1; name = g.map.hist[h][0]; }
  else name = placeName(g, p);
  const k = addCiv(g, name, O.tech, { ideo: pick(g, ['rep', 'rep', 'com', 'tri', 'mon']) }); if (p.rf) { k.col = p.rf.col; k.bands = [p.rf.col, [245, 243, 235], p.rf.col]; } g.p.forEach(q => { if (q.rf && p.rf && q.rf.n === p.rf.n) q.rf = null; }); birth(g, p, k, old, 'Rebeldes fundaram ' + k.n + ', separando-se de ' + O.n + '!'); tle(g, 'indep', k.n + ' declarou independência de ' + O.n + '.', k.id, p.id); grabNear(g, p, k, old, 2 + ri(g, 0, 3)); if (old > 1) declareWarSafe(g, k.id, old, 'guerra de independência');
}
function declareWarSafe(g, a, b, why) { if (a === b || !g.c[a].alive || !g.c[b].alive || warOf(g, a, b)) return; g.wars.push({ id: g.wN++, a: [a], b: [b], t: g.turn, why, s: 0 }); rebuildW(g); }
function civilWar(g, k) {
  const mine = provs(g, k.id).filter(p => p.id !== k.cap && p.ctrl === k.id); if (mine.length < 5 || g.c.length >= g.maxC || !canBirth(g)) return; const p = pick(g, mine), n = Math.ceil(mine.length * (.25 + R(g) * .25));
  const h = findHist(g, p); if (h != null) g.histUsed[h] = 1; const name = h != null ? g.map.hist[h][0] : placeName(g, p);
  const c = addCiv(g, name, k.tech, { ideo: pick(g, ['rep', 'com', 'fas', 'teo']) }); birth(g, p, c, k.id, 'Guerra civil em ' + k.n + '! ' + c.n + ' pegou em armas.'); tle(g, 'war', 'Guerra civil em ' + k.n + ': ' + c.n + ' pegou em armas.', c.id, p.id); grabNear(g, p, c, k.id, n); declareWarSafe(g, c.id, k.id, 'guerra civil');
}
function canBirth(g) { if (!g.scn || g.scn.kind === 'reg') return false; /* modo Bongalia: so os reinos originais, ninguem volta */ if (g.turn < (g.nextB || 0)) return false; const L = g.c.filter(k => k.alive && k.id > 1).length; if (g.n0 == null) g.n0 = L; /* menos nações com o tempo: quanto mais acima do início, mais raro */ const r = L / Math.max(1, g.n0); if (R(g) > .45 / Math.pow(Math.max(r, .6), 5) || (L > 3 && (g.bN || 0) >= 1 + (g.dN || 0) * .7)) { g.nextB = g.turn + 6; return false; } g.bN = (g.bN || 0) + 1; g.nextB = g.turn + Math.round((40 + R(g) * 30) / g.opt.rev); return true; }
function tle(g, k, m, c, p) { const a = g.tle || (g.tle = []); a.push({ t: g.turn, k, m, c: c == null ? -1 : c, p: p == null ? -1 : p }); if (a.length > 3000) { const A = g.tleA || (g.tleA = []); for (const e of a.splice(0, 400)) if (TLE_KEEP.has(e.k) || e.k === "al" && e.m.includes("dissolvida")) A.push([e.t, e.k, e.m, e.c, e.p]); } }
const TLE_KEEP = new Set(["dead", "indep", "back", "war", "peace", "gov", "cat", "nuke", "cup", "oly", "space", "rel", "unif"]);
function tleAll(g) { return (g.tleA || []).map(x => ({ t: x[0], k: x[1], m: x[2], c: x[3], p: x[4] })).concat(g.tle || []); }
function upheaval(g) {
  
  if (g.turn % 3) return;
  for (const k of g.c) { if (!k.alive || k.id < 2 || isH(g, k.id)) continue; const m = provs(g, k.id); if (m.length < 5) continue; const st = m.reduce((s, p) => s + p.st, 0) / m.length; if (st < .46 && R(g) < (.03 + (.46 - st) * .3) * g.opt.rev) civilWar(g, k); }
  const occ = g.p.filter(p => p.own > 1 && p.st < .6 && p.core.some(c => c > 1 && c !== p.own && !g.c[c].alive)); for (let i = 0; i < 2 && occ.length; i++) { const p = pick(g, occ); if (R(g) < .22 * g.opt.rev && p.id !== g.c[p.own].cap && !isH(g, p.own)) splinter(g, p); }
  const un = g.p.filter(p => p.own > 1 && p.st < .42 && !p.core.includes(p.own) && p.ctrl === p.own); if (un.length && R(g) < .35 * g.opt.rev) { const p = pick(g, un); if (p.id !== g.c[p.own].cap) splinter(g, p); }
}
EV.push(
  { id: 'estadio', t: 'Copa em casa', x: 'A federação oferece sediar um grande torneio.', ch: [{ t: 'Construir estádios (-260 ouro, +felicidade)', f: (g, k) => { k.gold -= 260; k.festival = 10; mStab(g, k, .05); }, ai: 2 }, { t: 'Recusar', f: () => { }, ai: 1 }] },
  { id: 'apagao', t: 'Apagão nacional', x: 'A rede elétrica entrou em colapso.', ch: [{ t: 'Modernizar (-180 ouro)', f: (g, k) => { k.gold -= 180; const p = g.p[k.cap]; if (p) p.ci.ene = lv(p, 'ene') + 1; }, ai: 3 }, { t: 'Remendar', f: (g, k) => hit(g, k, 0, .08), ai: 1 }] },
  { id: 'imob', t: 'Bolha imobiliária', x: 'Os preços dispararam nas grandes cidades.', ch: [{ t: 'Conter o crédito', f: (g, k) => { k.infl = Math.max(0, k.infl - .02); mStab(g, k, -.03); }, ai: 3 }, { t: 'Deixar subir (+ouro, inflação)', f: (g, k) => { k.gold += 300; k.infl += .03; }, ai: 1 }] },
  { id: 'investor', t: 'Investidores estrangeiros', x: 'Um consórcio quer abrir fábricas no país.', ch: [{ t: 'Aceitar (+economia)', f: (g, k) => provs(g, k.id).forEach(p => p.eco *= 1 + .04 * eraF(g)), ai: 3 }, { t: 'Proteger a indústria local (+estabilidade)', f: (g, k) => mStab(g, k, .04), ai: 1 }] },
  { id: 'enchente', t: 'Enchente histórica', x: 'Rios transbordaram e cidades estão submersas.', ch: [{ t: 'Socorrer (-170 ouro)', f: (g, k) => { k.gold -= 170; hit(g, k, .02, .03); }, ai: 3 }, { t: 'Aguardar', f: (g, k) => { hit(g, k, .12, .12); mStab(g, k, -.05); }, ai: 1 }] },
  { id: 'nostalgia', t: 'Nostalgia imperial', x: 'Movimentos pedem a volta da antiga bandeira.', w: (g, k) => provs(g, k.id).some(p => p.core.some(c => c > 1 && c !== k.id && !g.c[c].alive)), ch: [{ t: 'Reprimir', f: (g, k) => mStab(g, k, -.06), ai: 2 }, { t: 'Tolerar', f: (g, k) => { const p = provs(g, k.id).find(q => q.core.some(c => c > 1 && c !== k.id && !g.c[c].alive)); if (p) p.st = .2; }, ai: 1 }] },
  { id: 'bonga', t: 'Convocação do Bongas', x: 'O grupo inteiro apareceu sem avisar para o churrasco.', ch: [{ t: 'Abrir a churrasqueira (-60 ouro)', f: (g, k) => { k.gold -= 60; mStab(g, k, .06); }, ai: 3 }, { t: 'Fingir que não está em casa', f: (g, k) => mStab(g, k, -.03), ai: 1 }] }
);
GEV.push(
  { t: 'Onda de independências', w: .08, f: g => { let n = 0; const c = g.p.filter(p => p.own > 1 && !p.core.includes(p.own) && p.id !== g.c[p.own].cap && !isH(g, p.own)); for (let i = 0; i < 4 && c.length && g.c.length < g.maxC; i++) { const p = pick(g, c); if (p.own > 1 && p.own !== REB) { splinter(g, p); n++; } } return n ? 'Territórios ocupados se rebelaram pelo mundo.' : null; } },
  { t: 'Crise mundial do petróleo', w: .1, f: g => { g.c.forEach(k => { if (k.alive && k.id > 1) k.infl = clamp(k.infl + .03, 0, .5); }); return 'O preço da energia disparou e a inflação subiu em todo o mundo.'; } },
  { t: 'Salto tecnológico', w: .1, f: g => { g.c.forEach(k => { if (k.alive && k.id > 1) k.resP += techCost(k.tech) * .3 * Math.min(1, techFr(g, k)); }); return 'Uma descoberta científica acelerou a pesquisa em todo o mundo.'; } }
);

/* ---------- CENÁRIOS DE MAPA REAL ---------- */
function scnMap(id) {
  const d = root.MAPS && root.MAPS[id]; if (!d) throw new Error('Mapa não carregado: ' + id); if (d._m) return d._m;
  const avg = d.p.reduce((s, p) => s + p.km, 0) / d.p.length, m = { vec: 1, W: d.W, H: d.H, P: d.p.length, neigh: d.neigh, sea: d.sea, cx: d.p.map(p => p.x), cy: d.p.map(p => p.y), area: d.p.map(p => clamp(110 * Math.sqrt((p.km + 1) / avg), 66, 200)), coast: d.p.map(p => p.co), ter: d.p.map(p => p.t), data: d, ps: d.p, hist: [], histAt: {} };
  const brH = () => HIST_BR.map(([n, q]) => [n, d.p.findIndex(p => p.n.startsWith(q))]).filter(h => h[1] >= 0);
  if (id !== 'brazil' && root.HIST_WORLD) { m.hist = root.HIST_WORLD.map(([n, x, y]) => { let b = 0, v = 1e18; d.p.forEach((p, i) => { const q = (p.x - x) ** 2 + (p.y - y) ** 2; if (q < v) { v = q; b = i; } }); return [n, b]; }); if (id === 'bongas') m.hist = m.hist.concat(brH()); }
  if (id === 'brazil') m.hist = brH();
  if (id === 'bongas') { const nat = a => d.nat.findIndex(n => n.a3 === a), B = nat('BRA'), A = nat('SEN'); let bv = 1e18, u = -1, w = -1; d.p.forEach((p, i) => { if (p.c !== B || !p.co) return; d.p.forEach((q, j) => { if (q.c !== A || !q.co) return; const v = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (v < bv) { bv = v; u = i; w = j; } }); }); if (u >= 0) { d.sea[u].push(w); d.sea[w].push(u); } }
  m.hist.forEach((h, i) => (m.histAt[h[1]] || (m.histAt[h[1]] = [])).push(i)); d._m = m; return m;
}
const COL = { BRA: [46, 160, 80], USA: [60, 90, 170], CHN: [200, 50, 50], RUS: [110, 130, 90], IND: [235, 150, 60], FRA: [70, 110, 210], DEU: [100, 100, 100], GBR: [190, 70, 90], JPN: [240, 240, 240], ITA: [90, 170, 110], ESP: [230, 190, 60], ARG: [130, 190, 235], CAN: [205, 90, 80], AUS: [230, 170, 90], MEX: [80, 140, 90], TUR: [210, 80, 60], IRN: [80, 150, 120], SAU: [40, 120, 70], EGY: [220, 200, 120], ZAF: [120, 170, 60], POL: [220, 120, 140], UKR: [240, 215, 80], IDN: [200, 110, 90], KOR: [110, 150, 220], PRT: [60, 130, 60], NLD: [240, 130, 40], SWE: [80, 130, 200], NOR: [150, 60, 60], KAZ: [80, 190, 200], DZA: [130, 170, 120], COD: [90, 160, 200], NGA: [60, 170, 90] };
const OTAN = 'USA CAN GBR FRA DEU ITA ESP PRT NLD BEL LUX DNK NOR ISL TUR GRC POL CZE SVK HUN ROU BGR HRV SVN ALB MNE MKD EST LVA LTU FIN SWE'.split(' ');
const IDW = { mon: 'SAU OMN ARE QAT KWT BHR BRN SWZ MAR JOR', com: 'CHN PRK CUB VNM LAO', teo: 'IRN VAT AFG' };
function relInit(g, m0) { setRelig(true); g.relR = 1; const y = g._relY || g.startY, N = m0.nat || []; delete g._relY; g.p.forEach((p, i) => { const q = m0.p[i] || {}, a3 = g.scn.map === 'brazil' ? 'BRA' : (N[q.c] && N[q.c].a3) || 'BRA', am = g.scn.map !== 'brazil' && q.x != null && q.x < m0.W * .405; p.rel = relFor(a3, y, am || g.scn.map === 'brazil' && y <= 1520, (i * 2654435761) >>> 0); }); for (const k of g.c) { if (k.id < 2) continue; const cnt = {}; for (const p of provs(g, k.id)) cnt[p.rel] = (cnt[p.rel] || 0) + p.pop; const b = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (b) k.rel = +b[0]; } }
/* ---------- CONTINENTES E FUTURO ---------- */
const CONT_N = { na: 'América do Norte', sa: 'América do Sul', eu: 'Europa', af: 'África', as: 'Ásia', oc: 'Oceania' };
const CONT_COL = { na: [52, 101, 164], sa: [46, 160, 80], eu: [40, 70, 170], af: [214, 150, 40], as: [200, 50, 50], oc: [40, 170, 190] };
const CONT_A3 = { TUN: 'af', DZA: 'af', MAR: 'af', LBY: 'af', EGY: 'af', ESH: 'af', SAH: 'af', TUR: 'as', GEO: 'as', ARM: 'as', AZE: 'as', KAZ: 'as', CYP: 'eu', CYN: 'eu', ESB: 'eu', WSB: 'eu', ISL: 'eu', FRO: 'eu', GRL: 'na', BMU: 'na', ISR: 'as', PSX: 'as', PSE: 'as', IDN: 'as', TLS: 'as', PNG: 'oc', USG: 'na', KAB: 'as', ATF: 'af', SHN: 'af', IOT: 'as', HMD: 'oc', SGS: 'sa', FLK: 'sa' };
function llXY(m, x, y) { const R_ = m.W / (2 * Math.PI), y0 = m.H * .6241; return [x / m.W * 360 - 180, (2.5 * Math.atan(Math.exp(.8 * (y0 - y) / R_)) - .625 * Math.PI) * 180 / Math.PI]; }
function contLL(lon, lat) { if (lon < -30) return lon < -140 && lat < 30 ? 'oc' : lat > 13.5 || (lon < -77.3 && lat > 7) ? 'na' : 'sa'; if (lon > 150 && lat < 30) return 'oc'; if (lon > 110 && lat < -9) return 'oc'; if (lat > 34.5 && lon < 45 && !(lon > 26 && lat < 42.2 && lon > 32)) return lon > 60 ? 'as' : 'eu'; if (lat > 45 && lon < 60) return 'eu'; if (lat < 37.5 && lon > -26 && lon < 52 && !(lon > 34.5 && lat > 12)) return 'af'; return 'as'; }
function contOfNat(m0, n) { if (CONT_A3[n.a3]) return CONT_A3[n.a3]; const p = m0.p[n.cap]; return p ? contLL(...llXY(m0, p.x, p.y)) : 'as'; }
function contOfProv(m0, i, n) { if (n && CONT_A3[n.a3] && n.a3 !== 'RUS') return CONT_A3[n.a3]; const p = m0.p[i]; return contLL(...llXY(m0, p.x, p.y)); }
const FUT = [
  ['Federação Norte-Americana', 'USA CAN MEX GRL BMU USG UMI', 'rep', 'Aaliyah Brooks', [52, 90, 170], 49],
  ['União Centro-Americana e Caribenha', 'GTM BLZ HND SLV NIC CRI PAN CUB HTI DOM JAM BHS TTO PRI ABW CUW VIR VGB CYM TCA AIA MSR BLM MAF SXM LCA VCT GRD DMA ATG KNA BRB', 'rep', 'Mateo Arévalo', [230, 150, 60], 44],
  ['Brasil Unido', 'BRA PRY URY GUY SUR', 'rep', 'Helena Moreira Duarte', [46, 160, 80], 47],
  ['Confederação Andina', 'COL VEN ECU PER BOL', 'rep', 'Camila Quispe Rojas', [200, 170, 40], 44],
  ['República do Prata', 'ARG CHL FLK SGS', 'rep', 'Tomás Ferreyra Lagos', [120, 180, 230], 45],
  ['Federação Europeia', 'FRA DEU ITA ESP PRT NLD BEL LUX AUT CHE IRL GBR DNK SWE NOR FIN ISL POL CZE SVK HUN SVN HRV ROU BGR GRC MLT CYP EST LVA LTU ALB MKD MNE SRB BIH KOS XKX MDA UKR AND MCO SMR VAT LIE FRO ALD JEY GGY IMN GIB ESB WSB CYN', 'rep', 'Élise Vandenberg', [40, 70, 170], 50],
  ['União Eurasiática', 'RUS BLR KAZ KGZ ARM GEO KAB', 'dit', 'Dmitri Volkonsky', [110, 140, 95], 47],
  ['União Árabe', 'SAU ARE OMN YEM QAT KWT BHR IRQ SYR JOR LBN PSX PSE ISR', 'mon', 'Faisal bin Khalid', [40, 130, 80], 46],
  ['Aliança Túrquica', 'TUR AZE TKM UZB', 'rep', 'Selin Aydın', [200, 60, 60], 46],
  ['República Persa', 'IRN AFG PAK TJK', 'teo', 'Dariush Farahani', [80, 160, 120], 44],
  ['Magreb Unido', 'MAR DZA TUN LBY EGY SDN ESH SAH MRT', 'rep', 'Yasmine Benali', [200, 120, 70], 44],
  ['União da África Ocidental', 'NGA GHA CIV SEN MLI BFA NER GIN SLE LBR TGO BEN GMB GNB CPV', 'rep', 'Adaeze Okonkwo', [230, 190, 50], 45],
  ['Federação da África Oriental', 'ETH KEN TZA UGA RWA BDI SOM DJI ERI SSD SDS SOL SYC', 'rep', 'Amani Wanjiru', [50, 150, 110], 45],
  ['República da África Central', 'COD COG CAF CMR GAB GNQ TCD STP', 'dit', 'Joseph Mbeki-Lunda', [150, 90, 50], 42],
  ['Comunidade da África Austral', 'ZAF NAM BWA ZWE ZMB MOZ MWI AGO LSO SWZ MDG COM MUS', 'rep', 'Thandiwe Mokoena', [60, 120, 200], 46],
  ['Federação Indiana', 'IND BGD NPL BTN LKA MDV', 'rep', 'Ananya Rao', [240, 130, 50], 48],
  ['Grande China', 'CHN TWN MNG HKG MAC', 'com', 'Liu Jianming', [210, 50, 40], 50],
  ['Comunidade do Leste Asiático', 'JPN KOR PRK', 'rep', 'Haruto Kim-Sato', [230, 230, 220], 50],
  ['Federação do Sudeste Asiático', 'IDN MYS SGP PHL THA VNM LAO KHM MMR BRN TLS', 'rep', 'Nguyen Thi Mai', [210, 90, 150], 47],
  ['Commonwealth do Pacífico', 'AUS NZL PNG FJI SLB VUT NCL PYF WSM TON KIR FSM MHL PLW NRU TUV COK NIU ASM GUM MNP WLF NFK PCN CSI ATC IOA HMD CLP', 'rep', 'Olivia Tane-Mackenzie', [40, 170, 190], 48]
];
function newScenario(o) {
  o = Object.assign({}, o, { rosterAll: o.roster, roster: (o.roster || []).filter(r => !r.rm) });
  const m0 = root.MAPS[o.scn.map], seed = o.seed | 0;
  const g = { scn: o.scn, n0: null, ini: null, s: seed ^ 0x51ed27, seed, turn: 0, startY: o.startY || 2026, diff: o.diff == null ? 1 : o.diff, player: -1, humans: [], c: [], p: [], rel: [], dip: {}, wars: [], al: {}, alN: 1, wN: 1, orders: [], log: [], inbox: [], over: null, tl: [], flagsW: {}, council: null, even: !!o.even, vic: o.vic || { dom: .6, year: 0 }, histUsed: {}, maxC: 620, opt: Object.assign({ ev: 1, rev: 1, hist: true, free: !!o.noOthers }, o.opt), councilN: o.scn.kind === 'brazil' ? 'Congresso Nacional' : o.scn.kind === 'bongas' ? 'Grande Conselho dos Bongas' : 'Conselho Mundial' };
  g.c.push(mkCiv(g, NEU, 'Terras Livres', [120, 122, 112], { alive: false })); g.c.push(mkCiv(g, REB, 'Rebeldes', [40, 40, 40], { alive: false }));
  const tm = o.techMod || 0, kind = o.scn.kind, byN = [];
  const flagOf = n => !n.iso ? null : kind === 'brazil' || o.scn.map === 'brazil' ? 'assets/flags/br/' + n.iso + ([].includes(n.iso) ? '.png' : '.svg') : 'assets/flags/iso/' + n.iso + '.svg';
  const techOf = n => clamp(Math.round(16 + 6.5 * Math.log10(Math.max(300, Math.max(0, n.gdp) * 1e6 / Math.max(1, n.pop)) / 1000)) + tm, 2, 40);
  const ideoOf = n => { for (const i in IDW) if (IDW[i].split(' ').includes(n.a3)) return i; return kind === 'brazil' ? 'rep' : 'rep'; };
  const mk = (n, extra) => { const col = COL[n.a3] || hsl((seedHash(n.a3) * .618) % 1, .42 + (seedHash(n.a3 + 's') % 25) / 100, .42 + (seedHash(n.a3 + 'l') % 22) / 100); const k = mkCiv(g, g.c.length, n.n, col, Object.assign({ flag: flagOf(n), tech: techOf(n), ideo: ideoOf(n), gold: 500, a3: n.a3 }, extra || {})); { const L = root.LEADERS && root.LEADERS[n.a3]; k.leader = L ? { n: L.n, img: L.img, ini: L.n[0], t: L.t, atk: 0, eco: 0 } : { n: 'Governo de ' + n.n, img: null, ini: n.n[0], atk: 0, eco: 0 }; if (n.a3 === 'BRA' && g.startY <= 2030) k.elecT = (2030 - g.startY) * 12 + 9; if (n.a3 === 'BRA') { k.terms = 1; k.party = 'PT'; } if (L && L.party) k.party = L.party; if (kind === 'brazil' && g.startY <= 2030) k.elecT = (2030 - g.startY) * 12 + 9; } g.c.push(k); return k; };
  const P = m0.p, N = m0.nat, owner = new Array(P.length).fill(0);
  const finish = () => {
    for (let a = 0; a < g.c.length; a++) g.rel.push(new Array(g.c.length).fill(0));
    P.forEach((q, i) => { g.p.push({ id: i, n: q.n, t: q.t, own: owner[i], ctrl: owner[i], core: owner[i] > 1 ? [owner[i]] : [], pop: Math.max(600, Math.round(85 * Math.pow((q.pop || 0) / 1000 + 1, .62))), eco: Math.max(150, Math.round(6 * Math.pow(Math.max(0, q.gdp || 0) + 1, .62) * TER[q.t].eco)), ci: {}, dev: clamp(.12 + Math.log10(Math.max(0, q.gdp || 0) + 10) * .1, .1, .8), st: .68 + R(g) * .14, rel: 0, a: {}, b: {}, q: null, dz: null, won: null, rev: 0, as: 0 }); });
    for (const k of g.c) { if (k.id < 2) continue; const mine = g.p.filter(p => p.own === k.id); if (!mine.length) { k.alive = false; continue; } if (k.cap < 0 || owner[k.cap] !== k.id) k.cap = mine.slice().sort((a, b) => b.pop - a.pop)[0].id;
      if (g.even) { const tp = mine.reduce((s, p) => s + p.pop, 0) || 1, te = mine.reduce((s, p) => s + p.eco, 0) || 1, f0 = 62000 + mine.length * 900; mine.forEach(p => { p.pop = Math.round(p.pop * f0 / tp); p.eco = Math.round(p.eco * 15000 / te); }); }
      mine.forEach(p => { p.rel = k.rel; p.a[k.id] = Math.round(p.pop * .018) * (p.id === k.cap ? 3 : 1); if (P[p.id].cs.length || p.pop > 9000) { p.ci.inf = Math.min(3, Math.floor(p.pop / 14000)); p.ci.com = Math.min(2, Math.floor(p.pop / 22000)); } if (p.co && p.eco > 1200) p.b.port = 1; }); if (P[k.cap]) g.p[k.cap].b.fort = 1; k.gold = Math.round(380 + mine.reduce((s, p) => s + p.eco, 0) * .02); }
    for (let a = 2; a < g.c.length; a++) for (let b = a + 1; b < g.c.length; b++) { const v = ri(g, -25, 30); g.rel[a][b] = g.rel[b][a] = v; }
    { const rp = P.reduce((s, q) => s + (q.pop || 0), 0), ip = g.p.reduce((s, q) => s + q.pop, 0), rg = P.reduce((s, q) => s + Math.max(0, q.gdp || 0), 0), ie = g.p.reduce((s, q) => s + q.eco, 0); g.popK = rp / Math.max(1, ip); g.gdpK = rg / Math.max(1, ie); g.temp = root.WW && root.WW[kind] && root.WW[kind].temp != null ? root.WW[kind].temp : kind === 'ww1' ? .1 : kind === 'ww2' ? .2 : 1.3; }
    g.ini = g.p.map(p => p.own); attach(g, scnMap(o.scn.map)); log(g, ({ world: 'O mundo de ', brazil: 'A disputa entre os estados começa em ', bongas: 'A era dos Bongas começa em ' })[kind] + g.startY + (kind === 'world' ? ' está em suas mãos.' : '.'), 'big');
  };
  if (kind === 'bongas' && o.bmode === 'partilha') {
    const c = o.roster.map(r => mkBonga(g, r)); const land = P.map((p, i) => i).sort(() => 0), caps = []; const order = shuffle(g, land.filter(i => P[i].cs.length));
    for (const k of c) { let best = -1, bd = -1; for (const p of order.slice(0, 500)) { if (caps.includes(p)) continue; let d = 1e12; for (const q of caps) d = Math.min(d, (P[p].x - P[q].x) ** 2 + (P[p].y - P[q].y) ** 2); if (d > bd) { bd = d; best = p; } } caps.push(best); k.cap = best; owner[best] = k.id; }
    let q = c.map(k => [k.cap, k.id]); while (q.length) { const nx = []; shuffle(g, q); for (const [a, id] of q) for (const b of [...m0.neigh[a], ...m0.sea[a]]) if (!owner[b]) { owner[b] = id; nx.push([b, id]); } q = nx; }
  } else if (root.WW && root.WW[kind]) {
    const W = root.WW[kind], WC = { 'German Empire': [105, 105, 112], Germany: [105, 105, 112], 'United Kingdom': [190, 70, 90], France: [70, 110, 210], Russia: [110, 145, 95], USSR: [190, 50, 50], 'Austro-Hungarian Empire': [214, 190, 140], 'Ottoman Empire': [60, 140, 100], Italy: [95, 175, 115], 'Empire of Japan': [236, 232, 222], 'United States': [60, 90, 170], 'Manchu Empire': [205, 125, 60], 'Chinese warlords': [205, 125, 60], 'Império do Brasil': [46, 150, 80], 'Roman Empire': [160, 40, 55], 'Parthian Empire': [200, 160, 70], Han: [210, 70, 50], 'Ming Chinese Empire': [210, 70, 50], 'Inca Empire': [230, 180, 60], 'Aztec Empire': [70, 150, 120], 'Holy Roman Empire': [230, 200, 80], Castille: [220, 180, 40], Portugal: [40, 110, 70], 'Austrian Empire': [235, 225, 200], 'Russian Empire': [110, 145, 95], Russia: [110, 145, 95], Prussia: [90, 100, 120], 'Gran Colombia': [230, 200, 50], 'West Germany': [105, 105, 112], 'East Germany': [190, 80, 80], China: [210, 60, 50], Brazil: [46, 160, 80], Cuba: [200, 70, 60] };
    g.startY = W.y; g.turn = W.mo; g.resMul = { rome: .25, y1500: .3, nap: .4, imp: .4, ww1: .55, ww2: .55, cold: .9 }[kind] || 1; const major = W.tech ? W.tech[0] : kind === 'ww1' ? 15 : 23, minor = W.tech ? W.tech[1] : kind === 'ww1' ? 9 : 14; g.opt.free = !!W.free;
    W.nat.forEach((n, i) => { const col = WC[n.k] || hsl((seedHash(n.k) * .618) % 1, .42, .46), k = mkCiv(g, g.c.length, n.n, col, { flag: n.flag, bands: [col, [245, 243, 235], [30, 30, 30]], tech: WC[n.k] ? major : n.ln ? minor + 2 : minor, ideo: n.gov, a3: n.a3 }); k.leader = n.ln ? { n: n.ln, img: n.img, ini: n.ln[0], t: TITLE[n.gov], atk: 0, eco: 0 } : { n: (n.gov === 'cid' ? 'Prefeitura de ' : 'Governo de ') + n.n, ini: n.n[0], img: null, atk: 0, eco: 0 }; k.cap = n.cap; if (n.party) k.party = n.party; if (n.gov === 'rep' && W.y >= 2026) k.elecT = (2030 - W.y) * 12 + 9; g.c.push(k); byN[i] = k.id; });
    if (kind === 'reg' && root.LEADERS) { const RU = { Norte: ['PA', 'AM', 'RO'], Nordeste: ['BA', 'PE', 'CE'], 'Centro-Oeste': ['GO', 'MT', 'DF'], Sudeste: ['SP', 'MG', 'RJ'], Sul: ['PR', 'RS', 'SC'] }; W.nat.forEach((n, i) => { const co = (RU[n.k] || []).map(u => root.LEADERS[u]).filter(Boolean); if (co.length < 3) return; const k = g.c[byN[i]]; k.leader = { n: co[0].n + ', ' + co[1].n + ' e ' + co[2].n, co: co.map(x => ({ n: x.n, img: x.img, p: x.party })), img: co[0].img, ini: co[0].n[0], t: 'Presidentes', atk: 0, eco: 0 }; k.party = co[0].party; }); }
    P.forEach((p, i) => owner[i] = W.own[i] >= 0 ? byN[W.own[i]] : 0); g._relY = W.y;
    finish(); { const rk = W.rk || { ww1: [.22, .21], ww2: [.28, .27] }[kind]; if (rk) { g.popK *= rk[0]; g.gdpK *= rk[0] * rk[1]; } } W.al.forEach(([n, m]) => { const id = g.alN++, l = m.map(x => byN[x]).filter(c => g.c[c].alive); g.al[id] = { n, m: l, lead: l[0] }; l.forEach(c => g.c[c].ally = id); }); W.wars.forEach(([a, b, why]) => { const A = a.map(x => byN[x]).filter(c => g.c[c].alive), B = b.map(x => byN[x]).filter(c => g.c[c].alive); if (A.length && B.length) { g.wars.push({ id: g.wN++, a: A, b: B, t: g.turn, sc: 0, why, big: 1 }); tle(g, 'war', g.c[A[0]].n + ' entrou em guerra: ' + why + '.', A[0], g.c[B[0]].cap); } }); rebuildW(g); return g;
  } else if (kind === 'bongas' && o.bmode === 'reinos') {
    const c0 = o.rosterAll.map(r => r.rm ? null : mkBonga(g, r)), c = c0.filter(Boolean); P.forEach((p, i) => { if (p.b != null && c0[p.b]) owner[i] = c0[p.b].id; }); { let q = []; owner.forEach((v, i) => { if (v) q.push(i); }); shuffle(g, q); while (q.length) { const nx = []; for (const a of q) for (const b of m0.neigh[a]) if (P[b].b != null && !owner[b]) { owner[b] = owner[a]; nx.push(b); } q = nx; } }
    for (const k of c) { let mine = owner.reduce((s, v) => s + (v === k.id ? 1 : 0), 0), guard = 0; while (mine < 3 && guard++ < 12) { const size = id => owner.reduce((s, v) => s + (v === id ? 1 : 0), 0); let best = -1, bs = 3; owner.forEach((v, i) => { if (v !== k.id) return; for (const n of m0.neigh[i]) { const o2 = owner[n]; if (P[n].b != null && o2 !== k.id && size(o2) > bs) { bs = size(o2); best = n; } } }); if (best < 0) break; owner[best] = k.id; mine++; } }
    for (let pass = 0; pass < 8; pass++) { let moved = 0; for (const k of c) { const seen = new Set(), comps = []; owner.forEach((v, i) => { if (v !== k.id || seen.has(i)) return; const q = [i], cp = []; seen.add(i); while (q.length) { const x = q.pop(); cp.push(x); for (const n of m0.neigh[x]) if (owner[n] === k.id && !seen.has(n)) { seen.add(n); q.push(n); } } comps.push(cp); }); comps.sort((x, y) => y.length - x.length); for (const cp of comps.slice(1)) for (const i of cp) { const cnt = {}; for (const n of m0.neigh[i]) if (P[n].b != null && owner[n] && owner[n] !== k.id) cnt[owner[n]] = (cnt[owner[n]] || 0) + 1; const best = Object.entries(cnt).sort((x, y) => y[1] - x[1])[0]; if (best) { owner[i] = +best[0]; moved++; } } } if (!moved) break; }
    if (!o.noOthers) { N.forEach((n, i) => { if (n.a3 === 'BRA') return; const k = mk(n); k.cap = n.cap; byN[i] = k.id; }); P.forEach((p, i) => { if (p.b == null) owner[i] = byN[p.c] || 0; }); }
  } else if (kind === 'bongas') {
    const top = N.map((n, i) => i).filter(i => N[i].pop > 2e6).sort((a, b) => N[b].pop - N[a].pop).slice(0, 90); shuffle(g, top); const chosen = new Map(); o.roster.forEach((r, i) => chosen.set(top[i], r));
    N.forEach((n, i) => { const r = chosen.get(i); const k = r ? mkBonga(g, r, { a3: n.a3, tech: techOf(n) }) : mk(n); k.cap = n.cap; byN[i] = k.id; }); P.forEach((p, i) => owner[i] = byN[p.c]);
  } else if (kind === 'cont') {
    const best = {}; N.forEach(n => { const c = contOfNat(m0, n); if (!best[c] || n.gdp > best[c].gdp) best[c] = n; });
    const ids = {}; for (const c of Object.keys(CONT_N)) { const b = best[c], L = b && root.LEADERS && root.LEADERS[b.a3], k = mkCiv(g, g.c.length, CONT_N[c], CONT_COL[c], { flag: 'assets/flags/cont/' + c + '.svg', tech: b ? techOf(b) : 30, ideo: 'rep', gold: 1500, a3: 'C_' + c.toUpperCase() }); k.leader = L ? { n: L.n, img: L.img, ini: L.n[0], t: 'Líder do bloco (' + b.n + ')', atk: 0, eco: 0 } : { n: 'Conselho de ' + CONT_N[c], ini: CONT_N[c][0], img: null, atk: 0, eco: 0 }; if (b) k.cap = b.cap; g.c.push(k); ids[c] = k.id; }
    P.forEach((p, i) => { owner[i] = ids[contOfProv(m0, i, N[p.c])]; });
  } else if (/^c_/.test(kind)) {
    const want = kind.slice(2), out = []; N.forEach((n, i) => { if (contOfNat(m0, n) !== want) return; const k = mk(n); k.cap = n.cap; byN[i] = k.id; }); P.forEach((p, i) => { owner[i] = byN[p.c] || 0; if (!owner[i]) out.push(i); }); g.outP = out; g.opt.noCol = 1;
  } else if (kind === 'fut') {
    g.startY = 2150; const a3B = {}; FUT.forEach((b, i) => b[1].split(' ').forEach(a => a3B[a] = i)); const ks = FUT.map((b, i) => { const k = mkCiv(g, g.c.length, b[0], b[4], { flag: 'assets/flags/fut/' + i + '.svg', tech: b[5], ideo: b[2], gold: 2500, a3: 'F' + i }); k.leader = { n: b[3], img: null, ini: b[3][0], t: TITLE[b[2]] || 'Líder', atk: 0, eco: 0 }; g.c.push(k); return k; });
    const capOf = {}; N.forEach(n => { const i = a3B[n.a3]; if (i != null && (!capOf[i] || n.gdp > capOf[i].gdp)) capOf[i] = n; }); ks.forEach((k, i) => { if (capOf[i]) k.cap = capOf[i].cap; });
    const near = n => { const p = P[n.cap]; let bi = 0, bd = 1e18; ks.forEach((k, i) => { if (k.cap < 0 || !P[k.cap]) return; const d = (P[k.cap].x - p.x) ** 2 + (P[k.cap].y - p.y) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; };
    P.forEach((p, i) => { const n = N[p.c]; const bi = a3B[n.a3] != null ? a3B[n.a3] : near(n); owner[i] = ks[bi].id; }); g._fut = 1;
  } else { N.forEach((n, i) => { const k = mk(n); k.cap = n.cap; byN[i] = k.id; }); P.forEach((p, i) => owner[i] = byN[p.c]); }
  finish();
  if (g._fut) { delete g._fut; g.popK *= 1.25; g.gdpK *= 3.2; g.temp = 2.6; g.tf0 = Math.max(...g.c.filter(k => k.alive && k.id > 1).map(k => k.tech)); g.ta0 = techA(2150); }
  if (g.outP && g.outP.length) { const m = g.map, out = new Set(g.outP), xs = [], ys = []; g.p.forEach(p => { if (out.has(p.id)) return; if (kind === 'c_oc' && m.cx[p.id] < m.W * (280 / 360)) return; xs.push(m.cx[p.id]); ys.push(m.cy[p.id]); }); xs.sort((a, b) => a - b); ys.sort((a, b) => a - b); const q = (A, f) => A[Math.min(A.length - 1, Math.max(0, Math.round((A.length - 1) * f)))], x0 = q(xs, .04), x1 = q(xs, .96), y0 = q(ys, .03), y1 = q(ys, .97); const px = (x1 - x0) * .08 + 40, py = (y1 - y0) * .08 + 40; g.view = [x0 - px, y0 - py, x1 + px, y1 + py]; }
  if (kind === 'world') { const mem = g.c.filter(k => k.alive && OTAN.includes(k.a3)).map(k => k.id); if (mem.length > 1) { g.al[1] = { n: 'OTAN', m: mem }; mem.forEach(c => g.c[c].ally = 1); g.alN = 2; } }
  return g;
}
function mkBonga(g, r, extra) { const k = mkCiv(g, g.c.length, r.n, r.col, Object.assign({ flag: r.flag, tech: 20, ideo: r.gov || 'mon', bonga: 1 }, extra || {})); k.leader = { n: r.ln, img: r.img, ini: r.ini, atk: 0, eco: 0, by: (g.startY || 2026) - ri(g, 21, 25), da: ri(g, 70, 92) }; g.c.push(k); return k; }
function seedHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000; }
function setHumans(g, ids) { g.humans = ids.slice(); g.player = ids.length ? ids[0] : -1; }
function passTurn(g) { const alive = g.humans.filter(h => g.c[h].alive); if (!alive.length) return true; const i = alive.indexOf(g.player), nx = alive[i + 1]; if (nx != null) { g.player = nx; return false; } g.player = alive[0]; return true; }

{ const dw0 = declareWar, ap0 = applyPeace;
  declareWar = function (g, a, b, why) { const n0 = g.wars.length, r = dw0(g, a, b, why); if (g.wars.length > n0) { tradeCut(g, a, b); const w = g.wars[g.wars.length - 1], near = (x, foes) => isH(g, x) || foes.some(o => bord(g, x, o)) || R(g) < .15, A0 = w.a.slice(), B0 = w.b.slice(); w.a = A0.filter((x, i) => i === 0 || near(x, B0)); w.b = B0.filter((x, i) => i === 0 || near(x, A0)); rebuildW(g); w.a.concat(w.b).forEach(c => S(g.c[c], g).wars++); const sz = provs(g, a).length + provs(g, b).length; if (isH(g, a) || isH(g, b) || sz >= g.p.length * .05 || rank(g).slice(0, 10).some(x => x.id === a || x.id === b)) { w.big = 1; tle(g, 'war', g.c[a].n + ' declarou guerra a ' + g.c[b].n + (why ? ' (' + why + ')' : '') + '.', a, g.c[b].cap); } } return r; };
  applyPeace = function (g, w, type, side) { if (type === 'annex' && !w.a.concat(w.b).some(c => isH(g, c))) { const wn = side === 'a' ? w.a : w.b; for (const x of (side === 'a' ? w.b : w.a)) { if (!g.c[x] || !g.c[x].alive) continue; const lim = Math.ceil(provs(g, x).length * ((g._few || 99) <= 4 ? .6 : .3)), mine = provs(g, x).filter(p => p.ctrl !== p.own && wn.includes(p.ctrl)).sort((a, b) => a.pop - b.pop); /* AoH2: sem limite de terras no tratado */ } } const big = w.big, A = g.c[w.a[0]], B = g.c[w.b[0]], wn = side === 'a' ? A : B, ls = side === 'a' ? B : A, r = ap0(g, w, type, side); if (type !== 'sq' && A && B) { S(wn, g).won++; S(ls, g).lost++; } if (big && A && B) tle(g, 'peace', type === 'sq' ? 'Paz entre ' + A.n + ' e ' + B.n + '.' : wn.n + ' venceu a guerra contra ' + ls.n + '.', wn.id, wn.cap); return r; }; }
/* ---------- GOVERNOS, ELEIÇÕES E LÍDERES ---------- */
const NP = {
  lat: [['Mateus', 'Camila', 'Rafael', 'Fernanda', 'Thiago', 'Juliana', 'Diego', 'Valentina', 'Rodrigo', 'Beatriz', 'Sebastián', 'Isabela', 'Gustavo', 'Luciana', 'Andrés', 'Marina'], ['Almeida', 'Rocha', 'Vargas', 'Mendes', 'Herrera', 'Cardoso', 'Pereira', 'Morales', 'Teixeira', 'Fuentes', 'Barbosa', 'Castillo', 'Nogueira', 'Ramírez', 'Monteiro', 'Salazar']],
  en: [['James', 'Emily', 'Thomas', 'Olivia', 'William', 'Grace', 'Henry', 'Sarah', 'Jack', 'Laura', 'Oliver', 'Hannah', 'Daniel', 'Alice', 'George', 'Rachel'], ['Walker', 'Hughes', 'Bennett', 'Foster', 'Campbell', 'Murphy', 'Reed', 'Sullivan', 'Parker', 'Cooper', 'Morgan', 'Hayes', 'Ward', 'Fisher', 'Clarke', 'Dixon']],
  eu: [['Lucas', 'Élise', 'Matteo', 'Giulia', 'Lukas', 'Hanna', 'Pierre', 'Sofia', 'Jonas', 'Chiara', 'Antoine', 'Clara', 'Marco', 'Anna', 'Felix', 'Margot'], ['Lefèvre', 'Ricci', 'Schneider', 'Moreau', 'Bianchi', 'Weber', 'Dubois', 'Conti', 'Vogel', 'Laurent', 'Romano', 'Keller', 'Roux', 'Esposito', 'Becker', 'Girard']],
  sl: [['Ivan', 'Katarina', 'Dmitri', 'Elena', 'Marek', 'Agnieszka', 'Nikolai', 'Milena', 'Andrei', 'Oksana', 'Tomasz', 'Natalia', 'Vuk', 'Irina', 'Stefan', 'Vera'], ['Petrov', 'Kowalska', 'Ivanov', 'Novak', 'Horvat', 'Sokolov', 'Popescu', 'Volkov', 'Nowak', 'Kuznetsov', 'Jovanović', 'Dimitrov', 'Shevchenko', 'Lebedev', 'Marković', 'Zielinski']],
  ar: [['Ahmed', 'Fatima', 'Omar', 'Layla', 'Yusuf', 'Amina', 'Khalid', 'Nour', 'Hassan', 'Zahra', 'Karim', 'Mariam', 'Tariq', 'Salma', 'Ibrahim', 'Dalia'], ['Al-Masri', 'Haddad', 'Al-Rashid', 'Mansour', 'Khoury', 'Al-Farsi', 'Nasser', 'Saleh', 'Hamdan', 'Rahman', 'Darwish', 'Al-Amin', 'Yilmaz', 'Hosseini', 'Demir', 'Karimi']],
  af: [['Kwame', 'Amara', 'Sekou', 'Zainab', 'Tendai', 'Nia', 'Babajide', 'Thandiwe', 'Moussa', 'Adaeze', 'Kofi', 'Wanjiru', 'Jabari', 'Aminata', 'Chidi', 'Lindiwe'], ['Mensah', 'Okafor', 'Diallo', 'Dlamini', 'Traoré', 'Mwangi', 'Nkosi', 'Adeyemi', 'Keita', 'Moyo', 'Abubakar', 'Ndlovu', 'Kamara', 'Otieno', 'Banda', 'Sow']],
  in: [['Arjun', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Meera', 'Imran', 'Aisha', 'Sanjay', 'Kavya', 'Rahul', 'Sana', 'Aditya', 'Lakshmi', 'Farhan', 'Nisha'], ['Sharma', 'Patel', 'Khan', 'Rao', 'Gupta', 'Iyer', 'Malik', 'Chowdhury', 'Singh', 'Nair', 'Hussain', 'Reddy', 'Perera', 'Thapa', 'Das', 'Mehta']],
  ea: [['Wei', 'Mei', 'Haruto', 'Yuki', 'Min-jun', 'Seo-yeon', 'Minh', 'Linh', 'Jun', 'Aiko', 'Arif', 'Dewi', 'Somchai', 'Siti', 'Tao', 'Hana'], ['Chen', 'Tanaka', 'Kim', 'Nguyen', 'Wang', 'Sato', 'Park', 'Tran', 'Li', 'Suzuki', 'Choi', 'Pham', 'Santoso', 'Wong', 'Zhang', 'Lim']]
};
function poolOf(g, k) { const m = g.map; if (!m.vec || !g.scn || g.scn.map === 'brazil' || k.cap < 0) return 'lat'; const lon = m.cx[k.cap] / (m.W / 360) - 180, lat = 84 - m.cy[k.cap] / m.H * 144; if (lon < -30) return lat > 25 ? 'en' : 'lat'; if (lon < 45 && lat >= 36) return lon > 20 ? 'sl' : lat > 50 ? 'en' : 'eu'; if (lat >= 12 && lon < 63) return 'ar'; if (lon < 55) return 'af'; if (lon < 92 && lat > 4) return 'in'; if (lon > 110 && lat < -10) return 'en'; return 'ea'; }
const fictName = (g, k) => { const P = NP[poolOf(g, k)]; return pick(g, P[0]) + ' ' + pick(g, P[1]); };
function S(k, g) { return k.st || (k.st = { born: g ? g.turn : 0, wars: 0, won: 0, lost: 0, coups: 0, elec: 0, maxP: 0, maxArmy: 0, leaders: 0, dzk: {} }); }
const TITLE = { rep: 'Presidente', mon: 'Monarca', dit: 'Ditador', com: 'Secretário-geral', fas: 'Líder supremo', teo: 'Sumo sacerdote', tri: 'Chefe', hor: 'Khan', ari: 'Lorde', cid: 'Prefeito', ana: 'Sem governo' };
function setLeader(g, k, n, title, img) { k.leader = { n, img: img || null, ini: n[0], t: title, atk: (R(g) - .4) * .1, eco: (R(g) - .4) * .1, since: g.turn }; S(k, g).leaders++; (k.lh = k.lh || []).push([g.turn, n, title]);  }
function setGov(g, k, id, why) { let insp = null; if ((why === 'golpe' || why === 'rev') && id !== 'ana' && !k.bonga && R(g) < .35) { const nb = g.c.filter(o => o.alive && o.id > 1 && o.id !== k.id && ['rep', 'mon', 'dit', 'com', 'fas', 'teo'].includes(o.ideo) && o.ideo !== k.ideo && bord(g, k.id, o.id)); if (nb.length) { nb.sort((a, b) => pw(g, b.id) - pw(g, a.id)); id = nb[0].ideo; insp = nb[0].n; } }
  if (k.ideo === id || k.bonga) return; const old = IDEO[k.ideo].n; k.ideo = id; (k.govS = k.govS || []).push([g.turn, id]); provs(g, k.id).forEach(p => p.st = clamp(p.st - .1, 0, 1));
  if (why === 'golpe') S(k, g).coups++;
  if (id === 'ana') { k.anaT = g.turn + ri(g, 6, 30); k.leader = { n: 'Nenhum', ini: '–', t: TITLE.ana, atk: -.1, eco: -.1, img: null }; }
  else { setLeader(g, k, (id === 'dit' ? 'General ' : '') + fictName(g, k), TITLE[id] || 'Líder'); if (id === 'rep') k.elecT = g.turn + 48; }
  const m = id === 'ana' ? k.n + ' mergulhou na anarquia.' : why === 'golpe' ? 'Golpe em ' + k.n + ': ' + old + ' deu lugar a ' + IDEO[id].n + ' com ' + k.leader.n + (insp ? ', inspirado em ' + insp : '') + '.' : k.n + ' mudou de ' + old + ' para ' + IDEO[id].n + '.'; log(g, m, 'pol', k.id); if (rankTop(g, k.id) || isH(g, k.id)) tle(g, 'gov', m, k.id, k.cap);
}
function rankTop(g, id) { return rank(g).slice(0, 15).some(x => x.id === id); }
const SHIFT = { rep: [['dit', 60], ['com', 12], ['mon', 8], ['ana', 20]], mon: [['rep', 50], ['dit', 30], ['ana', 20]], dit: [['rep', 45], ['ana', 30], ['mon', 10], ['com', 15]], com: [['rep', 40], ['dit', 40], ['ana', 20]], def: [['rep', 50], ['dit', 35], ['ana', 15]] };
function pickW(g, l) { let t = l.reduce((s, x) => s + x[1], 0) * R(g); for (const x of l) { t -= x[1]; if (t <= 0) return x[0]; } return l[0][0]; }
const HEIRS = ['Pedro', 'Lucas', 'Miguel', 'Arthur', 'Heitor', 'Theo', 'Davi', 'Bernardo', 'Samuel', 'Benício', 'Gael', 'Bento', 'Joaquim', 'Antônio', 'Francisco', 'Helena', 'Alice', 'Laura', 'Valentina', 'Isabela', 'Manuela', 'Júlia', 'Luísa', 'Cecília', 'Leonor', 'Aurora', 'Maitê', 'Lívia', 'Beatriz', 'Clara'], ROMAN = ['', '', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII'];
function dynasty(g, k) { const L = k.leader, founder = L.house || L.base || L.n, gen = (L.gen || 0) + 1, father = L.n, fam = (k.lh || []).filter(x => x[2] === 'Herdeiro').map(x => x[4] || x[1]).concat([founder]); const x = R(g); let first = x < .3 ? (L.first || founder) : x < .45 ? founder : pick(g, HEIRS), n;
  const uses = fam.filter(f => f === first).length; if (first === (L.first || founder) && x < .3) n = first + (uses <= 1 ? ' Filho' : ROMAN[Math.min(8, uses + 1)]); else n = first + (uses ? ROMAN[Math.min(8, uses + 1)] : '');
  k.leader = { ...L, n, first, house: founder, base: founder, gen, by: (L.by != null ? L.by : year(g) - 60) + ri(g, 26, 38), da: ri(g, 70, 92), img: first === founder ? L.img : null, ini: first[0], atk: (R(g) - .4) * .1, eco: (R(g) - .4) * .1, since: g.turn }; S(k, g).leaders++; (k.lh = k.lh || []).push([g.turn, n, 'Herdeiro', father, first]); const fem = HEIRS.indexOf(first) >= 15; k.leader.fem = fem; k.lh[k.lh.length - 1].push(fem ? 'f' : 'm'); const m = n + ', ' + (fem ? 'herdeira' : 'herdeiro') + ' de ' + father + ', assumiu o ' + k.n + '.'; log(g, m, 'pol', k.id); tle(g, 'gov', m, k.id, k.cap); }
function govTick(g) {
  for (const k of g.c) {
    if (!k.alive || k.id < 2) continue; if (k.bonga) { const L_ = k.leader; if (L_.by == null) { L_.by = year(g) - ri(g, 21, 25); L_.da = ri(g, 70, 92); } if (year(g) >= L_.by + L_.da || R(g) < .00004) dynasty(g, k); continue; } const H = isH(g, k.id);
    if (k.ideo === 'ana') { if (g.turn >= (k.anaT || 0)) { const id = pickW(g, [['rep', 50], ['dit', 25], ['mon', 10], ['com', 15]]); k.ideo = 'x'; k.ideo = 'ana'; setGov(g, k, id, 'fim'); } continue; }
    if (k.ideo === 'rep' && g.turn >= (k.elecT == null ? (k.elecT = g.turn + ri(g, 3, 47)) : k.elecT)) election(g, k);
    if (H) continue; if (R(g) < .0006 * g.opt.rev) { const st = provs(g, k.id).reduce((s, p) => s + p.st, 0) / Math.max(1, provs(g, k.id).length); let l = SHIFT[k.ideo] || SHIFT.def; if (st > .55) l = l.filter(x => x[0] !== 'ana'); setGov(g, k, pickW(g, l), k.ideo === 'mon' || k.ideo === 'rep' ? 'golpe' : 'rev'); continue; }
    if (k.ideo !== 'rep' && R(g) < .0045) setLeader(g, k, (k.ideo === 'dit' ? 'General ' : '') + fictName(g, k), TITLE[k.ideo] || 'Líder');
  }
}
/* ---------- CATÁSTROFES E ARMAS NUCLEARES ---------- */
const CAT = { tsunami: ['Tsunami', 'co', 5], terremoto: ['Terremoto', '', 3], furacao: ['Furacão', 'co', 4], vulcao: ['Erupção vulcânica', 'mou', 2] };
function ruin(g, p, v) { p.pop = Math.max(150, p.pop * (1 - v)); p.eco = Math.max(100, p.eco * (1 - v)); p.st = clamp(p.st - v * .6, 0, 1); for (const key in p.ci) if (R(g) < v * 1.8) p.ci[key] = Math.max(0, p.ci[key] - 1 - (R(g) < v ? 1 : 0)); for (const b in p.b) if (R(g) < v * .8) delete p.b[b]; }
function catastrophe(g, type) {
  const T = CAT[type], ok = g.p.filter(p => p.own > 1 && (T[1] === 'co' ? g.map.coast[p.id] : T[1] === 'mou' ? p.t === 'mou' || p.t === 'hil' : true)); if (!ok.length) return; const p0 = pick(g, ok), seen = new Set([p0.id]); let fr = [p0.id], hit = [p0], v = .32 + R(g) * .2;
  for (let d = 1; d < T[2] && hit.length < 9; d++) { const nx = []; fr.forEach(i => g.map.neigh[i].forEach(n => { if (seen.has(n) || g.p[n].own < 2 || (T[1] === 'co' && !g.map.coast[n])) return; seen.add(n); if (R(g) < .7) { nx.push(n); hit.push(g.p[n]); } })); fr = nx; }
  hit.forEach((p, i) => ruin(g, p, v * (i === 0 ? 1 : .55))); const owners = [...new Set(hit.map(p => p.own))], k0 = g.c[p0.own], m = T[0] + ' devastou ' + p0.n + ' (' + k0.n + ').'; log(g, m, 'big', k0.id); tle(g, 'cat', m, k0.id, p0.id); g.catN = (g.catN || 0) + 1;
  for (const c of owners) { const k = g.c[c]; k.recon = 14 + ri(g, 0, 14); S(k, g).cats = (S(k, g).cats || 0) + 1; if (isH(g, c)) g.inbox.push({ to: c, k: 'ev', ev: EV.findIndex(e => e.id === 'reconst'), title: T[0] + ' em ' + p0.n, text: 'A catástrofe arrasou cidades. O país precisa se reestruturar.', ch: EV.find(e => e.id === 'reconst').ch.map(x => x.t) }); else { k.gold *= .78; } }
}
EV.push({ id: 'reconst', t: 'Reconstrução', x: '', w: () => false, ch: [{ t: 'Plano nacional (gasta 30% do tesouro, reconstrução mais curta)', f: (g, k) => { k.gold *= .7; k.recon = Math.max(4, Math.round((k.recon || 12) * .4)); mStab(g, k, .05); }, ai: 2 }, { t: 'Cada região se vira (reconstrução longa e povo revoltado)', f: (g, k) => mStab(g, k, -.08), ai: 1 }] });
function catTick(g) { for (const k of g.c) if (k.recon > 0) k.recon--; if (R(g) < .02 * g.opt.ev * climMul(g)) catastrophe(g, pickW(g, [['terremoto', 40], ['tsunami', 20], ['furacao', 28], ['vulcao', 12]])); }
const canNuke = k => k.tech >= 46 && (k.inf >= 12 || ['dit', 'com', 'fas'].includes(k.ideo) || (k.st && k.st.wars >= 6));
function nukeStrike(g, c, pid) { const k = g.c[c], p = g.p[pid]; if (!(k.nuke > 0)) return 'Você não tem ogivas.'; if (!atWar(g, c, p.own)) return 'Só contra quem está em guerra com você.'; k.nuke--; ruin(g, p, .38); g.map.neigh[pid].forEach(n => g.p[n].st = clamp(g.p[n].st - .12, 0, 1)); k.inf += 32; for (const o of g.c) if (o.alive && o.id > 1 && o.id !== c) relCh(g, c, o.id, -28); g.nukeN = (g.nukeN || 0) + 1; const m = k.n + ' lançou uma bomba nuclear sobre ' + p.n + ' (' + g.c[p.own].n + ')!'; log(g, m, 'big', c); tle(g, 'nuke', m, c, pid); return null; }
function nukeTick(g) {
  for (const k of g.c) { if (!k.alive || k.id < 2) continue;
    if ((k.nuke || 0) < 3 && canNuke(k) && R(g) < .0004 && rankTop(g, k.id)) { k.nuke = (k.nuke || 0) + 1; k.nukeEver = 1; g.nukeB = (g.nukeB || 0) + 1; const m = k.n + ' desenvolveu armas nucleares.'; log(g, m, 'big', k.id); tle(g, 'nuke', m, k.id, k.cap); if (isH(g, k.id)) g.inbox.push({ to: k.id, k: 'info', title: 'Programa nuclear', text: 'Temos a bomba. Ela aparece na província inimiga selecionada, mas custa caro na diplomacia.' }); }
    if (k.nuke > 0 && !isH(g, k.id) && R(g) < .025) { const w = g.wars.find(x => x.a.includes(k.id) || x.b.includes(k.id)); if (w) { const en = (w.a.includes(k.id) ? w.b : w.a)[0]; const l = provs(g, en).sort((a, b) => b.pop - a.pop); if (l[0]) nukeStrike(g, k.id, l[0].id); } } }
}
function worldSample(g) {
  for (const k of g.c) { if (!k.alive || k.id < 2) continue; const n = (g.ix[k.id] || { size: 0 }).size, s = S(k, g); if (n > s.maxP) s.maxP = n; }
  if (g.turn % 12 === 0) { const rh = g.rh || (g.rh = []); rh.push([g.turn, rank(g).slice(0, 30).map(x => [x.id, x.score])]); if (rh.length > 1600) g.rh = rh.filter((_, i) => i % 2 === 0); }
  if (g.turn % 6) return; const al = g.c.filter(k => k.alive && k.id > 1), gc = { rep: 0, mon: 0, dit: 0, com: 0, out: 0 }; al.forEach(k => { const v = k.ideo === 'fas' ? 'dit' : k.ideo; if (v in gc) gc[v]++; else gc.out++; }); const a = g.ws || (g.ws = []); a.push([g.turn, Math.round(g.p.reduce((s, p) => s + p.pop, 0)), al.length, g.wars.length, gc.rep, gc.mon, gc.dit, gc.com, gc.out, +(g.temp || 0).toFixed(2), Math.round(al.reduce((s, k) => s + (k.pov || 0), 0) / Math.max(1, al.length) * 100)]); if (a.length > 1400) a.splice(0, a.length, ...a.filter((_, i) => i % 2 === 0 || i > 1100));
}
/* ---------- ALIANÇAS ---------- */
/* nomes de aliancas: tipo + capital do fundador, regiao, tema ou eixo entre duas capitais */
const AL_T = ['Pacto', 'Aliança', 'Liga', 'Tratado', 'Entente', 'Coalizão', 'Frente', 'Bloco', 'Concerto', 'Comunidade', 'Acordo', 'Irmandade', 'Conselho', 'União Defensiva', 'Confederação', 'Convenção', 'Carta', 'Círculo'];
const AL_REG = ['do Atlântico Norte', 'do Atlântico Sul', 'do Pacífico', 'do Índico', 'do Báltico', 'do Mediterrâneo', 'do Mar Negro', 'do Caribe', 'do Ártico', 'do Sahel', 'dos Andes', 'do Prata', 'da Amazônia', 'do Danúbio', 'do Reno', 'do Nilo', 'do Golfo', 'da Ásia Central', 'do Sudeste Asiático', 'do Extremo Oriente', 'do Cáucaso', 'dos Balcãs', 'da Escandinávia', 'do Levante', 'do Hemisfério Sul', 'do Norte', 'do Sul', 'Oriental', 'Ocidental', 'Continental', 'Transatlântica', 'Euro-Asiática', 'Pan-Africana', 'Pan-Americana', 'Ibero-Americana'];
const AL_TEMA = ['da Aurora', 'do Ferro', 'da Liberdade', 'da Coroa', 'do Leão', 'da Águia', 'da Estrela', 'do Sol Nascente', 'da Lua Crescente', 'da Rosa', 'do Trovão', 'da Tempestade', 'do Carvalho', 'da Âncora', 'do Escudo', 'da Espada', 'da Paz Armada', 'da Concórdia', 'da Esperança', 'do Progresso', 'da Ordem', 'da Fraternidade', 'da Prosperidade', 'dos Três Mares', 'das Nações Livres', 'do Novo Mundo', 'do Velho Mundo', 'da Fortaleza', 'do Horizonte', 'da Bússola', 'do Farol', 'da Muralha', 'dos Mares do Sul', 'da Rota da Seda', 'da Rota do Ouro', 'do Equador', 'dos Trópicos', 'da Grande Planície', 'da Montanha Sagrada', 'do Vento Leste'];
const AL_BONGA = ['da Banana', 'da Cartola', 'dos Bongas', 'do Grande Conselho', 'da Resenha', 'do Churrasco', 'da Pelada de Domingo', 'do Grupo do Zap', 'da Firma', 'dos Parças', 'do Rolê', 'da Várzea'];
const AL_GEO = [['do Ártico', (o, a) => a > 64], ['da Escandinávia', (o, a) => a > 55 && o > 4 && o < 32], ['do Báltico', (o, a) => a > 53 && a < 66 && o > 10 && o < 30], ['do Atlântico Norte', (o, a) => a > 35 && o > -95 && o < 25], ['do Reno', (o, a) => a > 46 && a < 54 && o > 3 && o < 12], ['do Danúbio', (o, a) => a > 43 && a < 50 && o > 9 && o < 30], ['do Mediterrâneo', (o, a) => a > 30 && a < 46 && o > -6 && o < 36], ['dos Balcãs', (o, a) => a > 39 && a < 47 && o > 13 && o < 30], ['do Mar Negro', (o, a) => a > 40 && a < 48 && o > 27 && o < 42], ['do Cáucaso', (o, a) => a > 38 && a < 45 && o > 38 && o < 50], ['do Levante', (o, a) => a > 29 && a < 38 && o > 33 && o < 40], ['do Golfo', (o, a) => a > 20 && a < 32 && o > 44 && o < 60], ['da Ásia Central', (o, a) => a > 35 && a < 56 && o > 50 && o < 90], ['do Extremo Oriente', (o, a) => a > 20 && a < 56 && o > 100 && o < 150], ['do Sudeste Asiático', (o, a) => a > -11 && a < 23 && o > 92 && o < 130], ['do Índico', (o, a) => a > -40 && a < 26 && o > 40 && o < 100], ['do Pacífico', (o, a) => o > 125 || o < -115], ['do Caribe', (o, a) => a > 9 && a < 26 && o > -90 && o < -59], ['dos Andes', (o, a) => a > -42 && a < 11 && o > -82 && o < -65], ['do Prata', (o, a) => a > -40 && a < -21 && o > -66 && o < -48], ['da Amazônia', (o, a) => a > -15 && a < 6 && o > -75 && o < -44], ['do Atlântico Sul', (o, a) => a < 5 && o > -50 && o < 20], ['do Sahel', (o, a) => a > 9 && a < 21 && o > -18 && o < 40], ['do Nilo', (o, a) => a > 4 && a < 32 && o > 28 && o < 36], ['Pan-Africana', (o, a) => a > -36 && a < 37 && o > -18 && o < 52], ['Pan-Americana', (o, a) => o < -30], ['Ibero-Americana', (o, a) => o < -34 && a < 33], ['Euro-Asiática', (o, a) => a > 35 && o > 25 && o < 140], ['do Hemisfério Sul', (o, a) => a < -5], ['do Norte', (o, a) => a > 45], ['do Sul', (o, a) => a < 0], ['Oriental', (o, a) => o > 60], ['Ocidental', (o, a) => o < 15 && o > -30], ['Continental', () => true], ['Transatlântica', (o, a) => a > 20 && o > -80 && o < 20]];
const AL_BR = ['do Nordeste', 'do Sul', 'do Sudeste', 'do Norte', 'da Amazônia', 'do Cerrado', 'do Sertão', 'do Litoral', 'do Planalto', 'do Pantanal', 'do São Francisco', 'da Serra do Mar', 'do Pampa', 'Central', 'Atlântica', 'Brasileira'];
function lonLat(g, pid) { const m = g.map; if (!m || m.W !== 6000 || pid == null || pid < 0 || m.cx[pid] == null) return null; const R_ = m.W / (2 * Math.PI), y0 = m.H * .6241; return [m.cx[pid] / m.W * 360 - 180, (2.5 * Math.atan(Math.exp(.8 * (y0 - m.cy[pid]) / R_)) - .625 * Math.PI) * 180 / Math.PI]; }
function alRegion(g, k) { if (g.scn && g.scn.map === 'brazil') return pick(g, AL_BR); const ll = lonLat(g, k && k.cap); if (!ll) return pick(g, AL_REG); const c = AL_GEO.filter(x => x[1](ll[0], ll[1])).map(x => x[0]); return pick(g, c.length ? c : AL_REG); }
function alName(g, a, b) { const used = new Set(Object.values(g.al).map(x => x.n)), A = g.c[a], B = b != null ? g.c[b] : null, capN = k => k && g.p[k.cap] ? g.p[k.cap].n : null, T = () => pick(g, AL_T), bong = g.scn && g.scn.kind === 'bongas' || !g.scn;
  const MASC = /^(Pacto|Tratado|Bloco|Concerto|Acordo|Conselho|Círculo|Eixo) /, agree = n => MASC.test(n) ? n.replace(/^(\S+) ([A-ZÀ-Ú][\wÀ-ú-]*a)$/, (m, t, adj) => t + ' ' + adj.replace(/a$/, 'o')) : n;
  for (let t = 0; t < 12; t++) { const x = R(g); let n; if (x < .3 && capN(A)) n = T() + ' de ' + capN(A); else if (x < .55) n = T() + ' ' + alRegion(g, A); else if (x < .85) n = T() + ' ' + pick(g, bong && R(g) < .4 ? AL_BONGA : AL_TEMA); else if (capN(A) && capN(B)) n = pick(g, ['Eixo', 'Entente', 'Pacto', 'Aliança']) + ' ' + capN(A) + '–' + capN(B); else n = T() + ' ' + pick(g, AL_TEMA); n = agree(n); if (!used.has(n)) return n.slice(0, 48); }
  return T() + ' ' + pick(g, AL_TEMA) + ' ' + (g.alN || 1); }
const noAl = g => !g.scn || g.scn.kind === 'brazil' || g.scn.kind === 'reg';
function allCreate(g, c, name) { if (noAl(g)) return 'Este mapa não tem alianças.'; const k = g.c[c]; if (k.ally != null) return 'Saia da aliança atual primeiro.'; if (k.dp < 6) return 'Faltam pontos de diplomacia (6).'; k.dp -= 6; const id = g.alN++; g.al[id] = { n: (name || alName(g, c)).slice(0, 48), m: [c], lead: c }; k.ally = id; log(g, k.n + ' fundou a ' + g.al[id].n + '.', 'dip', c); return null; }
function allJoin(g, c, id) { if (noAl(g)) return 'Este mapa não tem alianças.'; const k = g.c[c], A = g.al[id]; if (!A) return 'Aliança inexistente.'; if (k.ally != null) return 'Saia da aliança atual primeiro.'; if (k.dp < 5) return 'Faltam pontos de diplomacia (5).'; k.dp -= 5; const v = A.m.reduce((s, x) => s + g.rel[c][x], 0) / A.m.length; if (A.m.some(x => isH(g, x)) === false && v + R(g) * 30 < 10) return 'A aliança recusou o pedido.'; A.m.push(c); k.ally = id; log(g, k.n + ' entrou na ' + A.n + '.', 'dip', c); return { m: 'Agora você faz parte da ' + A.n + '.' }; }
function allInvite(g, c, t) { if (noAl(g)) return 'Este mapa não tem alianças.'; const k = g.c[c], T = g.c[t], A = g.al[k.ally]; if (!A) return 'Você não está em uma aliança.'; if (T.ally != null) return T.n + ' já tem aliança.'; if (k.dp < 4) return 'Faltam pontos de diplomacia (4).'; k.dp -= 4; if (!isH(g, t) && g.rel[c][t] + R(g) * 30 < 18) return T.n + ' recusou o convite.'; A.m.push(t); T.ally = k.ally; log(g, T.n + ' entrou na ' + A.n + '.', 'dip', c); return { m: T.n + ' aceitou.' }; }
function allKick(g, c, t) { const k = g.c[c], A = g.al[k.ally]; if (!A || A.lead !== c) return 'Só o líder expulsa.'; A.m = A.m.filter(x => x !== t); g.c[t].ally = null; relCh(g, c, t, -30); log(g, g.c[t].n + ' foi expulso da ' + A.n + '.', 'dip', c); return null; }
function predictWar(g, a, b) { const A = new Set([a]), B = new Set([b]), ka = g.c[a], kb = g.c[b]; for (const o of g.c) { if (!o.alive || o.id < 2 || o.id === a || o.id === b) continue; if (o.lord === b || hasD(g, b, o.id, 'dp') || hasD(g, b, o.id, 'gua') || (kb.ally != null && o.ally === kb.ally && o.ally !== ka.ally)) B.add(o.id); else if (o.lord === a || (ka.ally != null && o.ally === ka.ally && o.ally !== kb.ally)) A.add(o.id); } return { a: [...A], b: [...B] }; }

/* ---------- NOMES, PARTIDOS, GUERRAS MUNDIAIS, UNIFICAÇÕES E COPAS ---------- */
function placeName(g, p) { const d = g.map.ps && g.map.ps[p.id], raw = (d && d.r) || p.n, base = raw.split(' - ')[0].split(' – ')[0].trim(), used = n => g.c.some(k => k.n === n); if (!used(base)) return base; if (!used(p.n)) return p.n; return used('República de ' + base) ? 'Estado de ' + base : 'República de ' + base; }
const GPT = ['Partido Liberal', 'Partido Social-Democrata', 'Partido Conservador', 'Partido Verde', 'Partido Trabalhista', 'Partido Nacional', 'Aliança Democrática', 'Partido do Povo', 'Frente Cívica', 'Partido Progressista'];
function election(g, k) {
  S(k, g).elec++; k.elecT = g.turn + 48; const inc = k.leader.n, can = [], isBR = k.a3 === 'BRA' || /^REG/.test(k.a3 || ''), y = year(g), pool = isBR ? (root.BR_CAND2 || (root.BR_CAND || []).map(c => [c[0], c[1], '?', 0])).filter(c => c[0] !== inc && !(k.brUsed || []).includes(c[0]) && (c[3] ? y >= 2030 && y <= 2058 : y <= 2042)) : [];
  const fp = () => isBR && root.BR_PARTIES ? pick(g, root.BR_PARTIES.slice(0, 13))[0] : pick(g, GPT), termOk = (k.terms || 0) < 2; if (termOk) can.push({ n: inc, img: k.leader.img, p: k.party || fp(), w: 25 + k.hap * 70 + R(g) * 35, inc: 1 });
  const BIG = root.BR_PARTIES ? root.BR_PARTIES.slice(0, 13).map(p => p[0]) : [], seen = {}, order = shuffle(g, pool.slice()), add = (big, max) => { let n = 0; for (const c of order) { if (n >= max || can.length >= 4 || seen[c[2]] || BIG.includes(c[2]) !== big) continue; seen[c[2]] = 1; can.push({ n: c[0], img: c[1], p: c[2], w: R(g) * (big ? 85 : 38) }); n++; } }; add(true, 3); add(false, 1); while (can.length < 3) can.push({ n: fictName(g, k), img: null, p: fp(), w: R(g) * 80 });
  can.sort((a, b) => b.w - a.w); const w = can[0], tot = can.reduce((s, c) => s + c.w, 0), pc = Math.round(w.w / tot * 100);
  if (w.inc) k.terms = (k.terms || 0) + 1; else { k.terms = 1; setLeader(g, k, w.n, 'Presidente', w.img); k.party = w.p; if (isBR && pool.some(c => c[0] === w.n)) (k.brUsed = k.brUsed || []).push(w.n); } const pw_ = S(k, g).pty || (S(k, g).pty = {}); pw_[w.p] = (pw_[w.p] || 0) + 1;
  const m = 'Eleições em ' + k.n + ': ' + w.n + ' (' + w.p + ')' + (w.inc ? ' foi reeleito' : ' venceu') + ' com ' + pc + '% dos votos.'; log(g, m, 'pol', k.id); if (rankTop(g, k.id) || isH(g, k.id)) tle(g, 'elec', m, k.id, k.cap);
  if (isH(g, k.id)) g.inbox.push({ to: k.id, k: 'info', title: 'Resultado das eleições', text: m + ' Disputaram: ' + can.map(c => c.n + ' (' + c.p + ')').join(', ') + '.' });
}
function worldWar(g) { const bl = Object.values(g.al).map(a => ({ a, m: a.m.filter(c => g.c[c].alive) })).filter(x => x.m.length >= 3).sort((x, y) => y.m.length - x.m.length); if (bl.length < 2) return; const [A, B] = bl; g.wwN = (g.wwN || 0) + 1; const why = g.wwN + 'ª Guerra Mundial'; const w = { id: g.wN++, a: A.m.slice(), b: B.m.slice(), t: g.turn, sc: 0, why, big: 1 }; g.wars.push(w); rebuildW(g); w.a.concat(w.b).forEach(c => S(g.c[c], g).wars++); const m = 'Começou a ' + why + ': ' + A.a.n + ' contra ' + B.a.n + '.'; log(g, m, 'big'); tle(g, 'war', m, A.m[0], g.c[B.m[0]].cap); }
function unify(g) { const l = g.c.filter(k => k.alive && k.id > 1 && !k.bonga && !isH(g, k.id) && k.ideo !== 'ana'), a = l.length ? pick(g, l) : null; if (!a) return; const n = nbC(g, a.id).filter(o => !o.bonga && !isH(g, o.id) && o.ideo === a.ideo && g.rel[a.id][o.id] > 45 && !atWar(g, a.id, o.id) && provs(g, o.id).length <= provs(g, a.id).length); if (!n.length) return; const b = pick(g, n); for (const p of provs(g, b.id)) { p.own = p.ctrl = a.id; p.core = p.core.concat([a.id]); if (p.a[b.id]) { p.a[a.id] = (p.a[a.id] || 0) + p.a[b.id]; delete p.a[b.id]; } } const m = b.n + ' e ' + a.n + ' se unificaram sob o nome ' + a.n + '.'; log(g, m, 'big', a.id); tle(g, 'unif', m, a.id, a.cap); g.unifN = (g.unifN || 0) + 1; }
const SPACE = [[1957, 'colocou o primeiro satélite em órbita', 30], [1961, 'levou o primeiro ser humano ao espaço', 31], [1969, 'pousou o primeiro ser humano na Lua', 33], [1998, 'montou uma estação espacial permanente', 36], [2030, 'levou o primeiro ser humano a Marte', 41], [2060, 'fundou a primeira colônia em Marte', 45], [2100, 'mandou uma nave tripulada para fora do Sistema Solar', 50]];
function spaceTick(g) { if (g.spc == null) { g.spc = 0; while (g.spc < SPACE.length && SPACE[g.spc][0] <= g.startY && g.startY >= 1950) g.spc++; } const st = SPACE[g.spc]; if (!st || year(g) < st[0] - 15 || R(g) > .0011) return; const c = rank(g).slice(0, 6).map(x => g.c[x.id]).filter(k => k && k.alive && k.tech >= st[2] && !k.bonga || k && k.alive && k.bonga && k.tech >= st[2]); if (!c.length) return; const k = c[Math.floor(R(g) * c.length)]; g.spc++; (g.space = g.space || []).push({ y: year(g), c: k.n, m: st[1] }); k.inf = (k.inf || 0) + 6; k.hap = clamp(k.hap + .04, 0, 1); provs(g, k.id).forEach(p => p.st = clamp(p.st + .03, 0, 1)); S(k, g).space = (S(k, g).space || 0) + 1; const m = 'Corrida espacial: ' + k.n + ' ' + st[1] + '!'; log(g, m, 'big', k.id); tle(g, 'space', m, k.id, k.cap); }
function endgameTick(g) { }
function rareTick(g) { endgameTick(g); spaceTick(g); if (g.turn > 60 && R(g) < .0009) worldWar(g); if (R(g) < .0006) unify(g); }
const RAT = { BRA: 92, ARG: 94, FRA: 93, GBR: 90, ESP: 92, DEU: 88, NLD: 87, PRT: 88, ITA: 85, BEL: 84, HRV: 83, URY: 83, COL: 82, MAR: 83, JPN: 81, USA: 80, MEX: 79, SEN: 79, KOR: 77, CHE: 79, DNK: 79, AUT: 77, ECU: 76, TUR: 76, NOR: 77, UKR: 76, POL: 75, SRB: 76, CAN: 75, AUS: 75, IRN: 76, NGA: 75, EGY: 74, CIV: 75, CMR: 73, DZA: 75, TUN: 72, SAU: 70, QAT: 68, PRY: 73, CHL: 72, PER: 72, VEN: 72, GHA: 70, SWE: 76, CZE: 74, GRC: 73, RUS: 74 };
function poisson(g, l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(g); } while (p > L); return k - 1; }
function teamR(g, k) { const pop = provs(g, k.id).reduce((s, p) => s + p.pop, 0); return (k.bonga ? 72 : RAT[k.a3] || 44 + Math.min(20, Math.log10(pop + 10) * 3.4)) + (k.cupF || 0); }
function match(g, a, b, ko) { const d = (a.r - b.r) / 26; let x = poisson(g, 1.3 * Math.exp(d)), y = poisson(g, 1.3 * Math.exp(-d)), pen = false; if (ko && x === y) { pen = true; if (R(g) < .5 + d * .1) x++; else y++; } return [x, y, pen]; }
const OLY_HOST = { 2028: ['USA', 'Los Angeles'], 2032: ['AUS', 'Brisbane'] };
function olyTick(g) { const y = year(g); if (g.turn % 12 !== 7 || y % 4 !== 0 || y < 1896) return; const al = g.c.filter(k => k.alive && k.id > 1 && k.ideo !== 'ana'); if (al.length < 8) return;
  const inWar = k => g.wars.some(w => w.a.includes(k.id) || w.b.includes(k.id)), out = al.filter(inWar), ok = al.filter(k => !inWar(k));
  if (out.length > al.length * .3 && out.some(k => rankTop(g, k.id))) { const m = 'Olimpíadas de ' + y + ' canceladas por causa das guerras.'; log(g, m, 'big', -1); tle(g, 'oly', m, -1, -1); return; }
  const str = k => { let pop = 0, eco = 0, dev = 0; const l = provs(g, k.id); for (const p of l) { pop += p.pop; eco += p.eco; dev += p.dev; } return Math.log10(pop + 10) * .9 + Math.log10(eco + 10) * .7 + dev / Math.max(1, l.length) * 2.2 + k.hap * .6 + (k.oF || 0) + R(g) * .4; };
  const T = ok.map(k => ({ k, s: str(k), m: [0, 0, 0] })).sort((a, b) => b.s - a.s).slice(0, 60); const fx = OLY_HOST[y], hT = (fx && T.find(t => t.k.a3 === fx[0])) || T[Math.floor(R(g) * Math.min(14, T.length))], host = hT.k, city = fx && hT.k.a3 === fx[0] ? fx[1] : (g.p[host.cap] ? g.p[host.cap].n : host.n); hT.s += .45;
  const mx = T[0].s, W = T.map(t => Math.exp((t.s - mx) * 2.4)); for (let e = 0; e < 40; e++) { const used = new Set(); for (let pl = 0; pl < 3; pl++) { let tot = 0; T.forEach((t, i) => { if (!used.has(i)) tot += W[i]; }); let x = R(g) * tot, pick_ = 0; for (let i = 0; i < T.length; i++) { if (used.has(i)) continue; x -= W[i]; if (x <= 0) { pick_ = i; break; } } used.add(pick_); T[pick_].m[pl]++; } }
  const tab = T.filter(t => t.m[0] + t.m[1] + t.m[2] > 0).sort((a, b) => b.m[0] - a.m[0] || b.m[1] - a.m[1] || b.m[2] - a.m[2]); tab.forEach(t => { const X = S(t.k, g); X.med = X.med || [0, 0, 0]; t.m.forEach((v, i) => X.med[i] += v); t.k.oF = clamp((t.k.oF || 0) + (t === tab[0] ? .05 : (R(g) - .5) * .06), -.3, .3); });
  const ch = tab[0].k, o = { y, host: host.n, city, top: tab.slice(0, 10).map(t => [t.k.n, ...t.m]), ch: ch.n, out: out.map(k => k.n) }; (g.oly = g.oly || []).push(o); { const o_ = g.oly[g.oly.length - 201]; if (o_ && o_.top.length > 3) { o_.top = o_.top.slice(0, 3); o_.out = []; } } S(ch, g).olyW = (S(ch, g).olyW || 0) + 1;
  const m = 'Olimpíadas de ' + y + ' em ' + city + ' (' + host.n + '): ' + ch.n + ' lidera o quadro de medalhas com ' + tab[0].m[0] + ' ouros' + (tab[1] ? ', à frente de ' + tab[1].k.n + (tab[2] ? ' e ' + tab[2].k.n : '') : '') + '.' + (out.length ? ' Fora por guerra: ' + out.slice(0, 5).map(k => k.n).join(', ') + (out.length > 5 ? ' e mais ' + (out.length - 5) : '') + '.' : ''); log(g, m, 'big', ch.id); tle(g, 'oly', m, ch.id, ch.cap); }
function cupTick(g) {
  const y = year(g); if (g.turn % 12 !== 5 || (y - 2026) % 4 !== 0 || y < 1930) return; const al = g.c.filter(k => k.alive && k.id > 1 && k.ideo !== 'ana'); if (al.length < 8) return;
  const inWar = k => g.wars.some(w => { const side = w.a.includes(k.id) ? w.a : w.b.includes(k.id) ? w.b : null; if (!side) return false; if (side[0] === k.id) return true; return (side === w.a ? w.b : w.a).some(o => bord(g, k.id, o)); }), out = al.filter(inWar), ok = al.filter(k => !inWar(k)).map(k => ({ k, r: teamR(g, k), pts: 0, gd: 0, gf: 0 })).sort((a, b) => b.r - a.r), n = ok.length >= 48 ? 48 : ok.length >= 32 ? 32 : ok.length >= 16 ? 16 : 8; if (ok.length < 8) return; const T = ok.slice(0, n), fixed = { 2026: ['USA', 'CAN', 'MEX'], 2030: ['ESP', 'PRT', 'MAR'], 2034: ['SAU'] }[y], hostT = (fixed && T.filter(t => fixed.includes(t.k.a3))) || [], host = hostT.length ? hostT.map(t => t.k) : [pick(g, T.slice(0, Math.min(16, T.length))).k];
  host.forEach(k => { const t = T.find(x => x.k === k); if (t) t.r += 3; }); shuffle(g, T); const size = 4, groups = []; for (let i = 0; i < T.length; i += size) groups.push(T.slice(i, i + size)); let adv = [], thirds = [];
  for (const G0 of groups) { for (let i = 0; i < G0.length; i++) for (let j = i + 1; j < G0.length; j++) { const [x, y2] = match(g, G0[i], G0[j]); G0[i].gf += x; G0[j].gf += y2; G0[i].gd += x - y2; G0[j].gd += y2 - x; if (x > y2) G0[i].pts += 3; else if (y2 > x) G0[j].pts += 3; else { G0[i].pts++; G0[j].pts++; } } G0.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf); adv.push(G0[0], G0[1]); if (G0[2]) thirds.push(G0[2]); }
  const target = n === 48 ? 32 : n; if (n === 8) adv = T.slice(); else if (n === 48) adv = adv.concat(thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd).slice(0, target - adv.length)); shuffle(g, adv); let round = adv, third = null, fin = null;
  while (round.length > 1) { const nx = [], los = []; for (let i = 0; i + 1 < round.length; i += 2) { const [x, y2, pen] = match(g, round[i], round[i + 1], true), w = x > y2 ? round[i] : round[i + 1], l = x > y2 ? round[i + 1] : round[i]; nx.push(w); los.push(l); if (round.length === 2) fin = { a: w.k.n, b: l.k.n, x: Math.max(x, y2), y: Math.min(x, y2), pen }; } if (round.length === 4) third = los; round = nx; }
  const ch = round[0].k; S(ch, g).cups = (S(ch, g).cups || 0) + 1; T.forEach(t => t.k.cupF = clamp((t.k.cupF || 0) + (t.k === ch ? 1 : (R(g) - .5) * 1.5), -6, 6)); const c = { y, host: host.map(k => k.n), ch: ch.n, chI: ch.id, vice: fin.b, third: third ? third.map(t => t.k.n) : [], score: fin.x + ' x ' + fin.y + (fin.pen ? ' nos pênaltis' : ''), n, out: out.map(k => k.n) }; (g.cups = g.cups || []).push(c); { const c_ = g.cups[g.cups.length - 201]; if (c_ && c_.out.length) c_.out = []; }
  const m = 'Copa do Mundo de ' + y + ': ' + ch.n + ' campeão sobre ' + fin.b + ' (' + c.score + '), sede em ' + c.host.join(', ') + '.' + (out.length ? ' Fora por guerra: ' + out.slice(0, 6).map(k => k.n).join(', ') + (out.length > 6 ? ' e mais ' + (out.length - 6) : '') + '.' : ''); log(g, m, 'big', ch.id); tle(g, 'cup', m, ch.id, ch.cap);
}

/* ---------- TRATADOS DE PAZ E PONTUAÇÃO ---------- */
const scoreMemo = new WeakMap();
function scoreAll(g) { const al = g.c.filter(k => k.alive && k.id > 1), c0 = scoreMemo.get(g); if (c0 && c0.t === g.turn && c0.n === al.length) return c0.m; const arm = {}; for (const p of g.p) for (const s in p.a) arm[s] = (arm[s] || 0) + (p.a[s] || 0); const raw = al.map(k => { const l = provs(g, k.id); let pop = 0, eco = 0, dev = 0, st = 0; for (const p of l) { pop += p.pop; eco += p.eco; dev += p.dev; st += p.st; } const n = l.length || 1; return { id: k.id, pw: (arm[k.id] || 0) * techM(g, k.id), pop, eco, dev: dev / n, st: st / n, hap: k.hap, pov: k.pov || 0 }; }), mx = f => Math.max(1, ...raw.map(f)), mP = mx(r => r.pw), mN = mx(r => r.pop), mE = mx(r => r.eco), m = new Map(); for (const r of raw) { const idh = clamp(r.dev * .55 + (1 - r.pov) * .45, 0, 1), parts = { economia: Math.sqrt(r.eco / mE) * 100, poder: Math.sqrt(r.pw / mP) * 100, populacao: Math.sqrt(r.pop / mN) * 100, desenvolvimento: idh * 100, felicidade: r.hap * 100, estabilidade: r.st * 100, pobreza: r.pov * 100 }; const base = parts.economia * .25 + parts.poder * .2 + parts.populacao * .15 + parts.desenvolvimento * .15 + parts.felicidade * .15 + parts.estabilidade * .1; m.set(r.id, { t: Math.round(base * (1 - r.pov * .5) * 10), parts }); } scoreMemo.set(g, { t: g.turn, n: al.length, m }); return m; }
const scoreParts = (g, c) => { const r = scoreAll(g).get(c); return r ? r.parts : null; };
function capit(g, x, wn) { const k = g.c[x]; if (!k || !k.alive || k.cap < 0 || !g.p[k.cap] || !wn.includes(g.p[k.cap].ctrl)) return false; const l = provs(g, x); return l.filter(p => wn.includes(p.ctrl)).length >= l.length * ((g._few || 99) <= 4 ? .35 : .5); }
function occupiedBy(g, w, side) { const wn = side === 'a' ? w.a : w.b, ls = side === 'a' ? w.b : w.a; return g.p.filter(p => p.ctrl !== p.own && wn.includes(p.ctrl) && ls.includes(p.own)).sort((x, y) => x.pop - y.pop); }
function applyTreaty(g, w, side, ids) { const wn = side === 'a' ? w.a : w.b, ls = side === 'a' ? w.b : w.a, A = g.c[wn[0]], B = g.c[ls[0]], big = w.big, cpt = new Set(ls.filter(x => capit(g, x, wn))); let n = 0; for (const id of ids) { const p = g.p[id]; if (p.ctrl === p.own || !wn.includes(p.ctrl) || !ls.includes(p.own)) continue; if (p.id === g.c[p.own].cap) g.c[p.own].cap = -1; g.c[p.ctrl].inf += 1.4; p.own = p.ctrl; p.st = clamp(p.st - .22, .05, 1); n++; } w.big = 0; applyPeace(g, w, 'sq', side); for (const a of w.a) for (const b of w.b) setD(g, a, b, 'truce', 72); S(A, g).won++; S(B, g).lost++; const m = B.n + ' cedeu ' + n + (n === 1 ? ' território' : ' territórios') + ' a ' + A.n + ' em tratado de paz.'; log(g, m, 'peace', A.id); if (big || isH(g, A.id) || isH(g, B.id)) tle(g, 'peace', m, A.id, A.cap); return n; }
function winnerAccepts(g, w, side, frac) { const wn = (side === 'a' ? w.a : w.b)[0], k = g.c[wn], age = g.turn - w.t, sc = Math.abs(warScore(g, w)), size = provs(g, wn).length; return frac * .55 + age * .012 + (k.hap < .5 ? .12 : 0) + Math.min(.2, size * .002) - sc * .25 + R(g) * .25 > .5; }
function treatyTick(g) { aohPeace(g); for (const w of g.wars.slice()) { if (g.turn - w.t < 6 || R(g) > .1) continue; const sc = warScore(g, w), side = sc >= 0 ? 'a' : 'b', ls = side === 'a' ? w.b : w.a, wn = side === 'a' ? w.a : w.b; if (!g.c[ls[0]] || !g.c[wn[0]]) continue; if (!w.a.concat(w.b).some(c => isH(g, c))) continue; if (isH(g, ls[0])) { if (isH(g, wn[0]) || (w.dem || 0) > g.turn || g.inbox.some(m => m.k === 'peace' && m.w === w.id)) continue; const oc = occupiedBy(g, w, side); if (!oc.length) continue; w.dem = g.turn + 12; const n = Math.max(1, Math.min(oc.length, Math.ceil(oc.length * (.5 + Math.abs(sc) * .4)))), ids = oc.slice(0, n).map(p => p.id); g.inbox.push({ to: ls[0], k: 'peace', t: 'treaty', w: w.id, side, ids, title: g.c[wn[0]].n + ' exige um tratado', text: g.c[wn[0]].n + ' aceita a paz se você ceder ' + n + ' território(s): ' + ids.slice(0, 6).map(i => g.p[i].n).join(', ') + (n > 6 ? ' e outros' : '') + '. Recusar mantém a guerra.' }); continue; } const occ = occupiedBy(g, w, side); if (!occ.length) { if (g.turn - w.t > 30 && !isH(g, wn[0])) applyPeace(g, w, 'sq', side); continue; } const n = Math.max(1, Math.min(occ.length, Math.ceil(occ.length * (.3 + Math.abs(sc) * .4)), occ.length)), ids = occ.slice(0, n).map(p => p.id), L = g.c[ls[0]], W = g.c[wn[0]]; if (isH(g, wn[0])) { if (!g.inbox.some(m => m.k === 'peace' && m.w === w.id)) g.inbox.push({ to: wn[0], k: 'peace', t: 'treaty', w: w.id, side, ids, title: 'Proposta de tratado de ' + L.n, text: L.n + ' oferece ' + n + ' território(s) ocupado(s): ' + ids.slice(0, 6).map(i => g.p[i].n).join(', ') + (n > 6 ? ' e outros' : '') + '. Aceitar encerra a guerra; recusar continua a invasão.' }); continue; } if (winnerAccepts(g, w, side, n / occ.length)) applyTreaty(g, w, side, ids); else if (w.big) log(g, W.n + ' recusou a oferta de ' + L.n + ' e continua a invasão.', 'war', W.id); } }
function playerTreaty(g, w, pct) { const c = g.player, mySide = w.a.includes(c) ? 'a' : 'b', side = mySide === 'a' ? 'b' : 'a', occ = occupiedBy(g, w, side); if (pct === 0 || !occ.length) { const sc = warScore(g, w) * (mySide === 'a' ? 1 : -1); if (sc + (g.turn - w.t) * .008 > -.1) { applyPeace(g, w, 'sq', mySide); return { ok: true, m: 'Paz sem perdas assinada.' }; } return { ok: false, m: 'O inimigo quer mais do que uma paz sem perdas.' }; } const n = Math.max(1, Math.round(occ.length * pct)), ids = occ.slice(0, n).map(p => p.id); if (winnerAccepts(g, w, side, n / occ.length)) { applyTreaty(g, w, side, ids); return { ok: true, m: 'Tratado aceito: ' + n + ' território(s) cedido(s).' }; } return { ok: false, m: g.c[(side === 'a' ? w.a : w.b)[0]].n + ' recusou e continua a invasão.' }; }

/* ---------- LEIS ---------- */
const LAWS = {
  mil: { n: 'Serviço militar', o: { vol: ['Voluntário', 'Exército mais caro, povo mais feliz'], obr: ['Obrigatório', 'Recrutar custa 25% menos, felicidade cai'] } },
  tax: { n: 'Impostos', o: { plano: ['Alíquota única', 'Mais arrecadação, mais pobreza'], prog: ['Progressivo', 'Arrecada um pouco menos e reduz a pobreza'] } },
  sau: { n: 'Saúde', o: { priv: ['Privada', 'Sem custo para o governo'], pub: ['Pública universal', 'Custa 3% da renda; doenças matam 30% menos e a pobreza cai'] } },
  edu: { n: 'Educação', o: { bas: ['Básica', 'Sem custo extra'], pub: ['Pública e gratuita', 'Custa 3% da renda; pesquisa 15% mais rápida'] } },
  imp: { n: 'Imprensa', o: { livre: ['Livre', 'Povo mais feliz'], cens: ['Censurada', 'Mais estabilidade, menos felicidade'] } },
  imi: { n: 'Imigração', o: { aberta: ['Aberta', 'População cresce mais, estabilidade cai um pouco'], fech: ['Fechada', 'Mais estabilidade'] } },
  amb: { n: 'Meio ambiente', o: { livre: ['Sem regras', 'Produção maior, mais emissões'], prot: ['Proteção ambiental', 'Produção 4% menor, emissões pela metade'] } }
};
function LW(k, key) { if (!k.law) { const d = k.ideo; k.law = { mil: ['dit', 'fas', 'com', 'hor'].includes(d) ? 'obr' : 'vol', tax: ['rep', 'com'].includes(d) ? 'prog' : 'plano', sau: ['rep', 'com'].includes(d) ? 'pub' : 'priv', edu: ['rep', 'com', 'cid'].includes(d) ? 'pub' : 'bas', imp: ['dit', 'fas', 'com', 'teo'].includes(d) ? 'cens' : 'livre', imi: ['rep', 'cid'].includes(d) ? 'aberta' : 'fech', amb: 'livre' }; } return k.law[key]; }
const lawEco = k => (LW(k, 'tax') === 'prog' ? .95 : 1) * (LW(k, 'sau') === 'pub' ? .97 : 1) * (LW(k, 'edu') === 'pub' ? .97 : 1) * (LW(k, 'amb') === 'prot' ? .96 : 1);
const lawHap = k => (LW(k, 'mil') === 'obr' ? -.05 : 0) + (LW(k, 'tax') === 'prog' ? .03 : 0) + (LW(k, 'imp') === 'cens' ? -.04 : .02);
const lawSt = k => (LW(k, 'imp') === 'cens' ? .04 : 0) + (LW(k, 'imi') === 'aberta' ? -.02 : .01);
const lawRes = k => LW(k, 'edu') === 'pub' ? 1.15 : 1;
const lawPop = k => (LW(k, 'imi') === 'aberta' ? 1.04 : 1) * (LW(k, 'sau') === 'pub' ? 1.03 : 1);
function setLaw(g, c, key, val) { const k = g.c[c]; if (!LAWS[key] || !LAWS[key].o[val]) return 'Lei inválida.'; if (LW(k, key) === val) return 'Essa lei já vale.'; if ((k.lawT || 0) > g.turn) return 'Espere ' + (k.lawT - g.turn) + ' meses para outra reforma.'; if (k.dp < 2) return 'Faltam pontos de diplomacia (2).'; k.dp -= 2; k.law[key] = val; k.lawT = g.turn + 6; provs(g, c).forEach(p => p.st = clamp(p.st - .03, 0, 1)); log(g, k.n + ' aprovou: ' + LAWS[key].n + ' ' + LAWS[key].o[val][0].toLowerCase() + '.', 'pol', c); return null; }
/* ---------- COMÉRCIO ---------- */
const ecoMemo = new WeakMap(); const ecoSum = (g, c) => { let m = ecoMemo.get(g); if (!m || m.t !== g.turn) { m = { t: g.turn, v: {} }; for (const p of g.p) m.v[p.own] = (m.v[p.own] || 0) + p.eco; ecoMemo.set(g, m); } return m.v[c] || 0; };
function tradeInc(g, c) { const k = g.c[c]; if (!k.tr || !k.tr.length) return 0; const me = ecoSum(g, c); let s = 0; for (const o of k.tr) if (g.c[o] && g.c[o].alive) s += Math.min(me, ecoSum(g, o)) * .00045; const em = (g.c.filter(o => o.alive && o.emb && o.emb.includes(c)).length) * .02; return s - (me * .0058 * em); }
function tradeSign(g, a, b) { const A = g.c[a], B = g.c[b]; A.tr = A.tr || []; B.tr = B.tr || []; if (A.tr.includes(b)) return 'Vocês já comerciam.'; if (atWar(g, a, b)) return 'Vocês estão em guerra.'; if (A.tr.length >= 6 || B.tr.length >= 6) return 'Limite de 6 acordos comerciais.'; if (!isH(g, b) && g.rel[a][b] + R(g) * 25 < 5) return B.n + ' recusou o acordo.'; A.tr.push(b); B.tr.push(a); relCh(g, a, b, 8); log(g, A.n + ' e ' + B.n + ' assinaram um acordo comercial.', 'dip', a); return { m: 'Acordo comercial assinado.' }; }
function tradeCut(g, a, b) { const A = g.c[a], B = g.c[b]; A.tr = (A.tr || []).filter(x => x !== b); B.tr = (B.tr || []).filter(x => x !== a); }
function embargo(g, a, b) { const A = g.c[a]; A.emb = A.emb || []; if (A.emb.includes(b)) { A.emb = A.emb.filter(x => x !== b); return { m: 'Embargo suspenso.' }; } tradeCut(g, a, b); A.emb.push(b); relCh(g, a, b, -25); log(g, A.n + ' impôs embargo a ' + g.c[b].n + '.', 'dip', a); return { m: 'Embargo imposto.' }; }
/* ---------- ESPIONAGEM ---------- */
const SPY = { tech: ['Roubar tecnologia', 4], sab: ['Sabotar a economia', 3], rev: ['Incitar revolta', 4], golpe: ['Financiar golpe', 8] };
function spyChance(g, a, b, op) { const A = g.c[a], B = g.c[b]; return clamp(.62 + (A.tech - B.tech) * .02 - (B.ideo === 'dit' ? .1 : 0) - (op === 'golpe' ? .35 : 0) - (LW(B, 'imp') === 'cens' ? .05 : 0), .05, .9); }
function spyOp(g, a, b, op) { const A = g.c[a], B = g.c[b]; if (!SPY[op]) return 'Operação inválida.'; A.spy = A.spy || 0; if (A.spy < SPY[op][1]) return 'Faltam agentes (' + SPY[op][1] + ').'; if (op === 'golpe' && (isH(g, b) || B.bonga)) return 'Esse governo é protegido demais.'; A.spy -= SPY[op][1]; const ok = R(g) < spyChance(g, a, b, op); let m;
  if (ok) { if (op === 'tech') { A.resP += techCost(A.tech) * (B.tech > A.tech ? .5 : .15) * Math.min(1, techFr(g, A)); m = 'Tecnologia de ' + B.n + ' roubada.'; } else if (op === 'sab') { B.gold *= .88; const p = pick(g, provs(g, b)); if (p) p.eco *= .9; m = 'Economia de ' + B.n + ' sabotada.'; } else if (op === 'rev') { const p = pick(g, provs(g, b).filter(q => q.id !== B.cap)); if (p) { p.st = clamp(p.st - .3, 0, 1); p.a[REB] = (p.a[REB] || 0) + Math.round(p.pop * .03); p.rf = p.rf || rebFaction(g, p); } m = 'Revolta incitada em ' + B.n + '.'; } else { setGov(g, B, pick(g, ['dit', 'rep']), 'golpe'); m = 'Golpe financiado em ' + B.n + '.'; } }
  else m = 'A operação contra ' + B.n + ' falhou.';
  if (!ok || R(g) < .2) { relCh(g, a, b, -30); A.inf += 4; const t = 'Espiões de ' + A.n + ' foram descobertos em ' + B.n + '.'; log(g, t, 'dip', a); if (isH(g, a) || isH(g, b) || rankTop(g, a)) tle(g, 'spy', t, a, B.cap); if (!ok) m += ' Os agentes foram descobertos.'; else m += ' Mas os agentes foram descobertos.'; }
  return { m }; }
/* ---------- REVOLTAS COM BANDEIRA ---------- */
function rebFaction(g, p) { const d = g.map.ps && g.map.ps[p.id], base = ((d && d.r) || p.n).split(' - ')[0]; return { n: pick(g, ['Movimento pela Independência de ', 'Frente de Libertação de ', 'Resistência de ']) + base, col: pal(g) }; }
/* ---------- CLIMA, POBREZA E TICKS ---------- */
const climMul = g => 1 + Math.max(0, (g.temp || 0) - 1) * .45;
function climTick(g) { if (g.temp == null) g.temp = 0; let e = 0; for (const k of g.c) { if (!k.alive || k.id < 2 || k.tech < 16) continue; e += provs(g, k.id).reduce((s, p) => s + p.eco, 0) * (LW(k, 'amb') === 'prot' ? .5 : 1) * (k.tech <= 34 ? (k.tech - 14) / 10 : Math.max(0, 2 - (k.tech - 34) / 12)); } const W = g.p.reduce((s, p) => s + p.eco, 0) || 1; g.temp += .0009 * (e / W) - Math.max(0, g.temp - .2) * .0004; if (g.temp > 1.8 && R(g) < .015) { const l = g.p.filter(p => p.own > 1 && (p.t === 'des' || p.t === 'pla')); if (l.length) { const p = pick(g, l); p.eco *= .93; p.pop *= .98; log(g, 'Seca extrema em ' + p.n + ' (' + g.c[p.own].n + ').', 'bad', p.own); } } if (g.temp > 2 && !g.climDeal && R(g) < .01) { g.climDeal = 1; let n = 0; g.c.forEach(k => { if (k.alive && k.id > 1 && !isH(g, k.id) && R(g) < .6) { LW(k, 'amb'); k.law.amb = 'prot'; n++; } }); const m = 'Acordo mundial do clima: ' + n + ' nações adotaram proteção ambiental.'; log(g, m, 'big'); tle(g, 'gov', m, -1, -1); } }
function povTick(g) { const rows = []; for (const k of g.c) { if (!k.alive || k.id < 2) continue; let eco = 0, pop = 0, dev = 0; const l = provs(g, k.id); for (const p of l) { eco += p.eco; pop += p.pop; dev += p.dev; } rows.push([k, l, eco, pop, l.length ? dev / l.length : 0]); } const W = rows.reduce((s, r) => s + r[2], 0) / Math.max(1, rows.reduce((s, r) => s + r[3], 0)); for (const [k, l, eco, pop, dev] of rows) { if (k.pov0 == null) { const pc = eco / Math.max(1, pop) / Math.max(1e-9, W) * 11000; k.pov0 = clamp(1.65 - .35 * Math.log10(Math.max(100, pc)), .02, .9); k.dev0 = dev; } const tgt = clamp(k.pov0 * Math.max(.35, 1 - (dev - k.dev0) * 1.0) - (LW(k, 'tax') === 'prog' ? .04 : 0) - (LW(k, 'sau') === 'pub' ? .03 : 0) - k.bGoods * .08 + wmCount(g, k.id) * .04 + (k.recon > 0 ? .05 : 0) + (k.hap < .4 ? .05 : 0) + (k.ideo === 'ana' ? .15 : 0), .01, .95); k.pov = k.pov == null ? tgt : k.pov + (tgt - k.pov) * .06; } }
function relTick(g) { if (g.turn % 6) return; for (const k of g.c) if (k.relNew && k.alive) { const cnt = {}; for (const p of provs(g, k.id)) cnt[p.rel] = (cnt[p.rel] || 0) + p.pop; const b = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (b) { k.rel = +b[0]; delete k.relNew; } } const nb = g.map.neigh, y = year(g); for (const p of g.p) { if (p.own < 2 || R(g) > .03) continue; const L = nb[p.id]; if (!L || !L.length) continue; const q = g.p[L[Math.floor(R(g) * L.length)]], k = g.c[p.own]; if (q.rel !== p.rel && q.own > 1) { const o = g.c[q.own], same = q.own === p.own && k.rel === q.rel; if (same ? R(g) < .2 : (o.tech > k.tech + 1 && R(g) < .05)) p.rel = q.rel; }
  if (g.relR && y >= 1960 && p.dev > .75 && p.rel !== 7 && p.rel !== 3 && R(g) < .004) p.rel = 7; }
  if (g.turn % 60) return; for (const k of g.c) { if (!k.alive || k.id < 2) continue; const cnt = {}; let t = 0; for (const p of provs(g, k.id)) { cnt[p.rel] = (cnt[p.rel] || 0) + p.pop; t += p.pop; } const b = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (b && +b[0] !== k.rel && b[1] > t * .6) { k.rel = +b[0]; const m = k.n + (+b[0] === 7 && g.relR ? ' virou um Estado laico: a maioria do povo já não segue religião.' : ' adotou ' + RELIG[k.rel][0] + ' como religião majoritária.'); log(g, m, 'pol', k.id); if (rankTop(g, k.id)) tle(g, 'rel', m, k.id, k.cap); } } }
function sysTick(g) { climTick(g); relTick(g); for (const k of g.c) { if (!k.alive || k.id < 2) continue; const atW = wmCount(g, k.id) > 0; k.warT = atW ? (k.warT || 0) + 1 : 0; k.ww = clamp((k.ww || 0) + (atW ? AOH.wwWar * Math.min(AOH.wwLimit, 1 + k.warT / (AOH.wwScale * 12)) : -AOH.wwPeace), 0, 1); } if (g.turn % 3 === 0) povTick(g); for (const k of g.c) { if (!k.alive || k.id < 2) continue; k.spy = Math.min(20, (k.spy || 0) + .25 + (LW(k, 'edu') === 'pub' ? .05 : 0)); if (isH(g, k.id)) continue;
  if (R(g) < .004) { const key = pick(g, Object.keys(LAWS)), opts = Object.keys(LAWS[key].o), v = pick(g, opts); if ((k.gold > 600 || v !== 'pub') && !(k.ideo === 'rep' && v === 'cens')) { LW(k, key); k.law[key] = v; } }
  if ((k.tr || []).length < 4 && R(g) < .01) { const cand = nbC(g, k.id).filter(o => !(k.tr || []).includes(o.id) && !atWar(g, k.id, o.id) && g.rel[k.id][o.id] > 20); if (cand.length) tradeSign(g, k.id, pick(g, cand).id); }
  if (k.spy >= 6 && R(g) < .01) { const r = k.rival > 1 && g.c[k.rival] && g.c[k.rival].alive ? k.rival : null; if (r && !isH(g, r)) spyOp(g, k.id, r, pick(g, ['tech', 'sab', 'rev'])); } } }
/* ---------- TURNO EM PARTES (TELA FLUIDA) ---------- */
const preAI = new WeakMap();
function beginAI(g) { buildCache(g); preAI.set(g, { q: shuffle(g, g.c.filter(k => k.alive && k.id > 1 && !isH(g, k.id))), i: 0 }); }
function stepAI(g, ms) { const s = preAI.get(g); if (!s) return true; const t = Date.now(); while (s.i < s.q.length) { const k = s.q[s.i++]; if (k.alive) aiTurn(g, k); if (Date.now() - t > ms) break; } if (s.i >= s.q.length) { s.done = true; return true; } return false; }

root.Engine = { natives, expedition, tleAll, bord, LAWS, LW, setLaw, tradeSign, tradeCut, embargo, SPY, spyChance, spyOp, beginAI, stepAI, scoreParts, playerTreaty, S, setGov, allCreate, allJoin, allInvite, allKick, predictWar, nukeStrike, TITLE, newGame: o => { if (o.scn) { const g = newScenario(o); relInit(g, root.MAPS[g.scn.map] || root.MAPS[o.scn.map]); return g; } setRelig(false); return newGame(o); }, RELIG_R, INV, investCity, cityCost, foreignInvest, nationalize, foundCity, cityTier, setHumans, passTurn, HIST_BR_N: () => HIST_BR.length,  save, load, endTurn, TER, IDEO, RELIG, AGES, BLD, WONDERS, SKILLS, DIS, NEU, REB, stats, income, atWar, friendly, hasD, setD, dip, canEnter, canDeclare, declareWar, action, recruit, disband, order, build, demolish, wonder, colonize, invest, assimilate, festival, loan, repay, moveCap, setIdeo, spendSkill, releaseVassal, leaveAlliance, playerPeace, warScore, answer, console_, rank, score, techCost, ageName, dateStr, year, fmt, links, pw, armyOf, provs, wmCount, recruitCost, reachOwn, TERc: TER, log, relCh };
})(typeof window !== 'undefined' ? window : globalThis);
