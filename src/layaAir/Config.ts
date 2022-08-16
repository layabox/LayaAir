/**
 *  Config 用于配置一些全局参数。如需更改，请在初始化引擎之前设置。
 */
export class Config {
    /**
     * 动画 Animation 的默认播放时间间隔，单位为毫秒。
     */
    static animationInterval: number = 50;
    /**
     * 设置是否抗锯齿，只对2D(WebGL)、3D有效。
     */
    static isAntialias: boolean = true;
    /**
     * 设置画布是否透明，只对2D(WebGL)、3D有效。
     */
    static isAlpha: boolean = false;
    /**
     * 设置画布是否包含深度
     */
    static isDepth: boolean = false;
    /**
     * 表明在一个系统性能低的环境是否创建该上下文的boolean值
     */
    static isfailIfMajorPerformanceCaveat: boolean = false;

    static powerPreference: WebGLPowerPreference = "default";
    /**
     * 设置画布是否预乘，只对2D(WebGL)、3D有效。
     */
    static premultipliedAlpha: boolean = true;
    /**
     * 设置画布的是否开启模板缓冲，只对2D(WebGL)、3D有效。
     */
    static isStencil: boolean = false;
    /**
     * 是否保留渲染缓冲区。
     */
    static preserveDrawingBuffer: boolean = false;

    /**
     * 当使用webGL渲染2d的时候，每次创建vb是否直接分配足够64k个顶点的缓存。这样可以提高效率。
     */
    static webGL2D_MeshAllocMaxMem: boolean = true;

    /**
     * 是否强制使用像素采样。适用于像素风格游戏
     */
    static is2DPixelArtGame: boolean = false;

    /**
     * 是否使用webgl2
     */
    static useWebGL2: boolean = true;

    /**
     * 是否打印Webgl指令，同时定位webgl报错
     */
    static printWebglOrder: boolean = false;

    /** 是否允许GPUInstance动态合并,仅对3D有效。*/
    static allowGPUInstanceDynamicBatch: boolean = true;

    static useRetinalCanvas: boolean = false;

    /** 限制fps */
    static FPS = 60;

    /**默认文本大小，默认为12*/
    static defaultFontSize: number = 12;
    /**默认文本字体，默认为Arial*/
    static defaultFont: string = "Arial";

    /**WebGL下，文字会被拆分为单个字符进行渲染，一些语系不能拆开显示，比如阿拉伯文，这时可以设置isComplexText=true，禁用文字拆分。*/
    static isComplexText: boolean = false;
    /**在IOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加*/
    static fontFamilyMap: any = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };

    static defaultFontStr(): string {
        return Config.defaultFontSize + "px " + Config.defaultFont;
    }
}

