import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLExtension } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine/GLEnum/WebGLExtension";
import { RenderCapable } from "../../laya/RenderEngine/RenderEnum/RenderCapable";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onAlipayMiniGame = true;
    PAL.global = (window as any).my;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    const MYWebAssembly = (window as any).MYWebAssembly;
    if (MYWebAssembly) {
        (window as any).WebAssembly = {};
        WasmAdapter.Memory = MYWebAssembly.Memory;
    }
    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        if (!MYWebAssembly)
            throw new Error("==== 不支持wasm加载 ====");

        return MYWebAssembly.instantiate("libs/" + wasmFile, imports);
    };

    Laya.addInitCallback(() => {
        // 支付宝安卓端sRGB扩展格式支持有问题全部关掉
        //@ts-ignore
        LayaGL.renderEngine._supportCapatable._extensionMap.set(WebGLExtension.EXT_sRGB, null);
        //@ts-ignore
        LayaGL.renderEngine._supportCapatable._capabilityMap.set(RenderCapable.Texture_SRGB, false);
    });

    return cacheManager.start();
};