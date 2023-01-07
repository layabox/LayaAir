import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class ReflectionProbeDemo {
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//加载场景
		Scene3D.load("res/threeDimen/ReflectionProbeDemo/ReflectionProbe.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			//获取场景中的相机
			var camera: Camera = (<Camera>scene.getChildByName("Camera"));
			camera.addComponent(CameraMoveScript);
		}));
	}
}

