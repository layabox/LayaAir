/**
 * <code>AnimatorStateScript</code> 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
 */
export class AnimatorStateScript {

	/**
	 * 创建一个新的 <code>AnimatorStateScript</code> 实例。
	 */
	constructor() {

	}

	/**
	 * 动画状态开始时执行。
	 */
	onStateEnter(): void {

	}

	/**
	 * 动画状态更新时执行。
	 */
	onStateUpdate(): void {

	}

	/**
	 * 动画状态退出时执行。
	 */
	onStateExit(): void {

	}

}


