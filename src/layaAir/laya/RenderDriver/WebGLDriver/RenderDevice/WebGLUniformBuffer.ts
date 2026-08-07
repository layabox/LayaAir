import { LayaGL } from "../../../layagl/LayaGL";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { UniformBufferWriter } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferWriter";
import { WebGLEngine } from "./WebGLEngine";
import { GLBuffer } from "./WebGLEngine/GLBuffer";
import { IWebGLUniformBuffer } from "./IWebGLUniformBuffer";
import { WebGLUniformBufferDescriptor } from "./WebGLUniformBufferDescriptor";

/** 独立 UBO:自带 GLBuffer(非 cluster 块)。descriptor 收窄为具体类型,直接调 build 方法。 */
export class WebGLUniformBuffer extends UniformBufferWriter implements IWebGLUniformBuffer {

    declare descriptor: WebGLUniformBufferDescriptor;

    destroyed: boolean = false;

    private _data: Float32Array;

    private _buffer: GLBuffer;

    name: string;

    constructor(name: string) {
        super();
        this.name = name;
        this.descriptor = new WebGLUniformBufferDescriptor(name);
    }

    create() {
        let descriptor = this.descriptor;

        descriptor.finish();

        const buffer = new Uint8Array(descriptor.byteLength).buffer;
        this._data = new Float32Array(buffer);

        for (const [key, uniform] of descriptor.uniforms) {
            uniform.view = new uniform.dataView(buffer, uniform.offset, uniform.viewByteLength / uniform.dataView.BYTES_PER_ELEMENT);
        }
        this._buffer = (LayaGL.renderEngine as WebGLEngine).createBuffer(BufferTargetType.UNIFORM_BUFFER, BufferUsage.Dynamic);

        this._buffer.bindBuffer();
        this._buffer.setDataLength(descriptor.byteLength);
        this.needUpload = true;
    }

    /**
     * 添加 uniform
     * @param index
     * @param type
     * @param arraySize
     */
    addUniform(index: number, type: ShaderDataType, arraySize: number = 0) {
        this.descriptor.addUniform(index, type, arraySize);
    }

    upload() {
        if (this.needUpload) {
            this._buffer.setData(this._data, 0);
            this.needUpload = false;
        }
    }

    bind(location: number) {
        this._buffer.bindBufferBase(location);
    }

    clone(): WebGLUniformBuffer {
        let buffer = new WebGLUniformBuffer(this.name);
        this.cloneTo(buffer);
        return buffer;
    }
    cloneTo(dest: WebGLUniformBuffer): void {
        this.descriptor.cloneTo(dest.descriptor);
        dest.create();
        dest._data.set(this._data);
    }

    destroy() {
        this._data = null;
        this._buffer.destroy();
        this.descriptor.destroy();
        this.descriptor = null;
        this.destroyed = true;
    }
}
