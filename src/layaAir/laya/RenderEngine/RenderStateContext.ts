import { LayaGL } from "../layagl/LayaGL";
import { BlendEquationSeparate } from "../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../RenderEngine/RenderEnum/CompareFunction";
import { RenderStateType } from "../RenderEngine/RenderEnum/RenderStateType";
import { StencilOperation } from "../RenderEngine/RenderEnum/StencilOperation";
import { RenderStateCommand } from "../RenderEngine/RenderStateCommand";
/**
 * @private
 */
export class RenderStateContext {
    static mainContext: any;

    static DepthTestCMD: RenderStateCommand;
    static DepthMaskCMD: RenderStateCommand;
    static DepthFuncCMD: RenderStateCommand;
    static StencilTestCMD: RenderStateCommand;
    static StencilMaskCMD: RenderStateCommand;
    static StencilFuncCMD: RenderStateCommand;
    static stencilOpCMD: RenderStateCommand;
    static BlendCMD: RenderStateCommand;
    static BlendEquationCMD: RenderStateCommand;
    static BlendEquationSeparateCMD: RenderStateCommand;
    static BlendFuncCMD: RenderStateCommand;
    static BlendFuncSeperateCMD: RenderStateCommand;
    static CullFaceCMD: RenderStateCommand;
    static FrontFaceCMD: RenderStateCommand;
    static stencilFuncArray = new Array<number>(2);
    static blendEquationSeparateArray = new Array<number>(2);
    static blenfunArray = new Array(2);
    static blendFuncSeperateArray = new Array(4);
    static stencilOpArray = new Array<number>(3);
    static __init__() {
        RenderStateContext.DepthTestCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.DepthMaskCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.DepthFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.StencilTestCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.StencilMaskCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.StencilFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.stencilOpCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.BlendCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.BlendEquationCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.BlendEquationSeparateCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.BlendFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.BlendFuncSeperateCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.CullFaceCMD = LayaGL.renderEngine.createRenderStateComand();
        RenderStateContext.FrontFaceCMD = LayaGL.renderEngine.createRenderStateComand();
    }
    /**
     * @internal
     */
    static setDepthTest(value: boolean): void {
        RenderStateContext.DepthTestCMD.clear();
        RenderStateContext.DepthTestCMD.addCMD(RenderStateType.DepthTest, value);
        RenderStateContext.DepthTestCMD.applyCMD();
    }

    /**
     * @internal
     */
    static setDepthMask(value: boolean): void {
        RenderStateContext.DepthMaskCMD.clear();
        RenderStateContext.DepthMaskCMD.addCMD(RenderStateType.DepthMask, value);
        RenderStateContext.DepthMaskCMD.applyCMD();
    }

    /**
     * @internal
     */
    static setDepthFunc(value: CompareFunction): void {
        RenderStateContext.DepthFuncCMD.clear();
        RenderStateContext.DepthFuncCMD.addCMD(RenderStateType.DepthFunc, value);
        RenderStateContext.DepthFuncCMD.applyCMD();
    }

    /**
     * @internal
     */
    static setStencilTest(value: boolean): void {
        RenderStateContext.StencilTestCMD.clear();
        RenderStateContext.StencilTestCMD.addCMD(RenderStateType.StencilTest, value);
        RenderStateContext.StencilTestCMD.applyCMD();
    }

    /**
     * 模板写入开关
     * @param gl 
     * @param value 
     */
    static setStencilMask(value: boolean): void {
        RenderStateContext.StencilMaskCMD.clear();
        RenderStateContext.StencilMaskCMD.addCMD(RenderStateType.StencilMask, value);
        RenderStateContext.StencilMaskCMD.applyCMD();
    }


    /**
     * @internal
     */
    static setStencilFunc(fun: CompareFunction, ref: number): void {
        RenderStateContext.StencilFuncCMD.clear();
        RenderStateContext.stencilFuncArray[0] = fun;
        RenderStateContext.stencilFuncArray[1] = ref;
        RenderStateContext.StencilFuncCMD.addCMD(RenderStateType.StencilFunc, RenderStateContext.stencilFuncArray);
        RenderStateContext.StencilFuncCMD.applyCMD();
    }

    /**
    * @internal
    */
    static setstencilOp(fail: StencilOperation, zfail: StencilOperation, zpass: StencilOperation) {
        RenderStateContext.stencilOpCMD.clear();
        RenderStateContext.stencilOpArray[0] = fail;
        RenderStateContext.stencilOpArray[1] = zfail;
        RenderStateContext.stencilOpArray[2] = zpass;
        RenderStateContext.stencilOpCMD.addCMD(RenderStateType.StencilOp, RenderStateContext.stencilOpArray);
        RenderStateContext.stencilOpCMD.applyCMD();
    }



    /**
     * @internal
     */
    static setBlend(value: boolean): void {
        RenderStateContext.BlendCMD.clear();
        if (!value)
            RenderStateContext.BlendCMD.addCMD(RenderStateType.BlendType, BlendType.BLEND_DISABLE);
        else
            RenderStateContext.BlendCMD.addCMD(RenderStateType.BlendType, BlendType.BLEND_ENABLE_SEPERATE);
        RenderStateContext.BlendCMD.applyCMD();
    }


    /**
     * @internal
     */
    static setBlendEquation(blendEquation: BlendEquationSeparate): void {
        RenderStateContext.BlendEquationCMD.clear();
        RenderStateContext.BlendEquationCMD.addCMD(RenderStateType.BlendEquation, blendEquation);
        RenderStateContext.BlendEquationCMD.applyCMD();
    }


    /**
     * @internal
     */
    static setBlendEquationSeparate(blendEquationRGB: BlendEquationSeparate, blendEquationAlpha: BlendEquationSeparate): void {
        RenderStateContext.BlendEquationSeparateCMD.clear();
        RenderStateContext.blendEquationSeparateArray[0] = blendEquationRGB;
        RenderStateContext.blendEquationSeparateArray[1] = blendEquationAlpha;
        RenderStateContext.BlendEquationSeparateCMD.addCMD(RenderStateType.BlendEquationSeparate, RenderStateContext.blendEquationSeparateArray)
        RenderStateContext.BlendEquationSeparateCMD.applyCMD();
    }


    /**
     * @internal
     */
    static setBlendFunc(sFactor: BlendFactor, dFactor: BlendFactor, force: boolean = false): void {
        RenderStateContext.BlendFuncCMD.clear();
        RenderStateContext.blenfunArray[0] = sFactor;
        RenderStateContext.blenfunArray[1] = dFactor;
        RenderStateContext.BlendFuncCMD.addCMD(RenderStateType.BlendFunc, RenderStateContext.blenfunArray);
        RenderStateContext.BlendFuncCMD.applyCMD();
    }

    /**
     * @internal
     */
    static setBlendFuncSeperate(srcRGB: BlendFactor, dstRGB: BlendFactor, srcAlpha: BlendFactor, dstAlpha: BlendFactor): void {
        RenderStateContext.BlendFuncSeperateCMD.clear();
        RenderStateContext.blendFuncSeperateArray[0] = srcRGB;
        RenderStateContext.blendFuncSeperateArray[1] = dstRGB;
        RenderStateContext.blendFuncSeperateArray[2] = srcAlpha;
        RenderStateContext.blendFuncSeperateArray[3] = dstAlpha;
        RenderStateContext.BlendFuncSeperateCMD.addCMD(RenderStateType.BlendFuncSeperate, RenderStateContext.blendFuncSeperateArray);
        RenderStateContext.BlendFuncSeperateCMD.applyCMD();
    }
}


