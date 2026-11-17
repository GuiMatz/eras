// Fotos (ou retratos e bustos) dos líderes dos cenários históricos que ainda não têm imagem.
// Procura o nome na Wikipédia em português e, se não achar, em inglês; baixa a miniatura da página.
// Ignora títulos genéricos ("Rei de X", "Chefes de Y"), que não são pessoas.
import fs from 'fs'; import path from 'path';
const G = path.resolve(import.meta.dirname, '..'), IMG = path.join(G, 'assets/leaders'), UA = { 'User-Agent': 'BongaliaGame/1.0 (jogo local sem fins lucrativos)' }, sleep = ms => new Promise(r => setTimeout(r, ms));
const load = f => { const t = fs.readFileSync(path.join(G, 'data', f), 'utf8'); return JSON.parse(f === 'ww.js' ? t.replace(/^window\.WW=/, '') : t.replace(/^window\.WW=window\.WW\|\|\{\};Object\.assign\(window\.WW,/, '').replace(/\);$/, '')); };
const WW = load('ww.js'), ER = load('eras.js');
const GEN = /^(Rei|Rainha|Reis|Chefe|Chefes|Sultão|Sultões|Imperador|Imperatriz|Conselho|Senado|Khan|Cã|Faraó|Líder|Líderes|Governo|Governador|Príncipe|Duque|Conde|Emir|Xá|Xeque|Rajá|Marajá|Assembleia|Junta|Presidente de|Primeiro-ministro de|Tribo|Clã|Sacerdote|Oba|Mansa de|Negus de|Doge de|Grão|Alto|Dinastia|Família|Povo|Liga)\b/i;
const getJ = async u => { for (let i = 0; i < 5; i++) { try { const r = await fetch(u, { headers: UA }); if (r.status === 429) { await sleep(20000 * (i + 1)); continue; } return await r.json(); } catch (e) { await sleep(5000 * (i + 1)); } } return null; };
const jobs = []; for (const S of [WW, ER]) for (const id in S) for (const n of S[id].nat || []) if (n.ln && !n.img && !GEN.test(n.ln) && n.ln.split(' ').length <= 6) jobs.push({ id, n });
const names = [...new Set(jobs.map(j => j.n.ln))]; console.log('líderes sem foto com nome de pessoa:', names.length);
const thumb = {};
for (const lang of ['pt', 'en']) { const todo = names.filter(n => !thumb[n]);
  for (let i = 0; i < todo.length; i += 20) { const b = todo.slice(i, i + 20), r = await getJ('https://' + lang + '.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=220&titles=' + encodeURIComponent(b.join('|'))); if (!r || !r.query) continue;
    const rd = {}; [...(r.query.normalized || []), ...(r.query.redirects || [])].forEach(x => rd[x.to] = x.from); for (const p of Object.values(r.query.pages || {})) { let k = p.title; while (rd[k]) k = rd[k]; if (p.thumbnail && b.includes(k)) thumb[k] = p.thumbnail.source; } await sleep(1500); } }
let ok = 0; const miss = [];
for (const n of names) { const u = thumb[n]; if (!u) { miss.push(n); continue; } const e = /\.png/i.test(u) ? 'png' : 'jpg', f = 'h_' + n.normalize('NFD').replace(/[^\w]/g, '').toLowerCase().slice(0, 30) + '.' + e, fp = path.join(IMG, f);
  if (!fs.existsSync(fp)) { let r = null; for (let t = 0; t < 4; t++) { try { r = await fetch(u, { headers: UA }); } catch (e2) { r = null; } if (r && r.ok) break; await sleep((r && r.status === 429 ? 25000 : 5000) * (t + 1)); } if (!r || !r.ok) { miss.push(n); continue; } fs.writeFileSync(fp, Buffer.from(await r.arrayBuffer())); fs.appendFileSync(path.join(IMG, 'CREDITOS.txt'), f + '\t' + u + '\n'); await sleep(2500); }
  for (const j of jobs) if (j.n.ln === n) j.n.img = 'assets/leaders/' + f; ok++; }
fs.writeFileSync(path.join(G, 'data/ww.js'), 'window.WW=' + JSON.stringify(WW)); fs.writeFileSync(path.join(G, 'data/eras.js'), 'window.WW=window.WW||{};Object.assign(window.WW,' + JSON.stringify(ER) + ');');
console.log('fotos novas', ok, 'de', names.length, '| sem foto (amostra):', miss.slice(0, 25).join(', '));
