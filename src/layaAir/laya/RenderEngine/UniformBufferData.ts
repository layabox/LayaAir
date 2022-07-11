import { ShaderDataType } from "../d3/core/render/command/SetShaderDataCMD";
import { Color } from "../d3/math/Color";
import { Matrix4x4 } from "../d3/math/Matrix4x4";
import { Vector2 } from "../d3/math/Vector2";
import { Vector3 } from "../d3/math/Vector3";
import { Vector4 } from "../d3/math/Vector4";
import { Shader3D } from "./RenderShader/Shader3D";
import { UniformColor } from "./RenderShader/UniformColor";

/**
 *描述UniformBuffer参数类型
 */
export enum UniformBufferParamsType {
    Number,
    Vector2,
    Vector3,
    Vector4,
    Matrix4x4,
    Vector4Array,//Numberarray, vec2array and vec3array occupy the same memory as vec4array, so only vector4 is provided
    MatrixArray
}

/**
 * 实例化UniformBuffer数据
 * 注：要与glsl中Uniform block结构相同
 */
export class UnifromBufferData {

    /**
     * @internal
     * key: UniformID,value: x:offset y:length z:
     */
    protected _layoutMap: any;

    /**
     * @internal
     * data length
     */
    protected _bytelength: number;

    /**
     * @internal
     * params describe
     */
    _uniformParamsState: Map<number, UniformBufferParamsType>;

    /**
     * @internal
     * update frome x to max,x:min,y:max
     */
    _updateFlag: Vector2;

    /**
     * Buffer Data
     */
    _buffer: Float32Array;

    /**
     * create UniformBufferData Instance
     * @param uniformParamsStat Params describe
     */
    constructor(uniformParamsStat: Map<number, UniformBufferParamsType>) {
        // todo 后面改掉 不用map 初始化
        this._uniformParamsState = new Map(uniformParamsStat);
        // if (uniformParamsStat) {
        //     uniformParamsStat.forEach((type: UniformBufferParamsType, name: string) => {
        //         let uniformID = Shader3D.propertyNameToID(name);
        //         this._uniformParamsState.set(uniformID, type)
        //     });
        // }
        this._createBuffer();
        this._updateFlag = new Vector2();
        this._resetUpdateFlag();
    }

    /**
     * @internal 
     * createBuffer
     */
    protected _createBuffer() {
        var dataPos = 0;
        this._layoutMap = {};
        const elementSize = 4;
        this._uniformParamsState.forEach((key, value) => {
            dataPos += this._addUniformParams(value, key, dataPos);
        });
        //这里需要对手机平台做兼容
        //this._bytelength = dataPos * elementSize;
        this._bytelength = Math.ceil(dataPos / 4) * 4 * elementSize;
        this._buffer = new Float32Array(dataPos);
    }

    /**
     * @internal
     */
    protected _getArraySize(key: string) {
        let left = key.indexOf("[");
        let right = key.indexOf("]");
        if (left != -1 && right != -1 && left < right) {
            return parseFloat(key.substring(left + 1, right));
        } else
            throw key + " is illegal "
    }

    /**
     * @interanl
     * layout UniformBuffer pitch std140
     */
    protected _addUniformParams(uniformID: number, value: UniformBufferParamsType, offset: number): number {
        let size: number = 0;
        let posAdd: number = 0;
        let posG = offset % 4;
        let offsetadd;
        switch (value) {
            case UniformBufferParamsType.Number:
                size = 1;
                posAdd = 1;
                break;
            case UniformBufferParamsType.Vector2:
                size = 2;
                switch (posG) {
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
            case UniformBufferParamsType.Vector3:
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
                offsetadd = posG ? 4 - posG : posG;
                offset += offsetadd
                posAdd = size + offsetadd;
                break;
            case UniformBufferParamsType.Vector4Array:
                size = this._getArraySize(Shader3D.propertyIDToName(uniformID)) * 4;
                offsetadd = posG ? 4 - posG : posG;
                offset += offsetadd
                posAdd = size + offsetadd;
                break;
            case UniformBufferParamsType.MatrixArray:
                size = this._getArraySize(Shader3D.propertyIDToName(uniformID)) * 16;
                offsetadd = posG ? 4 - posG : posG;
                offset += offsetadd
                posAdd = size + offsetadd;
                break;
            default:
                throw "Unifrom Buffer Params Type is illegal "
        }
        const paramsInfo = new Vector2(offset, size);
        this._layoutMap[uniformID] = paramsInfo;
        return posAdd;
    }

    /**
     * @internal
     */
    private _getParamsInfo(key: number): Vector2 {
        return this._layoutMap[key];
    }

    /**
     * @interanl
     * set upload range
     */
    private _setUpdateFlag(min: number, max: number) {
        if (min < this._updateFlag.x)
            this._updateFlag.x = min;
        if (max > this._updateFlag.y)
            this._updateFlag.y = max;

    }

    /**
     * @internal
     */
    destroy() {
        delete this._buffer;
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
    _has(uniformID: number) {
        const info = this._getParamsInfo(uniformID);
        return !!info;
    }

    /**
     * @internal
     * set buffer params Data
     */
    _setData(uniformID: number, value: any) {

        let uniformType = this._uniformParamsState.get(uniformID);

        switch (uniformType) {
            case UniformBufferParamsType.Number:
                this.setNumberbyIndex(uniformID, value);
                break;
            case UniformBufferParamsType.Vector2:
                this.setVector2byIndex(uniformID, value);
                break;
            case UniformBufferParamsType.Vector3:
                this.setVector3byIndex(uniformID, value);
                break;
            case UniformBufferParamsType.Vector4:
                this.setVector4byIndex(uniformID, value);
                break;
            case UniformBufferParamsType.Matrix4x4:
                this.setMatrixbyIndex(uniformID, value);
                break;
            case UniformBufferParamsType.Vector4Array:
            case UniformBufferParamsType.MatrixArray:
            // todo
            default:
                break;
        }
    }

    /**
     * get Buffer byte length
     * @returns 
     */
    getbyteLength(): number {
        return this._bytelength;
    }

    /**
     * set Vector4Array by paramsName
     * @param name uniform params name
     * @param value vector4Array data
     */
    setVector4Array(name: string, value: Vector4[]) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector4ArraybyIndex(uniformID, value);
    }

    /**
     * set Vector4Array by paramsIndex
     * @param uniformID uniform params index
     * @param value vector4Array data
     * @returns 
     */
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

    /**
     * set MatrixArray by paramsName
     * @param name uniform params name
     * @param value MatrixArray data
     */
    setMatrixArray(name: string, value: Matrix4x4[]) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setMatrixArraybyIndex(uniformID, value);
    }

    /**
     * set MatrixArray by paramsIndex
     * @param uniformID uniform params index
     * @param value MatrixArray data
     * @returns 
     */
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

    /**
     * set Number by paramsName
     * @param name uniform params name
     * @param value Number data
     */
    setNumber(name: string, value: number) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setNumberbyIndex(uniformID, value);
    }

    /**
     * set Number by paramsIndex
     * @param uniformID uniform params index
     * @param value Number data
     * @returns 
     */
    setNumberbyIndex(uniformID: number, value: number) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value;
        this._setUpdateFlag(info.x, pos);
    }

    /**
     * set Vector2 by paramsName
     * @param name uniform params name
     * @param value Vector2 data
     */
    setVector2(name: string, value: Vector2) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector2byIndex(uniformID, value);
    }

    /**
     * set Vector2 by paramsIndex
     * @param uniformID uniform params index
     * @param value Vector2 data
     * @returns 
     */
    setVector2byIndex(uniformID: number, value: Vector2) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._setUpdateFlag(info.x, pos);
    }

    /**
     * set Vector3 by paramsName
     * @param name uniform params name
     * @param value Vector3 data
     */
    setVector3(name: string, value: Vector3) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector3byIndex(uniformID, value);
    }

    /**
     * set Vector3 by uniformID
     * @param uniformID uniform params index
     * @param value Vector3 data
     * @returns 
     */
    setVector3byIndex(uniformID: number, value: Vector3) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._buffer[pos++] = value.z;
        this._setUpdateFlag(info.x, pos);
    }

    /**
     * set Vector4 by paramsName
     * @param name uniform params name
     * @param value Vector4 data
     */
    setVector4(name: string, value: Vector4) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setVector4byIndex(uniformID, value);
    }

    /**
     * set Vector4 by paramsIndex
     * @param uniformID uniform params index
     * @param value Vector4 data
     * @returns 
     */
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

    setColorByIndex(uniformID: number, value: UniformColor) {
        const info = this._getParamsInfo(uniformID);
        if (!info)
            return;
        let pos = info.x;
        this._buffer[pos++] = value.x;
        this._buffer[pos++] = value.y;
        this._buffer[pos++] = value.z;
        this._buffer[pos++] = value.w;
    }

    /**
     * set Matrix by paramsName
     * @param name uniform params name
     * @param value Matrix data
     */
    setMatrix(name: string, value: Matrix4x4) {
        const uniformID: number = Shader3D.propertyNameToID(name);
        this.setMatrixbyIndex(uniformID, value);
    }

    /**
     * set Matrix by paramsIndex
     * @param uniformID uniform params index
     * @param value Matrix data
     * @returns 
     */
    setMatrixbyIndex(uniformID: number, value: Matrix4x4) {
        const info = this._getParamsInfo(uniformID);
        if (!info) return;
        let pos = info.x;
        this._buffer.set(value.elements, pos);
        pos += 16;
        this._setUpdateFlag(info.x, pos);
    }

    clone(): UnifromBufferData {
        // todo clone 更改
        let ubd = new UnifromBufferData(this._uniformParamsState);
        return ubd
    }
}