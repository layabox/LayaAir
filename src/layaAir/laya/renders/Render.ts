import { LayaGL } from "../layagl/LayaGL";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { Config } from "./../../Config";
import { ILaya } from "./../../ILaya";

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

    /**
     * @internal
     */
    static __init__() {
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

    /**
     * @internal
     */
    static startLoop() {
        let requestFrame = PAL.browser.requestFrame;
        let lastTime: number = null;
        let first = true;
        let startTm = 0;
        let leftTime = 0;

        function loop(timestamp: number) {
            //使用传入的timestamp值可以获得平稳的间隔时间，如果自己用performance.now计算差值则会有波动
            //但在小游戏平台（例如淘宝），rAF的stamp参数可能与performance.now()差距较大，所以一刀切不使用
            if (timestamp == null || PAL.g !== null)
                timestamp = performance.now();
            let interval = Render.frameInterval;

            if (first) {
                // 把starttm转成帧对齐
                startTm = Math.floor(timestamp / interval) * interval;
                first = false;
            }

            let delta = leftTime + timestamp - lastTime;
            if (delta + 1 >= interval || !Config.fixedFrames) {
                leftTime = Math.min(delta - interval, interval);
                lastTime = timestamp;

                Render.lastFrame = Math.floor((timestamp - startTm) / interval);
                Render.loop(timestamp);
            }

            requestFrame(loop);
        }

        requestFrame(loop);
    }

    /**
     * @internal
     */
    static loop(timestamp: number) {
        LayaGL.statAgent.startFrameLogic(timestamp);
        ILaya.stage.render(timestamp);
        LayaGL.statAgent.endFrameLogic(timestamp);
    }

    /**
     * @ignore
     */
    static vsyncTime() {
        return Render.lastFrame * Render.frameInterval;
    }

    /** @deprecated */
    static get canvas(): any {
        return Browser.mainCanvas.source;
    }
}
