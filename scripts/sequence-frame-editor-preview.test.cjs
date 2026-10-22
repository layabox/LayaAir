const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const source=process.env.SEQUENCE_FRAME_SOURCE || path.resolve(__dirname,'../src/layaAir/laya/display/Scene2DSpecial/SequenceFrame2D/SequenceFrame2DRender.ts');
const env={isPlaying:false},exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports:exportsObject,require:()=>({LayaEnv:env,Event:{COMPLETE:"complete"},BaseRenderNode2D:class {}})});
const {SequenceFrame2DRender}=exportsObject;
function fixture(playing=false,autoPlay=true){
 env.isPlaying=playing;
 let clock=0;
 const r=Object.assign(Object.create(SequenceFrame2DRender.prototype),{
  _playOnAwake:autoPlay,_playing:false,_paused:false,_elapsedTime:0,_startTime:0,_lifeTime:1,_loop:false,_autoDestroyAtComplete:false,
  _instanceID:-1,_activeInstanceCount:0,_renderGeometry:{instanceCount:0},_startFrame:3,_needConfigUpload:true,_needRuntimeUpload:true,_configVersion:0,
  _getCurrentTime:()=>clock,_notifyDataChange(){},_updateLight(){},_isRuntimeStateDirty:()=>false,
  _ensureInstanceID(){this._instanceID=1;},_releaseInstanceID(){this._instanceID=-1;this._activeInstanceCount=0;this._renderGeometry.instanceCount=0;},
  _updateConfigData(){this.uploadedStartFrame=this._startFrame;},_updateRuntimeData(){this.uploadedAge=this._getPlaybackAge();this.uploads=(this.uploads||0)+1;},
  owner:{activeInHierarchy:true,event(){}}
 });
 return {r,time:v=>clock=v};
}
for(const autoPlay of [false,true])test(`editor shows start frame without playback, playOnAwake=${autoPlay}`,()=>{
 const {r,time}=fixture(false,autoPlay);r.onEnable();r.renderUpdate({});
 assert.equal(r.isPlaying,false);assert.equal(r.activeInstanceCount,1);assert.equal(r._renderGeometry.instanceCount,1);assert.equal(r.uploadedStartFrame,3);assert.equal(r.uploadedAge,0);
 time(10);r.boundsChange=true;r.renderUpdate({});assert.equal(r.uploadedAge,0);assert.equal(r.activeInstanceCount,1);
});
test('changing startFrame refreshes the editor preview without starting playback',()=>{
 const {r}=fixture();r.onEnable();r.renderUpdate({});r.startFrame=6;r.renderUpdate({});assert.equal(r.uploadedStartFrame,6);assert.equal(r.isPlaying,false);assert.equal(r.activeInstanceCount,1);
});
test('disabling removes the preview and re-enabling restores it',()=>{
 const {r}=fixture();r.onEnable();r.onDisable();assert.equal(r.activeInstanceCount,0);assert.equal(r._renderGeometry.instanceCount,0);r.onEnable();r.renderUpdate({});assert.equal(r.activeInstanceCount,1);assert.equal(r.uploadedAge,0);
});
test('runtime with playOnAwake=false remains hidden until explicit play',()=>{
 const {r}=fixture(true,false);r.onEnable();assert.equal(r.isPlaying,false);assert.equal(r.activeInstanceCount,0);r.play();assert.equal(r.isPlaying,true);assert.equal(r.activeInstanceCount,1);r.stop();assert.equal(r.isPlaying,false);assert.equal(r.activeInstanceCount,0);
});
test('runtime autoplay and non-loop completion still remove the instance',()=>{
 const {r,time}=fixture(true,true);r.onEnable();assert.equal(r.isPlaying,true);assert.equal(r.activeInstanceCount,1);time(2);r.renderUpdate({});assert.equal(r.isPlaying,false);assert.equal(r.activeInstanceCount,0);
});
