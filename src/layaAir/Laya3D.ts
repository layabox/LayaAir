import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
import { PostProcess } from "./laya/d3/component/PostProcess";
import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial";
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
import { VertexTrail } from "./laya/d3/core/trail/VertexTrail";
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
import { VertexMesh } from "./laya/RenderEngine/RenderShader/VertexMesh";
import { RenderTexture } from "./laya/resource/RenderTexture";
import { ColorGradEffect } from "./laya/d3/core/render/PostEffect/ColorGradEffect";
import { LensFlareEffect } from "./laya/d3/core/render/PostEffect/LensFlares/LensFlareEffect";
import { IPhysicsCreateUtil } from "./laya/Physics3D/interface/IPhysicsCreateUtil";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Laya } from "./Laya";
import { PixelLineMaterial } from "./laya/d3/core/pixelLine/PixelLineMaterial";

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
        if (value && !Laya3D._PhysicsCreateUtil) {
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
    static __init__() {
        Config3D._multiLighting = Config3D.enableMultiLight && LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32);
        Config3D._uniformBlock = false;//Config3D.enableUniformBufferObject && LayaGL.renderEngine.getCapable(RenderCapable.UnifromBufferObject);

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
        UnlitMaterial.defaultMaterial = new UnlitMaterial();
        UnlitMaterial.defaultMaterial.lock = true;
        let pixelLineMaterial = new UnlitMaterial();
        pixelLineMaterial.lock = true;
        pixelLineMaterial.enableVertexColor = true;
        PixelLineMaterial.defaultMaterial = pixelLineMaterial;
        TrailMaterial.defaultMaterial = new TrailMaterial();
        TrailMaterial.defaultMaterial.lock = true;
        Texture2D.__init__();
        TextureCube.__init__();
        SkyBox.__init__();
        SkyDome.__init__();
        ScreenQuad.__init__();
        HalfFloatUtils.__init__();
    }

    /**
     *@internal
    */
    static __initPhysics__(): Promise<void> {
        if (!Laya3D._PhysicsCreateUtil) {
            Laya3D._enablePhysics = false;
            return Promise.resolve();
        }
        else {
            Laya3D._enablePhysics = true;
            return Laya3D._PhysicsCreateUtil.initialize();
        }
    }
}

(window as any).Laya3D = Laya3D;
Laya.addInitCallback(() => Laya3D.__initPhysics__());