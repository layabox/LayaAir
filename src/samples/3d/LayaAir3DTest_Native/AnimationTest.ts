import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
import { Camera } from "laya/d3/core/Camera"
import { Scene3D } from "laya/d3/core/scene/Scene3D"
import { Stage } from "laya/display/Stage"
import { Handler } from "laya/utils/Handler"
import { Stat } from "laya/utils/Stat"
import { Browser } from "laya/utils/Browser"

export class AnimationTest {
	constructor() {
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;


			if (Browser.onAndroid) {
				Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/Android/layaScene.ls", Handler.create(null, function (scene: Scene3D): void {
					(<Scene3D>Laya.stage.addChild(scene));
					var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
					camera.addComponent(CameraMoveScript);
				}));
			}
			else if (Browser.onIOS) {
				Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/IOS/layaScene.ls", Handler.create(null, function (scene: Scene3D): void {
					(<Scene3D>Laya.stage.addChild(scene));
					var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
					camera.addComponent(CameraMoveScript);
				}));
			}
			else {
				Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/Conventional/layaScene.ls", Handler.create(null, function (scene: Scene3D): void {
					(<Scene3D>Laya.stage.addChild(scene));
					var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
					camera.addComponent(CameraMoveScript);
				}));
			}
		});

	}

}


