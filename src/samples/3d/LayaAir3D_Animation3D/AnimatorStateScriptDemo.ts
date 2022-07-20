import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator";
import { AnimatorState } from "laya/d3/component/AnimatorState";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { AnimatorStateScriptTest } from "../common/AnimatorStateScriptTest";
import Client from "../../Client";
import { Utils } from "laya/utils/Utils";
import { Color } from "laya/d3/math/Color";

/**
 * ...
 * @author ...
 */
export class AnimatorStateScriptDemo {

	private scene: Scene3D;
	private animator: Animator;
	private changeActionButton: Button;
	private changeActionButton2: Button;
	private PlayStopIndex: number = 0;
	private curStateIndex: number = 0;
	private text: Text = new Text();
	private textName: Text = new Text();
	private curActionName: string = null;

	private _translate: Vector3 = new Vector3(0, 3, 5);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);

	private btype:any = "AnimatorStateScriptDemo";
	/**场景内按钮类型*/
	private stype:any = 0;

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		//适配模式
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		//开启统计信息
		Stat.show();

		//预加载所有资源
		var resource: any[] = ["res/threeDimen/skinModel/BoneLinkScene/R_kl_H_001.lh", "res/threeDimen/skinModel/BoneLinkScene/R_kl_S_009.lh", "res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];

		Laya.loader.create(resource, Handler.create(this, this.onLoadFinish));
	}

	private onLoadFinish(): void {
		//初始化场景
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Color(0.5, 0.5, 0.5);

		//初始化相机
		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(this._translate);
		camera.transform.rotate(this._rotation, true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(this._forward);
		directionLight.transform.worldMatrix = mat;

		//初始化角色精灵
		var role: Sprite3D = (<Sprite3D>this.scene.addChild(new Sprite3D()));
		//初始化胖子
		var pangzi: Sprite3D = (<Sprite3D>role.addChild(Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh")));
		//获取动画组件
		this.animator = (<Animator>pangzi.getChildAt(0).getComponent(Animator));
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
		//循环模式
		state1.clip.islooping = true;
		//为动画状态添加动画状态脚本
		var asst1 = state1.addScript(AnimatorStateScriptTest) as AnimatorStateScriptTest;
		asst1.text = this.text;
		this.animator.speed = 0.0;
		//为动画组件添加一个动作状态
		this.animator.getControllerLayer(0).addState(state1);

		var state2: AnimatorState = new AnimatorState();
		state2.name = "ride";
		state2.clipStart = 0 / 581;
		state2.clipEnd = 33 / 581;
		state2.clip = this.animator.getDefaultState().clip;
		state2.clip.islooping = true;
		var asst2 = state2.addScript(AnimatorStateScriptTest) as AnimatorStateScriptTest;
		asst2.text = this.text;
		this.animator.getControllerLayer(0).addState(state2);


		var state3: AnimatorState = new AnimatorState();
		state3.name = "动作状态三";
		state3.clipStart = 34 / 581;
		state3.clipEnd = 100 / 581;
		state3.clip = this.animator.getDefaultState().clip;
		state3.clip.islooping = true;
		this.animator.speed = 0.0;
		var asst3 = state3.addScript(AnimatorStateScriptTest) as AnimatorStateScriptTest;
		asst3.text = this.text;
		this.animator.getControllerLayer(0).addState(state3);


		this.loadUI();
		this.textName.x = Laya.stage.width / 2 - 50;
		this.text.x = Laya.stage.width / 2 - 50;
		this.text.y = 50;
		this.textName.overflow = Text.HIDDEN;
		this.textName.color = "#FFFFFF";
		this.textName.font = "Impact";
		this.textName.fontSize = 20;
		this.textName.borderColor = "#FFFF00";
		this.textName.x = Laya.stage.width / 2;
		this.textName.text = "当前动作状态名称：";
		Laya.stage.addChild(this.textName);

		this.text.name = "text";
		this.text.overflow = Text.HIDDEN;
		this.text.color = "#FFFFFF";
		this.text.font = "Impact";
		this.text.fontSize = 20;
		this.text.borderColor = "#FFFF00";
		this.text.x = Laya.stage.width / 2;
		this.text.text = "动画状态：";
		Laya.stage.addChild(this.text);

	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作状态")));
			this.changeActionButton.size(200, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);

			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}
	
	stypeFun0(curStateIndex:any = 0) {

		this.curStateIndex++;
		if (this.curStateIndex % 3 == 0) {
			this.animator.speed = 0.0;
			this.animator.play("hello");
			this.curActionName = "hello";
			this.textName.text = "当前动作状态名称:" + "hello";
			this.animator.speed = 1.0;
		} else if (this.curStateIndex % 3 == 1) {
			this.animator.speed = 0.0;
			this.animator.play("ride");
			this.curActionName = "ride";
			this.textName.text = "当前动作状态名称:" + "ride";
			this.animator.speed = 1.0;
		} else if (this.curStateIndex % 3 == 2) {
			this.animator.speed = 0.0;
			this.animator.play("动作状态三");
			this.curActionName = "动作状态三";
			this.textName.text = "当前动作状态名称:" + "动作状态三";
			this.animator.speed = 1.0;
		}
		curStateIndex = this.curStateIndex;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:curStateIndex});
	}
}



