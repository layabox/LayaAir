import { BlendEquationSeparate } from "../../RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../RenderEnum/BlendFactor";
import { BlendType } from "../../RenderEnum/BlendType";
import { CompareFunction } from "../../RenderEnum/CompareFunction";
import { CullMode } from "../../RenderEnum/CullMode";
import { RenderStateType } from "../../RenderEnum/RenderStateType";
import { StencilOperation } from "../../RenderEnum/StencilOperation";
import { RenderStateCommand } from "../../RenderStateCommand";
import { NativeWebGLEngine } from "./NativeWebGLEngine";

export class NativeGLRenderState {
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

    _engine: NativeWebGLEngine;
    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    constructor(engine: NativeWebGLEngine) {
        this._engine = engine;
        this._gl = this._engine.gl;
        this._initState();
    }

    private _initState() {
        //TODO:并不完全
        const gl = this._gl;
        this.setDepthFunc(gl.LESS);
        this.setBlendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        this._blendEquation = gl.FUNC_ADD;
        this._sFactor = gl.ONE;
        this._dFactor = gl.ZERO;
        this._sFactorAlpha = gl.ONE;
        this._dFactorAlpha = gl.ONE;

    }

    //TODO 性能优化
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
    //TODO:性能优化
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

    //TODO 性能优化
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
        }
    }

    //性能优化
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

    //
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
        value !== this._depthFunc && (this._depthFunc = value, this._gl.depthFunc(value));
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
            this._gl.stencilFunc(fun, ref, 0xff);
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
            this._gl.stencilOp(fail, zfail, zpass);
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
            this._gl.blendEquation(blendEquation);
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
            this._gl.blendEquationSeparate(blendEquationRGB, blendEquationAlpha);
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
            this._gl.blendFunc(sFactor, dFactor);
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
            this._gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
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
        value !== this._frontFace && (this._frontFace = value, this._gl.frontFace(value));
    }


    applyRenderState(shaderData: any) {
        const depthWrite: boolean = shaderData.depthWrite;
        const depthTest: any = shaderData.depthTest;
        //TODO
        const depthTestEnable: boolean = shaderData.depthTestEnable;

        const blend: BlendType = shaderData.blend;
        //TODO:
        const stencilTestEnable: boolean = shaderData.stencilTestEnable
        const stencilRef: any = shaderData.stencilRef;
        const stencilTest: any = shaderData.stencilTest;
        const stencilWrite: any = shaderData.stencilWrite;
        const stencilOp: any = shaderData.stencilOp;

        this.setDepthMask(depthWrite);
        if (!depthTestEnable)
            this.setDepthTest(false);
        else {
            this.setDepthTest(true);
            this.setDepthFunc(depthTest);
        }
        //blend
        switch (blend) {
            case BlendType.BLEND_DISABLE:
                this.setBlend(false);
                break;
            case BlendType.BLEND_ENABLE_ALL:
                const blendEquation: any = shaderData.blendEquation;
                const srcBlend: any = shaderData.srcBlend;
                const dstBlend: any = shaderData.dstBlend;
                this.setBlend(true);
                this.setBlendEquation(blendEquation);
                this.setBlendFunc(srcBlend, dstBlend);
                break;
            case BlendType.BLEND_ENABLE_SEPERATE:
                const blendEquationRGB = shaderData.blendEquationRGB;
                const blendEquationAlpha = shaderData.blendEquationAlpha;
                const srcRGB = shaderData.srcRGB;
                const dstRGB = shaderData.dstRGB;
                const srcAlpha = shaderData.srcAlpha;
                const dstAlpha = shaderData.dstAlpha;
                this.setBlend(true);
                this.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
                this.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
                break;
        }
        //Stencil
        this.setStencilMask(stencilWrite);
        if (stencilTest == stencilTestEnable) {
            this.setStencilTest(false);
        } else {
            this.setStencilTest(true);
            this.setStencilFunc(stencilTest, stencilRef);
            this.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        }
    }

    applyRenderStateCommand(cmd: RenderStateCommand) {
        let cmdArray = cmd.cmdArray;
        cmdArray.forEach((value, key) => {
            switch (key) {
                case RenderStateType.DepthTest:
                    this.setDepthTest(value);
                    break;
                case RenderStateType.DepthMask:
                    this.setDepthMask(value);
                    break;
                case RenderStateType.DepthFunc:
                    this.setDepthFunc(this._getGLCompareFunction(value));
                    break;
                case RenderStateType.StencilTest:
                    this.setStencilTest(value);
                    break;
                case RenderStateType.StencilMask:
                    this.setStencilMask(value);
                    break;
                case RenderStateType.StencilFunc:
                    this.setStencilFunc(this._getGLCompareFunction(value[0]), value[1]);
                    break;
                case RenderStateType.StencilOp:
                    this.setstencilOp(this._getGLStencilOperation(value[0]), this._getGLStencilOperation(value[1]), this._getGLStencilOperation(value[2]));//TODO
                    break;
                case RenderStateType.BlendType:
                    this.setBlend(value != BlendType.BLEND_DISABLE);
                    break;
                case RenderStateType.BlendEquation:
                    this.setBlendEquation(this._getBlendOperation(value));
                    break;
                case RenderStateType.BlendEquationSeparate:
                    this.setBlendEquationSeparate(this._getBlendOperation(value[0]), this._getBlendOperation(value[1]));//TODO
                    break;
                case RenderStateType.BlendFunc:
                    this.setBlendFunc(this._getBlendFactor(value[0]), this._getBlendFactor(value[1]));
                    break;
                case RenderStateType.BlendFuncSeperate:
                    this.setBlendFuncSeperate(this._getBlendFactor(value[0]), this._getBlendFactor(value[1]), this._getBlendFactor(value[2]), this._getBlendFactor(value[3]));
                    break;
                case RenderStateType.CullFace:
                    this.setCullFace(value);
                    break;
                case RenderStateType.FrontFace:
                    this.setFrontFace(this._getGLFrontfaceFactor(value));
                    break;
                default:
                    throw "unknow type of renderStateType";
                    break;
            }
        })
    }
}