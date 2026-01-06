import { ISpineTempletParser } from "./ISpineParse";
import { ISpineRender } from "./ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";

export interface ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser;
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

