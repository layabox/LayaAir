import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";


/**
 * ...
 * @author ...
 */
export class TouchScriptSample {
	private text: Text;
	private scene: Scene3D;
	private camera: Camera;
	private kinematicSphere: Sprite3D;

	constructor() {
		Laya3D.init(0, 0, null);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//Stat.show();
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		this.camera.transform.translate(new Vector3(0, 8, 20));
		this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);

		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		directionLight.color = new Vector3(1, 1, 1);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, 1.0));
		directionLight.transform.worldMatrix = mat;

		var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
		var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
			planeMat.albedoTexture = tex;
		}));
		planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
		plane.meshRenderer.material = planeMat;

		var rigidBody: PhysicsCollider = (<PhysicsCollider>plane.addComponent(PhysicsCollider));
		var boxShape: BoxColliderShape = new BoxColliderShape(20, 0, 20);
		rigidBody.colliderShape = boxShape;

		this.text = new Text();
		this.text.pos(20, 20);
		this.text.fontSize = 16;
		this.text.color = "yellow";

		this.addBox();
		this.addCapsule();
		Laya.stage.addChild(this.text);
	}

	addBox(): void {
		var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat1.albedoTexture = tex;
		}));

		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		box.meshRenderer.material = mat1;
		box.transform.position = new Vector3(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		box.transform.rotationEuler = new Vector3(Math.random() * 360, Math.random() * 360, Math.random() * 360);

		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		rigidBody.colliderShape = boxShape;
		rigidBody.mass = 10;

		var script: TouchScript = (<TouchScript>box.addComponent(TouchScript));
		script.header = "BOX: ";
		script.text = this.text;
	}

	addCapsule(): void {
		var mat3: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat3.albedoTexture = tex;
		}));

		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		capsule.meshRenderer.material = mat3;
		capsule.transform.position = new Vector3(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		capsule.transform.rotationEuler = new Vector3(Math.random() * 360, Math.random() * 360, Math.random() * 360);

		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;

		var script: TouchScript = (<TouchScript>capsule.addComponent(TouchScript));
		script.header = "Capsule: ";
		script.text = this.text;
	}
}





class TouchScript extends Script3D {
	header: string;
	subText: string = "";
	count: number = 0;
	text: Text;

	/*override*/  onUpdate(): void {
		if (this.count === 24) {
			var t: string = this.text.text;
			var index: number = t.indexOf("\n");
			t = t.slice(index + 1, t.length);
			this.text.text = t;
			this.count--;
		}
		if (this.subText !== "") {
			this.text.text += this.header + this.subText + "\n";
			this.subText = "";
			this.count++;
		}
	}

	/*override*/  onMouseEnter(): void {
		this.subText += "onMouseEnter  ";
	}

	/*override*/  onMouseOver(): void {
		this.subText += "onMouseOver  ";
	}

	/*override*/  onMouseOut(): void {
		this.subText += "onMouseOut  ";
	}

	/*override*/  onMouseDown(): void {
		this.subText += "onMouseDown  ";
	}

	/*override*/  onMouseUp(): void {
		this.subText += "onMouseUp  ";
	}

	/*override*/  onMouseClick(): void {
		this.subText += "onMouseClick  ";
	}

	/*override*/  onMouseDrag(): void {
		this.subText += "onMouseDrag  ";
	}
}

