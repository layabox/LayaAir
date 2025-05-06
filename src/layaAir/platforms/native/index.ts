import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Config } from "../../Config";
import { Render } from "../../laya/renders/Render";
import { Laya } from "../../Laya";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { Utils } from "../../laya/utils/Utils";

PAL.preIntialize = function () {
    Browser.onLayaRuntime = true;
    PAL.global = (window as any).conch;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    PAL.media.touchToStart = false;

    Laya.addAfterInitCallback(() => {
        Laya.timer.frameOnce(2, null, gc);
        PAL.global.setGlobalRepaint(Render.setGlobalRepaint.bind(Render));
    });

    if (window.WebAssembly)
        WasmAdapter.Memory = window.WebAssembly.Memory;
    WasmAdapter.locateFile = (path: string, dir: string, webDir: string) => {
        return webDir + "libs/" + Utils.getBaseName(path);
    };
};

function gc() {
    (window as any).gc({ type: 'major', execution: 'async' });
}