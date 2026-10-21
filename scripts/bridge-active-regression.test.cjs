// Runs the production Node lifecycle and Bridge3DSprite source without a GPU.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const engine = process.env.BRIDGE_ENGINE_ROOT || path.resolve(__dirname, '..');
const ts = require(path.join(engine, 'node_modules/typescript'));
const context = { console, performance, setTimeout, clearTimeout, document: {} };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(engine, 'build/libs/laya.core.js'), 'utf8'), context);
const L = context.Laya;
class Sprite extends L.Node {
    constructor() { super(); this._struct = {}; this.visible = true; }
    _initShaderData() {}
}
class Sprite3D extends L.Node {}
class RenderElement {}
const sourcePath = 'src/layaAir/laya/bridge/Bridge3DSprite.ts';
const source = process.env.BRIDGE_BASELINE
    ? execFileSync('git', ['show', `${process.env.BRIDGE_BASELINE}:${sourcePath}`], { cwd: engine, encoding: 'utf8' })
    : fs.readFileSync(path.join(engine, sourcePath), 'utf8');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText, {
    exports: exportsObject, window: {}, require: name => {
        if (name.endsWith('/LayaEnv')) return { LayaEnv: {} };
        if (name.endsWith('/display/Node')) return { Node: L.Node };
        if (name.endsWith('/display/Sprite')) return { Sprite };
        if (name.endsWith('/core/Sprite3D')) return { Sprite3D };
        if (name.endsWith('/Bridge3DRenderElement')) return { Bridge3DRenderElement: RenderElement };
        if (name.endsWith('/LayaGL')) return { LayaGL: { renderDeviceFactory: { createRenderGeometryElement: () => ({}) }, render2DRenderPassFactory: { createEmptyRenderDataHandle: () => null } } };
        const type = name.split('/').pop();
        return { [type]: L[type] || class {} };
    }
});
const { Bridge3DSprite } = exportsObject;
Bridge3DSprite.prototype._syncTransform2DTo3D = function () {};
function fixture(active = true) {
    const stage = new L.Node();
    stage._processActive(true);
    const scene3d = stage.addChild(new L.Node());
    const parent2d = stage.addChild(new Sprite());
    const bridge = new Bridge3DSprite();
    bridge.active = active;
    const mesh = new Sprite3D(), descendant = mesh.addChild(new Sprite3D());
    bridge.addChild(mesh);
    const events = [];
    const comp = { owner: descendant, _enabled: true, enabledInHierarchy: false, _isScript: () => true,
        _setActive(value) { this.enabledInHierarchy = value; events.push(value ? 'enable' : 'disable'); } };
    descendant._components = [comp];
    // Registration physically parents the container to a shared scene independent of the 2D parent.
    scene3d.addChild(bridge.containerSprite3D);
    parent2d.addChild(bridge);
    return { stage, scene3d, parent2d, bridge, mesh, descendant, comp, events };
}
function assertState(f, active) {
    assert.equal(f.bridge.containerSprite3D.active, active);
    assert.equal(f.mesh.activeInHierarchy, active);
    assert.equal(f.descendant.activeInHierarchy, active);
    assert.equal(f.comp.enabledInHierarchy, active);
    assert.equal(f.mesh.active, true, 'inherited state must not overwrite a child active flag');
}

test('inactive bridge never activates 3D children on registration, then toggles the full subtree once', () => {
    const f = fixture(false);
    assertState(f, false);
    assert.deepEqual(f.events, []);
    f.bridge.active = true;
    assertState(f, true);
    f.bridge.active = true;
    f.bridge.active = false;
    assertState(f, false);
    assert.deepEqual(f.events, ['enable', 'disable']);
});
test('a detached bridge starts with an inactive container', () => {
    const bridge = new Bridge3DSprite();
    assert.equal(bridge.active, true);
    assert.equal(bridge.activeInHierarchy, false);
    assert.equal(bridge.containerSprite3D.active, false);
});
test('ancestor deactivation and removal/reparenting propagate without changing child flags', () => {
    const f = fixture();
    assertState(f, true);
    f.parent2d.active = false;
    assertState(f, false);
    f.bridge.active = false;
    f.parent2d.active = true;
    assertState(f, false);
    f.bridge.active = true;
    assertState(f, true);
    f.bridge.removeSelf();
    assertState(f, false);
    f.parent2d.addChild(f.bridge);
    assertState(f, true);
});
test('a child explicitly disabled stays disabled when its bridge is reactivated', () => {
    const f = fixture();
    f.mesh.active = false;
    f.bridge.active = false;
    f.bridge.active = true;
    assert.equal(f.mesh.active, false);
    assert.equal(f.mesh.activeInHierarchy, false);
    assert.equal(f.descendant.activeInHierarchy, false);
    assert.equal(f.comp.enabledInHierarchy, false);
});
test('NOT_IN_PAGE activation transitions propagate to the internal 3D container', () => {
    const f = fixture();
    f.bridge._setBit(L.NodeFlags.NOT_IN_PAGE, true);
    f.bridge._processActive(false, true);
    assertState(f, false);
    f.bridge._setBit(L.NodeFlags.NOT_IN_PAGE, false);
    f.bridge._processActive(true, true);
    assertState(f, true);
});
test('visible does not disable the 3D lifecycle', () => {
    const f = fixture();
    f.bridge.visible = false;
    assertState(f, true);
});

test('the internal Bridge3DScene3D is hidden from hierarchy and excluded from serialization', () => {
    class Scene3D extends Sprite {}
    class Camera extends L.Node { setProjectionChangeHandler() {} }
    class Context { setBridge3DLightData() {} }
    const exportsObject = {};
    const source = fs.readFileSync(path.join(engine, 'src/layaAir/laya/bridge/Bridge3DScene3D.ts'), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText, {
        exports: exportsObject, require: name => {
            if (name.endsWith('/Const')) return { HideFlags: L.HideFlags };
            if (name.endsWith('/ILaya')) return { ILaya: { stage: new L.Node() } };
            if (name.endsWith('/LayaEnv')) return { LayaEnv: {} };
            if (name.endsWith('/Scene3D')) return { Scene3D };
            if (name.endsWith('/Bridge3DCamera')) return { Bridge3DCamera: Camera };
            if (name.endsWith('/Bridge3DContext')) return { Bridge3DContext: Context };
            if (name.endsWith('/Config3D')) return { Config3D: { _multiLighting: false } };
            if (name.endsWith('/AmbientMode')) return { AmbientMode: { SolidColor: 0 } };
            const type = name.split('/').pop();
            return { [type]: L[type] || class {} };
        }
    });
    const { Bridge3DScene3D } = exportsObject;
    Object.assign(Bridge3DScene3D.prototype, { updateContext() {}, setupCamera() {}, _getLightPixels: () => null });
    const internal = new Bridge3DScene3D({});
    assert.equal(internal.hasHideFlag(L.HideFlags.HideInHierarchy), true);
    assert.equal(internal.hasHideFlag(L.HideFlags.DontSave), true);
    assert.equal(internal.active, true, 'hiding hierarchy must not deactivate rendering');
    const f = fixture();
    assert.equal(f.bridge.getChildAt(0), f.mesh);
    assert.equal(f.mesh.hasHideFlag(L.HideFlags.HideInHierarchy), false);
});
