import { Config3D } from "../../../../Config3D";
import { ILaya } from "../../../../ILaya";
import { Sprite } from "../../../display/Sprite";
import { LayaGL } from "../../../layagl/LayaGL";
import { Loader } from "../../../net/Loader";
import { Render } from "../../../renders/Render";
import { Context } from "../../../resource/Context";
import { Texture2D } from "../../../resource/Texture2D";
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { ISubmit } from "../../../webgl/submit/ISubmit";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { Cluster } from "../../graphics/renderPath/Cluster";
import { SphericalHarmonicsL2, SphericalHarmonicsL2Generater } from "../../graphics/SphericalHarmonicsL2";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Viewport } from "../../math/Viewport";
import { PhysicsComponent } from "../../physics/PhysicsComponent";
import { PhysicsSettings } from "../../physics/PhysicsSettings";
import { PhysicsSimulation } from "../../physics/PhysicsSimulation";
import { SkyBox } from "../../resource/models/SkyBox";
import { SkyDome } from "../../resource/models/SkyDome";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { TextureCube } from "../../resource/TextureCube";
import { Utils3D } from "../../utils/Utils3D";
import { BaseCamera } from "../BaseCamera";
import { Camera, CameraClearFlags } from "../Camera";
import { AlternateLightQueue, LightQueue } from "../light/LightQueue";
import { Material } from "../material/Material";
import { PBRMaterial } from "../material/PBRMaterial";
import { PBRRenderQuality } from "../material/PBRRenderQuality";
import { RenderState } from "../material/RenderState";
import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { Lightmap } from "./Lightmap";
import { CommandUniformMap, Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../shadowMap/ShadowCasterPass";
import { StaticBatchManager } from "../../graphics/StaticBatchManager";
import { DynamicBatchManager } from "../../graphics/DynamicBatchManager";
import { CannonPhysicsSimulation } from "../../physicsCannon/CannonPhysicsSimulation";
import { CannonPhysicsSettings } from "../../physicsCannon/CannonPhysicsSettings";
import { CannonPhysicsComponent } from "../../physicsCannon/CannonPhysicsComponent";
import { ReflectionProbeManager } from "../reflectionProbe/ReflectionProbeManager";
import { Physics3D } from "../../Physics3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BlitFrameBufferCMD } from "../render/command/BlitFrameBufferCMD";
import { ComponentManager } from "../../component/ComponentManager";
import { DirectionLightCom } from "../light/DirectionLightCom";
import { Sprite3D } from "../Sprite3D";
import { PointLightCom } from "../light/PointLightCom";
import { SpotLightCom } from "../light/SpotLightCom";
import { RenderTexture } from "../../resource/RenderTexture";
import { TextureDecodeFormat } from "../../../RenderEngine/RenderEnum/TextureDecodeFormat";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { UnifromBufferData, UniformBufferParamsType } from "../../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { BaseRenderQueue } from "../../../RenderEngine/RenderObj/BaseRenderQueue";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { ICullPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { IShadowCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { WebGL } from "../../../webgl/WebGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { BufferState } from "../BufferState";
import { Color } from "../../math/Color";

/**
 * 环境光模式
 */
export enum AmbientMode {
	/** 固定颜色。*/
	SolidColor,
	/** 球谐光照, 通过天空盒生成的球谐数据。 */
	SphericalHarmonics,
	/** 分别设置天空, 地平线, 地面的环境光颜色 */
	TripleColor
}

/**
 * 用于实现3D场景。
 */
export class Scene3D extends Sprite implements ISubmit {
	/** @internal */
	private static _lightTexture: Texture2D;
	/** @internal */
	private static _lightPixles: Float32Array;
	/** @internal */
	static _shadowCasterPass: ShadowCasterPass;
	/**@internal */
	static physicsSettings: PhysicsSettings;
	/**@internal */
	static cannonPhysicsSettings: CannonPhysicsSettings;
	/** 是否开启八叉树裁剪。*/
	static octreeCulling: boolean = false;
	/** 八叉树初始化尺寸。*/
	static octreeInitialSize: number = 64.0;
	/** 八叉树初始化中心。*/
	static octreeInitialCenter: Vector3 = new Vector3(0, 0, 0);
	/** 八叉树最小尺寸。*/
	static octreeMinNodeSize: number = 2.0;
	/** 八叉树松散值。*/
	static octreeLooseness: number = 1.25;
	/** reflection mode */
	static REFLECTIONMODE_SKYBOX: number = 0;
	static REFLECTIONMODE_CUSTOM: number = 1;
	/** RenderQueue mode */
	static SCENERENDERFLAG_RENDERQPAQUE = 0;
	static SCENERENDERFLAG_SKYBOX = 1;
	static SCENERENDERFLAG_RENDERTRANSPARENT = 2;
	/**Scene3D UniformMap */
	static sceneUniformMap: CommandUniformMap;
	/** Scene UniformPropertyID */
	/** @internal */
	static FOGCOLOR: number;
	/** @internal */
	static FOGSTART: number;
	/** @internal */
	static FOGRANGE: number;
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
	// /** @internal */
	// static AMBIENTSHAR: number;
	// /** @internal */
	// static AMBIENTSHAG: number;
	// /** @internal */
	// static AMBIENTSHAB: number;
	// /** @internal */
	// static AMBIENTSHBR: number;
	// /** @internal */
	// static AMBIENTSHBG: number;
	// /** @internal */
	// static AMBIENTSHBB: number;
	// /** @internal */
	// static AMBIENTSHC: number;
	/** @internal */
	static AMBIENTCOLOR: number;
	/** @internal */
	static TIME: number;
	/** @internal */
	static sceneID: number;

	static SceneUBOData: UnifromBufferData;
	/**@internal scene uniform block */
	static SCENEUNIFORMBLOCK: number;
	//------------------legacy lighting-------------------------------
	/** @internal */
	static LIGHTDIRECTION: number;
	/** @internal */
	static LIGHTDIRCOLOR: number;
	/** @internal */
	static POINTLIGHTPOS: number;
	/** @internal */
	static POINTLIGHTRANGE: number;
	/** @internal */
	static POINTLIGHTATTENUATION: number;
	/** @internal */
	static POINTLIGHTCOLOR: number;
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
	//------------------legacy lighting-------------------------------
	/** @internal */
	static _configDefineValues: DefineDatas = new DefineDatas();

	/** @internal 场景更新标记*/
	static __updateMark: number = 0;
	/** @internal*/
	static _blitTransRT: RenderTexture;
	static _blitOffset: Vector4 = new Vector4();
	static mainCavansViewPort: Viewport = new Viewport(0, 0, 1, 1);

	/**
	 * 场景更新标记
	 */
	static set _updateMark(value: number) {
		Scene3D.__updateMark = value;
	}

	static get _updateMark(): number {
		return Scene3D.__updateMark;
	}

	/**
	 * init shaderData
	 */
	static shaderValueInit() {
		Scene3DShaderDeclaration.SHADERDEFINE_FOG = Shader3D.getDefineByName("FOG");
		Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT = Shader3D.getDefineByName("DIRECTIONLIGHT");
		Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT = Shader3D.getDefineByName("POINTLIGHT");
		Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT = Shader3D.getDefineByName("SPOTLIGHT");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW = Shader3D.getDefineByName("SHADOW");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE = Shader3D.getDefineByName("SHADOW_CASCADE");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW = Shader3D.getDefineByName("SHADOW_SOFT_SHADOW_LOW");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH = Shader3D.getDefineByName("SHADOW_SOFT_SHADOW_HIGH");
		Scene3DShaderDeclaration.SHADERDEFINE_GI_AMBIENT_SH = Shader3D.getDefineByName("GI_AMBIENT_SH");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT = Shader3D.getDefineByName("SHADOW_SPOT");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW = Shader3D.getDefineByName("SHADOW_SPOT_SOFT_SHADOW_LOW");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH = Shader3D.getDefineByName("SHADOW_SPOT_SOFT_SHADOW_HIGH");

		Scene3D.FOGCOLOR = Shader3D.propertyNameToID("u_FogColor");
		Scene3D.FOGSTART = Shader3D.propertyNameToID("u_FogStart");
		Scene3D.FOGRANGE = Shader3D.propertyNameToID("u_FogRange");
		Scene3D.DIRECTIONLIGHTCOUNT = Shader3D.propertyNameToID("u_DirationLightCount");
		Scene3D.LIGHTBUFFER = Shader3D.propertyNameToID("u_LightBuffer");
		Scene3D.CLUSTERBUFFER = Shader3D.propertyNameToID("u_LightClusterBuffer");
		Scene3D.AMBIENTCOLOR = Shader3D.propertyNameToID("u_AmbientColor");
		Scene3D.TIME = Shader3D.propertyNameToID("u_Time");
		Scene3D.SCENEUNIFORMBLOCK = Shader3D.propertyNameToID(UniformBufferObject.UBONAME_SCENE);

		let sceneUniformMap: CommandUniformMap = Scene3D.sceneUniformMap = CommandUniformMap.createGlobalUniformMap("Scene3D");
		sceneUniformMap.addShaderUniform(Scene3D.FOGCOLOR, "u_FogColor");
		sceneUniformMap.addShaderUniform(Scene3D.FOGSTART, "u_FogStart");
		sceneUniformMap.addShaderUniform(Scene3D.FOGRANGE, "u_FogRange");
		sceneUniformMap.addShaderUniform(Scene3D.DIRECTIONLIGHTCOUNT, "u_DirationLightCount");
		sceneUniformMap.addShaderUniform(Scene3D.LIGHTBUFFER, "u_LightBuffer");
		sceneUniformMap.addShaderUniform(Scene3D.CLUSTERBUFFER, "u_LightClusterBuffer");
		sceneUniformMap.addShaderUniform(Scene3D.AMBIENTCOLOR, "u_AmbientColor");
		sceneUniformMap.addShaderUniform(Scene3D.TIME, "u_Time");
		sceneUniformMap.addShaderUniform(Scene3D.SCENEUNIFORMBLOCK, UniformBufferObject.UBONAME_SCENE);
	}

	/**
	 * legency ShaderData
	 */
	static legacyLightingValueInit() {
		Scene3D.LIGHTDIRECTION = Shader3D.propertyNameToID("u_DirectionLight.direction");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.LIGHTDIRECTION, "u_DirectionLight.direction");
		Scene3D.LIGHTDIRCOLOR = Shader3D.propertyNameToID("u_DirectionLight.color");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.LIGHTDIRCOLOR, "u_DirectionLight.color");
		Scene3D.POINTLIGHTPOS = Shader3D.propertyNameToID("u_PointLight.position");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTPOS, "u_PointLight.position");
		Scene3D.POINTLIGHTRANGE = Shader3D.propertyNameToID("u_PointLight.range");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTRANGE, "u_PointLight.range");
		Scene3D.POINTLIGHTATTENUATION = Shader3D.propertyNameToID("u_PointLight.attenuation");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTATTENUATION, "u_PointLight.attenuation");
		Scene3D.POINTLIGHTCOLOR = Shader3D.propertyNameToID("u_PointLight.color");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.POINTLIGHTCOLOR, "u_PointLight.color");
		Scene3D.SPOTLIGHTPOS = Shader3D.propertyNameToID("u_SpotLight.position");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTPOS, "u_SpotLight.position");
		Scene3D.SPOTLIGHTDIRECTION = Shader3D.propertyNameToID("u_SpotLight.direction");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTDIRECTION, "u_DirectionLight.direction");
		Scene3D.SPOTLIGHTSPOTANGLE = Shader3D.propertyNameToID("u_SpotLight.spot");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTSPOTANGLE, "u_SpotLight.spot");
		Scene3D.SPOTLIGHTRANGE = Shader3D.propertyNameToID("u_SpotLight.range");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTRANGE, "u_SpotLight.range");
		Scene3D.SPOTLIGHTCOLOR = Shader3D.propertyNameToID("u_SpotLight.color");
		Scene3D.sceneUniformMap.addShaderUniform(Scene3D.SPOTLIGHTCOLOR, "u_SpotLight.color");
	}

	/**
	 * create Scene UniformBuffer
	 * @internal
	 * @returns 
	 */
	static createSceneUniformBlock(): UnifromBufferData {
		if (!Scene3D.SceneUBOData) {
			let uniformpara: Map<string, UniformBufferParamsType> = new Map<string, UniformBufferParamsType>();
			uniformpara.set("u_AmbientColor", UniformBufferParamsType.Vector4);
			uniformpara.set("u_Time", UniformBufferParamsType.Number);
			uniformpara.set("u_FogStart", UniformBufferParamsType.Number);
			uniformpara.set("u_FogRange", UniformBufferParamsType.Number);
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
		var con: Config3D = Config3D._config;
		var multiLighting: boolean = con._multiLighting;
		if (multiLighting) {
			const width = 4;
			var maxLightCount: number = con.maxLightCount;
			var clusterSlices: Vector3 = con.lightClusterCount;
			Cluster.instance = new Cluster(clusterSlices.x, clusterSlices.y, clusterSlices.z, Math.min(con.maxLightCount, con._maxAreaLightCountPerClusterAverage));
			Scene3D._lightTexture = Utils3D._createFloatTextureBuffer(width, maxLightCount);
			Scene3D._lightTexture.lock = true;
			Scene3D._lightPixles = new Float32Array(maxLightCount * width * 4);
		}
		Scene3D.shaderValueInit();
		var config: Config3D = Config3D._config;
		var configShaderValue: DefineDatas = Scene3D._configDefineValues;
		if (!config._multiLighting) {
			(configShaderValue.add(Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING));
			Scene3D.legacyLightingValueInit()
		}
		Scene3D._shadowCasterPass = new ShadowCasterPass();
		//TODO:
		if (LayaGL.renderEngine.getCapable(RenderCapable.GRAPHICS_API_GLES3) && WebGL._isWebGL2)
			configShaderValue.add(Shader3D.SHADERDEFINE_GRAPHICS_API_GLES3);
		else
			configShaderValue.add(Shader3D.SHADERDEFINE_GRAPHICS_API_GLES2);
		//UniformBuffer
		if (Config3D._config._uniformBlock)
			configShaderValue.add(Shader3D.SHADERDEFINE_ENUNIFORMBLOCK);

		// switch (config.pbrRenderQuality) {
		// 	case PBRRenderQuality.High:
		// 		configShaderValue.add(PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_HIGH)
		// 		break;
		// 	case PBRRenderQuality.Low:
		// 		configShaderValue.add(PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_LOW)
		// 		break;
		// 	default:
		// 		throw "Scene3D:unknown shader quality.";
		// }
		if (config.isUseCannonPhysicsEngine) {
			Physics3D._cannon && (Scene3D.cannonPhysicsSettings = new CannonPhysicsSettings());
		} else {
			Physics3D._bullet && (Scene3D.physicsSettings = new PhysicsSettings());
		}
	}

	/**
	 * 加载场景,注意:不缓存。
	 * @param url 模板地址。
	 * @param complete 完成回调。
	 */
	static load(url: string, complete: Handler): void {
		ILaya.loader.create(url, complete, null, Loader.HIERARCHY);
	}

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
	private _input: Input3D = new Input3D();
	/** @internal */
	private _timer: Timer = ILaya.timer;
	/** @internal */
	private _time: number = 0;
	/** @internal */
	private _shCoefficients: Vector4[] = new Array(7);
	/** @internal */
	private _ambientMode: AmbientMode = AmbientMode.SolidColor;
	/** @internal */
	private _ambientSphericalHarmonics: SphericalHarmonicsL2 = new SphericalHarmonicsL2();
	/** @internal */
	private _ambientSphericalHarmonicsIntensity: number = 1.0;
	/** @internal */
	private _ambientSkyColor: Vector3 = new Vector3();
	/** @internal */
	private _ambientEquatorColor: Vector3 = new Vector3();
	/** @internal */
	private _ambientGroundColor: Vector3 = new Vector3();
	/** @internal */
	private _ambientTripleColorSphericalHarmonics: SphericalHarmonicsL2;
	/** @internal */
	private _reflection: TextureCube;
	/** @internal */
	private _reflectionDecodeFormat: TextureDecodeFormat = TextureDecodeFormat.Normal;
	/** @internal */
	private _reflectionIntensity: number = 1.0;

	/**@internal */
	_sunColor:Color = new Color(1.0,1.0,1.0);
	/**@interanl */
	_sundir:Vector3 = new Vector3();
	/**@internal*/
	_id = Scene3D.sceneID++;
	/**@internal */
	_componentManager: ComponentManager = new ComponentManager();
	/** @internal */
	_mainDirectionLight: DirectionLightCom;
	/** @internal */
	_mainSpotLight: SpotLightCom;
	/** @internal */
	_mainPointLight: PointLightCom;//TODO
	/** @internal */
	_physicsSimulation: PhysicsSimulation;
	/** @internal */
	_cannonPhysicsSimulation: CannonPhysicsSimulation;
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
	_opaqueQueue: BaseRenderQueue = LayaGL.renderOBJCreate.createBaseRenderQueue(false) as BaseRenderQueue;
	/** @internal */
	_transparentQueue: BaseRenderQueue = LayaGL.renderOBJCreate.createBaseRenderQueue(true) as BaseRenderQueue;
	/** @internal */
	_cameraPool: BaseCamera[] = [];
	/**	@internal */
	_reflectionCubeHDRParams: Vector4 = new Vector4();
	/** @internal */
	_reflectionProbeManager: ReflectionProbeManager = new ReflectionProbeManager();
	/**@internal */
	_sceneRenderManager: ISceneRenderManager;
	/**@internal */
	_cullPass: ICullPass;
	/** 当前创建精灵所属遮罩层。*/
	currentCreationLayer: number = Math.pow(2, 0);
	/** 是否启用灯光。*/
	enableLight: boolean = true;
	/** @internal */
	_debugTool: PixelLineSprite3D;
	/** @internal [Editer]*/
	_pickIdToSprite: any = new Object();

	/** @internal */
	_nativeObj: any;

	/**
	 * set SceneRenderableManager
	 */
	set sceneRenderableManager(manager: ISceneRenderManager) {
		// this._octree = manager;
		manager.list = this._sceneRenderManager.list;
		this._sceneRenderManager = manager;
		// for (let i = 0, n = this._renders.length; i < n; i++) {
		// 	let render = <BaseRender>this._renders.elements[i];
		// 	this._renders.remove(render);
		// 	this._addRenderObject(render);
		// }
	}

	get sceneRenderableManager(): ISceneRenderManager {
		return this._sceneRenderManager;
	}

	/**
	 * set ICullPass
	 */
	set cullPass(cullPass: ICullPass) {
		this._cullPass = cullPass;
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
		return this._shaderValues.getNumber(Scene3D.FOGSTART);
	}

	set fogStart(value: number) {
		this._shaderValues.setNumber(Scene3D.FOGSTART, value);
	}

	/**
	 * 雾化范围。
	 */
	get fogRange(): number {
		return this._shaderValues.getNumber(Scene3D.FOGRANGE);
	}

	set fogRange(value: number) {
		this._shaderValues.setNumber(Scene3D.FOGRANGE, value);
	}

	/**
	 * 环境光模式。
	 * 如果值为AmbientMode.SolidColor一般使用ambientColor作为环境光源，如果值为如果值为AmbientMode.SphericalHarmonics一般使用ambientSphericalHarmonics作为环境光源。
	 */
	get ambientMode(): AmbientMode {
		return this._ambientMode;
	}

	set ambientMode(value: AmbientMode) {
		if (this._ambientMode !== value) {
			switch (value) {
				case AmbientMode.SolidColor:
					this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_GI_AMBIENT_SH);
					break;
				case AmbientMode.SphericalHarmonics:
					this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_GI_AMBIENT_SH);
					let sh = this.ambientSphericalHarmonics || SphericalHarmonicsL2._default;
					let intensity = this.ambientSphericalHarmonicsIntensity;
					this._applySHCoefficients(sh, Math.pow(intensity, 2.2));
					break;
				case AmbientMode.TripleColor:
					this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_GI_AMBIENT_SH);
					let gradientSH = this._ambientTripleColorSphericalHarmonics || SphericalHarmonicsL2._default;
					this._applySHCoefficients(gradientSH, 1.0);
					break;
				default:
					throw "Scene3D: unknown ambientMode.";
			}
			this._ambientMode = value;
		}
	}

	/**
	 * 固定颜色环境光。
	 */
	get ambientColor(): Color {
		return this._shaderValues.getColor(Scene3D.AMBIENTCOLOR);
	}

	set ambientColor(value: Color) {
		this._shaderValues.setColor(Scene3D.AMBIENTCOLOR, value);
	}

	/**
	 * 天空环境光颜色
	 */
	get ambientSkyColor(): Vector3 {
		return this._ambientSkyColor;
	}

	/**
	 * 地平线环境光颜色
	 */
	get ambientEquatorColor(): Vector3 {
		return this._ambientEquatorColor;
	}

	/**
	 * 地面环境光颜色
	 */
	get ambientGroundColor(): Vector3 {
		return this._ambientGroundColor;
	}

	/**
	 * 球谐环境光,修改后必须重新赋值。
	 */
	get ambientSphericalHarmonics(): SphericalHarmonicsL2 {
		return this._ambientSphericalHarmonics;
	}

	set ambientSphericalHarmonics(value: SphericalHarmonicsL2) {
		var originalSH: SphericalHarmonicsL2 = value || SphericalHarmonicsL2._default;
		this._applySHCoefficients(originalSH, Math.pow(this._ambientSphericalHarmonicsIntensity, 2.2));//Gamma to Linear,I prefer use 'Color.gammaToLinearSpace',but must same with Unity now.
		if (this._ambientSphericalHarmonics != value)
			value.cloneTo(this._ambientSphericalHarmonics);
	}

	/**
	 * 环境球谐强度。
	 */
	get ambientSphericalHarmonicsIntensity(): number {
		return this._ambientSphericalHarmonicsIntensity;
	}

	set ambientSphericalHarmonicsIntensity(value: number) {
		value = Math.max(Math.min(value, 8.0), 0.0);
		if (this.ambientMode == AmbientMode.SphericalHarmonics && this._ambientSphericalHarmonicsIntensity !== value) {
			var originalSH: SphericalHarmonicsL2 = this._ambientSphericalHarmonics || SphericalHarmonicsL2._default;
			this._applySHCoefficients(originalSH, Math.pow(value, 2.2));//Gamma to Linear,I prefer use 'Color.gammaToLinearSpace',but must same with Unity now.
		}
		this._ambientSphericalHarmonicsIntensity = value;
	}

	/**
	 * 反射立方体纹理。
	 */
	get reflection(): TextureCube {
		return this._reflection;
	}

	set reflection(value: TextureCube) {
		value = value ? value : TextureCube.blackTexture;
		if (this._reflection != value) {
			value._addReference();
			this._reflectionProbeManager.sceneReflectionProbe = value;
			this._reflection = value
			this._reflectionProbeManager._needUpdateAllRender = true;

		}
	}

	/**
	 * 反射立方体纹理解码格式。
	 */
	get reflectionDecodingFormat(): TextureDecodeFormat {
		return this._reflectionDecodeFormat;
	}

	set reflectionDecodingFormat(value: TextureDecodeFormat) {
		if (this._reflectionDecodeFormat != value) {
			this._reflectionCubeHDRParams.x = this._reflectionIntensity;
			if (this._reflectionDecodeFormat == TextureDecodeFormat.RGBM)
				this._reflectionCubeHDRParams.x *= 5.0;//5.0 is RGBM param
			this._reflectionDecodeFormat = value;
			this._reflectionProbeManager.sceneReflectionCubeHDRParam = this._reflectionCubeHDRParams;
		}
	}

	/**
	 * 反射强度。
	 */
	get reflectionIntensity(): number {
		return this._reflectionIntensity;
	}

	set reflectionIntensity(value: number) {
		value = Math.max(Math.min(value, 1.0), 0.0);
		this._reflectionCubeHDRParams.x = value;
		if (this._reflectionDecodeFormat == TextureDecodeFormat.RGBM)
			this._reflectionCubeHDRParams.x *= 5.0;//5.0 is RGBM param
		this._reflectionIntensity = value;
		this._reflectionProbeManager.sceneReflectionCubeHDRParam = this._reflectionCubeHDRParams;
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
	get physicsSimulation(): PhysicsSimulation {
		return this._physicsSimulation;
	}

	get cannonPhysicsSimulation(): CannonPhysicsSimulation {
		return this._cannonPhysicsSimulation;
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
	 *	输入。
	 */
	get input(): Input3D {
		return this._input;
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
				map.lightmapColor._removeReference();
				map.lightmapDirection._removeReference();
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
	}

	/**
	 * 创建一个 <code>Scene3D</code> 实例。
	 */
	constructor() {
		super();
		if ((window as any).conch && !(window as any).conchConfig.conchWebGL) {
			this._nativeObj = new (window as any).conchSubmitScene3D(this.renderSubmit.bind(this));
		}
		if (!Config3D._config.isUseCannonPhysicsEngine && Physics3D._bullet)
			this._physicsSimulation = new PhysicsSimulation(Scene3D.physicsSettings);
		else if (Physics3D._cannon) {
			this._cannonPhysicsSimulation = new CannonPhysicsSimulation(Scene3D.cannonPhysicsSettings);
		}
		this._shaderValues = LayaGL.renderOBJCreate.createShaderData(null);
		if (Config3D._config._uniformBlock) {
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

		this.enableFog = false;
		this.fogStart = 300;
		this.fogRange = 1000;
		this.fogColor = new Color(0.7, 0.7, 0.7);
		this.ambientColor = new Color(0.212, 0.227, 0.259);
		this.reflectionIntensity = 1.0;
		this.reflection = TextureCube.blackTexture;
		for (var i: number = 0; i < 7; i++)
			this._shCoefficients[i] = new Vector4();
		this._reflectionProbeManager.sceneReflectionCubeHDRParam = this._reflectionCubeHDRParams;
		this._scene = this;
		this._input.__init__(Render.canvas, this);
		this._sceneRenderManager = LayaGL.renderOBJCreate.createSceneRenderManager();
		this._cullPass = LayaGL.renderOBJCreate.createCullPass();

		// if (Scene3D.octreeCulling)
		// 	this._octree = new BoundsOctree(Scene3D.octreeInitialSize, Scene3D.octreeInitialCenter, Scene3D.octreeMinNodeSize, Scene3D.octreeLooseness);
		if (FrustumCulling.debugFrustumCulling) {
			this._debugTool = new PixelLineSprite3D();
			var lineMaterial: PixelLineMaterial = new PixelLineMaterial();
			lineMaterial.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
			lineMaterial.alphaTest = false;
			lineMaterial.depthWrite = false;
			lineMaterial.cull = RenderState.CULL_BACK;
			lineMaterial.blend = RenderState.BLEND_ENABLE_ALL;
			lineMaterial.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
			lineMaterial.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
			lineMaterial.depthTest = RenderState.DEPTHTEST_LESS;
			this._debugTool.pixelLineRenderer.sharedMaterial = lineMaterial;
		}
	}

	/**
	 * @internal
	 */
	private _applySHCoefficients(originalSH: SphericalHarmonicsL2, intensity: number): void {
		var optSH: Vector4[] = this._shCoefficients;
		for (var i = 0; i < 3; i++) {
			var shaderSHA: Vector4 = optSH[i];
			var shaderSHB: Vector4 = optSH[i + 3];
			shaderSHA.setValue(originalSH.getCoefficient(i, 3) * intensity, originalSH.getCoefficient(i, 1) * intensity, originalSH.getCoefficient(i, 2) * intensity, (originalSH.getCoefficient(i, 0) - originalSH.getCoefficient(i, 6)) * intensity);
			shaderSHB.setValue(originalSH.getCoefficient(i, 4) * intensity, originalSH.getCoefficient(i, 5) * intensity, originalSH.getCoefficient(i, 6) * 3 * intensity, originalSH.getCoefficient(i, 7) * intensity);// Quadratic polynomials 
		}
		optSH[6].setValue(originalSH.getCoefficient(0, 8) * intensity, originalSH.getCoefficient(1, 8) * intensity, originalSH.getCoefficient(2, 8) * intensity, 1);// Final quadratic polynomial

		// this._setShaderValue(Scene3D.AMBIENTSHAR, optSH[0]);
		// this._setShaderValue(Scene3D.AMBIENTSHAG, optSH[1]);
		// this._setShaderValue(Scene3D.AMBIENTSHAB, optSH[2]);
		// this._setShaderValue(Scene3D.AMBIENTSHBR, optSH[3]);
		// this._setShaderValue(Scene3D.AMBIENTSHBG, optSH[4]);
		// this._setShaderValue(Scene3D.AMBIENTSHBB, optSH[5]);
		// this._setShaderValue(Scene3D.AMBIENTSHC, optSH[6]);
	}

	/**
	 * 设置 天空， 地平线， 地面 环境光颜色
	 */
	public setGradientAmbient(skyColor: Vector3, equatorColor: Vector3, groundColor: Vector3) {
		this._ambientSkyColor = skyColor;
		this._ambientEquatorColor = equatorColor;
		this._ambientGroundColor = groundColor;

		let gradientSH = SphericalHarmonicsL2Generater.CalGradientSH(skyColor, equatorColor, groundColor, true);
		this._ambientTripleColorSphericalHarmonics = gradientSH;

		if (this.ambientMode == AmbientMode.TripleColor) {
			this._applySHCoefficients(gradientSH, 1.0);
		}
	}

	/**
	 *@internal
	 */
	protected _update(): void {
		var delta: number = this.timer._delta / 1000;
		this._time += delta;
		this._shaderValues.setNumber(Scene3D.TIME, this._time);
		//Physics
		var simulation: PhysicsSimulation = this._physicsSimulation;
		if (Physics3D._enablePhysics && !PhysicsSimulation.disableSimulation && !Config3D._config.isUseCannonPhysicsEngine) {
			simulation._updatePhysicsTransformFromRender();
			PhysicsComponent._addUpdateList = false;//物理模拟器会触发_updateTransformComponent函数,不加入更新队列
			//simulate physics
			simulation._simulate(delta);
			//update character sprite3D transforms from physics engine simulation
			simulation._updateCharacters();
			PhysicsComponent._addUpdateList = true;
			//handle frame contacts
			simulation._updateCollisions();
			//send contact events
			simulation._eventScripts();
		}
		if (Physics3D._cannon && Config3D._config.isUseCannonPhysicsEngine) {
			var cannonSimulation: CannonPhysicsSimulation = this._cannonPhysicsSimulation;
			cannonSimulation._updatePhysicsTransformFromRender();
			CannonPhysicsComponent._addUpdateList = false;
			cannonSimulation._simulate(delta);
			CannonPhysicsComponent._addUpdateList = true;
			cannonSimulation._updateCollisions();
			cannonSimulation._eventScripts();
		}
		//update Scripts
		this._input._update();
		//this._clearScript();
		this._componentManager.callScriptStart();
		this._componentManager.callScriptUpdate(delta);
		this._componentManager.callRenderUpdate(delta);
		//Animator._update(this);
		this._componentManager.callAnimatorUpdate(delta);
		if (this._reflectionProbeManager._needUpdateAllRender)
			this._reflectionProbeManager.updateAllRenderObjects(this._sceneRenderManager.list);
		else
			this._reflectionProbeManager.update();
		this._componentManager.callScriptLataUpdate(delta);
		this._componentManager.callComponentDestroy();
		/*Update*/
		this._sceneRenderManager.updateMotionObjects();
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
	 * [Editer]
	 */
	_allotPickColorByID(id: number, pickColor: Vector4): void {

		var pickColorR: number = Math.floor(id / (255 * 255));
		id -= pickColorR * 255 * 255;
		var pickColorG: number = Math.floor(id / 255);
		id -= pickColorG * 255;
		var pickColorB: number = id;

		pickColor.x = pickColorR / 255;
		pickColor.y = pickColorG / 255;
		pickColor.z = pickColorB / 255;
		pickColor.w = 1.0;
	}

	/**
	 * @internal
	 * [Editer]
	 */
	_searchIDByPickColor(pickColor: Vector4): number {
		var id: number = pickColor.x * 255 * 255 + pickColor.y * 255 + pickColor.z;
		return id;
	}

	/**
	 * @internal
	 * @override
	 */
	onEnable(): void {
		this._input._onCanvasEvent(Render.canvas);
	}

	/**
	 * @internal
	 * @override
	 */
	onDisable(): void {
		this._input._offCanvasEvent(Render.canvas);
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
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		ILaya.stage._scene3Ds.push(this);
	}

	/**
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
		var multiLighting: boolean = Config3D._config._multiLighting;
		if (multiLighting) {
			var ligTex: Texture2D = Scene3D._lightTexture;
			var ligPix: Float32Array = Scene3D._lightPixles;
			const pixelWidth: number = ligTex.width;
			const floatWidth: number = pixelWidth * 4;
			var curCount: number = 0;
			var dirCount: number = this._directionLights._length;
			var dirElements: DirectionLightCom[] = this._directionLights._elements;
			if (dirCount > 0) {
				var sunLightIndex: number = this._directionLights.getBrightestLight();//get the brightest light as sun
				this._mainDirectionLight = dirElements[sunLightIndex];
				this._directionLights.normalLightOrdering(sunLightIndex);
				for (var i: number = 0; i < dirCount; i++, curCount++) {
					var dirLight: DirectionLightCom = dirElements[i];
					var dir: Vector3 = dirLight._direction;
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
					ligPix[off + 4] = dir.x;
					ligPix[off + 5] = dir.y;
					ligPix[off + 6] = dir.z;
					// if (i == 0) {
					// 	this._setShaderValue(Scene3D.SUNLIGHTDIRCOLOR, intCor);
					// 	this._setShaderValue(Scene3D.SUNLIGHTDIRECTION, dir);
					// }
					if(i==0){
						this._sunColor = dirLight.color;
						this._sundir = dir;
					}	
				}
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}

			var poiCount: number = this._pointLights._length;
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
				}
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}

			var spoCount: number = this._spotLights._length;
			if (spoCount > 0) {
				var spoElements: SpotLightCom[] = this._spotLights._elements;
				var mainSpotLightIndex: number = this._spotLights.getBrightestLight();
				this._mainSpotLight = spoElements[mainSpotLightIndex];
				this._spotLights.normalLightOrdering(mainSpotLightIndex)
				for (var i: number = 0; i < spoCount; i++, curCount++) {
					var spoLight: SpotLightCom = spoElements[i];
					var dir: Vector3 = spoLight._direction;
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
				}
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
			}

			(curCount > 0) && (ligTex.setSubPixelsData(0, 0, pixelWidth, curCount, ligPix, 0, false, false, false));
			shaderValues.setTexture(Scene3D.LIGHTBUFFER, ligTex);
			shaderValues.setInt(Scene3D.DIRECTIONLIGHTCOUNT, this._directionLights._length);
			shaderValues.setTexture(Scene3D.CLUSTERBUFFER, Cluster.instance._clusterTexture);
		}
		else {
			if (this._directionLights._length > 0) {
				var dirLight: DirectionLightCom = this._directionLights._elements[0];
				this._mainDirectionLight = dirLight;
				dirLight._intensityColor.x = Color.gammaToLinearSpace(dirLight.color.r);
				dirLight._intensityColor.y = Color.gammaToLinearSpace(dirLight.color.g);
				dirLight._intensityColor.z = Color.gammaToLinearSpace(dirLight.color.b);
				Vector3.scale(dirLight._intensityColor, dirLight._intensity, dirLight._intensityColor);

				(dirLight.owner as Sprite3D).transform.worldMatrix.getForward(dirLight._direction);
				Vector3.normalize(dirLight._direction, dirLight._direction);
				shaderValues.setVector3(Scene3D.LIGHTDIRCOLOR, dirLight._intensityColor);
				shaderValues.setVector3(Scene3D.LIGHTDIRECTION, dirLight._direction);
				if(i==0){
					this._sunColor = dirLight.color;
					this._sundir = dirLight._direction;
				}	
				// this._setShaderValue(Scene3D.SUNLIGHTDIRCOLOR, dirLight._intensityColor);
				// this._setShaderValue(Scene3D.SUNLIGHTDIRECTION, dirLight._direction);
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			if (this._pointLights._length > 0) {
				var poiLight: PointLightCom = this._pointLights._elements[0];
				this._mainPointLight = poiLight;
				poiLight._intensityColor.x = Color.gammaToLinearSpace(poiLight.color.r);
				poiLight._intensityColor.y = Color.gammaToLinearSpace(poiLight.color.g);
				poiLight._intensityColor.z = Color.gammaToLinearSpace(poiLight.color.b);
				Vector3.scale(poiLight._intensityColor, poiLight._intensity, poiLight._intensityColor);
				shaderValues.setVector3(Scene3D.POINTLIGHTCOLOR, poiLight._intensityColor);
				shaderValues.setVector3(Scene3D.POINTLIGHTPOS, (poiLight.owner as Sprite3D).transform.position);
				shaderValues.setNumber(Scene3D.POINTLIGHTRANGE, poiLight.range);
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			if (this._spotLights._length > 0) {
				var spotLight: SpotLightCom = this._spotLights._elements[0];
				this._mainSpotLight = spotLight;
				spotLight._intensityColor.x = Color.gammaToLinearSpace(spotLight.color.r);
				spotLight._intensityColor.y = Color.gammaToLinearSpace(spotLight.color.g);
				spotLight._intensityColor.z = Color.gammaToLinearSpace(spotLight.color.b);
				Vector3.scale(spotLight._intensityColor, spotLight._intensity, spotLight._intensityColor);
				shaderValues.setVector3(Scene3D.SPOTLIGHTCOLOR, spotLight._intensityColor);
				shaderValues.setVector3(Scene3D.SPOTLIGHTPOS, (spotLight.owner as Sprite3D).transform.position);
				(spotLight.owner as Sprite3D).transform.worldMatrix.getForward(spotLight._direction);
				Vector3.normalize(spotLight._direction, spotLight._direction);
				shaderValues.setVector3(Scene3D.SPOTLIGHTDIRECTION, spotLight._direction);
				shaderValues.setNumber(Scene3D.SPOTLIGHTRANGE, spotLight.range);
				shaderValues.setNumber(Scene3D.SPOTLIGHTSPOTANGLE, spotLight.spotAngle * Math.PI / 180);
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
			}
		}
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
	_preCulling(context: RenderContext3D, camera: Camera): void {
		this._clearRenderQueue();
		var cameraCullInfo: ICameraCullInfo = FrustumCulling._cameraCullInfo;
		var cameraPos = cameraCullInfo.position = camera._transform.position;
		cameraCullInfo.cullingMask = camera.cullingMask;
		cameraCullInfo.boundFrustum = camera.boundFrustum;
		cameraCullInfo.useOcclusionCulling = camera.useOcclusionCulling;
		this._cullPass.cullByCameraCullInfo(cameraCullInfo, this.sceneRenderableManager);
		//addQueue
		let list = this._cullPass.cullList;
		let element = list.elements;
		for (let i: number = 0; i < list.length; i++) {
			let render: BaseRender = element[i];
			render.distanceForSort = Vector3.distance(render.bounds.getCenter(), cameraPos);//TODO:合并计算浪费,或者合并后取平均值
			var elements: RenderElement[] = render._renderElements;
			for (var j: number = 0, m: number = elements.length; j < m; j++)
				elements[j]._update(this, context, context.customShader, context.replaceTag);
		}
	}

	_directLightShadowCull(cullInfo: IShadowCullInfo, context: RenderContext3D) {
		this._clearRenderQueue();
		const position: Vector3 = cullInfo.position;
		this._cullPass.cullByShadowCullInfo(cullInfo, this.sceneRenderableManager);
		let list = this._cullPass.cullList;
		let element = list.elements;
		for (let i: number = 0; i < list.length; i++) {
			let render: BaseRender = element[i];
			render.distanceForSort = Vector3.distance(render.bounds.getCenter(), position);//TODO:合并计算浪费,或者合并后取平均值
			var elements: RenderElement[] = render._renderElements;
			for (var j: number = 0, m: number = elements.length; j < m; j++)
				elements[j]._update(this, context, null, null);
		}
	}

	_sportLightShadowCull(cameraCullInfo: ICameraCullInfo, context: RenderContext3D) {
		this._clearRenderQueue();
		this._cullPass.cullingSpotShadow(cameraCullInfo, this.sceneRenderableManager);
		let list = this._cullPass.cullList;
		let element = list.elements;
		for (var i: number = 0, n: number = list.length; i < n; i++) {
			var render: BaseRender = element[i];
			render.distanceForSort = Vector3.distance(render.bounds.getCenter(), cameraCullInfo.position);
			var elements: RenderElement[] = render._renderElements;
			for (var j: number = 0, m: number = elements.length; j < m; j++)
				elements[j]._update(this, context, null, null);
		}
	}

	/**
	 * @internal
	 */
	_clear(state: RenderContext3D): void {
		var viewport: Viewport = state.viewport;
		var camera: Camera = <Camera>state.camera;
		var renderTex: RenderTexture = camera._getRenderTexture();
		var vpX: number, vpY: number;
		var vpW: number = viewport.width;
		var vpH: number = viewport.height;
		if (camera._needInternalRenderTexture()) {
			vpX = 0;
			vpY = 0;
		}
		else {
			vpX = viewport.x;
			vpY = camera._getCanvasHeight() - viewport.y - vpH;
		}
		LayaGL.renderEngine.viewport(vpX, vpY, vpW, vpH);
		LayaGL.renderEngine.scissor(vpX, vpY, vpW, vpH);
		state.changeViewport(vpX, vpY, vpW, vpH);
		state.changeScissor(vpX, vpY, vpW, vpH);
		Camera._context3DViewPortCatch.set(vpX, vpY, vpW, vpH);
		Camera._contextScissorPortCatch.setValue(vpX, vpY, vpW, vpH);

		var clearFlag: number = camera.clearFlag;
		if (clearFlag === CameraClearFlags.Sky && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
			clearFlag = CameraClearFlags.SolidColor;
		let clearConst: number = 0;
		let stencilFlag = renderTex.depthStencilFormat == RenderTargetFormat.DEPTHSTENCIL_24_8 ? RenderClearFlag.Stencil : 0;
		switch (clearFlag) {
			case CameraClearFlags.SolidColor:
				clearConst = RenderClearFlag.Color | RenderClearFlag.Depth | stencilFlag;
				break;
			case CameraClearFlags.DepthOnly:
			case CameraClearFlags.Sky:
				clearConst = RenderClearFlag.Depth | stencilFlag;
				break;
			case CameraClearFlags.Nothing:
				clearConst = 0;
				break;
			case CameraClearFlags.ColorOnly:
				clearConst = RenderClearFlag.Color;
				break;

		}

		LayaGL.renderEngine.clearRenderTexture(clearConst, camera._linearClearColor, 1);
	}

	/**
	 * @internal 渲染Scene的各个管线
	 */
	_renderScene(context: RenderContext3D, renderFlag: number): void {
		var camera: Camera = <Camera>context.camera;
		switch (renderFlag) {
			case Scene3D.SCENERENDERFLAG_RENDERQPAQUE:
				//this._opaqueQueue.preRender(context);
				//this._opaqueQueue._render(context);//非透明队列
				this._opaqueQueue.renderQueue(context);
				break;
			case Scene3D.SCENERENDERFLAG_SKYBOX:
				if (camera.clearFlag === CameraClearFlags.Sky) {
					if (camera.skyRenderer._isAvailable())
						camera.skyRenderer._render(context);
					else if (this._skyRenderer._isAvailable())
						this._skyRenderer._render(context);
				}
				break;
			case Scene3D.SCENERENDERFLAG_RENDERTRANSPARENT:
				//this._transparentQueue.preRender(context);//透明队列
				this._transparentQueue.renderQueue(context);
				if (FrustumCulling.debugFrustumCulling) {
					var renderElements: RenderElement[] = this._debugTool._render._renderElements;
					for (var i: number = 0, n: number = renderElements.length; i < n; i++) {
						//renderElements[i]._update(this, context, null, null);
						context.drawRenderElement(renderElements[i]);
						//renderElements[i]._render(context);
						//LayaGL.renderDrawConatext.drawGeometryElement(renderElements[i]._renderElementOBJ._render())
					}
				}
				break;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		var lightMapsData: any[] = data.lightmaps;
		if (lightMapsData) {
			var lightMapCount: number = lightMapsData.length;
			var lightmaps: Lightmap[] = new Array(lightMapCount);
			for (var i: number = 0; i < lightMapCount; i++) {
				var lightMap: Lightmap = new Lightmap();
				var lightMapData: any = lightMapsData[i];
				if (lightMapData.path) {//兼容
					lightMap.lightmapColor = Loader.getTexture2D(lightMapData.path);
				}
				else {
					lightMap.lightmapColor = Loader.getTexture2D(lightMapData.color.path);
					if (lightMapData.direction)
						lightMap.lightmapDirection = Loader.getTexture2D(lightMapData.direction.path);
				}
				lightmaps[i] = lightMap;
			}
			this.lightmaps = lightmaps;
		}
		var skyData: any = data.sky;
		if (skyData) {
			this._skyRenderer.material = Loader.getRes(skyData.material.path);
			switch (skyData.mesh) {
				case "SkyBox":
					this._skyRenderer.mesh = SkyBox.instance;
					break;
				case "SkyDome":
					this._skyRenderer.mesh = SkyDome.instance;
					break;
				default:
					this.skyRenderer.mesh = SkyBox.instance;
			}
		}
		this.enableFog = data.enableFog;
		this.fogStart = data.fogStart;
		this.fogRange = data.fogRange;
		var fogColorData: any[] = data.fogColor;
		if (fogColorData) {
			var fogCol: Color = this.fogColor;
			fogCol.fromArray(fogColorData);
			this.fogColor = fogCol;
		}
		// 环境光 模式
		var ambientModeData: AmbientMode = data.ambientMode;
		// 单颜色
		var ambientColorData: any[] = data.ambientColor;
		if (ambientColorData) {
			var ambCol: Color = this.ambientColor;
			ambCol.fromArray(ambientColorData);
			this.ambientColor = ambCol;
		}
		if (ambientModeData == AmbientMode.TripleColor) {
			// 三颜色
			let ambientSkyColor: number[] = data.ambientSkyColor;
			this._ambientSkyColor.fromArray(ambientSkyColor);

			let ambientEquatorColor: number[] = data.ambientEquatorColor;
			this._ambientEquatorColor.fromArray(ambientEquatorColor);

			let ambientGroundColor: number[] = data.ambientGroundColor;
			this._ambientGroundColor.fromArray(ambientGroundColor);

			this.setGradientAmbient(this._ambientSkyColor, this._ambientEquatorColor, this._ambientGroundColor);
		}
		// skybox
		var ambientSphericalHarmonicsData: Array<number> = data.ambientSphericalHarmonics;
		if (ambientSphericalHarmonicsData) {
			var ambientSH: SphericalHarmonicsL2 = this.ambientSphericalHarmonics;
			for (var i: number = 0; i < 3; i++) {
				var off: number = i * 9;
				ambientSH.setCoefficients(i, ambientSphericalHarmonicsData[off], ambientSphericalHarmonicsData[off + 1], ambientSphericalHarmonicsData[off + 2], ambientSphericalHarmonicsData[off + 3], ambientSphericalHarmonicsData[off + 4], ambientSphericalHarmonicsData[off + 5], ambientSphericalHarmonicsData[off + 6], ambientSphericalHarmonicsData[off + 7], ambientSphericalHarmonicsData[off + 8]);
			}
			this.ambientSphericalHarmonics = ambientSH;
		}
		(ambientModeData != undefined) && (this.ambientMode = ambientModeData);
		var reflectionData: string = data.reflection;
		(reflectionData != undefined) && (this.reflection = Loader.getRes(reflectionData));
		var reflectionDecodingFormatData: number = data.reflectionDecodingFormat;
		(reflectionDecodingFormatData != undefined) && (this.reflectionDecodingFormat = reflectionDecodingFormatData);
		var ambientSphericalHarmonicsIntensityData: number = data.ambientSphericalHarmonicsIntensity;
		(ambientSphericalHarmonicsIntensityData != undefined) && (this.ambientSphericalHarmonicsIntensity = ambientSphericalHarmonicsIntensityData);
		var reflectionIntensityData: number = data.reflectionIntensity;
		(reflectionIntensityData != undefined) && (this.reflectionIntensity = reflectionIntensityData);
	}

	/**
	 * @internal
	 */
	_addRenderObject(render: BaseRender): void {
		// if (this._octree && render._supportOctree) {
		// 	this._octree.addRender(render);
		// } else {
		//this._renders.add(render);
		this._sceneRenderManager.addRenderObject(render);
		// }
		render._addReflectionProbeUpdate();
	}

	/**
	 * @internal
	 */
	_removeRenderObject(render: BaseRender): void {
		// if (this._octree && render._supportOctree) {
		// 	this._octree.removeRender(render);
		// } else {
		this._sceneRenderManager.removeRenderObject(render);
		//this._renders.remove(render);
		// }
	}

	/**
	 * @internal
	 */
	_getRenderQueue(index: number): BaseRenderQueue {
		if (index <= 2500)//2500作为队列临界点
			return this._opaqueQueue;
		else
			return this._transparentQueue;
	}

	// /**
	//  * @internal
	//  */
	// _setShaderValue(index: number, value: any) {
	// 	if (this._sceneUniformData && this._sceneUniformData._has(index))
	// 		this._sceneUniformData._setData(index, value);
	// 	this._shaderValues.setShaderData(index, value);
	// }

	// /**
	//  * @internal
	//  */
	// _getShaderValue(index: number): any {
	// 	return this._shaderValues.getValueData(index);
	// }
	/**
	 * @internal
	 */
	_clearRenderQueue(): void {
		this._opaqueQueue.clear();
		this._transparentQueue.clear();
		var staticBatchManagers: StaticBatchManager[] = StaticBatchManager._managers;
		for (var i: number = 0, n: number = staticBatchManagers.length; i < n; i++)
			staticBatchManagers[i]._clear();
		var dynamicBatchManagers: DynamicBatchManager[] = DynamicBatchManager._managers;
		for (var i: number = 0, n: number = dynamicBatchManagers.length; i < n; i++)
			dynamicBatchManagers[i]._clear();
	}

	/**
	 * @inheritDoc
	 * @override
	 * 删除资源
	 */
	destroy(destroyChild: boolean = true): void {
		if (this.destroyed)
			return;
		super.destroy(destroyChild);
		this._nativeObj = null;
		this._skyRenderer.destroy();
		this._skyRenderer = null;
		this._directionLights = null;
		this._pointLights = null;
		this._spotLights = null;
		this._alternateLights = null;
		this._shaderValues = null;
		this.sceneRenderableManager.destroy();
		this._sceneRenderManager = null
		this._cameraPool = null;
		// this._octree = null;
		this._physicsSimulation && this._physicsSimulation._destroy();
		this._reflection._removeReference();
		this._reflection = null;
		var maps: Lightmap[] = this._lightmaps;
		if (maps) {
			for (var i: number = 0, n: number = maps.length; i < n; i++) {
				var map: Lightmap = maps[i];
				map.lightmapColor && map.lightmapColor._removeReference();
				map.lightmapDirection && map.lightmapDirection._removeReference();
			}
		}
		this._lightmaps = null;
		this._reflectionProbeManager.destroy();
		this._componentManager.callComponentDestroy();
		this._componentManager.destroy();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	render(ctx: Context): void {
		if (this._children.length > 0) {
			ctx.addRenderObject3D(this);
		}
	}

	/**
	 * 渲染入口
	 */
	renderSubmit(): number {
		BufferState._curBindedBufferState && BufferState._curBindedBufferState.unBind();
		this._prepareSceneToRender();
		var i: number, n: number, n1: number;
		Scene3D._updateMark++;
		// if (this._sceneUniformData) {
		// 	this._sceneUniformObj && this._sceneUniformObj.setDataByUniformBufferData(this._sceneUniformData);
		// }
		for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
			// if (Render.supportWebGLPlusRendering)
			// 	ShaderData.setRuntimeValueMode((i == n1) ? true : false);
			var camera: Camera = (<Camera>this._cameraPool[i]);

			if (camera.renderTarget)
				(camera.enableBuiltInRenderTexture = false);//TODO:可能会有性能问题
			else
				camera.enableBuiltInRenderTexture = true;

			camera.enableRender && camera.render();
			Scene3D._blitTransRT = null;
			if (camera.enableRender && !camera.renderTarget) {
				(Scene3D._blitTransRT = camera._internalRenderTexture);
				var canvasWidth: number = camera._getCanvasWidth(), canvasHeight: number = camera._getCanvasHeight();
				Scene3D._blitOffset.setValue(camera.viewport.x / canvasWidth, camera.viewport.y / canvasHeight, camera.viewport.width / canvasWidth, camera.viewport.height / canvasHeight);
				this.blitMainCanvans(Scene3D._blitTransRT, camera.normalizedViewport);
			}

		}
		Context.set2DRenderConfig();//还原2D配置
		return 1;
	}

	blitMainCanvans(source: BaseTexture, normalizeViewPort: Viewport) {
		if (!source)
			return;
		Scene3D.mainCavansViewPort.x = RenderContext3D.clientWidth * normalizeViewPort.x | 0;
		Scene3D.mainCavansViewPort.y = RenderContext3D.clientHeight * normalizeViewPort.y | 0;
		Scene3D.mainCavansViewPort.width = RenderContext3D.clientWidth * normalizeViewPort.width | 0;
		Scene3D.mainCavansViewPort.height = RenderContext3D.clientHeight * normalizeViewPort.height | 0;
		source.filterMode = FilterMode.Bilinear;
		var cmd = BlitFrameBufferCMD.create(source, null, Scene3D.mainCavansViewPort);
		cmd.run();
		cmd.recover();
	}

	/**
	 * 获得渲染类型
	 */
	getRenderType(): number {
		return 0;
	}

	/**
	 * 删除渲染
	 */
	releaseRender(): void {
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
	 */
	get customReflection(): TextureCube {
		return this._reflection;
	}

	set customReflection(value: TextureCube) {
		if (this._reflection != value) {
			value._addReference();
			this._reflectionProbeManager.sceneReflectionProbe = value;
			this._reflection = value;
		}
	}

	/** @internal */
	private _reflectionMode: number = 0;

	/**
	 * @deprecated
	 */
	get reflectionMode(): number {
		return this._reflectionMode;
	}

	set reflectionMode(value: number) {
		this._reflectionMode = value;

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

