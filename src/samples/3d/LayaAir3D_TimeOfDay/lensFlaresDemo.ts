// import { Laya, loader } from "Laya";
// import { PostProcess } from "laya/d3/component/PostProcess";
// import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
// import { DirectionLight } from "laya/d3/core/light/DirectionLight";
// import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
// import { Scene3D } from "laya/d3/core/scene/Scene3D";
// import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Vector4 } from "laya/d3/math/Vector4";
// import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
// import { Shader3D } from "laya/d3/shader/Shader3D";
// import { Stage } from "laya/display/Stage";
// import { Texture2D } from "laya/resource/Texture2D";
// import { Handler } from "laya/utils/Handler";
// import { Stat } from "laya/utils/Stat";
// import { Laya3D } from "Laya3D";
// import { CameraMoveScript } from "../common/CameraMoveScript";
// import { LensFlaresEffect } from "./lensFlares/LensFlaresEffect";
// import { TimeOfDay } from "./TimeOfDay";


// /**
//  * ...
//  * @author miner
//  */
// export class lensFlaresDemo {

// 	constructor() {
// 		Laya.init(0, 0);
// 		Laya.stage.scaleMode = Stage.SCALE_FULL;
// 		Laya.stage.screenMode = Stage.SCREEN_NONE;
// 		Stat.show();
// 		Shader3D.debugMode = true;
// 		this.onPreLoadFinish();
// 	}

// 	//批量预加载方式
// 	PreloadingRes() {
// 		// //预加载所有资源
// 		// var resource: any[] = ["res/lensFlaresTex/flare.png",
// 		// 						"res/lensFlaresTex/Flare2.png",
// 		// 						"res/lensFlaresTex/lens4.png",
// 		// 						"res/lensFlaresTex/lens5.png"];
// 		// Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
// 	}
// 	onPreLoadFinish() {
// 		this.initScene();
// 	}

// 	initScene(){
// 		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

// 		//添加相机
// 		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
// 		camera.transform.translate(new Vector3(0, 0.7, 1.3));
// 		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
// 		camera.addComponent(CameraMoveScript);
// 		camera.clearFlag = CameraClearFlags.Sky;
// 		//创建方向光
// 		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
// 		//方向光的颜色
// 		directionLight.color.setValue(1, 1, 1);
// 		//设置平行光的方向
// 		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
// 		mat.setForward(new Vector3(0, 1.0, 0));
// 		directionLight.transform.worldMatrix = mat;
// 		//this.addLensFlares(camera,directionLight);
// 		scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox()));
// 		let timeOfDay = new TimeOfDay(directionLight,camera,scene);
// 	}

// //     addLensFlares( camera: Camera,directLight:DirectionLight) {
// //         // todo init
// //         LensFlaresEffect.shaderinit();
// //         // var sun: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1));
// //         // scene.addChild(sun);
// //         // sun.transform.position = new Vector3(-700, 185, 900);
// //         var postProcess: PostProcess = new PostProcess();
// //         var lensEffect: LensFlaresEffect = new LensFlaresEffect(directLight);
// //         postProcess.addEffect(lensEffect);

// //         camera.postProcess = postProcess;

// //         var flareTex1: Texture2D = loader.getRes("res/lensFlaresTex/flare.png");
// //         var flareTex2: Texture2D = loader.getRes("res/lensFlaresTex/Flare2.png");
// //         var flareTex3: Texture2D = loader.getRes("res/lensFlaresTex/lens4.png");
// //         var flareTex4: Texture2D = loader.getRes("res/lensFlaresTex/lens5.png");

// //         lensEffect.addFlare(0.2, 0, new Vector4(1, 1, 1, 1), flareTex2);
// //         lensEffect.addFlare(0.5, 0.2, new Vector4(0.5, 0.5, 1, 1), flareTex3);
// //         lensEffect.addFlare(0.2, 1.0, new Vector4(1, 1, 1, 1), flareTex3);
// //         lensEffect.addFlare(0.4, 0.4, new Vector4(1, 0.5, 1, 1), flareTex1);
// //         lensEffect.addFlare(0.1, 0.6, new Vector4(1, 1, 1, 1), flareTex2);
// //         lensEffect.addFlare(0.3, 0.8, new Vector4(1, 1, 1, 1), flareTex3);
// //     }


// }


