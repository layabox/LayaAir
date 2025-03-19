/**
description
 模拟物理桥梁场景，通过点击创建小球并向桥梁发射
 */
import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { RevoluteJoint } from "laya/physics/Joint/RevoluteJoint";
import { RigidBody } from "laya/physics/RigidBody";
import { Label } from "laya/ui/Label";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { Vector2 } from "laya/maths/Vector2";
import { Physics2D } from "laya/physics/Physics2D";
import { Physics2DOption } from "laya/physics/Physics2DOption";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit } from "laya/physics/Factory/IPhysics2DFactory";
import { StaticCollider } from "laya/physics/StaticCollider";
import { ChainShape } from "laya/physics/Shape/ChainShape";
import { BoxShape } from "laya/physics/Shape/BoxShape";
import { PolygonShape } from "laya/physics/Shape/PolygonShape";
import { CircleShape } from "laya/physics/Shape/CircleShape";
import { ColliderBase } from "laya/physics/Collider2D/ColliderBase";

export class Physics_Bridge_Shapes {
    Main: typeof Main = null;
    _scene: Scene;
    private ecount = 30;
    private label: Label;
    private TempVec: Vector2 = new Vector2();

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(1200, 700).then(() => {
            Stat.show();
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";
            Physics2D.I.start();
            this.createBridge();
            this.eventListener();
        });
    }

    createBridge() {
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);
        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);
        man.enableDebugDraw(true, EPhycis2DBlit.Joint);
        man.enableDebugDraw(true, EPhycis2DBlit.CenterOfMass);

        // ground
        const startPosX = 250, startPosY = 450;
        let ground = new Sprite();
        //静态
        let groundBody: StaticCollider = new StaticCollider();
        ground.addComponentInstance(groundBody);
        //形状一
        let chainShape = new ChainShape();
        chainShape.datas = [50, 600, 1050, 600];
        //形状二
        let boxShape = new BoxShape();
        boxShape.width = 100;
        boxShape.width = 50;
        let groundShapes = [];
        groundShapes.push(chainShape);
        groundShapes.push(boxShape);
        //shapes
        groundBody.shapes = groundShapes;
        this._scene.addChild(ground);

        //chain's left anchor
        let point1 = new Sprite();
        this._scene.addChild(point1);
        point1.pos(startPosX, startPosY);
        let pointRB1 = new StaticCollider();
        point1.addComponentInstance(pointRB1);
        let preBody = pointRB1;

        // bridge
        let width = 20, height = 2.5;
        for (let i = 0; i < this.ecount; i++) {
            let sp = new Sprite();
            this._scene.addChild(sp);
            sp.pos(startPosX + i * width, startPosY);
            let rb: RigidBody = sp.addComponent(RigidBody);
            let boxShape = new BoxShape();
            let shapes = [];
            shapes.push(boxShape);
            boxShape.width = width;
            boxShape.height = height;
            boxShape.density = 20;
            boxShape.friction = 0.2;
            boxShape.y = -height / 2;
            rb.shapes = shapes;
            let rj = new RevoluteJoint();
            rj.otherBody = preBody;
            sp.addComponentInstance(rj);
            (preBody as ColliderBase) = rb as ColliderBase;
        }

        let point2 = new Sprite();
        this._scene.addChild(point2);
        point2.pos(startPosX + this.ecount * width, startPosY);
        let pointRB2 = new StaticCollider();
        point2.addComponentInstance(pointRB2);

        let rj = new RevoluteJoint();
        rj.otherBody = preBody;
        point2.addComponentInstance(rj);

        for (let i = 0; i < 2; i++) {
            let sp = new Sprite();
            this._scene.addChild(sp);
            sp.pos(350 + 100 * i, 300);
            let rb: RigidBody = sp.addComponent(RigidBody);
            rb.bullet = true;
            let polyShape = new PolygonShape();
            polyShape.datas = [-10, 0, 10, 0, 0, 30];
            polyShape.density = 1.0;
            let shapes = []
            shapes.push(polyShape);
            rb.shapes = shapes;
        }

        for (let i = 0; i < 2; i++) {
            let sp = new Sprite();
            this._scene.addChild(sp);
            sp.pos(400 + 150 * i, 350);
            let rb: RigidBody = sp.addComponent(RigidBody);
            rb.bullet = true;
            let circleShape = new CircleShape();
            circleShape.radius = 10;
            rb.shapes = [circleShape];
        }
    }

    eventListener() {
        // 单击产生新的小球刚体
        Laya.stage.on(Event.CLICK, this, () => {
            let tempVec = this.TempVec;
            let targetX = 300 + Math.random() * 400, targetY = 500;
            let newBall = new Sprite();
            this._scene.addChild(newBall);
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            circleBody.bullet = true;

            let circleShape = new CircleShape();
            let shapes = [circleShape];
            circleShape.radius = 5;
            circleShape.x = Laya.stage.mouseX;
            circleShape.y = Laya.stage.mouseY;

            tempVec.x = targetX - circleShape.x;
            tempVec.y = targetY - circleShape.y;
            Vector2.normalize(tempVec, tempVec);
            Vector2.scale(tempVec, 25, tempVec);
            Vector2.scale(tempVec, Physics2DOption.pixelRatio, tempVec);
            circleBody.shapes = shapes;
            circleBody.linearVelocity = tempVec;
            Laya.timer.frameOnce(120, this, function () {
                newBall.destroy();
            });
        });

        let label: Label = this.label = Laya.stage.addChild(new Label("单击屏幕产生新的小球刚体，击向bridge的随机位置")) as Label;
        label.top = 20;
        label.right = 20;
        label.fontSize = 16;
        label.color = "#e69999";
    }

    dispose() {
        Laya.stage.offAll(Event.CLICK);
        Laya.stage.removeChild(this.label);
    }
}