import { Sprite } from "../Sprite"
import { Point } from "../../maths/Point"
import { Rectangle } from "../../maths/Rectangle"
import { Context } from "../../resource/Context"
import { HTMLCanvas } from "../../resource/HTMLCanvas"
import { Pool } from "../../utils/Pool"

/**
 * @internal
 * 存储cache相关
 */
export class CacheStyle {

    static EMPTY: CacheStyle = new CacheStyle();
    /**当前实际的cache状态*/
    cacheAs: string;
    /**是否开启canvas渲染*/
    enableCanvasRender: boolean;
    /**用户设的cacheAs类型*/
    userSetCache: string;
    /**是否需要为滤镜cache*/
    cacheForFilters: boolean;
    /**是否为静态缓存*/
    staticCache: boolean;
    /**是否需要刷新缓存*/
    reCache: boolean;
    /**mask对象*/
    mask: Sprite;
    /**作为mask时的父对象*/
    maskParent: Sprite;
    /**滤镜数据*/
    filters: any[];
    /**当前缓存区域*/
    cacheRect: Rectangle;
    /**当前使用的canvas*/
    canvas: HTMLCanvas;
    //TODO:webgl是否还需要
    /**滤镜数据*/
    filterCache: any;
    //TODO:webgl是否还需要
    /**是否有发光滤镜*/
    hasGlowFilter: boolean;

    constructor() {
        this.reset();
    }

    /**
     * 是否需要Bitmap缓存
     * @return
     */
    needBitmapCache(): boolean {
        return this.cacheForFilters || !!this.mask;
    }

    /**
     * 是否需要开启canvas渲染
     */
    needEnableCanvasRender(): boolean {
        return this.userSetCache != "none" || this.cacheForFilters || !!this.mask;
    }

    /**
     * 释放cache的资源
     */
    releaseContext(): void {
        if (this.canvas && ((<any>this.canvas)).size) {
            Pool.recover("CacheCanvas", this.canvas);
            this.canvas.size(0, 0);
            // 微信在iphone8和mate20上个bug，size存在但是不起作用，可能是canvas对象不是我们的。
            // 为了避免canvas不消失，再强制设置宽高为0 TODO 没有测试
            try {
                ((<any>this.canvas)).width = 0;
                ((<any>this.canvas)).height = 0;
            } catch (e) {

            }
        }
        this.canvas = null;
    }

    createContext(): void {
        if (!this.canvas) {
            this.canvas = Pool.getItem("CacheCanvas") || new HTMLCanvas(false);
            var tx: Context = this.canvas.context as Context;
            if (!tx) {
                tx = this.canvas.getContext('2d') as Context;	//如果是webGL的话，这个会返回WebGLContext2D
            }
        }
    }
    /**
     * 释放滤镜资源
     */
    releaseFilterCache(): void {
        var fc: any = this.filterCache;
        if (fc) {
            fc.destroy();
            fc.recycle();
            this.filterCache = null;
        }
    }

    /**
     * 回收
     */
    recover(): void {
        if (this === CacheStyle.EMPTY) return;
        Pool.recover("SpriteCache", this.reset());
    }

    /**
     * 重置
     */
    reset(): CacheStyle {
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
        if (this.cacheRect) this.cacheRect.recover();
        this.cacheRect = null;
        return this
    }

    /**
     * 创建一个SpriteCache
     */
    static create(): CacheStyle {
        return Pool.getItemByClass("SpriteCache", CacheStyle);
    }

    private static _scaleInfo: Point = new Point();
    static CANVAS_EXTEND_EDGE: number = 16;
    /**
    * @internal
    */
    _calculateCacheRect(sprite: Sprite, tCacheType: string, x: number, y: number): Point {
        var _cacheStyle: CacheStyle = sprite._cacheStyle;
        if (!_cacheStyle.cacheRect)
            _cacheStyle.cacheRect = Rectangle.create();
        var tRec: Rectangle;

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
        } else {
            _cacheStyle.cacheRect.setTo(-sprite._style.pivotX, -sprite._style.pivotY, 1, 1);
        }
        tRec = _cacheStyle.cacheRect;


        //处理显示对象的scrollRect偏移
        if (sprite._style.scrollRect) {
            var scrollRect: Rectangle = sprite._style.scrollRect;
            tRec.x -= scrollRect.x;
            tRec.y -= scrollRect.y;
        }
        CacheStyle._scaleInfo.setTo(1, 1);

        return CacheStyle._scaleInfo;
    }
}

