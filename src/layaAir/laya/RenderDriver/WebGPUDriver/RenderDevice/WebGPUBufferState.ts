import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";

export enum WebGPUVertexStepMode {
    vertex = "vertex",
    instance = "instance"
}

export class WebGPUBufferState implements IBufferState {
    static idCounter: number = 0;
    id: number;
    updateBufferLayoutFlag: number = 0;
    vertexState: GPUVertexBufferLayout[] = [];
    _bindedIndexBuffer: WebGPUIndexBuffer;
    _vertexBuffers: WebGPUVertexBuffer[];

    globalId: number;
    objectName: string = 'WebGPUBufferState';

    applyState(vertexBuffers: WebGPUVertexBuffer[], indexBuffer: WebGPUIndexBuffer): void {
        this._vertexBuffers = vertexBuffers.slice();
        this._bindedIndexBuffer = indexBuffer;
        this._getVertexBufferLayoutArray();
        this.updateBufferLayoutFlag++;
    }

    constructor() {
        this.id = WebGPUBufferState.idCounter++;
        this.globalId = WebGPUGlobal.getId(this);
    }

    private _getVertexBufferLayoutArray() {
        this.vertexState.length = 0;
        this._vertexBuffers.forEach(element => {
            const vertexDec = element.vertexDeclaration
            const vertexAttribute: GPUVertexAttribute[] = new Array<GPUVertexAttribute>();
            for (let i in vertexDec._shaderValues) {
                const vertexState = vertexDec._shaderValues[i];
                vertexAttribute.push({
                    format: this._getvertexAttributeFormat(vertexState.elementString),
                    offset: vertexState.elementOffset,
                    shaderLocation: parseInt(i) as GPUIndex32
                })
            }
            const verteBufferLayout: GPUVertexBufferLayout = {
                arrayStride: vertexDec.vertexStride,
                stepMode: element.instanceBuffer ? WebGPUVertexStepMode.instance : WebGPUVertexStepMode.vertex,
                attributes: vertexAttribute
            };
            this.vertexState.push(verteBufferLayout);
        });
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

    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}