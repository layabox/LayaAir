import { Config } from "Config";

import { Script } from "laya/components/Script";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Box } from "laya/ui/Box";
import { Button } from "laya/ui/Button";
import { Dialog } from "laya/ui/Dialog";
import { Image } from "laya/ui/Image";
import { Label } from "laya/ui/Label";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { UIConfig } from "UIConfig";
import { Event } from "laya/events/Event";
import { Laya } from "Laya";
import { Vector3 } from "laya/maths/Vector3";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class Draw3DParticleby3DUI {

	private box: Box;
	private particle: Sprite3D;
	private scene3d: Scene3D;
	private _camera: Camera
	private x: number = 0;
	private y: number = 0;
	private pos2D: Vector3;
	private pos3D: Vector3 = new Vector3(0, 0, 0);

	constructor() {
		Config.isAlpha = true;
		UIConfig.closeDialogOnSide = false;
		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			Sprite3D.load("res/particles/particle/SampleScene.lh", Handler.create(this, this.loadParticle))
		});
	}

	private dialog: Dialog;
	private loadParticle(particle: Sprite3D) {

		//弹窗按钮
		var btn = new Button("res/ui/button.png", "弹窗");
		btn.pos(393, 100);
		btn.width = 154;
		btn.height = 67;
		btn.zOrder = 11;
		Laya.stage.addChild(btn);

		btn.on(Event.CLICK, this, function () {

			let bg = new Image("res/img_bg.png");
			Laya.stage.addChild(bg);
			bg.zOrder = 8;
			bg.alpha = 0;
			bg.width = Browser.width;
			bg.height = Browser.height;
			this.dialog = new Dialog();
			bg.addChild(this.dialog);
			let bg1 = new Image("res/img_bg.png") as Image;
			bg1.width = 600;
			bg1.height = 500;
			this.dialog.addChild(bg1);
			this.dialog.show();
			btn.mouseEnabled = false;
			bg.on(Event.CLICK, this, function () {
				this.dialog.close();
				btn.mouseEnabled = true;
				Laya.stage.removeChild(bg);
			})
		})

		//lable文字
		let lable = new Label("box组件");
		lable.pos(200, 300)
		Laya.stage.addChild(lable);
		lable.fontSize = 50;
		lable.font = "SimHei";
		lable.color = "#ffffff"
		lable.bgColor = "#000000"
		lable.zOrder = 10;

		//box和3D场景
		this.box = new Box();
		this.box.bgColor = "#e70e0a"
		this.box.pos(200, 200);
		this.box.addComponent(DragScript);
		Laya.stage.addChild(this.box);
		this.box.width = 100;
		this.box.height = 100;

		this.scene3d = this.box.addChild(new Scene3D()) as Scene3D;
		this._camera = new Camera();
		this.scene3d.addChild(this._camera);
		this._camera.transform.rotate(new Vector3(-45, 0, 0), false, false);
		this._camera.transform.translate(new Vector3(5, -10, 1));
		this._camera.clearFlag = CameraClearFlags.DepthOnly;
		//使用正交投影模式
		this._camera.orthographic = true;
		this._camera.orthographicVerticalSize = 10;
		let directionLight = new Sprite3D();
		let dircom = directionLight.addComponent(DirectionLightCom);
		this.scene3d.addChild(directionLight);
		this.scene3d.addChild(particle);
		this.particle = particle;
		this.particle.transform.rotationEuler = new Vector3(-30, 0, 0);

		//时刻更新位置信息
		Laya.timer.frameLoop(1, this, this.onUpdatePosition)

	}

	onUpdatePosition() {
		if ((this.x !== this.box.x || this.y !== this.box.y) && this._camera) {
			//2D屏幕位置 
			this.pos2D = new Vector3(this.box.x, this.box.y, 0);
			//转换2D屏幕坐标系统到3D正交投影下的坐标系统
			this._camera.convertScreenCoordToOrthographicCoord(this.pos2D, this.pos3D);
			this.particle.transform.position = this.pos3D;

			this.x = this.box.x;
			this.y = this.box.y;
		}
	}
}

class DragScript extends Script {


	constructor() { super(); }

	onEnable(): void {

	}

	onMouseDown(): void {
		(this.owner as Box).startDrag();
	}

	onDisable(): void {
	}
}