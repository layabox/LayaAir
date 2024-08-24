import { Point } from "../../maths/Point"
import { Rectangle } from "../../maths/Rectangle"
import { CachePage, Cache_Info } from "../../renders/SpriteCache"
import { RenderTexture2D } from "../../resource/RenderTexture2D"
import { Pool } from "../../utils/Pool"
import { Sprite } from "../Sprite"

/**
 * @internal
 * @en Store cache-related data.
 * Now it has been expanded to store everything related to rendering
 * @zh 存储缓存相关数据
 * 现在已经扩展成存储一切跟渲染相关的东西了
 */
export class CacheStyle {

    static EMPTY = new CacheStyle();
    /**
     * @en Cache type set by the user
     * @zh 用户设置的缓存类型
     */
    userSetCache: string;
    /**
     * @deprecated
     * @en Whether it's a static cache. This property is deprecated and setting any value has no effect.
     * @zh 是否为静态缓存。此属性已经废除，设置任何值都无效。
     */
    staticCache: boolean;
    /**
     * @en Mask object
     * @zh 遮罩对象
     */
    mask: Sprite;
    /**作为mask时的父对象*/
    maskParent: Sprite;
    /**
     * @en Current cache area
     * @zh 当前缓存区域
     */
    cacheRect: Rectangle;
    private _renderTexture: RenderTexture2D;
    renderTexOffx = 0;
    renderTexOffy = 0;

    /**
     * @en Cache information for 'cacheas normal'
     * @zh cacheas normal 相关的缓存信息
     */
    cacheInfo = new Cache_Info();

    constructor() {
        this.reset();
    }

    onInvisible() {
        //console.log('TODO cache invisibl')       
    }

    set renderTexture(rt: RenderTexture2D) {
        if (this._renderTexture && rt != this._renderTexture) {
            this._renderTexture.destroy();
        }
        this._renderTexture = rt;
    }

    get renderTexture() {
        return this._renderTexture;
    }
    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        if (this === CacheStyle.EMPTY) return;
        Pool.recover("SpriteCache", this.reset());
    }

    /**
     * @en Reset the CacheStyle
     * @zh 重置CacheStyle
     */
    reset(): CacheStyle {
        this.userSetCache = "none";
        this.staticCache = false;
        this.mask = null;
        this.maskParent = null;
        if (this.cacheRect) this.cacheRect.recover();
        this.cacheRect = null;
        this.cacheInfo.reset();
        return this
    }

    /**
     * @en Create a new CacheStyle object pool instance.
     * @returns A new CacheStyle instance.
     * @zh 创建一个新的 CacheStyle 对象池实例。
     * @returns 一个新的 CacheStyle 实例。
     */
    static create(): CacheStyle {
        return Pool.getItemByClass("SpriteCache", CacheStyle);
    }

    private static _scaleInfo = new Point();
    static CANVAS_EXTEND_EDGE = 16;
    /**
    * @internal
    */
    _calculateCacheRect(sprite: Sprite, tCacheType: string, x: number, y: number): Point {
        var _cacheStyle = sprite._getCacheStyle();
        if (!_cacheStyle.cacheRect)
            _cacheStyle.cacheRect = Rectangle.create();
        var tRec: Rectangle;

        //计算显示对象的绘图区域
        if (tCacheType === "bitmap") {
            tRec = sprite.getSelfBounds();
            tRec.width = tRec.width;//+ extend * 2;
            tRec.height = tRec.height;// + extend * 2;
            tRec.x = tRec.x - sprite.pivotX;
            tRec.y = tRec.y - sprite.pivotY;
            //关于xy这里有些迷惑，这里看来是表示相对于sprite原点的位置。
            //tRec.x = tRec.x ;//- extend;
            //tRec.y = tRec.y ;//- extend;
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

