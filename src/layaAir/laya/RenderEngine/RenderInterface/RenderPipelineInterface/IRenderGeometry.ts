import { BufferState } from "../../../d3/core/BufferState";

export interface IRenderGeometry{
    _bufferState:BufferState;
    prepareRenderCMD:any;
    renderCMD:any;
}