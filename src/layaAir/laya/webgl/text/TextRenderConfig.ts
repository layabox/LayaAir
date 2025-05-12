/**
 * @ignore
 */
export class TextRenderConfig {
    static maxCanvasWidth = 4096; //canvas的最大值
    static atlasWidth = 1024;
    static atlasGridW = 16;
    static noAtlas = false; // 一串文字用独立贴图
    static forceSplitRender = false; // 强制把一句话拆开渲染
    static forceWholeRender = false; // 强制整句话渲染
    static scaleFontWithCtx = true; // 如果有缩放，则修改字体，以保证清晰度
    static maxFontScale = 4; //当scaleFontWithCtx为true时，最大允许放大的倍数
    static standardFontSize = 32; // 测量的时候使用的字体大小
    static destroyAtlasDt = 10; // 回收图集贴图的时间。单位是帧
    static checkCleanTextureDt = 2000; // 检查是否要真正删除纹理的时间。单位是ms
    static destroyUnusedTextureDt = 10; // 长时间不用的纹理删除的时间。单位是帧。设低一点，对ide友好，例如在edit中一直输入
    static cleanMem = 100 * 1024 * 1024; // 多大内存触发清理图集。这时候占用率低的图集会被清理
    static showLog = false;
    static debugUV = false; // 文字纹理需要保护边。当像素没有对齐的时候，可能会采样到旁边的贴图。true则填充texture为白色，模拟干扰
    static simClean = false; // 测试用。强制清理占用低的图集
    static debugCharCanvas = false;
    static useImageData = true;
}