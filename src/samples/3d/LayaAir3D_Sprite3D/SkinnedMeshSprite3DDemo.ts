import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class SkinnedMeshSprite3DDemo {
	private scene: Scene3D;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();

			//创建场景
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//创建相机
			var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 0.5, 1));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//添加光照
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(1, 1, 1, 1);
			directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));

			//预加载资源
			Laya.loader.load("res/threeDimen/skinModel/dude/dude.lh", Handler.create(this, this.onComplete));
		});
	}

	onComplete(): void {
		//添加父级猴子
		var dude: Sprite3D = (<Sprite3D>this.scene.addChild(Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh")));
		//缩放
		var scale: Vector3 = new Vector3(0.1, 0.1, 0.1);
		dude.transform.localScale = scale;
		dude.transform.rotate(new Vector3(0, 3.14, 0));
	}

}


