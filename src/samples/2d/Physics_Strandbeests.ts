

import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";

import { DistanceJoint } from "laya/physics/joint/DistanceJoint";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { Physics } from "laya/physics/Physics";
import { RigidBody } from "laya/physics/RigidBody";
import { Label } from "laya/ui/Label";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { ChainCollider } from "laya/physics/Collider2D/ChainCollider";
import { CircleCollider } from "laya/physics/Collider2D/CircleCollider";
import { PolygonCollider } from "laya/physics/Collider2D/PolygonCollider";
import { BoxCollider } from "laya/physics/Collider2D/BoxCollider";

/**
 * 仿生兽
 */
export class Physics_Strandbeests {
    Main: typeof Main = null;
    private scale = 2.5;
    private pos: Array<number> = [500, 400];
    private m_offset: Array<number> = [0, -80 * this.scale];
    private pivot: Array<number> = [0, 8 * this.scale];
    private wheel: Sprite;
    private chassis: Sprite;
    private motorJoint: RevoluteJoint;
    private label: Label;

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Config.isAntialias = true;
        Laya.init(1200, 700).then(() => {
            Stat.show();
            Physics.enable();
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            Laya.stage.bgColor = "#232628";

            this.Construct();
            this.eventListener();
        });
    }

    Construct() {
        // Ground
        let ground = new Sprite();
        this.Main.box2D.addChild(ground);
        let rigidbody: RigidBody = new RigidBody();
        rigidbody.type = "static";
        ground.addComponentInstance(rigidbody);
        let chainCollider: ChainCollider = new ChainCollider();
        chainCollider.points = "50,200,50,570,1050,570,1050,200";
        ground.addComponentInstance(chainCollider);
        // Balls
        for (let i = 1; i <= 32; i++) {
            let small = new Sprite();
            small.pos(i * 30 + 50, 570 - 5 * this.scale);
            this.Main.box2D.addChild(small);
            let sBody: RigidBody = small.addComponent(RigidBody);
            let sCollider: CircleCollider = small.addComponent(CircleCollider);
            sCollider.radius = 2.5 * this.scale;
        }

        // Chassis
        let chassis: Sprite = this.chassis = new Sprite();
        chassis.pos(this.pos[0] + this.pivot[0] + this.m_offset[0], this.pos[1] + this.pivot[1] + this.m_offset[1]).size(50 * this.scale, 20 * this.scale);
        this.Main.box2D.addChild(chassis);
        let chassisBody: RigidBody = chassis.addComponent(RigidBody);
        chassisBody.group = -1;

        let chassisCollider: BoxCollider = chassis.addComponent(BoxCollider);
        chassisCollider.density = 1;
        chassisCollider.width = 50 * this.scale;
        chassisCollider.height = 20 * this.scale;
        chassisCollider.x = chassisCollider.width * -0.5;
        chassisCollider.y = chassisCollider.height * -0.5;

        // Circle
        let wheel = this.wheel = new Sprite();
        wheel.pos(chassis.x, chassis.y);
        this.Main.box2D.addChild(wheel);
        let wheelBody: RigidBody = wheel.addComponent(RigidBody);
        wheelBody.group = -1;

        let wheelCollider: CircleCollider = wheel.addComponent(CircleCollider);
        wheelCollider.density = 1;
        wheelCollider.radius = 16 * this.scale;



        // 转动关节
        let motorJoint: RevoluteJoint = this.motorJoint = new RevoluteJoint();
        motorJoint.otherBody = chassisBody;
        motorJoint.collideConnected = false;
        motorJoint.motorSpeed = 2.0;
        motorJoint.maxMotorTorque = 400.0;
        motorJoint.enableMotor = true;
        wheel.addComponentInstance(motorJoint);

        let wheelOriBody = wheelBody.getBody();
        let wheelAnchor = [chassis.x + this.pivot[0], chassis.y + this.pivot[1]];
        this.createLeg(-1, wheelAnchor);
        this.createLeg(1, wheelAnchor);


        wheelBody.setAngle(120.0 * Math.PI / 180.0);
        this.createLeg(-1.0, wheelAnchor);
        this.createLeg(1.0, wheelAnchor);

        wheelBody.setAngle(-120.0 * Math.PI / 180.0);
        this.createLeg(-1.0, wheelAnchor);
        this.createLeg(1.0, wheelAnchor);
    }

    createLeg(s: number, wheelAnchor) {
        const wheelBody: RigidBody = this.wheel.getComponent(RigidBody);
        const chassisBody: RigidBody = this.chassis.getComponent(RigidBody);

        const p1 = [54 * s * this.scale, -61 * -1 * this.scale];
        const p2 = [72 * s * this.scale, -12 * -1 * this.scale];
        const p3 = [43 * s * this.scale, -19 * -1 * this.scale];
        const p4 = [31 * s * this.scale, 8 * -1 * this.scale];
        const p5 = [60 * s * this.scale, 15 * -1 * this.scale];
        const p6 = [25 * s * this.scale, 37 * -1 * this.scale];

        let leg1 = new Sprite();
        leg1.pos(this.pos[0] + this.m_offset[0], this.pos[1] + this.m_offset[1] + 16 * this.scale); // TODO 这里的数值待优化
        this.Main.box2D.addChild(leg1);
        let legBody1: RigidBody = leg1.addComponent(RigidBody);
        legBody1.angularDamping = 10;
        legBody1.group = -1;

        let legCollider1: PolygonCollider = leg1.addComponent(PolygonCollider);
        legCollider1.density = 1;
        let leg2 = new Sprite();
        leg2.pos(this.pos[0] + this.m_offset[0] + p4[0], this.pos[1] + this.m_offset[1] + p4[1] + 16 * this.scale);
        this.Main.box2D.addChild(leg2);
        let legBody2: RigidBody = leg2.addComponent(RigidBody);
        legBody2.angularDamping = 10;
        legBody2.group = -1;

        let legCollider2: PolygonCollider = leg2.addComponent(PolygonCollider);
        legCollider2.density = 1;

        if (s > 0) {
            legCollider1.points = p1.concat(p2).concat(p3).join(",");
            legCollider2.points = [0, 0].concat(B2Math.SubVV(p5, p4)).concat(B2Math.SubVV(p6, p4)).join(",");
        } else {
            legCollider1.points = p1.concat(p3).concat(p2).join(",");
            legCollider2.points = [0, 0].concat(B2Math.SubVV(p6, p4)).concat(B2Math.SubVV(p5, p4)).join(",");
        }

        const dampingRatio: number = 0.5;
        const frequencyHz: number = 10.0;
        let distanceJoint1: DistanceJoint = new DistanceJoint();
        distanceJoint1.otherBody = legBody2;
        distanceJoint1.selfAnchor = p2;
        distanceJoint1.otherAnchor = B2Math.SubVV(p5, p4);
        distanceJoint1.frequency = frequencyHz;
        distanceJoint1.damping = dampingRatio;
        leg1.addComponentInstance(distanceJoint1);
        distanceJoint1.maxLength = distanceJoint1.minLength = distanceJoint1.length || Physics.I._factory.phyToLayaValue(distanceJoint1.joint.GetLength());

        let distanceJoint2: DistanceJoint = new DistanceJoint();
        distanceJoint2.otherBody = legBody2;
        distanceJoint2.selfAnchor = p3;
        distanceJoint2.frequency = frequencyHz;
        distanceJoint2.damping = dampingRatio;
        leg1.addComponentInstance(distanceJoint2);
        distanceJoint2.maxLength = distanceJoint2.minLength = distanceJoint2.length || Physics.I._factory.phyToLayaValue(distanceJoint2.joint.GetLength());

        let localAnchor = wheelBody.GetLocalPoint((this.pos[0] + this.m_offset[0]), this.pos[1] + this.m_offset[1]);
        let anchor = [-localAnchor.x, -localAnchor.y];

        let distanceJoint3: DistanceJoint = new DistanceJoint();
        distanceJoint3.selfAnchor = p3;
        distanceJoint3.otherBody = wheelBody;
        distanceJoint3.otherAnchor = anchor; // 因为有旋转，localAnchor很难计算，使用绝对位置换算
        distanceJoint3.frequency = frequencyHz;
        distanceJoint3.damping = dampingRatio;
        leg1.addComponentInstance(distanceJoint3);
        distanceJoint3.maxLength = distanceJoint3.minLength = distanceJoint3.length || Physics.I._factory.phyToLayaValue(distanceJoint3.joint.GetLength());

        let distanceJoint4: DistanceJoint = new DistanceJoint();
        distanceJoint4.selfAnchor = B2Math.SubVV(p6, p4);
        distanceJoint4.otherBody = wheelBody;
        distanceJoint4.otherAnchor = anchor;
        distanceJoint4.frequency = frequencyHz;
        distanceJoint4.damping = dampingRatio;
        leg2.addComponentInstance(distanceJoint4);
        distanceJoint4.maxLength = distanceJoint4.minLength = distanceJoint4.length || Physics.I._factory.phyToLayaValue(distanceJoint4.joint.GetLength());

        let revoluteJoint: RevoluteJoint = new RevoluteJoint();
        revoluteJoint.otherBody = legBody2;
        revoluteJoint.anchor = B2Math.AddVV(p4, this.pivot);
        revoluteJoint.collideConnected = false;
        this.chassis.addComponentInstance(revoluteJoint);
    }

    eventListener() {

        // 双击屏幕，仿生机器人向相反方向运动
        Laya.stage.on(Event.DOUBLE_CLICK, this, () => {
            this.motorJoint.motorSpeed = -this.motorJoint.motorSpeed;
        });

        // 单击产生新的小球刚体
        Laya.stage.on(Event.CLICK, this, () => {

            const chassisBody = this.chassis.getComponent(RigidBody);
            const chassisPos = chassisBody.getBody().GetPosition();
            let newBall = new Sprite();
            this.Main.box2D.addChild(newBall);
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            let circleCollider: CircleCollider = newBall.addComponent(CircleCollider);
            circleCollider.radius = 3 * this.scale;
            circleCollider.x = Laya.stage.mouseX;
            circleCollider.y = Laya.stage.mouseY;
            let circlePosx = Physics.I._factory.layaToPhyValue(circleCollider.x);
            let circlePosy = Physics.I._factory.layaToPhyValue(circleCollider.y);
            let velocityX = chassisPos.x - circlePosx;
            let velocityY = chassisPos.y - circlePosy;
            circleBody.linearVelocity = { "x": velocityX * 5, "y": velocityY * 5 };
            Laya.timer.frameOnce(120, this, function () {
                newBall.destroy();
            });
        });

        let label: Label = this.label = Laya.stage.addChild(new Label("双击屏幕，仿生机器人向相反方向运动\n单击产生新的小球刚体")) as Label;
        label.top = 20;
        label.right = 20;
        label.fontSize = 16;
        label.color = "#e69999";
    }

    dispose() {
        Laya.stage.offAll(Event.CLICK);
        Laya.stage.offAll(Event.DOUBLE_CLICK);
        Laya.stage.removeChild(this.label);
    }
}

class B2Math {
    static AddVV(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }

    static SubVV(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }
}