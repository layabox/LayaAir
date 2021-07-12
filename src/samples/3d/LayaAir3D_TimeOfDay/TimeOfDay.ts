// import { Laya, loader } from "Laya";
// import { PostProcess } from "laya/d3/component/PostProcess";
// import { Camera } from "laya/d3/core/Camera";
// import { DirectionLight } from "laya/d3/core/light/DirectionLight";
// import { Scene3D } from "laya/d3/core/scene/Scene3D";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Vector4 } from "laya/d3/math/Vector4";
// import { SkyDome } from "laya/d3/resource/models/SkyDome";
// import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
// import { Texture2D } from "laya/resource/Texture2D";
// import { Handler } from "laya/utils/Handler";
// import { LensFlaresEffect } from "./lensFlares/LensFlaresEffect";
// import { AtmosphereSkyMaterial } from "./TimeOfDay_AtsmosphereSky/AtmosphereSkyMaterial";

// export class TimeOfDay{
//     static tempVec:Vector3 = new Vector3();
//     bindSun:DirectionLight;
//     view:Camera;
//     lensTexture:string[] = ["res/lensFlaresTex/flare.png",
//     "res/lensFlaresTex/Flare2.png",
//     "res/lensFlaresTex/lens4.png",
//     "res/lensFlaresTex/lens5.png"];
//     scene:Scene3D;
//     skyMaterial:AtmosphereSkyMaterial;
//     sunDir:Vector3 = new Vector3();
//     moonDir:Vector3 = new Vector3();
//     lensProcses:PostProcess;
//     constructor(directLight:DirectionLight,camera:Camera,scene:Scene3D){
//         this.bindSun = directLight;
//         this.view = camera;
//         this.scene = scene;
//         Laya.loader.create(this.lensTexture, Handler.create(this, this.onPreLoadFinish));
//     }
//     onPreLoadFinish() {
//         let lens = this.view.postProcess =  new PostProcess();
//         this.addLensFlares(this.view,this.bindSun);
//         this.changeSceneSky();
//         this.update();
        
//     }

//     update(){
// 		//this.bindSun.transform.rotate(TimeOfDay.tempVec);
// 		this.bindSun.transform.getForward(this.moonDir);
// 			Vector3.scale(this.moonDir,-1,this.sunDir);
// 			Vector3.normalize(this.sunDir,this.sunDir);
// 			Vector3.normalize(this.moonDir,this.moonDir);
// 			(this.skyMaterial as AtmosphereSkyMaterial).sonDirection = this.sunDir;
// 			(this.skyMaterial as AtmosphereSkyMaterial).moonDirection = this.moonDir;
//             if(this.moonDir.y<-0.6){
//                 this.lensProcses.enable = true;
//             }
//             else{
//                 this.lensProcses.enable = false;
//             }
            
// 	}

//     changeSceneSky(){
//         	//初始化天空渲染器
// 		var skyRenderer: SkyRenderer = this.scene.skyRenderer;
// 		//创建天空盒mesh
// 		skyRenderer.mesh = SkyDome.instance;
// 		//使用程序化天空盒
//         this.skyMaterial= skyRenderer.material = new AtmosphereSkyMaterial();
//     }

//     addLensFlares( camera: Camera,directLight:DirectionLight) {
//                 // todo init
//                 LensFlaresEffect.shaderinit();
        
//                 // var sun: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1));
//                 // scene.addChild(sun);
        
//                 // sun.transform.position = new Vector3(-700, 185, 900);
        
//                 this.lensProcses = new PostProcess();
        
//                 var lensEffect: LensFlaresEffect = new LensFlaresEffect(directLight);
//                 this.lensProcses.addEffect(lensEffect);
        
//                 camera.postProcess = this.lensProcses;
        
//                 var flareTex1: Texture2D = loader.getRes(this.lensTexture[0]);
//                 var flareTex2: Texture2D = loader.getRes(this.lensTexture[1]);
//                 var flareTex3: Texture2D = loader.getRes(this.lensTexture[2]);
//                 var flareTex4: Texture2D = loader.getRes(this.lensTexture[3]);
        
//                 lensEffect.addFlare(0.2, 0, new Vector4(1, 1, 1, 1), flareTex2);
//                 lensEffect.addFlare(0.5, 0.2, new Vector4(0.5, 0.5, 1, 1), flareTex3);
//                 lensEffect.addFlare(0.2, 1.0, new Vector4(1, 1, 1, 1), flareTex3);
//                 lensEffect.addFlare(0.4, 0.4, new Vector4(1, 0.5, 1, 1), flareTex1);
//                 lensEffect.addFlare(0.1, 0.6, new Vector4(1, 1, 1, 1), flareTex2);
//                 lensEffect.addFlare(0.3, 0.8, new Vector4(1, 1, 1, 1), flareTex3);
//     }

//     destroy(){
        
//     }
    

// }