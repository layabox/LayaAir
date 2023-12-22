

import { Config } from "Config";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";

import { DistanceJoint } from "laya/physics/joint/DistanceJoint";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { Physics2D } from "laya/physics/Physics2D";
import { RigidBody } from "laya/physics/RigidBody";
import { Label } from "laya/ui/Label";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { ChainCollider } from "laya/physics/Collider2D/ChainCollider";
import { CircleCollider } from "laya/physics/Collider2D/CircleCollider";
import { PolygonCollider } from "laya/physics/Collider2D/PolygonCollider";
import { BoxCollider } from "laya/physics/Collider2D/BoxCollider";
import { Vector2 } from "laya/maths/Vector2";
import { CheckBox } from "laya/ui/CheckBox";
import { Handler } from "laya/utils/Handler";
import { Utils } from "laya/utils/Utils";

const dampingRatio: number = 0.5;
const frequencyHz: number = 10.0;

/**
 * 仿生兽
 */
export class Physics_Strandbeests {
    Main: typeof Main = null;
    private scale = 2.5;
    private pos: Array<number> = [550, 200];
    private wheel: Sprite;
    private chassis: Sprite;
    private motorJoint: RevoluteJoint;
    private label: Label;
    private TempVec: Vector2 = new Vector2();

    private drawFlags: string[] = ["Shape", "Joint", "AABB", "Pair", "CenterOfMass"]
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
            this.Construct();
            Laya.loader.load(["res/ui/checkbox (1).png"], Handler.create(this, this.eventListener));
        });
    }

    Construct() {
        // Ground
        let ground = new Sprite();
        ground.name = "ground"
        this.Main.box2D.addChild(ground);
        let rigidbody: RigidBody = new RigidBody();
        rigidbody.type = "static";
        ground.addComponentInstance(rigidbody);
        let chainCollider: ChainCollider = new ChainCollider();
        chainCollider.datas = [50, 200, 50, 570, 1050, 570, 1050, 200];
        ground.addComponentInstance(chainCollider);
        // Balls
        for (let i = 1; i <= 32; i++) {
            let small = new Sprite();
            small.name = "ground" + i;
            small.pos(i * 30 + 50, 570 - 5 * this.scale);
            this.Main.box2D.addChild(small);

            let sCollider: CircleCollider = small.addComponent(CircleCollider);
            sCollider.radius = 2.5 * this.scale;
            small.addComponent(RigidBody);
        }

        // Chassis
        let chassis: Sprite = this.chassis = new Sprite();
        chassis.size(50 * this.scale, 20 * this.scale);
        chassis.anchorX = chassis.anchorY = 0.5;
        chassis.pos(this.pos[0], this.pos[1]);
        this.Main.box2D.addChild(chassis);
        let chassisBody: RigidBody = chassis.addComponent(RigidBody);
        chassisBody.group = -1;

        let chassisCollider: BoxCollider = chassis.addComponent(BoxCollider);
        chassisCollider.density = 1;
        chassisCollider.width = 50 * this.scale;
        chassisCollider.height = 20 * this.scale;


        // Circle
        let wheel = this.wheel = new Sprite();
        wheel.width = wheel.height = 2 * 16 * this.scale;
        wheel.anchorX = wheel.anchorY = 0.5;

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

        let wheelAnchor = [0, 8 * this.scale];
        this.createLeg(-1, wheelAnchor, 0);
        this.createLeg(1, wheelAnchor, 0);


        this.createLeg(-1.0, wheelAnchor, Utils.toRadian(120.0));
        this.createLeg(1.0, wheelAnchor, Utils.toRadian(120.0));
        this.createLeg(-1.0, wheelAnchor, Utils.toRadian(-120.0));
        this.createLeg(1.0, wheelAnchor, Utils.toRadian(-120.0));
    }

    private getDistance(body: RigidBody, p: number[], body1: RigidBody, p1: number[]) {
        let g1 = body.GetWorldPoint(p[0], p[1]);
        let x = g1.x;
        let y = g1.y;
        g1 = body1.GetWorldPoint(p1[0], p1[1]);
        return Math.sqrt(Math.pow(g1.x - x, 2) + Math.pow(g1.y - y, 2))
    }

    private getRotateVector(rotate: number, p: number[]): number[] {
        let cos = Math.cos(rotate);
        let sin = Math.sin(rotate);
        let x = cos * p[0] - sin * p[1];
        let y = sin * p[0] + cos * p[1];
        return [x, y]
    }

    private createDistanceJoint(selfBody: RigidBody, selfAnchor: number[], otherBody: RigidBody, otherAnchor: number[], distance: number) {
        let distanceJoint: DistanceJoint = new DistanceJoint();
        distanceJoint.otherBody = otherBody;
        distanceJoint.otherAnchor = otherAnchor;
        distanceJoint.selfAnchor = selfAnchor;
        distanceJoint.frequency = frequencyHz;
        distanceJoint.damping = dampingRatio;
        distanceJoint.maxLength = distanceJoint.minLength = distanceJoint.length = distance;
        selfBody.owner.addComponentInstance(distanceJoint)
        return distanceJoint;
    }

    createLeg(s: number, wheelAnchor: number[], rotate: number) {
        const wheelBody: RigidBody = this.wheel.getComponent(RigidBody);
        const chassisBody: RigidBody = this.chassis.getComponent(RigidBody)

        const p1 = [54, -61];
        const p2 = [72, -12];
        const p3 = [43, -19];
        const p4 = [31, 0];
        const p5 = [60, 15];
        const p6 = [25, 37];

        let leg1 = new Sprite();
        leg1.pos(this.chassis.x, this.chassis.y + 16 * this.scale); // TODO 这里的数值待优化
        leg1.scale(s * this.scale, -this.scale);
        this.Main.box2D.addChild(leg1);

        let leg2 = new Sprite();
        leg2.scale(s * this.scale, -this.scale);
        leg2.pos(this.chassis.x, this.chassis.y);
        this.Main.box2D.addChild(leg2);

        let legBody1: RigidBody = leg1.addComponent(RigidBody);
        legBody1.angularDamping = 10;
        legBody1.group = -1;

        let legCollider1: PolygonCollider = leg1.addComponent(PolygonCollider);
        legCollider1.density = 1;



        let legBody2: RigidBody = leg2.addComponent(RigidBody);
        legBody2.angularDamping = 10;
        legBody2.group = -1;

        let legCollider2: PolygonCollider = leg2.addComponent(PolygonCollider);
        legCollider2.density = 1;

        legCollider1.datas = p1.concat(p2).concat(p3);
        legCollider2.datas = p4.concat(p5).concat(p6);

        let distance = this.getDistance(legBody1, p2, legBody2, p5);
        this.createDistanceJoint(legBody1, p2, legBody2, p5, distance);
        distance = this.getDistance(legBody1, p3, legBody2, p4);
        this.createDistanceJoint(legBody1, p3, legBody2, p4, distance);

        let anchor = this.getRotateVector(rotate, wheelAnchor);
        distance = this.getDistance(legBody1, p3, wheelBody, wheelAnchor);
        this.createDistanceJoint(legBody1, p3, wheelBody, anchor, distance);
        distance = this.getDistance(legBody2, p6, wheelBody, wheelAnchor);
        this.createDistanceJoint(legBody2, p6, wheelBody, anchor, distance);

        let revoluteJoint: RevoluteJoint = new RevoluteJoint();
        revoluteJoint.otherBody = chassisBody;
        revoluteJoint.anchor = p4;
        revoluteJoint.collideConnected = false;
        leg2.addComponentInstance(revoluteJoint);
    }

    eventListener() {

        // 双击屏幕，仿生机器人向相反方向运动
        Laya.stage.on(Event.DOUBLE_CLICK, this, () => {
            this.motorJoint.motorSpeed = -this.motorJoint.motorSpeed;
        });

        // 单击产生新的小球刚体
        Laya.stage.on(Event.CLICK, this, () => {

            let tempVec = this.TempVec;
            let newBall = new Sprite();
            newBall.pos(Laya.stage.mouseX, Laya.stage.mouseY);
            this.Main.box2D.addChild(newBall);
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            let circleCollider: CircleCollider = newBall.addComponent(CircleCollider);
            circleCollider.radius = 3 * this.scale;
            tempVec.x = this.chassis.x - newBall.x;
            tempVec.y = this.chassis.y - newBall.y;
            Vector2.normalize(tempVec, tempVec);
            Vector2.scale(tempVec, 50, tempVec);
            circleBody.linearVelocity = tempVec.toArray();
            Laya.timer.frameOnce(120, this, function () {
                newBall.destroy();
            });
        });

        let label: Label = this.label = Laya.stage.addChild(new Label("双击屏幕，仿生机器人向相反方向运动\n单击产生新的小球刚体")) as Label;
        label.top = 20;
        label.right = 20;
        label.fontSize = 16;
        label.color = "#e69999";
        for (var i = 0, n = this.drawFlags.length; i < n; i++) {
            this.createCheckBox(this.drawFlags[i], i <= 1, 1300, 70 + 50 * i);
        }

    }

    private createCheckBox(lable: string, isselect: boolean, x: number, y: number) {
        var cb: CheckBox = new CheckBox("res/ui/checkbox (1).png");
        this.Main.box2D.addChild(cb);

        cb.labelColors = "white";
        cb.labelSize = 20;
        cb.labelFont = "Microsoft YaHei";
        cb.labelPadding = "3,0,0,5";
        cb.x = x;
        cb.y = y;
        cb.label = lable;
        cb.selected = isselect;
        cb.on("change", this, this.updateSelect, [cb]);
    }

    private updateSelect(checkBox: CheckBox) {
        let isselect = checkBox.selected;
        switch (checkBox.label) {
            case "Shape":
                Physics2D.I.drawShape = isselect;
                break;
            case "Joint":
                Physics2D.I.drawJoint = isselect;
                break;
            case "AABB":
                Physics2D.I.drawAABB = isselect;
                break;
            case "Pair":
                Physics2D.I.drawPair = isselect;
                break;
            case "CenterOfMass":
                Physics2D.I.drawCenterOfMass = isselect;
                break;
        }
    }

    dispose() {
        Laya.stage.offAll(Event.CLICK);
        Laya.stage.offAll(Event.DOUBLE_CLICK);
        Laya.stage.removeChild(this.label);
        Physics2D.I.destroyWorld()
    }
}
