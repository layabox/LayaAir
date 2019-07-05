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
import { MeshColliderShape } from "laya/d3/physics/shape/MeshColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author wzy
 */
export class PhysicsWorld_MeshCollider {
    constructor() {
        this.tmpVector = new Vector3(0, 0, 0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
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
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(0.0, -0.8, -1.0));
        directionLight.transform.worldMatrix = mat;
        directionLight.color = new Vector3(1, 1, 1);
        this.mat1 = new BlinnPhongMaterial();
        this.mat2 = new BlinnPhongMaterial();
        this.mat3 = new BlinnPhongMaterial();
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
        Laya.loader.create(["res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png"], Handler.create(this, this.complete));
    }
    complete() {
        var mesh = Loader.getRes("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard-lizard_geo.lm");
        var albedo = Loader.getRes("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_diff.png");
        var normal = Loader.getRes("res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png");
        var mat = new BlinnPhongMaterial();
        mat.specularColor = new Vector4(0.5, 0.5, 0.5, 0.5);
        mat.albedoTexture = albedo;
        mat.normalTexture = normal;
        var lizard = this.scene.addChild(new MeshSprite3D(mesh));
        lizard.transform.localPosition = new Vector3(-2, 0, 0);
        lizard.transform.localScale = new Vector3(0.01, 0.01, 0.01);
        lizard.meshRenderer.material = mat;
        var lizardCollider = lizard.addComponent(PhysicsCollider);
        var meshShape = new MeshColliderShape();
        meshShape.mesh = mesh;
        lizardCollider.colliderShape = meshShape;
        lizardCollider.friction = 2;
        lizardCollider.restitution = 0.3;
        var lizard1 = this.scene.addChild(new MeshSprite3D(mesh));
        var transform = lizard1.transform;
        var localPosition = transform.localPosition;
        var localRotationEuler = transform.localRotationEuler;
        var localScale = transform.localScale;
        localPosition.setValue(3, 0, 0);
        localRotationEuler.setValue(0, 80, 0);
        localScale.setValue(0.01, 0.01, 0.01);
        transform.localPosition = localPosition;
        transform.localRotationEuler = localRotationEuler;
        transform.localScale = localScale;
        lizard1.meshRenderer.material = mat;
        var lizardCollider1 = lizard1.addComponent(PhysicsCollider);
        var meshShape1 = new MeshColliderShape();
        meshShape1.mesh = mesh;
        lizardCollider1.colliderShape = meshShape1;
        lizardCollider1.friction = 2;
        lizardCollider1.restitution = 0.3;
        this.randomAddPhysicsSprite();
    }
    randomAddPhysicsSprite() {
        Laya.timer.loop(1000, this, function () {
            var random = Math.floor(Math.random() * 3) % 3;
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
                default:
                    break;
            }
        });
    }
    addBox() {
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        box.meshRenderer.material = this.mat1;
        var transform = box.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        transform.position = pos;
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        var rigidBody = box.addComponent(Rigidbody3D);
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        rigidBody.colliderShape = boxShape;
        rigidBody.mass = 10;
    }
    addSphere() {
        var radius = Math.random() * 0.2 + 0.2;
        var sphere = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius)));
        sphere.meshRenderer.material = this.mat2;
        var pos = sphere.transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
        sphere.transform.position = pos;
        var rigidBody = sphere.addComponent(Rigidbody3D);
        var sphereShape = new SphereColliderShape(radius);
        rigidBody.colliderShape = sphereShape;
        rigidBody.mass = 10;
    }
    addCapsule() {
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        var capsule = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height)));
        capsule.meshRenderer.material = this.mat3;
        var transform = capsule.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
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
