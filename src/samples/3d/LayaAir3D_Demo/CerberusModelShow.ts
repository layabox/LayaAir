
import { Laya } from "Laya";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { Browser } from "laya/utils/Browser";
import { Script } from "laya/components/Script";

/**
 * model rotation script.
 */
class RotationScript extends Script {
	private _lastMouseX: number;
	private _mouseDown: boolean = false;
	private _rotate: Vector3 = new Vector3();

	model: Sprite3D;

	constructor() {
		super();
		Laya.stage.on(Event.MOUSE_DOWN, this, function (): void {
			this._mouseDown = true;
			this._lastMouseX = Laya.stage.mouseX;
		});
		Laya.stage.on(Event.MOUSE_UP, this, function (): void {
			this._mouseDown = false;
		});

	}
	onUpdate(): void {
		if (this._mouseDown) {
			var deltaX: number = Laya.stage.mouseX - this._lastMouseX;
			this._rotate.y = deltaX * 0.2;
			this.model.transform.rotate(this._rotate, false, false);
			this._lastMouseX = Laya.stage.mouseX;
		}
	}
}

export class CerberusModelShow {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		Scene3D.load("res/threeDimen/scene/LayaScene_CerberusScene/Conventional/CerberusScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var model: Sprite3D = <Sprite3D>scene.getChildByName("Cerberus_LP");
			var rotationScript: RotationScript = model.addComponent(RotationScript);
			rotationScript.model = model;

			var size: number = 20;
			this.addText(size, size * 4, "Drag the screen to rotate the model.", "#F09900");
			size = 10;
			this.addText(size, Laya.stage.height - size * 4, "Cerberus by Andrew Maximov     http://artisaverb.info/PBT.html", "#FFFF00");
		}));
	}

	/**
	 * add text.
	 */
	addText(size: number, y: number, text: string,color:string): void {
		var cerberusText: Text = new Text();
		cerberusText.color = color;
		cerberusText.fontSize = size * Browser.pixelRatio;
		cerberusText.x = size;
		cerberusText.y = y;
		cerberusText.text = text;
		Laya.stage.addChild(cerberusText);
	}
}



