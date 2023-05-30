import { SingletonList } from "../../../utils/SingletonList";
import { BufferState } from "../../../webgl/utils/BufferState";
import { DrawType } from "../../RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";

export interface IRenderGeometryElement{
    /**@internal */
    bufferState:BufferState;
    /**@internal */
    mode:MeshTopology;
    /**@internal */
    drawType:DrawType;
    /**@internal */
    drawParams:SingletonList<number>;
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