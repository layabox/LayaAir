
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { VertexDeclaration, VertexStateContext } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGLEngine } from "./WebGLEngine";
import { GLBuffer } from "./WebGLEngine/GLBuffer";

export class WebGLVertexBuffer implements IVertexBuffer {
    _glBuffer: GLBuffer;

    private _vertexDeclaration: VertexDeclaration;

    /**@internal */
    _shaderValues: { [key: number]: VertexStateContext };

    public get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    public set vertexDeclaration(value: VertexDeclaration) {
        this._vertexDeclaration = value;
        this._shaderValues = this._vertexDeclaration._shaderValues;
    }

    instanceBuffer: boolean;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        this._glBuffer = WebGLEngine.instance.createBuffer(targetType, bufferUsageType) as GLBuffer;
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.RC_VertexBuffer, 1);
    }

    private _changeMemory(bytelength: number) {
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_VertexBuffer, -this._glBuffer._byteLength+bytelength);
    }

    setDataLength(byteLength: number): void {
        this._changeMemory(byteLength);
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

    destroy(): void {
        this._glBuffer.destroy();
        this._vertexDeclaration = null
        this._changeMemory(0);
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.RC_VertexBuffer, -1);
    }

}