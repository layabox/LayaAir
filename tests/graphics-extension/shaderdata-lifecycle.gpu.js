// Isolate Sprite's ShaderData cleanup; keep all other lifecycle fixes enabled in both arms.
(async () => {
    const backend = new URLSearchParams(location.search).get('backend') || 'webgl';
    const checks = [], errors = window.__bootstrapErrors || [];
    const check = (passed, name, detail) => checks.push({passed: !!passed, name, detail});
    const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.addEventListener('error', event => errors.push(event.message));
    window.addEventListener('unhandledrejection', event => errors.push(String(event.reason?.stack || event.reason)));
    try {
        await Laya.init(64, 64);
        if (backend === 'webgpu')
            Laya.LayaGL.renderEngine.getDevice().addEventListener('uncapturederror', event => errors.push(event.error.message));
        const bitmap = new Laya.Texture2D(1, 1, Laya.TextureFormat.R8G8B8A8, false, false, false);
        bitmap.setPixelsData(new Uint8Array([255, 255, 255, 255]), false, false);
        const texture = new Laya.Texture(bitmap);
        const root = new Laya.Sprite();
        Laya.stage.addChild(root);
        // Keep an offscreen pass nonempty so both backends execute its clear operation.
        const sentinel = new Laya.Sprite();
        sentinel.graphics.drawRect(63, 63, 1, 1, '#000000');
        root.addChild(sentinel);
        const rt = new Laya.RenderTexture2D(64, 64, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTHSTENCIL_24_8);
        const pixels = new Uint8Array(64 * 64 * 4);
        const meshPixelAlpha = () => pixels[((63 - 8) * 64 + 8) * 4 + 3];
        async function render() {
            await frames();
            root.drawToRenderTexture2D(64, 64, 0, 0, rt, false, false, Laya.Color.CLEAR);
            await rt.getDataAsync(0, 0, 64, 64, pixels);
        }
        function meshSprite(parent = root) {
            const sprite = new Laya.Sprite(); parent.addChild(sprite);
            const renderer = sprite.addComponent(Laya.Mesh2DRender);
            renderer.useUnitQuad = true;
            renderer.size = new Laya.Vector2(16, 16);
            renderer.texture = texture;
            renderer.normalTexture = bitmap;
            return {sprite, renderer, shaderData: sprite._shaderData};
        }
        const lazy = new Laya.Sprite();
        check(!lazy._shaderData, 'plain Sprite does not allocate ShaderData eagerly');
        lazy.destroy();
        const baseline = bitmap.referenceCount;
        const control = meshSprite();
        await render();
        check(control.shaderData === control.renderer._spriteShaderData, 'renderer borrows Sprite-owned ShaderData');
        let removedDisposals = 0;
        const controlDestroy = control.shaderData.destroy;
        control.shaderData.destroy = function () { removedDisposals++; return controlDestroy.call(this); };
        control.renderer.destroy();
        await frames();
        await render();
        check(meshPixelAlpha() === 0, 'removing a renderer invalidates cached draw elements');
        check(removedDisposals === 0 && control.sprite._shaderData === control.shaderData,
            'destroying only the render component preserves Sprite ShaderData');
        check(bitmap.referenceCount === baseline + 2,
            'ShaderData retains its own base/normal references after handle disposal',
            {baseline, afterComponentDestroy: bitmap.referenceCount});
        const secondRenderer = control.sprite.addComponent(Laya.Mesh2DRender);
        secondRenderer.useUnitQuad = true;
        secondRenderer.size = new Laya.Vector2(16, 16); secondRenderer.texture = texture;
        await render();
        check(secondRenderer._spriteShaderData === control.shaderData && meshPixelAlpha() === 255,
            'surviving Sprite reuses its ShaderData when adding another renderer');
        control.sprite.destroy(); await frames();
        check(removedDisposals === 1 && bitmap.referenceCount === baseline,
            'owner destruction releases ShaderData exactly once', {disposals: removedDisposals, baseline, references: bitmap.referenceCount});

        const omittedData = [];
        // Suppress only ShaderData.destroy during Sprite.destroy to reproduce the old omission.
        // Restore the old retained field afterward; render elements/handles still perform their normal cleanup.
        for (let i = 0; i < 10; i++) {
            const item = meshSprite();
            if (i === 0) await render();
            const destroy = item.shaderData.destroy;
            item.shaderData.destroy = function () {};
            try { item.sprite.destroy(); }
            finally { item.shaderData.destroy = destroy; item.sprite._shaderData = item.shaderData; }
            omittedData.push(item.shaderData);
        }
        await frames();
        if (window.gc) window.gc();
        const omittedReferences = bitmap.referenceCount;
        check(omittedReferences === baseline + 20,
            'omitting only Sprite ShaderData cleanup leaves two texture references per Sprite',
            {sprites: 10, baseline, references: omittedReferences, leaked: omittedReferences - baseline});
        for (const shaderData of omittedData) shaderData.destroy();
        check(bitmap.referenceCount === baseline, 'explicit cleanup of the omitted ShaderData balances all references');

        for (let i = 0; i < 10; i++) {
            const item = meshSprite();
            if (i === 0) await render();
            item.sprite.destroy();
        }
        await frames();
        check(bitmap.referenceCount === baseline, 'same ten-Sprite workload with the fix has no residual texture references',
            {sprites: 10, baseline, references: bitmap.referenceCount});

        const scene = new Laya.Scene(); root.addChild(scene);
        const sceneData = scene._shaderData;
        check(sceneData === scene._specialManager._shaderData && sceneData === scene._globalRenderData.globalShaderData,
            'Scene, manager and global render data reference the same scene data');
        sceneData.setTexture(Laya.Shader3D.propertyNameToID('u_spriteLifetimeProbe'), bitmap);
        const child = meshSprite(scene);
        check(child.shaderData !== sceneData, 'child renderer does not own or destroy scene-global ShaderData');
        let sceneDisposals = 0;
        const destroySceneData = sceneData.destroy;
        sceneData.destroy = function () { sceneDisposals++; return destroySceneData.call(this); };
        child.sprite.destroy(); await frames();
        check(sceneDisposals === 0 && bitmap.referenceCount === baseline + 1,
            'child destruction preserves scene-global data and its texture reference');
        scene.destroy(); await frames();
        check(sceneDisposals === 1 && bitmap.referenceCount === baseline,
            'Scene owner destroys shared scene data once and balances its texture reference');
        rt.destroy(); root.destroy(); texture.destroy(); bitmap.destroy();
    } catch (error) { errors.push(String(error.stack || error)); }
    window.__gpuReport = {backend, checks, errors, passed: checks.every(check => check.passed) && errors.length === 0};
})();
