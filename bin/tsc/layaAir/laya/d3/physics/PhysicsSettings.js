/**
     * <code>PhysicsSettings</code> 类用于创建物理配置信息。
     */
export class PhysicsSettings {
    /**
     * 创建一个 <code>PhysicsSettings</code> 实例。
     */
    constructor() {
        /**标志集合。*/
        this.flags = 0;
        /**物理引擎在一帧中用于补偿减速的最大次数。*/
        this.maxSubSteps = 1;
        /**物理模拟器帧的间隔时间。*/
        this.fixedTimeStep = 1.0 / 60.0;
    }
}
