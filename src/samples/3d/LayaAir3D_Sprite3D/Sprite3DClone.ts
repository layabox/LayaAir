import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

export class Sprite3DClone {

	private scene: Scene3D;

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Color(1, 1, 1);

		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.5, 1));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

		Laya.loader.create("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, this.onComplete));
	}

	onComplete(): void {

		var layaMonkey: Sprite3D = (<Sprite3D>this.scene.addChild(Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")));
		//克隆sprite3d
		var layaMonkey_clone1: Sprite3D = Sprite3D.instantiate(layaMonkey, this.scene, false, new Vector3(0.6, 0, 0));
		//克隆sprite3d
		var layaMonkey_clone2: Sprite3D = (<Sprite3D>this.scene.addChild(Sprite3D.instantiate(layaMonkey, null, false, new Vector3(-0.6, 0, 0))));
	}
}

