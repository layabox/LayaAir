import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { MeshColliderShape } from "laya/d3/physics/shape/MeshColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class PhysicsWorld_MeshCollider {

	private scene: Scene3D;
	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;
	private mat3: BlinnPhongMaterial;
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//初始化照相机
			var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 6, 9.5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//方向光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(0.0, -0.8, -1.0));
			directionLight.transform.worldMatrix = mat;
			directionLight.color = new Color(1, 1, 1, 1);
			Laya.loader.load(["res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png"], Handler.create(this, this.complete));
		});
	}

	complete(): void {
		var mesh: Mesh = Loader.getRes("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm");
		var albedo = Loader.getTexture2D("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png");
		var normal = Loader.getTexture2D("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png");
		var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
		mat.specularColor = new Color(0.5, 0.5, 0.5, 0.5);
		mat.albedoTexture = albedo;
		mat.normalTexture = normal;

		var lizard: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(mesh)));
		lizard.transform.localPosition = new Vector3(-2, 0, 0);
		lizard.transform.localScale = new Vector3(0.01, 0.01, 0.01);
		lizard.meshRenderer.material = mat;
		var lizardCollider: PhysicsCollider = lizard.addComponent(PhysicsCollider);
		var meshShape: MeshColliderShape = new MeshColliderShape();
		meshShape.mesh = mesh;
		lizardCollider.colliderShape = meshShape;
		lizardCollider.friction = 2;
		lizardCollider.restitution = 0.3;

		var lizard1: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(mesh)));
		var transform: Transform3D = lizard1.transform;
		var localPosition: Vector3 = transform.localPosition;
		var localRotationEuler: Vector3 = transform.localRotationEuler;
		var localScale: Vector3 = transform.localScale;
		localPosition.setValue(3, 0, 0);
		localRotationEuler.setValue(0, 80, 0);
		localScale.setValue(0.01, 0.01, 0.01);
		transform.localPosition = localPosition;
		transform.localRotationEuler = localRotationEuler;
		transform.localScale = localScale;

		lizard1.meshRenderer.material = mat;
		var lizardCollider1: PhysicsCollider = lizard1.addComponent(PhysicsCollider);
		var meshShape1: MeshColliderShape = new MeshColliderShape();
		meshShape1.mesh = mesh;
		lizardCollider1.colliderShape = meshShape1;
		lizardCollider1.friction = 2;
		lizardCollider1.restitution = 0.3;

		this.randomAddPhysicsSprite();
	}

	randomAddPhysicsSprite(): void {
		Laya.timer.loop(1000, this, function (): void {
			var random: number = Math.floor(Math.random() * 3) % 3;
			switch (random) {
				case 0:
					this.addBox();
					break;
				case 1:
					this.addSphere();
					break;
				case 2:
					this.addCapsule();
					break;
				default:
					break;
			}
		});
	}

	addBox(): void {
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		box.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/rocks.jpg").then((res)=>{
			(box.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		rigidBody.colliderShape = boxShape;
		rigidBody.mass = 10;
	}

	addSphere(): void {
		var radius: number = Math.random() * 0.2 + 0.2;
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		sphere.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/plywood.jpg").then((res)=>{
			(sphere.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		sphere.transform.position = pos;

		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
	}

	addCapsule(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		capsule.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/wood.jpg").then((res)=>{
			(capsule.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var transform: Transform3D = capsule.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
	}

}


