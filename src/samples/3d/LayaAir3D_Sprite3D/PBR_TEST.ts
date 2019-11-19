import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { PBRMaterial } from "laya/d3/core/material/PBRMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Scene } from "laya/display/Scene";

export class PBR_TEST {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("res/threeDimen/LayaScene_boneTest/Conventional/boneTest.ls", Handler.create(this, function (sprite: Scene3D): void {
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(sprite));
			PBRMaterial.__init__();
			scene.ambientColor = new Vector3(0, 0, 0);

			scene.getChildAt(2).active = false;

			var sphere:MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createSphere(1));
			scene.addChild(sphere);
			var PBR02:PBRMaterial = new PBRMaterial();
			PBR02.metallic = 0.5;
			PBR02.smoothness = 0.5;
			sphere.meshRenderer.sharedMaterial = PBR02;


			var sphere2:MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createSphere(1));
			sphere2.transform.position = new Vector3(0,0,0);
			scene.addChild(sphere2);
			var PBR:PBRStandardMaterial = new PBRStandardMaterial();
			PBR.metallic = 0.5;
			PBR.smoothness = 0.5;
			sphere2.meshRenderer.sharedMaterial = PBR;

			sphere.active = true;
			sphere2.active = false;
			// sphere.active = false;
			// sphere2.active = true;
		}));

		
	}
}

