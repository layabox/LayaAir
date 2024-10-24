import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { NotImplementedError } from "../../../utils/Error";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../RenderDevice/InternalTexture";
import { ShaderDataItem, ShaderDataType, ShaderData } from "../RenderDevice/ShaderData";
import { IRenderContext3D, IRenderElement3D } from "./I3DRenderPass";

export enum RenderCMDType {
    DrawNode,
    DrawElement,
    Blit,
    ChangeData,
    ChangeShaderDefine,
    ChangeViewPort,
    ChangeRenderTarget
}

//cmd
export interface IRenderCMD {
    type: RenderCMDType;
    apply(context: IRenderContext3D): void;
}

export class DrawNodeCMDData implements IRenderCMD {
    type: RenderCMDType;
    protected _node: IBaseRenderNode;
    protected _destShaderData: ShaderData;
    protected _destSubShader: SubShader;
    protected _subMeshIndex: number;

    get node(): IBaseRenderNode {
        return this._node;
    }

    set node(value: IBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): ShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: ShaderData) {
        this._destShaderData = value;
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }

    set destSubShader(value: SubShader) {
        this._destSubShader = value;
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }

    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
    }
    
    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class BlitQuadCMDData implements IRenderCMD {
    type: RenderCMDType;
    protected _dest: InternalRenderTarget;
    protected _viewport: Viewport;
    protected _scissor: Vector4;
    protected _source: InternalTexture;
    protected _offsetScale: Vector4;
    protected _element: IRenderElement3D;

    public get element(): IRenderElement3D {
        return this._element;
    }
    public set element(value: IRenderElement3D) {
        this._element = value;
    }

    get dest(): InternalRenderTarget {
        return this._dest;
    }

    set dest(value: InternalRenderTarget) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
    }

    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        this._offsetScale = value;
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class DrawElementCMDData implements IRenderCMD {
    type: RenderCMDType;

    setRenderelements(value: IRenderElement3D[]): void {
        throw new NotImplementedError();
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class SetViewportCMD implements IRenderCMD {
    type: RenderCMDType;
    protected _viewport: Viewport;
    protected _scissor: Vector4;

    public get viewport(): Viewport {
        return this._viewport;
    }

    public set viewport(value: Viewport) {
        this._viewport = value;
    }

    public get scissor(): Vector4 {
        return this._scissor;
    }

    public set scissor(value: Vector4) {
        this._scissor = value;
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class SetRenderTargetCMD implements IRenderCMD {
    type: RenderCMDType;
    protected _rt: InternalRenderTarget;
    protected _clearFlag: number;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;
    protected _clearColorValue: Color;

    get rt(): InternalRenderTarget {
        return this._rt;
    }

    set rt(value: InternalRenderTarget) {
        this._rt = value;
    }

    get clearFlag(): number {
        return this._clearFlag;
    }

    set clearFlag(value: number) {
        this._clearFlag = value;
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }

    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;
    }

    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        this._clearColorValue = value;
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class SetRenderDataCMD implements IRenderCMD {
    type: RenderCMDType;
    protected _value: ShaderDataItem;
    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: ShaderData;

    get value(): ShaderDataItem {
        return this._value;
    }

    set value(value: ShaderDataItem) {
        this._value = value;
    }

    get dataType(): ShaderDataType {
        return this._dataType;
    }

    set dataType(value: ShaderDataType) {
        this._dataType = value;
    }

    get propertyID(): number {
        return this._propertyID;
    }

    set propertyID(value: number) {
        this._propertyID = value;
    }

    get dest(): ShaderData {
        return this._dest;
    }

    set dest(value: ShaderData) {
        this._dest = value;
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }
}

export class SetShaderDefineCMD implements IRenderCMD {
    type: RenderCMDType;
    protected _define: ShaderDefine;
    protected _dest: ShaderData;
    protected _add: boolean;

    get define(): ShaderDefine {
        return this._define;
    }

    set define(value: ShaderDefine) {
        this._define = value;
    }

    get dest(): ShaderData {
        return this._dest;
    }

    set dest(value: ShaderData) {
        this._dest = value;
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
    }

    apply(context: IRenderContext3D): void {
        throw new NotImplementedError();
    }

}

