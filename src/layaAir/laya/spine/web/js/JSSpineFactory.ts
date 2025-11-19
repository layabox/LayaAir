import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ISpineFactory } from "../../interface/ISpineFactory";
import { ISpineTempletParser } from "../../interface/ISpineParse";
import { ISpineRender } from "../../interface/ISpineRender";
import { Spine2DRenderNode } from "../../Spine2DRenderNode";
import { SpineOptimizeRender2D } from "../base/2d/SpineOptimizeRender2D";
import { SpineOptimizeRender3D } from "../base/3d/SpineOptimizeRender3D";
import { INormalRenderUpdater } from "../interface/IWebSpine";
import { SpineNormalRenderUpdater } from "./SpineNormalRenderUpdater";
import { WebSpineTempletParser } from "./WebSpineTempletParser";

export class JSSpineFactory implements ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser {
        return new WebSpineTempletParser();
    }
    /**
     * @zh 创建Spine渲染器，统一使用SpineOptimizeRender2D，通过mode属性切换不同实现
     * @en Create Spine renderer, unified using SpineOptimizeRender2D, switch different implementations via mode property
     */
    createSpineRender2D(owner: Spine2DRenderNode): ISpineRender {
        return new SpineOptimizeRender2D(owner);
    }

    createSpineRender3D(owner: IBaseRenderNode): ISpineRender {
        return new SpineOptimizeRender3D(owner);
    }
    
    createNormalRenderUpdater(): INormalRenderUpdater {
        return new SpineNormalRenderUpdater();
    }
}
