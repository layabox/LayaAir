import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual methods with only their host/device dependencies replaced.
function load(relative, globals) {
    const source = fs.readFileSync(new URL('../src/layaAir/laya/' + relative, import.meta.url), 'utf8');
    const {outputText} = ts.transpileModule(source.replace(/^import .*;\r?$/gm, ''), {
        compilerOptions: {target:ts.ScriptTarget.ES2020, module:ts.ModuleKind.CommonJS}
    });
    const scope = {exports:{}, ...globals};
    vm.runInNewContext(outputText, scope);
    return scope.exports;
}

const {LayaXRenderEngine} = load('RenderDriver/LayaXDriver/RenderDevice/LayaXRenderEngine.ts', {
    Config:{enableUniformBufferObject:false,matUseUBO:false}, LayaXTextureContext:class {}
});
const engine = Object.create(LayaXRenderEngine.prototype);
engine._capabilities = new Map();
let calls=0, supported=false;
engine._nativeObj={getCapable(){calls++;return supported;},initRenderEngine(){},getTextureContext(){return {};}};
assert.equal(engine.getCapable(1),false);
assert.equal(engine.getCapable(1),false);
assert.equal(calls,1);
supported=true;
engine.initRenderEngine({_nativeObj:{}});
assert.equal(engine.getCapable(1),true);
assert.equal(engine.getCapable(1),true);
assert.equal(calls,2);
const {LayaXBaseRenderNode} = load('RenderDriver/LayaXDriver/RenderModuleData/LayaXBaseRenderNode.ts', {});
const node = Object.create(LayaXBaseRenderNode.prototype);
node._readbackFlags = null;
node._nativeObj = {renderbitFlag:7, perCameraUpdate:true};
assert.equal(node.renderbitFlag,7);
assert.equal(node.perCameraUpdate,true);
node._readbackFlags = new Uint32Array([9,0]);
assert.equal(node.renderbitFlag,9);
assert.equal(node.perCameraUpdate,false);
node.renderbitFlag=13; node.perCameraUpdate=true;
assert.equal(node._nativeObj.renderbitFlag,13);
assert.equal(node._nativeObj.perCameraUpdate,true);
console.log('LayaX capability cache, device reinitialization, shared reads and old-native fallback passed');

const {Vector4} = load('maths/Vector4.ts', {});
const {Vector3} = load('maths/Vector3.ts', {Vector4});
const {BoundBox} = load('d3/math/BoundBox.ts', {Vector3});
for (const binding of ['missing','rejected','shared']) {
    class NativeBounds {
        _minX=0; _minY=0; _minZ=0; _maxX=0; _maxY=0; _maxZ=0;
        setMin(x,y,z) { this._minX=x; this._minY=y; this._minZ=z; this.values?.set([x,y,z]); }
        setMax(x,y,z) { this._maxX=x; this._maxY=y; this._maxZ=z; this.values?.set([x,y,z],3); }
        getMin() {} getMax() {} getCenter() {} getExtent() {} _getBoundBox() {}
    }
    if (binding !== 'missing') NativeBounds.prototype.bindReadbackBuffer = function(buffer) {
        if (binding === 'rejected') return false;
        this.values=new Float32Array(buffer); return true;
    };
    const {LayaXBounds} = load('RenderDriver/LayaXDriver/RenderModuleData/LayaXBounds.ts', {
        Vector3, BoundBox, window:{conchLayaXBounds:NativeBounds}
    });
    const bounds=new LayaXBounds(new Vector3(-1,-2,-3),new Vector3(1,2,3));
    assert.equal(!!bounds._readback,binding === 'shared');
    const min=bounds.getMin(),max=bounds.getMax();
    bounds._nativeObj.setMin(-5,-6,-7); bounds._nativeObj.setMax(5,6,7);
    assert.equal(bounds.getMin(),min); assert.equal(bounds.getMax(),max);
    assert.equal(min.x,-5); assert.equal(max.z,7);
    assert.equal(bounds.getCenter().x,0); assert.equal(bounds.getExtent().y,6);
    assert.equal(bounds._getBoundBox().min,min);
}
console.log('LayaX bounds shared reads and missing/rejected binding fallback passed');
