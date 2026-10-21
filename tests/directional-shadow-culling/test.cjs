// Execute the production TypeScript methods; only renderer/device dependencies are stubbed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '../..');
const source = 'src/layaAir/laya/';
let assertions = 0;
function equal(actual, expected, label) {
    assertions++;
    assert.equal(actual, expected, label);
}
function check(value, label) { equal(Boolean(value), true, label); }

// This loader never extracts/replaces method bodies or copies the culling algorithm.
function loadTS(relative, dependencies = {}) {
    const filename = path.join(root, source, relative);
    return loadTSFile(filename, dependencies);
}
function loadTSFile(filename, dependencies = {}) {
    const code = esbuild.transformSync(fs.readFileSync(filename, 'utf8'), {
        loader: 'ts', format: 'cjs', target: 'es2020', sourcefile: filename
    }).code;
    const module = { exports: {} };
    const requireDependency = name => {
        const key = name.split('/').pop();
        if (!Object.hasOwn(dependencies, key)) throw Error(`Unstubbed import ${name} in ${filename}`);
        return dependencies[key];
    };
    new vm.Script(`(function(require,module,exports){${code}\n})`, { filename })
        .runInThisContext()(requireDependency, module, module.exports);
    return module.exports;
}

class Vector3 {
    constructor(x = 0, y = 0, z = 0) { this.setValue(x, y, z); }
    setValue(x, y, z) { this.x = x; this.y = y; this.z = z; }
    cloneTo(out) { out.setValue(this.x, this.y, this.z); }
    static distanceSquared(a, b) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2; }
    static normalize(a, out) {
        const length = Math.hypot(a.x, a.y, a.z);
        out.setValue(a.x / length, a.y / length, a.z / length);
    }
}
Vector3.TEMP = new Vector3();
class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 0) { this.setValue(x, y, z, w); }
    setValue(x, y, z, w) { Object.assign(this, { x, y, z, w }); }
}
Vector4.TEMP = new Vector4();
class Matrix4x4 {
    constructor() { this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    static createFromQuaternion(_rotation, out) { out.elements.set(new Matrix4x4().elements); }
}
Matrix4x4.TEMP = new Matrix4x4();
class Plane { constructor(normal = new Vector3(), distance = 0) { Object.assign(this, { normal, distance }); } }
class BoundSphere { constructor(center = new Vector3(), radius = 0) { Object.assign(this, { center, radius }); } }
class RenderListQueue {
    constructor() { this.elements = []; }
    clear() { this.elements.length = 0; }
    addRenderElement(element) { this.elements.push(element); }
}
const LayaGL = { renderDeviceFactory: { createShaderData: () => ({}) } };
const { ShadowCullInfo, ShadowSliceData } = loadTS('d3/shadowMap/ShadowSliceData.ts', {
    Plane: { Plane }, BoundSphere: { BoundSphere }, Matrix4x4: { Matrix4x4 }, Vector3: { Vector3 },
    LayaGL: { LayaGL }, BoundFrustum: { BoundFrustum: class {} }
});
const { FrustumCulling } = loadTS('d3/graphics/FrustumCulling.ts');
const { RenderCullUtil } = loadTS('RenderDriver/DriverCommon/RenderCullUtil.ts', {
    FrustumCulling: { FrustumCulling }, Vector3: { Vector3 }
});
const { ShadowCascadesMode } = loadTS('d3/core/light/ShadowCascadesMode.ts');
const { ShadowMode } = loadTS('d3/core/light/ShadowMode.ts');

const point = (x, y, z) => new Vector3(x, y, z);
function bounds(center, extent = [0, 0, 0]) {
    const min = point(center[0] - extent[0], center[1] - extent[1], center[2] - extent[2]);
    const max = point(center[0] + extent[0], center[1] + extent[1], center[2] + extent[2]);
    const c = point(...center), e = point(...extent);
    return { _imp: { getMin: () => min, getMax: () => max,
        getCenter() { c.setValue((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2); return c; },
        getExtent() { e.setValue((max.x - min.x) / 2, (max.y - min.y) / 2, (max.z - min.z) / 2); return e; }
    } };
}
function info({ radius = 5, center = [0, 0, 0], direction = [0, 0, 1], margin = 0, enabled = true, planes = [] } = {}) {
    const cull = new ShadowCullInfo();
    cull.cullSphere = new BoundSphere(point(...center), radius);
    cull.direction = point(...direction);
    cull.cameraPosition = point(0, 0, 0);
    cull.cullPlanes = planes;
    cull.cullPlaneCount = planes.length;
    cull.prepareReceiverSphereCulling(enabled, margin);
    return cull;
}
const receiverVisible = (box, cull = info()) => FrustumCulling.cullingRenderBounds(box, cull);

function geometryTests() {
    equal(new ShadowCullInfo().receiverSphereCullingRadius, -1, 'new culling info defaults to legacy planes');
    const fixtures = [
        ['very distant upstream caster', [-1, 0, -1000000], [0.5, 0.5, 0.5], true],
        ['unrelated downstream caster', [0, 0, 20], [1, 1, 1], false],
        ['unrelated lateral caster', [20, 0, -20], [1, 1, 1], false],
        ['caster inside receiver', [1, 1, 1], [0.1, 0.1, 0.1], true],
        ['upstream tangent', [7, 0, -20], [2, 0, 0], true],
        ['downstream tangent', [0, 0, 7], [2, 0, 0], true],
        ['large AABB crosses receiver despite distant center', [20, 0, 0], [21, 1, 1], true],
        ['point on receiver surface', [5, 0, 0], [0, 0, 0], true],
        ['point clearly beyond receiver surface', [5.01, 0, 0], [0, 0, 0], false]
    ];
    for (const [label, center, extent, expected] of fixtures)
        equal(receiverVisible(bounds(center, extent)), expected, label);
    const nonUnit = info({ direction: [0, 0, 47] });
    for (const [label, center, extent, expected] of fixtures)
        equal(receiverVisible(bounds(center, extent), nonUnit), expected, `non-unit direction: ${label}`);
    equal(Math.hypot(nonUnit.receiverSphereCullingDirection.x, nonUnit.receiverSphereCullingDirection.y,
        nonUnit.receiverSphereCullingDirection.z), 1, 'preparation caches normalized direction');
    equal(receiverVisible(bounds([0, 0, -20]), info({ direction: [0, 0, -1] })), false, 'direction reversal swaps downstream');
    equal(receiverVisible(bounds([0, 0, 20]), info({ direction: [0, 0, -1] })), true, 'direction reversal preserves new upstream');
    equal(receiverVisible(bounds([5.1, 0, -20]), info({ margin: 0.2 })), true, 'positive safety margin keeps nearby caster');
    equal(receiverVisible(bounds([5.1, 0, -20])), false, 'same caster is separable without safety margin');
    const extent = [1, 2, 2], tangentDistance = 5 + Math.hypot(...extent);
    for (const gap of [-0.001, 0, 0.001]) {
        const lateral = tangentDistance + gap;
        // A perpendicular unit vector to D=(3,4,0)/5 gives a known closest-ray distance.
        equal(receiverVisible(bounds([-30 - lateral * 4 / 5, -40 + lateral * 3 / 5, 0], extent),
            info({ direction: [3, 4, 0] })), gap <= 0, `Math.hypot lateral boundary gap ${gap}`);
        equal(receiverVisible(bounds([0, 0, tangentDistance + gap], extent)), gap <= 0,
            `Math.hypot downstream boundary gap ${gap}`);
    }
    equal(receiverVisible(bounds([6, 0, -10], [1, 2, 2])), true,
        'positive squared-distance delta still keeps overlapping caster/receiver spheres');
    equal(receiverVisible(bounds([3e80, 0, 0], [1e80, 0, 0]), info({ radius: 1e80 })), true,
        'overflow of both squared-comparison products remains conservative');

    const outside = bounds([100, 0, 100]);
    const prepared = info();
    for (const mutate of [
        c => { c.cullSphere = null; }, c => { c.cullSphere.radius = -1; },
        c => { c.cullSphere.radius = NaN; }, c => { c.cullSphere.radius = Infinity; },
        c => { c.cullSphere.center.x = Infinity; }, c => { c.direction = null; },
        c => { c.direction.setValue(0, 0, 0); }, c => { c.direction.x = NaN; },
        c => { c.direction.z = Infinity; }, c => { c.direction.setValue(0, 0, 2e-162); }
    ]) {
        const cull = info();
        mutate(cull);
        cull.prepareReceiverSphereCulling(true);
        equal(cull.receiverSphereCullingRadius, -1, 'invalid preparation clears cached enable state');
        equal(receiverVisible(outside, cull), true, 'invalid receiver data falls back to plane-only behavior');
    }
    for (const margin of [-1, NaN, Infinity]) {
        prepared.prepareReceiverSphereCulling(true, margin);
        equal(prepared.receiverSphereCullingRadius, -1, 'invalid margin disables receiver culling');
    }
    prepared.prepareReceiverSphereCulling(true, 0);
    prepared.prepareReceiverSphereCulling(false, 0);
    equal(receiverVisible(outside, prepared), true, 'explicit disable clears previously enabled data');
    const invalidMin = bounds([0, 0, 0]); invalidMin._imp.getMin().x = NaN;
    const invalidMax = bounds([0, 0, 0]); invalidMax._imp.getMax().z = Infinity;
    const inverted = bounds([0, 0, 0]); inverted._imp.getMin().x = 10;
    for (const box of [invalidMin, invalidMax, inverted])
        equal(receiverVisible(box), true, 'invalid world AABB fails open');

    // Construct a known caster point whose forward shadow ray reaches a receiver point.
    // A spherical AABB approximation must never reject these true intersections.
    let seed = 0x7a11a;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 1500; i++) {
        const sphereCenter = [random() * 200 - 100, random() * 200 - 100, random() * 200 - 100];
        const radius = 0.1 + random() * 20;
        const d = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
        const length = Math.hypot(...d); d.forEach((_, j) => { d[j] /= length; });
        const extent = [random() * 3, random() * 3, random() * 3];
        const target = sphereCenter.map(x => x + (random() - 0.5) * radius);
        const travel = random() * 10000;
        const center = target.map((x, j) => x - travel * d[j] + (random() * 2 - 1) * extent[j]);
        equal(receiverVisible(bounds(center, extent), info({ center: sphereCenter, radius, direction: d.map(x => x * 13) })),
            true, `known forward-ray intersection ${i}`);
    }
    // Independent parameterization: solve for travel using the non-unit input direction;
    // production instead prepares a unit direction once and uses its cached projection.
    for (let i = 0; i < 1500; i++) {
        const center = [random() * 80 - 40, random() * 80 - 40, random() * 80 - 40];
        const extent = [random() * 2, random() * 2, random() * 2];
        const d = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
        const l2 = d.reduce((sum, x) => sum + x * x, 0);
        const travel = Math.max(0, -center.reduce((sum, x, j) => sum + x * d[j], 0) / l2);
        const separation = Math.hypot(...center.map((x, j) => x + travel * d[j]));
        const combinedRadius = 5 + Math.hypot(...extent);
        if (Math.abs(separation - combinedRadius) < 0.001) continue;
        equal(receiverVisible(bounds(center, extent), info({ direction: d })), separation < combinedRadius,
            `independent closest-ray-point oracle ${i}`);
    }
}

function hotPathTests() {
    const originalSqrt = Math.sqrt;
    let squareRoots = 0;
    const cull = info();
    const boxes = [bounds([0, 0, -100], [1, 2, 2]), bounds([7.99, 0, -100], [1, 2, 2]), bounds([20, 0, 20], [1, 2, 2])];
    Math.sqrt = function (value) { squareRoots++; return originalSqrt(value); };
    try { for (let i = 0; i < 100; i++) for (const box of boxes) receiverVisible(box, cull); }
    finally { Math.sqrt = originalSqrt; }
    equal(squareRoots, 0, 'per-candidate receiver test performs no square roots');
    for (const enabled of [false, true]) for (const box of boxes) {
        const reads = { getMin: 0, getMax: 0, getCenter: 0, getExtent: 0 };
        const instrumented = { _imp: {} };
        for (const name of Object.keys(reads)) instrumented._imp[name] = () => { reads[name]++; return box._imp[name](); };
        cull.prepareReceiverSphereCulling(enabled);
        receiverVisible(instrumented, cull);
        equal(reads.getMin, 1, 'combined culling reads bounds min exactly once');
        equal(reads.getMax, 1, 'combined culling reads bounds max exactly once');
        equal(reads.getCenter, 0, 'combined culling reuses min/max for center');
        equal(reads.getExtent, 0, 'combined culling reuses min/max for extent');
    }
}

function makeRender(id, center, options = {}) {
    const render = {
        bounds: bounds(center, options.extent || [0.1, 0.1, 0.1]), layer: 0, renderbitFlag: 0, staticMask: 1,
        visibalRangeBit: options.range ? 1 : 0, visibalMin: options.range?.[0] || 0, visibalMax: options.range?.[1] || 0,
        updates: 0, shadowCullPass: () => options.castShadow !== false, _needRender: () => true,
        _renderUpdatePre() { this.updates++; },
        renderelements: [{ id, materialRenderQueue: options.materialQueue || 2000 }]
    };
    return render;
}
function queueTests() {
    const plane = new Plane(point(1, 0, 0), 2);
    const cull = info({ planes: [plane] });
    const nodes = [makeRender('upstream', [0, 0, -100]), makeRender('downstream', [0, 0, 20]),
        makeRender('lateral', [20, 0, -20]), makeRender('plane-excluded', [-20, 0, -20]),
        makeRender('no-shadow', [0, 0, 0], { castShadow: false }),
        makeRender('outside-range', [0, 0, -100], { range: [0, 100] }),
        makeRender('transparent', [0, 0, 0], { materialQueue: 3000 })];
    const queue = new RenderListQueue(); queue.elements.push({ id: 'stale' });
    RenderCullUtil.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
    equal(queue.elements.map(e => e.id).join(','), 'upstream', 'directional queue retains old filters and removes unrelated projections');
    equal(nodes[1].updates, 0, 'rejected downstream caster skips render update');
    equal(nodes[2].updates, 0, 'rejected lateral caster skips render update');
    equal(nodes[3].updates, 0, 'planes still reject candidates');
    cull.prepareReceiverSphereCulling(false);
    RenderCullUtil.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
    equal(queue.elements.map(e => e.id).join(','), 'upstream,downstream,lateral', 'single-cascade/disabled queue retains legacy candidates');
    cull.cullSphere.radius = NaN; cull.prepareReceiverSphereCulling(true);
    RenderCullUtil.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
    equal(queue.elements.map(e => e.id).join(','), 'upstream,downstream,lateral', 'invalid receiver retains planes/range/material checks');
    const cameraInfo = { boundFrustum: {}, cullingMask: -1, staticMask: -1, useOcclusionCulling: false, position: point(0, 0, 0) };
    const cameraQueue = new RenderListQueue(), transparentQueue = new RenderListQueue();
    RenderCullUtil.cullByCameraCullInfo(cameraInfo, nodes.slice(0, 3), 3, cameraQueue, transparentQueue, {});
    equal(cameraQueue.elements.map(e => e.id).join(','), 'upstream,downstream,lateral', 'camera path does not acquire receiver-sphere filtering');
    RenderCullUtil.cullSpotShadow(cameraInfo, nodes.slice(0, 3), 3, queue, {});
    equal(queue.elements.map(e => e.id).join(','), 'upstream,downstream,lateral', 'spotlight path does not acquire receiver-sphere filtering');
}

function cascadeTests() {
    const ShadowUtils = {
        getMaxTileResolutionInAtlas: (width, _height, count) => width / (count > 1 ? 2 : 1),
        getCascadesSplitDistance(_a, _b, near, far, _fov, _aspect, _mode, out) { for (let i = 0; i < 5; i++) out[i] = near + (far - near) * i / 4; },
        getCameraFrustumPlanes() {},
        getBoundSphereByFrustum(_near, far, _fov, _aspect, _position, _forward, out) { out.center.setValue(0, 0, -far); out.radius = far; return far; },
        getDirectionLightShadowCullPlanes(_a, _b, _c, _d, _e, slice) { slice.cullPlaneCount = 0; },
        getDirectionalLightMatrices(_a, _b, _c, _d, _e, resolution, slice) { slice.resolution = resolution; slice.projectionMatrix.elements[0] = 1 / slice.splitBoundSphere.radius; },
        applySliceTransform() {}, prepareShadowReceiverShaderValues() {}
    };
    const { WebDirCascadeShadowRP } = loadTS('RenderDriver/RenderModuleData/WebModuleData/3D/WebShadowRP/WebDirCascadeShadowRP.ts', {
        ShadowCascadesMode: { ShadowCascadesMode }, ShadowUtils: { ShadowUtils }, Plane: { Plane },
        ShadowSliceData: { ShadowCullInfo, ShadowSliceData }, LayaGL: { LayaGL }, StatisticsContext: {},
        Color: {}, MathUtils3D: { MathUtils3D: { Deg2Rad: Math.PI / 180 } }, Matrix4x4: { Matrix4x4 },
        Vector3: { Vector3 }, Vector4: { Vector4 }, Viewport: {}, RenderClearFlag: {}, Browser: {},
        RenderCullUtil: { RenderCullUtil }, RenderListQueue: { RenderListQueue }, ShadowMode: { ShadowMode },
        ShadowCasterPass: {}, BaseCamera: {}, Scene3DShaderDeclaration: {}, Scene3D: {}, IBatchModuleAgent: {}
    });
    const rp = new WebDirCascadeShadowRP();
    rp._camera = { nearplane: 0.3, farplane: 100, fieldOfView: 80, aspectRatio: 16 / 9,
        transform: { position: point(0, 0, 0), getForward: out => out.setValue(0, 0, -1) } };
    const light = { transform: { rotation: {} }, shadowResolution: 2048, shadowDistance: 50, shadowNearPlane: 0.1,
        shadowTwoCascadeSplits: 0.2, _shadowFourCascadeSplits: point(0.1, 0.3, 0.6),
        shadowDepthBias: 1, shadowNormalBias: 1, shadowMode: ShadowMode.Hard };
    const originalBias = rp._getShadowBias;
    let biasCalls = 0;
    rp._getShadowBias = function (...args) { biasCalls++; return originalBias.apply(this, args); };
    for (const [mode, count] of [[ShadowCascadesMode.NoCascades, 1], [ShadowCascadesMode.TwoCascades, 2],
        [ShadowCascadesMode.FourCascades, 4], [ShadowCascadesMode.NoCascades, 1]]) {
        light.shadowCascadesMode = mode; biasCalls = 0;
        rp._setLight(light); rp._caculateDirCullInfo();
        equal(rp._cascadeCount, count, `actual RP updates cascade count to ${count}`);
        equal(biasCalls, count === 1 ? 0 : count, `single-cascade setup keeps old bias path (${count})`);
        for (let i = 0; i < count; i++) {
            const cull = rp._shadowCullInfo[i];
            if (count === 1) equal(cull.receiverSphereCullingRadius, -1, 'switching back to single cascade clears cached culling');
            else check(Number.isFinite(cull.receiverSphereCullingRadius) && cull.receiverSphereCullingRadius > cull.cullSphere.radius,
                `cascade ${i} prepares a finite receiver radius including safety margin`);
        }
        let submitted;
        rp.setCameraCullInfo({ batchAgentList: new Map([['test', { setDirLightCullInfo(value) { submitted = value; } }]]) });
        equal(submitted.length, count, 'batch agents receive only active cascade infos');
        equal(submitted[0], rp._shadowCullInfo[0], 'batch agent info includes actual prepared cache');
    }
    light.shadowCascadesMode = ShadowCascadesMode.TwoCascades;
    const margins = [];
    for (const mode of [ShadowMode.Hard, ShadowMode.SoftLow, ShadowMode.SoftHigh]) {
        light.shadowMode = mode; rp._setLight(light); rp._caculateDirCullInfo();
        margins.push(rp._shadowCullInfo[0].receiverSphereCullingRadius - rp._shadowCullInfo[0].cullSphere.radius);
    }
    check(margins[0] > 0 && margins[1] >= margins[0] && margins[2] > margins[1], 'wider PCF filters receive larger conservative margins');
    const currentMargin = () => rp._shadowCullInfo[0].receiverSphereCullingRadius - rp._shadowCullInfo[0].cullSphere.radius;
    light.shadowDepthBias = 2; light.shadowNormalBias = -3;
    rp._caculateDirCullInfo();
    const signedMargin = currentMargin();
    light.shadowDepthBias = -2; light.shadowNormalBias = 3;
    rp._caculateDirCullInfo();
    equal(currentMargin(), signedMargin, 'reversing bias signs preserves the conservative displacement bound');
    light.shadowResolution = 512;
    rp._setLight(light); rp._caculateDirCullInfo();
    check(currentMargin() > signedMargin, 'larger world-space texels expand the receiver margin');
    light.shadowDepthBias = NaN; rp._caculateDirCullInfo();
    equal(rp._shadowCullInfo[0].receiverSphereCullingRadius, -1, 'invalid derived safety margin disables optimization');
}

function replaySnapshot(filename, margin) {
    const data = JSON.parse(fs.readFileSync(path.resolve(filename), 'utf8'));
    const nodes = data.merged.map(p => {
        const render = makeRender(p.key, p.bounds.center, { extent: p.bounds.extent });
        render.renderelements[0].triangles = p.instances * 12;
        return render;
    });
    const results = data.slices.map((slice, index) => {
        const planes = slice.planes.map(p => new Plane(point(...p.normal), p.distance));
        const cull = info({ center: slice.sphere.center, radius: slice.sphere.radius, direction: data.direction, margin, planes });
        const queue = new RenderListQueue();
        cull.prepareReceiverSphereCulling(false);
        RenderCullUtil.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
        const baseline = queue.elements.reduce((sum, e) => sum + e.triangles, 0);
        equal(baseline, data.variants[0].cascades[index].triangles, `snapshot cascade ${index + 1} planes match captured draws`);
        cull.prepareReceiverSphereCulling(true, margin);
        RenderCullUtil.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
        const projected = queue.elements.reduce((sum, e) => sum + e.triangles, 0);
        if (margin === 0) equal(projected, data.variants[1].cascades[index].triangles, `snapshot cascade ${index + 1} projected candidates`);
        check(projected <= baseline, 'snapshot optimization never adds submissions');
        return { cascade: index + 1, baseline, projected, removed: baseline - projected };
    });
    const removed = results.reduce((sum, r) => sum + r.removed, 0);
    if (margin === 0) equal(removed, 233400, 'captured 43-group zero-margin estimate');
    console.log(JSON.stringify({ snapshot: path.resolve(filename), margin, results, removed }, null, 2));
}

function benchmark(baselineDir, previousDir) {
    const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const percentile95 = values => values.sort((a, b) => a - b)[Math.ceil(values.length * 0.95) - 1];
    const planes = [point(1, 0, 0), point(-1, 0, 0), point(0, 1, 0), point(0, -1, 0), point(0, 0, 1), point(0, 0, -1)]
        .map(normal => new Plane(normal, 1000));
    const versions = [];
    const loadQueue = directory => {
        const { FrustumCulling: culling } = loadTSFile(path.resolve(directory, 'FrustumCulling.ts'));
        return loadTSFile(path.resolve(directory, 'RenderCullUtil.ts'), { FrustumCulling: { FrustumCulling: culling }, Vector3: { Vector3 } }).RenderCullUtil;
    };
    if (baselineDir) versions.push({ name: 'original-planes', queue: loadQueue(baselineDir), enabled: false });
    versions.push({ name: 'current-planes-only', queue: RenderCullUtil, enabled: false });
    if (previousDir) versions.push({ name: 'previous-receiver', queue: loadQueue(previousDir), enabled: true });
    versions.push({ name: 'current-receiver', queue: RenderCullUtil, enabled: true });
    const scenarios = [
        ['all-retained', Array.from({ length: 1000 }, (_, i) => makeRender(String(i), [(i % 7) / 10, 0, -100]))],
        ['sphere-overlap', Array.from({ length: 1000 }, (_, i) => makeRender(String(i), [5.03 + (i % 17) * 0.007, (i % 3) * 0.01, -100]))],
        ['all-rejected', Array.from({ length: 1000 }, (_, i) => makeRender(String(i), [20 + (i % 17), 0, -100]))],
        ['partly-rejected', Array.from({ length: 1000 }, (_, i) => makeRender(String(i), [(i % 100) - 50, (i % 13) - 6, (i % 73) - 36]))]
    ];
    const results = scenarios.map(([name, nodes]) => {
        const runners = versions.map(version => {
            const cull = info({ planes, enabled: version.enabled }), queue = new RenderListQueue();
            version.queue.cullDirectLightShadow(cull, nodes, nodes.length, queue, {});
            return { ...version, cull, target: queue, expected: queue.elements.map(e => e.id).join(','), samples: [] };
        });
        equal(runners[0].target.elements.length, nodes.length, `benchmark ${name}: original planes retain candidates`);
        const projected = runners.filter(r => r.enabled);
        for (const runner of projected) equal(runner.expected, projected[0].expected, `benchmark ${name}: receiver versions retain identical candidates`);
        const run = (runner, passes) => {
            const begin = performance.now();
            for (let repeat = 0; repeat < passes; repeat++)
                runner.queue.cullDirectLightShadow(runner.cull, nodes, nodes.length, runner.target, {});
            return (performance.now() - begin) * 1e6 / (passes * nodes.length);
        };
        for (const runner of runners) run(runner, 100);
        for (let round = 0; round < 21; round++) {
            const order = Array.from({ length: runners.length }, (_, offset) => runners[(round + offset) % runners.length]);
            if (round % 2) order.reverse();
            for (const runner of order) runner.samples.push(run(runner, 250));
        }
        return { scenario: name, candidates: nodes.length, versions: runners.map(runner => ({ name: runner.name,
            retained: runner.target.elements.length, medianNanosecondsPerCandidate: median(runner.samples.slice()),
            p95NanosecondsPerCandidate: percentile95(runner.samples.slice()) })) };
    });
    console.log(JSON.stringify({ benchmark: 'Real queues in Node; synthetic bounds; not browser/GPU/frame timing',
        callsPerRound: 250000, rounds: 21, results }));
}

geometryTests(); hotPathTests(); queueTests(); cascadeTests();
const args = process.argv.slice(2);
const snapshotIndex = args.indexOf('--snapshot'), marginIndex = args.indexOf('--margin');
if (snapshotIndex >= 0) {
    assert(args[snapshotIndex + 1], '--snapshot requires grass-source-audit.json');
    const margin = marginIndex >= 0 ? Number(args[marginIndex + 1]) : 0;
    assert(Number.isFinite(margin) && margin >= 0, '--margin must be a finite nonnegative world-space distance');
    replaySnapshot(args[snapshotIndex + 1], margin);
}
if (args.includes('--benchmark') || args.includes('--bench')) {
    const baselineIndex = args.indexOf('--baseline-dir'), previousIndex = args.indexOf('--previous-dir');
    if (baselineIndex >= 0) assert(args[baselineIndex + 1], '--baseline-dir requires a directory containing FrustumCulling.ts and RenderCullUtil.ts');
    if (previousIndex >= 0) assert(args[previousIndex + 1], '--previous-dir requires a directory containing FrustumCulling.ts and RenderCullUtil.ts');
    benchmark(baselineIndex >= 0 ? args[baselineIndex + 1] : undefined, previousIndex >= 0 ? args[previousIndex + 1] : undefined);
}
console.log(`PASS: ${assertions} assertions against production TypeScript methods`);
