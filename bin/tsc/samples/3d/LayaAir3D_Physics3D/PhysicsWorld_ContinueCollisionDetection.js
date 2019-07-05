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
 * @author wzy
 */
export class PhysicsWorld_ContinueCollisionDetection {
    constructor() {
        this.tmpVector = new Vector3(0, 0, 0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        this.scene.physicsSimulation.gravity = new Vector3(0, -98.0, 0);
        //初始化照相机
        var camera = this.scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(new Vector3(0, 6, 9.5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        camera.clearColor = null;
        //方向光
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color.setValue(0.6, 0.6, 0.6);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;
        this.mat2 = new BlinnPhongMaterial();
        //加载纹理资源
        Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex) {
            this.mat2.albedoTexture = tex;
        }));
        //平面
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        var tilingOffset = planeMat.tilingOffset;
        tilingOffset.setValue(10, 10, 0, 0);
        planeMat.tilingOffset = tilingOffset;
        plane.meshRenderer.material = planeMat;
        var planeStaticCollider = plane.addComponent(PhysicsCollider);
        var planeShape = new BoxColliderShape(10, 0, 10);
        planeStaticCollider.colliderShape = planeShape;
        planeStaticCollider.friction = 2;
        planeStaticCollider.restitution = 0.3;
        Laya.timer.loop(200, this, function () {
            this.addSphere();
        });
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
        rigidBody.ccdSweptSphereRadius = radius;
        rigidBody.ccdMotionThreshold = 0.0001;
    }
}
