import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CompoundColliderShape } from "laya/d3/physics/shape/CompoundColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Texture2D } from "laya/resource/Texture2D";
export class PhysicsWorld_CompoundCollider {
    constructor() {
        this.tmpVector = new Vector3(0, 0, 0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(new Vector3(5.2, 4, 5.2));
        this.camera.transform.rotate(new Vector3(-25, 45, 0), true, false);
        this.camera.addComponent(CameraMoveScript);
        this.camera.clearColor = null;
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, 1.0));
        directionLight.transform.worldMatrix = mat;
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(13, 13, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        planeMat.tilingOffset = new Vector4(10, 10, 0, 0);
        planeMat.shininess = 1;
        plane.meshRenderer.material = planeMat;
        plane.meshRenderer.receiveShadow = true;
        var staticCollider = plane.addComponent(PhysicsCollider);
        var planeShape = new BoxColliderShape(13, 0, 13);
        staticCollider.colliderShape = planeShape;
        staticCollider.friction = 2;
        this.randomAddPhysicsSprite();
    }
    randomAddPhysicsSprite() {
        Laya.timer.loop(1000, this, function () {
            var random = Math.floor(Math.random() * 2) % 2;
            switch (random) {
                case 0:
                    this.addTable();
                    break;
                case 1:
                    this.addObject();
                    break;
                default:
                    break;
            }
        });
    }
    addTable() {
        var mat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            mat.albedoTexture = tex;
        }));
        mat.shininess = 1;
        Mesh.load("res/threeDimen/Physics/table.lm", Handler.create(this, function (mesh) {
            var table = this.scene.addChild(new MeshSprite3D(mesh));
            table.meshRenderer.material = mat;
            var transform = table.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var scale = transform.scale;
            scale.setValue(3, 3, 3);
            transform.scale = scale;
            var rigidBody = table.addComponent(Rigidbody3D);
            rigidBody.mass = 10;
            rigidBody.friction = 1;
            var compoundShape = new CompoundColliderShape();
            var boxShape = new BoxColliderShape(0.5, 0.4, 0.045);
            var localOffset = boxShape.localOffset;
            localOffset.setValue(0, 0, 0.125);
            boxShape.localOffset = localOffset;
            compoundShape.addChildShape(boxShape);
            var boxShape1 = new BoxColliderShape(0.1, 0.1, 0.3);
            boxShape1.localOffset = new Vector3(-0.2, -0.148, -0.048);
            compoundShape.addChildShape(boxShape1);
            var boxShape2 = new BoxColliderShape(0.1, 0.1, 0.3);
            var localOffset2 = boxShape2.localOffset;
            localOffset2.setValue(0.2, -0.148, -0.048);
            boxShape2.localOffset = localOffset2;
            compoundShape.addChildShape(boxShape2);
            var boxShape3 = new BoxColliderShape(0.1, 0.1, 0.3);
            var localOffset3 = boxShape3.localOffset;
            localOffset3.setValue(-0.2, 0.153, -0.048);
            boxShape3.localOffset = localOffset3;
            compoundShape.addChildShape(boxShape3);
            var boxShape4 = new BoxColliderShape(0.1, 0.1, 0.3);
            var localOffset4 = boxShape4.localOffset;
            localOffset4.setValue(0.2, 0.153, -0.048);
            boxShape4.localOffset = localOffset3;
            compoundShape.addChildShape(boxShape4);
            rigidBody.colliderShape = compoundShape;
        }));
    }
    addObject() {
        var mat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            mat.albedoTexture = tex;
        }));
        Mesh.load("res/threeDimen/Physics/object.lm", Handler.create(this, function (mesh) {
            var object = this.scene.addChild(new MeshSprite3D(mesh));
            var transform = object.transform;
            var pos = transform.position;
            pos.setValue(Math.random() * 4 - 2, 5, Math.random() * 4 - 2);
            transform.position = pos;
            var rotationEuler = transform.rotationEuler;
            rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            transform.rotationEuler = rotationEuler;
            var scale = transform.scale;
            scale.setValue(0.01, 0.01, 0.01);
            transform.scale = scale;
            object.meshRenderer.material = mat;
            var rigidBody = object.addComponent(Rigidbody3D);
            rigidBody.mass = 3;
            rigidBody.friction = 0.3;
            var compoundShape = new CompoundColliderShape();
            var boxShape = new BoxColliderShape(40, 40, 40);
            var boxLocalOffset = boxShape.localOffset;
            boxLocalOffset.setValue(0, 0, -20);
            boxShape.localOffset = boxLocalOffset;
            compoundShape.addChildShape(boxShape);
            var sphereShape = new SphereColliderShape(25);
            var sphereLocalOffset = sphereShape.localOffset;
            sphereLocalOffset.setValue(0, 0, 24);
            sphereShape.localOffset = sphereLocalOffset;
            compoundShape.addChildShape(sphereShape);
            rigidBody.colliderShape = compoundShape;
        }));
    }
}
