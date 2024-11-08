import { JointBase } from "./JointBase";
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { Utils } from "../../utils/Utils";
import { physics2D_RevoluteJointDef } from "../IPhysiscs2DFactory";

/**
 * @en Rotating joint forces two objects to share an anchor point, and the two objects rotate relative to each other
 * @zh 旋转关节强制两个物体共享一个锚点，两个物体相对旋转
 */
export class RevoluteJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_RevoluteJointDef;

    /**@internal 是否开启马达，开启马达可使目标刚体运动*/
    private _enableMotor: boolean = false;

    /**@internal 启用马达后，可以达到的最大旋转速度*/
    private _motorSpeed: number = 0;

    /**@internal 启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    private _maxMotorTorque: number = 10000;

    /**@internal 是否对刚体的旋转范围加以约束*/
    private _enableLimit: boolean = false;

    /**@internal 启用约束后，刚体旋转范围的下限角度*/
    private _lowerAngle: number = 0;

    /**@internal 启用约束后，刚体旋转范围的上限角度*/
    private _upperAngle: number = 0;

    /**
     * @en The rigid body that is locally attached to the joint. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节直接相连的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connected rigid body. It can be optionally not set. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节连接的另一个刚体，可以不设置。
     */
    otherBody: RigidBody;

    /**
     * @en Link points of joints, it is offset from the position of the upper left corner of its own rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移。
     */
    anchor: any[] = [0, 0];

    /**
     * @en Specifies whether the two connected rigid bodies can collide with each other. Default is false. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个连接的刚体是否可以相互碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @en Enables or disables the motor, which when enabled, drives the rotation of the target body.
     * @zh 启用或禁用马达，启用后可以驱动目标刚体的旋转。
     */
    get enableMotor(): boolean {
        return this._enableMotor;
    }

    set enableMotor(value: boolean) {
        this._enableMotor = value;
        if (this._joint) this._factory.set_Joint_EnableMotor(this._joint, value);
    }

    /**
     * @en The maximum rotational speed that can be achieved when the motor is enabled.
     * @zh 启用马达后可以达到的最大旋转速度。
     */
    get motorSpeed(): number {
        return this._motorSpeed;
    }

    set motorSpeed(value: number) {
        this._motorSpeed = value;
        if (this._joint) this._factory.set_Joint_SetMotorSpeed(this._joint, value);
    }

    /**
     * @en The maximum torque that can be applied when the motor is enabled. Insufficient torque may result in no rotation.
     * @zh 启用马达后可以施加的最大扭距。如果最大扭矩太小，可能导致不旋转。
     */
    get maxMotorTorque(): number {
        return this._maxMotorTorque;
    }

    set maxMotorTorque(value: number) {
        this._maxMotorTorque = value;
        if (this._joint) this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
    }

    /**
     * @en Whether to constrain the rotation range of the rigid body
     * @zh 是否对刚体的旋转范围加以约束
     */
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._factory.set_Joint_EnableLimit(this._joint, value);
    }

    /**
     * @en The lower limit angle of the rotation range when the limit is enabled.
     * @zh 启用限制后，刚体旋转范围的下限角度。
     */
    get lowerAngle(): number {
        return this._lowerAngle;
    }

    set lowerAngle(value: number) {
        this._lowerAngle = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, Utils.toRadian(value), Utils.toRadian(this._upperAngle));
    }

    /**
     * @en The upper limit angle of the rotation range when the limit is enabled.
     * @zh 启用限制后，刚体旋转范围的上限角度。
     */
    get upperAngle(): number {
        return this._upperAngle;
    }

    set upperAngle(value: number) {
        this._upperAngle = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, Utils.toRadian(this._lowerAngle), Utils.toRadian(value));
    }

    /** @internal */
    protected _createJoint(): void {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";
            var def: physics2D_RevoluteJointDef = RevoluteJoint._temp || (RevoluteJoint._temp = new physics2D_RevoluteJointDef());
            def.bodyB = this.selfBody.getBody();
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics2D.I._emptyBody;

            let global = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
            def.anchor.setValue(global.x, global.y);
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.enableLimit = this._enableLimit;
            def.lowerAngle = Utils.toRadian(this._lowerAngle);
            def.upperAngle = Utils.toRadian(this._upperAngle);
            def.collideConnected = this.collideConnected;

            this._joint = this._factory.create_RevoluteJoint(def);
        }
    }

}