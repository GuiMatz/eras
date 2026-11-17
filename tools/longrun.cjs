// Simulacao longa ate o ano 5000: amostra a cada 50 anos e marca numeros absurdos.
// uso: node tools/longrun.cjs <cenario> <seed> <anoFinal> <saida.jsonl>
const fs = require('fs'), path = require('path'), G = path.resolve(__dirname, '..');
const [kind = 'proc', seedS = '1', endS = '5000', out = path.join(G, 'tools', 'longrun-' + kind + '.jsonl')] = process.argv.slice(2), seed = +seedS, END = +endS;
globalThis.window = globalThis; for (const f of ['roster.js', 'data/nations.js', 'data/leaders.js', 'data/parties.js', 'data/ww.js', 'data/eras.js', 'data/world.js', 'data/brazil.js', 'data/bongas.js', 'engine.js']) (0, eval)(fs.readFileSync((process.argv[6] || process.env.ENG) && f === 'engine.js' ? (process.argv[6] || process.env.ENG) : path.join(G, f), 'utf8'));
const E = window.Engine, WW = window.WW;
const mk = () => { if (kind === 'proc') return E.newGame({ seed, nProv: 1200, startP: 17, free: true, ilha: 1, realms: 0, roster: ROSTER, player: -1, diff: 1, even: true, vic: { dom: 2, year: 0 }, startY: 2026 });
  if (kind === 'reinos') return E.newGame({ scn: { map: 'bongas', kind: 'bongas' }, seed, diff: 1, roster: ROSTER, rosterAll: ROSTER, bmode: 'reinos', startY: 2026, opt: { ev: 1, rev: 1, hist: true } });
  const sc = kind === 'world' || kind === 'cont' || kind === 'fut' || kind.startsWith('c_') ? { map: 'world', kind } : kind === 'brazil' ? { map: 'brazil', kind } : { map: WW[kind].map || 'world', kind };
  return E.newGame({ scn: sc, seed, diff: 1, roster: ROSTER, startY: WW[kind] ? WW[kind].y : kind === 'fut' ? 2150 : 2026, opt: { ev: 1, rev: 1, hist: true } }); };
const g = mk(); fs.writeFileSync(out, '');
const bad = v => v == null || !isFinite(v);
function sample() {
  const L = g.c.filter(k => k.alive && k.id > 1); let pop = 0, eco = 0, arm = 0, nanP = 0, maxPop = 0, dev = 0, st = 0, n = 0, own = 0;
  for (const p of g.p) { if (bad(p.pop) || bad(p.eco) || bad(p.dev) || bad(p.st)) nanP++; pop += p.pop; eco += p.eco; if (p.pop > maxPop) maxPop = p.pop; if (p.own > 1) { dev += p.dev; st += p.st; n++; own++; } for (const s in p.a) { arm += p.a[s] || 0; if (bad(p.a[s])) nanP++; } }
  let gold = 0, maxGold = -1e18, minGold = 1e18, gross = 0, upk = 0, tech = 0, maxTech = 0, hap = 0, pov = 0, inf = 0, loan = 0, infl = 0, nanC = 0, sizeMax = 0;
  for (const k of L) { const i = E.income(g, k.id); if (bad(k.gold) || bad(i.gross) || bad(k.tech) || bad(k.hap)) nanC++; gold += k.gold; maxGold = Math.max(maxGold, k.gold); minGold = Math.min(minGold, k.gold); gross += i.gross; upk += i.upk; tech += k.tech; maxTech = Math.max(maxTech, k.tech); hap += k.hap; pov += k.pov || 0; inf += k.inf || 0; loan += k.loan || 0; infl += k.infl || 0; sizeMax = Math.max(sizeMax, E.provs(g, k.id).length); }
  const nL = Math.max(1, L.length);
  return { y: g.startY + Math.floor(g.turn / 12), alive: L.length, civs: g.c.length, pop: Math.round(pop), eco: Math.round(eco), arm: Math.round(arm), maxPop: Math.round(maxPop), dev: +(dev / Math.max(1, n)).toFixed(3), st: +(st / Math.max(1, n)).toFixed(3), owned: own,
    gold: Math.round(gold), maxGold: Math.round(maxGold), minGold: Math.round(minGold), goldTurns: +(gold / Math.max(1, gross)).toFixed(2), upkShare: +(upk / Math.max(1, gross)).toFixed(3), techAvg: +(tech / nL).toFixed(1), techMax: maxTech, hap: +(hap / nL).toFixed(3), pov: +(pov / nL).toFixed(3), infAvg: +(inf / nL).toFixed(1), loanAvg: Math.round(loan / nL), infl: +(infl / nL).toFixed(3),
    temp: +(g.temp || 0).toFixed(2), wars: g.wars.length, al: Object.keys(g.al).length, tle: (g.tle || []).length, log: (g.log || []).length, cups: (g.cups || []).length, oly: (g.oly || []).length, space: (g.space || []).length, saveKB: Math.round((E.save ? E.save(g) : JSON.stringify(g)).length / 1024), sizeMax, nanP, nanC, ms: 0 };
}
let t0 = Date.now(), last = null; const first = sample(); fs.appendFileSync(out, JSON.stringify(first) + '\n');
try {
  while (g.startY + Math.floor(g.turn / 12) < END) {
    const tt = Date.now(); for (let i = 0; i < 600; i++) E.endTurn(g);
    const s = sample(); s.ms = Math.round((Date.now() - tt) / 600); fs.appendFileSync(out, JSON.stringify(s) + '\n'); last = s;
    if (s.alive === 0) { fs.appendFileSync(out, JSON.stringify({ fim: 'nenhuma nação viva', y: s.y }) + '\n'); break; }
  }
} catch (e) { fs.appendFileSync(out, JSON.stringify({ erro: String(e && e.stack || e).slice(0, 600), y: g.startY + Math.floor(g.turn / 12) }) + '\n'); }
fs.appendFileSync(out, JSON.stringify({ fim: true, segundos: Math.round((Date.now() - t0) / 1000) }) + '\n');
