import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * 旋转关节强制两个物体共享一个锚点，两个物体相对旋转
 */
export class RevoluteJoint extends JointBase {
    /**@private */
    private static _temp: any;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的连接刚体，可不设置*/
    otherBody: RigidBody;
    /**[首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移*/
    anchor: any[] = [0, 0];
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;

    /**是否开启马达，开启马达可使目标刚体运动*/
    private _enableMotor: boolean = false;
    /**启用马达后，可以达到的最大旋转速度*/
    private _motorSpeed: number = 0;
    /**启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    private _maxMotorTorque: number = 10000;

    /**是否对刚体的旋转范围加以约束*/
    private _enableLimit: boolean = false;
    /**启用约束后，刚体旋转范围的下限弧度*/
    private _lowerAngle: number = 0;
    /**启用约束后，刚体旋转范围的上限弧度*/
    private _upperAngle: number = 0;
    /**
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            //if (!otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var box2d: any = (<any>window).box2d;
            var def: any = RevoluteJoint._temp || (RevoluteJoint._temp = new box2d.b2RevoluteJointDef());
            var anchorPos: Point = (<Sprite>this.selfBody.owner).localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            var anchorVec: any = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.Initialize(this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody, this.selfBody.getBody(), anchorVec);
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.enableLimit = this._enableLimit;
            def.lowerAngle = this._lowerAngle;
            def.upperAngle = this._upperAngle;
            def.collideConnected = this.collideConnected;

            this._joint = Physics.I._createJoint(def);
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

    /**是否对刚体的旋转范围加以约束*/
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._joint.EnableLimit(value);
    }

    /**启用约束后，刚体旋转范围的下限弧度*/
    get lowerAngle(): number {
        return this._lowerAngle;
    }

    set lowerAngle(value: number) {
        this._lowerAngle = value;
        if (this._joint) this._joint.SetLimits(value, this._upperAngle);
    }

    /**启用约束后，刚体旋转范围的上限弧度*/
    get upperAngle(): number {
        return this._upperAngle;
    }

    set upperAngle(value: number) {
        this._upperAngle = value;
        if (this._joint) this._joint.SetLimits(this._lowerAngle, value);
    }
}

ClassUtils.regClass("laya.physics.joint.RevoluteJoint", RevoluteJoint);
ClassUtils.regClass("Laya.RevoluteJoint", RevoluteJoint);