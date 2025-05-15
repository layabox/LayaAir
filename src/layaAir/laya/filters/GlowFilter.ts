import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ColorEffect2D } from "../RenderDriver/RenderModuleData/WebModuleData/2D/Effect2D/ColorEffect2D";
import { GlowEffect2D } from "../RenderDriver/RenderModuleData/WebModuleData/2D/Effect2D/GlowEffect2D";
import { PostProcess2DEffect } from "../RenderDriver/RenderModuleData/WebModuleData/2D/PostProcess2DEffect";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { ColorUtils } from "../utils/ColorUtils";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Filter } from "./Filter";

/**
 * @en Luminous filter (can also be used as shadow filter)
 * @zh 发光滤镜(也可以当成阴影滤使用）
 */
export class GlowFilter extends Filter {

    /**滤镜的颜色*/
    private _color: ColorUtils;
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
   
        //限制最大效果为20
        this._effect2D = new GlowEffect2D();
             this.color = color || "#000";
        this.blur = Math.min(blur, 20);
        this.offX = offX;
        this.offY = offY;

    }
    getEffect(): PostProcess2DEffect {
        return this._effect2D;
    }

    /**
     * @private
     * @en Gets Y offset value
     * @zh 获取Y偏移值
     */
    get offY(): number {
        return this._effect2D.sv_blurInfo1.w;
    }

    /**
     * @private
     * @en Sets Y offset value
     * @zh 设置Y偏移值
     */
    set offY(value: number) {
        this._effect2D.sv_blurInfo1.w = value;
        this._effect2D.sv_blurInfo1 = this._effect2D.sv_blurInfo1;
        this.onChange();
    }

    /**
     * @private
     * @en Gets X offset value
     * @zh 获取X偏移值
     */
    get offX(): number {
        return this._effect2D.sv_blurInfo1.z;
    }

    /**
     * @private
     * @en Sets X offset value
     * @zh 设置X偏移值
     */
    set offX(value: number) {
        this._effect2D.sv_blurInfo1.z = value;
        this._effect2D.sv_blurInfo1 = this._effect2D.sv_blurInfo1;
        this.onChange();
    }

    /**
     * @private
     * @en Gets X color value
     * @zh 获取颜色值
     */
    get color(): string {
        return this._color.strColor;
    }

    /**
     * @private
     * @en Sets X color value
     * @zh 设置颜色值
     */
    set color(value: string) {
        this._color = new ColorUtils(value);
        let color = this._color.arrColor;
        this._effect2D.color.setValue(color[0], color[1], color[2], color[3])
        this._effect2D.color = this._effect2D.color;
        this.onChange();
    }

    /**
     * @private
     * @en Gest fuzzy value
     * @zh 获取模糊值
     */
    get blur(): number {
        return this._effect2D.sv_blurInfo1.y;
    }

    /**
     * @private
     * @en Sets fuzzy value
     * @zh 设置模糊值
     */
    set blur(value: number) {
        this._effect2D.sv_blurInfo1.x = this._effect2D.sv_blurInfo1.y = value;
        this._effect2D.sv_blurInfo1 = this._effect2D.sv_blurInfo1;
        //this._effect2D.blue
        this.onChange();
    }

}

