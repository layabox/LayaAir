
import { Config3D } from "Config3D";
import { Laya } from "Laya";
import { PBRRenderQuality } from "laya/d3/core/material/PBRRenderQuality";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { TextureCube } from "laya/d3/resource/TextureCube";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class PBRMaterialShow {
	reflectCubeMap: TextureCube;
	constructor() {
		Shader3D.debugMode = true;
		var c: Config3D = new Config3D();
		c.pbrRenderQuality = PBRRenderQuality.High;
		Laya3D.init(0, 0, c);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("LayaScene_SampleScene/Conventional/SampleScene.ls", Handler.create(this, function (scene: Scene3D): void {
			scene.getChildByName("Main Camera").addComponent(CameraMoveScript);
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;
			//scene.reflectionIntensity=0.2;
			//scene._reflectionCubeHDRParams.x=23;
			//scene.ambientSphericalHarmonicsIntensity = 1.8;


			var sphere: MeshSprite3D = <MeshSprite3D>scene.getChildAt(1).getChildAt(0);
			var pbrMat: PBRStandardMaterial = new PBRStandardMaterial();

			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_albedo.jpg", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.albedoTexture = tex;
			}));

			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_metalRoughness.png", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.metallicGlossTexture = tex;
			}));

			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_AO.jpg", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.occlusionTexture = tex;
			}));

			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_normal.jpg", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.normalTexture = tex;
			}));

			// Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_albedo.jpg", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.parallaxTexture = tex;
			// 	pbrMat.parallaxTextureScale = 0.08;
			// }));

			Texture2D.load("LayaScene_SampleScene/Conventional/Assets/DamagedHelmet/Default_emissive.jpg", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.enableEmission = true;
				pbrMat.emissionTexture = tex;
			}));
			sphere.meshRenderer.sharedMaterial = pbrMat;

			
			var sphereMesh: Mesh = PrimitiveMesh.createSphere(0.25, 32, 32);
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, 1.5, 0), scene, 6, new Vector4(186 / 255, 110 / 255, 64 / 255, 1.0), 1.0);
			this.addSpheres(sphereMesh, new Vector3(0, 0, 0), scene, 3, 6, new Vector4(1.0, 1.0, 1.0, 1.0));
			this.addSpheresSpecialMetallic(sphereMesh, new Vector3(0, -1.5, 0), scene, 6, new Vector4(0.0, 0.0, 0.0, 1.0), 0.0);
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
}



