import { GlowEffect2D } from "../display/effect2d/GlowEffect2D";
import { PostProcess2DEffect } from "../display/PostProcess2DEffect";
import { ClassUtils } from "../utils/ClassUtils";
import { Filter } from "./Filter";

/**
 * @deprecated use post2DProcess 
 * @en Luminous filter (can also be used as shadow filter)
 * @zh 发光滤镜(也可以当成阴影滤使用）
 */
export class GlowFilter extends Filter {

    _effect2D: GlowEffect2D;
    /**
     * @en Creates an instance of a glow filter.
     * @param color The color of the glow filter. 
     * @param blur The size of blurred edges
     * @param offX The horizontal offset for the glow effect.
     * @param offY The vertical offset for the glow effect.
     * @zh 创建一个发光滤镜实例。
     * @param color 发光滤镜的颜色。
     * @param blur 边缘模糊的大小。
     * @param offX 发光效果的水平偏移。
     * @param offY 发光效果的垂直偏移。
     */
    constructor(color: string, blur = 4, offX = 6, offY = 6) {
        super();
        this._effect2D = new GlowEffect2D(color, blur, offX, offY);
    }

    getEffect(): PostProcess2DEffect {
        return this._effect2D;
    }

    /**
     * @en Gets Y offset value
     * @zh 获取Y偏移值
     */
    get offY(): number {
        return this._effect2D.offsetY;
    }

    /**
     * @en Sets Y offset value
     * @zh 设置Y偏移值
     */
    set offY(value: number) {
        this._effect2D.offsetY = value;
        this.onChange();
    }

    /**
     * @en Gets X offset value
     * @zh 获取X偏移值
     */
    get offX(): number {
        return this._effect2D.offsetX;
    }

    /**
     * @en Sets X offset value
     * @zh 设置X偏移值
     */
    set offX(value: number) {
        this._effect2D.offsetX = value;
        this.onChange();
    }

    /**
     * @en Gets X color value
     * @zh 获取颜色值
     */
    get color(): string {
        return this._effect2D.color;
    }

    /**
     * @en Sets X color value
     * @zh 设置颜色值
     */
    set color(value: string) {
        this._effect2D.color = value;
        this.onChange();
    }

    /**
     * @en Gest fuzzy value
     * @zh 获取模糊值
     */
    get blur(): number {
        return this._effect2D.blur;
    }

    /**
     * @en Sets fuzzy value
     * @zh 设置模糊值
     */
    set blur(value: number) {
        this._effect2D.blur = value;
        this.onChange();
    }

}

ClassUtils.regClass("GlowFilter", GlowFilter);   