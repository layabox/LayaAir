// npm run build, then node tests/blur-filter/run.cjs webgl [--webgl1] [--fixture /path/to/image.png]
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const libs = process.env.LAYA_TEST_LIBS || path.join(root, 'build/libs');
const backend = process.argv[2] || 'webgl';
const testScript = 'gpu.test.js';
const fixtureIndex = process.argv.indexOf('--fixture');
const fixture = fixtureIndex < 0 ? null : path.resolve(process.argv[fixtureIndex + 1]);
if (fixture && !fs.existsSync(fixture)) throw new Error('Fixture does not exist: ' + fixture);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'laya-blur-gpu-'));
const compiler = backend === 'webgpu'
    ? '<script src="/libs/shader_compiler_web.js"></script><script src="/libs/nagabind.js"></script>' : '';
const html = `<!doctype html><meta charset="utf-8"><pre>Running ${backend}</pre>
    <script src="/libs/laya.core.js"></script>${compiler}
    <script src="/libs/laya.${backend}_2D.js"></script><script src="/libs/laya.ui.js"></script><script src="/test.js"></script>`;
const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    if (name === '/') { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
    const filename = name === '/reported.png' ? fixture : name === '/test.js' ? path.join(__dirname, testScript)
        : name.startsWith('/libs/') ? path.join(libs, path.basename(name)) : null;
    if (!filename || !fs.existsSync(filename)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', filename.endsWith('.png') ? 'image/png' : filename.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
    fs.createReadStream(filename).pipe(res);
});
const pending = new Map();
let sequence = 0, browser;
function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 60000);
        pending.set(id, {resolve, reject, timeout});
        browser.stdio[3].write(JSON.stringify({id, method, params, sessionId}) + '\0');
    });
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = spawn(process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
        '--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
        '--remote-debugging-pipe', '--enable-unsafe-webgpu', '--disable-background-timer-throttling', 'about:blank'
    ], {stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe']});
    fs.writeFileSync(path.join(profile, 'browser.log'), '');
    browser.stderr.on('data', data => fs.appendFileSync(path.join(profile, 'browser.log'), data));
    browser.on('error', error => { for (const request of pending.values()) request.reject(error); });
    let buffer = '';
    browser.stdio[4].on('data', data => {
        buffer += data;
        let boundary;
        while ((boundary = buffer.indexOf('\0')) >= 0) {
            const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
            const request = pending.get(message.id);
            if (!request) continue;
            clearTimeout(request.timeout); pending.delete(message.id);
            if (message.error) request.reject(new Error(JSON.stringify(message.error)));
            else request.resolve(message.result);
        }
    });
    const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
    const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
    await send('Page.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride', {width: 1024, height: 768, deviceScaleFactor: 1, mobile: false}, sessionId);
    await send('Page.addScriptToEvaluateOnNewDocument', {source: `
        window.__bootstrapErrors = [];
        window.addEventListener('error', event => window.__bootstrapErrors.push(event.message));
    `}, sessionId);
    await send('Page.navigate', {url: `http://127.0.0.1:${server.address().port}/?backend=${backend}${process.argv.includes('--webgl1') ? '&webgl1=1' : ''}${fixture ? '&fixture=1' : ''}`}, sessionId);
    let report;
    for (let i = 0; i < 120; i++) {
        const value = await send('Runtime.evaluate', {expression: 'window.__gpuReport', returnByValue: true}, sessionId);
        report = value.result?.value;
        if (report) break;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!report) throw new Error('GPU test timed out; see ' + profile);
    const captures = await send('Runtime.evaluate', {expression: 'window.__blurCaptures', returnByValue: true}, sessionId);
    for (const [name, data] of Object.entries(captures.result?.value || {}))
        fs.writeFileSync(path.join(profile, name + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    const screenshot = await send('Page.captureScreenshot', {format: 'png'}, sessionId);
    fs.writeFileSync(path.join(profile, 'screenshot.png'), Buffer.from(screenshot.data, 'base64'));
    fs.writeFileSync(path.join(profile, 'result.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({...report, artifacts: profile}, null, 2));
    if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error, 'Artifacts:', profile); process.exitCode = 1; }).finally(() => {
    if (browser) browser.kill('SIGTERM');
    server.close();
});
