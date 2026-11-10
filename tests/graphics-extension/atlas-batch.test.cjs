const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const filename = process.env.ENGINE_BATCH_SOURCE || path.resolve(__dirname,
    '../../src/layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/2D/WebGraphicsBatch.ts');
const defs = {DEFINE_BIT_GAMMATEXTURE: 128, DEFINE_BIT_USE_TEX_ARRAY: 2048,
    DEFINE_BIT_FILLTEXTURE: 64, TYPEKEY_CUSTOM_MATERIAL: 16};
const exportsObject = {};
const engine = {gl: {}};
// Isolate GPU allocation; exercise the production batch contexts and reorder loop.
const mocks = {LayaGL: {renderEngine: engine, renderDeviceFactory: {createIndexBuffer() {return {};}}},
    Pool: {createPool2() {return {};}}, BufferUsage: {Dynamic: 0}, GraphicsDefines: {},
    Web2DGraphicsIndexBatchBuffer: class {}, ShaderDefines2D: defs,
    BatchManager: {registerProvider() {}}, BaseRender2DType: {graphics: 1}};
const moduleScope = {exports: exportsObject, require: () => mocks};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS}
}).outputText, moduleScope, {filename});
const shader = {}, buffer = {}, clip = {}, globalData = {};
function element(id, textureKey, x, y, width, height, variant = 0) {
    return {id, textureKey, typeKey: textureKey ? variant : 0, subShader: shader,
        geometry: {bufferState: buffer}, primitiveShaderData: {textureKey, getVector() {}},
        materialShaderData: null, owner: {globalAlpha: 1, globalRenderData: globalData,
            rect: {x, y, width, height}, getClipInfo() {return clip;}}};
}
function createBatch(webgl) {
    engine.gl = webgl ? {} : null;
    const batch = new exportsObject.WebGraphicsBatch();
    const isCompatible = batch._context.isCompatible;
    batch.compatibilityChecks = 0;
    batch._context.isCompatible = function(element) {
        batch.compatibilityChecks++;
        return isCompatible.call(this, element);
    };
    // Capture each production merge's membership and selected sampler state.
    batch.merge = function(array, start, end, context, indices) {
        const items = [];
        for (let i = start; i <= end; i++) items.push(array[indices ? indices[i] : i]);
        if (items.length === 1) return {items, textureKey: items[0].textureKey};
        for (const item of items) {
            if (!item.textureKey) continue;
            assert.equal(context.textureKey, item.textureKey, `batch ${items.map(x => x.id)} uses the wrong atlas`);
            assert.equal(context.primitiveShaderData.textureKey, item.textureKey, 'sampler must follow the adopted texture');
            assert.equal(context.typeKey, item.typeKey, 'shader variant must follow the adopted texture');
        }
        return {items, textureKey: context.textureKey};
    };
    return batch;
}
function run(batch, input, reorder) {
    const list = {elements: [...input], length: 0, add(value) {this.elements[this.length++] = value;}};
    batch.batch(list, 0, input.length - 1, reorder);
    const groups = list.elements.slice(0, list.length);
    assert.deepEqual(groups.flatMap(g => g.items.map(x => x.id)).sort((a,b) => a-b), input.map(x => x.id).sort((a,b) => a-b));
    return groups;
}
const directCache = [[2,0,10,20,7],[1,10,10,5,32],[1,20,20,25,28],[0,0,0,20,29],[2,40,20,24,13]];
const searchCache = [[2,0,10,20,7],[1,10,10,5,32],[3,40,30,21,26],[1,20,20,25,28],
    [0,0,0,20,29],[3,10,40,19,18],[2,40,20,24,13]];
const mixedCache = [[1,30,30,7,26],[2,30,10,14,17],[0,30,10,20,15],
    [3,40,0,7,28],[2,10,40,18,27],[1,10,20,13,28]];
let seed = 315;
function random(n) {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n;}
for (const webgl of [true, false]) for (const variant of [0, defs.DEFINE_BIT_GAMMATEXTURE, defs.DEFINE_BIT_USE_TEX_ARRAY]) {
    const batch = createBatch(webgl);
    for (const fixture of [directCache, searchCache, mixedCache]) for (const reorder of [false, true]) {
        const input = fixture.map((data, id) => element(id, ...data, variant));
        const before = batch.compatibilityChecks;
        const groups = run(batch, input, reorder);
        if (reorder && fixture !== mixedCache)
            assert.equal(batch.compatibilityChecks - before, fixture === directCache ? 5 : 10,
                'cached groups must not repeat full compatibility checks');
        assert(groups.some(g => g.items.length > 1), 'compatible elements still batch');
    }
    for (let i = 0; i < 2000; i++) {
        const input = Array.from({length: 4 + random(16)}, (_, id) => element(id,
            random(4), random(5)*10, random(5)*10, 5+random(30), 5+random(30), variant));
        run(batch, input, true);
    }
}
console.log('Atlas batch regression passed: both cached-group paths, WebGL/WebGPU, texture variants and 12,000 deterministic sequences');
