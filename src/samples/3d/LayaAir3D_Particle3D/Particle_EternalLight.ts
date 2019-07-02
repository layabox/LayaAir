import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author ...
 */
export class Particle_EternalLight {

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 2, 4));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
		camera.clearColor = new Vector4(0, 0, 0, 1);

		Sprite3D.load("res/threeDimen/particle/ETF_Eternal_Light.lh", Handler.create(this, function (sprite: Sprite3D): void {
			(<Sprite3D>scene.addChild(sprite));
		}))

	}

}


