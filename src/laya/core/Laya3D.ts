import { Config3D } from "././Config3D";
import { Config } from "./../../core/src/Config";
import { AnimationClip } from "./laya/d3/animation/AnimationClip"
	import { PostProcess } from "./laya/d3/component/PostProcess"
	import { Avatar } from "./laya/d3/core/Avatar"
	import { MeshRenderer } from "./laya/d3/core/MeshRenderer"
	import { MeshSprite3D } from "./laya/d3/core/MeshSprite3D"
	import { RenderableSprite3D } from "./laya/d3/core/RenderableSprite3D"
	import { SkinnedMeshRenderer } from "./laya/d3/core/SkinnedMeshRenderer"
	import { SkinnedMeshSprite3D } from "./laya/d3/core/SkinnedMeshSprite3D"
	import { Sprite3D } from "./laya/d3/core/Sprite3D"
	import { BaseMaterial } from "./laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial"
	import { EffectMaterial } from "./laya/d3/core/material/EffectMaterial"
	import { ExtendTerrainMaterial } from "./laya/d3/core/material/ExtendTerrainMaterial"
	import { PBRSpecularMaterial } from "./laya/d3/core/material/PBRSpecularMaterial"
	import { PBRStandardMaterial } from "./laya/d3/core/material/PBRStandardMaterial"
	import { SkyBoxMaterial } from "./laya/d3/core/material/SkyBoxMaterial"
	import { SkyProceduralMaterial } from "./laya/d3/core/material/SkyProceduralMaterial"
	import { TerrainMaterial } from "./laya/d3/core/material/TerrainMaterial"
	import { UnlitMaterial } from "./laya/d3/core/material/UnlitMaterial"
	import { WaterPrimaryMaterial } from "./laya/d3/core/material/WaterPrimaryMaterial"
	import { ShuriKenParticle3D } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3D"
	import { ShurikenParticleMaterial } from "./laya/d3/core/particleShuriKen/ShurikenParticleMaterial"
	import { PixelLineMaterial } from "./laya/d3/core/pixelLine/PixelLineMaterial"
	import { RenderContext3D } from "./laya/d3/core/render/RenderContext3D"
	import { ScreenQuad } from "./laya/d3/core/render/ScreenQuad"
	import { ScreenTriangle } from "./laya/d3/core/render/ScreenTriangle"
	import { Scene3D } from "./laya/d3/core/scene/Scene3D"
	import { TrailMaterial } from "./laya/d3/core/trail/TrailMaterial"
	import { TrailSprite3D } from "./laya/d3/core/trail/TrailSprite3D"
	import { FrustumCulling } from "./laya/d3/graphics/FrustumCulling"
	import { HalfFloatUtils } from "./laya/d3/math/HalfFloatUtils"
	import { PhysicsSettings } from "./laya/d3/physics/PhysicsSettings"
	import { TextureCube } from "./laya/d3/resource/TextureCube"
	import { Mesh } from "./laya/d3/resource/models/Mesh"
	import { SkyBox } from "./laya/d3/resource/models/SkyBox"
	import { SkyDome } from "./laya/d3/resource/models/SkyDome"
	import { ShaderData } from "./laya/d3/shader/ShaderData"
	import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D"
	import { ShaderInstance } from "./laya/d3/shader/ShaderInstance"
	import { TerrainHeightData } from "./laya/d3/terrain/TerrainHeightData"
	import { Utils3D } from "./laya/d3/utils/Utils3D"
	import { Node } from "../../core/src/laya/display/Node"
	import { Event } from "../../core/src/laya/events/Event"
	import { CommandEncoder } from "../../core/src/laya/layagl/CommandEncoder"
	import { LayaGL } from "../../core/src/laya/layagl/LayaGL"
	import { Loader } from "../../core/src/laya/net/Loader"
	import { LoaderManager } from "../../core/src/laya/net/LoaderManager"
	import { URL } from "../../core/src/laya/net/URL"
	import { Render } from "../../core/src/laya/renders/Render"
	import { Resource } from "../../core/src/laya/resource/Resource"
	import { Texture2D } from "../../core/src/laya/resource/Texture2D"
	import { Handler } from "../../core/src/laya/utils/Handler"
	import { RunDriver } from "../../core/src/laya/utils/RunDriver"
	import { WebGL } from "../../core/src/laya/webgl/WebGL"
	import { WebGLContext } from "../../core/src/laya/webgl/WebGLContext"
	
	/**
	 * <code>Laya3D</code> 类用于初始化3D设置。
	 */
	export class Laya3D {
		/**Hierarchy资源。*/
		 static HIERARCHY:string = "HIERARCHY";
		/**Mesh资源。*/
		 static MESH:string = "MESH";
		/**Material资源。*/
		 static MATERIAL:string = "MATERIAL";
		/**Texture2D资源。*/
		 static TEXTURE2D:string = "TEXTURE2D";
		/**TextureCube资源。*/
		 static TEXTURECUBE:string = "TEXTURECUBE";
		/**AnimationClip资源。*/
		 static ANIMATIONCLIP:string = "ANIMATIONCLIP";
		/**Avatar资源。*/
		 static AVATAR:string = "AVATAR";
		/**Terrain资源。*/
		 static TERRAINHEIGHTDATA:string = "TERRAINHEIGHTDATA";
		/**Terrain资源。*/
		 static TERRAINRES:string = "TERRAIN";
		
		/**@private */
		private static _innerFirstLevelLoaderManager:LoaderManager = new LoaderManager();//Mesh 
		/**@private */
		private static _innerSecondLevelLoaderManager:LoaderManager = new LoaderManager();//Material
		/**@private */
		private static _innerThirdLevelLoaderManager:LoaderManager = new LoaderManager();//TextureCube、TerrainResou
		/**@private */
		private static _innerFourthLevelLoaderManager:LoaderManager = new LoaderManager();//Texture2D、Image、Avatar、AnimationClip
		
		/**@private */
		private static _isInit:boolean = false;
		
		/**@private */
		 static _physics3D:any = window.Physics3D;
		/**@private */
		 static _enbalePhysics:boolean = false;
		/**@private */
		 static _editerEnvironment:boolean = false;
		/**@private */
		 static _config:Config3D = new Config3D();
		
		/**@private */
		 static physicsSettings:PhysicsSettings = new PhysicsSettings();//TODO:
		
		/**
		 * 获取是否可以启用物理。
		 * @param 是否启用物理。
		 */
		static  get enbalePhysics():any {
			return Laya3D._enbalePhysics;
		}
		
		/**
		 *@private
		 */
		 static _cancelLoadByUrl(url:string):void {
			Laya.loader.cancelLoadByUrl(url);
			Laya3D._innerFirstLevelLoaderManager.cancelLoadByUrl(url);
			Laya3D._innerSecondLevelLoaderManager.cancelLoadByUrl(url);
			Laya3D._innerThirdLevelLoaderManager.cancelLoadByUrl(url);
			Laya3D._innerFourthLevelLoaderManager.cancelLoadByUrl(url);
		}
		
		/**
		 *@private
		 */
		private static _changeWebGLSize(width:number, height:number):void {
			WebGL.onStageResize(width, height);
			RenderContext3D.clientWidth = width;
			RenderContext3D.clientHeight = height;
		}
		
		/**
		 *@private
		 */
		private static __init__(width:number, height:number, config:Config3D):void {
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
				LayaGL.instance.createCommandEncoder = function(reserveSize:number = 128, adjustSize:number = 64, isSyncToRenderThread:boolean = false):CommandEncoder {
					return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
				}
			}
			//函数里面会有判断isConchApp
			Laya3D.enableNative3D();
			Sprite3D.__init__();
			RenderableSprite3D.__init__();
			MeshSprite3D.__init__();
			SkinnedMeshSprite3D.__init__();
			ShuriKenParticle3D.__init__();
			BaseMaterial.__init__();
			BlinnPhongMaterial.__init__();
			PBRStandardMaterial.__init__();
			PBRSpecularMaterial.__init__();
			SkyProceduralMaterial.__init__();
			UnlitMaterial.__init__();
			TrailSprite3D.__init__();
			TrailMaterial.__init__();
			EffectMaterial.__init__();
			WaterPrimaryMaterial.__init__();
			ShurikenParticleMaterial.__init__();
			TerrainMaterial.__init__();
			ExtendTerrainMaterial.__init__();
			PostProcess.__init__();
			ShaderInit3D.__init__();
			PixelLineMaterial.defaultMaterial.lock = true;
			BlinnPhongMaterial.defaultMaterial.lock = true;
			EffectMaterial.defaultMaterial.lock = true;
			PBRStandardMaterial.defaultMaterial.lock = true;
			PBRSpecularMaterial.defaultMaterial.lock = true;
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
			
			var createMap:any = LoaderManager.createMap;
			createMap["lh"] = [Laya3D.HIERARCHY, Sprite3D._parse];
			createMap["ls"] = [Laya3D.HIERARCHY, Scene3D._parse];
			createMap["lm"] = [Laya3D.MESH, Mesh._parse];
			createMap["lmat"] = [Laya3D.MATERIAL, BaseMaterial._parse];
			createMap["ltc"] = [Laya3D.TEXTURECUBE, TextureCube._parse];
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
			createMap["thdata"] = [Laya3D.TERRAINHEIGHTDATA, TerrainHeightData._pharse];
			
			var parserMap:any = Loader.parserMap;
			parserMap[Laya3D.HIERARCHY] = Laya3D._loadHierarchy;
			parserMap[Laya3D.MESH] = Laya3D._loadMesh;
			parserMap[Laya3D.MATERIAL] = Laya3D._loadMaterial;
			parserMap[Laya3D.TEXTURECUBE] = Laya3D._loadTextureCube;
			parserMap[Laya3D.TEXTURE2D] = Laya3D._loadTexture2D;
			parserMap[Laya3D.ANIMATIONCLIP] = Laya3D._loadAnimationClip;
			parserMap[Laya3D.AVATAR] = Laya3D._loadAvatar;
			//parserMap[Laya3D.TERRAINRES] = _loadTerrain;
			//parserMap[Laya3D.TERRAINHEIGHTDATA] = _loadTerrain;
			
			Laya3D._innerFirstLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
			Laya3D._innerSecondLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
			Laya3D._innerThirdLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
			Laya3D._innerFourthLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
		}
		
		private static enableNative3D():void {
			if (Render.isConchApp) {
				LayaGL = window.LayaGLContext;
				var shaderData:any = ShaderData;
				var shader3D:any = ShaderInstance;
				var skinnedMeshRender:any = SkinnedMeshRenderer;
				var avatar:any = Avatar;
				var frustumCulling:any = FrustumCulling;
				var meshRender:any = MeshRenderer;
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
					meshRender.prototype._renderUpdateWithCamera = meshRender.prototype._renderUpdateWithCameraForNative;
				}
				//Matrix4x4.multiply = Matrix4x4.multiplyForNative;
				if (Render.supportWebGLPlusCulling) {
					frustumCulling.renderObjectCulling = FrustumCulling.renderObjectCullingNative;
				}
				
				if (Render.supportWebGLPlusAnimation) {
					avatar.prototype._cloneDatasToAnimator = avatar.prototype._cloneDatasToAnimatorNative;
					FloatKeyframe = window.conchFloatKeyframe;
					Vector3Keyframe = window.conchFloatArrayKeyframe;
					QuaternionKeyframe = window.conchFloatArrayKeyframe;
					KeyframeNode = window.conchKeyframeNode;
					KeyframeNodeList = window.conchKeyframeNodeList;
					var animationClip:any = AnimationClip;
					animationClip.prototype._evaluateClipDatasRealTime = animationClip.prototype._evaluateClipDatasRealTimeForNative;
					skinnedMeshRender.prototype.supportWebGLPlusAnimation = skinnedMeshRender.prototype.supportWebGLPlusAnimationForNative;
				}
			}
			WebGL.shaderHighPrecision = false;
			var precisionFormat:any = LayaGL.instance.getShaderPrecisionFormat(WebGLContext.FRAGMENT_SHADER, WebGLContext.HIGH_FLOAT);
			precisionFormat.precision ? WebGL.shaderHighPrecision = true : WebGL.shaderHighPrecision = false;
		}
		
		/**
		 *@private
		 */
		private static formatRelativePath(base:string, value:string):string {
			var path:string;
			path = base + value;
			
			var char1:string = value.charAt(0);
			if (char1 === ".") {
				var parts:any[] = path.split("/");
				for (var i:number = 0, len:number = parts.length; i < len; i++) {
					if (parts[i] == '..') {
						var index:number = i - 1;
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
		 * @private
		 */
		private static _endLoad(loader:Loader, content:any = null, subResous:any[] = null):void {
			if (subResous) {
				for (var i:number = 0, n:number = subResous.length; i < n; i++) {
					var resou:Resource = (<Resource>Loader.getRes(subResous[i]) );
					(resou) && (resou._removeReference());//加载失败SubResous为空
				}
			}
			loader.endLoad(content);
		}
		
		/**
		 *@private
		 */
		private static _eventLoadManagerError(msg:string):void {
			Laya.loader.event(Event.ERROR, msg);
		}
		
		/**
		 *@private
		 */
		private static _addHierarchyInnerUrls(urls:any[], urlMap:any[], urlVersion:string, hierarchyBasePath:string, path:string, type:string, constructParams:any = null, propertyParams:any = null):string {
			var formatUrl:string = Laya3D.formatRelativePath(hierarchyBasePath, path);
			(urlVersion) && (formatUrl = formatUrl + urlVersion);
			urls.push({url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams});
			urlMap.push(formatUrl);
			return formatUrl;
		}
		
		/**
		 *@private
		 */
		private static _getSprite3DHierarchyInnerUrls(node:any, firstLevelUrls:any[], secondLevelUrls:any[], thirdLevelUrls:any[], fourthLelUrls:any[], subUrls:any[], urlVersion:string, hierarchyBasePath:string):void {
			var i:number, n:number;
			
			var props:any = node.props;
			switch (node.type) {
			case "Scene3D": //TODO:应该自动序列化类型
				var lightmaps:any[] = props.lightmaps;
				for (i = 0, n = lightmaps.length; i < n; i++) {
					var lightMap:any = lightmaps[i];
					lightMap.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightMap.path, Laya3D.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
				}
				var reflectionTextureData:string = props.reflectionTexture;
				(reflectionTextureData) && (props.reflectionTexture = Laya3D._addHierarchyInnerUrls(thirdLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionTextureData, Laya3D.TEXTURECUBE));
				
				if (props.sky) {
					var skyboxMaterial:any = props.sky.material;
					(skyboxMaterial) && (skyboxMaterial.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMaterial.path, Laya3D.MATERIAL));
				}
				break;
			case "Camera": 
				var skyboxMatData:any = props.skyboxMaterial;
				(skyboxMatData) && (skyboxMatData.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMatData.path, Laya3D.MATERIAL));
				break;
			case "TrailSprite3D": 
			case "MeshSprite3D": 
			case "SkinnedMeshSprite3D": 
				var meshPath:string = props.meshPath;
				(meshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, meshPath, Laya3D.MESH));
				var materials:any[] = props.materials;
				if (materials)
					for (i = 0, n = materials.length; i < n; i++)
						materials[i].path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, materials[i].path, Laya3D.MATERIAL);
				break;
			case "ShuriKenParticle3D": 
				var parMeshPath:string = props.meshPath;
				(parMeshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, parMeshPath, Laya3D.MESH));
				props.material.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, props.material.path, Laya3D.MATERIAL);
				break;
			case "Terrain": 
				Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, props.dataPath, Laya3D.TERRAINRES);
				break;
			}
			
			var components:any[] = node.components;
			if (components) {
				for (var k:number = 0, p:number = components.length; k < p; k++) {
					var component:any = components[k];
					switch (component.type) {
					case "Animator": 
						var avatarPath:string = component.avatarPath;
						var avatarData:any = component.avatar;
						(avatarData) && (avatarData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, avatarData.path, Laya3D.AVATAR));
						var clipPaths:string[] = component.clipPaths;
						if (!clipPaths) {
							var layersData:any[] = component.layers;
							for (i = 0; i < layersData.length; i++) {
								var states:any[] = layersData[i].states;
								for (var j:number = 0, m:number = states.length; j < m; j++) {
									var clipPath:string = states[j].clipPath;
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
						var shapes:any[] = component.shapes;
						for (i = 0; i < shapes.length; i++) {
							var shape:any = shapes[i];
							if (shape.type === "MeshColliderShape") {
								var mesh:string = shape.mesh;
								(mesh) && (shape.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
							}
						}
						break;
					}
				}
			}
			
			var children:any[] = node.child;
			for (i = 0, n = children.length; i < n; i++)
				Laya3D._getSprite3DHierarchyInnerUrls(children[i], firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath);
		}
		
		/**
		 *@private
		 */
		private static _loadHierarchy(loader:Loader):void {
			loader.on(Event.LOADED, null, Laya3D._onHierarchylhLoaded, [loader]);
			loader.load(loader.url, Loader.JSON, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _onHierarchylhLoaded(loader:Loader, lhData:any):void {
			var url:string = loader.url;
			var urlVersion:string = Utils3D.getURLVerion(url);
			var hierarchyBasePath:string = URL.getPath(url);
			var firstLevUrls:any[] = [];
			var secondLevUrls:any[] = [];
			var thirdLevUrls:any[] = [];
			var forthLevUrls:any[] = [];
			var subUrls:any[] = [];
			Laya3D._getSprite3DHierarchyInnerUrls(lhData.data, firstLevUrls, secondLevUrls, thirdLevUrls, forthLevUrls, subUrls, urlVersion, hierarchyBasePath);
			var urlCount:number = firstLevUrls.length + secondLevUrls.length + forthLevUrls.length;
			var totalProcessCount:number = urlCount + 1;
			var weight:number = 1 / totalProcessCount;
			Laya3D._onProcessChange(loader, 0, weight, 1.0);
			if (forthLevUrls.length > 0) {
				var processCeil:number = urlCount / totalProcessCount;
				var processHandler:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, weight, processCeil], false);
				Laya3D._innerFourthLevelLoaderManager._create(forthLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerForthLevResouLoaded, [loader, processHandler, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight + processCeil * forthLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
			} else {
				Laya3D._onHierarchyInnerForthLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight, processCeil);
			}
		}
		
		/**
		 *@private
		 */
		private static _onHierarchyInnerForthLevResouLoaded(loader:Loader, processHandler:Handler, lhData:any, subUrls:any[], firstLevUrls:any[], secondLevUrls:any[], thirdLevUrls:any[], processOffset:number, processCeil:number):void {
			(processHandler) && (processHandler.recover());
			if (thirdLevUrls.length > 0) {
				var process:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
				Laya3D._innerThirdLevelLoaderManager._create(thirdLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerThirdLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
			} else {
				Laya3D._onHierarchyInnerThirdLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset, processCeil);
			}
		}
		
		/**
		 *@private
		 */
		private static _onHierarchyInnerThirdLevResouLoaded(loader:Loader, processHandler:Handler, lhData:any, subUrls:any[], firstLevUrls:any[], secondLevUrls:any[], processOffset:number, processCeil:number):void {
			(processHandler) && (processHandler.recover());
			if (secondLevUrls.length > 0) {
				var process:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
				Laya3D._innerSecondLevelLoaderManager._create(secondLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerSecondLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
			} else {
				Laya3D._onHierarchyInnerSecondLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, processOffset, processCeil);
			}
		}
		
		/**
		 *@private
		 */
		private static _onHierarchyInnerSecondLevResouLoaded(loader:Loader, processHandler:Handler, lhData:any, subUrls:any[], firstLevUrls:any[], processOffset:number, processCeil:number):void {
			(processHandler) && (processHandler.recover());
			if (firstLevUrls.length > 0) {
				var process:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
				Laya3D._innerFirstLevelLoaderManager._create(firstLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerFirstLevResouLoaded, [loader, process, lhData, subUrls]), processHandler, null, null, null, 1, true);
			} else {
				Laya3D._onHierarchyInnerFirstLevResouLoaded(loader, null, lhData, subUrls);
			}
		}
		
		/**
		 *@private
		 */
		private static _onHierarchyInnerFirstLevResouLoaded(loader:Loader, processHandler:Handler, lhData:any, subUrls:any[]):void {
			(processHandler) && (processHandler.recover());
			loader._cache = loader._createCache;
			var item:Node = lhData.data.type === "Scene3D" ? Scene3D._parse(lhData, loader._propertyParams, loader._constructParams) : Sprite3D._parse(lhData, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader, item, subUrls);
		}
		
		/**
		 *@private
		 */
		private static _loadMesh(loader:Loader):void {
			loader.on(Event.LOADED, null, Laya3D._onMeshLmLoaded, [loader]);
			loader.load(loader.url, Loader.BUFFER, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _onMeshLmLoaded(loader:Loader, lmData:ArrayBuffer):void {
			loader._cache = loader._createCache;
			var mesh:Mesh = Mesh._parse(lmData, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader, mesh);
		}
		
		/**
		 *@private
		 */
		private static _loadMaterial(loader:Loader):void {
			loader.on(Event.LOADED, null, Laya3D._onMaterilLmatLoaded, [loader]);
			loader.load(loader.url, Loader.JSON, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _onMaterilLmatLoaded(loader:Loader, lmatData:any):void {
			var url:string = loader.url;
			var urlVersion:string = Utils3D.getURLVerion(url);
			var materialBasePath:string = URL.getPath(url);
			var urls:any[] = [];
			var subUrls:any[] = [];
			var customProps:any = lmatData.customProps;
			var formatSubUrl:string;
			var version:string = lmatData.version;
			switch (version) {
			case "LAYAMATERIAL:01": 
			case "LAYAMATERIAL:02": 
				var i:number, n:number;
				var textures:any[] = lmatData.props.textures;
				if (textures) {
					for (i = 0, n = textures.length; i < n; i++) {
						var tex2D:any = textures[i];
						var tex2DPath:string = tex2D.path;
						if (tex2DPath) {
							formatSubUrl = Laya3D.formatRelativePath(materialBasePath, tex2DPath);
							(urlVersion) && (formatSubUrl = formatSubUrl + urlVersion);
							
							urls.push({url: formatSubUrl, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams});//不指定类型,自动根据后缀判断Texture2D或TextureCube
							subUrls.push(formatSubUrl);
							tex2D.path = formatSubUrl;
						}
					}
				}
				break;
			default: 
				throw new Error("Laya3D:unkonwn version.");
			}
			
			var urlCount:number = urls.length;
			var totalProcessCount:number = urlCount + 1;
			var lmatWeight:number = 1 / totalProcessCount;
			Laya3D._onProcessChange(loader, 0, lmatWeight, 1.0);
			if (urlCount > 0) {
				var processHandler:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, lmatWeight, urlCount / totalProcessCount], false);
				Laya3D._innerFourthLevelLoaderManager._create(urls, false, Handler.create(null, Laya3D._onMateialTexturesLoaded, [loader, processHandler, lmatData, subUrls]), processHandler, null, null, null, 1, true);//TODO:还有可能是TextureCube,使用三级
			} else {
				Laya3D._onMateialTexturesLoaded(loader, null, lmatData, null);
			}
		}
		
		/**
		 *@private
		 */
		private static _onMateialTexturesLoaded(loader:Loader, processHandler:Handler, lmatData:any, subUrls:any[]):void {
			loader._cache = loader._createCache;
			var mat:BaseMaterial = BaseMaterial._parse(lmatData, loader._propertyParams, loader._constructParams);
			Laya3D._endLoad(loader, mat, subUrls);
			(processHandler) && (processHandler.recover());
		}
		
		/**
		 *@private
		 */
		private static _loadAvatar(loader:Loader):void {
			loader.on(Event.LOADED, null, function(data:any):void {
				loader._cache = loader._createCache;
				var avatar:Avatar = Avatar._parse(data, loader._propertyParams, loader._constructParams);
				Laya3D._endLoad(loader, avatar);
			});
			loader.load(loader.url, Loader.JSON, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _loadAnimationClip(loader:Loader):void {
			loader.on(Event.LOADED, null, function(data:any):void {
				loader._cache = loader._createCache;
				var clip:AnimationClip = AnimationClip._parse(data, loader._propertyParams, loader._constructParams);
				Laya3D._endLoad(loader, clip);
			});
			loader.load(loader.url, Loader.BUFFER, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _loadTexture2D(loader:Loader):void {
			var url:string = loader.url;
			var index:number = url.lastIndexOf('.') + 1;
			var verIndex:number = url.indexOf('?');
			var endIndex:number = verIndex == -1 ? url.length : verIndex;
			var ext:string = url.substr(index, endIndex - index);
			var type:string;
			switch (ext) {
			case "jpg": 
			case "jpeg": 
			case "bmp": 
			case "gif": 
			case "png": 
				type = "nativeimage";
				break;
			case "dds": 
			case "ktx": 
			case "pvr": 
				type = Loader.BUFFER;
				break;
			}
			
			//需要先注册,否则可能同步加载完成没来得及注册就完成
			loader.on(Event.LOADED, null, function(image:any):void {
				loader._cache = loader._createCache;
				var tex:Texture2D = Texture2D._parse(image, loader._propertyParams, loader._constructParams);
				Laya3D._endLoad(loader, tex);
			});
			loader.load(loader.url, type, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _loadTextureCube(loader:Loader):void {
			loader.on(Event.LOADED, null, Laya3D._onTextureCubeLtcLoaded, [loader]);
			loader.load(loader.url, Loader.JSON, false, null, true);
		}
		
		/**
		 *@private
		 */
		private static _onTextureCubeLtcLoaded(loader:Loader, ltcData:any):void {
			var ltcBasePath:string = URL.getPath(loader.url);
			var urls:any[] = [Laya3D.formatRelativePath(ltcBasePath, ltcData.front), Laya3D.formatRelativePath(ltcBasePath, ltcData.back), Laya3D.formatRelativePath(ltcBasePath, ltcData.left), Laya3D.formatRelativePath(ltcBasePath, ltcData.right), Laya3D.formatRelativePath(ltcBasePath, ltcData.up), Laya3D.formatRelativePath(ltcBasePath, ltcData.down)];
			var ltcWeight:number = 1.0 / 7.0;
			Laya3D._onProcessChange(loader, 0, ltcWeight, 1.0);
			var processHandler:Handler = Handler.create(null, Laya3D._onProcessChange, [loader, ltcWeight, 6 / 7], false);
			Laya3D._innerFourthLevelLoaderManager.load(urls, Handler.create(null, Laya3D._onTextureCubeImagesLoaded, [loader, urls, processHandler]), processHandler, "nativeimage");
		
		}
		
		/**
		 *@private
		 */
		private static _onTextureCubeImagesLoaded(loader:Loader, urls:any[], processHandler:Handler):void {
			var images:any[] = new Array(6);
			for (var i:number = 0; i < 6; i++)
				images[i] = Loader.getRes(urls[i]);
			
			loader._cache = loader._createCache;
			var tex:TextureCube = TextureCube._parse(images, loader._propertyParams, loader._constructParams);
			
			processHandler.recover();
			for (i = 0; i < 6; i++)
				Loader.clearRes(urls[i]);
			Laya3D._endLoad(loader, tex);
		}
		
		/**
		 *@private
		 */
		private static _onProcessChange(loader:Loader, offset:number, weight:number, process:number):void {
			process = offset + process * weight;
			(process < 1.0) && (loader.event(Event.PROGRESS, process));
		}
		
		/**
		 * 初始化Laya3D相关设置。
		 * @param	width  3D画布宽度。
		 * @param	height 3D画布高度。
		 */
		 static init(width:number, height:number, config:Config3D = null, compolete:Handler = null):void {
			if (Laya3D._isInit)
				return;
			Laya3D._isInit = true;
			config = config || Config3D._default;
			config.cloneTo(Laya3D._config);
			Laya3D._editerEnvironment = Laya3D._config._editerEnvironment;
			var physics3D:Function = window.Physics3D;
			if (physics3D == null) {
				Laya3D._enbalePhysics = false;
				Laya3D.__init__(width, height, Laya3D._config);
				compolete && compolete.run();
			} else {
				Laya3D._enbalePhysics = true;
				physics3D(Laya3D._config.defaultPhysicsMemory * 1024 * 1024).then(function():void {
					Laya3D.__init__(width, height, Laya3D._config);
					compolete && compolete.run();
				});
			}
		}
		
		/**
		 * 创建一个 <code>Laya3D</code> 实例。
		 */
		constructor(){
		}
	
	}

