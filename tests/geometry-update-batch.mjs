import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const source = fileURLToPath(new URL('../src/layaAir/laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESGeometryUpdateBatch.ts', import.meta.url));
const build = buildSync({entryPoints:[source], bundle:true, write:false, platform:'node', format:'esm'});
const {GLESGeometryUpdateBatch: Batch} = await import('data:text/javascript;base64,' + Buffer.from(build.outputFiles[0].text).toString('base64'));
const previousWindow = globalThis.window;
try {
    const calls = [];
    globalThis.window = {conchGLESVertexBuffer:{submitGeometryBatch:(...args) => {
        calls.push({buffers:[...args[0]], sources:[...args[1]], uploads:Array.from(new Int32Array(args[2])),
            geometries:[...args[3]], draws:Array.from(new Int32Array(args[4]))}); return true;
    }}};
    const completions = [];
    assert.equal(Batch.completeCameraRenderUpdateBatch([{_nativeObj:'node'}], 1), false);
    window.conchRTBaseRenderNode = {completeCameraRenderUpdateBatch(nodes, mask) {
        completions.push([nodes, mask]); return true;
    }};
    assert.equal(Batch.completeCameraRenderUpdateBatch([{_nativeObj:'node'}], 42), true);
    assert.deepEqual(completions, [[['node'], 42]]);
    for (const invalid of [-1, .5, NaN, 0x100000000])
        assert.equal(Batch.completeCameraRenderUpdateBatch([{_nativeObj:'node'}], invalid), false);
    assert.equal(completions.length, 1);
    window.conchRTBaseRenderNode.completeCameraRenderUpdateBatch = () => false;
    assert.equal(Batch.completeCameraRenderUpdateBatch([{_nativeObj:'node'}], 43), false);
    assert.equal(Batch.diagnostics.cameraUpdateCompletions, 1);
    delete window.conchRTBaseRenderNode;
    const outer = Batch.begin();
    const data = new ArrayBuffer(32), geometry = {_nativeObj:'quad', instanceCount:3,
        drawParams:{length:2, elements:[4,6]}};
    Batch.active.upload('instances', data, 8, 4, 20);
    Batch.active.geometry(geometry);
    geometry.drawParams.elements = [12,18];
    Batch.active.geometry(geometry);
    const inner = Batch.begin();
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].uploads.slice(0,4), [8,4,20,0]);
    assert.deepEqual(calls[0].draws.slice(0,5), [3,1,3,12,18]);
    assert.equal(calls[0].sources[0], data);
    Batch.active.upload('nested', data, 0, 0, 8);
    inner(); inner();
    assert.equal(calls.length, 2);
    Batch.active.geometry(geometry);
    outer(); outer();
    assert.equal(calls.length, 3);
    assert.equal(calls[2].buffers.length, 0);
    assert.equal(Batch.active, null);

    const bindings = [];
    window.conchRTBaseRenderNode = {setRenderElementsBatch(nodes, elements, counts) {
        bindings.push({nodes:[...nodes], elements:[...elements], counts:Array.from(new Uint32Array(counts)).slice(0,nodes.length)});
        return true;
    }};
    const finishBindings = Batch.begin();
    const elements = [{_nativeObj:'first'}, {_nativeObj:'second'}];
    assert.equal(Batch.active.bindRenderElements('node', elements), true);
    elements.reverse();
    Batch.active.bindRenderElements('node', elements);
    Batch.active.bindRenderElements('empty', []);
    const nestedBindings = Batch.begin();
    assert.deepEqual(bindings[0], {nodes:['node','node','empty'],
        elements:['first','second','second','first'], counts:[2,2,0]});
    Batch.active.bindRenderElements('nested', elements);
    nestedBindings();
    for (let i = 0; i < 704; ++i) Batch.active.bindRenderElements(i, elements);
    finishBindings();
    assert.equal(bindings[2].nodes.length, 704);
    assert.equal(bindings[2].elements.length, 1408);
    assert.ok(bindings[2].counts.every(count => count === 2));

    window.conchRTBaseRenderNode.setRenderElementsBatch = () => false;
    const rejectedBinding = Batch.begin();
    Batch.active.bindRenderElements('rejected', elements);
    assert.throws(rejectedBinding, /render element batch rejected/);
    assert.equal(Batch.active, null);
    Batch.begin()(); // rejected rows must not remain in the pool
    delete window.conchRTBaseRenderNode;
    const oldNative = Batch.begin();
    assert.equal(Batch.active.bindRenderElements('old-native', elements), false);
    oldNative();

    let failures = 0;
    window.conchGLESVertexBuffer.submitGeometryBatch = () => {failures++; return false;};
    const finish = Batch.begin();
    assert.throws(() => Batch.active.upload('bad', new ArrayBuffer(8), 0, 4, 8), RangeError);
    assert.equal(failures, 0);
    Batch.active.upload('valid', new ArrayBuffer(8), 0, 0, 8);
    assert.throws(finish, /submission batch rejected/);
    assert.equal(Batch.active, null);
    Batch.begin()(); // failed uploads/owners must not stay pinned in the pooled scope
    assert.equal(failures, 1);
    globalThis.window = {};
    assert.equal(Batch.begin(), null);
    console.log('Geometry/element batches: nesting, ordered copies, growth, empty lists, rejection cleanup and old-Native fallback passed');
} finally {
    globalThis.window = previousWindow;
}
