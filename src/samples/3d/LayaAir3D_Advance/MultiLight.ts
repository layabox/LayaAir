import { Vector3 } from "laya/d3/math/Vector3";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { PointLight } from "laya/d3/core/light/PointLight";
import { SpotLight } from "laya/d3/core/light/SpotLight";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";

export class BlinnPhong_DiffuseMap {

	private rotation: Vector3 = new Vector3(0, 0.01, 0);

	constructor() {
		Shader3D.debugMode = true;
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 100))));
		camera.transform.translate(new Vector3(0, 0.0, 1.5));
		//camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
		camera.addComponent(CameraMoveScript);
		camera.fieldOfView=170;

		// //增加后期处理
		// var postProcess: PostProcess = new PostProcess();
		// //增加后期处理泛光效果
		// var bloom: BloomEffect = new BloomEffect();
		// postProcess.addEffect(bloom);
		// camera.postProcess = postProcess;
		// camera.enableHDR = true;

		// //设置泛光参数
		// bloom.intensity = 5;
		// bloom.threshold = 0.9;
		// bloom.softKnee = 0.5;
		// bloom.clamp = 65472;
		// bloom.diffusion = 5;
		// bloom.anamorphicRatio = 0.0;
		// bloom.color = new Color(1, 1, 1, 1);
		// bloom.fastMode = true;

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color.setValue(1, 0.4, 1);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color.setValue(1, 0, 0);
		directionLight.transform.rotationEuler = new Vector3(30, 20, 30);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color.setValue(0, 0.9, 0.3);
		directionLight.transform.rotationEuler = new Vector3(70, -20, 10);


		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		directionLight.color.setValue(0.0, 0.4, 0.9);
		directionLight.transform.rotationEuler = new Vector3(6, 60, 13);

		var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
		pointLight.transform.localPosition=new Vector3(0.2,0.0,0.0);
		pointLight.color.setValue(0.0, 0.0, 1.0);
		pointLight.range=0.6;

		var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
		pointLight.transform.localPosition=new Vector3(0.0,0.5,0.0);
		pointLight.color.setValue(0.0, 1.0, 0.0);
		pointLight.range=1.9;

		var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
		pointLight.transform.localPosition=new Vector3(-0.3,0.5,0.0);
		pointLight.color.setValue(1.0, 0.0, 0.0);
		pointLight.range=0.9;

		var pointLight: PointLight = (<PointLight>scene.addChild(new PointLight()));
		pointLight.transform.localPosition=new Vector3(0.3,0.9,0.0);
		pointLight.color.setValue(2.0, 0.2, 1.0);
		pointLight.range=1.8;

		var spotLight: SpotLight = (<SpotLight>scene.addChild(new SpotLight()));
		spotLight.transform.localPosition=new Vector3(0.0,0.0,1.51);
		spotLight.color.setValue(0.0, 0.0, 1.0);
		spotLight.range=2;
		spotLight.spotAngle=45;


		// var x: PointLight = (<PointLight>scene.addChild(new PointLight()));
		// x.transform.localPosition=new Vector3(0.0,0.0,1.5);
		// x.color.setValue(0.0, 0.0, 1.0);
		// x.range=2;

		//创建一个SphereMesh
		var sphereMesh: Mesh = PrimitiveMesh.createSphere();

		var earth1: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(sphereMesh)));
		earth1.transform.position = new Vector3(-0.6, 0, 0);

		var earth2: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(sphereMesh)));
		earth2.transform.position = new Vector3(0.6, 0, 0);
		var material: BlinnPhongMaterial = new BlinnPhongMaterial();
		//漫反射贴图
		Texture2D.load("res/threeDimen/texture/earth.png", Handler.create(this, function (texture: Texture2D): void {
			material.albedoTexture = texture;
		}));
		earth2.meshRenderer.material = material;

		Laya.timer.frameLoop(1, this, function (): void {
			earth1.transform.rotate(this.rotation, false);
			earth2.transform.rotate(this.rotation, false);
		});
	}
}

