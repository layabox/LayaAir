import { SetRenderDataCMD, SetShaderDefineCMD } from "../RenderDevice/IRenderCMD";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "./IRender2DCMD";
import { IRenderContext2D } from "./IRenderContext2D";
import { IRenderElement2D } from "./IRenderElement2D";

export interface I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D;

    createRenderContext2D(): IRenderContext2D;

    createBlit2DQuadCMDData(): Blit2DQuadCMD;

    createDraw2DElementCMDData(): Draw2DElementCMD;

    createSetRendertarget2DCMD(): SetRendertarget2DCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;
    createSetShaderDefineCMD(): SetShaderDefineCMD ;
}