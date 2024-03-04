import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory"
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory"
import {WebGL3DRenderPassFactory} from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory"
import {WebGLRenderDeviceFactory} from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory"
import {LengencyRenderEngine3DFactory} from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory"
import { LayaGL } from "laya/layagl/LayaGL";
import {WebGLRenderEngineFactory} from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory"
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { Sprite } from "laya/display/Sprite";

let packurl = 'sample-resource/2d'
//let sceneurl = packurl+'/cacheasbmp.ls';
let sceneurl = packurl+'/fuza.ls';
var is3d=false;
//alert('')
export class SceneLoad1 {
	constructor() {
		//Laya3DRender.renderDriverPassCreate = new GLESRenderDriverPassFactory();
		LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
		LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
		Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
		Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
		Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
		LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
		//初始化引擎
		Laya.init(0, 0).then(async () => {
			//Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Shader3D.debugMode = true;

			await Laya.loader.loadPackage(packurl, null, null);
			await this.loadSceneResource();
	
			// //加载场景
			// Scene3D.load("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls", Handler.create(this, function (scene: Scene3D): void {
			// 	(<Scene3D>Laya.stage.addChild(scene));

			// 	// //获取场景中的相机
			// 	var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
			// 	// //移动摄像机位置
			// 	// camera.transform.position = new Vector3(0, 0.81, -1.85);
			// 	// //旋转摄像机角度
			// 	// camera.transform.rotate(new Vector3(0, 0, 0), true, false);
			// 	// //设置摄像机视野范围（角度）
			// 	// camera.fieldOfView = 60;
			// 	// //设置背景颜色
			// 	// camera.clearColor = new Color(0, 0, 0.6, 1);
			// 	// //加入摄像机移动控制脚本
			// 	// camera.addComponent(CameraMoveScript);

			// 	//设置灯光环境色
			// 	//scene.ambientColor = new Vector3(2.5, 0, 0);
			// }));
		});
	}


	async loadSceneResource() {
		//加载场景
		if(!is3d){
			let scene:PrefabImpl = await Laya.loader.load(sceneurl);
			Laya.stage.addChild(scene.create());
		}else{
			Scene3D.load(sceneurl, Handler.create(this, function (scene: Scene3D): void {
				<Scene3D>Laya.stage.addChild(scene);
	
				// //获取场景中的相机
				var camera: Camera = (<Camera>(scene as Scene3D).getChildByName("Main Camera"));
				// let directionLight = new Sprite3D();
				// let dircom = directionLight.addComponent(DirectionLightCom);
				// scene.addChild(directionLight);
				// //移动摄像机位置
				// camera.transform.position = new Vector3(0, 0.81, -1.85);
				// //旋转摄像机角度
				// camera.transform.rotate(new Vector3(0, 0, 0), true, false);
				// //设置摄像机视野范围（角度）
				// camera.fieldOfView = 60;
				// //设置背景颜色
				// camera.clearColor = new Color(0, 0, 0.6, 1);
				// //加入摄像机移动控制脚本
				if(camera) camera.addComponent(CameraMoveScript);
	
				//设置灯光环境色
				//scene.ambientColor = new Vector3(2.5, 0, 0);
			}));
		}
	}
}

