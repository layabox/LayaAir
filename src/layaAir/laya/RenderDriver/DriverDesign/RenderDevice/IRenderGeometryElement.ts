import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IBufferState } from "./IBufferState";
import { IDeviceBuffer } from "./IStorageBuffer";

export interface IRenderGeometryElement {
    bufferState: IBufferState;
    mode: MeshTopology;
    drawType: DrawType;
    instanceCount: number;
    indexFormat: IndexFormat;
    /**
     * 设置顶点的渲染初始开始位置和长度，参数会累加。此参数只在DrawArray为DrawElement和 DrawArrayInstance中有用
     * @param first 
     * @param count 
     */
    setDrawArrayParams(first: number, count: number): void;
    /**
     * 设置索引渲染数量和偏移，参数会累加，此参数只在DrawType为DrawElement和DrawElementInstance中有用
     * @param first 
     * @param count 
     */
    setDrawElemenParams(count: number, offset: number): void;
    /**
     * 设置间接渲染的Buffer和偏移,此参数只在DrawType为DrawArrayIndirect和DrawElementIndirect中有用
     * @param buffer 
     * @param offset 
     */
    setIndirectDrawBuffer?(buffer: IDeviceBuffer, offset: number): void;
    clearRenderParams(): void;
    destroy(): void;
    /**
     * @en get render params Array
     * @zh 获取渲染参数队列 
     */
    getDrawDataParams(out: FastSinglelist<number>): void;
}