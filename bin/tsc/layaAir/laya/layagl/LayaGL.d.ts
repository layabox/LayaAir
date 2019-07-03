import { CommandEncoder } from "./CommandEncoder";
import { LayaGPU } from "../webgl/LayaGPU";
/**
 * @private
 * 封装GL命令
 */
export declare class LayaGL {
    static EXECUTE_JS_THREAD_BUFFER: number;
    static EXECUTE_RENDER_THREAD_BUFFER: number;
    static EXECUTE_COPY_TO_RENDER: number;
    static EXECUTE_COPY_TO_RENDER3D: number;
    static ARRAY_BUFFER_TYPE_DATA: number;
    static ARRAY_BUFFER_TYPE_CMD: number;
    static ARRAY_BUFFER_REF_REFERENCE: number;
    static ARRAY_BUFFER_REF_COPY: number;
    static UPLOAD_SHADER_UNIFORM_TYPE_ID: number;
    static UPLOAD_SHADER_UNIFORM_TYPE_DATA: number;
    static instance: any;
    static layaGPUInstance: LayaGPU;
    createCommandEncoder(reserveSize?: number, adjustSize?: number, isSyncToRenderThread?: boolean): CommandEncoder;
    beginCommandEncoding(commandEncoder: CommandEncoder): void;
    endCommandEncoding(): void;
    static getFrameCount(): number;
    static syncBufferToRenderThread(value: any, index?: number): void;
    static createArrayBufferRef(arrayBuffer: any, type: number, syncRender: boolean): void;
    static createArrayBufferRefs(arrayBuffer: any, type: number, syncRender: boolean, refType: number): void;
    matrix4x4Multiply(m1: any, m2: any, out: any): void;
    evaluateClipDatasRealTime(nodes: any, playCurTime: number, realTimeCurrentFrameIndexs: any, addtive: boolean): void;
}
