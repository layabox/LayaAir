// 执行当前真实 TS 类/方法；GPU 分配、命令提交和无关场景对象使用替身。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ts = require('typescript');
const sourceRoot = path.resolve(__dirname, '../../src/layaAir/laya');
const sourceHashes = {};
function source(relative) {
    const raw = fs.readFileSync(path.join(sourceRoot, relative));
    sourceHashes[relative] = crypto.createHash('sha256').update(raw).digest('hex');
    return raw.toString('utf8');
}
function compile(text, globals = {}) {
    const js = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    new Function('exports', ...Object.keys(globals), js)(exports, ...Object.values(globals));
    return exports;
}
function actual(relative, globals = {}) {
    const ast = ts.createSourceFile(relative, source(relative), ts.ScriptTarget.Latest, true);
    return compile(ast.statements.filter(n => !ts.isImportDeclaration(n) && !ts.isExportDeclaration(n)).map(n => n.getText(ast)).join('\n'), globals);
}
function methods(relative, className, select, globals = {}) {
    const ast = ts.createSourceFile(relative, source(relative), ts.ScriptTarget.Latest, true);
    const cls = ast.statements.find(n => ts.isClassDeclaration(n) && n.name?.text === className);
    assert.ok(cls, `class missing: ${className}`);
    const members = cls.members.filter(n => select(n.name?.getText(ast), n));
    const declarations = ast.statements.filter(n => ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n) || ts.isEnumDeclaration(n)).map(n => n.getText(ast)).join('\n');
    return compile(`${declarations}\nexport class ${className} {${members.map(n => n.getText(ast)).join('\n')}}`, globals);
}
const TextureFormat = actual('RenderEngine/RenderEnum/TextureFormat.ts').TextureFormat;
const RF = actual('RenderEngine/RenderEnum/RenderTargetFormat.ts', { TextureFormat }).RenderTargetFormat;
const RenderCapable = actual('RenderEngine/RenderEnum/RenderCapable.ts').RenderCapable;
const RenderParams = actual('RenderEngine/RenderEnum/RenderParams.ts').RenderParams;
const RenderClearFlag = actual('RenderEngine/RenderEnum/RenderClearFlag.ts').RenderClearFlag;
const depthAST = ts.createSourceFile('RenderTexture.ts', source('resource/RenderTexture.ts'), ts.ScriptTarget.Latest, true);
const DepthTextureMode = compile(depthAST.statements.filter(ts.isEnumDeclaration).map(n => n.getText(depthAST)).join('\n')).DepthTextureMode;
const Color = actual('maths/Color.ts').Color;
const Stat = { enablePostprocess: true, enablemsaa: true, enableOpaque: true, enableTransparent: true, enableCameraCMD: true, enableShadow: false };
const LayaGL = { renderEngine: { _screenInvertY: true, getCapable: () => true, getParams: () => 8 }, renderDeviceFactory: { createShaderData: () => ({ clearData() {}, clearDefine() {}, addDefine() {}, setTexture() {}, destroy() {} }) } };
let nextId = 1;
const allocated = [], recovered = [];
class RT {
    constructor(options) {
        Object.assign(this, options);
        this.id = nextId++;
        this._inPool = false;
        this._texture = { gammaCorrection: options.sRGB ? 2.2 : 1 };
        this._renderTarget = { owner: this, kind: 'full', colorFormats: options.colorFormats };
        this.primaryBinding = { owner: this, kind: 'primary', colorFormats: undefined };
        this._colors = options.colorFormats.map((format, index) => format === null ? null : ({ owner: this, index, format }));
        this.depthStencilFormat = options.depthStencilFormat;
        this.depthStencilTexture = options.depthTexture ? { owner: this, kind: 'depth' } : null;
        allocated.push(this);
    }
    static createFromPool(width, height, format, depthStencilFormat, mipmap, samples, depthTexture, sRGB) {
        return new RT({ width, height, colorFormats: [format], depthStencilFormat, depthTexture, sRGB });
    }
    static recoverToPool(rt) { if (!rt._inPool) { rt._inPool = true; recovered.push(rt); } }
    get isMRT() { return false; }
    get colorAttachmentCount() { return this._colors.length; }
    _getRenderTarget(primary) { return primary && this.isMRT ? this.primaryBinding : this._renderTarget; }
    getColorTexture(index) { return this._colors[index]; }
}
class MRT extends RT { static createFromPool(options) { return new MRT(options); } get isMRT() { return true; } }
class Vec {
    constructor(x = 0, y = 0, z = 0, w = 0) { this.setValue(x, y, z, w); }
    setValue(x, y, z, w) { Object.assign(this, { x, y, z, w }); }
    cloneTo(target) { Object.assign(target, this); }
}
Vec.TEMP = new Vec();
class Viewport { set(...values) { this.values = values; } }
Viewport.TEMP = new Viewport();
const RenderContext3D = { _instance: { configPipeLineMode: 'Forward' }, clientHeight: 8 };
const cameraFile = 'd3/core/Camera.ts';
const extracted = methods(cameraFile, 'Camera', name => name && (/MRT|OpaqueAuxiliary|postprocess/i.test(name) || ['msaa', '_createInternalRenderTexture', '_needInternalRenderTexture', '_getRenderTextureFormat', '_needRenderGamma', '_getRenderTexture', '_aftRenderMainPass', 'canblitDepth', 'enableBlitDepth', 'depthTexture', 'render'].includes(name)), {
    RenderTexture: RT, RenderTextureMRT: MRT, RenderTargetFormat: RF, TextureFormat, RenderCapable, RenderParams, Color, Stat, LayaGL, RenderContext3D,
    FilterMode: { Bilinear: 1 }, Config3D: { _multiLighting: false }, Cluster: {}
});
const Camera = extracted.Camera;
const DepthPass = actual('d3/depthMap/DepthPass.ts', { Camera, BaseTexture: class {}, RenderTexture: RT, DepthTextureMode,
    RenderTargetFormat: RF, Shader3D: {}, Vector4: Vec }).DepthPass;
DepthPass.DEPTHTEXTURE = 'depth';
Camera.depthPass = new DepthPass();
const PostProcessEffect = actual('d3/core/render/postProcessBase/PostProcessEffect.ts').PostProcessEffect;
class Command { static _screenShader = { getSubShaderAt() { return {}; } }; recover() {} }
class RenderElement {
    constructor() { this._renderElementOBJ = {}; }
    setTransform() {} setGeometry() {} destroy() {}
}
const Pool = { createPool(Type) { const values = []; return { take: () => values.pop() || new Type(), recover: value => values.push(value) }; } };
const Blit = actual('d3/core/render/command/BlitScreenQuadCMD.ts', { Command, Pool, RenderElement,
    Laya3DRender: { Render3DPassFactory: { createBlitQuadCMDData: () => ({}) }, Render3DModuleDataFactory: { createTransform: () => ({}) } },
    Vector4: Vec, Viewport, RenderContext3D, LayaGL, ScreenQuad: { InvertInstance: {}, instance: {} }
}).BlitScreenQuadCMD;
const CommandBuffer = actual('d3/core/render/command/CommandBuffer.ts', { BlitScreenQuadCMD: Blit, RenderContext3D, LayaGL }).CommandBuffer;
const PostProcessRenderContext = actual('d3/core/render/postProcessBase/PostProcessRenderContext.ts', { RenderTexture: RT }).PostProcessRenderContext;
const PostProcess = actual('d3/core/render/postProcessBase/PostProcess.ts', {
    PostProcessRenderContext, CommandBuffer, LayaGL, RenderTexture: RT, RenderTargetFormat: RF, DepthTextureMode,
    ColorGradEffect: class {}, Texture2D: { whiteTexture: {} }
}).PostProcess;
function camera() {
    const c = new Camera();
    Object.assign(c, { _internalRenderTexture: null, _cacheDepthTexture: null, _cacheDepth: false, _canBlitDepth: false, _msaa: false, _enableHDR: false, enableBuiltInRenderTexture: false, postProcess: null, depthTextureFormat: RF.DEPTH_16, renderTarget: null,
        viewport: { x: 0, y: 0, width: 4, height: 4 }, normalizedViewport: { x: 0, y: 0, width: 1, height: 1 }, _offScreenRenderTexture: null,
        clearFlag: 0, clearColor: new Color(.1, .2, .3, 1), _linearClearColor: new Color(.1, .2, .3, 1),
        _cameraEventCommandBuffer: {}, opaquePass: false,
        scene: { _ShadowMapupdateFrequency: 1, skyRenderer: {} }, _screenOffsetScale: new Vec(), nearPlane: .1, farPlane: 100,
        _shaderValues: { values: new Map(), setTexture(name, value) { this.values.set(name, value); }, getTexture(name) { return this.values.get(name); }, setVector() {} }
    });
    return c;
}
function requirement(name, index = 0, format = RF.R16G16B16A16, clearColor) { return { index, name, format, clearColor }; }
function effect(requirements) {
    return new (class extends PostProcessEffect {
        constructor() { super(); this._singleton = false; this.requirements = requirements; }
        getCameraOpaqueMRTRequirements() { return this.requirements; }
    })();
}
function attach(c, ...effects) { const pp = new PostProcess(); for (const e of effects) pp.addEffect(e); c.postProcess = pp; return pp; }
const reports = [];
function test(name, run) {
    try { run(); reports.push({ name, result: 'PASS' }); }
    catch (e) { reports.push({ name, result: 'FAIL', message: String(e.stack || e) }); }
    finally { Stat.enablePostprocess = true; Stat.enablemsaa = true; }
}

function resolve(c) {
    c._updateOpaqueMRTRequirements(c.postProcess?._collectCameraMRTRequirements(Stat.enablePostprocess) || null);
    return c.effectiveOpaqueMRT;
}
function layout(c) { return c.effectiveOpaqueMRT?.auxiliaryAttachments || []; }
function allocate(c) { return c._internalRenderTexture = c._createInternalRenderTexture(c.viewport.width, c.viewport.height); }
function renderWithNoDraw(c) {
    Object.assign(c, { _prepareCameraToRender() {}, _applyViewProject() {}, _contextApply() {}, _preRenderMainPass() {} });
    Object.assign(c.scene, { _setCullCamera() {}, sceneRenderableManager: { _sceneManagerOBJ: {} }, _componentDriver: { callPreRender() {}, callPostRender() {} } });
    c._Render3DProcess = { fowardRender() {} };
    c.render(c.scene);
    return c._internalRenderTexture;
}
function channels(color) { return [color.r, color.g, color.b, color.a]; }
function named(name, format = RF.R16G16B16A16, clearColor) { return { name, format, clearColor }; }

test('默认效果无需求；active、后处理开关和全局开关控制自动附件', () => {
    assert.equal(new PostProcessEffect().getCameraOpaqueMRTRequirements(), null);
    const c = camera(), e = effect([requirement('normal')]), pp = attach(c, e);
    assert.equal(resolve(c).auxiliaryAttachments.length, 1);
    e.active = false; assert.equal(resolve(c), null);
    e.active = true; pp.enable = false; assert.equal(resolve(c), null);
    pp.enable = true; Stat.enablePostprocess = false; assert.equal(resolve(c), null);
    Stat.enablePostprocess = true; assert.equal(resolve(c).auxiliaryAttachments.length, 1);
});
test('每帧查询动态参数；删除和清空效果撤掉自动部分、保留手动声明', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    const e = effect([requirement('velocity', 1, RF.R16G16)]), pp = attach(c, e);
    assert.equal(resolve(c).auxiliaryAttachments.length, 2);
    e.requirements = [requirement('motion', 1, RF.R16G16)];
    resolve(c); const r = allocate(c);
    assert.equal(c.getOpaqueAuxiliaryTexture('motion'), r.getColorTexture(2));
    assert.equal(c.getOpaqueAuxiliaryTexture('velocity'), null);
    pp.removeEffect(e); assert.equal(resolve(c).auxiliaryAttachments.length, 1);
    assert.equal(c.opaqueMRT.auxiliaryAttachments[0].name, 'normal');
    pp.addEffect(effect([requirement('velocity', 1, RF.R16G16)]));
    resolve(c); pp.clearEffect(); assert.equal(resolve(c).auxiliaryAttachments.length, 1);
});
test('同 index/name/格式/清除值可共享，不同效果顺序不改变布局', () => {
    const c = camera(), normal = effect([requirement('normal')]), velocity = effect([requirement('velocity', 1, RF.R16G16)]);
    const duplicate = effect([requirement('normal', 0, RF.R16G16B16A16, new Color(0, 0, 0, 0))]);
    const pp = attach(c, velocity, duplicate, normal);
    resolve(c); assert.deepEqual(layout(c).map(x => [x.name, x.format]), [['normal', RF.R16G16B16A16], ['velocity', RF.R16G16]]);
    pp.effects = [normal, velocity, duplicate]; resolve(c);
    assert.deepEqual(layout(c).map(x => x.name), ['normal', 'velocity']);
});
test('不同 name 即使同格式同清除值也不能共享同一槽位', () => {
    const c = camera(); attach(c, effect([requirement('normal')]), effect([requirement('velocity')]));
    assert.throws(() => resolve(c), /name conflicts/); assert.equal(c.effectiveOpaqueMRT, null);
});
test('同 name 不可占不同槽；同槽格式或清除值冲突在分配前拒绝', () => {
    for (const second of [requirement('normal', 1), requirement('normal', 0, RF.R16), requirement('normal', 0, RF.R16G16B16A16, new Color(1, 0, 0, 0))]) {
        const c = camera(); attach(c, effect([requirement('normal'), second]));
        const before = allocated.length; assert.throws(() => resolve(c), /maps to multiple indices|format or clear value conflicts/); assert.equal(allocated.length, before);
    }
});
test('撤回低位需求后保留空槽，不创建占位纹理或压缩剩余 location', () => {
    const c = camera(), normal = effect([requirement('normal')]), velocity = effect([requirement('velocity', 1, RF.R16G16)]);
    attach(c, normal, velocity); resolve(c);
    normal.active = false; resolve(c);
    assert.equal(layout(c)[0], null); assert.equal(layout(c)[1].name, 'velocity');
    const sparse = allocate(c);
    assert.equal(sparse.getColorTexture(1), null);
    assert.equal(c.getOpaqueAuxiliaryTexture(0), null);
    assert.equal(c.getOpaqueAuxiliaryTexture('velocity'), sparse.getColorTexture(2));
    normal.active = true; resolve(c); assert.equal(layout(c)[1].name, 'velocity');
});
test('手动无名槽接受兼容自动别名，按 name 和 index 读取同一附件', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [{ format: RF.R16G16B16A16 }] };
    const e = effect([requirement('normal')]); attach(c, e); resolve(c); const r = allocate(c);
    assert.equal(c.opaqueMRT.auxiliaryAttachments[0].name, undefined);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), r.getColorTexture(1));
    assert.equal(c.getOpaqueAuxiliaryTexture(0), r.getColorTexture(1));
    assert.equal(c.getOpaqueAuxiliaryTexture('missing'), null);
    e.active = false; resolve(c); assert.equal(layout(c).length, 1);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), null);
});
test('手动具名槽与自动需求不兼容时不覆盖手动值', () => {
    for (const request of [requirement('velocity'), requirement('normal', 0, RF.R16), requirement('normal', 0, RF.R16G16B16A16, new Color(.5, 0, 0, 0))]) {
        const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
        const manual = c.opaqueMRT, effective = c.effectiveOpaqueMRT;
        attach(c, effect([request])); assert.throws(() => resolve(c), /name conflicts|format or clear value conflicts/);
        assert.equal(c.opaqueMRT, manual); assert.equal(c.effectiveOpaqueMRT, effective);
    }
});
test('clearColor 缺省规范化为透明黑，输入颜色修改不改变已提交布局', () => {
    const c = camera(), value = new Color(0, 0, 0, 0);
    attach(c, effect([requirement('normal')]), effect([requirement('normal', 0, RF.R16G16B16A16, value)]));
    resolve(c); assert.deepEqual(channels(layout(c)[0].clearColor), [0, 0, 0, 0]);
    value.r = 1; assert.deepEqual(channels(layout(c)[0].clearColor), [0, 0, 0, 0]);
});
test('别名变化不更换同格式 GPU 资源组，自动关闭归还完整 owner', () => {
    const c = camera(), e = effect([requirement('normal')]); attach(c, e); resolve(c); const r = allocate(c);
    e.requirements = [requirement('velocity')]; resolve(c); assert.equal(allocate(c), r);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), null); assert.equal(c.getOpaqueAuxiliaryTexture('velocity'), r.getColorTexture(1));
    e.active = false; resolve(c); assert.equal(c.effectiveOpaqueMRT, null); assert.equal(r._inPool, true); assert.equal(c.opaqueMRT, null);
});

test('Camera.render 真实入口先收集效果需求，再决定并分配内部 MRT', () => {
    const c = camera(), seen = [], e = effect([requirement('normal')]); attach(c, e);
    let expectedMRT = true;
    const originalGet = e.getCameraOpaqueMRTRequirements;
    e.getCameraOpaqueMRTRequirements = function () { seen.push('requirements'); assert.equal(c._internalRenderTexture, null); return originalGet.call(this); };
    const create = c._createInternalRenderTexture;
    c._createInternalRenderTexture = function (...args) { seen.push('allocate'); assert.equal(this.opaqueMRT, null); assert.equal(this.effectiveOpaqueMRT.auxiliaryAttachments[0].name, 'normal'); return create.apply(this, args); };
    c._Render3DProcess = { fowardRender() { seen.push('draw'); if (expectedMRT) assert.ok(c._internalRenderTexture instanceof MRT); else assert.equal(c._internalRenderTexture, null); } };
    Object.assign(c, { _prepareCameraToRender() {}, _applyViewProject() {}, _contextApply() {}, _preRenderMainPass() {} });
    Object.assign(c.scene, { _setCullCamera() {}, sceneRenderableManager: { _sceneManagerOBJ: {} }, _componentDriver: { callPreRender() {}, callPostRender() {} } });
    c.render(c.scene); assert.deepEqual(seen, ['requirements', 'allocate', 'draw']);
    const owner = c._internalRenderTexture;
    seen.length = 0; expectedMRT = false; e.active = false; c.render(c.scene);
    assert.deepEqual(seen, ['draw']); assert.equal(c.effectiveOpaqueMRT, null); assert.equal(owner._inPool, true);
});

test('中途启用时只跳过缺少附件的 MRT 效果，关闭/移除效果立即生效', () => {
    const c = camera(), a = effect([requirement('normal')]), b = effect([requirement('velocity', 1, RF.R16G16)]), calls = [];
    a.render = () => calls.push('a'); b.render = () => calls.push('b'); b.active = false;
    const pp = attach(c, a, b); resolve(c); allocate(c); b.active = true; pp._render(c);
    assert.deepEqual(calls, ['a']); resolve(c); allocate(c); pp._render(c); assert.deepEqual(calls, ['a', 'a', 'b']);
    calls.length = 0; resolve(c); a.active = false; pp.removeEffect(b); pp._render(c); assert.deepEqual(calls, []);
});

test('PP 关闭后自动部分撤除，手动 MRT 仍可供本帧使用', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    const pp = attach(c, effect([requirement('velocity', 1, RF.R16G16)])); resolve(c); const old = allocate(c);
    pp.enable = false; resolve(c); assert.equal(layout(c).length, 1); assert.equal(c.opaqueMRT.auxiliaryAttachments.length, 1);
    assert.equal(old._inPool, true); assert.equal(allocate(c)._colors.length, 2);
});
test('停用/移除效果或关闭 PP 后，render 前修改手动格式与 name 不受旧需求阻挡', () => {
    for (const action of ['deactivate', 'remove', 'disable', 'global']) {
        const c = camera(), e = effect([requirement('normal')]), pp = attach(c, e);
        resolve(c); const old = allocate(c);
        if (action === 'deactivate') e.active = false;
        if (action === 'remove') pp.removeEffect(e);
        if (action === 'disable') pp.enable = false;
        if (action === 'global') Stat.enablePostprocess = false;
        c.opaqueMRT = { auxiliaryAttachments: [named('velocity', RF.R16G16)] };
        assert.equal(c.opaqueMRT.auxiliaryAttachments[0].name, 'velocity');
        assert.equal(c.effectiveOpaqueMRT.auxiliaryAttachments[0].format, RF.R16G16B16A16);
        assert.equal(old._inPool, false);
        resolve(c); assert.equal(c.effectiveOpaqueMRT.auxiliaryAttachments[0].name, 'velocity');
        assert.equal(old._inPool, true);
        Stat.enablePostprocess = true;
    }
});

const Process = methods('RenderDriver/RenderModuleData/WebModuleData/3D/WebForwardAddRP/WebRender3DProcess.ts', 'WebRender3DProcess', name => name === '_initRenderPass', {
    Camera, CameraClearFlags: extracted.CameraClearFlags, CameraEventFlags: extracted.CameraEventFlags,
    RenderTargetFormat: RF, RenderClearFlag, Vector4: Vec, viewport: new Viewport(), offsetScale: new Vec(), RenderContext3D, Stat, LayaGL, Scene3D: { _updateMark: 0 }, ShadowMode: { None: 0 }
}).WebRender3DProcess;
function processor() {
    const noop = () => {};
    const process = new Process();
    const mainRenderpass = { setCameraCullInfo: noop, setViewPort: noop, setScissor: noop, setBeforeSkyboxCmds: noop, setBeforeForwardCmds: noop, setBeforeTransparentCmds: noop, blitOpaqueBuffer: new CommandBuffer() };
    process._renderPass = { mainRenderpass, setBeforeImageEffect: noop, setAfterEventCmd: noop, finalize: new CommandBuffer() };
    return process;
}
function renderWithPostProcess(c, beforeRender = () => {}) {
    const process = processor();
    c.enableBuiltInRenderTexture = true;
    Object.assign(c, { _prepareCameraToRender() {}, _applyViewProject() {}, _contextApply() {}, _preRenderMainPass() {} });
    Object.assign(c.scene, { _setCullCamera() {}, sceneRenderableManager: { _sceneManagerOBJ: {} }, _componentDriver: { callPreRender: beforeRender, callPostRender() {} } });
    c._Render3DProcess = { fowardRender() { process._initRenderPass(c, { preDrawUniformMaps: new Set() }); } };
    c.render(c.scene);
    return process;
}
function blit(c, source, destination, color0Only, method = 'blitScreenTriangle') {
    const command = new CommandBuffer();
    command._camera = c;
    if (method === 'blitScreenQuadByMaterial') command[method](source, destination, null, null, 0, color0Only);
    else command[method](source, destination, null, null, null, 0, color0Only);
    command._apply();
    return command._renderCMDs[0];
}
test('Process opaque 用完整组；默认 Blit 由上层选 color0，显式目标默认完整组', () => {
    const c = camera(); attach(c, effect([requirement('normal')])); const r = renderWithNoDraw(c);
    assert.equal(c.opaqueMRT, null); assert.ok(c.effectiveOpaqueMRT);
    const process = processor(); process._initRenderPass(c, { preDrawUniformMaps: new Set() });
    assert.equal(process._renderPass.mainRenderpass.opaqueMRTTarget, r._renderTarget);
    assert.equal(process._renderPass.mainRenderpass.destTarget, r.primaryBinding);
    assert.equal(blit(c, r, null).dest, r.primaryBinding);
    assert.equal(blit(c, r, r).dest, r._renderTarget);
    assert.equal(blit(c, r, r, true).dest, r.primaryBinding);
    const other = new MRT({ width: 4, height: 4, colorFormats: [RF.R8G8B8A8, RF.R16] });
    assert.equal(blit(c, r, other).dest, other._renderTarget);
});
test('普通相机没有需求时 Process/Blit 保持原单目标绑定', () => {
    const c = camera(); c.enableBuiltInRenderTexture = true; const r = renderWithNoDraw(c);
    const process = processor(); process._initRenderPass(c, { preDrawUniformMaps: new Set() });
    assert.equal(process._renderPass.mainRenderpass.opaqueMRTTarget, null);
    assert.equal(process._renderPass.mainRenderpass.destTarget, r._renderTarget);
    assert.equal(blit(c, r, null).dest, r._renderTarget);
});
test('分配后替换 PP 只跳过缺少附件的消费者，普通效果当帧执行', () => {
    const c = camera(), a = effect([requirement('normal')]), b = effect([requirement('velocity')]);
    attach(c, a); renderWithNoDraw(c);
    let calls = 0, ordinaryCalls = 0; b.render = () => calls++;
    const ordinary = effect(null); ordinary.render = () => ordinaryCalls++;
    attach(c, b, ordinary); const process = processor(); process._initRenderPass(c, { preDrawUniformMaps: new Set() });
    assert.equal(process._renderPass.enablePostProcess, true); assert.equal(calls, 0); assert.equal(ordinaryCalls, 1);
    renderWithNoDraw(c); process._initRenderPass(c, { preDrawUniformMaps: new Set() });
    assert.equal(process._renderPass.enablePostProcess, true); assert.equal(calls, 1); assert.equal(ordinaryCalls, 2);
});
test('上一帧跳过的 PP 重新切入时，按当前实际附件决定是否执行', () => {
    const c = camera(); c.enableBuiltInRenderTexture = true;
    const b = effect([requirement('normal')]), ppB = attach(c, b), process = processor();
    let calls = 0; b.render = () => calls++;
    Object.assign(c, { _prepareCameraToRender() {}, _applyViewProject() {}, _contextApply() {}, _preRenderMainPass() {} });
    Object.assign(c.scene, { _setCullCamera() {}, sceneRenderableManager: { _sceneManagerOBJ: {} }, _componentDriver: { callPreRender() { ppB.enable = false; }, callPostRender() {} } });
    c._Render3DProcess = { fowardRender() { process._initRenderPass(c, { preDrawUniformMaps: new Set() }); } };
    c.render(c.scene); assert.equal(calls, 0); assert.ok(c.effectiveOpaqueMRT);
    attach(c, effect([]));
    c.scene._componentDriver.callPreRender = () => { c.postProcess = ppB; ppB.enable = true; };
    c.render(c.scene); assert.equal(c.effectiveOpaqueMRT, null);
    assert.equal(calls, 0); assert.equal(process._renderPass.enablePostProcess, true);
});

test('普通效果在 preRender 启用后仍当帧执行，不要求 MRT', () => {
    const c = camera(), ordinary = effect(null), trace = [];
    ordinary.active = false; ordinary.render = context => trace.push(['render', context.camera._internalRenderTexture.isMRT]);
    attach(c, ordinary);
    renderWithPostProcess(c, () => { trace.push(['enable', c._internalRenderTexture.isMRT]); ordinary.active = true; });
    assert.deepEqual(trace, [['enable', false], ['render', false]]);
    assert.equal(c.effectiveOpaqueMRT, null);
});

test('普通新 PP 在 preRender 替换后当帧执行', () => {
    const c = camera(), ordinary = effect([]); attach(c);
    let calls = 0; ordinary.render = () => calls++;
    renderWithPostProcess(c, () => attach(c, ordinary));
    assert.equal(calls, 1); assert.equal(c.effectiveOpaqueMRT, null);
});

test('opaqueMRT setter 只保存声明，不冻结普通 PP 的执行集合', () => {
    const c = camera(), ordinary = effect(null), pp = attach(c, ordinary);
    c.enableBuiltInRenderTexture = true;
    let calls = 0; ordinary.render = () => calls++; ordinary.active = false;
    c.opaqueMRT = null;
    ordinary.active = true; allocate(c); pp._render(c);
    assert.equal(calls, 1); assert.equal(c._internalRenderTexture.isMRT, false);
});

test('共享 PP 时另一个相机的 setter 不影响当前相机效果执行', () => {
    for (const usesMRT of [false, true]) {
        const a = camera(), b = camera(), e = effect(usesMRT ? [requirement('normal')] : null);
        const pp = attach(b, e); a.postProcess = pp;
        let calls = 0; e.render = context => { assert.equal(context.camera, b); calls++; };
        if (!usesMRT) e.active = false;
        renderWithPostProcess(b, () => { e.active = true; a.opaqueMRT = null; });
        assert.equal(calls, 1); assert.equal(b._internalRenderTexture.isMRT, usesMRT);
        assert.equal(a._internalRenderTexture, null);
    }
});

test('中途启用 MRT 效果时，已有兼容命名附件即可当帧执行', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    const e = effect([requirement('normal')]); e.active = false;
    let seen = null; e.render = context => { seen = context.camera.getOpaqueAuxiliaryTexture('normal'); };
    attach(c, e); renderWithPostProcess(c, () => { e.active = true; });
    assert.equal(seen, c._opaqueMRT.getColorTexture(1));
});

test('中途替换的 PP 若附件兼容可立即执行，无需准备身份', () => {
    const c = camera(); attach(c, effect([requirement('normal')]));
    const e = effect([requirement('normal')]); let calls = 0; e.render = () => calls++;
    renderWithPostProcess(c, () => attach(c, e));
    assert.equal(calls, 1);
});

test('无名手动槽不能冒充 name 查询已就绪，下次合并别名后复用同一组', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [{ format: RF.R16G16B16A16 }] };
    const e = effect([requirement('normal')]); e.active = false;
    let calls = 0; e.render = () => calls++;
    attach(c, e); renderWithPostProcess(c, () => { e.active = true; });
    const owner = c._opaqueMRT;
    assert.equal(calls, 0); assert.equal(c.getOpaqueAuxiliaryTexture('normal'), null);
    renderWithPostProcess(c);
    assert.equal(calls, 1); assert.equal(c._opaqueMRT, owner);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), owner.getColorTexture(1));
});

test('运行时兼容检查只读布局及实际当前附件，不采信旧 owner', () => {
    const c = camera(), request = requirement('normal'); attach(c, effect([request])); resolve(c);
    assert.equal(c._hasOpaqueMRTRequirements(null), true); assert.equal(c._hasOpaqueMRTRequirements([]), true);
    assert.equal(c._hasOpaqueMRTRequirements([request]), false);
    const r = allocate(c), prior = c.effectiveOpaqueMRT, count = allocated.length;
    assert.equal(c._hasOpaqueMRTRequirements([request]), true);
    for (const bad of [requirement('other'), requirement('normal', 1), requirement('normal', 0, RF.R16), requirement('normal', 0, RF.R16G16B16A16, new Color(1, 0, 0, 0)), { ...request, index: -1 }])
        assert.equal(c._hasOpaqueMRTRequirements([bad]), false);
    c._internalRenderTexture = null; assert.equal(c._hasOpaqueMRTRequirements([request]), false); c._internalRenderTexture = r;
    r._inPool = true; assert.equal(c._hasOpaqueMRTRequirements([request]), false); r._inPool = false;
    r.destroyed = true; assert.equal(c._hasOpaqueMRTRequirements([request]), false); r.destroyed = false;
    const texture = r._colors[1]; r._colors[1] = null; assert.equal(c._hasOpaqueMRTRequirements([request]), false); r._colors[1] = texture;
    assert.equal(c.effectiveOpaqueMRT, prior); assert.equal(allocated.length, count);
});

test('中途加入的稀疏需求声明不执行，下一次入口校验仍报错', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    const sparse = effect(new Array(1)), ordinary = effect(null);
    sparse.active = false;
    let invalidCalls = 0, ordinaryCalls = 0;
    sparse.render = () => invalidCalls++; ordinary.render = () => ordinaryCalls++;
    attach(c, sparse, ordinary);
    renderWithPostProcess(c, () => { sparse.active = true; });
    assert.equal(invalidCalls, 0); assert.equal(ordinaryCalls, 1);
    assert.throws(() => renderWithPostProcess(c), /indices must be non-negative integers/);
    assert.equal(invalidCalls, 0);
});

test('异常帧之后切回旧 PP，仅按新帧附件判定，不保留执行快照', () => {
    const c = camera(), e = effect([requirement('normal')]), pp = attach(c, e);
    let calls = 0; e.render = () => calls++;
    assert.throws(() => renderWithPostProcess(c, () => { throw new Error('preRender failure'); }), /preRender failure/);
    attach(c, effect(null));
    renderWithPostProcess(c, () => { c.postProcess = pp; });
    assert.equal(calls, 0); assert.equal(c.effectiveOpaqueMRT, null);
    renderWithPostProcess(c); assert.equal(calls, 1);
});

test('关闭自动 MRT 时深度双组完整归还并解除真正的 shader 借用', () => {
    for (const action of ['deactivate', 'remove', 'disable', 'global', 'replace']) {
        const c = camera(), e = effect([requirement('normal')]), pp = attach(c, e);
        c._cacheDepth = c._canBlitDepth = true;
        resolve(c); const cached = allocate(c); c._aftRenderMainPass(); const current = allocate(c);
        assert.notEqual(current, cached);
        Camera.depthPass.getTarget(c, DepthTextureMode.Depth, c.depthTextureFormat);
        Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, c);
        assert.equal(c._shaderValues.getTexture('depth'), cached.depthStencilTexture);
        if (action === 'deactivate') e.active = false;
        if (action === 'remove') pp.removeEffect(e);
        if (action === 'disable') pp.enable = false;
        if (action === 'global') Stat.enablePostprocess = false;
        if (action === 'replace') c.postProcess = new PostProcess();
        resolve(c);
        assert.equal(cached._inPool, true, action); assert.equal(current._inPool, true, action);
        assert.equal(c._cacheDepthTexture, null, action); assert.equal(c._opaqueMRT, null, action);
        assert.equal(c.depthTexture, null, action); assert.equal(c._shaderValues.getTexture('depth'), null, action);
        Stat.enablePostprocess = true;
    }
});

test('CommandBuffer 三种 Blit 入口均显式传递目标选择，池复用不遗留 color0 模式', () => {
    const c = camera(); attach(c, effect([requirement('normal')])); resolve(c); const r = allocate(c);
    for (const method of ['blitScreenQuad', 'blitScreenTriangle', 'blitScreenQuadByMaterial']) {
        assert.equal(blit(c, r, null, undefined, method).dest, r.primaryBinding);
        assert.equal(blit(c, r, r, undefined, method).dest, r._renderTarget);
        assert.equal(blit(c, r, r, true, method).dest, r.primaryBinding);
        assert.equal(blit(c, r, null, false, method).dest, r._renderTarget);
    }
    const command = new CommandBuffer(); command._camera = c;
    const first = Blit.create(r, r, null, null, null, 0, 0, command, true); first.run(); assert.equal(first.getRenderCMD().dest, r.primaryBinding); first.recover();
    const reused = Blit.create(r, r, null, null, null, 0, 0, command); reused.run(); assert.equal(reused.getRenderCMD().dest, r._renderTarget);
});

test('PP 显式写回相机 color0，完整 MRT 目标的普通 Blit 仍可使用全部附件', () => {
    const c = camera(); const pp = attach(c, effect([requirement('normal')])); resolve(c); const r = allocate(c);
    pp._render(c); pp._context.command._apply();
    assert.ok(pp._context.command._renderCMDs.some(data => data.dest === r.primaryBinding));
    assert.equal(pp._context.command._renderCMDs.some(data => data.dest === r._renderTarget), false);
    assert.equal(blit(c, r, r).dest, r._renderTarget);
});

const ShaderMRT = actual('RenderEngine/RenderShader/ShaderMRT.ts').ShaderMRT;
test('需求/name/效果顺序不改 shader location；数量宏代表槽位跨度', () => {
    const c = camera(), a = effect([requirement('normal')]), b = effect([requirement('velocity', 1, RF.R16G16)]), pp = attach(c, b, a);
    const shader = 'layout(location = 0) out vec4 mainColor;\nlayout(location = 1) out vec4 normalData;\nlayout(location = 2) out vec4 velocityData;\nvoid main(){mainColor=vec4(1.0);normalData=vec4(2.0);velocityData=vec4(3.0);}';
    resolve(c); const count = layout(c).length + 1; const generated = ShaderMRT.prepare(shader, count);
    assert.equal(ShaderMRT.getTargetCount(['LAYA_MRT', 'LAYA_MRT_TARGET_' + count]), 3);
    pp.effects = [a, b]; resolve(c); assert.equal(ShaderMRT.prepare(shader, layout(c).length + 1), generated);
    for (const [slot, variable] of [[0, 'mainColor'], [1, 'normalData'], [2, 'velocityData']]) assert.ok(generated.includes('layout(location = ' + slot + ') out vec4 ' + variable + ';'));
    assert.equal(generated.includes('LAYA_MRT_TARGET_normal'), false);
    b.active = false; resolve(c); const shorter = ShaderMRT.prepare(shader, layout(c).length + 1);
    assert.ok(shorter.includes('layout(location = 2) out vec4 velocityData;'));
});

test('后处理仅请求材质参数时直接生成0/3稀疏布局，关闭效果回普通目标', () => {
    const c = camera(), surface = effect([requirement('surface', 2, RF.R8G8B8A8)]);
    attach(c, surface); resolve(c);
    assert.deepEqual(layout(c).slice(0, 2), [null, null]);
    assert.equal(layout(c)[2].name, 'surface');
    const owner = allocate(c);
    assert.deepEqual(owner.colorFormats, [RF.R8G8B8A8, null, null, RF.R8G8B8A8]);
    assert.equal(c.getOpaqueAuxiliaryTexture('surface'), owner.getColorTexture(3));
    assert.equal(c.getOpaqueAuxiliaryTexture(0), null);
    assert.equal(c._hasOpaqueMRTRequirements(surface.requirements), true);
    assert.deepEqual(c._getOpaqueMRTClearColors(null).slice(0, 3), [null, null, null]);
    surface.active = false; resolve(c);
    assert.equal(c.effectiveOpaqueMRT, null); assert.equal(owner._inPool, true);
});
test('手动稀疏附件保留，自动需求只填空槽，撤回时不移动手动位置', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [null, null, named('surface', RF.R8G8B8A8)] };
    const normal = effect([requirement('normal')]); attach(c, normal); resolve(c);
    assert.equal(layout(c)[0].name, 'normal'); assert.equal(layout(c)[1], null); assert.equal(layout(c)[2].name, 'surface');
    normal.active = false; resolve(c);
    assert.deepEqual(layout(c).slice(0, 2), [null, null]); assert.equal(layout(c)[2].name, 'surface');
    assert.deepEqual(c.opaqueMRT.auxiliaryAttachments.slice(0, 2), [null, null]);
});

test('preRender 修改手动布局只保存新声明，当前整组保持到下次 render', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    assert.equal(c.effectiveOpaqueMRT, null);
    let current;
    renderWithPostProcess(c, () => {
        current = c._internalRenderTexture;
        const count = allocated.length;
        c.opaqueMRT = { auxiliaryAttachments: [null, null, named('surface', RF.R8G8B8A8)] };
        assert.equal(c.opaqueMRT.auxiliaryAttachments[2].name, 'surface');
        assert.equal(c.effectiveOpaqueMRT.auxiliaryAttachments[0].name, 'normal');
        assert.equal(c._internalRenderTexture, current);
        assert.equal(c.getOpaqueAuxiliaryTexture('normal'), current.getColorTexture(1));
        assert.equal(current._inPool, false);
        assert.equal(allocated.length, count);
    });
    assert.equal(c._internalRenderTexture, current);
    assert.equal(current._inPool, false);
    renderWithPostProcess(c);
    assert.equal(current._inPool, true);
    assert.deepEqual(c._internalRenderTexture.colorFormats, [RF.R8G8B8A8, null, null, RF.R8G8B8A8]);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), null);
    assert.equal(c.getOpaqueAuxiliaryTexture('surface'), c._internalRenderTexture.getColorTexture(3));
});

test('preRender 撤回手动声明不释放当前附件，下次仍保留自动需求', () => {
    const c = camera(); c.opaqueMRT = { auxiliaryAttachments: [null, null, named('surface', RF.R8G8B8A8)] };
    attach(c, effect([requirement('normal')]));
    let current;
    renderWithPostProcess(c, () => {
        current = c._internalRenderTexture;
        c.opaqueMRT = null;
        assert.equal(c.effectiveOpaqueMRT.auxiliaryAttachments[2].name, 'surface');
        assert.equal(current._inPool, false);
    });
    renderWithPostProcess(c);
    assert.equal(current._inPool, true);
    assert.equal(c.opaqueMRT, null);
    assert.equal(c.effectiveOpaqueMRT.auxiliaryAttachments.length, 1);
    assert.equal(c.getOpaqueAuxiliaryTexture('normal'), c._internalRenderTexture.getColorTexture(1));
});

test('普通 RT 与 MRT 在 preRender 关闭深度缓存均不释放当前借用，下次准备统一回收', () => {
    for (const usesMRT of [false, true]) {
        const c = camera(); c.enableBuiltInRenderTexture = true;
        if (usesMRT) c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
        const before = allocated.length;
        c.enableBlitDepth = true;
        assert.equal(allocated.length, before);
        const cached = renderWithNoDraw(c);
        c._aftRenderMainPass();
        assert.equal(c._cacheDepthTexture, cached);
        let current;
        renderWithPostProcess(c, () => {
            current = c._internalRenderTexture;
            assert.notEqual(current, cached);
            Camera.depthPass.getTarget(c, DepthTextureMode.Depth, c.depthTextureFormat);
            Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, c);
            assert.equal(c._shaderValues.getTexture('depth'), cached.depthStencilTexture);
            const count = allocated.length;
            c.enableBlitDepth = false;
            assert.equal(c._internalRenderTexture, current);
            assert.equal(c._cacheDepthTexture, cached);
            assert.equal(current._inPool, false);
            assert.equal(cached._inPool, false);
            assert.equal(allocated.length, count);
        });
        c._aftRenderMainPass();
        renderWithNoDraw(c);
        assert.equal(cached._inPool, true);
        assert.equal(current._inPool, true);
        assert.equal(c._cacheDepthTexture, null);
        assert.equal(c._internalRenderTexture.depthStencilTexture, null);
        assert.equal(c._shaderValues.getTexture('depth'), null);
        assert.equal(c.depthTexture, null);
    }
});

test('普通 RT 与 MRT 在 preRender 开启深度缓存不重建当前目标，下次按新格式准备', () => {
    for (const usesMRT of [false, true]) {
        const c = camera(); c.enableBuiltInRenderTexture = true;
        if (usesMRT) c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
        let current;
        renderWithPostProcess(c, () => {
            current = c._internalRenderTexture;
            const count = allocated.length;
            c.enableBlitDepth = true;
            assert.equal(c._internalRenderTexture, current);
            assert.equal(current.depthStencilTexture, null);
            assert.equal(current._inPool, false);
            assert.equal(allocated.length, count);
        });
        c._aftRenderMainPass();
        assert.equal(!!c.canblitDepth, false);
        const next = renderWithNoDraw(c);
        assert.notEqual(next, current);
        assert.ok(next.depthStencilTexture);
        if (usesMRT) assert.equal(current._inPool, true);
        c._aftRenderMainPass();
        assert.equal(current._inPool, true);
    }
});

test('手动 MRT 的待提交状态仍立即参与 MSAA 校验，撤回后下次回普通目标', () => {
    const c = camera(); c.enableBuiltInRenderTexture = true;
    c.msaa = true;
    assert.throws(() => { c.opaqueMRT = { auxiliaryAttachments: [named('normal')] }; }, /does not support MSAA/);
    assert.equal(c.opaqueMRT, null);
    c.msaa = false; c.opaqueMRT = { auxiliaryAttachments: [named('normal')] };
    assert.equal(c.effectiveOpaqueMRT, null);
    assert.throws(() => { c.msaa = true; }, /does not support MSAA/);
    const owner = renderWithNoDraw(c);
    c.opaqueMRT = null; c.msaa = true;
    assert.equal(owner._inPool, false);
    assert.ok(c.effectiveOpaqueMRT);
    const ordinary = renderWithNoDraw(c);
    assert.equal(owner._inPool, true);
    assert.equal(ordinary.isMRT, false);
    assert.equal(c.effectiveOpaqueMRT, null);
});

test('DepthPass 只回收自分配深度，借用相机缓存时只解除引用', () => {
    const pass = new DepthPass(), c = camera();
    pass.getTarget(c, DepthTextureMode.Depth, c.depthTextureFormat);
    const owned = c.depthTexture;
    pass._setupDepthModeShaderValue(DepthTextureMode.Depth, c);
    pass.cleanUp(c);
    assert.equal(owned._inPool, true);
    assert.equal(c.depthTexture, null);
    assert.equal(c._shaderValues.getTexture('depth'), null);
    c._cacheDepth = c._canBlitDepth = true;
    resolve(c); c.enableBuiltInRenderTexture = true;
    const cached = allocate(c); c._aftRenderMainPass(); allocate(c);
    pass.getTarget(c, DepthTextureMode.Depth, c.depthTextureFormat);
    assert.equal(c.depthTexture, cached.depthStencilTexture);
    pass._setupDepthModeShaderValue(DepthTextureMode.Depth, c);
    pass.cleanUp(c);
    assert.equal(cached._inPool, false);
    assert.equal(c.depthTexture, null);
    assert.equal(c._shaderValues.getTexture('depth'), null);
});

const result = { tests: reports.length, passed: reports.filter(x => x.result === 'PASS').length, reports, sourceHashes, limits: ['实际 TS 需求合并、相机入口、效果执行及 shader 字符串处理；GPU 分配和命令提交使用替身。'] };
const jsonIndex = process.argv.indexOf('--json');
if (jsonIndex !== -1) {
    assert.ok(process.argv[jsonIndex + 1], '--json requires a path');
    fs.writeFileSync(path.resolve(process.argv[jsonIndex + 1]), JSON.stringify(result, null, 2));
}
for (const report of reports) console.log(`${report.result}: ${report.name}${report.message ? '\n' + report.message : ''}`);
console.log(`MRT requirements: ${result.passed}/${result.tests} passed`);
if (result.passed !== result.tests) process.exitCode = 1;
