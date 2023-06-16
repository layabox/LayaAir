import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";


//2019.0.17 8.00PM

//PC:
//机型:Surface Pro 6     CPU:I5-8250U 	  GPU:Intel UHD Graphics 620    平台:chrome:75.0.3770.90     分辨率:外接1080P显示器 Chrome全屏    帧率：43-45

//Mobile
//机型:Mi note 3   		 CPU:骁龙660      GPU:CPU集成                    平台：chrome 71.0.3578.99    分辨率:横屏                         帧率： 16-17
//机型:Mi Mix3       	 CPU:骁龙845 	  GPU:CPU集成                    平台:chrome:72.0.3626.105    分辨率:横屏                         帧率：16-19 
//机型:Mi 9        		 CPU:骁龙855 	  GPU:CPU集成                    平台:chrome:75.0.3770.89     分辨率:横屏                         帧率：52-55          

export class DynamicBatchTest {
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			scene.ambientColor = new Color(1, 1, 1);

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
		});
	}

}

