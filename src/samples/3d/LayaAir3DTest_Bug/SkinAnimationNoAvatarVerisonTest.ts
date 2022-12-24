import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
import { Camera } from "laya/d3/core/Camera"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { DirectionLight } from "laya/d3/core/light/DirectionLight"
import { Scene3D } from "laya/d3/core/scene/Scene3D"
import { Stage } from "laya/display/Stage"
import { Button } from "laya/ui/Button"
import { Handler } from "laya/utils/Handler"
import { Stat } from "laya/utils/Stat"
import { Animator } from "laya/d3/component/Animator/Animator";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";

/**
 * ...
 * @author
 */
export class SkinAnimationNoAvatarVerisonTest {
	private changeActionButton: Button;
	private zombieAnimator: Animator;
	private curStateIndex: number = 0;
	private clipName: any[] = ["idle", "fallingback", "idle", "walk", "Take 001"];
	private _translate: Vector3 = new Vector3(0, 1.5, 4);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
		camera.transform.translate(this._translate);
		camera.transform.rotate(this._rotation, true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(this._forward);
		directionLight.transform.worldMatrix = mat;
		directionLight.color.setValue(1, 1, 1, 1);

		Sprite3D.load("res/threeDimen/skinModel/Zombie/Plane.lh", Handler.create(this, function (plane: Sprite3D): void {
			scene.addChild(plane);
		}));

		Sprite3D.load("test/monkey.lh", Handler.create(this, function (zombie: Sprite3D): void {
			//Sprite3D.load("test/Conventional/monkey.lh", Handler.create(this, function(zombie:Sprite3D):void {
			//scene.addChild(zombie.clone());
			scene.addChild(zombie);
			//zombieAnimator = (zombie.getChildAt(0) as Sprite3D).getComponent(Animator) as Animator;//获取Animator动画组件
			//loadUI();
		}));
	}

}

