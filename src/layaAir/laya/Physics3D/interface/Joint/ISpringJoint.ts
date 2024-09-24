import { IJoint } from "./IJoint";
/**
 * @en Interface for a spring joint.
 * @zh 弹簧关节接口。
 */
export interface ISpringJoint extends IJoint {

    /**
     * @en Set the allowed minimum distance for the joint.
     * @param distance The minimum distance.
     * @zh 设置关节允许的最小距离。
     * @param distance 最小距离。
     */
    setMinDistance(distance: number): void;

    /**
     * @en Set the allowed maximum distance for the joint.
     * @param distance The maximum distance.
     * @zh 设置关节允许的最大距离。
     * @param distance 最大距离。
     */
    setMaxDistance(distance: number): void;

    /**
     * @en Set the error tolerance of the joint.
     * @param tolerance The distance beyond the allowed range at which the joint becomes active.
     * @zh 设置关节的误差容限。
     * @param tolerance 超出允许范围时关节变为活动状态的距离。
     */
    setTolerance(tolerance: number): void;

    /**
     * @en Set the strength of the joint spring.
     * @param stiffness The spring strength of the joint.
     * @zh 设置关节弹簧的强度。
     * @param stiffness 关节弹簧的强度。
     */
    setStiffness(stiffness: number): void;

    /**
     * @en Set the damping of the joint spring.
     * @param damping The degree of damping of the joint spring.
     * @zh 设置关节弹簧的阻尼。
     * @param damping 关节弹簧的阻尼程度。
     */
    setDamping(damping: number): void;
}