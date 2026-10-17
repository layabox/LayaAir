// node tests/physics/physx-regression.cjs [source.js] [baseline-result.json]
// Defaults to the checked-in pre-optimization fixture. ELECTRON_RUN_AS_NODE=1 is supported.
// PHYSICS_COVERAGE=1 counts fixed entry calls in a temporary in-memory copy only.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto'), { performance } = require('node:perf_hooks');
const encode = (_key, value) => Object.is(value, -0) ? { __float64: '-0' } : value;
const decode = (_key, value) => value && typeof value === 'object' && value.__float64 === '-0' ? -0 : value;
const path = require('node:path');
const sourcePath = process.argv[2] || path.join(__dirname, '../../src/layaAir/jsLibs/physx.release.js'), baselinePath = process.argv[3] || path.join(__dirname, 'physx-behavior.json');
let source = fs.readFileSync(sourcePath, 'utf8');
const targets = ['zW', 'Lha', 'bda', 'vX', 'tX', 'rX', 'CF', 'lM', 'ER', 'cv', 'CX', 'Hu', 'Tu', 'ZL', 'qF'];
if (process.env.PHYSICS_COVERAGE)
    for (const name of targets) {
        const start = source.indexOf('function ' + name + '(');
        assert.ok(start >= 0);
        const body = source.indexOf('{', start) + 1;
        source = source.slice(0, body) + `__observed.${name}=(__observed.${name}||0)+1;` + source.slice(body);
    }
function plain(value) {
    if (ArrayBuffer.isView(value))
        return Array.from(value);
    if (Array.isArray(value))
        return Array.from(value, plain);
    if (value && typeof value.size === 'function' && typeof value.get === 'function')
        return Array.from({ length: value.size() }, (_, i) => plain(value.get(i)));
    if (value && typeof value === 'object' && Number.isInteger(value.contactCount) && 'pxShape0' in value)
        return { pxShape0: value.pxShape0, pxShape1: value.pxShape1, contactCount: value.contactCount, points: Array.from({ length: Math.min(4, value.contactCount) }, (_, i) => plain(value['contactPoint' + i])) };
    if (value && typeof value === 'object') {
        const keys = new Set(Object.keys(value));
        for (let proto = Object.getPrototypeOf(value); proto; proto = Object.getPrototypeOf(proto))
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto)))
                if (descriptor.get && key !== '__proto__')
                    keys.add(key);
        return Object.fromEntries([...keys].filter(k => k !== '$$').sort().map(k => [k, plain(value[k])]));
    }
    return value;
}
const pose = (x = 0, y = 0, z = 0) => ({ translation: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
async function run(spec) {
    const diagnostics = [], events = [], observed = {};
    let contactPointCount = 0;
    const ctx = { window: {}, performance, setTimeout, clearTimeout, __observed: observed, console: Object.fromEntries(['log', 'info', 'warn', 'error'].map(k => [k, (...args) => diagnostics.push([k, ...args.map(String)])])) };
    vm.runInNewContext(source, ctx, { filename: sourcePath });
    const m = await ctx.PHYSX();
    const callback = new m.PxDefaultErrorCallback(), allocator = new m.PxDefaultAllocator(), foundation = m.PxCreateFoundation(m.PX_PHYSICS_VERSION, allocator, callback), scale = new m.PxTolerancesScale(), physics = m.CreateDefaultPhysics(foundation, scale);
    m.InitDefaultExtensions(physics);
    const handler = m.PxSimulationEventCallback.implement(Object.fromEntries(['onConstraintBreak', 'onWake', 'onSleep', 'onContactBegin', 'onContactEnd', 'onContactPersist', 'onTriggerBegin', 'onTriggerEnd'].map(key => [key, (...args) => { const row = [key, ...args.map(plain)]; if (key.startsWith('onContact'))
            for (const pairs of row.slice(1))
                for (const pair of Array.isArray(pairs) ? pairs : [pairs])
                    contactPointCount += pair.contactCount || 0; events.push(row); }])));
    const desc = m.getDefaultSceneDesc(physics.getTolerancesScale(), 0, handler);
    desc.setSceneFlag(64, !!spec.pcm);
    assert.equal(!!(desc.getSceneFlags() & 64), !!spec.pcm);
    if (spec.ccd)
        desc.setSceneFlag(2, true);
    const scene = physics.createScene(desc);
    scene.setGravity({ x: 0, y: -9.8, z: 0 });
    const material = physics.createMaterial(.5, .5, .1), flags = new m.PxShapeFlags(3), unit = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0, w: 1 };
    const vectors = new m.PxVec3Vector();
    for (let i = 0; i < 8; i++)
        vectors.push_back({ x: (i & 1 ? .5 : -.5), y: (i & 2 ? .55 : -.5), z: (i & 4 ? .45 : -.5) });
    const convex = m.createConvexMeshFromBuffer(vectors, physics, 64, scale, 2);
    const convexGeometry = new m.PxConvexMeshGeometry(convex, new m.PxMeshScale(unit, rotation), new m.PxConvexMeshGeometryFlags(1));
    const geometries = [new m.PxBoxGeometry(.5, .5, .5), new m.PxSphereGeometry(.5), new m.PxCapsuleGeometry(.35, .4), convexGeometry];
    let terrain = new m.PxBoxGeometry(200, .5, 200), terrainPose = pose(0, -.5, 0);
    if (spec.mesh) {
        const vs = new m.PxVec3Vector();
        for (const v of [{ x: -12, y: 0, z: -12 }, { x: -12, y: 0, z: 12 }, { x: 12, y: .5, z: -12 }, { x: 12, y: .5, z: 12 }])
            vs.push_back(v);
        const ptr = m._malloc(24);
        m.HEAPU32.set([0, 1, 2, 2, 1, 3], ptr >> 2);
        const mesh = m.createTriMesh(vs, ptr, 6, false, scale, physics);
        terrain = new m.PxTriangleMeshGeometry(mesh, new m.PxMeshScale(unit, rotation), new m.PxMeshGeometryFlags(1));
        terrainPose = pose();
    }
    if (spec.heightfield) {
        const count = 32 * 32, h = m._malloc(count * 4), f = m._malloc(count);
        m.HEAPF32.fill(0, h >> 2, (h >> 2) + count);
        m.HEAPU8.fill(0, f, f + count);
        const field = m.createHeightField(32, 32, h, f, allocator, scale, physics);
        terrain = new m.PxHeightFieldGeometry(field, new m.PxMeshGeometryFlags(1), .01, 1, 1);
        terrainPose = pose(-16, 0, -16);
    }
    const simulationFilter = { word0: 1, word1: 0xffffffff, word2: 1 | 4 | 8 | 16 | 32 | 512 | 1024 | 2048, word3: 0 };
    const floor = physics.createRigidStatic(terrainPose), floorShape = physics.createShape(terrain, material, true, flags);
    floorShape.setSimulationFilterData(simulationFilter);
    floorShape.setQueryFilterData(simulationFilter);
    floorShape.setUUID(100);
    floor.attachShape(floorShape);
    scene.addActor(floor, null);
    const bodies = [];
    for (let i = 0; i < 24; i++) {
        const body = physics.createRigidDynamic(pose((i % 4) * 1.05 - 1.5, 1 + Math.floor(i / 4) * 1.04, (i % 2) * .1));
        const shape = physics.createShape(spec.convex ? convexGeometry : geometries[i % 4], material, true, flags);
        shape.setUUID(i + 1);
        shape.setSimulationFilterData(simulationFilter);
        shape.setQueryFilterData({ word0: 1, word1: 0xffffffff, word2: 0, word3: 0 });
        body.attachShape(shape);
        body.setMassAndUpdateInertia(1);
        body.setSleepThreshold(.005);
        scene.addActor(body, null);
        bodies.push(body);
    }
    const trigger = physics.createRigidStatic(pose(0, 2, 0)), triggerShape = physics.createShape(new m.PxBoxGeometry(3, .3, 3), material, true, new m.PxShapeFlags(6));
    triggerShape.setSimulationFilterData(simulationFilter);
    triggerShape.setUUID(101);
    trigger.attachShape(triggerShape);
    scene.addActor(trigger, null);
    if (spec.ccd) {
        bodies[0].setRigidBodyFlag(4, true);
        bodies[0].setLinearVelocity({ x: 30, y: -40, z: 0 });
    }
    let controller;
    if (spec.controller) {
        const d = new m.PxCapsuleControllerDesc();
        d.radius = .3;
        d.height = 1;
        d.setMaterial(material);
        d.position = { x: -3, y: 2, z: 1 };
        d.setreportCallBackBehavior();
        assert.ok(d.isValid());
        controller = scene.createControllerManager().createController(d);
    }
    const state = crypto.createHash('sha256'), queries = [], checkpoints = [];
    let stepMs = 0;
    for (let frame = 0; frame < 360; frame++) {
        if (frame === 90)
            bodies[0].addForce({ x: 3, y: 7, z: 1 });
        if (frame === 180) {
            bodies[3].setRigidBodyFlag(1, true);
            bodies[1].setLinearVelocity({ x: 1, y: 2, z: 0 });
            bodies[2].setAngularVelocity({ x: .1, y: 1, z: .3 });
        }
        if (frame >= 180 && frame < 240)
            bodies[3].setKinematicTarget({ x: 2, y: 2 + (frame - 180) * .01, z: 1 }, rotation);
        if (frame === 240) {
            bodies[3].setRigidBodyFlag(1, false);
            bodies[3].wakeUp();
            scene.removeActor(bodies[23], true);
            scene.addActor(bodies[23], null);
        }
        if (controller) {
            const flags = controller.move({ x: .018, y: -.04, z: Math.sin(frame * .03) * .01 }, .001, 1 / 60);
            state.update(JSON.stringify([plain(flags), plain(controller.getPosition())]));
        }
        const t = performance.now();
        scene.simulate(frame % 7 === 0 ? 1 / 30 : 1 / 60, true);
        scene.fetchResults(true);
        stepMs += performance.now() - t;
        const rows = bodies.map(b => [plain(b.getGlobalPose()), plain(b.getLinearVelocity()), plain(b.getAngularVelocity()), b.isSleeping()]);
        const nums = rows.flatMap(row => [...Object.values(row[0].translation), ...Object.values(row[0].rotation), ...Object.values(row[1]), ...Object.values(row[2])]);
        assert.ok(nums.every(Number.isFinite));
        state.update(Buffer.from(new Float64Array(nums).buffer));
        state.update(JSON.stringify(rows.map(r => r[3])));
        if (frame % 60 === 59) {
            checkpoints.push(rows.slice(0, 3));
            queries.push(plain(scene.raycastCloset({ x: 0, y: 15, z: 0 }, { x: 0, y: -1, z: 0 }, 30, 1, 0xffffffff)));
            for (const geometry of geometries)
                queries.push(plain(scene.sweepSingle(geometry, pose(-5, 2, 0), { x: 1, y: 0, z: 0 }, 10, 1, 0xffffffff, 0)));
        }
    }
    assert.notEqual(checkpoints[0][0][0].translation.y, 1, 'bodies must actually move');
    assert.ok(checkpoints.at(-1).some(row => row[0].translation.y > -.5), 'floor must support the bodies: ' + spec.name + ' ' + JSON.stringify(checkpoints.at(-1).map(r => r[0].translation)));
    assert.ok(events.length > 0, 'contact callbacks must be exercised');
    assert.ok(contactPointCount > 0, 'contact point payloads must be captured');
    return { name: spec.name, stateHash: state.digest('hex'), queries, checkpoints, eventHash: crypto.createHash('sha256').update(JSON.stringify(events, encode)).digest('hex'), eventCount: events.length, contactPointCount, diagnostics, timing: { stepMs }, coverage: observed };
}
(async () => {
    const cases = [];
    for (const spec of [{ name: 'mixed-legacy' }, { name: 'mixed-pcm', pcm: true }, { name: 'convex-legacy', convex: true }, { name: 'convex-pcm', convex: true, pcm: true }, { name: 'convex-ccd', convex: true, ccd: true }, { name: 'heightfield', heightfield: true }, { name: 'mesh-legacy', mesh: true }, { name: 'mesh-controller-pcm', mesh: true, controller: true, pcm: true }])
        cases.push(await run(spec));
    const result = { v8: process.versions.v8, cases };
    const behavior = rows => rows.map(({ timing, coverage, ...rest }) => rest);
    const baseline = JSON.parse(fs.readFileSync(baselinePath), decode);
    if (baseline.cases[0].behaviorHash) {
        const signatures = behavior(cases).map(item => ({ name: item.name, stateHash: item.stateHash, behaviorHash: crypto.createHash('sha256').update(JSON.stringify(item, encode)).digest('hex') }));
        assert.deepEqual(signatures, baseline.cases, 'physx behavior changed');
    }
    else
        assert.deepEqual(behavior(cases), behavior(baseline.cases), 'physx behavior changed');
    console.log(JSON.stringify(result, encode));
})().catch(e => { console.error(e); process.exitCode = 1; });
