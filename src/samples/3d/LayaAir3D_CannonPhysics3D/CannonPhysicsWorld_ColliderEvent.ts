import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Laya3D } from "Laya3D";
import { Handler } from "laya/utils/Handler";
import { Stage } from "laya/display/Stage";
import { Laya } from "Laya";
import { Stat } from "laya/utils/Stat";
import { Camera } from "laya/d3/core/Camera";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Texture2D } from "laya/resource/Texture2D";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { CannonPhysicsCollider } from "laya/d3/physicsCannon/CannonPhysicsCollider";
import { CannonBoxColliderShape } from "laya/d3/physicsCannon/shape/CannonBoxColliderShape";
import { Transform3D } from "laya/d3/core/Transform3D";
import { CannonRigidbody3D } from "laya/d3/physicsCannon/CannonRigidbody3D";
import { CannonSphereColliderShape } from "laya/d3/physicsCannon/shape/CannonSphereColliderShape";
import { CannonCompoundColliderShape } from "laya/d3/physicsCannon/shape/CannonCompoundColliderShape";
import { Event } from "laya/events/Event";
import { Script3D } from "laya/d3/component/Script3D";
import { PhysicsComponent } from "laya/d3/physics/PhysicsComponent";
import { Collision } from "laya/d3/physics/Collision";
import { Config3D } from "Config3D";
import { Color } from "laya/d3/math/Color";

/**
 * 用键盘WASD来控制小盒子的移动，碰到的会变成红色
 */
export class CannonPhysicsWorld_ColliderEvent {
	private scene: Scene3D;
	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;
	private mat3: BlinnPhongMaterial;
	private camera: Camera;
	private Kinematic: MeshSprite3D;
	private speed: number = 0.1;
	private tempSpeed: Vector3 = new Vector3();
	constructor() {
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			Config3D.useCannonPhysics = true;
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();

			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//初始化照相机
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(0, 6, 15));
			this.camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			this.camera.addComponent(CameraMoveScript);

			//方向光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(0.6, 0.6, 0.6, 1.0);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix = mat;
			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//设置纹理平铺和偏移
			var tilingOffset: Vector4 = planeMat.tilingOffset;
			tilingOffset.setValue(5, 5, 0, 0);
			planeMat.tilingOffset = tilingOffset;
			//设置材质
			plane.meshRenderer.material = planeMat;
			var planeCollider: CannonPhysicsCollider = plane.addComponent(CannonPhysicsCollider);
			var planeShape: CannonBoxColliderShape = new CannonBoxColliderShape(20, 0.01, 20);
			planeCollider.colliderShape = planeShape;
			planeCollider.friction = 2;
			planeCollider.restitution = 0.3;
			this.mat1 = new BlinnPhongMaterial();
			this.mat2 = new BlinnPhongMaterial();
			this.mat3 = new BlinnPhongMaterial();
			Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat1.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat2.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat3.albedoTexture = tex;
			}));

			this.addBox(false);
			this.addSphere();
			this.addCompoundColliderShape();

			//增加一个运动学刚体
			this.Kinematic = this.addBox(true);
			this.Kinematic.transform.position = new Vector3(0, 0.5, 5);
			this.Kinematic.addComponent(colliderCheck);
			Laya.stage.on(Event.KEY_DOWN, this, this.keyDown);
			Laya.stage.on(Event.KEY_PRESS, this, this.keyDown);
		}));
	}
	addBox(isKinematic: boolean): MeshSprite3D {
		var sX: number = 1;
		var sY: number = 1;
		var sZ: number = 1;
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		box.name = "box";
		//设置材质
		box.meshRenderer.material = this.mat1;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(-5, 5, 0);
		transform.position = pos;
		//创建刚体碰撞器
		var rigidBody: CannonRigidbody3D = box.addComponent(CannonRigidbody3D);
		//创建盒子形状碰撞器
		var boxShape: CannonBoxColliderShape = new CannonBoxColliderShape(sX, sY, sZ);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
		rigidBody.isKinematic = isKinematic;
		return box;
	}
	addSphere() {
		var radius: number = 1;
		var sphere: MeshSprite3D = <MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(1)));
		sphere.name = "sphere";
		sphere.meshRenderer.material = this.mat2;
		var sphereTransform: Transform3D = sphere.transform;
		var pos: Vector3 = sphereTransform.position;
		pos.setValue(0, 1, 0);

		sphereTransform.position = pos;
		//创建刚体碰撞器
		var physicsCollider: CannonPhysicsCollider = sphere.addComponent(CannonPhysicsCollider);
		//创建盒子形状碰撞器
		var sphereShape: CannonSphereColliderShape = new CannonSphereColliderShape(radius);
		//设置盒子的碰撞形状
		physicsCollider.colliderShape = sphereShape;
		physicsCollider.isTrigger = true;
		//@ts-ignorets  minerTODO：
		// sphere.addComponent(colliderCheck);

	}
	addCompoundColliderShape() {
		var mesh: MeshSprite3D = this.addMeshBox(5, 5, 0);
		mesh.name = "compound"
		var scale: Vector3 = mesh.transform.getWorldLossyScale();
		//测试Scale
		scale.setValue(0.5, 0.5, 0.5);
		mesh.transform.setWorldLossyScale(scale);
		this.scene.addChild(mesh);
		//创建刚体碰撞器
		var rigidBody: CannonRigidbody3D = mesh.addComponent(CannonRigidbody3D);
		//创建盒子形状碰撞器
		var boxShape0: CannonBoxColliderShape = new CannonBoxColliderShape(1, 1, 1);
		var boxShape1: CannonBoxColliderShape = new CannonBoxColliderShape(1, 1, 1);
		var boxShape2: CannonBoxColliderShape = new CannonBoxColliderShape(1, 1, 1);
		var boxShape3: CannonBoxColliderShape = new CannonBoxColliderShape(1, 1, 1);

		var boxCompoundShape: CannonCompoundColliderShape = new CannonCompoundColliderShape();
		(<any>boxCompoundShape).addChildShape(boxShape0, new Vector3(0.5, 0.5, 0));
		(<any>boxCompoundShape).addChildShape(boxShape1, new Vector3(0.5, -0.5, 0));
		(<any>boxCompoundShape).addChildShape(boxShape2, new Vector3(-0.5, 0.5, 0));
		(<any>boxCompoundShape).addChildShape(boxShape3, new Vector3(-0.5, -0.5));
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxCompoundShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}
	addMeshBox(x: number, y: number, z: number): MeshSprite3D {
		var sX: number = 2;
		var sY: number = 2;
		var sZ: number = 1;
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//设置材质
		box.meshRenderer.material = this.mat3;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(x, y, z);
		transform.position = pos;
		return box;
	}
	keyDown(e: any) {

		//var key:string = String.fromCharCode(e.keyCode);
		switch (e.keyCode) {
			case 87:
				this.tempSpeed.setValue(0, 0, -this.speed);
				break;
			case 83:
				//Down
				this.tempSpeed.setValue(0, 0, this.speed);
				break;
			case 65:
				//Left
				this.tempSpeed.setValue(-this.speed, 0, 0);
				break;
			case 68:
				//Right
				this.tempSpeed.setValue(this.speed, 0, 0);
				break;
		}
		this.Kinematic.transform.translate(this.tempSpeed);
	}
}

export class colliderCheck extends Script3D {
	/**
	 * 开始触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerEnter(other: PhysicsComponent): void {
		console.log("triggerEnter");
	}

	/**
	 * 持续触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerStay(other: PhysicsComponent): void {
		console.log("triggerStay");
	}

	/**
	 * 结束触发时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onTriggerExit(other: PhysicsComponent): void {
		console.log("triggerExit");
	}

	/**
	 * 开始碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionEnter(collision: Collision): void {
		console.log("collisionEnter");
	}

	/**
	 * 持续碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionStay(collision: Collision): void {
		console.log("collisionStay");
	}

	/**
	 * 结束碰撞时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onCollisionExit(collision: Collision): void {
		console.log("collisionexit");
	}
}