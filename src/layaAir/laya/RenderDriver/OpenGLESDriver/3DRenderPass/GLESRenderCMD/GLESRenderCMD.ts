import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, RenderCMDType, SetRenderDataCMD, SetRenderTargetCMD, SetShaderDefineCMD, SetViewportCMD } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { ShaderDataItem, ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { RTBaseRenderNode } from "../../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { RTShaderDefine } from "../../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { RTSubShader } from "../../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { GLESInternalRT } from "../../RenderDevice/GLESInternalRT";
import { GLESInternalTex } from "../../RenderDevice/GLESInternalTex";
import { GLESShaderData } from "../../RenderDevice/GLESShaderData";
import { GLESRenderElement3D } from "../GLESRenderElement3D";

export class GLESDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType;
    protected _node: RTBaseRenderNode;
    protected _destShaderData: GLESShaderData;
    protected _destSubShader: SubShader;
    protected _subMeshIndex: number;

    /**@internal */
    _nativeObj: any;

    get node(): RTBaseRenderNode {
        return this._node;
    }

    set node(value: RTBaseRenderNode) {
        this._node = value;
        this._nativeObj.setBaseRenderNode(value._nativeObj);
    }

    get destShaderData(): GLESShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: GLESShaderData) {
        this._destShaderData = value;
        this._nativeObj.setShaderData(value._nativeObj);
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }

    set destSubShader(value: SubShader) {
        this._destSubShader = value;
        this._nativeObj.setSubShader((value.moduleData as any as RTSubShader)._nativeObj);
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }

    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
        this._nativeObj.setSubMeshIndex(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.DrawNode;
        this._nativeObj = new (window as any).conchGLESDrawNodeCMDData();
    }
}

export class GLESBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType;
    protected _dest: GLESInternalRT;
    protected _viewport: Viewport;
    protected _source: GLESInternalTex;
    protected _scissor: Vector4;
    protected _offsetScale: Vector4;
    protected _element: GLESRenderElement3D;
    /**@internal */
    _nativeObj: any;

    get dest(): GLESInternalRT {
        return this._dest;
    }

    set dest(value: GLESInternalRT) {
        this._dest = value;
        this._nativeObj.setDest(value ? value._nativeObj : null);
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
        this._nativeObj.setViewport(value);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        value.cloneTo(this._scissor);
        this._nativeObj.setScissor(value);
    }

    get source(): GLESInternalTex {
        return this._source;
    }

    set source(value: GLESInternalTex) {
        this._source = value;
        this._nativeObj.setSource(value._nativeObj);
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
        this._nativeObj.setOffsetScale(this._offsetScale);
    }

    get element(): GLESRenderElement3D {
        return this._element;
    }
    set element(value: GLESRenderElement3D) {
        this._element = value;
        this._nativeObj.setRenderElement(value._nativeObj);
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._scissor = new Vector4();
        this._offsetScale = new Vector4();
        this._nativeObj = new (window as any).conchGLESBlitQuadCMDData();
    }
}

export class GLESDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType;
    /**@internal */
    _nativeObj;
    private _elemets: GLESRenderElement3D[];

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
        this._nativeObj = new (window as any).conchGLESDrawElementCMDData();
    }

    setRenderelements(value: GLESRenderElement3D[]): void {
        this._elemets = value;
        this._nativeObj.clearElement();
        if (value.length == 1) {
            this._nativeObj.addOneElement(value[0]._nativeObj);
        } else {
            value.forEach(element => {
                this._nativeObj.addOneElement(element._nativeObj);
            });
        }

    }
}

export class GLESSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType;
    /**@internal */
    _nativeObj: any;
    protected _viewport: Viewport;
    protected _scissor: Vector4;

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
        this._nativeObj.setViewport(value);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
        this._nativeObj.setScissor(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.scissor = new Vector4();
        this.viewport = new Viewport();
        this._nativeObj = new (window as any).conchGLESSetViewportCMD();
    }
}

export class GLESSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType;
    /**@internal */
    _nativeObj: any;
    protected _rt: GLESInternalRT;
    protected _clearFlag: number;
    protected _clearColorValue: Color;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;

    get rt(): GLESInternalRT {
        return this._rt;
    }

    set rt(value: GLESInternalRT) {
        this._rt = value;
        this._nativeObj.setRT(value._nativeObj);
    }

    get clearFlag(): number {
        return this._clearFlag;
    }
    set clearFlag(value: number) {
        this._clearFlag = value;
        this._nativeObj.setClearFlag(value)
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
        this._nativeObj.clearColorValue(value);
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

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
        this._nativeObj = new (window as any).conchGLESSetRenderTargetCMD();
    }
}

export class GLESSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType;
    /**@internal */
    _nativeObj: any;
    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: GLESShaderData;
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
        this._nativeObj.setDataType(value);
    }

    get propertyID(): number {
        return this._propertyID;
    }

    set propertyID(value: number) {
        this._propertyID = value;
        this._nativeObj.setPropertyID(value);
    }

    get dest(): GLESShaderData {
        return this._dest;
    }

    set dest(value: GLESShaderData) {
        this._dest = value;
        this._nativeObj.setDest(value._nativeObj);
    }

    get value(): ShaderDataItem {
        return this._value;
    }
    set value(value: ShaderDataItem) {
        switch (this.dataType) {
            case ShaderDataType.Int:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setInt(this.value)
                break;
            case ShaderDataType.Float:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setFloat(this.value)
                break;
            case ShaderDataType.Bool:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setBool(this.value)
                break;
            case ShaderDataType.Matrix4x4:
                !this.data_mat && (this.data_mat = new Matrix4x4());
                (value as Matrix4x4).cloneTo(this.data_mat);
                this._value = this.data_mat;
                this._nativeObj.setMatrix4x4(this.value)
                break;
            case ShaderDataType.Color:
                !this.data_Color && (this.data_Color = new Color());
                (value as Color).cloneTo(this.data_Color);
                this._value = this.data_Color;
                this._nativeObj.setColor(this.value)
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
                this._nativeObj.setTexture2D((this.data_texture._texture as GLESInternalTex)._nativeObj);
                break;
            case ShaderDataType.Vector4:
                !this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                this._nativeObj.setVector(this.value)
                break;
            case ShaderDataType.Vector2:
                !this.data_v2 && (this.data_v2 = new Vector2());
                (value as Vector2).cloneTo(this.data_v2);
                this._value = this.data_v2;
                this._nativeObj.setVector2(this.value)
                break;
            case ShaderDataType.Vector3:
                !this.data_v3 && (this.data_v3 = new Vector3());
                (value as Vector3).cloneTo(this.data_v3);
                this._value = this.data_v3;
                this._nativeObj.setVector3(this.value);
                break;
            case ShaderDataType.Buffer:
                this._value = this.data_Buffer = value as Float32Array;
                this._nativeObj.setBufferValue(this.data_Buffer.buffer, this.data_Buffer.byteLength);
                break;
            default:
                //TODO  shaderDefine
                break;
        }
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeData;
        this._nativeObj = new (window as any).conchGLESSetRenderData();
    }
}

export class GLESSetShaderDefine extends SetShaderDefineCMD {
    type: RenderCMDType;
    /**@internal */
    _nativeObj: any;
    protected _define: RTShaderDefine;
    protected _dest: GLESShaderData;
    protected _add: boolean;

    get define(): RTShaderDefine {
        return this._define;
    }

    set define(value: RTShaderDefine) {
        this._define = value;
        this._nativeObj.setDefine(value)
    }

    get dest(): GLESShaderData {
        return this._dest;
    }

    set dest(value: GLESShaderData) {
        this._dest = value;
        this._nativeObj.setDest(value._nativeObj)
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
        this._nativeObj.setAdd(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeShaderDefine;
        this._nativeObj = new (window as any).conchGLESSetShaderDefine();
    }
}