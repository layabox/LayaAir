import { SetRenderDataCMD, SetShaderDefineCMD } from "../RenderDevice/IRenderCMD";
import { IInstanceRenderBatch, IInstanceRenderElement3D, IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "./I3DRenderPass";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD} from "./IRender3DCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";

export interface I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess;

    createRenderContext3D(): IRenderContext3D;

    createRenderElement3D(): IRenderElement3D;

    createInstanceBatch(): IInstanceRenderBatch;

    createInstanceRenderElement3D(): IInstanceRenderElement3D;

    createSkinRenderElement(): ISkinRenderElement3D;//TODO

    createSceneRenderManager(): ISceneRenderManager;

    //Render3D CMD
    createDrawNodeCMDData(): DrawNodeCMDData;

    createBlitQuadCMDData(): BlitQuadCMDData;

    createDrawElementCMDData(): DrawElementCMDData;

    createSetViewportCMD(): SetViewportCMD;

    createSetRenderTargetCMD(): SetRenderTargetCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;

    createSetShaderDefineCMD(): SetShaderDefineCMD;
}