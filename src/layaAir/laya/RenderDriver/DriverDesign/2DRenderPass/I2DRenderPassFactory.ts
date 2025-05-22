import { SetRenderDataCMD, SetShaderDefineCMD } from "../RenderDevice/IRenderCMD";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "./IRender2DCMD";
import { IRenderContext2D } from "./IRenderContext2D";
import { IRenderElement2D } from "./IRenderElement2D";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, IGlobalRenderData, ISpineRenderDataHandle, IGraphicDynamicVIBuffer } from "../../RenderModuleData/Design/2D/IRender2DDataHandle"

export interface I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D;

    createRenderContext2D(): IRenderContext2D;

    createBlit2DQuadCMDData(): Blit2DQuadCMD;

    createDraw2DElementCMDData(): Draw2DElementCMD;

    createSetRendertarget2DCMD(): SetRendertarget2DCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;

    createSetShaderDefineCMD(): SetShaderDefineCMD;

    createRender2DPass(): IRender2DPass;

    createRenderStruct2D(): IRenderStruct2D;

    createRender2DPassManager(): IRender2DPassManager;

    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle;

    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle;

    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle;

    create2DGlobalRenderDataHandle(): IGlobalRenderData;

    createSpineRenderDataHandle(): ISpineRenderDataHandle;

    createDynamicVIBuffer(vertexBlockSize: number, indexBlockSize: number): IGraphicDynamicVIBuffer;
}