import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Handler } from "laya/utils/Handler";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { FixedConstraint } from "laya/d3/physics/constraints/FixedConstraint";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Script } from "laya/components/Script";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Event } from "laya/events/Event";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Texture2D } from "laya/resource/Texture2D";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Vector4 } from "laya/maths/Vector4";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { Physics3DUtils } from "laya/d3/utils/Physics3DUtils";
import { InputManager } from "laya/events/InputManager";
import { URL } from "laya/net/URL";
import { HingeConstraint } from "laya/d3/physics/constraints/HingeConstraint";
import { Keyboard } from "laya/events/Keyboard";

export class PhysicsWorld_ConstraintHingeJoint {
	private scene: Scene3D;
	private camera: Camera;
	plane: MeshSprite3D;
	private _albedoColor: Color;
	kinematicSphere: MeshSprite3D;
	private translateW: Vector3 = new Vector3(0, 0, -0.2);
	private translateS: Vector3 = new Vector3(0, 0, 0.2);
	private translateA: Vector3 = new Vector3(-0.2, 0, 0);
	private translateD: Vector3 = new Vector3(0.2, 0, 0);
	private translateQ: Vector3 = new Vector3(-0.01, 0, 0);
	private translateE: Vector3 = new Vector3(0.01, 0, 0);
	isActive: boolean = false;
	doorRig: Rigidbody3D;
	camSrc: Script;
	doorZhuzi: MeshSprite3D;
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(0.43343177832663077, 5.117327691614629, 13.66159209251402));
			this.camera.transform.rotationEuler = new Vector3(-18.794161595881256, 1.2857172922735671, 3.5357225315533866e-9);
			this.camSrc = this.camera.addComponent(CameraMoveScript);
			//  this.camera.transform.rotate(new Vector3(-30, 45, 0), true, false);
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(1, 1, 1, 1);
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			//创建平面
			this.plane = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			//加载纹理
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//设置材质
			planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
			this.plane.meshRenderer.material = planeMat;
			//为平面设置盒型碰撞器
			var staticCollider: PhysicsCollider = (<PhysicsCollider>this.plane.addComponent(PhysicsCollider));
			var boxShape: BoxColliderShape = new BoxColliderShape(20, 0, 20);
			staticCollider.colliderShape = boxShape;
			this.plane.active = false;

			// addkinematicSphere
			this.addKinematicSphere();

			// add door
			this.addHingeJointDoor();
		});
	}


	addKinematicSphere(): void {
		//创建BlinnPhong材质
		var mat2: BlinnPhongMaterial = new BlinnPhongMaterial();
		//加载纹理
		Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat2.albedoTexture = tex;
		}));
		mat2.albedoColor = this._albedoColor;
		//创建一个球
		var radius: number = 0.8;
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		sphere.meshRenderer.material = mat2;
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(0, 0.8, 4);
		sphere.transform.position = pos;

		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		//创建球形碰撞器
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		//设置刚体的碰撞形状
		rigidBody.colliderShape = sphereShape;
		//设置刚体的质量
		rigidBody.mass = 60;


		rigidBody.linearFactor = new Vector3(1, 0, 1);
		//设置当前刚体为运动学物体,仅可通过transform属性移动物体,而非其他力相关属性。
		rigidBody.isKinematic = true;

		this.kinematicSphere = sphere;
		//开启定时重复执行
		Laya.timer.frameLoop(1, this, this.onKeyDown);
	}


	private onKeyDown(): void {
		this.doorRig && this.doorRig.wakeUp();
		if (InputManager.hasKeyDown(Keyboard.SPACE)) {
			// this.isActive = true;
			// this.camSrc.enabled = this.isActive;
		} else {
			InputManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);//W
			InputManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);//S
			InputManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);//A
			InputManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);//D
			InputManager.hasKeyDown(81) && this.kinematicSphere.transform.translate(new Vector3(0, 0.2, 0));//Q
			InputManager.hasKeyDown(69) && this.kinematicSphere.transform.translate(new Vector3(0, -0.2, 0));//E
			// this.camSrc.enabled = false;
			// this.isActive = false;
		}

	}


	addHingeJointDoor() {
		let door: Sprite3D = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(3.5, 5.5, 0.5)));
		door.transform.position = new Vector3(0, 4, 0);
		this.doorRig = door.addComponent(Rigidbody3D);
		let doorRigShape = new BoxColliderShape(3.5, 5.5, 0.5);
		this.doorRig.colliderShape = doorRigShape;

		this.doorZhuzi = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1, 5.5, 0.5)));
		this.doorZhuzi.transform.position = new Vector3(3, 3.5, 0);
		let doorZhuziRig = this.doorZhuzi.addComponent(Rigidbody3D);
		doorZhuziRig.mass = 60;
		let doorZhuziRigShape = new BoxColliderShape(1, 1, 1);
		doorZhuziRig.colliderShape = doorZhuziRigShape;
		doorZhuziRig.isKinematic = true;
		let doorHingeJoint: HingeConstraint = this.doorZhuzi.addComponent(HingeConstraint);
		doorHingeJoint.ownBody = doorZhuziRig;
		doorHingeJoint.connectedBody = this.doorRig;
		doorHingeJoint.anchor = new Vector3(0, 0, 0);
		doorHingeJoint.connectAnchor = new Vector3(5, 0, 0);
		doorHingeJoint.Axis = new Vector3(0, 1, 0);
		doorHingeJoint.limit = false;
		doorHingeJoint.lowerLimit = -90;
		doorHingeJoint.uperLimit = 90;

		doorHingeJoint.motor = false;
		doorHingeJoint.targetVelocity = -1000;
		doorHingeJoint.freeSpin = true;

		doorHingeJoint.bounceness = 100;
		doorHingeJoint.bouncenMinVelocity = 1000;
	}

}