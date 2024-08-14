import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IBufferState } from "./IBufferState";

export interface IRenderGeometryElement {
    /**@internal */
    bufferState: IBufferState;
    /**@internal */
    mode: MeshTopology;
    /**@internal */
    drawType: DrawType;
    /**@internal */
    instanceCount: number;
    /**@internal */
    indexFormat: IndexFormat;
    /**@internal */
    setDrawArrayParams(first: number, count: number): void;
    /**@internal */
    setDrawElemenParams(count: number, offset: number): void;
    /**@internal */
    clearRenderParams(): void;
    /**@internal */
    destroy(): void;
    /**
     * @en get render params Array
     * @zh 获取渲染参数队列 
     */
    getDrawDataParams(out: FastSinglelist<number>): void;
}