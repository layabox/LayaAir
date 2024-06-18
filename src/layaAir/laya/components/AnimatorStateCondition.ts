import { AniStateConditionType, AniStateConditionNumberCompressType } from "./AnimatorControllerParse";

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
     * 通过名称获得唯一ID。
     * @param name Shader属性名称。
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
     * 通过ID获得唯一名称。
     * @param id 条件ID
     * @returns 
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
     * 状态机过渡条件
     */
    constructor(name: string = null) {
        if (!name) return;
        this._id = AnimatorStateCondition.conditionNameToID(name);
        this._name = name;
    }

    /**
     * 唯一ID
     */
    get id() {
        return this._id;
    }

    /**
     * 名称
     */
    get name() {
        return this._name;
    }

    set name(value: string) {
        this._id = AnimatorStateCondition.conditionNameToID(value);
        this._name = value
    }

    /**
     * 条件类型
     */
    get type() {
        return this._type;
    }

    /**
     * 检查状态是否触发
     * @param value 数值或bool
     * @returns 
     */
    checkState(value: number | boolean): boolean {
        return false;
    }
}

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
     * 创建number比较条件类
     * @param name 
     */
    constructor(name: string) {
        super(name);
        this._numberValue = 0;
        this._numberCompareFlag = AniStateConditionNumberCompressType.Greater;
        this._type = AniStateConditionType.Number;
    }

    /**
     * number值
     */
    get numberValue() {
        return this._numberValue;
    }

    set numberValue(value: number) {
        this._numberValue = value;
    }

    /**
     * 判断类型
     */
    get compareFlag() {
        return this._numberCompareFlag;
    }

    set compareFlag(value: AniStateConditionNumberCompressType) {
        this._numberCompareFlag = value;
    }

    /**
     * 检查状态是否触发
     * @param value 数值
     * @returns 
     */
    checkState(value: number): boolean {
        if (AniStateConditionNumberCompressType.Greater == this._numberCompareFlag)
            return value > this._numberValue;
        else
            return value < this._numberValue;
    }
}

export class AnimatorStateBoolCondition extends AnimatorStateCondition {
    /**
     * @internal
     */
    private _compareFlag: boolean;

    /**
     * 创建bool比较条件类
     * @param name 
     */
    constructor(name: string) {
        super(name);
        this._compareFlag = true;
        this._type = AniStateConditionType.Bool;
    }

    /**
     * 判断类型 
     */
    get compareFlag() {
        return this._compareFlag;
    }

    set compareFlag(value: boolean) {
        this._compareFlag = value;
    }

    /**
     * 检查状态是否触发
     * @param value bool
     * @returns 
     */
    checkState(value: boolean): boolean {
        return this._compareFlag == value;
    }
}

export class AnimatorStateTriggerCondition extends AnimatorStateCondition {
    /**
     * 创建trigger比较条件类
     * @param name 
     */
    constructor(name: string) {
        super(name);
        this._type = AniStateConditionType.Trigger;
    }

    /**
     * 检查状态是否触发,tigger 如果是true,就算条件达成
     * @param value bool
     * @returns 
     */
    checkState(value: boolean): boolean {
        return value;
    }
}