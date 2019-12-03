
import { Laya } from "Laya";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { TextureCube } from "laya/d3/resource/TextureCube";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Vector4 } from "laya/d3/math/Vector4";
import { PBRRenderMode } from "laya/d3/core/material/PBRMaterial";
import { PBRSpecularMaterial } from "laya/d3/core/material/PBRSpecularMaterial";

export class PBR_TEST {
	reflectCubeMap: TextureCube;
	constructor() {
		Shader3D.debugMode = true;
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		Scene3D.load("LayaScene_SampleScene/Conventional/SampleScene.ls", Handler.create(this, function (scene: Scene3D): void {
			scene.getChildByName("Main Camera").addComponent(CameraMoveScript);
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var sphere: MeshSprite3D = <MeshSprite3D>scene.getChildAt(1);
			// var pbrMat: PBRStandardMaterial = new PBRStandardMaterial();
			var pbrMat: PBRSpecularMaterial = new PBRSpecularMaterial();
			// pbrMat.metallic = 0.1;
			pbrMat.smoothness = 1.0;
			Texture2D.load("Barrel_AlbedoTransparency.png", Handler.create(null, function (tex: Texture2D): void {
				pbrMat.albedoColor = new Vector4(1.0, 1.0, 1.0, 0 / 255);
				// pbrMat.albedoTexture = tex;
				pbrMat.renderMode=PBRRenderMode.Transparent;
			}));
			// Texture2D.load("Barrel_MetallicSmoothness.png", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.metallicGlossTexture = tex;
			// }));
			// Texture2D.load("Barrel_Occlusion.png", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.occlusionTexture = tex;
			// }));
			// Texture2D.load("Barrel_Normal.png", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.normalTexture = tex;
			// 	pbrMat.normalTextureScale = 0.5;
			// }));

			// Texture2D.load("Barrel_AlbedoTransparency.png", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.parallaxTexture= tex;
			// 	pbrMat.parallaxTextureScale=0.08;
			// }));
			// Texture2D.load("Barrel_AlbedoTransparency.png", Handler.create(null, function (tex: Texture2D): void {
			// 	pbrMat.enableEmission= true;
			// 	pbrMat.emissionTexture=tex;
			// 	pbrMat.emissionColor=new Vector4(128/255,128/255,128/255,1.0);
			// }));
			sphere.meshRenderer.sharedMaterial = pbrMat;
		}));
	}
}

