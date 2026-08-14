import { PlayerConfig } from "../../Config";
import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { StatElement } from "../layagl/StatisticsContext";
import type { StatUI } from "./StatUI";

/**
 * @en The Stat class is a performance statistics panel that provides real-time updates on various performance metrics.
 * @zh Stat是一个性能统计面板，可以实时更新相关的性能参数。
 */
export class Stat {
    /**
     * @en Defines display elements.
     * @zh 定义显示元素。
     */
    public static elements: Array<StatElement> = [];

    /**
     * @en Current frames per second (FPS).
     * @zh 当前每秒帧数（FPS）。
     */
    public static get FPS() {
        return LayaGL.statAgent.getElementData(StatElement.CT_FPS);
    }

    /**
     * @en Count of rendering loops of the main stage Stage.
     * @zh 主舞台 Stage 的渲染次数计数。
     */
    public static loopCount: number = 0;

    /**
     * @en Count of rendering loops of the main stage Stage.
     * @zh 主舞台 Stage 的渲染次数计数。
     */
    public static render2DCount: number = 0;

    //Toggle
    /**
     * @en Enables or disables shadows.
     * @zh 开启或关闭阴影效果。
     */
    public static enableShadow: boolean = true;
    /**
     * @en Enables or disables multiple light sources.
     * @zh 开启或关闭多光源效果。
     */
    public static enableMulLight: boolean = true;
    /**
     * @en Enables or disables light sources.
     * @zh 开启或关闭光源效果。
     */
    public static enableLight: boolean = true;
    /**
     * @en Enables or disables CMD.
     * @zh 开启或关闭CMD。
     */
    public static enableCameraCMD: boolean = true;
    /**
     * @en Enables or disables post-processing effects.
     * @zh 开启或关闭后期处理效果。
     */
    public static enablePostprocess: boolean = true;
    /**
     * @en Enables or disables skin rendering.
     * @zh 开启或关闭skin渲染。
     */
    public static enableSkin: boolean = true;
    /**
     * @en Enables or disables transparent rendering.
     * @zh 开启或关闭透明渲染。
     */
    public static enableTransparent: boolean = true;
    /**
     * @en Enables or disables particle rendering.
     * @zh 开启或关闭粒子渲染。
     */
    public static enableParticle: boolean = true;
    /**
     * @en Enables or disables animation updates.
     * @zh 开启或关闭动画更新。
     */
    public static enableAnimatorUpdate: boolean = true;
    /**
     * @en Enables or disables physics updates.
     * @zh 开启或关闭物理更新。
     */
    public static enablePhysicsUpdate: boolean = true;
    /**
     * @en Enables or disables MSAA.
     * @zh 开启或关闭 MSAA。
     */
    public static enablemsaa: boolean = true;
    /**
     * @en Enables or disables rendering of opaque objects.
     * @zh 开启或关闭不透明物体渲染。
     */
    public static enableOpaque: boolean = true;
    /**
     * @en
     * @zh 开启或关闭Spine渲染
     */
    public static enableSpine: boolean = true;

    static _statUIClass: typeof StatUI;
    static _statUI: StatUI;
    private static _show: boolean;

    /**
     * @en Displays performance statistics information on the screen.
     * To be effective, it should be called at the very beginning of the application.
     * @param x The X-coordinate position where the statistics should be displayed.
     * @param y The Y-coordinate position where the statistics should be displayed.
     * @param views An optional array of StatUIParams that defines which statistics to display.
     * @zh 在屏幕上显示性能统计信息。
     * 为了有效，它应该在应用程序最开始时调用。
     * @param x 统计信息显示的 X 轴坐标位置。
     * @param y 统计信息显示的 Y 轴坐标位置。
     * @param views 可选的 StatUIParams 数组，定义要显示哪些统计信息。
     */
    static show(x?: number, y?: number, views?: ReadonlyArray<StatElement>): void {
        if (!Stat._statUI)
            Stat._statUI = new Stat._statUIClass();
        this.hide();

        if (views) {
            Stat.elements.length = 0;
            Stat.elements.push(...views);
        }

        if (Stat.elements.length === 0) {
            const statEnum = PlayerConfig.statEnum;
            if (statEnum) {
                for (let k in statEnum) {
                    if (statEnum[k]) {
                        Stat.elements.push(StatElement[k as keyof typeof StatElement]);
                    }
                }
                Stat.elements.sort();
            }
        }

        if (Stat.elements.length === 0) {
            Stat.elements.push(...defaultElements);
        }

        Stat._show = true;
        Stat._statUI.show(x, y);
        ILaya.systemTimer.frameLoop(1, null, Stat.loop);
    }

    /**
     * @en Hides the performance statistics information from the screen.
     * @zh 从屏幕上隐藏性能统计信息。
     */
    static hide(): void {
        if (!Stat._show)
            return;

        Stat._show = false;
        Stat._statUI.hide();
        ILaya.systemTimer.clear(null, Stat.loop);
    }

    private static loop(): void {
        if (Stat._show) {
            Stat._statUI.update();
        }
    }

    /** @internal */
    static render() {
        if (Stat._show)
            Stat._statUI.render();
    }
}

const defaultElements = [
    StatElement.CT_FPS,
    StatElement.T_Frame_Time,
    StatElement.C_Sprite2DCount,
    StatElement.C_Sprite3DCount,
    StatElement.CT_DrawCall,
    StatElement.CT_Triangle,
    StatElement.C_BaseRenderCount,
    StatElement.C_SkinnedMeshRenderCount,
    StatElement.C_ShurikenParticleRenderCount,
    StatElement.T_CullMain,
    StatElement.CT_OpaqueDrawCall,
    StatElement.CT_TransDrawCall,
    StatElement.CT_ShadowDrawCall,
    StatElement.CT_DepthCastDrawCall,
    StatElement.CT_Instancing_DrawCall,
    StatElement.M_GPUMemory,
    StatElement.M_AllTexture,
    StatElement.M_RenderTexture,
    StatElement.M_GPUBuffer
];

(window as any).Stat = Stat;
