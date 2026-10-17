// Run: node --test tests/animator2d/cross-fade.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Run the real animator, clip sampler and property writers without a renderer.
class EventDispatcher {
    constructor() { this.listeners = new Map(); }
    on(name, callback) { this.listeners.set(name, callback); }
    event(name, value) { this.listeners.get(name)?.(value); }
}
class CurvePath {
    constructor(x, y, rotation) { Object.assign(this, { x, y, rotation }); }
    getPointAt() { return { x: this.x, y: this.y, z: 0 }; }
    getRotationAt() { return { x: 0, y: 0, z: this.rotation }; }
}
class Material {
    constructor() { this.color = { r: 0.2, g: 0, b: 0, a: 1 }; }
    getColor() { return this.color; }
    setColor(key, value) { this.color = value; }
}
const root = path.resolve(__dirname, '../../src/layaAir/laya');
const modules = new Map();
const actual = new Set(['Animator2D', 'Animator2DBase', 'AnimatorControllerLayer2D', 'AnimatorPlayState2D',
    'AnimatorState2D', 'AnimatorTransition2D', 'AnimationClip2D', 'KeyframeNode2D', 'KeyframeNodeList2D', 'KeyFrame2D', 'AnimatorUpdateMode']);
function load(name) {
    if (modules.has(name)) return modules.get(name);
    const exports = {};
    modules.set(name, exports);
    const source = fs.readFileSync(path.join(root, 'components', name + '.ts'), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, console, require(id) {
        const dependency = path.basename(id);
        if (actual.has(dependency)) return load(dependency);
        if (dependency === 'Component') return { Component: class {} };
        if (dependency === 'Resource') return { Resource: class {} };
        if (dependency === 'EventDispatcher') return { EventDispatcher };
        if (dependency === 'Vector3') return { Vector3: class { constructor(x, y, z) { Object.assign(this, { x, y, z }); } } };
        if (dependency === 'Material') return { Material };
        if (dependency === 'CurvePath') return { CurvePath };
        if (dependency === 'Ease') return { Ease: { linear: (t, b, c, d) => b + c * t / d } };
        if (dependency === 'AnimatorControllerParse') return { AniParmType: { Float: 0, Bool: 1, Trigger: 2 } };
        return {};
    } }, { filename: name + '.ts' });
    return exports;
}
const { Animator2D } = load('Animator2D');
const { AnimatorControllerLayer2D: Layer } = load('AnimatorControllerLayer2D');
const { AnimatorState2D: State } = load('AnimatorState2D');
const { AnimatorTransition2D: Transition } = load('AnimatorTransition2D');
const { AnimationClip2D: Clip } = load('AnimationClip2D');
const { KeyframeNode2D: Track } = load('KeyframeNode2D');
function state(name, tracks, duration = 2) {
    const result = new State();
    result.name = name;
    const clip = new Clip();
    clip._duration = duration;
    clip.islooping = true;
    clip._nodesDic = {};
    clip._nodes.count = Object.keys(tracks).length;
    Object.entries(tracks).forEach(([property, values], index) => {
        const node = new Track();
        const parts = property.split('/');
        node._ownerPath = parts.slice(0, -1);
        node._propertys = parts[parts.length - 1].split('.');
        node.fullPath = node._ownerPath.join('/') + '.' + node._propertys.join('.');
        node._indexInList = index;
        if (!Array.isArray(values)) values = [values, values];
        node._keyFrames = values.map((val, i) => ({ time: i * duration, data: { val, tweenType: 'linear' } }));
        clip._nodes.setNodeByIndex(index, node);
        clip._nodesDic[node.fullPath] = node;
    });
    result.clip = clip;
    return result;
}
function setup(states, properties = {}, additive = false) {
    const animator = new Animator2D();
    animator.owner = { x: 0, y: 0, visible: true, skin: 'base', timer: { delta: 0 }, components: [], ...properties };
    const layer = new Layer('base');
    if (additive) layer.blendingMode = Layer.BLENDINGMODE_ADDTIVE;
    states.forEach(s => layer.addState(s));
    animator.addControllerLayer(layer);
    animator.play(states[0].name);
    function tick(seconds) { animator.owner.timer.delta = seconds * 1000; animator.onUpdate(); }
    return { animator, layer, owner: animator.owner, tick };
}
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`); }

test('both clips advance, blend continuously, and retain destination time on completion', () => {
    const a = state('a', { x: [0, 20] });
    const b = state('b', { x: [100, 140] });
    const { animator, layer, owner, tick } = setup([a, b]);
    assert.equal(animator.crossFade('b', 0, 0, 0.5), true);
    tick(0.25);
    near(owner.x, 2.5 * 0.75 + 105 * 0.25);
    tick(0.25);
    near(owner.x, 5 * 0.5 + 110 * 0.5);
    tick(0.5);
    near(owner.x, 120);
    assert.equal(layer._playType, 0);
    assert.equal(layer.getCurrentPlayState().animatorState, b);
    near(layer.getCurrentPlayState()._elapsedTime, 1);
    tick(0.25);
    near(owner.x, 125);
});
test('automatic transitions use transduration and target start offset', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: [100, 140] });
    const transition = new Transition();
    Object.assign(transition, { destState: b, exitTime: 0.1, transduration: 0.5, transstartoffset: 0.25 });
    a.transitions.push(transition);
    const { layer, owner, tick } = setup([a, b]);
    tick(0.2);
    assert.equal(layer._playType, 1);
    near(owner.x, 0);
    tick(0.5);
    near(owner.x, 60);
    tick(0.5);
    near(owner.x, 130);
});
test('missing tracks blend to or from defaults and discrete tracks switch on completion', () => {
    const a = state('a', { x: 20, visible: false, skin: 'a' });
    const b = state('b', { y: 100, visible: true, skin: 'b' });
    const { animator, owner, tick } = setup([a, b], { x: 10, y: 40 });
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(owner.x, 15); near(owner.y, 70);
    assert.equal(owner.visible, false); assert.equal(owner.skin, 'a');
    tick(0.5);
    near(owner.x, 10); near(owner.y, 100);
    assert.equal(owner.visible, true); assert.equal(owner.skin, 'b');
});
test('interruption starts at the blended pose and includes tracks from earlier states', () => {
    const { animator, layer, owner, tick } = setup([
        state('a', { x: 0, y: 20 }), state('b', { x: 100 }), state('c', { x: 200 })
    ]);
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(owner.x, 50); near(owner.y, 10);
    animator.crossFade('c', 0, 0, 0.5);
    assert.equal(layer._playType, 2);
    tick(0.5);
    near(owner.x, 125); near(owner.y, 5);
    tick(0.5);
    near(owner.x, 200); near(owner.y, 0);
});
test('self fade uses a fixed source pose and play cancels a pending blend', () => {
    const { animator, layer, owner, tick } = setup([state('a', { x: [0, 20] }), state('b', { x: 100 })]);
    tick(0.5);
    animator.crossFade('a', 0, 0.5, 0.5);
    tick(0.5);
    near(owner.x, 10);
    animator.play('a');
    assert.equal(layer._playType, 0);
    assert.equal(layer._crossNodes.length, 0);
    tick(0.1);
    near(owner.x, 1);
});
test('zero or omitted duration and an unstarted layer switch immediately; invalid names fail', () => {
    const { animator, layer } = setup([state('a', { x: 0 }), state('b', { x: 100 })]);
    assert.equal(animator.crossFade('missing', 0, 0, 1), false);
    assert.equal(animator.crossFade('b', 10, 0, 1), false);
    animator.crossFade('b', 0, 0, 0);
    assert.equal(layer.getCurrentPlayState().animatorState.name, 'b');
    animator.crossFade('a', 0, 0);
    assert.equal(layer.getCurrentPlayState().animatorState.name, 'a');
    layer._playStateInfo._currentState = null;
    animator.crossFade('b', 0, 0, 0.5);
    assert.equal(layer._playType, 0);
});
test('additive tracks interpolate deltas and apply layer weight once', () => {
    const { animator, layer, owner, tick } = setup([
        state('a', { x: [0, 20] }), state('b', { x: [100, 140] })
    ], { x: 10 }, true);
    layer.defaultWeight = 0.5;
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(owner.x, 10 + (5 * 0.5 + 10 * 0.5) * 0.5);
});
test('curve paths blend position and rotation', () => {
    const { animator, owner, tick } = setup([
        state('a', { transform: new CurvePath(0, 20, 0) }),
        state('b', { transform: new CurvePath(100, 40, 90) })
    ], { transform: { x: 0, y: 0, rotation: 0 } });
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(owner.x, 50); near(owner.y, 30); near(owner.rotation, 45);
});
test('material component tracks use the existing material writer', () => {
    const material = new Material();
    const { animator, tick } = setup([state('a', { 'material.tint.r': 0 }), state('b', { 'material.tint.r': 1 })], { material });
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(material.color.r, 0.5);
});
test('speed controls the fade and stop pauses it', () => {
    const { animator, layer, owner, tick } = setup([state('a', { x: 0 }), state('b', { x: 100 })]);
    animator.crossFade('b', 0, 0, 0.5);
    animator.speed = 2;
    tick(0.25); near(owner.x, 50);
    animator.stop(); tick(1); near(owner.x, 50);
    animator.crossFade('b', 0, 0, 0.5);
    animator.speed = -1;
    tick(0.5); near(owner.x, 75);
    animator.speed = 0; tick(1); near(owner.x, 75);
    assert.equal(layer._playType, 2);
});
test('finished source starts a blend and exits exactly once', () => {
    const a = state('a', { x: 20 }); a.loop = 1;
    const b = state('b', { x: 100 });
    let exits = 0;
    a.on(State.EVENT_OnStateExit, () => exits++);
    const transition = new Transition();
    Object.assign(transition, { destState: b, transduration: 0.5 });
    a.transitions.push(transition);
    const { layer, owner, tick } = setup([a, b]);
    tick(2);
    assert.equal(exits, 1);
    assert.equal(layer._playType, 1);
    tick(0.5); near(owner.x, 60);
    tick(0.5); near(owner.x, 100);
    assert.equal(exits, 1);
});
test('one-shot destination exits once even if it finishes before the blend', () => {
    const a = state('a', { x: 0 }, 4);
    const b = state('b', { x: [100, 200] }, 0.5); b.loop = 1;
    let exits = 0;
    b.on(State.EVENT_OnStateExit, () => exits++);
    const { animator, layer, owner, tick } = setup([a, b]);
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5); tick(0.5); tick(1); tick(0.1);
    near(owner.x, 200);
    assert.equal(layer._playType, 0);
    assert.equal(exits, 1);
});
test('destination animation events fire during the blend without replay on completion', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: 100 });
    b.clip._animationEvents = [{ time: 0.2, eventName: 'hit', params: [] }, { time: 0.8, eventName: 'hit', params: [] }];
    let hits = 0;
    const { animator, owner, tick } = setup([a, b]);
    owner.components.push({ _isScript: () => true, hit: () => hits++ });
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.25); assert.equal(hits, 1);
    tick(0.75); assert.equal(hits, 2);
    tick(0.1); assert.equal(hits, 2);
});
test('target transitions can interrupt an active blend', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: 100 });
    const c = state('c', { x: 200 });
    const transition = new Transition();
    Object.assign(transition, { destState: c, exitTime: 0.25, transduration: 0.5 });
    b.transitions.push(transition);
    const { animator, layer, owner, tick } = setup([a, b, c]);
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5); near(owner.x, 50);
    assert.equal(layer._playType, 2);
    tick(0.5); near(owner.x, 125);
    tick(0.5); near(owner.x, 200);
    assert.equal(layer.getCurrentPlayState().animatorState, c);
});
test('gotoAndStop cancels the blend and applies the requested pose immediately', () => {
    const { animator, layer, owner, tick } = setup([state('a', { x: [0, 20] }), state('b', { x: 100 })]);
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    animator.gotoAndStop('a', 0, 0.25);
    near(owner.x, 5);
    tick(1); near(owner.x, 5);
    assert.equal(layer._playType, 0);
    assert.equal(layer._crossNodes.length, 0);
});
test('layer weights, clip ranges and disabled layers are respected', () => {
    const a = state('a', { x: 0 }, 4); a.clipEnd = 0.5;
    const b = state('b', { x: 100 }, 4);
    const { animator, layer, owner, tick } = setup([a, b]);
    layer.defaultWeight = 0.5;
    animator.crossFade('b', 0, 0, 0.5);
    layer.enable = false;
    tick(1); near(owner.x, 0);
    layer.enable = true;
    tick(0.5); near(owner.x, 25);
    tick(0.5); near(owner.x, 50);
    assert.equal(layer._playType, 0);
});

test('completion preserves the public play-state object and target progress', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: [100, 140] });
    const { animator, layer, tick } = setup([a, b]);
    const info = layer.getCurrentPlayState();
    animator.crossFade('b', 0, 0, 0.5);
    tick(1);
    assert.equal(layer.getCurrentPlayState(), info);
    assert.equal(info.animatorState, b);
    near(info._elapsedTime, 1);
    near(info.duration, 2);
    tick(0.25);
    near(info._elapsedTime, 1.25);
});

for (const side of ['source', 'target']) {
    test(`${side} update callback can play another state during a blend`, () => {
        const a = state('a', { x: 0 });
        const b = state('b', { x: 100 });
        const c = state('c', { x: 200 });
        const current = side === 'source' ? a : b;
        current.clip._animationEvents = [{ time: 0.2, eventName: 'oldEvent', params: [] }];
        const { animator, layer, owner, tick } = setup([a, b, c]);
        let oldEvents = 0;
        owner.components.push({ _isScript: () => true, oldEvent: () => oldEvents++ });
        current.on(State.EVENT_OnStateUpdate, () => animator.play('c'));
        animator.crossFade('b', 0, 0, 0.5);
        assert.doesNotThrow(() => tick(0.25));
        assert.equal(layer.getCurrentPlayState().animatorState, c);
        assert.equal(layer._playType, 0);
        assert.equal(oldEvents, 0);
        tick(0.1);
        near(owner.x, 200);
    });
}

test('a clip event starting another blend does not exit the new target', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: 100 }); b.loop = 1;
    const c = state('c', { x: 200 });
    b.clip._animationEvents = [{ time: 1.5, eventName: 'switchState', params: [] }];
    const { animator, layer, owner, tick } = setup([a, b, c]);
    let cExits = 0;
    c.on(State.EVENT_OnStateExit, () => cExits++);
    owner.components.push({ _isScript: () => true, switchState: () => animator.crossFade('c', 0, 0, 0.5) });
    animator.crossFade('b', 0, 0, 2);
    tick(2);
    assert.equal(layer._crossPlayStateInfo.animatorState, c);
    assert.equal(cExits, 0);
    near(layer._crossPlayStateInfo._elapsedTime, 0);
});

test('source exit callback at completion can override the target transition', () => {
    const a = state('a', { x: 0 });
    const b = state('b', { x: 100 });
    const c = state('c', { x: 200 });
    const transition = new Transition();
    Object.assign(transition, { destState: a, exitTime: 0.5, transduration: 0.5 });
    b.transitions.push(transition);
    const { animator, layer, tick } = setup([a, b, c]);
    a.on(State.EVENT_OnStateExit, () => animator.play('c'));
    animator.crossFade('b', 0, 0, 0.5);
    tick(1);
    assert.equal(layer.getCurrentPlayState().animatorState, c);
    assert.equal(layer._playType, 0);
});

test('track matching respects child paths and different track order', () => {
    const a = state('a', { 'left/x': 0, 'right/x': 20 });
    const b = state('b', { 'right/x': 100, 'left/x': 200 });
    const children = { left: { x: 0 }, right: { x: 0 } };
    const { animator, tick } = setup([a, b], { getChild: name => children[name] });
    animator.crossFade('b', 0, 0, 0.5);
    tick(0.5);
    near(children.left.x, 100);
    near(children.right.x, 60);
    tick(0.5);
    near(children.left.x, 200);
    near(children.right.x, 100);
});
