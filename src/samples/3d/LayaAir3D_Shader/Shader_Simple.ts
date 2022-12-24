import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CustomMaterial } from "./customMaterials/CustomMaterial";
import SimpleShaderFS from "./customShader/simpleShader.fs";
import SimpleShaderVS from "./customShader/simpleShader.vs";

/**
 * ...
 * @author ...
 */
export class Shader_Simple {

	private rotation: Vector3 = new Vector3(0, 0.01, 0);

	constructor() {

		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		this.initShader();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 100))));
		camera.transform.translate(new Vector3(0, 0.5, 1.5));
		camera.addComponent(CameraMoveScript);
		camera.clearColor = new Color(1.0, 1.0, 1.0, 1.0);
		Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh: Mesh): void {
			var layaMonkey: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(mesh)));
			layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
			layaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);

			var customMaterial: CustomMaterial = new CustomMaterial();
			layaMonkey.meshRenderer.sharedMaterial = customMaterial;

			Laya.timer.frameLoop(1, this, function (): void {
				layaMonkey.transform.rotate(this.rotation, false);
			});
		}));
	}

	private initShader(): void {
		var customShader: Shader3D = Shader3D.add("CustomShader");
		var subShader: SubShader = new SubShader();
		customShader.addSubShader(subShader);
		subShader.addShaderPass(SimpleShaderVS, SimpleShaderFS);
	}

}


