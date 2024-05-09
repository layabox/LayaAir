import { Color } from "../../../../maths/Color";
import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { SetRenderDataCMD, RenderCMDType } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { ShaderDataType, ShaderDataItem } from "../../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUShaderData } from "../../RenderDevice/WebGPUShaderData";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";

export class WebGPUSetRenderData extends SetRenderDataCMD {
    type: RenderCMDType;
    protected _dataType: ShaderDataType;
    protected _propertyID: number;
    protected _dest: WebGPUShaderData;
    protected _value: ShaderDataItem;

    data_v2: Vector2;
    data_v3: Vector3;
    data_v4: Vector4;
    data_mat3: Matrix3x3;
    data_mat4: Matrix4x4;
    data_color: Color;
    data_number: number;
    data_texture: BaseTexture;
    data_buffer: Float32Array;

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

    get dest(): WebGPUShaderData {
        return this._dest;
    }
    set dest(value: WebGPUShaderData) {
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
            case ShaderDataType.Matrix3x3:
                !this.data_mat3 && (this.data_mat3 = new Matrix3x3());
                (value as Matrix3x3).cloneTo(this.data_mat3);
                this._value = this.data_mat3;
                break;
            case ShaderDataType.Matrix4x4:
                !this.data_mat4 && (this.data_mat4 = new Matrix4x4());
                (value as Matrix4x4).cloneTo(this.data_mat4);
                this._value = this.data_mat4;
                break;
            case ShaderDataType.Color:
                !this.data_color && (this.data_color = new Color());
                (value as Color).cloneTo(this.data_color);
                this._value = this.data_color;
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
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
            case ShaderDataType.Vector4:
                !this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                break;
            case ShaderDataType.Buffer:
                this._value = this.data_buffer = value as Float32Array;
                break;
            default:
                //TODO shaderDefine
                break;
        }
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeData;
    }

    apply(context: WebGPURenderContext3D) {
        switch (this.dataType) {
            case ShaderDataType.Int:
                this.dest.setInt(this.propertyID, this.value as number);
                break;
            case ShaderDataType.Float:
                this.dest.setNumber(this.propertyID, this.value as number);
                break;
            case ShaderDataType.Bool:
                this.dest.setBool(this.propertyID, this.value as boolean);
                break;
            case ShaderDataType.Matrix3x3:
                this.dest.setMatrix3x3(this.propertyID, this.value as Matrix3x3);
                break;
            case ShaderDataType.Matrix4x4:
                this.dest.setMatrix4x4(this.propertyID, this.value as Matrix4x4);
                break;
            case ShaderDataType.Color:
                this.dest.setColor(this.propertyID, this.value as Color);
                break;
            case ShaderDataType.Texture2D:
                this.dest.setTexture(this.propertyID, this.value as BaseTexture);
                break;
            case ShaderDataType.Vector2:
                this.dest.setVector2(this.propertyID, this.value as Vector2);
                break;
            case ShaderDataType.Vector3:
                this.dest.setVector3(this.propertyID, this.value as Vector3);
                break;
            case ShaderDataType.Vector4:
                this.dest.setVector(this.propertyID, this.value as Vector4);
                break;
            case ShaderDataType.Buffer:
                this.dest.setBuffer(this.propertyID, this.value as Float32Array);
                break;
            default:
                //TODO shaderDefine
                break;
        }
    }
}