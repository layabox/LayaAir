import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { URL } from "laya/net/URL";
import { Resource } from "laya/resource/Resource";
import { Button } from "laya/ui/Button";
import { List } from "laya/ui/List";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { DrawTextTexture } from "../3d/LayaAir3D_Advance/DrawTextTexture";
import { Laya3DCombineHtml } from "../3d/LayaAir3D_Advance/Laya3DCombineHtml";
import { Scene2DPlayer3D } from "../3d/LayaAir3D_Advance/Scene2DPlayer3D";
import { Secne3DPlayer2D } from "../3d/LayaAir3D_Advance/Secne3DPlayer2D";
import { AnimationEventByUnity } from "../3d/LayaAir3D_Animation3D/AnimationEventByUnity";
import { AnimationLayerBlend } from "../3d/LayaAir3D_Animation3D/AnimationLayerBlend";
import { AnimatorDemo } from "../3d/LayaAir3D_Animation3D/AnimatorDemo";
import { AnimatorStateScriptDemo } from "../3d/LayaAir3D_Animation3D/AnimatorStateScriptDemo";
import { BoneLinkSprite3D } from "../3d/LayaAir3D_Animation3D/BoneLinkSprite3D";
import { CameraAnimation } from "../3d/LayaAir3D_Animation3D/CameraAnimation";
import { MaterialAnimation } from "../3d/LayaAir3D_Animation3D/MaterialAnimation";
import { RigidbodyAnimationDemo } from "../3d/LayaAir3D_Animation3D/RigidbodyAnimationDemo";
import { SkinAnimationSample } from "../3d/LayaAir3D_Animation3D/SkinAnimationSample";
import { CameraDemo } from "../3d/LayaAir3D_Camera/CameraDemo";
import { CameraLayer } from "../3d/LayaAir3D_Camera/CameraLayer";
import { CameraLookAt } from "../3d/LayaAir3D_Camera/CameraLookAt";
import { CameraRay } from "../3d/LayaAir3D_Camera/CameraRay";
import { D3SpaceToD2Space } from "../3d/LayaAir3D_Camera/D3SpaceToD2Space";
import { MultiCamera } from "../3d/LayaAir3D_Camera/MultiCamera";
import { OrthographicCamera } from "../3d/LayaAir3D_Camera/OrthographicCamera";
import { PickPixel } from "../3d/LayaAir3D_Camera/PickPixel";
import { RenderTargetCamera } from "../3d/LayaAir3D_Camera/RenderTargetCamera";
import { GhostModelShow } from "../3d/LayaAir3D_Demo/GhostModelShow";
import { DirectionLightDemo } from "../3d/LayaAir3D_Lighting/DirectionLightDemo";
import { PointLightDemo } from "../3d/LayaAir3D_Lighting/PointLightDemo";
import { RealTimeShadow } from "../3d/LayaAir3D_Lighting/RealTimeShadow";
import { SpotLightDemo } from "../3d/LayaAir3D_Lighting/SpotLightDemo";
import { BlinnPhongMaterialLoad } from "../3d/LayaAir3D_Material/BlinnPhongMaterialLoad";
import { BlinnPhong_DiffuseMap } from "../3d/LayaAir3D_Material/BlinnPhong_DiffuseMap";
import { BlinnPhong_NormalMap } from "../3d/LayaAir3D_Material/BlinnPhong_NormalMap";
import { BlinnPhong_SpecularMap } from "../3d/LayaAir3D_Material/BlinnPhong_SpecularMap";
import { EffectMaterialDemo } from "../3d/LayaAir3D_Material/EffectMaterialDemo";
import { MaterialDemo } from "../3d/LayaAir3D_Material/MaterialDemo";
import { UnlitMaterialDemo } from "../3d/LayaAir3D_Material/UnlitMaterialDemo";
import { ChangeMesh } from "../3d/LayaAir3D_Mesh/ChangeMesh";
import { CustomMesh } from "../3d/LayaAir3D_Mesh/CustomMesh";
import { MeshLoad } from "../3d/LayaAir3D_Mesh/MeshLoad";
import { MouseInteraction } from "../3d/LayaAir3D_MouseInteraction/MouseInteraction";
import { MultiTouch } from "../3d/LayaAir3D_MouseInteraction/MultiTouch";
import { TouchScriptSample } from "../3d/LayaAir3D_MouseInteraction/TouchScriptSample";
import { Particle_BurningGround } from "../3d/LayaAir3D_Particle3D/Particle_BurningGround";
import { Particle_EternalLight } from "../3d/LayaAir3D_Particle3D/Particle_EternalLight";
import { DynamicBatchTest } from "../3d/LayaAir3D_Performance/DynamicBatchTest";
import { StaticBatchingTest } from "../3d/LayaAir3D_Performance/StaticBatchingTest";
import { PhysicsWorld_BaseCollider } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_BaseCollider";
import { PhysicsWorld_BuildingBlocks } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_BuildingBlocks";
import { PhysicsWorld_Character } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_Character";
import { PhysicsWorld_CollisionFiflter } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_CollisionFiflter";
import { PhysicsWorld_CompoundCollider } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_CompoundCollider";
import { PhysicsWorld_ContinueCollisionDetection } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_ContinueCollisionDetection";
import { PhysicsWorld_Kinematic } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_Kinematic";
import { PhysicsWorld_MeshCollider } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_MeshCollider";
import { PhysicsWorld_RayShapeCast } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_RayShapeCast";
import { PhysicsWorld_TriggerAndCollisionEvent } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_TriggerAndCollisionEvent";
import { GarbageCollection } from "../3d/LayaAir3D_Resource/GarbageCollection";
import { LoadResourceDemo } from "../3d/LayaAir3D_Resource/LoadResourceDemo";
import { EnvironmentalReflection } from "../3d/LayaAir3D_Scene3D/EnvironmentalReflection";
import { LightmapScene } from "../3d/LayaAir3D_Scene3D/LightmapScene";
import { SceneLoad1 } from "../3d/LayaAir3D_Scene3D/SceneLoad1";
import { SceneLoad2 } from "../3d/LayaAir3D_Scene3D/SceneLoad2";
import { ScriptDemo } from "../3d/LayaAir3D_Script/ScriptDemo";
import { Shader_GlowingEdge } from "../3d/LayaAir3D_Shader/Shader_GlowingEdge";
import { Shader_MultiplePassOutline } from "../3d/LayaAir3D_Shader/Shader_MultiplePassOutline";
import { Shader_Simple } from "../3d/LayaAir3D_Shader/Shader_Simple";
import { Shader_Terrain } from "../3d/LayaAir3D_Shader/Shader_Terrain";
import { Sky_Procedural } from "../3d/LayaAir3D_Sky/Sky_Procedural";
import { Sky_SkyBox } from "../3d/LayaAir3D_Sky/Sky_SkyBox";
import { PixelLineSprite3DDemo } from "../3d/LayaAir3D_Sprite3D/PixelLineSprite3DDemo";
import { SkinnedMeshSprite3DDemo } from "../3d/LayaAir3D_Sprite3D/SkinnedMeshSprite3DDemo";
import { Sprite3DClone } from "../3d/LayaAir3D_Sprite3D/Sprite3DClone";
import { Sprite3DLoad } from "../3d/LayaAir3D_Sprite3D/Sprite3DLoad";
import { Sprite3DParent } from "../3d/LayaAir3D_Sprite3D/Sprite3DParent";
import { TransformDemo } from "../3d/LayaAir3D_Sprite3D/TransformDemo";
import { TextureDemo } from "../3d/LayaAir3D_Texture/TextureDemo";
import { TextureGPUCompression } from "../3d/LayaAir3D_Texture/TextureGPUCompression";
import { TrailDemo } from "../3d/LayaAir3D_Trail/TrailDemo";
import { TrailRender } from "../3d/LayaAir3D_Trail/TrailRender";
import { IndexViewUI } from "../ui/IndexViewUI";
import { PostProcessBloom } from "../3d/LayaAir3D_PostProcess/PostProcessBloom";
import { MultiLight } from "../3d/LayaAir3D_Lighting/MultiLight";
import { PBRMaterialDemo } from "../3d/LayaAir3D_Material/PBRMaterialDemo";
import { DamagedHelmetModelShow } from "../3d/LayaAir3D_Demo/DamagedHelmetModelShow";
import { CerberusModelShow } from "../3d/LayaAir3D_Demo/CerberusModelShow";
import { PhysicsWorld_ConstraintFixedJoint } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_ConstraintFixedJoint";
import { PhysicsWorld_ConfigurableJoint } from "../3d/LayaAir3D_Physics3D/PhysicsWorld_ConfigurableJoint";
import { Config3D } from "Config3D";
import { SpotLightShadowMap } from "../3d/LayaAir3D_Lighting/SpotLightShadowMap";
import { VideoPlayIn3DWorld } from "../3d/LayaAir3D_Advance/VideoPlayIn3DWorld";
import { SimpleSkinAnimationInstance } from "../3d/LayaAir3D_Animation3D/SimpleSkinAnimationInstance";
import { PostProcess_Blur } from "../3d/LayaAir3D_PostProcess/PostProcess_Blur";
import { CommandBuffer_Outline } from "../3d/LayaAir3D_Advance/CommandBuffer_Outline";
import { CommandBuffer_BlurryGlass } from "../3d/LayaAir3D_Advance/CommandBuffer_BlurryGlass";
import { HalfFloatTexture } from "../3d/LayaAir3D_Texture/HalfFloatTexture";
import { ReflectionProbeDemo } from "../3d/LayaAir3D_Advance/ReflectionProbeDemo";
import { CameraDepthModeTextureDemo } from "../3d/LayaAir3D_Advance/CameraDepthModeTextureDemo";
import { PostProcess_Edge } from "../3d/LayaAir3D_PostProcess/PostProcess_Edge";
import { LoadGltfResource } from "../3d/LayaAir3D_Resource/LoadGltfResource";
import { CommandBuffer_DrawCustomInstance } from "../3d/LayaAir3D_Advance/CommandBuffer_DrawCustomInstance";
import { GrassDemo } from "../3d/LayaAir3D_Demo/GrassRender/GrassDemo";
import { Blinnphong_Transmission } from "../3d/LayaAir3D_Material/BlinnPhong_Transmission";
import { GPUCompression_ETC2 } from "../3d/LayaAir3D_Texture/GPUCompression_ETC2";
import { GPUCompression_ASTC } from "../3d/LayaAir3D_Texture/GPUCompression_ASTC";
import { SeparableSSS_RenderDemo } from "../3d/LayaAir3D_Advance/SeparableSSS_RenderDemo";
import { PostProcessDoF } from "../3d/LayaAir3D_PostProcess/PostProcess_DoF";
import { SkeletonMask } from "../3d/LayaAir3D_Animation3D/SkeletonMask";
import { ProstProcess_AO } from "../3d/LayaAir3D_PostProcess/PostProcess_AO";
import { Utils } from "laya/utils/Utils";
import Client from "../Client";
import { Main } from "../Main";
import { StencilDemo } from "../3d/LayaAir3D_Material/StencilDemo";
import { WebXRStart } from "../3d/WebXR/WebXRStart";
import { WebXRControllerDemo } from "../3d/WebXR/WebXRControllerDemo";
import { GriendSkyAmbientDemo } from "../3d/LayaAir3D_Scene3D/GriendSkyAmbientDemo";
import { Browser } from "laya/utils/Browser";

export class IndexView3D extends IndexViewUI {

	private _bigIndex: number = -1;
	private _smallIndex: number;
	private _oldView: any;

	private oldPath: string = URL.basePath;

	private btn: Button;
	private btnOn: boolean = false;
	private a_length: number;
	private b_length: number;
	private m_length: number;
	// performance合集先去掉
	// CannonPhysics3D先去掉
	private _comboxBigArr2: any[] = ['Resource', 'Scene3D', 'Camera', 'Lighting', 'Sprite3D', 'Mesh', 'Material', 'Texture', 'Animation3D', 'Physics3D', 'MouseLnteraction', 'Script', 'Sky', 'Particle3D', 'Trail', 'Shader', 'Advance', 'Demo','PostProcess','WebXR'];
	//var s:Secne3DPlayer2D    
	//AStarFindPath 删除
	//VideoPlayIn3DWorld videoTexture现在跑不起来
	// SeparableSSS_RenderDemo暂时去掉
	// Scene2DPlayer3D暂时去掉
	// Laya3DCombineHtml暂时去掉
	private _advanceClsArr: any[] = [DrawTextTexture, Secne3DPlayer2D,VideoPlayIn3DWorld,CommandBuffer_Outline,CommandBuffer_BlurryGlass,CommandBuffer_DrawCustomInstance,CameraDepthModeTextureDemo,ReflectionProbeDemo];//PostProcessBloom,AStarFindPath,
	private _advanceArr: any[] = ['DrawTextTexture', 'Secne3DPlayer2D','VideoPlayIn3DWorld','CommandBuffer_Outline','CommandBuffer_BlurryGlass','CommandBuffer_DrawCustomInstance','CameraDepthTextureDemo', 'ReflectionProbeDemo'];//'后期处理之泛光','寻路示例',

	private _postProcessClsArr:any[] = [PostProcessBloom,PostProcess_Blur,PostProcess_Edge,PostProcessDoF,ProstProcess_AO];
	private _postProcessArr:any[] = ['PostProcessBloom','PostProcess_Blur','PostProcess_Edge','PostProcessDOF','PostProcessAO'];
	// AnimationLayerBlend暂时去掉
	// BoneLinkSprite3D暂时去掉
	// MaterialAnimation暂时去掉
	// SkinAnimationSample暂时去掉
	private _animationClsArr: any[] = [AnimationEventByUnity, AnimatorDemo, AnimatorStateScriptDemo, CameraAnimation, RigidbodyAnimationDemo,SimpleSkinAnimationInstance,SkeletonMask];//AnimationEventByUnity,AnimationLayerBlend,BoneLinkSprite3D,RigidbodyAnimationDemo
	private _animationArr: any[] = ["AnimationEventByUnity", 'Animator', "AnimatorStateScript", "CameraAnimation", "RigidbodyAnimation", "SimpleSkinAnimationInstance,SkinMask"];

	private _cameraClsArr: any[] = [CameraDemo, CameraLayer, CameraLookAt, CameraRay, D3SpaceToD2Space, MultiCamera, OrthographicCamera, PickPixel, RenderTargetCamera];
	private _cameraArr: any[] = ['Camera', 'CameraLayer', 'CameraLookAt', 'CameraRay', 'D3SpaceToD2Space', 'MultiCamera', 'OrthographicCamera', 'PickPixel', 'RenderTargetCamera'];
	// GhostModelShow暂时去掉
	private _demoClsArr: any[] = [DamagedHelmetModelShow, CerberusModelShow,GrassDemo];
	private _demoArr: any[] = ['DamagedHelmetModelShow', 'CerberusModelShow','Grass'];

	private _lightingClsArr: any[] = [DirectionLightDemo, PointLightDemo, RealTimeShadow,SpotLightShadowMap,  SpotLightDemo, MultiLight];
	private _lightingArr: any[] = ['DirectionLight', 'PointLight', 'RealTimeShadow', 'SpotLightShadowMap', 'SpotLight', 'MultiLight'];
	// Blinnphong_Transmission废弃
	private _mterialClsArr: any[] = [BlinnPhong_DiffuseMap, BlinnPhong_NormalMap, BlinnPhong_SpecularMap, BlinnPhongMaterialLoad, EffectMaterialDemo, MaterialDemo, PBRMaterialDemo, UnlitMaterialDemo, StencilDemo];//BlinnPhong_DiffuseMap,BlinnPhong_NormalMap,BlinnPhong_SpecularMap,BlinnPhongMaterialLoad,EffectMaterialDemo,UnlitMaterialDemo
	private _materilArr: any[] = ['BlinnPhong_DiffuseMap', 'BlinnPhong_NormalMap', "BlinnPhong_SpecularMap", "BlinnPhongMaterialLoad", "EffectMaterial", "Material", "PBRMaterial", "UnlitMaterial", "StencilDemo"];

	private _meshClsArr: any[] = [ChangeMesh, CustomMesh, MeshLoad];
	private _meshArr: any[] = ['ChangeMesh', 'CustomMesh', "MeshLoad"];
	// TouchScriptSample暂时去掉
	private _mouseLnteractionClsArr: any[] = [MouseInteraction, MultiTouch];
	private _mouseLnteractionArr: any[] = ['MouseInteraction', 'MultiTouch'];

	private _particleClsArr: any[] = [Particle_BurningGround, Particle_EternalLight];
	private _particleArr: any[] = ['Particle_BurningGround', 'Particle_EternalLight'];
	// 性能分析的先去掉
	// StaticBatchingTest
	// DynamicBatchTest
	private _performanceClsArr: any[] = [StaticBatchingTest, DynamicBatchTest];
	private _performanceArr: any[] = ['StaticBatchingTest', 'DynamicBatchTest'];

	private _physicsClsArr: any[] = [PhysicsWorld_BaseCollider, PhysicsWorld_BuildingBlocks, PhysicsWorld_Character, PhysicsWorld_CollisionFiflter, PhysicsWorld_CompoundCollider, PhysicsWorld_ContinueCollisionDetection, PhysicsWorld_Kinematic, PhysicsWorld_MeshCollider, PhysicsWorld_RayShapeCast, PhysicsWorld_TriggerAndCollisionEvent, PhysicsWorld_ConstraintFixedJoint, PhysicsWorld_ConfigurableJoint];
	private _physicslArr: any[] = ['PhysicsWorld_BaseCollider', 'PhysicsWorld_BuildingBlocks', 'PhysicsWorld_Character', 'PhysicsWorld_CollisionFiflter', 'PhysicsWorld_CompoundCollider', 'PhysicsWorld_ContinueCollisionDetection', 'PhysicsWorld_Kinematic', 'PhysicsWorld_MeshCollider', 'PhysicsWorld_RayShapeCast', 'PhysicsWorld_TriggerAndCollisionEvent', 'PhysicsWorld_ConstraintFixedJoint', 'PhysicsWorld_ConfigurableJoint'];

	//LoadResourceDemo需要换一下示例，LoadGltfResource需要谷主查一下

	private _resourceClsArr: any[] = [GarbageCollection, LoadResourceDemo,LoadGltfResource];
	private _resourceArr: any[] = ['GarbageCollection', 'LoadResourceDemo','LoadGltfResource'];

	private _scene3DClsArr: any[] = [EnvironmentalReflection, LightmapScene, SceneLoad1, ];
	private _scene3DArr: any[] = ['EnvironmentalReflection', 'LightmapScene', 'SceneLoad1'];

	private _scriptClsArr: any[] = [ScriptDemo];
	private _scriptArr: any[] = ['ScriptDemo'];

	private _shaderClsArr: any[] = [Shader_MultiplePassOutline, Shader_GlowingEdge, Shader_Simple];
	private _shaderArr: any[] = ['Shader_MultiplePassOutline', 'Shader_GlowingEdge', 'Shader_Simple'];
	// GriendSkyAmbientDemo渐变环境光废弃
	private _skyClsArr: any[] = [Sky_Procedural, Sky_SkyBox];
	private _skyArr: any[] = ['Sky_Procedural', 'Sky_SkyBox'];

	private _sprite3DClsArr: any[] = [PixelLineSprite3DDemo, SkinnedMeshSprite3DDemo, Sprite3DClone, Sprite3DLoad, Sprite3DParent, TransformDemo];
	private _sprite3DArr: any[] = ['PixelLineSprite3D', 'SkinnedMeshSprite3D', "Sprite3DClone", 'Sprite3DLoad', 'Sprite3DParent', 'Transform'];

	private _textureClsArr: any[] = [TextureDemo, HalfFloatTexture,TextureGPUCompression,GPUCompression_ETC2,GPUCompression_ASTC];
	private _textureArr: any[] = ['Texture', 'HalfFloatTexture','TextureGPUCompression','ETC2Texture','ASTCTexture'];

	private _trailClsArr: any[] = [TrailDemo, TrailRender];
	private _trailArr: any[] = ['Trail', 'TrailRender'];
	
	private _webXRClsArr:any[] = [WebXRStart,WebXRControllerDemo];
	private _WebXRArr: any[] = ['WebXRStart', 'WebXRControllerDemo'];


	// private _testPerformanceClsArr:any[] = [ArrayObjectPerformance,DataViewPerformance,MemoryTest,SkinAnimationPerformance,StaticBatchTest,];
	// private _testPerformanceArr:any[] = ['ArrayObjectPerformance','DataViewPerformance','MemoryTest','SkinAnimationPerformance','StaticBatchTest'];


	constructor() {
		super();
		this.initView3D();
		this.initEvent();
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		this.zOrder = 99999;
	}

	private initEvent(): void {
		this.bigComBox.selectHandler = new Handler(this, this.onBigComBoxSelectHandler);
		this.smallComBox.selectHandler = new Handler(this, this.onSmallBoxSelectHandler);
		Laya.stage.on("next",this,this.onNext);
	}

	onNext(data:any)
	{
		if(data.hasOwnProperty("bigType"))
		{
			//示例切换
			this.a_length = data.bigType;
			var smallType:number = data.smallType;
			this.switchFunc(this.a_length, smallType);
		}else
		{
			var isMaster:any = parseInt(Browser.getQueryString("isMaster"))||0;
			if(isMaster)return;
			//示例内单独小类型切换
			this._oldView && this._oldView['stypeFun'+data.stype] && this._oldView['stypeFun'+data.stype](data.value);
		}
	}

	private initView3D(): void {
		var lables: string = this._comboxBigArr2.toString();
		this.box1.mouseThrough = true;
		this.bigComBox.labels = lables;
		this.bigComBox.selectedIndex = 0;
		this.bigComBox.visibleNum = 15;//_comboxBigArr.length;
		this.bigComBox.list.vScrollBarSkin = " ";
		this.bigComBox.autoSize = false;
		this.bigComBox.list.selectEnable = true;
		this.bigComBox.width = 230;
		this.bigComBox.height = 50;
		this.bigComBox.labelSize = 35;
		this.bigComBox.itemSize = 30;
		//this.bigComBox.left = 100;
		//this.bigComBox.bottom = -300;
		this.smallComBox.x = this.bigComBox.x + this.bigComBox.width + 20;

		this.smallComBox.selectedIndex = 0;
		//默认显示第一项
		//onSmallBoxSelectHandler(0);
		this.smallComBox.list.vScrollBarSkin = " ";
		this.smallComBox.visibleNum = 15;//_comboBoxSpriteArr.length;
		this.smallComBox.list.selectEnable = true;
		this.smallComBox.width = 360;
		this.smallComBox.height = 50;
		this.smallComBox.labelSize = 35;
		this.smallComBox.itemSize = 30;
		//this.smallComBox.left = 350
		//this.smallComBox.bottom = -300;

		this.btn = new Button();
		this.btn.skin = "comp/vscroll$down.png"
		this.addChild(this.btn);
		this.btn.scale(4, 4);
		//this.btn.bottom = -300;
		//btn.right = -430;
		this.btn.left = 700;
		this.btn.on(Event.MOUSE_DOWN, this, this.nextBtn);
	}
	private i: number = 0;
	private nextBtn(): void {
		//_bigIndex += 1;
		var isMaster:any = Browser.getQueryString("isMaster");
		var i_length:number;
		this.a_length = this._bigIndex;
		if (this.smallComBox.selectedIndex == this.b_length)
		{
			this.a_length += 1;
			i_length = 0;
		}
		else
		{
			i_length = this.smallComBox.selectedIndex+1;
		}
		var bigType:number = this.a_length;
		var smallType:number = i_length;
		if(Main.isOpenSocket && parseInt(isMaster)==1)
		{
			//主控制推送
			Client.instance.send({type:"next",bigType:bigType,smallType:smallType,isMaster:isMaster});
		}else
		{
			
			this.switchFunc(this.a_length, i_length);
		}

	}

	private onSmallBoxSelectHandler(index: number): void {
		if (index < 0)
			return;
		if (this.btnOn && this.m_length != 0) {
			return;
		}
		var isMaster:any = parseInt(Browser.getQueryString("isMaster"))||0;
		if(Main.isOpenSocket && !this.btnOn && isMaster)
		{
			this.onDirectSwitch();
		}
		this.m_length += 1;
		this.onClearPreBox();
		this._smallIndex = index;
		if (false) {
			if (this.i % 2 == 0) {
				this._oldView = new RealTimeShadow;
			}
			else {
				this._oldView = new RealTimeShadow;
			}
		}
		else {

			var _comboxBigArr2: any[] = ['Resource', 'Scene3D', 'Camera', 'Lighting', 'Sprite3D', 'Mesh', 'Material', 'Texture', 'Animation3D', 'Physics3D', 'MouseLnteraction', 'Sky', 'Script', 'Particle3D', 'Trail', 'Shader', 'Advance', 'Demo','PostProcess','WebXR'];
			switch (this._bigIndex) {
				case 0:
					this._oldView = new this._resourceClsArr[index];
					this.b_length = this._resourceClsArr.length - 1;
					break;
				case 1:
					this._oldView = new this._scene3DClsArr[index];
					this.b_length = this._scene3DClsArr.length - 1;
					break;
				case 2:
					this._oldView = new this._cameraClsArr[index];
					this.b_length = this._cameraClsArr.length - 1;
					break;
				case 3:
					this._oldView = new this._lightingClsArr[index];
					this.b_length = this._lightingClsArr.length - 1;
					break;
				case 4:
					this._oldView = new this._sprite3DClsArr[index];
					this.b_length = this._sprite3DClsArr.length - 1;
					break;
				case 5:
					this._oldView = new this._meshClsArr[index];
					this.b_length = this._meshClsArr.length - 1;
					break;
				case 6:
					this._oldView = new this._mterialClsArr[index];
					this.b_length = this._mterialClsArr.length - 1;
					break;
				case 7:
					this._oldView = new this._textureClsArr[index];
					this.b_length = this._textureClsArr.length - 1;
					break;
				case 8:
					this._oldView = new this._animationClsArr[index];
					this.b_length = this._animationClsArr.length - 1;
					break;
				case 9:
					this._oldView = new this._physicsClsArr[index];
					this.b_length = this._physicsClsArr.length - 1;
					break;
				case 10:
					this._oldView = new this._mouseLnteractionClsArr[index];
					this.b_length = this._mouseLnteractionClsArr.length - 1;
					break;
				case 11:
					this._oldView = new this._scriptClsArr[index];
					this.b_length = this._scriptClsArr.length - 1;
					break;
				case 12:
					this._oldView = new this._skyClsArr[index];
					this.b_length = this._skyClsArr.length - 1;
					break;
				case 13:
					this._oldView = new this._particleClsArr[index];
					this.b_length = this._particleClsArr.length - 1;
					break;
				case 14:
					this._oldView = new this._trailClsArr[index];
					this.b_length = this._trailClsArr.length - 1;
					break;
				case 15:
					this._oldView = new this._shaderClsArr[index];
					this.b_length = this._shaderClsArr.length - 1;
					break;
				case 16:
					this._oldView = new this._advanceClsArr[index];
					this.b_length = this._advanceClsArr.length - 1;
					break;
				case 17:
					this._oldView = new this._demoClsArr[index];
					this.b_length = this._demoClsArr.length - 1;
					break;
				case 18:
					this._oldView = new this._postProcessClsArr[index];
					this.b_length = this._postProcessClsArr.length-1;
					break;
				case 19:
					this._oldView = new this._webXRClsArr[index];
					this.b_length = this._webXRClsArr.length-1;
					break;
				// case 20:
					
				// this._oldView = new this._performanceClsArr[index];
				// this.b_length = this._performanceClsArr.length - 1;
				// break;
				// 	this._oldView = new this._testPerformanceClsArr[index];
				// 	this.b_length = this._testPerformanceClsArr.length - 1;
				// 	break;
				default:
					break;
			}
		}
	}

	private onClearPreBox(): void {
		Laya.timer.clearAll(this._oldView);
		Laya.stage.offAllCaller(this._oldView);
		if (this._oldView) {
			var i: number = Laya.stage.numChildren - 1;
			for (i; i > -1; i--) {
				if ((Laya.stage.getChildAt(i)) == this || (Laya.stage.getChildAt(i)) instanceof List) {
					//trace("__________________");
				}
				else if (Laya.stage.getChildAt(i)) {
					Laya.stage.getChildAt(i).destroy();
				}
			}
		}
		this._oldView = null;
		Resource.destroyUnusedResources();
		URL.basePath = this.oldPath;//还原BasePath

	}

	/**
	 * 
	 * @param bigListIndex 
	 * @param smallListIndex 
	 * @param isAutoSwitch 是否自动切换
	 */
	switchFunc(bigListIndex: number, smallListIndex: number,isAutoSwitch:boolean = true): void {
		this.btnOn = true;
		this.m_length = 0;
		this.bigComBox.selectedIndex = bigListIndex;
		this.onBigComBoxSelectHandler(bigListIndex, smallListIndex,isAutoSwitch);
		this.btnOn = false;
	}


	private onBigComBoxSelectHandler(index: number, smallIndex: number = 0,isAutoSwitch:boolean = false): void {
		if(this._bigIndex!=index){
			var isMaster:any = parseInt(Browser.getQueryString("isMaster"))||0;
			if(Main.isOpenSocket && !isAutoSwitch && isMaster)
			{
				this.onDirectSwitch();
				return;
			}
			this._bigIndex = index;
			var labelStr: string;
			switch (index) {
				case 0:
					labelStr = this._resourceArr.toString();
					break;
				case 1:
					labelStr = this._scene3DArr.toString();
					break;
				case 2:
					labelStr = this._cameraArr.toString();
					break;
				case 3:
					labelStr = this._lightingArr.toString();
					break;
				case 4:
					labelStr = this._sprite3DArr.toString();
					break;
				case 5:
					labelStr = this._meshArr.toString();
					break;
				case 6:
					labelStr = this._materilArr.toString();
					break;
				case 7:
					labelStr = this._textureArr.toString();
					break;
				case 8:
					labelStr = this._animationArr.toString();
					break;
				case 9:
					labelStr = this._physicslArr.toString();
					break;
				case 10:
					labelStr = this._mouseLnteractionArr.toString();
					break;
				case 11:
					labelStr = this._scriptArr.toString();
					break;
				case 12:
					labelStr = this._skyArr.toString();
					break;
				case 13:
					labelStr = this._particleArr.toString();
					break;
				case 14:
					labelStr = this._trailArr.toString();
					break;
				case 15:
					labelStr = this._shaderArr.toString();
					break;
				case 16:
					labelStr = this._advanceArr.toString();
					break;
				case 17:
					labelStr = this._demoArr.toString();
					break;
				case 18:
					labelStr = this._postProcessArr.toString();
					break;
				case 19:
					labelStr = this._WebXRArr.toString();
					break;
				// case 20:
				// 	break;
				default:
					break;
				// labelStr = this._performanceArr.toString();
			}
			this.smallComBox.labels = labelStr;
		}
		this.smallComBox.selectedIndex = smallIndex;
	}

	onDirectSwitch()
	{
		var smallType:number = this.smallComBox.selectedIndex;
		var bigType:number = this.bigComBox.selectedIndex;
		if(this._bigIndex != this.bigComBox.selectedIndex)
			smallType = 0;
		//主控制推送
		Client.instance.send({type:"next",bigType:bigType,smallType:smallType});
	}
}

