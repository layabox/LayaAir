import { BlurEffect2D } from "../../display/effect2d/BlurEffect2D";
import { Filter } from "./Filter";

/**
 * @deprecated use post2DProcess 
 * @en Blur filter
 * @zh 模糊滤镜
 */
export class BlurFilter extends Filter {
    /**
     * @internal 
     */
    _effect2D: BlurEffect2D;
    /**
     * @en Gets the effect2d instance.
     * @zh 获取 effect2d 实例。
     */
    getEffect() {
        return this._effect2D;
    }
    /**
     * @en Constructs a new BlurFilter instance with the specified strength.
     * The strength of the blur filter, with a default value of 4. Higher values result in a more indistinct image.
     * @param strength The strength of the blur filter. The default value is 4.
     * @zh 创建一个新的模糊滤镜实例，并设置指定的强度值。
     * 模糊滤镜的强度，默认值为4。值越大，图像越不清晰。
     * @param strength 模糊滤镜的强度。默认值为4。
     */
    constructor(strength = 4) {
        super();
        this._effect2D = new BlurEffect2D();
        this.strength = strength;
    }

    /**
     * @en The strength of the blur filter.
     * @zh 模糊滤镜的强度。
     */
    get strength() {
        return this._effect2D.strength;
    }

    set strength(v: number) {
        this._effect2D.strength = v;
        this.onChange();
    }


}

