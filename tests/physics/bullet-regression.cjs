// node tests/physics/bullet-regression.cjs [source.js] [baseline-result.json]
// Defaults to the checked-in pre-optimization fixture. ELECTRON_RUN_AS_NODE=1 is supported.
// PHYSICS_COVERAGE=1 counts fixed entry calls in a temporary in-memory copy only.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto'), { performance } = require('node:perf_hooks');
const encode = (_key, value) => Object.is(value, -0) ? { __float64: '-0' } : value;
const decode = (_key, value) => value && typeof value === 'object' && value.__float64 === '-0' ? -0 : value;
const path = require('node:path');
const sourcePath = process.argv[2] || path.join(__dirname, '../../src/layaAir/jsLibs/bullet.js'), baselinePath = process.argv[3] || path.join(__dirname, 'bullet-behavior.json');
let source = fs.readFileSync(sourcePath, 'utf8');
// Capture coordinates passed to the JS debug-line import, which normally logs only its name.
const debugImport = "var drawLine=()=>{console.log('drawLine')};";
assert.ok(source.includes(debugImport), 'Bullet debug import layout changed');
source = source.replace(debugImport, "var drawLine=(...args)=>{console.log('drawLine',...args)};");
const targets = ['btDiscreteDynamicsWorld__debugDrawConstraint_28btTypedConstraint__29', 'btConvexConvexAlgorithm__processCollision_28btCollisionObjectWrapper_20const__2c_20btCollisionObjectWrapper_20const__2c_20btDispatcherInfo_20const__2c_20btManifoldResult__29'];
if (process.env.PHYSICS_COVERAGE)
    for (const name of targets) {
        const start = source.indexOf('function ' + name + '('), body = source.indexOf('{', start) + 1;
        source = source.slice(0, body) + `__observed['${name}']=(__observed['${name}']||0)+1;` + source.slice(body);
    }
async function run(spec) {
    const diagnostics = [], observed = {}, callbacks = crypto.createHash('sha256');
    let callbackCount = 0;
    const ctx = { window: {}, performance, setTimeout, clearTimeout, __observed: observed, console: Object.fromEntries(['log', 'info', 'warn', 'error'].map(k => [k, (...args) => { if (args[0] === 'drawLine' || args[0] === 'clearLine') {
                callbacks.update(JSON.stringify(args));
                callbackCount++;
            }
            else
                diagnostics.push([k, ...args.map(String)]); }])) };
    vm.runInNewContext(source, ctx, { filename: sourcePath });
    const m = ctx.window.Physics3D(512, { getWorldTransform() { }, setWorldTransform(id, pointer) { callbacks.update(JSON.stringify([id, pointer])); callbackCount++; } });
    const config = m.btDefaultCollisionConfiguration_create(), dispatcher = m.btCollisionDispatcher_create(config), broadphase = m.btDbvtBroadphase_create(), solver = m.btSequentialImpulseConstraintSolver_create(), world = m.btDiscreteDynamicsWorld_create(dispatcher, broadphase, solver, config);
    const vector = (x, y, z) => m.btVector3_create(x, y, z), gravity = vector(0, -9.8, 0);
    m.btDiscreteDynamicsWorld_setGravity(world, gravity);
    const shapes = [m.btBoxShape_create(vector(.5, .5, .5)), m.btSphereShape_create(.5), m.btCapsuleShape_create(.3, .8)];
    const hull = m.btConvexHullShape_create();
    for (let i = 0; i < 8; i++)
        m.btConvexHullShape_addPoint(hull, vector(i & 1 ? .55 : -.5, i & 2 ? .5 : -.5, i & 4 ? .5 : -.5), true);
    shapes.push(hull);
    const bodies = [];
    function body(shape, mass, x, y, z) {
        const inertia = vector(0, 0, 0);
        if (mass)
            m.btCollisionShape_calculateLocalInertia(shape, mass, inertia);
        const motion = m.layaMotionState_create(), ci = m.btRigidBodyConstructionInfo_create(mass, motion, shape, inertia), b = m.btRigidBody_create(ci);
        m.btRigidBodyConstructionInfo_destroy(ci);
        m.btCollisionObject_setUserIndex(b, bodies.length);
        m.btRigidBody_setCenterOfMassPos(b, x, y, z);
        m.btDiscreteDynamicsWorld_addRigidBody(world, b, 1, -1);
        return b;
    }
    const floor = body(m.btBoxShape_create(vector(20, .5, 20)), 0, 0, -.5, 0);
    for (let i = 0; i < 24; i++)
        bodies.push(body(spec.convex ? hull : shapes[i % 4], 1, i % 4 * 1.05 - 1.5, 1 + Math.floor(i / 4) * 1.05, i % 2 * .1));
    if (spec.joints) {
        const a = m.btTransform_create(), b = m.btTransform_create();
        m.btTransform_setIdentity(a);
        m.btTransform_setIdentity(b);
        const joint = m.btFixedConstraint_create(bodies[0], a, bodies[1], b);
        m.btCollisionWorld_addConstraint(world, joint, true);
        m.btDynamicsWorld_enableDebugDrawer(world, true);
    }
    const state = crypto.createHash('sha256'), contacts = crypto.createHash('sha256'), checkpoints = [];
    let stepMs = 0, contactCount = 0;
    const vec = p => [m.btVector3_x(p), m.btVector3_y(p), m.btVector3_z(p)];
    for (let frame = 0; frame < 360; frame++) {
        if (frame === 90)
            m.btRigidBody_applyCentralImpulse(bodies[0], vector(2, 5, 1));
        if (frame === 180)
            m.btRigidBody_setLinearVelocity(bodies[1], vector(1, 2, 0));
        if (frame === 240) {
            m.btDiscreteDynamicsWorld_removeRigidBody(world, bodies[23]);
            m.btDiscreteDynamicsWorld_addRigidBody(world, bodies[23], 1, -1);
        }
        const t = performance.now();
        m.btDiscreteDynamicsWorld_stepSimulation(world, frame % 7 === 0 ? 1 / 30 : 1 / 60, 4, 1 / 60);
        stepMs += performance.now() - t;
        const rows = bodies.map(b => { const transform = m.btCollisionObject_getWorldTransform(b), r = m.btTransform_getRotation(transform); return [...vec(m.btTransform_getOrigin(transform)), m.btQuaternion_x(r), m.btQuaternion_y(r), m.btQuaternion_z(r), m.btQuaternion_w(r), ...vec(m.btRigidBody_getLinearVelocity(b)), ...vec(m.btRigidBody_getAngularVelocity(b)), m.btCollisionObject_getActivationState(b)]; });
        assert.ok(rows.flat().every(Number.isFinite));
        state.update(Buffer.from(new Float64Array(rows.flat()).buffer));
        for (let i = 0; i < m.btDispatcher_getNumManifolds(dispatcher); i++) {
            const manifold = m.btDispatcher_getManifoldByIndexInternal(dispatcher, i), points = [];
            for (let j = 0; j < m.btPersistentManifold_getNumContacts(manifold); j++) {
                const p = m.btPersistentManifold_getContactPoint(manifold, j);
                points.push([m.btManifoldPoint_getDistance(p), ...vec(m.btManifoldPoint_get_m_positionWorldOnA(p)), ...vec(m.btManifoldPoint_get_m_positionWorldOnB(p)), ...vec(m.btManifoldPoint_get_m_normalWorldOnB(p))]);
                contactCount++;
            }
            contacts.update(JSON.stringify(points, encode));
        }
        if (frame % 60 === 59)
            checkpoints.push(rows.slice(0, 3));
    }
    assert.ok(contactCount > 0);
    assert.notEqual(checkpoints[0][0][1], 1);
    return { name: spec.name, stateHash: state.digest('hex'), contactHash: contacts.digest('hex'), contactCount, callbackHash: callbacks.digest('hex'), callbackCount, checkpoints, diagnostics, timing: { stepMs }, coverage: observed };
}
(async () => {
    const cases = [];
    for (const spec of [{ name: 'mixed-shapes' }, { name: 'convex-hulls', convex: true }, { name: 'fixed-joint-debug', joints: true }])
        cases.push(await run(spec));
    const result = { v8: process.versions.v8, cases }, behavior = rows => rows.map(({ timing, coverage, ...rest }) => rest);
    const baseline = JSON.parse(fs.readFileSync(baselinePath), decode);
    if (baseline.cases[0].behaviorHash) {
        const signatures = behavior(cases).map(item => ({ name: item.name, stateHash: item.stateHash, behaviorHash: crypto.createHash('sha256').update(JSON.stringify(item, encode)).digest('hex') }));
        assert.deepEqual(signatures, baseline.cases, 'bullet behavior changed');
    }
    else
        assert.deepEqual(behavior(cases), behavior(baseline.cases), 'bullet behavior changed');
    console.log(JSON.stringify(result, encode));
})().catch(e => { console.error(e); process.exitCode = 1; });
