import { AniStateConditionType } from "../../../components/AnimatorControllerParse";
import { AnimatorStateCondition } from "../../../components/AnimatorStateCondition";
import { AnimatorState } from "./AnimatorState";

/**
 * @en The AnimatorTransition class represents a transition between two AnimatorStates.
 * @zh AnimatorTransition 类表示两个 AnimatorState 之间的过渡。
 */
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
     *  @internal
     */
    private _isAndOperEnabled: boolean;

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
     * @en The name of the transition.
     * @zh 过渡的名称。
     */
    get name() {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    /**
     * @en Whether the transition is disabled.
     * @zh 过渡是否被禁用。
     */
    get mute() {
        return this._mute;
    }

    set mute(value: boolean) {
        this._mute = value;
    }

    /**
     * @en The destination state of the transition.
     * @zh 过渡的目标状态。
     */
    get destState() {
        return this._destState;
    }

    set destState(value: AnimatorState) {
        this._destState = value;
    }

    /**
     * @en The conditions array for the transition. Used by IDE.
     * @zh 过渡的条件数组。由IDE使用。
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
     * @en Whether the transition is triggered by time.
     * @zh 过渡是否由时间触发。
     */
    get exitByTime() {
        return this._exitByTime;
    }

    set exitByTime(value: boolean) {
        this._exitByTime = value;
    }

    /**
     * @en The normalized transition duration (relative to the target state).
     * @zh 过渡的归一化持续时间（相对于目标状态）。
     */
    set transduration(value: number) {
        this._transduration = Math.max(0, Math.min(value, 1.0));
    }

    get transduration() {
        return this._transduration;
    }


    /**
     * @en The playback time offset of the target state (normalized time).
     * @zh 目标状态的播放时间偏移（归一化时间）。
     */
    set transstartoffset(value: number) {
        this._transstartoffset = Math.max(0, Math.min(value, 1.0));
    }

    get transstartoffset() {
        return this._transstartoffset;
    }

    /**
     * @en The trigger time (normalized time).
     * @zh 触发时间（归一化时间）。
     */
    get exitTime() {
        return this._exitTime;
    }

    set exitTime(value: number) {
        this._exitTime = Math.max(0, Math.min(value, 1.0));
    }

    /**
     * @en Adds a condition to the transition.
     * @zh 增加一个条件到过渡中。
     */
    addCondition(condition: AnimatorStateCondition): void {
        if (this._conditions.indexOf(condition) == -1) {
            this._conditions.push(condition);
        }
    }

    /**
     * @en Removes a condition from the transition.
     * @param condition The condition to remove.
     * @zh 从过渡中删除一个条件。
     * @param condition 要删除的条件。
     */
    removeCondition(condition: AnimatorStateCondition): void {
        let index = this._conditions.indexOf(condition);
        if (index != -1) {
            this._conditions.splice(index, 0);
        }
    }

    /**
     * @en Whether to use AND operation when there are multiple conditions.
     * @zh 当有多个条件时是否使用与（AND）操作。
     */
    get isAndOperEnabled() {
        return this._isAndOperEnabled;
    }
    set isAndOperEnabled(vlaue: boolean) {
        this._isAndOperEnabled = vlaue;
    }

    /**
     * @en Checks if the transition should be enabled based on the current conditions and time.
     * @param normalizeTime The normalized time of the current animation state.
     * @param paramsMap A map of condition parameters, where the key is the condition ID and the value is the condition state.
     * @returns True if the transition should be enabled, false otherwise.
     * @zh 检查是否应该根据当前条件和时间启用过渡。
     * @param normalizeTime 当前动画状态的归一化时间。
     * @param paramsMap 条件参数的映射，其中键是条件ID，值是条件状态。
     * @returns 如果应该启用过渡则返回true，否则返回false。
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
            if (this._isAndOperEnabled) {
                let triggerCatch: number[];
                for (var i = 0; i < this._conditions.length; i++) {
                    let con = this._conditions[i];
                    let out = con.checkState(paramsMap[con.id]);
                    if (!out) {
                        return false;
                    }
                    if (con.type == AniStateConditionType.Trigger) {
                        if (!triggerCatch) triggerCatch = [];
                        triggerCatch.push(con.id);
                    }
                }
                if (triggerCatch) {
                    for (let id of triggerCatch) {
                        paramsMap[id] = false;
                    }
                }
                return true;
            } else {
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
        }
        return false;
    }
}