// Relatorio das simulacoes longas: aponta numeros absurdos por cenario.
const fs = require('fs'), path = require('path'), dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')).sort();
const R = (v, d = 1) => typeof v === 'number' ? (Math.abs(v) >= 1e6 ? v.toExponential(2) : +v.toFixed(d)) : v;
for (const f of files) {
  const L = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').filter(Boolean).map(x => JSON.parse(x)), S = L.filter(x => x.y != null && x.alive != null), err = L.find(x => x.erro), fim = L.find(x => x.fim);
  if (!S.length) { console.log(f, 'sem dados'); continue; }
  const a = S[0], z = S[S.length - 1], mx = k => Math.max(...S.map(s => s[k])), mn = k => Math.min(...S.map(s => s[k])), at = y => S.find(s => s.y >= y) || z;
  const flags = [];
  if (err) flags.push('ERRO no ano ' + err.y + ': ' + err.erro.split('\n')[0]);
  if (S.some(s => s.nanP || s.nanC)) flags.push('números inválidos (NaN/Infinity) a partir de ' + S.find(s => s.nanP || s.nanC).y);
  const pc0 = a.eco / a.pop, pcZ = z.eco / z.pop, yrs = z.y - a.y;
  if (z.pop / a.pop > 6) flags.push('população x' + R(z.pop / a.pop) + ' em ' + yrs + ' anos');
  if (z.pop / a.pop < .4) flags.push('população caiu para ' + R(z.pop / a.pop * 100) + '%');
  if (pcZ / pc0 > 200) flags.push('PIB por pessoa x' + R(pcZ / pc0));
  if (mx('temp') > 6) flags.push('temperatura +' + R(mx('temp')) + '°C (pico) / +' + R(z.temp) + '°C no fim');
  if (mx('techMax') > 90) flags.push('tecnologia chegou a ' + mx('techMax'));
  if (mx('goldTurns') > 40) flags.push('ouro acumulado = ' + R(mx('goldTurns')) + ' turnos de renda');
  if (z.upkShare < .04) flags.push('exército quase sem custo: ' + R(z.upkShare * 100) + '% da renda');
  if (mx('upkShare') > 1.2) flags.push('exército custa ' + R(mx('upkShare') * 100) + '% da renda');
  if (z.hap < .25) flags.push('felicidade média ' + R(z.hap, 2));
  if (z.dev > .98 && at(a.y + 300).dev > .98) flags.push('desenvolvimento travado no máximo (1,0) desde ~' + S.find(s => s.dev > .98).y);
  if (z.alive <= 1) flags.push('mundo terminou com ' + z.alive + ' nação(ões) em ' + z.y);
  else if (z.alive < a.alive * .1) flags.push('só ' + z.alive + ' de ' + a.alive + ' nações sobraram');
  if (z.alive > a.alive * 1.5) flags.push('nações cresceram de ' + a.alive + ' para ' + z.alive);
  if (z.sizeMax > z.owned * .6 && z.alive > 1) flags.push('uma nação domina ' + R(z.sizeMax / z.owned * 100) + '% do mapa');
  if (z.civs > 2000) flags.push('lista de nações cresceu para ' + z.civs + ' (memória)');
  if (z.tle > 2900 || z.log > 5000) flags.push('histórico grande: ' + z.tle + ' eventos / ' + z.log + ' logs');
  const ms0 = (S[1] || z).ms, msZ = Math.max(...S.slice(-5).map(s => s.ms));
  if (msZ > ms0 * 2.5 && msZ > 20) flags.push('ficou lento: ' + ms0 + ' → ' + msZ + ' ms/turno');
  if (z.infl > .3) flags.push('inflação média ' + R(z.infl * 100) + '%');
  if (z.loanAvg > 50000) flags.push('dívida média ' + R(z.loanAvg));
  if (S.length > 12 && z.wars === 0 && S.slice(-10).every(s => s.wars === 0)) flags.push('mundo parado: sem guerras nos últimos 500 anos');
  console.log('\n=== ' + f.replace('.jsonl', '') + ' | ' + a.y + ' → ' + z.y + (fim && fim.segundos ? ' (' + fim.segundos + ' s)' : ' (ainda rodando)'));
  for (const y of [a.y, a.y + 100, a.y + 500, a.y + 1000, a.y + 2000, z.y]) { const s = at(y); console.log(`  ${s.y}: nações ${s.alive} | pop ${R(s.pop)} | PIB ${R(s.eco)} | PIB/pessoa ${R(s.eco / s.pop, 2)} | tech ${s.techAvg}/${s.techMax} | temp ${s.temp} | dev ${s.dev} | estab ${s.st} | feliz ${s.hap} | pobreza ${s.pov} | ouro ${s.goldTurns}t | exército ${R(s.upkShare * 100)}% | guerras ${s.wars} | maior ${s.sizeMax}/${s.owned} | ${s.ms} ms`); }
  console.log('  ' + (flags.length ? 'ABSURDOS: ' + flags.join(' || ') : 'nada absurdo'));
}
