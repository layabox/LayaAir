// node --test tests/physics3d/character-controller.test.cjs
// Runs the engine wrappers and physics substep against both shipped Bullet runtimes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { performance } = require('node:perf_hooks');
const root = path.resolve(__dirname, '../..');
const bulletRoot = 'src/layaAir/laya/Physics3D/Bullet/';

async function runtime(wasm) {
    const context = { window: {}, console, TextDecoder, DataView, Uint8Array, Laya: { WasmAdapter: {
        Memory: WebAssembly.Memory,
        instantiateWasm: (_, imports) => WebAssembly.instantiate(fs.readFileSync(path.join(root, 'src/layaAir/jsLibs/bullet.wasm')), imports)
    } } };
    vm.runInNewContext(fs.readFileSync(path.join(root, `src/layaAir/jsLibs/bullet${wasm ? '.wasm' : ''}.js`), 'utf8'), context);
    const initialized = context.window.Physics3D(256, { getWorldTransform() {}, setWorldTransform() {}, drawLine() {}, clearLine() {} });
    const native = wasm ? await initialized : initialized;
    // Copy WASM exports to allow lifetime instrumentation without modifying the binary.
    const bt = { ...native }, modules = new Map();
    function load(file) {
        if (modules.has(file)) return modules.get(file);
        const exports = {};
        modules.set(file, exports);
        const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018 }
        }).outputText;
        vm.runInNewContext(code, { exports, console, require(id) {
            if (id.endsWith('/Physics3DStatInfo')) return { Physics3DStatInfo: { addStatisticsInfo() {} } };
            if (id.endsWith('/Transform3D')) return { Transform3D: { TRANSFORM_WORLDPOSITION: 1, TRANSFORM_WORLDQUATERNION: 2, TRANSFORM_WORLDSCALE: 4 } };
            const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), id + '.ts'));
            if (/\/(btStatics|btCollider|btCharacterCollider|btColliderShape|btCapsuleColliderShape|Vector3|Vector4|MathUtils3D|ECharacterCapable|EPhysicsStatisticsInfo)\.ts$/.test(target)) return load(target);
            return {};
        } }, { filename: file });
        return exports;
    }
    const { btStatics } = load(bulletRoot + 'btStatics.ts');
    btStatics.bt = bt;
    const { Vector3 } = load('src/layaAir/laya/maths/Vector3.ts');
    const { btCollider: Collider } = load(bulletRoot + 'Collider/btCollider.ts');
    const { btCharacterCollider: Character } = load(bulletRoot + 'Collider/btCharacterCollider.ts');
    const { btCapsuleColliderShape: Capsule } = load(bulletRoot + 'Shape/btCapsuleColliderShape.ts');
    const { btCompoundColliderShape: Compound } = load(bulletRoot + 'Shape/btCompoundColliderShape.ts');
    const { btPhysicsManager: Manager } = load(bulletRoot + 'btPhysicsManager.ts');
    Collider.__init__(); Character.__init__();
    const vec = p => [bt.btVector3_x(p), bt.btVector3_y(p), bt.btVector3_z(p)];
    function scene(angle = 20, stepHeight = .1, options = {}) {
        const config = bt.btDefaultCollisionConfiguration_create(), dispatcher = bt.btCollisionDispatcher_create(config);
        const broadphase = bt.btDbvtBroadphase_create(), solver = bt.btSequentialImpulseConstraintSolver_create();
        const world = bt.btDiscreteDynamicsWorld_create(dispatcher, broadphase, solver, config);
        bt.btOverlappingPairCache_setInternalGhostPairCallback(bt.btDbvtBroadphase_getOverlappingPairCache(broadphase), bt.btGhostPairCallback_create());
        const manager = Object.create(Manager.prototype);
        Object.assign(manager, { _btCollisionWorld: world, _btDiscreteDynamicsWorld: world, _characters: [], _updateCount: 0 });
        const v = (x, y, z) => bt.btVector3_create(x, y, z);
        const floor = bt.btCollisionObject_create();
        let terrainMesh = 0, triangleCount = 0;
        let floorShape;
        if (options.mesh) {
            terrainMesh = bt.btTriangleMesh_create();
            const n = options.grid || 128, size = options.size || 40;
            const a = v(0, 0, 0), b = v(0, 0, 0), c = v(0, 0, 0);
            const height = options.height || ((x, z) => .12 * Math.sin(x * .7) * Math.cos(z * .5));
            function triangle(p, q, r) {
                for (const [pointer, point] of [[a, p], [b, q], [c, r]])
                    bt.btVector3_setValue(pointer, point[0], height(...point), point[1]);
                bt.btTriangleMesh_addTriangle(terrainMesh, a, b, c, false); triangleCount++;
            }
            for (let x = 0; x < n; x++) for (let z = 0; z < n; z++) {
                const x0 = x * size / n - size / 2, x1 = (x + 1) * size / n - size / 2;
                const z0 = z * size / n - size / 2, z1 = (z + 1) * size / n - size / 2;
                if (options.hole && Math.abs((x0 + x1) / 2) < 1 && Math.abs((z0 + z1) / 2) < 1) continue;
                triangle([x0, z0], [x0, z1], [x1, z0]);
                triangle([x1, z0], [x0, z1], [x1, z1]);
            }
            floorShape = bt.btBvhTriangleMeshShape_create(terrainMesh);
        } else floorShape = bt.btBoxShape_create(v(20, .5, 20));
        const floorTransform = bt.btCollisionObject_getWorldTransform(floor);
        bt.btTransform_setIdentity(floorTransform);
        bt.btTransform_setRotation(floorTransform, bt.btQuaternion_create(0, 0, Math.sin(angle * Math.PI / 360), Math.cos(angle * Math.PI / 360)));
        bt.btCollisionObject_setWorldTransform(floor, floorTransform);
        bt.btCollisionObject_setCollisionShape(floor, floorShape);
        bt.btCollisionObject_setCollisionFlags(floor, 1);
        bt.btCollisionWorld_addCollisionObject(world, floor, 1, -1);
        const characters = [], shapes = [];
        for (let i = 0; i < (options.count || 1); i++) {
            const character = new Character(manager), shape = new Capsule();
            const width = Math.ceil(Math.sqrt(options.count || 1));
            const position = options.position || new Vector3((i % width - (width - 1) / 2) * 2,
                3, (Math.floor(i / width) - (width - 1) / 2) * 2);
            Object.assign(character, { active: true, componentEnable: true, _transform: {
                position, rotation: { x: 0, y: 0, z: 0, w: 1 }, getWorldLossyScale: () => new Vector3(1, 1, 1)
            } });
            shape.setRadius(.5); shape.setHeight(2);
            character.setColliderShape(shape);
            character.setStepOffset(stepHeight); character.setSlopeLimit(45);
            character.setGravity(new Vector3(0, -9.8, 0));
            characters.push(character); shapes.push(shape);
        }
        const character = characters[0], shape = shapes[0];
        const pos = () => vec(bt.btKinematicCharacterController_getCurrentPosition(character._btKinematicCharacter));
        function step(count = 1, fixed = true) {
            for (let i = 0; i < count; i++) {
                if (fixed) manager._simulate(1 / 60);
                else bt.btDiscreteDynamicsWorld_stepSimulation(world, 1 / 60, 1, 1 / 60);
                for (const c of characters)
                    c._transform.position.setValue(...vec(bt.btKinematicCharacterController_getCurrentPosition(c._btKinematicCharacter)));
            }
        }
        function removeFloor() { bt.btCollisionWorld_removeCollisionObject(world, floor); }
        function destroy() {
            for (let i = 0; i < characters.length; i++) {
                if (characters[i]._isSimulate) manager.removeCollider(characters[i]);
                shapes[i]._btCollider = null; characters[i].destroy(); shapes[i].destroy();
            }
            removeFloor(); bt.btCollisionObject_destroy(floor); bt.btCollisionShape_destroy(floorShape);
            if (terrainMesh) bt.btStridingMeshInterface_destroy(terrainMesh);
            bt.btCollisionWorld_destroy(world); bt.btCollisionDispatcher_destroy(dispatcher);
            bt.btDbvtBroadphase_destroy(broadphase); bt.btDefaultCollisionConfiguration_destroy(config);
        }
        function moveFloor(x, y, z, tilt = angle) {
            removeFloor();
            const transform = bt.btCollisionObject_getWorldTransform(floor);
            bt.btVector3_setValue(floorPosition, x, y, z);
            bt.btTransform_setOrigin(transform, floorPosition);
            bt.btQuaternion_setValue(floorRotation, 0, 0, Math.sin(tilt * Math.PI / 360), Math.cos(tilt * Math.PI / 360));
            bt.btTransform_setRotation(transform, floorRotation);
            bt.btCollisionObject_setWorldTransform(floor, transform);
            bt.btCollisionWorld_addCollisionObject(world, floor, 1, -1);
        }
        const floorPosition = v(0, 0, 0), floorRotation = bt.btQuaternion_create(0, 0, 0, 1);
        return { character, shape, characters, triangleCount, manager, floor, world, pos, step, removeFloor, moveFloor, destroy };
    }
    return { bt, Vector3, Capsule, Compound, scene, vec };
}

for (const wasm of [true, false]) {
    test(`Bullet ${wasm ? 'WASM' : 'JS'} character regressions`, async t => {
        const { bt, Vector3, Capsule, Compound, scene, vec } = await runtime(wasm);
        if (process.env.CHARACTER_TERRAIN_BENCHMARK) {
            const counts = process.env.CHARACTER_TERRAIN_COUNTS
                ? process.env.CHARACTER_TERRAIN_COUNTS.split(',').map(Number) : [1, 16, 64];
            for (const count of counts) {
                const a = scene(0, .1, { mesh: true, count }), b = scene(0, .1, { mesh: true, count });
                const corrected = [], raw = [], delta = [];
                try {
                    a.step(300); b.step(300);
                    // Match the resting native workload: raw Bullet has gravity disabled
                    // permanently; the wrapper disables/restores it around each substep.
                    b.characters.forEach(c => c.setGravity(new Vector3()));
                    const batch = (s, fixed) => {
                        const start = performance.now(); s.step(300, fixed);
                        return (performance.now() - start) / 300;
                    };
                    // Single-character JS needs more calls to reach steady V8 tiers.
                    if (count === 1) { a.step(10000); b.step(10000, false); }
                    else { batch(a, true); batch(b, false); }
                    for (let i = 0; i < 7; i++) {
                        let c, r;
                        if (i % 2) { r = batch(b, false); c = batch(a, true); }
                        else { c = batch(a, true); r = batch(b, false); }
                        corrected.push(c); raw.push(r); delta.push((c - r) * 1000 / count);
                    }
                    const sweep = bt.btCollisionWorld_convexSweepTest, ray = bt.btCollisionWorld_rayTest;
                    let sweeps = 0, rays = 0;
                    try {
                        bt.btCollisionWorld_convexSweepTest = (...args) => { sweeps++; return sweep(...args); };
                        bt.btCollisionWorld_rayTest = (...args) => { rays++; return ray(...args); };
                        a.step(60);
                    } finally { bt.btCollisionWorld_convexSweepTest = sweep; bt.btCollisionWorld_rayTest = ray; }
                    const median = values => values.sort((a, b) => a - b)[3];
                    t.diagnostic(JSON.stringify({ terrainBenchmark: true, runtime: wasm ? 'WASM' : 'JS', triangles: a.triangleCount, characters: count,
                        correctedMs: +median(corrected).toFixed(4), rawMs: +median(raw).toFixed(4), overheadUsPerCharacter: +median(delta).toFixed(2), raysOver60Steps: rays, sweepsOver60Steps: sweeps }));
                } finally { a.destroy(); b.destroy(); }
            }
        }
        if (process.env.CHARACTER_BENCHMARK) {
            for (const mode of ['idle', 'walk']) {
                const s = scene(0), samples = [];
                try {
                    s.step(300);
                    if (mode === 'walk') s.character.move(new Vector3(.00001, 0, 0));
                    const batch = fixed => {
                        const start = performance.now(); s.step(2000, fixed);
                        return (performance.now() - start) * 1000 / 2000;
                    };
                    batch(true); batch(false);
                    for (let i = 0; i < 7; i++) {
                        if (i % 2) { const raw = batch(false); samples.push(batch(true) - raw); }
                        else { const corrected = batch(true); samples.push(corrected - batch(false)); }
                    }
                    samples.sort((a, b) => a - b);
                    t.diagnostic(`${mode}: median wrapper overhead ${samples[3].toFixed(2)} us per character-step (flat box, 7 paired batches)`);
                } finally { s.destroy(); }
            }
        }
        await t.test('capsules match legacy geometry, inertia and offset scale across axes and scales', () => {
            const s = scene(0);
            s.manager.removeCollider(s.character); s.removeFloor();
            const object = bt.btCollisionObject_create(), zero = bt.btVector3_create(0, 0, 0);
            bt.btTransform_setIdentity(bt.btCollisionObject_getWorldTransform(object));
            const from = bt.btVector3_create(0, 0, 0), to = bt.btVector3_create(0, 0, 0);
            const callback = bt.ClosestRayResultCallback_create(from, to);
            const inertia = bt.btVector3_create(0, 0, 0);
            function signature(nativeShape) {
                bt.btCollisionObject_setCollisionShape(object, nativeShape);
                bt.btCollisionWorld_addCollisionObject(s.world, object, 1, -1);
                const result = [];
                try {
                    for (let axis = 0; axis < 3; axis++) for (const offset of [0, .2]) {
                        const p = [offset, offset, offset], q = [...p]; p[axis] = -10; q[axis] = 10;
                        bt.btVector3_setValue(from, ...p); bt.btVector3_setValue(to, ...q);
                        bt.ClosestRayResultCallback_set_m_rayFromWorld(callback, from);
                        bt.ClosestRayResultCallback_set_m_rayToWorld(callback, to);
                        bt.RayResultCallback_set_m_collisionObject(callback, 0);
                        bt.RayResultCallback_set_m_closestHitFraction(callback, 1);
                        bt.btCollisionWorld_rayTest(s.world, from, to, callback);
                        result.push(bt.RayResultCallback_hasHit(callback) ? bt.RayResultCallback_get_m_closestHitFraction(callback) : 1);
                    }
                    bt.btCollisionShape_calculateLocalInertia(nativeShape, 2, inertia);
                    return [...result, ...vec(inertia)];
                } finally { bt.btCollisionWorld_removeCollisionObject(s.world, object); }
            }
            const constructors = ['btCapsuleShapeX_create', 'btCapsuleShape_create', 'btCapsuleShapeZ_create'];
            try {
                for (let axis = 0; axis < 3; axis++) for (const [radius, height] of [[.3, 1.8], [.5, 1]]) {
                    for (const scale of [new Vector3(1, 1, 1), new Vector3(2, 3, .5), new Vector3(-2, 3, -.5)]) {
                        const capsule = new Capsule(), expected = bt[constructors[axis]](radius, height - 2 * radius);
                        try {
                            const fixed = [scale.x, scale.y, scale.z], transverse = [0, 1, 2].filter(i => i !== axis);
                            fixed[transverse[0]] = fixed[transverse[1]] = Math.max(fixed[transverse[0]], fixed[transverse[1]]);
                            bt.btVector3_setValue(zero, ...fixed); bt.btCollisionShape_setLocalScaling(expected, zero);
                            capsule.setRadius(radius); capsule.setHeight(height); capsule.setUpAxis(axis); capsule.setWorldScale(scale);
                            const baseline = signature(expected), ordinary = signature(capsule._btShape);
                            assert.ok(ordinary.every((v, i) => Math.abs(v - baseline[i]) < 1e-9), 'ordinary capsule must match old dimensions exactly');
                            const offset = new Vector3(); capsule._getOffsetScale(offset);
                            assert.deepEqual([offset.x, offset.y, offset.z], vec(bt.btCollisionShape_getLocalScaling(expected)));
                            capsule._enableCharacterResizing();
                            const character = signature(capsule._btShape);
                            assert.ok(character.every((v, i) => Math.abs(v - baseline[i]) < 1e-5), `character axis=${axis},radius=${radius},height=${height},scale=${JSON.stringify(scale)},baseline=${baseline},actual=${character}`);
                            capsule._getOffsetScale(offset);
                            assert.ok([offset.x, offset.y, offset.z].every((v, i) => v === Math.abs(fixed[i])));
                            capsule.setHeight(height + .2); capsule.setHeight(height);
                            capsule.setRadius(radius + .1); capsule.setRadius(radius);
                            capsule.setWorldScale(scale);
                            const restored = signature(capsule._btShape);
                            assert.ok(restored.every((v, i) => Math.abs(v - baseline[i]) < 1e-5), 'repeated mirrored dimension edits must not accumulate sign flips');
                        } finally { capsule.destroy(); bt.btCollisionShape_destroy(expected); }
                    }
                }
                // Ordinary capsules retain even the legacy below-diameter geometry.
                const capsule = new Capsule(), expected = bt.btCapsuleShape_create(.5, -.4);
                try {
                    capsule.setRadius(.5); capsule.setHeight(.6);
                    bt.btCollisionShape_calculateLocalInertia(expected, 2, inertia); const baseline = vec(inertia);
                    bt.btCollisionShape_calculateLocalInertia(capsule._btShape, 2, inertia);
                    assert.deepEqual(vec(inertia), baseline);
                    capsule._enableCharacterResizing();
                    bt.btCollisionShape_calculateLocalInertia(capsule._btShape, 2, inertia);
                    assert.ok(vec(inertia).every((v, i) => Math.abs(v - baseline[i]) < 1e-9), 'below-diameter input must not silently become a sphere');
                } finally { capsule.destroy(); bt.btCollisionShape_destroy(expected); }
                // Compound children retain the ordinary capsule representation.
                const child = new Capsule(), compound = new Compound();
                const expectedChild = bt.btCapsuleShape_create(.3, 1.2), expectedCompound = bt.btCompoundShape_create();
                try {
                    child.setRadius(.3); child.setHeight(1.8);
                    const localScale = new Vector3(2, 3, .5), position = new Vector3(.2, .5, -.1);
                    const rotation = { x: 0, y: 0, z: Math.sin(.2), w: Math.cos(.2) };
                    compound.addChildShapeWithTransform(child, position, rotation, localScale);
                    bt.btVector3_setValue(zero, 2, 3, 2); bt.btCollisionShape_setLocalScaling(expectedChild, zero);
                    const transform = bt.btTransform_create(); bt.btTransform_setIdentity(transform);
                    bt.btVector3_setValue(zero, position.x, position.y, position.z); bt.btTransform_setOrigin(transform, zero);
                    bt.btTransform_setRotation(transform, bt.btQuaternion_create(rotation.x, rotation.y, rotation.z, rotation.w));
                    bt.btCompoundShape_addChildShape(expectedCompound, transform, expectedChild);
                    const baseline = signature(expectedCompound), actual = signature(compound._btShape);
                    assert.ok(actual.every((v, i) => Math.abs(v - baseline[i]) < 1e-9), 'compound capsule geometry must match the legacy native construction');
                    assert.equal(child._characterResizing, false);
                } finally {
                    compound.destroy(); child.destroy();
                    bt.btCollisionShape_destroy(expectedCompound); bt.btCollisionShape_destroy(expectedChild);
                }
            } finally { bt.btCollisionObject_destroy(object); s.destroy(); }
        });
        await t.test('triangle terrain: edges, holes and multiple idle characters retain only real support', () => {
            for (const position of [new Vector3(0, 3, 0), new Vector3(19.8, 3, 0)]) {
                const s = scene(0, .1, { mesh: true, position });
                try {
                    assert.equal(s.triangleCount, 32768);
                    s.step(240); const settled = s.pos(); s.step(600);
                    assert.ok(s.pos().every((v, i) => Math.abs(v - settled[i]) < 1e-5), 'interior/edge must hold still');
                    s.character.move(new Vector3(.04, 0, 0)); s.step(30); s.character.move(new Vector3()); s.step(90);
                    if (position.x > 10) assert.ok(s.pos()[1] < settled[1] - 2, 'walking off mesh edge must fall');
                    s.moveFloor(50, 0, 0); s.step(60);
                    assert.equal(s.character._supportObject, 0);
                } finally { s.destroy(); }
            }
            const hole = scene(0, .1, { mesh: true, hole: true });
            try { hole.step(120); assert.ok(hole.pos()[1] < -5, 'hole must not acquire support'); }
            finally { hole.destroy(); }
            const crowd = scene(0, .1, { mesh: true, count: 16 });
            try {
                crowd.step(240);
                const positions = crowd.characters.map(c => vec(bt.btKinematicCharacterController_getCurrentPosition(c._btKinematicCharacter)));
                crowd.step(180);
                crowd.characters.forEach((c, i) => {
                    const p = vec(bt.btKinematicCharacterController_getCurrentPosition(c._btKinematicCharacter));
                    assert.ok(p.every((v, j) => Math.abs(v - positions[i][j]) < 1e-5), 'shared query callbacks must not mix supports');
                });
                crowd.removeFloor(); crowd.step();
                crowd.characters.forEach(c => assert.ok(c.getVerticalVel() < 0));
            } finally { crowd.destroy(); }
        });
        await t.test('continuously descending triangle ground cannot leave an idle character suspended', () => {
            const s = scene(0, .1, { mesh: true, height: () => 0 });
            try {
                s.step(180); const before = s.pos()[1];
                for (let i = 1; i <= 60; i++) {
                    s.moveFloor(0, -.01 * i, 0); s.step();
                    assert.ok(s.pos()[1] < before - .01 * i + .03, 'character must follow falling contact, not hold its old height');
                }
                s.step(120);
                const footGap = s.pos()[1] - 1 + .6;
                assert.ok(footGap <= .001 && footGap >= -.05, `foot gap above moved mesh=${footGap}`);
            } finally { s.destroy(); }
        });
        await t.test('cached triangle support releases immediately after small downward motion or rotation', () => {
            for (const mode of ['drop', 'drop-gap', 'rotate', 'small-rotation', 'translate']) {
                const s = scene(0, .1, { mesh: true, height: () => 0, position: new Vector3(2, 3, 0) });
                try {
                    s.step(180); const before = s.pos();
                    assert.ok(s.character._supportObject);
                    if (mode === 'drop') s.moveFloor(0, -.02, 0);
                    if (mode === 'drop-gap') s.moveFloor(0, -.045, 0);
                    if (mode === 'rotate') s.moveFloor(0, 0, 0, 70);
                    if (mode === 'small-rotation') s.moveFloor(0, 0, 0, -.5);
                    if (mode === 'translate') s.moveFloor(50, 0, 0);
                    const beforeStep = s.character._beforeSimulation;
                    s.character._beforeSimulation = function(world) {
                        beforeStep.call(this, world);
                        assert.equal(this._gravitySuppressed, false, `${mode}: changed floor must not suppress gravity`);
                    };
                    try { s.step(); } finally { s.character._beforeSimulation = beforeStep; }
                    assert.ok(s.character.getVerticalVel() < 0 || s.pos()[1] < before[1] - .001,
                        `${mode}: first substep must fall or resolve to the changed floor`);
                    s.step(120);
                    if (mode === 'drop') assert.ok(s.pos()[1] < before[1] - .015, 'must settle on the lower mesh');
                    if (mode === 'translate') assert.ok(s.pos()[1] < before[1] - 2);
                    if (mode === 'drop-gap') assert.ok(s.pos()[1] - 1 + .045 <= .001, 'no gap may remain above lowered ground');
                } finally { s.destroy(); }
            }
        });
        await t.test('idle support uses a fresh ray each step and removed ground releases on the first step', () => {
            const s = scene();
            const sweep = bt.btCollisionWorld_convexSweepTest, ray = bt.btCollisionWorld_rayTest;
            let sweeps = 0, rays = 0;
            try {
                s.step(180);
                bt.btCollisionWorld_convexSweepTest = (...args) => { sweeps++; return sweep(...args); };
                bt.btCollisionWorld_rayTest = (...args) => { rays++; return ray(...args); };
                s.step(120);
                assert.equal(sweeps, 0, 'stable support must not repeat full sweeps');
                assert.equal(rays, 120, 'cached support must be revalidated every substep');
                s.removeFloor();
                s.step();
                assert.equal(rays, 121, 'ground removal must be checked on the next substep');
                assert.equal(s.character._supportObject, 0, 'removed support must be discarded');
                assert.ok(s.character.getVerticalVel() < 0, 'gravity must resume in the first unsupported substep');
            } finally { bt.btCollisionWorld_convexSweepTest = sweep; bt.btCollisionWorld_rayTest = ray; s.destroy(); }
        });
        await t.test('dimension and scale changes invalidate cached support', () => {
            const s = scene(0);
            const sweep = bt.btCollisionWorld_convexSweepTest;
            let sweeps = 0;
            try {
                s.step(180);
                assert.ok(s.character._supportObject);
                s.character.setHeight(2.1);
                assert.equal(s.character._supportObject, 0, 'resize must discard the old contact point');
                s.step(180);
                assert.ok(s.character._supportObject);
                s.character._transform.getWorldLossyScale = () => new Vector3(1.1, 1.1, 1.1);
                s.character._derivePhysicsTransformation(true);
                bt.btCollisionWorld_convexSweepTest = (...args) => { sweeps++; return sweep(...args); };
                s.character._hasStaticSupport(s.world);
                assert.equal(sweeps, 1, 'native scaling changes must force a full sweep');
            } finally { bt.btCollisionWorld_convexSweepTest = sweep; s.destroy(); }
        });
        await t.test('20 degree slope: reproduce drift, then hold still for 600 steps', () => {
            const s = scene();
            try {
                s.step(300, false); const before = s.pos(); s.step(600, false);
                const rawDrift = s.pos()[0] - before[0];
                assert.ok(rawDrift < -.1, `fixture must reproduce native slope drift: ${rawDrift}`);
                s.step(120); const settled = s.pos(); s.step(600);
                const drift = s.pos()[0] - settled[0];
                assert.ok(Math.abs(drift) < 1e-6, `idle drift: ${drift}`);
                assert.ok(Math.abs(s.pos()[1] - settled[1]) < 1e-6);
                t.diagnostic(`native dx=${rawDrift}; corrected dx=${drift} over 600 steps`);
            } finally { s.destroy(); }
        });
        await t.test('jump, persistent walking, stop and removed support release the lock', () => {
            const s = scene();
            try {
                s.step(180); const grounded = s.pos();
                s.character.jump(new Vector3(0, 6, 0)); s.step(12);
                assert.ok(s.pos()[1] > grounded[1] + .3, 'jump must rise');
                s.step(240); const start = s.pos();
                s.character.move(new Vector3(.02, 0, 0)); s.step(60);
                assert.ok(s.pos()[0] > start[0] + .5, 'persistent walk must move uphill');
                s.character.move(new Vector3()); s.step(120); const stop = s.pos(); s.step(120);
                assert.ok(Math.abs(s.pos()[0] - stop[0]) < 1e-6, 'zero walk must stop');
                s.removeFloor(); s.step(60);
                assert.ok(s.pos()[1] < stop[1] - 1, 'removed support must not leave the character floating');
            } finally { s.destroy(); }
        });
        await t.test('teleporting an idle grounded character into the air resumes falling', () => {
            const s = scene();
            try {
                s.step(180);
                s.character.setPosition(new Vector3(0, 8, 0));
                s.step(30);
                assert.ok(s.pos()[1] < 7, 'stale onGround must not suppress gravity after teleport');
                s.step(240); const landed = s.pos(); s.step(120);
                assert.ok(Math.abs(s.pos()[0] - landed[0]) < 1e-6, 'landing must restore idle support');
            } finally { s.destroy(); }
        });
        await t.test('steep slopes, triggers, masks and kinematic supports do not lock', () => {
            for (const condition of ['steep', 'trigger', 'mask', 'kinematic']) {
                const s = scene();
                try {
                    s.step(180);
                    if (condition === 'steep') s.character.setSlopeLimit(10);
                    if (condition === 'trigger') bt.btCollisionObject_setCollisionFlags(s.floor, 5);
                    if (condition === 'mask') s.character._canCollideWith = 2;
                    if (condition === 'kinematic') bt.btCollisionObject_setCollisionFlags(s.floor, 2);
                    assert.equal(s.character._hasStaticSupport(s.world), false, condition);
                    s.character._beforeSimulation(s.world);
                    assert.equal(s.character._gravitySuppressed, false, condition);
                    s.step(60);
                } finally { s.destroy(); }
            }
        });
        await t.test('resizing in ascent and descent preserves velocity and the airborne trajectory', () => {
            for (const phase of ['ascent', 'descent']) {
                const a = scene(0), b = scene(0);
                try {
                    a.step(180); b.step(180);
                    a.character.jump(new Vector3(1, 8, .5)); b.character.jump(new Vector3(1, 8, .5));
                    const frames = phase === 'ascent' ? 12 : 60;
                    a.step(frames); b.step(frames);
                    const velocity = a.character.getVerticalVel(), controller = a.character._btKinematicCharacter;
                    assert.ok(phase === 'ascent' ? velocity > 0 : velocity < 0);
                    const position = a.pos();
                    // Simulate a render transform that has not caught up to physics.
                    a.character._transform.position.y += .04;
                    for (const height of [2.5, 1, 1.8]) {
                        a.character.setHeight(height);
                        assert.deepEqual(vec(bt.btTransform_getOrigin(bt.btCollisionObject_getWorldTransform(a.character._btCollider))), position);
                        assert.equal(a.character._btKinematicCharacter, controller);
                        assert.equal(a.character.getVerticalVel(), velocity);
                        assert.equal(a.character.isGrounded(), false);
                    }
                    a.step(6); b.step(6);
                    assert.ok(a.pos().every((value, i) => Math.abs(value - b.pos()[i]) < 1e-8), phase);
                    assert.equal(a.character.getVerticalVel(), b.character.getVerticalVel());
                } finally { a.destroy(); b.destroy(); }
            }
        });
        await t.test('moving and jumping trajectories match native simulation and skip support sweeps', () => {
            for (const mode of ['walk', 'jump']) {
                const a = scene(0), b = scene(0);
                const sweep = bt.btCollisionWorld_convexSweepTest;
                let sweeps = 0;
                try {
                    a.step(180); b.step(180);
                    if (mode === 'walk') {
                        a.character.move(new Vector3(.02, 0, 0)); b.character.move(new Vector3(.02, 0, 0));
                    } else {
                        a.character.jump(new Vector3(0, 6, 0)); b.character.jump(new Vector3(0, 6, 0));
                    }
                    bt.btCollisionWorld_convexSweepTest = (...args) => { sweeps++; return sweep(...args); };
                    a.step(30); b.step(30, false);
                    assert.deepEqual(a.pos(), b.pos(), mode);
                    assert.equal(sweeps, 0, 'no wrapper support sweep while moving or airborne');
                } finally { bt.btCollisionWorld_convexSweepTest = sweep; a.destroy(); b.destroy(); }
            }
        });
        await t.test('live dimensions refresh contacts, retain the controller and keep world scale', () => {
            const s = scene(0, .1);
            const names = ['btDynamicsWorld_removeAction', 'btCollisionWorld_removeCollisionObject', 'btCollisionObject_setCollisionShape',
                'btKinematicCharacterController_destroy', 'btKinematicCharacterController_create', 'btCollisionWorld_addCollisionObject',
                'btDynamicsWorld_addAction', 'btCollisionShape_destroy'];
            const original = Object.fromEntries(names.map(name => [name, bt[name]])), calls = [];
            try {
                s.step(180); const standing = s.pos()[1];
                for (const name of names) bt[name] = (...args) => { calls.push(name); return original[name](...args); };
                s.character.setHeight(3);
                const index = name => calls.indexOf(name);
                assert.equal(calls.includes('btKinematicCharacterController_destroy'), false);
                assert.equal(calls.includes('btKinematicCharacterController_create'), false);
                assert.ok(index('btCollisionWorld_removeCollisionObject') < index('btCollisionObject_setCollisionShape'));
                assert.ok(index('btCollisionObject_setCollisionShape') < index('btDynamicsWorld_addAction'));
                assert.equal(calls.includes('btCollisionShape_destroy'), false);
                assert.equal(s.manager._characters.length, 1);
                s.step(120); assert.ok(s.pos()[1] > standing + .4, 'taller capsule must resolve against the floor immediately');
                s.character.setHeight(1.2); s.step(120);
                assert.ok(s.pos()[1] < standing - .3, 'short capsule must settle lower');
                s.character._transform.getWorldLossyScale = () => new Vector3(2, 2, 2);
                s.character._derivePhysicsTransformation(true);
                s.character.setRadius(.3);
                const offsetScale = new Vector3();
                s.shape._getOffsetScale(offsetScale);
                assert.ok(offsetScale.equal(new Vector3(2, 2, 2)), 'offset scale must exclude dimension scaling');
                assert.ok(s.shape._worldScale.equal(new Vector3(2, 2, 2)));
                assert.ok(vec(bt.btCollisionShape_getLocalScaling(s.shape._btShape)).every(Number.isFinite));
                s.character.move(new Vector3(.01, 0, 0));
                for (let i = 0; i < 12; i++) { s.character.setHeight(i % 2 ? 1.2 : 2); s.step(); }
                assert.equal(s.shape._destroyed, false); assert.equal(s.manager._characters.length, 1);
                const moving = s.pos()[0]; s.step(30); assert.ok(s.pos()[0] > moving + .2);
                const retainedController = s.character._btKinematicCharacter;
                const group = s.character._collisionGroup, mask = s.character._canCollideWith;
                s.manager.removeCollider(s.character); s.character.componentEnable = false; calls.length = 0;
                s.character.setHeight(3);
                assert.equal(calls.includes('btDynamicsWorld_addAction'), false, 'disabled character must stay out of world');
                assert.ok(s.shape._worldScale.equal(new Vector3(2, 2, 2)));
                assert.ok(vec(bt.btCollisionShape_getLocalScaling(s.shape._btShape)).every(Number.isFinite));
                assert.equal(s.character._btKinematicCharacter, retainedController);
                assert.equal(s.character._collisionGroup, group); assert.equal(s.character._canCollideWith, mask);
                s.character.componentEnable = true; s.manager.addCollider(s.character); s.step(60);
                assert.equal(s.manager._characters.length, 1);
                assert.ok(s.pos().every(Number.isFinite));
            } finally { Object.assign(bt, original); s.destroy(); }
        });
    });
}
