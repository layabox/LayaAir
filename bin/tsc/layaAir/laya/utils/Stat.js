/**
     * <p> <code>Stat</code> 是一个性能统计面板，可以实时更新相关的性能参数。</p>
     * <p>参与统计的性能参数如下（所有参数都是每大约1秒进行更新）：<br/>
     * FPS(Canvas)/FPS(WebGL)：Canvas 模式或者 WebGL 模式下的帧频，也就是每秒显示的帧数，值越高、越稳定，感觉越流畅；<br/>
     * Sprite：统计所有渲染节点（包括容器）数量，它的大小会影响引擎进行节点遍历、数据组织和渲染的效率。其值越小，游戏运行效率越高；<br/>
     * DrawCall：此值是决定性能的重要指标，其值越小，游戏运行效率越高。Canvas模式下表示每大约1秒的图像绘制次数；WebGL模式下表示每大约1秒的渲染提交批次，每次准备数据并通知GPU渲染绘制的过程称为1次DrawCall，在每次DrawCall中除了在通知GPU的渲染上比较耗时之外，切换材质与shader也是非常耗时的操作；<br/>
     * CurMem：Canvas模式下，表示内存占用大小，值越小越好，过高会导致游戏闪退；WebGL模式下，表示内存与显存的占用，值越小越好；<br/>
     * Shader：是 WebGL 模式独有的性能指标，表示每大约1秒 Shader 提交次数，值越小越好；<br/>
     * Canvas：由三个数值组成，只有设置 CacheAs 后才会有值，默认为0/0/0。从左到右数值的意义分别为：每帧重绘的画布数量 / 缓存类型为"normal"类型的画布数量 / 缓存类型为"bitmap"类型的画布数量。</p>
     */
export class Stat {
    /**
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
     */
    static show(x = 0, y = 0) {
        Stat._StatRender.show(x, y);
    }
    /**激活性能统计*/
    static enable() {
        Stat._StatRender.enable();
    }
    /**
     * 隐藏性能统计信息。
     */
    static hide() {
        Stat._StatRender.hide();
    }
    /**
     * @private
     * 清零性能统计计算相关的数据。
     */
    static clear() {
        Stat.trianglesFaces = Stat.renderBatches = Stat.savedRenderBatches = Stat.shaderCall = Stat.spriteRenderUseCacheCount = Stat.frustumCulling = Stat.octreeNodeCulling = Stat.canvasNormal = Stat.canvasBitmap = Stat.canvasReCache = 0;
    }
    /**
     * 点击性能统计显示区域的处理函数。
     */
    static set onclick(fn) {
        Stat._StatRender.set_onclick(fn);
    }
}
/** 每秒帧数。*/
Stat.FPS = 0;
/**主舞台 <code>Stage</code> 渲染次数计数。 */
Stat.loopCount = 0;
/** 着色器请求次数。*/
Stat.shaderCall = 0;
/** 渲染批次。*/
Stat.renderBatches = 0;
/** 节省的渲染批次。*/
Stat.savedRenderBatches = 0;
/** 三角形面数。*/
Stat.trianglesFaces = 0;
/** 精灵<code>Sprite</code> 的数量。*/
Stat.spriteCount = 0;
/** 精灵渲染使用缓存<code>Sprite</code> 的数量。*/
Stat.spriteRenderUseCacheCount = 0;
/** 视锥剔除次数。*/
Stat.frustumCulling = 0;
/**	八叉树节点剔除次数。*/
Stat.octreeNodeCulling = 0;
/** 画布 canvas 使用标准渲染的次数。*/
Stat.canvasNormal = 0;
/** 画布 canvas 使用位图渲染的次数。*/
Stat.canvasBitmap = 0;
/** 画布 canvas 缓冲区重绘次数。*/
Stat.canvasReCache = 0;
/** 表示当前使用的是否为慢渲染模式。*/
Stat.renderSlow = false;
Stat._fpsData = [];
Stat._timer = 0;
Stat._count = 0;
/**@internal*/
Stat._StatRender = null;
