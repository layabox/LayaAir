import { ShaderDataType } from "../core/render/command/SetShaderDataCMD";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Shader3D } from "../shader/Shader3D";
export enum UniformBufferParamsType {
    Number,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    Vector4Array,// NumberArray,vec2Array,Vec3Array相对于Vec4Array占用相同显存，因此只提供Vector4
    MatrixArray
}

export class UnifromBufferData {

    /**
     * 布局
     * value: x:offset y:length z:
     */
    private _layoutMap: any;

    private _bytelength: number;

    /**
     * x:min,y:max
     */
    _updateFlag: Vector2;

    private _uniformParamsState: Map<string, UniformBufferParamsType>;

    _buffer: Float32Array;

    constructor(uniformParamsStat: Map<string, UniformBufferParamsType>) {
        this._uniformParamsState = new Map(uniformParamsStat);
        this._createBuffer();
        this._updateFlag = new Vector2();
        this._resetUpdateFlag();
    }

    private _createBuffer() {
        var dataPos = 0;
        this._layoutMap = {};
        const elementSize = 4;
        this._uniformParamsState.forEach((key, value) => {
            dataPos += this._addUniformParams(value, key, dataPos);
        });
        this._bytelength = dataPos * elementSize;
        this._buffer = new Float32Array(dataPos);
    }

    private _getArraySize(key: string) {
        let left = key.indexOf("[");
        let right = key.indexOf("]");
        if (left != -1 && right != -1 && left < right) {
            return parseFloat(key.substring(left + 1, right));
        } else
            throw key + " is illegal "
    }

    private _addUniformParams(key: string, value: UniformBufferParamsType, offset: number): number {

        let size: number = 0;
        let posAdd: number = 0;
        const uniformID: number = Shader3D.propertyNameToID(key);
        let posG = offset % 4;
        let offsetadd;
        switch (value) {
            case UniformBufferParamsType.Number:
                size = 1;
                posAdd = 1;
                break;
            case UniformBufferParamsType.Vector2://0,2可补
                size = 2;
                switch (posG) {//pitch std140
                    case 0:
                    case 2:
                        posAdd = 2;
                        break;
                    case 1:
                    case 3:
                        offset += 1;
                        posAdd = 3;
                        break;
                }
                break;
            case UniformBufferParamsType.Vector3://pitch std140
                size = 3;
                posAdd = 3;
                switch (posG) {
                    case 1:
                    case 2:
                    case 3:
                        offset += (4 - posG);
                        posAdd = (4 - posG) + 3;
                        break;
                }
                break;
            case UniformBufferParamsType.Vector4:
                size = 4;
                switch (posG) {
                    case 0:
                        posAdd = 4;
                        break;
                    case 1:
                        offset += 3;
                        posAdd = 7;
                        break;
                    case 2:
                        offset += 2;
                        posAdd = 6;
                        break;
                    case 3:
                        offset += 1;
                        posAdd = 5;
                        break;
                }
                break;
            case UniformBufferParamsType.Matrix4x4:
                size = 16;
                offsetadd = posG? 4 - posG:posG;
                offset +=offsetadd
                posAdd = size + offsetadd;
                break;
            case UniformBufferParamsType.Vector4Array:
                size = this._getArraySize(key) * 4;
                offsetadd = posG? 4 - posG:posG;
                offset +=offsetadd
                posAdd = size + offsetadd;
                break;
            case UniformBufferParamsType.MatrixArray:
                size = this._getArraySize(key) * 16;
                offsetadd = posG? 4 - posG:posG;
                offset +=offsetadd
                posAdd = size + offsetadd;
                break;
            default:
                throw "Unifrom Buffer Params Type is illegal "
        }
        const paramsInfo = new Vector2(offset, size);
        this._layoutMap[uniformID] = paramsInfo;
        return posAdd;
    }

    private _getParamsInfo(key: number): Vector2 {
        return this._layoutMap[key];
    }

    private _setUpdateFlag(min: number, max: number) {
        if (min < this._updateFlag.x)
            this._updateFlag.x = min;
        if (max > this._updateFlag.y)
            this._updateFlag.y = max;

    }

    getbyteLength(): number {
        return this._bytelength;
    }

    /**
     * @internal
     */
    _resetUpdateFlag() {
        this._updateFlag.setValue(this._buffer.length, 0);
    }

    /**
     * @internal
     * @param uniformID 
     * @returns 
     */
    _has(uniformID:number){
        const info = this._getParamsInfo(uniformID);
        return !!info;
    }

    _setData(uniformID:number,type:ShaderDataType,value:any){
        switch (type) {
			case ShaderDataType.Int:
				this.setNumberbyIndex(uniformID, value);
				break;
			case ShaderDataType.Number:
				this.setNumberbyIndex(uniformID, value);
				break;
			case ShaderDataType.Bool:
				this.setNumberbyIndex(uniformID, value);
				break;
			case ShaderDataType.Matrix4x4:
				this.setMatrixbyIndex(uniformID, value);
				break;
			case ShaderDataType.Quaternion:
				this.setVector4byIndex(uniformID, value);
				break;
			case ShaderDataType.Vector4:
				this.setVector4byIndex(uniformID, value);
				break;
			case ShaderDataType.Vector2:
				this.setVector2byIndex(uniformID, value);
				break;
			case ShaderDataType.Vector3:
				this.setVector3byIndex(uniformID, value);
				break;
		}
    }

    setVector4Array(name: string, value: Vector4[]) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector4ArraybyIndex(uniformID, value);
    }

    setVector4ArraybyIndex(uniformID: number, value: Vector4[]) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        let count = info.y / 4;
        for (let i = 0; i < count; i++) {
            let vec = value[i];
            this._buffer[pos++] = vec.x;
            this._buffer[pos++] = vec.y;
            this._buffer[pos++] = vec.z;
            this._buffer[pos++] = vec.w;
        }
        this._setUpdateFlag(info.x, pos);
    }

    setMatrixArray(name: string, value: Matrix4x4[]) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setMatrixArraybyIndex(uniformID, value);
    }

    setMatrixArraybyIndex(uniformID: number, value: Matrix4x4[]) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        let count = info.y / 4;
        for (let i = 0; i < count; i++) {
            let mat = value[i];
            this._buffer.set(mat.elements, pos);
            pos += 16;
        }
        this._setUpdateFlag(info.x, pos);
    }

    setNumber(name: string, value: number) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setNumberbyIndex(uniformID, value);
    }

    setNumberbyIndex(uniformID: number, value: number) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value;
        this._setUpdateFlag(info.x, pos);
    }

    setVector2(name: string, value: Vector2) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector2byIndex(uniformID, value);
    }

    setVector2byIndex(uniformID: number, value: Vector2) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._setUpdateFlag(info.x, pos);
    }

    setVector3(name: string, value: Vector3) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector3byIndex(uniformID, value);
    }

    setVector3byIndex(uniformID: number, value: Vector3) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._buffer[pos++] = value.z;
        this._setUpdateFlag(info.x, pos);
    }

    setVector4(name: string, value: Vector4) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector4byIndex(uniformID, value);
    }

    setVector4byIndex(uniformID: number, value: Vector4) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._buffer[pos++] = value.z;
        this._buffer[pos++] = value.w;
        this._setUpdateFlag(info.x, pos);
    }

    setMatrix(name: string, value: Matrix4x4) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setMatrixbyIndex(uniformID, value);
    }

    setMatrixbyIndex(uniformID: number, value: Matrix4x4) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer.set(value.elements, pos);
        pos += 16;
        this._setUpdateFlag(info.x, pos);
    }
}