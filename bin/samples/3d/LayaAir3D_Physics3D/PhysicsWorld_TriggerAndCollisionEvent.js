import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class PhysicsWorld_TriggerAndCollisionEvent {
    constructor() {
        this.translateW = new Vector3(0, 0, -0.2);
        this.translateS = new Vector3(0, 0, 0.2);
        this.translateA = new Vector3(-0.2, 0, 0);
        this.translateD = new Vector3(0.2, 0, 0);
        this.translateQ = new Vector3(-0.01, 0, 0);
        this.translateE = new Vector3(0.01, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this.scene = new Scene3D();
        Laya.stage.addChild(this.scene);
        //创建相机
        this.camera = new Camera(0, 0.1, 100);
        this.scene.addChild(this.camera);
        this.camera.transform.translate(new Vector3(0, 8, 18));
        this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        this.camera.clearColor = null;
        //创建相机
        var directionLight = new DirectionLight();
        this.scene.addChild(directionLight);
        directionLight.color = new Vector3(1, 1, 1);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, 1.0));
        directionLight.transform.worldMatrix = mat;
        //创建地面
        this.plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10)));
        //创建BlinnPhong材质
        var planeMat = new BlinnPhongMaterial();
        //加载纹理
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        //设置材质
        planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
        this.plane.meshRenderer.material = planeMat;
        //创建物理碰撞
        var staticCollider = this.plane.addComponent(PhysicsCollider);
        //创建盒型碰撞器
        var boxShape = new BoxColliderShape(20, 0, 20);
        //为物理碰撞设置碰撞形状
        staticCollider.colliderShape = boxShape;
        //创建运动学物体
        this.addKinematicSphere();
        for (var i = 0; i < 30; i++) {
            this.addBoxAndTrigger();
            this.addCapsuleCollision();
        }
    }
    addKinematicSphere() {
        //创建BlinnPhong材质
        var mat2 = new BlinnPhongMaterial();
        //加载纹理
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            mat2.albedoTexture = tex;
        }));
        //设置材质反照率颜色
        mat2.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
        //创建球型MeshSprite3D
        var radius = 0.8;
        var sphere = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius)));
        sphere.meshRenderer.material = mat2;
        var pos = sphere.transform.position;
        pos.setValue(0, 0.8, 0);
        sphere.transform.position = pos;
        //创建刚体碰撞器
        var rigidBody = sphere.addComponent(Rigidbody3D);
        //创建球形碰撞器
        var sphereShape = new SphereColliderShape(radius);
        //设置刚体碰撞器的碰撞形状为球形
        rigidBody.colliderShape = sphereShape;
        //设置刚体的质量
        rigidBody.mass = 60;
        //设置刚体为运动学，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
        rigidBody.isKinematic = true;
        this.kinematicSphere = sphere;
        //开始始终循环，定时重复执行(基于帧率)，第一个参数为间隔帧数。
        Laya.timer.frameLoop(1, this, this.onKeyDown);
    }
    onKeyDown() {
        KeyBoardManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW); //W
        KeyBoardManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS); //S
        KeyBoardManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA); //A
        KeyBoardManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD); //D
        KeyBoardManager.hasKeyDown(81) && this.plane.transform.translate(this.translateQ); //Q
        KeyBoardManager.hasKeyDown(69) && this.plane.transform.translate(this.translateE); //E
    }
    addBoxAndTrigger() {
        //创建BlinnPhong材质
        var mat1 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            mat1.albedoTexture = tex;
        }));
        //设置反照率颜色
        mat1.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        //随机生成坐标
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        //创建盒型MeshSprite3D
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        //设置材质
        box.meshRenderer.material = mat1;
        var transform = box.transform;
        //设置位置
        var pos = transform.position;
        pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
        transform.position = pos;
        //设置欧拉角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(0, Math.random() * 360, 0);
        transform.rotationEuler = rotationEuler;
        //创建物理碰撞器
        var staticCollider = box.addComponent(PhysicsCollider); //StaticCollider可与非Kinematic类型RigidBody3D产生碰撞
        //创建盒型碰撞器
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        staticCollider.colliderShape = boxShape;
        //标记为触发器,取消物理反馈
        staticCollider.isTrigger = true;
        //添加触发器组件脚本
        var script = box.addComponent(TriggerCollisionScript);
        script.kinematicSprite = this.kinematicSphere;
    }
    addCapsuleCollision() {
        var mat3 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            mat3.albedoTexture = tex;
        }));
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        var capsule = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height)));
        capsule.meshRenderer.material = mat3;
        var transform = capsule.transform;
        //设置位置
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
        transform.position = pos;
        //设置欧拉角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        var rigidBody = capsule.addComponent(Rigidbody3D); //Rigidbody3D可与StaticCollider和RigidBody3D产生碰撞
        var sphereShape = new CapsuleColliderShape(raidius, height);
        rigidBody.colliderShape = sphereShape;
        rigidBody.mass = 10;
        var script = capsule.addComponent(TriggerCollisionScript);
        script.kinematicSprite = this.kinematicSphere;
    }
    addSphere() {
        var mat2 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            mat2.albedoTexture = tex;
        }));
        var radius = Math.random() * 0.2 + 0.2;
        var sphere = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius)));
        sphere.meshRenderer.material = mat2;
        var pos = sphere.transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        sphere.transform.position = pos;
        var rigidBody = sphere.addComponent(Rigidbody3D);
        var sphereShape = new SphereColliderShape(radius);
        rigidBody.colliderShape = sphereShape;
        rigidBody.mass = 10;
    }
}
class TriggerCollisionScript extends Script3D {
    constructor() {
        super();
    }
    //开始触发时执行
    /*override*/ onTriggerEnter(other) {
        this.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(0.0, 1.0, 0.0, 1.0);
        console.log("onTriggerEnter");
    }
    //持续触发时执行
    /*override*/ onTriggerStay(other) {
        console.log("onTriggerStay");
    }
    //结束触发时执行
    /*override*/ onTriggerExit(other) {
        this.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        console.log("onTriggerExit");
    }
    //开始碰撞时执行
    /*override*/ onCollisionEnter(collision) {
        if (collision.other.owner === this.kinematicSprite)
            this.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(0.0, 0.0, 0.0, 1.0);
    }
    //持续碰撞时执行
    /*override*/ onCollisionStay(collision) {
    }
    //结束碰撞时执行
    /*override*/ onCollisionExit(collision) {
    }
}
