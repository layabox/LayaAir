import { Laya } from 'Laya.js';
import { Laya3D } from 'Laya3D.js';
import { delay } from './delay.js';
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Camera } from "laya/d3/core/Camera";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { CameraMoveScript } from "./utils/CameraMoveScript";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from 'laya/utils/Handler.js';
import { getResPath } from './resPath.js';

export class Main {
    scene:Scene3D;
    mat1:BlinnPhongMaterial;
	constructor() {
        Laya3D.init(1800,1020);
        Laya.stage.screenMode = 'none';
        this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

        this.mat1 = new BlinnPhongMaterial();
		//加载纹理资源
		Texture2D.load(getResPath("threeDimen/Physics/rocks.jpg"), Handler.create(this, function (tex: Texture2D): void {
			this.mat1.albedoTexture = tex;
		}));
        
        this.test1();
    }
    
    async test1(){
        //camera
		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 6, 9.5));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
		camera.clearColor = null;

        //light
		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		directionLight.color = new Vector3(0.6, 0.6, 0.6);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, -1.0));
		directionLight.transform.worldMatrix = mat;

        var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10))));
		var planeMtl: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load(getResPath("threeDimen/Physics/grass.png"), Handler.create(this, function (tex: Texture2D): void {
			planeMtl.albedoTexture = tex;
		}));
		//设置纹理平铺和偏移
		var tilingOffset: Vector4 = planeMtl.tilingOffset;
		tilingOffset.setValue(5, 5, 0, 0);
		planeMtl.tilingOffset = tilingOffset;
		//设置材质
		plane.meshRenderer.material = planeMtl;
        
        var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
        planeStaticCollider.colliderShape = new BoxColliderShape(10, 0, 10);
        planeStaticCollider.friction = 2;
        planeStaticCollider.restitution = 0.3;

        let sy=0;
        this.addBox(1,1,1,0,sy,0); sy+=3;
        this.addBox(1,1,1,0,sy,0); sy+=3;
        this.addBox(1,1,1,0,sy,0); sy+=3;
        this.addBox(1,1,1,0,sy,0); sy+=3;

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }

    addBox(sx:number, sy:number, sz:number, x:number, y:number,z:number){
        var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sx, sy, sz))));
		box.meshRenderer.material = this.mat1;
		var transform = box.transform;
		var pos = transform.position;
		pos.setValue(x,y,z);
		transform.position = pos;
		//设置欧拉角
		var rotationEuler = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		//transform.rotationEuler = rotationEuler;
		//创建刚体碰撞器
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//创建盒子形状碰撞器
		var boxShape = new BoxColliderShape(sx,sy,sz);
		//设置盒子的碰撞形状
		rigidBody.colliderShape = boxShape;
		//设置刚体的质量
		rigidBody.mass = 10;
    }
}

//激活启动类
new Main();
