import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Tool } from "../common/Tool";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";


/**
 * ...
 * @author
 */
export class CustomMesh {

	private sprite3D: Sprite3D;
	private lineSprite3D: Sprite3D;

	/**实例类型*/
	private btype: any = "CustomMesh";
	/**场景内按钮类型*/
	private stype: any = 0;
	private changeActionButton: Button;

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 2, 5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

			let directionLight = new Sprite3D();
			let dircom = directionLight.addComponent(DirectionLightCom);
			scene.addChild(directionLight);

			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix = mat;

			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
			this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

			//正方体
			var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
			box.transform.position = new Vector3(2.0, 0.25, 0.6);
			box.transform.rotate(new Vector3(0, 45, 0), false, false);
			//为正方体添加像素线渲染精灵
			var boxLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(100)));
			//设置像素线渲染精灵线模式
			Tool.linearModel(box, boxLineSprite3D, Color.GREEN);


			//球体
			var sphere: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.25, 20, 20))));
			sphere.transform.position = new Vector3(1.0, 0.25, 0.6);
			var sphereLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(3500)));
			Tool.linearModel(sphere, sphereLineSprite3D, Color.GREEN);



			//圆柱体
			var cylinder: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20))));
			cylinder.transform.position = new Vector3(0, 0.5, 0.6);
			var cylinderLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000)));
			Tool.linearModel(cylinder, cylinderLineSprite3D, Color.GREEN);

			//胶囊体
			var capsule: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1, 10, 20))));
			capsule.transform.position = new Vector3(-1.0, 0.5, 0.6);
			var capsuleLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(3000)));
			Tool.linearModel(capsule, capsuleLineSprite3D, Color.GREEN);

			//圆锥体
			var cone: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))));
			cone.transform.position = new Vector3(-2.0, 0.375, 0.6);
			var coneLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(500)));
			Tool.linearModel(cone, coneLineSprite3D, Color.GREEN);

			//平面
			var plane: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))));
			var planeLineSprite3D: PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000)));
			Tool.linearModel(plane, planeLineSprite3D, Color.GRAY);


			this.lineSprite3D.active = false;
			this.loadUI();
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

	stypeFun0(label: string = "正常模式"): void {
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
		Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
	}
}

