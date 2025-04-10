/**
description
 物理仿生兽模拟，使用2D物理引擎创建可交互的机械生物
 */
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
import { Vector2 } from "laya/maths/Vector2";
import { CheckBox } from "laya/ui/CheckBox";
import { Handler } from "laya/utils/Handler";
import { Utils } from "laya/utils/Utils";
import { Physics2DOption } from "laya/physics/Physics2DOption";
import { Scene } from "laya/display/Scene";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { EPhycis2DBlit, FilterData } from "laya/physics/factory/IPhysics2DFactory";
import { StaticCollider } from "laya/physics/StaticCollider";
import { ChainShape2D } from "laya/physics/Shape/ChainShape2D";
import { CircleShape2D } from "laya/physics/Shape/CircleShape2D";
import { BoxShape2D } from "laya/physics/Shape/BoxShape2D";
import { PolygonShape2D } from "laya/physics/Shape/PolygonShape2D";

const dampingRatio: number = 0.5;
const frequencyHz: number = 10.0;

/**
 * 仿生兽
 */
export class Physics_Strandbeests_Shapes {
    Main: typeof Main = null;
    private scale = 2.5;
    private pos: Array<number> = [550, 200];
    private wheel: Sprite;
    private chassis: Sprite;
    private motorJoint: RevoluteJoint;
    private label: Label;
    private TempVec: Vector2 = new Vector2();
    private _scene: Scene;
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
        this._scene = new Scene();
        this.Main.box2D.addChild(this._scene);
        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        man.enableDebugDraw(true, EPhycis2DBlit.Shape);
        man.enableDebugDraw(true, EPhycis2DBlit.Joint);
        man.enableDebugDraw(true, EPhycis2DBlit.CenterOfMass);
        // shapes 模式
        // Ground
        let ground = new Sprite();
        ground.name = "ground"
        this._scene.addChild(ground);
        let rigidbody: StaticCollider = new StaticCollider();
        ground.addComponentInstance(rigidbody);


        let chainShape = new ChainShape2D();
        chainShape.datas = [50, 200, 50, 570, 1050, 570, 1050, 200];

        rigidbody.shapes = [chainShape]
        // Balls
        for (let i = 1; i <= 32; i++) {
            let small = new Sprite();
            small.name = "ground" + i;
            small.pos(i * 30 + 50, 570 - 5 * this.scale);
            small.addComponent(RigidBody);
            let smRd = small.getComponent(RigidBody);
            smRd.applyOwnerColliderComponent = false;
            this._scene.addChild(small);

            let circleshape = new CircleShape2D();
            circleshape.radius = 2.5 * this.scale;
            smRd.shapes = [circleshape];
        }

        // Chassis
        let chassis: Sprite = this.chassis = new Sprite();
        chassis.size(50 * this.scale, 20 * this.scale);
        chassis.anchorX = chassis.anchorY = 0.5;
        chassis.pos(this.pos[0], this.pos[1]);
        this._scene.addChild(chassis);
        let chassisBody: RigidBody = chassis.addComponent(RigidBody);
        chassisBody.applyOwnerColliderComponent = false;
        let boxshape = new BoxShape2D();
        let filter = new FilterData();
        filter.group = -1;
        boxshape.filterData = filter;
        boxshape.density = 1;
        boxshape.width = 50 * this.scale;
        boxshape.height = 20 * this.scale;
        chassisBody.shapes = [boxshape];

        // Circle
        let wheel = this.wheel = new Sprite();
        wheel.pos(chassis.x, chassis.y);
        this._scene.addChild(wheel);
        let wheelBody: RigidBody = wheel.addComponent(RigidBody);
        wheelBody.applyOwnerColliderComponent = false;
        let circleshape = new CircleShape2D();
        circleshape.filterData = filter;
        circleshape.density = 1;
        circleshape.radius = 16 * this.scale;
        wheelBody.shapes = [circleshape];

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
        let g1 = body.getWorldPoint(p[0], p[1]);
        let x = g1.x;
        let y = g1.y;
        g1 = body1.getWorldPoint(p1[0], p1[1]);
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
        this._scene.addChild(leg1);

        let leg2 = new Sprite();
        leg2.scale(s * this.scale, -this.scale);
        leg2.pos(this.chassis.x, this.chassis.y);
        this._scene.addChild(leg2);

        let legBody1: RigidBody = leg1.addComponent(RigidBody);
        legBody1.applyOwnerColliderComponent = false;
        legBody1.angularDamping = 10;

        let polyShape1 = new PolygonShape2D();
        let filter = new FilterData();
        filter.group = -1;
        polyShape1.filterData = filter;
        polyShape1.density = 1;
        polyShape1.datas = p1.concat(p2).concat(p3);
        legBody1.shapes = [polyShape1];


        let legBody2: RigidBody = leg2.addComponent(RigidBody);
        legBody2.applyOwnerColliderComponent = false;
        legBody2.angularDamping = 10;
        let polyShape2 = new PolygonShape2D();
        polyShape2.filterData = filter;
        polyShape2.density = 1;
        polyShape2.datas = p4.concat(p5).concat(p6);
        legBody2.shapes = [polyShape2];

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
        let index = 0;
        // 单击产生新的小球刚体
        Laya.stage.on(Event.CLICK, this, () => {
            let tempVec = this.TempVec;
            let newBall = new Sprite();
            newBall.pos(Laya.stage.mouseX, Laya.stage.mouseY);
            this._scene.addChild(newBall);
            newBall.name = "bullet" + index;
            index++;
            let circleBody: RigidBody = newBall.addComponent(RigidBody);
            circleBody.applyOwnerColliderComponent = false;
            let circle = new CircleShape2D();
            circle.radius = 3 * this.scale;
            circleBody.shapes = [circle];

            tempVec.x = this.chassis.x - newBall.x;
            tempVec.y = this.chassis.y - newBall.y;
            Vector2.normalize(tempVec, tempVec);
            Vector2.scale(tempVec, 50, tempVec);
            Vector2.scale(tempVec, Physics2DOption.pixelRatio, tempVec);
            circleBody.linearVelocity = tempVec;
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
        this._scene.addChild(cb);

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
        let man: Physics2DWorldManager = this._scene.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        switch (checkBox.label) {
            case "Shape":
                man.enableDebugDraw(true, EPhycis2DBlit.Shape);
                break;
            case "Joint":
                man.enableDebugDraw(true, EPhycis2DBlit.Joint);
                break;
            case "AABB":
                man.enableDebugDraw(true, EPhycis2DBlit.AABB);
                break;
            case "Pair":
                man.enableDebugDraw(true, EPhycis2DBlit.Pair);
                break;
            case "CenterOfMass":
                man.enableDebugDraw(true, EPhycis2DBlit.CenterOfMass);
                break;
        }
    }

    dispose() {
        Laya.stage.offAll(Event.CLICK);
        Laya.stage.offAll(Event.DOUBLE_CLICK);
        Laya.stage.removeChild(this.label);
    }
}
