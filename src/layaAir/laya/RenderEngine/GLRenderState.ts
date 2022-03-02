import { BlendType } from "./RenderEnum/BlendType";
import { WebGLEngine } from "./WebGLEngine";

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
    private _stencilOp: number;
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

    _engine: WebGLEngine;
    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    constructor(engine: WebGLEngine) {
        this._engine = engine;
        this._gl = this._engine.gl;
    }

    //TODO
    private _initState() {
        
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

        const gl = this._gl;
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
        this.setStencilMask( stencilWrite);
        if (stencilTest == stencilTestEnable) {
            this.setStencilTest(false);
        } else {
            this.setStencilTest(true);
            this.setStencilFunc(stencilTest, stencilRef);
            this.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        }
    }
}