// Bandeiras de época que o Wikidata não resolveu: candidatos de arquivo no Wikimedia Commons (usa o primeiro que existir).
import fs from 'fs'; import path from 'path';
const G = path.resolve(import.meta.dirname, '..'), D = path.join(G, 'assets/flags/hist'), UA = { 'User-Agent': 'BongaliaGame/1.0 (jogo local sem fins lucrativos)' }, sleep = ms => new Promise(r => setTimeout(r, ms));
const load = f => { const t = fs.readFileSync(path.join(G, 'data', f), 'utf8'); return JSON.parse(f === 'ww.js' ? t.replace(/^window\.WW=/, '') : t.replace(/^window\.WW=window\.WW\|\|\{\};Object\.assign\(window\.WW,/, '').replace(/\);$/, '')); };
const WW = load('ww.js'), ER = load('eras.js'), ALL = Object.assign({}, WW, ER);
// [cenario, nome no jogo (regex), candidatos]
const M = [
  ['cold', /União Soviética/, ['Flag of the Soviet Union.svg']],
  ['imp', /Império do Brasil/, ['Flag of Empire of Brazil (1822–1870).svg', 'Flag of the Empire of Brazil (1822–1870).svg', 'Flag of Empire of Brazil (1822-1870).svg', 'Flag of the Empire of Brazil.svg']],
  ['imp', /Reino da França/, ['Flag of the Kingdom of France (1814-1830).svg', 'Flag of France (1814–1830).svg', 'Royal flag of France during the Bourbon Restoration.svg']],
  ['imp', /Império Otomano/, ['Flag of the Ottoman Empire (1793-1844).svg', 'Flag of the Ottoman Empire (1793–1844).svg']],
  ['nap', /Império Otomano/, ['Flag of the Ottoman Empire (1793-1844).svg', 'Flag of the Ottoman Empire (1793–1844).svg']],
  ['nap', /Reino de Portugal/, ['Flag of Portugal (1707).svg', 'Flag of Portugal (1750).svg']],
  ['nap', /Império Francês/, ['Flag of France (1794–1815, 1830–1958).svg', 'Flag of France.svg']],
  ['y1500', /Reino de Portugal/, ['Flag of Portugal (1495).svg', 'Flag of Portugal (1485).svg']],
  ['y1500', /República de Veneza/, ['Flag of Most Serene Republic of Venice.svg', 'Flag of the Republic of Venice.svg']],
  ['y1500', /Coroa de Castela/, ['Banner of arms of the Crown of Castile.svg', 'Pendón heráldico de la Corona de Castilla.svg', 'Royal Banner of the Crown of Castile (15th Century style).svg']],
  ['y1500', /Império Otomano/, ['Ottoman Flag.svg', 'Flag of the Ottoman Empire (1453-1517).svg']],
  ['y1500', /Sacro Império/, ['Banner of the Holy Roman Emperor (after 1400).svg', 'Banner of the Holy Roman Emperor with haloes (1400-1806).svg']],
  ['y1500', /Reino da Hungria/, ['Flag of Hungary (15th century).svg']],
  ['y1500', /Grão-Ducado de Moscou/, ['Flag of Grand Duchy of Moscow.svg']],
  ['y1500', /Reino do Congo/, ['Flag of the Kingdom of Kongo.svg']],
  ['y1500', /Joseon/, ['Flag of the King of Joseon.svg']],
  ['rome', /Império Romano/, ['Vexilloid of the Roman Empire.svg']],
  ['ww1', /Reino de Montenegro/, ['Flag of the Kingdom of Montenegro.svg']],
  ['ww1', /Etiópia/, ['Flag of Ethiopia (1897).svg', 'Flag of the Ethiopian Empire.svg']],
  ['ww1', /Emirado de Négede/, ['Flag of the Emirate of Nejd.svg', 'Flag of Nejd (1914).svg']],
  ['ww2', /Irã/, ['State flag of Iran (1933–1964).svg', 'Flag of Iran (1933–1964).svg']],
  ['ww2', /Egito/, ['Flag of Egypt (1922–1953).svg']],
  ['ww2', /Irlanda/, ['Flag of Ireland.svg']]
];
async function exists(f) { const r = await fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=' + encodeURIComponent('File:' + f), { headers: UA }); const j = await r.json(); return !Object.keys(j.query.pages).includes('-1'); }
let ok = 0; const res = [];
for (const [sc, re, cands] of M) { const n = (ALL[sc] || { nat: [] }).nat.find(x => re.test(x.n)); if (!n) { res.push(sc + ':' + re + ' não existe no cenário'); continue; }
  let got = null; for (const f of cands) { await sleep(3000); try { if (await exists(f)) { got = f; break; } } catch (e) { } }
  if (!got) { res.push(sc + ':' + n.n + ' sem arquivo'); continue; }
  const slug = got.normalize('NFD').replace(/[^\w.]/g, '_').slice(0, 80), fp = path.join(D, slug);
  if (!fs.existsSync(fp)) { const r = await fetch('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(got), { headers: UA }); if (!r.ok) { await sleep(20000); const r2 = await fetch('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(got), { headers: UA }); if (!r2.ok) { res.push(sc + ':' + n.n + ' falhou download'); continue; } fs.writeFileSync(fp, Buffer.from(await r2.arrayBuffer())); } else fs.writeFileSync(fp, Buffer.from(await r.arrayBuffer())); fs.appendFileSync(path.join(G, 'assets/leaders/CREDITOS.txt'), 'flags/hist/' + slug + '\thttps://commons.wikimedia.org/wiki/File:' + got.replace(/ /g, '_') + '\n'); await sleep(800); }
  for (const S of [WW, ER]) if (S[sc]) S[sc].nat.filter(x => re.test(x.n)).forEach(x => x.flag = 'assets/flags/hist/' + slug); ok++; res.push(sc + ':' + n.n + ' = ' + got); }
fs.writeFileSync(path.join(G, 'data/ww.js'), 'window.WW=' + JSON.stringify(WW)); fs.writeFileSync(path.join(G, 'data/eras.js'), 'window.WW=window.WW||{};Object.assign(window.WW,' + JSON.stringify(ER) + ');');
console.log('aplicadas', ok, 'de', M.length); console.log(res.join('\n'));
