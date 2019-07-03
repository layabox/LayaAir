import { IFilter } from "./IFilter";
/**
 * <code>Filter</code> 是滤镜基类。
 */
export declare class Filter implements IFilter {
    /**@private 模糊滤镜。*/
    static BLUR: number;
    /**@private 颜色滤镜。*/
    static COLOR: number;
    /**@private 发光滤镜。*/
    static GLOW: number;
    /**
     * 创建一个 <code>Filter</code> 实例。
     * */
    constructor();
    /**@private 滤镜类型。*/
    readonly type: number;
    static _filter: Function;
}
