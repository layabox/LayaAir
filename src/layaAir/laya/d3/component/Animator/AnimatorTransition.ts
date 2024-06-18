import { AniStateConditionType } from "../../../components/AnimatorControllerParse";
import { AnimatorStateCondition } from "../../../components/AnimatorStateCondition";
import { AnimatorState } from "./AnimatorState";

export class AnimatorTransition {

    /**
     * @internal
     */
    private _name: string;

    /**
     * @internal
     */
    private _mute: boolean;//can,t play on this transition

    /**
     * @internal
     */
    private _exitTime: number;//退出时间

    /**
     * @internal
     */
    private _exitByTime: boolean;//是否设置生效时间

    /**
     * @internal
     */
    private _transstartoffset: number;//归一化的时间的下一个state播放位置

    /**
     * @internal
     */
    private _transduration: number;//归一化过度时间 0-1

    /**
     * @internal
     */
    private _conditions: AnimatorStateCondition[];//

    /**
     * @internal
     */
    private _destState: AnimatorState;

    /**
     * 创建一个新的Animatortransition
     */
    constructor() {
        this._conditions = [];
        this._exitByTime = true;
        this._exitTime = 0.85;
        this._transduration = 0.15;
        this._transstartoffset = 0;
        this._mute = false;
    }

    /**
     * 设置过渡名字
     */
    get name() {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    /**
     * 禁用
     */
    get mute() {
        return this._mute;
    }

    set mute(value: boolean) {
        this._mute = value;
    }

    /**
     * 目标状态
     */
    get destState() {
        return this._destState;
    }

    set destState(value: AnimatorState) {
        this._destState = value;
    }

    /**
     * 设置condition数组
     * IDE
     */
    get conditions() {
        return this._conditions;
    }

    set conditions(value: AnimatorStateCondition[]) {
        for (var i = this._conditions.length - 1; i >= 0; i--) {
            this.removeCondition(this._conditions[i]);
        }

        for (var i = 0; i < value.length; i++) {
            this.addCondition(value[i]);
        }
    }

    /**
     * 时间触发
     */
    get exitByTime() {
        return this._exitByTime;
    }

    set exitByTime(value: boolean) {
        this._exitByTime = value;
    }

    /**
     * 过度归一化时间（相对于目标State）
     */
    set transduration(value: number) {
        this._transduration = Math.max(0, Math.min(value, 1.0));
    }

    get transduration() {
        return this._transduration;
    }


    /**
    * 目标State播放时间偏移（归一化时间）
    */
    set transstartoffset(value: number) {
        this._transstartoffset = Math.max(0, Math.min(value, 1.0));
    }

    get transstartoffset() {
        return this._transstartoffset;
    }

    /**
    * 触发时间（归一化时间）
    */
    set exitTime(value: number) {
        this._exitTime = Math.max(0, Math.min(value, 1.0));
    }

    get exitTime() {
        return this._exitTime;
    }

    /**
     * 增加一个条件
     * @param condition 条件
     */
    addCondition(condition: AnimatorStateCondition): void {
        if (this._conditions.indexOf(condition) == -1) {
            this._conditions.push(condition);
        }
    }

    /**
     * 删除一个条件
     * @param condition 条件
     */
    removeCondition(condition: AnimatorStateCondition): void {
        let index = this._conditions.indexOf(condition);
        if (index != -1) {
            this._conditions.splice(index, 0);
        }
    }

    /**
     * 是否启用过渡
     * @param normalizeTime 归一化时间
     * @param paramsMap 条件组
     */
    check(normalizeTime: number, paramsMap: { [key: number]: number | boolean }): boolean {
        if (this._mute) {
            return false;
        }
        if (this._conditions.length == 0) {
            if (normalizeTime >= this._exitTime)
                return true;
        } else {
            if (this._exitByTime && normalizeTime < this._exitTime) {
                return false;
            }
            for (var i = 0; i < this._conditions.length; i++) {
                let con = this._conditions[i];
                let out = con.checkState(paramsMap[con.id]);
                if (out) {
                    if (con.type == AniStateConditionType.Trigger)
                        paramsMap[con.id] = false;
                    return true;
                }
            }
        }
        return false;
    }
}