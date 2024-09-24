/**
 * @en The PhysicsSettings class is used to create physics configuration information.
 * @zh PhysicsSettings 类用于创建物理配置信息。
 */
export class PhysicsSettings {
    /**
     * @en Flags that determine the behavior of the physics engine.
     * @zh 标志位，用于确定物理引擎的行为。
     */
    flags: number = 0;

    /**
     * @en Used in the physics engine to specify the maximum number of substeps allowed per frame to improve the accuracy and stability of the physics simulation.
     * @zh 最大子步数,在物理引擎中用于指定每一帧允许的最大子步骤数，以提高物理模拟的精度和稳定性。
     */
    maxSubSteps: number = 1;

    /**
     * @en The time step of the physics simulation.
     * @zh 固定时间步长，物理模拟器帧的间隔时间。
     */
    fixedTimeStep: number = 1.0 / 60.0;

    /**
     * @en Whether to enable continuous collision detection.
     * @zh 是否开启连续碰撞检测 
     */
    enableCCD: boolean = false;

    /**
     * @en The threshold for Continuous Collision Detection (CCD).
     * @zh 连续碰撞检测的阈值。
     */
    ccdThreshold: number = 0.0001;

    /**
     * @en The radius of the sphere used for Continuous Collision Detection.
     * @zh 连续碰撞检测的球体半径。
     */
    ccdSphereRadius: number = 0.0001;
}


