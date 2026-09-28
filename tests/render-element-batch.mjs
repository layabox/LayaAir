import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../CPUParticle-downshift/package.json', import.meta.url));
const {chromium} = require('playwright');
const browser = await chromium.launch({headless:true});
try {
    const page = await browser.newPage();
    for (const lib of ['core','d3','opengl_2D','opengl_3D'])
        await page.addScriptTag({path:fileURLToPath(new URL('../build/libs/laya.'+lib+'.js', import.meta.url))});
    const result = await page.evaluate(() => {
        const {RTBaseRenderNode,GLESGeometryUpdateBatch:Batch,GLESRenderElement3D,BaseRender} = Laya;
        const events = [], checks = [];
        window.conchGLESVertexBuffer = {submitGeometryBatch:() => true};
        window.conchRTBaseRenderNode = {setRenderElementsBatch(nodes,elements,counts) {
            events.push(['batch', [...elements], ...new Uint32Array(counts).slice(0,nodes.length)]); return true;
        }};
        const node = Object.create(RTBaseRenderNode.prototype);
        node.renderelements = [];
        node._nativeObj = {setRenderElements:elements => events.push(['immediate', ...elements]),
            destroy:() => events.push(['destroy-node']), setTransform() {}};
        const element = {_nativeObj:'element'};
        const finish = Batch.begin();
        node.setRenderelements([element], true);
        checks.push(element.owner === node && events.length === 0);
        node.setRenderelements([]);
        checks.push(events[0][0] === 'batch' && events[1][0] === 'immediate');
        const renderer = Object.create(BaseRender.prototype);
        renderer._baseRenderNode = node;
        renderer._renderElements = [{_renderElementOBJ:element}];
        renderer._owner = null;
        renderer._batchRender = {updateProperty() {
            checks.push(events.at(-1)[0] === 'immediate' && events.at(-1)[1] === 'element');
            events.push(['host-hook']);
        }};
        renderer._setRenderElements();
        renderer._batchRender = null;
        renderer._setRenderElements();
        checks.push(events.at(-1)[0] === 'host-hook');
        const nativeElement = Object.create(GLESRenderElement3D.prototype);
        nativeElement._nativeObj = {destroy:() => events.push(['destroy-element'])};
        nativeElement.destroy();
        checks.push(events.at(-2)[0] === 'batch' && events.at(-1)[0] === 'destroy-element');
        node.setRenderelements([element], true);
        node.renderelements.length = 0;
        node.destroy();
        checks.push(events.at(-2)[0] === 'batch' && events.at(-1)[0] === 'destroy-node');
        finish();
        checks.push(Batch.active === null);
        delete window.conchRTBaseRenderNode;
        const legacy = Batch.begin();
        node.setRenderelements([element], true);
        checks.push(events.at(-1)[0] === 'immediate' && events.at(-1)[1] === 'element');
        legacy();
        return {checks,events};
    });
    assert.deepEqual(result.checks, Array(8).fill(true), JSON.stringify(result));
    console.log('Element bindings: direct setter ordering, host hook, deferred publication, destruction and legacy fallback passed');
} finally {await browser.close();}
