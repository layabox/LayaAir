import { GradientDataInt } from "./GradientDataInt";
import { IClone } from "../../../../utils/IClone"


/**
 * @en The FrameOverTime class is used to create time frames.
 * @zh FrameOverTime 类用于创建时间帧。
 */
export class FrameOverTime implements IClone {
    /**
     * @en Create a FrameOverTime instance with a constant frame.
     * @param constant The constant frame.
     * @returns The time frame.
     * @zh 通过固定帧创建一个 FrameOverTime 实例。
     * @param constant 固定帧。
     * @return 时间帧。
     */
    static createByConstant(constant: number = 0): FrameOverTime {
        var rotationOverLifetime: FrameOverTime = new FrameOverTime();
        rotationOverLifetime._type = 0;
        rotationOverLifetime._constant = constant;
        return rotationOverLifetime;
    }

    /**
     * @en Create a FrameOverTime instance with a time frame.
     * @param overTime The time frame.
     * @returns The time frame.
     * @zh 通过时间帧创建一个 FrameOverTime 实例。
     * @param	overTime 时间帧。
     * @return 时间帧。
     */
    static createByOverTime(overTime: GradientDataInt): FrameOverTime {
        var rotationOverLifetime: FrameOverTime = new FrameOverTime();
        rotationOverLifetime._type = 1;
        rotationOverLifetime._overTime = overTime;
        return rotationOverLifetime;
    }

    /**
     * @en Create a FrameOverTime instance with random two constant frames.
     * @param constantMin The minimum constant frame.
     * @param constantMax The maximum constant frame.
     * @returns The time frame.
     * @zh 通过随机双固定帧创建一个 FrameOverTime 实例。
     * @param	constantMin 最小固定帧。
     * @param	constantMax 最大固定帧。
     * @return 时间帧。
     */
    static createByRandomTwoConstant(constantMin: number = 0, constantMax: number = 0): FrameOverTime {
        var rotationOverLifetime: FrameOverTime = new FrameOverTime();
        rotationOverLifetime._type = 2;
        rotationOverLifetime._constantMin = constantMin;
        rotationOverLifetime._constantMax = constantMax;
        return rotationOverLifetime;
    }

    /**
     * @en Create a FrameOverTime instance with random two time frames.
     * @param gradientFrameMin The minimum time frame.
     * @param gradientFrameMax The maximum time frame.
     * @returns The time frame.
     * @zh 通过随机双时间帧创建一个 FrameOverTime 实例。
     * @param	gradientFrameMin 最小时间帧。
     * @param	gradientFrameMax 最大时间帧。
     * @return 时间帧。
     */
    static createByRandomTwoOverTime(gradientFrameMin: GradientDataInt, gradientFrameMax: GradientDataInt): FrameOverTime {
        var rotationOverLifetime: FrameOverTime = new FrameOverTime();
        rotationOverLifetime._type = 3;
        rotationOverLifetime._overTimeMin = gradientFrameMin;
        rotationOverLifetime._overTimeMax = gradientFrameMax;
        return rotationOverLifetime;
    }

    private _type: number = 0;

    private _constant: number = 0;

    private _overTime: GradientDataInt = null;

    private _constantMin: number = 0;
    private _constantMax: number = 0;

    private _overTimeMin: GradientDataInt = null;
    private _overTimeMax: GradientDataInt = null;

    /**
     * @en Lifecycle rotation type, 0: constant mode, 1: curve mode, 2: random double constant mode, 3: random double curve mode.
     * @zh 生命周期旋转类型，0：常量模式，1：曲线模式，2：随机双常量模式，3：随机双曲线模式。
     */
    get type(): number {
        return this._type;
    }

    /**
     * @en Constant frame.
     * @zh 固定帧。
     */
    get constant(): number {
        return this._constant;
    }

    /**
     * @en Time frame.
     * @zh 时间帧。
     */
    get frameOverTimeData(): GradientDataInt {
        return this._overTime;
    }

    /**
     * @en Minimum constant frame.
     * @zh 最小固定帧。
     */
    get constantMin(): number {
        return this._constantMin;
    }

    /**
     * @en Maximum constant frame.
     * @zh 最大固定帧。
     */
    get constantMax(): number {
        return this._constantMax;
    }

    /**
     * @en Minimum time frame.
     * @zh 最小时间帧。
     */
    get frameOverTimeDataMin(): GradientDataInt {
        return this._overTimeMin;
    }

    /**
     * @en Maximum time frame.
     * @zh 最大时间帧。
     */
    get frameOverTimeDataMax(): GradientDataInt {
        return this._overTimeMax;
    }

    /**
     * @ignore
     * @en Creation via `new` is not allowed; please use the static creation function.
     * @zh 不允许new，请使用静态创建函数。
     */
    constructor() {

    }

    /**
     * @en Clones to a target object.
     * @param destFrameOverTime The target object to clone to.
     * @zh 克隆到目标对象。
     * @param destFrameOverTime 要克隆到的目标对象。
     */
    cloneTo(destFrameOverTime: FrameOverTime): void {
        destFrameOverTime._type = this._type;
        destFrameOverTime._constant = this._constant;
        if (this._overTime) {
            if (!destFrameOverTime._overTime) destFrameOverTime._overTime = this._overTime.clone();
            else this._overTime.cloneTo(destFrameOverTime._overTime);
        }
        destFrameOverTime._constantMin = this._constantMin;
        destFrameOverTime._constantMax = this._constantMax;

        if (this._overTimeMin) {
            if (!destFrameOverTime._overTimeMin) destFrameOverTime._overTimeMin = this._overTimeMin.clone();
            else this._overTimeMin.cloneTo(destFrameOverTime._overTimeMin);
        }

        if (this._overTimeMax) {
            if (!destFrameOverTime._overTimeMax) destFrameOverTime._overTimeMax = this._overTimeMax.clone();
            this._overTimeMax.cloneTo(destFrameOverTime._overTimeMax)
        }
    }

    /**
     * @en Clone.
     * @returns Clone copy.
     * @zh 克隆。
     * @returns 克隆副本。
     */
    clone(): any {
        var destFrameOverTime: FrameOverTime = new FrameOverTime();
        this.cloneTo(destFrameOverTime);
        return destFrameOverTime;
    }

}