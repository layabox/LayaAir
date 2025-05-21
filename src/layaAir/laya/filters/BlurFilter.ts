import { BlurEffect2D } from "../display/effect2d/BlurEffect2D";
import { Vector4 } from "../maths/Vector4";
import { Filter } from "./Filter";

/**
 * @en Integral result cache
 * @zh 积分结果缓存
 */
var _definiteIntegralMap: { [key: number]: number } = {};
/**
 * @en Blur filter
 * @zh 模糊滤镜
 */
export class BlurFilter extends Filter {
    /**
     * @en The intensity of the blur filter. The higher the value, the more indistinct the image becomes.
     * @zh 模糊滤镜的强度。值越大，图像越不清晰。
     */
    private _strength: number;

    private _shaderV1 = new Vector4();
    _effect2D: BlurEffect2D;
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
        return this._strength;
    }

    set strength(v: number) {
        this._strength = Math.max(Math.abs(v), 2);//<2的话，函数太细太高不适合下面的方法
        var sigma = this._strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2 = sigma * sigma;
        let v1 = this._shaderV1 = new Vector4(this.strength, sigma2,
            2.0 * sigma2,
            1.0 / (2.0 * Math.PI * sigma2))

        //由于目前shader中写死了blur宽度是9，相当于希望3σ是4，可是实际使用的时候经常会strength超过4，
        //这时候blur范围内的积分<1会导致变暗变透明，所以需要计算实际积分值进行放大
        //使用公式计算误差较大，直接累加把
        let s = 0;
        let key = Math.floor(this.strength * 10);
        if (_definiteIntegralMap[key] != undefined) {
            s = _definiteIntegralMap[key];
        } else {
            for (let y = -4; y <= 4; ++y) {
                for (let x = -4; x <= 4; ++x) {
                    s += v1.w * Math.exp(-(x * x + y * y) / v1.z);
                }
            }
            _definiteIntegralMap[key] = s;
        }
        v1.w /= s;

        this._effect2D.shaderV1 = v1;
        this.onChange();
    }


}

