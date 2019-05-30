import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { DynamicBatchTest } from "../3d/LayaAir3DTest_Performance/DynamicBatchTest";
import { SkinAnimationPerformance } from "../3d/LayaAir3DTest_Performance/SkinAnimationPerformance";
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
import { RenderTargetCamera } from "../3d/LayaAir3D_Camera/RenderTargetCamera";
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
import { PBRStandardMaterialDemo } from "../3d/LayaAir3D_Material/PBRStandardMaterialDemo";
import { UnlitMaterialDemo } from "../3d/LayaAir3D_Material/UnlitMaterialDemo";
import { WaterPrimaryMaterialDemo } from "../3d/LayaAir3D_Material/WaterPrimaryMaterialDemo";
import { ChangeMesh } from "../3d/LayaAir3D_Mesh/ChangeMesh";
import { CustomMesh } from "../3d/LayaAir3D_Mesh/CustomMesh";
import { MeshLoad } from "../3d/LayaAir3D_Mesh/MeshLoad";
import { MouseInteraction } from "../3d/LayaAir3D_MouseInteraction/MouseInteraction";
import { TouchScriptSample } from "../3d/LayaAir3D_MouseInteraction/TouchScriptSample";
import { Particle_BurningGround } from "../3d/LayaAir3D_Particle3D/Particle_BurningGround";
import { Particle_EternalLight } from "../3d/LayaAir3D_Particle3D/Particle_EternalLight";
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
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { URL } from "laya/net/URL";
import { Resource } from "laya/resource/Resource";
import { Button } from "laya/ui/Button";
import { List } from "laya/ui/List";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { IndexViewUI } from "../ui/IndexViewUI";
import { Main } from "./../Main";
	
	export class IndexView3D extends IndexViewUI
	{
		
		private _bigIndex:number = 0;
		private _smallIndex:number;
		private _oldView:any;
		
		private oldPath:string = URL.basePath;
		
		private btn :Button;
		private btnOn:boolean = false;
		private a_length:number;
		private b_length:number;
		private m_length:number;
		
		private _comboxBigArr2:any[] = ['高级应用', '动画', '摄影机', '灯光', '材质', '网格', 'mouseLnteraction', '粒子系统', 'performance', '物理系统', 'resource', 'scene3D',
											'script','shader','sky','sprite3D','texture','trail'];
		//var s:Secne3DPlayer2D
		private _advanceClsArr:any[] = [Laya3DCombineHtml,Scene2DPlayer3D,Secne3DPlayer2D];
		private _advanceArr:any[] = ['Laya3D与网页混合','2D坐标转3D坐标','3D坐标转2D坐标'];
		
		private _animationClsArr:any[] = [AnimatorDemo,AnimatorStateScriptDemo,CameraAnimation,MaterialAnimation,SkinAnimationSample,AnimationEventByUnity,AnimationLayerBlend,BoneLinkSprite3D,RigidbodyAnimationDemo];//AnimationEventByUnity,AnimationLayerBlend,BoneLinkSprite3D,RigidbodyAnimationDemo
		private _animationArr:any[] = ['Animator',"AnimatorStateScript","CameraAnimation","MaterialAnimation","SkinAnimationSample","AnimationEventByUnity","AnimationLayerBlend","BoneLinkSprite3D","RigidbodyAnimation"];
		
		private _cameraClsArr:any[] = [CameraDemo, CameraLayer, CameraLookAt, CameraRay, D3SpaceToD2Space, MultiCamera, OrthographicCamera, RenderTargetCamera];
		private _cameraArr:any[] = ['Camera', 'CameraLayer', 'CameraLookAt','CameraRay','D3SpaceToD2Space','MultiCamera','OrthographicCamera','RenderTargetCamera'];
		
		private _lightingClsArr:any[] = [DirectionLightDemo,PointLightDemo,RealTimeShadow,SpotLightDemo];
		private _lightingArr:any[] = ['DirectionLight', 'PointLight', 'RealTimeShadow', 'SpotLight'];
		
		private _mterialClsArr:any[] = [BlinnPhong_DiffuseMap,BlinnPhong_NormalMap,BlinnPhong_SpecularMap,BlinnPhongMaterialLoad,EffectMaterialDemo,MaterialDemo,PBRStandardMaterialDemo,UnlitMaterialDemo,WaterPrimaryMaterialDemo];//BlinnPhong_DiffuseMap,BlinnPhong_NormalMap,BlinnPhong_SpecularMap,BlinnPhongMaterialLoad,EffectMaterialDemo,UnlitMaterialDemo
		private _materilArr:any[] = ['BlinnPhong_DiffuseMap', 'BlinnPhong_NormalMap', "BlinnPhong_SpecularMap", "BlinnPhongMaterialLoad", "EffectMaterial", "Material", "PBRStandardMaterial", "UnlitMaterial", "WaterPrimaryMaterial"];
	
		private _meshClsArr:any[] = [ChangeMesh,CustomMesh,MeshLoad];
		private _meshArr:any[] = ['ChangeMesh', 'CustomMesh',"MeshLoad"];
		
		private _mouseLnteractionClsArr:any[] = [MouseInteraction, SceneLoad2,TouchScriptSample];
		private _mouseLnteractionArr:any[] = ['MouseInteraction', 'SceneLoad2',"TouchScriptSample"];
		
		private _particleClsArr:any[] = [Particle_BurningGround,Particle_EternalLight];
		private _particleArr:any[] = ['Particle_BurningGround', 'Particle_EternalLight'];
		
		private _performanceClsArr:any[] = [StaticBatchingTest];
		private _performanceArr:any[] = ['StaticBatchingTest'];
		
		private _physicsClsArr:any[] = [PhysicsWorld_BaseCollider, PhysicsWorld_BuildingBlocks, PhysicsWorld_Character, PhysicsWorld_CollisionFiflter, PhysicsWorld_CompoundCollider, PhysicsWorld_ContinueCollisionDetection, PhysicsWorld_Kinematic, PhysicsWorld_MeshCollider, PhysicsWorld_RayShapeCast, PhysicsWorld_TriggerAndCollisionEvent];
		private _physicslArr:any[] = ['PhysicsWorld_BaseCollider', 'PhysicsWorld_BuildingBlocks', 'PhysicsWorld_Character', 'PhysicsWorld_CollisionFiflter', 'PhysicsWorld_CompoundCollider', 'PhysicsWorld_ContinueCollisionDetection', 'PhysicsWorld_Kinematic', 'PhysicsWorld_MeshCollider', 'PhysicsWorld_RayShapeCast', 'PhysicsWorld_TriggerAndCollisionEvent'];
		
		private _resourceClsArr:any[] = [GarbageCollection,LoadResourceDemo];
		private _resourceArr:any[] = ['GarbageCollection', 'LoadResourceDemo'];
		
		private _scene3DClsArr:any[] = [EnvironmentalReflection,LightmapScene,SceneLoad1,SceneLoad2];
		private _scene3DArr:any[] = ['EnvironmentalReflection', 'LightmapScene', 'SceneLoad1', "SceneLoad2"];
		
		private _scriptClsArr:any[] = [ScriptDemo];
		private _scriptArr:any[] = ['ScriptDemo'];
		
		private _shaderClsArr:any[] = [Shader_MultiplePassOutline,Shader_GlowingEdge,Shader_Simple,Shader_Terrain];
		private _shaderArr:any[] = ['Shader_MultiplePassOutline', 'Shader_GlowingEdge', 'Shader_Simple', "Shader_Terrain"];
		
		private _skyClsArr:any[] = [Sky_Procedural,Sky_SkyBox];
		private _skyArr:any[] = ['Sky_Procedural','Sky_SkyBox'];
		
		private _sprite3DClsArr:any[] = [PixelLineSprite3DDemo,SkinnedMeshSprite3DDemo,Sprite3DClone,Sprite3DLoad,Sprite3DParent,TransformDemo];
		private _sprite3DArr:any[] = ['PixelLineSprite3D', 'SkinnedMeshSprite3D',"Sprite3DClone",'Sprite3DLoad','Sprite3DParent','Transform'];
		
		
		private _trailClsArr:any[] = [TrailDemo,TrailRender];
		private _trailArr:any[] = ['Trail','TrailRender'];
		
		constructor(){
			super();
			this.initView3D();
			this.initEvent();
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.zOrder = 99999;
		}
		
		private initEvent():void
		{
			this.bigComBox.selectHandler = new Handler(this, this.onBigComBoxSelectHandler);
			this.smallComBox.selectHandler = new Handler(this, this.onSmallBoxSelectHandler);
		}
		
		private initView3D():void
		{
			var lables:string = this._comboxBigArr2.toString()
			this.bigComBox.labels = lables;
			this.bigComBox.selectedIndex = 0;
			this.bigComBox.visibleNum = 5;//_comboxBigArr.length;
			this.bigComBox.list.vScrollBarSkin = "";
			this.bigComBox.autoSize = false;
			this.bigComBox.list.selectEnable = true;
			this.bigComBox.width = 230;
			this.bigComBox.height = 50;
			this.bigComBox.labelSize = 35;
			this.bigComBox.itemSize = 30;
			this.bigComBox.left  = 100;
			this.bigComBox.bottom = -300;
			this.smallComBox.x = this.bigComBox.x + this.bigComBox.width + 20;
			
			this.smallComBox.selectedIndex = 0;
			//默认显示第一项
			//onSmallBoxSelectHandler(0);
			this.smallComBox.list.vScrollBarSkin = "";
			this.smallComBox.visibleNum =  5;//_comboBoxSpriteArr.length;
			this.smallComBox.list.selectEnable = true;
			this.smallComBox.width = 360;
			this.smallComBox.height = 50;
			this.smallComBox.labelSize = 35;
			this.smallComBox.itemSize = 30;
			this.smallComBox.left = 350
			this.smallComBox.bottom = -300;
			
			this.btn = new Button();
			this.btn.skin = "comp/vscroll$down.png"
			this.addChild(this.btn);
			this.btn.scale(4, 4);
			this.btn.bottom = -300;
			//btn.right = -430;
			this.btn.left = 750;
			this.btn.on(Event.MOUSE_DOWN, this, this.nextBtn);
		}
		private i:number = 0;
		private nextBtn():void {
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
			
			//i++;
			
			this.switchFunc(this.a_length, i_length);
			
		}
		
		private onSmallBoxSelectHandler(index:number):void
		{
			if (index < 0)
				return;
			if ( this.btnOn && this.m_length != 0)
			{
				return;
			}
			//m_length += 1;
			this.onClearPreBox();
			
			this._smallIndex = index;
			if (false)
			{
				if (this.i%2 == 0)
				{
					this._oldView = new SkinAnimationPerformance;
				}
				else
				{
					this._oldView = new DynamicBatchTest;
				}
			}
			else
			{
				switch (this._bigIndex)
				{
					case 0: 
						this._oldView = new this._advanceClsArr[index];
						this.b_length = this._advanceClsArr.length - 1;
						break;
					case 1: 
						this._oldView = new this._animationClsArr[index];
						this.b_length = this._animationClsArr.length - 1;
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
						this._oldView = new this._mterialClsArr[index];
						this.b_length = this._mterialClsArr.length - 1;
						break;
					case 5:
						this._oldView = new this._meshClsArr[index];
						this.b_length = this._meshClsArr.length - 1;
						break;
					case 6:
						this._oldView = new this._mouseLnteractionClsArr[index];
						this.b_length = this._mouseLnteractionClsArr.length - 1;
						break;
					case 7:
						this._oldView = new this._particleClsArr[index];
						this.b_length = this._particleClsArr.length - 1;
						break;
					case 8:
						this._oldView = new this._performanceClsArr[index];
						this.b_length = this._performanceClsArr.length - 1;
						break;
					case 9:
						this._oldView = new this._physicsClsArr[index];
						this.b_length = this._physicsClsArr.length - 1;
						break;
					case 10:
						this._oldView = new this._resourceClsArr[index];
						this.b_length = this._resourceClsArr.length - 1;
						break;
					case 11:
						this._oldView = new this._scene3DClsArr[index];
						this.b_length = this._scene3DClsArr.length - 1;
						break;
					case 12:
						this._oldView = new this._scriptClsArr[index];
						this.b_length = this._scriptClsArr.length - 1;
						break;
					case 13:
						this._oldView = new this._shaderClsArr[index];
						this.b_length = this._shaderClsArr.length - 1;
						break;
					case 14:
						this._oldView = new this._skyClsArr[index];
						this.b_length = this._skyClsArr.length - 1;
						break;
					case 15:
						this._oldView = new this._sprite3DClsArr[index];
						this.b_length = this._sprite3DClsArr.length - 1;
						break;
					case 16:
						//this._oldView = new this._textureClsArr[index];
						//this.b_length = this._textureClsArr.length - 1;
						break;
					case 17:
						this._oldView = new this._trailClsArr[index];
						this.b_length = this._trailClsArr.length - 1;
						break;
					default: 
						break;
				}
			}
		}
		
		private onClearPreBox():void
		{
			if (this._oldView)
			{
				Laya.timer.clearAll(this._oldView);
				//Laya.stage.offAllCaller(_oldView);
				var i:number =Laya.stage.numChildren-1;
				for (i; i>-1; i--)
				{
					if ((Laya.stage.getChildAt(i))== Main._indexView||(Laya.stage.getChildAt(i)) instanceof List)
					{
						//trace("__________________");
					}
					else if(Laya.stage.getChildAt(i))
					{
						Laya.stage.getChildAt(i).destroy();
					}
				}
			}
			this._oldView = null;
			Resource.destroyUnusedResources();
			URL.basePath =this.oldPath;//还原BasePath
			
		}
		
		 switchFunc(bigListIndex:number,smallListIndex:number):void
		{
			this.btnOn = true;
			this.m_length = 0;
			this.bigComBox.selectedIndex = bigListIndex;
			this.onBigComBoxSelectHandler(bigListIndex, smallListIndex);
			this.btnOn = false;
			
		}
		
		
		private onBigComBoxSelectHandler(index:number,smallIndex:number = 0):void
		{
			this._bigIndex = index;
			var labelStr:string;
			switch (index)
			{
				case 0: //sprite3D
					labelStr = this._advanceArr.toString();
					break;
				case 1: //mesh
					labelStr = this._animationArr.toString();
					break;
				case 2: //ligth
					labelStr = this._cameraArr.toString();
					break;
				case 3: //material
					labelStr = this._lightingArr.toString();
					break;
				case 4: //camera
					labelStr = this._materilArr.toString();
					break;
				case 5: //SkyBox
					labelStr = this._meshArr.toString();
					break;
				case 6: //Scene
					labelStr = this._mouseLnteractionArr.toString();
					break;
				case 7: //animation
					labelStr = this._particleArr.toString();
					break;
				case 8: //particle
					labelStr = this._performanceArr.toString();
					break;
				case 9: //physics
					labelStr = this._physicslArr.toString();
					break;
				case 10: //shader
					labelStr = this._resourceArr.toString();
					break;
				case 11: //advanced
					labelStr = this._scene3DArr.toString();
					break;
				case 12: //advanced
					labelStr = this._scriptArr.toString();
					break;
				case 13: //advanced
					labelStr = this._shaderArr.toString();
					break;
				case 14: //advanced
					labelStr = this._skyArr.toString();
					break;
				case 15: //advanced
					labelStr = this._sprite3DArr.toString();
					break;
				case 16: //advanced
					//labelStr = this._textureArr.toString();
					break;
				case 17: //advanced
					labelStr = this._trailArr.toString();
					break;
				default: 
					break;
			}
			this.smallComBox.labels = labelStr;
			this.smallComBox.selectedIndex = smallIndex;
			this.smallComBox.visibleNum = 5;//(labelStr.split(",") as Array).length;
		}
	}

