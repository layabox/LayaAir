import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../ICollider";

/**
 * @en Wheel cast information, containing ground contact data.
 * @zh 车轮投射信息，包含地面接触数据。
 */
export interface WheelCastInfo {
    /**
     * @en The collider that the wheel is in contact with.
     * @zh 车轮接触的碰撞体。
     */
    otherCollider: ICollider;

    /**
     * @en The contact point position.
     * @zh 接触点位置。
     */
    contactPos: Vector3;

    /**
     * @en The contact point normal.
     * @zh 接触点法线。
     */
    contactNormal: Vector3;

    /**
     * @en Whether the wheel is in contact with the ground.
     * @zh 是否接触地面。
     */
    isContact: boolean;

    /**
     * @en Current suspension length.
     * @zh 当前悬挂长度。
     */
    currentSuspensionLength: number;

    /**
     * @en Raycast hit distance from connection point to ground (including wheel radius).
     * @zh 射线检测距离，从连接点到地面的距离（包括轮子半径）。
     */
    hitDistance?: number;

    /**
     * @en Suspension rest length (from connection point to wheel center).
     * @zh 悬挂静止长度（从连接点到轮子中心）。
     */
    suspensionRestLength?: number;

    /**
     * @en Wheel radius.
     * @zh 轮子半径。
     */
    wheelRadius?: number;
}
