import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Config } from "../../Config";
import { Render } from "../../laya/renders/Render";
import { Laya } from "../../Laya";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";

PAL.preIntialize = function () {
    Browser.onLayaRuntime = true;
    PAL.global = (window as any).conch;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    WasmAdapter.setInstantiateMethod(window.WebAssembly, "byBufferSync");

    Laya.addAfterInitCallback(() => {
        Laya.timer.frameOnce(2, null, gc);
        PAL.global.setGlobalRepaint(Render.setGlobalRepaint);
    });
};

function gc() {
    (window as any).gc({ type: 'major', execution: 'async' });
}