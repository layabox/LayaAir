
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class CerberusModelShow {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		Scene3D.load("res/threeDimen/scene/LayaScene_CerberusScene/Conventional/CerberusScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			var moveScript: CameraMoveScript = camera.addComponent(CameraMoveScript);
			moveScript.speed = 0.005;

			var size: number = 20;
			this.addText(size, Laya.stage.height - size * 2, "Cerberus by Andrew Maximov     http://artisaverb.info/PBT.html");
		}));
	}

	/**
	 * add text.
	 */
	addText(size: number, y: number, text: string): void {
		var cerberusText: Text = new Text();
		cerberusText.color = "#FFFF00";
		cerberusText.fontSize = size;
		cerberusText.x = size;
		cerberusText.y = y;
		cerberusText.text = text;
		Laya.stage.addChild(cerberusText);
	}
}



