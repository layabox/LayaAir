import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class Sprite3DParent {
	private sprite3D: Sprite3D;
	private scene: Scene3D;

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		//创建场景
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		//创建相机
		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.75, 1));
		camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		//添加光照
		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		directionLight.color = new Vector3(1, 1, 1);
		directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));

		//预加载所有资源
		var resource: any[] = ["res/threeDimen/skinModel/LayaMonkey2/LayaMonkey.lh", "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish(): void {
		//添加父级猴子
		var layaMonkeyParent: Sprite3D = (<Sprite3D>this.scene.addChild(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")));
		//加载第二只猴子，作为子猴子
		var layaMonkeySon: Sprite3D = (<Sprite3D>Loader.getRes("res/threeDimen/skinModel/LayaMonkey2/LayaMonkey.lh"));
		layaMonkeySon.transform.translate(new Vector3(2.5, 0, 0));
		//缩放
		var scale: Vector3 = new Vector3(0.5, 0.5, 0.5);
		layaMonkeySon.transform.localScale = scale;

		layaMonkeyParent.addChild(layaMonkeySon);

		this.addButton(100, 120, 160, 30, "移动父级猴子", 20, function (e: Event): void {
			layaMonkeyParent.transform.translate(new Vector3(-0.1, 0, 0));
		});
		this.addButton(100, 160, 160, 30, "放大父级猴子", 20, function (e: Event): void {
			var scale: Vector3 = new Vector3(0.2, 0.2, 0.2);
			layaMonkeyParent.transform.localScale = scale;
		});
		this.addButton(100, 200, 160, 30, "旋转父级猴子", 20, function (e: Event): void {
			layaMonkeyParent.transform.rotate(new Vector3(-15, 0, 0), true, false);
		});

		this.addButton(100, 250, 160, 30, "移动子级猴子", 20, function (e: Event): void {
			layaMonkeySon.transform.translate(new Vector3(-0.1, 0, 0));
		});
		this.addButton(100, 290, 160, 30, "放大子级猴子", 20, function (e: Event): void {
			var scale: Vector3 = new Vector3(1, 1, 1);
			layaMonkeySon.transform.localScale = scale;
		});
		this.addButton(100, 330, 160, 30, "旋转子级猴子", 20, function (e: Event): void {
			layaMonkeySon.transform.rotate(new Vector3(-15, 0, 0), true, false);
		});
	}

	private addButton(x: number, y: number, width: number, height: number, text: string, size: number, clickFun: Function): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			var changeActionButton: Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", text)));
			changeActionButton.size(width, height);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = size;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(x, y);
			changeActionButton.on(Event.CLICK, this, clickFun);
		}));
	}

}


