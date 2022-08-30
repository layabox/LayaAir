import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
import { Laya } from "./Laya";
import { PostProcess } from "./laya/d3/component/PostProcess";
import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial";
import { Material } from "./laya/d3/core/material/Material";
import { PBRMaterial } from "./laya/d3/core/material/PBRMaterial";
import { PBRStandardMaterial } from "./laya/d3/core/material/PBRStandardMaterial";
import { SkyBoxMaterial } from "./laya/d3/core/material/SkyBoxMaterial";
import { SkyProceduralMaterial } from "./laya/d3/core/material/SkyProceduralMaterial";
import { UnlitMaterial } from "./laya/d3/core/material/UnlitMaterial";
import { MeshRenderer } from "./laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "./laya/d3/core/MeshSprite3D";
import { ShuriKenParticle3D } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3D";
import { ShurikenParticleMaterial } from "./laya/d3/core/particleShuriKen/ShurikenParticleMaterial";
import { PixelLineVertex } from "./laya/d3/core/pixelLine/PixelLineVertex";
import { Command } from "./laya/d3/core/render/command/Command";
import { RenderContext3D } from "./laya/d3/core/render/RenderContext3D";
import { ScreenQuad } from "./laya/d3/core/render/ScreenQuad";
import { RenderableSprite3D } from "./laya/d3/core/RenderableSprite3D";
import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { SkinnedMeshSprite3D } from "./laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "./laya/d3/core/Sprite3D";
import { TrailMaterial } from "./laya/d3/core/trail/TrailMaterial";
import { TrailSprite3D } from "./laya/d3/core/trail/TrailSprite3D";
import { VertexTrail } from "./laya/d3/core/trail/VertexTrail";
import { FrustumCulling } from "./laya/d3/graphics/FrustumCulling";
import { MeshRenderStaticBatchManager } from "./laya/d3/graphics/MeshRenderStaticBatchManager";
import { SubMeshInstanceBatch } from "./laya/d3/graphics/SubMeshInstanceBatch";
import { VertexMesh } from "./laya/d3/graphics/Vertex/VertexMesh";
import { VertexPositionTerrain } from "./laya/d3/graphics/Vertex/VertexPositionTerrain";
import { VertexPositionTexture0 } from "./laya/d3/graphics/Vertex/VertexPositionTexture0";
import { VertexShurikenParticleBillboard } from "./laya/d3/graphics/Vertex/VertexShurikenParticleBillboard";
import { VertexShurikenParticleMesh } from "./laya/d3/graphics/Vertex/VertexShurikenParticleMesh";
import { BulletInteractive } from "./laya/d3/physics/BulletInteractive";
import { Mesh } from "./laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "./laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { TextureCube } from "./laya/d3/resource/TextureCube";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Render } from "./laya/renders/Render";
import { Texture2D } from "./laya/resource/Texture2D";
import { Handler } from "./laya/utils/Handler";
import { RunDriver } from "./laya/utils/RunDriver";
import { WebGL } from "./laya/webgl/WebGL";
import { ShadowUtils } from "./laya/d3/core/light/ShadowUtils";
import { ShadowCasterPass } from "./laya/d3/shadowMap/ShadowCasterPass";
import { SimpleSkinnedMeshSprite3D } from "./laya/d3/core/SimpleSkinnedMeshSprite3D";
import { HalfFloatUtils } from "./laya/utils/HalfFloatUtils";
import { Physics3D } from "./laya/d3/Physics3D";
import { Camera } from "./laya/d3/core/Camera";
import { BaseCamera } from "./laya/d3/core/BaseCamera";
import { ShuriKenParticle3DShaderDeclaration } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3DShaderDeclaration";
import { BaseRender } from "./laya/d3/core/render/BaseRender";
import { TrailFilter } from "./laya/d3/core/trail/TrailFilter";
import { DepthPass } from "./laya/d3/depthMap/DepthPass";
import { RenderCapable } from "./laya/RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";
import { BlitFrameBufferCMD } from "./laya/d3/core/render/command/BlitFrameBufferCMD";
import { SkyRenderer } from "./laya/d3/resource/models/SkyRenderer";
import { CannonPhysicsSettings } from "./laya/d3/physicsCannon/CannonPhysicsSettings";
import { SubShader } from "./laya/d3/shader/SubShader";
import { SkyPanoramicMaterial } from "./laya/d3/core/material/SkyPanoramicMaterial";
import { BloomEffect } from "./laya/d3/core/render/BloomEffect";

/**
 * <code>Laya3D</code> 类用于初始化3D设置。
 */
export class Laya3D {
    /**@internal */
    private static _isInit: boolean = false;

    /**
     * 获取是否可以启用物理。
     * @param 是否启用物理。
     */
    static get enablePhysics(): any {
        return Physics3D._enablePhysics;
    }

    /**
     *@internal
     */
    private static _changeWebGLSize(width: number, height: number): void {
        WebGL.onStageResize(width, height);
        RenderContext3D.clientWidth = width;
        RenderContext3D.clientHeight = height;
    }

    /**
     *@internal
     */
    private static __init__(width: number, height: number): void {
        if (!WebGL.enable()) {
            alert("Laya3D init error,must support webGL!");
            return;
        }

        RunDriver.changeWebGLSize = Laya3D._changeWebGLSize;
        Render.is3DMode = true;
        Laya.init(width, height);

        Config3D._multiLighting = Config3D.enableMultiLight && LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32);
        Config3D._uniformBlock = Config3D.enableUniformBufferObject && LayaGL.renderEngine.getCapable(RenderCapable.UnifromBufferObject);

        if (Config3D.maxLightCount > 2048) {
            Config3D.maxLightCount = 2048;
            console.warn("Config3D: maxLightCount must less equal 2048.");
        }

        let lcc = Config3D.lightClusterCount;
        if (lcc.x > 128 || lcc.y > 128 || lcc.z > 128) {
            lcc.setValue(Math.min(lcc.x, 128), Math.min(lcc.y, 128), Math.min(lcc.z, 128));
            console.warn("Config3D: lightClusterCount X and Y、Z must less equal 128.");
        }

        let maxAreaLightCountWithZ = Math.floor(2048 / Config3D.lightClusterCount.z - 1) * 4;
        if (maxAreaLightCountWithZ < Config3D.maxLightCount)
            console.warn("Config3D: if the area light(PointLight、SpotLight) count is large than " + maxAreaLightCountWithZ + ",maybe the far away culster will ingonre some light.");
        Config3D._maxAreaLightCountPerClusterAverage = Math.min(maxAreaLightCountWithZ, Config3D.maxLightCount);

        ILaya3D.Scene3D = Scene3D;
        ILaya3D.Laya3D = Laya3D;
        ILaya3D.Physics3D = Physics3D;

        if (Config3D.useCannonPhysics)
            Physics3D.__cannoninit__();

        Physics3D.__bulletinit__();
        SubShader.__init__();
        VertexMesh.__init__();
        VertexShurikenParticleBillboard.__init__();
        VertexShurikenParticleMesh.__init__();
        VertexPositionTexture0.__init__();
        VertexTrail.__init__();
        VertexPositionTerrain.__init__();
        PixelLineVertex.__init__();
        SubMeshInstanceBatch.__init__();
        ShaderInit3D.__init__();
        ShuriKenParticle3DShaderDeclaration.__init__();
        SimpleSkinnedMeshSprite3D.__init__();
        PBRMaterial.__init__();
        PBRStandardMaterial.__init__();
        SkyPanoramicMaterial.__init__();
        BloomEffect.init();
        // PBRSpecularMaterial.__init__();
        // SkyPanoramicMaterial.__init__();
        Mesh.__init__();
        PrimitiveMesh.__init__();
        Sprite3D.__init__();
        RenderableSprite3D.__init__();
        MeshSprite3D.__init__();
        DepthPass.__init__();
        SkinnedMeshSprite3D.__init__();
        SimpleSkinnedMeshSprite3D.__init__();
        TrailFilter.__init__();
        ShuriKenParticle3D.__init__();
        TrailSprite3D.__init__();
        PostProcess.__init__();
        Scene3D.__init__();
        ShadowCasterPass.__init__();
        BaseCamera.__init__();
        BaseRender.__init__();
        MeshRenderer.__init__();
        SkyRenderer.__init__();
        Camera.__init__();
        MeshRenderStaticBatchManager.__init__();
        ShadowUtils.init();
        RenderContext3D.__init__();
        Material.__initDefine__();
        BlinnPhongMaterial.__initDefine__();
        // PBRStandardMaterial.__initDefine__();
        // PBRSpecularMaterial.__initDefine__();
        SkyProceduralMaterial.__initDefine__();
        UnlitMaterial.__initDefine__();
        TrailMaterial.__initDefine__();

        // EffectMaterial.__initDefine__();
        // WaterPrimaryMaterial.__initDefine__();
        ShurikenParticleMaterial.__initDefine__();
        // ExtendTerrainMaterial.__initDefine__();
        // PixelLineMaterial.__initDefine__();
        SkyBoxMaterial.__initDefine__();
        // BloomEffect.__init__();

        Command.__init__();
        BlitFrameBufferCMD.__init__();

        // PixelLineMaterial.defaultMaterial = new PixelLineMaterial();
        BlinnPhongMaterial.defaultMaterial = new BlinnPhongMaterial();
        BlinnPhongMaterial.defaultMaterial.lock = true;
        // EffectMaterial.defaultMaterial = new EffectMaterial();
        // PBRStandardMaterial.defaultMaterial = new PBRStandardMaterial();
        // PBRSpecularMaterial.defaultMaterial = new PBRSpecularMaterial();
        // UnlitMaterial.defaultMaterial = new UnlitMaterial();
        // ShurikenParticleMaterial.defaultMaterial = new ShurikenParticleMaterial();
        // TrailMaterial.defaultMaterial = new TrailMaterial();
        // SkyProceduralMaterial.defaultMaterial = new SkyProceduralMaterial();
        // SkyBoxMaterial.defaultMaterial = new SkyBoxMaterial();
        // WaterPrimaryMaterial.defaultMaterial = new WaterPrimaryMaterial();

        // PixelLineMaterial.defaultMaterial.lock = true;//todo:
        // BlinnPhongMaterial.defaultMaterial.lock = true;
        // EffectMaterial.defaultMaterial.lock = true;
        // // PBRStandardMaterial.defaultMaterial.lock = true;
        // // PBRSpecularMaterial.defaultMaterial.lock = true;
        // // UnlitMaterial.defaultMaterial.lock = true;
        // ShurikenParticleMaterial.defaultMaterial.lock = true;
        // TrailMaterial.defaultMaterial.lock = true;
        // SkyProceduralMaterial.defaultMaterial.lock = true;
        // SkyBoxMaterial.defaultMaterial.lock = true;
        // WaterPrimaryMaterial.defaultMaterial.lock = true;
        Texture2D.__init__();
        TextureCube.__init__();
        SkyBox.__init__();
        SkyDome.__init__();
        ScreenQuad.__init__();
        FrustumCulling.__init__();
        HalfFloatUtils.__init__();
    }

    /**
     * 初始化Laya3D相关设置。
     * @param	width  3D画布宽度。
     * @param	height 3D画布高度。
     * @param   config 参数已废弃，传null。
     */
    static init(width: number, height: number, config: any = null, complete: Handler = null): void {
        if (Laya3D._isInit) {
            complete && complete.run();
            return;
        }
        Laya3D._isInit = true;

        var physics3D: Function = (window as any).Physics3D;
        if (physics3D == null || Config3D.useCannonPhysics) {
            Physics3D._enablePhysics = false;
            Laya3D.__init__(width, height);
            complete && complete.run();
        } else {
            Physics3D._enablePhysics = true;
            //should convert MB to pages
            physics3D(Math.max(16, Config3D.defaultPhysicsMemory) * 16, new BulletInteractive(null, null)).then(function (): void {
                Laya3D.__init__(width, height);
                complete && complete.run();
            });
        }
    }

    static useCannonPhysics() {
        Config3D.useCannonPhysics = true;
        Physics3D.__cannoninit__();
        if (!Scene3D.cannonPhysicsSettings)
            Scene3D.cannonPhysicsSettings = new CannonPhysicsSettings();
    }
}

(window as any).Laya3D = Laya3D;

