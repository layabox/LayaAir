import { Config } from "./Config";
import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
import { Laya } from "./Laya";
import { PostProcess } from "./laya/d3/component/PostProcess";
import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial";
import { EffectMaterial } from "./laya/d3/core/material/EffectMaterial";
import { ExtendTerrainMaterial } from "./laya/d3/core/material/ExtendTerrainMaterial";
import { Material } from "./laya/d3/core/material/Material";
import { PBRMaterial } from "./laya/d3/core/material/PBRMaterial";
import { PBRSpecularMaterial } from "./laya/d3/core/material/PBRSpecularMaterial";
import { PBRStandardMaterial } from "./laya/d3/core/material/PBRStandardMaterial";
import { SkyBoxMaterial } from "./laya/d3/core/material/SkyBoxMaterial";
import { SkyProceduralMaterial } from "./laya/d3/core/material/SkyProceduralMaterial";
import { UnlitMaterial } from "./laya/d3/core/material/UnlitMaterial";
import { WaterPrimaryMaterial } from "./laya/d3/core/material/WaterPrimaryMaterial";
import { MeshRenderer } from "./laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "./laya/d3/core/MeshSprite3D";
import { ShuriKenParticle3D } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3D";
import { ShurikenParticleMaterial } from "./laya/d3/core/particleShuriKen/ShurikenParticleMaterial";
import { PixelLineMaterial } from "./laya/d3/core/pixelLine/PixelLineMaterial";
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
import { MeshRenderDynamicBatchManager } from "./laya/d3/graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "./laya/d3/graphics/MeshRenderStaticBatchManager";
import { SubMeshInstanceBatch } from "./laya/d3/graphics/SubMeshInstanceBatch";
import { VertexMesh } from "./laya/d3/graphics/Vertex/VertexMesh";
import { VertexPositionTerrain } from "./laya/d3/graphics/Vertex/VertexPositionTerrain";
import { VertexPositionTexture0 } from "./laya/d3/graphics/Vertex/VertexPositionTexture0";
import { VertexShurikenParticleBillboard } from "./laya/d3/graphics/Vertex/VertexShurikenParticleBillboard";
import { VertexShurikenParticleMesh } from "./laya/d3/graphics/Vertex/VertexShurikenParticleMesh";
import { Matrix4x4 } from "./laya/d3/math/Matrix4x4";
import { BulletInteractive } from "./laya/d3/physics/BulletInteractive";
import { Mesh } from "./laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "./laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { TextureCube } from "./laya/d3/resource/TextureCube";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Loader } from "./laya/net/Loader";
import { Render } from "./laya/renders/Render";
import { Texture2D } from "./laya/resource/Texture2D";
import { Handler } from "./laya/utils/Handler";
import { RunDriver } from "./laya/utils/RunDriver";
import { WebGL } from "./laya/webgl/WebGL";
import { SkyPanoramicMaterial } from "./laya/d3/core/material/SkyPanoramicMaterial";
import { ShadowUtils } from "./laya/d3/core/light/ShadowUtils";
import { ShadowCasterPass, ShadowLightType } from "./laya/d3/shadowMap/ShadowCasterPass";
import { SimpleSkinnedMeshSprite3D } from "./laya/d3/core/SimpleSkinnedMeshSprite3D";
import { HalfFloatUtils } from "./laya/utils/HalfFloatUtils";
import { Physics3D } from "./laya/d3/Physics3D";
import { Camera } from "./laya/d3/core/Camera";
import { CommandBuffer } from "./laya/d3/core/render/command/CommandBuffer";
import { RenderElement } from "./laya/d3/core/render/RenderElement";
import { SubMeshRenderElement } from "./laya/d3/core/render/SubMeshRenderElement";
import { BaseCamera } from "./laya/d3/core/BaseCamera";
import { ShuriKenParticle3DShaderDeclaration } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3DShaderDeclaration";
import { BaseRender } from "./laya/d3/core/render/BaseRender";
import { BloomEffect } from "./laya/d3/core/render/BloomEffect";
import { TrailFilter } from "./laya/d3/core/trail/TrailFilter";
import { DepthPass } from "./laya/d3/depthMap/DepthPass";
import { RenderCapable } from "./laya/RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";
import { BlitFrameBufferCMD } from "./laya/d3/core/render/command/BlitFrameBufferCMD";
import { ParticleShuriKenShaderInit } from "./laya/d3/shader/ShurikenParticle/ParticleShuriKenShaderInit";
import { SkyRenderer } from "./laya/d3/resource/models/SkyRenderer";
import { SubShader } from "./laya/d3/shader/SubShader";

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
    private static __init__(width: number, height: number, config: Config3D): void {
        Config.isAntialias = config.isAntialias;
        Config.isAlpha = config.isAlpha;
        Config.premultipliedAlpha = config.premultipliedAlpha;
        Config.isStencil = config.isStencil;

        if (!WebGL.enable()) {
            alert("Laya3D init error,must support webGL!");
            return;
        }

        RunDriver.changeWebGLSize = Laya3D._changeWebGLSize;
        Render.is3DMode = true;
        Laya.init(width, height);
        config._multiLighting = config.enableMultiLight && LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32);
        config._uniformBlock = config.enableUniformBufferObject && LayaGL.renderEngine.getCapable(RenderCapable.UnifromBufferObject);
        ILaya3D.Shader3D = Shader3D;
        ILaya3D.Scene3D = Scene3D;
        ILaya3D.MeshRenderStaticBatchManager = MeshRenderStaticBatchManager;
        ILaya3D.MeshRenderDynamicBatchManager = MeshRenderDynamicBatchManager;
        ILaya3D.Laya3D = Laya3D;
        ILaya3D.Matrix4x4 = Matrix4x4;
        ILaya3D.Physics3D = Physics3D;
        ILaya3D.ShadowLightType = ShadowLightType;
        ILaya3D.Camera = Camera;
        ILaya3D.CommandBuffer = CommandBuffer;
        ILaya3D.RenderElement = RenderElement;
        ILaya3D.SubMeshRenderElement = SubMeshRenderElement;

        if (config.isUseCannonPhysicsEngine)
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
        // BlinnPhongMaterial.defaultMaterial = new BlinnPhongMaterial();
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
     */
    static init(width: number, height: number, config: Config3D = null, complete: Handler = null): void {
        if (Laya3D._isInit) {
            complete && complete.run();
            return;
        }
        Laya3D._isInit = true;
        (config) && (config.cloneTo(Config3D._config));
        config = Config3D._config;
        FrustumCulling.debugFrustumCulling = config.debugFrustumCulling;
        Scene3D.octreeCulling = config.octreeCulling;
        Scene3D.octreeInitialSize = config.octreeInitialSize;
        Scene3D.octreeInitialCenter = config.octreeInitialCenter;
        Scene3D.octreeMinNodeSize = config.octreeMinNodeSize;
        Scene3D.octreeLooseness = config.octreeLooseness;

        var physics3D: Function = (window as any).Physics3D;
        if (physics3D == null || config.isUseCannonPhysicsEngine) {
            Physics3D._enablePhysics = false;
            Laya3D.__init__(width, height, config);
            complete && complete.run();
        } else {
            Physics3D._enablePhysics = true;
            //should convert MB to pages
            physics3D(config.defaultPhysicsMemory * 16, new BulletInteractive(null,null)).then(function (): void {
                Laya3D.__init__(width, height, config);
                complete && complete.run();
            });
        }
    }
}

(window as any).Laya3D = Laya3D;

