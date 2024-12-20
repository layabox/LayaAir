import { IClone } from "../../../utils/IClone";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

type DataViewType = Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int8ArrayConstructor | Uint8ArrayConstructor;

type DataView = Float32Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Int8Array | Uint8Array;

export type WebGLUniform = {
    index: number;
    /**
     * byte offset
     */
    offset: number;

    dataView: DataViewType;

    view: DataView;

    /**
     * element size (eg: vec2: 2, vec4: 4, mat4: 16)
     */
    size: number;

    alignStride: number;

    viewByteLength: number;

    /**
     * 0: not array
     */
    arrayLength: number;
};


export class WebGLUniformBufferDescriptor implements IClone {

    name: string;

    private _currentLength: number = 0;

    private _byteLength: number = 0;

    get byteLength(): number {
        return this._byteLength;
    }

    private _maxAlignment: number = 0;

    uniforms: Map<number, WebGLUniform>;

    constructor(name: string) {
        this.name = name;
        this.uniforms = new Map();
    }

    /**
     * std 140 字节对齐
     * @param alignment 
     */
    private alignmentPadding(alignment: number) {
        let pointer = this._currentLength;
        let endPadding = pointer % alignment;
        if (endPadding != 0) {
            endPadding = alignment - endPadding;
            this._currentLength += endPadding;
            this._byteLength += endPadding * 4;
        }

        this._maxAlignment = Math.max(this._maxAlignment, alignment);
    }

    addUniformItem(index: number, size: number, alignStride: number, arraySize: number, tsc: DataViewType) {
        if (arraySize > 0) {
            this.alignmentPadding(4);
            let arrayStride = arraySize * alignStride;
            let view: Float32Array;
            let uniform: WebGLUniform = {
                index: index,
                view: view,
                size: size,
                alignStride: alignStride,
                offset: this._currentLength * 4,
                dataView: tsc,
                viewByteLength: tsc.BYTES_PER_ELEMENT * arrayStride,
                arrayLength: arraySize,
            }
            this.uniforms.set(index, uniform);
            this._currentLength += arrayStride;
            this._byteLength += uniform.viewByteLength;
        }
        else {
            this.alignmentPadding(size <= 2 ? size : 4);
            let view: Float32Array;
            let uniform: WebGLUniform = {
                index: index,
                view: view,
                size: size,
                alignStride: alignStride,
                offset: this._currentLength * 4,
                dataView: tsc,
                viewByteLength: tsc.BYTES_PER_ELEMENT * alignStride,
                arrayLength: 0,
            }
            this.uniforms.set(index, uniform);
            this._currentLength += size;
            this._byteLength += size * tsc.BYTES_PER_ELEMENT;
        }
    }

    addUniform(index: number, type: ShaderDataType, arraySize: number = 0) {
        let alignStride = 0;
        switch (type) {
            case ShaderDataType.Int:
            case ShaderDataType.Bool:
                alignStride = 4;
                this.addUniformItem(index, 1, alignStride, arraySize, Int32Array);
                break;
            case ShaderDataType.Float:
                alignStride = 4;
                this.addUniformItem(index, 1, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Vector2:
                alignStride = 4;
                this.addUniformItem(index, 2, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Vector3:
                alignStride = 4;
                this.addUniformItem(index, 3, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Vector4:
            case ShaderDataType.Color:
                alignStride = 4;
                this.addUniformItem(index, 4, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Matrix3x3:
                alignStride = 12;
                this.addUniformItem(index, 9, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Matrix4x4:
                alignStride = 16;
                this.addUniformItem(index, 16, alignStride, arraySize, Float32Array);
                break;
            case ShaderDataType.Buffer:
                // todo
                console.log("ShaderDataType.Buffer not support");
                break;
            case ShaderDataType.Texture2D:
            case ShaderDataType.Texture3D:
            case ShaderDataType.TextureCube:
            case ShaderDataType.Texture2DArray:
            case ShaderDataType.None:
            default:
                break;
        }
    }

    /**
     * finish add uniform
     * @param alignment 
     */
    finish(alignment: number = 0) {
        alignment = alignment > this._maxAlignment ? alignment : this._maxAlignment;
        this._maxAlignment = alignment;
        this.alignmentPadding(alignment);
    }

    clone(): WebGLUniformBufferDescriptor {
        let descriptor = new WebGLUniformBufferDescriptor(this.name);
        this.cloneTo(descriptor);
        return descriptor;
    }

    cloneTo(destObject: WebGLUniformBufferDescriptor): void {
        this.uniforms.forEach(uniform => {
            destObject.addUniformItem(uniform.index, uniform.size, uniform.alignStride, uniform.arrayLength, uniform.dataView);
        });

        destObject.finish(this._maxAlignment);
    }

    destroy() {
        this.uniforms.clear();
    }

}