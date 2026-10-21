const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engineRoot = process.env.PARTICLE_ENGINE_ROOT || path.resolve(__dirname, '../src/layaAir/laya');
const ts = require('typescript');
const cache = new Map();
function load(file) {
    file = path.resolve(engineRoot, file);
    if (!file.endsWith('.ts'))
        file += '.ts';
    if (cache.has(file))
        return cache.get(file).exports;
    if (file.endsWith('/display/Sprite.ts'))
        return { Sprite: class {
            } };
    if (file.endsWith('/Particle2DVertexMesh.ts'))
        return { Particle2DVertexMesh: {} };
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
    vm.runInThisContext('(function(module,exports,require){' + code + '\n})', { filename: file })(m, m.exports, p => load(path.resolve(path.dirname(file), p)));
    return m.exports;
}
const { ShurikenParticle2DSystem: System } = load('particle/d2/ShurikenParticle2DSystem');
const classes = {};
for (const [file, name] of [['d2/module/Shape2DModule', 'Shape2DModule'], ['d2/module/Velocity2DOverLifetimeModule', 'Velocity2DOverLifetimeModule'], ['common/module/ColorOverLifetimeModule', 'ColorOverLifetimeModule'], ['d2/module/Size2DOverLifetimeModule', 'Size2DOverLifetimeModule'], ['d2/module/Rotation2DOverLifetimeModule', 'Rotation2DOverLifetimeModule'], ['common/module/TextureSheetAnimationModule', 'TextureSheetAnimationModule']])
    classes[name] = load('particle/' + file)[name];
const modules = { shape: 'Shape2DModule', velocity2DOverLifetime: 'Velocity2DOverLifetimeModule', colorOverLifetime: 'ColorOverLifetimeModule', size2DOverLifetime: 'Size2DOverLifetimeModule', rotation2DOverLifetime: 'Rotation2DOverLifetimeModule', textureSheetAnimation: 'TextureSheetAnimationModule' };
test('a default system clones without optional modules', () => { const a = new System(), b = a.clone(); assert.notEqual(a, b); assert.notEqual(a.main, b.main); assert.notEqual(a.emission, b.emission); for (const name in modules)
    assert.equal(b[name], undefined); b.main.startLifetime.constant = 77; assert.notEqual(a.main.startLifetime.constant, 77); });
for (const count of [0, 1, 2, 3, 4, 5, 6])
    test('cloneTo replaces optional modules, present count ' + count, () => { const a = new System(), b = new System(); Object.entries(modules).forEach(([prop, type], i) => { b[prop] = new classes[type](); if (i < count) {
        a[prop] = new classes[type]();
        a[prop].enable = false;
    } }); a.cloneTo(b); Object.keys(modules).forEach((prop, i) => { if (i < count) {
        assert.ok(b[prop]);
        assert.notEqual(a[prop], b[prop]);
        assert.equal(b[prop].enable, false);
        b[prop].enable = true;
        assert.equal(a[prop].enable, false);
    }
    else
        assert.equal(b[prop], undefined); }); });
for (const type of ['FanShape', 'Circle2DShape', 'Box2DShape', 'SemicircleShap'])
    test('shape clone preserves ' + type + ' and independent data', () => { const Shape = load('particle/d2/module/shapes/' + type)[type]; const a = new System(); a.shape = new classes.Shape2DModule(); a.shape.shape = new Shape(); a.shape.alignToDirection = true; if (type === 'Box2DShape')
        a.shape.shape.size.x = 3;
    else
        a.shape.shape.radius = 3; const b = a.clone(); assert.equal(b.shape.shape.constructor, Shape); assert.equal(b.shape.alignToDirection, true); assert.notEqual(a.shape.shape, b.shape.shape); if (type === 'Box2DShape') {
        b.shape.shape.size.x = 9;
        assert.equal(a.shape.shape.size.x, 3);
    }
    else {
        b.shape.shape.radius = 9;
        assert.equal(a.shape.shape.radius, 3);
    } });
test('a missing shape instance is preserved', () => { const a = new System(); a.shape = new classes.Shape2DModule(); a.shape.shape = null; assert.equal(a.clone().shape.shape, undefined); });
test('module curve and gradient data are deep copies', () => { const a = new System(); for (const [prop, type] of Object.entries(modules))
    a[prop] = new classes[type](); a.velocity2DOverLifetime.x.constant = 3; a.size2DOverLifetime.x.curve._elements[1] = 1; a.colorOverLifetime.color.color.r = .25; const b = a.clone(); b.velocity2DOverLifetime.x.constant = 7; b.size2DOverLifetime.x.curve._elements[1] = 9; b.colorOverLifetime.color.color.r = .75; assert.equal(a.velocity2DOverLifetime.x.constant, 3); assert.equal(a.size2DOverLifetime.x.curve._elements[1], 1); assert.equal(a.colorOverLifetime.color.color.r, .25); });
// Execute the arithmetic from the production GLSL, preserving its branches and loops.
const shaderRoot = path.join(engineRoot, 'particle/d2');
const shader = fs.readFileSync(path.join(shaderRoot, 'shader/Curve.glsl'), 'utf8');
function shaderFunctions(count) {
let enabled = true;
const variant = shader.split('\n').filter(line => {
    if (line === '#ifdef GRADIENTKEYCOUNT_8') { enabled = count === 8; return false; }
    if (line === '#endif') { enabled = true; return false; }
    return enabled;
}).join('\n').replaceAll('PARTICLE2D_GRADIENT_VEC4_COUNT', String(count / 2)).replaceAll('PARTICLE2D_GRADIENT_KEY_COUNT', String(count));
const js = variant.replace(/^#.*$/gm, '').replace(/float (get\w+)\([^)]*\)/g, (_, name) => 'function ' + name + (name === 'getCurveValue' ? '(time,curve,range)' : '(normalizedAge,lifetime,curve)')).replace(/vec2 (\w+)\[(\d+)\];/g, 'let $1=Array($2);').replace(/\b(?:float|vec2|int) (\w+)/g, 'let $1');
return vm.runInNewContext(js + ';({getCurveValue,getCurveCalculus})', { clamp: (v, a, b) => Math.max(a, Math.min(b, v)), mix: (a, b, t) => a + (b - a) * t, min: Math.min, max: Math.max });
}
const funcs = shaderFunctions(8);
function pack(points) { const p = points.concat(Array.from({ length: 8 - points.length }, () => [0, 0])); return Array.from({ length: 4 }, (_, i) => ({ xy: { x: p[i * 2][0], y: p[i * 2][1] }, zw: { x: p[i * 2 + 1][0], y: p[i * 2 + 1][1] } })); }
function expectedValue(p, t) { if (t <= p[0][0])
    return p[0][1]; for (let i = 1; i < p.length; i++)
    if (t <= p[i][0])
        return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * (t - p[i - 1][0]) / (p[i][0] - p[i - 1][0]); return p.at(-1)[1]; }
function expectedIntegral(p, t) { let sum = Math.min(t, p[0][0]) * p[0][1]; for (let i = 1; i < p.length; i++) {
    const start = p[i - 1][0], end = Math.min(t, p[i][0]);
    if (end > start)
        sum += (end - start) * (p[i - 1][1] + expectedValue(p, end)) / 2;
} if (t > p.at(-1)[0])
    sum += (t - p.at(-1)[0]) * p.at(-1)[1]; return sum; }
for (const count of [1, 2, 4, 5, 8])
    test('numeric curve interpolation and integration with ' + count + ' keys', () => { const p = count === 1 ? [[0, 3]] : Array.from({ length: count }, (_, i) => [i / (count - 1), (i % 3) - .5]); const data = pack(p); for (const t of [0, .01, .13, .35, .5, .75, .9, 1]) {
        assert.ok(Math.abs(funcs.getCurveValue(t, data, { x: 0, y: 1 }) - expectedValue(p, t)) < 1e-6, 'value at ' + t);
        assert.ok(Math.abs(funcs.getCurveCalculus(t, 2, data) - 2 * expectedIntegral(p, t)) < 1e-6, 'integral at ' + t);
    } });
test('constant curves retain their final value beyond the last key', () => { const p = [[0, 2], [.5, 2]], data = pack(p); assert.equal(funcs.getCurveCalculus(1, 3, data), 6); assert.equal(funcs.getCurveValue(1, data, { x: 0, y: .5 }), 2); });
test('repeated key times do not produce invalid shader arithmetic', () => { const data = pack([[0, 2], [0, 3], [1, 4]]); assert.equal(funcs.getCurveValue(.5, data, { x: 0, y: 1 }), 2); assert.equal(funcs.getCurveCalculus(.5, 2, data), 2); });
test('all 2D numeric curve uniforms upload the full eight-key buffer', () => { const common = fs.readFileSync(path.join(shaderRoot, 'shader/Particle2DCommon.glsl'), 'utf8'); const source = fs.readFileSync(path.join(shaderRoot, 'Particle2DShader.ts'), 'utf8'); const lengths = new Map(); const exports = {}; const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText; vm.runInNewContext(code, { exports, require(p) { if (p.endsWith('LayaGL'))
        return { LayaGL: { renderDeviceFactory: { createGlobalUniformMap: () => ({ addShaderUniform() { }, addShaderUniformArray(id, name, type, length) { lengths.set(name, length); } }) } } }; if (p.endsWith('Shader3D'))
        return { Shader3D: { addInclude() { }, propertyNameToID: n => n, getDefineByName: n => n } }; if (p.endsWith('ShaderData'))
        return { ShaderDataType: { Float: 0, Vector4: 1 } }; return { default: '' }; } }); exports.Particle2DShader.init(); const declarations = [...common.matchAll(/uniform vec4 (u_(?:VelocityCurve|SizeCurve|RotationCurve|TextureSheetFrame)\w*)\[PARTICLE2D_GRADIENT_VEC4_COUNT\]/g)]; assert.equal(declarations.length, 12); for (const [, name, length] of declarations) {
    assert.equal(lengths.get(name), 4, name);
} });

test('four-key variant ignores later keys and retains interpolation/integration', () => {
    const funcs4 = shaderFunctions(4);
    const p = [[0,1],[.2,3],[.5,2],[1,4]], data = pack(p);
    for (const t of [0,.1,.4,.9,1]) {
        assert.ok(Math.abs(funcs4.getCurveValue(t,data,{x:0,y:1})-expectedValue(p,t))<1e-6);
        assert.ok(Math.abs(funcs4.getCurveCalculus(t,2,data)-2*expectedIntegral(p,t))<1e-6);
    }
    const extra=pack([[0,1],[.2,3],[.5,2],[.75,4],[1,10]]);
    assert.equal(funcs4.getCurveValue(1,extra,{x:0,y:.75}),4);
    assert.equal(shaderFunctions(8).getCurveValue(1,extra,{x:0,y:1}),10);
});
test('eight-key mode defaults off, dirties modules and survives clone', () => {
    const a=new System(); assert.equal(a.gradientKeyCount8,false);
    a._dirtyFlags=0; a.gradientKeyCount8=false; assert.equal(a._dirtyFlags,0);
    a.gradientKeyCount8=true; assert.equal(a._dirtyFlags,~0);
    assert.equal(a.clone().gradientKeyCount8,true);
    const b=new System(); a.cloneTo(b); assert.equal(b.gradientKeyCount8,true);
    a.gradientKeyCount8=false; a.cloneTo(b); assert.equal(b.gradientKeyCount8,false);
});
