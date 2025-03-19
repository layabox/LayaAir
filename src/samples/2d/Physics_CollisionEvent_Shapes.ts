/**
description
 演示物理碰撞传感器和刚体交互的2D物理效果
 */
import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { MouseJoint } from "laya/physics/joint/MouseJoint";
import { RigidBody } from "laya/physics/RigidBody";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { ColliderBase } from "laya/physics/Collider2D/ColliderBase";
import { Vector2 } from "laya/maths/Vector2";
import { Physics2D } from "laya/physics/Physics2D";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit } from "laya/physics/factory/IPhysics2DFactory";
import { ChainShape } from "laya/physics/Shape/ChainShape";
import { CircleShape } from "laya/physics/Shape/CircleShape";
import { StaticCollider } from "laya/physics/StaticCollider";

export class Physics_CollisionEvent_Shapes {
    Main: typeof Main = null;
    private count: number = 7;
    private sensorCollider: ColliderBase;
    private bodys: Array<any> = [];
    private touching: Array<boolean> = [];
    _scene: Scene;
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
            this.createSensor();
        });
    }

    createSensor() {
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);
        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);
        man.enableDebugDraw(true, EPhycis2DBlit.Joint);
        let ground = new Sprite();
        ground.name = "ground";
        this._scene.addChild(ground);
        let groundBody: StaticCollider = new StaticCollider();
        ground.addComponentInstance(groundBody);

        let chainShape = new ChainShape();
        chainShape.datas = [50, 400, 50, 600, 1050, 600, 1050, 400];
        groundBody.shapes = [chainShape];

        let sensor = new Sprite();
        sensor.pos(450, 300);
        sensor.name = "sensor";
        this._scene.addChild(sensor);
        let sensorCol: StaticCollider = sensor.addComponent(StaticCollider);

        let circleShape = new CircleShape();
        circleShape.isSensor = true;
        circleShape.radius = 100;
        sensorCol.shapes = [circleShape];

        this.sensorCollider = sensorCol;

        for (let i = 0, len = this.count; i < len; i++) {
            let sp = new Sprite();
            sp.name = "ball" + i;
            this._scene.addChild(sp);
            sp.pos(350 + i * 50, 200).size(40, 40);
            let rb: RigidBody = sp.addComponent(RigidBody);
            this.bodys.push(rb);
            this.touching[i] = false;
            rb.getBody().GetUserData().pointer = i;
            let circleShape = new CircleShape();
            circleShape.radius = 20;
            circleShape.x = circleShape.y = 20;
            rb.shapes = [circleShape];
            sp.addComponent(MouseJoint);


            sp.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
            sp.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        }

        Laya.physicsTimer.frameLoop(1, this, this.onTriggerStay);
    }

    onTriggerEnter(colliderB: ColliderBase, colliderA: ColliderBase, contact) {
        if (colliderB === this.sensorCollider) {
            console.log("onTriggerEnter");
            let bodyB: RigidBody = colliderA.owner.getComponent(RigidBody);
            let index = bodyB.getBox2DBody().GetUserData().pointer;
            this.touching[index] = true;
        }
    }

    onTriggerStay() {
        // 遍历所有刚体
        let bodys = this.bodys, body: RigidBody;
        for (let i = 0, len = this.count; i < len; i++) {
            body = bodys[i];
            if (!this.touching[i]) {
                continue;
            }
            let bodyA: StaticCollider = this.sensorCollider.owner.getComponent(StaticCollider);
            let bodyB: RigidBody = body.owner.getComponent(RigidBody);
            let position = bodyB.getWorldCenter();
            let center = bodyA.getWorldPoint(this.sensorCollider.x, this.sensorCollider.y)
            let x = center.x - position.x;
            let y = center.y - position.y;
            let vec: Vector2 = new Vector2(x, y);
            if (Vector2.scalarLength(vec) < 1E-5) {
                continue;
            }

            Vector2.normalize(vec, vec);
            bodyB.applyForce(position, {
                x: vec.x * 100,
                y: vec.y * 100
            });
        }
    }

    onTriggerExit(colliderB: ColliderBase, colliderA: ColliderBase, contact) {
        if (colliderB === this.sensorCollider) {
            console.log("onTriggerExit");
            let bodyB: RigidBody = colliderA.owner.getComponent(RigidBody);
            let index = bodyB.getBody().GetUserData().pointer;
            this.touching[index] = false;
        }
    }

    dispose() {
        let sensor = this.sensorCollider.owner;
        sensor.off(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        sensor.off(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        Laya.physicsTimer.clearAll(this);
    }
}