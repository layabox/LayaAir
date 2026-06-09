import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Laya } from "../../../../Laya";
import { LayaEnv } from "../../../../LayaEnv";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { SetRenderDataCMD, SetShaderDefineCMD, RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { RTScene3DRenderManager } from "../../RenderModuleData/RuntimeModuleData/3D/RTScene3DRenderManager";
import { LayaXRenderContext3D } from "./LayaXRenderContext3D";
import { LayaXRenderElement3D } from "./LayaXRenderElement3D";
import { LayaXRender3DProcess } from "./LayaXRender3DProcess";
import { LayaXSetRenderData, LayaXSetShaderDefine } from "../RenderDevice/LayaXRenderCMD";

/**
 * LayaX skin render element for 3D.
 * Extends LayaXRenderElement3D with skinned data support.
 */
class LayaXSkinRenderElement3D extends LayaXRenderElement3D implements ISkinRenderElement3D {
    _skinnedData: Float32Array[];

    get skinnedData(): Float32Array[] {
        return this._skinnedData;
    }
    set skinnedData(data: Float32Array[]) {
        this._skinnedData = data;
    }
}

// ============================================================================
// DrawNodeCMDData
// ============================================================================

class LayaXDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType = RenderCMDType.DrawNode;
    /**@internal */
    _nativeObj: any;

    protected _node: IBaseRenderNode;
    protected _destShaderData: ShaderData;
    protected _destSubShader: SubShader;
    protected _subMeshIndex: number;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXDrawNodeCMD();
    }

    get node(): IBaseRenderNode {
        return this._node;
    }
    set node(value: IBaseRenderNode) {
        this._node = value;
        this._nativeObj.setBaseRenderNode(value ? (value as any)._nativeObj : null);
    }

    get destShaderData(): ShaderData {
        return this._destShaderData;
    }
    set destShaderData(value: ShaderData) {
        this._destShaderData = value;
        this._nativeObj.setShaderData(value ? (value as any)._nativeObj : null);
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }
    set destSubShader(value: SubShader) {
        this._destSubShader = value;
        this._nativeObj.setSubShader(value ? (value.moduleData as any)._nativeObj : null);
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }
    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
        this._nativeObj.setSubMeshIndex(value);
    }

    apply(_context: IRenderContext3D): void {
        this._nativeObj.execute();
    }
}

// ============================================================================
// BlitQuadCMDData
// ============================================================================

class LayaXBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType = RenderCMDType.Blit;
    /**@internal */
    _nativeObj: any;

    protected _dest: InternalRenderTarget;
    protected _viewport: Viewport;
    protected _scissor: Vector4;
    protected _source: InternalTexture;
    protected _offsetScale: Vector4;
    protected _element: IRenderElement3D;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXBlitQuadCMD();
    }

    get element(): IRenderElement3D {
        return this._element;
    }
    set element(value: IRenderElement3D) {
        this._element = value;
        this._nativeObj.setRenderElement(value ? (value as any)._nativeObj : null);
    }

    get dest(): InternalRenderTarget {
        return this._dest;
    }
    set dest(value: InternalRenderTarget) {
        this._dest = value;
        this._nativeObj.setDest(value ? (value as any)._nativeObj : null);
    }

    get viewport(): Viewport {
        return this._viewport;
    }
    set viewport(value: Viewport) {
        this._viewport = value;
        if (value) {
            this._nativeObj.setViewport(value);
        }
    }

    get scissor(): Vector4 {
        return this._scissor;
    }
    set scissor(value: Vector4) {
        this._scissor = value;
        if (value) {
            this._nativeObj.setScissor(value);
        }
    }

    get source(): InternalTexture {
        return this._source;
    }
    set source(value: InternalTexture) {
        this._source = value;
        // Pass source texture to C++ → Rust for execute_blit_quad to set u_MainTex
        this._nativeObj.setSource(value ? (value as any)._nativeObj : null);
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }
    set offsetScale(value: Vector4) {
        this._offsetScale = value;
        if (value) {
            this._nativeObj.setOffsetScale(value);
        }
    }

    apply(_context: IRenderContext3D): void {
        // 注意：LayaX 路径下 apply() 不会被调用（LayaXForwardAddRP 用 _apply(false)
        // 只执行 cmd.run()，然后把 _nativeObj 列表直接交给 Rust 端处理）。
        // offsetScale / texelSize / source 的 materialShaderData 写入由 Rust 端的
        // execute_blit_quad 负责完成。
        this._nativeObj.execute();
    }
}

// ============================================================================
// DrawElementCMDData
// ============================================================================

class LayaXDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType = RenderCMDType.DrawElement;
    /**@internal */
    _nativeObj: any;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXDrawElementCMD();
    }

    setRenderelements(value: IRenderElement3D[]): void {
        this._nativeObj.clearElement();
        if (value) {
            for (let i = 0, n = value.length; i < n; i++) {
                this._nativeObj.addOneElement((value[i] as any)._nativeObj);
            }
        }
    }

    apply(_context: IRenderContext3D): void {
        this._nativeObj.execute();
    }
}

// ============================================================================
// SetViewportCMD
// ============================================================================

class LayaXSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType = RenderCMDType.ChangeViewPort;
    /**@internal */
    _nativeObj: any;

    protected _viewport: Viewport;
    protected _scissor: Vector4;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXSetViewportCMD();
    }

    get viewport(): Viewport {
        return this._viewport;
    }
    set viewport(value: Viewport) {
        this._viewport = value;
        if (value) {
            this._nativeObj.setViewport(value);
        }
    }

    get scissor(): Vector4 {
        return this._scissor;
    }
    set scissor(value: Vector4) {
        this._scissor = value;
        if (value) {
            this._nativeObj.setScissor(value);
        }
    }

    apply(_context: IRenderContext3D): void {
        this._nativeObj.execute();
    }
}

// ============================================================================
// SetRenderTargetCMD
// ============================================================================

class LayaXSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType = RenderCMDType.ChangeRenderTarget;
    /**@internal */
    _nativeObj: any;

    protected _rt: InternalRenderTarget;
    protected _clearFlag: number;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;
    protected _clearColorValue: Color;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXSetRenderTargetCMD();
    }

    get rt(): InternalRenderTarget {
        return this._rt;
    }
    set rt(value: InternalRenderTarget) {
        this._rt = value;
        this._nativeObj.setRT(value ? (value as any)._nativeObj : null);
    }

    get clearFlag(): number {
        return this._clearFlag;
    }
    set clearFlag(value: number) {
        this._clearFlag = value;
        this._nativeObj.setClearFlag(value);
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }
    set clearColorValue(value: Color) {
        this._clearColorValue = value;
        if (value) {
            this._nativeObj.clearColorValue(value);
        }
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }
    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
        this._nativeObj.clearDepthValue(value);
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;
    }
    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
        this._nativeObj.clearStencilValue(value);
    }

    apply(_context: IRenderContext3D): void {
        this._nativeObj.execute();
    }
}

// ============================================================================
// Factory
// ============================================================================

import { Viewport } from "../../../maths/Viewport";

export class LayaX3DRenderPassFactory implements I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess {
        return new LayaXRender3DProcess();
    }

    createRenderContext3D(): IRenderContext3D {
        return new LayaXRenderContext3D();
    }

    createSetRenderDataCMD(): SetRenderDataCMD {
        return new LayaXSetRenderData();
    }

    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new LayaXSetShaderDefine();
    }

    createDrawNodeCMDData(): DrawNodeCMDData {
        return new LayaXDrawNodeCMDData();
    }

    createBlitQuadCMDData(): BlitQuadCMDData {
        return new LayaXBlitQuadCMDData();
    }

    createDrawElementCMDData(): DrawElementCMDData {
        return new LayaXDrawElementCMDData();
    }

    createSetViewportCMD(): SetViewportCMD {
        return new LayaXSetViewportCMD();
    }

    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new LayaXSetRenderTargetCMD();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new RTScene3DRenderManager();
    }

    createSkinRenderElement(): ISkinRenderElement3D {
        return new LayaXSkinRenderElement3D();
    }

    createRenderElement3D(): IRenderElement3D {
        return new LayaXRenderElement3D();
    }
}

Laya.addBeforeInitCallback(() => {
    if (LayaEnv.isModernAPIs && !Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new LayaX3DRenderPassFactory();
})
