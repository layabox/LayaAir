import { AnimatorState2D } from "../../components/AnimatorState2D";
import { AnimatorState } from "../component/Animator/AnimatorState";

/**
 * <code>AnimatorStateScript</code> 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
 */
export class AnimatorStateScript {
	/**
	* 获取所属动画节点。
	*/
	owner: AnimatorState | AnimatorState2D;
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
	 * 动画状态运行中
	 * @param normalizeTime 0-1动画播放状态
	 */
	onStateUpdate(normalizeTime: number): void {

	}

	/**
	 * 动画状态退出时执行。
	 */
	onStateExit(): void {

	}

}


