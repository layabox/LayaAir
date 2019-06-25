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
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class PhysicsWorld_Kinematic {
    constructor() {
        this.translateW = new Vector3(0, 0, -0.2);
        this.translateS = new Vector3(0, 0, 0.2);
        this.translateA = new Vector3(-0.2, 0, 0);
        this.translateD = new Vector3(0.2, 0, 0);
        this.translateQ = new Vector3(-0.01, 0, 0);
        this.translateE = new Vector3(0.01, 0, 0);
        Laya3D.init(0, 0, null);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(new Vector3(0, 8, 20));
        this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        this.camera.clearColor = null;
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, 1.0));
        directionLight.transform.worldMatrix = mat;
        this.mat1 = new BlinnPhongMaterial();
        this.mat3 = new BlinnPhongMaterial();
        //加载纹理资源
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            this.mat1.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            this.mat3.albedoTexture = tex;
        }));
        this.plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
        this.plane.meshRenderer.material = planeMat;
        var rigidBody = this.plane.addComponent(PhysicsCollider);
        var boxShape = new BoxColliderShape(20, 0, 20);
        rigidBody.colliderShape = boxShape;
        for (var i = 0; i < 60; i++) {
            this.addBox();
            this.addCapsule();
        }
        this.addKinematicSphere();
    }
    addKinematicSphere() {
        var mat2 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            mat2.albedoTexture = tex;
        }));
        var albedoColor = mat2.albedoColor;
        albedoColor.setValue(1.0, 0.0, 0.0, 1.0);
        mat2.albedoColor = albedoColor;
        var radius = 0.8;
        var sphere = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius)));
        sphere.meshRenderer.material = mat2;
        var pos = sphere.transform.position;
        pos.setValue(0, 0.8, 0);
        sphere.transform.position = pos;
        //创建刚体碰撞器
        var rigidBody = sphere.addComponent(Rigidbody3D);
        //创建球型碰撞器
        var sphereShape = new SphereColliderShape(radius);
        //设置刚体碰撞器的形状为球型
        rigidBody.colliderShape = sphereShape;
        //设置刚体为Kinematic，仅可通过transform属性移动物体
        rigidBody.isKinematic = true;
        //rigidBody.detectCollisions = false;
        this.kinematicSphere = sphere;
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
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        box.meshRenderer.material = this.mat1;
        var transform = box.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
        transform.position = pos;
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        var rigidBody = box.addComponent(Rigidbody3D);
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        rigidBody.colliderShape = boxShape;
        rigidBody.mass = 10;
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
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        var rigidBody = capsule.addComponent(Rigidbody3D);
        var sphereShape = new CapsuleColliderShape(raidius, height);
        rigidBody.colliderShape = sphereShape;
        rigidBody.mass = 10;
    }
}
