import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IGPUBuffer } from "../../DriverDesign/RenderDevice/ComputeShader/IComputeContext.ts";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUVertexStepMode } from "./WebGPUBufferState";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUVertexBuffer implements IVertexBuffer, IGPUBuffer {
    private static _bufferLayoutConterMap: Map<string, number> = new Map();
    private static _bufferLayoutIDConter: number = 0;

    private _vertexDeclaration: VertexDeclaration;

    source: WebGPUBuffer;

    instanceBuffer: boolean;

    buffer: ArrayBuffer;
    //绑定信息
    verteBufferLayout: GPUVertexBufferLayout;
    //缓存信息
    stateCacheKey: string = '';
    //缓存ID
    stateCacheID: number;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
        if (targetType & BufferTargetType.TRANSFORM_FEEDBACK_BUFFER) {
            usage |= GPUBufferUsage.STORAGE;
        }
        this.source = new WebGPUBuffer(usage, 0);
    }
    getNativeBuffer() {
        return this.source;
    }

    public get vertexDeclaration(): VertexDeclaration {
        return this._vertexDeclaration;
    }

    public set vertexDeclaration(value: VertexDeclaration) {
        this._vertexDeclaration = value;
        this._getCacheInfo();
    }

    private _getCacheInfo() {
        //记录GPUVertexBufferLayout
        this.stateCacheKey = this.instanceBuffer ? "instance" : "vertex";
        const vertexDec = this._vertexDeclaration
        const vertexAttribute: GPUVertexAttribute[] = new Array<GPUVertexAttribute>();
        for (let i in vertexDec._shaderValues) {
            const vertexState = vertexDec._shaderValues[i];
            const format = this._getvertexAttributeFormat(vertexState.elementString);
            vertexAttribute.push({
                format,
                offset: vertexState.elementOffset,
                shaderLocation: parseInt(i) as GPUIndex32
            });
            this.stateCacheKey += `${i}_${format}_`
        }
        if (WebGPUVertexBuffer._bufferLayoutConterMap.has(this.stateCacheKey)) {
            this.stateCacheID = WebGPUVertexBuffer._bufferLayoutConterMap.get(this.stateCacheKey);
        } else {
            this.stateCacheID = WebGPUVertexBuffer._bufferLayoutIDConter;
            WebGPUVertexBuffer._bufferLayoutConterMap.set(this.stateCacheKey, this.stateCacheID);
            WebGPUVertexBuffer._bufferLayoutIDConter++;
        }
        this.verteBufferLayout = {
            arrayStride: vertexDec.vertexStride,
            stepMode: this.instanceBuffer ? WebGPUVertexStepMode.instance : WebGPUVertexStepMode.vertex,
            attributes: vertexAttribute
        };
    }

    private _getvertexAttributeFormat(elementFormat: string): GPUVertexFormat {
        switch (elementFormat) {
            case VertexElementFormat.Single:
                return "float32";
            case VertexElementFormat.Vector2:
                return "float32x2";
            case VertexElementFormat.Vector3:
                return "float32x3";
            case VertexElementFormat.Vector4:
                return "float32x4";
            case VertexElementFormat.Color:
                return "float32x4";
            case VertexElementFormat.Byte4:
                return "uint8x4";
            case VertexElementFormat.Byte2:
                return "uint8x2";
            case VertexElementFormat.Short2:
                return "float16x2";
            case VertexElementFormat.Short4:
                return "float16x4";
            case VertexElementFormat.NormalizedShort2:
                return "unorm16x2";
            case VertexElementFormat.NormalizedShort4:
                return "unorm16x4";
            case VertexElementFormat.NorByte4:
                return "unorm8x4";
            default:
                throw 'no cache has vertex mode';
        }
    }

    setData(buffer: ArrayBuffer, bufferOffset: number = 0, dataStartIndex: number = 0, dataCount: number = Number.MAX_SAFE_INTEGER): void {
        const needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            this.source.setDataEx(buffer, dataStartIndex, dataCount, bufferOffset);
            this.buffer = buffer;
        } else {
            this.source.setData(buffer, bufferOffset);
            this.buffer = buffer;
        }
    }

    setDataLength(byteLength: number): void {
        this.source.setDataLength(byteLength);
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        this.source.release();
        this.vertexDeclaration = null;
    }
}