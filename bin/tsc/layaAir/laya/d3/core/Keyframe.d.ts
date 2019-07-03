import { IClone } from "./IClone";
/**
     * <code>KeyFrame</code> 类用于创建关键帧实例。
     */
export declare class Keyframe implements IClone {
    /**时间。*/
    time: number;
    /**
     * 创建一个 <code>KeyFrame</code> 实例。
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
