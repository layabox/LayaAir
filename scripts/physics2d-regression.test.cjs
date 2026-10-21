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
    if (file.endsWith('/components/Component.ts')) return { Component: class {} };
    if (file.endsWith('/display/Sprite.ts')) return { Sprite: class {} };
    if (file.endsWith('/utils/Utils.ts')) return { Utils: {toRadian:v=>v*Math.PI/180,toAngle:v=>v*180/Math.PI} };
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

const { PrismaticJoint } = load('physics/joint/PrismaticJoint');
const { WheelJoint } = load('physics/joint/WheelJoint');
const { WeldJoint } = load('physics/joint/WeldJoint');
const { GearJoint } = load('physics/joint/GearJoint');
const { MotorJoint } = load('physics/joint/MotorJoint');
const { MouseJoint } = load('physics/joint/MouseJoint');
const { JointBase } = load('physics/joint/JointBase');
function jointFixture(Cls) {
    const factory = new Factory(); factory._box2d = {};
    physics.I._factory = factory;
    const a = {destroyed:false,GetMass:()=>2,GetInertia:()=>.3};
    const b = {destroyed:false,GetMass:()=>3,GetInertia:()=>.7};
    const world = {_pixelRatio:50,destroyed:false};
    const native = {world,bodyA:a,bodyB:b,destroyed:false,GetBodyA:()=>a,GetBodyB:()=>b,
        SetMaxMotorForce(v){this.force=v;},SetMaxMotorTorque(v){this.torque=v;},
        SetLimits(a,b){this.limits=[a,b];},SetStiffness(v){this.stiffness=v;},SetDamping(v){this.damping=v;},
        SetRatio(v){this.ratio=v;},SetMaxForce(v){this.maxForce=v;},SetAngularOffset(v){this.angle=v;},
        SetLinearOffset(v){this.offset={...v};}};
    factory._tempVe21 = {Set(x,y){this.x=x;this.y=y;}};
    const component = new Cls(); component._joint=native;
    return {factory,component,native,a,b,world};
}
test('prismatic motor force uses force API and preserves torque API for wheel',()=>{
    const p=jointFixture(PrismaticJoint);p.component.maxMotorForce=135;assert.equal(p.native.force,135);assert.equal(p.native.torque,undefined);
    const w=jointFixture(WheelJoint);w.component.maxMotorTorque=246;assert.equal(w.native.torque,246);
});
for(const Cls of [PrismaticJoint,WheelJoint])test(`${Cls.name} runtime translation limits use pixels; angular limits remain radians`,()=>{
    const {component,native,factory}=jointFixture(Cls);component.lowerTranslation=-25;component.upperTranslation=75;
    assert.deepEqual(native.limits,[-.5,1.5]);component.upperTranslation=75;assert.deepEqual(native.limits,[-.5,1.5]);
    factory.set_Joint_SetLimits(native,-Math.PI/4,Math.PI/4);assert.deepEqual(native.limits,[-Math.PI/4,Math.PI/4]);
});
for(const [Cls,angular] of [[WheelJoint,false],[WeldJoint,true]])test(`${Cls.name} runtime spring frequency and damping use the same units as initialization`,()=>{
    const {component,native,factory,a,b}=jointFixture(Cls);component.frequency=3;component.damping=.4;
    const expected={};factory[angular?'b2AngularStiffness':'b2LinearStiffness'](expected,3,.4,a,b);
    assert.equal(native.stiffness,expected.stiffness);assert.equal(native.damping,expected.damping);
    component.frequency=3;assert.equal(native.stiffness,expected.stiffness);assert.equal(native.damping,expected.damping);
    component.damping=.8;assert.equal(native.stiffness,expected.stiffness);assert.equal(native.damping,2*expected.damping);
});
test('gear ratio runtime assignment preserves the initialization sign convention',()=>{
    const {component,native}=jointFixture(GearJoint);for(const ratio of [2,2,-3]){component.ratio=ratio;assert.equal(native.ratio,-ratio);}
});
test('mouse force runtime assignment uses body mass, matching initialization',()=>{
    const {component,native,b}=jointFixture(MouseJoint);component.maxForce=1000;assert.equal(native.maxForce,3000);
    b.GetMass=()=>5;component.maxForce=1000;assert.equal(native.maxForce,5000);
});
test('motor preserves legacy body order, local position offset and negated angular conversion',()=>{
    const {component,native,factory,a,b,world}=jointFixture(MotorJoint);component._joint=null;
    const owner={scene:{getComponentElementManager:()=>({box2DWorld:world})},off(){}};
    component.owner=owner;component.selfBody={getBox2DBody:()=>b,owner};component.otherBody={getBox2DBody:()=>a,owner};
    let def;factory.createJointDef=(_,__,value)=>{def=value;return value;};factory.createJoint=()=>native;
    for (const [offset,angle] of [[[0,0],0],[[80,-40],30],[[-80,25],-45],[[40,10],20]]) {
        component._joint=null;component.linearOffset=offset;component.angularOffset=angle;
        component._createJoint();assert.equal(def.bodyA,b);assert.equal(def.bodyB,a);
        assert.deepEqual([def.linearOffset.x,def.linearOffset.y],offset);
        assert.equal(def.angularOffset,-angle*Math.PI/180);
        component.linearOffset=offset;component.angularOffset=angle;
        assert.deepEqual([native.offset.x,native.offset.y],offset.map(v=>v/50));assert.equal(native.angle,-angle*Math.PI/180);
    }
});
test('joint validity checks wrapper lifetime without dereferencing native pointers',()=>{
    const {component,native,factory,a,b,world}=jointFixture(JointBase);
    native.GetCollideConnected=()=>{throw Error('must not read collision flags or a freed pointer');};
    assert.equal(component.isValid(),true);
    for(const target of [native,a,b,world]){target.destroyed=true;assert.equal(component.isValid(),false);target.destroyed=false;}
    assert.equal(factory.isValidJoint(null),false);assert.equal(factory.isValidJoint({}),false);
    component._joint=null;assert.equal(component.isValid(),false);
});
test('explicit removal and component disable do not remove a joint twice or read a destroyed body',()=>{
    const {component,native,factory,a,world}=jointFixture(JointBase);let count=0;world.DestroyJoint=()=>count++;
    factory.removeJoint(world,native);assert.equal(count,1);assert.equal(component.isValid(),false);
    factory.removeJoint(world,native);assert.equal(count,1);
    native.destroyed=false;a.destroyed=true;component._physics2DManager={box2DWorld:world};component._onDisable();
    assert.equal(count,1);assert.equal(component._joint,null);
});
