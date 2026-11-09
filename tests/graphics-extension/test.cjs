const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '../../src/layaAir/laya');
const pipeline = 'display/Scene2DSpecial/GraphicsRenderPipeline/';
const cache = new Map();
const mocks = new Map();
function mock(file, value) { mocks.set(path.resolve(root, file) + '.ts', value); }
function load(file) {
    const filename = path.resolve(root, file.endsWith('.ts') ? file : file + '.ts');
    if (mocks.has(filename)) return mocks.get(filename);
    if (cache.has(filename)) return cache.get(filename);
    const exports = {};
    cache.set(filename, exports);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS}
    }).outputText;
    vm.runInNewContext(code, {exports, require(name) {
        return load(path.resolve(path.dirname(filename), name));
    }}, {filename});
    return exports;
}

// Keep rendering-device dependencies out of Node; use real command, compiler,
// retained command stream, matrix helpers and material lifecycle implementations.
mock('utils/Utils', {Utils: {}});
mock('utils/Browser', {Browser: {}});
mock('../Config', {Config: {uvClipMode: 'gpu'}});
mock('webgl/shader/d2/Shader2D', {Shader2D: {}});
mock('webgl/shader/d2/ShaderDefines2D', {ShaderDefines2D: {}});
mock('RenderEngine/RenderShader/Shader3D', {Shader3D: {}, ShaderFeatureType: {D2_BaseRenderNode2D: 2}});
mock('utils/ColorUtils', {ColorUtils: {create(value) { assert.equal(typeof value, 'number'); return {numColor: value}; }}});
mock('webgl/utils/UVClippingUtils', {});
mock('webgl/utils/TextureArrayRegistry2D', {});
mock('display/mesh/MeshFactory', {});
mock('resource/Texture', {Texture: class Texture {}});
const GraphicsDefines = {_factory: null, GRAPHICS_MAX_VERTEX: 65536, GRAPHICS_INDEX_ARRAY_TYPE: Uint16Array};
mock('webgl/shader/d2/GraphicsDefines', {GraphicsDefines});
const LayaGL = {render2DRenderPassFactory: {
    createGraphicsCommandStreamDataHandle() { return {setGraphicsHandleUpdateBuffer() {}}; },
    createMesh2DRenderDataHandle() { return {destroy() {}}; }
}};
mock('layagl/LayaGL', {LayaGL});
const processor = {};
mock('display/Render2DProcessor', {Render2DProcessor: processor});

const {GraphicsCompileContext} = load(pipeline + 'GraphicsCompileContext');
const {GraphicsCommandStreamMode} = load(pipeline + 'GraphicsCommandStreamMode');
const {Matrix} = load('maths/Matrix');
const {DrawTrianglesCmd} = load('display/cmd/DrawTrianglesCmd');
const {DrawRectCmd} = load('display/cmd/DrawRectCmd');
processor.compileContext = new GraphicsCompileContext();
let allocations = 0;
class MeshOp {
    constructor(commandIndex, commandId) {
        allocations++;
        Object.assign(this, {commandIndex, commandId, dirtyFlags: 0});
    }
    canUpdate(id) { return id === this.commandId; }
    resetRecords() {}
    setCommandIndex(value) { this.commandIndex = value; }
    writeStructureSignature(out, offset) { out.fill(0, offset, offset + 4); }
    matchesStructureSignature() { return true; }
    clearStructureDirty() {}
    writeMesh(x, y, vertices, vertexOffset, vertexCount, uvs, uvOffset, indices, indexOffset, indexCount,
        colors, colorOffset, color, alpha, blendMode, layer, matrix) {
        this.alpha = alpha;
        this.tx = matrix ? matrix.tx : 0;
        this.ty = matrix ? matrix.ty : 0;
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
    }
    destroy() { throw new Error('Stable custom ops should be reused'); }
}
const {GraphicsOp2DKind} = load(pipeline + 'GraphicsPipelineTypes');
GraphicsDefines._factory = {createMeshOp: (index, id) => Object.assign(new MeshOp(index, id), {kind: GraphicsOp2DKind.Mesh})};
const vertices = new Float32Array([0, 0, 10, 0, 0, 10]);
const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
const indices = new Uint16Array([0, 1, 2]);
const colors = new Float32Array(12).fill(1);
let runs = 0;
const custom = {
    cmdID: 'TestCustomMesh', alpha: 0.5,
    run(context) {
        runs++;
        context.save();
        context.translate(7, 9);
        context.alpha(this.alpha);
        context.drawTriangles(null, 0, 0, vertices, uvs, indices, null, 1, null, 0xffffffff, colors);
        context.drawTriangles(null, 0, 0, vertices, uvs, indices);
        context.restore();
    }
};
const builtin = DrawTrianglesCmd.create(null, 0, 0, vertices, uvs, indices, null, 1, 0xffffffff, null);
const owner = {_struct: {blendMode: 0}, _texture: null};
const host = {owner, graphics: {cmds: [builtin, custom, builtin]}, _syncGraphicsOwnerSize() {},
    _mapGraphicsOpDirtyFlags(value) { return value; }, _syncGraphicsOps() {}};
const stream = new GraphicsCommandStreamMode(host, new ArrayBuffer(128));
stream.rebuild({_textRender: null});
assert.equal(runs, 1);
assert.deepEqual(Array.from(stream.ops, op => op.commandId), [DrawTrianglesCmd.ID, custom.cmdID, custom.cmdID, DrawTrianglesCmd.ID]);
assert.deepEqual(Array.from(stream.ops, op => op.alpha), [1, 0.5, 0.5, 1]);
assert.deepEqual(Array.from(stream.ops, op => op.tx), [0, 7, 7, 0]);
assert.deepEqual(Array.from(stream.ops, op => op.ty), [0, 9, 9, 0]);
assert.equal(stream.ops[1].colors, colors);
assert.equal(stream.ops[1].vertices, vertices);
assert.equal(stream.ops[1].indices, indices);
const retainedOps = Array.from(stream.ops);
custom.alpha = 0.25;
for (let i = 0; i < 2000; i++) stream.rebuild({_textRender: null});
assert.equal(allocations, 4);
assert.equal(stream.ops[1].alpha, 0.25);
assert.ok(stream.ops.every((op, index) => op === retainedOps[index]));
assert.equal(processor.compileContext.sprite, null);
assert.equal(processor.compileContext._mode, null);
// Preserve built-in special dispatch; text and nine-grid still need their own paths.
const context = processor.compileContext;
const rect = DrawRectCmd.create(0, 0, 3, 4, 0xffffffff, null, 1, false);
let rectRuns = 0;
context.begin(stream, owner, 0, null);
const originalDrawRect = context.drawRect;
context.drawRect = () => rectRuns++;
context.compileCommand(0, rect);
context.drawRect = originalDrawRect;
assert.equal(rectRuns, 1);
const text = {cmdID: 'FillText', emitTextureQuads() { this.emitted = true; }, run() { throw new Error('Use text emission'); }};
// Use the same built-in ID as the actual command module.
text.cmdID = load('display/cmd/FillTextCmd').FillTextCmd.ID;
context.compileCommand(1, text);
assert.equal(text.emitted, true);
const originalNineGrid = context._draw9GridTexture;
let nineGridRuns = 0;
context._draw9GridTexture = () => nineGridRuns++;
context.compileCommand(2, {cmdID: load('display/cmd/Draw9GridTextureCmd').Draw9GridTextureCmd.ID,
    run() { throw new Error('Use nine-grid compilation'); }});
context._draw9GridTexture = originalNineGrid;
assert.equal(nineGridRuns, 1);
const layoutInfo = context.getOwnerDependencyMask();
context.compileCommand(2, {cmdID: 'CustomLayout', needsLayoutRepaint: () => 1, run() {}});
assert.notEqual(context.getOwnerDependencyMask(), layoutInfo);
context.end();
console.log('Graphics: custom mesh ordering, state isolation, payloads, layout dependencies, special dispatch and stable op reuse passed');

mock('components/Component', {Component: class Component {}});
mock('display/Sprite', {});
mock('RenderDriver/DriverDesign/RenderDevice/ShaderData', {ShaderDataType: {}});
mock('resource/Material', {});
mock('resource/Mesh2D', {VertexMesh2D: {getMeshDefine(_mesh, out) { out.length = 0; }}});
const {BaseRenderNode2D} = load('NodeRender2D/BaseRenderNode2D');
const {Mesh2DRender} = load('display/Scene2DSpecial/Mesh2DRender');
function material(valid = true) {
    return {refs: 0, owners: new Set(), destroyed: false, _shaderValues: {},
        _shader: {getSubShaderAt() { return 'subShader'; }},
        checkType() { return valid; }, _addReference() { this.refs++; }, _removeReference() { this.refs--; },
        _setOwner2DElement(element) { this.owners.add(element); }, _removeOwnerElement(element) { this.owners.delete(element); }};
}
const defaultMaterial = material(), a = material(), b = material();
Mesh2DRender.mesh2DDefaultMaterial = defaultMaterial;
const renderer = new Mesh2DRender();
let repaints = 0;
renderer.owner = {repaint() { repaints++; }};
renderer._struct = {};
renderer._spriteShaderData = {addDefine() {}, removeDefine() {}};
renderer.setSharedMaterial(0, a);
renderer.setSharedMaterial(1, b);
renderer.setSharedMaterial(2, a);
assert.equal(a.refs, 2);
assert.equal(b.refs, 1);
assert.equal(renderer.getSharedMaterial(3), null);
const geometries = [{}, {}, {}];
LayaGL.render2DRenderPassFactory.createRenderElement2D = () => ({destroy() { this.destroyed = true; }});
const mesh = {refs: 0, _vertexBuffers: [], subMeshCount: 3, _addReference() { this.refs++; },
    _removeReference() { this.refs--; }, getSubMesh(index) { return geometries[index]; }};
renderer.sharedMesh = mesh;
const elements = Array.from(renderer._renderElements);
assert.deepEqual(elements.map(element => element.geometry), geometries);
assert.ok(a.owners.has(elements[0]) && a.owners.has(elements[2]) && b.owners.has(elements[1]));
// Material changes must not touch the mesh, regenerate defines or allocate elements.
renderer._changeMesh = () => { throw new Error('Material updates must not rebuild meshes'); };
const oldRepaints = repaints;
renderer.sharedMaterial = a;
renderer.setSharedMaterial(1, b);
assert.equal(repaints, oldRepaints);
for (let i = 0; i < 2000; i++) renderer.setSharedMaterial(1, i % 2 ? b : a);
assert.equal(a.refs, 2);
assert.equal(b.refs, 1);
assert.equal(a.owners.size, 2);
assert.equal(b.owners.size, 1);
renderer.setSharedMaterial(1, null);
assert.equal(b.refs, 0);
assert.equal(b.owners.size, 0);
assert.ok(defaultMaterial.owners.has(elements[1]));
renderer.sharedMaterial = b;
assert.equal(renderer.getSharedMaterial(0), b);
assert.equal(a.refs, 1);
assert.equal(b.refs, 1);
assert.equal(a.owners.size, 1);
assert.equal(renderer.getSharedMaterial(1), null);
renderer.setSharedMaterial(0, material(false));
assert.equal(renderer.sharedMaterial, b);
for (const index of [-1, 0.5, NaN, Infinity, 0xffffffff, 1e20])
    assert.throws(() => renderer.setSharedMaterial(index, a), {name: 'RangeError'});
assert.ok(renderer._renderElements.every((element, index) => element === elements[index] && element.geometry === geometries[index]));
const {Texture} = load('resource/Texture');
const texture = new Texture();
texture.refs = 1;
texture._removeReference = function () { this.refs--; };
renderer._texture = texture;
renderer._onDestroy();
assert.equal(a.refs, 0);
assert.equal(b.refs, 0);
assert.equal(a.owners.size + b.owners.size + defaultMaterial.owners.size, 0);
assert.equal(mesh.refs, 0, 'Destroy must release the mesh held by sharedMesh');
assert.equal(texture.refs, 0, 'Destroy must release the texture held by texture');
assert.ok(elements.every(element => element.destroyed), 'Destroy must dispose each render element');
console.log('Mesh2D: ordered per-submesh materials, preassignment, no-op updates, reference/owner cleanup and no geometry rebuild passed');

// Execute backend lifecycle code without starting a GPU or loading unrelated drivers.
function classes(relative, names, bindings) {
    const filename = path.join(root, relative + '.ts');
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
    const declarations = source.statements.filter(node => ts.isClassDeclaration(node) && names.includes(node.name.text));
    assert.equal(declarations.length, names.length);
    const body = declarations.map(node => node.getText(source).replace(/^export /, '')).join('\n')
        + '\n' + names.map(name => `exports.${name} = ${name};`).join('\n');
    const exports = {};
    vm.runInNewContext(ts.transpileModule(body, {compilerOptions: {target: ts.ScriptTarget.ES2017}}).outputText,
        {exports, ...bindings}, {filename});
    return exports;
}
const bindings = {BaseRenderNode2D, Texture2D: {whiteTexture: material()},
    ShaderDefines2D: {GAMMATEXTURE: {}}, window: {conchRTMesh2DRenderDataHandle: class {
        setOwner() {} destroy() { this.destroyed = true; }
    }}};
for (const name of ['Color', 'Matrix', 'Vector3', 'Vector4']) bindings[name] = load('maths/' + name)[name];
BaseRenderNode2D.BASERENDERTEXTURE = 1;
BaseRenderNode2D.NORMAL2DTEXTURE = 2;
const implementations = [
    classes('RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderDataHandle',
        ['WebRender2DDataHandle', 'Web2DBaseRenderDataHandle', 'WebMesh2DRenderDataHandle'], bindings).WebMesh2DRenderDataHandle,
    classes('RenderDriver/RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle',
        ['RTRender2DDataHandle', 'RTBaseRenderDataHandle', 'RTMesh2DRenderDataHandle'], bindings).RTMesh2DRenderDataHandle,
    classes('RenderDriver/NoRenderDriver/2DRenderPass/NoRender2DModuleData',
        ['NoRenderDataHandleBase', 'NoRenderBaseDataHandle', 'NoRenderMeshDataHandle'], bindings).NoRenderMeshDataHandle
];
for (const Handle of implementations) {
    const white = bindings.Texture2D.whiteTexture;
    const unused = new Handle();
    unused.destroy();
    assert.equal(white.refs, 0, `${Handle.name}: uninitialized handles own no white reference`);
    for (const shaderFirst of [false, true]) {
        const values = new Map();
        const shaderData = {setTexture(index, value) {
            values.get(index)?._removeReference(); value?._addReference(); values.set(index, value);
        }, addDefine() {}, removeDefine() {}, destroy() {
            for (const value of values.values()) value?._removeReference(); values.clear();
        }};
        const handle = new Handle();
        handle.owner = {spriteShaderData: shaderData, _nativeObj: {}};
        for (let i = 0; i < 100; i++) handle.baseTexture = null;
        assert.equal(white.refs, Handle.name === 'NoRenderMeshDataHandle' ? 0 : 2,
            `${Handle.name}: repeated default texture assignment must not accumulate references`);
        const base = material(), normal = material();
        base.gammaCorrection = 1;
        for (let i = 0; i < 100; i++) {
            handle.baseTexture = base;
            handle.normal2DTexture = normal;
        }
        assert.equal(base.refs, 2); assert.equal(normal.refs, 2); assert.equal(white.refs, 0);
        if (shaderFirst) shaderData.destroy();
        handle.destroy();
        if (!shaderFirst) shaderData.destroy();
        assert.equal(base.refs, 0, `${Handle.name}: release base texture in either destruction order`);
        assert.equal(normal.refs, 0, `${Handle.name}: release normal texture in either destruction order`);
        assert.equal(handle.baseTexture, null); assert.equal(handle.normal2DTexture, null);
    }
}
const {GLESRenderElement2D} = classes('RenderDriver/OpenGLESDriver/2DRenderPass/GLESRenderElement2D', ['GLESRenderElement2D'], {});
const native = Object.create(GLESRenderElement2D.prototype), calls = [];
native._nativeObj = {setSubShader(value) { calls.push(['shader', value]); },
    setMaterialShaderData(value) { calls.push(['data', value]); }, destroy() { calls.push(['destroy']); }};
const nativeRender = new Mesh2DRender();
nativeRender._struct = {};
nativeRender._renderElements.push(native);
const firstNative = material(), secondNative = material();
for (const [index, value] of [firstNative, secondNative].entries()) {
    value._shaderValues._nativeObj = `data-${index}`;
    value._shader.getSubShaderAt = () => ({moduleData: {_nativeObj: `shader-${index}`}});
}
nativeRender.sharedMaterial = firstNative;
nativeRender.sharedMaterial = firstNative;
nativeRender.setSharedMaterial(0, secondNative);
assert.deepEqual(calls, [['shader', 'shader-0'], ['data', 'data-0'], ['shader', 'shader-1'], ['data', 'data-1']]);
nativeRender._onDestroy();
assert.deepEqual(calls.at(-1), ['destroy']);
assert.equal(firstNative.refs + secondNative.refs, 0);
console.log('Web/Native/NoRender: default/base/normal texture lifetime and real Native element material bridge passed');
const {GLESShaderData} = classes('RenderDriver/OpenGLESDriver/RenderDevice/GLESShaderData', ['GLESShaderData'], {ShaderData: class {}});
const nativeData = Object.create(GLESShaderData.prototype);
nativeData._textureData = {};
let dataDisposals = 0;
nativeData._nativeObj = {_setInternalTexture() {}, destroy() { dataDisposals++; }};
const nativeTexture = material(), replacement = material();
nativeTexture._texture = replacement._texture = {_nativeObj: {}};
nativeData.setTexture(1, nativeTexture);
nativeData.setTexture(2, nativeTexture);
assert.equal(nativeTexture.refs, 2);
nativeData.setTexture(1, replacement);
nativeData.destroy();
assert.equal(nativeTexture.refs, 0);
assert.equal(replacement.refs, 0);
assert.equal(Object.keys(nativeData._textureData).length, 0);
assert.equal(dataDisposals, 1);
console.log('Native ShaderData: texture replacement and destruction balance JS texture references');

const gpuEngine = {_instance: {gpuBufferMgr: {bufferResourceChangeEpoch: 0}}};
const {WebGPUBindGroup, WebGPUBindGroupCache} = classes('RenderDriver/WebGPUDriver/RenderDevice/WebGPUBindGroupCache',
    ['WebGPUBindGroup', 'WebGPUBindGroupCache'], {WebGPURenderEngine: gpuEngine});
const bindCache = new WebGPUBindGroupCache();
gpuEngine._instance.bindGroupCache = bindCache;
const liveToken = {value: 0}, staleToken = {value: 0};
const liveGroup = new WebGPUBindGroup({}), staleGroup = new WebGPUBindGroup({});
liveGroup.bufferRefs.push({token: liveToken, ver: 0});
staleGroup.bufferRefs.push({token: staleToken, ver: 0});
bindCache.bindGroupCache.set('live', liveGroup);
bindCache.bindGroupCache.set('stale', staleGroup);
bindCache.layoutCache.set('shared-layout', {});
staleToken.value++;
gpuEngine._instance.gpuBufferMgr.bufferResourceChangeEpoch++;
bindCache.requestInvalidGroupsCleanup();
bindCache.clearInvalidGroups();
assert.equal(bindCache.bindGroupCache.get('live'), liveGroup);
assert.equal(bindCache.bindGroupCache.has('stale'), false);
assert.equal(bindCache.layoutCache.size, 1, 'Cleanup preserves reusable pipeline layouts');
const {WebGPUShaderData} = classes('RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData', ['WebGPUShaderData'],
    {ShaderData: class {}, WebGPURenderEngine: gpuEngine, Resource: class {}, WebGPUDeviceBuffer: class {},
        WebGPUInternalTex: class {}, Shader3D: {propertyNameToID: name => name}});
const gpuData = Object.create(WebGPUShaderData.prototype);
gpuData.clearData = () => {};
gpuData.clearUBO = () => { liveToken.value++; gpuEngine._instance.gpuBufferMgr.bufferResourceChangeEpoch++; };
gpuData._defineDatas = {destroy() {}};
gpuData._gammaColorMap = new Map();
gpuData.destroy();
assert.equal(bindCache.bindGroupCache.size, 1, 'Destruction defers cache scanning until frame end');
WebGPUShaderData.endFrame();
assert.equal(bindCache.bindGroupCache.size, 0, 'Frame-end cleanup evicts freed buffer bindings');
let validations = 0;
const borrowedGroup = {isValid() { validations++; return true; }};
bindCache.bindGroupCache.set('borrowed-live', borrowedGroup);
for (let i = 0; i < 1000; i++) {
    bindCache.bindGroupCache.set('dead-' + i, {isValid() { validations++; return false; }});
    bindCache.requestInvalidGroupsCleanup();
}
assert.equal(validations, 0, 'A batch of destruction requests does not scan per ShaderData');
WebGPUShaderData.endFrame();
assert.equal(validations, 1001, 'All destruction in a frame causes a single cache traversal');
assert.equal(bindCache.bindGroupCache.get('borrowed-live'), borrowedGroup, 'Valid shared bindings survive cleanup');
WebGPUShaderData.endFrame();
assert.equal(validations, 1001, 'Idle frames do not scan bindings');
const staleTexture = {resourceVersion: 2};
const textureGroup = new WebGPUBindGroup({});
textureGroup.texRefs.push({tex: staleTexture, ver: 1});
bindCache.bindGroupCache.set('stale-texture', textureGroup);
bindCache.requestInvalidGroupsCleanup();
WebGPUShaderData.endFrame();
assert.equal(bindCache.bindGroupCache.has('stale-texture'), false, 'Texture invalidation is included in deferred cleanup');
bindCache.requestInvalidGroupsCleanup();
bindCache.clearCache();
const afterClear = validations;
WebGPUShaderData.endFrame();
assert.equal(validations, afterClear, 'Full cache clearing also cancels pending cleanup');
const borrowedView = new Float32Array([12, 34]);
const ownView = new Float32Array([56, 78]);
let borrowedDetach = 0, ownedDisposals = 0;
const borrowedBuffer = {uniformName: 'borrowed', descriptor: {uniforms: new Map([[0, {view: borrowedView}]])},
    markDirty() { throw new Error('A borrower must not mark its owner buffer dirty'); },
    destroy() { throw new Error('A borrower must not destroy its owner buffer'); },
    removeObserver(data) { assert.equal(data, borrowingData); borrowedDetach++; }};
const ownBuffer = {uniformName: 'own', descriptor: {uniforms: new Map([[0, {view: ownView}]])}, markDirty() {},
    destroy() { ownedDisposals++; }};
const borrowingData = Object.create(WebGPUShaderData.prototype);
Object.assign(borrowingData, {_data: {}, _textureData: {}, _gammaColorMap: new Map(), _textureStatesMap: new Map(),
    _uniformBuffers: new Map(), _subUniformBuffers: new Map([['borrowed', borrowedBuffer], ['own', ownBuffer]]),
    _borrowedSubBuffers: new Set([borrowedBuffer]), _uniformBuffersPropertyMap: new Map(), _uboLayoutVersion: 0,
    clearDefine() {}, _clearRenderStateCheck() {}});
borrowingData.clearData();
assert.deepEqual(Array.from(borrowedView), [12, 34], 'Clearing borrowed ShaderData must preserve shared buffer contents');
assert.deepEqual(Array.from(ownView), [0, 0]);
borrowingData.clearUBO();
assert.equal(borrowedDetach, 1);
assert.equal(ownedDisposals, 1);
const {Vector2} = load('maths/Vector2');
const {WebGPURenderElement2D} = classes('RenderDriver/WebGPUDriver/2DRenderPass/WebGPURenderElement2D', ['WebGPURenderElement2D'],
    {Vector2, WebDefineDatas: class {}, compareCahceFlag: () => false, Shader3D: {CULL: 0}, RenderState: {CULL_NONE: 0}});
const gpuElement = Object.create(WebGPURenderElement2D.prototype);
const state = id => ({getInt: () => 0, depthStencilStateKey: 0, blendStateCache: {id}});
const ownerState = state(1), primitiveState = state(2), materialState = state(3);
Object.assign(gpuElement, {_value2DShaderData: ownerState, _materialShaderData: null,
    _additionShaderData: new Map([['Sprite2DGraphics', primitiveState]]), renderStateIsBySprite: false,
    _getRenderStateBlendByMaterial: data => data, _getRenderStateBlendByShader: data => data});
for (const statefirst of [false, true]) {
    gpuElement._getBlendState({_shaderPass: {statefirst}});
    assert.equal(gpuElement.blendState, primitiveState, 'Per-op blend comes from primitive state');
    gpuElement.renderStateIsBySprite = true;
    gpuElement._getBlendState({_shaderPass: {statefirst}});
    assert.equal(gpuElement.blendState, ownerState);
    gpuElement.renderStateIsBySprite = false;
    gpuElement._materialShaderData = materialState;
    gpuElement._getBlendState({_shaderPass: {statefirst}});
    assert.equal(gpuElement.blendState, materialState, 'Custom material keeps precedence');
    gpuElement._materialShaderData = null;
}
let pipelineUpdates = 0;
Object.assign(gpuElement, {_passRenderInfo: new Map([[0, {drawInfos: [], geometryStateID: 1, passDefineCacheFlag: {}}]]),
    _updateMatChangeFlag() { this._materialRenderDataChange = false; }, getGlobalShaderData: () => null,
    _globalShaderData: null, geometry: {getStateCacheID: () => 1}, _cacheGeometryStateID: 1,
    _getStencilClipStateKey: () => null, _cacheStencilClipStateKey: null, _cacheMatBlendStateID: 1,
    _cacheMatCullMode: 0, _cacheMatDepthStencilID: 0, owner: {}, _needUpdatePipeline() { pipelineUpdates++; }});
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 1, 'Changing primitive blend invalidates the pipeline');
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 1, 'Unchanged primitive blend reuses the pipeline');
ownerState.getInt = () => 1;
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 2, 'Primitive draws still track owner cull state used to build the pipeline');
ownerState.depthStencilStateKey = 1;
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 3, 'Primitive draws still track owner depth/stencil state');
primitiveState.getInt = () => 2;
primitiveState.depthStencilStateKey = 2;
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 3, 'Unused primitive cull/depth state must not rebuild pipelines');
ownerState.blendStateCache.id = 10;
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 3, 'Owner blend changes do not override explicit per-op blending');
primitiveState.blendStateCache.id = 20;
gpuElement._prepare({_curRenderGlobalKey: 0});
assert.equal(pipelineUpdates, 4, 'Per-op blend changes invalidate only the affected pipeline state');
console.log('WebGPU: freed binding eviction, valid cache retention, per-op blend selection and pipeline reuse passed');
