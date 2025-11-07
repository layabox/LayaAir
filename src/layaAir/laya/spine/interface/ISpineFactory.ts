import { ISpineTempletParser } from "./ISpineParse";
import { ISpineRender } from "./ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";

export interface ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser;
    /**
     * @zh 创建Spine渲染器
     * @param owner 渲染节点
     * @en Create Spine renderer
     * @param owner Render node
     */
    createSpineRender(owner: Spine2DRenderNode): ISpineRender;
}

