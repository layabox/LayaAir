import { Animator2D } from "./Animator2D";
import { AnimatorState2D } from "./AnimatorState2D";


interface AnimatorPlay2DScriptInfo {
    animator: Animator2D;
    layerindex: number;
    playState: AnimatorState2D;
}
/**
 * @en The AnimatorStateScript class is used as the parent class for animation state scripts. This class is abstract and does not allow instances.
 * @zh AnimatorStateScript 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
 */
export class AnimatorState2DScript {

    /**@internal */
    playStateInfo: AnimatorPlay2DScriptInfo = { animator: null, layerindex: -1, playState: null };

    /**
     * @internal
     * @en Set the play script information
     * @zh 设置播放脚本信息
     */
    setPlayScriptInfo(animator: Animator2D, layerindex: number, playstate: AnimatorState2D) {
        this.playStateInfo.animator = animator;
        this.playStateInfo.layerindex = layerindex;
        this.playStateInfo.playState = playstate;
    }

    /**
     * @en Constructor method of AnimatorStateScript.
     * @zh AnimatorStateScript的构造方法
     */
    constructor() {

    }

    /**
     * @en Executed when the animation state starts.
     * @zh 动画状态开始时执行。
     */
    onStateEnter(): void {

    }

    /**
     * @en Called during the execution of the animation state, providing the normalized play time.
     * @param normalizeTime The normalized play time of the animation, ranging from 0 to 1.
     * @zh 在动画状态运行中调用，提供归一化的播放时间。
     * @param normalizeTime 动画的归一化播放时间，范围从0到1。
     */
    onStateUpdate(normalizeTime: number): void {

    }

    /**
     * @en Executed when the animation state is about to exit.
     * @zh 动画状态退出时执行。
     */
    onStateExit(): void {

    }

    /**
     * @en Executed at the end of each loop cycle if the animation is set to loop.
     * @zh 如果动画设置为循环，在每次循环结束时执行。
     */
    onStateLoop(): void {

    }
}


