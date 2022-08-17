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
import { Config3D } from "Config3D";
import { Color } from "laya/d3/math/Color";

/**
 * 示例基本碰撞
 */
export class CannonPhysicsWorld_BaseCollider {
	private scene: Scene3D;
	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;
	private mat3: BlinnPhongMaterial;
	constructor() {
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			Laya3D.useCannonPhysics();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			//初始化照相机
			var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 6, 9.5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//方向光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(0.6, 0.6, 0.6, 1.0);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix = mat;
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
			var planeCollider: CannonPhysicsCollider = plane.addComponent(CannonPhysicsCollider);
			var planeShape: CannonBoxColliderShape = new CannonBoxColliderShape(10, 0.01, 10);
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
			Laya.timer.loop(3000, this, function (): void {
				var random: number = Math.random();
				if (random < 0.33)
					this.addCompoundColliderShape();
				else if (random < 0.66)
					this.addSphere();
				else
					this.addBox();
			});

		}));
	}
	addBox() {
		var sX: number = 1;
		var sY: number = 1;
		var sZ: number = 1;
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//设置材质
		box.meshRenderer.material = this.mat1;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 2 - 2, 10, Math.random() * 2 - 2);
		transform.position = pos;

		var scale: Vector3 = transform.getWorldLossyScale();
		scale.setValue(Math.random(), Math.random(), Math.random());
		transform.setWorldLossyScale(scale);
		//创建刚体碰撞器
		var rigidBody: CannonRigidbody3D = box.addComponent(CannonRigidbody3D);
		//创建盒子形状碰撞器
		var boxShape: CannonBoxColliderShape = new CannonBoxColliderShape(sX, sY, sZ);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}
	addSphere() {
		var radius: number = 1;
		var sphere: MeshSprite3D = <MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(1)));
		sphere.meshRenderer.material = this.mat2;
		var sphereTransform: Transform3D = sphere.transform;
		var pos: Vector3 = sphereTransform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		var scale: Vector3 = sphereTransform.getWorldLossyScale();
		scale.setValue(0.5, 0.5, 0.5);
		sphereTransform.setWorldLossyScale(scale);

		sphereTransform.position = pos;
		//创建刚体碰撞器
		var rigidBody: CannonRigidbody3D = sphere.addComponent(CannonRigidbody3D);
		//创建盒子形状碰撞器
		var sphereShape: CannonSphereColliderShape = new CannonSphereColliderShape(radius);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = sphereShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}
	addCompoundColliderShape() {
		var x = Math.random() * 4 - 2;
		var y = 10;
		var z = Math.random() * 4 - 2;

		var mesh: MeshSprite3D = this.addMeshBox(x, y, z);
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
}