import { Laya } from "../../../Laya";
import { SpineConst } from "../SpineConst";
import { NativeSkeletonOptimise } from "./NativeSkeletonOptimise";
import { NativeSpineFactory } from "./NativeSpineFactory";

Laya.addAfterInitCallback(() => {
    SpineConst.factory = new NativeSpineFactory();
    NativeSkeletonOptimise.__init__();
});
