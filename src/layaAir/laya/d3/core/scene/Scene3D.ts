import { Config3D } from "../../../../Config3D";
import { ILaya } from "../../../../ILaya";
import { Sprite } from "../../../display/Sprite";
import { LayaGL } from "../../../layagl/LayaGL";
import { Loader } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { Render } from "../../../renders/Render";
import { Context } from "../../../resource/Context";
import { ICreateResource } from "../../../resource/ICreateResource";
import { RenderTextureDepthFormat } from "../../../resource/RenderTextureFormat";
import { Texture2D } from "../../../resource/Texture2D";
import { TextureDecodeFormat } from "../../../resource/TextureDecodeFormat";
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { ISubmit } from "../../../webgl/submit/ISubmit";
import { SubmitBase } from "../../../webgl/submit/SubmitBase";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { Animator } from "../../component/Animator";
import { Script3D } from "../../component/Script3D";
import { SimpleSingletonList } from "../../component/SimpleSingletonList";
import { FrustumCulling, CameraCullInfo } from "../../graphics/FrustumCulling";
import { Cluster } from "../../graphics/renderPath/Cluster";
import { SphericalHarmonicsL2 } from "../../graphics/SphericalHarmonicsL2";
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
import { RenderTexture } from "../../resource/RenderTexture";
import { TextureCube } from "../../resource/TextureCube";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { Utils3D } from "../../utils/Utils3D";
import { BaseCamera } from "../BaseCamera";
import { Camera, CameraClearFlags } from "../Camera";
import { DirectionLight } from "../light/DirectionLight";
import { AlternateLightQueue, LightQueue } from "../light/LightQueue";
import { PointLight } from "../light/PointLight";
import { SpotLight } from "../light/SpotLight";
import { Material } from "../material/Material";
import { PBRMaterial } from "../material/PBRMaterial";
import { PBRRenderQuality } from "../material/PBRRenderQuality";
import { RenderState } from "../material/RenderState";
import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { RenderQueue } from "../render/RenderQueue";
import { BoundsOctree } from "./BoundsOctree";
import { Lightmap } from "./Lightmap";
import { Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";
import { ShadowCasterPass } from "../../shadowMap/ShadowCasterPass";
import { DefineDatas } from "../../shader/DefineDatas";
import { StaticBatchManager } from "../../graphics/StaticBatchManager";
import { DynamicBatchManager } from "../../graphics/DynamicBatchManager";
import { CannonPhysicsSimulation } from "../../physicsCannon/CannonPhysicsSimulation";
import { CannonPhysicsSettings } from "../../physicsCannon/CannonPhysicsSettings";
import { CannonPhysicsComponent } from "../../physicsCannon/CannonPhysicsComponent";
import { VideoTexture } from "../../../resource/VideoTexture";
import { ReflectionProbeManager } from "../reflectionProbe/ReflectionProbeManager";
import { ShaderDataType } from "../../core/render/command/SetShaderDataCMD"
import { Physics3D } from "../../Physics3D";
import { PerformancePlugin } from "../../../utils/Performance";
/**
 * 环境光模式
 */
export enum AmbientMode {
	/** 固定颜色。*/
	SolidColor,
	/** 球谐光照,例如通过天空盒生成的球谐数据。 */
	SphericalHarmonics
}


/**
 * 用于实现3D场景。
 */
export class Scene3D extends Sprite implements ISubmit, ICreateResource {
	/** @internal */
	private static _lightTexture: Texture2D;
	/** @internal */
	private static _lightPixles: Float32Array;
	/** @internal */
	static _shadowCasterPass: ShadowCasterPass = new ShadowCasterPass();

	/**Hierarchy资源。*/
	static HIERARCHY: string = "HIERARCHY";
	/**@internal */
	static physicsSettings: PhysicsSettings;
	/**@internal */
	static cannonPhysicsSettings:CannonPhysicsSettings;
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

	static REFLECTIONMODE_SKYBOX: number = 0;
	static REFLECTIONMODE_CUSTOM: number = 1;

	static SCENERENDERFLAG_RENDERQPAQUE = 0;
	static SCENERENDERFLAG_SKYBOX = 1;
	static SCENERENDERFLAG_RENDERTRANSPARENT = 2;
	/** @internal */
	static FOGCOLOR: number = Shader3D.propertyNameToID("u_FogColor");
	/** @internal */
	static FOGSTART: number = Shader3D.propertyNameToID("u_FogStart");
	/** @internal */
	static FOGRANGE: number = Shader3D.propertyNameToID("u_FogRange");
	/** @internal */
	static DIRECTIONLIGHTCOUNT: number = Shader3D.propertyNameToID("u_DirationLightCount");
	/** @internal */
	static LIGHTBUFFER: number = Shader3D.propertyNameToID("u_LightBuffer");
	/** @internal */
	static CLUSTERBUFFER: number = Shader3D.propertyNameToID("u_LightClusterBuffer");
	/** @internal */
	static SUNLIGHTDIRECTION: number = Shader3D.propertyNameToID("u_SunLight.direction");
	/** @internal */
	static SUNLIGHTDIRCOLOR: number = Shader3D.propertyNameToID("u_SunLight.color");
	/** @internal */
	static AMBIENTSHAR: number = Shader3D.propertyNameToID("u_AmbientSHAr");
	/** @internal */
	static AMBIENTSHAG: number = Shader3D.propertyNameToID("u_AmbientSHAg");
	/** @internal */
	static AMBIENTSHAB: number = Shader3D.propertyNameToID("u_AmbientSHAb");
	/** @internal */
	static AMBIENTSHBR: number = Shader3D.propertyNameToID("u_AmbientSHBr");
	/** @internal */
	static AMBIENTSHBG: number = Shader3D.propertyNameToID("u_AmbientSHBg");
	/** @internal */
	static AMBIENTSHBB: number = Shader3D.propertyNameToID("u_AmbientSHBb");
	/** @internal */
	static AMBIENTSHC: number = Shader3D.propertyNameToID("u_AmbientSHC");

	//------------------legacy lighting-------------------------------
	/** @internal */
	static LIGHTDIRECTION: number = Shader3D.propertyNameToID("u_DirectionLight.direction");
	/** @internal */
	static LIGHTDIRCOLOR: number = Shader3D.propertyNameToID("u_DirectionLight.color");
	/** @internal */
	static POINTLIGHTPOS: number = Shader3D.propertyNameToID("u_PointLight.position");
	/** @internal */
	static POINTLIGHTRANGE: number = Shader3D.propertyNameToID("u_PointLight.range");
	/** @internal */
	static POINTLIGHTATTENUATION: number = Shader3D.propertyNameToID("u_PointLight.attenuation");
	/** @internal */
	static POINTLIGHTCOLOR: number = Shader3D.propertyNameToID("u_PointLight.color");
	/** @internal */
	static SPOTLIGHTPOS: number = Shader3D.propertyNameToID("u_SpotLight.position");
	/** @internal */
	static SPOTLIGHTDIRECTION: number = Shader3D.propertyNameToID("u_SpotLight.direction");
	/** @internal */
	static SPOTLIGHTSPOTANGLE: number = Shader3D.propertyNameToID("u_SpotLight.spot");
	/** @internal */
	static SPOTLIGHTRANGE: number = Shader3D.propertyNameToID("u_SpotLight.range");
	/** @internal */
	static SPOTLIGHTCOLOR: number = Shader3D.propertyNameToID("u_SpotLight.color");
	//------------------legacy lighting-------------------------------
	/** @internal */
	static AMBIENTCOLOR: number = Shader3D.propertyNameToID("u_AmbientColor");
	/** @internal */
	static TIME: number = Shader3D.propertyNameToID("u_Time");

	/** @internal */
	static _configDefineValues: DefineDatas = new DefineDatas();


	/**
	 * @internal
	 */
	static __init__(): void {
		var con: Config3D = Config3D._config;
		var multiLighting: boolean = con._multiLighting;
		if (multiLighting) {
			const width: number = 4;
			var maxLightCount: number = con.maxLightCount;
			var clusterSlices: Vector3 = con.lightClusterCount;
			Cluster.instance = new Cluster(clusterSlices.x, clusterSlices.y, clusterSlices.z, Math.min(con.maxLightCount, con._maxAreaLightCountPerClusterAverage));
			Scene3D._lightTexture = Utils3D._createFloatTextureBuffer(width, maxLightCount);
			Scene3D._lightTexture.lock = true;
			Scene3D._lightPixles = new Float32Array(maxLightCount * width * 4);
		}

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

		var config: Config3D = Config3D._config;
		var configShaderValue: DefineDatas = Scene3D._configDefineValues;
		(config._multiLighting) || (configShaderValue.add(Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING));
		if (LayaGL.layaGPUInstance._isWebGL2)
			configShaderValue.add(Shader3D.SHADERDEFINE_GRAPHICS_API_GLES3);
		else
			configShaderValue.add(Shader3D.SHADERDEFINE_GRAPHICS_API_GLES2);
		switch (config.pbrRenderQuality) {
			case PBRRenderQuality.High:
				configShaderValue.add(PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_HIGH)
				break;
			case PBRRenderQuality.Low:
				configShaderValue.add(PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_LOW)
				break;
			default:
				throw "Scene3D:unknown shader quality.";
		}
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
		ILaya.loader.create(url, complete, null, Scene3D.HIERARCHY);
	}

	/** @internal */
	private _url: string;
	/** @internal */
	private _group: string;
	/** @internal */
	public _lightCount: number = 0;
	/** @internal */
	public _pointLights: LightQueue<PointLight> = new LightQueue();
	/** @internal */
	public _spotLights: LightQueue<SpotLight> = new LightQueue();
	/** @internal */
	public _directionLights: LightQueue<DirectionLight> = new LightQueue();
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
	private _reflection: TextureCube;
	/** @internal */
	private _reflectionDecodeFormat: TextureDecodeFormat = TextureDecodeFormat.Normal;
	/** @internal */
	private _reflectionIntensity: number = 1.0;

	/** @internal */
	_mainDirectionLight: DirectionLight;
	/** @internal */
	_mainSpotLight: SpotLight;
	/** @internal */
	_mainPointLight: PointLight;//TODO
	/** @internal */
	_physicsSimulation: PhysicsSimulation;
	/** @internal */
	_cannonPhysicsSimulation: CannonPhysicsSimulation;
	/** @internal */
	_octree: BoundsOctree;
	/** @internal 只读,不允许修改。*/
	_collsionTestList: number[] = [];

	/** @internal */
	_shaderValues: ShaderData;
	/** @internal */
	_renders: SimpleSingletonList = new SimpleSingletonList();
	/** @internal */
	_opaqueQueue: RenderQueue = new RenderQueue(false);
	/** @internal */
	_transparentQueue: RenderQueue = new RenderQueue(true);
	/** @internal */
	_cameraPool: BaseCamera[] = [];
	/** @internal */
	_animatorPool: SimpleSingletonList = new SimpleSingletonList();
	/** @internal */
	_scriptPool: Script3D[] = new Array<Script3D>();
	/** @internal */
	_tempScriptPool: Script3D[] = new Array<Script3D>();
	/** @internal */
	_needClearScriptPool: boolean = false;
	/**	@internal */
	_reflectionCubeHDRParams: Vector4 = new Vector4();
	/** @internal */
	_reflectionProbeManager: ReflectionProbeManager = new ReflectionProbeManager();



	/** 当前创建精灵所属遮罩层。*/
	currentCreationLayer: number = Math.pow(2, 0);
	/** 是否启用灯光。*/
	enableLight: boolean = true;

	/** @internal */
	_debugTool: PixelLineSprite3D;

	/** @internal */
	_key: SubmitKey = new SubmitKey();

	/** @internal	[NATIVE]*/
	_cullingBufferIndices: Int32Array;
	/** @internal	[NATIVE]*/
	_cullingBufferResult: Int32Array;

	/** @internal [Editer]*/
	_pickIdToSprite: any = new Object();

	/**
	 * 资源的URL地址。
	 */
	get url(): string {
		return this._url;
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
	get fogColor(): Vector3 {
		return this._shaderValues.getVector3(Scene3D.FOGCOLOR);
	}

	set fogColor(value: Vector3) {
		this._shaderValues.setVector3(Scene3D.FOGCOLOR, value);
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
	get ambientColor(): Vector3 {
		return this._shaderValues.getVector3(Scene3D.AMBIENTCOLOR);
	}

	set ambientColor(value: Vector3) {
		this._shaderValues.setVector3(Scene3D.AMBIENTCOLOR, value);
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
		if (this._ambientSphericalHarmonicsIntensity !== value) {
			var originalSH: SphericalHarmonicsL2 = this._ambientSphericalHarmonics || SphericalHarmonicsL2._default;
			this._applySHCoefficients(originalSH, Math.pow(value, 2.2));//Gamma to Linear,I prefer use 'Color.gammaToLinearSpace',but must same with Unity now.
			this._ambientSphericalHarmonicsIntensity = value;
		}
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
		if (!Config3D._config.isUseCannonPhysicsEngine && Physics3D._bullet)
			this._physicsSimulation = new PhysicsSimulation(Scene3D.physicsSettings);
		else if (Physics3D._cannon) {
			this._cannonPhysicsSimulation = new CannonPhysicsSimulation(Scene3D.cannonPhysicsSettings);
		}


		this._shaderValues = new ShaderData(null);

		this.enableFog = false;
		this.fogStart = 300;
		this.fogRange = 1000;
		this.fogColor = new Vector3(0.7, 0.7, 0.7);
		this.ambientColor = new Vector3(0.212, 0.227, 0.259);
		this.reflectionIntensity = 1.0;
		this.reflection = TextureCube.blackTexture;
		for (var i: number = 0; i < 7; i++)
			this._shCoefficients[i] = new Vector4();

		this._reflectionProbeManager.sceneReflectionCubeHDRParam = this._reflectionCubeHDRParams;


		//this._shaderValues.setTexture(Scene3D.RANGEATTENUATIONTEXTURE, ShaderInit3D._rangeAttenTex);//TODO:

		//var angleAttenTex:Texture2D = Texture2D.buildTexture2D(64, 64, BaseTexture.FORMAT_Alpha8, TextureGenerator.haloTexture);
		//_shaderValues.setTexture(Scene3D.ANGLEATTENUATIONTEXTURE, angleAttenTex);
		this._scene = this;
		this._input.__init__(Render.canvas, this);

		if (Scene3D.octreeCulling)
			this._octree = new BoundsOctree(Scene3D.octreeInitialSize, Scene3D.octreeInitialCenter, Scene3D.octreeMinNodeSize, Scene3D.octreeLooseness);

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

		var shaderValues: ShaderData = this._shaderValues;
		shaderValues.setVector(Scene3D.AMBIENTSHAR, optSH[0]);
		shaderValues.setVector(Scene3D.AMBIENTSHAG, optSH[1]);
		shaderValues.setVector(Scene3D.AMBIENTSHAB, optSH[2]);
		shaderValues.setVector(Scene3D.AMBIENTSHBR, optSH[3]);
		shaderValues.setVector(Scene3D.AMBIENTSHBG, optSH[4]);
		shaderValues.setVector(Scene3D.AMBIENTSHBB, optSH[5]);
		shaderValues.setVector(Scene3D.AMBIENTSHC, optSH[6]);
	}

	/**
	 *@internal
	 */
	private _update(): void {
		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D);
		var delta: number = this.timer._delta / 1000;
		this._time += delta;
		this._shaderValues.setNumber(Scene3D.TIME, this._time);
		//Physics
		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS);
		var simulation: PhysicsSimulation = this._physicsSimulation;
		if (Physics3D._enablePhysics && !PhysicsSimulation.disableSimulation && !Config3D._config.isUseCannonPhysicsEngine) {
			simulation._updatePhysicsTransformFromRender();
			PhysicsComponent._addUpdateList = false;//物理模拟器会触发_updateTransformComponent函数,不加入更新队列
			//simulate physics
			PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE);
			simulation._simulate(delta);
			PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE);
			//update character sprite3D transforms from physics engine simulation
			PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION);
			simulation._updateCharacters();
			PhysicsComponent._addUpdateList = true;
			//handle frame contacts
			simulation._updateCollisions();
			PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION);
			
			PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS);
			//send contact events
			simulation._eventScripts();
			PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS);
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
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_PHYSICS);
		//update Scripts
		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_UPDATESCRIPT);
		this._input._update();

		this._clearScript();
		this._updateScript();
		Animator._update(this);
		VideoTexture._update();
		if (this._reflectionProbeManager._needUpdateAllRender)
			this._reflectionProbeManager.updateAllRenderObjects(this._renders);
		else
			this._reflectionProbeManager.update();
		this._lateUpdateScript();
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_UPDATESCRIPT);
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D);
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
	 * @param url 路径
	 */
	_setCreateURL(url: string): void {
		this._url = URL.formatURL(url);
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
	 */
	private _clearScript(): void {
		if (this._needClearScriptPool) {
			var scripts: Script3D[] = this._scriptPool;
			for (var i: number = 0, n: number = scripts.length; i < n; i++) {
				var script: Script3D = scripts[i];
				if (script) {
					script._indexInPool = this._tempScriptPool.length;
					this._tempScriptPool.push(script);
				}
			}
			this._scriptPool = this._tempScriptPool;
			scripts.length = 0;
			this._tempScriptPool = scripts;

			this._needClearScriptPool = false;
		}
	}

	/**
	 * @internal
	 */
	private _updateScript(): void {
		var scripts: Script3D[] = this._scriptPool;
		for (var i: number = 0, n: number = scripts.length; i < n; i++) {
			var script: Script3D = scripts[i];
			(script && script.enabled) && (script.onUpdate());
		}
	}

	/**
	 * @internal
	 */
	private _lateUpdateScript(): void {
		var scripts: Script3D[] = this._scriptPool;
		for (var i: number = 0, n: number = scripts.length; i < n; i++) {
			var script: Script3D = (<Script3D>scripts[i]);
			(script && script.enabled) && (script.onLateUpdate());
		}
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
			var dirElements: DirectionLight[] = this._directionLights._elements;
			if (dirCount > 0) {
				var sunLightIndex: number = this._directionLights.getBrightestLight();//get the brightest light as sun
				this._mainDirectionLight = dirElements[sunLightIndex];
				this._directionLights.normalLightOrdering(sunLightIndex);
				for (var i: number = 0; i < dirCount; i++, curCount++) {
					var dirLight: DirectionLight = dirElements[i];
					var dir: Vector3 = dirLight._direction;
					var intCor: Vector3 = dirLight._intensityColor;
					var off: number = floatWidth * curCount;
					Vector3.scale(dirLight.color, dirLight._intensity, intCor);
					dirLight.transform.worldMatrix.getForward(dir);
					Vector3.normalize(dir, dir);//矩阵有缩放时需要归一化
					ligPix[off] = intCor.x;
					ligPix[off + 1] = intCor.y;
					ligPix[off + 2] = intCor.z;
					ligPix[off + 4] = dir.x;
					ligPix[off + 5] = dir.y;
					ligPix[off + 6] = dir.z;
					if (i == 0) {
						shaderValues.setVector3(Scene3D.SUNLIGHTDIRCOLOR, intCor);
						shaderValues.setVector3(Scene3D.SUNLIGHTDIRECTION, dir);
					}
				}
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}

			var poiCount: number = this._pointLights._length;
			if (poiCount > 0) {
				var poiElements: PointLight[] = this._pointLights._elements;
				var mainPointLightIndex: number = this._pointLights.getBrightestLight();
				this._mainPointLight = poiElements[mainPointLightIndex];
				this._pointLights.normalLightOrdering(mainPointLightIndex);
				for (var i: number = 0; i < poiCount; i++, curCount++) {
					var poiLight: PointLight = poiElements[i];
					var pos: Vector3 = poiLight.transform.position;
					var intCor: Vector3 = poiLight._intensityColor;
					var off: number = floatWidth * curCount;
					Vector3.scale(poiLight.color, poiLight._intensity, intCor);
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
				var spoElements: SpotLight[] = this._spotLights._elements;
				var mainSpotLightIndex: number = this._spotLights.getBrightestLight();
				this._mainSpotLight = spoElements[mainSpotLightIndex];
				this._spotLights.normalLightOrdering(mainSpotLightIndex)
				for (var i: number = 0; i < spoCount; i++, curCount++) {
					var spoLight: SpotLight = spoElements[i];
					var dir: Vector3 = spoLight._direction;
					var pos: Vector3 = spoLight.transform.position;
					var intCor: Vector3 = spoLight._intensityColor;
					var off: number = floatWidth * curCount;
					Vector3.scale(spoLight.color, spoLight._intensity, intCor);
					spoLight.transform.worldMatrix.getForward(dir);
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

			(curCount > 0) && (ligTex.setSubPixels(0, 0, pixelWidth, curCount, ligPix, 0));
			shaderValues.setTexture(Scene3D.LIGHTBUFFER, ligTex);
			shaderValues.setInt(Scene3D.DIRECTIONLIGHTCOUNT, this._directionLights._length);
			shaderValues.setTexture(Scene3D.CLUSTERBUFFER, Cluster.instance._clusterTexture);
		}
		else {
			if (this._directionLights._length > 0) {
				var dirLight: DirectionLight = this._directionLights._elements[0];
				this._mainDirectionLight = dirLight;
				Vector3.scale(dirLight.color, dirLight._intensity, dirLight._intensityColor);

				dirLight.transform.worldMatrix.getForward(dirLight._direction);
				Vector3.normalize(dirLight._direction, dirLight._direction);
				shaderValues.setVector3(Scene3D.LIGHTDIRCOLOR, dirLight._intensityColor);
				shaderValues.setVector3(Scene3D.LIGHTDIRECTION, dirLight._direction);
				shaderValues.setVector3(Scene3D.SUNLIGHTDIRCOLOR, dirLight._intensityColor);
				shaderValues.setVector3(Scene3D.SUNLIGHTDIRECTION, dirLight._direction);
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			if (this._pointLights._length > 0) {
				var poiLight: PointLight = this._pointLights._elements[0];
				this._mainPointLight = poiLight;
				Vector3.scale(poiLight.color, poiLight._intensity, poiLight._intensityColor);
				shaderValues.setVector3(Scene3D.POINTLIGHTCOLOR, poiLight._intensityColor);
				shaderValues.setVector3(Scene3D.POINTLIGHTPOS, poiLight.transform.position);
				shaderValues.setNumber(Scene3D.POINTLIGHTRANGE, poiLight.range);
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			else {
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			if (this._spotLights._length > 0) {
				var spotLight: SpotLight = this._spotLights._elements[0];
				this._mainSpotLight = spotLight;
				Vector3.scale(spotLight.color, spotLight._intensity, spotLight._intensityColor);
				shaderValues.setVector3(Scene3D.SPOTLIGHTCOLOR, spotLight._intensityColor);
				shaderValues.setVector3(Scene3D.SPOTLIGHTPOS, spotLight.transform.position);
				spotLight.transform.worldMatrix.getForward(spotLight._direction);
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
	_addScript(script: Script3D): void {
		var scripts: Script3D[] = this._scriptPool;
		script._indexInPool = scripts.length;
		scripts.push(script);
	}

	/**
	 * @internal
	 */
	_removeScript(script: Script3D): void {
		this._scriptPool[script._indexInPool] = null;
		script._indexInPool = -1;
		this._needClearScriptPool = true;
	}

	/**
	 * @internal
	 */
	_preRenderScript(): void {
		var scripts: Script3D[] = this._scriptPool;
		for (var i: number = 0, n: number = scripts.length; i < n; i++) {
			var script: Script3D = scripts[i];
			(script && script.enabled) && (script.onPreRender());
		}
	}

	/**
	 * @internal
	 */
	_postRenderScript(): void {
		var scripts: Script3D[] = this._scriptPool;
		for (var i: number = 0, n: number = scripts.length; i < n; i++) {
			var script: Script3D = scripts[i];
			(script && script.enabled) && (script.onPostRender());
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
	_preCulling(context: RenderContext3D, camera: Camera, shader: Shader3D, replacementTag: string): void {
		var cameraCullInfo: CameraCullInfo = FrustumCulling._cameraCullInfo;
		cameraCullInfo.position = camera._transform.position;
		cameraCullInfo.cullingMask = camera.cullingMask;
		cameraCullInfo.boundFrustum = camera.boundFrustum;
		cameraCullInfo.useOcclusionCulling = camera.useOcclusionCulling;
		FrustumCulling.renderObjectCulling(cameraCullInfo, this, context, shader, replacementTag, false);
	}

	/**
	 * @internal
	 */
	_clear(gl: WebGLRenderingContext, state: RenderContext3D): void {
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
		gl.viewport(vpX, vpY, vpW, vpH);

		var flag: number;
		var clearFlag: number = camera.clearFlag;
		if (clearFlag === CameraClearFlags.Sky && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
			clearFlag = CameraClearFlags.SolidColor;

		switch (clearFlag) {
			case CameraClearFlags.SolidColor:
				var clearColor: Vector4 = camera.clearColor;
				gl.enable(gl.SCISSOR_TEST);
				gl.scissor(vpX, vpY, vpW, vpH);
				if (clearColor)
					gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
				else
					gl.clearColor(0, 0, 0, 0);
				if (renderTex) {
					flag = gl.COLOR_BUFFER_BIT;
					switch (renderTex.depthStencilFormat) {
						case RenderTextureDepthFormat.DEPTH_16:
							flag |= gl.DEPTH_BUFFER_BIT;
							break;
						case RenderTextureDepthFormat.STENCIL_8:
							flag |= gl.STENCIL_BUFFER_BIT;
							break;
						case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
							flag |= gl.DEPTH_BUFFER_BIT;
							flag |= gl.STENCIL_BUFFER_BIT;
							break;
					}
				} else {
					flag = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
				}
				WebGLContext.setDepthMask(gl, true);
				gl.clear(flag);
				gl.disable(gl.SCISSOR_TEST);
				break;
			case CameraClearFlags.Sky:
			case CameraClearFlags.DepthOnly:
				gl.enable(gl.SCISSOR_TEST);
				gl.scissor(vpX, vpY, vpW, vpH);
				if (renderTex) {
					switch (renderTex.depthStencilFormat) {
						case RenderTextureDepthFormat.DEPTH_16:
							flag = gl.DEPTH_BUFFER_BIT;
							break;
						case RenderTextureDepthFormat.STENCIL_8:
							flag = gl.STENCIL_BUFFER_BIT;
							break;
						case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
							flag = gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
							break;
					}
				} else {
					flag = gl.DEPTH_BUFFER_BIT;
				}
				WebGLContext.setDepthMask(gl, true);
				gl.clear(flag);
				gl.disable(gl.SCISSOR_TEST);
				break;
			case CameraClearFlags.Nothing:
				break;
			default:
				throw new Error("Scene3D:camera clearFlag invalid.");
		}
	}

	/**
	 * @internal 渲染Scene的各个管线
	 */
	_renderScene(context: RenderContext3D, renderFlag: number): void {
		var camera: Camera = <Camera>context.camera;
		switch (renderFlag) {
			case Scene3D.SCENERENDERFLAG_RENDERQPAQUE:
				this._opaqueQueue._render(context);//非透明队列
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
				this._transparentQueue._render(context);//透明队列
				if (FrustumCulling.debugFrustumCulling) {
					var renderElements: RenderElement[] = this._debugTool._render._renderElements;
					for (var i: number = 0, n: number = renderElements.length; i < n; i++) {
						renderElements[i]._update(this, context, null, null);
						renderElements[i]._render(context);
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
					lightMap.lightmapColor = Loader.getRes(lightMapData.path);
				}
				else {
					lightMap.lightmapColor = Loader.getRes(lightMapData.color.path);
					if (lightMapData.direction)
						lightMap.lightmapDirection = Loader.getRes(lightMapData.direction.path);
				}
				lightmaps[i] = lightMap;
			}
			this.lightmaps = lightmaps;
		}

		var ambientColorData: any[] = data.ambientColor;
		if (ambientColorData) {
			var ambCol: Vector3 = this.ambientColor;
			ambCol.fromArray(ambientColorData);
			this.ambientColor = ambCol;
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
			var fogCol: Vector3 = this.fogColor;
			fogCol.fromArray(fogColorData);
			this.fogColor = fogCol;
		}

		var ambientSphericalHarmonicsData: Array<number> = data.ambientSphericalHarmonics;
		if (ambientSphericalHarmonicsData) {
			var ambientSH: SphericalHarmonicsL2 = this.ambientSphericalHarmonics;
			for (var i: number = 0; i < 3; i++) {
				var off: number = i * 9;
				ambientSH.setCoefficients(i, ambientSphericalHarmonicsData[off], ambientSphericalHarmonicsData[off + 1], ambientSphericalHarmonicsData[off + 2], ambientSphericalHarmonicsData[off + 3], ambientSphericalHarmonicsData[off + 4], ambientSphericalHarmonicsData[off + 5], ambientSphericalHarmonicsData[off + 6], ambientSphericalHarmonicsData[off + 7], ambientSphericalHarmonicsData[off + 8]);
			}
			this.ambientSphericalHarmonics = ambientSH;
		}
		var reflectionData: string = data.reflection;
		(reflectionData != undefined) && (this.reflection = Loader.getRes(reflectionData));

		var reflectionDecodingFormatData: number = data.reflectionDecodingFormat;
		(reflectionDecodingFormatData != undefined) && (this.reflectionDecodingFormat = reflectionDecodingFormatData);

		var ambientModeData: AmbientMode = data.ambientMode;
		(ambientModeData != undefined) && (this.ambientMode = ambientModeData);

		var ambientSphericalHarmonicsIntensityData: number = data.ambientSphericalHarmonicsIntensity;
		(ambientSphericalHarmonicsIntensityData != undefined) && (this.ambientSphericalHarmonicsIntensity = ambientSphericalHarmonicsIntensityData);
		var reflectionIntensityData: number = data.reflectionIntensity;
		(reflectionIntensityData != undefined) && (this.reflectionIntensity = reflectionIntensityData);
	}


	/**
	 * @internal
	 */
	_addRenderObject(render: BaseRender): void {
		if (this._octree && render._supportOctree) {
			this._octree.add(render);
		} else {
			this._renders.add(render);
		}
		render._addReflectionProbeUpdate();
	}

	/**
	 * @internal
	 */
	_removeRenderObject(render: BaseRender): void {
		if (this._octree && render._supportOctree) {
			this._octree.remove(render);
		} else {
			this._renders.remove(render);
		}
	}

	/**
	 * @internal
	 */
	_getRenderQueue(index: number): RenderQueue {
		if (index <= 2500)//2500作为队列临界点
			return this._opaqueQueue;
		else
			return this._transparentQueue;
	}

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
		this._skyRenderer.destroy();
		this._skyRenderer = null;
		this._directionLights = null;
		this._pointLights = null;
		this._spotLights = null;
		this._alternateLights = null;
		this._shaderValues = null;
		this._renders = null;
		this._cameraPool = null;
		this._octree = null;
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
		Loader.clearRes(this.url);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	render(ctx: Context): void {
		//TODO:外层应该设计为接口调用
		ctx._curSubmit = SubmitBase.RENDERBASE;//打断2D合并的renderKey
		this._children.length > 0 && ctx.addRenderObject(this);
	}

	/**
	 * 渲染入口
	 */
	renderSubmit(): number {
		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D);
		this._prepareSceneToRender();
		var i: number, n: number, n1: number;
		PerformancePlugin.begainSample(PerformancePlugin.PERFORMANCE_LAYA_3D_RENDER);
			
		for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
			if (Render.supportWebGLPlusRendering)
				ShaderData.setRuntimeValueMode((i == n1) ? true : false);
			var camera: Camera = (<Camera>this._cameraPool[i]);
			camera.enableRender && camera.render();
		}
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D_RENDER);
		Context.set2DRenderConfig();//还原2D配置
		PerformancePlugin.endSample(PerformancePlugin.PERFORMANCE_LAYA_3D);
		return 1;
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
	setGlobalShaderValue(name: string, shaderDataType: ShaderDataType, value: any) {
		var shaderOffset = Shader3D.propertyNameToID(name);
		switch (shaderDataType) {
			case ShaderDataType.Int:
				this._shaderValues.setInt(shaderOffset, value);
				break;
			case ShaderDataType.Number:
				this._shaderValues.setNumber(shaderOffset, value);
				break;
			case ShaderDataType.Bool:
				this._shaderValues.setBool(shaderOffset, value);
				break;
			case ShaderDataType.Matrix4x4:
				this._shaderValues.setMatrix4x4(shaderOffset, value);
				break;
			case ShaderDataType.Quaternion:
				this._shaderValues.setQuaternion(shaderOffset, value);
				break;
			case ShaderDataType.Texture:
				this._shaderValues.setTexture(shaderOffset, value);
				break;
			case ShaderDataType.Vector4:
				this._shaderValues.setVector(shaderOffset, value);
				break;
			case ShaderDataType.Vector2:
				this._shaderValues.setVector2(shaderOffset, value);
				break;
			case ShaderDataType.Vector3:
				this._shaderValues.setVector3(shaderOffset, value);
				break;
			case ShaderDataType.Buffer:
				this._shaderValues.setBuffer(shaderOffset, value);
				break;
		}

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

