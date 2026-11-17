// Bateria de testes do Bongália: rode com  node tools/test-all.cjs  (ou  --rapido  para pular o navegador)
// 1) motor no Node: cada cenário cria, roda 10 anos, procura números inválidos e testa salvar/carregar
// 2) navegador (Edge sem janela): cada cenário abre e roda o auto-teste da interface, e uma partida de jogador
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), G = path.resolve(__dirname, '..');
const SCN = ['world', 'brazil', 'bongas', 'reinos', 'cont', 'fut', 'proc', 'c_eu', 'c_as', 'c_af', 'c_na', 'c_sa', 'c_oc', 'rome', 'y1500', 'nap', 'imp', 'ww1', 'ww2', 'cold', 'reg', 'cid'];
const rapido = process.argv.includes('--rapido'), so = process.argv.find(a => !a.startsWith('-') && SCN.includes(a));
globalThis.window = globalThis; for (const f of ['roster.js', 'data/nations.js', 'data/leaders.js', 'data/parties.js', 'data/ww.js', 'data/eras.js', 'data/world.js', 'data/brazil.js', 'data/bongas.js', 'engine.js']) (0, eval)(fs.readFileSync(path.join(G, f), 'utf8'));
const E = window.Engine, WW = window.WW, falhas = [];
const mk = k => { if (k === 'proc') return E.newGame({ seed: 5, nProv: 600, startP: 9, free: true, ilha: 1, realms: 0, roster: ROSTER, player: -1, diff: 1, even: true, vic: { dom: 2, year: 0 }, startY: 2026 });
  if (k === 'reinos') return E.newGame({ scn: { map: 'bongas', kind: 'bongas' }, seed: 5, diff: 1, roster: ROSTER, bmode: 'reinos', startY: 2026, opt: { ev: 1, rev: 1, hist: true } });
  const map = ['world', 'cont', 'fut'].includes(k) || k.startsWith('c_') ? 'world' : k === 'brazil' || k === 'reg' ? 'brazil' : (WW[k] && WW[k].map) || 'world';
  return E.newGame({ scn: { map, kind: k }, seed: 5, diff: 1, roster: ROSTER, startY: WW[k] ? WW[k].y : k === 'fut' ? 2150 : 2026, opt: { ev: 1, rev: 1, hist: true } }); };
const ruim = v => typeof v !== 'number' || !isFinite(v);
console.log('== motor (Node) ==');
for (const k of so ? [so] : SCN) { const t = Date.now(); try {
    const g = mk(k), n0 = g.c.filter(c => c.alive && c.id > 1).length; for (let i = 0; i < 120; i++) E.endTurn(g);
    const bad = []; for (const p of g.p) { if (ruim(p.pop) || ruim(p.eco) || ruim(p.dev) || ruim(p.st)) bad.push('prov ' + p.id); for (const s in p.a) if (ruim(p.a[s]) || p.a[s] < 0) bad.push('exército ' + p.id); }
    for (const c of g.c) if (c.alive && (ruim(c.gold) || ruim(c.tech) || ruim(c.hap))) bad.push('nação ' + c.n);
    const s = E.save(g), g2 = E.load(s); if (g2.p.length !== g.p.length || g2.turn !== g.turn) bad.push('salvar/carregar'); E.endTurn(g2);
    const n1 = g.c.filter(c => c.alive && c.id > 1).length, ms = Date.now() - t;
    if (bad.length) { falhas.push(k + ': ' + bad.slice(0, 5).join(', ')); console.log('FALHA', k, bad.slice(0, 5).join(', ')); }
    else console.log('ok   ', k.padEnd(7), 'nações', n0 + '→' + n1, '| save', Math.round(s.length / 1024) + 'KB', '|', (ms / 1000).toFixed(1) + 's');
  } catch (e) { falhas.push(k + ': ' + e.message); console.log('FALHA', k, e.stack.split('\n').slice(0, 3).join(' | ')); } }
if (!rapido) {
  const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(f => fs.existsSync(f));
  if (!edge) console.log('Edge não encontrado: pulando os testes no navegador.'); else {
    const url = q => 'file:///' + path.join(G, 'index.html').replace(/\\/g, '/') + '?' + q, run = (q, t) => { try { return execFileSync(edge, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--virtual-time-budget=' + t, '--dump-dom', url(q)], { encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return String(e.stdout || '') + ' ERRO ' + e.message; } };
    console.log('== interface (Edge) ==');
    for (const k of (so ? [so] : SCN).filter(k => k !== 'reinos')) { const o = run('test=' + k, 160000), m = o.match(/OK turn=\d+ errs=(\d+)[^<]{0,200}|FALHA[^<]{0,300}/); const ok = m && m[0].startsWith('OK') && m[1] === '0'; if (!ok) falhas.push('interface ' + k + ': ' + (m ? m[0] : 'sem resposta')); console.log(ok ? 'ok   ' : 'FALHA', k.padEnd(7), m ? m[0].slice(0, 120) : 'sem resposta'); }
    for (const k of so ? [so] : ['proc', 'world', 'brazil']) { const o = run('play=' + k + '&years=8', 600000), m = o.match(/PLAY[^<\n]{0,300}|PLAYFALHA[^<]{0,300}/), ok = m && m[0].startsWith('PLAY ') && / errs=0/.test(m[0]); if (!ok) falhas.push('jogador ' + k + ': ' + (m ? m[0] : 'sem resposta')); console.log(ok ? 'ok   ' : 'FALHA', 'jogar ' + k, m ? m[0].slice(0, 200) : 'sem resposta'); }
  } }
console.log(falhas.length ? '\n' + falhas.length + ' FALHA(S):\n' + falhas.join('\n') : '\nTUDO OK');
process.exitCode = falhas.length ? 1 : 0;
