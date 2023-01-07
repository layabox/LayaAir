import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";

export class SimpleSkinAnimationInstance {
	private animatorName: string[][] = [
		["PickUp", "PotionDrink", "BattleWalkRight", "VictoryStart", "DefendStart", "Die", "Interact", "VictoryMaintain"],
		["DefendHit_SwordAndShield", "SwordAndShiled2", "Defend_SwordAndShield", "SwordAndShiled", "Attack04_Start_SwordAndShield", "Attack04_SwordAndShiled"],
	];
	private oriSprite3D: Sprite3D;
	private scene: Scene3D;
	private widthNums: number = 20;
	private step: number = 2.5;
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		Shader3D.debugMode = true;
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		// add Camera
		var camera: Camera = new Camera();
		this.scene.addChild(camera);
		camera.clearFlag = CameraClearFlags.SolidColor;
		camera.clearColor = new Color(0.79, 0.72, 0.72, 1.0);
		camera.transform.localPosition = new Vector3(-16.4, 2.96, 24.3);
		camera.transform.localRotationEuler = new Vector3(-7.5, -30, 0.0);
		camera.addComponent(CameraMoveScript);
		// add Light
		var light = new DirectionLight();
		light.intensity = 0.5;
		light.transform.localRotationEuler = new Vector3(-20, 0, 0);
		this.scene.addChild(light);
		var res = [
			"res/threeDimen/texAnimation/Attack01/Attack01.lh",
			"res/threeDimen/texAnimation/role/role.lh",
		];
		Laya.loader.load(res).then(() => {
			this.oriSprite3D = Loader.createNodes(res[0]);
			this.sceneBuild(0);
			// add other model
			this.oriSprite3D = Loader.createNodes(res[1]);
			this.sceneBuild(1);
		});

		// addPlane
		var plane = new MeshSprite3D(PrimitiveMesh.createPlane(100, 100, 1, 1));
		var planeMat = new BlinnPhongMaterial();
		plane.meshRenderer.sharedMaterial = planeMat;
		this.scene.addChild(plane);
	}
	cloneSprite(pos: Vector3, quaterial: Vector3, aniNameIndex: number) {
		var clonesprite: Sprite3D = this.oriSprite3D.clone() as Sprite3D;
		this.scene.addChild(clonesprite);
		var animate: Animator = clonesprite.getComponent(Animator);
		var nums: number = Math.round(Math.random() * 5);
		animate.play(this.animatorName[aniNameIndex][nums], 0, Math.random());
		clonesprite.transform.position = pos;
		clonesprite.transform.rotationEuler = quaterial;
	}

	sceneBuild(aniNameIndex: number) {
		var left: number = -0.5 * this.step * (this.widthNums);
		var right: number = -1 * left;
		for (var i: number = left; i < right; i += this.step)
			for (var j: number = left; j < right; j += this.step) {
				var xchange: number = (Math.random() - 0.5) * 5;
				var zchange: number = (Math.random() - 0.5) * 5;
				var quaterial: Vector3 = new Vector3(0, Math.random() * 180, 0);
				this.cloneSprite(new Vector3(i + xchange, 0, j + zchange), quaterial, aniNameIndex);
			}
	}
}

