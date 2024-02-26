import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Command } from "../../../../d3/core/render/command/Command";
import { Viewport } from "../../../../d3/math/Viewport";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, SetRenderTargetCMD, SetViewportCMD, RenderCMDType, SetRenderDataCMD, SetShaderDefineCMD } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { InternalRenderTarget } from "../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderDataItem, ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderModuleData/Design/ShaderDefine";
import { WebBaseRenderNode } from "../../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGLShaderData } from "../../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLInternalRT } from "../../RenderDevice/WebGLInternalRT";
import { WebGLRenderContext3D } from "../WebGLRenderContext3D";
import { WebGLRenderElement3D } from "../WebGLRenderElement3D";


export class WebGLDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType;
    protected _node: WebBaseRenderNode;
    protected _destShaderData: WebGLShaderData;
    protected _destSubShader: SubShader;

    get node(): WebBaseRenderNode {
        return this._node;
    }

    set node(value: WebBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): WebGLShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: WebGLShaderData) {
        this._destShaderData = value;
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }

    set destSubShader(value: SubShader) {
        this._destSubShader = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.DrawNode;
    }

    apply(context: WebGLRenderContext3D): void {
        this.node._renderUpdatePre(context);
        let elements = this.node.renderelements;
        elements.forEach(element => {
            let oriSubmesh = element.subShader;
            let oriMatShaderData = element.materialShaderData;
            element.subShader = this._destSubShader;
            element.materialShaderData = this._destShaderData;
            context.drawRenderElementOne(element as WebGLRenderElement3D);
            element.subShader = oriSubmesh;
            element.materialShaderData = oriMatShaderData;
        });
    }
}

export class WebGLBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType;
    private _sourceTexelSize: Vector4;
    protected _dest: WebGLInternalRT;
    protected _viewport: Viewport;
    protected _source: InternalTexture;
    protected _sciccor: Vector4;
    protected _offsetScale: Vector4;
    protected _element: WebGLRenderElement3D;

    get dest(): WebGLInternalRT {
        return this._dest;
    }

    set dest(value: WebGLInternalRT) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
    }

    get sciccor(): Vector4 {
        return this._sciccor;
    }

    set sciccor(value: Vector4) {
        value.cloneTo(this._sciccor);
    }

    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;
        if (this._source) {
            this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
        }
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
    }

    get element(): WebGLRenderElement3D {
        return this._element;
    }
    set element(value: WebGLRenderElement3D) {
        this._element = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._sciccor = new Vector4();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    apply(context: WebGLRenderContext3D): void {
        this.element.materialShaderData._setInternalTexture(Command.SCREENTEXTURE_ID, this._source);
        this.element.materialShaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale);
        this.element.materialShaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        context.setViewPort(this._viewport);
        context.setScissor(this._sciccor);
        context.setRenderTarget(this.dest);
        context.drawRenderElementOne(this.element);
    }
}

export class WebGLDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType;
    private _elemets: WebGLRenderElement3D[];
    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: WebGLRenderElement3D[]): void {
        this._elemets = value;
    }

    apply(context: WebGLRenderContext3D): void {
        if (this._elemets.length == 1) {
            context.drawRenderElementOne(this._elemets[0]);
        }else{
            this._elemets.forEach(element => {
                context.drawRenderElementOne(element);
            });
        }
      
    }
}

export class WebGLSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType;
    protected _viewport: Viewport;
    protected _sciccor: Vector4;

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
    }

    get sciccor(): Vector4 {
        return this._sciccor;
    }

    set sciccor(value: Vector4) {
        this._sciccor = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.sciccor = new Vector4();
        this.viewport = new Viewport();
    }

    apply(context: WebGLRenderContext3D): void {
        context.setViewPort(this.viewport);
        context.setScissor(this.sciccor);
    }
}
export class WebGLSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType;
    protected _rt: InternalRenderTarget;
    protected _clearFlag: number;
    protected _clearColorValue: Color;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;

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

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
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

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    apply(context: WebGLRenderContext3D): void {
        context.setRenderTarget(this.rt);
        context.setClearData(this.clearFlag, this.clearColorValue, this.clearDepthValue, this.clearStencilValue);
    }
}
export class WebGLSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType;
    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: WebGLShaderData;
    protected _value: ShaderDataItem;

    data_v4: Vector4;
    data_v3: Vector3;
    data_v2: Vector2;
    data_mat: Matrix4x4;
    data_number: number;
    data_texture: BaseTexture;
    data_Color: Color;
    data_Buffer: Float32Array;
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

    get dest(): WebGLShaderData {
        return this._dest;
    }

    set dest(value: WebGLShaderData) {
        this._dest = value;
    }

    get value(): ShaderDataItem {
        return this._value;
    }
    set value(value: ShaderDataItem) {
        switch (this.dataType) {
            case ShaderDataType.Int:
            case ShaderDataType.Float:
            case ShaderDataType.Bool:
                this.data_number = value as number;
                this._value = this.data_number;
                break;
            case ShaderDataType.Matrix4x4:
                this.data_mat && (this.data_mat = new Matrix4x4());
                (value as Matrix4x4).cloneTo(this.data_mat);
                this._value = this.data_mat;
                break;
            case ShaderDataType.Color:
                this.data_Color && (this.data_Color = new Color());
                (value as Color).cloneTo(this.data_Color);
                this._value = this.data_Color;
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
                break;
            case ShaderDataType.Vector4:
                this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                break;
            case ShaderDataType.Vector2:
                this.data_v2 && (this.data_v2 = new Vector2());
                (value as Vector2).cloneTo(this.data_v2);
                this._value = this.data_v2;
                break;
            case ShaderDataType.Vector3:
                this.data_v3 && (this.data_v3 = new Vector3());
                (value as Vector3).cloneTo(this.data_v3);
                this._value = this.data_v3;
                break;
            case ShaderDataType.Buffer:
                this._value = this.data_Buffer = value as Float32Array;
                break;
            default:
                //TODO  shaderDefine
                break;
        }
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeData;
    }

    apply(context: WebGLRenderContext3D): void {
        switch (this.dataType) {
            case ShaderDataType.Int:
                this.dest.setInt(this.propertyID as number, this.value as number);
                break;
            case ShaderDataType.Float:
                this.dest.setNumber(this.propertyID as number, this.value as number);
                break;
            case ShaderDataType.Bool:
                this.dest.setBool(this.propertyID as number, this.value as boolean);
                break;
            case ShaderDataType.Matrix4x4:
                this.dest.setMatrix4x4(this.propertyID as number, this.value as Matrix4x4);
                break;
            case ShaderDataType.Color:
                this.dest.setColor(this.propertyID as number, this.value as Color);
                break;
            case ShaderDataType.Texture2D:
                this.dest.setTexture(this.propertyID as number, this.value as BaseTexture);
                break;
            case ShaderDataType.Vector4:
                this.dest.setVector(this.propertyID as number, this.value as Vector4);
                break;
            case ShaderDataType.Vector2:
                this.dest.setVector2(this.propertyID as number, this.value as Vector2);
                break;
            case ShaderDataType.Vector3:
                this.dest.setVector3(this.propertyID as number, this.value as Vector3);
                break;
            case ShaderDataType.Buffer:
                this.dest.setBuffer(this.propertyID as number, this.value as Float32Array);
                break;
            default:
                //TODO  shaderDefine
                break;
        }
    }
}

export class WebGLSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType;
    protected _define: ShaderDefine;
    protected _dest: WebGLShaderData;
    protected _add: boolean;

    get define(): ShaderDefine {
        return this._define;
    }

    set define(value: ShaderDefine) {
        this._define = value;
    }

    get dest(): WebGLShaderData {
        return this._dest;
    }

    set dest(value: WebGLShaderData) {
        this._dest = value;
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeShaderDefine;
    }

    apply(context: WebGLRenderContext3D): void {
        if (this.add) {
            this._dest.addDefine(this.define);
        } else {
            this._dest.removeDefine(this.define);
        }
    }
}