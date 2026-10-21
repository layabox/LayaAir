const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src/layaAir/laya');
const cache = new Map();
const physics = { I: {} };
function load(file) {
    file = path.resolve(root, file);
    if (!file.endsWith('.ts')) file += '.ts';
    if (file.endsWith('/physics/Physics2D.ts')) return { Physics2D: physics };
    if (file.endsWith('/physics/Physics2DWorldManager.ts')) return { Physics2DWorldManager: class {} };
    if (file.endsWith('/physics/Collider2D/ColliderBase.ts')) return { ColliderBase: class {} };
    if (file.endsWith('/display/Sprite.ts')) return { Sprite: class {} };
    if (file.endsWith('/utils/Utils.ts')) return { Utils: {} };
    if (file.endsWith('/LayaEnv.ts')) return { LayaEnv: { isPlaying: false } };
    if (file.endsWith('/ILaya.ts')) return { ILaya: {} };
    if (file.endsWith('/Laya.ts')) return { Laya: {} };
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInThisContext('(function(exports,require){' + code + '\n})', {filename: file})(exports, id => load(path.resolve(path.dirname(file), id)));
    return exports;
}
const { RigidBody } = load('physics/RigidBody');
const { physics2DwasmFactory: Factory } = load('physics/factory/physics2DwasmFactory');
const { FilterData } = load('physics/factory/IPhysics2DFactory');
const methods = [
    ['applyForce', 'rigidBody_applyForce', 'ApplyForce', [{x:100,y:150},{x:7,y:9}], [{x:7,y:9},{x:2,y:3}]],
    ['applyForceToCenter', 'rigidBody_applyForceToCenter', 'ApplyForceToCenter', [{x:7,y:9}], [{x:7,y:9}]],
    ['applyLinearImpulse', 'rigidbody_ApplyLinearImpulse', 'ApplyLinearImpulse', [{x:100,y:150},{x:7,y:9}], [{x:7,y:9},{x:2,y:3}]],
    ['applyLinearImpulseToCenter', 'rigidbody_ApplyLinearImpulseToCenter', 'ApplyLinearImpulseToCenter', [{x:7,y:9}], [{x:7,y:9}]],
    ['applyAngularImpulse', 'rigidbody_ApplyAngularImpulse', 'ApplyAngularImpulse', [7], [7]],
    ['applyTorque', 'rigidbody_applyTorque', 'ApplyTorque', [7], [7]],
];
for (const [api, factoryMethod, nativeMethod, args, nativeArgs] of methods) {
    test(`${api}: default/undefined/true wake, false is preserved, arguments keep their units`, () => {
        const factory = new Factory();
        factory._tempVe21 = {}; factory._tempVe22 = {};
        physics.I._factory = factory;
        const nativeCalls = [];
        const body = { world: {_pixelRatio:50}, [nativeMethod](...args) {
            nativeCalls.push(args.map(v => typeof v === 'object' ? {...v} : v));
        }};
        const rigid = {_box2DBody:body};
        for (const wakeArgs of [[], [undefined], [true], [false]]) {
            RigidBody.prototype[api].call(rigid, ...args, ...wakeArgs);
            assert.deepEqual(nativeCalls.pop(), [...nativeArgs, wakeArgs[0] !== false]);
        }
        RigidBody.prototype[api].call({_box2DBody:null}, ...args);
        assert.equal(nativeCalls.length, 0, 'uninitialized bodies remain no-ops');
        const factoryArgs = api === 'applyForce' || api === 'applyLinearImpulse' ? [body,args[1],args[0]] : [body,...args];
        factory[factoryMethod](...factoryArgs);
        assert.deepEqual(nativeCalls.pop(), [...nativeArgs,true], 'direct factory calls also default to true');
        factory[factoryMethod](...factoryArgs,false);
        assert.deepEqual(nativeCalls.pop(), [...nativeArgs,false]);
    });
}
for (const name of ['BoxShape2D','CircleShape2D','PolygonShape2D','EdgeShape2D','ChainShape2D']) {
    const Shape = load('physics/Shape/' + name)[name];
    for (const reuse of [false,true]) {
        test(`${name}.${reuse ? 'cloneTo(existing)' : 'clone'} preserves values and owns independent mutable data`, () => {
            physics.I._factory = {createFilter: () => ({})};
            const a = new Shape();
            Object.assign(a,{x:3,y:4,density:2.5,friction:.4,restitution:.7,restitutionThreshold:3,isSensor:true});
            a.filterData = Object.assign(new FilterData(),{group:-3,category:4,mask:6});
            if ('datas' in a) a.datas = [0,0,40,0,80,20];
            if ('loop' in a) a.loop = true;
            if ('width' in a) { a.width=60; a.height=20; }
            if ('radius' in a) a.radius=20;
            const b = reuse ? new Shape() : a.clone();
            const previousFilter = b.filterData;
            if (reuse) a.cloneTo(b);
            assert.equal(b.constructor,Shape);
            for (const prop of ['x','y','density','friction','restitution','restitutionThreshold','isSensor','loop','width','height','radius']) {
                if (prop in a) assert.equal(b[prop],a[prop],prop);
            }
            assert.ok(b.filterData instanceof FilterData);
            assert.deepEqual(b.filterData,a.filterData);
            assert.notEqual(b.filterData,a.filterData);
            if (reuse) assert.notEqual(b.filterData,previousFilter);
            b.filterData.mask=3; b.filterData.category=8; b.filterData.group=7;
            assert.deepEqual([a.filterData.group,a.filterData.category,a.filterData.mask],[-3,4,6]);
            a.filterData.mask=15; assert.equal(b.filterData.mask,3);
            if ('datas' in a) {
                assert.deepEqual(b.datas,a.datas); assert.notEqual(b.datas,a.datas);
                b.datas[2]=60; assert.equal(a.datas[2],40);
                a.datas[4]=90; assert.equal(b.datas[4],80);
            }
        });
    }
}
