import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { UniformProperty } from "../../../DriverDesign/RenderDevice/CommandUniformMap";
import { wgsl } from "./StructBuffer";
import { UniformMapType } from "../../../../RenderEngine/RenderShader/SubShader";
import { info } from "console";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
type DataViewType = Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor;

type DataView = Float32Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Int8Array | Uint8Array;

type uniformInfo = { offset: number, size: number };

export type WebGPUUnifrom = {
    index: number;
    /**
     * byte offset
     */
    offset: number;

    dataView: DataViewType;

    view: DataView;//实际数据位置

    /**
     * element size (eg: vec2: 2, vec4: 4, mat4: 16)
     */
    size: number;

    alignStride: number;//一个元素实际的占用size

    viewByteLength: number;//总长(字节)

    /**
     * 0: not array
     */
    arrayLength: number;
};

export class WebGPUUniformBufferDescriptor {
    lable: string;
    uniforms: Map<number, WebGPUUnifrom>;

    private _byteLength: number;

    constructor(lable: string) {
        this.lable = lable;
        this.uniforms = new Map();
    }
    get byteLength() {
        return this._byteLength;
    }

    private _getPrimitive(type: ShaderDataType): wgsl.Primitive {
        switch (type) {
            case ShaderDataType.Int:
            case ShaderDataType.Bool:
                return "i32"
            case ShaderDataType.Float:
                return "f32"
            case ShaderDataType.Vector2:
                return "vec2f"
            case ShaderDataType.Vector3:
                return "vec3f"
            case ShaderDataType.Vector4:
            case ShaderDataType.Color:
                return "vec4f"
            case ShaderDataType.Matrix3x3:
                return "mat3x3f"
            case ShaderDataType.Matrix4x4:
                return "mat4x4f"
            case ShaderDataType.Buffer:
            case ShaderDataType.Texture2D:
            case ShaderDataType.Texture3D:
            case ShaderDataType.TextureCube:
            case ShaderDataType.Texture2DArray:
            case ShaderDataType.None:
            default:
                return null;
                break;
        }
    }

    private _getsize(type: ShaderDataType) {
        switch (type) {
            case ShaderDataType.Int:
            case ShaderDataType.Bool:
            case ShaderDataType.Float:
                return 1;
            case ShaderDataType.Vector2:
                return 2;
            case ShaderDataType.Vector3:
                return 3;
            case ShaderDataType.Vector4:
            case ShaderDataType.Color:
                return 4;
            case ShaderDataType.Matrix3x3:
                return 9
            case ShaderDataType.Matrix4x4:
                return 16
            case ShaderDataType.Buffer:
            case ShaderDataType.Texture2D:
            case ShaderDataType.Texture3D:
            case ShaderDataType.TextureCube:
            case ShaderDataType.Texture2DArray:
            case ShaderDataType.None:
            default:
                return null;
                break;
        }
    }

    setUniforms(uniforms: Map<number, UniformProperty>) {
        //生成string
        let bufferStruct: wgsl.Struct = {};
        for (const [key, value] of uniforms) {
            let structKey = value.propertyName;
            let primitive: wgsl.Primitive;
            primitive = this._getPrimitive(value.uniformtype);
            if (!primitive)
                continue;
            if (value.arrayLength < 1) {
                bufferStruct[structKey] = primitive;
            } else {
                let arraystruct: wgsl.Array = [
                    {
                        structKey: primitive
                    },
                    value.arrayLength
                ]
                bufferStruct[structKey] = arraystruct;
            }
        }
        let strucbuffer = new wgsl.StructBuffer(bufferStruct, false, true);
        //console.log(strucbuffer);
        let infos = strucbuffer.info;
        this._byteLength = strucbuffer.buffer.length;
        //
        this._byteLength = (Math.ceil(this._byteLength / 16)) * 16;//ubo最小16的倍数
        for (const [key, value] of uniforms) {
            let offset, viewByteLength, size, alignStride;
            size = this._getsize(value.uniformtype);
            if (!size) continue;
            let tsc: DataViewType = Float32Array;
            if (value.uniformtype == ShaderDataType.Int || value.uniformtype == ShaderDataType.Bool)
                tsc = Int32Array;

            if (value.arrayLength > 1) {
                let info: Array<{ structKey: uniformInfo }> = infos[value.propertyName];
                //第一个的offset  最后一个的offset+size
                offset = info[0].structKey.offset;
                let oneElementbyte = info[1].structKey.offset - offset;
                viewByteLength = oneElementbyte * info.length;
                alignStride = oneElementbyte / tsc.BYTES_PER_ELEMENT;

            } else {
                let info: uniformInfo = infos[value.propertyName];
                offset = info.offset;
                viewByteLength = info.size;
                alignStride = info.size / tsc.BYTES_PER_ELEMENT;
            }

            let uniform: WebGPUUnifrom = {
                index: key,
                view: null,
                size: size,
                alignStride: alignStride,
                offset: offset,
                dataView: tsc,
                viewByteLength: viewByteLength,
                arrayLength: value.arrayLength,
            }
            this.uniforms.set(key, uniform)
        }
    }
    destroy() {
        this.uniforms.clear();
    }
}
export abstract class WebGPUUniformBufferBase {
    static device: GPUDevice;

    objectName: string = 'WebGPUUniformBufferBase';

    descriptor: WebGPUUniformBufferDescriptor;
    bytelength: number;
    needUpload: boolean;

    globalId: number = WebGPUGlobal.getId(this);

    protected _GPUBindGroupEntry: GPUBindGroupEntry;

    protected _gpuBuffer: GPUBuffer;

    abstract getBindGroupEntry(binding: number): GPUBindGroupEntry;

    abstract upload(): void;

    abstract destroy(): void;

    setInt(index: number, value: number) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view[0] = value;
            this.needUpload = true;
        }
    }

    setFloat(index: number, value: number) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view[0] = value;

            this.needUpload = true;
        }
    }

    setVector2(index: number, value: Vector2) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view[0] = value.x;
            uniform.view[1] = value.y;

            this.needUpload = true;
        }
    }

    setVector3(index: number, value: Vector3) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view[0] = value.x;
            uniform.view[1] = value.y;
            uniform.view[2] = value.z;

            this.needUpload = true;
        }
    }

    setVector4(index: number, value: Vector4) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view[0] = value.x;
            uniform.view[1] = value.y;
            uniform.view[2] = value.z;
            uniform.view[3] = value.w;

            this.needUpload = true;
        }
    }

    setMatrix3x3(index: number, value: Matrix3x3) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            let element = value.elements;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    uniform.view[i * 4 + j] = element[i * 3 + j];
                }
            }

            this.needUpload = true;
        }
    }

    setMatrix4x4(index: number, value: Matrix4x4) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view.set(value.elements);

            this.needUpload = true;
        }
    }

    setBuffer(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            uniform.view.set(value);

            this.needUpload = true;
        }
    }

    setArrayBuffer(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {

            let arrayLength = uniform.arrayLength;
            let size = uniform.size;
            // todo
            let alignStride = uniform.alignStride;
            for (let i = 0; i < arrayLength; i++) {
                uniform.view.set(value.subarray(i * size, (i + 1) * size), i * alignStride);
            }

            this.needUpload = true;
        }
    }

    private setMatrix3x3Array(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            let arrayLength = uniform.arrayLength;
            let size = uniform.size;
            // todo
            let alignStride = uniform.alignStride;
            for (let i = 0; i < arrayLength; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let k = 0; k < 3; k++) {
                        uniform.view[i * alignStride + j * 4 + k] = value[i * 9 + j * 3 + k];
                    }
                }
            }

            this.needUpload = true;
        }
    }

    setUniformData(index: number, type: ShaderDataType, data: any) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {

            switch (type) {
                case ShaderDataType.Bool:
                    // todo
                    console.warn("ShaderDataType.Bool not support");
                    break;
                case ShaderDataType.Int:
                    if (uniform.arrayLength > 0) {
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setInt(index, data as number);
                    }
                    break;
                case ShaderDataType.Float:
                    if (uniform.arrayLength > 0) {
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setFloat(index, data as number);
                    }
                    break;
                case ShaderDataType.Vector2:
                    if (uniform.arrayLength > 0) {
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setVector2(index, data as Vector2);
                    }
                    break;
                case ShaderDataType.Vector3:
                    if (uniform.arrayLength > 0) {
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setVector3(index, data as Vector3);
                    }
                    break;
                case ShaderDataType.Vector4:
                case ShaderDataType.Color:
                    if (uniform.arrayLength > 0) {
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setVector4(index, data as Vector4);
                    }
                    break;
                case ShaderDataType.Matrix3x3:
                    if (uniform.arrayLength > 0) {
                        this.setMatrix3x3Array(index, data);
                    }
                    else {
                        this.setMatrix3x3(index, (data as Matrix3x3));
                    }
                    break;
                case ShaderDataType.Matrix4x4:
                    if (uniform.arrayLength > 0) {
                        // todo 不需要 padding 直接复制
                        this.setArrayBuffer(index, data);
                    }
                    else {
                        this.setMatrix4x4(index, (data as Matrix4x4));
                    }
                    break;
                case ShaderDataType.Buffer:
                    // todo
                    // set array value
                    // this.setBuffer(index, data as Float32Array);
                    break;
                case ShaderDataType.None:
                case ShaderDataType.Texture2D:
                case ShaderDataType.Texture3D:
                case ShaderDataType.TextureCube:
                case ShaderDataType.Texture2DArray:
                default:
                    break;
            }
        }
    }
}