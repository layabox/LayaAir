import { Filter } from "./Filter";
import { BlurFilterGLRender } from "./BlurFilterGLRender";
/**
 * 模糊滤镜
 */
export class BlurFilter extends Filter {

    /**模糊滤镜的强度(值越大，越不清晰 */
    strength: number;
    strength_sig2_2sig2_gauss1: any[] = [];//给shader用的。避免创建对象
    strength_sig2_native: Float32Array;//给native用的
    renderFunc: any;//
    /**
     * 模糊滤镜
     * @param	strength	模糊滤镜的强度值
     */
    constructor(strength: number = 4) {
        super();
        this.strength = strength;
        this._glRender = new BlurFilterGLRender();
    }

    /**
     * @private
     * 当前滤镜的类型
     * @override
     */
    get type(): number {
        return Filter.BLUR;
    }

    getStrenth_sig2_2sig2_native(): Float32Array {
        if (!this.strength_sig2_native) {
            this.strength_sig2_native = new Float32Array(4);
        }
        //TODO James 不要每次进行计算
        var sigma: number = this.strength / 3.0;
        var sigma2: number = sigma * sigma;
        this.strength_sig2_native[0] = this.strength;
        this.strength_sig2_native[1] = sigma2;
        this.strength_sig2_native[2] = 2.0 * sigma2;
        this.strength_sig2_native[3] = 1.0 / (2.0 * Math.PI * sigma2);
        return this.strength_sig2_native;
    }
}

