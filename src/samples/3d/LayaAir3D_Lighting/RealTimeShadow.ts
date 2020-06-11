import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Stat } from "laya/utils/Stat";

/**
 * Light rotation script.
 */
class RotationScript extends Script3D {
	/** Roation speed. */
	autoRotateSpeed: Vector3 = new Vector3(0, 0.05, 0);
	/** If roation. */
	rotation: boolean = true;

	onUpdate(): void {
		if (this.rotation)
			(<DirectionLight>this.owner).transform.rotate(this.autoRotateSpeed, false);
	}
}

/**
 * Realtime shadow sample. 
 */
export class RealTimeShadow {
	constructor() {
		//Init engine.
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//show stat.
		Stat.show();

		Laya.loader.create([
			"res/threeDimen/staticModel/grid/plane.lh",
			"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"
		], Handler.create(this, this.onComplete));
	}

	private onComplete(): void {
		var scene: Scene3D = <Scene3D>Laya.stage.addChild(new Scene3D());

		var camera: Camera = <Camera>(scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 1.2, 1.6));
		camera.transform.rotate(new Vector3(-35, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = <DirectionLight>scene.addChild(new DirectionLight());
		directionLight.color = new Vector3(0.85, 0.85, 0.8);
		directionLight.transform.rotate(new Vector3(-Math.PI / 3, 0, 0));

		// Use soft shadow.
		directionLight.shadowMode = ShadowMode.SoftLow;
		// Set shadow max distance from camera.
		directionLight.shadowDistance = 3;
		// Set shadow resolution.
		directionLight.shadowResolution = 1024;
		// Set shadow cascade mode.
		directionLight.shadowCascadesMode = ShadowCascadesMode.NoCascades;
		// Set shadow normal bias.
		directionLight.shadowNormalBias = 4;

		// Add rotation script to light.
		var rotationScript: RotationScript = directionLight.addComponent(RotationScript);

		// A plane receive shadow.
		var grid: Sprite3D = <Sprite3D>scene.addChild(Loader.getRes("res/threeDimen/staticModel/grid/plane.lh"));
		(<MeshSprite3D>grid.getChildAt(0)).meshRenderer.receiveShadow = true;

		// A monkey cast shadow.
		var layaMonkey: Sprite3D = <Sprite3D>scene.addChild(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
		layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
		(<SkinnedMeshSprite3D>layaMonkey.getChildAt(0).getChildAt(0)).skinnedMeshRenderer.castShadow = true;

		// A sphere cast/receive shadow.
		var sphereSprite: MeshSprite3D = this.addPBRSphere(PrimitiveMesh.createSphere(0.1), new Vector3(0, 0.2, 0.5), scene);
		sphereSprite.meshRenderer.castShadow = true;

		// Add Light controll UI.
		this.loadUI(rotationScript);
	}

	/**
	 * Add one with smoothness and metallic sphere.
	 */
	addPBRSphere(sphereMesh: Mesh, position: Vector3, scene: Scene3D): MeshSprite3D {
		var mat: PBRStandardMaterial = new PBRStandardMaterial();
		mat.smoothness = 0.2;

		var meshSprite: MeshSprite3D = new MeshSprite3D(sphereMesh);
		meshSprite.meshRenderer.sharedMaterial = mat;
		var transform: Transform3D = meshSprite.transform;
		transform.localPosition = position;
		scene.addChild(meshSprite);
		return meshSprite;
	}

	/**
	 * Add Button control light rotation.
	 */
	loadUI(rottaionScript: RotationScript): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			var rotationButton: Button = <Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "Stop Rotation"));
			rotationButton.size(150, 30);
			rotationButton.labelSize = 20;
			rotationButton.sizeGrid = "4,4,4,4";
			rotationButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			rotationButton.pos(Laya.stage.width / 2 - rotationButton.width * Browser.pixelRatio / 2, Laya.stage.height - 40 * Browser.pixelRatio);
			rotationButton.on(Event.CLICK, this, function (): void {
				if (rottaionScript.rotation) {
					rotationButton.label = "Start Rotation";
					rottaionScript.rotation = false;
				} else {
					rotationButton.label = "Stop Rotation";
					rottaionScript.rotation = true;
				}
			});
		}));
	}
}
