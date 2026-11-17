// Gera data/world.js e data/brazil.js a partir de dados abertos (Natural Earth, dominio publico; IBGE).
// Uso: node build-map.mjs <pasta-com-os-downloads>   (a pasta precisa ter mapshaper em node_modules)
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const DL = path.resolve(process.argv[2] || '.'), OUT = path.resolve(import.meta.dirname, '..', 'data');
fs.mkdirSync(OUT, { recursive: true });
const rd = f => JSON.parse(fs.readFileSync(path.join(DL, f), 'utf8'));
const swapQ = s => s.replace(/['"]/g, c => c === "'" ? '"' : "'"); // cmd.exe so entende aspas duplas
const ms = a => execSync(`node "${path.join(DL, 'node_modules/mapshaper/bin/mapshaper')}" ${swapQ(a)}`, { cwd: DL, stdio: ['ignore', 'ignore', 'inherit'], maxBuffer: 1 << 30 });

/* ---------- topologia ---------- */
function decode(topo) {
  const t = topo.transform;
  return topo.arcs.map(a => { let x = 0, y = 0; return a.map(p => { x += p[0]; y += p[1]; return t ? [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]] : [p[0], p[1]]; }); });
}
const geoms = topo => Object.values(topo.objects)[0].geometries;
const polysOf = g => g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
const abs = i => i < 0 ? ~i : i;
function adjacency(gs) {
  const by = new Map(); gs.forEach((g, i) => polysOf(g).forEach(pl => pl.forEach(r => r.forEach(a => { const k = abs(a); (by.get(k) || by.set(k, []).get(k)).push(i); }))));
  const nb = gs.map(() => new Map()), coast = gs.map(() => 0);
  for (const l of by.values()) { if (l.length === 1) coast[l[0]] = 1; else if (l[0] !== l[1]) { nb[l[0]].set(l[1], (nb[l[0]].get(l[1]) || 0) + 1); nb[l[1]].set(l[0], (nb[l[1]].get(l[0]) || 0) + 1); } }
  return { nb, coast };
}
function ringsLL(g, arcs) {
  return polysOf(g).map(pl => pl.map(r => { const o = []; r.forEach(a => { const s = a < 0 ? arcs[~a].slice().reverse() : arcs[a]; s.forEach((p, i) => { if (i || !o.length) o.push(p); }); }); return o; }));
}
const inRing = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const inPolys = (x, y, ps) => ps.some(pl => inRing(x, y, pl[0]) && !pl.slice(1).some(h => inRing(x, y, h)));
const bbox = ps => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const pl of ps) for (const [x, y] of pl[0]) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; } return [a, b, c, d]; };

/* ---------- camadas auxiliares ---------- */
const places = rd('places.geojson').features.map(f => ({ x: f.geometry.coordinates[0], y: f.geometry.coordinates[1], n: String(f.properties.name).replace(/\s+/g, ' '), pop: Math.max(f.properties.pop_max || 0, 1000), cap: f.properties.adm0cap ? 1 : 0, w: f.properties.worldcity || 0 }));
const regions = rd('regions.geojson').features.map(f => { const g = f.geometry; const ps = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; return { k: String(f.properties.FEATURECLA || f.properties.featurecla), ps, b: bbox(ps) }; }).filter(r => /Range|Desert|Tundra|Plateau/i.test(r.k));
function terrain(x, y, h) {
  for (const r of regions) { if (x < r.b[0] || x > r.b[2] || y < r.b[1] || y > r.b[3]) continue; if (inPolys(x, y, r.ps)) { if (/Range/i.test(r.k)) return 'mou'; if (/Desert/i.test(r.k)) return 'des'; if (/Tundra/i.test(r.k)) return 'tun'; if (/Plateau/i.test(r.k)) return 'hil'; } }
  const l = Math.abs(y); if (l > 62) return 'tun'; if (l < 12) return 'flo'; const v = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + h) * 43758.5453) % 1; return v < .55 ? 'pla' : v < .82 ? 'flo' : 'hil';
}
function assignCities(ll) {
  const B = ll.map(bbox), out = ll.map(() => []);
  for (const c of places) { for (let i = 0; i < ll.length; i++) { const b = B[i]; if (c.x < b[0] || c.x > b[2] || c.y < b[1] || c.y > b[3]) continue; if (inPolys(c.x, c.y, ll[i])) { out[i].push(c); break; } } }
  out.forEach(l => l.sort((a, b) => b.cap - a.cap || b.pop - a.pop)); return out;
}
function encodeArcs(arcs, P) { return arcs.map(a => { const o = []; let px = 0, py = 0; a.forEach(p => { const [x, y] = P(p), X = Math.round(x), Y = Math.round(y); if (o.length && X === px && Y === py) return; o.push(X - px, Y - py); px = X; py = Y; }); return o.join(','); }).join(';'); }
function rawArcs(gs) { return gs.map(g => polysOf(g).map(pl => pl.map(r => r))); }
function seaLinks(P, coast, nb, r, k) {
  const sea = P.map(() => []); const list = P.map((p, i) => i).filter(i => coast[i]);
  for (const a of list) { const d = []; for (const b of list) { if (a === b || nb[a].has(b)) continue; const v = (P[a].x - P[b].x) ** 2 + (P[a].y - P[b].y) ** 2; if (v < r * r) d.push([v, b]); } d.sort((u, v) => u[0] - v[0]); d.slice(0, k).forEach(([, b]) => { if (!sea[a].includes(b)) sea[a].push(b); if (!sea[b].includes(a)) sea[b].push(a); }); }
  return sea;
}
function bridgeIslands(P, nb) { // ilhas sem vizinho terrestre recebem ligacao direta com a costa mais proxima
  P.forEach((p, a) => { if (nb[a].size) return; const d = P.map((q, b) => [b === a ? 1e18 : (p.x - q.x) ** 2 + (p.y - q.y) ** 2, b]).sort((u, v) => u[0] - v[0]).slice(0, 2); d.forEach(([, b]) => { nb[a].set(b, 1); nb[b].set(a, 1); }); });
}

/* ---------- MUNDO ---------- */
function world(src = 'admin1.geojson', outName = 'world', keep = false) {
  const brN = {}; if (keep) rd('br_imediatas_nomes.json').forEach(r => brN[r.id] = r.nome.replace(/\s*\u00bf\s*/g, ' – ')); const owners = keep ? rd('bongas-owners.json') : {};
  ms(`-i ${src} snap -filter 'adm0_a3 != "ATA"' -each 'aid=this.id, code=this.properties.code||"", km=this.area/1e6, ix=this.innerX, iy=this.innerY' -filter-fields adm0_a3,admin,iso_a2,name,name_pt,aid,code,km,ix,iy -o a1.topo.json format=topojson force`);
  const topo = rd('a1.topo.json'), gs = geoms(topo), { nb } = adjacency(gs), byC = new Map();
  gs.forEach((g, i) => { const c = g.properties.adm0_a3; (byC.get(c) || byC.set(c, []).get(c)).push(i); });
  const grp = gs.map((g, i) => i), gArea = gs.map(g => g.properties.km || 0);
  const find = i => grp[i] === i ? i : (grp[i] = find(grp[i]));
  for (const [c, ids] of byC) {
    const area = ids.reduce((s, i) => s + gArea[i], 0); const tgt = keep && c === 'BRA' ? ids.length : Math.max(1, Math.min(ids.length, Math.round(3 + Math.sqrt(area) / 62)));
    let n = ids.length;
    while (n > tgt) {
      let a = -1, av = 1e18; for (const i of ids) if (find(i) === i && gArea[i] < av) { av = gArea[i]; a = i; }
      let b = -1, bv = 1e18;
      for (const i of ids) if (find(i) === a) for (const [o] of nb[i]) { const r = find(o); if (r !== a && gs[o].properties.adm0_a3 === c && gArea[r] < bv) { bv = gArea[r]; b = r; } }
      if (b < 0) { const pa = gs[a].properties; for (const i of ids) { const r = find(i); if (r === a) continue; const d = (gs[r].properties.ix - pa.ix) ** 2 + (gs[r].properties.iy - pa.iy) ** 2; if (d < bv) { bv = d; b = r; } } }
      if (b < 0) break; const [big, small] = gArea[a] >= gArea[b] ? [a, b] : [b, a]; grp[small] = big; gArea[big] += gArea[small]; n--;
    }
  }
  const rows = ['aid,gid']; gs.forEach((g, i) => rows.push(g.properties.aid + ',' + find(i))); fs.writeFileSync(path.join(DL, 'grp.csv'), rows.join('\n'));
  const nameOf = {}; gs.forEach((g, i) => { if (find(i) === i) nameOf[i] = g.properties.name_pt || g.properties.name; });
  ms(`-i a1.topo.json -join grp.csv keys=aid,aid -dissolve2 gid copy-fields=adm0_a3,admin,iso_a2,code -simplify interval=9000 keep-shapes -clean -each 'km=this.area/1e6, ix=this.innerX, iy=this.innerY' -o a2.topo.json format=topojson quantization=60000 force`);
  const t2 = rd('a2.topo.json'), g2 = geoms(t2), arcs = decode(t2), A = adjacency(g2), ll = g2.map(g => ringsLL(g, arcs));
  const miller = lat => 1.25 * Math.log(Math.tan(Math.PI / 4 + .4 * lat * Math.PI / 180));
  const W = 6000, sc = W / 360, top = miller(84), Pj = ([x, y]) => [(x + 180) * sc, (top - miller(Math.min(84, Math.max(-60, y)))) * 180 / Math.PI * sc];
  const H = Math.round(Pj([0, -60])[1]);
  const cities = assignCities(ll), a0 = rd('admin0.geojson').features.map(f => f.properties), natIx = new Map(), nat = [];
  const prov = g2.map((g, i) => {
    const pr = g.properties; let c = natIx.get(pr.adm0_a3);
    if (c == null) { const m = a0.find(x => x.ADM0_A3 === pr.adm0_a3) || {}; c = nat.length; natIx.set(pr.adm0_a3, c); const iso = (m.ISO_A2_EH && m.ISO_A2_EH !== '-99' ? m.ISO_A2_EH : pr.iso_a2 || '').toLowerCase(); nat.push({ a3: pr.adm0_a3, iso: /^[a-z]{2}$/.test(iso) ? iso : '', n: m.NAME_PT || m.NAME_LONG || pr.admin, pop: m.POP_EST || 80000, gdp: m.GDP_MD || 1500 }); }
    if (pr.ix == null) { const m = a0.find(q => q.ADM0_A3 === pr.adm0_a3) || {}; pr.ix = m.LABEL_X || 0; pr.iy = m.LABEL_Y || 0; pr.km = pr.km || 1; }
    const [x, y] = Pj([pr.ix, pr.iy]), cs = cities[i];
    const code = pr.code ? String(pr.code) : ''; return { ...(code ? { b: owners[code] } : {}), n: (code && brN[code]) || (cs[0] && cs[0].n) || nameOf[pr.gid] || pr.admin, r: nameOf[pr.gid] || '', c, x: Math.round(x), y: Math.round(y), km: Math.round(pr.km), t: terrain(pr.ix, pr.iy, i), co: A.coast[i], cs: cs.slice(0, 4).map(k => { const q = Pj([k.x, k.y]); return [k.n, Math.round(q[0]), Math.round(q[1]), k.pop, k.cap]; }), w: cs.reduce((s, k) => s + k.pop, 0) };
  });
  nat.forEach((k, c) => { const ps = prov.filter(p => p.c === c), ws = ps.map(p => p.w + 3 * Math.sqrt(p.km + 1) * 30 + 500), tw = ws.reduce((a, b) => a + b, 0), ge = ps.map(p => p.w + 400); const te = ge.reduce((a, b) => a + b, 0); ps.forEach((p, i) => { p.pop = Math.round(k.pop * ws[i] / tw); p.gdp = Math.round(k.gdp * ge[i] / te); }); const cp = ps.findIndex(p => p.cs.some(q => q[4])); k.cap = prov.indexOf(cp >= 0 ? ps[cp] : ps.slice().sort((a, b) => b.pop - a.pop)[0]); });
  bridgeIslands(prov, A.nb); const sea = seaLinks(prov, A.coast, A.nb, 300, 5);
  fs.writeFileSync(path.join(OUT, outName + '.js'), 'window.MAPS=window.MAPS||{};MAPS.' + outName + '=' + JSON.stringify({ W, H, arcs: encodeArcs(arcs, Pj), rings: rawArcs(g2), neigh: A.nb.map(m => [...m.keys()]), sea, p: prov.map(({ w, ...p }) => p), nat }));
  console.log(outName, prov.length, 'provincias', nat.length, 'nacoes', H);
}

/* ---------- BRASIL ---------- */
const UF = { 11: ['RO', 'Rondônia', 1582, 60], 12: ['AC', 'Acre', 830, 21], 13: ['AM', 'Amazonas', 3941, 131], 14: ['RR', 'Roraima', 636, 18], 15: ['PA', 'Pará', 8121, 262], 16: ['AP', 'Amapá', 734, 20], 17: ['TO', 'Tocantins', 1512, 51], 21: ['MA', 'Maranhão', 6776, 125], 22: ['PI', 'Piauí', 3271, 64], 23: ['CE', 'Ceará', 8794, 194], 24: ['RN', 'Rio Grande do Norte', 3302, 80], 25: ['PB', 'Paraíba', 3974, 78], 26: ['PE', 'Pernambuco', 9058, 220], 27: ['AL', 'Alagoas', 3127, 76], 28: ['SE', 'Sergipe', 2211, 51], 29: ['BA', 'Bahia', 14141, 352], 31: ['MG', 'Minas Gerais', 20539, 858], 32: ['ES', 'Espírito Santo', 3833, 186], 33: ['RJ', 'Rio de Janeiro', 16055, 949], 35: ['SP', 'São Paulo', 44411, 2719], 41: ['PR', 'Paraná', 11444, 549], 42: ['SC', 'Santa Catarina', 7610, 428], 43: ['RS', 'Rio Grande do Sul', 10882, 581], 50: ['MS', 'Mato Grosso do Sul', 2757, 142], 51: ['MT', 'Mato Grosso', 3658, 233], 52: ['GO', 'Goiás', 7056, 269], 53: ['DF', 'Distrito Federal', 2817, 286] };
const CAP = { RO: 'Porto Velho', AC: 'Rio Branco', AM: 'Manaus', RR: 'Boa Vista', PA: 'Belém', AP: 'Macapá', TO: 'Palmas', MA: 'São Luís', PI: 'Teresina', CE: 'Fortaleza', RN: 'Natal', PB: 'João Pessoa', PE: 'Recife', AL: 'Maceió', SE: 'Aracaju', BA: 'Salvador', MG: 'Belo Horizonte', ES: 'Vitória', RJ: 'Rio de Janeiro', SP: 'São Paulo', PR: 'Curitiba', SC: 'Florianópolis', RS: 'Porto Alegre', MS: 'Campo Grande', MT: 'Cuiabá', GO: 'Goiânia', DF: 'Distrito Federal' };
function brazil() {
  ms(`-i br_imediatas.geojson snap -simplify interval=3500 keep-shapes -clean -each 'km=this.area/1e6, ix=this.innerX, iy=this.innerY' -o b1.topo.json format=topojson quantization=60000 force`);
  const t = rd('b1.topo.json'), gs = geoms(t), arcs = decode(t), A = adjacency(gs), ll = gs.map(g => ringsLL(g, arcs));
  const names = {}; rd('br_imediatas_nomes.json').forEach(r => names[r.id] = r.nome);
  const k = Math.cos(15 * Math.PI / 180), W = 3200, x0 = -74.5, x1 = -33.5, y1 = 6, sc = W / ((x1 - x0) * k), Pj = ([x, y]) => [(x - x0) * k * sc, (y1 - y) * sc], H = Math.round(Pj([0, -34.5])[1]);
  const cities = assignCities(ll), nat = [], ix = {};
  const prov = gs.map((g, i) => {
    const pr = g.properties, code = String(pr.codarea), uf = UF[code.slice(0, 2)]; if (!uf) throw new Error('UF ' + code); if (ix[uf[0]] == null) { ix[uf[0]] = nat.length; nat.push({ a3: uf[0], iso: uf[0].toLowerCase(), n: uf[1], pop: uf[2] * 1000, gdp: uf[3] * 1000 }); }
    const [x, y] = Pj([pr.ix, pr.iy]), n = (names[code] || code).replace(/\s*¿\s*/g, ' – ');
    return { n, r: '', c: ix[uf[0]], x: Math.round(x), y: Math.round(y), km: Math.round(pr.km), t: terrain(pr.ix, pr.iy, i), co: A.coast[i], cs: cities[i].slice(0, 4).map(q => { const v = Pj([q.x, q.y]); return [q.n, Math.round(v[0]), Math.round(v[1]), q.pop, 0]; }), w: cities[i].reduce((s, q) => s + q.pop, 0) };
  });
  nat.forEach((u, c) => { const ps = prov.filter(p => p.c === c), ws = ps.map(p => p.w + 2500 * Math.sqrt(p.km + 1) + 30000), tw = ws.reduce((a, b) => a + b, 0); ps.forEach((p, i) => { p.pop = Math.round(u.pop * ws[i] / tw); p.gdp = Math.round(u.gdp * ws[i] / tw); }); let cp = ps.find(p => p.n.startsWith(CAP[u.a3])); if (!cp) { cp = ps.slice().sort((a, b) => b.pop - a.pop)[0]; console.log('capital aproximada', u.a3, cp.n); } u.cap = prov.indexOf(cp); });
  // Mapas de fundo: paises vizinhos, so como cenario
  ms(`-i admin0.geojson -filter 'ADM0_A3 != "BRA"' -clip bbox=-90,-45,-25,14 -simplify interval=15000 keep-shapes -o bg.geojson format=geojson force`);
  const bg = rd('bg.geojson').features.flatMap(f => { const g = f.geometry; if (!g) return []; const ps = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; return ps.map(pl => pl[0].map(p => Pj(p).map(Math.round))); });
  bridgeIslands(prov, A.nb); const sea = seaLinks(prov, A.coast, A.nb, 260, 4);
  fs.writeFileSync(path.join(OUT, 'brazil.js'), 'window.MAPS=window.MAPS||{};MAPS.brazil=' + JSON.stringify({ W, H, arcs: encodeArcs(arcs, Pj), rings: rawArcs(gs), neigh: A.nb.map(m => [...m.keys()]), sea, p: prov.map(({ w, ...p }) => p), nat, bg }));
  console.log('brasil', prov.length, 'provincias', nat.length, 'estados', H);
}
function prepBongas() {
  ms(`-i admin1.geojson -filter 'adm0_a3 == "BRA"' -dissolve -each 'inn=1' -o br_out.geojson format=geojson force`);
  ms(`-i br_out.geojson br_imediatas.geojson combine-files -union target=* -each 'pid=this.id' -o br_u.topo.json format=topojson force`);
  const t = rd('br_u.topo.json'), gs = geoms(t), A = adjacency(gs), code = gs.map(g => g.properties.codarea ? String(g.properties.codarea) : '');
  for (let pass = 0; pass < 6; pass++) gs.forEach((g, i) => { if (code[i] || !g.properties.inn) return; let b = '', v = 0; for (const [o, n] of A.nb[i]) if (code[o] && gs[o].properties.inn && n > v) { v = n; b = code[o]; } if (b) code[i] = b; });
  gs.forEach((g, i) => g.properties.code = code[i]); fs.writeFileSync(path.join(DL, 'br_u2.topo.json'), JSON.stringify(t));
  ms(`-i br_u2.topo.json -filter 'inn==1 && !!code' -dissolve code -each 'adm0_a3="BRA", admin="Brazil", iso_a2="BR", name="", name_pt=""' -o br_final.geojson format=geojson force`);
  ms(`-i admin1.geojson -filter 'adm0_a3 != "BRA"' -filter-fields adm0_a3,admin,iso_a2,name,name_pt -o rest.geojson format=geojson force`);
  ms(`-i rest.geojson br_final.geojson combine-files -merge-layers force -o admin1b.geojson format=geojson force`);
  world('admin1b.geojson', 'bongas', true);
}
if (process.argv[3] === 'bongas') prepBongas(); else { world(); brazil(); prepBongas(); }
