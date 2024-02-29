import { IDirectLightShadowRP, IForwardAddClusterRP, IForwardAddRP, IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkyRenderElement3D, ISpotLightShadowRP } from "./I3DRenderPass";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD, SetRenderDataCMD, SetShaderDefineCMD } from "./IRendderCMD";
import { ISceneRenderManager } from "./ISceneRenderManager";

export interface I3DRenderPassFactory {

    //直射光渲染流程数据
    createDirectLightShadowRP(): IDirectLightShadowRP;

    //聚光灯渲染流程数据
    createSpotLightShadowRP(): ISpotLightShadowRP;

    //基于一个Camera的渲染流程
    createForwardAddRP(): IForwardAddRP;

    createForwardAddCluster(): IForwardAddClusterRP;

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