import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { SetRenderDataCMD, RenderCMDType, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderDataType, ShaderDataItem } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";

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
                !this.data_mat && (this.data_mat = new Matrix4x4());
                (value as Matrix4x4).cloneTo(this.data_mat);
                this._value = this.data_mat;
                break;
            case ShaderDataType.Color:
                !this.data_Color && (this.data_Color = new Color());
                (value as Color).cloneTo(this.data_Color);
                this._value = this.data_Color;
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
                break;
            case ShaderDataType.Vector4:
                !this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                break;
            case ShaderDataType.Vector2:
                !this.data_v2 && (this.data_v2 = new Vector2());
                (value as Vector2).cloneTo(this.data_v2);
                this._value = this.data_v2;
                break;
            case ShaderDataType.Vector3:
                !this.data_v3 && (this.data_v3 = new Vector3());
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

    apply(context: any): void {
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

    apply(context: any): void {
        if (this.add) {
            this._dest.addDefine(this.define);
        } else {
            this._dest.removeDefine(this.define);
        }
    }
}