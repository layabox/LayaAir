(async () => {
    const checks = [], errors = window.__bootstrapErrors || [];
    const backend = new URLSearchParams(location.search).get('backend') || 'webgl';
    window.addEventListener('error', event => errors.push(event.message));
    window.addEventListener('unhandledrejection', event => errors.push(String(event.reason?.stack || event.reason)));
    const check = (condition, name, detail) => {
        checks.push({name, passed: !!condition, detail});
        if (!condition) console.error('CHECK FAILED', name, detail);
    };
    try {
        await Laya.init(128, 128);
        if (backend === 'webgpu')
            Laya.LayaGL.renderEngine.getDevice().addEventListener('uncapturederror', event => errors.push(event.error.message));
        Laya.stage.bgColor = '#000000';
        const root = new Laya.Sprite();
        root.size(128, 128);
        Laya.stage.addChild(root);
        let rt = new Laya.RenderTexture2D(128, 128, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.DEPTHSTENCIL_24_8);
        const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        async function capture() {
            await frames();
            rt = root.drawToRenderTexture2D(128, 128, 0, 0, rt, false, false, Laya.Color.CLEAR);
            const pixels = new Uint8Array(128 * 128 * 4);
            await rt.getDataAsync(0, 0, 128, 128, pixels);
            return pixels;
        }
        function pixel(pixels, x, y) {
            // Sprite.drawToRenderTexture2D normalizes the backend's render-target flip.
            const row = 127 - y;
            return Array.from(pixels.subarray((row * 128 + x) * 4, (row * 128 + x) * 4 + 4));
        }
        const color = (pixels, x, y, expected, name) => {
            const actual = pixel(pixels, x, y);
            check(actual.every((value, i) => Math.abs(value - expected[i]) <= 3), name, {actual, expected});
        };
        const white = new Laya.Texture(Laya.Texture2D.whiteTexture);
        // A textureless element can become the head of a cached reorder group.
        // Cached members must still adopt their atlas and shader state.
        {
            const savedClip = Laya.Config.uvClipMode;
            const atlases = [], frames = [null];
            for (const fill of ['#ff0000', '#00ff00', '#0000ff']) {
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 32;
                const context = canvas.getContext('2d');
                context.fillStyle = '#ff00ff'; context.fillRect(0, 0, 32, 32);
                context.fillStyle = fill; context.fillRect(5, 7, 8, 8);
                const atlas = await Laya.loader.load(canvas.toDataURL());
                atlases.push(atlas);
                frames.push(Laya.Texture.create(atlas, 5, 7, 8, 8));
            }
            const fixtures = [
                [[2,0,10,20,7],[1,10,10,5,32],[1,20,20,25,28],[0,0,0,20,29],[2,40,20,24,13]],
                [[2,0,10,20,7],[1,10,10,5,32],[3,40,30,21,26],[1,20,20,25,28],
                    [0,0,0,20,29],[3,10,40,19,18],[2,40,20,24,13]],
                [[2,30,30,7,26],[1,30,10,14,17],[0,30,10,20,15],
                    [3,40,0,7,28],[1,10,40,18,27],[2,10,20,13,28]]
            ];
            try {
                for (const clipMode of ['cpu', 'gpu']) for (const reorder of [false, true]) {
                    Laya.Config.uvClipMode = clipMode;
                    for (let fixture = 0; fixture < fixtures.length; fixture++) {
                        const group = new Laya.Sprite();
                        group.size(64, 64); group.drawCallOptimize = reorder; root.addChild(group);
                        for (const [texture, x, y, width, height] of fixtures[fixture]) {
                            const sprite = new Laya.Sprite();
                            sprite.pos(x, y); sprite.size(width, height);
                            if (texture) sprite.graphics.drawTexture(frames[texture], 0, 0, width, height);
                            else sprite.graphics.drawRect(0, 0, width, height, '#ffffff');
                            group.addChild(sprite);
                        }
                        const actual = await capture();
                        color(actual, fixture === 2 ? 16 : 52, 26, [0,255,0,255], `cached atlas batch ${fixture}, ${clipMode}, reorder=${reorder}`);
                        color(actual, fixture === 2 ? 32 : 5, fixture === 2 ? 12 : 5, [255,255,255,255], `textureless batch head ${fixture}, ${clipMode}, reorder=${reorder}`);
                        group.destroy(true);
                    }
                }
            } finally {
                Laya.Config.uvClipMode = savedClip;
                frames.slice(1).forEach(texture => texture.destroy());
                atlases.forEach(texture => texture.destroy());
            }
        }
        const customParent = new Laya.Sprite();
        root.addChild(customParent);
        const customSprite = new Laya.Sprite();
        customParent.addChild(customSprite);
        let runs = 0;
        const custom = {cmdID: 'RegressionCustomQuad', lock: true, color: 0xff00ff00, blendMode: null,
            vertices: new Float32Array([16, 16, 48, 16, 48, 48, 16, 48]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
            run(context, gx, gy) {
                runs++;
                context.drawTriangles(white, gx, gy, this.vertices, this.uvs, this.indices, null, 1, this.blendMode, this.color);
            }, recover() {}};
        customSprite.graphics.drawRect(0, 0, 64, 64, '#ff0000');
        customSprite.graphics.addCmd(custom);
        customSprite.graphics.drawRect(24, 24, 16, 16, '#0000ff');
        customSprite.graphics.drawImage(white, 80, 48, 16, 16);
        customSprite.graphics.fillText('X', 80, 0, '24px Arial', '#ffffff', 'left');
        let pixels = await capture();
        color(pixels, 8, 32, [255, 0, 0, 255], 'built-in before custom');
        color(pixels, 20, 32, [0, 255, 0, 255], 'custom command draws');
        color(pixels, 32, 32, [0, 0, 255, 255], 'built-in after custom');
        color(pixels, 88, 56, [255, 255, 255, 255], 'built-in image mixes with custom');
        let textPixels = 0;
        for (let y = 0; y < 32; y++) for (let x = 80; x < 104; x++) if (pixel(pixels, x, y)[3] > 0) textPixels++;
        check(textPixels > 0, 'built-in text mixes with custom', {textPixels});
        const compiledRuns = runs;
        await capture();
        check(runs === compiledRuns, 'retained custom command is not rerun every render', {runs, compiledRuns});
        custom.color = 0xff00ffff;
        customSprite.graphics.repaint();
        pixels = await capture();
        color(pixels, 20, 32, [255, 255, 0, 255], 'repaint refreshes custom payload');
        check(runs === compiledRuns + 1, 'repaint compiles custom command once', {runs});
        custom.color = 0xff00ff00;
        custom.blendMode = 'add';
        customSprite.graphics.repaint();
        pixels = await capture();
        color(pixels, 20, 32, [255, 255, 0, 255], 'custom command blend mode mixes with built-in background');
        custom.color = 0xff00ffff;
        custom.blendMode = null;
        customSprite.graphics.repaint();
        customParent.pos(8, 8);
        customParent.alpha = 0.5;
        customParent.scrollRect = new Laya.Rectangle(0, 0, 32, 64);
        pixels = await capture();
        color(pixels, 28, 40, [191, 128, 0, 191], 'custom transform and parent alpha');
        color(pixels, 52, 40, [0, 0, 0, 0], 'custom respects clip');
        customParent.destroy();

        const shader = Laya.Shader3D.add('GraphicsExtensionRegression');
        shader.shaderType = Laya.ShaderFeatureType.D2_BaseRenderNode2D;
        const sub = new Laya.SubShader({
            a_position: [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector3],
            a_canvasData: [Laya.VertexMesh.MESH_CUSTOME0, Laya.ShaderDataType.Vector4]
        }, {u_testTint: Laya.ShaderDataType.Vector4});
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl"
            varying vec4 v_testColor;
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_color = info.color; v_testColor = a_canvasData * u_testTint;
                gl_Position = getPosition(info.pos);
            }`, `
            #include "Sprite2DFrag.glsl"
            varying vec4 v_testColor;
            void main() { clip(); setglColor(v_testColor); }`);
        function material(r, g, b) {
            const result = new Laya.Material();
            result.setShaderName('GraphicsExtensionRegression');
            result.setVector4('u_testTint', new Laya.Vector4(r, g, b, 1));
            result.depthWrite = false;
            result.depthTest = Laya.RenderState.DEPTHTEST_OFF;
            result.cull = Laya.RenderState.CULL_NONE;
            result.blend = Laya.RenderState.BLEND_ENABLE_ALL;
            result.blendSrc = Laya.RenderState.BLENDPARAM_ONE;
            result.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            return result;
        }
        const a = material(1, 0, 0), b = material(0, 1, 0);
        const declaration = new Laya.VertexDeclaration(28, [
            new Laya.VertexElement(0, Laya.VertexElementFormat.Vector3, Laya.VertexMesh.MESH_POSITION0),
            new Laya.VertexElement(12, Laya.VertexElementFormat.Vector4, Laya.VertexMesh.MESH_CUSTOME0)
        ]);
        const data = new Float32Array(12 * 7), indices = new Uint16Array(18);
        for (let quad = 0; quad < 3; quad++) {
            const x = quad * 16;
            const positions = [x, 0, x + 48, 0, x + 48, 64, x, 64];
            for (let v = 0; v < 4; v++) data.set([positions[v * 2], positions[v * 2 + 1], 0, 1, 1, 1, 1], (quad * 4 + v) * 7);
            indices.set([0, 1, 2, 0, 2, 3].map(v => v + quad * 4), quad * 6);
        }
        const mesh = Laya.Mesh2D.createMesh2DByPrimitive([data], [declaration], indices, Laya.IndexFormat.UInt16,
            [{start: 0, length: 6}, {start: 12, length: 6}, {start: 24, length: 6}]);
        const sprite = new Laya.Sprite();
        const meshParent = new Laya.Sprite();
        root.addChild(meshParent);
        meshParent.addChild(sprite);
        const render = sprite.addComponent(Laya.Mesh2DRender);
        render.setSharedMaterial(0, a);
        render.setSharedMaterial(1, b);
        render.setSharedMaterial(2, a);
        render.sharedMesh = mesh;
        pixels = await capture();
        color(pixels, 8, 32, [255, 0, 0, 255], 'mesh material A first');
        color(pixels, 24, 32, [0, 255, 0, 255], 'mesh material B second');
        color(pixels, 40, 32, [255, 0, 0, 255], 'mesh material A third keeps draw order');
        const elements = render._renderElements.slice();
        let elementDisposals = 0;
        for (const element of elements) {
            const destroy = element.destroy;
            element.destroy = function () { elementDisposals++; return destroy.call(this); };
        }
        render.setSharedMaterial(2, b);
        pixels = await capture();
        color(pixels, 40, 32, [0, 255, 0, 255], 'changing material updates real backend');
        check(render._renderElements.every((element, i) => element === elements[i]), 'material changes reuse elements');
        if (backend === 'webgpu') {
            const ownerData = sprite._shaderData;
            const buffer = ownerData._subUniformBuffers.values().next().value;
            check(!!buffer, 'WebGPU owner has a real pooled uniform block');
            const uniform = buffer.descriptor.uniforms.values().next().value;
            const before = Array.from(uniform.view);
            const version = buffer.bindGroupResourceVersion.value;
            const cache = Laya.LayaGL.renderEngine.bindGroupCache;
            let ownerBindingKey, ownerBinding;
            for (const [key, group] of cache.bindGroupCache) {
                if (group.bufferRefs.some(ref => ref.token === buffer.bindGroupResourceVersion)) {
                    ownerBindingKey = key; ownerBinding = group; break;
                }
            }
            check(!!ownerBinding, 'WebGPU cache contains the owner uniform binding');
            const borrower = Laya.LayaGL.renderDeviceFactory.createShaderData();
            const map = Laya.LayaGL.renderDeviceFactory.createGlobalUniformMap(buffer.uniformName);
            borrower._cacheSubUniformBuffer(buffer, buffer.uniformName, buffer.descriptor.lable, map._idata);
            borrower.destroy();
            check(uniform.view.every((value, index) => value === before[index]),
                'destroying a borrower preserves real shared uniform contents');
            check(buffer.bindGroupResourceVersion.value === version && ownerBinding.isValid(),
                'destroying a borrower preserves the owner buffer and valid bind group');
            let validations = 0;
            const removeInvalid = cache._removeInvalidGroup;
            cache._removeInvalidGroup = function (group, key) {
                validations++; return removeInvalid.call(this, group, key);
            };
            try {
                for (let i = 0; i < 1000; i++)
                    Laya.LayaGL.renderDeviceFactory.createShaderData().destroy();
                check(validations === 0, '1000 WebGPU ShaderData destructions defer cache traversal');
                const groups = cache.bindGroupCache.size;
                ownerData.constructor.endFrame();
                check(validations === groups, 'WebGPU frame-end cleanup traverses bindings once', {validations, groups});
                ownerData.constructor.endFrame();
                check(validations === groups, 'WebGPU idle frame does not traverse bindings');
                check(cache.bindGroupCache.get(ownerBindingKey) === ownerBinding,
                    'deferred cleanup keeps the live owner binding identity');
            } finally {
                cache._removeInvalidGroup = removeInvalid;
            }
            pixels = await capture();
            color(pixels, 40, 32, [0, 255, 0, 255], 'owner still renders after shared borrower destruction and cache cleanup');
        }
        meshParent.alpha = 0.5;
        meshParent.pos(8, 8);
        meshParent.scrollRect = new Laya.Rectangle(0, 0, 48, 64);
        pixels = await capture();
        color(pixels, 32, 40, [64, 128, 0, 191], 'mesh transform and alpha');
        color(pixels, 72, 40, [0, 0, 0, 0], 'mesh respects clip');
        render.texture = white;
        meshParent.destroy();
        await frames();
        check(mesh.referenceCount === 0, 'destroy releases shared mesh reference', {references: mesh.referenceCount});
        check(white.referenceCount === 0, 'destroy releases texture reference', {references: white.referenceCount});
        check(elementDisposals === 3, 'destroy disposes render elements', {elementDisposals});
        check(a.referenceCount === 0 && b.referenceCount === 0, 'destroy releases shared material references', {a: a.referenceCount, b: b.referenceCount});
        check(a.ownerElements.size === 0 && b.ownerElements.size === 0, 'destroy detaches material owners');
        const makeAndDestroy = async count => {
            for (let i = 0; i < count; i++) {
                const item = new Laya.Sprite();
                root.addChild(item);
                const renderer = item.addComponent(Laya.Mesh2DRender);
                renderer.sharedMesh = mesh;
                renderer.texture = white;
                renderer.normalTexture = white.bitmap;
                renderer.setSharedMaterial(0, a);
                renderer.setSharedMaterial(1, b);
                renderer.setSharedMaterial(2, a);
                if (i % 25 === 0) await capture();
                item.destroy();
                if (i % 25 === 24) await frames();
            }
            await frames();
        };
        await makeAndDestroy(500); // Warm reusable pools and optimizing JIT tiers first.
        const resourceCount = Object.keys(Laya.Resource._idResourcesMap).length;
        const bitmapReferences = white.bitmap.referenceCount;
        const collect = async () => {
            if (backend === 'webgpu')
                await Laya.LayaGL.renderEngine.getDevice().queue.onSubmittedWorkDone();
            await new Promise(resolve => setTimeout(resolve, 0));
            if (window.gc) window.gc();
            await new Promise(resolve => setTimeout(resolve, 0));
            if (window.gc) window.gc();
        };
        await collect();
        const heapBefore = performance.memory?.usedJSHeapSize;
        await makeAndDestroy(500);
        await collect();
        const heapMiddle = performance.memory?.usedJSHeapSize;
        await makeAndDestroy(500);
        await collect();
        const heapAfter = performance.memory?.usedJSHeapSize;
        check(mesh.referenceCount === 0 && white.referenceCount === 0 && a.referenceCount === 0 && b.referenceCount === 0,
            '1500 create/render/destroy cycles balance all shared references');
        check(white.bitmap.referenceCount === bitmapReferences, 'default/base/normal texture references remain stable',
            {before: bitmapReferences, after: white.bitmap.referenceCount});
        check(Object.keys(Laya.Resource._idResourcesMap).length === resourceCount, 'resource count remains stable',
            {before: resourceCount, after: Object.keys(Laya.Resource._idResourcesMap).length});
        check(a.ownerElements.size === 0 && b.ownerElements.size === 0, 'material owners remain empty after stress');
        check(typeof window.gc === 'function', 'forced GC available for heap check');
        if (heapBefore && heapAfter)
            check(heapAfter - heapBefore < 2 * 1024 * 1024, 'retained heap growth stays below 2 MiB after warmup',
                {heapBefore, heapMiddle, heapAfter, delta: heapAfter - heapBefore});
        if (heapMiddle && heapAfter)
            check(heapAfter - heapMiddle < 256 * 1024, 'second 500-cycle window adds less than 256 KiB retained heap',
                {delta: heapAfter - heapMiddle});
        const sceneTextureReferences = white.bitmap.referenceCount;
        const scene = new Laya.Scene();
        Laya.stage.addChild(scene);
        scene._shaderData.setTexture(Laya.Shader3D.propertyNameToID('u_lifetimeTest'), white.bitmap);
        let sceneShaderDisposals = 0;
        const sceneShaderDestroy = scene._shaderData.destroy;
        scene._shaderData.destroy = function () { sceneShaderDisposals++; return sceneShaderDestroy.call(this); };
        scene.destroy();
        await frames();
        check(sceneShaderDisposals === 1 && scene._shaderData === null, 'Scene releases its shared shader data exactly once');
        check(white.bitmap.referenceCount === sceneTextureReferences, 'Scene shader texture references are released');
        mesh.destroy(); a.destroy(); b.destroy(); white.destroy(); rt.destroy(); root.destroy();
        window.__gpuReport = {backend, checks, errors, passed: checks.every(test => test.passed) && errors.length === 0};
    } catch (error) {
        window.__gpuReport = {backend, checks, errors, passed: false, error: String(error.stack || error)};
    }
    document.querySelector('pre').textContent = JSON.stringify(window.__gpuReport, null, 2);
})();
