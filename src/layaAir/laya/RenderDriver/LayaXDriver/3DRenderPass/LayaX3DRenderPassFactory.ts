import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Laya } from "../../../../Laya";
import { LayaEnv } from "../../../../LayaEnv";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { SetRenderDataCMD, SetShaderDefineCMD, RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderDataType, ShaderDataItem, ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { RTScene3DRenderManager } from "../../RenderModuleData/RuntimeModuleData/3D/RTScene3DRenderManager";
import { LayaXRenderContext3D } from "./LayaXRenderContext3D";
import { LayaXRenderElement3D } from "./LayaXRenderElement3D";
import { LayaXRender3DProcess } from "./LayaXRender3DProcess";

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
// SetRenderDataCMD
// ============================================================================

class LayaXSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType = RenderCMDType.ChangeData;
    /**@internal */
    _nativeObj: any;

    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: ShaderData;
    protected _value: ShaderDataItem;

    data_v4: Vector4;
    data_v3: Vector3;
    data_v2: Vector2;
    data_mat: Matrix4x4;
    data_number: number;
    data_texture: BaseTexture;
    data_Color: Color;
    data_Buffer: Float32Array;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXSetRenderDataCMD();
    }

    get dataType(): ShaderDataType {
        return this._dataType;
    }
    set dataType(value: ShaderDataType) {
        this._dataType = value;
        this._nativeObj.setDataType(value);
    }

    get propertyID(): number {
        return this._propertyID;
    }
    set propertyID(value: number) {
        this._propertyID = value;
        this._nativeObj.setPropertyID(value);
    }

    get dest(): ShaderData {
        return this._dest;
    }
    set dest(value: ShaderData) {
        this._dest = value;
        this._nativeObj.setDest(value ? (value as any)._nativeObj : null);
    }

    get value(): ShaderDataItem {
        return this._value;
    }
    set value(value: ShaderDataItem) {
        switch (this.dataType) {
            case ShaderDataType.Int:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setInt(this._value);
                break;
            case ShaderDataType.Float:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setFloat(this._value);
                break;
            case ShaderDataType.Bool:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setBool(this._value);
                break;
            case ShaderDataType.Matrix4x4:
                !this.data_mat && (this.data_mat = new Matrix4x4());
                (value as Matrix4x4).cloneTo(this.data_mat);
                this._value = this.data_mat;
                this._nativeObj.setMatrix4x4(this._value);
                break;
            case ShaderDataType.Color:
                !this.data_Color && (this.data_Color = new Color());
                (value as Color).cloneTo(this.data_Color);
                this._value = this.data_Color;
                this._nativeObj.setColor(this._value);
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
                this._nativeObj.setTexture2D((this.data_texture._texture as any)._nativeObj);
                break;
            case ShaderDataType.Vector4:
                !this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                this._nativeObj.setVector(this._value);
                break;
            case ShaderDataType.Vector2:
                !this.data_v2 && (this.data_v2 = new Vector2());
                (value as Vector2).cloneTo(this.data_v2);
                this._value = this.data_v2;
                this._nativeObj.setVector2(this._value);
                break;
            case ShaderDataType.Vector3:
                !this.data_v3 && (this.data_v3 = new Vector3());
                (value as Vector3).cloneTo(this.data_v3);
                this._value = this.data_v3;
                this._nativeObj.setVector3(this._value);
                break;
            case ShaderDataType.Buffer:
                this._value = this.data_Buffer = value as Float32Array;
                this._nativeObj.setBufferValue(this.data_Buffer.buffer, this.data_Buffer.byteLength);
                break;
            default:
                break;
        }
    }

    apply(_context: any): void {
        this._nativeObj.execute();
    }
}

// ============================================================================
// SetShaderDefineCMD
// ============================================================================

class LayaXSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType = RenderCMDType.ChangeShaderDefine;
    /**@internal */
    _nativeObj: any;

    protected _define: ShaderDefine;
    protected _dest: ShaderData;
    protected _add: boolean;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXSetShaderDefineCMD();
    }

    get define(): ShaderDefine {
        return this._define;
    }
    set define(value: ShaderDefine) {
        this._define = value;
        this._nativeObj.setDefine(value);
    }

    get dest(): ShaderData {
        return this._dest;
    }
    set dest(value: ShaderData) {
        this._dest = value;
        this._nativeObj.setDest(value ? (value as any)._nativeObj : null);
    }

    get add(): boolean {
        return this._add;
    }
    set add(value: boolean) {
        this._add = value;
        this._nativeObj.setAdd(value);
    }

    apply(_context: any): void {
        this._nativeObj.execute();
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
        // source texture is bound via RenderElement's ShaderData, not via CMD
        this._source = value;
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
    if (LayaEnv.isLayaX && !Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new LayaX3DRenderPassFactory();
})
