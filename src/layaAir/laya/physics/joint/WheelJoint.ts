import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"

/**
 * 轮子关节：围绕节点旋转，包含弹性属性，使得刚体在节点位置发生弹性偏移
 */
export class WheelJoint extends JointBase {
    /**@private */
    private static _temp: any;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的连接刚体*/
    otherBody: RigidBody;
    /**[首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移*/
    anchor: any[] = [0, 0];
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;
    /**[首次设置有效]一个向量值，描述运动方向，比如1,0是沿X轴向右*/
    axis: any[] = [1, 0];

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 5;
    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    /**是否开启马达，开启马达可使目标刚体运动*/
    private _enableMotor: boolean = false;
    /**启用马达后，可以达到的最大旋转速度*/
    private _motorSpeed: number = 0;
    /**启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    private _maxMotorTorque: number = 10000;

     /**是否对刚体的移动范围加以约束*/
     private _enableLimit: boolean = true;
     /**启用约束后，刚体移动范围的下限，是距离anchor的偏移量*/
     private _lowerTranslation: number = 0;
     /**启用约束后，刚体移动范围的上限，是距离anchor的偏移量*/
     private _upperTranslation: number = 0;
     
    /**
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var box2d: any = (<any>window).box2d;
            var def: any = WheelJoint._temp || (WheelJoint._temp = new box2d.b2WheelJointDef());
            var anchorPos: Point = (<Sprite>this.selfBody.owner).localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            var anchorVec: any = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), anchorVec, new box2d.b2Vec2(this.axis[0], this.axis[1]));
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
            // def.stiffness = this._stiffness;
            // def.damping = this._damping;
            def.collideConnected = this.collideConnected;
            def.enableLimit = this._enableLimit;
            def.lowerTranslation = this._lowerTranslation / Physics.PIXEL_RATIO;
            def.upperTranslation = this._upperTranslation / Physics.PIXEL_RATIO;

            this._joint = Physics.I._createJoint(def);
        }
    }

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            let out: any = {};
            let box2d: any = (<any>window).box2d;
            let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            let bodyB = this.selfBody.getBody();
            box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);

            this._joint.SetStiffness(out.stiffness);
            this._joint.SetDamping(out.damping);
        }
    }

    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            let out: any = {};
            let box2d: any = (<any>window).box2d;
            let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            let bodyB = this.selfBody.getBody();
            box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);

            // this._joint.SetStiffness(out.stiffness); // 修改 dampingRatio 最终只影响 damping
            this._joint.SetDamping(out.damping);
        }
    }

    /**是否开启马达，开启马达可使目标刚体运动*/
    get enableMotor(): boolean {
        return this._enableMotor;
    }

    set enableMotor(value: boolean) {
        this._enableMotor = value;
        if (this._joint) this._joint.EnableMotor(value);
    }

    /**启用马达后，可以达到的最大旋转速度*/
    get motorSpeed(): number {
        return this._motorSpeed;
    }

    set motorSpeed(value: number) {
        this._motorSpeed = value;
        if (this._joint) this._joint.SetMotorSpeed(value);
    }

    /**启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    get maxMotorTorque(): number {
        return this._maxMotorTorque;
    }

    set maxMotorTorque(value: number) {
        this._maxMotorTorque = value;
        if (this._joint) this._joint.SetMaxMotorTorque(value);
    }

    /**是否对刚体的移动范围加以约束*/
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._joint.EnableLimit(value);
    }

    /**启用约束后，刚体移动范围的下限，是距离anchor的偏移量*/
    get lowerTranslation(): number {
        return this._lowerTranslation;
    }

    set lowerTranslation(value: number) {
        this._lowerTranslation = value;
        if (this._joint) this._joint.SetLimits(value, this._upperTranslation);
    }

    /**启用约束后，刚体移动范围的上限，是距离anchor的偏移量*/
    get upperTranslation(): number {
        return this._upperTranslation;
    }

    set upperTranslation(value: number) {
        this._upperTranslation = value;
        if (this._joint) this._joint.SetLimits(this._lowerTranslation, value);
    }
}