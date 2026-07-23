import { ISpineTempletParser } from "./ISpineParse";
import { ISpineRender } from "./ISpineRender";
import type { Spine2DRenderNode } from "../Spine2DRenderNode";
import type { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import type { ISpineRenderDataHandle } from "./ISpineRenderDataHandle";

export interface ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser;
    /**
     * @en Create the platform-specific Spine 2D render-data handle.
     * @zh 创建平台对应的 Spine 2D 渲染数据句柄。
     * @internal
     */
    createSpineRenderDataHandle(): ISpineRenderDataHandle;
    /**
     * @zh 创建Spine2D渲染器
     * @param owner 渲染节点
     * @en Create Spine renderer
     * @param owner Render node
     */
    createSpineRender2D(owner: Spine2DRenderNode): ISpineRender;
    /**
     * @zh 创建Spine3D渲染器
     * @param owner 渲染节点
     * @en Create Spine renderer
     * @param owner Render node
     */
    createSpineRender3D(owner: IBaseRenderNode): ISpineRender;
}

