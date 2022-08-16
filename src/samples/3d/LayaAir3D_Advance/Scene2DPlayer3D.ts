import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { InputManager } from "laya/events/InputManager";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Transform3D } from "laya/d3/core/Transform3D";

export class Scene2DPlayer3D {

	/**
	 * (pos.x pos.y) 屏幕位置
	 *  pos.z 深度取值范围(-1,1);
	 * */
	private _pos: Vector3 = new Vector3(310, 500, 0);
	private _translate: Vector3 = new Vector3(0, 0, 0);
	private _translate2: Vector3 = new Vector3(5, -10, 1);
	private _translate3: Vector3 = new Vector3(0, 0, -0.2);
	private _translate4: Vector3 = new Vector3(0, 0, 0.2);
	private _translate5: Vector3 = new Vector3(-0.2, 0, 0);
	private _translate6: Vector3 = new Vector3(0.2, 0, 0);
	private _layaMonkey: Sprite3D;
	private _rotation: Vector3 = new Vector3(-45, 0, 0);

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		//var dialog:Image = Laya.stage.addChild(new Image("res/threeDimen/secne.jpg")) as Image;
		var dialog: Image = new Image("res/threeDimen/secne.jpg");
		Laya.stage.addChild(dialog);
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		camera.transform.rotate(this._rotation, false, false);
		camera.transform.translate(this._translate2);
		camera.orthographic = true;
		camera.clearFlag = CameraClearFlags.SolidColor;
		//正交投影垂直矩阵尺寸
		camera.orthographicVerticalSize = 10;

		scene.addChild(new DirectionLight());

		Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
			scene.addChild(layaMonkey);
			this._layaMonkey = layaMonkey;
			var transform: Transform3D = layaMonkey.transform;
			var localScale: Vector3 = transform.localScale;
			var rotationEuler: Vector3 = transform.rotationEuler;
			//转换2D屏幕坐标系统到3D正交投影下的坐标系统
			camera.convertScreenCoordToOrthographicCoord(this._pos, this._translate);
			transform.position = this._translate;
			localScale.setValue(0.3, 0.3, 0.3);
			transform.localScale = localScale;
			rotationEuler.setValue(-30, 0, 0);
			transform.rotationEuler = rotationEuler;

			Laya.timer.frameLoop(1, this, this.onKeyDown);
		}));

	}
	private onKeyDown(): void {
		var transform: Transform3D = this._layaMonkey.transform;
		InputManager.hasKeyDown(87) && transform.translate(this._translate3);//W
		InputManager.hasKeyDown(83) && transform.translate(this._translate4);//S
		InputManager.hasKeyDown(65) && transform.translate(this._translate5);//A
		InputManager.hasKeyDown(68) && transform.translate(this._translate6);//D
	}
}

