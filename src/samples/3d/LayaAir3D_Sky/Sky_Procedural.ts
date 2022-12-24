import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyPanoramicMaterial } from "laya/d3/core/material/SkyPanoramicMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Handler } from "laya/utils/Handler";

export class Sky_Procedural {

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		Texture2D.load("res/Mans_Outside_2k.hdr", Handler.create(this, function (texture: Texture2D): void {
				this.createScene(texture);
		}));


		//旋转平行光,模拟太阳轨迹
		// Laya.timer.frameLoop(1, this, function (): void {
		// 	directionLight.transform.rotate(rotation);
		// });

	}

	createScene(texture: Texture2D) {
		//初始化3D场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		//初始化天空渲染器
		var skyRenderer: SkyRenderer = scene.skyRenderer;
		//创建天空盒mesh
		skyRenderer.mesh = SkyDome.instance;
		//使用程序化天空盒
		let mats = skyRenderer.material = new SkyPanoramicMaterial();
		mats.panoramicTexture = texture;
		//初始化相机并设置清除标记为天空
		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.addComponent(CameraMoveScript);
		//设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
		camera.clearFlag = CameraClearFlags.Sky;

		// //初始化平行光
		// var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		// //设置平行光的方向
		// var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		// mat.setForward(new Vector3(0, -1, 0));
		// directionLight.transform.worldMatrix = mat;
		// var rotation: Vector3 = new Vector3(-0.01, 0, 0);
	}
}

