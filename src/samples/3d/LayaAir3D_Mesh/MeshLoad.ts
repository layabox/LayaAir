import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { Tool } from "../common/Tool";

/**
 * ...
 * @author
 */
export class MeshLoad {

	private sprite3D: Sprite3D;
	private lineSprite3D: Sprite3D;
	private rotation: Vector3 = new Vector3(0, 0.01, 0);

	/**实例类型*/
	private btype:any = "MeshLoad";
	/**场景内按钮类型*/
	private stype:any = 0;
	private changeActionButton:Button;

	constructor() {

		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();

			//创建场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//创建相机
			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 0.8, 1.5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

			//添加平行光
			var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
			directionLight.color = new Color(0.6, 0.6, 0.6, 1);

			//创建精灵
			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
			this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

			//加载mesh
			Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh: Mesh): void {
				var layaMonkey: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(mesh)));
				layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
				layaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);

				//创建像素线渲染精灵
				var layaMonkeyLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(5000)));
				//设置像素线渲染精灵线模式
				Tool.linearModel(layaMonkey, layaMonkeyLineSprite3D, Color.GREEN);

				var plane: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))));
				plane.transform.position = new Vector3(0, 0, -1);
				var planeLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000)));
				Tool.linearModel(plane, planeLineSprite3D, Color.GRAY);

				//设置时钟定时执行
				Laya.timer.frameLoop(1, this, function (): void {
					layaMonkeyLineSprite3D.transform.rotate(this.rotation, false);
					layaMonkey.transform.rotate(this.rotation, false);
				});

				this.lineSprite3D.active = false;
				this.loadUI();
			}));
		});
	}

	private curStateIndex: number = 0;

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正常模式"));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(label:string = "正常模式"): void {
		if (++this.curStateIndex % 2 == 1) {
			this.sprite3D.active = false;
			this.lineSprite3D.active = true;
			this.changeActionButton.label = "网格模式";
		} else {
			this.sprite3D.active = true;
			this.lineSprite3D.active = false;
			this.changeActionButton.label = "正常模式";
		}
		label = this.changeActionButton.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});	
	}
}

