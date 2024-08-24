import { AniStateConditionType, AniStateConditionNumberCompressType } from "./AnimatorControllerParse";

/**
 * @en Animation state machine transition condition 
 * @zh 动画状态机过渡条件 
 */
export class AnimatorStateCondition {
    /**
     * @internal
     */
    static _conditionNameMap: any = {};

    /**
     * @internal
     */
    static _propertyNameCounter: number = 0;

    /**
     * @en Gets the unique ID associated with a name.
     * @param name The unique name.
     * @return The unique ID.
     * @zh 根据名称获取唯一的ID。
     * @param name 唯一的名称。
     * @return 唯一ID。
     */
    static conditionNameToID(name: string): number {
        if (AnimatorStateCondition._conditionNameMap[name] != null) {
            return AnimatorStateCondition._conditionNameMap[name];
        } else {
            var id: number = this._propertyNameCounter++;
            this._conditionNameMap[name] = id;
            this._conditionNameMap[id] = name;
            return id;
        }
    }

    /**
     * @en Gets the unique name associated with an ID.
     * @param id The condition ID.
     * @returns The unique name.
     * @zh 根据ID获取唯一的名称。
     * @param id 条件ID。
     * @returns 唯一名称。
     */
    static conditionIDToName(id: number): string {
        return this._conditionNameMap[id];
    }

    /**
     * @internal 状态条件类型
     */
    protected _type: AniStateConditionType;

    /**
     * @internal
     */
    private _id: number;

    /**
     * @intenral
     */
    private _name: string;

    /**
     * @en Constructor method of AnimatorStateCondition.
     * @zh 动画状态机过渡条件的构造方法
     */
    constructor(name: string = null) {
        if (!name) return;
        this._id = AnimatorStateCondition.conditionNameToID(name);
        this._name = name;
    }

    /**
     * @en The unique identifier of the condition.
     * @zh 条件的唯一标识符。
     */
    get id() {
        return this._id;
    }

    /**
     * @en The name of the condition.
     * @zh 条件的名称。
     */
    get name() {
        return this._name;
    }

    set name(value: string) {
        this._id = AnimatorStateCondition.conditionNameToID(value);
        this._name = value
    }

    /**
     * @en The type of the condition.
     * @zh 条件的类型。
     */
    get type() {
        return this._type;
    }

    /**
     * @internal
     * @en Checks if the state condition is triggered based on the provided value.
     * @param value The value to check against the condition, can be a number or a boolean.
     * @zh 根据提供的值检查状态条件是否被触发。(未实现，目前只会返回false)
     * @param value 用于检查条件的值，可以是数字或布尔值。（当前未实现，只会返回false）
     */
    checkState(value: number | boolean): boolean {
        return false;
    }
}

/**
 * @en Numerical condition class. Used to handle conditions based on numerical comparisons.
 * @zh 数值条件类。用于处理基于数值比较的条件。
 */
export class AnimatorStateNumberCondition extends AnimatorStateCondition {
    /**
     * @internal
     */
    private _numberValue: number;

    /**
     * @internal
     */
    private _numberCompareFlag: AniStateConditionNumberCompressType;

    /**
     * @en Constructor method of AnimatorStateNumberCondition.
     * @zh 创建number比较条件类的构造方法
     */
    constructor(name: string) {
        super(name);
        this._numberValue = 0;
        this._numberCompareFlag = AniStateConditionNumberCompressType.Greater;
        this._type = AniStateConditionType.Number;
    }

    /**
     * @en The number value.
     * @zh 数字值。
     */
    get numberValue() {
        return this._numberValue;
    }

    set numberValue(value: number) {
        this._numberValue = value;
    }

    /**
     * @en Determine type
     * @zh 判断类型
     */
    get compareFlag() {
        return this._numberCompareFlag;
    }

    set compareFlag(value: AniStateConditionNumberCompressType) {
        this._numberCompareFlag = value;
    }

    /**
     * @en Checks if the state is triggered based on the comparison of the provided value with the number value.
     * @param value The value to compare.
     * @zh 根据提供的值与数值的比较结果检查状态是否触发。
     * @param value 要比较的值。
     */
    checkState(value: number): boolean {
        if (AniStateConditionNumberCompressType.Greater == this._numberCompareFlag)
            return value > this._numberValue;
        else
            return value < this._numberValue;
    }
}

/**
 * @en Boolean conditional class. Used to handle Boolean based conditions.
 * @zh 布尔条件类。用于处理基于布尔值的条件。
 */
export class AnimatorStateBoolCondition extends AnimatorStateCondition {
    /**
     * @internal
     */
    private _compareFlag: boolean;

    /**
     * @en Constructor method.
     * @zh 构造方法
     */
    constructor(name: string) {
        super(name);
        this._compareFlag = true;
        this._type = AniStateConditionType.Bool;
    }

    /**
     * @en Determine type
     * @zh 判断类型 
     */
    get compareFlag() {
        return this._compareFlag;
    }

    set compareFlag(value: boolean) {
        this._compareFlag = value;
    }

    /**
     * @en Checks if the state is triggered based on the comparison of the provided boolean value with the comparison flag.
     * @param value The boolean value to compare.
     * @zh 根据提供的布尔值与比较标志的比较结果检查状态是否触发。
     * @param value 要比较的布尔值。
     */
    checkState(value: boolean): boolean {
        return this._compareFlag == value;
    }
}

/**
 * @en Trigger condition class. Used to handle trigger type conditions.
 * @zh 触发器条件类。用于处理触发器类型的条件。
 */
export class AnimatorStateTriggerCondition extends AnimatorStateCondition {
    /**
     * @en Constructor method.
     * @zh 触发器条件类的构造方法
     */
    constructor(name: string) {
        super(name);
        this._type = AniStateConditionType.Trigger;
    }

    /**
     * @en Check if the state is triggered. If the trigger is true, the condition is met.
     * @param value Boolean value.
     * @zh 检查状态是否触发,tigger 如果是true,就算条件达成
     * @param value 布尔值。
     */
    checkState(value: boolean): boolean {
        return value;
    }
}