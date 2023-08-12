import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
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
import { SubMeshInstanceBatch } from "./laya/d3/graphics/SubMeshInstanceBatch";
import { VertexPositionTerrain } from "./laya/d3/graphics/Vertex/VertexPositionTerrain";
import { VertexPositionTexture0 } from "./laya/d3/graphics/Vertex/VertexPositionTexture0";
import { VertexShurikenParticleBillboard } from "./laya/d3/graphics/Vertex/VertexShurikenParticleBillboard";
import { VertexShurikenParticleMesh } from "./laya/d3/graphics/Vertex/VertexShurikenParticleMesh";
import { Mesh } from "./laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "./laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { TextureCube } from "./laya/resource/TextureCube";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Texture2D } from "./laya/resource/Texture2D";
import { WebGL } from "./laya/webgl/WebGL";
import { ShadowUtils } from "./laya/d3/core/light/ShadowUtils";
import { ShadowCasterPass } from "./laya/d3/shadowMap/ShadowCasterPass";
import { SimpleSkinnedMeshSprite3D } from "./laya/d3/core/SimpleSkinnedMeshSprite3D";
import { HalfFloatUtils } from "./laya/utils/HalfFloatUtils";
import { Camera } from "./laya/d3/core/Camera";
import { BaseCamera } from "./laya/d3/core/BaseCamera";
import { ShuriKenParticle3DShaderDeclaration } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3DShaderDeclaration";
import { BaseRender } from "./laya/d3/core/render/BaseRender";
import { TrailFilter } from "./laya/d3/core/trail/TrailFilter";
import { DepthPass } from "./laya/d3/depthMap/DepthPass";
import { RenderCapable } from "./laya/RenderEngine/RenderEnum/RenderCapable";
import { BlitFrameBufferCMD } from "./laya/d3/core/render/command/BlitFrameBufferCMD";
import { SkyRenderer } from "./laya/d3/resource/models/SkyRenderer";
import { SkyPanoramicMaterial } from "./laya/d3/core/material/SkyPanoramicMaterial";
import { BloomEffect } from "./laya/d3/core/render/PostEffect/BloomEffect";
import { ScalableAO } from "./laya/d3/core/render/PostEffect/ScalableAO";
import { GaussianDoF } from "./laya/d3/core/render/PostEffect/GaussianDoF";
import { LayaEnv } from "./LayaEnv";
import { NativeRenderOBJCreateUtil } from "./laya/d3/RenderObjs/NativeOBJ/NativeRenderOBJCreateUtil";
import { SubShader } from "./laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "./laya/RenderEngine/RenderShader/VertexMesh";
import { RenderTexture } from "./laya/resource/RenderTexture";
import { ColorGradEffect } from "./laya/d3/core/render/PostEffect/ColorGradEffect";
import { LensFlareEffect } from "./laya/d3/core/render/PostEffect/LensFlares/LensFlareEffect";
import { IPhysicsCreateUtil } from "./laya/Physics3D/interface/IPhysicsCreateUtil";

/**
 * <code>Laya3D</code> 类用于初始化3D设置。
 */
export class Laya3D {
    /**物理创建管理器 */
    static _PhysicsCreateUtil: IPhysicsCreateUtil;

    /**@internal */
    static _enablePhysics: boolean = false;

    /**
     * 设置物理创建管理器
     */
    static set PhysicsCreateUtil(value: IPhysicsCreateUtil) {
        if (!value) {
            Laya3D._PhysicsCreateUtil = value;
            Laya3D._enablePhysics = true;
        }
    }

    static get PhysicsCreateUtil() {
        return this._PhysicsCreateUtil;
    }

    /**
     * 是否启用物理。
     * @param 是否启用物理。
     */
    static get enablePhysics(): any {
        return Laya3D._enablePhysics;
    }

    /**
     *@internal
     */
    static _changeWebGLSize(width: number, height: number): void {
        WebGL.onStageResize(width, height);
        RenderContext3D.clientWidth = width;
        RenderContext3D.clientHeight = height;
    }

    /**
     *@internal
     */
    static __init__(checkPhysics?: boolean): Promise<void> {
        if (checkPhysics !== false) {
            if (Laya3D._PhysicsCreateUtil)
                Laya3D._enablePhysics = false;
            else {
                Laya3D._enablePhysics = true;
                return new Promise<void>(resolve => {
                    Laya3D._PhysicsCreateUtil.initialize().then(() => {
                        Laya3D.__init__(false).then(resolve);
                    });
                });
            }
        }
        Laya3D.createRenderObjInit();
        // if (LayaEnv.isConch && !(window as any).conchConfig.conchWebGL) {
        //     var skinnedMeshRender: any = SkinnedMeshRenderer;
        //     skinnedMeshRender.prototype._computeSkinnedData = skinnedMeshRender.prototype._computeSkinnedDataForNative;
        // }
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
        ScalableAO.init();
        GaussianDoF.init();
        ColorGradEffect.init();
        LensFlareEffect.init();

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
        ShadowUtils.init();
        RenderContext3D.__init__();
        RenderTexture.configRenderContextInstance(RenderContext3D._instance);
        Material.__initDefine__();
        BlinnPhongMaterial.__initDefine__();
        SkyProceduralMaterial.__initDefine__();
        UnlitMaterial.__initDefine__();
        TrailMaterial.__initDefine__();
        ShurikenParticleMaterial.__initDefine__();
        SkyBoxMaterial.__initDefine__();
        Command.__init__();
        BlitFrameBufferCMD.__init__();
        BlinnPhongMaterial.defaultMaterial = new BlinnPhongMaterial();
        BlinnPhongMaterial.defaultMaterial.lock = true;
        Texture2D.__init__();
        TextureCube.__init__();
        SkyBox.__init__();
        SkyDome.__init__();
        ScreenQuad.__init__();
        FrustumCulling.__init__();
        HalfFloatUtils.__init__();

        return Promise.resolve();
    }

    static createRenderObjInit() {
        if (LayaEnv.isConch && !(window as any).conchConfig.conchWebGL) {
            LayaGL.renderEngine._renderOBJCreateContext = new NativeRenderOBJCreateUtil();
            LayaGL.renderOBJCreate = LayaGL.renderEngine.getCreateRenderOBJContext();
        } else {
            //TODO
        }

    }
}

(window as any).Laya3D = Laya3D;

