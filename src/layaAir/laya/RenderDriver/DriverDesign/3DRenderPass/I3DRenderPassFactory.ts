import { IInstanceRenderElement3D } from "../../DriverCommon/IInstanceRenderElement3D";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "./I3DRenderPass";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "./IRendderCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";

export interface I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess;

    createRenderContext3D(): IRenderContext3D;

    createRenderElement3D(): IRenderElement3D;

    getMaxInstanceCount(): number; //新增，获取Instance批渲染的最大数量
    recoverInstanceRenderElement3D(element: IInstanceRenderElement3D): void; //新增，归还Instance渲染节点
    createInstanceRenderElement3D(): IInstanceRenderElement3D; //新增，获取Instance渲染节点

    createSkinRenderElement(): ISkinRenderElement3D;

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