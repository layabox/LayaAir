import { AnimatorStateCondition } from "../d3/component/Animator/AnimatorStateCondition";
import { Animation2DParm } from "./Animation2DParm";
import { AniStateConditionType } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";

export class AnimatorTransition2D {
    mute: boolean;
    exitTime: number;//退出时间
    exitByTime: boolean;//是否设置生效时间
    transstartoffset: number;//归一化的时间的下一个state播放位置
    transduration: number;//归一化过度时间 TODO 0-1
    conditions: AnimatorStateCondition[];//
    destState: AnimatorState2D;
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
     * @param condition 
     */
     addCondition(condition: AnimatorStateCondition): void {
        if (this.conditions.indexOf(condition) == -1) {
            this.conditions.push(condition);
        }
    }

    /**
     * 删除一个条件
     * @param condition 
     */
    removeCondition(condition: AnimatorStateCondition): void {
        let index = this.conditions.indexOf(condition);
        if (index != -1) {
            this.conditions.splice(index, 0);
        }
    }

    /**
    * 是否启用过渡
    * @param normalizeTime 
    * @param paramsMap 
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
        return false;
    }
}