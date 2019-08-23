import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { LightSprite } from "laya/d3/core/light/LightSprite";
import { PointLight } from "laya/d3/core/light/PointLight";
import { SpotLight } from "laya/d3/core/light/SpotLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

class LightMoveScript extends Script3D {
	forward: Vector3 = new Vector3();
	lights: LightSprite[] = [];
	offsets: Vector3[] = [];
	moveRanges: Vector3[] = [];

	onUpdate(): void {
		var seed: number = Laya.timer.currTimer * 0.002;
		for (var i: number = 0, n: number = this.lights.length; i < n; i++) {
			var transform: Transform3D = this.lights[i].transform;
			var pos: Vector3 = transform.localPosition;
			var off: Vector3 = this.offsets[i];
			var ran: Vector3 = this.moveRanges[i];
			pos.x = off.x + Math.sin(seed) * ran.x;
			pos.y = off.y + Math.sin(seed) * ran.y;
			pos.z = off.z + Math.sin(seed) * ran.z;
			transform.localPosition = pos;
		}
	}
}

export class MultiLight {

	constructor() {
		Shader3D.debugMode = true;
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("res/threeDimen/scene/MultiLightScene/InventoryScene_Forest.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);

			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			camera.addComponent(CameraMoveScript);
			var moveScript: LightMoveScript = camera.addComponent(LightMoveScript);

			// var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
			// var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			// mat.setForward(new Vector3(0.0, -0.8, -1.0));
			// directionLight.color.setValue(0.5, 0.5, 0.4);

			var moverLights: LightSprite[] = moveScript.lights;
			var offsets: Vector3[] = moveScript.offsets;
			var moveRanges: Vector3[] = moveScript.moveRanges;
			moverLights.length = 50;
			for (var i: number = 0; i < 50; i++) {
				var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
				pointLight.range = 2.0 + Math.random() * 8.0;
				pointLight.color.setValue(Math.random(), Math.random(), Math.random());
				pointLight.intensity = 2.0 + Math.random() * 8;
				moverLights[i] = pointLight;
				offsets[i] = new Vector3((Math.random() - 0.5) * 20, pointLight.range * 0.75, 20.0 * Math.random() - 10);
				moveRanges[i] = new Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
			}


			var spotLight: SpotLight = (<SpotLight>scene.addChild(new SpotLight()));
			spotLight.transform.localPosition = new Vector3(0.0, 9.0, -35.0);
			spotLight.transform.localRotationEuler = new Vector3(-15.0, 180.0, 0.0);
			spotLight.color.setValue(Math.random(), Math.random(), Math.random());
			spotLight.range = 50;
			spotLight.intensity = 15;
			spotLight.spotAngle = 70;


			// for (var i: number = 0; i < 1; i++) {
			// 	var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
			// 	pointLight.range = 1.0 + 1.0 * 2.0;
			// 	pointLight.transform.localPosition = new Vector3((1.0 - 0.5) * 10, pointLight.range * 0.75, -13.0);
			// 	pointLight.color.setValue(1.0, 0, 0);
			// 	pointLight.intensity = 1.0 * 10 + 2.0;
			// }

			// var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
			// pointLight.transform.localPosition = new Vector3(-5.0, 0.2, -6.0);
			// pointLight.color.setValue(0.0, 1.0, -6.0);
			// pointLight.range = 6.0;
			// pointLight.intensity = 12.0;

			// var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
			// pointLight.transform.localPosition = new Vector3(-5.0, 0.2, -6.0);
			// pointLight.color.setValue(0.0, 1.0, -4.0);
			// pointLight.range = 6.9;

			// var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
			// pointLight.transform.localPosition = new Vector3(-5.3, 0.2, -6.0);
			// pointLight.color.setValue(1.0, 1.0, -2.0);
			// pointLight.range = 6.9;o

			// var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
			// pointLight.transform.localPosition = new Vector3(-5.3, 0.2, 0.0);
			// pointLight.color.setValue(2.0, 0.2, 1.0);
			// pointLight.range = 6.8;


		}));

	}
}

