import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { HTMLCanvas } from "../../resource/HTMLCanvas";
import { Pool } from "../../utils/Pool";
/**
 * @internal
 * 存储cache相关
 */
export class CacheStyle {
    constructor() {
        this.reset();
    }
    /**
     * 是否需要Bitmap缓存
     * @return
     */
    needBitmapCache() {
        return this.cacheForFilters || !!this.mask;
    }
    /**
     * 是否需要开启canvas渲染
     */
    needEnableCanvasRender() {
        return this.userSetCache != "none" || this.cacheForFilters || !!this.mask;
    }
    /**
     * 释放cache的资源
     */
    releaseContext() {
        if (this.canvas && this.canvas.size) {
            Pool.recover("CacheCanvas", this.canvas);
            this.canvas.size(0, 0);
            // 微信在iphone8和mate20上个bug，size存在但是不起作用，可能是canvas对象不是我们的。
            // 为了避免canvas不消失，再强制设置宽高为0 TODO 没有测试
            try {
                this.canvas.width = 0;
                this.canvas.height = 0;
            }
            catch (e) {
            }
        }
        this.canvas = null;
    }
    createContext() {
        if (!this.canvas) {
            this.canvas = Pool.getItem("CacheCanvas") || new HTMLCanvas(false);
            var tx = this.canvas.context;
            if (!tx) {
                tx = this.canvas.getContext('2d'); //如果是webGL的话，这个会返回WebGLContext2D
            }
        }
    }
    /**
     * 释放滤镜资源
     */
    releaseFilterCache() {
        var fc = this.filterCache;
        if (fc) {
            fc.destroy();
            fc.recycle();
            this.filterCache = null;
        }
    }
    /**
     * 回收
     */
    recover() {
        if (this === CacheStyle.EMPTY)
            return;
        Pool.recover("SpriteCache", this.reset());
    }
    /**
     * 重置
     */
    reset() {
        this.releaseContext();
        this.releaseFilterCache();
        this.cacheAs = "none";
        this.enableCanvasRender = false;
        this.userSetCache = "none";
        this.cacheForFilters = false;
        this.staticCache = false;
        this.reCache = true;
        this.mask = null;
        this.maskParent = null;
        this.filterCache = null;
        this.filters = null;
        this.hasGlowFilter = false;
        if (this.cacheRect)
            this.cacheRect.recover();
        this.cacheRect = null;
        return this;
    }
    /**
     * 创建一个SpriteCache
     */
    static create() {
        return Pool.getItemByClass("SpriteCache", CacheStyle);
    }
    /**
    * @internal
    */
    _calculateCacheRect(sprite, tCacheType, x, y) {
        var _cacheStyle = sprite._cacheStyle;
        if (!_cacheStyle.cacheRect)
            _cacheStyle.cacheRect = Rectangle.create();
        var tRec;
        //计算显示对象的绘图区域
        if (tCacheType === "bitmap") {
            tRec = sprite.getSelfBounds();
            tRec.width = tRec.width + CacheStyle.CANVAS_EXTEND_EDGE * 2;
            tRec.height = tRec.height + CacheStyle.CANVAS_EXTEND_EDGE * 2;
            tRec.x = tRec.x - sprite.pivotX;
            tRec.y = tRec.y - sprite.pivotY;
            tRec.x = tRec.x - CacheStyle.CANVAS_EXTEND_EDGE;
            tRec.y = tRec.y - CacheStyle.CANVAS_EXTEND_EDGE;
            tRec.x = Math.floor(tRec.x + x) - x;
            tRec.y = Math.floor(tRec.y + y) - y;
            tRec.width = Math.floor(tRec.width);
            tRec.height = Math.floor(tRec.height);
            _cacheStyle.cacheRect.copyFrom(tRec);
        }
        else {
            _cacheStyle.cacheRect.setTo(-sprite._style.pivotX, -sprite._style.pivotY, 1, 1);
        }
        tRec = _cacheStyle.cacheRect;
        //处理显示对象的scrollRect偏移
        if (sprite._style.scrollRect) {
            var scrollRect = sprite._style.scrollRect;
            tRec.x -= scrollRect.x;
            tRec.y -= scrollRect.y;
        }
        CacheStyle._scaleInfo.setTo(1, 1);
        return CacheStyle._scaleInfo;
    }
}
CacheStyle.EMPTY = new CacheStyle();
CacheStyle._scaleInfo = new Point();
CacheStyle.CANVAS_EXTEND_EDGE = 16;
