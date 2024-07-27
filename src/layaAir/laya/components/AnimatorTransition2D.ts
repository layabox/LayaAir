import { Animation2DParm } from "./Animation2DParm";
import { AniStateConditionType } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimatorStateCondition } from "./AnimatorStateCondition";

/**
 * @en 2D animation transition
 * @zh 2D动画过渡
 */
export class AnimatorTransition2D {
    /**
     * @en Whether the state is muted.
     * @zh 状态是否被禁用。
     */
    mute: boolean;

    /**
     * @en The exit time of the state.
     * @zh 状态的退出时间。
     */
    exitTime: number;

    /**
     * @en Is the effective time set.
     * @zh 是否设置生效时间。
     */
    exitByTime: boolean;

    /**
     * @en The normalized playback position of the next state in the transition.
     * @zh 过渡中下一个状态的归一化播放位置。
     */
    transstartoffset: number;

    /**
     * @en The normalized transition duration.
     * @zh 归一化的过渡持续时间。
     */
    transduration: number;

    /**
     * @en Transition conditions
     * @zh 过渡条件。
     */
    conditions: AnimatorStateCondition[];

    /**
     * @en The destination state for the transition.
     * @zh 过渡的目标状态。
     */
    destState: AnimatorState2D;

    /**
     * @en Whether to use and operate when there are multiple conditions
     * @zh 当有多个条件的时候是否使用与操作
     */
    isAndOperEnabled: boolean;

    /**
     * @en Constructor method of Animatortransition2D.
     * @zh Animatortransition2D的构造方法
     */
    constructor() {
        this.conditions = [];
        this.exitByTime = true;
        this.exitTime = 1;
        this.transduration = 0;
        this.transstartoffset = 0;
        this.mute = false;
    }

    /**
     * @en Adds a state transition condition to the list of conditions.
     * @param condition The AnimatorStateCondition to be added.
     * @zh 向条件列表中添加一个状态转换条件。
     * @param condition 要添加的状态转换条件。
     */
    addCondition(condition: AnimatorStateCondition): void {
        if (this.conditions.indexOf(condition) == -1) {
            this.conditions.push(condition);
        }
    }

    /**
     * @en Removes a state transition condition from the list of conditions.
     * @param condition The AnimatorStateCondition to be removed.
     * @zh 从条件列表中删除一个状态转换条件。
     * @param condition 要删除的状态转换条件。
     */
    removeCondition(condition: AnimatorStateCondition): void {
        let index = this.conditions.indexOf(condition);
        if (index != -1) {
            this.conditions.splice(index, 0);
        }
    }

    /**
     * @en Checks whether the transition is enabled based on the normalized time, condition parameters, and replay status.
     * @param normalizeTime The current normalized time (between 0 and 1) in the animation.
     * @param paramsMap Condition group
     * @param isReplay Whether to repeat playback.
     * @zh 根据归一化时间、条件参数和重播状态检查过渡是否启用。
     * @param normalizeTime 动画中当前的归一化时间（0到1之间）。
     * @param paramsMap 条件组
     * @param isReplay 是否重复播放
     */
    check(normalizeTime: number, paramsMap: Record<string, Animation2DParm>, isReplay: boolean): boolean {
        if (this.mute) {
            return false;
        }
        if (this.exitByTime && (normalizeTime < this.exitTime && !isReplay)) {
            return false;
        }
        if (null == this.conditions || 0 == this.conditions.length) {
            return true;
        }
        if (this.isAndOperEnabled) {
            let triggerCatch: string[];
            for (var i = 0; i < this.conditions.length; i++) {
                let con = this.conditions[i];
                let out = con.checkState(paramsMap[con.name].value);
                if (!out) {
                    return false;
                }
                if (con.type == AniStateConditionType.Trigger) {
                    if (triggerCatch) triggerCatch = [];
                    triggerCatch.push(con.name);
                }
            }
            if (triggerCatch) {
                for (let id of triggerCatch) {
                    paramsMap[id].value = false;
                }
            }
            return true;
        } else {
            for (var i = 0; i < this.conditions.length; i++) {
                let con = this.conditions[i];
                let out = con.checkState(paramsMap[con.name].value);
                if (out) {
                    if (con.type == AniStateConditionType.Trigger) {
                        paramsMap[con.name].value = false;
                    }
                    return true;
                }
            }
        }

        return false;
    }
}