import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { StatisticsElement } from "../layagl/StatisticsContext";
import { Browser } from "./Browser";
import type { StatUI } from "./StatUI";

export type StatUnit = "M" | "ms"|"K" | "int";//M计算会除以1024*1024，k会除以1024，int不做处理
export type StatColor = "yellow" | "white" | "red";//颜色

export interface StatUIParams {
    title: string,//显示title
    value: StatisticsElement,//对应Stat的数据
    color: StatColor,//显示颜色
    units: StatUnit,//"M" "int"//显示单位\
}

export interface StatToggleUIParams {
    title: string,//显示title
    value: string,//Toggle
    color: StatColor,//显示颜色
}

/**
 * @en The Stat class is a performance statistics panel that provides real-time updates on various performance metrics.
 * The performance metrics included in the statistics are updated approximately every 1 second and are as follows:
 * - FPS: Frames per second (FPS). The higher and more stable the value, the smoother the display.
 * - Sprite: The count of all rendering nodes (including containers). Its size affects the efficiency of the engine's node traversal, data organization, and rendering. The smaller the value, the higher the game's operational efficiency.
 * - DrawCall: This value is a crucial indicator of performance; the smaller the number, the higher the game's operational efficiency. It represents the approximate number of rendering batches submitted per second. Each preparation of data and notification to the GPU for rendering is called one DrawCall. Besides the time-consuming process of notifying the GPU to render, switching materials and shaders are also very time-consuming operations during each DrawCall.
 * - CurMem: Represents memory and video memory usage; the smaller the value, the better.
 * - Shader: indicating the number of Shader submissions per second. The smaller the value, the better.
 * - Canvas: Composed of three values, which are only present after setting CacheAs, with a default of 0/0/0. From left to right, the meanings of the values are: the number of canvases redrawn per frame / the number of canvases with "normal" cache type / the number of canvases with "bitmap" cache type.
 * @zh Stat是一个性能统计面板，可以实时更新相关的性能参数。参与统计的性能参数如下（所有参数都是每大约1秒进行更新）：
 * - FPS(WebGL)：每秒显示的帧数。值越高且越稳定，画面越流畅。
 * - Sprite：统计所有渲染节点（包括容器）的数量。这个数值的大小会影响引擎在节点遍历、数据组织和渲染方面的效率。数值越小，游戏运行效率越高。
 * - DrawCall：此值是决定性能的重要指标，数值越小，游戏运行效率越高。表示大约每1秒的渲染提交批次。每次准备数据并通知 GPU 进行渲染的过程称为1次 DrawCall。在每次 DrawCall 中，除了通知 GPU 渲染比较耗时外，切换材质与 shader 也是非常耗时的操作。
 * - CurMem：表示内存与显存的占用，数值越小越好。
 * - Shader：表示每大约1秒 Shader 提交次数。数值越小越好。
 * - Canvas：由三个数值组成，仅在设置了 CacheAs 之后才会有数值，默认为0/0/0。从左到右数值的意义分别为：每帧重绘的画布数量 / 缓存类型为"normal"的画布数量 / 缓存类型为"bitmap"的画布数量。
 */
export class Stat {
    /**
    /**
     * @en All Show
     * @zh 所有显示
     */
    public static ShowStatArray: Array<StatisticsElement> = [StatisticsElement.C_Sprite2DCount, StatisticsElement.C_Sprite3DCount, StatisticsElement.CT_DrawCall, StatisticsElement.CT_Triangle, StatisticsElement.C_BaseRenderCount, StatisticsElement.C_SkinnedMeshRenderCount, StatisticsElement.C_ShurikenParticleRenderCount
        , StatisticsElement.T_CullMain, StatisticsElement.CT_OpaqueDrawCall, StatisticsElement.CT_TransDrawCall, StatisticsElement.CT_ShadowDrawCall, StatisticsElement.CT_DepthCastDrawCall, StatisticsElement.CT_Instancing_DrawCallCount,
    StatisticsElement.M_GPUMemory, StatisticsElement.M_ALLTexture, StatisticsElement.M_RenderTexture, StatisticsElement.M_GPUBuffer];

    /*
       * @internal 
    * @en Enable/disable shadows
    * @zh 开启关闭阴影 
    */
    public static toogle_Shadow: StatToggleUIParams = { title: "Shadow", value: "enableShadow", color: "white" };
    /**
     * @internal 
     * @en Turn on and off multiple light sources
     * @zh 开启关闭多光源 
     */
    public static toogle_MulLight: StatToggleUIParams = { title: "MulLight", value: "enableMulLight", color: "white" };
    /**
     * @internal 
     * @en Turn on and off the light source
     * @zh 开启关闭光源 
     */
    public static toogle_Light: StatToggleUIParams = { title: "Light", value: "enableLight", color: "white" };
    /**
     * @internal 
     * @en Enable/disable post-processing
     * @zh 开启关闭后期处理
     */
    public static toogle_Postprocess: StatToggleUIParams = { title: "Postprocess", value: "enablePostprocess", color: "white" };
    /**
     * @internal 
     * @en Enable/disable animation updates
     * @zh 开启关闭动画更新
     */
    public static toogle_AnimatorUpdate: StatToggleUIParams = { title: "AnimatorUpdate", value: "enableAnimatorUpdate", color: "white" };
    /**
     * @internal 
     * @en Enable/disable physical updates
     * @zh 开启关闭物理更新
     */
    public static toogle_PhysicsUpdate: StatToggleUIParams = { title: "PhysicsUpdate", value: "enablePhysicsUpdate", color: "white" };
    /**
     * @internal 
     * @en Enable/disable skin rendering
     * @zh 开启关闭蒙皮渲染 
     */
    public static toogle_Skin: StatToggleUIParams = { title: "Skin", value: "enableSkin", color: "white" };
    /**
     * @internal 
     * @en Enable/disable transparent rendering
     * @zh 开启关闭透明渲染 
     */
    public static toogle_Transparent: StatToggleUIParams = { title: "Transparent", value: "enableTransparent", color: "white" };
    /**
     * @internal 
     * @en Turn on/off particles
     * @zh 开启关闭粒子
     */
    public static toogle_Particle: StatToggleUIParams = { title: "Particle", value: "enableParticle", color: "white" };
    /**
     * @internal 
     * @en Turn on and off MSAA
     * @zh 开启关闭MSAA
     */
    public static toogle_msaa: StatToggleUIParams = { title: "MSAA", value: "enablemsaa", color: "white" };
    /**
     * @internal 
     * @en Enable/disable CMD
     * @zh 开启关闭CMD 
     */
    public static toogle_CameraCMD: StatToggleUIParams = { title: "CameraCMD", value: "enableCameraCMD", color: "white" };
    /**
     * @internal 
     * @en Enable/disable rendering of non transparent objects
     * @zh 启关闭非透明物体渲染
     */
    public static toogle_Opaque: StatToggleUIParams = { title: "Opaque", value: "enableOpaque", color: "white" };
    /**
     * @en AllToggle
     * @zh 所有开关
     */
    public static AllToggle: Array<StatToggleUIParams> = [Stat.toogle_Shadow, Stat.toogle_Light, Stat.toogle_MulLight, Stat.toogle_Postprocess, Stat.toogle_AnimatorUpdate, Stat.toogle_PhysicsUpdate, Stat.toogle_Opaque, Stat.toogle_Transparent, Stat.toogle_CameraCMD, Stat.toogle_Skin, Stat.toogle_Particle, Stat.toogle_msaa];
    /**
     * @en Render Mode Toggle
     * @zh 渲染开关
     */
    public static RenderModeToggle: Array<StatToggleUIParams> = [Stat.toogle_Shadow, Stat.toogle_Light, Stat.toogle_MulLight, Stat.toogle_Postprocess, Stat.toogle_AnimatorUpdate, Stat.toogle_PhysicsUpdate];
    /**
     * @en Render Func Toggle
     * @zh 功能开关
     */
    public static RenderFuncToggle: Array<StatToggleUIParams> = [Stat.toogle_Opaque, Stat.toogle_Transparent, Stat.toogle_CameraCMD, Stat.toogle_Skin, Stat.toogle_Particle, Stat.toogle_msaa];
    /**
     * @en Current frames per second (FPS).
     * @zh 当前每秒帧数（FPS）。
     */
    public static FPS: number = 0;
    /**
     * @en Count of rendering loops of the main stage Stage.
     * @zh 主舞台 Stage 的渲染次数计数。
     */
    public static loopCount: number = 0;

    /**
     * @en Number of times the canvas has used standard rendering.
     * @zh 画布 canvas 使用标准渲染的次数。
     */
    static canvasNormal: number = 0;
    /**
     * @en Number of times the canvas has used bitmap rendering.
     * @zh 画布 canvas 使用位图渲染的次数。
     */
    static canvasBitmap: number = 0;
    /**
     * @en Number of times the canvas buffer has been repainted.
     * @zh 画布 canvas 缓冲区重绘次数。
     */
    static canvasReCache: number = 0;
    /**
     * @en Indicates whether the current rendering mode is slow.
     * @zh 表示当前使用的是否为慢渲染模式。
     */
    static renderSlow: boolean = false;
    /**
     * @en Accumulated memory managed by the resource manager, in bytes.
     * @zh 资源管理器所管理资源的累计内存，以字节为单位。
     */
    //static gpuMemory: number;
    static cpuMemory: number;

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

    static _statUIClass: typeof StatUI;
    static _statUI: StatUI;

    /**@internal */
    private static _currentShowArray: Array<StatisticsElement>;
    /**@internal */
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
    static show(x?: number, y?: number, views?: Array<StatisticsElement>): void {
        if (!Stat._statUI)
            Stat._statUI = new Stat._statUIClass();
        this.hide();

        Stat._show = true;
        Stat._currentShowArray = views;
        Stat._currentShowArray = views || Stat.ShowStatArray;
        Stat._statUI.show(x, y, Stat.ShowStatArray);
        ILaya.systemTimer.frameLoop(1, null, Stat.loop);
        ILaya.timer.frameLoop(1, null, Stat.clear);
    }

    /**
     * @en Hides the performance statistics information from the screen.
     * @zh 从屏幕上隐藏性能统计信息。
     */
    static hide(): void {
        if (!Stat._show)
            return;

        Stat._show = false;
        Stat._currentShowArray = null;
        ILaya.timer.clear(null, Stat.loop);
        ILaya.timer.clear(null, Stat.clear);
        if (Stat._statUI)
            Stat._statUI.hide();
    }

    /**
     * @private
     * @en Performance statistics parameter calculation loop processing function.
     * @zh 性能统计参数计算循环处理函数。
     */
    static loop(): void {
        //计算更精确的FPS值

        if (Stat._show) {
            Stat._statUI.update();
        }
    }

    /**
     * @private
     * @en Resets the performance statistics calculation related data to zero.
     * @zh 清零性能统计计算相关的数据。
     */
    static clear(): void {
        // if (!Stat._currentShowArray )
        //     return;
        // Stat._currentShowArray.forEach(element => {
        //     if (element.mode == "average")
        //         (Stat as any)[element.value] = 0;
        // });
    }

    static render() {
        if (Stat._show)
            Stat._statUI.render();
    }
}

(window as any).Stat = Stat;
