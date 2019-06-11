import { IClone } from "../../IClone";
/**
 * <code>StartFrame</code> 类用于创建开始帧。
 */
export declare class StartFrame implements IClone {
    /**
     * 通过随机常量旋转创建一个 <code>StartFrame</code> 实例。
     * @param	constant  固定帧。
     * @return 开始帧。
     */
    static createByConstant(constant: number): StartFrame;
    /**
     *  通过随机双常量旋转创建一个 <code>StartFrame</code> 实例。
     * @param	constantMin 最小固定帧。
     * @param	constantMax 最大固定帧。
     * @return 开始帧。
     */
    static createByRandomTwoConstant(constantMin: number, constantMax: number): StartFrame;
    /**@private */
    private _type;
    /**@private */
    private _constant;
    /**@private */
    private _constantMin;
    /**@private */
    private _constantMax;
    /**
     *开始帧类型,0常量模式，1随机双常量模式。
     */
    readonly type: number;
    /**
     * 固定帧。
     */
    readonly constant: number;
    /**
     * 最小固定帧。
     */
    readonly constantMin: number;
    /**
     * 最大固定帧。
     */
    readonly constantMax: number;
    /**
     * 创建一个 <code>StartFrame,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor();
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
