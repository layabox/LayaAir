/**
     *  Config 用于配置一些全局参数。如需更改，请在初始化引擎之前设置。
     */
export class Config {
}
/**
 * 动画 Animation 的默认播放时间间隔，单位为毫秒。
 */
Config.animationInterval = 50;
/**
 * 设置是否抗锯齿，只对2D(WebGL)、3D有效。
 */
Config.isAntialias = false;
/**
 * 设置画布是否透明，只对2D(WebGL)、3D有效。
 */
Config.isAlpha = false;
/**
 * 设置画布是否预乘，只对2D(WebGL)、3D有效。
 */
Config.premultipliedAlpha = true;
/**
 * 设置画布的是否开启模板缓冲，只对2D(WebGL)、3D有效。
 */
Config.isStencil = true;
/**
 * 是否强制WebGL同步刷新。
 */
Config.preserveDrawingBuffer = false;
/**
 * 当使用webGL渲染2d的时候，每次创建vb是否直接分配足够64k个顶点的缓存。这样可以提高效率。
 */
Config.webGL2D_MeshAllocMaxMem = true;
/**
 * 是否强制使用像素采样。适用于像素风格游戏
 */
Config.is2DPixelArtGame = false;
/**
 * 是否使用webgl2
 */
Config.useWebGL2 = true;
Config.useRetinalCanvas = false;
