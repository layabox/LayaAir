import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { SetRenderDataCMD, SetShaderDefineCMD, RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderDataType, ShaderDataItem, ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";

// ============================================================================
// SetRenderDataCMD
// ============================================================================

export class LayaXSetRenderData extends SetRenderDataCMD {
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
                this._nativeObj.setInt(this.data_number | 0);
                break;
            case ShaderDataType.Float:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setFloat(this._value);
                break;
            case ShaderDataType.Bool:
                this.data_number = value as number;
                this._value = this.data_number;
                this._nativeObj.setBool(!!this.data_number);
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
                this._nativeObj.setColor(this.data_Color.r, this.data_Color.g, this.data_Color.b, this.data_Color.a);
                break;
            case ShaderDataType.Texture2D:
                this._value = this.data_texture = value as BaseTexture;
                this._nativeObj.setTexture2D((this.data_texture._texture as any)._nativeObj);
                break;
            case ShaderDataType.Vector4:
                !this.data_v4 && (this.data_v4 = new Vector4());
                (value as Vector4).cloneTo(this.data_v4);
                this._value = this.data_v4;
                this._nativeObj.setVector(this.data_v4.x, this.data_v4.y, this.data_v4.z, this.data_v4.w);
                break;
            case ShaderDataType.Vector2:
                !this.data_v2 && (this.data_v2 = new Vector2());
                (value as Vector2).cloneTo(this.data_v2);
                this._value = this.data_v2;
                this._nativeObj.setVector2(this.data_v2.x, this.data_v2.y);
                break;
            case ShaderDataType.Vector3:
                !this.data_v3 && (this.data_v3 = new Vector3());
                (value as Vector3).cloneTo(this.data_v3);
                this._value = this.data_v3;
                this._nativeObj.setVector3(this.data_v3.x, this.data_v3.y, this.data_v3.z);
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

export class LayaXSetShaderDefine extends SetShaderDefineCMD {
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
        this._nativeObj.setDefine(value._index, value._value);
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
