import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CustomAnimatorStateScript } from "../common/CustomAnimatorStateScript";

/**
 * ...
 * @author ...
 */
export class AnimatorDemo {

	/**实例类型*/
	private btype:any = "AnimatorDemo";
	/**场景内按钮类型*/
	private stype:any = 0;
	private _scene: Scene3D;
	private _animator: Animator;
	private _changeActionButton: Button;
	private _changeActionButton2: Button;
	private _PlayStopIndex: number = 0;
	private _curStateIndex: number = 0;
	private _text: Text = new Text();
	private _textName: Text = new Text();
	private _curActionName: string = null;

	private _translate: Vector3 = new Vector3(0, 3, 5);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {

		//适配模式
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		//开启统计信息
		Stat.show();

		//预加载所有资源
		var resource: any[] = ["res/threeDimen/skinModel/BoneLinkScene/R_kl_H_001.lh", "res/threeDimen/skinModel/BoneLinkScene/R_kl_S_009.lh", "res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];

		Laya.loader.load(resource, Handler.create(this, this.onLoadFinish));
		});
	}

	private onLoadFinish(): void {
		//初始化场景
		this._scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this._scene.ambientColor = new Color(0.5, 0.5, 0.5);

		//初始化相机
		var camera: Camera = (<Camera>this._scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(this._translate);
		camera.transform.rotate(this._rotation, true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = (<DirectionLight>this._scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(this._forward);
		directionLight.transform.worldMatrix = mat;


		//初始化角色精灵
		var role: Sprite3D = (<Sprite3D>this._scene.addChild(new Sprite3D()));
		//初始化胖子
		var pangzi: Sprite3D = (<Sprite3D>role.addChild(Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh")));
		//获取动画组件
		this._animator = (<Animator>pangzi.getChildAt(0).getComponent(Animator));
		//创建动作状态
		var state1: AnimatorState = new AnimatorState();
		//动作名称
		state1.name = "hello";
		//动作播放起始时间
		state1.clipStart = 296 / 581;
		//动作播放结束时间
		state1.clipEnd = 346 / 581;
		//设置动作
		state1.clip = this._animator.getDefaultState().clip;
		//循环模式
		state1.clip.islooping = true;
		//为动画状态添加动画状态脚本
		state1.addScript(CustomAnimatorStateScript);
		//为动画组件添加一个动作状态
		this._animator.getControllerLayer(0).addState(state1);

		var state2: AnimatorState = new AnimatorState();
		state2.name = "ride";
		state2.clipStart = 0 / 581;
		state2.clipEnd = 33 / 581;
		state2.clip = this._animator.getDefaultState().clip;
		state2.clip.islooping = true;
		state2.addScript(CustomAnimatorStateScript);
		this._animator.getControllerLayer(0).addState(state2);
		this._animator.speed = 0.0;

		var state3: AnimatorState = new AnimatorState();
		state3.name = "动作状态三";
		state3.clipStart = 34 / 581;
		state3.clipEnd = 100 / 581;
		state3.clip = this._animator.getDefaultState().clip;
		state3.clip.islooping = true;
		state3.addScript(CustomAnimatorStateScript);
		this._animator.getControllerLayer(0).addState(state3);
		this._animator.speed = 0.0;

		var state4: AnimatorState = new AnimatorState();
		state4.name = "动作状态四";
		state4.clipStart = 101 / 581;
		state4.clipEnd = 200 / 581;
		state4.clip = this._animator.getDefaultState().clip;
		state4.clip.islooping = true;
		state4.addScript(CustomAnimatorStateScript);
		this._animator.getControllerLayer(0).addState(state4);
		this._animator.speed = 0.0;

		var state5: AnimatorState = new AnimatorState();
		state5.name = "动作状态五";
		state5.clipStart = 201 / 581;
		state5.clipEnd = 295 / 581;
		state5.clip = this._animator.getDefaultState().clip;
		state5.clip.islooping = true;
		state5.addScript(CustomAnimatorStateScript);
		this._animator.getControllerLayer(0).addState(state5);
		this._animator.speed = 0.0;

		var state6: AnimatorState = new AnimatorState();
		state6.name = "动作状态六";
		state6.clipStart = 345 / 581;
		state6.clipEnd = 581 / 581;
		state6.clip = this._animator.getDefaultState().clip;
		state6.clip.islooping = true;
		state6.addScript(CustomAnimatorStateScript);
		this._animator.getControllerLayer(0).addState(state6);
		this._animator.speed = 0.0;

		this.loadUI();
		this._textName.x = Laya.stage.width / 2 - 50;
		this._textName.overflow = Text.HIDDEN;
		this._textName.color = "#FFFFFF";
		this._textName.font = "Impact";
		this._textName.fontSize = 20;
		this._textName.borderColor = "#FFFF00";
		this._textName.x = Laya.stage.width / 2;
		this._textName.text = "当前动作状态名称：";
		Laya.stage.addChild(this._textName);

		this._text.x = Laya.stage.width / 2 - 50;
		this._text.y = 50;
		this._text.overflow = Text.HIDDEN;
		this._text.color = "#FFFFFF";
		this._text.font = "Impact";
		this._text.fontSize = 20;
		this._text.borderColor = "#FFFF00";
		this._text.x = Laya.stage.width / 2;
		this._text.text = "当前动作状态进度：";
		Laya.stage.addChild(this._text);

		Laya.timer.frameLoop(1, this, this.onFrame);

	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this._changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "播放动画")));
			this._changeActionButton.size(160, 40);
			this._changeActionButton.labelBold = true;
			this._changeActionButton.labelSize = 30;
			this._changeActionButton.sizeGrid = "4,4,4,4";
			this._changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this._changeActionButton.pos(Laya.stage.width / 2 - this._changeActionButton.width * Browser.pixelRatio / 2 - 100, Laya.stage.height - 100 * Browser.pixelRatio);

			this._changeActionButton.on(Event.CLICK, this, this.stypeFun0);

			this._changeActionButton2 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作状态")));
			this._changeActionButton2.size(200, 40);
			this._changeActionButton2.labelBold = true;
			this._changeActionButton2.labelSize = 30;
			this._changeActionButton2.sizeGrid = "4,4,4,4";
			this._changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
			this._changeActionButton2.pos(Laya.stage.width / 2 - this._changeActionButton2.width * Browser.pixelRatio / 2 + 100, Laya.stage.height - 100 * Browser.pixelRatio);

			this._changeActionButton2.on(Event.CLICK, this, this.stypeFun1);

		}));
	}

	stypeFun0(label:string = "播放动画")
	{
		this._PlayStopIndex++;
		if (this._changeActionButton.label === "暂停动画") {
			this._changeActionButton.label = "播放动画";
			//暂停动画
			this._animator.speed = 0.0;
		} else if (this._changeActionButton.label === "播放动画") {
			this._changeActionButton.label = "暂停动画";
			this._animator.play(this._curActionName);
			//播放动画
			this._animator.speed = 1.0;
		}
		label = this._changeActionButton.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});
	}

	stypeFun1(curStateIndex:any =0)
	{
		this._curStateIndex++;
		if (this._curStateIndex % 6 == 0) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("hello");
			this._curActionName = "hello";
			this._textName.text = "当前动作状态名称:" + "hello";
			this._animator.speed = 1.0;
		} else if (this._curStateIndex % 6 == 1) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("ride");
			this._curActionName = "ride";
			this._textName.text = "当前动作状态名称:" + "ride";
			this._animator.speed = 1.0;
		} else if (this._curStateIndex % 6 == 2) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("动作状态三");
			this._curActionName = "动作状态三";
			this._textName.text = "当前动作状态名称:" + "动作状态三";
			this._animator.speed = 1.0;
		} else if (this._curStateIndex % 6 == 3) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("动作状态四");
			this._curActionName = "动作状态四";
			this._textName.text = "当前动作状态名称:" + "动作状态四";
			this._animator.speed = 1.0;
		} else if (this._curStateIndex % 6 == 4) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("动作状态五");
			this._curActionName = "动作状态五";
			this._textName.text = "当前动作状态名称:" + "动作状态五";
			this._animator.speed = 1.0;
		} else if (this._curStateIndex % 6 == 5) {
			this._changeActionButton.label = "暂停动画";
			this._animator.speed = 0.0;
			this._animator.play("动作状态六");
			this._curActionName = "动作状态六";
			this._textName.text = "当前动作状态名称:" + "动作状态六";
			this._animator.speed = 1.0;
		}
		curStateIndex = this._curStateIndex;
		Client.instance.send({type:"next",btype:this.btype,stype:1,value:curStateIndex});
	}




	private onFrame(): void {
		if (this._animator.speed > 0.0) {
			//获取播放状态的归一化时间
			var curNormalizedTime: number = this._animator.getCurrentAnimatorPlayState(0).normalizedTime;
			this._text.text = "当前动画状态进度：" + curNormalizedTime;
		}
	}

}



