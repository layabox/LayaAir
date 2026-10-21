// Run from any directory: node tests/shadow-map-bounds/server.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const shaderDir = path.resolve(__dirname, '../../src/layaAir/laya/d3/shader/lighting');
const files = {
    '/': [path.join(__dirname, 'index.html'), 'text/html; charset=utf-8'],
    '/test.js': [path.join(__dirname, 'test.js'), 'text/javascript'],
};
for (const name of ['ShadowSampler.glsl', 'ShadowSampleTent.glsl', 'ShadowCommon.glsl']) {
    files['/' + name] = [path.join(shaderDir, name), 'text/plain'];
}

const server = http.createServer((req, res) => {
    const file = files[new URL(req.url, 'http://localhost').pathname];
    if (!file) {
        res.writeHead(404).end();
        return;
    }
    res.setHeader('Content-Type', file[1]);
    res.setHeader('Cache-Control', 'no-store');
    res.end(fs.readFileSync(file[0]));
});
server.listen(Number(process.env.PORT || 0), '127.0.0.1', () => {
    console.log(`Shadow bounds regression: http://127.0.0.1:${server.address().port}/`);
});
