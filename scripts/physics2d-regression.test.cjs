const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src/layaAir/laya');
const cache = new Map();
const physics = { I: {}, getDesignScaleX:()=>1, getDesignScaleY:()=>1 };
const env = {isPlaying:false};
function load(file) {
    file = path.resolve(root, file);
    if (!file.endsWith('.ts')) file += '.ts';
    if (file.endsWith('/physics/Physics2D.ts')) return { Physics2D: physics };
    if (file.endsWith('/physics/Physics2DWorldManager.ts')) return { Physics2DWorldManager: class {} };
    if (file.endsWith('/physics/Collider2D/ColliderBase.ts')) return { ColliderBase: class {} };
    if (file.endsWith('/components/Component.ts')) return { Component: class {} };
    if (file.endsWith('/display/Sprite.ts')) return { Sprite: class {} };
    if (file.endsWith('/utils/Utils.ts')) return { Utils: {toRadian:v=>v*Math.PI/180,toAngle:v=>v*180/Math.PI} };
    if (file.endsWith('/LayaEnv.ts')) return { LayaEnv: env };
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

// Final release sweep: native arguments, world ownership and runtime lifecycle.
function isolatedPhysics(name, mocks) {
    const file=path.resolve(root,name+'.ts');
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2021,module:ts.ModuleKind.CommonJS}}).outputText;
    const exp={};vm.runInThisContext('(function(exports,require){'+code+'\n})',{filename:file})(exp,id=>mocks[id]||{});return exp;
}
const {Vector2}=load('maths/Vector2');
const {Physics2DWorldManager:WorldManager}=isolatedPhysics('physics/Physics2DWorldManager',{'../display/Scene':{Scene:{regManager(){}}},'./Physics2D':{Physics2D:physics},'../maths/Vector2':{Vector2},'./factory/IPhysics2DFactory':load('physics/factory/IPhysics2DFactory')});
const {ColliderBase:MassCollider}=isolatedPhysics('physics/Collider2D/ColliderBase',{'../../components/Component':{Component:class{}},'../Physics2D':{Physics2D:physics},'../../maths/Point':load('maths/Point'),'../../maths/Vector2':{Vector2}});
for(const space of ['World','Local'])test(`point velocity ${space}: native vector input, pixel result, input remains unchanged`,()=>{
    const f=new Factory();f._tempVe21={};const point={x:100,y:150};const body={world:{_pixelRatio:50},['GetLinearVelocityFrom'+space+'Point'](p){assert.equal(p,f._tempVe21);assert.deepEqual(p,{x:2,y:3});return {x:4,y:-2};}};
    assert.deepEqual(f['get_rigidBody_linearVelocityFrom'+space+'Point'](body,point),{x:200,y:-100});assert.deepEqual(point,{x:100,y:150});
});
test('distance length read uses same pixel units as write',()=>{
 const f=new Factory();const j={world:{_pixelRatio:50},SetLength(n){this.length=n},GetLength(){return this.length}};f.set_DistanceJoint_length(j,60);assert.equal(j.length,1.2);assert.equal(f.get_DistanceJoint_length(j),60);
});
test('joint grounds belong to their manager and survive destruction of another world',()=>{
 const removed=[];physics.I._factory={createBody(world){return {world}},removeBody(world,b){assert.equal(b.world,world);removed.push(b);},worldMap:new Map(),destroyWorld(world){world.destroyed=true}};
 const a=Object.assign(Object.create(WorldManager.prototype),{_box2DWorld:{_indexInMap:1}}),b=Object.assign(Object.create(WorldManager.prototype),{_box2DWorld:{_indexInMap:2}});
 const ga=a.getEmptyBody(),gb=b.getEmptyBody();assert.notEqual(ga,gb);assert.equal(a.getEmptyBody(),ga);b.destroy();assert.deepEqual(removed,[gb]);assert.equal(a.getEmptyBody(),ga);a.destroy();assert.deepEqual(removed,[gb,ga]);
});
test('world runtime parameters update native gravity and inverse conversion together; old substeps remain opt-in',()=>{
 const values=[];physics.I._factory={createPhyVec2:(x,y)=>({x,y}),destroyData:v=>values.push(v)};
 const m=Object.assign(Object.create(WorldManager.prototype),{_gravity:new Vector2(),_pixelRatio:50,_RePixelRatio:.02,_box2DWorld:{SetGravity(v){this.gravity={...v}}},_subStep:4,_subStepCount:1});
 m.setGravity(new Vector2(0,0));assert.deepEqual(m.box2DWorld.gravity,{x:0,y:0});assert.equal(values.length,1);m.setPixel_Ratio(100);assert.equal(m.box2DWorld._pixelRatio,100);assert.equal(m.physics2DToLaya(m.layaToPhysics2D(125)),125);
 assert.equal(m._subStepCount,1,'legacy config does not silently change simulation');m.setSubStep(3);assert.equal(m._subStepCount,3);for(const n of [NaN,0,-1,Infinity])assert.throws(()=>m.setPixel_Ratio(n));for(const n of [0,1.5,Infinity])assert.throws(()=>m.setSubStep(n));
});
test('runtime substeps preserve a force for the full frame and dispatch after clearing',()=>{
 const f=new Factory(),steps=[],events=[];let auto=true,clears=0;const native={_pixelRatio:50,GetBodyCount:()=>1,GetAutoClearForces:()=>auto,SetAutoClearForces:v=>auto=v,Step(dt,v,p){assert.equal(auto,false);steps.push([dt,v,p])},ClearForces(){clears++}};
 f.worldMap.set(0,{box2DWorld:native,_subStepCount:3,getVelocityIterations:()=>6,getPositionIterations:()=>2,sendEvent:()=>{assert.equal(clears,1);events.push(steps.length)}});f.worldCount=0;physics.I._factory=f;f.update(.03);assert.deepEqual(steps,[[.01,6,2],[.01,6,2],[.01,6,2]]);assert.deepEqual(events,[3]);assert.equal(clears,1);assert.equal(auto,true);
});
test('substep callback can destroy a world without stepping a freed native world',()=>{
 const f=new Factory();let steps=0;const native={GetBodyCount:()=>1,GetAutoClearForces:()=>true,SetAutoClearForces(){},ClearForces(){},Step(){steps++}};
 f.worldMap.set(0,{box2DWorld:native,_subStepCount:4,getVelocityIterations:()=>8,getPositionIterations:()=>3,sendEvent(){native.destroyed=true;f.worldMap.delete(0)}});f.worldCount=0;physics.I._factory=f;f.update(.04);assert.equal(steps,4);
});
test('manual mass stays explicit; automatic mass can be restored without reinterpreting manual center units',()=>{
 const calls=[];physics.I._factory={retSet_rigidBody_MassData:()=>calls.push('auto'),set_rigidBody_Mass:(...v)=>calls.push(v)};
 const c=Object.assign(Object.create(MassCollider.prototype),{_box2DBody:{},_mass:7,_inertia:1000,_centerOfMass:new Vector2(2,3),_massData:{},_useAutoMass:false});c._resetMassData();assert.equal(calls[0][2],c._centerOfMass);c.useAutoMass=true;assert.equal(calls[1],'auto');c.useAutoMass=true;assert.equal(calls.length,2);c.useAutoMass=false;assert.deepEqual([calls[2][2].x,calls[2][2].y],[2,3]);
});
test('shape array replacement removes old fixtures for dynamic and static colliders',()=>{
 const {StaticCollider}=load('physics/StaticCollider');
 for(const C of [RigidBody,StaticCollider]){
  let deleted=0,attached=0;const old={destroy(){deleted++}},next={setCollider(){attached++},destroy(){deleted++}};
  const body={_shapes:[old],_useAutoMass:true,_box2DBody:null};Object.getOwnPropertyDescriptor(C.prototype,'shapes').set.call(body,[next]);assert.equal(deleted,1);assert.equal(attached,1);Object.getOwnPropertyDescriptor(C.prototype,'shapes').set.call(body,[]);assert.equal(deleted,2);
 }
});
test('stop/start retains registered bodies for render synchronization',()=>{
 const timer={frameLoop(){},clear(){}};const {Physics2D:P}=isolatedPhysics('physics/Physics2D',{'../../Laya':{Laya:{addInitCallback(){}}},'../events/EventDispatcher':{EventDispatcher:class{}},'../../ILaya':{ILaya:{physicsTimer:timer}},'../../LayaEnv':{LayaEnv:{isPlaying:true}},'./Physics2DOption':{Physics2DOption:{}},'../utils/SingletonList':{SingletonList:class{}}});
 let synced=0;const p=new P();const body={_updatePhysicsTransformToRender(){synced++}};p._rigiBodyList={length:1,elements:[body],clear(){throw Error('registered bodies must survive pause')}};p.stop();p.start();p._updatePhysicsTransformToRender();assert.equal(synced,1);
});
test('unsupported origin shift warns without mutating bodies; supported binding receives native vector',()=>{
 const f=new Factory();let warned=0,called;const warn=console.warn;console.warn=()=>warned++;try{f.shiftOrigin({},new Vector2(2,3));}finally{console.warn=warn;}assert.equal(warned,1);f._tempVe21={Set(x,y){this.x=x;this.y=y}};f.shiftOrigin({ShiftOrigin(v){called=v}},new Vector2(2,3));assert.equal(called,f._tempVe21);assert.deepEqual([called.x,called.y],[2,3]);
});

test('destroying a scene during a contact callback stops queued native contact access',()=>{
 const cleaned=[];physics.I._factory={_cleanCache:v=>cleaned.push(v)};const first={},second={};let calls=0;const m=Object.assign(Object.create(WorldManager.prototype),{_box2DWorld:{},_eventList:['triggerenter',first,'triggerenter',second],_dispatchEvent(){calls++;this._box2DWorld=null;this._eventList=null}});m.sendEvent();assert.equal(calls,1);assert.deepEqual(cleaned,[first,second]);m.sendEvent();
});

test('null shapes preserves legacy Collider mode while empty arrays explicitly select modern shapes',()=>{
 physics.I._factory={createMassData:()=>({})};
 for (const initial of [true,false]) {
  const rb=new RigidBody();rb.applyOwnerColliderComponent=initial;let removed=0;
  rb._shapes=[{destroy(){removed++}}];rb.shapes=null;
  assert.equal(removed,1);assert.equal(rb.shapes,null);assert.equal(rb.applyOwnerColliderComponent,initial);
  rb.shapes=[];assert.equal(rb.applyOwnerColliderComponent,false);
 }
});

test('rigid body cleanup releases only its owned legacy fixtures, including late-added colliders',()=>{
 const body={},otherBody={},calls=[];
 const old={getBox2DBody:()=>body,_removeShapeAndDestroyData(){calls.push('legacy')}};
 const unrelated={getBox2DBody:()=>otherBody,_removeShapeAndDestroyData(){throw Error('must not remove another body')}};
 const rb={_box2DBody:body,_shapes:null,_colliders:[],owner:{getComponents(){return [old,unrelated]}}};
 RigidBody.prototype._destroyAllShape.call(rb);assert.deepEqual(calls,['legacy']);
 rb._shapes=[{destroy(){calls.push('modern')}}];RigidBody.prototype._destroyAllShape.call(rb);assert.deepEqual(calls,['legacy','legacy','modern']);
});

// Exercise the shipped native implementations, not a mock of Step/contact behavior.
for (const backend of ['js','wasm']) test(`native ${backend}: geometry continuity, legacy fixture lifecycle and substep callback forces`,async()=>{
 const nativeDir=path.resolve(root,'../jsLibs');
 const oldWindow=global.window,oldLaya=global.Laya;
 global.window={};global.Laya={WasmAdapter:{create:f=>f}};
 let box;
 try {
  const Box2D=require(path.join(nativeDir,backend==='wasm'?'laya.Box2D.wasm.js':'laya.Box2D.js'));
  box=await Box2D(backend==='wasm'?{wasmBinary:fs.readFileSync(path.join(nativeDir,'laya.Box2D.wasm.wasm'))}:{});
 } finally {global.window=oldWindow;global.Laya=oldLaya;}
 const f=new Factory();f._box2d=box;f._tempVe21=new box.b2Vec2();f._tempVe22=new box.b2Vec2();physics.I._factory=f;
 env.isPlaying=true;
 const managers=[];
 function manager(n=1,gravity=0){
  const w=f.createWorld({gravity:{x:0,y:gravity}});w._pixelRatio=50;
  const m=Object.assign(Object.create(WorldManager.prototype),{_box2DWorld:w,_subStepCount:n,_eventList:[],_pixelRatio:50,_RePixelRatio:.02,getVelocityIterations:()=>8,getPositionIterations:()=>3});
  const l=new box.JSContactListener();l.BeginContact=p=>m._worldBeginContactCallback(p);l.EndContact=p=>m._worldEndContactCallback(p);l.PreSolve=p=>m._worldPreSolveCallback(p);l.PostSolve=()=>{};w.SetContactListener(l);managers.push(m);return m;
 }
 function shape(m,type,name,x=0){
  const d=new box.b2BodyDef();d.type=type;d.position.Set(x,0);d.allowSleep=false;
  const b=f.createBody(m.box2DWorld,d);const events=[];
  const c={owner:{pivotX:0,pivotY:0,scene:{getComponentElementManager:()=>m},event(type,...args){events.push(type);}},getBox2DBody:()=>b,_resetMassData(){b.ResetMassData()}};
  const S=load('physics/Shape/'+name)[name],s=new S();s.isSensor=true;
  if(name==='BoxShape2D'){s.width=40;s.height=40;}
  if(name==='CircleShape2D'){s.radius=20;s.x=20;s.y=20;}
  if(name==='PolygonShape2D')s.datas=[0,0,40,0,40,40,0,40];
  if(name==='EdgeShape2D')s.datas=[0,20,40,20];
  s.setCollider(c);return {s,b,c,events};
 }
 const step=m=>{m.box2DWorld.Step(1/60,8,3);m.sendEvent()};
 try {
  for(const name of ['BoxShape2D','CircleShape2D','PolygonShape2D','EdgeShape2D']){
   const m=manager(),a=shape(m,2,name),b=shape(m,0,'BoxShape2D');step(m);
   const fixture=a.s._box2DShape,initialMass=a.b.GetMass();
   for(let i=0;i<6;i++){
    if(name==='BoxShape2D')a.s.width=40+i%2;
    if(name==='CircleShape2D')a.s.radius=20;
    if(name==='PolygonShape2D'){a.s.datas[2]=40+i%2;a.s.datas=a.s.datas;}
    if(name==='EdgeShape2D')a.s.datas=[0,20,40+i%2,20];
    step(m);
   }
   assert.equal(a.s._box2DShape,fixture,name+' retains fixture');
   assert.equal(a.events.filter(v=>v==='triggerenter').length,1,name+' one enter');
   assert.equal(a.events.filter(v=>v==='triggerexit').length,0,name+' no false exit');
   const far=shape(m,0,'BoxShape2D',2);step(m);
   if(name==='BoxShape2D')a.s.width=160;
   if(name==='CircleShape2D')a.s.radius=140;
   if(name==='PolygonShape2D')a.s.datas=[0,0,160,0,160,40,0,40];
   if(name==='EdgeShape2D')a.s.datas=[0,20,160,20];
   step(m);step(m);
   assert.equal(far.events.filter(v=>v==='triggerenter').length,1,name+' expanded broadphase finds new contact');
   if(name!=='EdgeShape2D')assert.ok(a.b.GetMass()>initialMass,name+' updates mass');
   if(name==='BoxShape2D')a.s.width=40;
   if(name==='CircleShape2D')a.s.radius=20;
   if(name==='PolygonShape2D')a.s.datas=[0,0,40,0,40,40,0,40];
   if(name==='EdgeShape2D')a.s.datas=[0,20,40,20];
   step(m);step(m);
   assert.equal(far.events.filter(v=>v==='triggerexit').length,1,name+' shrink ends real contact');
   assert.equal(a.events.filter(v=>v==='triggerenter').length,2,name+' one original contact plus one new contact');
   assert.equal(a.events.filter(v=>v==='triggerexit').length,1,name+' only the far contact ended');
  }
  const {ColliderBase:LegacyBase}=isolatedPhysics('physics/Collider2D/ColliderBase',{
   '../../components/Component':{Component:class{}},'../Physics2D':{Physics2D:physics},
   '../../maths/Point':load('maths/Point'),'../../maths/Vector2':{Vector2},
   '../factory/IPhysics2DFactory':load('physics/factory/IPhysics2DFactory')
  });
  const {StaticCollider:LegacyStatic}=isolatedPhysics('physics/StaticCollider',{
   './Collider2D/ColliderBase':{ColliderBase:LegacyBase},'./Physics2D':{Physics2D:physics},
   '../maths/Point':load('maths/Point'),'../utils/Utils':{Utils:{}},'./RigidBody':{RigidBody}
  });
  const lm=manager(),w=lm.box2DWorld;let current;
  const colliders=[];const owner={pivotX:0,pivotY:0,scene:{getComponentElementManager:()=>lm},getComponents:()=>colliders};
  const rigid={owner,_shapes:null,getBox2DBody:()=>current,group:-2,category:4,mask:7};
  const createBody=()=>{const d=new box.b2BodyDef();d.type=2;current=f.createBody(w,d);rigid._box2DBody=current;};
  createBody();
  for(const name of ['BoxCollider','CircleCollider','PolygonCollider','EdgeCollider','ChainCollider']){
   const C=isolatedPhysics('physics/Collider2D/'+name,{'../StaticCollider':{StaticCollider:LegacyStatic},'../Physics2D':{Physics2D:physics},'../factory/IPhysics2DFactory':load('physics/factory/IPhysics2DFactory')})[name];
   const co=new C();co.owner=owner;co._getPhysicsManager=()=>co._physics2DManager=lm;
   if('datas' in co)co.datas=[0,0,40,0,40,40,0,40];
   co.createShape(rigid);colliders.push(co);
  }
  const fixtures=()=>{let count=0,fi=current.GetFixtureList();while(box.getPointer(fi)){count++;fi=fi.GetNext();}return count;};
  assert.equal(fixtures(),5);const mass=current.GetMass();
  for(let cycle=0;cycle<10;cycle++){
   // Disabling a Collider alone must leave its shared body and other fixtures alive.
   const co=colliders[cycle%5];co._removeShapeAndDestroyData();assert.equal(fixtures(),4);assert.equal(current.destroyed,false);
   co.createShape(rigid);assert.equal(fixtures(),5);assert.ok(Math.abs(current.GetMass()-mass)<.001);
   // RigidBody disable must invalidate every legacy wrapper before its native body dies.
   RigidBody.prototype._destroyAllShape.call(rigid);assert.equal(fixtures(),0);
   for(const c of colliders){assert.equal(c._box2DShape,null);assert.equal(c._box2DBody,null);}
   f.removeBody(w,current);current=null;rigid._box2DBody=null;
   for(const c of colliders){c.createShape(rigid);assert.equal(c._box2DShape,null,'disabled bodies cannot create fixtures');}
   createBody();for(const c of colliders)c.createShape(rigid);
   assert.equal(fixtures(),5);assert.ok(Math.abs(current.GetMass()-mass)<.001);
   for(const c of colliders){const fi=c._box2DShape;assert.equal(fi.GetBody(),current);assert.equal(fi.collider,c);const filter=fi.GetFilterData();assert.deepEqual([filter.groupIndex,filter.categoryBits,filter.maskBits],[-2,4,7]);}
  }
  RigidBody.prototype._destroyAllShape.call(rigid);f.removeBody(w,current);
  const transient=manager(4),fast=shape(transient,2,'BoxShape2D'),sensor=shape(transient,0,'BoxShape2D',1.25);
  fast.b.SetLinearVelocity(new box.b2Vec2(300,0));
  f.worldMap=new Map([[0,transient]]);f.worldCount=0;f.update(1/60);
  assert.deepEqual(fast.events.filter(v=>v!=='triggerstay'),['triggerenter','triggerexit'],'a contact that ends inside one frame keeps safe enter/exit snapshots');
  const speeds=[];
  for(const n of [1,4]){
   const m=manager(n,9.8),w=m.box2DWorld;let stays=0;let native;
   function fixture(type,x,y,hx,hy,density){const d=new box.b2BodyDef();d.type=type;d.position.Set(x,y);d.fixedRotation=true;d.allowSleep=false;const b=f.createBody(w,d),sh=new box.b2PolygonShape();sh.SetAsBox(hx,hy,new box.b2Vec2(),0);const fd=new box.b2FixtureDef();fd.shape=sh;fd.density=density;fd.friction=0;const fi=b.CreateFixture(fd);fi.collider={owner:{event(type,args){if(type==='triggerstay'&&b===native){stays++;const hit=args[2].getHitInfo();assert.ok(hit.points.length>0);b.ApplyForceToCenter(new box.b2Vec2(1,0),true);}}}};return b;}
   native=fixture(2,0,.8,.2,.2,6.25);fixture(0,0,1.1,10,.1,0);
   f.worldMap=new Map([[0,m]]);f.worldCount=0;f.update(1/60);native.SetLinearVelocity(new box.b2Vec2());
   for(let i=0;i<60;i++)f.update(1/60);
   speeds.push(native.GetLinearVelocity().x);assert.equal(stays,61,'one Stay per outer frame');assert.ok(Math.abs(speeds.at(-1)-1)<.001,'callback force remains for next outer frame');
   assert.equal(w.GetAutoClearForces(),true);
  }
  assert.ok(Math.abs(speeds[0]-speeds[1])<.0001);
 } finally {
  env.isPlaying=false;
  for(const m of managers){const w=m.box2DWorld;let b=w.GetBodyList();while(box.getPointer(b)){const next=b.GetNext();w.DestroyBody(b);b=next;}box.destroy(w);}
 }
});
