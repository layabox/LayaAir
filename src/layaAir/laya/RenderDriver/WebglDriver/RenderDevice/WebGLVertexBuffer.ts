import { GLBuffer } from "../../../RenderEngine/RenderEngine/WebGLEngine/GLBuffer";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class WebGLVertexBuffer implements IVertexBuffer {
    _glBuffer: GLBuffer;

    private _vertexDeclaration: VertexDeclaration;

    public get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    public set vertexDeclaration(value: VertexDeclaration) {
        this._vertexDeclaration = value;
    }

    instanceBuffer: boolean;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        this._glBuffer = LayaGL.renderEngine.createBuffer(targetType, bufferUsageType) as GLBuffer;
    }

    destory(): void {
        this._glBuffer.destroy();
        this._vertexDeclaration = null
    }

    setDataLength(byteLength: number): void {
        this._glBuffer.setDataLength(byteLength);
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        this.bind();
        var needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            var subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
            this._glBuffer.setData(subData, bufferOffset);
        } else {
            this._glBuffer.setData(buffer, bufferOffset);
        }
    }

    /**
     * @private
     */
    bind(): boolean {
        return this._glBuffer.bindBuffer();
    }

    unbind(): void {
        return this._glBuffer.unbindBuffer();
    }

    /**
     * 剥离内存块存储。
     */
    orphanStorage(): void {
        this.bind();
        this._glBuffer.setDataLength(this._glBuffer._byteLength);
    }


}