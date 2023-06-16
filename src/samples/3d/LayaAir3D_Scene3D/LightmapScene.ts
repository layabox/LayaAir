import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Color } from "laya/maths/Color";

/**
 * ...
 * @author ...
 */
export class LightmapScene {

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			Scene3D.load("res/threeDimen/scene/ParticleScene/Scene.ls", Handler.create(this, function (sprite: Scene3D): void {
				var scene: Scene3D = <Scene3D>Laya.stage.addChild(sprite);
				var camera: Camera = <Camera>scene.addChild(new Camera(0, 0.1, 100));
				camera.transform.translate(new Vector3(2, 2.7, 3));
				camera.transform.rotate(new Vector3(0, 43, 0), false, false);
				camera.clearFlag = CameraClearFlags.SolidColor;
				camera.clearColor = new Color(0, 0, 0, 1);
				camera.addComponent(CameraMoveScript);
			}));
		});

	}

}


