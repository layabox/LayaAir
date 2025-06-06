import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CompoundColliderShape } from "laya/d3/physics/shape/CompoundColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Event } from "laya/events/Event";

export class PhysicsWorld_CompoundCollider {
	private scene: Scene3D;
	private camera: Camera;

	private allCollider: Rigidbody3D[] = [];
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.scene = <Scene3D>Laya.stage.addChild(new Scene3D());

			this.camera = <Camera>this.scene.addChild(new Camera(0, 0.1, 100));
			this.camera.transform.translate(new Vector3(5.2, 4, 5.2));
			this.camera.transform.rotate(new Vector3(-25, 45, 0), true, false);
			this.camera.addComponent(CameraMoveScript);

			let directionLight = new Sprite3D();
			let dircom = directionLight.addComponent(DirectionLightCom);
			this.scene.addChild(directionLight);

			dircom.color = new Color(1, 1, 1, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			var plane: MeshSprite3D = <MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(13, 13, 10, 10)));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			planeMat.tilingOffset = new Vector4(10, 10, 0, 0);
			planeMat.shininess = 1;
			plane.meshRenderer.material = planeMat;
			plane.meshRenderer.receiveShadow = true;
			var staticCollider: PhysicsCollider = <PhysicsCollider>plane.addComponent(PhysicsCollider);
			var planeShape: BoxColliderShape = new BoxColliderShape(13, 0.1, 13);
			staticCollider.colliderShape = planeShape;
			staticCollider.friction = 2;

			this.randomAddPhysicsSprite();

			Laya.stage.on(Event.CLICK, this, () => {

				for (let i = 0; i < this.allCollider.length; i++) {
					let rig = this.allCollider[i];
					rig.wakeUp();
					let shape = (rig.colliderShape as CompoundColliderShape).shapes[0];
					shape && (rig.colliderShape as CompoundColliderShape).removeChildShape(shape);
				}



				Laya.timer.once(5000, this, () => {
					console.log("清理所有子形状");
					for (let i = 0; i < this.allCollider.length; i++) {
						let rig: Rigidbody3D = this.allCollider[i];
						rig.wakeUp();
						(rig.colliderShape as CompoundColliderShape).clearChildShape();
					}
				});
			})
		});
	}

	randomAddPhysicsSprite(): void {
		Laya.timer.loop(1000, this, () => {
			var random: number = Math.floor(Math.random() * 2) % 2;
			switch (random) {
				case 0:
					this.addTable();
					break;
				case 1:
					this.addObject();
					break;
				default:
					break;
			}
		});
	}

	addTable(): void {
		var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, (tex: Texture2D) => {
			mat.albedoTexture = tex;
		}));
		mat.shininess = 1;

		Mesh.load("res/threeDimen/Physics/table.lm", Handler.create(this, (mesh: Mesh) => {
			var table: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(mesh)));



			table.meshRenderer.material = mat;
			var transform: Transform3D = table.transform;
			var pos: Vector3 = transform.position;
			pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
			transform.position = pos;
			var rotationEuler: Vector3 = transform.rotationEuler;
			rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
			transform.rotationEuler = rotationEuler;
			var scale: Vector3 = transform.getWorldLossyScale();
			scale.setValue(3, 3, 3);
			transform.setWorldLossyScale(scale);


			var rigidBody: Rigidbody3D = (<Rigidbody3D>table.addComponent(Rigidbody3D));
			rigidBody.mass = 10;
			rigidBody.friction = 1;

			var compoundShape: CompoundColliderShape = new CompoundColliderShape();

			var boxShape: BoxColliderShape = new BoxColliderShape(0.5, 0.4, 0.045);
			var localOffset: Vector3 = boxShape.localOffset;
			localOffset.setValue(0, 0, 0.125);
			boxShape.localOffset = localOffset;
			compoundShape.addChildShape(boxShape);

			var boxShape1: BoxColliderShape = new BoxColliderShape(0.1, 0.1, 0.3);
			boxShape1.localOffset = new Vector3(-0.2, -0.148, -0.048);
			compoundShape.addChildShape(boxShape1);

			var boxShape2: BoxColliderShape = new BoxColliderShape(0.1, 0.1, 0.3);
			var localOffset2: Vector3 = boxShape2.localOffset;
			localOffset2.setValue(0.2, -0.148, -0.048);
			boxShape2.localOffset = localOffset2;
			compoundShape.addChildShape(boxShape2);

			var boxShape3: BoxColliderShape = new BoxColliderShape(0.1, 0.1, 0.3);
			var localOffset3: Vector3 = boxShape3.localOffset;
			localOffset3.setValue(-0.2, 0.153, -0.048);
			boxShape3.localOffset = localOffset3;
			compoundShape.addChildShape(boxShape3);

			var boxShape4: BoxColliderShape = new BoxColliderShape(0.1, 0.1, 0.3);
			var localOffset4: Vector3 = boxShape4.localOffset;
			localOffset4.setValue(0.2, 0.153, -0.048);
			boxShape4.localOffset = localOffset4;
			compoundShape.addChildShape(boxShape4);

			rigidBody.colliderShape = compoundShape;

			this.allCollider.push(rigidBody);



		}));
	}

	addObject(): void {
		var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, (tex: Texture2D) => {
			mat.albedoTexture = tex;
		}));
		Mesh.load("res/threeDimen/Physics/object.lm", Handler.create(this, (mesh: Mesh) => {

			var object: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(mesh)));
			var transform: Transform3D = object.transform;
			var pos: Vector3 = transform.position;
			pos.setValue(Math.random() * 4 - 2, 5, Math.random() * 4 - 2);
			transform.position = pos;
			var rotationEuler: Vector3 = transform.rotationEuler;
			rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
			transform.rotationEuler = rotationEuler;
			var scale: Vector3 = transform.getWorldLossyScale();
			scale.setValue(0.01, 0.01, 0.01);
			transform.setWorldLossyScale(scale);
			object.meshRenderer.material = mat;

			var rigidBody: Rigidbody3D = (<Rigidbody3D>object.addComponent(Rigidbody3D));
			rigidBody.mass = 3;
			rigidBody.friction = 0.3;

			var compoundShape: CompoundColliderShape = new CompoundColliderShape();

			var boxShape: BoxColliderShape = new BoxColliderShape(40, 40, 40);
			var boxLocalOffset: Vector3 = boxShape.localOffset;
			boxLocalOffset.setValue(0, 0, -20);
			boxShape.localOffset = boxLocalOffset;
			compoundShape.addChildShape(boxShape);

			var sphereShape: SphereColliderShape = new SphereColliderShape(25);
			var sphereLocalOffset: Vector3 = sphereShape.localOffset;
			sphereLocalOffset.setValue(0, 0, 24);
			sphereShape.localOffset = sphereLocalOffset;
			compoundShape.addChildShape(sphereShape);

			rigidBody.colliderShape = compoundShape;

			this.allCollider.push(rigidBody);
		}));

	}

}