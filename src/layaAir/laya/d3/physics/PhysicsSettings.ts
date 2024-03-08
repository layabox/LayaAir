/**
 * <code>PhysicsSettings</code> 类用于创建物理配置信息。
 */
export class PhysicsSettings {
    /**标志集合。*/
    flags: number = 0;

    /**物理引擎在一帧中用于补偿减速的最大次数。*/
    maxSubSteps: number = 1;

    /**物理模拟器帧的间隔时间。*/
    fixedTimeStep: number = 1.0 / 60.0;

    /**是否开启连续碰撞检测 */
    enableCCD: boolean = false;

    /**连续碰撞检测阈值 */
    ccdThreshold: number = 0.0001;

    /**连续碰撞检测球半径 */
    ccdSphereRadius: number = 0.0001;
}


