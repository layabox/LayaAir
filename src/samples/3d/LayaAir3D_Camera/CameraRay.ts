import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Ray } from "laya/d3/math/Ray";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { HitResult } from "laya/d3/physics/HitResult";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { MouseManager } from "laya/events/MouseManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Utils } from "laya/utils/Utils";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";




/**
 * ...
 * @author zqx
 */
export class CameraRay {
	private scene: Scene3D;
	private camera: Camera;
	private _ray: Ray;
	private _outHitResult: HitResult = new HitResult();
	private outs: HitResult[] = [];
	private posX: number = 0.0;
	private posY: number = 0.0;
	private point: Vector2 = new Vector2();
	private _text: Text = new Text();

	private _translate: Vector3 = new Vector3(0, 6, 9.5);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _forward: Vector3 = new Vector3(-1.0, -1.0, -1.0);
	private _tilingOffset: Vector4 = new Vector4(10, 10, 0, 0);

	private tmpVector: Vector3 = new Vector3(0, 0, 0);
	private tmpVector2: Vector3 = new Vector3(0, 0, 0);

	/**实例类型*/
	private btype:any = "CameraRay";
	/**场景内按钮类型*/
	private stype:any = 0;

	constructor() {
		//初始化引擎,使用物理的wasm库需要调用回调的方式来初始化
		Laya3D.init(0, 0,null,Handler.create(this,()=>{
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
	
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
	
			//初始化照相机
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(this._translate);
			this.camera.transform.rotate(this._rotation, true, false);
			this.camera.addComponent(CameraMoveScript);
	
			//方向光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color.setValue(0.6, 0.6, 0.6, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(this._forward);
			directionLight.transform.worldMatrix = mat;
	
			//平面
			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//设置纹理平铺和偏移
			planeMat.tilingOffset = this._tilingOffset;
			//设置材质
			plane.meshRenderer.material = planeMat;
	
			//平面添加物理碰撞体组件
			var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
			//创建盒子形状碰撞器
			var planeShape: BoxColliderShape = new BoxColliderShape(10, 0, 10);
			//物理碰撞体设置形状
			planeStaticCollider.colliderShape = planeShape;
			//物理碰撞体设置摩擦力
			planeStaticCollider.friction = 2;
			//物理碰撞体设置弹力
			planeStaticCollider.restitution = 0.3;
			//添加鼠标事件
			this.addMouseEvent();
			//射线初始化（必须初始化）
			this._ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
		}));
	}
	addBoxXYZ(x: number, y: number, z: number): void {
		var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat1.albedoTexture = tex;
		}));

		//随机生成坐标值
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		//创建盒型MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//设置材质
		box.meshRenderer.material = mat1;
		this.tmpVector.setValue(x, y, z);
		box.transform.position = this.tmpVector;
		//设置欧拉角
		this.tmpVector2.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		box.transform.rotationEuler = this.tmpVector2;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//创建盒子形状碰撞器
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}

	private addMouseEvent(): void {
		//鼠标事件监听
		Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
	}

	private onMouseDown(): void {
		this.posX = this.point.x = MouseManager.instance.mouseX;
		this.posY = this.point.y = MouseManager.instance.mouseY;
		//产生射线
		this.camera.viewportPointToRay(this.point, this._ray);
		//拿到射线碰撞的物体
		this.scene.physicsSimulation.rayCastAll(this._ray, this.outs);

		//如果碰撞到物体
		if (this.outs.length != 0) {

			for (var i: number = 0; i < this.outs.length; i++) {
				//在射线击中的位置添加一个立方体
				this.addBoxXYZ(this.outs[i].point.x, this.outs[i].point.y, this.outs[i].point.z);
			}
		}
		Client.instance.send({type:"next",btype:this.btype,stype:0})

	}

}


