import { Config3D } from "../../../../Config3D";
import { ILaya } from "../../../../ILaya";
import { Sprite } from "../../../display/Sprite";
import { Context } from "../../../renders/Context";
import { Texture2D } from "../../../resource/Texture2D";
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { Cluster } from "../../graphics/renderPath/Cluster";
import { PhysicsSettings } from "../../physics/PhysicsSettings";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { TextureCube } from "../../../resource/TextureCube";
import { Utils3D } from "../../utils/Utils3D";
import { BaseCamera } from "../BaseCamera";
import { Camera } from "../Camera";
import { AlternateLightQueue, LightQueue } from "../light/LightQueue";
import { RenderContext3D } from "../render/RenderContext3D";
import { Lightmap } from "./Lightmap";
import { Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../shadowMap/ShadowCasterPass";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BlitFrameBufferCMD } from "../render/command/BlitFrameBufferCMD";
import { DirectionLightCom } from "../light/DirectionLightCom";
import { Sprite3D } from "../Sprite3D";
import { PointLightCom } from "../light/PointLightCom";
import { SpotLightCom } from "../light/SpotLightCom";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { UnifromBufferData, UniformBufferParamsType } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { Prefab } from "../../../resource/HierarchyResource";
import { Stat } from "../../../utils/Stat";
import { ComponentDriver } from "../../../components/ComponentDriver";
import { LayaEnv } from "../../../../LayaEnv";
import { SceneRenderManager } from "./SceneRenderManager";
import { VolumeManager } from "../../component/Volume/VolumeManager";
import { UI3DManager } from "../UI3D/UI3DManager";
import { Scene } from "../../../display/Scene";
import { ReflectionProbe } from "../../component/Volume/reflectionProbe/ReflectionProbe";
import { AmbientMode } from "./AmbientMode";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BufferState } from "../../../webgl/utils/BufferState";
import { RenderTexture } from "../../../resource/RenderTexture";
import { Laya3D } from "../../../../Laya3D";
import { IPhysicsManager } from "../../../Physics3D/interface/IPhysicsManager";
import { LayaGL } from "../../../layagl/LayaGL";
import { IElementComponentManager } from "./IScenceComponentManager";
import { ISceneNodeData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderDataType, ShaderData, ShaderDataItem } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { CommandUniformMap } from "../../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { BaseRender } from "../render/BaseRender";
import { Viewport } from "../../../maths/Viewport";

export enum FogMode {
    Linear = 0, //Linear
    EXP = 1,    // 指数
    EXP2 = 2,   // 指数平方
}

/**
 * 用于实现3D场景。
 */
export class Scene3D extends Sprite {
    /** @internal */
    private static _lightTexture: Texture2D;
    /** @internal */
    private static _lightPixles: Float32Array;
    /** @internal */
    static _shadowCasterPass: ShadowCasterPass;
    /**@internal */
    static physicsSettings: PhysicsSettings = new PhysicsSettings();
    /**Scene3D UniformMap */
    static sceneUniformMap: CommandUniformMap;
    /** Scene UniformPropertyID */
    /** @internal */
    static FOGCOLOR: number;
    /** @internal */
    static FOGPARAMS: number;
    /** @internal */
    static DIRECTIONLIGHTCOUNT: number;
    /** @internal */
    static LIGHTBUFFER: number;
    /** @internal */
    static CLUSTERBUFFER: number;
    /** @internal */
    static SUNLIGHTDIRECTION: number;
    /** @internal */
    static SUNLIGHTDIRCOLOR: number;

    /** @internal */
    static AMBIENTCOLOR: number;

    /** @internal */
    static TIME: number;
    /**@internal */
    static GIRotate: number;
    /** @internal */
    static sceneID: number;
    /**@internal */
    static SceneUBOData: UnifromBufferData;
    /**@internal scene uniform block */
    static SCENEUNIFORMBLOCK: number;
    //------------------legacy lighting-------------------------------
    /** @internal */
    static LIGHTDIRECTION: number;
    /** @internal */
    static LIGHTDIRCOLOR: number;
    /** @internal */
    static LIGHTMODE: number;
    /** @internal */
    static POINTLIGHTPOS: number;
    /** @internal */
    static POINTLIGHTRANGE: number;
    /** @internal */
    static POINTLIGHTATTENUATION: number;
    /** @internal */
    static POINTLIGHTCOLOR: number;
    /** @internal */
    static POINTLIGHTMODE: number;
    /** @internal */
    static SPOTLIGHTPOS: number;
    /** @internal */
    static SPOTLIGHTDIRECTION: number;
    /** @internal */
    static SPOTLIGHTSPOTANGLE: number;
    /** @internal */
    static SPOTLIGHTRANGE: number;
    /** @internal */
    static SPOTLIGHTCOLOR: number;
    /** @internal */
    static SPOTLIGHTMODE: number;
    //------------------legacy lighting-------------------------------
    /**@internal */
    static mainCavansViewPort: Viewport = new Viewport(0, 0, 1, 1);
    /**场景组件管理表 */
    static componentManagerMap: Map<string, any> = new Map();

    /**
     * @internal
     * 场景更新标记
     */
    static set _updateMark(value: number) {
        RenderContext3D._instance._contextOBJ.cameraUpdateMask = value;
    }

    static get _updateMark(): number {
        return RenderContext3D._instance._contextOBJ.cameraUpdateMask;
    }

    /**
     * 注册场景内的管理器
     * @param type 管理器类型
     * @param cla 实例
     */
    static regManager(type: string, cla: any) {
        Scene3D.componentManagerMap.set(type, cla);
    }

    /**
     * init shaderData
     */
    static shaderValueInit() {
        Scene3DShaderDeclaration.SHADERDEFINE_FOG = Shader3D.getDefineByName("FOG");
        Scene3DShaderDeclaration.SHADERDEFINE_FOG_LINEAR = Shader3D.getDefineByName("FOG_LINEAR");
        Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP = Shader3D.getDefineByName("FOG_EXP");
        Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP2 = Shader3D.getDefineByName("FOG_EXP2");
        Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT = Shader3D.getDefineByName("DIRECTIONLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT = Shader3D.getDefineByName("POINTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT = Shader3D.getDefineByName("SPOTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW = Shader3D.getDefineByName("SHADOW");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE = Shader3D.getDefineByName("SHADOW_CASCADE");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW = Shader3D.getDefineByName("SHADOW_SOFT_SHADOW_LOW");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH = Shader3D.getDefineByName("SHADOW_SOFT_SHADOW_HIGH");

        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT = Shader3D.getDefineByName("SHADOW_SPOT");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW = Shader3D.getDefineByName("SHADOW_SPOT_SOFT_SHADOW_LOW");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH = Shader3D.getDefineByName("SHADOW_SPOT_SOFT_SHADOW_HIGH");

        Scene3D.FOGCOLOR = Shader3D.propertyNameToID("u_FogColor");
        Scene3D.FOGPARAMS = Shader3D.propertyNameToID("u_FogParams");//x start,y end,z Density
        Scene3D.DIRECTIONLIGHTCOUNT = Shader3D.propertyNameToID("u_DirationLightCount");
        Scene3D.LIGHTBUFFER = Shader3D.propertyNameToID("u_LightBuffer");
        Scene3D.CLUSTERBUFFER = Shader3D.propertyNameToID("u_LightClusterBuffer");
        Scene3D.TIME = Shader3D.propertyNameToID("u_Time");
        Scene3D.GIRotate = Shader3D.propertyNameToID("u_GIRotate");
        Scene3D.SCENEUNIFORMBLOCK = Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SCENE);
        let sceneUniformMap: CommandUniformMap = Scene3D.sceneUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Scene3D");
        if (Config3D._uniformBlock) {

            sceneUniformMap.addShaderBlockUniform(Scene3D.SCENEUNIFORMBLOCK, UniformBufferObject.UBONAME_SCENE, [
                {
                    id: Scene3D.TIME,
                    propertyName: "u_Time",
                    uniformtype: ShaderDataType.Float
                },
                {
                    id: Scene3D.FOGPARAMS,
                    propertyName: "u_FogParams",
                    uniformtype: ShaderDataType.Vector4
                },
                {
                    id: Scene3D.FOGCOLOR,
                    propertyName: "u_FogColor",
                    uniformtype: ShaderDataType.Vector4
                }
            ])
        } else {
            sceneUniformMap.addShaderUniform(Scene3D.FOGCOLOR, "u_FogColor", ShaderDataType.Color);
            sceneUniformMap.addShaderUniform(Scene3D.FOGPARAMS, "u_FogParams", ShaderDataType.Vector4);
            sceneUniformMap.addShaderUniform(Scene3D.TIME, "u_Time", ShaderDataType.Float);
        }

        sceneUniformMap.addShaderUniform(Scene3D.DIRECTIONLIGHTCOUNT, "u_DirationLightCount", ShaderDataType.Int);
        sceneUniformMap.addShaderUniform(Scene3D.LIGHTBUFFER, "u_LightBuffer", ShaderDataType.Texture2D);
        sceneUniformMap.addShaderUniform(Scene3D.CLUSTERBUFFER, "u_LightClusterBuffer", ShaderDataType.Texture2D);

        sceneUniformMap.addShaderUniform(Scene3D.GIRotate, "u_GIRotate", ShaderDataType.Float);
    }

    /**
     * legency ShaderData
     */
    static legacyLightingValueInit() {
        Scene3D.LIGHTDIRECTION = Shader3D.propertyNameToID("u_DirectionLight.direction");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.LIGHTDIRECTION, "u_DirectionLight.direction", ShaderDataType.Vector3);
        Scene3D.LIGHTDIRCOLOR = Shader3D.propertyNameToID("u_DirectionLight.color");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.LIGHTDIRCOLOR, "u_DirectionLight.color", ShaderDataType.Vector3);
        Scene3D.LIGHTMODE = Shader3D.propertyNameToID("u_DirectionLight.lightMode");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.LIGHTMODE, "u_DirectionLight.lightMode", ShaderDataType.Int);

        Scene3D.POINTLIGHTPOS = Shader3D.propertyNameToID("u_PointLight.position");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTPOS, "u_PointLight.position", ShaderDataType.Vector3);
        Scene3D.POINTLIGHTRANGE = Shader3D.propertyNameToID("u_PointLight.range");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTRANGE, "u_PointLight.range", ShaderDataType.Float);
        Scene3D.POINTLIGHTATTENUATION = Shader3D.propertyNameToID("u_PointLight.attenuation");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTATTENUATION, "u_PointLight.attenuation", ShaderDataType.Float);
        Scene3D.POINTLIGHTCOLOR = Shader3D.propertyNameToID("u_PointLight.color");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTCOLOR, "u_PointLight.color", ShaderDataType.Vector3);
        Scene3D.POINTLIGHTMODE = Shader3D.propertyNameToID("u_PointLight.lightMode");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTMODE, "u_PointLight.lightMode", ShaderDataType.Int);

        Scene3D.SPOTLIGHTPOS = Shader3D.propertyNameToID("u_SpotLight.position");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTPOS, "u_SpotLight.position", ShaderDataType.Vector3);
        Scene3D.SPOTLIGHTDIRECTION = Shader3D.propertyNameToID("u_SpotLight.direction");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTDIRECTION, "u_SpotLight.direction", ShaderDataType.Vector3);
        Scene3D.SPOTLIGHTSPOTANGLE = Shader3D.propertyNameToID("u_SpotLight.spot");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTSPOTANGLE, "u_SpotLight.spot", ShaderDataType.Float);
        Scene3D.SPOTLIGHTRANGE = Shader3D.propertyNameToID("u_SpotLight.range");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTRANGE, "u_SpotLight.range", ShaderDataType.Float);
        Scene3D.SPOTLIGHTCOLOR = Shader3D.propertyNameToID("u_SpotLight.color");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTCOLOR, "u_SpotLight.color", ShaderDataType.Vector3);
        Scene3D.SPOTLIGHTMODE = Shader3D.propertyNameToID("u_SpotLight.lightMode");
        Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTMODE, "u_SpotLight.lightMode", ShaderDataType.Int);
    }

    /**
     * create Scene UniformBuffer
     * @internal
     * @returns
     */
    static createSceneUniformBlock(): UnifromBufferData {
        if (!Scene3D.SceneUBOData) {
            let uniformpara: Map<string, UniformBufferParamsType> = new Map<string, UniformBufferParamsType>();
            uniformpara.set("u_Time", UniformBufferParamsType.Number);
            uniformpara.set("u_FogParams", UniformBufferParamsType.Vector4);
            uniformpara.set("u_FogColor", UniformBufferParamsType.Vector4);
            let uniformMap = new Map<number, UniformBufferParamsType>();
            uniformpara.forEach((value, key) => {
                uniformMap.set(Shader3D.propertyNameToID(key), value);
            });
            Scene3D.SceneUBOData = new UnifromBufferData(uniformMap);
        }
        return Scene3D.SceneUBOData;
    }


    /**
     * @internal
     */
    static __init__(): void {
        var multiLighting: boolean = Config3D._multiLighting;
        if (multiLighting) {
            const width = 4;
            var maxLightCount: number = Config3D.maxLightCount;
            var clusterSlices: Vector3 = Config3D.lightClusterCount;
            Cluster.instance = new Cluster(clusterSlices.x, clusterSlices.y, clusterSlices.z, Math.min(Config3D.maxLightCount, Config3D._maxAreaLightCountPerClusterAverage));
            Scene3D._lightTexture = Utils3D._createFloatTextureBuffer(width, maxLightCount);
            Scene3D._lightTexture.lock = true;
            Scene3D._lightPixles = new Float32Array(maxLightCount * width * 4);
        }
        Scene3D.shaderValueInit();
        var configShaderValue = Shader3D._configDefineValues;
        if (!Config3D._multiLighting) {
            (configShaderValue.add(Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING));
            Scene3D.legacyLightingValueInit()
        }
        Scene3D._shadowCasterPass = new ShadowCasterPass();
        //UniformBuffer
        if (Config3D._uniformBlock)
            configShaderValue.add(Shader3D.SHADERDEFINE_ENUNIFORMBLOCK);

        let supportFloatTex = LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32);
        if (supportFloatTex) {
            configShaderValue.add(Shader3D.SHADERDEFINE_FLOATTEXTURE);
        }
        let supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
        if (supportFloatLinearFiltering) {
            configShaderValue.add(Shader3D.SHADERDEFINE_FLOATTEXTURE_FIL_LINEAR);
        }
    }

    /**
     * 加载场景,注意:不缓存。
     * @param url 模板地址。
     * @param complete 完成回调。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url).then((res: Prefab) => {
            if (complete) {
                let ret: Scene3D;
                if (res) {
                    let scene = res.create();
                    if (scene instanceof Scene)
                        ret = scene._scene3D;
                    else
                        ret = <Scene3D>scene;
                }
                complete.runWith([ret]);
            }
        });
    }

    /**@internal ide配置文件使用 */
    _reflectionsSource: number = 0;
    /**@internal ide配置文件使用 */
    _reflectionsResolution: string = "256";
    /**@internal ide配置文件使用 */
    _reflectionsIblSamples = 128;



    /** @internal */
    private _group: string;
    /** @internal */
    public _lightCount: number = 0;
    /** @internal */
    public _pointLights: LightQueue<PointLightCom> = new LightQueue();
    /** @internal */
    public _spotLights: LightQueue<SpotLightCom> = new LightQueue();
    /** @internal */
    public _directionLights: LightQueue<DirectionLightCom> = new LightQueue();
    /** @internal */
    public _alternateLights: AlternateLightQueue = new AlternateLightQueue();
    /** @internal */
    private _lightmaps: Lightmap[] = [];
    /** @internal */
    private _skyRenderer: SkyRenderer = new SkyRenderer();
    /** @internal */
    private _enableFog: boolean;
    /** @internal */
    private _timer: Timer;
    /** @internal */
    private _time: number = 0;
    /** @internal */
    private _fogParams: Vector4;
    /** @internal */
    private _fogMode: FogMode;
    /**@internal */
    private _sceneReflectionProb: ReflectionProbe;
    /**@internal */
    private _physicsStepTime: number = 0;
    /**@internal */
    _sunColor: Color = new Color(1.0, 1.0, 1.0);
    /**@interanl */
    _sundir: Vector3 = new Vector3();
    /**@internal*/
    _id = Scene3D.sceneID++;
    /** @internal */
    _mainDirectionLight: DirectionLightCom;
    /** @internal */
    _mainSpotLight: SpotLightCom;
    /** @internal */
    _mainPointLight: PointLightCom;//TODO
    /** @internal */
    _physicsManager: IPhysicsManager;
    /** @internal 只读,不允许修改。*/
    _collsionTestList: number[] = [];
    /** @internal */
    _shaderValues: ShaderData;
    /** @interanl */
    _sceneUniformData: UnifromBufferData;
    /** @internal */
    _sceneUniformObj: UniformBufferObject;
    /** @internal */
    _key: SubmitKey = new SubmitKey();
    /** @internal */
    _cameraPool: BaseCamera[] = [];

    /** @internal */
    _volumeManager: VolumeManager;
    /**@internal */
    _UI3DManager: UI3DManager = new UI3DManager();
    /**@internal */
    _sceneRenderManager: SceneRenderManager;
    /** 当前创建精灵所属遮罩层。*/
    currentCreationLayer: number = Math.pow(2, 0);
    /** 是否启用灯光。*/
    enableLight: boolean = true;
    /**lightShadowMap 更新频率 @internal */
    _ShadowMapupdateFrequency: number = 1;
    /** @internal */
    _nativeObj: any;

    /** @internal 由IDE负责调用渲染 */
    _renderByEditor: boolean;
    /** @internal */
    _scene2D: Scene;
    /** @internal */
    _sceneModuleData: ISceneNodeData;
    /** @internal */
    componentElementMap: Map<string, IElementComponentManager> = new Map();

    /** @internal */
    private _componentElementDatasMap: any = {};
    /**
     * Scene3D所属的2D场景，使用IDE编辑的场景载入后具有此属性。
     */
    get scene2D(): Scene {
        return this._scene2D;
    }

    /**
     * set SceneRenderableManager
     */
    set sceneRenderableManager(manager: SceneRenderManager) {
        manager.list = this._sceneRenderManager.list;
        this._sceneRenderManager = manager;
    }

    get sceneRenderableManager(): SceneRenderManager {
        return this._sceneRenderManager;
    }

    /**
     * 是否允许雾化。
     */
    get enableFog(): boolean {
        return this._enableFog;
    }

    set enableFog(value: boolean) {
        if (this._enableFog !== value) {
            this._enableFog = value;
            if (value) {
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
            } else
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
        }
    }

    /**
     * 场景雾模式
     */
    get fogMode(): FogMode {
        return this._fogMode;
    }

    set fogMode(value: FogMode) {
        this._fogMode = value;
        switch (value) {
            case FogMode.Linear:
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_LINEAR);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP2);
                break;
            case FogMode.EXP:
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_LINEAR);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP2);
                break;
            case FogMode.EXP2:
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP2);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_LINEAR);
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG_EXP);
                break;
        }
    }

    /**
     * 雾化颜色。
     */
    get fogColor(): Color {
        return this._shaderValues.getColor(Scene3D.FOGCOLOR);
    }

    set fogColor(value: Color) {
        this._shaderValues.setColor(Scene3D.FOGCOLOR, value);
    }

    /**
     * 雾化起始位置。
     */
    get fogStart(): number {
        return this._fogParams.x;

    }

    set fogStart(value: number) {
        this._fogParams.x = value;
        this.fogParams = this._fogParams;
    }

    /**
     * 雾化end范围。
     */
    get fogEnd(): number {
        return this._fogParams.y;
    }

    set fogEnd(value: number) {
        this._fogParams.y = value;
        this.fogParams = this._fogParams;
    }


    /**
     * 雾化密度
     */
    get fogDensity(): number {
        return this._fogParams.z
    }

    set fogDensity(value: number) {
        this._fogParams.z = value;
        this.fogParams = this._fogParams;
    }

    /**@internal 雾效参数*/
    get fogParams(): Vector4 {
        return this._shaderValues.getVector(Scene3D.FOGPARAMS);
    }

    set fogParams(value: Vector4) {
        this._shaderValues.setVector(Scene3D.FOGPARAMS, value);
    }

    /**
     * 0-2PI
     */
    set GIRotate(value: number) {
        this._shaderValues.setNumber(Scene3D.GIRotate, value);
    }

    get GIRotate() {
        return this._shaderValues.getNumber(Scene3D.GIRotate);
    }

    /**
     * 环境光模式。
     * 如果值为AmbientMode.SolidColor一般使用ambientColor作为环境光源，如果值为如果值为AmbientMode.SphericalHarmonics一般使用ambientSphericalHarmonics作为环境光源。
     */
    get ambientMode(): AmbientMode {
        return this._sceneReflectionProb.ambientMode;
    }

    set ambientMode(value: AmbientMode) {
        this._sceneReflectionProb.ambientMode = value;
    }

    /**
     * 场景反射探针
     */
    get sceneReflectionProb(): ReflectionProbe {
        return this._sceneReflectionProb;
    }

    /**
     * @internal
     */
    set sceneReflectionProb(value: ReflectionProbe) {
        this._sceneReflectionProb = value;
    }

    /**
     * 固定颜色环境光。
     */
    get ambientColor(): Color {
        return this._sceneReflectionProb.ambientColor;
    }

    set ambientColor(value: Color) {
        this._sceneReflectionProb.ambientColor = value;
    }


    /**
     * 设置环境漫反射的强度
     */
    get ambientIntensity(): number {
        return this._sceneReflectionProb.ambientIntensity;
    }

    set ambientIntensity(value: number) {
        this._sceneReflectionProb.ambientIntensity = value;
    }

    /**
     * 设置反射探针强度
     */
    get reflectionIntensity(): number {
        return this._sceneReflectionProb.reflectionIntensity;
    }

    set reflectionIntensity(value: number) {
        this._sceneReflectionProb.reflectionIntensity = value;
    }

    /**
     * ambient sh
     */
    public get ambientSH(): Float32Array {
        return this._sceneReflectionProb.ambientSH;
    }
    public set ambientSH(value: Float32Array) {
        this._sceneReflectionProb.ambientSH = value;
    }
    /**
     * ambient iblTexture
     */
    public get iblTex(): TextureCube {
        return this._sceneReflectionProb.iblTex;

    }
    public set iblTex(value: TextureCube) {
        this._sceneReflectionProb.iblTex = value
    }

    /**
     * ambient rgbd compress
     */
    public get iblTexRGBD(): boolean {
        return this._sceneReflectionProb.iblTexRGBD;
    }
    public set iblTexRGBD(value: boolean) {
        this._sceneReflectionProb.iblTexRGBD = value;
    }

    /**
     * 天空渲染器。
     */
    get skyRenderer(): SkyRenderer {
        return this._skyRenderer;
    }

    /**
     * 物理模拟器。
     */
    get physicsSimulation(): IPhysicsManager {
        return this._physicsManager;
    }

    /**
     * 场景时钟。
     * @override
     */
    get timer(): Timer {
        return this._timer;
    }

    set timer(value: Timer) {
        this._timer = value;
    }

    /**
     * 光照贴图数组,返回值为浅拷贝数组。
     */
    get lightmaps(): Lightmap[] {
        return this._lightmaps.slice();
    }

    set lightmaps(value: Lightmap[]) {
        var maps: Lightmap[] = this._lightmaps;
        if (maps) {
            for (var i: number = 0, n: number = maps.length; i < n; i++) {
                var map: Lightmap = maps[i];
                map.lightmapColor && map.lightmapColor._removeReference();
                map.lightmapDirection && map.lightmapDirection._removeReference();
            }
        }
        if (value) {
            var count: number = value.length;
            maps.length = count;
            for (i = 0; i < count; i++) {
                var map: Lightmap = value[i];
                map.lightmapColor && map.lightmapColor._addReference();
                map.lightmapDirection && map.lightmapDirection._addReference();
                maps[i] = map;
            }
        } else {
            maps.length = 0;
        }
        this._sceneModuleData.lightmapDirtyFlag = Scene3D._updateMark

    }

    /**
     * 阴影图更新频率（如果无自阴影，可以加大频率优化性能）
     */
    get shadowMapFrequency() {
        return this._ShadowMapupdateFrequency;
    }

    set shadowMapFrequency(value: number) {
        this._ShadowMapupdateFrequency = value;
    }


    /**
     * 创建一个 <code>Scene3D</code> 实例。
     */
    constructor() {
        super();

        this._is3D = true;
        this._componentDriver = new ComponentDriver();
        this._timer = ILaya.timer;
        this._sceneModuleData = Laya3DRender.Render3DModuleDataFactory.createSceneModuleData();
        if (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() != 2) {
            this._nativeObj = new (window as any).conchSubmitScene3D(this.renderSubmit.bind(this));
        }
        if (Laya3D.enablePhysics)
            this._physicsManager = Laya3D.PhysicsCreateUtil.createPhysicsManger(Scene3D.physicsSettings);

        this._shaderValues = LayaGL.renderDeviceFactory.createShaderData(null);
        this._shaderValues.addDefines(Shader3D._configDefineValues);
        if (Config3D._uniformBlock) {
            //SceneUniformBlock
            this._sceneUniformObj = UniformBufferObject.getBuffer(UniformBufferObject.UBONAME_SCENE, 0);
            this._sceneUniformData = Scene3D.createSceneUniformBlock();
            if (!this._sceneUniformObj) {
                this._sceneUniformObj = UniformBufferObject.create(UniformBufferObject.UBONAME_SCENE, BufferUsage.Dynamic, this._sceneUniformData.getbyteLength(), true);
            }
            this._shaderValues._addCheckUBO(UniformBufferObject.UBONAME_SCENE, this._sceneUniformObj, this._sceneUniformData);
            this._shaderValues.setUniformBuffer(Scene3D.SCENEUNIFORMBLOCK, this._sceneUniformObj);
            //ShadowUniformBlock
            //Scene3D._shadowCasterPass
            this._shaderValues._addCheckUBO(UniformBufferObject.UBONAME_SHADOW, Scene3D._shadowCasterPass._castDepthBufferOBJ, Scene3D._shadowCasterPass._castDepthBufferData);
            this._shaderValues.setUniformBuffer(Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SHADOW), Scene3D._shadowCasterPass._castDepthBufferOBJ);
        }
        this._fogParams = new Vector4(300, 1000, 0.01, 0);
        this.enableFog = false;
        this.fogStart = 300;
        this.fogEnd = 1000;
        this.fogDensity = 0.01;
        this.fogColor = new Color(0.7, 0.7, 0.7);
        this.fogMode = FogMode.Linear;
        this.GIRotate = 0;

        this._scene = this;
        this._sceneRenderManager = new SceneRenderManager();

        if (Config3D.debugFrustumCulling) {
        }

        this._volumeManager = new VolumeManager();
        this._UI3DManager = new UI3DManager();
        this.sceneReflectionProb = this._volumeManager.reflectionProbeManager.sceneReflectionProbe;

        this._sceneReflectionProb.reflectionIntensity = 1.0;
        this.ambientColor = new Color(0.212, 0.227, 0.259);

        Scene3D.componentManagerMap.forEach((val, key) => {
            let cla: any = val;
            this.componentElementMap.set(key, new cla());
        });
    }

    /**
   * @internal
   */
    set componentElementDatasMap(value: any) {
        this._componentElementDatasMap = value;
        this.componentElementMap.forEach((value, key) => {
            value.Init(this._componentElementDatasMap[key])
        });
    }

    get componentElementDatasMap(): any {
        return this._componentElementDatasMap;
    }

    /**
     *@internal
     */
    _update(): void {
        var delta: number = this.timer._delta / 1000;
        this._time += delta;
        this._shaderValues.setNumber(Scene3D.TIME, this._time);
        //Physics
        if (LayaEnv.isPlaying) {
            this._physicsStepTime += delta;
            if (this._physicsStepTime > Scene3D.physicsSettings.fixedTimeStep) {

                let physicsManager = this._physicsManager;
                if (Laya3D.enablePhysics && Stat.enablePhysicsUpdate) {
                    physicsManager.update(this._physicsStepTime);
                }
                this._physicsStepTime = 0;
            }
        }
        if (this._volumeManager.needreCaculateAllRenderObjects())
            this._volumeManager.reCaculateAllRenderObjects(this._sceneRenderManager.list);
        else
            this._volumeManager.handleMotionlist();

        this.componentElementMap.forEach((value) => {
            value.update(delta);
        });
        this._componentDriver.callStart();
        this._componentDriver.callUpdate();

        this._componentDriver.callLateUpdate();
        this._componentDriver.callDestroy();

        //this._sceneRenderManager.updateMotionObjects();
        this._sceneRenderManager.renderUpdate();
        this.skyRenderer.renderUpdate(RenderContext3D._instance);
        if (!this._renderByEditor)
            this._UI3DManager.update();
    }

    /**
     * @internal
     */
    private _binarySearchIndexInCameraPool(camera: BaseCamera): number {
        var start: number = 0;
        var end: number = this._cameraPool.length - 1;
        var mid: number;
        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            var midValue: number = this._cameraPool[mid]._renderingOrder;
            if (midValue == camera._renderingOrder)
                return mid;
            else if (midValue > camera._renderingOrder)
                end = mid - 1;
            else
                start = mid + 1;
        }
        return start;
    }

    /**
     * @internal
     */
    _getGroup(): string {
        return this._group;
    }

    /**
     * @internal
     */
    _setGroup(value: string): void {
        this._group = value;
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onActive(): void {
        super._onActive();
        ILaya.stage._scene3Ds.push(this);
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onInActive(): void {
        super._onInActive();
        var scenes: any[] = ILaya.stage._scene3Ds;
        scenes.splice(scenes.indexOf(this), 1);
    }

    /**
     * @internal
     */
    private _prepareSceneToRender(): void {
        var shaderValues: ShaderData = this._shaderValues;
        var multiLighting: boolean = Config3D._multiLighting && Stat.enableMulLight;
        if (multiLighting) {
            var ligTex: Texture2D = Scene3D._lightTexture;
            var ligPix: Float32Array = Scene3D._lightPixles;
            const pixelWidth: number = ligTex.width;
            const floatWidth: number = pixelWidth * 4;
            var curCount: number = 0;
            var dirCount: number = Stat.enableLight ? this._directionLights._length : 0;
            var dirElements: DirectionLightCom[] = this._directionLights._elements;
            if (dirCount > 0) {
                var sunLightIndex: number = this._directionLights.getBrightestLight();//get the brightest light as sun
                this._mainDirectionLight = dirElements[sunLightIndex];
                this._directionLights.normalLightOrdering(sunLightIndex);
                for (var i: number = 0; i < dirCount; i++, curCount++) {
                    var dirLight: DirectionLightCom = dirElements[i];
                    var dir: Vector3 = dirLight.direction;
                    var intCor: Vector3 = dirLight._intensityColor;
                    var off: number = floatWidth * curCount;
                    intCor.x = Color.gammaToLinearSpace(dirLight.color.r);
                    intCor.y = Color.gammaToLinearSpace(dirLight.color.g);
                    intCor.z = Color.gammaToLinearSpace(dirLight.color.b);
                    Vector3.scale(intCor, dirLight._intensity, intCor);
                    (dirLight.owner as Sprite3D).transform.worldMatrix.getForward(dir);
                    Vector3.normalize(dir, dir);//矩阵有缩放时需要归一化
                    ligPix[off] = intCor.x;
                    ligPix[off + 1] = intCor.y;
                    ligPix[off + 2] = intCor.z;
                    ligPix[off + 3] = dirLight._lightmapBakedType;//0: MIX  1:REALTIME
                    ligPix[off + 4] = dir.x;
                    ligPix[off + 5] = dir.y;
                    ligPix[off + 6] = dir.z;
                    // if (i == 0) {
                    // 	this._setShaderValue(Scene3D.SUNLIGHTDIRCOLOR, intCor);
                    // 	this._setShaderValue(Scene3D.SUNLIGHTDIRECTION, dir);
                    // }
                    if (i == 0) {
                        this._sunColor = dirLight.color;
                        this._sundir = dir;
                    }
                }
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
                this._mainDirectionLight = null;
            }

            var poiCount: number = Stat.enableLight ? this._pointLights._length : 0;
            if (poiCount > 0) {
                var poiElements: PointLightCom[] = this._pointLights._elements;
                var mainPointLightIndex: number = this._pointLights.getBrightestLight();
                this._mainPointLight = poiElements[mainPointLightIndex];
                this._pointLights.normalLightOrdering(mainPointLightIndex);
                for (var i: number = 0; i < poiCount; i++, curCount++) {
                    var poiLight: PointLightCom = poiElements[i];
                    var pos: Vector3 = (poiLight.owner as Sprite3D).transform.position;
                    var intCor: Vector3 = poiLight._intensityColor;
                    var off: number = floatWidth * curCount;
                    intCor.x = Color.gammaToLinearSpace(poiLight.color.r);
                    intCor.y = Color.gammaToLinearSpace(poiLight.color.g);
                    intCor.z = Color.gammaToLinearSpace(poiLight.color.b);
                    Vector3.scale(intCor, poiLight._intensity, intCor);
                    ligPix[off] = intCor.x;
                    ligPix[off + 1] = intCor.y;
                    ligPix[off + 2] = intCor.z;
                    ligPix[off + 3] = poiLight.range;
                    ligPix[off + 4] = pos.x;
                    ligPix[off + 5] = pos.y;
                    ligPix[off + 6] = pos.z;
                    ligPix[off + 7] = poiLight._lightmapBakedType;//0: MIX  1:REALTIME
                }
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
                this._mainPointLight = null;
            }

            var spoCount: number = Stat.enableLight ? this._spotLights._length : 0;
            if (spoCount > 0) {
                var spoElements: SpotLightCom[] = this._spotLights._elements;
                var mainSpotLightIndex: number = this._spotLights.getBrightestLight();
                this._mainSpotLight = spoElements[mainSpotLightIndex];
                this._spotLights.normalLightOrdering(mainSpotLightIndex)
                for (var i: number = 0; i < spoCount; i++, curCount++) {
                    var spoLight: SpotLightCom = spoElements[i];
                    var dir: Vector3 = spoLight.direction;
                    var pos: Vector3 = (spoLight.owner as Sprite3D).transform.position;
                    var intCor: Vector3 = spoLight._intensityColor;
                    var off: number = floatWidth * curCount;
                    intCor.x = Color.gammaToLinearSpace(spoLight.color.r);
                    intCor.y = Color.gammaToLinearSpace(spoLight.color.g);
                    intCor.z = Color.gammaToLinearSpace(spoLight.color.b);
                    Vector3.scale(intCor, spoLight._intensity, intCor);
                    (spoLight.owner as Sprite3D).transform.worldMatrix.getForward(dir);
                    Vector3.normalize(dir, dir);
                    ligPix[off] = intCor.x;
                    ligPix[off + 1] = intCor.y;
                    ligPix[off + 2] = intCor.z;
                    ligPix[off + 3] = spoLight.range;
                    ligPix[off + 4] = pos.x;
                    ligPix[off + 5] = pos.y;
                    ligPix[off + 6] = pos.z;
                    ligPix[off + 7] = spoLight.spotAngle * Math.PI / 180;
                    ligPix[off + 8] = dir.x;
                    ligPix[off + 9] = dir.y;
                    ligPix[off + 10] = dir.z;
                    ligPix[off + 11] = spoLight._lightmapBakedType;//0: MIX  1:REALTIME
                }
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
                this._mainSpotLight = null;
            }

            (curCount > 0) && (ligTex.setSubPixelsData(0, 0, pixelWidth, curCount, ligPix, 0, false, false, false));
            shaderValues.setTexture(Scene3D.LIGHTBUFFER, ligTex);
            shaderValues.setInt(Scene3D.DIRECTIONLIGHTCOUNT, this._directionLights._length);
            shaderValues.setTexture(Scene3D.CLUSTERBUFFER, Cluster.instance._clusterTexture);
        }
        else {
            if (!Scene3D.LIGHTDIRECTION)//需要更新一下
                Scene3D.legacyLightingValueInit();
            if (this._directionLights._length > 0 && Stat.enableLight) {
                var dirLight: DirectionLightCom = this._directionLights._elements[0];
                this._mainDirectionLight = dirLight;
                dirLight._intensityColor.x = Color.gammaToLinearSpace(dirLight.color.r);
                dirLight._intensityColor.y = Color.gammaToLinearSpace(dirLight.color.g);
                dirLight._intensityColor.z = Color.gammaToLinearSpace(dirLight.color.b);
                Vector3.scale(dirLight._intensityColor, dirLight._intensity, dirLight._intensityColor);

                (dirLight.owner as Sprite3D).transform.worldMatrix.getForward(dirLight.direction);
                Vector3.normalize(dirLight.direction, dirLight.direction);
                shaderValues.setVector3(Scene3D.LIGHTDIRCOLOR, dirLight._intensityColor);
                shaderValues.setVector3(Scene3D.LIGHTDIRECTION, dirLight.direction);
                shaderValues.setInt(Scene3D.LIGHTMODE, dirLight._lightmapBakedType);
                if (i == 0) {
                    this._sunColor = dirLight.color;
                    this._sundir = dirLight.direction;
                }
                // this._setShaderValue(Scene3D.SUNLIGHTDIRCOLOR, dirLight._intensityColor);
                // this._setShaderValue(Scene3D.SUNLIGHTDIRECTION, dirLight._direction);
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
            }
            if (this._pointLights._length > 0 && Stat.enableLight) {
                var poiLight: PointLightCom = this._pointLights._elements[0];
                this._mainPointLight = poiLight;
                poiLight._intensityColor.x = Color.gammaToLinearSpace(poiLight.color.r);
                poiLight._intensityColor.y = Color.gammaToLinearSpace(poiLight.color.g);
                poiLight._intensityColor.z = Color.gammaToLinearSpace(poiLight.color.b);
                Vector3.scale(poiLight._intensityColor, poiLight._intensity, poiLight._intensityColor);
                shaderValues.setVector3(Scene3D.POINTLIGHTCOLOR, poiLight._intensityColor);
                shaderValues.setVector3(Scene3D.POINTLIGHTPOS, (poiLight.owner as Sprite3D).transform.position);
                shaderValues.setNumber(Scene3D.POINTLIGHTRANGE, poiLight.range);
                shaderValues.setInt(Scene3D.POINTLIGHTMODE, poiLight._lightmapBakedType);
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
            }
            if (this._spotLights._length > 0 && Stat.enableLight) {
                var spotLight: SpotLightCom = this._spotLights._elements[0];
                this._mainSpotLight = spotLight;
                spotLight._intensityColor.x = Color.gammaToLinearSpace(spotLight.color.r);
                spotLight._intensityColor.y = Color.gammaToLinearSpace(spotLight.color.g);
                spotLight._intensityColor.z = Color.gammaToLinearSpace(spotLight.color.b);
                Vector3.scale(spotLight._intensityColor, spotLight._intensity, spotLight._intensityColor);
                shaderValues.setVector3(Scene3D.SPOTLIGHTCOLOR, spotLight._intensityColor);
                shaderValues.setVector3(Scene3D.SPOTLIGHTPOS, (spotLight.owner as Sprite3D).transform.position);
                (spotLight.owner as Sprite3D).transform.worldMatrix.getForward(spotLight.direction);
                Vector3.normalize(spotLight.direction, spotLight.direction);
                shaderValues.setVector3(Scene3D.SPOTLIGHTDIRECTION, spotLight.direction);
                shaderValues.setNumber(Scene3D.SPOTLIGHTRANGE, spotLight.range);
                shaderValues.setNumber(Scene3D.SPOTLIGHTSPOTANGLE, spotLight.spotAngle * Math.PI / 180);
                shaderValues.setInt(Scene3D.SPOTLIGHTMODE, spotLight._lightmapBakedType);
                shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
            }
            else {
                shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
            }
        }
    }

    private _cullInfoCamera: Camera;

    /**
     * 获取cullCamera
     */
    get cullInfoCamera(): Camera {
        return this._cullInfoCamera;
    }
    /**
     * @internal
     * scence外的Camera渲染场景,需要设置这个接口
     * @param camera
     */
    _setCullCamera(camera: Camera) {
        this._cullInfoCamera = camera;
    }

    /**
     * 重新计算CullCamera
     */
    recaculateCullCamera() {
        this._cullInfoCamera = this._cameraPool[0] as Camera;
        this._cameraPool.forEach(element => {
            if (this.cullInfoCamera.maxlocalYDistance < (element as Camera).maxlocalYDistance) {
                this._cullInfoCamera = element as Camera;
            }
        });
    }


    /**
     * @internal
     */
    _addCamera(camera: BaseCamera): void {
        var index: number = this._binarySearchIndexInCameraPool(camera);
        var order: number = camera._renderingOrder;
        var count: number = this._cameraPool.length;
        while (index < count && this._cameraPool[index]._renderingOrder <= order)
            index++;
        this._cameraPool.splice(index, 0, camera);
    }

    /**
     * @internal
     */
    _removeCamera(camera: BaseCamera): void {
        this._cameraPool.splice(this._cameraPool.indexOf(camera), 1);
    }

    /**
     * @internal
     */
    _addRenderObject(render: BaseRender): void {
        this._sceneRenderManager.addRenderObject(render);
        render._addReflectionProbeUpdate();
    }

    /**
     * @internal
     */
    _removeRenderObject(render: BaseRender): void {
        this._sceneRenderManager.removeRenderObject(render);
    }

    /**
     * 
     * @inheritDoc
     * @override
     * 删除资源
     * @param destroyChild 是否删除子节点
     */
    destroy(destroyChild: boolean = true): void {
        if (this._destroyed)
            return;
        super.destroy(destroyChild);
        this._nativeObj = null;
        this._skyRenderer.destroy();
        this._skyRenderer = null;
        this._directionLights = null;
        this._pointLights = null;
        this._spotLights = null;
        this._alternateLights = null;
        this._shaderValues.destroy();
        (RenderContext3D._instance.scene == this) && (RenderContext3D._instance.scene = null);
        this._shaderValues = null;
        this.sceneRenderableManager.destroy();
        this._sceneRenderManager = null
        this._cameraPool = null;
        // this._octree = null;
        this._physicsManager && this._physicsManager.destroy();
        // this._reflection._removeReference();
        // this._reflection = null;
        var maps: Lightmap[] = this._lightmaps;
        if (maps) {
            for (var i: number = 0, n: number = maps.length; i < n; i++) {
                var map: Lightmap = maps[i];
                map.lightmapColor && map.lightmapColor._removeReference();
                map.lightmapDirection && map.lightmapDirection._removeReference();
            }
        }
        //this._sceneUniformData.destroy();
        this._lightmaps = null;
        this._volumeManager.destroy();
        this._componentDriver.callDestroy();

    }

    /**
     * 获得某个组件的管理器
     * @param type 组件管理类
     */
    getComponentElementManager(type: string) {
        return this.componentElementMap.get(type);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    render(ctx: Context): void {
        return;//3d的render由外面直接调rendersubmit
        if (this._children.length > 0) {
            //temp
            ctx.drawLeftData();
            this.renderSubmit();
        }
    }

    /**
     * 渲染入口
     */
    renderSubmit(): void {
        if (this._children.length <= 0) return;

        if (this._renderByEditor) return;
        //BufferState._curBindedBufferState && BufferState._curBindedBufferState.unBind();
        this._prepareSceneToRender();
        var i: number, n: number, n1: number;
        Scene3D._updateMark++;
        for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
            var camera: Camera = (<Camera>this._cameraPool[i]);
            if (camera.enableRender && camera.activeInHierarchy) {

                if (camera.renderTarget) {
                    camera.enableBuiltInRenderTexture ||= false;
                }
                else {
                    camera.enableBuiltInRenderTexture ||= true;
                }

                camera.render(this);

                if (!camera._offScreenRenderTexture) {
                    this.blitMainCanvans(camera._internalRenderTexture, camera.normalizedViewport, camera);
                }

                if (!camera._cacheDepth) {
                    camera._needInternalRenderTexture() && (!camera._internalRenderTexture._inPool) && RenderTexture.recoverToPool(camera._internalRenderTexture);
                }
            }
        }
        Context.set2DRenderConfig();//还原2D配置
        RenderTexture.clearPool();
    }

    /**
     * @internal
     * @param source
     * @param normalizeViewPort
     * @param camera
     * @returns
     */
    blitMainCanvans(source: BaseTexture, normalizeViewPort: Viewport, camera: Camera) {
        if (!source)
            return;
        Scene3D.mainCavansViewPort.x = RenderContext3D.clientWidth * normalizeViewPort.x | 0;
        Scene3D.mainCavansViewPort.y = RenderContext3D.clientHeight * normalizeViewPort.y | 0;
        Scene3D.mainCavansViewPort.width = RenderContext3D.clientWidth * normalizeViewPort.width | 0;
        Scene3D.mainCavansViewPort.height = RenderContext3D.clientHeight * normalizeViewPort.height | 0;
        source.filterMode = FilterMode.Bilinear;
        if (camera.fxaa)
            BlitFrameBufferCMD.shaderdata.addDefine(BaseCamera.SHADERDEFINE_FXAA);
        var cmd = BlitFrameBufferCMD.create(source, null, Scene3D.mainCavansViewPort, null, null, BlitFrameBufferCMD.shaderdata);
        cmd.run();
        cmd.recover();
        RenderTexture2D._clear = false;
        BlitFrameBufferCMD.shaderdata.removeDefine(BaseCamera.SHADERDEFINE_FXAA);
    }

    /**
     * @internal
     */
    reUse(context: Context, pos: number): number {
        return 0;
    }

    /**
     * 设置全局渲染数据
     * @param name 数据对应着色器名字
     * @param shaderDataType 渲染数据类型
     * @param value 渲染数据值
     */
    setGlobalShaderValue(name: string, type: ShaderDataType, value: ShaderDataItem) {
        var shaderOffset = Shader3D.propertyNameToID(name);
        this._shaderValues.setShaderData(shaderOffset, type, value);
    }
    //--------------------------------------------------------deprecated------------------------------------------------------------------------

    /**
     * @deprecated
     * 雾效范围
     */
    get fogRange(): number {
        return this._fogParams.y - this.fogParams.x;
    }

    set fogRange(value: number) {
        this._fogParams.y = value + this.fogParams.x;
        this.fogParams = this._fogParams;
    }

    /**
     * @deprecated
     * 设置光照贴图。
     * @param value 光照贴图。
     */
    setlightmaps(value: Texture2D[]): void {
        var maps: Lightmap[] = this._lightmaps;
        for (var i: number = 0, n: number = maps.length; i < n; i++)
            maps[i].lightmapColor._removeReference();
        if (value) {
            var count: number = value.length;
            maps.length = count;
            for (i = 0; i < count; i++) {
                var lightMap: Texture2D = value[i];
                lightMap._addReference();
                (maps[i]) || (maps[i] = new Lightmap());
                maps[i].lightmapColor = lightMap;
            }
        } else {
            throw new Error("Scene3D: value value can't be null.");
        }
    }

    /**
     * @deprecated
     * 获取光照贴图浅拷贝列表。
     * @return 获取光照贴图浅拷贝列表。
     */
    getlightmaps(): Texture2D[] {
        var lightmapColors: Texture2D[] = new Array(this._lightmaps.length);
        for (var i: number = 0; i < this._lightmaps.length; i++) {
            lightmapColors[i] = this._lightmaps[i].lightmapColor;
        }
        return lightmapColors;//slice()防止修改数组内容
    }
}
