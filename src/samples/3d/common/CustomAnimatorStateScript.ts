import { AnimatorStateScript } from "laya/d3/animation/AnimatorStateScript";
/**
 * 继承自AnimatorStateScript(动画状态脚本)
 * @author ...
 */
export class CustomAnimatorStateScript extends AnimatorStateScript {

	constructor() {
		super();
	}

	/**
	* 动画状态开始时执行。
	*/
	onStateEnter(): void {
		console.log("动画开始播放了");
	}

	/**
	* 动画状态更新时执行。
	*/
	onStateUpdate(): void {
		console.log("动画状态更新了");
	}

	/**
	* 动画状态退出时执行。
	*/
	onStateExit(): void {
		console.log("动画退出了");
	}
}


