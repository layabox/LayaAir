import { BlendEquationSeparate } from "../../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../../RenderEngine/RenderEnum/BlendFactor";
import { CompareFunction } from "../../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode } from "../../../../RenderEngine/RenderEnum/CullMode";
import { StencilOperation } from "../../../../RenderEngine/RenderEnum/StencilOperation";
import { WebGLEngine } from "../WebGLEngine";

export class GLRenderState {
    //Depth
    /**@internal */
    private _depthTest: boolean = true;
    /**@internal */
    private _depthMask: boolean = true;
    /**@internal */
    private _depthFunc: number;
    //stencil
    /**@internal */
    private _stencilTest: boolean = false;
    /**@internal */
    private _stencilFunc: number;
    /**@internal */
    private _stencilMask: boolean;
    /**@internal */
    private _stencilRef: number
    /**@internal */
    private _stencilOp_fail: number;
    /**@internal */
    private _stencilOp_zfail: number;
    /**@internal */
    private _stencilOp_zpass: number;
    //blender
    /**@internal */
    private _blend: boolean = false;
    /**@internal */
    private _blendEquation: number;
    /**@internal */
    private _blendEquationRGB: number;
    /**@internal */
    private _blendEquationAlpha: number;
    /**@internal */
    private _sFactor: number;
    /**@internal */
    private _dFactor: number;
    /**@internal */
    private _sFactorRGB: number;
    /**@internal */
    private _dFactorRGB: number;
    /**@internal */
    private _sFactorAlpha: number;
    /**@internal */
    private _dFactorAlpha: number;
    //cull
    /**@internal */
    private _cullFace: boolean = false;
    /**@internal */
    private _frontFace: number;

    /**@internal */
    _engine: WebGLEngine;
    /**@internal */
    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    /**
     * intance glRenderState
     * @param engine 
     */
    constructor(engine: WebGLEngine) {
        this._engine = engine;
        this._gl = this._engine.gl;
        this._initState();
    }

    /**
     * init
     */
    private _initState() {
        //TODO:并不完全
        const gl = this._gl;
        this.setDepthFunc(CompareFunction.Less);
        this.setBlendEquationSeparate(BlendEquationSeparate.ADD, BlendEquationSeparate.ADD);
        this._blendEquation = BlendEquationSeparate.ADD;
        this._sFactor = BlendFactor.One;
        this._dFactor = BlendFactor.Zero;
        this._sFactorAlpha = BlendFactor.One;
        this._dFactorAlpha = BlendFactor.One;
    }

    /**
     * get gl blend factor
     * @param factor 
     * @returns 
     */
    _getBlendFactor(factor: BlendFactor) {
        const gl = this._gl;
        switch (factor) {
            case BlendFactor.Zero:
                return gl.ZERO;
            case BlendFactor.One:
                return gl.ONE;
            case BlendFactor.SourceColor:
                return gl.SRC_COLOR;
            case BlendFactor.OneMinusSourceColor:
                return gl.ONE_MINUS_SRC_COLOR;
            case BlendFactor.DestinationColor:
                return gl.DST_COLOR;
            case BlendFactor.OneMinusDestinationColor:
                return gl.ONE_MINUS_DST_COLOR;
            case BlendFactor.SourceAlpha:
                return gl.SRC_ALPHA;
            case BlendFactor.OneMinusSourceAlpha:
                return gl.ONE_MINUS_SRC_ALPHA;
            case BlendFactor.DestinationAlpha:
                return gl.DST_ALPHA;
            case BlendFactor.OneMinusDestinationAlpha:
                return gl.ONE_MINUS_DST_ALPHA;
            case BlendFactor.SourceAlphaSaturate:
                return gl.SRC_ALPHA_SATURATE;
            case BlendFactor.BlendColor:
                return gl.CONSTANT_COLOR;
            case BlendFactor.OneMinusBlendColor:
                return gl.ONE_MINUS_CONSTANT_COLOR;
        }
    }

    /**
     * get gl blend operation
     * @param factor 
     * @returns 
     */
    _getBlendOperation(factor: BlendEquationSeparate) {
        const gl = this._gl;
        switch (factor) {
            case BlendEquationSeparate.ADD:
                return gl.FUNC_ADD;
            case BlendEquationSeparate.SUBTRACT:
                return gl.FUNC_SUBTRACT;
            case BlendEquationSeparate.REVERSE_SUBTRACT:
                return gl.FUNC_REVERSE_SUBTRACT;
            // case BlendEquationSeparate.MIN:
            //     return -1;
            // case BlendEquationSeparate.MAX:
            //     return -1;
            default:
                throw "Unknow type"
        }
    }

    /**
     * get gl compare fun factor
     * @param compareFunction 
     * @returns 
     */
    _getGLCompareFunction(compareFunction: CompareFunction): number {
        const gl = this._gl;
        switch (compareFunction) {
            case CompareFunction.Never:
                return gl.NEVER;
            case CompareFunction.Less:
                return gl.LESS;
            case CompareFunction.Equal:
                return gl.EQUAL;
            case CompareFunction.LessEqual:
                return gl.LEQUAL;
            case CompareFunction.Greater:
                return gl.GREATER;
            case CompareFunction.NotEqual:
                return gl.NOTEQUAL;
            case CompareFunction.GreaterEqual:
                return gl.GEQUAL;
            case CompareFunction.Always:
                return gl.ALWAYS;
            default:
                return gl.LEQUAL; // todo
        }
    }

    /**
     * get gl stencil operation
     * @param compareFunction 
     * @returns 
     */
    _getGLStencilOperation(compareFunction: StencilOperation): number {
        const gl = this._gl;
        switch (compareFunction) {
            case StencilOperation.Keep:
                return gl.KEEP;
            case StencilOperation.Zero:
                return gl.ZERO;
            case StencilOperation.Replace:
                return gl.REPLACE;
            case StencilOperation.IncrementSaturate:
                return gl.INCR;
            case StencilOperation.DecrementSaturate:
                return gl.DECR;
            case StencilOperation.Invert:
                return gl.INVERT;
            case StencilOperation.IncrementWrap:
                return gl.INCR_WRAP;
            case StencilOperation.DecrementWrap:
                return gl.DECR_WRAP;
        }
    }

    /**
     * get gl frontface factor
     * @param cullmode 
     * @returns 
     */
    _getGLFrontfaceFactor(cullmode: CullMode) {
        if (cullmode == CullMode.Front)
            return this._gl.CCW;
        else
            return this._gl.CW;
    }

    //Depth
    /**
     * @internal
     */
    setDepthTest(value: boolean): void {
        value !== this._depthTest && (this._depthTest = value, value ? this._gl.enable(this._gl.DEPTH_TEST) : this._gl.disable(this._gl.DEPTH_TEST));
    }

    /**
     * @internal
     */
    setDepthMask(value: boolean): void {
        value !== this._depthMask && (this._depthMask = value, this._gl.depthMask(value));
    }

    /**
     * @internal
     * value {CompareType}
     */
    setDepthFunc(value: number): void {
        value !== this._depthFunc && (this._depthFunc = value, this._gl.depthFunc(this._getGLCompareFunction(value)));
    }


    //stencil
    /**
     * @internal
     */
    setStencilTest(value: boolean): void {
        value !== this._stencilTest && (this._stencilTest = value, value ? this._gl.enable(this._gl.STENCIL_TEST) : this._gl.disable(this._gl.STENCIL_TEST));
    }

    /**
     * 模板写入开关
     * @param value 
     */
    setStencilMask(value: boolean): void {
        value !== this._stencilMask && (this._stencilMask = value, value ? this._gl.stencilMask(0xff) : this._gl.stencilMask(0x00));
    }

    /**
     * @internal
     */
    setStencilFunc(fun: number, ref: number): void {
        if (fun != this._stencilFunc || ref != this._stencilRef) {
            this._stencilFunc = fun;
            this._stencilRef = ref;
            this._gl.stencilFunc(this._getGLCompareFunction(fun), ref, 0xff);
        }
    }

    /**
    * @internal
    */
    setstencilOp(fail: number, zfail: number, zpass: number) {
        if (this._stencilOp_fail != fail || this._stencilOp_zfail != zfail || this._stencilOp_zpass != zpass) {
            this._stencilOp_fail = fail;
            this._stencilOp_zfail = zfail;
            this._stencilOp_zpass = zpass;
            this._gl.stencilOp(this._getGLStencilOperation(fail), this._getGLStencilOperation(zfail), this._getGLStencilOperation(zpass));
        }
    }

    //blend()
    /**
     * @internal
     */
    setBlend(value: boolean): void {
        value !== this._blend && (this._blend = value, value ? this._gl.enable(this._gl.BLEND) : this._gl.disable(this._gl.BLEND));
    }

    /**
     * @internal
     */
    setBlendEquation(blendEquation: number): void {
        if (blendEquation !== this._blendEquation) {
            this._blendEquation = blendEquation;
            this._blendEquationRGB = this._blendEquationAlpha = null;
            this._gl.blendEquation(this._getBlendOperation(blendEquation));
        }
    }

    /**
     * @internal
     */
    setBlendEquationSeparate(blendEquationRGB: number, blendEquationAlpha: number): void {
        if (blendEquationRGB !== this._blendEquationRGB || blendEquationAlpha !== this._blendEquationAlpha) {
            this._blendEquationRGB = blendEquationRGB;
            this._blendEquationAlpha = blendEquationAlpha;
            this._blendEquation = null;
            this._gl.blendEquationSeparate(this._getBlendOperation(blendEquationRGB), this._getBlendOperation(blendEquationAlpha));
        }
    }

    /**
     * @internal
     */
    setBlendFunc(sFactor: number, dFactor: number, force: boolean = false): void {
        // 有个iOS的bug，用原来的写法有时候会出错
        if (force || sFactor !== this._sFactor || dFactor !== this._dFactor) {
            this._sFactor = sFactor;
            this._dFactor = dFactor;
            this._sFactorRGB = null;
            this._dFactorRGB = null;
            this._sFactorAlpha = null;
            this._dFactorAlpha = null;
            this._gl.blendFunc(this._getBlendFactor(sFactor), this._getBlendFactor(dFactor));
        }
    }

    /**
     * @internal
     */
    setBlendFuncSeperate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void {
        if (srcRGB !== this._sFactorRGB || dstRGB !== this._dFactorRGB || srcAlpha !== this._sFactorAlpha || dstAlpha !== this._dFactorAlpha) {
            this._sFactorRGB = srcRGB;
            this._dFactorRGB = dstRGB;
            this._sFactorAlpha = srcAlpha;
            this._dFactorAlpha = dstAlpha;
            this._sFactor = null;
            this._dFactor = null;
            this._gl.blendFuncSeparate(this._getBlendFactor(srcRGB), this._getBlendFactor(dstRGB), this._getBlendFactor(srcAlpha), this._getBlendFactor(dstAlpha));
        }
    }

    //cull
    /**
     * @internal
     */
    setCullFace(value: boolean): void {
        value !== this._cullFace && (this._cullFace = value, value ? this._gl.enable(this._gl.CULL_FACE) : this._gl.disable(this._gl.CULL_FACE));
    }

    /**
     * @internal
     */
    setFrontFace(value: number): void {
        value !== this._frontFace && (this._frontFace = value, this._gl.frontFace(this._getGLFrontfaceFactor(value)));
    }

    // /**
    //  * apply RenderState list
    //  * @param cmd 
    //  */
    // applyRenderStateCommand(cmd: RenderStateCommand) {
    //     let cmdArray = cmd.cmdArray;
    //     cmdArray.forEach((value, key) => {
    //         switch (key) {
    //             case RenderStateType.DepthTest:
    //                 this.setDepthTest(value);
    //                 break;
    //             case RenderStateType.DepthMask:
    //                 this.setDepthMask(value);
    //                 break;
    //             case RenderStateType.DepthFunc:
    //                 this.setDepthFunc(value);
    //                 break;
    //             case RenderStateType.StencilTest:
    //                 this.setStencilTest(value);
    //                 break;
    //             case RenderStateType.StencilMask:
    //                 this.setStencilMask(value);
    //                 break;
    //             case RenderStateType.StencilFunc:
    //                 this.setStencilFunc(value[0], value[1]);
    //                 break;
    //             case RenderStateType.StencilOp:
    //                 this.setstencilOp(value[0], value[1], value[2]);//TODO
    //                 break;
    //             case RenderStateType.BlendType:
    //                 this.setBlend(value != BlendType.BLEND_DISABLE);
    //                 break;
    //             case RenderStateType.BlendEquation:
    //                 this.setBlendEquation(value);
    //                 break;
    //             case RenderStateType.BlendEquationSeparate:
    //                 this.setBlendEquationSeparate(value[0], value[1]);//TODO
    //                 break;
    //             case RenderStateType.BlendFunc:
    //                 this.setBlendFunc(value[0], value[1]);
    //                 break;
    //             case RenderStateType.BlendFuncSeperate:
    //                 this.setBlendFuncSeperate(value[0], value[1], value[2], value[3]);
    //                 break;
    //             case RenderStateType.CullFace:
    //                 this.setCullFace(value);
    //                 break;
    //             case RenderStateType.FrontFace:
    //                 this.setFrontFace(value);
    //                 break;
    //             default:
    //                 throw "unknow type of renderStateType";
    //                 break;
    //         }
    //     })
    //}
}