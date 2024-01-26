import { WebGLEngine } from "../RenderDriver/WebglDriver/RenderDevice/WebGLEngine";
import { BlendEquationSeparate } from "../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor";
import { CompareFunction } from "../RenderEngine/RenderEnum/CompareFunction";
import { StencilOperation } from "../RenderEngine/RenderEnum/StencilOperation";
import { LayaGL } from "../layagl/LayaGL";
/**
 * @private
 */
export class RenderStateContext {
    /**@internal */
    static mainContext: any;
    // /**@internal */
    // static DepthTestCMD: RenderStateCommand;
    // /**@internal */
    // static DepthMaskCMD: RenderStateCommand;
    // /**@internal */
    // static DepthFuncCMD: RenderStateCommand;
    // /**@internal */
    // static StencilTestCMD: RenderStateCommand;
    // /**@internal */
    // static StencilMaskCMD: RenderStateCommand;
    // /**@internal */
    // static StencilFuncCMD: RenderStateCommand;
    // /**@internal */
    // static stencilOpCMD: RenderStateCommand;
    // /**@internal */
    // static BlendCMD: RenderStateCommand;
    // /**@internal */
    // static BlendEquationCMD: RenderStateCommand;
    // /**@internal */
    // static BlendEquationSeparateCMD: RenderStateCommand;
    // /**@internal */
    // static BlendFuncCMD: RenderStateCommand;
    // /**@internal */
    // static BlendFuncSeperateCMD: RenderStateCommand;
    // /**@internal */
    // static CullFaceCMD: RenderStateCommand;
    // /**@internal */
    // static FrontFaceCMD: RenderStateCommand;
    /**@internal */
    static stencilFuncArray = new Array<number>(2);
    /**@internal */
    static blendEquationSeparateArray = new Array<number>(2);
    /**@internal */
    static blenfunArray = new Array(2);
    /**@internal */
    static blendFuncSeperateArray = new Array(4);
    /**@internal */
    static stencilOpArray = new Array<number>(3);
    
    /**
     * @internal
     */
    static __init__() {
        // RenderStateContext.DepthTestCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.DepthMaskCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.DepthFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.StencilTestCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.StencilMaskCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.StencilFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.stencilOpCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.BlendCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.BlendEquationCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.BlendEquationSeparateCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.BlendFuncCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.BlendFuncSeperateCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.CullFaceCMD = LayaGL.renderEngine.createRenderStateComand();
        // RenderStateContext.FrontFaceCMD = LayaGL.renderEngine.createRenderStateComand();
    }
    /**
     * @internal
     */
    static setDepthTest(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setDepthTest(value);
    }

    /**
     * @internal
     */
    static setDepthMask(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setDepthMask(value);
    }

    /**
     * @internal
     */
    static setDepthFunc(value: CompareFunction): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setDepthFunc(value);
    }

    /**
     * @internal
     */
    static setStencilTest(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setStencilTest(value);
    }

    /**
     * 模板写入开关
     * @param gl 
     * @param value 
     */
    static setStencilMask(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setStencilMask(value);
    }


    /**
     * @internal
     */
    static setStencilFunc(fun: CompareFunction, ref: number): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setStencilFunc(fun, ref);
    }

    /**
    * @internal
    */
    static setstencilOp(fail: StencilOperation, zfail: StencilOperation, zpass: StencilOperation) {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setstencilOp(fail, zfail, zpass);
    }



    /**
     * @internal
     */
    static setBlend(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setBlend(value);
    }


    /**
     * @internal
     */
    static setBlendEquation(blendEquation: BlendEquationSeparate): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setBlendEquation(blendEquation);
    }


    /**
     * @internal
     */
    static setBlendEquationSeparate(blendEquationRGB: BlendEquationSeparate, blendEquationAlpha: BlendEquationSeparate): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
    }


    /**
     * @internal
     */
    static setBlendFunc(sFactor: BlendFactor, dFactor: BlendFactor): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setBlendFunc(sFactor, dFactor);
    }

    /**
     * @internal
     */
    static setBlendFuncSeperate(srcRGB: BlendFactor, dstRGB: BlendFactor, srcAlpha: BlendFactor, dstAlpha: BlendFactor): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    }

    /**
     * @internal
     * @param value 
     */
    static setCullFace(value: boolean): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setCullFace(value);
    }

    /**
     * @internal
     * @param value 
     */
    static setFrontFace(value: number): void {
        (LayaGL.renderEngine as WebGLEngine)._GLRenderState.setFrontFace(value);
    }
}


