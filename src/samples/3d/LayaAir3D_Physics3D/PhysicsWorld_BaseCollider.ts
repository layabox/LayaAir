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
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { URL } from "laya/net/URL";
import { InputManager } from "laya/events/InputManager";
import { Event } from "laya/events/Event";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { pxPhysicsCreateUtil } from "laya/Physics3D/PhysX/pxPhysicsCreateUtil";
import { pxPhysicsManager } from "laya/Physics3D/PhysX/pxPhysicsManager";
import { Quaternion } from "laya/maths/Quaternion";
export class PhysicsWorld_BaseCollider {
	private scene: Scene3D;
	private tmpVector: Vector3 = new Vector3(0, 0, 0);
	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;
	private mat3: BlinnPhongMaterial;
	private mat4: BlinnPhongMaterial;
	private mat5: BlinnPhongMaterial;


	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {

			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Laya.stage.on(Event.KEY_DOWN, this, this.test);
			//显示性能面板
			Stat.show();
			URL.basePath += "sample-resource/";
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//初始化照相机
			var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 6, 9.5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//方向光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(0.6, 0.6, 0.6, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix = mat;

			//平面
			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10))));
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

			//平面添加物理碰撞体组件
			var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
			//创建盒子形状碰撞器
			var planeShape: BoxColliderShape = new BoxColliderShape(10, 0.1, 10);
			//物理碰撞体设置形状
			planeStaticCollider.colliderShape = planeShape;
			//物理碰撞体设置摩擦力
			planeStaticCollider.friction = 2;
			//物理碰撞体设置弹力
			planeStaticCollider.restitution = 0.3;
			//随机生成精灵
			this.randomAddPhysicsSprite();
		});
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
				case 3:
					this.addCone();
					break;
				case 4:
					this.addCylinder();
					break;
				default:
					break;
			}
		});
	}

	addPhybySDK() {
		// var sX: number = Math.random() * 0.75 + 0.25;
		// var sY: number = Math.random() * 0.75 + 0.25;
		// var sZ: number = Math.random() * 0.75 + 0.25;

		//let createUtil = Laya3D.PhysicsCreateUtil as pxPhysicsCreateUtil;
		//@ts-ignore
		let phyScene = (this.scene.physicsSimulation as pxPhysicsManager)._pxScene;
		//@ts-ignore
		let pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(
			1.0 / 2,
			1.0 / 2,
			1.0 / 2
		);
		let transform = {
			translation: new Vector3(0, 50, 0),
			rotation: new Quaternion()
		};
		//@ts-ignore
		let dynamic = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(transform);

		//@ts-ignore
		let _pxMaterial = pxPhysicsCreateUtil._pxPhysics.createMaterial(0.5, 0.5, 0.6);
		//@ts-ignore
		let shape = pxPhysicsCreateUtil._pxPhysics.createShape(pxGeometry, _pxMaterial, true, new pxPhysicsCreateUtil._physX.PxShapeFlags(1 << 0));
		
		dynamic.setMassAndUpdateInertia(10);
		dynamic.setMassAndUpdateInertia(1);
		dynamic.attachShape(shape);
		phyScene.addActor(dynamic, null);
		
		

		//@ts-ignore
		window.rig = dynamic;


		Laya.timer.loop(1000, this, function (): void {
			//@ts-ignore
			let transform = window.rig.getGlobalPose();
			console.log(transform.translation.x + "," + transform.translation.y + "," + transform.translation.z);
		});
		// PxReal aa = PxReal(size) ;
		//  PxTransform localTm(PxVec3(PxReal(0.0) , PxReal(aa), 0) );
		// 	//PxTransform localTm(PxVec3(PxReal(j*2) - PxReal(size-i), PxReal(i*2+1), 0) * halfExtent);
		// 	PxRigidDynamic* body = gPhysics->createRigidDynamic(t.transform(localTm));
		// 	body->attachShape(*shape);
		// 	PxRigidBodyExt::updateMassAndInertia(*body, 10.0f);
		// 	gScene->addActor(*body);

		// shape->release();
	}

	addBox(): void {
		//随机生成坐标值
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//设置材质
		box.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/rocks.jpg").then((res) => {
			(box.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		//设置欧拉角
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//创建盒子形状碰撞器
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
		(window as any).rig = rigidBody;
	}

	test() {
		//console.log("hah");
		//let rigidBody = (window as any).rig as Rigidbody3D;
		//let v = new Vector3(1, 0, 0);
		// (rigidBody.owner as Sprite3D).transform.position.vadd(v, v);
		// rigidBody.position = v;
		//rigidBody.applyForce(new Vector3(1000, 0, 0));
	}

	addSphere(): void {
		//随机生成半径大小
		var radius: number = Math.random() * 0.2 + 0.2;
		//创建球型MeshSprite3D
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		//设置材质
		sphere.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/plywood.jpg").then((res) => {
			(sphere.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		sphere.transform.position = pos;

		//添加刚体碰撞器
		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		//创建球型碰撞器
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		//设置刚体碰撞器的形状
		rigidBody.colliderShape = sphereShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}

	addCapsule(): void {

		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//创建胶囊MeshSprite3D
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		//设置材质
		capsule.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/wood.jpg").then((res) => {
			(capsule.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		var transform: Transform3D = capsule.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		//设置胶囊MeshSprite3D的欧拉角
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		//创建球型碰撞器
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		//设置刚体碰撞器的形状
		rigidBody.colliderShape = sphereShape;
		//设置刚体碰撞器的质量
		rigidBody.mass = 10;
	}

	addCone(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//创建圆锥MeshSprite3D
		var cone: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createCone(raidius, height));
		this.scene.addChild(cone);
		//设置材质
		cone.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/steel2.jpg").then((res) => {
			(cone.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		//设置位置
		var pos: Vector3 = cone.transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		cone.transform.position = pos;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = cone.addComponent(Rigidbody3D);
		//创建球型碰撞器
		var coneShape: ConeColliderShape = new ConeColliderShape(raidius, height);
		//设置刚体碰撞器的形状
		rigidBody.colliderShape = coneShape;
		//设置刚体碰撞器的质量
		rigidBody.mass = 10;
	}

	addCylinder(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//创建圆锥MeshSprite3D
		var cylinder: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createCylinder(raidius, height));
		this.scene.addChild(cylinder);
		//设置材质
		cylinder.meshRenderer.material = new BlinnPhongMaterial();
		Laya.loader.load("res/threeDimen/Physics/steel.jpg").then((res) => {
			(cylinder.meshRenderer.material as BlinnPhongMaterial).albedoTexture = res as Texture2D;
		});
		//设置位置
		var transform: Transform3D = cylinder.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		//设置圆柱MeshSprite3D的欧拉角
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = cylinder.addComponent(Rigidbody3D);
		//创建球型碰撞器
		var cylinderShape: CylinderColliderShape = new CylinderColliderShape(raidius, height);
		//设置刚体碰撞器的形状
		rigidBody.colliderShape = cylinderShape;
		//设置刚体碰撞器的质量
		rigidBody.mass = 10;
	}

}


