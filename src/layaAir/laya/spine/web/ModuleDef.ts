import { Laya } from "../../../Laya";
import { SpineConst } from "../SpineConst";
import { SpineNormalRenderUpdater } from "./base/optimize/SpineNormalRenderUpdater";
import { JSSpineFactory } from "./JSSpineFactory";
import { SpineAdapter } from "./SpineAdapter";

Laya.addInitCallback(() => {
    SpineConst.factory = new JSSpineFactory();
    SpineNormalRenderUpdater.__init__();
    SpineAdapter.adaptJS();
});
