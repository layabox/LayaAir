import { Laya } from "Laya";
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
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Physics3DUtils } from "laya/d3/utils/Physics3DUtils";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class PhysicsWorld_CollisionFiflter {
    constructor() {
        this.translateW = new Vector3(0, 0, -0.2);
        this.translateS = new Vector3(0, 0, 0.2);
        this.translateA = new Vector3(-0.2, 0, 0);
        this.translateD = new Vector3(0.2, 0, 0);
        this.translateQ = new Vector3(-0.01, 0, 0);
        this.translateE = new Vector3(0.01, 0, 0);
        this._albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
        this.tmpVector = new Vector3(0, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this.scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(new Vector3(0, 8, 18));
        this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        //设置相机的清除颜色
        this.camera.clearColor = null;
        //创建平行光
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, 1.0));
        directionLight.transform.worldMatrix = mat;
        this.mat1 = new BlinnPhongMaterial();
        this.mat2 = new BlinnPhongMaterial();
        this.mat3 = new BlinnPhongMaterial();
        this.mat4 = new BlinnPhongMaterial();
        this.mat5 = new BlinnPhongMaterial();
        //加载纹理资源
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            this.mat1.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            this.mat2.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            this.mat3.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/steel2.jpg", Handler.create(this, function (tex) {
            this.mat4.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/steel.jpg", Handler.create(this, function (tex) {
            this.mat5.albedoTexture = tex;
        }));
        //创建平面
        this.plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        //加载纹理
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        //设置材质
        planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
        this.plane.meshRenderer.material = planeMat;
        //为平面设置盒型碰撞器
        var staticCollider = this.plane.addComponent(PhysicsCollider);
        var boxShape = new BoxColliderShape(20, 0, 20);
        staticCollider.colliderShape = boxShape;
        this.addKinematicSphere();
        for (var i = 0; i < 20; i++) {
            this.addBox();
            this.addCapsule();
            this.addCone();
            this.addCylinder();
            this.addSphere();
        }
    }
    addKinematicSphere() {
        //创建BlinnPhong材质
        var mat2 = new BlinnPhongMaterial();
        //加载纹理
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            mat2.albedoTexture = tex;
        }));
        mat2.albedoColor = this._albedoColor;
        //创建一个球
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
        //设置刚体的碰撞形状
        rigidBody.colliderShape = sphereShape;
        //设置刚体的质量
        rigidBody.mass = 60;
        //设置当前刚体为运动学物体,仅可通过transform属性移动物体,而非其他力相关属性。
        rigidBody.isKinematic = true;
        //设置可以与其发生碰撞的碰撞组
        rigidBody.canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1 | Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3 | Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5; //只与自定义组135碰撞(如果多组采用位操作）
        this.kinematicSphere = sphere;
        //开启定时重复执行
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
    addBox() {
        //随机生成盒子的位置
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        //创建盒型MeshSprite3D
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        //设置材质
        box.meshRenderer.material = this.mat1;
        var transform = box.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
        transform.position = pos;
        //设置欧拉旋转角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(0, Math.random() * 360, 0);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = box.addComponent(Rigidbody3D);
        //创建盒型碰撞器
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        //设置刚体的碰撞形状
        rigidBody.colliderShape = boxShape;
        //设置刚体的质量
        rigidBody.mass = 10;
        //设置刚体所属的碰撞组
        rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1; //自定义组1
    }
    addCapsule() {
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        var capsule = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height)));
        capsule.meshRenderer.material = this.mat3;
        var transform = capsule.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
        transform.position = pos;
        //设置欧拉旋转角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        var rigidBody = capsule.addComponent(Rigidbody3D);
        var sphereShape = new CapsuleColliderShape(raidius, height);
        rigidBody.colliderShape = sphereShape;
        rigidBody.mass = 10;
        rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2; //自定义组2,会跳过碰撞
    }
    addCone() {
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        //创建圆锥MeshSprite3D
        var cone = new MeshSprite3D(PrimitiveMesh.createCone(raidius, height));
        this.scene.addChild(cone);
        //设置材质
        cone.meshRenderer.material = this.mat4;
        //设置位置
        var transform = cone.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        //创建刚体碰撞器
        var rigidBody = cone.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var coneShape = new ConeColliderShape(raidius, height);
        //设置刚体碰撞器的形状
        rigidBody.colliderShape = coneShape;
        //设置刚体碰撞器的质量
        rigidBody.mass = 10;
        rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3; //自定义组3
    }
    addCylinder() {
        var mat5 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/steel.jpg", Handler.create(this, function (tex) {
            mat5.albedoTexture = tex;
        }));
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        //创建圆锥MeshSprite3D
        var cylinder = new MeshSprite3D(PrimitiveMesh.createCylinder(raidius, height));
        this.scene.addChild(cylinder);
        //设置材质
        cylinder.meshRenderer.material = mat5;
        var transform = cylinder.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        //设置欧拉旋转角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = cylinder.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var cylinderShape = new CylinderColliderShape(raidius, height);
        //设置刚体碰撞器的形状
        rigidBody.colliderShape = cylinderShape;
        //设置刚体碰撞器的质量
        rigidBody.mass = 10;
        rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER4; //自定义组4
    }
    addSphere() {
        //随机生成半径大小
        var radius = Math.random() * 0.2 + 0.2;
        //创建球型MeshSprite3D
        var sphere = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius)));
        //设置材质
        sphere.meshRenderer.material = this.mat2;
        var pos = sphere.transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        sphere.transform.position = pos;
        //添加刚体碰撞器
        var rigidBody = sphere.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var sphereShape = new SphereColliderShape(radius);
        //设置刚体碰撞器的形状
        rigidBody.colliderShape = sphereShape;
        //设置刚体的质量
        rigidBody.mass = 10;
        rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5; //自定义组5
    }
}
