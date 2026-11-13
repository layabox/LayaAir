const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const libs = process.env.SPINE_TEST_LIBS || path.resolve(__dirname, '../build/libs');

function createEditor() {
    const ctx = { console, performance, document: {} };
    ctx.window = ctx;
    vm.createContext(ctx);
    for (const name of ['laya.core', 'laya.webgl_2D', 'laya.spine', 'spine-core-4.2']) {
        const filename = path.join(libs, name + '.js');
        vm.runInContext(fs.readFileSync(filename, 'utf8'), ctx, { filename });
    }

    // Use the bundled lifecycle and WebGL shader data without creating a GPU context.
    const L = ctx.Laya;
    const driver = new L.ComponentDriver();
    const errors = [];
    driver.onError = error => errors.push(error);
    L.ILaya.stage = { _componentDriver: driver, _graphicUpdateList: new Set() };
    L.LayaEnv.isPlaying = false;
    L.LayaGL.render2DRenderPassFactory = new L.WebGLRender2DProcess();
    L.LayaGL.renderDeviceFactory = new L.WebGLRenderDeviceFactory();
    L.LayaGL.transform2DMemoryFactory = new L.WebTransform2DMemoryFactory();
    L.SpineConst.factory = new L.JSSpineFactory();
    L.SpineConst.ENABLE_WEB_BATCH = true;
    L.BaseRenderNode2D.BASERENDER2DCOLOR = 100;
    L.ShaderDefines2D.UNIFORM_NMATRIX_0 = 101;
    L.ShaderDefines2D.UNIFORM_NMATRIX_1 = 102;
    L.SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE = 103;
    L.SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE = 104;
    let index = 0;
    for (const [owner, names] of [
        [L.BaseRenderNode2D, ['SHADERDEFINE_BASERENDER2D', 'SHADERDEFINE_LIGHT2D_ENABLE']],
        [L.SpineShaderInit, ['SPINE_UV', 'SPINE_COLOR', 'SPINE_FAST', 'SPINE_COLOR2', 'SPINE_NORMAL_2D', 'SPINE_SIMPLE', 'SPINE_GPU_INSTANCE', 'SPINE_RB']],
    ]) {
        for (const name of names)
            owner[name] = new L.ShaderDefine(0, 1 << index++);
    }
    return { L, spine: ctx.spine, driver, errors };
}

function createSpineNode(L, spine, fast = true) {
    const owner = new L.Sprite();
    const node = owner.addComponent(L.Spine2DRenderNode);
    node.runInEditor = true;
    node.useFastRender = fast;

    const data = new spine.SkeletonData();
    data.bones.push(new spine.BoneData(0, 'root', null));
    data.animations.push(new spine.Animation('idle', [], 1));
    const templet = new L.SpineTemplet();
    templet.optimize = {
        data, maxBoneNumber: 1,
        skinAttachArray: [{ index: 0, type: L.ESpineRenderType.boneGPU, vertexBones: 1 }],
        animators: [{ name: 'idle', skinDataArray: [{}] }],
        getSkinIndexByName: () => -1,
    };
    node.init(templet);
    return { owner, node, templet, renderer: node._spineRender };
}

for (const fast of [true, false]) {
    test(`destroying an inactive Spine 2D node releases its ${fast ? 'fast' : 'normal'} renderer`, () => {
        const { L, spine, driver, errors } = createEditor();
        const { owner, node, templet, renderer } = createSpineNode(L, spine, fast);
        renderer.play('idle');

        const shaderData = owner._shaderData;
        const define = fast ? L.SpineShaderInit.SPINE_FAST : L.SpineShaderInit.SPINE_NORMAL_2D;
        assert.equal(owner.activeInHierarchy, false);
        assert.equal(shaderData.hasDefine(define), true);
        assert.equal(templet.referenceCount, 1);

        owner.destroy();
        assert.equal(shaderData.destroyed, true);
        driver.callDestroy();

        assert.deepEqual(errors, []);
        assert.equal(renderer._destroyed, true);
        assert.equal(node._spineRender, null);
        assert.equal(node.templet, null);
        assert.equal(templet.referenceCount, 0);
    });
}

test('removing a baked Spine component releases its texture while its Sprite survives', () => {
    const { L, spine, driver, errors } = createEditor();
    const { owner, node, renderer } = createSpineNode(L, spine);
    const first = Object.assign(new L.Resource(), { width: 32 });
    const second = Object.assign(new L.Resource(), { width: 32 });
    const bake = texture2d => renderer.initBake({ texture2d, bonesNums: 1, aniOffsetMap: { idle: 0 } });
    bake(first);
    renderer.play('idle');
    assert.equal(first.referenceCount, 2);

    bake(second);
    assert.equal(first.referenceCount, 0);
    assert.equal(second.referenceCount, 2);

    node.destroy();
    driver.callDestroy();
    assert.deepEqual(errors, []);
    assert.equal(owner.destroyed, false);
    assert.equal(owner._shaderData.getTexture(L.SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE), null);
    assert.equal(second.referenceCount, 0);

    owner.destroy();
    assert.equal(second.referenceCount, 0);
});
