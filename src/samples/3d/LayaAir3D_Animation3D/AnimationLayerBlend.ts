import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";

export class AnimationLayerBlend {
	private _motionCross: boolean = false;
	private _blendType: number = 0;
	private _motionIndex: number = 0;
	private _motions: any[] = ["run", "run_2", "attack", "attack_1", "attack_2", "dead", "idle_2", "idle_3", "idle_4", "idle4", "reload", "replace", "replace_2", "stop"];

	private changeActionButton0:Button;
	private changeActionButton1:Button;
	private changeActionButton2:Button;
	private animator:Animator;

	/**实例类型*/
	private btype:any = "AnimationLayerBlend";
	/**场景内按钮类型*/
	private stype:any = 0;
	isMaster: any;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		//加载场景资源
		Scene3D.load("res/threeDimen/scene/LayaScene_Sniper/Sniper.ls", Handler.create(this, this.sceneLoaded));
	}

	private sceneLoaded(scene: Scene3D): void {
		Laya.stage.addChild(scene);
		//获取精灵的动画组件
		this.animator = scene.getChildAt(2).getComponent(Animator);
		this.loadUI();
	}

	private loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton0 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "动画过渡:否")));
			this.changeActionButton0.size(160, 30);
			this.changeActionButton0.labelBold = true;
			this.changeActionButton0.labelSize = 20;
			this.changeActionButton0.sizeGrid = "4,4,4,4";
			this.changeActionButton0.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton0.pos(100, 100);
			this.changeActionButton0.on(Event.CLICK, this, this.stypeFun0);

			this.changeActionButton1 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "混合模式:全身")));
			this.changeActionButton1.size(160, 30);
			this.changeActionButton1.labelBold = true;
			this.changeActionButton1.labelSize = 20;
			this.changeActionButton1.sizeGrid = "4,4,4,4";
			this.changeActionButton1.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton1.pos(100, 160);
			this.changeActionButton1.on(Event.CLICK, this, this.stypeFun1);

			this.changeActionButton2 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作:attack_2")));
			this.changeActionButton2.size(260, 40);
			this.changeActionButton2.labelBold = true;
			this.changeActionButton2.labelSize = 30;
			this.changeActionButton2.sizeGrid = "4,4,4,4";
			this.changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton2.pos(100, 220);
			this.changeActionButton2.on(Event.CLICK, this, this.stypeFun2);
		}));
	}

	stypeFun0(label:string = "动画过渡:否") {
		this._motionCross = !this._motionCross;
		if (this._motionCross)
			this.changeActionButton0.label = "动画过渡:是";
		else
		    this.changeActionButton0.label = "动画过渡:否";

		label = this.changeActionButton0.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});	
	}

	stypeFun1(label:string = "混合模式:全身") {
		this._blendType++;
		(this._blendType === 3) && (this._blendType = 0);
		switch (this._blendType) {
			case 0:
				this.changeActionButton1.label = "混合模式:全身";
				break;
			case 1:
				this.changeActionButton1.label = "混合模式:上身";
				break;
			case 2:
				this.changeActionButton1.label = "混合模式:下身";
				break;
		}

		label = this.changeActionButton1.label;
		Client.instance.send({type:"next",btype:this.btype,stype:1,value:label});	
	}

	stypeFun2(label:string = "切换动作:attack_2") {
		switch (this._blendType) {
			case 0:
				if (this._motionCross) {
					//在当前动画状态和目标动画状态之间进行融合过渡播放
					//第三个参数为layerIndex 层索引使用混合模式，混合了0层和1层的动画
					this.animator.crossFade(this._motions[this._motionIndex], 0.2, 0);
					this.animator.crossFade(this._motions[this._motionIndex], 0.2, 1);
				} else {
					//使用普通模式播放
					this.animator.play(this._motions[this._motionIndex], 0);
					this.animator.play(this._motions[this._motionIndex], 1);
				}
				break;
			case 1:
				if (this._motionCross)
					//在当前动画状态和目标动画状态之间进行融合过渡播放
					//第三个参数为layerIndex 层索引，没有使用混合模式，仅仅是使用0层的动画
					this.animator.crossFade(this._motions[this._motionIndex], 0.2, 0);
				else
				this.animator.play(this._motions[this._motionIndex], 0);
				break;
			case 2:
				if (this._motionCross)
					//在当前动画状态和目标动画状态之间进行融合过渡播放
					//第三个参数为layerIndex 层索引，没有使用混合模式，仅仅是使用1层的动画
					this.animator.crossFade(this._motions[this._motionIndex], 0.2, 1);
				else
				this.animator.play(this._motions[this._motionIndex], 1);
				break;
		}
		this.changeActionButton2.label = "切换动作:" + this._motions[this._motionIndex];
		this._motionIndex++;
		(this._motionIndex === this._motions.length) && (this._motionIndex = 0);

		label = this.changeActionButton2.label;
		Client.instance.send({type:"next",btype:this.btype,stype:2,value:label});	
	}
}

