import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Color } from "laya/d3/math/Color";
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
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Texture2D } from "laya/resource/Texture2D";
export class PhysicsWorld_RayShapeCast {
    constructor() {
        //声明一些使用到的全局变量
        this.castType = 0;
        this.castAll = false;
        this.ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        this.hitResult = new HitResult();
        this.hitResults = [];
        this.debugSprites = [];
        //创建射线的起始点
        this.from = new Vector3(0, 1, 10);
        this.to = new Vector3(0, 1, -5);
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 0.5);
        this._position = new Vector3(0, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        //设置舞台
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this.scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        var camera = this.scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(new Vector3(0, 8, 20));
        camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        //为相机添加视角控制组件(脚本)
        camera.addComponent(CameraMoveScript);
        //添加平行光
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, 1.0));
        directionLight.transform.worldMatrix = mat;
        //添加地面
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10)));
        var planeMat = new BlinnPhongMaterial();
        //加载纹理
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            planeMat.albedoTexture = tex;
        }));
        //设置材质
        var tilingOffset = planeMat.tilingOffset;
        tilingOffset.setValue(2, 2, 0, 0);
        planeMat.tilingOffset = tilingOffset;
        plane.meshRenderer.material = planeMat;
        this.mat1 = new BlinnPhongMaterial();
        this.mat3 = new BlinnPhongMaterial();
        //加载纹理资源
        Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex) {
            this.mat1.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex) {
            this.mat3.albedoTexture = tex;
        }));
        //为地面创建物理碰撞器
        var planeBody = plane.addComponent(PhysicsCollider);
        //创建盒型碰撞器
        var boxCollider = new BoxColliderShape(20, 0, 20);
        //设置地面的碰撞器的形状为盒型
        planeBody.colliderShape = boxCollider;
        for (var i = 0; i < 60; i++) {
            this.addBox();
            this.addCapsule();
        }
        //创建按钮，以及绑定事件
        this.addButton(200, 200, 160, 40, "射线模式", function (e) {
            this.castType++;
            this.castType %= 4;
            switch (this.castType) {
                case 0:
                    e.target.label = "射线模式";
                    break;
                case 1:
                    e.target.label = "盒子模式";
                    break;
                case 2:
                    e.target.label = "球模式";
                    break;
                case 3:
                    e.target.label = "胶囊模式";
                    break;
            }
        });
        this.addButton(200, 300, 160, 40, "不穿透", function (e) {
            if (this.castAll) {
                e.target.label = "不穿透";
                this.castAll = false;
            }
            else {
                e.target.label = "穿透";
                this.castAll = true;
            }
        });
        this.addButton(200, 400, 160, 40, "检测", function (e) {
            if (this.hitResult.succeeded)
                this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
            if (this.hitResults.length > 0) {
                for (var i = 0, n = this.hitResults.length; i < n; i++)
                    this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
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
                    var lineSprite = this.scene.addChild(new PixelLineSprite3D(1));
                    //设置射线的起始点和颜色
                    lineSprite.addLine(this.from, this.to, Color.RED, Color.RED);
                    this.debugSprites.push(lineSprite);
                    if (this.castAll) {
                        //进行射线检测,检测所有碰撞的物体
                        this.scene.physicsSimulation.raycastAllFromTo(this.from, this.to, this.hitResults);
                        //遍历射线检测的结果
                        for (i = 0, n = this.hitResults.length; i < n; i++)
                            //将射线碰撞到的物体设置为红色
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        //进行射线检测,检测第一个碰撞物体
                        this.scene.physicsSimulation.raycastFromTo(this.from, this.to, this.hitResult);
                        //将检测到的物体设置为红色
                        this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 1:
                    //创建盒型碰撞器
                    var boxCollider = new BoxColliderShape(1.0, 1.0, 1.0);
                    for (i = 0; i < 21; i++) {
                        //创建进行射线检测的盒子精灵
                        var boxSprite = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1.0, 1.0, 1.0)));
                        //创建BlinnPhong材质
                        var mat = new BlinnPhongMaterial();
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
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        //进行形状检测,检测第一个碰撞物体
                        if (this.scene.physicsSimulation.shapeCast(boxCollider, this.from, this.to, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 2:
                    //创建球型碰撞器
                    var sphereCollider = new SphereColliderShape(0.5);
                    for (i = 0; i < 41; i++) {
                        var sphereSprite = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.5)));
                        var mat = new BlinnPhongMaterial();
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
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        //进行形状检测,检测第一个碰撞物体
                        if (this.scene.physicsSimulation.shapeCast(sphereCollider, this.from, this.to, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
                case 3:
                    //创建胶囊型碰撞器
                    var capsuleCollider = new CapsuleColliderShape(0.25, 1.0);
                    for (i = 0; i < 41; i++) {
                        var capsuleSprite = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1.0)));
                        var mat = new BlinnPhongMaterial();
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
                            this.hitResults[i].collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    else {
                        //进行形状检测,检测第一个碰撞物体
                        if (this.scene.physicsSimulation.shapeCast(capsuleCollider, this.from, this.to, this.hitResult))
                            this.hitResult.collider.owner.meshRenderer.sharedMaterial.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
                    }
                    break;
            }
        });
    }
    addButton(x, y, width, height, text, clickFun) {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            var changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", text));
            changeActionButton.size(width, height);
            changeActionButton.labelBold = true;
            changeActionButton.labelSize = 30;
            changeActionButton.sizeGrid = "4,4,4,4";
            changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            changeActionButton.pos(x, y);
            changeActionButton.on(Event.CLICK, this, clickFun);
        }));
    }
    addBox() {
        //随机生成盒子的位置
        var sX = Math.random() * 0.75 + 0.25;
        var sY = Math.random() * 0.75 + 0.25;
        var sZ = Math.random() * 0.75 + 0.25;
        //创建盒子 MeshSprite3D
        var box = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ)));
        //设置盒子的材质
        box.meshRenderer.material = this.mat1;
        var transform = box.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
        transform.position = pos;
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = box.addComponent(Rigidbody3D);
        //创建盒型碰撞器
        var boxShape = new BoxColliderShape(sX, sY, sZ);
        //设置碰撞器的形状
        rigidBody.colliderShape = boxShape;
        //设置刚体的质量
        rigidBody.mass = 10;
    }
    addCapsule() {
        //随机生成胶囊的半径和高度
        var raidius = Math.random() * 0.2 + 0.2;
        var height = Math.random() * 0.5 + 0.8;
        //创建胶囊MeshSprite3D精灵
        var capsule = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height)));
        //为胶囊精灵设置材质
        capsule.meshRenderer.material = this.mat3;
        var transform = capsule.transform;
        var pos = transform.position;
        pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
        transform.position = pos;
        var rotationEuler = transform.rotationEuler;
        rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        transform.rotationEuler = rotationEuler;
        //创建刚体碰撞器
        var rigidBody = capsule.addComponent(Rigidbody3D);
        //创建胶囊型碰撞器
        var sphereShape = new CapsuleColliderShape(raidius, height);
        //设置碰撞器的形状
        rigidBody.colliderShape = sphereShape;
        //设置刚体的质量
        rigidBody.mass = 10;
    }
}
