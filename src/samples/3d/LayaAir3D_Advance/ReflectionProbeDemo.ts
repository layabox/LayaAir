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
		Scene3D.load("res/threeDimen/ReflectionProbeDemo/Conventional/outpost with snow.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));

			//获取场景中的相机
			var camera: Camera = (<Camera>scene.getChildByName("Camera"));
			camera.addComponent(CameraMoveScript);

			//var reflectionProb: ReflectionProbe = scene.getChildByName("ReflectionProb") as ReflectionProbe;
			var lineSprite3D: PixelLineSprite3D = new PixelLineSprite3D(50, null);
			scene.addChild(lineSprite3D);
			//@ts-ignore  画出反射探针的volume包围盒
			//Utils3D._drawBound(lineSprite3D, reflectionProb.bounds, Color.RED);
		}));
	}
}

