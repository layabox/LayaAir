import { IDirectLightShadowRP, IForwardAddClusterRP, IForwardAddRP, IIndexBuffer3D, IRender3DProcess, IRenderContext3D, IRenderElement3D, ISpotLightShadowRP, IVertexBuffer3D } from "./I3DRenderPass";
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

    createVertexBuffer3D(): IVertexBuffer3D;

    createIndexBuffer3D(): IIndexBuffer3D;

    createRenderContext3D():IRenderContext3D;

    createRenderElement3D():IRenderElement3D;
        
    createSkinRenderElement(): IRenderElement3D;//TODO

    createSceneRenderManager(): ISceneRenderManager;
}