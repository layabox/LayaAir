
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
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class CerberusModelShow {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		Scene3D.load("res/LayaScene_CerberusScene/Conventional/CerberusScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			var cerberus: MeshSprite3D = <MeshSprite3D>scene.getChildAt(1);

			var moveScript: CameraMoveScript = camera.addComponent(CameraMoveScript);
			moveScript.speed = 0.005;

			//cerberus
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

			var size: number = 20;
			this.addText(size, Laya.stage.height - size * 2, "Cerberus by Andrew Maximov     http://artisaverb.info/PBT.html");
		}));
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



