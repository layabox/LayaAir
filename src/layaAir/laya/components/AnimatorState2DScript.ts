import { Animator2D } from "./Animator2D";
import { AnimatorState2D } from "./AnimatorState2D";


interface AnimatorPlayScriptInfo {
    animator: Animator2D;
    layerindex: number;
    playState: AnimatorState2D;
}
/**
 * <code>AnimatorStateScript</code> 类用于动画状态脚本的父类,该类为抽象类,不允许实例。
 */
export class AnimatorState2DScript {

    /**@internal */
    playStateInfo: AnimatorPlayScriptInfo = { animator: null, layerindex: -1, playState: null };

    /**@internal */
    setPlayScriptInfo(animator: Animator2D, layerindex: number, playstate: AnimatorState2D) {
        this.playStateInfo.animator = animator;
        this.playStateInfo.layerindex = layerindex;
        this.playStateInfo.playState = playstate;
    }

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
    /**
     * 动画设置了循环的话，每次循环结束时执行
     */
    onStateLoop(): void {

    }
}


