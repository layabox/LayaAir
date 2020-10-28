/**
	 * <code>PhysicsSettings</code> 类用于创建物理配置信息。
	 */
export class CannonPhysicsSettings {
	/**标志集合。*/
	flags: number = 0;

	/**物理引擎在一帧中用于补偿减速的最大次数。*/
	maxSubSteps: number = 3;

	/**物理模拟器帧的间隔时间。*/
	fixedTimeStep: number = 1.0 / 60.0;
	/**物理松弛系数 */
	contactEquationRelaxation = 10;
	/** 刚度系数 */
	contactEquationStiffness = 1e6;
	/**
	 * 创建一个 <code>PhysicsSettings</code> 实例。
	 */
	constructor() {
		
	}

}


