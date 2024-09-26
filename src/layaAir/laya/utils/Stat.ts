import { ILaya } from "../../ILaya";
import { Physics3DStatInfo } from "../Physics3D/interface/Physics3DStatInfo";
import { GPUEngineStatisticsInfo } from "../RenderEngine/RenderEnum/RenderStatInfo";
import { LayaGL } from "../layagl/LayaGL";
import { Browser } from "./Browser";
import { ClassUtils } from "./ClassUtils";
import { IStatUI, StatToggleUIParams, StatUIParams } from "./IStatUI";

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
     * @en The current frame rate.
     * @zh 当前帧率
     */
    public static FPSStatUIParams: StatUIParams = { title: "FPS", value: "_fpsStr", color: "yellow", units: "int", mode: "summit" };
    /**
     * @en Node nums
     * @zh 节点数量
     */
    public static NodeStatUIParams: StatUIParams = { title: "Node", value: "spriteCount", color: "white", units: "int", mode: "summit" };
    /**
     * @en Sprite3D nums
     * @zh 3D精灵数量
     */
    public static Sprite3DStatUIParams: StatUIParams = { title: "Sprite3D", value: "sprite3DCount", color: "white", units: "int", mode: "summit" };
    /**
     * @en DrawCall
     * @zh 渲染提交批次
     */
    public static DrawCall: StatUIParams = { title: "DrawCall", value: "drawCall", color: "white", units: "int", mode: "average" };
    /**
     * @en triangleFace
     * @zh 三角形面数量
     */
    public static TriangleFace: StatUIParams = { title: "TriangleFace", value: "trianglesFaces", color: "white", units: "int", mode: "average" };
    /**
     * @en RenderNoe
     * @zh 渲染节点数量
     */
    public static RenderNode: StatUIParams = { title: "RenderNode", value: "renderNode", color: "white", units: "int", mode: "summit" };
    /**
     * @en SkinRenderNode
     * @zh 蒙皮（骨骼动画）渲染节点数量
     */
    public static SkinRenderNode: StatUIParams = { title: "SkinRenderNode", value: "skinRenderNode", color: "white", units: "int", mode: "summit" };
    /**
     * @en ParticleRenderNode
     * @zh 粒子渲染节点数量
     */
    public static ParticleRenderNode: StatUIParams = { title: "ParticleRenderNode", value: "particleRenderNode", color: "white", units: "int", mode: "summit" }
    /**
     * @en FrustumCulling
     * @zh 视锥体剔除
     */
    public static FrustumCulling: StatUIParams = { title: "FrustumCulling", value: "frustumCulling", color: "white", units: "int", mode: "average" }
    /**
     * @en uniformUpload
     * @zh uniform上传
     */
    public static UniformUpload: StatUIParams = { title: "UniformUpload", value: "uniformUpload", color: "white", units: "int", mode: "average" }
    /**
     * @en OpaqueDrawCall
     * @zh 不透明物体渲染提交批次
     */
    public static OpaqueDrawCall: StatUIParams = { title: "OpaqueDrawCall", value: "opaqueDrawCall", color: "white", units: "int", mode: "average" }
    /**
     * @en TransformDrawCall
     * @zh 透明物体渲染提交批次
     */
    public static TransDrawCall: StatUIParams = { title: "TransDrawCall", value: "transDrawCall", color: "white", units: "int", mode: "average" }
    /**
     * @en DepthCastDrawCall
     * @zh 深度投射渲染提交批次
     */
    public static DepthCastDrawCall: StatUIParams = { title: "DepthCastDrawCall", value: "depthCastDrawCall", color: "white", units: "int", mode: "average" }
    /**
    * @en TransformDrawCall
    * @zh 透明物体渲染提交批次
    */
    public static ShadowDrawCall: StatUIParams = { title: "ShadowDrawCall", value: "shadowMapDrawCall", color: "white", units: "int", mode: "average" }
    /**
     * @en InstanceDrawCall
     * @zh 实例绘制渲染提交批次
     */
    public static InstanceDrawCall: StatUIParams = { title: "InstanceDrawCall", value: "instanceDrawCall", color: "white", units: "int", mode: "average" }
    /**
     * @en CMDDrawCall
     * @zh CMD渲染提交批次
     */
    public static CMDDrawCall: StatUIParams = { title: "CMDDrawCall", value: "cmdDrawCall", color: "white", units: "int", mode: "average" };
    /**
     * @en BlitDrawCall
     * @zh 位块渲染提交批次
     */
    public static BlitDrawCall: StatUIParams = { title: "BlitDrawCall", value: "blitDrawCall", color: "white", units: "int", mode: "average" };
    /**
     * @en GPU memory
     * @zh GPU 显存
     */
    public static GPUMemory: StatUIParams = { title: "GPUMemory", value: "gpuMemory", color: "white", units: "M", mode: "summit" };
    /**
     * @en Texture2D memory
     * @zh 2D纹理内存
     */
    public static TextureMemeory: StatUIParams = { title: "TextureMemory", value: "textureMemory", color: "white", units: "M", mode: "summit" };
    /**
     * @en RenderTexture memory
     * @zh 渲染纹理内存
     */
    public static RenderTextureMemory: StatUIParams = { title: "RenderTextureMemory", value: "renderTextureMemory", color: "white", units: "M", mode: "summit" };
    /**
     * @en BufferMemory
     * @zh Buffer内存
     */
    public static BufferMemory: StatUIParams = { title: "BufferMemory", value: "bufferMemory", color: "white", units: "M", mode: "summit" };
    /**
     * @en upload Uniform
     * @zh Uniform上传数量
     */
    public static uploadUniformNum: StatUIParams = { title: "UploadUniformNum", value: "uploadUniform", color: "white", units: "int", mode: "average" };
    /**
     * @en All Show
     * @zh 所有显示
     */
    public static AllShow: Array<StatUIParams> = [Stat.FPSStatUIParams, Stat.NodeStatUIParams, Stat.Sprite3DStatUIParams, Stat.DrawCall, Stat.TriangleFace, Stat.RenderNode, Stat.SkinRenderNode, Stat.ParticleRenderNode
        , Stat.FrustumCulling, Stat.OpaqueDrawCall, Stat.TransDrawCall, Stat.ShadowDrawCall, Stat.DepthCastDrawCall, Stat.InstanceDrawCall, Stat.CMDDrawCall, Stat.BlitDrawCall, Stat.GPUMemory, Stat.TextureMemeory, Stat.RenderTextureMemory, Stat.BufferMemory, Stat.uploadUniformNum];
    /**
     * @en Memory Show
     * @zh 内存显示
     */
    public static memoryShow: Array<StatUIParams> = [Stat.GPUMemory, Stat.TextureMemeory, Stat.RenderTextureMemory, Stat.BufferMemory];
    /**
     * @en Rendering Show
     * @zh 渲染显示
     */
    public static renderShow: Array<StatUIParams> = [Stat.DrawCall, Stat.TriangleFace, Stat.OpaqueDrawCall, Stat.TransDrawCall, Stat.ShadowDrawCall, Stat.DepthCastDrawCall, Stat.InstanceDrawCall, Stat.CMDDrawCall, Stat.BlitDrawCall];
    /**
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
     * @en Number of Sprites that use cache for rendering.
     * @zh 精灵渲染使用缓存 Sprite 的数量。
     */
    public static spriteRenderUseCacheCount: number = 0;
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

    /**@internal */
    public static _timer: number = 0;
    /**@internal */
    public static _count: number = 0;

    /**@internal */
    public static _fpsStr: string = "";
    /**@internal */
    public static spriteCount: number = 0;//TODO
    /**@internal */
    public static sprite3DCount: number = 0;//TODO
    /**@internal */
    public static drawCall: number = 0;
    public static draw2D = 0;
    /**@internal */
    public static trianglesFaces: number = 0;
    /**@internal */
    public static renderNode: number = 0;
    /**@internal */
    public static meshRenderNode: number = 0;
    /**@internal */
    public static skinRenderNode: number = 0;
    /**@internal */
    public static particleRenderNode: number = 0;
    /**@internal 视锥剔除次数。*/
    public static frustumCulling: number = 0;
    /**@internal */
    public static uniformUpload: number = 0;
    /**@internal */
    public static opaqueDrawCall: number = 0;
    /**@internal */
    public static transDrawCall: number = 0;
    /**@internal */
    public static depthCastDrawCall: number = 0;
    /**@internal */
    public static shadowMapDrawCall: number = 0;
    /**@internal */
    public static instanceDrawCall: number = 0;
    /**@internal */
    public static cmdDrawCall: number = 0;

    public static blitDrawCall: number = 0;

    public static renderPassStatArray: number[] = [];
    //是否开启渲染流程统计，会将一些消耗较多的统计放入事件中,在最开始的时候设置最准确
    public static enableRenderPassStatArray: boolean = false;

    /**
     * @en The cumulative memory of the resources managed by the resource manager, in bytes. 
     * @zh 资源管理器所管理资源的累计内存，以字节为单位。
     */
    public static gpuMemory: number;
    /**@internal */
    public static textureMemory: number = 0;
    /**@internal */
    public static renderTextureMemory: number = 0;
    /**@interanl */
    public static bufferMemory: number = 0;
    /**@internal */
    public static uploadUniform: number = 0;

    /**
     * @en The count of dynamic rigid bodies in the physics system.
     * @zh 物理系统中动态刚体的数量。
     */
    public static physics_dynamicRigidBodyCount: number;

    /**
     * @en The count of static rigid bodies in the physics system.
     * @zh 物理系统中静态刚体的数量。
     */
    public static physics_staticRigidBodyCount: number;

    /**
     * @en The count of kinematic rigid bodies in the physics system.
     * @zh 物理系统中运动学刚体的数量。
     */
    public static phyiscs_KinematicRigidBodyCount: number;

    /**
     * @en The count of character controllers in the physics system.
     * @zh 物理系统中角色控制器的数量。
     */
    public static physics_CharacterControllerCount: number;

    /**
     * @en The count of joints in the physics system.
     * @zh 物理系统中关节的数量。
     */
    public static physics_jointCount: number;

    /**
     * @en The count of physics events.
     * @zh 物理事件的数量。
     */
    public static phyiscs_EventCount: number

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

    static _statUI: IStatUI;

    /**@internal */
    private static _currentShowArray: Array<StatUIParams>;
    /**@internal */
    private static _currentToggleArray: Array<StatToggleUIParams>;
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
    static show(x?: number, y?: number, views?: Array<StatUIParams>): void {
        if (!Stat.checkUI())
            return;
        this.hide();

        Stat._show = true;
        LayaGL.renderEngine._enableStatistics = true;
        Stat._currentShowArray = views || Stat.AllShow;
        Stat._statUI.show(x, y, Stat._currentShowArray);
        ILaya.systemTimer.frameLoop(1, null, Stat.loop);
        ILaya.timer.frameLoop(1, null, Stat.clear);
    }

    /**
     * @en Shows the performance statistics information with toggle functionality.
     * @param x The x-coordinate of the display position. Optional.
     * @param y The y-coordinate of the display position. Optional.
     * @param views An array of StatToggleUIParams objects defining the toggle views to display. Optional.
     * @zh 显示带有切换功能的性能统计信息。
     * @param x 显示位置的 x 坐标。可选。
     * @param y 显示位置的 y 坐标。可选。
     * @param views 定义要显示的切换视图的 StatToggleUIParams 对象数组。可选。
     */
    static showToggle(x?: number, y?: number, views?: Array<StatToggleUIParams>): void {
        if (!Stat.checkUI())
            return;
        this.hide();

        Stat._show = true;
        Stat._currentToggleArray = views;
        Stat._statUI.showToggle(x, y, views);
        ILaya.systemTimer.frameLoop(1, null, Stat.loop);
        ILaya.timer.frameLoop(1, null, Stat.clear);
    }

    private static checkUI() {
        if (!Stat._statUI) {
            let cls = ClassUtils.getClass("StatUI");
            if (!cls) {
                console.error("StatUI not found");
                return false;
            }
            Stat._statUI = new cls();
        }

        return true;
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
        Stat._currentToggleArray = null;
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
        Stat._count++;
        let timer: number = Browser.now();
        if (timer - Stat._timer < 1000) return;

        let count: number = Stat._count;
        //计算更精确的FPS值
        Stat.FPS = Math.round((count * 1000) / (timer - Stat._timer));

        if (Stat._show) {
            Stat.updateEngineData();
            let delay: string = Stat.FPS > 0 ? Math.floor(1000 / Stat.FPS).toString() : " ";
            Stat._fpsStr = Stat.FPS + (Stat.renderSlow ? " slow" : "") + " " + delay + "ms";
            Stat._statUI.update();
            // Stat.clear();
        }

        Stat._count = 0;
        Stat._timer = timer;
    }

    /**
     * @en Updates the engine data for statistics such as triangle count, draw call count, and memory usage.
     * @zh 更新引擎数据，包括三角形数量、绘制调用计数和内存使用情况等统计信息。
     */
    static updateEngineData(): void {
        Stat.trianglesFaces += LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount);
        Stat.drawCall += LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.C_DrawCallCount);
        Stat.instanceDrawCall += LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount);

        Stat.gpuMemory = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory);
        Stat.textureMemory = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_ALLTexture);
        Stat.renderTextureMemory = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_ALLRenderTexture);
        Stat.bufferMemory = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer);
    }

    /**
     * @private
     * @en Resets the performance statistics calculation related data to zero.
     * @zh 清零性能统计计算相关的数据。
     */
    static clear(): void {
        if (!Stat._currentShowArray || Stat._count)
            return;
        Stat._currentShowArray.forEach(element => {
            if (element.mode == "average")
                (Stat as any)[element.value] = 0;
        });
        LayaGL.renderEngine.clearStatisticsInfo();
        Physics3DStatInfo.clearStatisticsInfo();
        Stat.renderPassStatArray.fill(0);
    }

    static render(ctx: any, x: number, y: number) {
        if (Stat._show)
            Stat._statUI.render(ctx, x, y);
    }
}

(window as any).Stat = Stat;
