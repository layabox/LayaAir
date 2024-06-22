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
    updateBufferLayoutFlag: number = 0;
    vertexState: GPUVertexBufferLayout[] = [];
    _bindedIndexBuffer: WebGPUIndexBuffer;
    _vertexBuffers: WebGPUVertexBuffer[];

    globalId: number;
    objectName: string = 'WebGPUBufferState';

    // /**
    //  * 转换数据格式
    //  */
    // private _changeDataFormat() {
    //     const bufferState = this;
    //     for (let i = 0; i < bufferState._vertexBuffers.length; i++) {
    //         const vb = bufferState._vertexBuffers[i];
    //         const vs = bufferState.vertexState[i];
    //         if (!vb.buffer) continue;
    //         let attrOld = [], attrNew = [];
    //         const attributes = vs.attributes as [];
    //         const attrLen = attributes.length;
    //         for (let j = 0; j < attrLen; j++) {
    //             const attr = attributes[j] as GPUVertexAttribute;
    //             attrOld.push({
    //                 offset: attr.offset,
    //                 format: attr.format,
    //             });
    //         }
    //         for (let j = 0; j < attrLen; j++) {
    //             const attr = attributes[j] as GPUVertexAttribute;
    //             if (attr.format === 'uint8x4') {
    //                 attr.format = 'float32x4';

    //                 // for(let k in vb.vertexDeclaration._shaderValues) {
    //                 //     const sv = vb.vertexDeclaration._shaderValues[k];
    //                 //     if (sv.elementOffset === attr.offset)
    //                 //         sv.elementString = 'vector4';
    //                 //     if (sv.elementOffset > attr.offset)
    //                 //         sv.elementOffset += 12;
    //                 //     sv.vertexStride += 12;
    //                 // }
    //                 // //@ts-ignore
    //                 // vb.vertexDeclaration._vertexStride += 12;

    //                 for (let k = 0; k < attrLen; k++) {
    //                     const attr2 = attributes[k] as GPUVertexAttribute;
    //                     if (attr2.offset > attr.offset)
    //                         attr2.offset += 12;
    //                     attrNew.push({
    //                         offset: attr2.offset,
    //                         format: attr2.format,
    //                     });
    //                 }
    //                 bufferState.updateBufferLayoutFlag++;
    //                 const strideOld = vs.arrayStride;
    //                 const vertexCount = vb.buffer.byteLength / vs.arrayStride;
    //                 vs.arrayStride += 12;

    //                 const strideNew = vs.arrayStride;
    //                 const buffer = vb.buffer;
    //                 vb.buffer = new ArrayBuffer(vs.arrayStride * vertexCount);
    //                 const src_ui8 = new Uint8Array(buffer);
    //                 const src_f32 = new Float32Array(buffer);
    //                 const dst_ui8 = new Uint8Array(vb.buffer);
    //                 const dst_f32 = new Float32Array(vb.buffer);
    //                 let src_ui8_off1 = 0;
    //                 let src_f32_off1 = 0;
    //                 let dst_ui8_off1 = 0;
    //                 let dst_f32_off1 = 0;
    //                 let src_ui8_off2 = 0;
    //                 let src_f32_off2 = 0;
    //                 let dst_ui8_off2 = 0;
    //                 let dst_f32_off2 = 0;
    //                 //拷贝数据（按照新的数据布局）
    //                 for (let k = 0; k < vertexCount; k++) {
    //                     src_ui8_off1 = k * strideOld;
    //                     src_f32_off1 = k * strideOld / 4;
    //                     dst_ui8_off1 = k * strideNew;
    //                     dst_f32_off1 = k * strideNew / 4;
    //                     for (let l = 0; l < attrLen; l++) {
    //                         if (attrOld[l].format === 'uint8x4') {
    //                             if (l === j) {
    //                                 src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
    //                                 dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
    //                                 for (let m = 0; m < 4; m++)
    //                                     dst_f32[dst_f32_off2 + m] = src_ui8[src_ui8_off2 + m];
    //                             } else {
    //                                 src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
    //                                 dst_ui8_off2 = dst_ui8_off1 + attrNew[l].offset;
    //                                 for (let m = 0; m < 4; m++)
    //                                     dst_ui8[dst_ui8_off2 + m] = src_ui8[src_ui8_off2 + m];
    //                             }
    //                         } else {
    //                             src_f32_off2 = src_f32_off1 + attrOld[l].offset / 4;
    //                             dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
    //                             for (let m = 0; m < 4; m++)
    //                                 dst_f32[dst_f32_off2 + m] = src_f32[src_f32_off2 + m];
    //                         }
    //                     }
    //                 }
    //                 vb.source = new WebGPUBuffer(vb.source._usage, vs.arrayStride * vertexCount);
    //                 vb.source.setData(vb.buffer, 0);
    //                 attrOld = attrNew;
    //                 attrNew = [];
    //             }
    //         }
    //         vb.buffer = null;
    //     }
    // }

    applyState(vertexBuffers: WebGPUVertexBuffer[], indexBuffer: WebGPUIndexBuffer): void {
        this._vertexBuffers = vertexBuffers.slice(); //因为vertexBuffers是共享的，必须slice
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