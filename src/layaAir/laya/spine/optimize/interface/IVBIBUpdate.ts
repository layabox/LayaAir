import { MultiRenderData } from "../MultiRenderData";

export interface IVBIBUpdate {
    updateVB(vertexArray: Float32Array, vbLength: number): void;

    updateIB(indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData): void;
}