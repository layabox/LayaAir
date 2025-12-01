/**
 * @en Text rendering configuration
 * @zh 文字渲染配置
 */
export class TextRenderConfig {
    /**
     * @en Maximum canvas size
     * @zh canvas的最大值
     */
    static maxCanvasWidth = 4096;
    /**
     * @en Width and height of each text atlas. A new atlas will be created when it is full.
     * @zh 每张文字图集的宽度和高度。如果满了会创建新的图集。
     */
    static atlasWidth = 1024;
    /**
     * @en Cell size of AtlasGrid
     * @zh AtlasGrid的单元格大小
     */
    static atlasGridW = 16;
    /**
     * @en Standard font size used for measurement
     * @zh 测量时使用的标准字体大小
     */
    static standardFontSize = 32;

    /**
     * @en If set to true, text will not use atlas and all texts will use independent textures. (Single character rendering mode excepted)
     * @zh 设置为true则强制不使用图集，所有文本都用独立贴图。(单字渲染模式除外）
     */
    static noAtlas = false;
    /**
     * @en Force single character rendering mode.
     * @zh 强制使用单字渲染模式。
     */
    static forceSplitRender = false;
    /**
     * @zh 强制整句渲染模式。
     * @en Force whole sentence rendering mode.
     */
    static forceWholeRender = false;

    /**
     * @zh 如果舞台有缩放，则修改渲染大小，以保证清晰度
     * @en If the stage is scaled, modify the rendering size to ensure clarity
     */
    static scaleFontWithCtx = true;
    /**
     * @en Maximum allowed scaling factor when scaleFontWithCtx is true
     * @zh 当scaleFontWithCtx为true时，最大允许放大的倍数
     */
    static maxFontScale = 3;
    /**
     * @en Global font scaling factor. If scaleFontWithCtx is set, this value will be automatically set according to the stage scale.
     * @zh 设定字体全局缩放，如果设置了scaleFontWithCtx，则这个值会根据舞台比例自动设置。
     */
    static fontScale = 1;
}