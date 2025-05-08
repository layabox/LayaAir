import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

export class TbBrowserAdapter extends MgBrowserAdapter {
    createMainCanvas() {
        let canvas = (window as any).screencanvas //mini
            || (window as any).canvas.getRealCanvas();//app/plugin

        if (!PAL.global.isIDE) {
            let originfun = canvas.getContext;
            canvas.getContext = function (type: string) {
                let gl = originfun.apply(canvas, [type]);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                return gl;
            }
        }

        (!canvas.style) && (canvas.style = {});
        return canvas;
    }
}

ClassUtils.regClass("PAL.Browser", TbBrowserAdapter);