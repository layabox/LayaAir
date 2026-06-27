import { Config } from "../../../../Config";
import { WebGL2DStencilState } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { Color } from "../../../maths/Color";
import { FastSinglelist } from "../../../utils/SingletonList";
import { Stat } from "../../../utils/Stat";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLRenderElement2D } from "./WebGLRenderElement2D";
import { WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";

export type WebGLStencilDrawItem = WebGLRenderElement2D;
export class WebGLStencilMaskElement2D extends WebGLRenderElement2D {

    private _nMatrix0: Vector3 = new Vector3();
    private _nMatrix1: Vector3 = new Vector3();
    private _stencilRef: number = -1;
    private _stencilReadMask: number = -1;
    private _stencilWriteMask: number = -1;
    private _stencilTest: number = -1;
    private _stencilOpZPass: number = -1;

    static create(): WebGLStencilMaskElement2D {
        const element = new WebGLStencilMaskElement2D();
        element.geometry = ShaderDefines2D._stencilGeo as WebGLRenderGeometryElement;
        element.subShader =  Shader2D.stencilShader.getSubShaderAt(0);
        element.nodeCommonMap = ["BaseRender2D"];
        element.renderStateIsBySprite = true;
        element.noBatch = true;
        element.value2DShaderData = LayaGL.renderDeviceFactory.createShaderData(null) as WebGLShaderData;
        element.value2DShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        element.value2DShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, Color.WHITE);
        element.value2DShaderData.setInt(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        element.value2DShaderData.setBool(Shader3D.DEPTH_WRITE, false);
        element.value2DShaderData.setInt(Shader3D.STENCIL_TEST, RenderState.STENCILTEST_EQUAL);
        element.value2DShaderData.setBool(Shader3D.STENCIL_WRITE, true);
        element.value2DShaderData.setInt(Shader3D.STENCIL_READ_MASK, 0xFF);
        element.value2DShaderData.setInt(Shader3D.STENCIL_WRITE_MASK, 0xFF);
        element.value2DShaderData.setVector3(Shader3D.STENCIL_Op, new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_INCR));
        return element;
    }

    setClip(owner: WebRenderStruct2D, clipInfo: IClipInfo, ref: number, opZPass: number): void {
        const dir = clipInfo.clipMatDir;
        const mat = clipInfo.clipMatrix;
        this.owner = owner;
        this._nMatrix0.setValue(dir.x, dir.z, mat.tx);
        this._nMatrix1.setValue(dir.y, dir.w, mat.ty);
        this.value2DShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix0);
        this.value2DShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix1);

        if (this._stencilRef !== ref) {
            this._stencilRef = ref;
            this.value2DShaderData.setInt(Shader3D.STENCIL_Ref, ref);
        }
        if (this._stencilTest !== RenderState.STENCILTEST_EQUAL) {
            this._stencilTest = RenderState.STENCILTEST_EQUAL;
            this.value2DShaderData.setInt(Shader3D.STENCIL_TEST, RenderState.STENCILTEST_EQUAL);
        }
        if (this._stencilReadMask !== 0xFF) {
            this._stencilReadMask = 0xFF;
            this.value2DShaderData.setInt(Shader3D.STENCIL_READ_MASK, 0xFF);
        }
        if (this._stencilWriteMask !== 0xFF) {
            this._stencilWriteMask = 0xFF;
            this.value2DShaderData.setInt(Shader3D.STENCIL_WRITE_MASK, 0xFF);
        }
        if (this._stencilOpZPass !== opZPass) {
            this._stencilOpZPass = opZPass;
            this.value2DShaderData.setVector3(Shader3D.STENCIL_Op, new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, opZPass));
        }
    }

    override _render(context: any): void {
        const engine = WebGLEngine.instance;
        engine.colorMask(false, false, false, false);
        super._render(context);
        engine.colorMask(true, true, true, true);
    }
}

export class WebGLStencilClip2D {
    private _stencilBits: number = -1;
    private _targetStack: IClipInfo[] = [];
    private _activeStack: IClipInfo[] = [];
    private _maskElements: WebGLStencilMaskElement2D[] = [];
    private _maskElementCount: number = 0;
    private _contentStates: WebGL2DStencilState[] = [];
    private _frame: number = -1;
    private _lastMaskOwner: WebRenderStruct2D = null;
    private _stencilOffState: WebGL2DStencilState = {
        enabled: false,
        test: RenderState.STENCILTEST_OFF,
        write: RenderState.Default.stencilWrite,
        ref: RenderState.Default.stencilRef,
        readMask: RenderState.Default.stencilReadMask,
        writeMask: RenderState.Default.stencilWriteMask,
        opFail: RenderState.Default.stencilOp.x,
        opZFail: RenderState.Default.stencilOp.y,
        opZPass: RenderState.Default.stencilOp.z
    };
    private _warnedNoStencil: boolean = false;
    private _warnedDepthFrame: number = -1;

    constructor(private _context: any) {
    }

    reset(): void {
        this._activeStack.length = 0;
        this._maskElementCount = 0;
        this._lastMaskOwner = null;
    }

    buildDrawItems(list: FastSinglelist<WebGLRenderElement2D>, out: WebGLStencilDrawItem[]): boolean {
        out.length = 0;
        this.reset();
        this._checkFrame();

        const elements = list.elements;
        const count = list.length;
        let hasStencilClip = false;
        let needsTempList = false;
        let stencilChecked = false;
        let stencilUsable = true;
        let maxDepth = 255;

        for (let i = 0; i < count; i++) {
            const element = elements[i];
            const owner = element.owner as WebRenderStruct2D;
            const clipInfo = owner && !owner.forceShaderClip ? owner.getClipInfo() : null;
            const depth = clipInfo && clipInfo.clipDepth > 0 ? this._buildClipStack(clipInfo) : 0;

            if (depth <= 0) {
                if (needsTempList)
                    this._emitStackTransition(owner, 0, out);
                element.stencilClipState = this._stencilOffState;
                out.push(element);
                continue;
            }

            hasStencilClip = true;
            if (!stencilChecked) {
                stencilChecked = true;
                stencilUsable = this._hasStencil();
                maxDepth = this._getMaxDepth();
            }
            if (!stencilUsable || depth > maxDepth) {
                this._emitStackTransition(owner, 0, out);
                element.stencilClipState = this._stencilOffState;
                needsTempList = true;
                if (depth > maxDepth)
                    this._warnDepth(depth, maxDepth);
                continue;
            }

            needsTempList = true;
            this._emitStackTransition(owner, depth, out);
            element.stencilClipState = this._getContentState(depth);
            out.push(element);
        }

        if (!hasStencilClip) {
            this._clearSourceStencilStates(elements, count);
            out.length = 0;
            return false;
        }

        if (needsTempList)
            this._emitStackTransition(this._lastMaskOwner, 0, out);

        return needsTempList;
    }

    private _emitStackTransition(owner: WebRenderStruct2D, targetDepth: number, out: WebGLStencilDrawItem[]): void {
        owner = owner || this._lastMaskOwner;
        let common = 0;
        const maxCommon = Math.min(this._activeStack.length, targetDepth);
        while (common < maxCommon && this._activeStack[common] === this._targetStack[common])
            common++;

        for (let i = this._activeStack.length - 1; i >= common; i--) {
            const maskElement = this._getMaskElement();
            maskElement.setClip(owner, this._activeStack[i], i + 1, RenderState.STENCILOP_DECR);
            out.push(maskElement);
        }

        for (let i = common; i < targetDepth; i++) {
            const maskElement = this._getMaskElement();
            maskElement.setClip(owner, this._targetStack[i], i, RenderState.STENCILOP_INCR);
            out.push(maskElement);
        }

        this._activeStack.length = targetDepth;
        for (let i = 0; i < targetDepth; i++)
            this._activeStack[i] = this._targetStack[i];
        if (owner)
            this._lastMaskOwner = owner;
    }

    private _buildClipStack(clipInfo: IClipInfo): number {
        const stack = this._targetStack;
        stack.length = 0;
        let info = clipInfo;
        while (info && info.clipDepth > 0) {
            stack.push(info);
            info = info.clipParent;
        }
        stack.reverse();
        return stack.length;
    }

    private _getMaskElement(): WebGLStencilMaskElement2D {
        const index = this._maskElementCount++;
        return this._maskElements[index] || (this._maskElements[index] = WebGLStencilMaskElement2D.create());
    }

    private _getContentState(ref: number): WebGL2DStencilState {
        let state = this._contentStates[ref];
        if (state)
            return state;

        state = {
            enabled: true,
            test: RenderState.STENCILTEST_EQUAL,
            write: false,
            ref,
            readMask: 0xFF,
            writeMask: 0x00,
            opFail: RenderState.STENCILOP_KEEP,
            opZFail: RenderState.STENCILOP_KEEP,
            opZPass: RenderState.STENCILOP_KEEP
        };
        this._contentStates[ref] = state;
        return state;
    }

    private _clearSourceStencilStates(elements: WebGLRenderElement2D[], count: number): void {
        for (let i = 0; i < count; i++) {
            elements[i].stencilClipState = this._stencilOffState;
        }
    }

    private _checkFrame(): void {
        const frame = Stat.loopCount;
        if (this._frame === frame)
            return;
        this._frame = frame;
        this._warnedDepthFrame = -1;
    }

    private _hasStencil(): boolean {
        if (!Config.isStencil) {
            if (!this._warnedNoStencil) {
                this._warnedNoStencil = true;
                console.warn("WebGL scrollRect stencil clipping is enabled, but Config.isStencil is false. Clipped 2D content will be skipped.");
            }
            return false;
        }

        const rt = this._context.getRenderTarget?.();
        if (rt) {
            const format = rt.depthStencilFormat;
            if (format !== RenderTargetFormat.DEPTHSTENCIL_24_8 && format !== RenderTargetFormat.STENCIL_8) {
                if (!this._warnedNoStencil) {
                    this._warnedNoStencil = true;
                    console.warn("WebGL scrollRect stencil clipping is enabled, but the current render target has no stencil buffer. Clipped 2D content will be skipped.");
                }
                return false;
            }
        }

        if (this._getStencilBits() <= 0) {
            if (!this._warnedNoStencil) {
                this._warnedNoStencil = true;
                console.warn("WebGL scrollRect stencil clipping is enabled, but the current render target has no stencil buffer. Clipped 2D content will be skipped.");
            }
            return false;
        }
        return true;
    }

    private _getMaxDepth(): number {
        const bits = this._getStencilBits();
        if (bits >= 8)
            return 255;
        return Math.max((1 << bits) - 1, 0);
    }

    private _getStencilBits(): number {
        if (this._stencilBits < 0) {
            const gl = WebGLEngine.instance.gl;
            const bits = gl.getParameter(gl.STENCIL_BITS);
            this._stencilBits = bits == null ? 8 : bits;
        }
        return this._stencilBits;
    }

    private _warnDepth(depth: number, maxDepth: number): void {
        if (this._warnedDepthFrame === this._frame)
            return;
        this._warnedDepthFrame = this._frame;
        console.warn(`WebGL scrollRect stencil clip depth ${depth} exceeds available stencil depth ${maxDepth}. Clipped 2D content will be skipped.`);
    }
}
