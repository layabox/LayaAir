
import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { AmbientMode, Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * model rotation script.
 */
class RotationScript extends Script3D {
	rotSpeed: Vector3 = new Vector3(0, 0.005, 0);
	onUpdate(): void {
		(<Sprite3D>this.owner).transform.rotate(this.rotSpeed, false);
	}
}

export class DamagedHelmetModelShow {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		Scene3D.load("res/LayaScene_DamagedHelmetScene/Conventional/DamagedHelmetScene.ls", Handler.create(this, function (scene: Scene3D): void {
			Laya.stage.addChild(scene);
			scene.ambientMode = AmbientMode.SphericalHarmonics;

			var camera: Camera = <Camera>scene.getChildByName("Main Camera");
			var damagedHelmet: MeshSprite3D = <MeshSprite3D>scene.getChildAt(1).getChildAt(0);

			var moveScript: CameraMoveScript = camera.addComponent(CameraMoveScript);
			moveScript.speed = 0.005;

			damagedHelmet.addComponent(RotationScript);
			var damagedHelmetMat: PBRStandardMaterial = new PBRStandardMaterial();
			Texture2D.load("res/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmet/Default_albedo.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.albedoTexture = tex;
			}));
			Texture2D.load("res/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmet/Default_metalRoughness.png", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.metallicGlossTexture = tex;
			}));
			Texture2D.load("res/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmet/Default_AO.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.occlusionTexture = tex;
			}));
			Texture2D.load("res/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmet/Default_normal.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.normalTexture = tex;
			}));
			Texture2D.load("res/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmet/Default_emissive.jpg", Handler.create(null, function (tex: Texture2D): void {
				damagedHelmetMat.enableEmission = true;
				damagedHelmetMat.emissionTexture = tex;
			}));
			damagedHelmet.meshRenderer.sharedMaterial = damagedHelmetMat;

			var size: number = 20;
			this.addText(size, Laya.stage.height - size * 2, "Battle Damaged Sci-fi Helmet by theblueturtle_    www.leonardocarrion.com");
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



