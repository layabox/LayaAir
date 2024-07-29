import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody"
import { physics2D_MotorJointDef } from "./JointDefStructInfo";
import { Utils } from "../../utils/Utils";

/**
 * @en Motor Joint: Allows specifying the relative position and angle between two rigid bodies, and then attempts to achieve these targets by applying forces and torques, striving to maintain this configuration.
 * @zh 马达关节：允许指定两个刚体间的相对位置和角度，然后尝试通过施加力和扭矩来达到这些目标，并会尽力维持这样的配置。
 */
export class MotorJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_MotorJointDef;

    /**@internal 基于otherBody坐标位置的偏移量，也是selfBody的目标位置*/
    private _linearOffset: any[] = [0, 0];

    /**@internal 基于otherBody的角度偏移量，也是selfBody的目标角度*/
    private _angularOffset: number = 0;

    /**@internal 当selfBody偏离目标位置时，为使其恢复到目标位置，马达关节所施加的最大作用力*/
    private _maxForce: number = 1000;

    /**@internal 当selfBody角度与目标角度不同时，为使其达到目标角度，马达关节施加的最大扭力*/
    private _maxTorque: number = 1000;

    /**@internal selfBody向目标位置移动时的缓动因子，取值0~1，值越大速度越快*/
    private _correctionFactor: number = 0.3;

    /**
     * @en The self body of the joint, effective only on the first setting.
     * @zh [首次设置有效]关节的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The other body connected by the joint, effective only on the first setting.
     * @zh [首次设置有效]关节的连接刚体。
     */
    otherBody: RigidBody;

    /**
     * @en Specifies whether the two connected bodies should collide with each other. Default is false, effective only on the first setting.
     * @zh [首次设置有效]两个刚体是否可以发生碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @en The offset from the other body's coordinates, which is also the target position for the self body.
     * @zh 基于 otherBody 坐标位置的偏移量，也是 selfBody 的目标位置。
     */
    get linearOffset(): any[] {
        return this._linearOffset;
    }

    set linearOffset(value: any[]) {
        this._linearOffset = value;
        if (this._joint) {
            this._factory.set_MotorJoint_linearOffset(this._joint, value[0], value[1]);
        }
    }

    /**
     * @en The angular offset based on the other body, which is also the target angle for the self body.
     * @zh 基于 otherBody 的角度偏移量，也是 selfBody 的目标角度。
     */
    get angularOffset(): number {
        return this._angularOffset;
    }

    set angularOffset(value: number) {
        this._angularOffset = value;
        if (this._joint) this._factory.set_MotorJoint_SetAngularOffset(this._joint, Utils.toRadian(-value));
    }

    /**
     * @en The maximum force applied by the motor joint when the selfBody deviates from the target position. When the force applied by the motor joint exceeds the maximum force, the engine automatically limits the force to ensure it does not exceed the specified maximum value.
     * @zh 当 selfBody 偏离目标位置时，马达关节所施加的最大作用力。当马达关节施加的力超过最大力时，引擎会自动截断力的大小，使其不超过设定的最大值。
     */
    get maxForce(): number {
        return this._maxForce;
    }

    set maxForce(value: number) {
        this._maxForce = value;
        if (this._joint) this._factory.set_MotorJoint_SetMaxForce(this._joint, value)
    }

    /**
     * @en The maximum torque is used to ensure that when the torque applied by the motor joint exceeds the maximum torque value, the engine automatically limits the torque to not exceed the specified maximum value.
     * @zh 最大扭矩用于当马达关节施加的扭矩超过最大扭矩值时，引擎会自动截断扭矩的大小，以确保不超过设定的最大值。
     */
    get maxTorque(): number {
        return this._maxTorque;
    }

    set maxTorque(value: number) {
        this._maxTorque = value;
        if (this._joint) this._factory.set_MotorJoint_SetMaxTorque(this._joint, value)
    }

    /**
     * @en The factor of easing when the self body moves towards the target position, with a value from 0 to 1, the larger the value, the faster the speed.
     * @zh selfBody 向目标位置移动时的缓动因子，取值 0~1，值越大速度越快。
     */
    get correctionFactor(): number {
        return this._correctionFactor;
    }

    set correctionFactor(value: number) {
        this._correctionFactor = value;
        if (this._joint) this._factory.set_MotorJoint_SetCorrectionFactor(this._joint, value)
    }

    /**@internal */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_MotorJointDef = MotorJoint._temp || (MotorJoint._temp = new physics2D_MotorJointDef());
            def.bodyA = this.selfBody.getBody();
            def.bodyB = this.otherBody.getBody();
            def.linearOffset.setValue(this._linearOffset[0], this._linearOffset[1]);
            def.angularOffset = Utils.toRadian(-this._angularOffset);
            def.maxForce = this._maxForce;
            def.maxTorque = this._maxTorque;
            def.correctionFactor = this._correctionFactor;
            def.collideConnected = this.collideConnected;
            this._joint = this._factory.create_MotorJoint(def);
        }
    }


}