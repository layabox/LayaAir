import { Laya } from "Laya";
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
import Client from "../../Client";
import { SkinnedMeshRenderer } from "laya/d3/core/SkinnedMeshRenderer";
import { Script } from "laya/components/Script";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";

/**
 * Light rotation script.
 */
class RotationScript extends Script {
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

	/**实例类型*/
	private btype:any = "RealTimeShadow";
	private rotationButton:Button;
	private rotationScript:RotationScript;
	constructor() {
		//Init engine.
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//show stat.
			Stat.show();
			Laya.loader.load([
				"res/threeDimen/staticModel/grid/plane.lh",
				"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"
			], Handler.create(this, this.onComplete));
		});
	}

	private onComplete(): void {
		var scene: Scene3D = <Scene3D>Laya.stage.addChild(new Scene3D());
		
		var camera: Camera = <Camera>(scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 1.2, 1.6));
		camera.transform.rotate(new Vector3(-35, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = new DirectionLight();
		scene.addChild(directionLight);
		directionLight.color = new Color(0.85, 0.85, 0.8, 1);
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
		this.rotationScript = directionLight.addComponent(RotationScript);

		// A plane receive shadow.
		var grid: Sprite3D = <Sprite3D>scene.addChild(Loader.createNodes("res/threeDimen/staticModel/grid/plane.lh"));
		(<MeshSprite3D>grid.getChildAt(0)).meshRenderer.receiveShadow = true;
		
		// A monkey cast shadow.
		var layaMonkey: Sprite3D = <Sprite3D>scene.addChild(Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
		layaMonkey.transform.localScale = new Vector3(2, 2, 2);
		(<SkinnedMeshSprite3D>layaMonkey.getChildAt(0).getChildAt(1)).getComponent(SkinnedMeshRenderer).castShadow = true;

		// A sphere cast/receive shadow.
		var sphereSprite: MeshSprite3D = this.addPBRSphere(PrimitiveMesh.createSphere(0.1), new Vector3(0, 0.2, 0.5), scene);
		sphereSprite.meshRenderer.castShadow = true;

		// Add Light controll UI.
		this.loadUI();
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
	loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.rotationButton = <Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "Stop Rotation"));
			this.rotationButton.size(150, 30);
			this.rotationButton.labelSize = 20;
			this.rotationButton.sizeGrid = "4,4,4,4";
			this.rotationButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.rotationButton.pos(Laya.stage.width / 2 - this.rotationButton.width * Browser.pixelRatio / 2, Laya.stage.height - 40 * Browser.pixelRatio);
			this.rotationButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(label:string = "Stop Rotation"): void {
		if (this.rotationScript.rotation) {
			this.rotationButton.label = "Start Rotation";
			this.rotationScript.rotation = false;
		} else {
			this.rotationButton.label = "Stop Rotation";
			this.rotationScript.rotation = true;
		}
		label = this.rotationButton.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});	
	}
}
