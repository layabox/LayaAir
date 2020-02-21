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
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * 实时阴影案例。
 */
export class RealTimeShadow {
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		Laya.loader.create([
			"res/threeDimen/scene/LayaScene_EmptyScene/Conventional/EmptyScene.ls",
			"res/threeDimen/staticModel/grid/plane.lh",
			"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"
		], Handler.create(this, this.onComplete));
	}

	private onComplete(): void {
		var scene: Scene3D = <Scene3D>Laya.stage.addChild(new Scene3D());

		var camera: Camera = <Camera>(scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 1, 2));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color = new Vector3(0.85, 0.85, 0.8);
		directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));

		//灯光开启阴影
		directionLight.shadowMode = ShadowMode.SoftHigh;
		//可见阴影距离
		directionLight.shadowDistance = 3;
		//生成阴影贴图尺寸
		directionLight.shadowResolution = 2048;
		//阴影的级联模式
		directionLight.shadowCascadesMode = ShadowCascadesMode.NoCascades;

		//设置时钟定时执行
		var rot: Vector3 = new Vector3(0, 0.025, 0);
		Laya.timer.frameLoop(1, this, function (): void {
			directionLight.transform.rotate(rot, false);
		});

		// 地面接收阴影
		var grid: Sprite3D = <Sprite3D>scene.addChild(Loader.getRes("res/threeDimen/staticModel/grid/plane.lh"));
		(<MeshSprite3D>grid.getChildAt(0)).meshRenderer.receiveShadow = true;

		// 猴子产生阴影
		var layaMonkey: Sprite3D = <Sprite3D>scene.addChild(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
		layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
		(<SkinnedMeshSprite3D>layaMonkey.getChildAt(0).getChildAt(0)).skinnedMeshRenderer.castShadow = true;

		// 球产生阴影
		var sphereSprite: MeshSprite3D = this.addPBRSphere(PrimitiveMesh.createSphere(0.1), new Vector3(0, 0.2, 0.5), scene);
		sphereSprite.meshRenderer.castShadow = true;
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
}

