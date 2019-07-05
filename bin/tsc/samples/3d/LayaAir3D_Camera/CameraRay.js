import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
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
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author zqx
 */
export class CameraRay {
    constructor() {
        this._outHitResult = new HitResult();
        this.outs = [];
        this.posX = 0.0;
        this.posY = 0.0;
        this.point = new Vector2();
        this._text = new Text();
        this._translate = new Vector3(0, 6, 9.5);
        this._rotation = new Vector3(-15, 0, 0);
        this._forward = new Vector3(-1.0, -1.0, -1.0);
        this._tilingOffset = new Vector4(10, 10, 0, 0);
        this.tmpVector = new Vector3(0, 0, 0);
        this.tmpVector2 = new Vector3(0, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        //初始化照相机
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(this._translate);
        this.camera.transform.rotate(this._rotation, true, false);
        this.camera.addComponent(CameraMoveScript);
        this.camera.clearColor = null;
        //方向光
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color.setValue(0.6, 0.6, 0.6);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(this._forward);
        directionLight.transform.worldMatrix = mat;
        //平面
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/grass.png", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        //设置纹理平铺和偏移
        planeMat.tilingOffset = this._tilingOffset;
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
        //添加鼠标事件
        this.addMouseEvent();
        //射线初始化（必须初始化）
        this._ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    }
    addBoxXYZ(x, y, z) {
        var mat1 = new BlinnPhongMaterial();
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            mat1.albedoTexture = tex;
        }));
        //随机生成坐标值
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        //创建盒型MeshSprite3D
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        //设置材质
        box.meshRenderer.material = mat1;
        this.tmpVector.setValue(x, y, z);
        box.transform.position = this.tmpVector;
        //设置欧拉角
        this.tmpVector2.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        box.transform.rotationEuler = this.tmpVector2;
        //创建刚体碰撞器
        var rigidBody = box.addComponent(Rigidbody3D);
        //创建盒子形状碰撞器
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        //设置盒子的碰撞形状
        rigidBody.colliderShape = boxShape;
        //设置刚体的质量
        rigidBody.mass = 10;
    }
    addMouseEvent() {
        //鼠标事件监听
        Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    onMouseDown() {
        this.posX = this.point.x = MouseManager.instance.mouseX;
        this.posY = this.point.y = MouseManager.instance.mouseY;
        //产生射线
        this.camera.viewportPointToRay(this.point, this._ray);
        //拿到射线碰撞的物体
        this.scene.physicsSimulation.rayCastAll(this._ray, this.outs);
        //如果碰撞到物体
        if (this.outs.length != 0) {
            for (var i = 0; i < this.outs.length; i++) {
                //在射线击中的位置添加一个立方体
                this.addBoxXYZ(this.outs[i].point.x, this.outs[i].point.y, this.outs[i].point.z);
            }
        }
    }
}
