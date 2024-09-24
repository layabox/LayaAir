import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { WebGPUBuffer } from "./WebGPUBuffer";
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
    stateId: string; //能够描述状态id
    updateBufferLayoutFlag: number = 0;
    vertexState: GPUVertexBufferLayout[] = [];
    _bindedIndexBuffer: WebGPUIndexBuffer;
    _vertexBuffers: WebGPUVertexBuffer[];

    globalId: number;
    objectName: string = 'WebGPUBufferState';

    /**
     * 是否需要转换顶点数据格式
     */
    isNeedChangeFormat() {
        for (let i = this._vertexBuffers.length - 1; i > -1; i--) {
            const attributes = this.vertexState[i].attributes as GPUVertexAttribute[];
            for (let j = attributes.length - 1; j > -1; j--) {
                if (attributes[j].format === 'uint8x4') {
                    return true;
                }
            }
        }
        return false;
    }

    applyState(vertexBuffers: WebGPUVertexBuffer[], indexBuffer: WebGPUIndexBuffer): void {
        this._vertexBuffers = vertexBuffers.slice(); //因为vertexBuffers是共享的，必须slice
        this._bindedIndexBuffer = indexBuffer;
        this._getVertexBufferLayoutArray();
        this.updateBufferLayoutFlag++;
    }

    constructor() {
        this.id = WebGPUBufferState.idCounter++;
        this.stateId = 'x';
        this.globalId = WebGPUGlobal.getId(this);
    }

    private _getVertexBufferLayoutArray() {
        this.stateId = '';
        this.vertexState.length = 0;
        this._vertexBuffers.forEach(element => {
            const vertexDec = element.vertexDeclaration
            const vertexAttribute: GPUVertexAttribute[] = new Array<GPUVertexAttribute>();
            for (let i in vertexDec._shaderValues) {
                const vertexState = vertexDec._shaderValues[i];
                const format = this._getvertexAttributeFormat(vertexState.elementString);
                const ss = this._getvertexAttributeSymbol(vertexState.elementString);
                vertexAttribute.push({
                    format,
                    offset: vertexState.elementOffset,
                    shaderLocation: parseInt(i) as GPUIndex32
                });
                this.stateId += ss;
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

    private _getvertexAttributeSymbol(elementFormat: string): string {
        switch (elementFormat) {
            case VertexElementFormat.Single:
                return '0';
            case VertexElementFormat.Vector2:
                return '1';
            case VertexElementFormat.Vector3:
                return '2';
            case VertexElementFormat.Vector4:
                return '3';
            case VertexElementFormat.Color:
                return '4';
            case VertexElementFormat.Byte4:
                return '5';
            case VertexElementFormat.Byte2:
                return '6';
            case VertexElementFormat.Short2:
                return '7';
            case VertexElementFormat.Short4:
                return '8';
            case VertexElementFormat.NormalizedShort2:
                return '9';
            case VertexElementFormat.NormalizedShort4:
                return 'a';
            case VertexElementFormat.NorByte4:
                return 'b';
            default:
                throw 'no cache has vertex mode';
        }
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}