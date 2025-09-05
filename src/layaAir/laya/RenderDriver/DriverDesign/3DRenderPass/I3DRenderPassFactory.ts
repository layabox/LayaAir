import { ComputeCommandAppatchCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../RenderDevice/IRenderCMD";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "./I3DRenderPass";
import { IBatchModuleAgent } from "./IBatchModuleAgent";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "./IRender3DCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";

export interface I3DRenderPassFactory {

    createRender3DProcess(): IRender3DProcess;

    createRenderContext3D(): IRenderContext3D;

    createRenderElement3D(): IRenderElement3D;

    createSkinRenderElement(): ISkinRenderElement3D;//TODO

    createSceneRenderManager(): ISceneRenderManager;

    createMeshRenderBatchModule(): IBatchModuleAgent;

    //Render3D CMD
    createDrawNodeCMDData(): DrawNodeCMDData;

    createBlitQuadCMDData(): BlitQuadCMDData;

    createDrawElementCMDData(): DrawElementCMDData;

    createSetViewportCMD(): SetViewportCMD;

    createSetRenderTargetCMD(): SetRenderTargetCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;

    createSetShaderDefineCMD(): SetShaderDefineCMD;

    createComputeCommandAppatchCMD?(): ComputeCommandAppatchCMD;
}