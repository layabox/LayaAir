import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { physics2D_RevoluteJointDef } from "./JointDefStructInfo";

/**
 * 旋转关节强制两个物体共享一个锚点，两个物体相对旋转
 */
export class RevoluteJoint extends JointBase {
    /**@private */
    private static _temp: physics2D_RevoluteJointDef;
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
    private _maxMotorTorque: number = 0;

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
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";
            var def: physics2D_RevoluteJointDef = RevoluteJoint._temp || (RevoluteJoint._temp = new physics2D_RevoluteJointDef());
            def.bodyA = this.selfBody.getBody();
            def.bodyB = this.otherBody ? this.otherBody.getBody() : Physics2D.I._emptyBody;

            let global = this._factory.getLayaPosition(this.owner as Sprite, this.anchor[0], this.anchor[1]);
            def.anchor.setValue(global.x, global.y)
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.enableLimit = this._enableLimit;
            def.lowerAngle = this._lowerAngle;
            def.upperAngle = this._upperAngle;
            def.collideConnected = this.collideConnected;

            this._joint = this._factory.create_RevoluteJoint(def);
        }
    }

    /**是否开启马达，开启马达可使目标刚体运动*/
    get enableMotor(): boolean {
        return this._enableMotor;
    }

    set enableMotor(value: boolean) {
        this._enableMotor = value;
        if (this._joint) this._factory.set_Joint_EnableMotor(this._joint, value);
    }

    /**启用马达后，可以达到的最大旋转速度*/
    get motorSpeed(): number {
        return this._motorSpeed;
    }

    set motorSpeed(value: number) {
        this._motorSpeed = value;
        if (this._joint) this._factory.set_Joint_SetMotorSpeed(this._joint, value);
    }

    /**启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    get maxMotorTorque(): number {
        return this._maxMotorTorque;
    }

    set maxMotorTorque(value: number) {
        this._maxMotorTorque = value;
        if (this._joint) this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
    }

    /**是否对刚体的旋转范围加以约束*/
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._factory.set_Joint_EnableLimit(this._joint, value);
    }

    /**启用约束后，刚体旋转范围的下限弧度*/
    get lowerAngle(): number {
        return this._lowerAngle;
    }

    set lowerAngle(value: number) {
        this._lowerAngle = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, value, this._upperAngle);
    }

    /**启用约束后，刚体旋转范围的上限弧度*/
    get upperAngle(): number {
        return this._upperAngle;
    }

    set upperAngle(value: number) {
        this._upperAngle = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, this._lowerAngle, value);
    }
}