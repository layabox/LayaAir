import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class Sprite3DParent {
	private scene: Scene3D;

	private layaMonkeyParent:Sprite3D;
	private layaMonkeySon:Sprite3D;

	private btype:"Sprite3DParent";
	private stype:any = 0;

	private changeActionButton:Button;
	private changeActionButton1:Button;
	private changeActionButton2:Button;
	private changeActionButton3:Button;
	private changeActionButton4:Button;
	private changeActionButton5:Button;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
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
			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			this.scene.addChild(directlightSprite);
			dircom.color = new Color(1, 1, 1, 1);
			directlightSprite.transform.rotate(new Vector3(-3.14 / 3, 0, 0));

			//预加载所有资源
			var resource: any[] = ["res/threeDimen/skinModel/LayaMonkey2/LayaMonkey.lh", "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"];
			Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
		});
	}

	onPreLoadFinish(): void {
		//添加父级猴子
		this.layaMonkeyParent = this.scene.addChild(Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")) as Sprite3D;
		//加载第二只猴子，作为子猴子
		this.layaMonkeySon = this.layaMonkeyParent.clone() as Sprite3D;
		this.layaMonkeySon.transform.translate(new Vector3(0.5, 0, 0));
		//缩放
		var scale: Vector3 = new Vector3(0.5, 0.5, 0.5);
		this.layaMonkeySon.transform.localScale = scale;

		this.layaMonkeyParent.addChild(this.layaMonkeySon);

		this.loadUI();
	}

	private loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, ()=> {
			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "移动父级猴子"));
			this.changeActionButton.size(160, 30);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 20;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(100, 120);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);

			this.changeActionButton1 = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "放大父级猴子"));
			this.changeActionButton1.size(160, 30);
			this.changeActionButton1.labelBold = true;
			this.changeActionButton1.labelSize = 20;
			this.changeActionButton1.sizeGrid = "4,4,4,4";
			this.changeActionButton1.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton1.pos(100, 160);
			this.changeActionButton1.on(Event.CLICK, this, this.stypeFun1);

			this.changeActionButton2 = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "旋转父级猴子"));
			this.changeActionButton2.size(160, 30);
			this.changeActionButton2.labelBold = true;
			this.changeActionButton2.labelSize = 20;
			this.changeActionButton2.sizeGrid = "4,4,4,4";
			this.changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton2.pos(100, 200);
			this.changeActionButton2.on(Event.CLICK, this, this.stypeFun2);

			this.changeActionButton3 = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "移动子级猴子"));
			this.changeActionButton3.size(160, 30);
			this.changeActionButton3.labelBold = true;
			this.changeActionButton3.labelSize = 20;
			this.changeActionButton3.sizeGrid = "4,4,4,4";
			this.changeActionButton3.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton3.pos(100, 250);
			this.changeActionButton3.on(Event.CLICK, this, this.stypeFun3);

			this.changeActionButton4 = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "放大子级猴子"));
			this.changeActionButton4.size(160, 30);
			this.changeActionButton4.labelBold = true;
			this.changeActionButton4.labelSize = 20;
			this.changeActionButton4.sizeGrid = "4,4,4,4";
			this.changeActionButton4.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton4.pos(100, 290);
			this.changeActionButton4.on(Event.CLICK, this, this.stypeFun4);

			this.changeActionButton5 = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "旋转子级猴子"));
			this.changeActionButton5.size(160, 30);
			this.changeActionButton5.labelBold = true;
			this.changeActionButton5.labelSize = 20;
			this.changeActionButton5.sizeGrid = "4,4,4,4";
			this.changeActionButton5.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton5.pos(100, 330);
			this.changeActionButton5.on(Event.CLICK, this, this.stypeFun5);
		}));
	}

	
	private stypeFun0() {
		this.layaMonkeyParent.transform.translate(new Vector3(-0.1, 0, 0));
		Client.instance.send({type:"next",btype:this.btype,stype:0});
	}

	private stypeFun1() {
		var scale: Vector3 = new Vector3(2, 2, 2);
		this.layaMonkeyParent.transform.localScale = scale;
		Client.instance.send({type:"next",btype:this.btype,stype:1});
	}

	private stypeFun2() {
		this.layaMonkeyParent.transform.rotate(new Vector3(-15, 0, 0), true, false);
		Client.instance.send({type:"next",btype:this.btype,stype:2});
	}

	private stypeFun3() {
		this.layaMonkeySon.transform.translate(new Vector3(-0.1, 0, 0));
		Client.instance.send({type:"next",btype:this.btype,stype:3});
	}

	private stypeFun4() {
		var scale: Vector3 = new Vector3(1, 1, 1);
		this.layaMonkeySon.transform.localScale = scale;
		Client.instance.send({type:"next",btype:this.btype,stype:4});
	}

	private stypeFun5() {
		this.layaMonkeySon.transform.rotate(new Vector3(-15, 0, 0), true, false);
		Client.instance.send({type:"next",btype:this.btype,stype:5});
	}
}


