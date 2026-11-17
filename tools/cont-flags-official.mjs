// Bandeiras oficiais dos blocos continentais que existem de verdade:
// Europa = União Europeia (já gerada), África = União Africana, América do Sul = Unasul.
// Ásia, América do Norte e Oceania não têm bandeira continental oficial: ficam os estandartes próprios.
import fs from 'fs'; import path from 'path';
const G = path.resolve(import.meta.dirname, '..'), D = path.join(G, 'assets/flags/cont'), UA = { 'User-Agent': 'BongaliaGame/1.0 (jogo local sem fins lucrativos)' }, sleep = ms => new Promise(r => setTimeout(r, ms));
const OF = { af: 'Flag of the African Union.svg', sa: 'Flag of UNASUR.svg' };
for (const [k, file] of Object.entries(OF)) {
  const fp = path.join(D, k + '.svg'), bk = path.join(D, k + '-proprio.svg'); if (!fs.existsSync(bk) && fs.existsSync(fp)) fs.copyFileSync(fp, bk);
  let r = null; for (let t = 0; t < 4; t++) { try { r = await fetch('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file), { headers: UA }); } catch (e) { r = null; } if (r && r.ok) break; await sleep((r && r.status === 429 ? 25000 : 5000) * (t + 1)); }
  if (!r || !r.ok) { console.log('falhou', k, r && r.status); continue; } const t = await r.text(); if (!t.includes('<svg')) { console.log('não é svg', k); continue; }
  fs.writeFileSync(fp, t); fs.appendFileSync(path.join(G, 'assets/leaders/CREDITOS.txt'), 'flags/cont/' + k + '.svg\thttps://commons.wikimedia.org/wiki/File:' + file.replace(/ /g, '_') + '\n'); console.log('ok', k, Math.round(t.length / 1024) + 'KB'); await sleep(3000);
}
