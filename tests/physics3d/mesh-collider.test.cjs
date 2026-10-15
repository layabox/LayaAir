// Run with: node --test tests/physics3d/mesh-collider.test.cjs
// Exercise the engine's TS wrappers against the bundled Bullet runtime, without a renderer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const context = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(root, 'src/layaAir/jsLibs/bullet.js'), 'utf8'), context);
const bt = context.window.Physics3D(256, { getWorldTransform() {}, setWorldTransform() {} });

// Only vector storage and the rendering-side Mesh are substituted; native shapes are real.
class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    cloneTo(out) { Object.assign(out, this); }
    equal(v) { return this.x === v.x && this.y === v.y && this.z === v.z; }
}
const statics = {
    btStatics: { bt },
    convertToBulletVec3(v, out) { bt.btVector3_setValue(out, v.x, v.y, v.z); }
};
const modules = new Map();
function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    modules.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018 }
    }).outputText;
    vm.runInNewContext(code, { exports, console, require(id) {
        if (id.endsWith('/btStatics')) return statics;
        if (id.endsWith('/Vector3')) return { Vector3 };
        if (id.endsWith('/btColliderShape')) return load('src/layaAir/laya/Physics3D/Bullet/Shape/btColliderShape.ts');
        // Other imports describe rendering-side types or APIs unused in these tests.
        return {};
    } }, { filename: file });
    return exports;
}
const { btMeshColliderShape: Shape } = load('src/layaAir/laya/Physics3D/Bullet/Shape/btMeshColliderShape.ts');
const { btCollider: Collider } = load('src/layaAir/laya/Physics3D/Bullet/Collider/btCollider.ts');
Shape.__init__();
function mesh() {
    return {
        _isReadable: true,
        _indexBuffer: { getData() { return new Uint16Array([0, 1, 2]); } },
        getPositions(out) {
            if (!this._isReadable) throw new Error('NotReadableError');
            out.push(new Vector3(), new Vector3(1, 0, 0), new Vector3(0, 0, 1));
        }
    };
}
function scale(shape) {
    const p = bt.btCollisionShape_getLocalScaling(shape._btShape);
    return [bt.btVector3_x(p), bt.btVector3_y(p), bt.btVector3_z(p)];
}
test('shared Mesh geometry keeps native scales independent after CPU data is released', () => {
    const source = mesh();
    const a = new Shape(), b = new Shape();
    try {
        a.setPhysicsMeshFromMesh(source);
        source._isReadable = false;
        b.setPhysicsMeshFromMesh(source);
        a.setWorldScale(new Vector3(2, 2, 2));
        b.setWorldScale(new Vector3(3, 3, 3));
        assert.deepEqual(scale(a), [2, 2, 2]);
        assert.deepEqual(scale(b), [3, 3, 3]);
        a.destroy();
        assert.deepEqual(scale(b), [3, 3, 3]);
    } finally { a.destroy(); b.destroy(); }
});
test('native shape rebuild rebinds the collider, reapplies scale, and retains the wrapper', () => {
    const source = mesh();
    const shape = new Shape();
    const collider = Object.create(Collider.prototype);
    collider._btCollider = bt.btCollisionObject_create();
    collider.componentEnable = true;
    const events = [];
    const setCollisionShape = bt.btCollisionObject_setCollisionShape;
    let boundShape;
    bt.btCollisionObject_setCollisionShape = (object, nativeShape) => {
        boundShape = nativeShape;
        setCollisionShape(object, nativeShape);
    };
    collider._physicsManager = {
        removeCollider(c) { events.push('remove'); c._isSimulate = false; },
        addCollider(c) { events.push('add'); c._isSimulate = true; }
    };
    collider._onShapeChange = () => events.push('shape');
    collider._derivePhysicsTransformation = () => shape.setWorldScale(new Vector3(4, 4, 4));
    try {
        shape.setPhysicsMeshFromMesh(source);
        collider.setColliderShape(shape);
        events.length = 0;
        shape.setPhysicsMeshFromMesh(source);
        assert.deepEqual(events, ['remove', 'shape', 'add']);
        assert.equal(boundShape, shape._btShape);
        assert.deepEqual(scale(shape), [4, 4, 4]);
        assert.equal(shape._destroyed, false);
    } finally {
        bt.btCollisionObject_setCollisionShape = setCollisionShape;
        shape.destroy();
        bt.btCollisionObject_destroy(collider._btCollider);
    }
});
test('triangle/convex transitions and repeated destruction preserve other colliders', () => {
    const source = mesh();
    const a = new Shape(), b = new Shape();
    try {
        a.setPhysicsMeshFromMesh(source);
        b.setPhysicsMeshFromMesh(source);
        source._isReadable = false;
        a.setConvexMesh(source);
        a.setWorldScale(new Vector3(2, 2, 2));
        a.setPhysicsMeshFromMesh(source);
        a.destroy(); a.destroy();
        b.setWorldScale(new Vector3(3, 3, 3));
        assert.deepEqual(scale(b), [3, 3, 3]);
    } finally { a.destroy(); b.destroy(); }
});
