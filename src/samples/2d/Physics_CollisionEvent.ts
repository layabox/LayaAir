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
import { CircleCollider } from "laya/physics/Collider2D/CircleCollider";
import { ColliderBase } from "laya/physics/Collider2D/ColliderBase";
import { Vector2 } from "laya/maths/Vector2";
import { ChainCollider } from "laya/physics/Collider2D/ChainCollider";
import { Physics2D } from "laya/physics/Physics2D";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit } from "laya/physics/factory/IPhysics2DFactory";

export class Physics_CollisionEvent {
    Main: typeof Main = null;
    private count: number = 7;
    private sensorCollider: CircleCollider;
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

        this._scene.addChild(ground);
        let groundBody: RigidBody = new RigidBody();
        groundBody.type = "static";
        ground.addComponentInstance(groundBody);
        let chainCollider: ChainCollider = ground.addComponent(ChainCollider);
        chainCollider.datas = [50, 400, 50, 600, 1050, 600, 1050, 400];

        let sensorCollider: CircleCollider = this.sensorCollider = ground.addComponent(CircleCollider);
        sensorCollider.isSensor = true;
        sensorCollider.radius = 100;
        sensorCollider.x = 450;
        sensorCollider.y = 300;

        for (let i = 0, len = this.count; i < len; i++) {
            let sp = new Sprite();
            this._scene.addChild(sp);
            sp.pos(350 + i * 50, 200).size(40, 40);
            let rb: RigidBody = sp.addComponent(RigidBody);
            this.bodys.push(rb);
            this.touching[i] = false;
            rb.getBody().GetUserData().pointer = i;
            let circleCollider: CircleCollider = sp.addComponent(CircleCollider);
            circleCollider.radius = 20;
            circleCollider.x = circleCollider.y = 20;
            sp.addComponent(MouseJoint);
        }

        ground.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        ground.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        Laya.physicsTimer.frameLoop(1, this, this.onTriggerStay);
    }

    onTriggerEnter(colliderB: ColliderBase, colliderA: ColliderBase, contact) {
        if (colliderA === this.sensorCollider) {
            console.log("onTriggerEnter");
            let bodyB: RigidBody = colliderB.owner.getComponent(RigidBody);
            let index = bodyB.getBody().GetUserData().pointer;
            this.touching[index] = true;
        }
    }

    onTriggerStay() {
        console.log("onTriggerStay");
        // 遍历所有刚体
        let bodys = this.bodys, body: RigidBody;
        for (let i = 0, len = this.count; i < len; i++) {
            body = bodys[i];
            if (!this.touching[i]) {
                continue;
            }
            let bodyA: RigidBody = this.sensorCollider.owner.getComponent(RigidBody);
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
        console.log("onTriggerExit");
        if (colliderA === this.sensorCollider) {
            let bodyB: RigidBody = colliderB.owner.getComponent(RigidBody);
            let index = bodyB.getBody().GetUserData().pointer;
            this.touching[index] = false;
        }
    }

    dispose() {
        let ground = this.sensorCollider.owner;
        ground.off(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        ground.off(Event.TRIGGER_EXIT, this, this.onTriggerExit);
        Laya.physicsTimer.clearAll(this);
    }
}