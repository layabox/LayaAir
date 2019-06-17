import { Filter } from "././Filter";
/**
 * 模糊滤镜
 */
export declare class BlurFilter extends Filter {
    /**模糊滤镜的强度(值越大，越不清晰 */
    strength: number;
    strength_sig2_2sig2_gauss1: any[];
    strength_sig2_native: Float32Array;
    renderFunc: any;
    /**
     * 模糊滤镜
     * @param	strength	模糊滤镜的强度值
     */
    constructor(strength?: number);
    /**
     * @private
     * 当前滤镜的类型
     */
    readonly type: number;
    getStrenth_sig2_2sig2_native(): Float32Array;
}
