import { Vector4 } from "../../math/Vector4";
/**
 * <code>RenderState</code> 类用于控制渲染状态。
 */
export class RenderState {
    /**
     * 创建一个 <code>RenderState</code> 实例。
     */
    constructor() {
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.srcBlend = RenderState.BLENDPARAM_ONE;
        this.dstBlend = RenderState.BLENDPARAM_ZERO;
        this.srcBlendRGB = RenderState.BLENDPARAM_ONE;
        this.dstBlendRGB = RenderState.BLENDPARAM_ZERO;
        this.srcBlendAlpha = RenderState.BLENDPARAM_ONE;
        this.dstBlendAlpha = RenderState.BLENDPARAM_ZERO;
        this.blendConstColor = new Vector4(1, 1, 1, 1);
        this.blendEquation = RenderState.BLENDEQUATION_ADD;
        this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
        this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
        this.depthTest = RenderState.DEPTHTEST_LEQUAL;
        this.depthWrite = true;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(dest) {
        var destState = dest;
        destState.cull = this.cull;
        destState.blend = this.blend;
        destState.srcBlend = this.srcBlend;
        destState.dstBlend = this.dstBlend;
        destState.srcBlendRGB = this.srcBlendRGB;
        destState.dstBlendRGB = this.dstBlendRGB;
        destState.srcBlendAlpha = this.srcBlendAlpha;
        destState.dstBlendAlpha = this.dstBlendAlpha;
        this.blendConstColor.cloneTo(destState.blendConstColor);
        destState.blendEquation = this.blendEquation;
        destState.blendEquationRGB = this.blendEquationRGB;
        destState.blendEquationAlpha = this.blendEquationAlpha;
        destState.depthTest = this.depthTest;
        destState.depthWrite = this.depthWrite;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new RenderState();
        this.cloneTo(dest);
        return dest;
    }
}
/**剔除枚举_不剔除。*/
RenderState.CULL_NONE = 0;
/**剔除枚举_剔除正面。*/
RenderState.CULL_FRONT = 1;
/**剔除枚举_剔除背面。*/
RenderState.CULL_BACK = 2;
/**混合枚举_禁用。*/
RenderState.BLEND_DISABLE = 0;
/**混合枚举_启用_RGB和Alpha统一混合。*/
RenderState.BLEND_ENABLE_ALL = 1;
/**混合枚举_启用_RGB和Alpha单独混合。*/
RenderState.BLEND_ENABLE_SEPERATE = 2;
/**混合参数枚举_零,例：RGB(0,0,0),Alpha:(1)。*/
RenderState.BLENDPARAM_ZERO = 0;
/**混合参数枚举_一,例：RGB(1,1,1),Alpha:(1)。*/
RenderState.BLENDPARAM_ONE = 1;
/**混合参数枚举_源颜色,例：RGB(Rs, Gs, Bs)，Alpha(As)。*/
RenderState.BLENDPARAM_SRC_COLOR = 0x0300;
/**混合参数枚举_一减源颜色,例：RGB(1-Rs, 1-Gs, 1-Bs)，Alpha(1-As)。*/
RenderState.BLENDPARAM_ONE_MINUS_SRC_COLOR = 0x0301;
/**混合参数枚举_目标颜色,例：RGB(Rd, Gd, Bd),Alpha(Ad)。*/
RenderState.BLENDPARAM_DST_COLOR = 0x0306;
/**混合参数枚举_一减目标颜色,例：RGB(1-Rd, 1-Gd, 1-Bd)，Alpha(1-Ad)。*/
RenderState.BLENDPARAM_ONE_MINUS_DST_COLOR = 0x0307;
/**混合参数枚举_源透明,例:RGB(As, As, As),Alpha(1-As)。*/
RenderState.BLENDPARAM_SRC_ALPHA = 0x0302;
/**混合参数枚举_一减源阿尔法,例:RGB(1-As, 1-As, 1-As),Alpha(1-As)。*/
RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA = 0x0303;
/**混合参数枚举_目标阿尔法，例：RGB(Ad, Ad, Ad),Alpha(Ad)。*/
RenderState.BLENDPARAM_DST_ALPHA = 0x0304;
/**混合参数枚举_一减目标阿尔法,例：RGB(1-Ad, 1-Ad, 1-Ad),Alpha(Ad)。*/
RenderState.BLENDPARAM_ONE_MINUS_DST_ALPHA = 0x0305;
/**混合参数枚举_阿尔法饱和，例：RGB(min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad)),Alpha(1)。*/
RenderState.BLENDPARAM_SRC_ALPHA_SATURATE = 0x0308;
/**混合方程枚举_加法,例：source + destination*/
RenderState.BLENDEQUATION_ADD = 0;
/**混合方程枚举_减法，例：source - destination*/
RenderState.BLENDEQUATION_SUBTRACT = 1;
/**混合方程枚举_反序减法，例：destination - source*/
RenderState.BLENDEQUATION_REVERSE_SUBTRACT = 2;
/**深度测试函数枚举_关闭深度测试。*/
RenderState.DEPTHTEST_OFF = 0 /*WebGLContext.NEVER*/; //TODO:什么鬼
/**深度测试函数枚举_从不通过。*/
RenderState.DEPTHTEST_NEVER = 0x0200 /*WebGLContext.NEVER*/;
/**深度测试函数枚举_小于时通过。*/
RenderState.DEPTHTEST_LESS = 0x0201 /*WebGLContext.LESS*/;
/**深度测试函数枚举_等于时通过。*/
RenderState.DEPTHTEST_EQUAL = 0x0202 /*WebGLContext.EQUAL*/;
/**深度测试函数枚举_小于等于时通过。*/
RenderState.DEPTHTEST_LEQUAL = 0x0203 /*WebGLContext.LEQUAL*/;
/**深度测试函数枚举_大于时通过。*/
RenderState.DEPTHTEST_GREATER = 0x0204 /*WebGLContext.GREATER*/;
/**深度测试函数枚举_不等于时通过。*/
RenderState.DEPTHTEST_NOTEQUAL = 0x0205 /*WebGLContext.NOTEQUAL*/;
/**深度测试函数枚举_大于等于时通过。*/
RenderState.DEPTHTEST_GEQUAL = 0x0206 /*WebGLContext.GEQUAL*/;
/**深度测试函数枚举_总是通过。*/
RenderState.DEPTHTEST_ALWAYS = 0x0207 /*WebGLContext.ALWAYS*/;
