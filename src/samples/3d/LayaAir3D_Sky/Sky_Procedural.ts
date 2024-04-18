import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyProceduralMaterial } from "laya/d3/core/material/SkyProceduralMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class Sky_Procedural {

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			//初始化3D场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//初始化天空渲染器
			var skyRenderer: SkyRenderer = scene.skyRenderer;
			//创建天空盒mesh
			skyRenderer.mesh = SkyDome.instance;
			//使用程序化天空盒
			skyRenderer.material = new SkyProceduralMaterial();

			//初始化相机并设置清除标记为天空
			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.addComponent(CameraMoveScript);
			//设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
			camera.clearFlag = CameraClearFlags.Sky;

			//初始化平行光
			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			//设置平行光的方向
			var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
			mat.setForward(new Vector3(0, -1, 0));
			directlightSprite.transform.worldMatrix = mat;
			var rotation: Vector3 = new Vector3(-0.01, 0, 0);

			//旋转平行光,模拟太阳轨迹
			Laya.timer.frameLoop(1, this, function (): void {
				directlightSprite.transform.rotate(rotation);
			});
		});
	}
}

