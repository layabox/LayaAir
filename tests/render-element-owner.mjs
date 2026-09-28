import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const source = fileURLToPath(new URL('../src/layaAir/laya/RenderDriver/OpenGLESDriver/3DRenderPass/GLESRenderElement3D.ts', import.meta.url));
const build = buildSync({entryPoints:[source], bundle:true, write:false, platform:'node', format:'esm'});
const {GLESRenderElement3D} = await import('data:text/javascript;base64,' + Buffer.from(build.outputFiles[0].text).toString('base64'));
const element = Object.create(GLESRenderElement3D.prototype);
const calls = [], first = {_nativeObj:{tag:'first'}}, second = {_nativeObj:{tag:'second'}};
let reject = false;
element._nativeObj = {setOwner(value) {
    calls.push(value);
    if (reject) throw new Error('bridge failure');
}};
element.owner = first;
element.owner = first;
assert.deepEqual(calls, [first._nativeObj]);
reject = true;
assert.throws(() => {element.owner = second;}, /bridge failure/);
assert.equal(element.owner, first);
reject = false;
element.owner = second;
element.owner = second;
element.owner = first;
assert.equal(element.owner, first);
assert.deepEqual(calls, [first._nativeObj, second._nativeObj, second._nativeObj, first._nativeObj]);
console.log('RenderElement owner: unchanged owner, transfer, failure retry and transfer back passed');
