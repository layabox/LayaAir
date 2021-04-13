import { Config } from "./Config";
import { Config3D } from "./Config3D";
import { ILaya3D } from "./ILaya3D";
import { Laya } from "./Laya";
import { AnimationClip } from "./laya/d3/animation/AnimationClip";
import { Animator } from "./laya/d3/component/Animator";
import { PostProcess } from "./laya/d3/component/PostProcess";
import { Avatar } from "./laya/d3/core/Avatar";
import { BaseMaterial } from "./laya/d3/core/material/BaseMaterial";
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
import { ScreenTriangle } from "./laya/d3/core/render/ScreenTriangle";
import { RenderableSprite3D } from "./laya/d3/core/RenderableSprite3D";
import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { SkinnedMeshRenderer } from "./laya/d3/core/SkinnedMeshRenderer";
import { SkinnedMeshSprite3D } from "./laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "./laya/d3/core/Sprite3D";
import { TrailMaterial } from "./laya/d3/core/trail/TrailMaterial";
import { TrailSprite3D } from "./laya/d3/core/trail/TrailSprite3D";
import { VertexTrail } from "./laya/d3/core/trail/VertexTrail";
import { FrustumCulling } from "./laya/d3/graphics/FrustumCulling";
import { MeshRenderDynamicBatchManager } from "./laya/d3/graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "./laya/d3/graphics/MeshRenderStaticBatchManager";
import { SubMeshDynamicBatch } from "./laya/d3/graphics/SubMeshDynamicBatch";
import { SubMeshInstanceBatch } from "./laya/d3/graphics/SubMeshInstanceBatch";
import { VertexMesh } from "./laya/d3/graphics/Vertex/VertexMesh";
import { VertexPositionTerrain } from "./laya/d3/graphics/Vertex/VertexPositionTerrain";
import { VertexPositionTexture0 } from "./laya/d3/graphics/Vertex/VertexPositionTexture0";
import { VertexShurikenParticleBillboard } from "./laya/d3/graphics/Vertex/VertexShurikenParticleBillboard";
import { VertexShurikenParticleMesh } from "./laya/d3/graphics/Vertex/VertexShurikenParticleMesh";
import { VertexElementFormat } from "./laya/d3/graphics/VertexElementFormat";
import { Matrix4x4 } from "./laya/d3/math/Matrix4x4";
import { BulletInteractive } from "./laya/d3/physics/BulletInteractive";
import { CharacterController } from "./laya/d3/physics/CharacterController";
import { PhysicsCollider } from "./laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "./laya/d3/physics/Rigidbody3D";
import { Mesh } from "./laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "./laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { TextureCube } from "./laya/d3/resource/TextureCube";
import { Shader3D } from "./laya/d3/shader/Shader3D";
import { ShaderData } from "./laya/d3/shader/ShaderData";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { ShaderInstance } from "./laya/d3/shader/ShaderInstance";
import { Scene3DUtils } from "./laya/d3/utils/Scene3DUtils";
import { Utils3D } from "./laya/d3/utils/Utils3D";
import { Node } from "./laya/display/Node";
import { Event } from "./laya/events/Event";
import { CommandEncoder } from "./laya/layagl/CommandEncoder";
import { LayaGL } from "./laya/layagl/LayaGL";
import { LayaGLRunner } from "./laya/layagl/LayaGLRunner";
import { Loader } from "./laya/net/Loader";
import { LoaderManager } from "./laya/net/LoaderManager";
import { URL } from "./laya/net/URL";
import { Render } from "./laya/renders/Render";
import { FilterMode } from "./laya/resource/FilterMode";
import { Resource } from "./laya/resource/Resource";
import { Texture2D } from "./laya/resource/Texture2D";
import { TextureFormat } from "./laya/resource/TextureFormat";
import { WarpMode } from "./laya/resource/WrapMode";
import { Byte } from "./laya/utils/Byte";
import { ClassUtils } from "./laya/utils/ClassUtils";
import { Handler } from "./laya/utils/Handler";
import { RunDriver } from "./laya/utils/RunDriver";
import { SystemUtils } from "./laya/webgl/SystemUtils";
import { WebGL } from "./laya/webgl/WebGL";
import { WebGLContext } from "./laya/webgl/WebGLContext";
import { MeshReader } from "./laya/d3/loaders/MeshReader";
import { SkyPanoramicMaterial } from "./laya/d3/core/material/SkyPanoramicMaterial";
import { ShadowUtils } from "./laya/d3/core/light/ShadowUtils";
import { FixedConstraint } from "./laya/d3/physics/constraints/FixedConstraint";
import { ConfigurableConstraint } from "./laya/d3/physics/constraints/ConfigurableConstraint";
import { ShadowLightType } from "./laya/d3/shadowMap/ShadowCasterPass";
import { SimpleSkinnedMeshSprite3D } from "./laya/d3/core/SimpleSkinnedMeshSprite3D";
import { HalfFloatUtils } from "./laya/utils/HalfFloatUtils";
import { Physics3D } from "./laya/d3/Physics3D";
import { Camera } from "./laya/d3/core/Camera";
import { CommandBuffer } from "./laya/d3/core/render/command/CommandBuffer";
import { RenderElement } from "./laya/d3/core/render/RenderElement";
/**
 * <code>Laya3D</code> 类用于初始化3D设置。
 */
export class Laya3D {
	/**Hierarchy资源。*/
	static HIERARCHY: string = "HIERARCHY";//兼容
	/**Mesh资源。*/
	static MESH: string = "MESH";//兼容
	/**Material资源。*/
	static MATERIAL: string = "MATERIAL";//兼容
	/**Texture2D资源。*/
	static TEXTURE2D: string = "TEXTURE2D";//兼容
	/**TextureCube资源。*/
	static TEXTURECUBE: string = "TEXTURECUBE";//兼容
	/**TextureCube资源。*/
	static TEXTURECUBEBIN: string = "TEXTURECUBEBIN";//兼容
	/**AnimationClip资源。*/
	static ANIMATIONCLIP: string = "ANIMATIONCLIP";//兼容
	/**Avatar资源。*/
	static AVATAR: string = "AVATAR";//兼容
	/**Terrain资源。*/
	static TERRAINHEIGHTDATA: string = "TERRAINHEIGHTDATA";
	/**Terrain资源。*/
	static TERRAINRES: string = "TERRAIN";
	/**SimpleAnimator资源。 */
	static SIMPLEANIMATORBIN: string = "SIMPLEANIMATOR";

	/**@internal */
	private static _innerFirstLevelLoaderManager: LoaderManager = new LoaderManager();//Mesh 
	/**@internal */
	private static _innerSecondLevelLoaderManager: LoaderManager = new LoaderManager();//Material
	/**@internal */
	private static _innerThirdLevelLoaderManager: LoaderManager = new LoaderManager();//TextureCube、TerrainResou
	/**@internal */
	private static _innerFourthLevelLoaderManager: LoaderManager = new LoaderManager();//Texture2D、Image、Avatar、AnimationClip

	/**@internal */
	private static _isInit: boolean = false;


	/**@internal */
	static _editerEnvironment: boolean = false;

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
	static _cancelLoadByUrl(url: string): void {
		Laya.loader.cancelLoadByUrl(url);
		Laya3D._innerFirstLevelLoaderManager.cancelLoadByUrl(url);
		Laya3D._innerSecondLevelLoaderManager.cancelLoadByUrl(url);
		Laya3D._innerThirdLevelLoaderManager.cancelLoadByUrl(url);
		Laya3D._innerFourthLevelLoaderManager.cancelLoadByUrl(url);
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
		if (!Render.supportWebGLPlusRendering) {
			LayaGL.instance = WebGLContext.mainContext;
			(<any>LayaGL.instance).createCommandEncoder = function (reserveSize: number = 128, adjustSize: number = 64, isSyncToRenderThread: boolean = false): CommandEncoder {
				return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
			}
		}
		config._multiLighting = config.enableMultiLight && SystemUtils.supportTextureFormat(TextureFormat.R32G32B32A32);

		ILaya3D.Shader3D = Shader3D;
		ILaya3D.Scene3D = Scene3D;
		ILaya3D.MeshRenderStaticBatchManager = MeshRenderStaticBatchManager;
		ILaya3D.MeshRenderDynamicBatchManager = MeshRenderDynamicBatchManager;
		ILaya3D.SubMeshDynamicBatch = SubMeshDynamicBatch;
		ILaya3D.Laya3D = Laya3D;
		ILaya3D.Matrix4x4 = Matrix4x4;
		ILaya3D.Physics3D = Physics3D;
		ILaya3D.ShadowLightType = ShadowLightType;
		ILaya3D.Camera = Camera;
		ILaya3D.CommandBuffer = CommandBuffer;
		ILaya3D.RenderElement = RenderElement;
		//函数里面会有判断isConchApp
		Laya3D.enableNative3D();

		if(config.isUseCannonPhysicsEngine)
		Physics3D.__cannoninit__();
		
		Physics3D.__bulletinit__();

		VertexElementFormat.__init__();
		VertexMesh.__init__();
		VertexShurikenParticleBillboard.__init__();
		VertexShurikenParticleMesh.__init__();
		VertexPositionTexture0.__init__();
		VertexTrail.__init__();
		VertexPositionTerrain.__init__();
		PixelLineVertex.__init__();
		SubMeshInstanceBatch.__init__();
		SubMeshDynamicBatch.__init__();
		ShaderInit3D.__init__();
		ShadowUtils.init();
		PBRMaterial.__init__();
		PBRStandardMaterial.__init__();
		PBRSpecularMaterial.__init__();
		SkyPanoramicMaterial.__init__();
		Mesh.__init__();
		PrimitiveMesh.__init__();
		Sprite3D.__init__();
		RenderableSprite3D.__init__();
		MeshSprite3D.__init__();
		SkinnedMeshSprite3D.__init__();
		SimpleSkinnedMeshSprite3D.__init__();
		ShuriKenParticle3D.__init__();
		TrailSprite3D.__init__();
		PostProcess.__init__();
		Scene3D.__init__();
		MeshRenderStaticBatchManager.__init__();

		Material.__initDefine__();
		BaseMaterial.__initDefine__();
		BlinnPhongMaterial.__initDefine__();
		// PBRStandardMaterial.__initDefine__();
		// PBRSpecularMaterial.__initDefine__();
		SkyProceduralMaterial.__initDefine__();
		UnlitMaterial.__initDefine__();
		TrailMaterial.__initDefine__();
		EffectMaterial.__initDefine__();
		WaterPrimaryMaterial.__initDefine__();
		ShurikenParticleMaterial.__initDefine__();
		ExtendTerrainMaterial.__initDefine__();
		PixelLineMaterial.__initDefine__();
		SkyBoxMaterial.__initDefine__();


		Command.__init__();

		//注册类命,解析的时候需要
		ClassUtils.regClass("Laya.SkyPanoramicMaterial", SkyPanoramicMaterial);
		ClassUtils.regClass("Laya.EffectMaterial", EffectMaterial);
		ClassUtils.regClass("Laya.UnlitMaterial", UnlitMaterial);
		ClassUtils.regClass("Laya.BlinnPhongMaterial", BlinnPhongMaterial);
		ClassUtils.regClass("Laya.SkyProceduralMaterial", SkyProceduralMaterial);
		ClassUtils.regClass("Laya.PBRStandardMaterial", PBRStandardMaterial);
		ClassUtils.regClass("Laya.PBRSpecularMaterial", PBRSpecularMaterial);
		ClassUtils.regClass("Laya.SkyBoxMaterial", SkyBoxMaterial);
		ClassUtils.regClass("Laya.WaterPrimaryMaterial", WaterPrimaryMaterial);
		ClassUtils.regClass("Laya.ExtendTerrainMaterial", ExtendTerrainMaterial);
		ClassUtils.regClass("Laya.ShurikenParticleMaterial", ShurikenParticleMaterial);
		ClassUtils.regClass("Laya.TrailMaterial", TrailMaterial);
		ClassUtils.regClass("Laya.PhysicsCollider", PhysicsCollider);
		ClassUtils.regClass("Laya.Rigidbody3D", Rigidbody3D);
		ClassUtils.regClass("Laya.CharacterController", CharacterController);
		ClassUtils.regClass("Laya.Animator", Animator);

		ClassUtils.regClass("PhysicsCollider", PhysicsCollider);
		ClassUtils.regClass("CharacterController", CharacterController);
		ClassUtils.regClass("Animator", Animator);
		ClassUtils.regClass("Rigidbody3D", Rigidbody3D);
		ClassUtils.regClass("FixedConstraint", FixedConstraint);
		ClassUtils.regClass("ConfigurableConstraint",ConfigurableConstraint);


		PixelLineMaterial.defaultMaterial = new PixelLineMaterial();
		BlinnPhongMaterial.defaultMaterial = new BlinnPhongMaterial();
		EffectMaterial.defaultMaterial = new EffectMaterial();
		// PBRStandardMaterial.defaultMaterial = new PBRStandardMaterial();
		// PBRSpecularMaterial.defaultMaterial = new PBRSpecularMaterial();
		UnlitMaterial.defaultMaterial = new UnlitMaterial();
		ShurikenParticleMaterial.defaultMaterial = new ShurikenParticleMaterial();
		TrailMaterial.defaultMaterial = new TrailMaterial();
		SkyProceduralMaterial.defaultMaterial = new SkyProceduralMaterial();
		SkyBoxMaterial.defaultMaterial = new SkyBoxMaterial();
		WaterPrimaryMaterial.defaultMaterial = new WaterPrimaryMaterial();

		PixelLineMaterial.defaultMaterial.lock = true;//todo:
		BlinnPhongMaterial.defaultMaterial.lock = true;
		EffectMaterial.defaultMaterial.lock = true;
		// PBRStandardMaterial.defaultMaterial.lock = true;
		// PBRSpecularMaterial.defaultMaterial.lock = true;
		UnlitMaterial.defaultMaterial.lock = true;
		ShurikenParticleMaterial.defaultMaterial.lock = true;
		TrailMaterial.defaultMaterial.lock = true;
		SkyProceduralMaterial.defaultMaterial.lock = true;
		SkyBoxMaterial.defaultMaterial.lock = true;
		WaterPrimaryMaterial.defaultMaterial.lock = true;
		Texture2D.__init__();
		TextureCube.__init__();
		SkyBox.__init__();
		SkyDome.__init__();
		ScreenQuad.__init__();
		ScreenTriangle.__init__();
		FrustumCulling.__init__();
		HalfFloatUtils.__init__();

		var createMap: any = LoaderManager.createMap;
		createMap["lh"] = [Laya3D.HIERARCHY, Scene3DUtils._parse];
		createMap["ls"] = [Laya3D.HIERARCHY, Scene3DUtils._parseScene];
		createMap["lm"] = [Laya3D.MESH, MeshReader._parse];
		createMap["lmat"] = [Laya3D.MATERIAL, Material._parse];
		createMap["jpg"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["jpeg"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["bmp"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["gif"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["png"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["dds"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["ktx"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["pvr"] = [Laya3D.TEXTURE2D, Texture2D._parse];
		createMap["lani"] = [Laya3D.ANIMATIONCLIP, AnimationClip._parse];
		createMap["lav"] = [Laya3D.AVATAR, Avatar._parse];
		createMap["ltc"] = [Laya3D.TEXTURECUBE, TextureCube._parse];
		createMap["ltcb"] = [Laya3D.TEXTURECUBEBIN, TextureCube._parseBin];
		//为其他平台添加的兼容代码,临时TODO：
		createMap["ltcb.ls"] = [Laya3D.TEXTURECUBEBIN, TextureCube._parseBin];
		createMap["lanit.ls"] = [Laya3D.TEXTURE2D,Texture2D._SimpleAnimatorTextureParse];

		var parserMap: any = Loader.parserMap;
		parserMap[Laya3D.HIERARCHY] = Laya3D._loadHierarchy;
		parserMap[Laya3D.MESH] = Laya3D._loadMesh;
		parserMap[Laya3D.MATERIAL] = Laya3D._loadMaterial;
		parserMap[Laya3D.TEXTURECUBE] = Laya3D._loadTextureCube;
		parserMap[Laya3D.TEXTURECUBEBIN] = Laya3D._loadTextureCubeBin;
		parserMap[Laya3D.TEXTURE2D] = Laya3D._loadTexture2D;
		parserMap[Laya3D.ANIMATIONCLIP] = Laya3D._loadAnimationClip;
		parserMap[Laya3D.AVATAR] = Laya3D._loadAvatar;
		parserMap[Laya3D.SIMPLEANIMATORBIN] = Laya3D._loadSimpleAnimator;
		//parserMap[Laya3D.TERRAINRES] = _loadTerrain;
		//parserMap[Laya3D.TERRAINHEIGHTDATA] = _loadTerrain;

		Laya3D._innerFirstLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
		Laya3D._innerSecondLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
		Laya3D._innerThirdLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
		Laya3D._innerFourthLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
	}

	private static enableNative3D(): void {
		var shaderData: any = ShaderData;
		var shader3D: any = ShaderInstance;
		var skinnedMeshRender: any = SkinnedMeshRenderer;
		var avatar: any = Avatar;
		var frustumCulling: any = FrustumCulling;
		var meshRender: any = MeshRenderer;
		if (Render.supportWebGLPlusRendering) {
			//替换ShaderData的函数
			shaderData.prototype._initData = shaderData.prototype._initDataForNative;
			shaderData.prototype.setBool = shaderData.prototype.setBoolForNative;
			shaderData.prototype.getBool = shaderData.prototype.getBoolForNative;
			shaderData.prototype.setInt = shaderData.prototype.setIntForNative;
			shaderData.prototype.getInt = shaderData.prototype.getIntForNative;
			shaderData.prototype.setNumber = shaderData.prototype.setNumberForNative;
			shaderData.prototype.getNumber = shaderData.prototype.getNumberForNative;
			shaderData.prototype.setVector = shaderData.prototype.setVectorForNative;
			shaderData.prototype.getVector = shaderData.prototype.getVectorForNative;
			shaderData.prototype.setVector2 = shaderData.prototype.setVector2ForNative;
			shaderData.prototype.getVector2 = shaderData.prototype.getVector2ForNative;
			shaderData.prototype.setVector3 = shaderData.prototype.setVector3ForNative;
			shaderData.prototype.getVector3 = shaderData.prototype.getVector3ForNative;
			shaderData.prototype.setQuaternion = shaderData.prototype.setQuaternionForNative;
			shaderData.prototype.getQuaternion = shaderData.prototype.getQuaternionForNative;
			shaderData.prototype.setMatrix4x4 = shaderData.prototype.setMatrix4x4ForNative;
			shaderData.prototype.getMatrix4x4 = shaderData.prototype.getMatrix4x4ForNative;
			shaderData.prototype.setBuffer = shaderData.prototype.setBufferForNative;
			shaderData.prototype.getBuffer = shaderData.prototype.getBufferForNative;
			shaderData.prototype.setTexture = shaderData.prototype.setTextureForNative;
			shaderData.prototype.getTexture = shaderData.prototype.getTextureForNative;
			shaderData.prototype.setAttribute = shaderData.prototype.setAttributeForNative;
			shaderData.prototype.getAttribute = shaderData.prototype.getAttributeForNative;
			shaderData.prototype.cloneTo = shaderData.prototype.cloneToForNative;
			shaderData.prototype.getData = shaderData.prototype.getDataForNative;
			shader3D.prototype._uniformMatrix2fv = shader3D.prototype._uniformMatrix2fvForNative;
			shader3D.prototype._uniformMatrix3fv = shader3D.prototype._uniformMatrix3fvForNative;
			shader3D.prototype._uniformMatrix4fv = shader3D.prototype._uniformMatrix4fvForNative;
			LayaGLRunner.uploadShaderUniforms = LayaGLRunner.uploadShaderUniformsForNative;
		}


	}

	/**
	 *@private
	 */
	private static formatRelativePath(base: string, value: string): string {
		var path: string;
		path = base + value;

		var char1: string = value.charAt(0);
		if (char1 === ".") {
			var parts: any[] = path.split("/");
			for (var i: number = 0, len: number = parts.length; i < len; i++) {
				if (parts[i] == '..') {
					var index: number = i - 1;
					if (index > 0 && parts[index] !== '..') {
						parts.splice(index, 2);
						i -= 2;
					}
				}
			}
			path = parts.join('/');
		}
		return path;
	}

	/**
	 * @internal
	 */
	private static _endLoad(loader: Loader, content: any = null, subResous: any[] = null): void {
		if (subResous) {
			for (var i: number = 0, n: number = subResous.length; i < n; i++) {
				var resou: Resource = (<Resource>Loader.getRes(subResous[i]));
				(resou) && (resou._removeReference());//加载失败SubResous为空
			}
		}
		loader.endLoad(content);
	}

	/**
	 *@internal
	 */
	private static _eventLoadManagerError(msg: string): void {
		Laya.loader.event(Event.ERROR, msg);
	}

	/**
	 *@internal
	 */
	private static _addHierarchyInnerUrls(urls: any[], urlMap: any[], urlVersion: string, hierarchyBasePath: string, path: string, type: string, constructParams: any = null, propertyParams: any = null): string {
		var formatUrl: string = Laya3D.formatRelativePath(hierarchyBasePath, path);
		(urlVersion) && (formatUrl = formatUrl + urlVersion);
		urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
		urlMap.push(formatUrl);
		return formatUrl;
	}

	/**
	 *@internal
	 */
	private static _getSprite3DHierarchyInnerUrls(node: any, firstLevelUrls: any[], secondLevelUrls: any[], thirdLevelUrls: any[], fourthLelUrls: any[], subUrls: any[], urlVersion: string, hierarchyBasePath: string): void {
		var i: number, n: number;

		var props: any = node.props;
		switch (node.type) {
			case "Scene3D": //TODO:应该自动序列化类型
				var lightmaps: any[] = props.lightmaps;
				for (i = 0, n = lightmaps.length; i < n; i++) {
					var lightMap: any = lightmaps[i];
					if (lightMap.path) {
						lightMap.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightMap.path, Laya3D.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
					}
					else {
						var lightmapColorData: any = lightMap.color;
						lightmapColorData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightmapColorData.path, Laya3D.TEXTURE2D, lightmapColorData.constructParams, lightmapColorData.propertyParams);
						var lightmapDirectionData: any = lightMap.direction;
						if (lightmapDirectionData)
							lightmapDirectionData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightmapDirectionData.path, Laya3D.TEXTURE2D, lightmapDirectionData.constructParams, lightmapDirectionData.propertyParams);
					}
				}

				//兼容
				var reflectionTextureData: string = props.reflectionTexture;
				(reflectionTextureData) && (props.reflection = Laya3D._addHierarchyInnerUrls(thirdLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionTextureData, Laya3D.TEXTURECUBE));

				var reflectionData: string = props.reflection;
				(reflectionData) && (props.reflection = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionData, Laya3D.TEXTURECUBEBIN));
				if (props.sky) {
					var skyboxMaterial: any = props.sky.material;
					(skyboxMaterial) && (skyboxMaterial.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMaterial.path, Laya3D.MATERIAL));
				}
				break;
			case "Camera":
				var skyboxMatData: any = props.skyboxMaterial;
				(skyboxMatData) && (skyboxMatData.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMatData.path, Laya3D.MATERIAL));
				break;
			case "TrailSprite3D":
			case "MeshSprite3D":
			case "SkinnedMeshSprite3D":
			case "SimpleSkinnedMeshSprite3D":
				var meshPath: string = props.meshPath;
				(meshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, meshPath, Laya3D.MESH));
				var materials: any[] = props.materials;
				if (materials)
					for (i = 0, n = materials.length; i < n; i++)
						materials[i].path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, materials[i].path, Laya3D.MATERIAL);
				if(node.type=="SimpleSkinnedMeshSprite3D")
					if(props.animatorTexture)
						props.animatorTexture = Laya3D._addHierarchyInnerUrls(fourthLelUrls,subUrls,urlVersion, hierarchyBasePath,props.animatorTexture,Laya3D.SIMPLEANIMATORBIN)
				break;
			
			case "ShuriKenParticle3D":
				if (props.main) {
					var resources: any = props.renderer.resources;
					var mesh: string = resources.mesh;
					var material: string = resources.material;
					(mesh) && (resources.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
					(material) && (resources.material = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, material, Laya3D.MATERIAL));
				}
				else {//兼容代码
					var parMeshPath: string = props.meshPath;
					(parMeshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, parMeshPath, Laya3D.MESH));
					props.material.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, props.material.path, Laya3D.MATERIAL);
				}
				break;
			case "Terrain":
				Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, props.dataPath, Laya3D.TERRAINRES);
				break;
			case "ReflectionProbe":
				var reflection = props.reflection;
				(reflection) && (props.reflection = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflection, Laya3D.TEXTURECUBEBIN));
				break;
		}

		var components: any[] = node.components;
		if (components) {
			for (var k: number = 0, p: number = components.length; k < p; k++) {
				var component: any = components[k];
				switch (component.type) {
					case "Animator":
						var avatarPath: string = component.avatarPath;
						var avatarData: any = component.avatar;
						(avatarData) && (avatarData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, avatarData.path, Laya3D.AVATAR));
						var clipPaths: string[] = component.clipPaths;
						if (!clipPaths) {
							var layersData: any[] = component.layers;
							for (i = 0; i < layersData.length; i++) {
								var states: any[] = layersData[i].states;
								for (var j: number = 0, m: number = states.length; j < m; j++) {
									var clipPath: string = states[j].clipPath;
									(clipPath) && (states[j].clipPath = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPath, Laya3D.ANIMATIONCLIP));
								}
							}
						} else {
							for (i = 0, n = clipPaths.length; i < n; i++)
								clipPaths[i] = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPaths[i], Laya3D.ANIMATIONCLIP);
						}
						break;
					case "PhysicsCollider":
					case "Rigidbody3D":
					case "CharacterController":
						var shapes: any[] = component.shapes;
						for (i = 0; i < shapes.length; i++) {
							var shape: any = shapes[i];
							if (shape.type === "MeshColliderShape") {
								var mesh: string = shape.mesh;
								(mesh) && (shape.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
							}
						}
						break;
				}
			}
		}

		var children: any[] = node.child;
		for (i = 0, n = children.length; i < n; i++)
			Laya3D._getSprite3DHierarchyInnerUrls(children[i], firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath);
	}

	/**
	 *@internal
	 */
	private static _loadHierarchy(loader: Loader): void {
		loader._originType = loader.type;
		loader.on(Event.LOADED, null, Laya3D._onHierarchylhLoaded, [loader]);
		loader.load(loader.url, Loader.JSON, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _onHierarchylhLoaded(loader: Loader, lhData: any): void {
		var url: string = loader.url;
		var urlVersion: string = Utils3D.getURLVerion(url);
		var hierarchyBasePath: string = URL.getPath(url);
		var firstLevUrls: any[] = [];
		var secondLevUrls: any[] = [];
		var thirdLevUrls: any[] = [];
		var forthLevUrls: any[] = [];
		var subUrls: any[] = [];
		Laya3D._getSprite3DHierarchyInnerUrls(lhData.data, firstLevUrls, secondLevUrls, thirdLevUrls, forthLevUrls, subUrls, urlVersion, hierarchyBasePath);
		var urlCount: number = firstLevUrls.length + secondLevUrls.length + forthLevUrls.length;
		var totalProcessCount: number = urlCount + 1;
		var weight: number = 1 / totalProcessCount;
		Laya3D._onProcessChange(loader, 0, weight, 1.0);
		if (forthLevUrls.length > 0) {
			var processCeil: number = urlCount / totalProcessCount;
			var processHandler: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, weight, processCeil], false);
			Laya3D._innerFourthLevelLoaderManager._create(forthLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerForthLevResouLoaded, [loader, processHandler, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight + processCeil * forthLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
		} else {
			Laya3D._onHierarchyInnerForthLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight, processCeil);
		}
	}

	/**
	 *@internal
	 */
	private static _onHierarchyInnerForthLevResouLoaded(loader: Loader, processHandler: Handler, lhData: any, subUrls: any[], firstLevUrls: any[], secondLevUrls: any[], thirdLevUrls: any[], processOffset: number, processCeil: number): void {
		(processHandler) && (processHandler.recover());
		if (thirdLevUrls.length > 0) {
			var process: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
			Laya3D._innerThirdLevelLoaderManager._create(thirdLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerThirdLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
		} else {
			Laya3D._onHierarchyInnerThirdLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset, processCeil);
		}
	}

	/**
	 *@internal
	 */
	private static _onHierarchyInnerThirdLevResouLoaded(loader: Loader, processHandler: Handler, lhData: any, subUrls: any[], firstLevUrls: any[], secondLevUrls: any[], processOffset: number, processCeil: number): void {
		(processHandler) && (processHandler.recover());
		if (secondLevUrls.length > 0) {
			var process: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
			Laya3D._innerSecondLevelLoaderManager._create(secondLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerSecondLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
		} else {
			Laya3D._onHierarchyInnerSecondLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, processOffset, processCeil);
		}
	}

	/**
	 *@internal
	 */
	private static _onHierarchyInnerSecondLevResouLoaded(loader: Loader, processHandler: Handler, lhData: any, subUrls: any[], firstLevUrls: any[], processOffset: number, processCeil: number): void {
		(processHandler) && (processHandler.recover());
		if (firstLevUrls.length > 0) {
			var process: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
			Laya3D._innerFirstLevelLoaderManager._create(firstLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerFirstLevResouLoaded, [loader, process, lhData, subUrls]), processHandler, null, null, null, 1, true);
		} else {
			Laya3D._onHierarchyInnerFirstLevResouLoaded(loader, null, lhData, subUrls);
		}
	}

	/**
	 *@internal
	 */
	private static _onHierarchyInnerFirstLevResouLoaded(loader: Loader, processHandler: Handler, lhData: any, subUrls: any[]): void {
		(processHandler) && (processHandler.recover());
		loader._cache = loader._createCache;
		var item: Node = lhData.data.type === "Scene3D" ? Scene3DUtils._parseScene(lhData, loader._propertyParams, loader._constructParams) : Scene3DUtils._parse(lhData, loader._propertyParams, loader._constructParams);
		Laya3D._endLoad(loader, item, subUrls);
	}

	/**
	 *@internal
	 */
	private static _loadMesh(loader: Loader): void {
		loader.on(Event.LOADED, null, Laya3D._onMeshLmLoaded, [loader]);
		loader.load(loader.url, Loader.BUFFER, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _onMeshLmLoaded(loader: Loader, lmData: ArrayBuffer): void {
		loader._cache = loader._createCache;
		var mesh: Mesh = MeshReader._parse(lmData, loader._propertyParams, loader._constructParams);
		Laya3D._endLoad(loader, mesh);
	}

	/**
	 *@internal
	 */
	private static _loadMaterial(loader: Loader): void {
		loader.on(Event.LOADED, null, Laya3D._onMaterilLmatLoaded, [loader]);
		loader.load(loader.url, Loader.JSON, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _onMaterilLmatLoaded(loader: Loader, lmatData: any): void {
		var url: string = loader.url;
		var urlVersion: string = Utils3D.getURLVerion(url);
		var materialBasePath: string = URL.getPath(url);
		var urls: any[] = [];
		var subUrls: any[] = [];
		var customProps: any = lmatData.customProps;
		var formatSubUrl: string;
		var version: string = lmatData.version;
		switch (version) {
			case "LAYAMATERIAL:01":
			case "LAYAMATERIAL:02":
			case "LAYAMATERIAL:03":
				var i: number, n: number;
				var textures: any[] = lmatData.props.textures;
				if (textures) {
					for (i = 0, n = textures.length; i < n; i++) {
						var tex2D: any = textures[i];
						var tex2DPath: string = tex2D.path;
						if (tex2DPath) {
							formatSubUrl = Laya3D.formatRelativePath(materialBasePath, tex2DPath);
							(urlVersion) && (formatSubUrl = formatSubUrl + urlVersion);

							urls.push({ url: formatSubUrl, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams });//不指定类型,自动根据后缀判断Texture2D或TextureCube
							subUrls.push(formatSubUrl);
							tex2D.path = formatSubUrl;
						}
					}
				}
				break;
			default:
				throw new Error("Laya3D:unkonwn version.");
		}

		var urlCount: number = urls.length;
		var totalProcessCount: number = urlCount + 1;
		var lmatWeight: number = 1 / totalProcessCount;
		Laya3D._onProcessChange(loader, 0, lmatWeight, 1.0);
		if (urlCount > 0) {
			var processHandler: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, lmatWeight, urlCount / totalProcessCount], false);
			Laya3D._innerFourthLevelLoaderManager._create(urls, false, Handler.create(null, Laya3D._onMateialTexturesLoaded, [loader, processHandler, lmatData, subUrls]), processHandler, null, null, null, 1, true);//TODO:还有可能是TextureCube,使用三级
		} else {
			Laya3D._onMateialTexturesLoaded(loader, null, lmatData, null);
		}
	}

	/**
	 *@internal
	 */
	private static _onMateialTexturesLoaded(loader: Loader, processHandler: Handler, lmatData: any, subUrls: any[]): void {
		loader._cache = loader._createCache;
		var mat: Material = Material._parse(lmatData, loader._propertyParams, loader._constructParams);
		Laya3D._endLoad(loader, mat, subUrls);
		(processHandler) && (processHandler.recover());
	}

	/**
	 *@internal
	 */
	private static _loadAvatar(loader: Loader): void {
		loader.on(Event.LOADED, null, function (data: any): void {
			loader._cache = loader._createCache;
			var avatar: Avatar = Avatar._parse(data, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader, avatar);
		});
		loader.load(loader.url, Loader.JSON, false, null, true);
	}
	
	/**
	 *@internal 
	 */
	private static _loadSimpleAnimator(loader:Loader):void{
		loader.on(Event.LOADED,null,function(data:any):void{
			loader._cache = loader._createCache;
			var texture: Texture2D = Texture2D._SimpleAnimatorTextureParse(data, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader,texture);
		});
		loader.load(loader.url,Loader.BUFFER,false,null,true)
	}

	/**
	 *@internal
	 */
	private static _loadAnimationClip(loader: Loader): void {
		loader.on(Event.LOADED, null, function (data: any): void {
			loader._cache = loader._createCache;
			var clip: AnimationClip = AnimationClip._parse(data);
			Laya3D._endLoad(loader, clip);
		});
		loader.load(loader.url, Loader.BUFFER, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _loadTexture2D(loader: Loader): void {
		var url: string = loader.url;
		var index: number = url.lastIndexOf('.') + 1;
		var verIndex: number = url.indexOf('?');
		var endIndex: number = verIndex == -1 ? url.length : verIndex;
		var ext: string = url.substr(index, endIndex - index);
		var type: string;
		switch (ext) {
			case "jpg":
			case "jpeg":
			case "bmp":
			case "gif":
			case "png":
				type = "nativeimage";
				break;
			case "dds":
				type = Loader.BUFFER;
				//TODO:
				break;
			case "ktx":
				type = Loader.BUFFER;
				(!loader._constructParams)&&(loader._constructParams = []);
				loader._constructParams[2] = TextureFormat.KTXTEXTURE;
				break;
			case "pvr":
				type = Loader.BUFFER;
				(!loader._constructParams)&&(loader._constructParams = []);
				loader._propertyParams[2] = TextureFormat.PVRTEXTURE;
				break;
		}

		//需要先注册,否则可能同步加载完成没来得及注册就完成
		loader.on(Event.LOADED, null, function (image: any): void {
			loader._cache = loader._createCache;
			var tex: Texture2D = Texture2D._parse(image, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader, tex);
		});
		loader.load(loader.url, type, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _loadTextureCube(loader: Loader): void {
		loader.on(Event.LOADED, null, Laya3D._onTextureCubeLtcLoaded, [loader]);
		loader.load(loader.url, Loader.JSON, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _loadTextureCubeBin(loader: Loader): void {
		loader.on(Event.LOADED, null, (data: ArrayBuffer) => {
			loader._cache = loader._createCache;

			var byte: Byte = new Byte(data);
			var version: string = byte.readUTFString();
			if (version !== "LAYATEXTURECUBE:0000")
				throw "Laya3D:unknow version.";
			var format: TextureFormat = <TextureFormat>byte.readUint8();
			var mipCount: number = byte.getUint8();
			var size: number = byte.readUint16();
			var filterMode: FilterMode = <FilterMode>byte.getUint8();
			var warpModeU: WarpMode = <WarpMode>byte.getUint8();
			var warpModev: WarpMode = <WarpMode>byte.getUint8();
			var anisoLevel: FilterMode = byte.getUint8();

			var cubemap: TextureCube = new TextureCube(size, format, mipCount > 1 ? true : false);
			cubemap.filterMode = filterMode;
			cubemap.wrapModeU = warpModeU;
			cubemap.wrapModeV = warpModev;
			cubemap.anisoLevel = anisoLevel;
			var pos: number = byte.pos;
			var mipSize: number = size;
			for (var i = 0; i < mipCount; i++) {
				var uint8Arrays: Array<Uint8Array> = new Array<Uint8Array>(6);
				var mipPixelLength: number = mipSize * mipSize * cubemap._getFormatByteCount();
				for (var j = 0; j < 6; j++) {
					uint8Arrays[j] = new Uint8Array(data, pos, mipPixelLength);
					pos += mipPixelLength;
				}
				cubemap.setSixSidePixels(uint8Arrays, i);
				mipSize /= 2;
			}
			Laya3D._endLoad(loader, cubemap);
		});
		loader.load(loader.url, Loader.BUFFER, false, null, true);
	}

	/**
	 *@internal
	 */
	private static _onTextureCubeLtcLoaded(loader: Loader, ltcData: any): void {
		var ltcBasePath: string = URL.getPath(loader.url);
		var urls: any[] = [Laya3D.formatRelativePath(ltcBasePath, ltcData.front), Laya3D.formatRelativePath(ltcBasePath, ltcData.back), Laya3D.formatRelativePath(ltcBasePath, ltcData.left), Laya3D.formatRelativePath(ltcBasePath, ltcData.right), Laya3D.formatRelativePath(ltcBasePath, ltcData.up), Laya3D.formatRelativePath(ltcBasePath, ltcData.down)];
		var ltcWeight: number = 1.0 / 7.0;
		Laya3D._onProcessChange(loader, 0, ltcWeight, 1.0);
		var processHandler: Handler = Handler.create(null, Laya3D._onProcessChange, [loader, ltcWeight, 6 / 7], false);
		Laya3D._innerFourthLevelLoaderManager.load(urls, Handler.create(null, Laya3D._onTextureCubeImagesLoaded, [loader, urls, processHandler]), processHandler, "nativeimage");

	}

	/**
	 *@internal
	 */
	private static _onTextureCubeImagesLoaded(loader: Loader, urls: any[], processHandler: Handler): void {
		var images: any[] = new Array(6);
		for (var i: number = 0; i < 6; i++)
			images[i] = Loader.getRes(urls[i]);

		loader._cache = loader._createCache;
		var tex: TextureCube = TextureCube._parse(images, loader._propertyParams, loader._constructParams);

		processHandler.recover();
		for (i = 0; i < 6; i++)
			Loader.clearRes(urls[i]);
		Laya3D._endLoad(loader, tex);
	}

	/**
	 *@internal
	 */
	private static _onProcessChange(loader: Loader, offset: number, weight: number, process: number): void {
		process = offset + process * weight;
		(process < 1.0) && (loader.event(Event.PROGRESS, process *2/3+ 1/3));
	}

	/**
	 * 初始化Laya3D相关设置。
	 * @param	width  3D画布宽度。
	 * @param	height 3D画布高度。
	 */
	static init(width: number, height: number, config: Config3D = null, compolete: Handler = null): void {
		if (Laya3D._isInit) {
			compolete && compolete.run();
			return;
		}
		Laya3D._isInit = true;
		(config) && (config.cloneTo(Config3D._config));
		config = Config3D._config;
		FrustumCulling.debugFrustumCulling = config.debugFrustumCulling;
		Laya3D._editerEnvironment = config._editerEnvironment;
		Scene3D.octreeCulling = config.octreeCulling;
		Scene3D.octreeInitialSize = config.octreeInitialSize;
		Scene3D.octreeInitialCenter = config.octreeInitialCenter;
		Scene3D.octreeMinNodeSize = config.octreeMinNodeSize;
		Scene3D.octreeLooseness = config.octreeLooseness;

		var physics3D: Function = (window as any).Physics3D;
		if (physics3D == null||config.isUseCannonPhysicsEngine) {
			Physics3D._enablePhysics = false;
			Laya3D.__init__(width, height, config);
			compolete && compolete.run();
		} else {
			Physics3D._enablePhysics = true;
			//should convert MB to pages
			physics3D(config.defaultPhysicsMemory * 16, BulletInteractive._interactive).then(function (): void {
				Laya3D.__init__(width, height, config);
				compolete && compolete.run();
			});
		}
	}

	/**
	 * 创建一个 <code>Laya3D</code> 实例。
	 */
	constructor() {
	}

}

(window as any).Laya3D = Laya3D;

