import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MultiRenderData } from "../MultiRenderData";

export interface IVBIBUpdate {
    updateVB(vertexArray: Float32Array, vbLength: number): void;

    updateIB(indexArray: Uint16Array | Uint32Array , type:IndexFormat , size:number , ibLength: number, mutiRenderData: MultiRenderData,isMuti:boolean): void;
}