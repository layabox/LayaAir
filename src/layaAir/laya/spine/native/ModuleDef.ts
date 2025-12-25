import { Laya } from "../../../Laya";
import { SpineConst } from "../SpineConst";
import { NativeSpineFactory } from "./NativeSpineFactory";

Laya.addInitCallback(() => {
    SpineConst.factory = new NativeSpineFactory();
});
