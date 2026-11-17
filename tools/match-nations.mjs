// Cruza os NOMES de nacoes (lista de referencia do Age of History II instalado) com um gazetteer aberto.
// Gera nations.raw.json na pasta de downloads; so nomes e coordenadas, nenhuma arte do jogo.
import fs from 'fs'; import path from 'path';
const DL = path.resolve(process.argv[2]), B = String.raw`C:\Program Files (x86)\Steam\steamapps\common\AoCII\game\languages\civilizations\Bundle_ptbr.properties`;
const un = s => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).trim();
const raw = fs.readFileSync(B, 'utf8').split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), un(l.slice(i + 1))]; }).filter(([t]) => t !== 'ran' && t !== 'neu');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const PREF = /^(grao ducado|grande ducado|ducado|principado|reino unido|reino|imperio|sultanato|republica popular|republica democratica|republica socialista|republica federal|republica|emirado|califado|canato|khanato|confederacao|federacao|cla|tribo|estado livre|estado|cidade livre imperial|cidade livre|cidade estado|condado|margraviato|eleitorado|bispado|arcebispado|dinastia|povo|uniao|territorio|colonia|protetorado|nacao|terra|shogunato|tribos)\s+(de|do|da|dos|das|d)?\s*/;
const stripP = n => { let s = norm(n), o; do { o = s; s = s.replace(PREF, ''); } while (s !== o); return s.replace(/^(de|do|da|dos|das|of|the)\s+/, ''); };
const read = f => JSON.parse(fs.readFileSync(path.join(DL, f), 'utf8')).features;
const gz = new Map(), add = (n, x, y, r) => { const k = norm(n || ''); if (k.length < 3) return; const c = gz.get(k); if (!c || r > c[2]) gz.set(k, [x, y, r]); };
for (const f of read('places.geojson')) { const [x, y] = f.geometry.coordinates, p = f.properties; add(p.name, x, y, Math.log10(p.pop_max + 10) - 2); }
for (const f of read('admin1.geojson')) { const p = f.properties; if (p.longitude == null) continue; [p.name, p.name_pt, p.name_en].forEach(n => add(n, p.longitude, p.latitude, 6)); }
for (const f of read('admin0.geojson')) { const p = f.properties; [p.NAME, p.NAME_LONG, p.NAME_PT, p.NAME_EN, p.FORMAL_EN].forEach(n => add(n, p.LABEL_X, p.LABEL_Y, 9)); }
const seen = new Map();
for (const [t, n] of raw) { const k = norm(n); if (!seen.has(k)) seen.set(k, { t, n }); }
const ok = [], miss = [];
for (const v of seen.values()) { const a = gz.get(norm(v.n)) || gz.get(stripP(v.n)); if (a) ok.push({ ...v, x: +a[0].toFixed(2), y: +a[1].toFixed(2) }); else miss.push(v); }
fs.writeFileSync(path.join(DL, 'nations.raw.json'), JSON.stringify({ ok, miss }));
console.log('entradas', raw.length, 'unicas', seen.size, 'localizadas', ok.length, 'sem local', miss.length);
console.log(miss.map(m => m.t + '=' + m.n).join(' | '));
