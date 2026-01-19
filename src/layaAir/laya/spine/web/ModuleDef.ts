import { Laya } from "../../../Laya";
import { BaseRender2DType } from "../../display/SpriteConst";
import { BatchManager } from "../../RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { SpineConst } from "../SpineConst";
import { SpineInstanceBatch } from "./base/2d/batch/SpineInstanceBatch";
import { SpineNormalBatch } from "./base/2d/batch/SpineNormalBatch";
import { SpineNormalRenderUpdater } from "./base/optimize/SpineNormalRenderUpdater";
import { JSSpineFactory } from "./JSSpineFactory";
import { SpineAdapter } from "./SpineAdapter";

Laya.addInitCallback(() => {
    SpineConst.factory = new JSSpineFactory();
    SpineNormalRenderUpdater.__init__();
    SpineAdapter.adaptJS();
    if (SpineConst.ENABLE_WEB_BATCH) {
        BatchManager.registerProvider(BaseRender2DType.spineSimple, SpineInstanceBatch);
        BatchManager.registerProvider(BaseRender2DType.spinenormal, SpineNormalBatch);
    }
});
