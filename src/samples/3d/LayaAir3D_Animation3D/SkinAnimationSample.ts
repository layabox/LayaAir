import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author
 */
export class SkinAnimationSample {
	private changeActionButton: Button;
	private zombieAnimator: Animator;
	private curStateIndex: number = 0;
	private clipName: any[] = ["idle", "fallingback", "idle", "walk", "Take 001"];
	private _translate: Vector3 = new Vector3(0, 1.5, 4);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);

	/**实例类型*/
	private btype:any = "SkinAnimationSample";
	/**场景内按钮类型*/
	private stype:any = 0;

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

		Sprite3D.load("res/threeDimen/skinModel/Zombie/Zombie.lh", Handler.create(this, function (zombie: Sprite3D): void {
			scene.addChild(zombie);
			this.zombieAnimator = (<Animator>((<Sprite3D>zombie.getChildAt(0))).getComponent(Animator));//获取Animator动画组件
			this.loadUI();
		}));
	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(curStateIndex:number) {
		//根据名称播放动画
		this.zombieAnimator.play(this.clipName[++this.curStateIndex % this.clipName.length]);
		curStateIndex = this.curStateIndex;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:curStateIndex});
	}

}

