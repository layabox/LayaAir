// Run: node --test tests/animator/culling-mode.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise culling without initializing a GPU renderer.
class BaseRender {
    get _is3DRender() { return true; }
    enabled = true;
    renderbitFlag = 0;
    _renderElements = [{}];
    bounds = { visible: true };
    _setOwner(owner) { this.owner = owner; }
    _setActive() {}
    _destroy() { this.destroyed = true; }
}
function method(file, name) {
    const source = fs.readFileSync(path.resolve(__dirname, '../../src/layaAir/laya', file), 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    let result;
    function visit(node) {
        if ((ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node)) && node.name.getText(ast) === name) result = node.getText(ast);
        ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.ok(result, name);
    return result;
}
// Run the reusable Sprite3D query and invalidation hooks without a render driver.
const constExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,
    '../../src/layaAir/laya/Const.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText, { exports: constExports });
const { NodeFlags } = constExports;
const cacheContext = { BaseRender, NodeFlags, OutOfRangeError: RangeError, Event: { ADDED: "added", REMOVED: "removed" } };
vm.runInNewContext(ts.transpileModule(`
const ARRAY_EMPTY = [];
class Node {
    _bits = 0;
    _reactiveBits = 0;
    _children = [];
    _$children = this._children;
    _$container = this;
    _parent = null;
    _$parent = null;
    _components = [];
    _destroyed = false;
    _childChanged() {}
    _onAdded() {}
    _onRemoved() {}
    event() {}
    onDestroy() {}
    offAll() {}
    ${method('display/Node.ts', '_setBit')}
    ${method('display/Node.ts', '_getBit')}
    ${method('display/Node.ts', 'addChild')}
    ${method('display/Node.ts', 'addChildAt')}
    ${method('display/Node.ts', 'removeChild')}
    ${method('display/Node.ts', 'removeChildAt')}
    ${method('display/Node.ts', 'removeChildren')}
    ${method('display/Node.ts', 'replaceChild')}
    ${method('display/Node.ts', '_removeChild')}
    ${method('display/Node.ts', '_setParent')}
    ${method('display/Node.ts', 'setChildIndex')}
    ${method('display/Node.ts', '_setChildIndex')}
    ${method('display/Node.ts', 'getChildAt')}
    ${method('display/Node.ts', 'numChildren')}
    ${method('display/Node.ts', 'parent')}
    ${method('display/Node.ts', 'children')}
    ${method('display/Node.ts', 'components')}
    ${method('display/Node.ts', '_addComponentInstance')}
    ${method('display/Node.ts', '_destroyComponent')}
    ${method('display/Node.ts', 'destroyAllComponent')}
    ${method('display/Node.ts', 'destroy')}
}
class Sprite3D extends Node {
    ${method('d3/core/Sprite3D.ts', 'getRenderersInChildren')}
    ${method('d3/core/Sprite3D.ts', '_collectRenderers')}
    ${method('d3/core/Sprite3D.ts', '_invalidateRenderers')}
    ${method('d3/core/Sprite3D.ts', '_childChanged')}
    ${method('d3/core/Sprite3D.ts', '_componentsChanged')}
    ${method('d3/core/Sprite3D.ts', 'destroy')}
}
this.Sprite3D = Sprite3D;
this.Node = Node;
`, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, cacheContext);
const { Sprite3D, Node } = cacheContext;
const Animator = { CULLINGMODE_ALWAYSANIMATE: 0, CULLINGMODE_CULLCOMPLETELY: 2 };
const exportsObject = {};
const dependencies = {
    BaseRender, Animator, Scene3D: { regManager() {} }, WebAnimatorFactory: class {},
    AnimatorUpdateMode: { Normal: 0 }, Stat: { enableAnimatorUpdate: true }
};
const source = fs.readFileSync(path.resolve(__dirname,
    '../../src/layaAir/laya/d3/component/Animator/manager/AnimatorManager.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText, { exports: exportsObject, require: () => dependencies });
const { AnimatorManager } = exportsObject;

function camera(options = {}) {
    return Object.assign({ activeInHierarchy: true, enableRender: true, cullingMask: -1,
        boundFrustum: { intersects: bounds => bounds.visible } }, options);
}
function node(components = [], children = [], type = Sprite3D) {
    const result = Object.assign(new type(), { activeInHierarchy: true, layer: 0,
        addRender(render) { this._addComponentInstance(render); },
        removeRender(render) { this._destroyComponent(render); }
    });
    for (const render of components) result.addRender(render);
    for (const child of children) result.addChild(child);
    return result;
}
function fixture(owner = node([new BaseRender()]), cameras = [camera()]) {
    owner._scene = { timer: { delta: 16 }, _cameraPool: cameras };
    const calls = { idle: 0, tick: 0 };
    const animator = { owner, cullingMode: 2, _speed: 1, _updateMode: 0,
        _taskSlot: { _updateMark: 0, submitAllIdle() { calls.idle++; } },
        _controllerLayers: [{ enable: true, _playType: 0, _playStateInfo: {} }] };
    const manager = new AnimatorManager();
    manager._tickPlayTypeNormal = () => calls.tick++;
    return { owner, animator, manager, calls };
}

function cacheStale(animator) {
    return !animator.owner._renderers;
}

test('fully culled animator idles its task slot and resumes when visible', () => {
    const { owner, animator, manager, calls } = fixture();
    owner.components[0].bounds.visible = false;
    manager.tickOne(animator);
    assert.deepEqual(calls, { idle: 1, tick: 0 });
    assert.equal(animator._taskSlot._updateMark, 0);
    owner.components[0].bounds.visible = true;
    manager.tickOne(animator);
    assert.deepEqual(calls, { idle: 1, tick: 1 });
    assert.equal(animator._taskSlot._updateMark, 1);
});

test('always animate bypasses visibility and camera checks', () => {
    const { animator, manager, calls } = fixture(undefined, []);
    animator.cullingMode = Animator.CULLINGMODE_ALWAYSANIMATE;
    manager.tickOne(animator);
    assert.equal(calls.tick, 1);
});

test('any active camera can keep a child renderer animating', () => {
    const child = node([new BaseRender()]);
    child.layer = 3;
    const { animator, manager } = fixture(node([], [child]), [
        camera({ cullingMask: 1 }), camera({ cullingMask: 8 })
    ]);
    assert.equal(manager._isCulled(animator), false);
    animator.owner._scene._cameraPool[1].enableRender = false;
    assert.equal(manager._isCulled(animator), true);
    animator.owner._scene._cameraPool[1].enableRender = true;
    animator.owner._scene._cameraPool[1].activeInHierarchy = false;
    assert.equal(manager._isCulled(animator), true);
});

test('disabled, inactive, empty and LOD-hidden renderers are culled', () => {
    for (const change of [r => r.enabled = false, r => r.renderbitFlag = 1,
        r => r._renderElements = []]) {
        const { owner, animator, manager } = fixture();
        change(owner.components[0]);
        assert.equal(manager._isCulled(animator), true);
    }
    const { owner, animator, manager } = fixture();
    owner.activeInHierarchy = false;
    assert.equal(manager._isCulled(animator), true);
});

test('hierarchy changes are observed and renderless property animations still tick', () => {
    const { owner, animator, manager, calls } = fixture(node());
    manager.tickOne(animator);
    assert.equal(calls.tick, 1);
    const render = new BaseRender();
    render.bounds.visible = false;
    owner.addChild(node([render]));
    assert.equal(manager._isCulled(animator), true);
    owner.addChild(node([new BaseRender()]));
    assert.equal(manager._isCulled(animator), false);
    for (const child of owner.children.slice()) owner.removeChild(child);
    assert.equal(manager._isCulled(animator), false);
});

test('renderers without an active camera are culled', () => {
    const { animator, manager } = fixture(undefined, []);
    assert.equal(manager._isCulled(animator), true);
});

test('component additions and removals take effect immediately', () => {
    const leaf = node();
    const { animator, manager } = fixture(node([], [leaf]));
    assert.equal(manager._isCulled(animator), false);
    const render = new BaseRender();
    render.bounds.visible = false;
    leaf.addRender(render);
    assert.equal(manager._isCulled(animator), true);
    leaf.removeRender(render);
    assert.equal(manager._isCulled(animator), false);
});

test('unchanged structure reuses the list without traversing children', () => {
    const render = new BaseRender();
    render.bounds.visible = false;
    const { owner, animator, manager } = fixture(node([], [node([render])]));
    const cached = owner.getRenderersInChildren();
    owner.getChildAt = () => { throw new Error('unexpected hierarchy traversal'); };
    for (let i = 0; i < 100; i++) {
        assert.equal(owner.getRenderersInChildren(), cached);
        assert.equal(manager._isCulled(animator), true);
    }
    render.bounds.visible = true;
    assert.equal(manager._isCulled(animator), false);
    render.enabled = false;
    assert.equal(manager._isCulled(animator), true);
});

test('moving a disabled renderer subtree refreshes both Animator lists', () => {
    const render = new BaseRender();
    render.enabled = false;
    const branch = node([], [node([render])]);
    const first = fixture(node([], [branch]));
    const second = fixture(node());
    assert.equal(first.manager._isCulled(first.animator), true);
    assert.equal(second.manager._isCulled(second.animator), false);
    second.owner.addChild(branch);
    assert.equal(first.manager._isCulled(first.animator), false);
    assert.equal(second.manager._isCulled(second.animator), true);
    assert.equal(first.owner.getRenderersInChildren().length, 0);
    assert.equal(second.owner.getRenderersInChildren()[0], render);
});

test('non-render components do not invalidate the shared renderer cache', () => {
    const root = node([new BaseRender()]);
    const cached = root.getRenderersInChildren();
    const component = {};
    root._components.push(component);
    root._componentsChanged(component, 0);
    assert.equal(root.getRenderersInChildren(), cached);
});

test('generic query includes self, inactive nodes and disabled renderers without an Animator', () => {
    const parentRenderer = new BaseRender();
    const childRenderer = new BaseRender();
    childRenderer.enabled = false;
    const child = node([childRenderer]);
    child.activeInHierarchy = false;
    const root = node([parentRenderer], [child]);
    const result = root.getRenderersInChildren();
    assert.deepEqual(Array.from(result), [parentRenderer, childRenderer]);
    assert.equal(root.getRenderersInChildren(), result);
});

test('destroying a query root releases its cached renderer references', () => {
    const root = node([new BaseRender()]);
    root.getRenderersInChildren();
    root.destroy();
    assert.equal(root._renderers, null);
});

test('destroyed renderers are ignored before deferred destruction completes', () => {
    const { owner, animator, manager } = fixture();
    owner.getRenderersInChildren();
    owner.components[0].destroyed = true;
    assert.equal(manager._isCulled(animator), false);
});

test('hierarchy and renderer changes never invalidate unrelated Animators in the same scene', () => {
    const leaf = node([new BaseRender()]);
    const affected = fixture(node([], [leaf]));
    const unrelated = fixture(node([], [node([new BaseRender()])]));
    node([], [affected.owner, unrelated.owner]);
    affected.owner.getRenderersInChildren();
    unrelated.owner.getRenderersInChildren();
    unrelated.owner.getChildAt = () => { throw new Error('unrelated Animator rebuilt its cache'); };

    affected.owner.addChild(node());
    assert.equal(cacheStale(affected.animator), true);
    assert.equal(cacheStale(unrelated.animator), false);
    affected.owner.getRenderersInChildren();
    const render = new BaseRender();
    leaf.addRender(render);
    assert.equal(cacheStale(affected.animator), true);
    assert.equal(cacheStale(unrelated.animator), false);
    affected.owner.getRenderersInChildren();
    leaf.removeRender(render);
    assert.equal(cacheStale(affected.animator), true);
    assert.equal(cacheStale(unrelated.animator), false);
    unrelated.owner.getRenderersInChildren();
});

test('nested Animator ancestors are invalidated while a moved Animator keeps its own list', () => {
    const leaf = node([new BaseRender()]);
    const inner = fixture(node([], [leaf]));
    const outer = fixture(node([], [inner.owner]));
    const destination = fixture(node());
    inner.owner.getRenderersInChildren();
    outer.owner.getRenderersInChildren();
    destination.owner.getRenderersInChildren();
    leaf.addRender(new BaseRender());
    assert.equal(cacheStale(inner.animator), true);
    assert.equal(cacheStale(outer.animator), true);
    assert.equal(cacheStale(destination.animator), false);
    inner.owner.getRenderersInChildren();
    outer.owner.getRenderersInChildren();
    destination.owner.addChild(inner.owner);
    assert.equal(cacheStale(inner.animator), false);
    assert.equal(cacheStale(outer.animator), true);
    assert.equal(cacheStale(destination.animator), true);
    assert.equal(outer.owner.getRenderersInChildren().length, 0);
    assert.equal(destination.owner.getRenderersInChildren().length, 2);
});

test('multiple changes are collected once on the next query', () => {
    const root = node();
    root.getRenderersInChildren();
    let reads = 0;
    const getChildAt = root.getChildAt;
    root.getChildAt = function (i) { reads++; return getChildAt.call(this, i); };
    root.addChild(node([new BaseRender()]));
    root.addChild(node([new BaseRender()]));
    root.addRender(new BaseRender());
    assert.equal(reads, 0);
    assert.equal(root.getRenderersInChildren().length, 3);
    root.getRenderersInChildren();
    assert.equal(reads, 2);
});

test('structural changes create a new snapshot without changing previous query results', () => {
    const render = new BaseRender();
    const root = node([render]);
    const previous = root.getRenderersInChildren();
    root.removeRender(render);
    const current = root.getRenderersInChildren();
    assert.notEqual(current, previous);
    assert.equal(previous.length, 1);
    assert.equal(current.length, 0);
});

test('nodes that were never queried allocate no cache and never walk their ancestors', () => {
    const root = node();
    const leaf = node();
    root.addChild(leaf);
    Object.defineProperty(leaf, 'parent', { get() { throw new Error('unused cache traversed ancestors'); } });
    leaf.addChild(node());
    leaf.addRender(new BaseRender());
    assert.equal(Object.hasOwn(root, '_renderers'), false);
    assert.equal(Object.hasOwn(leaf, '_renderers'), false);
    assert.equal(leaf._getBit(NodeFlags.RENDERERS_CACHE), false);
});

test('querying a subtree does not allocate lists on its descendants', () => {
    const leaf = node([new BaseRender()]);
    const root = node([], [leaf]);
    root.getRenderersInChildren();
    assert.equal(leaf._getBit(NodeFlags.RENDERERS_CACHE), true);
    assert.equal(Object.hasOwn(leaf, '_renderers'), false);
    leaf.addRender(new BaseRender());
    assert.equal(Object.hasOwn(leaf, '_renderers'), false);
    assert.equal(root._renderers, null);
});

test('an invalidated path stops tracking ancestors until queried again', () => {
    const leaf = node([new BaseRender()]);
    const root = node([], [leaf]);
    root.getRenderersInChildren();
    leaf.addRender(new BaseRender());
    assert.equal(leaf._getBit(NodeFlags.RENDERERS_CACHE), false);
    assert.equal(root._getBit(NodeFlags.RENDERERS_CACHE), false);
    const originalParent = leaf.parent;
    Object.defineProperty(leaf, 'parent', {
        configurable: true, get() { throw new Error('dirty path traversed ancestors again'); }
    });
    leaf.addRender(new BaseRender());
    Object.defineProperty(leaf, 'parent', { configurable: true, writable: true, value: originalParent });
    assert.equal(root.getRenderersInChildren().length, 3);
    assert.equal(leaf._getBit(NodeFlags.RENDERERS_CACHE), true);
    leaf.addRender(new BaseRender());
    assert.equal(root._renderers, null);
    assert.equal(root.getRenderersInChildren().length, 4);
});

test('nested query caches still invalidate after an outer cache is already dirty', () => {
    const nestedLeaf = node([new BaseRender()]);
    const nested = node([], [nestedLeaf]);
    const sibling = node();
    const root = node([], [nested, sibling]);
    root.getRenderersInChildren();
    nested.getRenderersInChildren();
    sibling.addRender(new BaseRender());
    assert.equal(root._renderers, null);
    assert.equal(nested.getRenderersInChildren().length, 1);
    nestedLeaf.addRender(new BaseRender());
    assert.equal(nested._renderers, null);
    assert.equal(nested.getRenderersInChildren().length, 2);
    assert.equal(root.getRenderersInChildren().length, 3);
});

test('replace, reorder and bulk child removal refresh cached traversal order', () => {
    const first = new BaseRender();
    const second = new BaseRender();
    const third = new BaseRender();
    const root = node([], [node([first]), node([second])]);
    root.getRenderersInChildren();
    root.setChildIndex(root.getChildAt(0), 1);
    assert.deepEqual(Array.from(root.getRenderersInChildren()), [second, first]);
    root.replaceChild(node([third]), root.getChildAt(0));
    assert.deepEqual(Array.from(root.getRenderersInChildren()), [third, first]);
    root.removeChildren();
    assert.equal(root.getRenderersInChildren().length, 0);
});

test('real node destruction invalidates parents and releases destroyed subtree caches', () => {
    const render = new BaseRender();
    const child = node([render]);
    const root = node([], [child]);
    root.getRenderersInChildren();
    child.getRenderersInChildren();
    child.destroy();
    assert.equal(render.destroyed, true);
    assert.equal(child._renderers, null);
    assert.equal(root.getRenderersInChildren().length, 0);
});

test('destroy(false) preserves detached child snapshots and bulk component destruction invalidates them', () => {
    const render = new BaseRender();
    const child = node([render]);
    const root = node([], [child]);
    root.getRenderersInChildren();
    const previous = child.getRenderersInChildren();
    root.destroy(false);
    assert.equal(child.parent, null);
    assert.equal(child.getRenderersInChildren(), previous);
    child.destroyAllComponent();
    assert.equal(child.getRenderersInChildren().length, 0);
});
