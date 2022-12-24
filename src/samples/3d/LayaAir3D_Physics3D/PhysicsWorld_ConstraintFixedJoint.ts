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

export class PhysicsWorld_ConstraintFixedJoint {
	private scene: Scene3D;
	private camera: Camera;
	constructor() {
		Laya3D.init(0, 0, null, Handler.create(this, () => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(0, 3, 10));
			//  this.camera.transform.rotate(new Vector3(-30, 45, 0), true, false);
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(1, 1, 1, 1);
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;
			this.addbox();
		}));

	}

	addbox() {
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1))));
		//设置材质
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(0, 5, 0);
		transform.position = pos;
		box.meshRenderer.sharedMaterial = new BlinnPhongMaterial();

		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//创建盒子形状碰撞器
		var boxShape: BoxColliderShape = new BoxColliderShape(1, 1, 1);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;

		//设置刚体的质量
		rigidBody.mass = 10;
		rigidBody.isKinematic = true;

		//创建盒型MeshSprite3D
		var box2: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1))));
		//设置材质
		var transform2: Transform3D = box2.transform;
		var pos2: Vector3 = transform2.position;
		pos2.setValue(0, 3, 0);
		transform2.position = pos2;
		box2.meshRenderer.sharedMaterial = new BlinnPhongMaterial();
		//创建刚体碰撞器
		var rigidBody2: Rigidbody3D = box2.addComponent(Rigidbody3D);
		//创建盒子形状碰撞器
		var boxShape2: BoxColliderShape = new BoxColliderShape(1, 1, 1);
		//设置盒子的碰撞形状
		rigidBody2.colliderShape = boxShape2;
		//设置刚体的质量
		rigidBody2.mass = 10;

		var fixedConstraint: FixedConstraint = box.addComponent(FixedConstraint);
		fixedConstraint.anchor = new Vector3(0, 0, 0);
		fixedConstraint.connectAnchor = new Vector3(0, 2, 0);
		box.addComponent(FixedEventTest);
		fixedConstraint.setConnectRigidBody(rigidBody, rigidBody2);

	}

}

export class FixedEventTest extends Script {
	private fixedConstraint: FixedConstraint;

	onStart() {
		this.fixedConstraint = this.owner.getComponent(FixedConstraint);
		this.fixedConstraint.breakForce = 1000;
	}

	onUpdate() {
		if (this.fixedConstraint) {
			var mass = this.fixedConstraint.connectedBody.mass;
			this.fixedConstraint.connectedBody.mass = mass + 1;
		}

	}

	onJointBreak() {
		console.log("duanle");
	}
}