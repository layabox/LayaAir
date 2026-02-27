import { InputManager } from "../events/InputManager";
import { LayaGL } from "../layagl/LayaGL";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { Config } from "./../../Config";
import { ILaya } from "./../../ILaya";

var _renderCount: number = 0;

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
     * @en The start time of the current frame in milliseconds.
     * @zh 当前帧的开始时间，单位为毫秒。
     */
    static frameStartTime: number = 0;

    /**
     * @en Throttle mode: 0 - none, normal frame rate; 1 - half frame rate; 2 - full frame after mouse activity, half frame rate after 2 seconds of mouse inactivity; 3 - fixed 1 frame per second;
     * @zh 限能模式：0-无，正常帧率运行; 1-帧率减半; 2-鼠标活动后满帧，鼠标不动2秒后满帧减半; 3-固定每秒1帧;
     */
    static throttleMode: 0 | 1 | 2 | 3 = 0;

    /**
     * @en Custom frame update predicate function. The function signature is: function(timestamp:number):boolean;
     * @zh 自定义帧更新条件函数，函数签名为：function(timestamp:number):boolean;
     */
    static predicate: (timestamp: number) => boolean = null;

    /**
     * @internal
     */
    private static _paused: boolean = false;

    /**
     * @en Pauses or resumes the rendering loop.
     * @zh 暂停或恢复渲染循环。
     */
    static get paused(): boolean {
        return Render._paused;
    }

    static set paused(value: boolean) {
        if (Render._paused === value) return;

        Render._paused = value;

        // Resume: mark all timers as just resumed for smooth transition
        if (!value) {
            ILaya.systemTimer?._markResumed();
            ILaya.physicsTimer?._markResumed();
            ILaya.timer?._markResumed();
        }
    }

    /**
     * @en Force the next frame to be rendered. This flag is automatically cleared after rendering.
     * @zh 强制渲染下一帧。渲染后该标记会自动清除。
     */
    static forceOnce: boolean = false;

    /**
     * @en Indicates whether the engine is in step mode.
     * When true, Timer will use a fixed frame interval instead of real elapsed time.
     * This ensures animations advance by exactly one frame during step execution.
     * @zh 指示引擎是否处于单步模式。
     * 为 true 时，Timer 将使用固定的帧间隔而非真实经过的时间。
     * 这确保了动画在单步执行时精确前进一帧。
     */
    static stepMode: boolean = false;

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

            window.requestAnimationFrame(loop);
        }

        window.requestAnimationFrame(loop);
    }

    /**
     * @internal
     */
    static loop(timestamp: number) {
        _renderCount++;

        if (!Render.forceOnce) {
            if (Render.paused) {
                // Sync timer timestamps while paused to prevent time jump on resume
                Render._syncTimersOnPause(timestamp);
                return;
            }

            let shouldUpdate = true;
            if (Render.predicate != null)
                shouldUpdate = Render.predicate(timestamp);
            else {
                switch (Render.throttleMode) {
                    case 1://满帧减半
                        shouldUpdate = (_renderCount % (ILaya.stage._visible ? 2 : 5) === 0);
                        break;
                    case 2://鼠标活动后满帧，鼠标不动2秒后满帧减半
                        shouldUpdate = (timestamp - InputManager.lastMouseTime) < 2000 || (_renderCount % (ILaya.stage._visible ? 2 : 5) === 0);
                        break;
                    case 3://每秒1帧
                        shouldUpdate = timestamp - Render.frameStartTime >= 1000;
                        break;
                }
            }
            if (!shouldUpdate)
                return;
        }
        else {
            Render.stepMode = true;
            Render.forceOnce = false;
        }

        Render.frameStartTime = timestamp;

        LayaGL.statAgent.startFrameLogic(timestamp);

        ILaya.stage.render(timestamp);

        LayaGL.statAgent.endFrameLogic(timestamp);

        Render.stepMode = false;
    }

    /**
     * @ignore
     */
    static vsyncTime() {
        return Render.lastFrame * Render.frameInterval;
    }

    /**
     * @en Synchronize all timer timestamps when paused to avoid time jump on resume.
     * @zh 暂停时同步所有计时器的时间戳，避免恢复时时间跳跃。
     * @internal
     */
    private static _syncTimersOnPause(timestamp: number): void {
        ILaya.systemTimer?._syncTimestamp(timestamp);
        ILaya.physicsTimer?._syncTimestamp(timestamp);
        ILaya.timer?._syncTimestamp(timestamp);
    }

    /** @deprecated */
    static get canvas(): any {
        return Browser.mainCanvas.source;
    }
}
