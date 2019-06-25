import { Sprite } from "../Sprite";
import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { HTMLCanvas } from "../../resource/HTMLCanvas";
/**
 * @private
 * 存储cache相关
 */
export declare class CacheStyle {
    static EMPTY: CacheStyle;
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
    /**滤镜数据*/
    filterCache: any;
    /**是否有发光滤镜*/
    hasGlowFilter: boolean;
    constructor();
    /**
     * 是否需要Bitmap缓存
     * @return
     */
    needBitmapCache(): boolean;
    /**
     * 是否需要开启canvas渲染
     */
    needEnableCanvasRender(): boolean;
    /**
     * 释放cache的资源
     */
    releaseContext(): void;
    createContext(): void;
    /**
     * 释放滤镜资源
     */
    releaseFilterCache(): void;
    /**
     * 回收
     */
    recover(): void;
    /**
     * 重置
     */
    reset(): CacheStyle;
    /**
     * 创建一个SpriteCache
     */
    static create(): CacheStyle;
    private static _scaleInfo;
    static CANVAS_EXTEND_EDGE: number;
    _calculateCacheRect(sprite: Sprite, tCacheType: string, x: number, y: number): Point;
}
