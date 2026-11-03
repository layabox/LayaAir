// CPU-only benchmark. Each version runs in its own process and JavaScript realm.
// Real commands, compiler, command stream and Web Graphics payload buffers are used.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {spawnSync, execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '../../src/layaAir/laya');
const pipeline = 'display/Scene2DSpecial/GraphicsRenderPipeline/';
const changedFiles = [pipeline + 'GraphicsCompileContext.ts', 'display/Scene2DSpecial/Mesh2DRender.ts'];
const gpuElementFile = 'RenderDriver/WebGPUDriver/2DRenderPass/WebGPURenderElement2D.ts';
const gpuStateFile = 'RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData.ts';
const baseline = process.env.BENCH_BASE || 'HEAD';
const baselineGPU = execFileSync('git', ['rev-parse', `${baseline}:src/layaAir/laya/RenderDriver/WebGPUDriver`], {encoding: 'utf8'}).trim();
const ts = process.argv.includes('--worker') ? require('typescript') : null;
const argument = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index < 0 ? fallback : process.argv[index + 1];
};

function worker() {
    const variant = argument('--worker', 'before');
    const cache = new Map(), mocks = new Map();
    const mock = (file, value) => mocks.set(path.resolve(root, file) + '.ts', value);
    function load(file) {
        const filename = path.resolve(root, file.endsWith('.ts') ? file : file + '.ts');
        if (mocks.has(filename)) return mocks.get(filename);
        if (cache.has(filename)) return cache.get(filename);
        const relative = path.relative(root, filename).replaceAll(path.sep, '/');
        const source = variant === 'before' && changedFiles.includes(relative)
            ? execFileSync('git', ['show', `${baseline}:src/layaAir/laya/${relative}`], {encoding: 'utf8'})
            : fs.readFileSync(filename, 'utf8');
        const code = ts.transpileModule(source, {
            compilerOptions: {target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS}
        }).outputText;
        const exports = {};
        cache.set(filename, exports);
        // All modules in a worker use the same realm, like a normal engine bundle.
        vm.runInThisContext(`(function(exports, require) {\n${code}\n})`, {filename})(exports,
            name => load(path.resolve(path.dirname(filename), name)));
        return exports;
    }
    mock('utils/Utils', {Utils: {}});
    mock('utils/Browser', {Browser: {}});
    mock('../Config', {Config: {uvClipMode: 'gpu'}});
    mock('webgl/shader/d2/Shader2D', {Shader2D: {}});
    mock('webgl/shader/d2/ShaderDefines2D', {ShaderDefines2D: {
        TYPE_KEY_DEFINE_SHIFT: 7, TYPEKEY_CUSTOM_MATERIAL: 16,
        DEFINE_BIT_TEXTURESHADER: 1024, DEFINE_BIT_VERTEXALPHA: 512,
        DEFINE_BIT_UV_CLIP_GPU: 16384, DEFINE_BIT_FILLTEXTURE: 128,
        DEFINE_BIT_GAMMATEXTURE: 256, DEFINE_BIT_USE_TEX_ARRAY: 4096,
        DEFINE_BIT_VERTEX_SIZE: 32768
    }});
    mock('RenderEngine/RenderShader/Shader3D', {Shader3D: {}, ShaderFeatureType: {D2_BaseRenderNode2D: 2}});
    mock('utils/ColorUtils', {ColorUtils: {create(value) { return {numColor: value ?? 0xffffffff}; }}});
    mock('webgl/utils/UVClippingUtils', {});
    mock('webgl/utils/TextureArrayRegistry2D', {TextureArrayRegistry2D: {resolve() { return null; }}});
    mock('display/mesh/MeshFactory', {});
    class Texture {
        static DEF_UV = [0, 0, 1, 0, 1, 1, 0, 1];
        constructor() {
            Object.assign(this, {id: 1, valid: true, width: 64, height: 64, sourceWidth: 64, sourceHeight: 64,
                offsetX: 0, offsetY: 0, uv: Texture.DEF_UV, bitmap: {id: 2, gammaCorrection: 1, dimension: 0, _texture: {}}});
        }
        on() {} off() {} _addReference() {} _removeReference() {}
    }
    mock('resource/Texture', {Texture});
    const GraphicsDefines = {GRAPHICS_MAX_VERTEX: 65536, GRAPHICS_INDEX_ARRAY_TYPE: Uint16Array};
    mock('webgl/shader/d2/GraphicsDefines', {GraphicsDefines});
    const LayaGL = {render2DRenderPassFactory: {
        createGraphicsCommandStreamDataHandle() { return {setGraphicsHandleUpdateBuffer() {}}; },
        createMesh2DRenderDataHandle() { return {destroy() {}}; },
        createRenderElement2D() { return {}; }
    }};
    mock('layagl/LayaGL', {LayaGL});
    const processor = {};
    mock('display/Render2DProcessor', {Render2DProcessor: processor});
    const {GraphicsCompileContext} = load(pipeline + 'GraphicsCompileContext');
    const {GraphicsCommandStreamMode} = load(pipeline + 'GraphicsCommandStreamMode');
    const {WebGraphicsOp2DFactory} = load('RenderDriver/RenderModuleData/WebModuleData/2D/WebGraphicsOp2DFactory');
    GraphicsDefines._factory = new WebGraphicsOp2DFactory();
    processor.compileContext = new GraphicsCompileContext();
    const command = name => load('display/cmd/' + name)[name];
    const vertices = new Float32Array([0, 0, 10, 0, 0, 10]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
    const indices = new Uint16Array([0, 1, 2]);
    const triangle = command('DrawTrianglesCmd').create(null, 0, 0, vertices, uvs, indices, null, 1, 0xffffffff, null);
    const rectangle = command('DrawRectCmd').create(0, 0, 10, 10, 0xffffffff, null, 0, false);
    const image = command('DrawImageCmd').create(new Texture(), 0, 0, 64, 64, null);
    const save = command('SaveCmd').create(), restore = command('RestoreCmd').create();
    const translate = command('TranslateCmd').create(3, 5);
    const owner = {_struct: {blendMode: 0}, _texture: null};
    const runner = {_textRender: null};
    const cases = [];
    for (const [name, pattern] of [
        ['triangles', [triangle]], ['rectangles', [rectangle]], ['images', [image]],
        ['mixed', [save, translate, triangle, rectangle, image, restore]]
    ]) {
        const cmds = Array.from({length: 768}, (_, index) => pattern[index % pattern.length]);
        const host = {owner, graphics: {cmds}, _syncGraphicsOwnerSize() {},
            _mapGraphicsOpDirtyFlags(value) { return value; }, _syncGraphicsOps() {}};
        const stream = new GraphicsCommandStreamMode(host, new ArrayBuffer(128));
        cases.push({name, units: cmds.length, run() { stream.rebuild(runner); }, check() {
            return stream.ops.reduce((sum, op) => sum + op.int32.length + op.commandIndex, 0);
        }});
    }
    mock('components/Component', {Component: class Component {}});
    mock('display/Sprite', {});
    mock('RenderDriver/DriverDesign/RenderDevice/ShaderData', {ShaderDataType: {}});
    mock('resource/Material', {});
    mock('resource/Mesh2D', {VertexMesh2D: {getMeshDefine(_mesh, out) { out.length = 0; }}});
    const {Mesh2DRender} = load('display/Scene2DSpecial/Mesh2DRender');
    function material() {
        return {refs: 0, owners: new Set(), _shaderValues: {}, _shader: {getSubShaderAt() { return null; }},
            checkType() { return true; }, _addReference() { this.refs++; }, _removeReference() { this.refs--; },
            _setOwner2DElement(element) { this.owners.add(element); }, _removeOwnerElement(element) { this.owners.delete(element); }};
    }
    const a = material(), b = material();
    Mesh2DRender.mesh2DDefaultMaterial = material();
    const renderer = new Mesh2DRender();
    renderer.owner = {repaint() {}};
    renderer._struct = {};
    renderer._spriteShaderData = {addDefine() {}, removeDefine() {}};
    renderer._sharedMesh = {_vertexBuffers: [], subMeshCount: 3, getSubMesh() { return null; }};
    renderer._changeMesh();
    renderer.sharedMaterial = a;
    let turn = 0;
    cases.push({name: 'material-same', units: 1, run() { renderer.sharedMaterial = a; }, check() { return a.refs; }});
    cases.push({name: 'material-change', units: 1, run() { renderer.sharedMaterial = (++turn & 1) ? b : a; }, check() { return a.refs + b.refs; }});
    // Include the unchanged, valid WebGPU preparation paths affected by state selection.
    const gpuFilename = path.join(root, gpuElementFile);
    const gpuSource = variant === 'before'
        ? execFileSync('git', ['-C', path.join(root, 'RenderDriver/WebGPUDriver'), 'show',
            `${baselineGPU}:2DRenderPass/WebGPURenderElement2D.ts`], {encoding: 'utf8'})
        : fs.readFileSync(gpuFilename, 'utf8');
    const gpuAst = ts.createSourceFile(gpuFilename, gpuSource, ts.ScriptTarget.Latest, true);
    const gpuClass = gpuAst.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'WebGPURenderElement2D');
    const gpuCode = ts.transpileModule(gpuClass.getText(gpuAst), {
        compilerOptions: {target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS}
    }).outputText;
    const gpuExports = {};
    new Function('exports', 'WebDefineDatas', 'Vector2', 'compareCahceFlag', 'Shader3D', 'RenderState', gpuCode)(
        gpuExports, class {}, load('maths/Vector2').Vector2, () => false, {CULL: 0}, {CULL_NONE: 0});
    // Use production accessors: plain properties conceal the actual cached-state getter cost.
    const stateSource = variant === 'before'
        ? execFileSync('git', ['-C', path.join(root, 'RenderDriver/WebGPUDriver'), 'show',
            `${baselineGPU}:RenderDevice/WebGPUShaderData.ts`], {encoding: 'utf8'})
        : fs.readFileSync(path.join(root, gpuStateFile), 'utf8');
    const stateAst = ts.createSourceFile(gpuStateFile, stateSource, ts.ScriptTarget.Latest, true);
    const stateClass = stateAst.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'WebGPUShaderData');
    const accessors = stateClass.members.filter(node => node.name
        && ['getInt', 'depthStencilStateKey', 'blendStateCache'].includes(node.name.getText(stateAst)));
    const stateCode = ts.transpileModule('export class GPUState {' + accessors.map(node => node.getText(stateAst)).join('\n') + '}', {
        compilerOptions: {target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS}
    }).outputText;
    const stateExports = {};
    new Function('exports', stateCode)(stateExports);
    const state = id => Object.assign(new stateExports.GPUState(), {_data: {0: 0},
        _needUpdateDepthStencilStateCache: false, _depthStencilStateKey: 0,
        _needUpdateBlendStateCache: false, _blendStateCache: {id}});
    for (const spriteState of [true, false]) {
        const element = Object.create(gpuExports.WebGPURenderElement2D.prototype);
        Object.assign(element, {renderStateIsBySprite: spriteState, _value2DShaderData: state(1),
            _materialShaderData: spriteState ? null : state(2), _additionShaderData: new Map(),
            _passRenderInfo: new Map([[0, {drawInfos: [], geometryStateID: 1, passDefineCacheFlag: {}}]]),
            _updateMatChangeFlag() { this._materialRenderDataChange = false; }, getGlobalShaderData: () => null,
            _globalShaderData: null, geometry: {getStateCacheID: () => 1}, _cacheGeometryStateID: 1,
            _getStencilClipStateKey: () => null, _cacheStencilClipStateKey: null, _cacheMatBlendStateID: spriteState ? 1 : 2,
            _cacheMatCullMode: 0, _cacheMatDepthStencilID: 0, owner: {}, _needUpdatePipeline() { throw new Error('Stable state must reuse pipeline'); }});
        const context = {_curRenderGlobalKey: 0};
        cases.push({name: spriteState ? 'webgpu-prepare-sprite' : 'webgpu-prepare-material', units: 1,
            run() { element._prepare(context); }, check() { return element._cacheMatBlendStateID; }});
    }
    // Calibration and warmup are outside the samples. No mixed-version call sites.
    function time(test, count) {
        const start = performance.now();
        for (let i = 0; i < count; i++) test.run();
        return performance.now() - start;
    }
    const results = {};
    for (const test of cases) {
        let count = 1, elapsed = 0;
        // Use repeated pilot runs only to size the samples. A process pause during a
        // single pilot must not reduce all later measurements to one iteration.
        do {
            count *= 2;
            elapsed = Math.min(time(test, count), time(test, count), time(test, count));
        } while (elapsed < 30);
        time(test, Math.max(1, Math.ceil(count * 150 / elapsed)));
        elapsed = Math.min(time(test, count), time(test, count), time(test, count));
        count = Math.max(1, Math.ceil(count * 35 / elapsed));
        const samples = [];
        for (let i = 0; i < 9; i++) samples.push(time(test, count) * 1e6 / (count * test.units));
        results[test.name] = {samplesNs: samples, iterations: count, checksum: test.check()};
    }
    process.stdout.write(JSON.stringify(results));
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}
function summarize(pairs) {
    let seed = 2442;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const summary = {};
    for (const key of Object.keys(pairs[0].before)) {
        const logs = pairs.map(pair => Math.log(median(pair.after[key].samplesNs) / median(pair.before[key].samplesNs)));
        const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
        const bootstrap = [];
        for (let i = 0; i < 10000; i++) {
            let total = 0;
            for (let j = 0; j < logs.length; j++) total += logs[Math.floor(random() * logs.length)];
            bootstrap.push(Math.exp(total / logs.length));
        }
        bootstrap.sort((a, b) => a - b);
        summary[key] = {ratio: Math.exp(mean(logs)), ci95: [bootstrap[250], bootstrap[9749]],
            beforeMedianNs: median(pairs.map(pair => median(pair.before[key].samplesNs))),
            afterMedianNs: median(pairs.map(pair => median(pair.after[key].samplesNs))),
            pairRatios: logs.map(Math.exp)};
    }
    return summary;
}

if (process.argv.includes('--worker')) {
    worker();
} else {
    const pairCount = Number(argument('--pairs', 10));
    const controlCount = Number(argument('--control-pairs', 4));
    const output = argument('--output', '/tmp/laya-2442-performance.json');
    const pairs = [], controls = [];
    function run(variant) {
        const result = spawnSync(process.execPath, [__filename, '--worker', variant], {encoding: 'utf8', timeout: 60000});
        if (result.status !== 0) throw new Error(result.stderr || result.error || 'Benchmark worker failed');
        return JSON.parse(result.stdout);
    }
    // Reverse process order on alternating pairs; also measure original-vs-original noise.
    for (let i = 0; i < pairCount + controlCount; i++) {
        const control = i < controlCount;
        let before, after;
        if (i & 1) { after = run(control ? 'before' : 'after'); before = run('before'); }
        else { before = run('before'); after = run(control ? 'before' : 'after'); }
        for (const key of Object.keys(before)) {
            if (before[key].checksum !== after[key].checksum && !key.startsWith('material-'))
                throw new Error(`Mismatched output in ${key}`);
        }
        (control ? controls : pairs).push({before, after});
        console.log(`${control ? 'A/A control' : 'A/B comparison'} pair ${control ? i + 1 : i - controlCount + 1} completed`);
    }
    const report = {node: process.version, v8: process.versions.v8, arch: process.arch, platform: process.platform,
        cpu: require('node:os').cpus()[0].model, target: 'ES2017',
        baseline: execFileSync('git', ['rev-parse', baseline], {encoding: 'utf8'}).trim(), baselineGPU,
        files: Object.fromEntries([...changedFiles, gpuElementFile, gpuStateFile].map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])),
        comparison: summarize(pairs), control: controls.length ? summarize(controls) : null, pairs, controls};
    fs.writeFileSync(output, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({comparison: report.comparison, control: report.control, output}, null, 2));
}
