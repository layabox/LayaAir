
import { Config3D } from "Config3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { PBRRenderQuality } from "laya/d3/core/material/PBRRenderQuality";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Script3D } from "laya/d3/component/Script3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";

/**
 * model rotation script.
 */
class RotationScript extends Script3D {
	rotSpeed: Vector3 = new Vector3(0, 0.005, 0);
	onUpdate(): void {
		(<Sprite3D>this.owner).transform.rotate(this.rotSpeed, false);
	}
}

export class PBRMaterialShow {
	constructor() {
		Shader3D.debugMode = true;
		var c: Config3D = new Config3D();
		c.pbrRenderQuality = PBRRenderQuality.High;
		Laya3D.init(0, 0, c);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("LayaScene_SampleScene/Conventional/SampleScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			var damagedHelmet: MeshSprite3D = <MeshSprite3D>scene.getChildAt(1).getChildAt(0);
			var cerberus: MeshSprite3D = <MeshSprite3D>scene.getChildAt(2);

			var moveScript: CameraMoveScript = camera.addComponent(CameraMoveScript);
			moveScript.speed = 0.005;

			//damagedHelmet
			damagedHelmet.addComponent(RotationScript);
			var damagedHelmetMat: PBRStandardMaterial = new PBRStandardMaterial();
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_albedo.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.albedoTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_metalRoughness.png", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.metallicGlossTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_AO.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.occlusionTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_normal.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.normalTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_emissive.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.enableEmission = true;
				damagedHelmetMat.emissionTexture = tex;
			}));
			damagedHelmet.meshRenderer.sharedMaterial = damagedHelmetMat;

			//cerberus
			cerberus.addComponent(RotationScript);
			var cerberusMat: PBRStandardMaterial = new PBRStandardMaterial();
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/Cerberus_by_Andrew_Maximov/Textures/Cerberus_A.png", Handler.create(null, function (tex: Texture2D): void {
				cerberusMat.albedoTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/Cerberus_by_Andrew_Maximov/Textures/Cerberus_MS.png", Handler.create(null, function (tex: Texture2D): void {
				cerberusMat.metallicGlossTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/Cerberus_by_Andrew_Maximov/Textures/Cerberus_AO.png", Handler.create(null, function (tex: Texture2D): void {
				cerberusMat.occlusionTexture = tex;
			}));
			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/Cerberus_by_Andrew_Maximov/Textures/Cerberus_N.png", Handler.create(null, function (tex: Texture2D): void {
				cerberusMat.normalTexture = tex;
			}));
			cerberus.meshRenderer.sharedMaterial = cerberusMat;

			var sphereMesh: Mesh = PrimitiveMesh.createSphere(0.25, 32, 32);
			const row: number = 6;
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, 1.5, 0), scene, row, new Vector4(186 / 255, 110 / 255, 64 / 255, 1.0), 1.0);
			this.addSpheres(sphereMesh, new Vector3(0, 0, 0), scene, 3, row, new Vector4(1.0, 1.0, 1.0, 1.0));
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, -1.5, 0), scene, row, new Vector4(0.0, 0.0, 0.0, 1.0), 0.0);

			var size: number = 20;
			this.addText(size, Laya.stage.height - size * 4, "Battle Damaged Sci-fi Helmet by theblueturtle_    www.leonardocarrion.com");
			this.addText(size, Laya.stage.height - size * 2, "Cerberus by Andrew Maximov     http://artisaverb.info/PBT.html");
		}));
	}

	/**
	 * Add some different smoothness and metallic sphere.
	 */
	addSpheres(sphereMesh: Mesh, offset: Vector3, scene: Scene3D, row: number, col: number, color: Vector4): void {
		const width: number = col * 0.5;
		const height: number = row * 0.5;

		for (var i: number = 0, n: number = col; i < n; i++) {//diffenent smoothness
			for (var j: number = 0, m: number = row; j < m; j++) {//diffenent metallic

				var mat: PBRStandardMaterial = new PBRStandardMaterial();
				mat.albedoColor = color;
				mat.smoothness = i / (n - 1);
				mat.metallic = 1.0 - j / (m - 1);

				var meshSprite: MeshSprite3D = new MeshSprite3D(sphereMesh);
				meshSprite.meshRenderer.sharedMaterial = mat;
				var transform: Transform3D = meshSprite.transform;
				var pos: Vector3 = transform.localPosition;
				pos.setValue(-width / 2 + i * width / (n - 1), height / 2 - j * height / (m - 1), 3.0);
				Vector3.add(offset, pos, pos);
				transform.localPosition = pos;
				scene.addChild(meshSprite);
			}
		}
	}

	/**
	 * Add some different smoothness with special metallic sphere.
	 */
	addSpheresSpecialMetallic(sphereMesh: Mesh, offset: Vector3, scene: Scene3D, col: number, color: Vector4, metallic: number = 0): void {
		const width: number = col * 0.5;
		for (var i: number = 0, n: number = col; i < n; i++) {//diffenent smoothness
			var mat: PBRStandardMaterial = new PBRStandardMaterial();
			mat.albedoColor = color;
			mat.smoothness = i / (n - 1);
			mat.metallic = metallic;

			var meshSprite: MeshSprite3D = new MeshSprite3D(sphereMesh);
			meshSprite.meshRenderer.sharedMaterial = mat;
			var transform: Transform3D = meshSprite.transform;
			var pos: Vector3 = transform.localPosition;
			pos.setValue(-width / 2 + i * width / (n - 1), 0, 3.0);
			Vector3.add(offset, pos, pos);
			transform.localPosition = pos;
			scene.addChild(meshSprite);
		}
	}

	/**
	 * add text.
	 */
	addText(size: number, y: number, text: string): void {
		var cerberusText: Text = new Text();
		cerberusText.color = "#FFFF00";
		cerberusText.fontSize = size;
		cerberusText.x = size;
		cerberusText.y = y;
		cerberusText.text = text;
		Laya.stage.addChild(cerberusText);
	}
}



