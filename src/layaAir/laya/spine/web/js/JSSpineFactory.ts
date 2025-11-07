import { ISpineFactory } from "../../interface/ISpineFactory";
import { ISpineTempletParser } from "../../interface/ISpineParse";
import { ISpineRender } from "../../interface/ISpineRender";
import { Spine2DRenderNode } from "../../Spine2DRenderNode";
import { SpineOptimizeRender } from "../base/optimize/SpineOptimizeRender";
import { INormalRenderUpdater } from "../interface/IWebSpine";
import { SpineNormalRenderUpdater } from "./SpineNormalRenderUpdater";
import { WebSpineTempletParser } from "./WebSpineTempletParser";

export class JSSpineFactory implements ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser {
        return new WebSpineTempletParser();
    }
    /**
     * @zh 创建Spine渲染器，统一使用SpineOptimizeRender，通过mode属性切换不同实现
     * @en Create Spine renderer, unified using SpineOptimizeRender, switch different implementations via mode property
     */
    createSpineRender(owner: Spine2DRenderNode): ISpineRender {
        return new SpineOptimizeRender(owner);
    }

    createNormalRenderUpdater(): INormalRenderUpdater {
        return new SpineNormalRenderUpdater();
    }
}
