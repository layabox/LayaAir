// Run in Electron's Node mode to compare the actual bundled V8 versions:
// ELECTRON_RUN_AS_NODE=1 /path/to/Electron box2d-regression.cjs [library.js]
// Compare trajectory/event hashes against an unpatched library, then timings.
// Optional second argument: a JSON result from the unpatched run to assert.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const assert = require("assert/strict");
const { performance } = require("perf_hooks");
const library = process.argv[2] || path.join(__dirname, "../../src/layaAir/jsLibs/laya.Box2D.js");
const source = fs.readFileSync(library, "utf8");
global.window = global;
vm.runInThisContext(source.slice(source.indexOf("var Box2D")), { filename: library });

(async () => {
    const b = await Box2D();
    const world = new b.b2World(new b.b2Vec2(0, 9.8));
    world.SetAllowSleeping(false);
    const ground = world.CreateBody(new b.b2BodyDef());
    const def = new b.b2BodyDef();
    def.type = b.b2_dynamicBody;
    const cage = world.CreateBody(def);
    for (const [hx, hy, x, y] of [[3.4,.2,0,-3.2], [3.4,.2,0,3.2], [.2,3.4,-3.2,0], [.2,3.4,3.2,0]]) {
        const shape = new b.b2PolygonShape();
        shape.SetAsBox(hx, hy, new b.b2Vec2(x, y), 0);
        cage.CreateFixture(shape, 10);
        b.destroy(shape);
    }
    const joint = new b.b2RevoluteJointDef();
    joint.Initialize(ground, cage, new b.b2Vec2(0, 0));
    joint.enableMotor = true;
    joint.motorSpeed = .05 * Math.PI;
    joint.maxMotorTorque = 1e8;
    world.CreateJoint(joint);
    const shape = new b.b2PolygonShape();
    shape.SetAsBox(.05, .05);
    const bodies = [cage];
    const events = { begin: 0, end: 0, pre: 0, post: 0 };
    const listener = new b.JSContactListener();
    listener.BeginContact = () => events.begin++;
    listener.EndContact = () => events.end++;
    listener.PreSolve = () => events.pre++;
    listener.PostSolve = () => events.post++;
    world.SetContactListener(listener);
    const hash = crypto.createHash("sha256");
    const state = Buffer.alloc(8 * 6);
    function record() {
        for (const body of bodies) {
            const pos = body.GetPosition(), vel = body.GetLinearVelocity();
            [pos.x, pos.y, body.GetAngle(), vel.x, vel.y, body.GetAngularVelocity()]
                .forEach((value, i) => state.writeDoubleLE(value, i * 8));
            hash.update(state);
        }
    }
    // Empty contacts, insertion, dense piles, motor joints and contact callbacks.
    for (let i = 0; i < 300; i++) {
        const body = world.CreateBody(def);
        body.CreateFixture(shape, 10);
        bodies.push(body);
        world.Step(1/60, 8, 3);
        record();
    }
    const msPerStep = [];
    for (let run = 0; run < 4; run++) {
        let elapsed = 0;
        for (let i = 0; i < 120; i++) {
            const start = performance.now();
            world.Step(1/60, 8, 3);
            elapsed += performance.now() - start;
            record();
        }
        msPerStep.push(+(elapsed / 120).toFixed(3));
    }
    // Exercise the alternate Step branches and changing contact lifetimes.
    world.SetAllowSleeping(true);
    world.SetContinuousPhysics(false);
    for (let i = 0; i < 60; i++) {
        world.Step(i % 3 === 0 ? 0 : 1/120, 8, 3);
        record();
    }
    const result = { electron: process.versions.electron, v8: process.versions.v8,
        bodies: world.GetBodyCount(), trajectory: hash.digest("hex"), events, msPerStep };
    if (process.argv[3]) {
        const baseline = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
        for (const key of ["bodies", "trajectory", "events"])
            assert.deepEqual(result[key], baseline[key], `Box2D regression: ${key}`);
    }
    console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
