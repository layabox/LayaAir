import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";

export class DynamicBatchTest {
	constructor() {
		Shader3D.debugMode = true;
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		scene.ambientColor = new Vector3(1, 1, 1);

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		camera.transform.translate(new Vector3(0, 6.2, 10.5));
		camera.transform.rotate(new Vector3(-40, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, function (tex: Texture2D): void {
			var radius: Vector3 = new Vector3(0, 0, 1);
			var radMatrix: Matrix4x4 = new Matrix4x4();
			var circleCount: number = 50;

			var boxMesh: Mesh = PrimitiveMesh.createBox(0.02, 0.02, 0.02);
			var boxMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			boxMat.albedoTexture = tex;
			for (var i: number = 0; i < circleCount; i++) {
				radius.z = 1.0 + i * 0.15;
				radius.y = i * 0.03;
				var oneCircleCount: number = 100 + i * 15;
				for (var j: number = 0; j < oneCircleCount; j++) {
					var boxSprite: MeshSprite3D = new MeshSprite3D(boxMesh);
					boxSprite.meshRenderer.sharedMaterial = boxMat;
					var localPos: Vector3 = boxSprite.transform.localPosition;
					var rad: number = ((Math.PI * 2) / oneCircleCount) * j;
					Matrix4x4.createRotationY(rad, radMatrix);
					Vector3.transformCoordinate(radius, radMatrix, localPos);
					boxSprite.transform.localPosition = localPos;
					scene.addChild(boxSprite);
				}
			}
		}));
	}

}

