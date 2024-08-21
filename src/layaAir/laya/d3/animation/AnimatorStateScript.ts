import { Animator } from "../component/Animator/Animator"
import { AnimatorState } from "../component/Animator/AnimatorState";

interface AnimatorPlayScriptInfo {
	animator: Animator;
	layerindex: number;
	playState: AnimatorState;
}
/**
 * @en The AnimatorStateScript class is the base class for animation state scripts. This is an abstract class and cannot be instantiated.
 * @zh AnimatorStateScript 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
 */
export class AnimatorStateScript {

	/**
	 * @internal
	 * 动画播放脚本的相关信息。
	 */
	playStateInfo: AnimatorPlayScriptInfo = { animator: null, layerindex: -1, playState: null };

	/**
	 * @internal
	 * @en Set the play script information.
	 * @param animator The animator instance.
	 * @param layerindex The index of the layer.
	 * @param playstate The animator state.
	 * @zh 设置播放脚本信息。
	 * @param animator 动画器实例。
	 * @param layerindex 层索引。
	 * @param playstate 动画状态。
	 */
	setPlayScriptInfo(animator: Animator, layerindex: number, playstate: AnimatorState) {
		this.playStateInfo.animator = animator;
		this.playStateInfo.layerindex = layerindex;
		this.playStateInfo.playState = playstate;
	}

	/**
	 * @ignore
	 * @en Creates an instance of AnimatorStateScript.
	 * @zh 创建 AnimatorStateScript 实例。
	 */
	constructor() {

	}

	/**
	 * @en Executed when the animation state begins.
	 * @zh 动画状态开始时执行。
	 */
	onStateEnter(): void {

	}

	/**
	 * @en Executed when the animation state is running.
	 * @param normalizeTime The animation playback state (0-1).
	 * @zh 动画状态运行中。
	 * @param normalizeTime 0-1动画播放状态。
	 */
	onStateUpdate(normalizeTime: number): void {

	}

	/**
	  * @en Executed when the animation state exits.
	  * @zh 动画状态退出时执行。
	  */
	onStateExit(): void {

	}
    /**
     * @en Executed at the end of each loop if the animation is set to loop.
     * @zh 如果动画设置了循环，则在每次循环结束时执行。
     */
	onStateLoop(): void {

	}
}


