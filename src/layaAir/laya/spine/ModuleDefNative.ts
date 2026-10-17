import { Laya } from "../../Laya";
import { LayaEnv } from "../../LayaEnv";
import { BaseRender2DType } from "../display/SpriteConst";
import { BatchManager } from "../RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { NativeSkeletonOptimise } from "./native/NativeSkeletonOptimise";
import { NativeSpineFactory } from "./native/NativeSpineFactory";
import { SpineConst } from "./SpineConst";
import { SpineInstanceBatch } from "./web/base/2d/batch/SpineInstanceBatch";
import { SpineNormalBatch } from "./web/base/2d/batch/SpineNormalBatch";
import { SpineNormalRenderUpdater } from "./web/base/optimize/SpineNormalRenderUpdater";
import { JSSpineFactory } from "./web/JSSpineFactory";
import { SpineAdapter } from "./web/SpineAdapter";

Laya.addAfterInitCallback(() => {
    if (!LayaEnv.isConch || (window as any).conchConfig.getGraphicsAPI() === 2) {
        SpineConst.factory = new JSSpineFactory();
        SpineNormalRenderUpdater.__init__();
        SpineAdapter.adaptJS();
        if (SpineConst.ENABLE_WEB_BATCH) {
            BatchManager.registerProvider(BaseRender2DType.spineSimple, SpineInstanceBatch);
            BatchManager.registerProvider(BaseRender2DType.spinenormal, SpineNormalBatch);
        }
        return;
    }

    SpineConst.factory = new NativeSpineFactory();
    NativeSkeletonOptimise.__init__();
});
