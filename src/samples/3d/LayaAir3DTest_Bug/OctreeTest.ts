import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { InputManager } from "laya/events/InputManager";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Color } from "laya/d3/math/Color";

/**
 * ...
 * @author
 */
export class OctreeTest {
	private sprite3D: Sprite3D;

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		camera.transform.translate(new Vector3(0, 2, 5));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
		camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(1.0, -1.0, -1.0));
		directionLight.transform.worldMatrix = mat;

		this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

		//正方体
		var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
		box.transform.position = new Vector3(2.0, 0.25, 0.6);
		box.transform.rotate(new Vector3(0, 45, 0), false, false);

		//球体
		var sphere: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.25, 20, 20))));
		sphere.transform.position = new Vector3(1.0, 0.25, 0.6);

		//圆柱体
		var cylinder: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20))));
		cylinder.transform.position = new Vector3(0, 0.5, 0.6);

		//胶囊体
		var capsule: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1, 10, 20))));
		capsule.transform.position = new Vector3(-1.0, 0.5, 0.6);

		//圆锥体
		var cone: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))));
		cone.transform.position = new Vector3(-2.0, 0.375, 0.6);
		//
		//圆锥体
		var cone: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))));
		cone.transform.position = new Vector3(-3.0, 0.375, 0.6);

		//圆锥体
		var cone: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))));
		cone.transform.position = new Vector3(-4.0, 0.375, 0.6);

		//圆锥体
		var cone: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))));
		cone.transform.position = new Vector3(-5.0, 0.375, 0.6);
		this.character = cone;

		//平面
		var plane: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))));
		this.loadUI();

		Laya.timer.frameLoop(1, this, this.onKeyDown);
	}

	private character: MeshSprite3D;

	private onKeyDown(): void {
		InputManager.hasKeyDown(38) && this.character.transform.translate(new Vector3(0, 0, -0.2));//上
		InputManager.hasKeyDown(40) && this.character.transform.translate(new Vector3(0, 0, 0.2));//左
		InputManager.hasKeyDown(37) && this.character.transform.translate(new Vector3(-0.2, 0, 0));//下
		InputManager.hasKeyDown(39) && this.character.transform.translate(new Vector3(0.2, 0, 0));//右
	}

	private curStateIndex: number = 0;

	private loadUI(): void {

		Laya.loader.load(["../../../../res/threeDimen/ui/button.png"], Handler.create(null, function (): void {
			var changeActionButton: Button = (<Button>Laya.stage.addChild(new Button("../../../../res/threeDimen/ui/button.png", "正常模式")));
			changeActionButton.size(160, 40);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = 30;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			changeActionButton.on(Event.CLICK, this, function (): void {
			});
		}));
	}
}

