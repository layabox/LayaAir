import { Filter } from "././Filter";
import { GlowFilterGLRender } from "././GlowFilterGLRender";
import { ColorUtils } from "../utils/ColorUtils";
import { BlurFilter } from "./BlurFilter";
/**
 *  发光滤镜(也可以当成阴影滤使用）
 */
export class GlowFilter extends Filter {
    /**
     * 创建发光滤镜
     * @param	color	滤镜的颜色
     * @param	blur	边缘模糊的大小
     * @param	offX	X轴方向的偏移
     * @param	offY	Y轴方向的偏移
     */
    constructor(color, blur = 4, offX = 6, offY = 6) {
        super();
        /**数据的存储，顺序R,G,B,A,blurWidth,offX,offY;*/
        this._elements = new Float32Array(9);
        this._sv_blurInfo1 = new Array(4); //给shader用
        this._sv_blurInfo2 = [0, 0, 1, 0];
        this._color = new ColorUtils(color);
        //限制最大效果为20
        this.blur = Math.min(blur, 20);
        this.offX = offX;
        this.offY = offY;
        this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = this.blur;
        this._sv_blurInfo1[2] = offX;
        this._sv_blurInfo1[3] = -offY;
        this._glRender = new GlowFilterGLRender();
    }
    /**
     * @private
     * 滤镜类型
     */
    /*override*/ get type() {
        return BlurFilter.GLOW;
    }
    /**@private */
    get offY() {
        return this._elements[6];
    }
    /**@private */
    set offY(value) {
        this._elements[6] = value;
        this._sv_blurInfo1[3] = -value;
    }
    /**@private */
    get offX() {
        return this._elements[5];
    }
    /**@private */
    set offX(value) {
        this._elements[5] = value;
        this._sv_blurInfo1[2] = value;
    }
    /**@private */
    getColor() {
        return this._color.arrColor;
    }
    /**@private */
    get blur() {
        return this._elements[4];
    }
    /**@private */
    set blur(value) {
        this._elements[4] = value;
        this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = value;
    }
    getColorNative() {
        if (!this._color_native) {
            this._color_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        var color = this.getColor();
        this._color_native[0] = color[0];
        this._color_native[1] = color[1];
        this._color_native[2] = color[2];
        this._color_native[3] = color[3];
        return this._color_native;
    }
    getBlurInfo1Native() {
        if (!this._blurInof1_native) {
            this._blurInof1_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        this._blurInof1_native[0] = this._blurInof1_native[1] = this.blur;
        this._blurInof1_native[2] = this.offX;
        this._blurInof1_native[3] = this.offY;
        return this._blurInof1_native;
    }
    getBlurInfo2Native() {
        if (!this._blurInof2_native) {
            this._blurInof2_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        this._blurInof2_native[2] = 1;
        return this._blurInof2_native;
    }
}
