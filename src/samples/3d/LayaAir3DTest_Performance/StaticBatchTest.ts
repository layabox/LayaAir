import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class StaticBatchTest {
	constructor() {
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;

			Scene3D.load("res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls", Handler.create(null, function (scene: Scene3D): void {
				(<Scene3D>Laya.stage.addChild(scene));
				scene.getChildAt(0).addComponent(CameraMoveScript);
			}))
		});

	}

}

