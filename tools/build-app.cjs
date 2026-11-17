// Gera o programa do ERAS para Windows (Neutralino): node tools/build-app.cjs
// Saída: Desktop\BONGALIA\dist\ERAS.exe (um arquivo só, portátil) e Instalar ERAS.exe (instalador)
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const G = path.resolve(__dirname, '..'), A = path.join(__dirname, 'app'), W = path.join(A, 'www'), D = path.join(G, 'dist');
fs.rmSync(W, { recursive: true, force: true }); fs.mkdirSync(W, { recursive: true });
for (const f of ['index.html', 'engine.js', 'ui.js', 'roster.js']) fs.copyFileSync(path.join(G, f), path.join(W, f));
for (const d of ['data', 'assets']) fs.cpSync(path.join(G, d), path.join(W, d), { recursive: true });
const run = c => execSync(c, { cwd: A, stdio: 'inherit' });
if (!fs.existsSync(path.join(A, 'bin', 'neutralino-win_x64.exe'))) run('npx --yes @neutralinojs/neu@11.8.0 update');
run('npx --yes @neutralinojs/neu@11.8.0 build --embed-resources');
fs.mkdirSync(D, { recursive: true });
const exe = path.join(A, 'dist', 'ERAS', 'ERAS-win_x64.exe'); fs.copyFileSync(exe, path.join(D, 'ERAS.exe'));
console.log('pronto:', path.join(D, 'ERAS.exe'), (fs.statSync(exe).size / 1048576).toFixed(1) + ' MB');
