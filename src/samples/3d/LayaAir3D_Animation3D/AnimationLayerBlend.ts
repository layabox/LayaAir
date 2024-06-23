import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Button } from "laya/ui/Button";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { Handler } from "laya/utils/Handler";
import { Browser } from "laya/utils/Browser";
import { Event } from "laya/events/Event";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Vector3 } from "laya/maths/Vector3";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class AnimationLayerBlend {
	private transitionSp3Path: string = "res/danding/danding.lh";
	private transitionSp3: Sprite3D;
	private isTransition: boolean = false;
	private animator: Animator;

	private scene: Scene3D;
	private btnTransition: Button;
	private btnRun: Button;
	private btnSkill: Button;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			Laya.loader.load([this.transitionSp3Path]).then(() => {
				this.initScene();
			});
		});
	}

	initScene(): void {
		this.scene = new Scene3D();
		Laya.stage.addChild(this.scene);
		let camera = new Camera(0, 0.1, 100);
		camera.addComponent(CameraMoveScript);
		camera.transform.position = new Vector3(-2.4, 1.3, 3.2);
		camera.transform.rotationEuler = new Vector3(-2.13, -6.0, 0.0);
		this.scene.addChild(camera);
		let dirLit = new Sprite3D();
		let dirLitCom = dirLit.addComponent(DirectionLightCom);
		this.scene.addChild(dirLit);

		this.transitionSp3 = ((Laya.loader.getRes(this.transitionSp3Path) as PrefabImpl).create() as Sprite3D);
		this.scene.addChild(this.transitionSp3);
		this.animator = this.transitionSp3.getComponent(Animator);
		this.loadUI();
	}

	loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, () => {
			this.btnTransition = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "动画融合: 关")));
			this.btnTransition.size(160, 40);
			this.btnTransition.labelBold = true;
			this.btnTransition.labelSize = 30;
			this.btnTransition.sizeGrid = "4,4,4,4";
			this.btnTransition.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.btnTransition.top = 150;
			this.btnTransition.left = 250;
			this.btnTransition.on(Event.CLICK, this, this.btnTransitionClick);

			this.btnRun = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "播放Run动作")));
			this.btnRun.size(200, 40);
			this.btnRun.labelBold = true;
			this.btnRun.labelSize = 30;
			this.btnRun.sizeGrid = "4,4,4,4";
			this.btnRun.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.btnRun.top = 250;
			this.btnRun.left = 250;
			this.btnRun.on(Event.CLICK, this, this.btnRunClick);

			this.btnSkill = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "播放Skill动作")));
			this.btnSkill.size(200, 40);
			this.btnSkill.labelBold = true;
			this.btnSkill.labelSize = 30;
			this.btnSkill.sizeGrid = "4,4,4,4";
			this.btnSkill.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.btnSkill.top = 350;
			this.btnSkill.left = 250;
			this.btnSkill.on(Event.CLICK, this, this.btnSkillClick);
		}));
	}

	btnTransitionClick(): void {
		if (this.isTransition) {
			this.btnTransition.label = "动画融合: 关";
		} else {
			this.btnTransition.label = "动画融合: 开";
		}
		this.isTransition = !this.isTransition;
	}

	btnRunClick(): void {
		if (this.isTransition) {
			this.animator.crossFade("Run", 0.5);
		} else {
			this.animator.play("Run");
		}
	}

	btnSkillClick(): void {
		if (this.isTransition) {
			this.animator.crossFade("Skill1", 0.5);
		} else {
			this.animator.play("Skill1");
		}
	}
}

