import { BlendEquationSeparate } from "../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../RenderEngine/RenderEnum/CompareFunction";
import { CullMode } from "../RenderEngine/RenderEnum/CullMode";
import { RenderStateType } from "../RenderEngine/RenderEnum/RenderStateType";
import { StencilOperation } from "../RenderEngine/RenderEnum/StencilOperation";
import { RenderStateCommand } from "../RenderEngine/RenderStateCommand";
/**
 * @private
 */
export class RenderStateContext {
    /**@internal */
    static mainContext: WebGLRenderingContext = null;


    static DepthTestCMD: RenderStateCommand = new RenderStateCommand();
    static DepthMaskCMD: RenderStateCommand = new RenderStateCommand();
    static DepthFuncCMD: RenderStateCommand = new RenderStateCommand();
    static StencilTestCMD: RenderStateCommand = new RenderStateCommand();
    static StencilMaskCMD: RenderStateCommand = new RenderStateCommand();
    static StencilFuncCMD: RenderStateCommand = new RenderStateCommand();
    static stencilOpCMD: RenderStateCommand = new RenderStateCommand();
    static BlendCMD: RenderStateCommand = new RenderStateCommand();
    static BlendEquationCMD: RenderStateCommand = new RenderStateCommand();
    static BlendEquationSeparateCMD: RenderStateCommand = new RenderStateCommand();
    static BlendFuncCMD: RenderStateCommand = new RenderStateCommand();
    static BlendFuncSeperateCMD: RenderStateCommand = new RenderStateCommand();
    static CullFaceCMD: RenderStateCommand = new RenderStateCommand();
    static FrontFaceCMD: RenderStateCommand = new RenderStateCommand();
    static stencilFuncArray = new Array<number>(2);
    static blendEquationSeparateArray = new Array<number>(2);
    static blenfunArray = new Array(2);
    static blendFuncSeperateArray = new Array(4);
    static stencilOpArray = new Array<number>(3);
    /**
     * @internal
     */
    static setDepthTest(value: boolean): void {
        RenderStateContext.DepthTestCMD.addCMD(RenderStateType.DepthTest, value);
        RenderStateContext.DepthTestCMD.applyCMD();
        //value !== RenderStateContext._depthTest && (RenderStateContext._depthTest = value, value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST));
    }

    /**
     * @internal
     */
    static setDepthMask(value: boolean): void {
        RenderStateContext.DepthMaskCMD.addCMD(RenderStateType.DepthMask, value);
        RenderStateContext.DepthMaskCMD.applyCMD();
        //value !== RenderStateContext._depthMask && (RenderStateContext._depthMask = value, gl.depthMask(value));
    }

    /**
     * @internal
     */
    static setDepthFunc(value: CompareFunction): void {
        RenderStateContext.DepthFuncCMD.addCMD(RenderStateType.DepthFunc, value);
        RenderStateContext.DepthFuncCMD.applyCMD();
        //value !== RenderStateContext._depthFunc && (RenderStateContext._depthFunc = value, gl.depthFunc(value));
    }

    /**
     * @internal
     */
    static setStencilTest(value: boolean): void {
        RenderStateContext.StencilTestCMD.addCMD(RenderStateType.StencilTest, value);
        RenderStateContext.StencilTestCMD.applyCMD();
        //value !==RenderStateContext._stencilTest && (RenderStateContext._stencilTest = value,value?gl.enable(gl.STENCIL_TEST):gl.disable(gl.STENCIL_TEST));
    }

    /**
     * 模板写入开关
     * @param gl 
     * @param value 
     */
    static setStencilMask(value: boolean): void {
        RenderStateContext.StencilMaskCMD.addCMD(RenderStateType.StencilMask, value);
        RenderStateContext.StencilMaskCMD.applyCMD();
        //value !== RenderStateContext._stencilMask && (RenderStateContext._stencilMask = value, value?gl.stencilMask(0xff):gl.stencilMask(0x00));
    }

    
    /**
     * @internal
     */
    static setStencilFunc(fun: CompareFunction, ref: number): void {
        //if (RenderStateContext.stencilFuncArray[0] == fun || ref != RenderStateContext.stencilFuncArray[1]) {
            RenderStateContext.stencilFuncArray[0] = fun;
            RenderStateContext.stencilFuncArray[1] = ref;
            RenderStateContext.StencilFuncCMD.addCMD(RenderStateType.StencilFunc, RenderStateContext.stencilFuncArray);
            RenderStateContext.StencilFuncCMD.applyCMD();
        //}
        // if(fun!=RenderStateContext._stencilFunc||ref!=RenderStateContext._stencilRef){
        //     RenderStateContext._stencilFunc = fun;
        //     RenderStateContext._stencilRef = ref;
        //     gl.stencilFunc(fun,ref,0xff);
        // }
    }
    
    /**
    * @internal
    */
    static setstencilOp(fail: StencilOperation, zfail: StencilOperation, zpass: StencilOperation) {
       // if (RenderStateContext.stencilOpArray[0] != fail || RenderStateContext.stencilOpArray[1] != zfail || RenderStateContext.stencilOpArray[2] != zpass) {
            RenderStateContext.stencilOpArray[0] = fail;
            RenderStateContext.stencilOpArray[1] = zfail;
            RenderStateContext.stencilOpArray[2] = zpass;
            RenderStateContext.stencilOpCMD.addCMD(RenderStateType.StencilOp, RenderStateContext.stencilOpArray);
            RenderStateContext.stencilOpCMD.applyCMD();
       // }
    }



    /**
     * @internal
     */
    static setBlend(value: boolean): void {
        if(!value)
        RenderStateContext.BlendCMD.addCMD(RenderStateType.BlendType,BlendType.BLEND_DISABLE);
        else
        RenderStateContext.BlendCMD.addCMD(RenderStateType.BlendType,BlendType.BLEND_ENABLE_SEPERATE);
        RenderStateContext.BlendCMD.applyCMD();
        //value !== RenderStateContext._blend && (RenderStateContext._blend = value, value ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND));

    }


    /**
     * @internal
     */
    static setBlendEquation(blendEquation: BlendEquationSeparate): void {
        RenderStateContext.BlendEquationCMD.addCMD(RenderStateType.BlendEquation,blendEquation);
        RenderStateContext.BlendEquationCMD.applyCMD();
        // if (blendEquation !== RenderStateContext._blendEquation) {
        //     RenderStateContext._blendEquation = blendEquation;
        //     RenderStateContext._blendEquationRGB = RenderStateContext._blendEquationAlpha = null;
        //     gl.blendEquation(blendEquation);
        // }
    }

    
    /**
     * @internal
     */
    static setBlendEquationSeparate(blendEquationRGB: BlendEquationSeparate, blendEquationAlpha: BlendEquationSeparate): void {
        RenderStateContext.blendEquationSeparateArray[0] = blendEquationRGB;
        RenderStateContext.blendEquationSeparateArray[1] = blendEquationAlpha;
        RenderStateContext.BlendEquationSeparateCMD.addCMD(RenderStateType.BlendEquationSeparate,RenderStateContext.blendEquationSeparateArray)
        RenderStateContext.BlendEquationSeparateCMD.applyCMD();
        // if (blendEquationRGB !== RenderStateContext._blendEquationRGB || blendEquationAlpha !== RenderStateContext._blendEquationAlpha) {
        //     RenderStateContext._blendEquationRGB = blendEquationRGB;
        //     RenderStateContext._blendEquationAlpha = blendEquationAlpha;
        //     RenderStateContext._blendEquation = null;
        //     gl.blendEquationSeparate(blendEquationRGB, blendEquationAlpha);
        // }
    }


    /**
     * @internal
     */
    static setBlendFunc(sFactor: BlendFactor, dFactor: BlendFactor, force: boolean = false): void {
        RenderStateContext.blenfunArray[0] = sFactor;
        RenderStateContext.blenfunArray[1] = dFactor;
        RenderStateContext.BlendFuncCMD.addCMD(RenderStateType.BlendFunc,RenderStateContext.blenfunArray);
        RenderStateContext.BlendFuncCMD.applyCMD();
        // 有个iOS的bug，用原来的写法有时候会出错
        // if (force || sFactor !== _sFactor || dFactor !== _dFactor) {
        //     _sFactor = sFactor;
        //     _dFactor = dFactor;
        //     RenderStateContext._sFactorRGB = null;
        //     RenderStateContext._dFactorRGB = null;
        //     RenderStateContext._sFactorAlpha = null;
        //     RenderStateContext._dFactorAlpha = null;
        //     gl.blendFunc(sFactor, dFactor);
        // }
    }

    /**
     * @internal
     */
    static setBlendFuncSeperate(srcRGB: BlendFactor, dstRGB: BlendFactor, srcAlpha: BlendFactor, dstAlpha: BlendFactor): void {
        RenderStateContext.blendFuncSeperateArray[0] = srcRGB;
        RenderStateContext.blendFuncSeperateArray[1] = dstRGB;
        RenderStateContext.blendFuncSeperateArray[2] = srcAlpha;
        RenderStateContext.blendFuncSeperateArray[3] = dstAlpha;
        RenderStateContext.BlendFuncSeperateCMD.addCMD(RenderStateType.BlendFuncSeperate,RenderStateContext.blendFuncSeperateArray);
        RenderStateContext.BlendFuncSeperateCMD.applyCMD();
        // if (srcRGB !== RenderStateContext._sFactorRGB || dstRGB !== RenderStateContext._dFactorRGB || srcAlpha !== RenderStateContext._sFactorAlpha || dstAlpha !== RenderStateContext._dFactorAlpha) {
        //     RenderStateContext._sFactorRGB = srcRGB;
        //     RenderStateContext._dFactorRGB = dstRGB;
        //     RenderStateContext._sFactorAlpha = srcAlpha;
        //     RenderStateContext._dFactorAlpha = dstAlpha;
        //     _sFactor = null;
        //     _dFactor = null;
        //     gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
        // }
    }

    /**
     * @internal
     */
    static setCullFace(value: boolean): void {
        RenderStateContext.CullFaceCMD.addCMD(RenderStateType.CullFace,value);
        //value !== RenderStateContext._cullFace && (RenderStateContext._cullFace = value, value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE));
    }

    /**
     * @internal
     */
    static setFrontFace(value: CullMode): void {
        RenderStateContext.FrontFaceCMD.addCMD(RenderStateType.FrontFace,value);
        //value !== RenderStateContext._frontFace && (RenderStateContext._frontFace = value, gl.frontFace(value));
    }

}


