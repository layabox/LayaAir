import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { Config } from "./../../Config";
import { ILaya } from "./../../ILaya";
import { Context } from "./Context";

/**
 * @en The class responsible for driving the engine's main loop.
 * @zh 负责驱动引擎主循环的类。
 */
export class Render {
    /**
     * @en The interval time of each frame in milliseconds.
     * @zh 每帧的间隔时间，单位为毫秒。
     */
    static frameInterval = 1000 / 60;
    /**
     * @en The frame number of the last run.
     * @zh 最近一次运行的帧号。
     */
    static lastFrame = 0;

    private static _context: Context;

    // 全局重画标志。一个get一个set是为了把标志延迟到下一帧的开始，防止部分对象接收不到。
    private static _globalRepaintSet: boolean = false;
    private static _globalRepaintGet: boolean = false;

    /**
     * @internal
     */
    static __init__() {
        let ctx = new Context();
        ctx.isMain = true;
        Render._context = ctx;
        Browser.mainCanvas.context = ctx;
        Render.frameInterval = 1000 / Config.FPS;

        let timeId: number = 0;
        PAL.browser.on("visibilitychange", (visible: boolean) => {
            if (!visible)
                timeId = window.setInterval(Render.loop, 1000);
            else if (timeId != 0)
                window.clearInterval(timeId);
        });

        Render.startLoop();
    }

    static startLoop() {
        let lastFrmTm = performance.now();
        let first = true;
        let startTm = 0; //刚启动的时间。由于微信的rAF不标准，传入的stamp参数不对，因此自己计算一个从启动开始的相对时间
        let requestFrame = PAL.browser.requestFrame;

        function loop(stamp: number) {
            let sttm = performance.now();
            lastFrmTm = sttm;
            if (first) {
                // 把starttm转成帧对齐
                startTm = Math.floor(stamp / Render.frameInterval) * Render.frameInterval;
                first = false;
            }
            // 与第一帧开始时间的delta
            stamp -= startTm;
            // 计算当前帧数
            let frm = Math.floor(stamp / Render.frameInterval);    // 不能|0 在微信下会变成负的
            // 是否已经跨帧了
            let dfrm = frm - Render.lastFrame;
            if (dfrm > 0 || !Config.fixedFrames) {
                //不限制
                Render.lastFrame = frm;
                Render.loop();
            }

            requestFrame(loop);
        }

        requestFrame(loop);
    }

    /**
     * @internal
     */
    static loop() {
        this._globalRepaintGet = this._globalRepaintSet;
        this._globalRepaintSet = false;
        ILaya.stage.render(Render._context, 0, 0);
    }

    /**
     * @ignore
     */
    static vsyncTime() {
        return Render.lastFrame * Render.frameInterval;
    }

    /**
     * @ignore
     */
    static isGlobalRepaint(): boolean {
        return Render._globalRepaintGet;
    }

    /**
     * @ignore
     */
    static setGlobalRepaint(): void {
        Render._globalRepaintSet = true;
    }

    /** @deprecated */
    static get canvas(): any {
        return Browser.mainCanvas.source;
    }
}
