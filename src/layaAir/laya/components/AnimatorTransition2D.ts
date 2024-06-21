import { Animation2DParm } from "./Animation2DParm";
import { AniStateConditionType } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimatorStateCondition } from "./AnimatorStateCondition";

export class AnimatorTransition2D {
    /**禁用 */
    mute: boolean;

    /**退出时间 */
    exitTime: number;

    /**是否设置生效时间 */
    exitByTime: boolean;

    /**归一化的时间的下一个state播放位置 */
    transstartoffset: number;

    /**归一化过度时间 TODO 0-1 */
    transduration: number;

    /**过渡条件 */
    conditions: AnimatorStateCondition[];

    /**目标状态 */
    destState: AnimatorState2D;

    /**
     * 当有多个条件的时候是否使用与操作
     */
    isAndOperEnabled: boolean;

    /**
     * 创建一个新的Animatortransition2D
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
     * 增加一个条件
     * @param condition 状态转换条件
     */
    addCondition(condition: AnimatorStateCondition): void {
        if (this.conditions.indexOf(condition) == -1) {
            this.conditions.push(condition);
        }
    }

    /**
     * 删除一个条件
     * @param condition 状态转换条件
     */
    removeCondition(condition: AnimatorStateCondition): void {
        let index = this.conditions.indexOf(condition);
        if (index != -1) {
            this.conditions.splice(index, 0);
        }
    }

    /**
    * 是否启用过渡
    * @param normalizeTime 归一化时间
    * @param paramsMap 条件组
    * @param isReplay 是否重复播放
    * @returns
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