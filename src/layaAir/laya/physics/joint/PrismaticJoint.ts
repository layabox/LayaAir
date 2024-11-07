import { JointBase } from "./JointBase";
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { Utils } from "../../utils/Utils";
import { physics2D_PrismaticJointDef } from "../IPhysiscs2DFactory";

/**
 * @en Translation joint: A movement joint allows two objects to move relative to each other along a specified axis, but it prevents relative rotation
 * @zh 平移关节：移动关节允许两个物体沿指定轴相对移动，它会阻止相对旋转
 */
export class PrismaticJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_PrismaticJointDef;

    /**@internal 是否开启马达，开启马达可使目标刚体运动*/
    private _enableMotor: boolean = false;

    /**@internal 启用马达后，在axis坐标轴上移动可以达到的最大速度*/
    private _motorSpeed: number = 0;

    /**@internal 启用马达后，可以施加的最大作用力*/
    private _maxMotorForce: number = 10000;

    /**@internal 是否对刚体的移动范围加以约束*/
    private _enableLimit: boolean = false;

    /**@internal 启用约束后，刚体移动范围的下限，是距离anchor的偏移量*/
    private _lowerTranslation: number = 0;

    /**@internal 启用约束后，刚体移动范围的上限，是距离anchor的偏移量*/
    private _upperTranslation: number = 0;

    /**
    * @internal 
    * @deprecated
    * @en A vector describing the axis of motion. For example, [1, 0] represents movement along the positive X-axis to the right. This setting is effective only on the first assignment.
    * @zh [首次设置有效]一个向量值，描述运动方向，比如1,0是沿X轴向右
    */
    _axis: any[] = [1, 0];

    /**
     * @en The rigid body to which the joint is attached. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connected rigid body of the joint. It can be left unspecified, in which case it defaults to an empty rigid body at the top left corner. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的连接刚体，可不设置，默认为左上角空刚体。
     */
    otherBody: RigidBody;

    /**
     * @en The anchor point of the joint, which is the offset relative to the top-left corner of the own rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的控制点，是相对于自身刚体左上角位置的偏移。
     */
    anchor: any[] = [0, 0];

    /**
     * @en The angle describing the axis of motion, e.g., 0 degrees represents movement to the right along the X-axis. This setting is effective only on the first assignment.
     * @zh [首次设置有效]描述运动方向的角度，例如 0 度表示沿 X 轴向右移动。
     */
    angle: number = 0;

    /**
     * @en Specifies whether the two connected rigid bodies should collide with each other. Default is false. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个刚体是否可以发生碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @en Whether the motor is enabled to drive the connected body.
     * @zh 是否开启马达，开启马达可使目标刚体运动。
     */
    get enableMotor(): boolean {
        return this._enableMotor;
    }

    set enableMotor(value: boolean) {
        this._enableMotor = value;
        if (this._joint) this._factory.set_Joint_EnableMotor(this._joint, value);
    }

    /**
     * @en The maximum speed that the motor can achieve along the axis when the motor is enabled.
     * @zh 启用马达后，在axis坐标轴上移动可以达到的最大速度。
     */
    get motorSpeed(): number {
        return this._motorSpeed;
    }

    set motorSpeed(value: number) {
        this._motorSpeed = value;
        if (this._joint) this._factory.set_Joint_SetMotorSpeed(this._joint, value);
    }

    /**
     * @en The maximum force that can be applied by the motor when it is enabled.
     * @zh 启用马达后，可以施加的最大作用力。
     */
    get maxMotorForce(): number {
        return this._maxMotorForce;
    }

    set maxMotorForce(value: number) {
        this._maxMotorForce = value;
        if (this._joint) this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
    }

    /**
     * @en Whether to constrain the movement range of the rigid body.
     * @zh 是否对刚体的移动范围加以约束。
     */
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._factory.set_Joint_EnableLimit(this._joint, value);
    }

    /**
     * @en The lower limit of the body's movement range when the limit is enabled, as an offset from the anchor.
     * @zh 启用限制后，刚体移动范围的下限，是距离anchor的偏移量。
     */
    get lowerTranslation(): number {
        return this._lowerTranslation;
    }

    set lowerTranslation(value: number) {
        this._lowerTranslation = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, value, this._upperTranslation);
    }

    /**
     * @en The upper limit of the body's movement range when the limit is enabled, as an offset from the anchor.
     * @zh 启用限制后，刚体移动范围的上限，是距离anchor的偏移量。
     */
    get upperTranslation(): number {
        return this._upperTranslation;
    }

    set upperTranslation(value: number) {
        this._upperTranslation = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, this._lowerTranslation, value);
    }

    /**
     * @deprecated
     * @en The axis of motion, which is a vector describing the direction of movement.
     * @zh 启用约束后，刚体移动范围的上限，是距离anchor的偏移量
     */
    get axis(): any {
        return this._axis;
    }

    set axis(value: any) {
        this._axis = value;
        this.angle = Utils.toAngle(Math.atan2(value[1], value[0]));
    }

    /**@internal */
    protected _createJoint(): void {
        if (!this._joint) {

            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_PrismaticJointDef = PrismaticJoint._temp || (PrismaticJoint._temp = new physics2D_PrismaticJointDef());
            def.bodyB = this.selfBody.getBody();
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics2D.I._emptyBody;
            let p = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
            def.anchor.setValue(p.x, p.y);
            let radian = Utils.toRadian(this.angle);
            def.axis.setValue(Math.cos(radian), Math.sin(radian));
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorForce = this._maxMotorForce;
            def.enableLimit = this._enableLimit;
            def.lowerTranslation = this._lowerTranslation;
            def.upperTranslation = this._upperTranslation;
            def.collideConnected = this.collideConnected;

            this._joint = this._factory.create_PrismaticJoint(def);
        }
    }


}