// Compare the inherited pre-fix destructor with Mesh2DRender's new destructor.
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
        bitmap.setPixelsData(new Uint8Array([0, 255, 0, 255]), false, false);
        const texture = new Laya.Texture(bitmap);
        const mesh = Laya.Mesh2D.createMesh2DByPrimitive(
            [new Float32Array([0,0,0,0,0, 16,0,0,1,0, 16,16,0,1,1, 0,16,0,0,1])],
            Laya.VertexMesh2D.getVertexDeclaration(['POSITION,UV']), new Uint16Array([0,1,2,0,2,3]),
            Laya.IndexFormat.UInt16, [{start:0,length:6}]);
        const root = new Laya.Sprite(); Laya.stage.addChild(root);
        const rt = new Laya.RenderTexture2D(64, 64, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTHSTENCIL_24_8);
        const pixels = new Uint8Array(64 * 64 * 4);
        async function render() {
            await frames();
            root.drawToRenderTexture2D(64, 64, 0, 0, rt, false, false, Laya.Color.CLEAR);
            await rt.getDataAsync(0, 0, 64, 64, pixels);
        }
        function create(inheritedOnly = false) {
            const sprite = new Laya.Sprite(); root.addChild(sprite);
            const renderer = sprite.addComponent(Laya.Mesh2DRender);
            renderer.sharedMesh = mesh; renderer.texture = texture;
            const material = Laya.Mesh2DRender.mesh2DDefaultMaterial.clone();
            material.lock = true; renderer.sharedMaterial = material;
            const elements = renderer._renderElements.slice();
            let disposals = 0;
            for (const element of elements) {
                const destroy = element.destroy;
                element.destroy = function () { disposals++; return destroy.call(this); };
            }
            // Exactly the inherited hook used before adding Mesh2DRender._onDestroy.
            if (inheritedOnly) renderer._onDestroy = Laya.BaseRenderNode2D.prototype._onDestroy;
            return {sprite, renderer, material, elements, disposals: () => disposals};
        }
        const baseline = {mesh: mesh.referenceCount, texture: texture.referenceCount, bitmap: bitmap.referenceCount};
        const old = create(true); await render(); old.sprite.destroy(); await frames();
        if (window.gc) window.gc();
        const inheritedResult = {mesh: mesh.referenceCount - baseline.mesh, texture: texture.referenceCount - baseline.texture,
            material: old.material.referenceCount, elementsDisposed: old.disposals()};
        check(inheritedResult.mesh === 1, 'inherited destructor leaves one sharedMesh reference', inheritedResult);
        check(inheritedResult.texture === 1, 'inherited destructor leaves one Texture wrapper reference', inheritedResult);
        check(inheritedResult.material === 0 && old.material.ownerElements.size === 0,
            'base class already releases assigned materials and unregisters owners');
        check(inheritedResult.elementsDisposed === 0, 'base class does not call render element destroy');
        // Balance only the intentionally omitted cleanup before running the fixed arm.
        mesh._removeReference(); texture._removeReference();
        for (const element of old.elements) element.destroy();
        old.renderer._renderElements.length = 0; old.material.destroy();
        check(mesh.referenceCount === baseline.mesh && texture.referenceCount === baseline.texture
            && bitmap.referenceCount === baseline.bitmap, 'manual release of omitted references restores baseline');

        const fixed = create(); await render(); fixed.sprite.destroy(); await frames();
        const fixedResult = {mesh: mesh.referenceCount - baseline.mesh, texture: texture.referenceCount - baseline.texture,
            material: fixed.material.referenceCount, elementsDisposed: fixed.disposals()};
        check(fixedResult.mesh === 0 && fixedResult.texture === 0, 'new destructor balances mesh and Texture references', fixedResult);
        check(fixedResult.material === 0 && fixed.material.ownerElements.size === 0,
            'super destructor still releases materials once');
        check(fixedResult.elementsDisposed === 1, 'new destructor disposes its render element exactly once');
        check(!mesh.destroyed && !texture.destroyed, 'component cleanup releases references without forcing shared resource destruction');
        fixed.material.destroy();

        const a = create(), b = create(); await render();
        check(mesh.referenceCount === baseline.mesh + 2 && texture.referenceCount === baseline.texture + 2,
            'two renderers hold independent references to shared mesh and Texture');
        a.sprite.destroy(); await frames(); await render();
        const offset = ((63 - 8) * 64 + 8) * 4;
        check(mesh.referenceCount === baseline.mesh + 1 && texture.referenceCount === baseline.texture + 1
            && !mesh.destroyed && !texture.destroyed, 'destroying one user preserves shared resources for the other');
        check(pixels[offset + 1] === 255 && pixels[offset + 3] === 255, 'remaining renderer still draws after its peer is destroyed');
        b.sprite.destroy(); await frames();
        check(mesh.referenceCount === baseline.mesh && texture.referenceCount === baseline.texture,
            'last user releases the remaining references');
        a.material.destroy(); b.material.destroy();

        const defaultMesh = Laya.Mesh2DRender.defaultQuadMesh;
        const defaultMaterial = Laya.Mesh2DRender.mesh2DDefaultMaterial;
        const sprite = new Laya.Sprite(); root.addChild(sprite);
        const renderer = sprite.addComponent(Laya.Mesh2DRender);
        renderer.useUnitQuad = true; renderer.size = new Laya.Vector2(16, 16);
        await render(); sprite.destroy(); await frames();
        check(!defaultMesh.destroyed && !defaultMaterial.destroyed,
            'component destruction preserves the built-in shared quad and default material');
        check(bitmap.referenceCount === baseline.bitmap, 'all bitmap references are balanced after both arms and shared-user checks');
        rt.destroy(); root.destroy(); texture.destroy(); bitmap.destroy(); mesh.destroy();
    } catch (error) { errors.push(String(error.stack || error)); }
    window.__gpuReport = {backend, checks, errors, passed: checks.every(check => check.passed) && errors.length === 0};
})();
