
import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Stat } from "laya/utils/Stat";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Ray } from "laya/d3/math/Ray";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { HitResult } from "laya/d3/physics/HitResult";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Texture2D } from "laya/resource/Texture2D";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";

import { CameraMoveScript } from "../common/CameraMoveScript";
import { Config3D } from "Config3D";
import Client from "../../Client";
import { Utils } from "laya/utils/Utils";

export class PhysicsWorld_RayShapeCast {
	//声明一些使用到的全局变量
	private castType: number = 0;
	private castAll: boolean = false;
	private ray: Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
	private scene: Scene3D;
	private hitResult: HitResult = new HitResult();
	private hitResults: HitResult[] = [];
	private debugSprites: Sprite3D[] = [];
	//创建射线的起始点
	private from: Vector3 = new Vector3(0, 1, 10);
	private to: Vector3 = new Vector3(0, 1, -5);
	private _albedoColor: Color = new Color(1.0, 1.0, 1.0, 0.5);
	private _position: Vector3 = new Vector3(0, 0, 0);
	//private mat1: BlinnPhongMaterial;
	//private mat3: BlinnPhongMaterial;
	private tex: Texture2D;
	private tex1: Texture2D;

	private changeActionButton0:Button;
	private changeActionButton1:Button;
	private changeActionButton2:Button;

	/**实例类型*/
	private btype:any = "PhysicsWorld_RayShapeCast";
	/**场景内按钮类型*/
	private stype:any = 0;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			//设置舞台
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//创建场景
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			//创建相机
			var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 8, 20));
			camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			//为相机添加视角控制组件(脚本)
			camera.addComponent(CameraMoveScript);

			//添加平行光
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Color(1, 1, 1, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			//添加地面
			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			//加载纹理
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//设置材质
			var tilingOffset: Vector4 = planeMat.tilingOffset;
			tilingOffset.setValue(2, 2, 0, 0);
			planeMat.tilingOffset = tilingOffset;
			plane.meshRenderer.material = planeMat;

			//加载纹理资源
			Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.tex = tex;
			}));
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.tex1 = tex;
			}));

			//为地面创建物理碰撞器
			var planeBody: PhysicsCollider = (<PhysicsCollider>plane.addComponent(PhysicsCollider));
			//创建盒型碰撞器
			var boxCollider: BoxColliderShape = new BoxColliderShape(20, 0, 20);
			//设置地面的碰撞器的形状为盒型
			planeBody.colliderShape = boxCollider;

			for (var i: number = 0; i < 60; i++) {
				this.addBox();
				this.addCapsule();
			}			
			this.loadUI();
		}));
		
	}


	private loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton0 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "射线模式")));
			this.changeActionButton0.size(160, 40);
			this.changeActionButton0.labelBold = true;
			this.changeActionButton0.labelSize = 30;
			this.changeActionButton0.sizeGrid = "4,4,4,4";
			this.changeActionButton0.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton0.pos(200, 200);
			this.changeActionButton0.on(Event.CLICK, this, this.stypeFun0);

			this.changeActionButton1 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "不穿透")));
			this.changeActionButton1.size(160, 40);
			this.changeActionButton1.labelBold = true;
			this.changeActionButton1.labelSize = 30;
			this.changeActionButton1.sizeGrid = "4,4,4,4";
			this.changeActionButton1.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton1.pos(200, 300);
			this.changeActionButton1.on(Event.CLICK, this, this.stypeFun1);

			this.changeActionButton2 = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "检测")));
			this.changeActionButton2.size(160, 40);
			this.changeActionButton2.labelBold = true;
			this.changeActionButton2.labelSize = 30;
			this.changeActionButton2.sizeGrid = "4,4,4,4";
			this.changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton2.pos(200, 400);
			this.changeActionButton2.on(Event.CLICK, this, this.stypeFun2);
		}));
	}

	stypeFun0(label:string = "射线模式") {
		this.castType++;
		this.castType %= 4;
		switch (this.castType) {
			case 0:
				this.changeActionButton0.label = "射线模式";
				break;
			case 1:
				this.changeActionButton0.label = "盒子模式";
				break;
			case 2:
				this.changeActionButton0.label = "球模式";
				break;
			case 3:
				this.changeActionButton0.label = "胶囊模式";
				break;
		}

		label = this.changeActionButton0.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});	

	}

	stypeFun1(label:string = "不穿透") {
		if (this.castAll) {
			this.changeActionButton1.label = "不穿透";
			this.castAll = false;
		} else {
			this.changeActionButton1.label = "穿透";
			this.castAll = true;
		}
		label = this.changeActionButton1.label;
		Client.instance.send({type:"next",btype:this.btype,stype:1,value:label});
	}

	stypeFun2(castType:number = 0) {
		if (this.hitResult.succeeded)
				((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResult.collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 1.0, 1.0, 1.0);

		if (this.hitResults.length > 0) {
			for (var i: number = 0, n: number = this.hitResults.length; i < n; i++)
				((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResults[i].collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 1.0, 1.0, 1.0);
			this.hitResults.length = 0;
		}

		if (this.debugSprites.length > 0) {
			for (i = 0, n = this.debugSprites.length; i < n; i++)
				this.debugSprites[i].destroy();
			this.debugSprites.length = 0;
		}


		switch (this.castType) {
			case 0:
				//创建线性射线
				var lineSprite: PixelLineSprite3D = (<PixelLineSprite3D>this.scene.addChild(new PixelLineSprite3D(1)));
				//设置射线的起始点和颜色
				lineSprite.addLine(this.from, this.to, Color.RED, Color.RED);
				this.debugSprites.push(lineSprite);
				if (this.castAll) {
					//进行射线检测,检测所有碰撞的物体
					this.scene.physicsSimulation.raycastAllFromTo(this.from, this.to, this.hitResults);
					//遍历射线检测的结果
					for (i = 0, n = this.hitResults.length; i < n; i++)
						//将射线碰撞到的物体设置为红色
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResults[i].collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				} else {
					//进行射线检测,检测第一个碰撞物体
					this.scene.physicsSimulation.raycastFromTo(this.from, this.to, this.hitResult);
					//将检测到的物体设置为红色
					((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResult.collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				}
				break;
			case 1:
				//创建盒型碰撞器
				var boxCollider: BoxColliderShape = new BoxColliderShape(1.0, 1.0, 1.0);
				for (i = 0; i < 21; i++) {
					//创建进行射线检测的盒子精灵
					var boxSprite: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1.0, 1.0, 1.0))));
					//创建BlinnPhong材质
					var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
					//设置材质的颜色
					mat.albedoColor = this._albedoColor;
					//设置材质的渲染模式
					mat.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
					boxSprite.meshRenderer.material = mat;
					Vector3.lerp(this.from, this.to, i / 20, this._position);
					boxSprite.transform.localPosition = this._position;
					this.debugSprites.push(boxSprite);
				}
				//使用盒型碰撞器进行形状检测
				if (this.castAll) {
					//进行形状检测,检测所有碰撞的物体
					this.scene.physicsSimulation.shapeCastAll(boxCollider, this.from, this.to, this.hitResults);
					//遍历检测到的所有物体，并将其设置为红色
					for (i = 0, n = this.hitResults.length; i < n; i++)
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResults[i].collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				} else {
					//进行形状检测,检测第一个碰撞物体
					if (this.scene.physicsSimulation.shapeCast(boxCollider, this.from, this.to, this.hitResult))
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResult.collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				}
				break;
			case 2:
				//创建球型碰撞器
				var sphereCollider: SphereColliderShape = new SphereColliderShape(0.5);
				for (i = 0; i < 41; i++) {
					var sphereSprite: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.5))));
					var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
					mat.albedoColor = this._albedoColor;
					mat.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
					sphereSprite.meshRenderer.material = mat;
					Vector3.lerp(this.from, this.to, i / 40, this._position);
					sphereSprite.transform.localPosition = this._position;
					this.debugSprites.push(sphereSprite);
				}
				//使用球型碰撞器进行形状检测
				if (this.castAll) {
					//进行形状检测,检测所有碰撞的物体
					this.scene.physicsSimulation.shapeCastAll(sphereCollider, this.from, this.to, this.hitResults);
					for (i = 0, n = this.hitResults.length; i < n; i++)
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResults[i].collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				} else {
					//进行形状检测,检测第一个碰撞物体
					if (this.scene.physicsSimulation.shapeCast(sphereCollider, this.from, this.to, this.hitResult))
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResult.collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				}
				break;
			case 3:
				//创建胶囊型碰撞器
				var capsuleCollider: CapsuleColliderShape = new CapsuleColliderShape(0.25, 1.0);
				for (i = 0; i < 41; i++) {
					var capsuleSprite: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1.0))));
					var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
					mat.albedoColor = this._albedoColor;
					mat.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
					capsuleSprite.meshRenderer.material = mat;
					Vector3.lerp(this.from, this.to, i / 40, this._position);
					capsuleSprite.transform.localPosition = this._position;
					this.debugSprites.push(capsuleSprite);
				}
				//使用胶囊碰撞器进行形状检测
				if (this.castAll) {
					//进行形状检测,检测所有碰撞的物体
					this.scene.physicsSimulation.shapeCastAll(capsuleCollider, this.from, this.to, this.hitResults);
					for (i = 0, n = this.hitResults.length; i < n; i++)
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResults[i].collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				} else {
					//进行形状检测,检测第一个碰撞物体
					if (this.scene.physicsSimulation.shapeCast(capsuleCollider, this.from, this.to, this.hitResult))
						((<BlinnPhongMaterial>((<MeshSprite3D>this.hitResult.collider.owner)).meshRenderer.sharedMaterial)).albedoColor = new Color(1.0, 0.0, 0.0, 1.0);
				}
				break;
		}

		castType = this.castType;
		Client.instance.send({type:"next",btype:this.btype,stype:2,value:castType});
	}

	addBox(): void {
		var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat1.albedoTexture = tex;
		}));
		//随机生成盒子的位置
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		//创建盒子 MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//设置盒子的材质
		box.meshRenderer.material = mat1;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//创建盒型碰撞器
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		//设置碰撞器的形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}

	addCapsule(): void {
		var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat.albedoTexture = tex;
		}));

		//随机生成胶囊的半径和高度
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//创建胶囊MeshSprite3D精灵
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		//为胶囊精灵设置材质
		capsule.meshRenderer.material = mat;
		var transform: Transform3D = capsule.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		//创建胶囊型碰撞器
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		//设置碰撞器的形状
		rigidBody.colliderShape = sphereShape;
		//设置刚体的质量
		rigidBody.mass = 10;
	}
}

