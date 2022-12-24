import { SingletonList } from "../../../utils/SingletonList";
import { BufferState } from "../../../webgl/utils/BufferState";
import { DrawType } from "../../RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";

export interface IRenderGeometryElement{
    bufferState:BufferState;
    mode:MeshTopology;
    drawType:DrawType;
    drawParams:SingletonList<number>;
    instanceCount:number;
    indexFormat:IndexFormat;
    setDrawArrayParams(first: number, count: number):void;
    setDrawElemenParams(count: number, offset: number):void;
    clearRenderParams():void;
    destroy():void;
}