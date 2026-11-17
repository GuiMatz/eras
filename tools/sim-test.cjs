// Teste sem navegador: node sim-test.cjs [cenario] [meses]
const fs = require('fs'), path = require('path'), G = path.resolve(__dirname, '..');
globalThis.window = globalThis; globalThis.MAPS = {};
for (const f of ['roster.js', 'data/nations.js', 'data/leaders.js', 'data/ww.js', 'data/world.js', 'data/brazil.js', 'data/bongas.js', 'engine.js']) (0, eval)(fs.readFileSync(path.join(G, f), 'utf8'));
const E = globalThis.Engine, kinds = { world: { map: 'world', kind: 'world' }, brazil: { map: 'brazil', kind: 'brazil' }, bongas: { map: 'bongas', kind: 'bongas' }, livre: { map: 'bongas', kind: 'bongas' }, ww1: { map: 'world', kind: 'ww1' }, ww2: { map: 'world', kind: 'ww2' } };
const which = process.argv[2] ? [process.argv[2]] : Object.keys(kinds), months = +process.argv[3] || 120;
for (const w of which) {
  const g = E.newGame({ scn: kinds[w], bmode: 'reinos', noOthers: w === 'livre', startY: 2017, seed: 7, roster: globalThis.ROSTER, vic: { dom: 2, year: 0 } }); const c0 = g.c.filter(k => k.alive && k.id > 1).length; let t0 = Date.now(), maxT = 0;
  for (let i = 0; i < months; i++) { const t = Date.now(); E.endTurn(g); maxT = Math.max(maxT, Date.now() - t); }
  const alive = g.c.filter(k => k.alive && k.id > 1), r = E.rank(g).slice(0, 5).map(x => g.c[x.id].n + ' ' + E.provs(g, x.id).length + 'p tech' + g.c[x.id].tech), logs = k => g.log.filter(l => l.k === k).length, s = E.save(g), g2 = E.load(s);
  const bad = g.c.filter(k => !isFinite(k.gold)).length + g.p.filter(p => !isFinite(p.pop) || !isFinite(p.eco)).length;
  if (bad) console.log('   NaN em:', g.c.filter(k => !isFinite(k.gold)).map(k => k.n + ' gold=' + k.gold + ' tech=' + k.tech).concat(g.p.filter(p => !isFinite(p.pop) || !isFinite(p.eco)).map(p => p.n + ' pop=' + p.pop + ' eco=' + p.eco)).slice(0, 6).join(' ; '));
  const inv = g.p.reduce((a, p) => a + Object.values(p.ci || {}).reduce((x, y) => x + y, 0), 0);
  console.log(`[${w}] ${g.p.length} prov | nacoes ${c0}->${alive.length} (total criadas ${g.c.length}) | ${Math.round((Date.now() - t0) / months)}ms/turno max ${maxT}ms | guerras ${g.wars.length} | revoltas/renasc ${logs('rev')} | invest ${inv} | NaN ${bad} | save ${(s.length / 1e6).toFixed(1)}MB ok=${g2.turn === g.turn} provs=${E.provs(g2, g2.c[alive[0].id].id).length}`);
  console.log('   terras livres:', g.p.filter(p => p.own === 0).length, 'bongas vivos:', g.c.filter(k => k.alive && /^Reino d/.test(k.n)).length, 'provs bongas:', g.p.filter(p => /^Reino d/.test(g.c[p.own].n)).length); console.log('   top:', r.join(' ; ')); console.log('   ex:', g.log.filter(l => l.k === 'rev').slice(-5).map(l => l.m).join(' | '));
}

