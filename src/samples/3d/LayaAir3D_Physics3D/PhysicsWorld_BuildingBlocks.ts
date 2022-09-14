import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Ray } from "laya/d3/math/Ray";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { HitResult } from "laya/d3/physics/HitResult";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "Config3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";

export class PhysicsWorld_BuildingBlocks {
	private scene: Scene3D;
	private camera: Camera;
	private ray: Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
	private point: Vector2 = new Vector2();
	private _outHitResult: HitResult = new HitResult();
	private hasSelectedSprite: Sprite3D;
	private hasSelectedRigidBody: Rigidbody3D;
	private ZERO = new Vector3(0, 0, 0);
	private ONE = new Vector3(1, 1, 1);
	private posX: number;
	private posY: number;
	private delX: number;
	private delY: number;

	private mat: BlinnPhongMaterial;
	private mesh1: Mesh;
	private mesh2: Mesh;

	constructor() {
		Config3D.useCannonPhysics = false;
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(4.5, 6, 4.5));
			this.camera.transform.rotate(new Vector3(-30, 45, 0), true, false);

			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(1, 1, 1, 1);
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(13, 13, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));

			planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
			plane.meshRenderer.material = planeMat;
			plane.meshRenderer.receiveShadow = true;

			this.mesh1 = PrimitiveMesh.createBox(2, 0.33, 0.5);
			this.mesh2 = PrimitiveMesh.createBox(0.5, 0.33, 2);
			this.mat = new BlinnPhongMaterial();

			//加载纹理资源
			Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat.albedoTexture = tex;
			}));

			var rigidBody: PhysicsCollider = (<PhysicsCollider>plane.addComponent(PhysicsCollider));
			var boxShape: BoxColliderShape = new BoxColliderShape(13, 0, 13);
			rigidBody.colliderShape = boxShape;
			this.addMouseEvent();

			this.addBox();
		}));
	}

	addBox(): void {

		for (var i: number = 0; i < 8; i++) {
			this.addVerticalBox(-0.65, 0.165 + i * 0.33 * 2, 0);
			this.addVerticalBox(0, 0.165 + i * 0.33 * 2, 0);
			this.addVerticalBox(0.65, 0.165 + i * 0.33 * 2, 0);

			this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, -0.65);
			this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, 0);
			this.addHorizontalBox(0, 0.165 + 0.33 + i * 0.33 * 2, 0.65);
		}
	}

	addHorizontalBox(x: number, y: number, z: number): void {
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(this.mesh1)));
		box.meshRenderer.material = this.mat;
		box.meshRenderer.castShadow = true;
		box.meshRenderer.receiveShadow = true;
		box.transform.position = new Vector3(x, y, z);

		var rigidBody: Rigidbody3D = (<Rigidbody3D>box.addComponent(Rigidbody3D));
		rigidBody.mass = 10;
		rigidBody.friction = 0.4;
		rigidBody.restitution = 0.2;
		var boxShape: BoxColliderShape = new BoxColliderShape(2, 0.33, 0.5);
		rigidBody.colliderShape = boxShape;
	}

	addVerticalBox(x: number, y: number, z: number): void {
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(this.mesh2)));
		box.meshRenderer.material = this.mat;
		box.meshRenderer.castShadow = true;
		box.meshRenderer.receiveShadow = true;
		box.transform.position = new Vector3(x, y, z);

		var rigidBody: Rigidbody3D = (<Rigidbody3D>box.addComponent(Rigidbody3D));
		rigidBody.mass = 10;
		rigidBody.friction = 0.4;
		rigidBody.restitution = 0.2;
		var boxShape: BoxColliderShape = new BoxColliderShape(0.5, 0.33, 2);
		rigidBody.colliderShape = boxShape;
	}

	addMouseEvent(): void {
		Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
		Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
		Laya.stage.on(Event.MOUSE_OUT, this, this.onMouseOut);
	}

	onMouseDown(): void {
		this.posX = this.point.x = Laya.stage.mouseX;
		this.posY = this.point.y = Laya.stage.mouseY;
		this.camera.viewportPointToRay(this.point, this.ray);
		this.scene.physicsSimulation.rayCast(this.ray, this._outHitResult);
		if (this._outHitResult.succeeded) {
			var collider: Rigidbody3D = <Rigidbody3D>this._outHitResult.collider;
			this.hasSelectedSprite = <Sprite3D>collider.owner;
			this.hasSelectedRigidBody = collider;
			collider.angularFactor = this.ZERO;
			collider.angularVelocity = this.ZERO;
			collider.linearFactor = this.ZERO;
			collider.linearVelocity = this.ZERO;
		}
		Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
	}

	onMouseMove(): void {

		this.delX = Laya.stage.mouseX - this.posX;
		this.delY = Laya.stage.mouseY - this.posY;
		if (this.hasSelectedSprite) {
			this.hasSelectedRigidBody.linearVelocity = new Vector3(this.delX / 4, 0, this.delY / 4);
		}
		this.posX = Laya.stage.mouseX;
		this.posY = Laya.stage.mouseY;
	}

	onMouseUp(): void {
		Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
		if (this.hasSelectedSprite) {
			this.hasSelectedRigidBody.angularFactor = this.ONE;
			this.hasSelectedRigidBody.linearFactor = this.ONE;
			this.hasSelectedSprite = null;
		}
	}

	onMouseOut(): void {
		Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
		if (this.hasSelectedSprite) {
			this.hasSelectedRigidBody.angularFactor = this.ONE;
			this.hasSelectedRigidBody.linearFactor = this.ONE;
			this.hasSelectedSprite = null;
		}
	}
}

