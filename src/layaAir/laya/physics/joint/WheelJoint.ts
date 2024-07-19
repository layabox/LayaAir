import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point"
import { RigidBody } from "../RigidBody"
import { physics2D_WheelJointDef } from "./JointDefStructInfo";
import { Utils } from "../../utils/Utils";

/**
 * @en WheelJoint: Allows an object to rotate around a fixed axis relative to another object, while also providing spring-like resistance along the axis for bouncing back.
 * @zh 轮子关节：允许一个物体在另一个物体上以固定的轴向转动，同时还能沿着轴向弹簧回弹。
 */
export class WheelJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_WheelJointDef;


    /**@internal 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 1;

    /**@internal 刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    /**@internal 是否开启马达，开启马达可使目标刚体运动*/
    private _enableMotor: boolean = false;

    /**@internal 启用马达后，可以达到的最大旋转速度*/
    private _motorSpeed: number = 0;

    /**@internal 启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转*/
    private _maxMotorTorque: number = 10000;

    /**@internal 是否对刚体的移动范围加以约束*/
    private _enableLimit: boolean = true;

    /**@internal 启用约束后，刚体移动范围的下限，是距离anchor的偏移量*/
    private _lowerTranslation: number = 0;

    /**@internal 启用约束后，刚体移动范围的上限，是距离anchor的偏移量*/
    private _upperTranslation: number = 0;

    /**
     * @en The rigid body that is locally attached to the joint. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节直接相连的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connected rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节连接的另一个刚体。
     */
    otherBody: RigidBody;

    /**
     * @en Link points of joints, it is offset from the position of the upper left corner of its own rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移。。
     */
    anchor: any[] = [0, 0];

    /**
     * @en Specifies whether the two connected rigid bodies can collide with each other. Default is false. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个连接的刚体是否可以相互碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @deprecated
     * [首次设置有效]一个向量值，用于定义弹性运动方向，即轮子在哪个方向可以如弹簧一样压缩和伸展，比如1,0是沿X轴向右，0,1是沿Y轴向下*/
    _axis: any[] = [0, 1];

    /**
     * @en An angle value that defines the direction of elastic motion, i.e., the direction in which the wheel can compress and extend like a spring. For example, 0 degrees is along the X-axis to the right, and 90 degrees is along the Y-axis downward. This setting is effective only on the first assignment.
     * @zh [首次设置有效]一个角度值，用于定义弹性运动方向，即轮子在哪个方向可以如弹簧一样压缩和伸展，例如 0 度表示沿 X 轴正方向，90 度表示沿 Y 轴负方向。
     */
    angle: number = 90;

    /**
     * @en The vibration frequency of the spring system, which can be considered as the spring's elasticity coefficient.The frequency should typically be less than half the time step frequency.
     * @zh 弹簧系统的振动频率，可以视为弹簧的弹性系数。通常频率应小于时间步长频率的一半。
     */
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, false)
        }
    }

    /**
     * @en The damping ratio that the body experiences when returning to the anchor point, with a recommended value range of 0 to 1.
     * @zh 刚体在回归到锚点过程中受到的阻尼比，建议取值范围为 0 到 1。
     */
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, true)
        }
    }

    /**
     * @en Whether the motor is enabled to drive the rotation of the connected body.
     * @zh 是否启用马达以驱动连接刚体的旋转。
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
     * @en Whether the movement range of the connected body is limited.
     * @zh 是否对连接刚体的移动范围加以约束。
     */
    get enableLimit(): boolean {
        return this._enableLimit;
    }

    set enableLimit(value: boolean) {
        this._enableLimit = value;
        if (this._joint) this._factory.set_Joint_EnableLimit(this._joint, value);
    }

    /**
     * @en The lower limit of the movement range when the limit is enabled, as an offset from the anchor.
     * @zh 启用约束后，刚体移动范围的下限，是距离锚点的偏移量。
     */
    get lowerTranslation(): number {
        return this._lowerTranslation;
    }

    set lowerTranslation(value: number) {
        this._lowerTranslation = value;
        if (this._joint) this._factory.set_Joint_SetLimits(this._joint, value, this._upperTranslation);
    }

    /**
     * @en The upper limit of the movement range when the limit is enabled, as an offset from the anchor.
     * @zh 启用约束后，刚体移动范围的上限，是距离锚点的偏移量。
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
     * 启用约束后，刚体移动范围的上限，是距离anchor的偏移量*/
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
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_WheelJointDef = WheelJoint._temp || (WheelJoint._temp = new physics2D_WheelJointDef());
            var anchorPos: Point = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
            def.anchor.setValue(anchorPos.x, anchorPos.y);
            let radian = Utils.toRadian(this.angle);
            def.axis.setValue(Math.cos(radian), Math.sin(radian));
            def.bodyA = this.otherBody.getBody();
            def.bodyB = this.selfBody.getBody();;
            def.enableMotor = this._enableMotor;
            def.motorSpeed = this._motorSpeed;
            def.maxMotorTorque = this._maxMotorTorque;
            def.collideConnected = this.collideConnected;
            def.enableLimit = this._enableLimit;
            def.lowerTranslation = this._lowerTranslation;
            def.upperTranslation = this._upperTranslation;
            def.frequency = this._frequency;
            def.dampingRatio = this._dampingRatio;
            this._joint = this._factory.create_WheelJoint(def);
        }
    }
}