import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";
export enum WebGPUVertexStepMode {
    vertex = "vertex",
    instance = "instance"
}

export class WebGPUBufferState implements IBufferState {
    _vertexState: Array<GPUVertexBufferLayout> = new Array();//GPURenderPipelineDescriptor-GPUVertexState
    _bindedIndexBuffer: WebGPUIndexBuffer;
    _vertexBuffers: WebGPUVertexBuffer[];

    applyState(vertexBuffers: WebGPUVertexBuffer[], indexBuffer: WebGPUIndexBuffer): void {
        this._vertexBuffers = vertexBuffers;
        this._bindedIndexBuffer = indexBuffer;
    }

    

    private _getVertexBufferLayoutArray() {
        this._vertexBuffers.length = 0;
        this._vertexBuffers.forEach(element => {
            let vertexDec = element.vertexDeclaration
            let vertexAttribute: GPUVertexAttribute[] = new Array<GPUVertexAttribute>();
            for (var i in vertexDec._shaderValues) {
                let vertexState = vertexDec._shaderValues[i];
                vertexAttribute.push({
                    format: this._getvertexAttributeFormat(vertexState.elementString),
                    offset: vertexState.elementOffset,
                    shaderLocation: parseInt(i) as GPUIndex32
                })
            }
            let verteBufferLayout: GPUVertexBufferLayout = {
                arrayStride: vertexDec.vertexStride,
                stepMode: element.instanceBuffer ? WebGPUVertexStepMode.instance : WebGPUVertexStepMode.vertex,
                attributes: vertexAttribute
            };
            this._vertexState.push(verteBufferLayout);
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

    }

}