import { Transform3D } from "../../../d3/core/Transform3D";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXShaderData, IRenderStateListener } from "../RenderDevice/LayaXShaderData";
import { LayaXSubShader } from "../RenderModuleData/LayaXSubShader";

/**
 * LayaX render element for 3D.
 *
 * 每个实例持有 C++ _nativeObj（conchLayaXRenderElement），
 * 每个 setter 同步到 C++ → Rust FFI → Rust LYRenderElement3D。
 *
 * 不再用 POD packToBuffer，而是持久对象 handle 模式。
 */
export class LayaXRenderElement3D implements IRenderElement3D, IRenderStateListener {

    /** C++ 原生对象（conchLayaXRenderElement） */
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXRenderElement();
    }

    /** @internal 默认 FrontFace（CCW=1） */
    private static _defaultFrontFace: number = 1;

    // --- geometry ---

    private _geometry: IRenderGeometryElement;

    get geometry(): IRenderGeometryElement { return this._geometry; }
    set geometry(data: IRenderGeometryElement) {
        this._geometry = data;
        if (this._nativeObj) {
            this._nativeObj.setGeometry(data ? (data as any)._nativeObj : null);
        }
    }

    // --- materialShaderData (Set3: material uniforms) ---

    private _materialShaderData: ShaderData;

    get materialShaderData(): ShaderData { return this._materialShaderData; }
    set materialShaderData(data: ShaderData) {
        // 注销旧监听
        if (this._materialShaderData instanceof LayaXShaderData) {
            (this._materialShaderData as LayaXShaderData)._removeRenderStateListener(this);
        }
        this._materialShaderData = data;
        if (this._nativeObj) {
            this._nativeObj.setMaterialShaderData(data ? (data as any)._nativeObj : null);
        }
        // 注册新监听 + 初始化渲染状态
        if (data instanceof LayaXShaderData) {
            (data as LayaXShaderData)._addRenderStateListener(this);
            this._onRenderStateChanged();
        }
    }

    // --- renderShaderData (Set2: node uniforms, WorldMatrix etc.) ---

    private _renderShaderData: ShaderData;

    get renderShaderData(): ShaderData { return this._renderShaderData; }
    set renderShaderData(data: ShaderData) {
        this._renderShaderData = data;
        if (this._nativeObj) {
            this._nativeObj.setRenderShaderData(data ? (data as any)._nativeObj : null);
        }
    }

    // --- transform ---

    private _transform: Transform3D;

    get transform(): Transform3D { return this._transform; }
    set transform(data: Transform3D) {
        this._transform = data;
        if (this._nativeObj) {
            this._nativeObj.setTransform(data ? (data as any)._nativeObj : null);
        }
    }

    // --- isRender ---

    private _isRender: boolean = true;

    get isRender(): boolean { return this._isRender; }
    set isRender(data: boolean) {
        this._isRender = data;
        if (this._nativeObj) {
            this._nativeObj.setIsRender(data);
        }
    }

    // --- materialRenderQueue ---

    private _materialRenderQueue: number = 0;

    get materialRenderQueue(): number { return this._materialRenderQueue; }
    set materialRenderQueue(value: number) {
        this._materialRenderQueue = value;
        if (this._nativeObj) {
            this._nativeObj.setRenderQueue(value);
        }
    }

    // --- materialId ---

    private _materialId: number = 0;

    get materialId(): number { return this._materialId; }
    set materialId(value: number) { this._materialId = value; }

    // --- owner (RenderNode) ---

    private _owner: IBaseRenderNode;

    get owner(): IBaseRenderNode { return this._owner; }
    set owner(value: IBaseRenderNode) {
        this._owner = value;
        if (this._nativeObj) {
            this._nativeObj.setOwner(value ? (value as any)._nativeObj : null);
        }
    }

    // --- subShader ---

    private _subShader: SubShader;

    get subShader(): SubShader { return this._subShader; }
    set subShader(value: SubShader) {
        this._subShader = value;
        if (this._nativeObj) {
            // 传 SubShader handle 给 Rust，用于查找 ShaderPass 并触发编译回调；null 时也要清掉 native 旧状态。
            this._nativeObj.setSubShader(value ? (value.moduleData as LayaXSubShader)._nativeObj : null);
        }
    }

    // --- canDynamicBatch ---

    private _canDynamicBatch: boolean = false;

    get canDynamicBatch(): boolean { return this._canDynamicBatch; }
    set canDynamicBatch(value: boolean) { this._canDynamicBatch = value; }

    // --- RenderState ---

    /** @internal 从 materialShaderData 读取完整渲染状态并传给 Rust */
    _onRenderStateChanged(): void {
        let sd = this._materialShaderData;
        if (!sd || !this._nativeObj) return;

        let D = RenderState.Default;
        let blend = sd.getInt(Shader3D.BLEND) ?? D.blend;
        let srcBlend = sd.getInt(Shader3D.BLEND_SRC) ?? D.srcBlend;
        let dstBlend = sd.getInt(Shader3D.BLEND_DST) ?? D.dstBlend;
        let blendEq = sd.getInt(Shader3D.BLEND_EQUATION) ?? D.blendEquation;
        let srcBlendRGB = sd.getInt(Shader3D.BLEND_SRC_RGB) ?? D.srcBlendRGB;
        let dstBlendRGB = sd.getInt(Shader3D.BLEND_DST_RGB) ?? D.dstBlendRGB;
        let srcBlendAlpha = sd.getInt(Shader3D.BLEND_SRC_ALPHA) ?? D.srcBlendAlpha;
        let dstBlendAlpha = sd.getInt(Shader3D.BLEND_DST_ALPHA) ?? D.dstBlendAlpha;
        let blendEqRGB = sd.getInt(Shader3D.BLEND_EQUATION_RGB) ?? D.blendEquationRGB;
        let blendEqAlpha = sd.getInt(Shader3D.BLEND_EQUATION_ALPHA) ?? D.blendEquationAlpha;
        let depthTest = sd.getInt(Shader3D.DEPTH_TEST) ?? D.depthTest;
        let depthWrite = sd.getBool(Shader3D.DEPTH_WRITE) ?? D.depthWrite;
        let stencilTest = sd.getInt(Shader3D.STENCIL_TEST) ?? D.stencilTest;
        let stencilWrite = sd.getBool(Shader3D.STENCIL_WRITE) ?? D.stencilWrite;
        let stencilRef = sd.getInt(Shader3D.STENCIL_Ref) ?? D.stencilRef;
        let stencilReadMask = sd.getInt(Shader3D.STENCIL_READ_MASK) ?? D.stencilReadMask;
        let stencilWriteMask = sd.getInt(Shader3D.STENCIL_WRITE_MASK) ?? D.stencilWriteMask;
        let stencilOp = sd.getVector3(Shader3D.STENCIL_Op);
        let stencilFail = stencilOp ? stencilOp.x : D.stencilOp.x;
        let stencilZFail = stencilOp ? stencilOp.y : D.stencilOp.y;
        let stencilPass = stencilOp ? stencilOp.z : D.stencilOp.z;
        let depthBias = sd.getBool(Shader3D.DEPTH_BIAS) ?? D.depthBias;
        let depthBiasConstant = sd.getNumber(Shader3D.DEPTH_BIAS_CONSTANT) ?? D.depthBiasConstant;
        let depthBiasSlopeScale = sd.getNumber(Shader3D.DEPTH_BIAS_SLOPESCALE) ?? D.depthBiasSlopeScale;
        let depthBiasClamp = sd.getNumber(Shader3D.DEPTH_BIAS_CLAMP) ?? D.depthBiasClamp;
        let cull = sd.getInt(Shader3D.CULL) ?? D.cull;

        this._nativeObj.registerAndSetRenderState(
            blend, srcBlend, dstBlend, blendEq,
            srcBlendRGB, dstBlendRGB, srcBlendAlpha, dstBlendAlpha,
            blendEqRGB, blendEqAlpha,
            depthTest, depthWrite ? 1 : 0,
            stencilTest, stencilWrite ? 1 : 0, stencilRef, stencilReadMask, stencilWriteMask,
            stencilFail, stencilZFail, stencilPass,
            depthBias ? 1 : 0, depthBiasConstant, depthBiasSlopeScale, depthBiasClamp,
            cull, LayaXRenderElement3D._defaultFrontFace
        );
    }

    // --- destroy ---

    destroy(): void {
        if (this._materialShaderData instanceof LayaXShaderData) {
            (this._materialShaderData as LayaXShaderData)._removeRenderStateListener(this);
        }
        if (this._nativeObj) {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
        this._geometry = null;
        this._materialShaderData = null;
        this._renderShaderData = null;
        this._transform = null;
        this._owner = null;
        this._subShader = null;
    }
}
