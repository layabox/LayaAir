import { IDirectLightShadowRP } from "./Render3DProcess/IDirectLightShadowRP";
import { IForwardAddClusterRP } from "./Render3DProcess/IForwardAddClusterRP";
import { IForwardAddRP } from "./Render3DProcess/IForwardAddRP";
import { IRender3DProcess } from "./Render3DProcess/IRender3DProcess";
import { ISpotLightShadowRP } from "./Render3DProcess/ISpotLightShadowRP";

export interface I3DRenderDriverPassFactory{
    
    //直射光渲染流程数据
    createDirectLightShadowRP():IDirectLightShadowRP;
    
    //聚光灯渲染流程数据
    createSpotLightShadowRP():ISpotLightShadowRP;

    //基于一个Camera的渲染流程
    createForwardAddRP():IForwardAddRP;

    createForwardAddCluster():IForwardAddClusterRP;

    createRender3DProcess():IRender3DProcess;
}