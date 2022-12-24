import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author ...
 */
export class LightmapScene {

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("res/threeDimen/scene/ParticleScene/Example_01.ls", Handler.create(this, function (sprite: Scene3D): void {
			var scene: Scene3D = <Scene3D>Laya.stage.addChild(sprite);
			var camera: Camera = <Camera>scene.addChild(new Camera(0, 0.1, 100));
			camera.transform.translate(new Vector3(0, 1, 0));
			camera.addComponent(CameraMoveScript);
		}));

	}

}


