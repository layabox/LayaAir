// Run: node --test tests/sprite-mask-destroy.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src/layaAir/laya');

// Run the production transform store and Web memory allocator without a GPU.
const modules = new Map();
function load(relative) {
    const file = path.resolve(root, relative.endsWith('.ts') ? relative : relative + '.ts');
    if (file === path.join(root, 'layagl/LayaGL.ts')) return { LayaGL: {} };
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    vm.runInThisContext('(function(module,exports,require){' + code + '\n})', { filename: file })(
        module, module.exports, request => load(path.resolve(path.dirname(file), request)));
    return module.exports;
}
const { Transform2DStore } = load('display/transform2d/Transform2DStore');
const { WebTransform2DMemoryFactory } = load('RenderDriver/RenderModuleData/WebModuleData/2D/WebTransform2DMemoryFactory');
const { SlotConst } = load('display/transform2d/Transform2DLayout');
const constants = load('display/SpriteConst');
const { NodeFlags } = load('Const');

const sources = new Map();
function source(relative) {
    if (!sources.has(relative)) {
        const file = path.join(root, relative + '.ts');
        sources.set(relative, ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true));
    }
    return sources.get(relative);
}
function members(relative, names) {
    const ast = source(relative);
    const declaration = ast.statements.find(ts.isClassDeclaration);
    const selected = declaration.members.filter(node => node.name && names.includes(node.name.getText(ast)));
    for (const name of names) assert.ok(selected.some(node => node.name.getText(ast) === name), relative + ': ' + name);
    return selected.map(node => node.getText(ast)).join('\n');
}

// Keep lifecycle, mask/cache setters, parent synchronization and render-offset math
// unchanged from source. GPU resources and display/component initialization are isolated.
const context = {
    ...constants, NodeFlags, SlotConst, Transform2DStore,
    Pool: load('utils/Pool').Pool,
    Event: { ADDED: 'added', REMOVED: 'removed' },
    ILaya: { stage: { _tranMatrixUpdateList: new Set() } }, Stat: { loopCount: 1 }
};
const transformClass = source('display/SpriteGlobaTransform').statements.find(ts.isClassDeclaration);
const mathClasses = ['maths/Point', 'maths/Matrix', 'maths/Rectangle'].map(relative =>
    source(relative).statements.find(ts.isClassDeclaration).getText().replace(/^export /, '')).join('\n');
const code = `
${mathClasses}
const _m6 = new Float32Array(6);
${transformClass.getText().replace(/^export /, '')}
class Node {
    constructor() {
        this._children = []; this._$children = this._children;
        this._parent = this._$parent = null; this._destroyed = false; this._bits = 0;
    }
    destroyAllComponent() {} _onAdded() {} _onRemoved() {} event() {} _childChanged() {} onDestroy() {} offAll() {}
    ${members('display/Node', ['destroy', '_setParent', '_removeChild', 'removeChild', 'isAncestorOf', '_getBit'])}
}
class Sprite extends Node {
    constructor() {
        super(); this._mouseState = 1; this._renderType = 0;
        this._mask = this._maskParent = null;
        this._x = this._y = this._rotation = this._skewX = this._skewY = this._pivotX = this._pivotY = 0;
        this._scaleX = this._scaleY = 1;
        this._globalTrans = new SpriteGlobalTransform(this);
        this.repaints = 0;
    }
    _setStructParent() {} _processVisible() {} setGraphics() {} setSubpassFlag() {}
    repaint() { this.repaints++; }
    ${members('display/Sprite', ['destroy', '_setParent', '_syncTransParent', 'mask', 'cacheAs', 'globalTrans', 'parent', 'x', 'y'])}
}
class GWidget extends Sprite {
    constructor() { super(); this._controllers = {}; this._gears = []; }
    ${members('ui2/GWidget', ['destroy'])}
}
class SubStructRender {
    constructor(sprite) {
        this._sprite = sprite;
        this._subRenderPass = {offsetMatrix: new Matrix()};
        this._handle = {logicMatrix: null};
        this._rtRect = new Rectangle(); this._oriRect = new Rectangle();
        this._scaleX = this._scaleY = 1;
    }
    ${members('display/Scene2DSpecial/GraphicsRenderPipeline/SubStructRender', ['_updateRenderOffset', '_updateLogicMatrix'])}
}
this.classes = { Sprite, GWidget, SubStructRender, Rectangle };
`;
vm.runInNewContext(ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 }
}).outputText, context);
const { Sprite, GWidget, SubStructRender, Rectangle } = context.classes;

function fixture() {
    const store = new Transform2DStore(new WebTransform2DMemoryFactory());
    Transform2DStore._instance = store;
    context.ILaya.stage._tranMatrixUpdateList.clear();
    const freed = new Set();
    const free = store.free;
    store.free = function (slot) {
        const owner = this.getOwner(slot);
        assert.ok(owner, 'slot still has a live owner');
        assert.equal(freed.has(owner), false, 'each owner releases its slot once');
        assert.equal(this.debugChildrenOf(slot).length, 0, 'no transform children remain when releasing a slot');
        freed.add(owner);
        free.call(this, slot);
    };
    return { store, freed };
}
function attach(parent, ...children) {
    for (const child of children) {
        parent._children.push(child);
        child._$parent = parent;
        child._setParent(parent);
    }
}
function unlinked(owner, mask) {
    assert.equal(owner.mask, null);
    assert.equal(mask._maskParent, null);
    assert.equal(owner._renderType & constants.SpriteConst.MASK, 0);
    assert.equal(mask.cacheAs, 'none');
}

for (const ownerFirst of [true, false]) {
    test('nested GWidget scene destroys sibling masks, owner first=' + ownerFirst, () => {
        const { freed } = fixture();
        const scene = new GWidget(), group = new GWidget(), owner = new GWidget(), mask = new GWidget();
        attach(scene, group);
        attach(group, ...(ownerFirst ? [owner, mask] : [mask, owner]));
        owner.mask = mask;
        scene.destroy();
        unlinked(owner, mask);
        for (const node of [scene, group, owner, mask]) {
            assert.equal(node._destroyed, true);
            assert.equal(node._globalTrans, null);
        }
        assert.equal(freed.size, 4);
    });
}

test('destroying an owner detaches a surviving external mask before its slot is freed', () => {
    const { store, freed } = fixture();
    const owner = new Sprite(), mask = new Sprite();
    const ownerSlot = owner._globalTrans.slot, maskSlot = mask._globalTrans.slot;
    owner.mask = mask;
    assert.equal(store.getParent(maskSlot), ownerSlot);
    owner.destroy();
    unlinked(owner, mask);
    assert.equal(mask._destroyed, false);
    assert.equal(store.getParent(maskSlot), SlotConst.None);
    assert.equal(freed.size, 1);
    const replacement = new Sprite();
    assert.equal(replacement._globalTrans.slot, ownerSlot, 'exercise reuse of the freed owner slot');
    assert.equal(store.getParent(maskSlot), SlotConst.None, 'mask does not inherit from the replacement');
    mask.destroy();
    replacement.destroy();
});

test('destroying the mask clears a live owner and invalidates its rendering', () => {
    fixture();
    const parent = new Sprite(), owner = new Sprite(), mask = new Sprite();
    attach(parent, mask);
    owner.mask = mask;
    const repaints = owner.repaints;
    mask.destroy();
    unlinked(owner, mask);
    assert.equal(owner._destroyed, false);
    assert.ok(owner.repaints > repaints);
    assert.equal(parent._children.length, 0);
    owner.destroy();
    parent.destroy();
});

test('destroying a former owner preserves the transferred mask and its current transform parent', () => {
    const { store, freed } = fixture();
    const previous = new Sprite(), current = new Sprite(), mask = new Sprite();
    previous.mask = mask;
    current.mask = mask;
    const maskSlot = mask._globalTrans.slot, currentSlot = current._globalTrans.slot;
    const ownerRepaints = current.repaints, maskRepaints = mask.repaints;
    assert.equal(store.getParent(maskSlot), currentSlot);

    previous.destroy();

    assert.equal(previous.mask, null);
    assert.equal(previous._renderType & constants.SpriteConst.MASK, 0);
    assert.equal(current.mask, mask);
    assert.equal(mask._maskParent, current);
    assert.equal(mask.cacheAs, 'bitmap');
    assert.notEqual(current._renderType & constants.SpriteConst.MASK, 0);
    assert.equal(store.getParent(maskSlot), currentSlot);
    assert.equal(current._destroyed, false);
    assert.equal(mask._destroyed, false);
    assert.equal(current.repaints, ownerRepaints);
    assert.equal(mask.repaints, maskRepaints);
    assert.equal(freed.size, 1);

    current.destroy();
    unlinked(current, mask);
    assert.equal(store.getParent(maskSlot), SlotConst.None);
    mask.destroy();
    assert.equal(freed.size, 3);
});

for (const first of ['current owner', 'mask']) {
    test('transferred mask can be destroyed before its former owner: first=' + first, () => {
        const { store, freed } = fixture();
        const previous = new Sprite(), current = new Sprite(), mask = new Sprite();
        previous.mask = mask;
        current.mask = mask;
        (first === 'current owner' ? current : mask).destroy();
        unlinked(current, mask);
        if (!mask._destroyed)
            assert.equal(store.getParent(mask._globalTrans.slot), SlotConst.None);

        previous.destroy();
        assert.equal(previous.mask, null);
        assert.equal(previous._renderType & constants.SpriteConst.MASK, 0);
        unlinked(current, mask);
        current.destroy();
        mask.destroy();
        assert.equal(freed.size, 3);
    });

    test('former owner continues cached rendering after transferred ' + first + ' is destroyed', () => {
        const { freed } = fixture();
        const previous = new Sprite(), current = new Sprite(), mask = new Sprite();
        previous.cacheAs = 'bitmap';
        previous.mask = mask;
        const render = new SubStructRender(previous);
        const rect = new Rectangle(2, 3, 16, 12);
        render._updateRenderOffset(rect, rect, 1, 1);
        assert.ok(render._handle.logicMatrix, 'the former owner rendered with its mask before transfer');
        const repaints = previous.repaints;
        current.mask = mask;
        (first === 'current owner' ? current : mask).destroy();

        // Run the production render-offset consumer before destroying the former owner.
        assert.doesNotThrow(() => render._updateRenderOffset(rect, rect, 1, 1));
        assert.equal(render._handle.logicMatrix, null, 'rendering no longer consumes the transferred mask');
        const matrix = render._subRenderPass.offsetMatrix;
        assert.deepEqual([matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty], [1, 0, 0, 1, 2, 3]);
        assert.equal(previous._destroyed, false);
        assert.equal(previous.mask, null);
        assert.equal(previous._renderType & constants.SpriteConst.MASK, 0);
        assert.equal(previous.cacheAs, 'bitmap', 'the former owner retains its own cache');
        assert.ok(previous.repaints > repaints, 'transfer invalidates the former owner');
        unlinked(current, mask);

        previous.destroy(); current.destroy(); mask.destroy();
        assert.equal(freed.size, 3);
    });
}

test('replacing, repeatedly transferring and returning a mask keeps a single current owner', () => {
    const { store, freed } = fixture();
    const a = new Sprite(), b = new Sprite(), c = new Sprite(), mask = new Sprite(), replaced = new Sprite();
    a.mask = mask;
    b.mask = replaced;
    for (const [previous, current] of [[a, b], [b, c], [c, a]]) {
        current.mask = mask;
        assert.equal(previous.mask, null);
        assert.equal(previous._renderType & constants.SpriteConst.MASK, 0);
        assert.equal(current.mask, mask);
        assert.equal(mask._maskParent, current);
        assert.equal(mask.cacheAs, 'bitmap');
        assert.equal(store.getParent(mask._globalTrans.slot), current._globalTrans.slot);
        assert.equal(replaced._maskParent, null);
        assert.equal(replaced.cacheAs, 'none');
        assert.equal(store.getParent(replaced._globalTrans.slot), SlotConst.None);
    }
    for (const node of [b, mask, c, a, replaced]) node.destroy();
    assert.equal(freed.size, 5);
});

test('destroy(false) preserves child masks with no stale owner or transform parent', () => {
    const { store, freed } = fixture();
    const owner = new Sprite(), mask = new Sprite();
    attach(owner, mask);
    owner.mask = mask;
    const maskSlot = mask._globalTrans.slot;
    owner.destroy(false);
    unlinked(owner, mask);
    assert.equal(mask._destroyed, false);
    assert.equal(mask._parent, null);
    assert.equal(store.getParent(maskSlot), SlotConst.None);
    assert.equal(freed.size, 1);
    mask.destroy();
});

test('destroying the middle of a mask chain releases both mask relationships', () => {
    const { store } = fixture();
    const owner = new Sprite(), middle = new Sprite(), mask = new Sprite();
    owner.mask = middle;
    middle.mask = mask;
    middle.destroy();
    unlinked(owner, middle);
    unlinked(middle, mask);
    assert.equal(store.getParent(mask._globalTrans.slot), SlotConst.None);
    owner.destroy();
    mask.destroy();
});

test('parent synchronization preserves display-parent precedence and falls back to a live mask owner', () => {
    const { store } = fixture();
    const parent = new Sprite(), owner = new Sprite(), mask = new Sprite();
    attach(parent, mask);
    owner.mask = mask;
    assert.equal(store.getParent(mask._globalTrans.slot), parent._globalTrans.slot);
    parent.removeChild(mask);
    assert.equal(store.getParent(mask._globalTrans.slot), owner._globalTrans.slot);
    owner.mask = null;
    assert.equal(store.getParent(mask._globalTrans.slot), SlotConst.None);
    parent.destroy(); owner.destroy(); mask.destroy();
});

test('parent synchronization tolerates released self, display-parent and mask-owner transforms', () => {
    const { store } = fixture();
    const dead = new Sprite();
    dead.destroy();
    assert.doesNotThrow(() => dead._syncTransParent());
    const node = new Sprite();
    node._parent = dead;
    node._syncTransParent();
    assert.equal(store.getParent(node._globalTrans.slot), SlotConst.None);
    node._parent = null;
    node._maskParent = dead;
    node._syncTransParent();
    assert.equal(store.getParent(node._globalTrans.slot), SlotConst.None);
    node._maskParent = null;
    node.destroy();
});

test('repeated destruction leaves live former masks untouched and does not free slots twice', () => {
    const { freed } = fixture();
    const owner = new Sprite(), mask = new Sprite();
    owner.mask = mask;
    owner.destroy();
    const repaints = mask.repaints;
    owner.destroy();
    assert.equal(mask.repaints, repaints);
    assert.equal(freed.size, 1);
    mask.destroy(); mask.destroy();
    assert.equal(freed.size, 2);
});

test('sprite destroys its owned shader data exactly once and releases the reference', () => {
    fixture();
    const sprite = new Sprite();
    let disposals = 0;
    sprite._shaderData = {destroy() { disposals++; }};
    sprite.destroy();
    assert.equal(disposals, 1);
    assert.equal(sprite._shaderData, null);
    sprite.destroy();
    assert.equal(disposals, 1);
});
