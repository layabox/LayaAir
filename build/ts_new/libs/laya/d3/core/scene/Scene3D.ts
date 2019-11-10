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
import { Handler } from "../../../utils/Handler";
import { Timer } from "../../../utils/Timer";
import { ISubmit } from "../../../webgl/submit/ISubmit";
import { SubmitBase } from "../../../webgl/submit/SubmitBase";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { Animator } from "../../component/Animator";
import { Script3D } from "../../component/Script3D";
import { SimpleSingletonList } from "../../component/SimpleSingletonList";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { Cluster } from "../../graphics/renderPath/Cluster";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Viewport } from "../../math/Viewport";
import { Physics3D } from "../../physics/Physics3D";
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
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
import { Utils3D } from "../../utils/Utils3D";
import { BaseCamera } from "../BaseCamera";
import { Camera } from "../Camera";
import { DirectionLight } from "../light/DirectionLight";
import { AlternateLightQueue, DirectionLightQueue, LightQueue } from "../light/LightQueue";
import { PointLight } from "../light/PointLight";
import { SpotLight } from "../light/SpotLight";
import { Material } from "../material/Material";
import { RenderState } from "../material/RenderState";
import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { RenderQueue } from "../render/RenderQueue";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Sprite3D } from "../Sprite3D";
import { BoundsOctree } from "./BoundsOctree";
import { Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";


/**
 * <code>Scene3D</code> 类用于实现场景。
 */
export class Scene3D extends Sprite implements ISubmit, ICreateResource {
	/** @internal */
	public static _lightTexture: Texture2D;
	/** @internal */
	public static _lightPixles: Float32Array;

	/**Hierarchy资源。*/
	static HIERARCHY: string = "HIERARCHY";
	/**@internal */
	static physicsSettings: PhysicsSettings = new PhysicsSettings();
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

	static FOGCOLOR: number = Shader3D.propertyNameToID("u_FogColor");
	static FOGSTART: number = Shader3D.propertyNameToID("u_FogStart");
	static FOGRANGE: number = Shader3D.propertyNameToID("u_FogRange");

	static DIRECTIONLIGHTCOUNT: number = Shader3D.propertyNameToID("u_DirationLightCount");
	static LIGHTBUFFER: number = Shader3D.propertyNameToID("u_LightBuffer");
	static CLUSTERBUFFER: number = Shader3D.propertyNameToID("u_LightClusterBuffer");
	static SUNLIGHTDIRECTION: number = Shader3D.propertyNameToID("u_SunLight.direction");
	static SUNLIGHTDIRCOLOR: number = Shader3D.propertyNameToID("u_SunLight.color");

	//------------------legacy lighting-------------------------------
	static LIGHTDIRECTION: number = Shader3D.propertyNameToID("u_DirectionLight.direction");
	static LIGHTDIRCOLOR: number = Shader3D.propertyNameToID("u_DirectionLight.color");
	static POINTLIGHTPOS: number = Shader3D.propertyNameToID("u_PointLight.position");
	static POINTLIGHTRANGE: number = Shader3D.propertyNameToID("u_PointLight.range");
	static POINTLIGHTATTENUATION: number = Shader3D.propertyNameToID("u_PointLight.attenuation");
	static POINTLIGHTCOLOR: number = Shader3D.propertyNameToID("u_PointLight.color");
	static SPOTLIGHTPOS: number = Shader3D.propertyNameToID("u_SpotLight.position");
	static SPOTLIGHTDIRECTION: number = Shader3D.propertyNameToID("u_SpotLight.direction");
	static SPOTLIGHTSPOTANGLE: number = Shader3D.propertyNameToID("u_SpotLight.spot");
	static SPOTLIGHTRANGE: number = Shader3D.propertyNameToID("u_SpotLight.range");
	static SPOTLIGHTCOLOR: number = Shader3D.propertyNameToID("u_SpotLight.color");
	//------------------legacy lighting-------------------------------


	static SHADOWDISTANCE: number = Shader3D.propertyNameToID("u_shadowPSSMDistance");
	static SHADOWLIGHTVIEWPROJECT: number = Shader3D.propertyNameToID("u_lightShadowVP");
	static SHADOWMAPPCFOFFSET: number = Shader3D.propertyNameToID("u_shadowPCFoffset");
	static SHADOWMAPTEXTURE1: number = Shader3D.propertyNameToID("u_shadowMap1");
	static SHADOWMAPTEXTURE2: number = Shader3D.propertyNameToID("u_shadowMap2");
	static SHADOWMAPTEXTURE3: number = Shader3D.propertyNameToID("u_shadowMap3");

	static AMBIENTCOLOR: number = Shader3D.propertyNameToID("u_AmbientColor");
	static REFLECTIONTEXTURE: number = Shader3D.propertyNameToID("u_ReflectTexture");
	static REFLETIONINTENSITY: number = Shader3D.propertyNameToID("u_ReflectIntensity");
	static TIME: number = Shader3D.propertyNameToID("u_Time");


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
		Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW = Shader3D.getDefineByName("CASTSHADOW");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1 = Shader3D.getDefineByName("SHADOWMAP_PSSM1");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2 = Shader3D.getDefineByName("SHADOWMAP_PSSM2");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3 = Shader3D.getDefineByName("SHADOWMAP_PSSM3");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO = Shader3D.getDefineByName("SHADOWMAP_PCF_NO");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1 = Shader3D.getDefineByName("SHADOWMAP_PCF1");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2 = Shader3D.getDefineByName("SHADOWMAP_PCF2");
		Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3 = Shader3D.getDefineByName("SHADOWMAP_PCF3");
		Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP = Shader3D.getDefineByName("REFLECTMAP");
	}


	/**
	 * 加载场景,注意:不缓存。
	 * @param url 模板地址。
	 * @param complete 完成回调。
	 */
	static load(url: string, complete: Handler): void {
		ILaya.loader.create(url, complete, null, Scene3D.HIERARCHY);
	}

	/**@internal */
	private _url: string;
	/**@internal */
	private _group: string;
	/**@internal */
	public _lightCount: number = 0;
	/** @internal */
	public _pointLights: LightQueue<PointLight> = new LightQueue();
	/** @internal */
	public _spotLights: LightQueue<SpotLight> = new LightQueue();
	/** @internal */
	public _directionLights: DirectionLightQueue = new DirectionLightQueue();
	/** @internal */
	public _alternateLights: AlternateLightQueue = new AlternateLightQueue();

	/** @internal */
	private _lightmaps: Texture2D[] = [];
	/** @internal */
	private _skyRenderer: SkyRenderer = new SkyRenderer();
	/** @internal */
	private _reflectionMode: number = 1;
	/** @internal */
	private _enableFog: boolean;
	/** @internal */
	_physicsSimulation: PhysicsSimulation;
	/** @internal */
	private _input: Input3D = new Input3D();
	/** @internal */
	private _timer: Timer = ILaya.timer;

	/**@internal */
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
	/** @internal 相机的对象池*/
	_cameraPool: BaseCamera[] = [];
	/** @internal */
	_animatorPool: SimpleSingletonList = new SimpleSingletonList();
	/** @internal */
	_scriptPool: Script3D[] = new Array<Script3D>();
	/** @internal */
	_tempScriptPool: Script3D[] = new Array<Script3D>();
	/** @internal */
	_needClearScriptPool: boolean = false;

	/** 当前创建精灵所属遮罩层。*/
	currentCreationLayer: number = Math.pow(2, 0);
	/** 是否启用灯光。*/
	enableLight: boolean = true;

	//阴影相关变量
	parallelSplitShadowMaps: ParallelSplitShadowMap[];
	/** @internal */
	_debugTool: PixelLineSprite3D;

	/** @internal */
	_key: SubmitKey = new SubmitKey();

	private _time: number = 0;

	/** @internal	[NATIVE]*/
	_cullingBufferIndices: Int32Array;
	/** @internal	[NATIVE]*/
	_cullingBufferResult: Int32Array;

	/** @internal [Editer]*/
	_pickIdToSprite: any = new Object();

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
	 * 获取资源的URL地址。
	 * @return URL地址。
	 */
	get url(): string {
		return this._url;
	}

	/**
	 * 获取是否允许雾化。
	 * @return 是否允许雾化。
	 */
	get enableFog(): boolean {
		return this._enableFog;
	}

	/**
	 * 设置是否允许雾化。
	 * @param value 是否允许雾化。
	 */
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
	 * 获取雾化颜色。
	 * @return 雾化颜色。
	 */
	get fogColor(): Vector3 {
		return (<Vector3>this._shaderValues.getVector3(Scene3D.FOGCOLOR));
	}

	/**
	 * 设置雾化颜色。
	 * @param value 雾化颜色。
	 */
	set fogColor(value: Vector3) {
		this._shaderValues.setVector3(Scene3D.FOGCOLOR, value);
	}

	/**
	 * 获取雾化起始位置。
	 * @return 雾化起始位置。
	 */
	get fogStart(): number {
		return this._shaderValues.getNumber(Scene3D.FOGSTART);
	}

	/**
	 * 设置雾化起始位置。
	 * @param value 雾化起始位置。
	 */
	set fogStart(value: number) {
		this._shaderValues.setNumber(Scene3D.FOGSTART, value);
	}

	/**
	 * 获取雾化范围。
	 * @return 雾化范围。
	 */
	get fogRange(): number {
		return this._shaderValues.getNumber(Scene3D.FOGRANGE);
	}

	/**
	 * 设置雾化范围。
	 * @param value 雾化范围。
	 */
	set fogRange(value: number) {
		this._shaderValues.setNumber(Scene3D.FOGRANGE, value);
	}

	/**
	 * 获取环境光颜色。
	 * @return 环境光颜色。
	 */
	get ambientColor(): Vector3 {
		return (<Vector3>this._shaderValues.getVector3(Scene3D.AMBIENTCOLOR));
	}

	/**
	 * 设置环境光颜色。
	 * @param value 环境光颜色。
	 */
	set ambientColor(value: Vector3) {
		this._shaderValues.setVector3(Scene3D.AMBIENTCOLOR, value);
	}

	/**
	 * 获取天空渲染器。
	 * @return 天空渲染器。
	 */
	get skyRenderer(): SkyRenderer {
		return this._skyRenderer;
	}

	/**
	 * 获取反射贴图。
	 * @return 反射贴图。
	 */
	get customReflection(): TextureCube {
		return (<TextureCube>this._shaderValues.getTexture(Scene3D.REFLECTIONTEXTURE));
	}

	/**
	 * 设置反射贴图。
	 * @param 反射贴图。
	 */
	set customReflection(value: TextureCube) {
		this._shaderValues.setTexture(Scene3D.REFLECTIONTEXTURE, value);
		if (value)
			this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
		else
			this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
	}

	/**
	 * 获取反射强度。
	 * @return 反射强度。
	 */
	get reflectionIntensity(): number {
		return this._shaderValues.getNumber(Scene3D.REFLETIONINTENSITY);
	}

	/**
	 * 设置反射强度。
	 * @param 反射强度。
	 */
	set reflectionIntensity(value: number) {
		value = Math.max(Math.min(value, 1.0), 0.0);
		this._shaderValues.setNumber(Scene3D.REFLETIONINTENSITY, value);
	}

	/**
	 * 获取物理模拟器。
	 * @return 物理模拟器。
	 */
	get physicsSimulation(): PhysicsSimulation {
		return this._physicsSimulation;
	}

	/**
	 * 获取反射模式。
	 * @return 反射模式。
	 */
	get reflectionMode(): number {
		return this._reflectionMode;
	}

	/**
	 * 设置反射模式。
	 * @param value 反射模式。
	 */
	set reflectionMode(value: number) {
		this._reflectionMode = value;
	}

	/**
	 * 获取场景时钟。
	 * @override
	 */
	get timer(): Timer {
		return this._timer;
	}

	/**
	 * 设置场景时钟。
	 */
	set timer(value: Timer) {
		this._timer = value;
	}

	/**
	 *	获取输入。
	 * 	@return  输入。
	 */
	get input(): Input3D {
		return this._input;
	}

	/**
	 * 创建一个 <code>Scene3D</code> 实例。
	 */
	constructor() {
		super();
		if (Physics3D._enablePhysics)
			this._physicsSimulation = new PhysicsSimulation(Scene3D.physicsSettings);

		this._shaderValues = new ShaderData(null);
		this.parallelSplitShadowMaps = [];

		this.enableFog = false;
		this.fogStart = 300;
		this.fogRange = 1000;
		this.fogColor = new Vector3(0.7, 0.7, 0.7);
		this.ambientColor = new Vector3(0.212, 0.227, 0.259);
		this.reflectionIntensity = 1.0;
		(Config3D._config._multiLighting) || (this._shaderValues.addDefine(Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING));

		if (Render.supportWebGLPlusCulling) {//[NATIVE]
			this._cullingBufferIndices = new Int32Array(1024);
			this._cullingBufferResult = new Int32Array(1024);
		}

		//this._shaderValues.setTexture(Scene3D.RANGEATTENUATIONTEXTURE, ShaderInit3D._rangeAttenTex);//TODO:

		//var angleAttenTex:Texture2D = Texture2D.buildTexture2D(64, 64, BaseTexture.FORMAT_Alpha8, TextureGenerator.haloTexture);
		//_shaderValues.setTexture(Scene3D.ANGLEATTENUATIONTEXTURE, angleAttenTex);
		this._scene = this;
		this._input.__init__(Render.canvas, this);




		if (Scene3D.octreeCulling) {
			this._octree = new BoundsOctree(Scene3D.octreeInitialSize, Scene3D.octreeInitialCenter, Scene3D.octreeMinNodeSize, Scene3D.octreeLooseness);
		}

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
	private _setLightmapToChildNode(sprite: Sprite3D): void {
		if (sprite instanceof RenderableSprite3D)
			((<RenderableSprite3D>sprite))._render._applyLightMapParams();

		var children: any[] = sprite._children;
		for (var i: number = 0, n: number = children.length; i < n; i++)

			this._setLightmapToChildNode(children[i]);
	}

	/**
	 *@internal
	 */
	private _update(): void {
		var delta: number = this.timer._delta / 1000;
		this._time += delta;
		this._shaderValues.setNumber(Scene3D.TIME, this._time);

		var simulation: PhysicsSimulation = this._physicsSimulation;
		if (Physics3D._enablePhysics && !PhysicsSimulation.disableSimulation) {
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
		this._input._update();

		this._clearScript();
		this._updateScript();
		Animator._update(this);
		this._lateUpdateScript();
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
	protected _prepareSceneToRender(): void {
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
				var sunLightIndex: number = this._directionLights.getSunLight();//get the brightest light as sun
				for (var i: number = 0; i < dirCount; i++ , curCount++) {
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
					if (i == sunLightIndex) {
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
				for (var i: number = 0; i < poiCount; i++ , curCount++) {
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
				for (var i: number = 0; i < spoCount; i++ , curCount++) {
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
		FrustumCulling.renderObjectCulling(camera, this, context, shader, replacementTag, false);
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
		if (clearFlag === BaseCamera.CLEARFLAG_SKY && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
			clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;

		switch (clearFlag) {
			case BaseCamera.CLEARFLAG_SOLIDCOLOR:
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
						case RenderTextureDepthFormat.DEPTHSTENCIL_16_8:
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
			case BaseCamera.CLEARFLAG_SKY:
			case BaseCamera.CLEARFLAG_DEPTHONLY:
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
						case RenderTextureDepthFormat.DEPTHSTENCIL_16_8:
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
			case BaseCamera.CLEARFLAG_NONE:
				break;
			default:
				throw new Error("BaseScene:camera clearFlag invalid.");
		}
	}

	/**
	 * @internal
	 */
	_renderScene(context: RenderContext3D): void {
		var camera: Camera = <Camera>context.camera;

		this._opaqueQueue._render(context);//非透明队列
		if (camera.clearFlag === BaseCamera.CLEARFLAG_SKY) {
			if (camera.skyRenderer._isAvailable())
				camera.skyRenderer._render(context);
			else if (this._skyRenderer._isAvailable())
				this._skyRenderer._render(context);
		}
		this._transparentQueue._render(context);//透明队列

		if (FrustumCulling.debugFrustumCulling) {
			var renderElements: RenderElement[] = this._debugTool._render._renderElements;
			for (var i: number = 0, n: number = renderElements.length; i < n; i++) {
				renderElements[i]._update(this, context, null, null);
				renderElements[i]._render(context);
			}
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
			var lightmaps: Texture2D[] = [];
			for (var i: number = 0; i < lightMapCount; i++)
				lightmaps[i] = Loader.getRes(lightMapsData[i].path);

			this.setlightmaps(lightmaps);
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
		var reflectionTextureData: string = data.reflectionTexture;
		reflectionTextureData && (this.customReflection = Loader.getRes(reflectionTextureData));

		this.enableFog = data.enableFog;
		this.fogStart = data.fogStart;
		this.fogRange = data.fogRange;
		var fogColorData: any[] = data.fogColor;
		if (fogColorData) {
			var fogCol: Vector3 = this.fogColor;
			fogCol.fromArray(fogColorData);
			this.fogColor = fogCol;
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
	_addRenderObject(render: BaseRender): void {
		if (this._octree && render._supportOctree) {
			this._octree.add(render);
		} else {
			this._renders.add(render);
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				var indexInList: number = render._getIndexInList();
				var length: number = this._cullingBufferIndices.length;
				if (indexInList >= length) {
					var tempIndices: Int32Array = this._cullingBufferIndices;
					var tempResult: Int32Array = this._cullingBufferResult;
					this._cullingBufferIndices = new Int32Array(length + 1024);
					this._cullingBufferResult = new Int32Array(length + 1024);
					this._cullingBufferIndices.set(tempIndices, 0);
					this._cullingBufferResult.set(tempResult, 0);
				}
				this._cullingBufferIndices[indexInList] = render._cullingBufferIndex;
			}
		}
	}

	/**
	 * @internal
	 */
	_removeRenderObject(render: BaseRender): void {
		if (this._octree && render._supportOctree) {
			this._octree.remove(render);
		} else {
			var endRender: BaseRender;
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				endRender = (<BaseRender>this._renders.elements[this._renders.length - 1]);
			}
			this._renders.remove(render);
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				this._cullingBufferIndices[endRender._getIndexInList()] = endRender._cullingBufferIndex;
			}
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
	 * 设置光照贴图。
	 * @param value 光照贴图。
	 */
	setlightmaps(value: Texture2D[]): void {
		var maps: Texture2D[] = this._lightmaps;
		for (var i: number = 0, n: number = maps.length; i < n; i++)
			maps[i]._removeReference();
		if (value) {
			var count: number = value.length;
			maps.length = count;
			for (i = 0; i < count; i++) {
				var lightMap: Texture2D = value[i];
				lightMap._addReference();
				maps[i] = lightMap;
			}
		} else {
			throw new Error("Scene3D: value value can't be null.");
		}
		for (i = 0, n = this._children.length; i < n; i++)
			this._setLightmapToChildNode(this._children[i]);
	}

	/**
	 * 获取光照贴图浅拷贝列表。
	 * @return 获取光照贴图浅拷贝列表。
	 */
	getlightmaps(): Texture2D[] {
		return this._lightmaps.slice();//slice()防止修改数组内容
	}

	/**
	 * @inheritDoc
	 * @override
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
		this._lightmaps = null;
		this._shaderValues = null;
		this._renders = null;
		this._cameraPool = null;
		this._octree = null;
		this.parallelSplitShadowMaps = null;
		this._physicsSimulation && this._physicsSimulation._destroy();
		Loader.clearRes(this.url);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	render(ctx: Context, x: number, y: number): void {
		//TODO:外层应该设计为接口调用
		ctx._curSubmit = SubmitBase.RENDERBASE;//打断2D合并的renderKey
		this._children.length > 0 && ctx.addRenderObject(this);
	}

	/**
	 * 
	 */
	renderSubmit(): number {
		var gl: any = LayaGL.instance;
		this._prepareSceneToRender();

		var i: number, n: number, n1: number;
		for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
			if (Render.supportWebGLPlusRendering)
				ShaderData.setRuntimeValueMode((i == n1) ? true : false);
			var camera: Camera = (<Camera>this._cameraPool[i]);
			camera.enableRender && camera.render();
		}
		Context.set2DRenderConfig();//还原2D配置
		return 1;
	}

	/**
	 * 
	 */
	getRenderType(): number {
		return 0;
	}

	/**
	 * 
	 */
	releaseRender(): void {
	}

	/**
	 * 
	 */
	reUse(context: Context, pos: number): number {
		return 0;
	}
}

