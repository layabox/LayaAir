import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { LoaderManager } from "laya/net/LoaderManager";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { MergePBRMateial } from "../LayaAir3D_Script/LayaAir3D_MergePBR/MergePBRMateial";

export class SceneLoad1 {
	mergeMaterial:MergePBRMateial;
	scene:Scene3D;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		MergePBRMateial.__init__();

		this.PreloadingRes();
		// //加载场景
		// Scene3D.load("res/threeDimen/LayaScene_New Scene 2/Conventional/New Scene 2.ls", Handler.create(this, function (scene: Scene3D): void {
		// 	(<Scene3D>Laya.stage.addChild(scene));
		// 	this.scene = scene;
		// 	//获取场景中的相机
		// 	debugger;
		// 	 var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
		// 	 camera.addComponent(CameraMoveScript);
		// 	 for(let i=0; i< scene.numChildren;i++){
		// 		 let sprit = scene.getChildAt(i);
		// 		 if(sprit instanceof MeshSprite3D){
		// 			 (sprit as MeshSprite3D).meshRenderer.castShadow = true;
		// 			 (sprit as MeshSprite3D).meshRenderer.receiveShadow = true;
		// 		 }
		// 		 if(sprit instanceof DirectionLight){
		// 			 (sprit as DirectionLight).shadowMode = ShadowMode.Hard;
		// 			 (sprit as DirectionLight).shadowResolution = 2048;
		// 			 // Set shadow max distance from camera.
		// 			 (sprit as DirectionLight).shadowDistance = 30;
		// 			 (sprit as DirectionLight).shadowDepthBias = 3;
		// 			 (sprit as DirectionLight).shadowNormalBias = 0;
		// 			 (sprit as DirectionLight).shadowCascadesMode = ShadowCascadesMode.NoCascades;
		// 			(sprit as DirectionLight).shadowDistance = 50;
		// 		 }
		// 	 }
			
			//this.cloneMesh(scene.getChildByName("SM_container_01_LOD0"));
			// Sprite3D.load("res/261/Conventional/SM_bucket_01_LOD0.lh", Handler.create(this, function (sprite: Sprite3D): void {
			// 	this.scene.addChild(sprite);
			// 	sprite.transform.position = new Vector3(3,0,0);
			// }));
			//设置灯光环境色
			//scene.ambientColor = new Vector3(2.5, 0, 0);
		// }));
	}
	// cloneMesh(ori:MeshSprite3D){
	// 	let me:MeshSprite3D = this.scene.addChild( (ori.clone() as MeshSprite3D)) as MeshSprite3D;
	// 	me.transform.position = new Vector3(10.0,0);
	// 	let oldmat:PBRStandardMaterial = me.meshRenderer.sharedMaterial as PBRStandardMaterial;
	// 	let mat = me.meshRenderer.sharedMaterial = new MergePBRMateial();
	// 	mat.normalEmissTexture = Loader.getRes("res/LayaScene_SampleScene/Conventional/Assets/test/test/T_container_01_Normal.png");
	// }
	//批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		var resource: any[] = ["res/threeDimen/scene/TerrainScene/XunLongShi.ls",
			"res/threeDimen/skyBox/skyBox2/skyBox2.lmat",
			"res/threeDimen/texture/earth.png",
			"res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm",
			"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh",
			"res/threeDimen/skinModel/BoneLinkScene/PangZiNoAni.lh",
			"res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani"];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish(){

	}
	
}


