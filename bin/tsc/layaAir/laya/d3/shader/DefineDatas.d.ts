import { IClone } from "../core/IClone";
/**
 * <code>DefineDatas</code> 类用于创建宏定义数据。
 */
export declare class DefineDatas implements IClone {
    /**
     * 创建一个 <code>DefineDatas</code> 实例。
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
