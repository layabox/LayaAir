import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkyRenderElement3D } from "./I3DRenderPass";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "./IRendderCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";

export interface I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess;

    createRenderContext3D(): IRenderContext3D;

    createRenderElement3D(): IRenderElement3D;

    createSkinRenderElement(): IRenderElement3D;//TODO

    createSkyRenderElement(): ISkyRenderElement3D;

    createSceneRenderManager(): ISceneRenderManager;

    //Render CMD
    createDrawNodeCMDData(): DrawNodeCMDData;

    createBlitQuadCMDData(): BlitQuadCMDData;

    createDrawElementCMDData(): DrawElementCMDData;

    createSetViewportCMD(): SetViewportCMD;

    createSetRenderTargetCMD(): SetRenderTargetCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;

    createSetShaderDefineCMD(): SetShaderDefineCMD;
}