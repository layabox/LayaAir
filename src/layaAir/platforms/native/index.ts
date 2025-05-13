import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Config } from "../../Config";
import { Render } from "../../laya/renders/Render";
import { Laya } from "../../Laya";
import { setCustomWasmLoader } from "../minigame/WasmUtils";

PAL.preIntialize = function () {
    Browser.onLayaRuntime = true;
    PAL.global = (window as any).conch;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    setCustomWasmLoader(true);

    Laya.addAfterInitCallback(() => {
        Laya.timer.frameOnce(2, null, gc);
        PAL.global.setGlobalRepaint(Render.setGlobalRepaint);
    });
};

function gc() {
    (window as any).gc({ type: 'major', execution: 'async' });
}