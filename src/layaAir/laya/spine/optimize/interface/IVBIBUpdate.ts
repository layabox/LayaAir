import { SkinAniRenderData } from "../AnimationRender";
import { MultiRenderData } from "../MultiRenderData";

export interface IVBIBUpdate {

    renderUpdate(skindata:SkinAniRenderData, frame:number):void;

    // updateVB(vertexArray: Float32Array, vbLength: number): void;

    // updateIB(indexArray: Uint16Array|Uint32Array|Uint8Array, ibLength: number, mutiRenderData: MultiRenderData,isMuti:boolean): void;
}