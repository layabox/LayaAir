// Run after npm run build. Uses the built engine and the real Recast backend without a renderer.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const root = process.env.NAV_ENGINE_ROOT || path.resolve(__dirname, '..');
const context = {console, performance, setTimeout, clearTimeout, document:{}, WebAssembly, Float32Array, Uint32Array, Uint8Array, ArrayBuffer};
context.window=context;
for (const name of ['core','d3',process.env.NAV_WASM ? 'navMeshCommon_wasm' : 'navMeshCommon','navMesh3d','navMesh2d'])
 vm.runInNewContext(fs.readFileSync(path.join(root,`build/libs/laya.${name}.js`),'utf8'), context, {filename:name});
const L=context.Laya, V=L.Vector3;
let checks=0;
function check(name, fn) {fn();checks++;console.log('PASS',name);}
function resource({gap=false,ramp=false,width=16,depth=8,reverseWinding=false,closedBoxes=false}={}) {
 const vertices=[],indices=[];
 for(let z=0;z<depth;z++) for(let x=0;x<width;x++) {
  if(gap && x>=7 && x<9)continue;
  const h=x=>ramp?Math.max(0,Math.min(4,x-6)):0, b=vertices.length/3;
  vertices.push(x,h(x),z,x,h(x),z+1,x+1,h(x+1),z,x+1,h(x+1),z+1);
  indices.push(b,b+1,b+2,b+2,b+1,b+3);
 }
 if(closedBoxes) {
  vertices.length=0;indices.length=0;
  const box=(cx,cy,cz,sx,sy,sz,angle=0)=>{
   const base=vertices.length/3,co=Math.cos(angle),si=Math.sin(angle);
   for(const [x,y,z] of [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]){
    const px=x*sx/2,py=y*sy/2;vertices.push(cx+co*px-si*py,cy+si*px+co*py,cz+z*sz/2);
   }
   for(const i of [0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5])indices.push(base+i);
  };
  box(3,-.1,4,6,.2,8);box(8,.9,4,Math.sqrt(20),.2,8,Math.atan(.5));box(13,1.9,4,6,.2,8);
 }
 if(reverseWinding) for(let i=0;i<indices.length;i+=3) [indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const vb=new Float32Array(vertices),ib=new Uint32Array(indices),fb=new Uint8Array(indices.length/3).fill(1), count=Math.ceil(width/8);
 const header=44+count*52, data=Buffer.alloc(header+count*(vb.byteLength+ib.byteLength+fb.byteLength));
 let off=0;const u16=v=>{data.writeUInt16LE(v,off);off+=2},u32=v=>{data.writeUInt32LE(v,off);off+=4},f=v=>{data.writeFloatLE(v,off);off+=4};
 u16(12);data.write('LAYANAV:0101',off);off+=12;f(0);for(const v of [0,-.25,0,width,ramp?4.1:.05,depth])f(v);u16(count);
 let cursor=44+52;
 for(let tile=0;tile<count;tile++) {for(const v of [tile*8,-.25,0,(tile+1)*8,ramp?4.1:.05,depth])f(v);u16(tile);u16(0);
  cursor=off+24;
  for(const array of [vb,ib,fb]) {u32(cursor);u32(array.byteLength);Buffer.from(array.buffer).copy(data,cursor);cursor+=array.byteLength;}
  off=cursor;
 }
 assert.equal(off,data.byteLength);return {data:data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};
}
function manager() {
 const m=new L.BaseNavigationManager('qa');const c=m.getNavConfig('humanoid');Object.assign(c,{cellSize:.25,cellHeight:.1,agentHeight:1,agentRadius:.2,agentMaxClimb:.3,tileSize:32});return m;
}
function surface(dim, options={}) {
 const m=options.manager||manager(),s=dim===2?new L.NavMesh2DSurface():new L.NavMeshSurface();
 s.owner={name:'QA',transform:{worldMatrix:new L.Matrix4x4()}};s._getManager=()=>m;s.areaFlag='walk';s.datas=resource(options);s._onEnable();s._update(0);return s;
}
function nearest(s,p=new V(3,0,4)) {const out=new V();return {ref:s.findNearestPoly(p,null,out),out};}
function agent(s,mask=2,pos=new V(3,0,4)) {
 const a=s._navMesh.is3D?new L.NavAgent():new L.Nav2DAgent();a.owner={name:'QAAgent'};a.agentType='humanoid';a._getManager=()=>s._manager;
 a._getpos=out=>{pos.cloneTo(out);if(a instanceof L.Nav2DAgent)out.y=0;};a._updatePosition=p=>{p.cloneTo(pos);if(a instanceof L.Nav2DAgent)pos.y=0;};a._getradius=()=>.2;a._getheight=()=>1;a.areaMask=mask;a._onEnable();return a;
}
function pathTo(s,start=new V(3,0,4),end=new V(13,0,4)) {const p=[];const ok=s.findFllowPath(p,start,end,0);return {ok,p,complete:p.length && V.distance(p.at(-1).pos,end)<.5};}
(async()=>{
 if (process.env.NAV_WASM) L.WasmAdapter.instantiateWasm = (_, imports) => WebAssembly.instantiate(fs.readFileSync(path.join(root,'build/libs/recast-navigation-wasm.wasm')), imports);
 const native=await context.Recast();L.NavigationUtils._initialize(native);
 for(const dim of [2,3]) {
  const s=surface(dim);
  check(`${dim}D masks use public serialized area bits`,()=>{const yes=agent(s,2);assert.ok(yes._crowAgent);yes._onDisable();const no=agent(s,1);assert.ok(no._crowAgent == null);no._onDisable();});
  check(`${dim}D live mask stops binding and restores it`,()=>{const a=agent(s);assert.ok(a._crowAgent);a.areaMask=0;assert.equal(a._crowAgent,null);a.areaMask=2;assert.ok(a._crowAgent);a._setTarget(new V(13,0,4));a.areaMask=6;for(let i=0;i<20;i++)s._update(.1);const out=new V();a._getpos(out);assert.ok(out.x>3.5,'changing the mask must retain an assigned target');a._onDisable();});
  check(`${dim}D stopped agent still has a bounded useful path query`,()=>{const r=pathTo(s);assert.ok(r.ok && r.complete);assert.ok(r.p.length<300);});
  check(`${dim}D disabling/re-enabling surface restores tiles and agents`,()=>{const a=agent(s);s._onDisable();assert.equal(a._crowAgent,null);s._onEnable();s._update(0);a.onUpdate();assert.ok(nearest(s).ref);assert.ok(a._crowAgent);a._onDisable();});
  check(`${dim}D crowd overflow does not create id -1 and can retry`,()=>{const agents=Array.from({length:130},()=>agent(s));assert.equal(s._navMesh._allAgents.size,128);assert.ok(!s._navMesh._allAgents.has(-1));assert.ok(agents[129]._crowAgent == null);agents[0]._onDisable();agents[129].onUpdate();assert.ok(agents[129]._crowAgent);agents.forEach(a=>a._onDisable());});
  check(`${dim}D filter capacity can fail safely and reuse a released slot`,()=>{
   for(let i=3;i<7;i++){let f=new L.NavAreaFlag();f.name='a'+i;f.index=i;f.cost=i+1;s._manager.regArea(f);}
   const agents=Array.from({length:17},(_,i)=>agent(s,2|(i<<2)));
   assert.ok(agents.slice(0,14).every(a=>a._crowAgent));assert.ok(agents[16]._crowAgent == null);
   agents[0]._onDisable();agents[16].onUpdate();assert.ok(agents[16]._crowAgent);agents.forEach(a=>a._onDisable());
  });
  check(`${dim}D cost uses the native area index`,()=>{let f=s._navMesh._crowd.getFilter(0);s._manager.setFilterCost(f);assert.equal(f.getAreaCost(3),4);assert.equal(f.getAreaCost(4),5);});
  check(`${dim}D unwalkable path reports false and clears old results`,()=>{s.areaFlag='unwalk';s._update(0);const p=[{}];assert.equal(s.findFllowPath(p,new V(3,0,4),new V(13,0,4),0),false);assert.equal(p.length,0);s.areaFlag='walk';s._update(0);assert.ok(pathTo(s).complete);});
  check(`${dim}D surface agent type changes registration and native config`,()=>{const config=s._manager.getNavConfig('humanoid').clone();config.agentName='other';config.agentRadius=.4;s._manager.regNavConfig(config);s.agentType='other';s._update(0);assert.equal(s._navMesh.navTileGrid.config,config);assert.equal(s._manager.getNavMeshSurface(new V(3,0,4),'humanoid'),null);assert.equal(s._manager.getNavMeshSurface(new V(3,0,4),'other'),s);});
  check(`${dim}D surface clones preserve serialized properties`,()=>{s.asyn=true;s.maxSimplificationError=.4;const clone=dim===2?new L.NavMesh2DSurface():new L.NavMeshSurface();s._cloneTo(clone);assert.equal(clone.datas,s.datas);assert.equal(clone.asyn,true);assert.equal(clone.maxSimplificationError,.4);clone._onDestroy();});
  check(`${dim}D native surface resources are released`,()=>{const mesh=s._navMesh,ori=s._oriTiles,cache=s._cachedata._cacheData[0];s._onDisable();s._onDestroy();assert.equal(mesh._navMesh,null);assert.equal(mesh._navQuery,null);assert.equal(mesh._crowd,null);assert.equal(ori._oriTiles,null);assert.ok(cache.isDeleted());});
 }
 check('2D embedded custom obstacle cache is released with its surface',()=>{
  const s=surface(2),obstacle=new L.NavMesh2DObstacles();obstacle.meshType=L.NavObstacles2DType.CUSTOMER;obstacle.datas=resource({width:4});s.obstacles=[obstacle];s._update(0);
  const cache=obstacle._modifierData._bindData;assert.ok(cache);s._onDisable();s._onDestroy();assert.ok(cache.isDeleted());assert.equal(obstacle._modifierData._bindData,null);
 });
 check('3D projected foot position can bind again without expanding horizontal bounds',()=>{const s=surface(3),p=nearest(s).out;const a=agent(s,2,p);assert.ok(a._crowAgent);a._onDisable();a._onEnable();assert.ok(a._crowAgent);assert.equal(s._manager.getNavMeshSurface(new V(-10,p.y,4),'humanoid'),null);a._onDisable();s._onDisable();s._onDestroy();});
 check('3D reverse-wound legacy geometry retains flat paths and movement',()=>{
  const flat=surface(3,{reverseWinding:true});const a=agent(flat);assert.ok(a.isOnNavMesh);a._setTarget(new V(13,0,4));for(let i=0;i<40;i++){flat._update(.1);a.onUpdate();}const pos=new V();a._getpos(pos);assert.ok(pos.x>8,'reverse-wound flat ground must support movement');a._onDisable();flat._onDisable();flat._onDestroy();
 });
 check('3D radius uses XZ scale and 2D radius preserves its optimization range',()=>{const a=new L.NavAgent();a.owner={transform:{getWorldLossyScale:()=>new V(1,1,2)}};a.radius=.4;assert.equal(a._getradius(),.8);const b=new L.Nav2DAgent();b.owner={globalTrans:{scaleX:1,scaleY:1}};const params={};b._crowAgent={getparams:()=>params};b.radius=12;assert.equal(params.pathOptimizationRange,b._getpathOptimizationRange());});
 check('native tile cache and auxiliary objects free through their typed destructors',()=>{for(const data of [L.NavigationUtils._createdtNavTileData(),L.NavigationUtils._createdtNavTileCache(),new native.dtOffMeshConnection(),new native.dtConvexVolume()]){L.NavigationUtils._free(data);assert.ok(data.isDeleted());}});
 check('agent clones preserve base offset, acceleration and mask',()=>{for(const Agent of [L.NavAgent,L.Nav2DAgent]){const a=new Agent(),b=new Agent();a._baseOffset=.75;a.areaMask=2;a.maxAcceleration=10;a.autoBraking=true;a.stopDistance=2;a._cloneTo(b);assert.equal(b.autoBraking,true);assert.equal(b.stopDistance,2);assert.equal(b._baseOffset,.75);assert.equal(b.areaMask,2);assert.equal(b.maxAcceleration,10);}});

 check('2D link direction, endpoint updates and removal rebuild distant tiles',()=>{
  const s=surface(2,{gap:true}),link=new L.NavMesh2DLink();link.areaFlag='walk';link.width=.6;link.start=new L.Vector2(6,4);link.end=new L.Vector2(10,4);link.bidirectional=false;
  s.navMeshLink=[link];s._update(0);assert.ok(pathTo(s).complete);assert.ok(!pathTo(s,new V(13,0,4),new V(3,0,4)).complete);
  link.bidirectional=true;s._update(0);assert.ok(pathTo(s,new V(13,0,4),new V(3,0,4)).complete);
  assert.ok(link._data._cacheDatas[0]._titleIndex.size>0);
  link.end=new L.Vector2(6,6);s._update(0);assert.ok(!pathTo(s).complete);
  link.end=new L.Vector2(10,4);s._update(0);assert.ok(pathTo(s).complete);
  s.navMeshLink=[];s._update(0);assert.ok(!pathTo(s).complete);s._onDisable();s._onDestroy();
 });
 check('3D link registrations stay unique, disable removes them and clone retains agent type',()=>{
  const m=manager(),left=surface(3,{manager:m}),right=surface(3,{manager:m});
  // Separate registered bounds while keeping real meshes behind both surfaces.
  left._boundMax.x=7;right._boundMin.x=9;
  const link=new L.NavMeshLink();link.owner={name:'Link',scene:{getComponentElementManager:()=>m},transform:{worldMatrix:new L.Matrix4x4(),on(){},off(){}}};link.areaFlag='walk';link.start=new V(6,0,4);link.end=new V(10,0,4);link._onEnable();left._update(0);right._update(0);
  for(let i=0;i<20;i++){link.width=.6+i*.01;left._update(0);right._update(0);assert.equal(m.getNavMeshLink(left,right).length,1);}
  const clone=new L.NavMeshLink();link.agentType='custom';link._cloneTo(clone);assert.equal(clone.agentType,'custom');link.agentType='humanoid';
  left._agentType='changed';link._onDisable();left._agentType='humanoid';left._update(0);right._update(0);assert.equal(m.getNavMeshLink(left,right).length,0);assert.equal(link._modifierData._cacheDatas.length,0);
  link._onDestroy();clone._onDestroy();for(const surface of [left,right]){surface._onDisable();surface._onDestroy();}
 });
 check('link vector reassignment after in-place edits refreshes its native cache',()=>{
  const s=surface(3),link=new L.NavMeshLink();link.areaFlag='walk';link.start=new V(3,0,4);link.end=new V(5,0,4);link._modifierData._initSurface([s]);s._update(0);
  for(const value of [.6,0,.6]) {link.start.y=value;link.start=link.start;s._update(0);assert.equal(link._modifierData.globalStart.y,value);}
  link._modifierData.destroy();link._onDestroy();s._onDisable();s._onDestroy();
 });
 check('3D cross-surface animation advances without attempting a new native binding each frame',()=>{
  const a=new L.NavAgent(),position=new V();let binds=0;a._addAgent=()=>binds++;a._updatePosition=p=>p.cloneTo(position);a._navAgentLinkAnim._active=true;a._navAgentLinkAnim._startPos=new V();a._navAgentLinkAnim._endPos=new V(5,0,0);a._navAgentLinkAnim._start(1,new V());L.Laya.timer={delta:100};
  for(let i=0;i<10;i++)a.onUpdate();assert.equal(binds,0);assert.ok(position.x>.5);assert.ok(a._navAgentLinkAnim._runTime>.9);
 });
 check('3D volume toggle, movement and destruction release the active volume id',()=>{
  const s=surface(3),volume=new L.NavMeshModifierVolume();const mat=new L.Matrix4x4();L.Matrix4x4.createAffineTransformation(new V(8,0,4),L.Quaternion.DEFAULT,new V(1,1,1),mat);
  volume.owner={transform:{worldMatrix:mat,on(){},off(){}},getComponents:()=>[s],parent:null};volume.size=new V(2,2,8);volume._onEnable();s._update(0);
  const atCenter=()=>{const ref=nearest(s,new V(8,0,4));return ref.ref && Math.abs(ref.out.x-8)<.2;};assert.ok(!atCenter());
  volume._onDisable();s._update(0);assert.ok(atCenter());volume._onEnable();s._update(0);assert.ok(!atCenter());
  volume.center=new V(40,0,0);s._update(0);assert.ok(atCenter());volume.center=new V();s._update(0);assert.ok(!atCenter());volume._onDisable();s._update(0);assert.ok(atCenter());s._onDisable();s._onDestroy();
 });
 check('3D custom obstacle and modifier lifecycle removes effects and preserves clone settings',()=>{
  for(const Component of [L.NavMeshObstacles,L.NavMeshModifileSurface]) {
   const s=surface(3),component=new Component();component.owner={name:'modifier',scene:{getComponentElementManager:()=>s._manager},transform:{worldMatrix:new L.Matrix4x4(),on(){},off(){}}};
   component.datas=resource({width:4,depth:8});if(Component===L.NavMeshObstacles)component.meshType=L.NavObstaclesMeshType.CUSTOMER;
   component._onEnable();s._update(0);assert.equal(s._cacheDataMap.size,1);component._onDisable();s._update(0);assert.equal(s._cacheDataMap.size,0);
   component._onEnable();s._update(0);assert.equal(s._cacheDataMap.size,1);component.datas=null;s._update(0);assert.ok([...s._featureCache.values()].every(set=>!set.has(component._modifierData._bindData)));
   component.agentType='custom';component.areaFlag='jump';const clone=new Component();clone.owner=component.owner;component._cloneTo(clone);assert.equal(clone.agentType,'custom');assert.equal(clone.areaFlag,'jump');component._onDisable();component._onDestroy();clone._onDestroy();s._onDisable();s._onDestroy();
  }
 });

 for(const dim of [2,3]) {
  check(`${dim}D pending agents all detach before surface destruction`,()=>{
   const s=surface(dim);s.cleanAllTile();const agents=Array.from({length:3},()=>agent(s));
   assert.equal([...s._navMesh._delayCreates.values()][0].length,3);
   s._onDisable();s._onDestroy();
   assert.ok(agents.every(a=>a._currentNaveSurface==null),'every pending agent must release the disabled surface');
   agents.forEach(a=>a._onDisable());
  });
  check(`${dim}D surface re-enable resumes the assigned target`,()=>{
   const s=surface(dim),a=agent(s);a._setTarget(new V(13,0,4));
   for(let i=0;i<10;i++){s._update(.1);a.onUpdate();}
   const before=new V();a._getpos(before);
   s._onDisable();s._onEnable();s._update(0);a.onUpdate();
   for(let i=0;i<30;i++){s._update(.1);a.onUpdate();}
   const after=new V();a._getpos(after);assert.ok(after.x>before.x+1,JSON.stringify({before,after}));
   a._onDisable();s._onDisable();s._onDestroy();
  });
  check(`${dim}D successful binding restores a saved target only once`,()=>{
   const s=surface(dim),a=agent(s),mesh=s._navMesh,request=mesh._requestMoveTarget;let calls=0;
   mesh._requestMoveTarget=function(...args){calls++;return request.apply(this,args);};
   for(let i=0;i<5;i++)a.onUpdate();assert.equal(calls,0,'an agent without a destination must stay idle');
   a._setTarget(new V(13,0,4));assert.equal(calls,1);
   s._onDisable();s._onEnable();s._update(0);
   for(let i=0;i<10;i++)a.onUpdate();assert.equal(calls,2,'a restored target must not be requested every frame');
   a._onDisable();s._onDisable();s._onDestroy();
  });
  check(`${dim}D failed binding is safe when surface is destroyed first`,()=>{
   const s=surface(dim),a=agent(s,0);assert.equal(a.isOnNavMesh,false);
   s._onDisable();s._onDestroy();assert.doesNotThrow(()=>a._onDisable());
   assert.equal(a._currentNaveSurface,null);
  });
  check(`${dim}D target set before asynchronous tile creation starts after binding`,()=>{
   const s=surface(dim);s.cleanAllTile();const a=agent(s);a._setTarget(new V(13,0,4));
   assert.equal(a.isOnNavMesh,false);s.rebuildTile(new V(3,0,4));s.rebuildTile(new V(13,0,4));s._update(0);
   for(let i=0;i<40;i++){s._update(.1);a.onUpdate();}
   const p=new V();a._getpos(p);assert.ok(p.x>8,JSON.stringify(p));
   a._onDisable();s._onDisable();s._onDestroy();
  });
 }

 for (const dim of [2, 3]) {
  const advance = (s, a, seconds, dt=.05) => { for(let i=0;i<Math.ceil(seconds/dt);i++){s._update(dt);a.onUpdate();} };
  const xOf = a => {const p=new V();a._getpos(p);return p.x;};
  const dispose = (s,a) => {a._onDisable();s._onDisable();s._onDestroy();};
  check(`${dim}D explicitly disabling braking retains raw Detour steering without arrival path queries`,()=>{
   const traces=[];
   for(const baseline of [false,true]){const s=surface(dim),a=agent(s);assert.equal(a.autoBraking,true);a.autoBraking=false;a.speed=2.5;a.maxAcceleration=.5;
    assert.equal(a.autoBraking,false);assert.equal(a.stopDistance,0);assert.equal(a.maxAcceleration,.5);
    let queries=0;const q=s._navMesh.navQuery,find=q.findPath;q.findPath=function(...args){queries++;return find.apply(this,args);};
    if(baseline)a._updateBraking=()=>{};a._setTarget(new V(13,0,4));const trace=[];
    for(let i=0;i<800;i++){s._update(.05);a.onUpdate();if(i%100===99)trace.push(xOf(a));}
    assert.equal(queries,0);traces.push(trace);dispose(s,a);
   }assert.deepEqual(traces[0],traces[1]);
  });
  for(const dt of [1/60,1/30,.1]) check(`${dim}D auto braking settles at the goal with low acceleration at dt ${dt}`,()=>{
   const s=surface(dim),a=agent(s);a.autoBraking=true;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));advance(s,a,45,dt);
   assert.ok(Math.abs(xOf(a)-13)<.01,`actual x=${xOf(a)}`);assert.ok(a.isStop());const parked=xOf(a);advance(s,a,3,dt);assert.equal(xOf(a),parked);
   assert.equal(a.speed,2.5);assert.equal(a.maxAcceleration,.5);assert.equal(a._crowAgent.getparams().maxAcceleration,.5);dispose(s,a);
  });
  for(const autoBraking of [false,true])check(`${dim}D stop distance stops in range with braking ${autoBraking} and resumes for a new target`,()=>{
   const s=surface(dim),a=agent(s);a.autoBraking=autoBraking;a.stopDistance=2;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));advance(s,a,40);
   assert.ok(xOf(a)>10.99&&xOf(a)<11.2,`x=${xOf(a)}`);assert.ok(a.isStop());const parked=xOf(a);
   for(let i=0;i<60;i++){a._setTarget(new V(13,0,4));s._update(.05);a.onUpdate();}assert.equal(xOf(a),parked,'repeated unchanged goals must not restart arrival');
   a._setTarget(new V(3,0,4));advance(s,a,40);assert.ok(xOf(a)>4.8&&xOf(a)<5.01,`reverse x=${xOf(a)}`);
   a.stopDistance=0;a.autoBraking=true;advance(s,a,40);assert.ok(Math.abs(xOf(a)-3)<.01,'reducing stop distance resumes movement');dispose(s,a);
  });
  check(`${dim}D disabling auto braking restores configured speed while moving`,()=>{
   const s=surface(dim),a=agent(s);a.autoBraking=true;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));advance(s,a,2);
   assert.ok(a._crowAgent.getparams().maxSpeed<2.5);a.autoBraking=false;assert.equal(a._crowAgent.getparams().maxSpeed,2.5);advance(s,a,.5);assert.equal(a._crowAgent.getparams().maxSpeed,2.5);
   a.autoBraking=true;advance(s,a,45);assert.ok(Math.abs(xOf(a)-13)<.01);dispose(s,a);
  });
  check(`${dim}D invalid replacement target does not change the accepted braking destination`,()=>{
   const s=surface(dim),a=agent(s);a.autoBraking=true;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));advance(s,a,2);a._setTarget(new V(100,0,4));advance(s,a,40);
   assert.ok(Math.abs(xOf(a)-13)<.01,`x=${xOf(a)}`);dispose(s,a);
  });
  check(`${dim}D arrived agent remains stopped after surface and mask rebinds`,()=>{
   const s=surface(dim),a=agent(s);a.autoBraking=true;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));advance(s,a,40);const parked=xOf(a);
   s._onDisable();s._onEnable();advance(s,a,2);a.areaMask=6;advance(s,a,2);assert.ok(Math.abs(xOf(a)-parked)<.01);assert.ok(a.isStop());
   a._setTarget(new V(3,0,4));advance(s,a,40);assert.ok(Math.abs(xOf(a)-3)<.01);dispose(s,a);
  });
 }
 check('2D braking crosses an off-mesh link and resumes when a formerly partial path is connected',()=>{
  const s=surface(2,{gap:true}),a=agent(s,6);a.autoBraking=true;a.speed=2.5;a.maxAcceleration=.5;a._setTarget(new V(13,0,4));
  for(let i=0;i<500;i++){s._update(.05);a.onUpdate();}const p=new V();a._getpos(p);assert.ok(p.x<7);assert.equal(a._arrivalStopped,false);
  const link=new L.NavMesh2DLink();link.areaFlag='jump';link.width=.6;link.start=new L.Vector2(6,4);link.end=new L.Vector2(10,4);link.bidirectional=true;s.navMeshLink=[link];s._update(0);
  let traversed=false;for(let i=0;i<1600;i++){s._update(.05);a.onUpdate();a._getpos(p);if(p.x>7&&p.x<9)traversed=true;}
  assert.ok(traversed);assert.ok(Math.abs(p.x-13)<.01,`x=${p.x}`);assert.ok(a.isStop());a._onDisable();s._onDisable();s._onDestroy();
 });
 check('3D crowd agents travel uphill and downhill with either triangle winding',()=>{
  for(const reverseWinding of [false,true]) {
   const m=manager();Object.assign(m.getNavConfig('humanoid'),{agentMaxSlope:60,cellSize:.1,tileSize:80,agentMaxClimb:.8});const s=surface(3,{manager:m,ramp:true,reverseWinding});
   const a=agent(s),p=new V();
   for(const target of [new V(13,4,4),new V(3,0,4)]){
    a._setTarget(target);for(let i=0;i<180;i++){s._update(.05);a.onUpdate();}
    a._getpos(p);assert.ok(V.distance(p,target)<.3,JSON.stringify({reverseWinding,p,target}));
   }
   a._onDisable();s._onDisable();s._onDestroy();
  }
 });
 check('3D closed platform and rotated box ramp seams support uphill and downhill',()=>{
  for(const reverseWinding of [false,true]) {
   const m=manager();Object.assign(m.getNavConfig('humanoid'),{agentMaxSlope:35,cellSize:.1,cellHeight:.05,agentMaxClimb:.3,tileSize:80});
   const s=surface(3,{manager:m,closedBoxes:true,ramp:true,reverseWinding}),a=agent(s),p=new V();
   for(const target of [new V(13,2,4),new V(3,0,4)]){
    a._setTarget(target);for(let i=0;i<180;i++){s._update(.05);a.onUpdate();}
    a._getpos(p);assert.ok(V.distance(p,target)<.3,JSON.stringify({reverseWinding,p,target}));
   }
   a._onDisable();s._onDisable();s._onDestroy();
  }
 });
 console.log(`Completed ${checks} native engine checks.`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
