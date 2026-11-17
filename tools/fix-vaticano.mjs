// O Vaticano é pequeno demais e some na simplificação do mapa (fica sem contorno).
// Este script desenha um círculo pequeno para ele, recortado de dentro de Roma (fronteira compartilhada).
// Rode depois de tools/build-map.mjs:  node tools/fix-vaticano.mjs
import fs from 'fs'; import path from 'path';
const F = path.resolve(import.meta.dirname, '../data/world.js'), PRE = 'window.MAPS=window.MAPS||{};MAPS.world=';
const t = fs.readFileSync(F, 'utf8'); if (!t.startsWith(PRE)) throw new Error('formato inesperado'); const d = JSON.parse(t.slice(PRE.length).replace(/;\s*$/, ''));
const V = d.p.findIndex(p => p.n === 'Vaticano' && p.r === 'Vaticano'); if (V < 0) throw new Error('Vaticano não encontrado');
if (d.rings[V].length) { console.log('Vaticano já tem contorno; nada a fazer.'); process.exit(0); }
const R = d.neigh[V].find(i => d.p[i].n === 'Rome'); if (R == null) throw new Error('Roma não encontrada');
const arcs = d.arcs.split(';'), dec = s => { const v = s.split(',').map(Number); let x = 0, y = 0; const o = []; for (let i = 0; i < v.length; i += 2) { x += v[i]; y += v[i + 1]; o.push([x, y]); } return o; };
const ring = r => { const pts = []; for (const id of r) { let a = dec(arcs[id < 0 ? ~id : id]); if (id < 0) a = a.reverse(); pts.push(...a); } return pts; };
const area = P => { let s = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; s += x1 * y2 - x2 * y1; } return s / 2; };
const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const cx = d.p[V].x, cy = d.p[V].y; let pi = d.rings[R].findIndex(pl => inside(ring(pl[0]), cx, cy)); if (pi < 0) throw new Error('Vaticano fora de Roma');
const outer = ring(d.rings[R][pi][0]), dist = Math.min(...outer.map(([x, y]) => Math.hypot(x - cx, y - cy))), r = Math.max(1.2, Math.min(3, dist * .6));
// círculo no mesmo sentido do contorno de Roma; em Roma ele entra invertido (~id), virando buraco
const N = 14, dir = Math.sign(area(outer)) || 1, pts = []; for (let i = 0; i <= N; i++) { const a = dir * 2 * Math.PI * i / N; pts.push([Math.round((cx + r * Math.cos(a)) * 10) / 10, Math.round((cy + r * Math.sin(a)) * 10) / 10]); } pts[N] = pts[0];
const enc = [pts[0][0], pts[0][1]]; for (let i = 1; i < pts.length; i++) enc.push(+(pts[i][0] - pts[i - 1][0]).toFixed(1), +(pts[i][1] - pts[i - 1][1]).toFixed(1));
const id = arcs.length; arcs.push(enc.join(',')); d.arcs = arcs.join(';');
d.rings[V] = [[[id]]]; d.rings[R][pi].push([~id]); d.p[V].km = d.p[V].km || 1; d.p[V].co = 0;
fs.writeFileSync(F, PRE + JSON.stringify(d)); console.log('Vaticano desenhado: raio', r.toFixed(2), 'arco', id, '| distância até a borda de Roma', dist.toFixed(1));
