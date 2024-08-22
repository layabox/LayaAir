import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "./IJoint";
/**
 * @en Interface for a hinge joint.
 * @zh 铰链关节接口。
 */
export interface IHingeJoint extends IJoint {
    /**
     * @en Sets the axis of rotation for the hinge joint.
     * @param value The axis vector to set.
     * @zh 设置铰链关节的旋转轴。
     * @param value 要设置的轴向量。
     */
    setAxis(value: Vector3): void;

    /**
     * @en The current angle in degrees of the joint relative to its rest position.
     * @zh 当前关节相对于其静止位置的角度。
     */
    getAngle(): number;

    /**
     * @en The angular velocity of the joint in degrees per second.
     * @zh 关节的角速度（以度/秒为单位）。
     */
    getVelocity(): Readonly<Vector3>;

    /**
     * @en Sets the lower limit of the joint's rotation.
     * @param lowerLimit The lower limit value in degrees.
     * @zh 设置关节旋转的下限。
     * @param lowerLimit 下限值（以度为单位）。
     */
    setLowerLimit(lowerLimit: number): void;

    /**
     * @en Sets the upper limit of the joint's rotation.
     * @param value The upper limit value in degrees.
     * @zh 设置关节旋转的上限。
     * @param value 上限值（以度为单位）。
     */
    setUpLimit(value: number): void;

    /**
     * @en Sets the bounciness of the joint.
     * @param value The bounciness value.
     * @zh 设置关节的反弹性。
     * @param value 反弹性值。
     */
    setBounceness(value: number): void;

    /**
     * @en Sets the minimum velocity required for the joint to bounce.
     * @param value The minimum bounce velocity.
     * @zh 设置关节反弹所需的最小速度。
     * @param value 最小反弹速度。
     */
    setBouncenMinVelocity(value: number): void

    /**
     * @en Sets the contact distance for the joint.
     * @param value The contact distance value.
     * @zh 设置关节的接触距离。
     * @param value 接触距离值。
     */
    setContactDistance(value: number): void;

    /**
     * @en Enables or disables the joint's rotation limit.
     * @param value True to enable the limit, false to disable.
     * @zh 启用或禁用关节的旋转限制。
     * @param value 为true时启用限制，为false时禁用。
     */
    enableLimit(value: boolean): void;

    /**
     * @en Enables or disables the joint's drive.
     * @param value True to enable the drive, false to disable.
     * @zh 启用或禁用关节的驱动。
     * @param value 为true时启用驱动，为false时禁用。
     */
    enableDrive(value: boolean): void;

    /**
     * @en Enables or disables free spin for the joint.
     * @param value True to enable free spin, false to disable.
     * @zh 启用或禁用关节的自由旋转。
     * @param value 为true时启用自由旋转，为false时禁用。
     */
    enableFreeSpin(value: boolean): void;

    /**
     * @en Sets the target velocity for the drive model.
     * @param velocity The drive target velocity.
     * @zh 设置驱动模型的目标速度。
     * @param velocity 驱动目标速度。
     */
    setDriveVelocity(velocity: number): void;

    /**
     * @en Sets the maximum torque the drive can exert.
     * @param limit The maximum torque value.
     * @zh 设置驱动可施加的最大扭矩。
     * @param limit 最大扭矩值。
     */
    setDriveForceLimit(limit: number): void;
}