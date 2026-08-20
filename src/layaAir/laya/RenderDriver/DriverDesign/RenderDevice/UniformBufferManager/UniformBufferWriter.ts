import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderDataType } from "../ShaderData";
import { IUniformLayout, UniformLayoutItem } from "./IUniformLayout";

/**
 * 设备无关的 UBO 写入器:持有 layout(只读)+ 把 JS 值写进 view 的一组 setter。
 * 两后端的 setter 逐字相同,故合并为共享基类;UniformBufferBlock 与独立 UBO 均继承它。
 *
 * 每个 setXxx(index) 先 descriptor.get(index) 解析 layout 项,再委托 _writeXxx(uniform) 写 view。
 * _writeXxx 单独暴露(@internal),供 UniformBufferField 用预解析的 layout 项直写、跳过 descriptor.get。
 */
export abstract class UniformBufferWriter {
    descriptor: IUniformLayout;
    needUpload: boolean;

    /** 写完 view 后标脏。基类只置标志;池化块 override 成同时登记 cluster 脏位。 */
    protected _dirty() {
        this.needUpload = true;
    }

    setInt(index: number, value: number) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeInt(uniform, value);
    }
    /** @internal */
    _writeInt(uniform: UniformLayoutItem, value: number) {
        uniform.view[0] = value; this._dirty();
    }

    setBool(index: number, value: boolean) {
        this.setInt(index, value ? 1 : 0);
    }

    setFloat(index: number, value: number) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeFloat(uniform, value);
    }
    /** @internal */
    _writeFloat(uniform: UniformLayoutItem, value: number) {
        uniform.view[0] = value; this._dirty();
    }

    setVector2(index: number, value: Vector2) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeVector2(uniform, value);
    }
    /** @internal */
    _writeVector2(uniform: UniformLayoutItem, value: Vector2) {
        uniform.view[0] = value.x; uniform.view[1] = value.y; this._dirty();
    }

    setVector3(index: number, value: Vector3) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeVector3(uniform, value);
    }
    /** @internal */
    _writeVector3(uniform: UniformLayoutItem, value: Vector3) {
        uniform.view[0] = value.x; uniform.view[1] = value.y; uniform.view[2] = value.z; this._dirty();
    }

    setVector4(index: number, value: Vector4) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeVector4(uniform, value);
    }
    /** @internal */
    _writeVector4(uniform: UniformLayoutItem, value: Vector4) {
        uniform.view[0] = value.x; uniform.view[1] = value.y; uniform.view[2] = value.z; uniform.view[3] = value.w;
        this._dirty();
    }

    setMatrix3x3(index: number, value: Matrix3x3) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeMatrix3x3(uniform, value);
    }
    /** @internal */
    _writeMatrix3x3(uniform: UniformLayoutItem, value: Matrix3x3) {
        let e = value.elements;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                uniform.view[i * 4 + j] = e[i * 3 + j]; // mat3 每列补齐到 vec4
        this._dirty();
    }

    setMatrix4x4(index: number, value: Matrix4x4) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeMatrix4x4(uniform, value);
    }
    /** @internal */
    _writeMatrix4x4(uniform: UniformLayoutItem, value: Matrix4x4) {
        uniform.view.set(value.elements); this._dirty();
    }

    setBuffer(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeBuffer(uniform, value);
    }
    /** @internal */
    _writeBuffer(uniform: UniformLayoutItem, value: Float32Array) {
        uniform.view.set(value); this._dirty();
    }

    setArrayBuffer(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) this._writeArrayBuffer(uniform, value);
    }
    /** @internal */
    _writeArrayBuffer(uniform: UniformLayoutItem, value: Float32Array) {
        let n = uniform.arrayLength, size = uniform.size, stride = uniform.alignStride;
        for (let i = 0; i < n; i++)
            uniform.view.set(value.subarray(i * size, (i + 1) * size), i * stride);
        this._dirty();
    }

    private setMatrix3x3Array(index: number, value: Float32Array) {
        let uniform = this.descriptor.uniforms.get(index);
        if (uniform) {
            let n = uniform.arrayLength, stride = uniform.alignStride;
            for (let i = 0; i < n; i++)
                for (let j = 0; j < 3; j++)
                    for (let k = 0; k < 3; k++)
                        uniform.view[i * stride + j * 4 + k] = value[i * 9 + j * 3 + k];
            this._dirty();
        }
    }

    setUniformData(index: number, type: ShaderDataType, data: any) {
        let uniform = this.descriptor.uniforms.get(index);
        if (!uniform) return;
        switch (type) {
            case ShaderDataType.Bool:
                if (uniform.arrayLength > 0) console.warn("ShaderDataType.Bool array not support");
                else this.setBool(index, data as boolean);
                break;
            case ShaderDataType.Int:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data);
                else this.setInt(index, data as number);
                break;
            case ShaderDataType.Float:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data);
                else this.setFloat(index, data as number);
                break;
            case ShaderDataType.Vector2:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data);
                else this.setVector2(index, data as Vector2);
                break;
            case ShaderDataType.Vector3:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data);
                else this.setVector3(index, data as Vector3);
                break;
            case ShaderDataType.Vector4u:
            case ShaderDataType.Vector4:
            case ShaderDataType.Color:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data);
                else this.setVector4(index, data as Vector4);
                break;
            case ShaderDataType.Matrix3x3:
                if (uniform.arrayLength > 0) this.setMatrix3x3Array(index, data);
                else this.setMatrix3x3(index, data as Matrix3x3);
                break;
            case ShaderDataType.Matrix4x4:
                if (uniform.arrayLength > 0) this.setArrayBuffer(index, data); // mat4 无 padding,直接复制
                else this.setMatrix4x4(index, data as Matrix4x4);
                break;
            default:
                break;
        }
    }
}
