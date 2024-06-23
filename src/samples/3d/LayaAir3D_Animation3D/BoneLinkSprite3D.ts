import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

/**
 * ...
 * @author ...
 */
export class BoneLinkSprite3D {
	private scene: Scene3D;
	private role: Sprite3D;
	private pangzi: Sprite3D;
	private dragon1: Sprite3D;
	private dragon2: Sprite3D;
	private aniSprte3D1: Sprite3D;
	private aniSprte3D2: Sprite3D;
	private animator: Animator;
	private _dragonScale: Vector3 = new Vector3(0.1, 0.1, 0.1);
	private _translate: Vector3 = new Vector3(0, 3, 5);
	private _rotation2: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);
	private changeActionButton: Button;
	private curStateIndex: number = 0;

	/**实例类型*/
	private btype: any = "BoneLinkSprite3D";
	/**场景内按钮类型*/
	private stype: any = 0;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			//适配模式
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;

			//开启统计信息
			Stat.show();

			//预加载所有资源
			var resource: any[] = ["res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Bary/Bary.lh",
				"res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Carn/Carn.lh",
				"res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];

			Laya.loader.load(resource, Handler.create(this, this.onLoadFinish));
		});
	}

	private onLoadFinish(): void {
		//初始化场景
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Color(0.5, 0.5, 0.5);

		//初始化相机
		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(this._translate);
		camera.transform.rotate(this._rotation2, true, false);
		camera.addComponent(CameraMoveScript);

		let directlightSprite = new Sprite3D();
		let dircom = directlightSprite.addComponent(DirectionLightCom);
		this.scene.addChild(directlightSprite);


		//设置平行光的方向
		var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
		mat.setForward(this._forward);
		directlightSprite.transform.worldMatrix = mat;

		//初始化角色精灵
		this.role = (<Sprite3D>this.scene.addChild(new Sprite3D()));

		//初始化胖子
		this.pangzi = (<Sprite3D>this.role.addChild(Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh")));
		//获取动画组件
		this.animator = (<Animator>this.pangzi.getChildAt(0).getComponent(Animator));

		//创建动作状态
		var state1: AnimatorState = new AnimatorState();
		//动作名称
		state1.name = "hello";
		//动作播放起始时间
		state1.clipStart = 296 / 581;
		//动作播放结束时间
		state1.clipEnd = 346 / 581;
		//设置动作
		state1.clip = this.animator.getDefaultState().clip;
		//设置动作循环
		state1.clip.islooping = true;
		//为动画组件添加一个动作状态
		this.animator.getControllerLayer(0).addState(state1);
		//播放动作
		this.animator.play("hello");

		var state2: AnimatorState = new AnimatorState();
		state2.name = "ride";
		state2.clipStart = 3 / 581;
		state2.clipEnd = 33 / 581;
		state2.clip = this.animator.getDefaultState().clip;
		state2.clip.islooping = true;
		this.animator.getControllerLayer(0).addState(state2);

		this.dragon1 = Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Bary/Bary.lh");
		this.dragon1.transform.localScale = this._dragonScale;
		this.aniSprte3D1 = (<Sprite3D>this.dragon1.getChildAt(0));

		this.dragon2 = Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/Assets/XunLongShi/Carn/Carn.lh");
		this.dragon2.transform.localScale = this._dragonScale;
		this.aniSprte3D2 = (<Sprite3D>this.dragon2.getChildAt(0));

		this.loadUI();
	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "乘骑坐骑")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);

		}));
	}

	stypeFun0(label: string = "乘骑坐骑"): void {

		this.curStateIndex++;
		if (this.curStateIndex % 3 == 1) {
			this.changeActionButton.label = "切换坐骑";

			this.dragon1.removeSelf();
			this.dragon2.removeSelf();

			let linkNode = this.getAvatarNodeByNames(this.pangzi, "AvatarNode");
			linkNode && linkNode.addChild(this.dragon1);
			this.dragon1.transform.localPosition = new Vector3(-0.5, 0, 0);
			this.dragon1.transform.localRotationEuler = new Vector3(0, -180, 100);
			this.animator.play("ride");
		}
		else if (this.curStateIndex % 3 == 2) {
			this.changeActionButton.label = "卸下坐骑";

			this.dragon1.removeSelf();
			this.dragon2.removeSelf();

			let linkNode = this.getAvatarNodeByNames(this.pangzi, "AvatarNode");
			linkNode && linkNode.addChild(this.dragon2);
			this.dragon2.transform.localPosition = new Vector3(-0.7, 0, 0);
			this.dragon2.transform.localRotationEuler = new Vector3(0, 180, 95);
			this.animator.play("ride");
		}
		else {
			this.changeActionButton.label = "乘骑坐骑";
			this.dragon1.removeSelf();
			this.dragon2.removeSelf();
			this.scene.addChild(this.role);
			this.animator.play("hello");
		}

		label = this.changeActionButton.label
		Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
	}

	getAvatarNodeByNames(target: Sprite3D, name: string): Sprite3D {
		for (let i: number = 0; i < target.numChildren; i++) {
			let child: Sprite3D = target.getChildAt(i) as Sprite3D;
			if (child.name == name) {
				return child;
			}
			let res = this.getAvatarNodeByNames(child, name);
			if (res) {
				return res;
			}
		}
	}
}

