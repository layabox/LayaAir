import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Material } from "laya/d3/core/material/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author
 */
export class BlinnPhongMaterialLoad {

	private rotation: Vector3 = new Vector3(0, 0.01, 0);

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.9, 1.5));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color.setValue(0.6, 0.6, 0.6, 1);

		Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh: Mesh): void {
			var layaMonkey: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(mesh)));
			layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
			layaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
			//加载材质
			Material.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat", Handler.create(this, function (mat: Material): void {
				layaMonkey.meshRenderer.material = mat;
			}));

			Laya.timer.frameLoop(1, this, function (): void {
				layaMonkey.transform.rotate(this.rotation, false);
			});
		}));
	}
}

