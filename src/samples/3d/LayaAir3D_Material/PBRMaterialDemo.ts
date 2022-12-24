
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class PBRMaterialDemo {
	private static _tempPos: Vector3 = new Vector3();

	constructor() {
		Shader3D.debugMode = true;
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		Scene3D.load("res/threeDimen/scene/LayaScene_EmptyScene/Conventional/EmptyScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			
			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			var moveScript: CameraMoveScript = camera.addComponent(CameraMoveScript);
			moveScript.speed = 0.005;

			var sphereMesh: Mesh = PrimitiveMesh.createSphere(0.25, 32, 32);
			const row: number = 6;
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, 1.5, 0), scene, row, new Color(186 / 255, 110 / 255, 64 / 255, 1.0), 1.0);
			this.addSpheresSmoothnessMetallic(sphereMesh, new Vector3(0, 0, 0), scene, 3, row, new Color(1.0, 1.0, 1.0, 1.0));
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, -1.5, 0), scene, row, new Color(0.0, 0.0, 0.0, 1.0), 0.0);
		}));
	}

	/**
	 * Add one with smoothness and metallic sphere.
	 */
	addPBRSphere(sphereMesh: Mesh, position: Vector3, scene: Scene3D, color: Color, smoothness: number, metallic: number): PBRStandardMaterial {
		var mat: PBRStandardMaterial = new PBRStandardMaterial();
		mat.albedoColor = color;
		mat.smoothness = smoothness;
		mat.metallic = metallic;

		var meshSprite: MeshSprite3D = new MeshSprite3D(sphereMesh);
		meshSprite.meshRenderer.sharedMaterial = mat;
		var transform: Transform3D = meshSprite.transform;
		transform.localPosition = position;
		scene.addChild(meshSprite);
		return mat;
	}


	/**
	 * Add some different smoothness and metallic sphere.
	 */
	addSpheresSmoothnessMetallic(sphereMesh: Mesh, offset: Vector3, scene: Scene3D, row: number, col: number, color: Color): void {
		const width: number = col * 0.5;
		const height: number = row * 0.5;
		for (var i: number = 0, n: number = col; i < n; i++) {//diffenent smoothness
			for (var j: number = 0, m: number = row; j < m; j++) {//diffenent metallic
				var smoothness: number = i / (n - 1);
				var metallic: number = 1.0 - j / (m - 1);

				var pos: Vector3 = PBRMaterialDemo._tempPos;
				pos.setValue(-width / 2 + i * width / (n - 1), height / 2 - j * height / (m - 1), 3.0);
				Vector3.add(offset, pos, pos);

				this.addPBRSphere(sphereMesh, pos, scene, color, smoothness, metallic);
			}
		}
	}

	/**
	 * Add some different smoothness with special metallic sphere.
	 */
	addSpheresSpecialMetallic(sphereMesh: Mesh, offset: Vector3, scene: Scene3D, col: number, color: Color, metallic: number = 0): void {
		const width: number = col * 0.5;
		for (var i: number = 0, n: number = col; i < n; i++) {//diffenent smoothness
			var smoothness: number = i / (n - 1);
			// var metallic: number = metallic;

			var pos: Vector3 = PBRMaterialDemo._tempPos;
			pos.setValue(-width / 2 + i * width / (n - 1), 0, 3.0);
			Vector3.add(offset, pos, pos);

			this.addPBRSphere(sphereMesh, pos, scene, color, smoothness, metallic);
		}
	}
}



