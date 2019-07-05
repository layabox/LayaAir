import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author zqx
 */
export class PhysicsWorld_BaseCollider {
    constructor() {
        this.tmpVector = new Vector3(0, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        //初始化照相机
        var camera = this.scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(new Vector3(0, 6, 9.5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        camera.clearColor = null;
        //方向光
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(0.6, 0.6, 0.6);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;
        //平面
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        //设置纹理平铺和偏移
        var tilingOffset = planeMat.tilingOffset;
        tilingOffset.setValue(5, 5, 0, 0);
        planeMat.tilingOffset = tilingOffset;
        //设置材质
        plane.meshRenderer.material = planeMat;
        //平面添加物理碰撞体组件
        var planeStaticCollider = plane.addComponent(PhysicsCollider);
        //创建盒子形状碰撞器
        var planeShape = new BoxColliderShape(10, 0, 10);
        //物理碰撞体设置形状
        planeStaticCollider.colliderShape = planeShape;
        //物理碰撞体设置摩擦力
        planeStaticCollider.friction = 2;
        //物理碰撞体设置弹力
        planeStaticCollider.restitution = 0.3;
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
        //随机生成精灵
        this.randomAddPhysicsSprite();
    }
    randomAddPhysicsSprite() {
        Laya.timer.loop(1000, this, function () {
            var random = Math.floor(Math.random() * 5) % 5;
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
    addBox() {
        //随机生成坐标值
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        //创建盒型MeshSprite3D
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        //设置材质
        box.meshRenderer.material = this.mat1;
        var transform = box.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        //设置欧拉角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = box.addComponent(Rigidbody3D);
        //创建盒子形状碰撞器
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        //设置盒子的碰撞形状
        rigidBody.colliderShape = boxShape;
        //设置刚体的质量
        rigidBody.mass = 10;
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
    }
    addCapsule() {
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        //创建胶囊MeshSprite3D
        var capsule = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height)));
        //设置材质
        capsule.meshRenderer.material = this.mat3;
        var transform = capsule.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        //设置胶囊MeshSprite3D的欧拉角
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = capsule.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var sphereShape = new CapsuleColliderShape(raidius, height);
        //设置刚体碰撞器的形状
        rigidBody.colliderShape = sphereShape;
        //设置刚体碰撞器的质量
        rigidBody.mass = 10;
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
        var pos = cone.transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        cone.transform.position = pos;
        //创建刚体碰撞器
        var rigidBody = cone.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var coneShape = new ConeColliderShape(raidius, height);
        //设置刚体碰撞器的形状
        rigidBody.colliderShape = coneShape;
        //设置刚体碰撞器的质量
        rigidBody.mass = 10;
    }
    addCylinder() {
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        //创建圆锥MeshSprite3D
        var cylinder = new MeshSprite3D(PrimitiveMesh.createCylinder(raidius, height));
        this.scene.addChild(cylinder);
        //设置材质
        cylinder.meshRenderer.material = this.mat5;
        //设置位置
        var transform = cylinder.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        //设置圆柱MeshSprite3D的欧拉角
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
    }
}
