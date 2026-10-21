// Executed by layaair run --script=NoRenderCliRegression.run --script-file=<this file>.
// @ts-nocheck
@IEditorEnv.regClass()
export class NoRenderCliRegression {
    static async run() {
        const E: any = Laya;
        let checks = 0;
        const check = (condition: boolean, message: string) => {
            if (!condition) throw new Error("NoRender CLI regression: " + message);
            checks++;
        };
        const gl = E.LayaGL;
        check(gl.renderEngine instanceof E.NoRenderEngine, "CLI initialized the NoRender engine");
        check(gl.renderDeviceFactory instanceof E.NoRenderDeviceFactory, "CLI uses the rebuilt factory");
        check(!gl.renderEngine.getCapable(E.RenderCapable.ComputeShader), "compute stays disabled");
        const factory = gl.renderDeviceFactory;
        const data = factory.createShaderData();
        data.update("MorphTarget");
        const color = new E.Color(.25, .5, .75, 1);
        data.setColor(10001, color);
        color.r = 1;
        check(data.getColor(10001).r === .25, "shader color is a snapshot");
        data.setBuffer(10002, new Float32Array([1, 2, 3]));
        const define = gl.renderEngine.getDefineByName("NORENDER_CLI_REGRESSION");
        data.addDefine(define);
        const texture = new E.Texture2D(4, 4);
        const references = texture.referenceCount;
        data.setTexture(10003, texture);
        check(texture.referenceCount === references + 1, "texture retained");
        data.setTexture(10003, texture);
        check(texture.referenceCount === references + 1, "same texture not retained twice");
        const clone = data.clone();
        check(clone.getColor(10001).r === .25 && clone.hasDefine(define), "clone keeps color and define");
        clone.getBuffer(10002)[0] = 99;
        check(data.getBuffer(10002)[0] === 1, "clone buffer is independent");
        check(texture.referenceCount === references + 2, "clone retains texture");
        clone.destroy();
        data.clearData();
        check(texture.referenceCount === references, "clear and destroy release textures");

        const map = factory.createGlobalUniformMap("NoRenderCLI");
        map.addShaderUniform(10001, "u_Test", E.ShaderDataType.Color);
        map.setDefaultTextureData(10003, texture);
        check(factory.createGlobalUniformMap("NoRenderCLI") === map && map.hasPtrID(10001), "global uniform registration persists");
        check(map._defaultTextures.get(10003) === texture, "default texture persists");

        const geo = factory.createRenderGeometryElement(E.MeshTopology.Lines, E.DrawType.DrawArray);
        geo.setDrawArrayParams(0, 6);
        geo.setDrawElemenParams(6, 12);
        check(geo.mode === E.MeshTopology.Lines && geo.drawParams.length === 4, "geometry retains parameters");
        check(geo.drawParams.elements.join(',') === '0,6,12,6', "geometry parameter ordering");

        const tc = gl.textureContext;
        const tex3D = tc.createTexture3DInternal(E.TextureDimension.Tex3D, 4, 4, 16, E.TextureFormat.R8G8B8A8, true, false, false);
        check(tex3D.depth === 16 && tex3D.mipmapCount === 5, "3D texture depth and mip count");
        const rt = tc.createRenderTargetInternal(4, 4, E.RenderTargetFormat.R8G8B8A8, E.RenderTargetFormat.DEPTH_16, true, false, 1, false);
        check(rt.colorFormat === E.RenderTargetFormat.R8G8B8A8 && rt._generateMipmap, "render target metadata");
        const out = new Uint8Array(64).fill(255);
        check(await tc.readRenderTargetPixelDataAsync(rt, 0, 0, 4, 4, out) === out, "readback returns original view");
        check(out.every(value => value === 0), "headless readback is blank");

        const ctx = gl.render2DRenderPassFactory.createRenderContext2D();
        ctx.setRenderTarget(rt, false, new E.Color());
        check(ctx.getRenderTarget() === rt, "render target roundtrip");
        ctx.setOffscreenView(320, 240, 5, 6);
        const view = new E.Vector4();
        ctx.getOffscreenView(view);
        check(view.x === 5 && view.y === 6 && view.z === 320 && view.w === 240, "viewport roundtrip");
        const forbidden = { apply() { throw new Error("NoRender must not execute render commands"); } };
        ctx.runOneCMD(forbidden);
        ctx.runCMDList([forbidden]);
        const ctx3D = E.Laya3DRender.Render3DPassFactory.createRenderContext3D();
        ctx3D.runOneCMD(forbidden);
        ctx3D.runCMDList([forbidden]);
        check(true, "2D and 3D command entry points stay inert");
        const cmd = gl.render2DRenderPassFactory.createSetRenderDataCMD();
        cmd.dest = data; cmd.propertyID = 10004; cmd.dataType = E.ShaderDataType.Float; cmd.value = 42;
        cmd.apply(ctx);
        check(data.getNumber(10004) === undefined, "shader command apply stays inert");

        const pass = gl.unitRenderModuleDataFactory.createShaderPass(null);
        pass.validDefine.add(define);
        const defines = data.getDefineData();
        defines.add(define);
        const shader = factory.createShaderInstance(null, null);
        pass.setCacheShader(defines, shader);
        check(pass.getCacheShader(defines.clone()) === shader, "shader cache survives equivalent define objects");

        // Exercise engine-facing resources and scene nodes, without test mocks.
        const renderTexture = new E.RenderTexture(8, 8, E.RenderTargetFormat.R8G8B8A8, E.RenderTargetFormat.DEPTH_16, true);
        check(renderTexture.mipmap && renderTexture.mipmapCount === 4, "RenderTexture metadata via public API");
        const sprite = new E.Sprite();
        sprite.graphics.drawRect(0, 0, 32, 32, "#ff0000");
        E.Laya.stage.addChild(sprite);
        sprite.pos(7, 9);
        const scene = new E.Scene3D();
        const meshSprite = new E.MeshSprite3D(E.PrimitiveMesh.createBox(1, 1, 1));
        scene.addChild(meshSprite);
        const material = new E.BlinnPhongMaterial();
        material.albedoColor = new E.Color(.1, .2, .3, 1);
        meshSprite.meshRenderer.sharedMaterial = material;
        const materialClone = material.clone();
        check(Math.abs(materialClone.albedoColor.r - .1) < 1e-6, "material clone keeps color");
        sprite.destroy(true);
        scene.destroy(true);
        materialClone.destroy();
        material.destroy();
        renderTexture.destroy();
        pass.destroy(); geo.destroy(); rt.dispose(); tex3D.dispose(); data.destroy(); texture.destroy();
        console.log("NORENDER_CLI_PASS " + checks + " checks; real CLI initialization, 2D/3D resources and state verified");
    }
}
