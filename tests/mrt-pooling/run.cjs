const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// 执行真实资源类；只替换设备与运行环境，使资源分配、引用和池化可确定地验证。
const root = path.resolve(__dirname, '../../src/layaAir/laya');
const cache = new Map();
const config = { defaultCacheRTMemory: 0 };
let failCreate = false;
let allocations = 0;
const textures = [];
function texture() {
    const result = { resource: {}, disposeCount: 0, dispose() {
        assert.equal(++this.disposeCount, 1, '附件只能释放一次');
        this.resource = null;
    } };
    textures.push(result);
    return result;
}
function target(width, height, formats, depth, mipmap = false, samples = 1, sRGB = false, mrt = false) {
    allocations++;
    const rt = {
        _textures: formats.map(format => format === null ? null : texture()), _depthTexture: null,
        colorFormat: formats[0], depthStencilFormat: depth,
        _samples: samples, _isCube: false, _generateMipmap: mipmap, isSRGB: sRGB,
        gpuMemory: width * height * 4 * (formats.filter(format => format !== null).length + (depth === -1 ? 0 : 1)),
        disposeCount: 0, dispose() {
            assert.equal(++this.disposeCount, 1, '整组只能释放一次');
            this._textures.forEach(t => t?.dispose());
            this._depthTexture?.dispose();
        }
    };
    if (mrt) {
        rt.colorFormats = formats.slice();
        rt._color0Target = { _textures: [rt._textures[0]], _depthTexture: null };
    }
    return rt;
}
const LayaGL = { renderEngine: { getCapable: () => true }, textureContext: {
    createRenderTargetInternal: (w, h, f, d, mm, srgb, samples) => target(w, h, [f], d, mm, samples, srgb),
    createMultiRenderTargetInternal(w, h, formats, depth, srgb) {
        if (failCreate) throw new Error('模拟设备分配失败');
        return target(w, h, formats, depth, false, 1, srgb, true);
    },
    createRenderTargetDepthTexture(rt) {
        rt._depthTexture = texture();
        if (rt._color0Target) rt._color0Target._depthTexture = rt._depthTexture;
        return rt._depthTexture;
    }
} };
function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const requireModule = name => {
        const base = name.split('/').pop();
        if (base === 'LayaGL') return { LayaGL };
        if (base === 'Config') return { Config: { destroyResourceImmediatelyDefault: true } };
        if (base === 'Config3D') return { Config3D: config };
        if (base === 'LayaEnv') return { LayaEnv: { isPlaying: true } };
        if (base === 'ILaya') return { ILaya: { loader: { loading: false, clearRes() {} }, timer: { frameLoop() {}, clear() {} } } };
        if (base === 'EventDispatcher') return { EventDispatcher: class { offAll() {} on() {} off() {} } };
        if (base === 'Error') return { NotImplementedError: Error };
        return load(path.resolve(path.dirname(file), name + '.ts'));
    };
    new Function('exports', 'require', 'module', js)(module.exports, requireModule, module);
    return module.exports;
}
const { RenderTexture: RT } = load(path.join(root, 'resource/RenderTexture.ts'));
const { RenderTextureMRT: MRT } = load(path.join(root, 'resource/RenderTextureMRT.ts'));
const { Resource } = load(path.join(root, 'resource/Resource.ts'));
const { RenderTargetFormat: R } = load(path.join(root, 'RenderEngine/RenderEnum/RenderTargetFormat.ts'));
const standard = { width: 4, height: 3, colorFormats: [R.R8G8B8A8, R.R16G16B16A16], depthStencilFormat: R.DEPTH_16 };
const reports = [];
function test(name, callback) { callback(); reports.push(name); }

test('同布局整组复用，附件与主色绑定身份保持稳定，连续取还不重新分配', () => {
    const owner = MRT.createFromPool(standard);
    const aux = owner.getColorTexture(1);
    const primary = owner._getRenderTarget(true);
    const count = allocations;
    for (let i = 0; i < 100; i++) {
        RT.recoverToPool(owner);
        assert.equal(MRT.createFromPool(standard), owner);
        assert.equal(owner.getColorTexture(1), aux);
        assert.equal(owner._getRenderTarget(true), primary);
    }
    assert.equal(allocations, count);
    RT.recoverToPool(owner);
});
test('格式顺序、附件数量、尺寸、深度格式、深度采样与主色 sRGB 分别隔离', () => {
    const expected = MRT.createFromPool(standard);
    RT.recoverToPool(expected);
    const changes = [
        { colorFormats: [...standard.colorFormats].reverse() },
        { colorFormats: [standard.colorFormats[0]] },
        { width: 5 }, { height: 4 }, { depthStencilFormat: R.DEPTH_32 },
        { depthTexture: true }, { sRGB: true }
    ];
    for (const change of changes) {
        const other = MRT.createFromPool({ ...standard, ...change });
        assert.notEqual(other, expected);
        RT.recoverToPool(other);
    }
    assert.equal(MRT.createFromPool(standard), expected);
    RT.recoverToPool(expected);
});
test('普通 RT 与单附件 MRT 也不能混取，普通池复用行为保持', () => {
    const options = { ...standard, colorFormats: [R.R8G8B8A8] };
    const mrt = MRT.createFromPool(options);
    RT.recoverToPool(mrt);
    const rt = RT.createFromPool(4, 3, R.R8G8B8A8, R.DEPTH_16);
    assert.equal(rt.isMRT, false);
    assert.notEqual(rt, mrt);
    RT.recoverToPool(rt);
    assert.equal(RT.createFromPool(4, 3, R.R8G8B8A8, R.DEPTH_16), rt);
    assert.equal(MRT.createFromPool(options), mrt);
    RT.recoverToPool(rt);
    RT.recoverToPool(mrt);
});
test('采样附件保护整组，深度和颜色统一释放且不会二次释放 GPU 资源', () => {
    const owner = new MRT({ ...standard, depthTexture: true });
    const aux = owner.getColorTexture(1);
    const depth = owner.depthStencilTexture;
    const internal = owner._renderTarget;
    assert.equal(owner._getRenderTarget(true)._depthTexture, depth._texture);
    assert.equal(owner._getRenderTarget(true).colorFormats, undefined);
    assert.throws(() => depth.destroy(), /independently/);
    aux._addReference(); depth._addReference();
    assert.equal(owner.referenceCount, 2);
    Resource.destroyUnusedResources();
    assert.equal(owner.destroyed, false);
    owner.destroy();
    assert.equal(internal.disposeCount, 1);
    assert.equal(aux.destroyed, true); assert.equal(depth.destroyed, true);
    aux._removeReference(); depth._removeReference();
    assert.equal(owner.referenceCount, 0);
});
test('MRT 与普通 RT 共用现有显存预算，回收重复调用不会重复计数', () => {
    const owner = MRT.createFromPool({ ...standard, depthTexture: true });
    const rt = RT.createFromPool(2, 2, R.R8G8B8A8, R.None);
    RT.recoverToPool(owner); RT.recoverToPool(owner); RT.recoverToPool(rt);
    const memory = RT._pool.reduce((sum, item) => sum + item._renderTarget.gpuMemory / 1024 / 1024, 0);
    assert.equal(RT._poolMemory, memory);
    config.defaultCacheRTMemory = memory + 1;
    RT.clearPool(); assert.equal(owner.destroyed, false);
    config.defaultCacheRTMemory = 0;
    RT.clearPool(); assert.equal(owner.destroyed, true); assert.equal(rt.destroyed, true);
    assert.equal(RT._poolMemory, 0); assert.equal(RT._pool.length, 0);
});
test('未适配后端在分配和登记资源前拒绝 MRT，不影响普通 RT', () => {
    const createMRT = LayaGL.textureContext.createMultiRenderTargetInternal;
    LayaGL.textureContext.createMultiRenderTargetInternal = undefined;
    const resources = Object.keys(Resource._idResourcesMap).length;
    const count = allocations;
    assert.throws(() => new MRT(standard), /does not support MRT/);
    assert.equal(allocations, count);
    assert.equal(Object.keys(Resource._idResourcesMap).length, resources);
    const ordinary = new RT(4, 3, R.R8G8B8A8, R.DEPTH_16);
    assert.equal(ordinary.isMRT, false);
    ordinary.destroy();
    LayaGL.textureContext.createMultiRenderTargetInternal = createMRT;
});
test('创建失败不残留资源包装，非法布局和纯模板采样提前报错', () => {
    const count = Object.keys(Resource._idResourcesMap).length;
    failCreate = true;
    assert.throws(() => MRT.createFromPool(standard), /模拟设备分配失败/);
    failCreate = false;
    assert.equal(Object.keys(Resource._idResourcesMap).length, count);
    assert.throws(() => MRT.createFromPool({ ...standard, colorFormats: [] }), /non-empty/);
    assert.throws(() => MRT.createFromPool({ ...standard, width: 0 }), /positive integers/);
    assert.throws(() => MRT.createFromPool({ ...standard, depthTexture: true, depthStencilFormat: R.STENCIL_8 }), /stencil-only/);
});
test('稀疏组只创建实际附件，空槽无包装；取还复用两张纹理并按实际显存计数', () => {
    const count = textures.length;
    const options = { width: 7, height: 5, colorFormats: [R.R8G8B8A8, null, null, R.R8G8B8A8] };
    const owner = MRT.createFromPool(options);
    assert.equal(textures.length - count, 2);
    assert.equal(owner.colorAttachmentCount, 4);
    assert.equal(owner.getColorTexture(1), null);
    assert.equal(owner.getColorTexture(2), null);
    assert.ok(owner.getColorTexture(0)); assert.ok(owner.getColorTexture(3));
    assert.deepEqual(owner._renderTarget._textures.slice(1, 3), [null, null]);
    assert.equal(owner._renderTarget.gpuMemory, 7 * 5 * 4 * 2);
    const allocated = allocations;
    for (let i = 0; i < 100; i++) {
        RT.recoverToPool(owner);
        assert.equal(MRT.createFromPool(options), owner);
    }
    assert.equal(allocations, allocated);
    owner.destroy();
    assert.equal(textures.length - count, 2);
});
test('资源池区分相同附件数量的不同空槽布局，末尾空槽与数组空洞规范化', () => {
    const options = { width: 9, height: 5, colorFormats: [R.R8G8B8A8, null, null, R.R8G8B8A8] };
    const first = MRT.createFromPool(options); RT.recoverToPool(first);
    const other = MRT.createFromPool({ ...options, colorFormats: [R.R8G8B8A8, null, R.R8G8B8A8] });
    assert.notEqual(other, first);
    const holes = new Array(5); holes[0] = R.R8G8B8A8; holes[3] = R.R8G8B8A8;
    assert.equal(MRT.createFromPool({ ...options, colorFormats: holes }), first);
    assert.deepEqual(first.colorFormats, options.colorFormats);
    assert.equal(Object.isFrozen(first.colorFormats), true);
    first.destroy(); other.destroy();
});
test('主颜色槽必须存在，空主色在分配前拒绝', () => {
    const count = allocations;
    for (const colorFormats of [[null, R.R8G8B8A8], [undefined, R.R8G8B8A8], new Array(3)])
        assert.throws(() => new MRT({ ...standard, colorFormats }), /location 0/);
    assert.equal(allocations, count);
});
console.log(JSON.stringify({ passed: reports.length, tests: reports }, null, 2));
