import { Camera } from "../../../d3/core/Camera";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderElement3D } from "./I3DRenderPass";
import { ISceneRenderManager } from "./ISceneRenderManager";

export enum CullMode {
    None,
    Camera,
    DirectLight,
    Spot,
}

export interface IModuleAgentResource {
    opaqueList: SingletonList<IRenderElement3D>;
    transparentList: SingletonList<IRenderElement3D>;
}

export interface IBatchModuleAgent {
    /**
     * 创建
     */
    create(): void;
    /**
     * 尝试添加渲染节点
     * @param object 
     * @returns 
     */
    addRenderNode(object: BaseRender): boolean;
    /**
     * 尝试移除渲染节点
     * @param object 
     * @returns 
     */
    removeRenderNode(object: BaseRender): boolean;
    /**
     * 设置相机裁剪信息
     */
    setCullCamera(cameraCullInfo: any[]): boolean;
    /**
     * 设置方向光裁剪信息
     */
    setCullingDir(DirectLightCullInfo: any[]): boolean;
    /**
     * 设置点光源裁剪信息
     */
    setFrustumCulling(SpotCullInfo: any[]): boolean;
    /**
     * 添加渲染元素
     */
    appendRenderElement(cullMode: CullMode, cullInfoIndex: number,): IModuleAgentResource;
    /**
     * 释放
     */
    release(): void;
}