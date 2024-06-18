import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IBufferState } from "./IBufferState";

export interface IRenderGeometryElement{
    /**@internal */
    bufferState:IBufferState;
    /**@internal */
    mode:MeshTopology;
    /**@internal */
    drawType:DrawType;
    /**@internal */
    instanceCount:number;
    /**@internal */
    indexFormat:IndexFormat;
    /**@internal */
    setDrawArrayParams(first: number, count: number):void;
    /**@internal */
    setDrawElemenParams(count: number, offset: number):void;
    /**@internal */
    clearRenderParams():void;
    /**@internal */
    destroy():void;
}