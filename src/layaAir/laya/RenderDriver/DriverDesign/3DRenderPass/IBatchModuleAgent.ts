import { Camera } from "../../../d3/core/Camera";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { CameraCullInfo, ShadowCullInfo } from "../../../d3/shadowMap/ShadowSliceData";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D, IRenderElement3D } from "./I3DRenderPass";

export enum BatchCullMode {
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
     * 更新属性
     * @param object 
     * @param property 
     */
    updateProperty(object: BaseRender, property: string | number): void;
    /**
     * 设置相机裁剪信息
     */
    setCullCamera(cameraCullInfo: CameraCullInfo[]): void;
    /**
     * 设置方向光裁剪信息
     */
    setDirLightCullInfo(directLightCullInfo: ShadowCullInfo[]): void;
    /**
     * 设置点光源裁剪信息
     */
    setSpotCullingDir(directLightCullInfo: CameraCullInfo[]): void;
    /**
     * 添加渲染元素
     */
    appendRenderElement(cullMode: BatchCullMode, cullInfoIndex: number, context: IRenderContext3D): IModuleAgentResource;
    /**
     * 释放
     */
    release(): void;
}