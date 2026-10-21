// Run: node --test tests/norender/state.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../src/layaAir/laya');

// Load the production math and enum modules without booting Laya or a GPU.
const modules = new Map();
function load(relative) {
    const file = path.resolve(root, relative.endsWith('.ts') ? relative : relative + '.ts');
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    vm.runInThisContext('(function(module,exports,require){' + code + '\n})', { filename: file })(
        module, module.exports, request => load(path.resolve(path.dirname(file), request)));
    return module.exports;
}
class Resource {
    references = 0;
    _addReference() { this.references++; }
    _removeReference() { this.references--; }
}
const context = vm.createContext({ assert, Resource, Float32Array, Uint8Array, ArrayBuffer });
for (const name of ['Color', 'Vector2', 'Vector3', 'Vector4', 'Matrix3x3', 'Matrix4x4'])
    Object.assign(context, load('maths/' + name));
for (const name of ['DrawType', 'IndexFormat', 'RenderPologyMode', 'TextureDimension', 'TextureFormat',
    'RenderTargetFormat', 'FilterMode', 'WrapMode', 'TextureCompareMode', 'RenderCapable'])
    Object.assign(context, load('RenderEngine/RenderEnum/' + name));
Object.assign(context, load('utils/SingletonList'), load('utils/Error'),
    load('RenderDriver/RenderModuleData/Design/ShaderDefine'),
    load('RenderDriver/RenderModuleData/Design/RenderState'));
context.LayaGL = {};

// Execute unchanged production class bodies with only their initialization environment isolated.
function classes(relative, names) {
    const file = path.join(root, relative + '.ts');
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const nodes = source.statements.filter(node =>
        (ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) && names.includes(node.name?.text));
    assert.equal(nodes.length, names.length, relative);
    const code = nodes.map(node => node.getText(source).replace(/^export /, '')).join('\n') +
        '\n' + names.map(name => `globalThis.${name} = ${name};`).join('\n');
    vm.runInContext(ts.transpileModule(code, {
        compilerOptions: { target: ts.ScriptTarget.ES2020 }
    }).outputText, context, { filename: file });
}
classes('RenderDriver/DriverDesign/RenderDevice/ShaderData', ['ShaderData', 'ShaderDataType']);
classes('RenderDriver/DriverDesign/RenderDevice/CommandUniformMap', ['CommandUniformMap']);
classes('RenderDriver/DriverDesign/RenderDevice/IRenderCMD', ['SetRenderDataCMD', 'SetShaderDefineCMD', 'RenderCMDType']);
classes('RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD', ['SetRendertarget2DCMD']);
const backend = 'RenderDriver/NoRenderDriver/';
classes(backend + 'DriverDevice/NoRenderEngineFactory', ['NoRenderEngine', 'NoTextureContext', 'NoInternalTexture', 'NoInternalRT']);
classes(backend + 'DriverDevice/NoRenderDeviceFactory', ['NoRenderDefineDatas', 'NoRenderShaderData',
    'NoRenderDeviceFactory', 'NoRenderCommandUnifojrmMap', 'NoRenderGeometryElement',
    'NoRenderSetRenderData', 'NoRenderSetShaderDefine']);
classes(backend + 'DriverDevice/NoRenderUnitModuleDataFactory', ['NoRenderShaderPass', 'NoRenderSubShader', 'NoRenderUnitModuleDataFactory']);
classes(backend + '2DRenderPass/NoRender2DProcess', ['NoRenderContext2D', 'NoRenderSetRendertarget2DCMD']);
classes(backend + '3DRenderPass/NoRender3DRenderPassFactory', ['NoRenderRenderContext3D']);
const { NoRenderShaderData, NoRenderDeviceFactory, NoTextureContext, NoRenderEngine,
    Color, Vector2, Vector3, Vector4, Matrix3x3, Matrix4x4, ShaderDataType,
    RenderTargetFormat, TextureDimension, TextureCompareMode, FastSinglelist, ShaderDefine } = context;
context.LayaGL.renderEngine = new NoRenderEngine();

test('uniform registrations survive repeated factory lookups', () => {
    const factory = new NoRenderDeviceFactory();
    const map = factory.createGlobalUniformMap('Scene');
    map.addShaderUniform(101, 'u_Color', ShaderDataType.Color, { access: 'readonly' });
    map.addShaderUniformArray(102, 'u_Array', ShaderDataType.Vector4, 8);
    const texture = new Resource();
    map.setDefaultTextureData(101, texture);
    assert.equal(factory.createGlobalUniformMap('Scene'), map);
    assert.equal(map.hasPtrID(101), true);
    assert.equal(map.hasPtrID(102), true);
    assert.equal(map.hasPtrID(context.LayaGL.renderEngine.propertyNameToID('Scene')), true);
    assert.equal(map.hasPtrID(10000), false);
    assert.equal(map._idata.get(101).access, 'readonly');
    assert.equal(map._idata.get(102).arrayLength, 8);
    assert.equal(map._defaultTextures.get(101), texture);
    assert.notEqual(factory.createGlobalUniformMap('Camera'), map);
});

test('shader values snapshot reusable vectors, colors and matrices', () => {
    const data = new NoRenderShaderData();
    const cases = [
        ['Vector2', new Vector2(1, 2)], ['Vector3', new Vector3(1, 2, 3)],
        ['Vector', new Vector4(1, 2, 3, 4)], ['Color', new Color(.1, .2, .3, .4)],
        ['Matrix3x3', new Matrix3x3()], ['Matrix4x4', new Matrix4x4()]
    ];
    for (const [i, [name, value]] of cases.entries()) {
        data['set' + name](i, value);
        const stored = data['get' + name](i);
        assert.notEqual(stored, value);
        assert.deepEqual(stored, value);
        data['set' + name](i, value);
        assert.equal(data['get' + name](i), stored);
    }
    assert.doesNotThrow(() => data.update('MorphTarget'));
    const owner = new Resource();
    assert.equal(new NoRenderDeviceFactory().createShaderData(owner)._ownerResource, owner);
});

test('clone replaces destination data and preserves independent color, buffer, matrix and defines', () => {
    const source = new NoRenderShaderData(), dest = new NoRenderShaderData();
    source.setColor(1, new Color(.1, .2, .3, .4));
    source.setBuffer(2, new Float32Array([3, 4]));
    source.setMatrix4x4(3, new Matrix4x4());
    source.setBool(4, false);
    source.setNumber(5, 0);
    source._setInternalTexture(6, null);
    const define = new ShaderDefine(1, 8);
    source.addDefine(define);
    const previous = new Resource();
    dest.setTexture(99, previous);
    source.cloneTo(dest);
    assert.equal(previous.references, 0);
    assert.equal(dest.getTexture(99), undefined);
    assert.equal(dest.getBool(4), false);
    assert.equal(dest.getNumber(5), 0);
    assert.equal(dest.getData()[6], null);
    assert.equal(dest.hasDefine(define), true);
    dest.getColor(1).r = .9;
    dest.getBuffer(2)[0] = 99;
    dest.getMatrix4x4(3).elements[0] = 99;
    assert.equal(source.getColor(1).r, .1);
    assert.equal(source.getBuffer(2)[0], 3);
    assert.equal(source.getMatrix4x4(3).elements[0], 1);
    source.cloneTo(source);
    assert.equal(source.hasDefine(define), true);
});

test('texture ownership balances replace, clone, clear and repeated destroy', () => {
    const data = new NoRenderShaderData(), a = new Resource(), b = new Resource();
    data.setTexture(1, a);
    data.setTexture(1, a);
    assert.equal(a.references, 1);
    data.setTexture(1, b);
    assert.equal(a.references, 0);
    assert.equal(b.references, 1);
    const clone = data.clone();
    assert.equal(b.references, 2);
    data.clearData();
    assert.equal(b.references, 1);
    clone.destroy();
    clone.destroy();
    assert.equal(b.references, 0);
    data.setTexture(1, a);
    const internal = {};
    data._setInternalTexture(1, internal);
    assert.equal(a.references, 0);
    assert.equal(data.getData()[1], internal);
    data.destroy();
});

test('geometry retains topology and cumulative draw parameters', () => {
    const geo = new NoRenderDeviceFactory().createRenderGeometryElement(context.MeshTopology.Lines, context.DrawType.DrawArray);
    assert.equal(geo.mode, context.MeshTopology.Lines);
    assert.equal(geo.drawType, context.DrawType.DrawArray);
    geo.setDrawArrayParams(0, 6);
    geo.setDrawElemenParams(6, 12);
    const out = new FastSinglelist();
    geo.getDrawDataParams(out);
    assert.deepEqual(Array.from(out.elements), [0, 6, 12, 6]);
    geo.clearRenderParams();
    assert.equal(geo.drawParams.length, 0);
    assert.equal(out.length, 4);
});

test('2D context retains directly assigned target and viewport', () => {
    const ctx = new context.NoRenderContext2D();
    const rt = new context.NoInternalRT();
    ctx.setRenderTarget(rt, false, null);
    assert.equal(ctx.getRenderTarget(), rt);
    ctx.setOffscreenView(640, 480, 2, 3);
    const view = new Vector4();
    ctx.getOffscreenView(view);
    assert.deepEqual(view, new Vector4(2, 3, 640, 480));
    ctx.setRenderTarget(null, false, null);
    ctx.setOffscreenView(320, 240);
    assert.equal(ctx.getRenderTarget(), null);
    ctx.getOffscreenView(view);
    assert.deepEqual(view, new Vector4(0, 0, 320, 240));
});

test('NoRender command entry points remain inert', () => {
    const contexts = [new context.NoRenderContext2D(), new context.NoRenderRenderContext3D()];
    const forbidden = { apply() { assert.fail('NoRender must not execute render commands'); } };
    for (const ctx of contexts) {
        ctx.runOneCMD(forbidden);
        ctx.runCMDList([forbidden]);
    }
    const data = new NoRenderShaderData();
    const set = new context.NoRenderSetRenderData();
    set.dest = data; set.propertyID = 1; set.dataType = ShaderDataType.Float; set.value = 42;
    assert.equal(set.value, 42);
    const define = new context.NoRenderSetShaderDefine();
    define.dest = data; define.define = new ShaderDefine(0, 1); define.add = true;
    set.apply(contexts[0]);
    define.apply(contexts[0]);
    assert.equal(data.getNumber(1), undefined);
    assert.equal(data.hasDefine(define.define), false);
    const target = new context.NoRenderSetRendertarget2DCMD();
    target.rt = new context.NoInternalRT();
    target.apply(contexts[0]);
    assert.equal(contexts[0].getRenderTarget(), null);
});

test('shader cache keys use define values rather than mutable object identity', () => {
    const factory = new context.NoRenderUnitModuleDataFactory();
    const pass = factory.createShaderPass(null);
    const define = new ShaderDefine(2, 4);
    pass.validDefine.add(define);
    const data = factory.createDefineDatas();
    data.add(define);
    assert.equal(pass.getCacheShader(data), null);
    let disposed = 0;
    const shader = { _disposeResource() { disposed++; } };
    pass.setCacheShader(data, shader);
    assert.equal(pass.getCacheShader(data.clone()), shader);
    data.clear();
    assert.equal(pass.getCacheShader(data), null);
    pass.setCacheShader(data, null);
    const sub = factory.createSubShader();
    sub.addShaderPass(pass);
    const uniformMap = new Map([[123, { propertyName: 'u_Test' }]]);
    sub.setUniformMap(uniformMap);
    uniformMap.clear();
    assert.equal(sub.uniformMap.size, 1);
    sub.destroy();
    assert.equal(disposed, 1);
});

test('texture metadata retains depth, mip levels and render target state', () => {
    const ctx = new NoTextureContext();
    const tex = ctx.createTexture3DInternal(TextureDimension.Tex3D, 4, 4, 16, 0, true, true, false);
    assert.equal(tex.depth, 16);
    assert.equal(tex.mipmapCount, 5);
    assert.equal(tex.maxMipmapLevel, 4);
    assert.equal(tex.gammaCorrection, 2.2);
    const npot = ctx.createTextureInternal(TextureDimension.Tex2D, 3, 5, 0, false, false, false);
    assert.equal(npot.isPotSize, false);
    const cube = ctx.createRenderTargetCubeInternal(8, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, true, true, 4);
    assert.equal(cube._isCube, true);
    assert.equal(cube._samples, 4);
    assert.equal(cube._generateMipmap, true);
    assert.equal(cube.colorFormat, RenderTargetFormat.R8G8B8A8);
    assert.equal(cube.depthStencilFormat, RenderTargetFormat.DEPTH_16);
    assert.equal(cube.isSRGB, true);
    const depth = ctx.createRenderTargetDepthTexture(cube, TextureDimension.Cube, 8, 8);
    assert.equal(cube._depthTexture, depth);
    assert.equal(ctx.setTextureCompareMode(depth, TextureCompareMode.LESS), TextureCompareMode.LESS);
    assert.equal(depth.compareMode, TextureCompareMode.LESS);
    const array = ctx.createRenderTargetArrayInternal(4, 4, 32, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None, true, false, 1);
    assert.equal(array._textures[0].depth, 32);
    assert.equal(array._textures[0].mipmapCount, 3);
});

test('readback preserves typed views and zeros only the provided view', async () => {
    const ctx = new NoTextureContext();
    const rt = ctx.createRenderTargetInternal(2, 2, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None, false, false, 1, false);
    const bytes = new Uint8Array(24).fill(255);
    const out = bytes.subarray(4, 20);
    assert.equal(ctx.readRenderTargetPixelData(rt, 0, 0, 2, 2, out), out);
    assert.deepEqual(Array.from(bytes), [255, 255, 255, 255, ...Array(16).fill(0), 255, 255, 255, 255]);
    const floats = new Float32Array(16).fill(1);
    assert.equal(await ctx.readRenderTargetPixelDataAsync(rt, 0, 0, 2, 2, floats), floats);
    assert.equal(floats.every(value => value === 0), true);
    const allocated = await ctx.readRenderTargetPixelDataAsync(rt, 0, 0, 2, 2, null);
    assert.ok(allocated instanceof Uint8Array);
    assert.equal(allocated.length, 16);
});

test('unsupported compute capabilities remain disabled', () => {
    assert.equal(new NoRenderEngine().getCapable(context.RenderCapable.ComputeShader), false);
    const factory = new NoRenderDeviceFactory();
    for (const name of ['createComputeShader', 'createComputeContext', 'createDeviceBuffer', 'createDeviceVertexBuffer'])
        assert.equal(factory[name], undefined);
});
