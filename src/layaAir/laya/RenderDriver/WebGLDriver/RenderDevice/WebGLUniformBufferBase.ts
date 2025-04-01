import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGLUniformBufferDescriptor } from "./WebGLUniformBufferDescriptor";

export abstract class WebGLUniformBufferBase {

    descriptor: WebGLUniformBufferDescriptor;

    needUpload: boolean;

    abstract upload(): void;

    abstract bind(location: number): void;

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