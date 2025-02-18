import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial";
import { PBRMaterial } from "./laya/d3/core/material/PBRMaterial";
import { PBRStandardMaterial } from "./laya/d3/core/material/PBRStandardMaterial";
import { SkyBoxMaterial } from "./laya/d3/core/material/SkyBoxMaterial";
import { SkyProceduralMaterial } from "./laya/d3/core/material/SkyProceduralMaterial";
import { UnlitMaterial } from "./laya/d3/core/material/UnlitMaterial";
import { MeshRenderer } from "./laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "./laya/d3/core/MeshSprite3D";
import { PixelLineVertex } from "./laya/d3/core/pixelLine/PixelLineVertex";
import { Command } from "./laya/d3/core/render/command/Command";
import { RenderContext3D } from "./laya/d3/core/render/RenderContext3D";
import { RenderableSprite3D } from "./laya/d3/core/RenderableSprite3D";
import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { SkinnedMeshSprite3D } from "./laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "./laya/d3/core/Sprite3D";
import { SubMeshInstanceBatch } from "./laya/d3/graphics/SubMeshInstanceBatch";
import { VertexPositionTexture } from "./laya/d3/graphics/Vertex/VertexPositionTexture";
import { PrimitiveMesh } from "./laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { ShadowUtils } from "./laya/d3/core/light/ShadowUtils";
import { ShadowCasterPass } from "./laya/d3/shadowMap/ShadowCasterPass";
import { SimpleSkinnedMeshSprite3D } from "./laya/d3/core/SimpleSkinnedMeshSprite3D";
import { Camera } from "./laya/d3/core/Camera";
import { BaseCamera } from "./laya/d3/core/BaseCamera";
import { BaseRender } from "./laya/d3/core/render/BaseRender";
import { DepthPass } from "./laya/d3/depthMap/DepthPass";
import { RenderCapable } from "./laya/RenderEngine/RenderEnum/RenderCapable";
import { BlitFrameBufferCMD } from "./laya/d3/core/render/command/BlitFrameBufferCMD";
import { SkyRenderer } from "./laya/d3/resource/models/SkyRenderer";
import { SkyPanoramicMaterial } from "./laya/d3/core/material/SkyPanoramicMaterial";
import { IPhysicsCreateUtil } from "./laya/Physics3D/interface/IPhysicsCreateUtil";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Laya } from "./Laya";
import { PixelLineMaterial } from "./laya/d3/core/pixelLine/PixelLineMaterial";
import { Config, PlayerConfig } from "./Config";
import { Physics3DStatInfo } from "./laya/Physics3D/interface/Physics3DStatInfo";
import { PostProcess } from "./laya/d3/core/render/postProcessBase/PostProcess";
import { ScreenQuad } from "./laya/d3/core/render/command/geometry/ScreenQuad";
import { ReflectionProbe } from "./laya/d3/component/Volume/reflectionProbe/ReflectionProbe";
import { SkinnedMeshRenderer } from "./laya/d3/core/SkinnedMeshRenderer";

/**
 * @en Laya3D class is used to initialize 3D settings.
 * @zh Laya3D类用于初始化3D设置。
 */
export class Laya3D {
    /**
     * @en Physics creation manager.
     * @zh 物理创建管理器。
     */
    static _PhysicsCreateUtil: IPhysicsCreateUtil;

    /**@internal */
    static _enablePhysics: boolean = false;

    /**
     * @en The physics creation manager.
     * @zh 物理创建管理器。
     */
    static get PhysicsCreateUtil() {
        return this._PhysicsCreateUtil;
    }
    static set PhysicsCreateUtil(value: IPhysicsCreateUtil) {
        if (value && !Laya3D._PhysicsCreateUtil) {
            Laya3D._PhysicsCreateUtil = value;
            Laya3D._enablePhysics = true;
        }
    }

    /**
     * @en Whether physics is enabled.
     * @zh 是否启用物理。
     * @returns {boolean} True if physics is enabled, false otherwise.
     * @returns {boolean} 如果启用了物理则返回true，否则返回false。
     */
    static get enablePhysics(): boolean {
        return Laya3D._enablePhysics;
    }

    /**
     *@internal
     */
    static _changeWebGLSize(width: number, height: number): void {
        RenderContext3D.clientWidth = width;
        RenderContext3D.clientHeight = height;
    }

    /**
     *@internal
     */
    static __init__() {
        Config3D._multiLighting = Config3D.enableMultiLight && LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32);
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

        VertexPositionTexture.__init__();
        PixelLineVertex.__init__();
        SubMeshInstanceBatch.__init__();
        ShaderInit3D.__init__();
        PBRMaterial.__init__();
        PBRStandardMaterial.__init__();
        SkyPanoramicMaterial.__init__();
        PrimitiveMesh.__init__();
        Sprite3D.__init__();
        RenderableSprite3D.__init__();
        MeshSprite3D.__init__();
        SkinnedMeshRenderer.__init__();
        DepthPass.__init__();
        SimpleSkinnedMeshSprite3D.__init__();
        PostProcess.__init__();
        Scene3D.__init__();
        ShadowCasterPass.__init__();
        BaseCamera.__init__();
        BaseRender.__init__();
        MeshRenderer.__init__();
        SkyRenderer.__init__();
        Camera.__init__();
        ReflectionProbe.init();
        ShadowUtils.init();
        RenderContext3D.__init__();
        BlinnPhongMaterial.__initDefine__();
        SkyProceduralMaterial.__initDefine__();
        UnlitMaterial.__initDefine__();
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
        SkyBox.__init__();
        SkyDome.__init__();
        ScreenQuad.__init__();

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
            Physics3DStatInfo.initStatisticsInfo();
            if (PlayerConfig.physics3D)
                Object.assign(Scene3D.physicsSettings, PlayerConfig.physics3D);
            return Laya3D._PhysicsCreateUtil.initialize();
        }
    }
}

(window as any).Laya3D = Laya3D;
Laya.addInitCallback(() => Laya3D.__initPhysics__());