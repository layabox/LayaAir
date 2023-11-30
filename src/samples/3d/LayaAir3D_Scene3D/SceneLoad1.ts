import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { URL } from "laya/net/URL";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class SceneLoad1 {
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Shader3D.debugMode = true;
			//加载场景
			Scene3D.load("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls", Handler.create(this, function (scene: Scene3D): void {
				(<Scene3D>Laya.stage.addChild(scene));

				//获取场景中的相机
				var camera: Camera = (<Camera>scene.getChildByName("Camera"));
				//移动摄像机位置
				camera.transform.position = new Vector3(0, 0.81, -1.85);
				//旋转摄像机角度
				camera.transform.rotate(new Vector3(0, 0, 0), true, false);
				//设置摄像机视野范围（角度）
				camera.fieldOfView = 60;
				//设置背景颜色
				camera.clearColor = new Color(0, 0, 0.6, 1);
				//加入摄像机移动控制脚本
				camera.addComponent(CameraMoveScript);

				//设置灯光环境色
				//scene.ambientColor = new Vector3(2.5, 0, 0);
			}));
		});
	}
}

