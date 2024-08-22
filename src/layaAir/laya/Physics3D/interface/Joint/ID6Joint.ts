import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "./IJoint";
/**
 * @en Enumeration of motion types for a 6-degree-of-freedom joint.
 * @zh 6自由度关节的运动类型枚举。
 */
export enum D6MotionType {
    /**
     * @en Motion along the X axis
     * @zh X轴方向的运动
     */
    eX = 0,	
    /**
     * @en Motion along the Y axis
     * @zh Y轴方向的运动
     */
    eY = 1,	
    /**
     * @en Motion along the Z axis
     * @zh Z轴方向的运动
     */
    eZ = 2,	
    /**
     * @en Motion around the X axis
     * @zh 绕X轴的运动
     */
    eTWIST = 3,	
    /**
     * @en Motion around the Y axis 
     * @zh 绕Y轴的运动
     */
    eSWING1 = 4,	
    /**
     * @en Motion around the Z axis 
     * @zh 绕Z轴的运动
     */
    eSWING2 = 5,	
}

/**
 * @en Enumeration of axis states for a 6-degree-of-freedom joint.
 * @zh 6自由度关节的轴状态枚举。
 */
export enum D6Axis {
    /**
     * @en The degree of freedom is locked, not allowing relative motion.
     * @zh 自由度被锁定，不允许相对运动。
     */
    eLOCKED,	
    /**
     * @en The degree of freedom is limited, only allowing motion within a specific range.
     * @zh 自由度受限，只允许在特定范围内运动。
     */
    eLIMITED,	
    /**
     * @en The degree of freedom is free, allowing its full range of motion.
     * @zh 自由度是自由的，允许其全范围运动。
     */
    eFREE	
}

/**
 * @en Enumeration of drive types for a 6-degree-of-freedom joint.
 * @zh 6自由度关节的驱动类型枚举。
 */
export enum D6Drive {
    /**
     * @en Drive along the X-axis
     * @zh 沿X轴驱动
     */
    eX = 0,	
    /**
     * @en Drive along the Y-axis
     * @zh 沿Y轴驱动
     */
    eY = 1,	
    /**
     * @en Drive along the Z-axis
     * @zh 沿Z轴驱动
     */
    eZ = 2,	
    /**
     * @en Drive of displacement from the X-axis
     * @zh 相对于X轴的位移驱动
     */
    eSWING = 3,	
    /**
     * @en Drive of the displacement around the X-axis
     * @zh 绕X轴的位移驱动
     */
    eTWIST = 4,	
    /**
     * @en Drive of all three angular degrees along a SLERP-path
     * @zh 沿SLERP路径的三个角度自由度的驱动
     */
    eSLERP = 5,	
}

/**
 * @en Interface for a 6-degree-of-freedom joint in the physics system.
 * @zh 物理系统中6自由度关节的接口。
 */
export interface ID6Joint extends IJoint {
    /**
     * @en Set the primary and secondary axes for the joint.
     * @param axis The primary axis.
     * @param secendary The secondary axis.
     * @zh 设置关节的主轴和次轴。
     * @param axis 主轴。
     * @param secendary 次轴。
     */
    setAxis(axis: Vector3, secendary: Vector3): void;
    /**
     * @en Set the motion type around the specified axis.
     * @param axis The axis to set.
     * @param motionType The type of motion to set.
     * @zh 设置指定轴的运动类型。
     * @param axis 轴。
     * @param motionType 运动类型。
     */
    setMotion(axis: D6Axis, motionType: D6MotionType): void;
    /**
     * @en Set Distance limit Params
     * @param limit The distance limit.
     * @param bounciness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damp The damping coefficient.
     * @zh 设置关节的距离限制参数。
     * @param limit 距离限制。
     * @param bounciness 限制的弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧系数。
     * @param damp 阻尼系数。
     */
    setDistanceLimit(limit: number, bounciness: number, bounceThreshold: number, spring: number, damp: number): void;
    /**
     * @en x,y,z linear Limit.
     * @param linearAxis The axis to set the limit for.
     * @param upper The upper limit.
     * @param lower The lower limit.
     * @param bounciness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 设置x,y,z轴的线性限制。
     * @param linearAxis 轴。
     * @param upper 上限。
     * @param lower 下限。
     * @param bounciness 弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounciness: number, bounceThreshold: number, spring: number, damping: number): void;
    /**
     * @en The twist limit controls the range of motion around the twist axis.
     * @param upper The upper limit of the twist.
     * @param lower The lower limit of the twist.
     * @param bounciness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 扭转限制控制绕扭转轴的运动范围。
     * @param upper 扭转轴的上限。
     * @param lower 扭转轴的下限。
     * @param bounciness 弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setTwistLimit(upper: number, lower: number, bounciness: number, bounceThreshold: number, spring: number, damping: number): void;
    /**
     * @en Set the cone-like swing limit for the joint.
     * @param yAngle The angle limit around the Y axis.
     * @param zAngle The angle limit around the Z axis.
     * @param bounciness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 设置关节的锥形摆动限制。
     * @param yAngle Y轴的角度限制。
     * @param zAngle Z轴的角度限制。
     * @param bounciness 弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setSwingLimit(yAngle: number, zAngle: number, bounciness: number, bounceThreshold: number, spring: number, damping: number): void;
    /**
     * @en Set the drive parameters for a specific drive type.
     * @param index The drive type to set.
     * @param stiffness The stiffness of the drive.
     * @param damping The damping of the drive.
     * @param forceLimit The force limit of the drive.
     * @zh 设置特定驱动类型的驱动参数。
     * @param index 驱动类型。
     * @param stiffness 刚度。
     * @param damping 阻尼。
     * @param forceLimit 力限。
     */
    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void;
    /**
     * @en Set the drive transform for the joint.
     * @param position The target position.
     * @param rotate The target rotation.
     * @zh 设置关节的驱动变换。
     * @param position 目标位置。
     * @param rotate 目标旋转。
     */
    setDriveTransform(position: Vector3, rotate: Quaternion): void;
    /**
     * @en Set the drive velocity for the joint.
     * @param position The linear velocity.
     * @param angular The angular velocity.
     * @zh 设置关节的驱动速度。
     * @param position 线速度。
     * @param angular 角速度。
     */
    setDriveVelocity(position: Vector3, angular: Vector3): void;
    /**
     * @en Get the twist angle of the joint, in the range (-2*Pi, 2*Pi].
     * @zh 获取关节的扭转角度，范围为(-2*Pi, 2*Pi]。
     */
    getTwistAngle(): number
    /**
     * @en Get the swing angle of the joint from the Y axis.
     * @zh 获取关节相对于Y轴的摆动角度。
     */
    getSwingYAngle(): number;
    /**
     * @en Get the swing angle of the joint from the Z axis.
     * @zh 获取关节相对于Z轴的摆动角度。
     */
    getSwingZAngle(): number;
}