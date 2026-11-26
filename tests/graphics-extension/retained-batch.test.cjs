const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

// Use the working tree's batch, pool, vector and WebGPU ShaderData implementations.
// The device double allocates geometry metadata only. No browser or prebuilt engine is required.
const root = path.resolve(__dirname, '../../src/layaAir/laya');
const web = 'RenderDriver/RenderModuleData/WebModuleData/';
const shader = {};
const engine = {_texGammaDefine: {}, _framePassCount: 0};
let nowMs = 0;
const shared = {
    Shader2D: {graphicsShader: {getSubShaderAt: () => shader}},
    WebGPURenderEngine: {_instance: engine}, Stat: {loopCount: 0},
    LayaGL: {renderEngine: engine}, DepthStencilParam: class {},
    Resource: class {}, WebGPUDeviceBuffer: class {}, WebGPUInternalTex: class {
        shaderDatas = new Map();
    },
    Matrix3x3: class {}, Matrix4x4: class {}, Color: class {},
    GraphicsDefines: {GRAPHICS_INDEX_BYTE_SIZE: 2, GRAPHICS_INDEX_FORMAT: 0},
    Web2DGraphicsIndexBatchBuffer: class {clearBufferViews() {} destroy() {}},
    GRAPHICS_INFO_VERTEX_BLOCK_SIZE: 256
};
function load(file) {
    const filename = path.join(root, file + '.ts');
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS}
    });
    const exports = {};
    vm.runInNewContext(compiled.outputText, {exports, require: () => shared, performance: {now: () => nowMs}}, {filename});
    Object.assign(shared, exports);
}
for (const file of ['maths/MathUtils3D', 'maths/Vector2', 'maths/Vector4', 'maths/Vector3',
    'Const', 'maths/Matrix', 'webgl/canvas/BlendMode',
    'RenderEngine/RenderEnum/BufferTargetType', 'RenderEngine/RenderEnum/RenderPologyMode',
    'RenderEngine/RenderEnum/DrawType', 'utils/Pool', 'utils/SingletonList',
    'RenderDriver/DriverDesign/RenderDevice/ShaderData', 'webgl/shader/d2/ShaderDefines2D',
    web + 'WebDefineDatas', 'RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData',
    web + '2D/WebGraphicsOp2DRuntimeBuffers', web + '2D/WebRenderStruct2D', web + '2D/WebGraphicsBatch']) load(file);

const {WebGraphicsBatch, WebGraphicsRenderUnit, WebGraphicsRenderUnitPool, WebGPUShaderData,
    ShaderDefines2D: defs, Vector4} = shared;
// Give the standard texture uniforms distinct slots as the engine initializer does.
Object.assign(defs, {UNIFORM_SPRITETEXTURE: 1, UNIFORM_SPRITETEXTURE_ARRAY: 2, UNIFORM_TEXRANGE: 3});
const buffer = {};
function geometry(offset = 0) {
    const drawParams = new shared.FastSinglelist();
    const result = {
        bufferState: buffer, drawParams, destroy() { this.destroyed = true; },
        clearRenderParams() { drawParams.length = 0; },
        setDrawElemenParams(count, start) { drawParams.add(start); drawParams.add(count); }
    };
    result.setDrawElemenParams(6, offset);
    return result;
}
shared.LayaGL.renderDeviceFactory = {
    createIndexBuffer: () => ({destroy() {}}), createRenderGeometryElement: geometry,
    createShaderData: () => new WebGPUShaderData()
};
shared.LayaGL.render2DRenderPassFactory = {createPrimitiveRenderElement2D: () => ({destroy() {}})};
let nextTexture = 1;
function texture() {
    return {id: nextTexture++, _texture: new shared.WebGPUInternalTex(), destroyed: false, refs: 0,
        _addReference() { this.refs++; }, _removeReference() { this.refs--; }};
}
const white = texture();
function makeOwner() {
    return {spriteShaderData: new WebGPUShaderData(), globalAlpha: 1, globalRenderData: null, getClipInfo: () => null};
}
function writeTexture(element, value) {
    element.textureKey = value?.id ?? 0;
    const slot = element.typeKey & defs.DEFINE_BIT_USE_TEX_ARRAY ? defs.UNIFORM_SPRITETEXTURE_ARRAY : defs.UNIFORM_SPRITETEXTURE;
    element.primitiveShaderData.setTexture(slot, value ?? white);
}
function source(owner, value, {range, material = null, subShader = shader, offset = 0, arrayTexture = false} = {}) {
    const unit = new WebGraphicsRenderUnit();
    const element = {
        owner, subShader, materialShaderData: material, value2DShaderData: owner.spriteShaderData,
        primitiveShaderData: new WebGPUShaderData(), geometry: geometry(offset), _graphicsBatchEntry: unit,
        typeKey: defs.DEFINE_BIT_TEXTURESHADER | defs.DEFINE_BIT_VERTEXALPHA,
        renderStateIsBySprite: !material, stencilClipState: null
    };
    unit.element = element;
    unit.primitiveShaderData = element.primitiveShaderData;
    unit.vertexBlocks = [0];
    unit.sourceIndexView = {length: 6};
    if (arrayTexture) element.typeKey |= defs.DEFINE_BIT_USE_TEX_ARRAY;
    if (range) {
        element.typeKey |= defs.DEFINE_BIT_FILLTEXTURE;
        element.primitiveShaderData.setVector(defs.UNIFORM_TEXRANGE, new Vector4(...range));
    }
    if (material) element.typeKey |= defs.TYPEKEY_CUSTOM_MATERIAL;
    writeTexture(element, value);
    return element;
}
function group(provider, members) {
    const list = new shared.FastSinglelist();
    for (const element of members) list.add(element);
    list.length = 0; // WebRender2DPass rewrites the backing array in place.
    provider.batch(list, 0, members.length - 1, false);
    assert.equal(list.length, 1, 'fixture must form one batch');
    return list.elements[0];
}
function frame(provider, ...groups) {
    provider.reset();
    const outputs = groups.map(members => group(provider, members));
    return outputs;
}

test('a textureless head adopts the current texture and keeps a stable output across source reuse', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner();
    const a = texture(), b = texture();
    const head = source(owner, null), donor = source(owner, a);
    const [first] = frame(provider, [head, donor]);
    const binding = first.primitiveShaderData;
    assert.equal(binding.getTexture(defs.UNIFORM_SPRITETEXTURE), a);
    writeTexture(donor, b);
    assert.equal(first.primitiveShaderData.getTexture(defs.UNIFORM_SPRITETEXTURE), a,
        'repurposing a render unit must not mutate retained sampler state');
    WebGraphicsRenderUnitPool.recover(donor._graphicsBatchEntry);
    assert.equal(b.refs, 0);
    assert.equal(binding.getTexture(defs.UNIFORM_SPRITETEXTURE), a, 'recycling the donor clears only its own samplers');
    const reused = WebGraphicsRenderUnitPool.take(4, 6, makeOwner(), shader, null);
    assert.equal(reused.element, donor);
    reused.primitiveShaderData.destroy();
    const replacement = source(owner, a, {offset: 40});
    const [second] = frame(provider, [head, replacement]);
    assert.equal(second, first, 'a different donor with equivalent GPU state can reuse the batch');
    assert.equal(second.primitiveShaderData, binding, 'a cache hit keeps the original binding');
    assert.deepEqual(Array.from(second.geometry.drawParams.elements).slice(0, second.geometry.drawParams.length),
        [0, 6, 40, 6], 'only current draw ranges are submitted');

    a._texture = new shared.WebGPUInternalTex();
    writeTexture(replacement, a);
    const [reloaded] = frame(provider, [head, replacement]);
    assert.equal(reloaded.primitiveShaderData.getData()[defs.UNIFORM_SPRITETEXTURE], a._texture,
        'a wrapper with the same ID can acquire a different GPU texture');
    const refsBeforeEmptyFrame = a.refs;
    frame(provider);
    assert.equal(a.refs, refsBeforeEmptyFrame, 'repaint without submissions preserves retained bindings');
    provider.destroy();
    assert.equal(a.refs, 1, 'destroy releases retained bindings for both versions of the GPU texture');
    replacement.primitiveShaderData.destroy();
    head.primitiveShaderData.destroy();
    assert.equal(a.refs, 0);
});

test('ordinary repaints retain unused keys, absent owners, and extra slots for a repeated key', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner(), other = makeOwner();
    const a = texture(), b = texture();
    const pair = (node, image, offset) => [source(node, image, {offset}), source(node, image, {offset: offset + 12})];
    const first = pair(owner, a, 0), second = pair(owner, a, 40);
    const changed = pair(owner, b, 80), otherPair = pair(other, a, 120);
    const [firstDraw, secondDraw, otherDraw] = frame(provider, first, second, otherPair);
    assert.notEqual(firstDraw, secondDraw);
    const [changedDraw] = frame(provider, changed);
    assert.notEqual(changedDraw, firstDraw);
    const [backToA] = frame(provider, first);
    assert([firstDraw, secondDraw].includes(backToA), 'A/B/A reuses an A draw even after all A groups disappeared');
    for (let i = 0; i < 12; i++) frame(provider);

    const [nextFirst, nextOther, nextSecond] = frame(provider, first, otherPair, second);
    assert.equal(nextOther, otherDraw, 'an owner missing from several repaints keeps its outputs');
    assert.notEqual(nextFirst, nextSecond);
    const originalDraws = new Set([firstDraw, secondDraw]);
    assert(originalDraws.has(nextFirst) && originalDraws.has(nextSecond), 'both original wrappers survived');
    for (const [out, offset] of [[nextFirst, 0], [nextSecond, 40], [nextOther, 120]]) {
        const params = out.geometry.drawParams;
        assert.deepEqual(Array.from(params.elements).slice(0, params.length), [offset, 12]);
    }
    assert.equal(b.refs, 3, 'two source textures plus the long-unused B output survive ordinary repaint');
    provider.destroy();
    assert.equal(a.refs, 6);
    assert.equal(b.refs, 2);
    for (const item of [...first, ...second, ...changed, ...otherPair]) item.primitiveShaderData.destroy();
    assert.equal(a.refs, 0);
    assert.equal(b.refs, 0);
});

test('FillTexture retains range values independently of later writes and does not mix draw ranges', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner(), image = texture();
    const left = [0, 0, 0.5, 1], right = [0.5, 0, 0.5, 1];
    const makePair = range => [source(owner, image, {range}), source(owner, image, {range})];
    const original = makePair(left);
    const [first] = frame(provider, original);
    for (const item of original) item.primitiveShaderData.setVector(defs.UNIFORM_TEXRANGE, new Vector4(...right));
    assert(first.primitiveShaderData.getVector(defs.UNIFORM_TEXRANGE).equal(new Vector4(...left)));
    const [again, distinct, duplicate] = frame(provider, makePair(left), original, makePair(left));
    assert.equal(first, again);
    assert.notEqual(distinct, again);
    assert.notEqual(duplicate, again, 'two same-key groups in one frame own distinct geometry');
    assert(distinct.primitiveShaderData.getVector(defs.UNIFORM_TEXRANGE).equal(new Vector4(...right)));
    provider.destroy();
});

test('solid and array batches keep their effective sampler when the owner replaces its node data', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner(), image = texture();
    const solid = [source(owner, null), source(owner, null)];
    const mixed = [source(owner, null), source(owner, image, {arrayTexture: true})];
    const [whiteDraw, arrayDraw] = frame(provider, solid, mixed);
    assert.equal(whiteDraw.textureKey, 0);
    assert.equal(whiteDraw.primitiveShaderData.getTexture(defs.UNIFORM_SPRITETEXTURE), white);
    assert.equal(arrayDraw.textureKey, image.id);
    assert.equal(arrayDraw.typeKey, mixed[1].typeKey, 'textureless head adopts the array variant');
    assert.equal(arrayDraw.primitiveShaderData.getTexture(defs.UNIFORM_SPRITETEXTURE_ARRAY), image);
    assert.notEqual(arrayDraw.primitiveShaderData, mixed[1].primitiveShaderData, 'the array binding is owned');

    owner.spriteShaderData = new WebGPUShaderData();
    for (const element of [...solid, ...mixed])
        element._graphicsBatchEntry.reactivate(owner, shader, null);
    const [againArray, againWhite] = frame(provider, mixed, solid);
    assert.equal(againArray, arrayDraw);
    assert.equal(againWhite, whiteDraw);
    assert.equal(againArray.value2DShaderData, owner.spriteShaderData);
    assert.equal(againWhite.value2DShaderData, owner.spriteShaderData);
    provider.destroy();
    for (const element of [...solid, ...mixed]) element.primitiveShaderData.destroy();
    assert.equal(image.refs, 0);
});

test('custom shader and custom material keep their source bindings', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner(), image = texture();
    const material = new WebGPUShaderData(), otherMaterial = new WebGPUShaderData();
    for (const options of [{subShader: {}}, {material}]) {
        const draw = extra => {
            const pair = [source(owner, image, {...options, ...extra}), source(owner, image, {...options, ...extra})];
            const [out] = frame(provider, pair);
            assert.equal(out.primitiveShaderData, pair[0].primitiveShaderData);
            assert.equal(out.materialShaderData, pair[0].materialShaderData);
            return out;
        };
        const initial = draw();
        assert.notEqual(draw(), initial, 'independent custom per-node data cannot be treated as equivalent');
        if (options.material) assert.notEqual(draw({material: otherMaterial}), initial);
    }
    const pair = [source(owner, image, {material}), source(owner, image, {material})];
    const [before] = frame(provider, pair);
    for (const item of pair) item.materialShaderData = otherMaterial;
    const [after] = frame(provider, pair);
    assert.equal(after.materialShaderData, otherMaterial, 'material replacement with identical primitive state');
    assert.notEqual(after, before);
    provider.destroy();
});

test('clearing one pass releases only its owned state, even when the owner participates in both passes', () => {
    const passA = new WebGraphicsBatch(), passB = new WebGraphicsBatch();
    const owner = makeOwner(), image = texture();
    const pair = [source(owner, image), source(owner, image)];
    const [a] = frame(passA, pair), [b] = frame(passB, pair);
    assert.notEqual(a, b);
    for (let i = 0; i < 12; i++) {
        frame(passA);
        frame(passB);
    }
    assert.equal(image.refs, 4);
    assert.equal(passA.clearRenderElementCache(), true);
    assert.equal(passA.clearRenderElementCache(), false);
    assert.equal(image.refs, 3);
    assert.equal(frame(passB, pair)[0], b);
    passA.destroy();
    frame(passB);
    passB.destroy();
    assert.equal(image.refs, 2);
    for (const item of pair) item.primitiveShaderData.destroy();
    assert.equal(image.refs, 0);
});

test('destroying one owner releases its draws once each participating pass is safe', () => {
    const passA = new WebGraphicsBatch(), passB = new WebGraphicsBatch();
    const removed = {...makeOwner(), children: []}, survivor = makeOwner();
    const a = texture(), b = texture();
    const removedPair = [source(removed, a), source(removed, a)];
    const survivorPair = [source(survivor, b), source(survivor, b)];
    const [, survivorA] = frame(passA, removedPair, survivorPair);
    const [, survivorB] = frame(passB, removedPair, survivorPair);
    shared.WebRenderStruct2D.prototype.destroy.call(removed);
    assert.equal(a.refs, 4, 'both submitted lists still own their bindings until their next reset');
    passA.reset();
    assert.equal(a.refs, 3, 'only pass A has relinquished its old list');
    assert.equal(group(passA, survivorPair), survivorA);
    passB.reset();
    assert.equal(a.refs, 2, 'both removed-owner draws are gone, leaving only the sources');
    assert.equal(group(passB, survivorPair), survivorB);
    assert.equal(b.refs, 4, 'both live-owner draws are retained');
    passA.destroy();
    passB.destroy();
    for (const element of [...removedPair, ...survivorPair]) element.primitiveShaderData.destroy();
    assert.equal(a.refs, 0);
    assert.equal(b.refs, 0);
});

test('each pass periodically releases only destroyed textures in its owned batch slots', () => {
    const passA = new WebGraphicsBatch(), passB = new WebGraphicsBatch(), owner = makeOwner();
    const gone = texture(), later = texture(), live = texture(), custom = texture();
    const material = new WebGPUShaderData();
    const pair = (image, options) => [source(owner, image, options), source(owner, image, options)];
    const livePair = pair(live), gonePair = pair(gone), laterPair = pair(later), customPair = pair(custom, {material});
    const sources = [...livePair, ...gonePair, ...laterPair, ...customPair];
    try {
        nowMs = 1000;
        const [liveA, goneA, goneA2, laterA, customA] = frame(passA, livePair, gonePair, gonePair, laterPair, customPair);
        const [goneB] = frame(passB, gonePair);
        gone.destroyed = custom.destroyed = true;
        live._texture.resource = null;
        live._texture.resourceVersion = 1;
        nowMs = 4999;
        frame(passA);
        assert.equal(gone.refs, 5, 'repaints before the interval keep all three cached references');
        nowMs = 5000;
        passA.reset();
        assert.equal(gone.refs, 3);
        assert.equal(goneA.geometry.destroyed, true);
        assert.equal(goneA2.geometry.destroyed, true, 'adjacent dead slots are both removed');
        assert.notEqual(goneB.geometry.destroyed, true, 'one pass must not invalidate another submitted list');
        assert.equal(group(passA, livePair), liveA, 'a live texture may temporarily lack its GPU resource');
        assert.equal(group(passA, laterPair), laterA, 'cleanup preserves a live slot after the removed slot');
        assert.equal(group(passA, customPair), customA, 'custom borrowed bindings stay under their owner lifetime');
        assert.equal(custom.refs, 2);

        later.destroyed = true;
        nowMs = 9000;
        frame(passA);
        assert.equal(later.refs, 3, 'a second scan waits five seconds from the previous scan');
        passB.reset();
        assert.equal(gone.refs, 2, 'the other pass independently cleans up at its own safe reset');
        assert.equal(goneB.geometry.destroyed, true);
        nowMs = 10000;
        frame(passA);
        assert.equal(later.refs, 2);
        assert.equal(laterA.geometry.destroyed, true);
        assert.equal(passA.clearRenderElementCache(), true);
        assert.equal(live.refs, 2);
        assert.equal(customA.geometry.destroyed, true);
    } finally {
        passA.destroy();
        passB.destroy();
        for (const item of sources) item.primitiveShaderData.destroy();
        nowMs = 0;
    }
    for (const image of [gone, later, live, custom]) assert.equal(image.refs, 0);
});

test('submitting a destroyed standard texture uses a temporary element until the next reset', () => {
    const provider = new WebGraphicsBatch(), owner = makeOwner(), image = texture(), next = texture();
    const pair = [source(owner, image), source(owner, image)];
    try {
        nowMs = 1000;
        frame(provider, pair);
        image._texture = new shared.WebGPUInternalTex(); // source still records the previous GPU handle
        image.destroyed = true;
        nowMs = 5001;
        const [temporary] = frame(provider, pair);
        assert.equal(image.refs, 2, 'resubmitting cannot reacquire a retained reference to the destroyed texture');
        assert.equal(temporary.primitiveShaderData, pair[0].primitiveShaderData);
        frame(provider);
        assert.equal(temporary.primitiveShaderData, null, 'a temporary draw returns to the pool at the next reset');
        assert.equal(provider.clearRenderElementCache(), false);

        // Explicit cleanup is effective before another periodic scan becomes due.
        for (const item of pair) writeTexture(item, next);
        frame(provider, pair);
        next.destroyed = true;
        assert.equal(provider.clearRenderElementCache(), true);
        assert.equal(next.refs, 2);
    } finally {
        provider.destroy();
        for (const item of pair) item.primitiveShaderData.destroy();
        nowMs = 0;
    }
    assert.equal(image.refs, 0);
    assert.equal(next.refs, 0);
});

test('WebGL keeps its borrowed primitive and returns the wrapper to the pool', () => {
    engine.gl = {};
    try {
        const provider = new WebGraphicsBatch(), owner = makeOwner(), image = texture();
        const pair = [source(owner, image), source(owner, image)];
        const [out] = frame(provider, pair);
        assert.equal(out.primitiveShaderData, pair[0].primitiveShaderData);
        assert.equal(image.refs, 2);
        frame(provider);
        assert.equal(out.primitiveShaderData, null);
        provider.destroy();
        for (const item of pair) item.primitiveShaderData.destroy();
        assert.equal(image.refs, 0);
    } finally {
        delete engine.gl;
    }
});
