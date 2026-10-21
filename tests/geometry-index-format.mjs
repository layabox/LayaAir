import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const source = fileURLToPath(new URL('../src/layaAir/laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderGeometryElement.ts', import.meta.url));
const build = buildSync({entryPoints:[source], bundle:true, write:false, platform:'node', format:'esm'});
const {GLESRenderGeometryElement: Geometry} = await import('data:text/javascript;base64,' + Buffer.from(build.outputFiles[0].text).toString('base64'));
const previousWindow = globalThis.window;
try {
    const calls = [];
    globalThis.window = {conchGLESRenderGeometryElement: class {
        bindPropertyBuffer(buffer) { this.props = new Uint32Array(buffer); }
        rt_setMode(value) { this.props[0] = value; }
        rt_setDrawType(value) { this.props[1] = value; }
        rt_setIndexFormat(value) { calls.push(value); this.props[3] = value; }
    }};
    const geometry = new Geometry(0, 0);
    geometry.indexFormat = 0; // first default must initialize Native's GL enum
    geometry.indexFormat = 0;
    geometry.indexFormat = 1;
    geometry.indexFormat = 1;
    geometry.indexFormat = 2;
    geometry.indexFormat = 1;
    assert.deepEqual(calls, [0, 1, 2, 1]);
    geometry._nativeObj.rt_setIndexFormat(2); // Native changes are visible too
    geometry.indexFormat = 2;
    assert.equal(calls.length, 5);
    geometry.indexFormat = 1;
    assert.equal(calls.length, 6);
    assert.equal(geometry.indexFormat, 1);
    console.log('Index format: first default, unchanged values, switches and Native mirror changes passed');
} finally {
    globalThis.window = previousWindow;
}
