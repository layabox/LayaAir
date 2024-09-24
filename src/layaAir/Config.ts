/**
 * @en Config is used to set some global parameters. If you need to change them, please set them before initializing the engine.
 * @zh Config类用于配置一些全局参数。如需更改，请在初始化引擎之前设置。
 */
export class Config {
    /**
     * @en Canvas setting for anti-aliasing, only effective for 2D(WebGL). 3D anti-aliasing is controlled on the camera or RT.
     * @zh 画布设置是否抗锯齿，只对2D(WebGL)有效,3D抗锯齿在camera或RT上面控制。
     */
    static isAntialias: boolean = true;

    /**
     * @en Whether to use WebGL2
     * @zh 是否使用WebGL2
     */
    static useWebGL2: boolean = true;

    /**
     * @en FPS limit
     * @zh 限制FPS 
     */
    static FPS = 60;

    /**
     * @en Whether to use retina mode, which may create larger RT on iOS for better effects
     * @zh 是否使用视网膜模式，在iOS上面可能会创建更大的RT，来达到更佳的效果
     */
    static useRetinalCanvas: boolean = false;

    //-------------2D settings---------------------

    /**
     * @en Default playback interval for 2D animation, in milliseconds.
     * @zh 2D动画 Animation 的默认播放时间间隔，单位为毫秒。
     */
    static animationInterval: number = 50;

    /**
     * @en When using WebGL to render 2D, whether to allocate enough cache for 64k vertices each time a VB is created. This can improve efficiency.
     * @zh 当使用WebGL渲染2D的时候，每次创建VB是否直接分配足够64k个顶点的缓存。这样可以提高效率。
     */
    static webGL2D_MeshAllocMaxMem: boolean = true;

    /**
     * @en Default text size, default is 12
     * @zh 默认文本大小，默认为12
     */
    static defaultFontSize: number = 12;

    /**
     * @en Default font, default is Arial
     * @zh 默认文本字体，默认为Arial
     */
    static defaultFont: string = "Arial";

    //-------------For engine internal use-------------

    /**
     * @en Set whether the canvas is transparent, only effective for 2D(WebGL) and 3D.
     * @zh 设置画布是否透明，只对2D(WebGL)、3D有效。
     */
    static isAlpha: boolean = false;

    /**
     * @en Set whether the canvas contains depth
     * @zh 设置画布是否包含深度
     */
    static isDepth: boolean = false;

    /**
     * @en Boolean value indicating whether to create this context in a system with low performance
     * @zh 表明在一个系统性能低的环境是否创建该上下文
     */
    static isfailIfMajorPerformanceCaveat: boolean = false;
    /**
     * @en Power preference for the WebGL/WebGPU context. Hints the browser about the desired GPU configuration.
     * - "default": Let the browser decide. In WebGPU mode, this is automatically set to "high-performance".
     * - "high-performance": Prefer high-performance GPU. Use for graphically intensive applications.
     * - "low-power": Prefer low-power GPU. Suitable for energy-efficient applications.
     * @zh 图形（WebGL/WebGPU）上下文的电源偏好设置。向浏览器提示所需的 GPU 配置。
     * - "default"：让浏览器决定。在 WebGPU 模式下，`default`会让引擎自动设置为`high-performance`。
     * - "high-performance"：倾向于高性能 GPU。用于图形密集型应用。
     * - "low-power"：倾向于低功耗 GPU。适用于节能的应用。
     */
    static powerPreference: WebGLPowerPreference = "default";

    /**
     * @en Set whether the canvas is pre-multiplied, only effective for 2D(WebGL) and 3D.
     * @zh 设置画布是否预乘，只对2D(WebGL)、3D有效。
     */
    static premultipliedAlpha: boolean = true;

    /**
     * @en Set whether to enable stencil buffer for the canvas, only effective for 2D(WebGL) and 3D.
     * @zh 设置画布的是否开启模板缓冲，只对2D(WebGL)、3D有效。
     */
    static isStencil: boolean = true;

    /**
     * @en Whether to preserve the drawing buffer.
     * @zh 是否保留渲染缓冲区。
     */
    static preserveDrawingBuffer: boolean = false;

    /**
     * @en Whether to print WebGL instructions and locate WebGL errors
     * @zh 是否打印WebGL指令，同时定位WebGL报错
     */
    static printWebglOrder: boolean = false;

    /**
     * @en On iOS, some fonts may not be found. The engine provides font mapping functionality. For example, by default, "黑体" is mapped to "黑体-简". More mappings can be added.
     * @zh 在iOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加
     */
    static fontFamilyMap: any = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };

    /**
     * @en Whether to use a fixed frame rate for rendering and updates.
     * - When true: Rendering and logic updates are limited to the frame rate defined by Config.FPS. Ensures consistent application speed across different devices.
     * - When false: Updates occur on every requestAnimationFrame callback. Can lead to varying application speeds on different devices.
     * @zh 是否使用固定帧率进行渲染和更新。
     * - 当为 true 时：渲染和逻辑更新被限制在由 Config.FPS 定义的帧率内。确保在不同设备上应用程序运行速度一致。
     * - 当为 false 时：在每次 requestAnimationFrame 回调时进行更新。可能导致在不同设备上应用程序运行速度不同。
     */
    static fixedFrames: boolean = true;

    /**
     * @en Whether to immediately delete resources when the reference parameter is 0. If not immediate deletion, please call DestrotyUnUse
     * @zh 资源引用参数为0是否立即删除资源，如果不立即删除请调用DestrotyUnUse
     */
    static destroyResourceImmediatelyDefault = true;
    /**@internal */
    static _enableWindowRAFFunction: boolean = true;
}

export const PlayerConfig: {
    physics2D?: any,
    physics3D?: any,
    spineVersion?: string,
    workerLoaderLib?: string,
    [key: string]: any,
} = {};