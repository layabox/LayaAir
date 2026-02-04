/**
 * @zh PhysicsSettings 类用于创建物理配置信息。
 * @en The PhysicsSettings class is used to create physics configuration information.
 */
export class PhysicsSettings {
    /**
     * @zh 标志位，用于确定物理引擎的行为。
     * @en Flags that determine the behavior of the physics engine.
     */
    flags: number = 0;

    /**
     * @zh 单帧最大追帧步数限制一帧内最多执行的物理步数量，用于在掉帧时控制 CPU 峰值并防止物理追赶过度。数值越大，物理跟随时间越准确，但负载也越高。
     * @en maxSubSteps limits the maximum number of physics steps executed in a single frame. It helps control CPU spikes during frame drops. Higher values keep physics closer to real time but increase computational load.
     */
    maxSubSteps: number = 1;

    /**
     * @zh 固定模拟步长用于定义物理世界中每个模拟步（Step）的时间长度（秒），保证物理计算在不同帧率下具有一致性和稳定性。步长越小，物理精度越高，但 CPU 开销增加。
     * @en fixedTimeStep defines the duration of a single physics simulation step (in seconds), ensuring consistent and stable physics results across different frame rates. Smaller values increase simulation accuracy at the cost of higher CPU usage.
     */
    fixedTimeStep: number = 1.0 / 60.0;

    /**
     * @zh 连续碰撞检测全局开关用于指示物理系统是否允许使用 CCD 机制，以减少高速物体穿透。开启表示允许 CCD，但是否生效还需结合刚体模式及 CCD 相关参数。
     * @en enableCCD specifies whether the physics system allows the use of Continuous Collision Detection (CCD) to reduce high-speed object penetration. Enabling it permits CCD, but actual effect depends on rigid body settings and CCD parameters.
     */
    enableCCD: boolean = false;

    /**
     * @zh CCD 启动位移阈值定义物体在单个物理步内位移超过多少时触发 CCD，从而降低不必要的高成本计算。建议根据物体尺寸和速度设置。
     * @en ccdThreshold defines the displacement within a single physics step that triggers CCD. It prevents unnecessary high-cost calculations. Recommended to set based on object size and velocity.
     */
    ccdThreshold: number = 0.0001;

    /**
     * @zh CCD 扫掠球半径用于近似物体在单步运动路径上的体积，用于检测高速穿透。半径应接近物体最小厚度或有效半径，以保证碰撞检测可靠性。
     * @en ccdSphereRadius approximates the object’s volume along its motion path in a single physics step, used to detect high-speed penetration. The radius should be close to the object’s minimum thickness or effective radius for reliable collision detection.
     */
    ccdSphereRadius: number = 0.0001;
}


