/**
 * @description
 * 动态图集管理器 - 封装LargeTexManager，提供便捷的图集管理功能
 * 支持动态添加、移除纹理，自动管理UV坐标，替换原始纹理对象
 */

import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { Event } from "../events/Event";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Resource } from "../resource/Resource";
import { DynamicTexInfo, Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { LargeTexBase, LargeTexManager, TextureItem, TextureOut } from "./LargeTexManager";

/** @internal */
type _$TextureData = {
    texture: Texture,
    uv: ArrayLike<number>
}

/**
 * 纹理信息接口
 */
export class TextureInfo implements DynamicTexInfo{

    recover(){
        this.owner.removeByTexture2DId(this.textureId, -1, false);
    }

    owner: DynamicAtlasManager;
    /** 原始纹理对象 */
    textureMap: Map<number, _$TextureData>;
    /** 原始texture2d */
    source: Texture2D;
    /** 纹理ID */
    textureId: number;
    /** 纹理URL */
    url: string;
    /** 在大图集中的UV坐标 */
    uv: Vector4;
    /** 大纹理索引 */
    largeTextureIndex: number;
    /** 是否已添加到图集 */
    isInAtlas: boolean;
    /** 是否已合并 */
    merged: boolean;
    /** 绘制完成次数（用于扩边框情况） */
    drawCompletedCount: number;
    /** 引用计数 */
    referenceCount: number;
}

/**
 * 动态图集管理器配置
 */
export interface DynamicAtlasConfig {
    /** 大纹理尺寸 [宽度, 高度] */
    largeTextureSize: [number, number];
    /** 大纹理最大数量 */
    maxLargeTextures: number;
    /** 小纹理单元尺寸 */
    textureUnitSize: number;
    /** 纹理扩边尺寸 */
    extendSize: number;
    /** 纹理格式 */
    textureFormat: RenderTargetFormat;
    /** 是否立即执行合并 */
    immediately: boolean;
    /** 是否自动扩展大纹理数量 */
    autoExtend: boolean;
    /** 是否查重 */
    checkDuplicate: boolean;
}

/**
 * 动态图集管理器
 * 提供便捷的图集管理功能，封装LargeTexManager的复杂操作
 * todo:
 * 1. 用户new texture(texture2d), 此时texture2d 已经被合并到大图集，且已经被自动释放。会导致 texture2d 被重新加载。
 */
export class DynamicAtlasManager {
    private _largeTexManager: LargeTexManager;
    private _textureMap: Map<number, TextureInfo> = new Map(); // texture2D.id -> info
    private _textureIdMap: Map<number, number> = new Map(); // texture.id -> texture2d.id mapping
    private _config: DynamicAtlasConfig;
    private _isDestroyed: boolean = false;
    private _autoReplace: boolean = false;
    private _totalDrawCount: number = 1;
    private _waitReplace: Set<number> = new Set();

    constructor(config?: Partial<DynamicAtlasConfig> , autoReplace: boolean = true) {
        this._config = {
            largeTextureSize: [1024, 1024],
            maxLargeTextures: 4,
            textureUnitSize: 16,
            extendSize: 1,
            textureFormat: RenderTargetFormat.R8G8B8A8,
            immediately: false,
            autoExtend: true,
            checkDuplicate: true,
            ...config
        };

        this._largeTexManager = new LargeTexManager(
            this._config.largeTextureSize,
            this._config.maxLargeTextures,
            this._config.textureUnitSize,
            this._config.extendSize,
            this._config.textureFormat
        );

        this._largeTexManager.gammaCorrection = 2.2;
        this._largeTexManager.sRGB = false;

        this._largeTexManager.immediately = this._config.immediately;
        this._largeTexManager.autoExtend = this._config.autoExtend;
        this._largeTexManager.checkDup = this._config.checkDuplicate;
        this._largeTexManager.name = "DynamicAtlas";
        this._autoReplace = autoReplace;
        if (autoReplace) {
            this._largeTexManager.updateHook = this.afterUpdate.bind(this);
        }
        this._totalDrawCount = this._config.extendSize > 0 ? 2 : 1;
    }

    /**
     * Helper method to consistently get Texture2D from URL
     * @param url The texture URL
     * @returns Texture2D object or null if not found
     */
    private _getTexture2DByUrl(url: string): Texture2D | null {
        if (!url) return null;

        // Try to get Texture2D directly
        let texture2D = Laya.loader.getRes(url, Loader.TEXTURE2D) as Texture2D;
        if (texture2D) return texture2D;

        // Fallback: get Texture and extract bitmap
        let texture = Laya.loader.getRes(url, Loader.IMAGE) as Texture;
        if (texture && texture.bitmap) {
            return texture.bitmap as Texture2D;
        }

        return null;
    }

    /**
     * Get Texture2D ID from Texture ID using the mapping table
     * @param textureId The Texture ID
     * @returns Texture2D ID or null if not found
     */
    private _getTexture2DId(textureId: number): number | null {
        return this._textureIdMap.get(textureId) || null;
    }

    private _findSmallTexture(tex: Texture, info: TextureInfo) {
        let out = info.textureMap;
        let ot = tex.bitmap;
        let texture2DId = info.textureId;

        const _find = (texture: Texture) => {
            let atlas = texture._atlas;
            if (atlas) {
                atlas.frames.forEach(_t => {
                    if (_t.bitmap == ot) {
                        _t._dynamic = info;
                        out.set(_t.id, { texture: _t, uv: _t.uv });
                        // Record texture.id -> texture2d.id mapping
                        this._textureIdMap.set(_t.id, texture2DId);
                    }
                });

                atlas.textures.forEach(_t => {
                    if (_t.bitmap == ot) {
                        _t._dynamic = info;
                        out.set(_t.id, { texture: _t, uv: _t.uv });
                        // Record texture.id -> texture2d.id mapping
                        this._textureIdMap.set(_t.id, texture2DId);
                    }
                });
            }
        }

        _find(tex);
        if (tex._dynamic != info) {
            out.set(tex.id, { texture: tex, uv: tex.uv });
            tex._dynamic = info;
            // Record texture.id -> texture2d.id mapping
            this._textureIdMap.set(tex.id, texture2DId);
        }
    }

    /**
     * @en Add texture to atlas
     * @param texture texture to add
     * @param scale scale to add
     * @param largeTextureIndex largeTextureIndex to add
     * @returns boolean whether add texture to atlas successfully
     * @zh 添加纹理到图集
     * @param texture 要添加的纹理
     * @param scale 缩放系数，默认1.0
     * @param largeTextureIndex 指定大纹理索引，-1表示自动分配
     * @returns 是否添加成功
     */
    public addTexture(texture: Texture, scale: number = 1.0, largeTextureIndex: number = -1): boolean {
        if (this._isDestroyed
            || !texture
            || !texture.bitmap
        ) {
            return false;
        }

        let texture2D = texture.bitmap as Texture2D;
        let textureId = texture2D.id;

        let textureInfo = this._textureMap.get(textureId);
        if (textureInfo) {
            let textureMap = textureInfo.textureMap;
            if (textureMap.has(texture.id)) {
                return true;
            }
            textureMap.set(texture.id, {
                texture, uv: texture.uv
            });

            // Record texture.id -> texture2d.id mapping
            this._textureIdMap.set(texture.id, textureId);

            // this._replaceTexture(textureInfo , this._largeTexManager.getTexture(textureId, textureInfo.largeTextureIndex));
            //不能在当前帧切换，会影响渲染
            if (this._autoReplace && textureInfo.merged) {
                this._waitReplace.add(textureId);
                Laya.timer.callLater(this, this.onUpdate);
            }
            return true;
        }

        let result = this._largeTexManager.addTexture(texture2D, scale, largeTextureIndex, texture.url, false);
        if (result < 0) {
            console.warn(`DynamicAtlasManager: 纹理 ${textureId} 添加失败，空间不足`);
            return false;
        }

        let textureOut = this._largeTexManager.getTexture(textureId, result);

        textureInfo = new TextureInfo();
        textureInfo.textureMap = new Map();
        textureInfo.source = texture2D;
        textureInfo.textureId = textureId;
        textureInfo.url = texture2D.url || "";
        textureInfo.uv = new Vector4(
            textureOut.texItem.x,
            textureOut.texItem.y,
            textureOut.texItem.w,
            textureOut.texItem.h);
        textureInfo.largeTextureIndex = result;
        textureInfo.isInAtlas = true;
        textureInfo.merged = false;
        textureInfo.drawCompletedCount = 0;
        textureInfo.referenceCount = 0;
        textureInfo.owner = this;

        //一次性替换所有小图
        this._findSmallTexture(texture, textureInfo);
        this._textureMap.set(textureId, textureInfo);

        return true;
    }

    onUpdate(): void {
        if (this._waitReplace.size > 0) {
            for (const textureId of this._waitReplace) {
                let textureInfo = this._textureMap.get(textureId);
                if (textureInfo) {
                    this._replaceTexture(textureInfo , this._largeTexManager.getTexture(textureId, textureInfo.largeTextureIndex));
                }
            }
        }
        this._waitReplace.clear();
    }

    private afterUpdate(index: number, completedIds: number[]): void {
        if (this._isDestroyed || !completedIds || completedIds.length === 0) return;
        
        for (const id of completedIds) {
            let textureInfo = this._textureMap.get(id);
            if (!textureInfo || !textureInfo.isInAtlas) {
                continue;
            }
            
            // 避免重复处理：检查是否已经合并过
            if (textureInfo.merged) {
                continue;
            }
            
            // 增加绘制完成计数
            textureInfo.drawCompletedCount++;
            
            // 只有当所有绘制都完成后才进行替换
            if (textureInfo.drawCompletedCount < this._totalDrawCount) {
                continue;
            }
            
            // 检查纹理是否真的完成了绘制
            const textureOut = this._largeTexManager.getTexture(id, index);
            if (!textureOut || !textureOut.texture || !textureOut.texItem) {
                continue;
            }
            
            this._replaceTexture(textureInfo , textureOut);
        }
    }

    /**
     * @en Add texture to atlas by url
     * @param url url of texture to add
     * @param scale scale to add
     * @param largeTextureIndex largeTextureIndex to add
     * @returns boolean whether add texture to atlas successfully
     * @zh 通过URL添加纹理到图集
     * @param url 纹理URL
     * @param scale 缩放系数，默认1.0
     * @param largeTextureIndex 指定大纹理索引，-1表示自动分配
     * @returns 是否添加成功
     */
    public addTextureByUrl(url: string, scale: number = 1.0, largeTextureIndex: number = -1): boolean {
        if (this._isDestroyed || !url) {
            return false;
        }

        let texture = ILaya.loader.getRes(url, Loader.IMAGE) as Texture;
        if (!texture) {
            console.warn(`DynamicAtlasManager: 纹理 ${url} 未加载，请先加载纹理`);
            return false;
        }

        if (!texture.bitmap) {
            console.warn(`DynamicAtlasManager: 纹理 ${url} 的 bitmap 为空，无法添加到图集`);
            return false;
        }

        return this.addTexture(texture, scale, largeTextureIndex);
    }

    /**
     * @en Add textures to atlas
     * @param textures textures to add
     * @param scale scale to add
     * @param largeTextureIndex largeTextureIndex to add
     * @returns number of textures added successfully
     * @zh 批量添加纹理到图集
     * @param textures 纹理数组
     * @param scale 缩放系数，默认1.0
     * @param largeTextureIndex 指定大纹理索引，-1表示自动分配
     * @returns 成功添加的纹理数量
     */
    public addTextures(textures: Texture[], scale: number = 1.0, largeTextureIndex: number = -1): number {
        let successCount = 0;
        for (const texture of textures) {
            if (this.addTexture(texture, scale, largeTextureIndex)) {
                successCount++;
            }
        }
        return successCount;
    }

    /**
     * @en Add textures to atlas by urls
     * @param urls urls to add
     * @param scale scale to add
     * @param largeTextureIndex largeTextureIndex to add
     * @returns number of textures added successfully
     * @zh 批量通过URL添加纹理到图集
     * @param urls URL数组
     * @param scale 缩放系数，默认1.0
     * @param largeTextureIndex 指定大纹理索引，-1表示自动分配
     * @returns 成功添加的纹理数量
     */
    public addTexturesByUrl(urls: string[], scale: number = 1.0, largeTextureIndex: number = -1): number {
        let successCount = 0;
        for (const url of urls) {
            if (this.addTextureByUrl(url, scale, largeTextureIndex)) {
                successCount++;
            }
        }
        return successCount;
    }

    /**
     * @en Remove texture from atlas
     * @param texture texture to remove or textureId to remove
     * @param largeTextureIndex largeTextureIndex to remove
     * @param event event to remove
     * @returns boolean whether remove texture from atlas successfully
     * @zh 从图集中移除纹理
     * @param texture 纹理或纹理ID
     * @param largeTextureIndex 大纹理索引，-1表示从所有大纹理中移除
     * @param event 是否触发事件，默认true
     * @returns 是否移除成功
     */
    public removeTexture(texture: Texture | number, largeTextureIndex: number = -1 , event: boolean = true): boolean {
        if (this._isDestroyed) return false;
        return this.removeByTexture2DId(this._getTexture2DId(typeof texture === 'number' ? texture : texture.id), largeTextureIndex);
    }
    
    public removeByTexture2DId(texture2DId: number, largeTextureIndex: number = -1 , event: boolean = true): boolean {
        if (this._isDestroyed) return false;

        let textureInfo = this._textureMap.get(texture2DId);
        if (!textureInfo) return false;

        this._largeTexManager.removeTexture(texture2DId, largeTextureIndex);
        this._textureMap.delete(texture2DId);

        // Restore original texture - prioritize source over URL loading
        let otexture2d = textureInfo.source;
        if (!otexture2d || otexture2d.destroyed) {
            // Fallback to loading from URL if source is unavailable
            if (textureInfo.url) {
                otexture2d = Laya.loader.getRes(textureInfo.url, Loader.TEXTURE2D) as Texture2D;
            }
        }

        // If we still don't have a valid texture, we can't restore
        if (!otexture2d || otexture2d.destroyed) {
            return true;
        }

        textureInfo.textureMap.forEach(({ texture, uv }, id) => {
            texture.bitmap = otexture2d;
            texture.uv = uv;
            texture._dynamic = null;
            // Clean up texture.id -> texture2d.id mapping
            this._textureIdMap.delete(id);
            if (event) {
                texture.event(Event.CHANGE);
            }
        })

        return true;
    }
    /**
     * @en Remove texture from atlas by url
     * @param url url of texture to remove
     * @param largeTextureIndex largeTextureIndex to remove
     * @returns boolean whether remove texture from atlas successfully
     * @zh 通过URL从图集中移除纹理
     * @param url 纹理URL
     * @param largeTextureIndex 大纹理索引，-1表示从所有大纹理中移除
     * @returns 是否移除成功
     */
    public removeTextureByUrl(url: string, largeTextureIndex: number = -1): boolean {
        if (!url) return false;

        // First try to get Texture and check if it has _dynamic info
        let texture = Laya.loader.getRes(url, Loader.IMAGE) as Texture;
        if (texture && texture._dynamic) {
            // Texture is already in atlas, use the stored textureId
            let textureInfo = texture._dynamic as TextureInfo;
            return this.removeByTexture2DId(textureInfo.textureId, largeTextureIndex);
        }

        // Fallback: search through _textureMap to find matching URL
        for (let [textureId, textureInfo] of this._textureMap) {
            if (textureInfo.url === url) {
                return this.removeByTexture2DId(textureId, largeTextureIndex);
            }
        }

        console.warn(`DynamicAtlasManager: 纹理 ${url} 未在图集中找到`);
        return false;
    }

    private _replaceTexture(textureInfo: TextureInfo, textureOut: TextureOut): boolean {
        // 标记为已合并，避免重复处理
        textureInfo.merged = true;
        
        let textureMap = textureInfo.textureMap;
        let rt = textureOut.texture;
        /** 保存原始uv */
        // textureInfo.originalUV = originalTexture.uv;
        /** 保存原始texture2d */
        // textureInfo.originalTexture2d = originalTexture.bitmap as Texture2D;

        let x = textureOut.texItem.x;
        let y = textureOut.texItem.y;
        let w = textureOut.texItem.w;
        let h = textureOut.texItem.h;

        textureMap.forEach(({ texture , uv }  , id) => {
            if (texture.bitmap !== rt) {
                let oSWidth = texture.sourceWidth;
                let oSHeight = texture.sourceHeight;
                let oWidth = texture.width;
                let oHeight = texture.height;
    
                let nuv: Float32Array;
                if (uv === Texture.DEF_UV) {
                    // 默认UV，使用调整后的图集位置
                    nuv = Float32Array.from([
                        x, y, 
                        x + w, y, 
                        x + w, y + h, 
                        x, y + h
                    ]);
                } else {
                    // 已有UV，需要重新计算在大图合集中的位置
                    // 原始UV坐标（相对于原纹理的归一化坐标）
                    let ox = uv[0];
                    let oy = uv[1];
                    let owidth = uv[2] - ox;
                    let oheight = uv[5] - oy;
                    
                    // 计算在大图合集中的新UV坐标
                    // 将原始UV坐标映射到大图合集的对应区域
                    let nx = x + ox * w;  // 调整后的起始位置 + 原始UV偏移 * 调整后的宽度
                    let ny = y + oy * h;  // 调整后的起始位置 + 原始UV偏移 * 调整后的高度
                    let nwidth = owidth * w;      // 原始UV宽度 * 调整后的宽度
                    let nheight = oheight * h;    // 原始UV高度 * 调整后的高度
                    
                    nuv = Float32Array.from([
                        nx, ny, 
                        nx + nwidth, ny, 
                        nx + nwidth, ny + nheight, 
                        nx, ny + nheight
                    ]);
                }
                
                texture.setTo(rt, nuv, oSWidth, oSHeight);
                texture.event(Event.CHANGE);
                texture.width = oWidth;
                texture.height = oHeight;
                texture._dynamic = textureInfo;
            }
            
        });

        return true;
    }

    /**
     * @en Replace original texture object,使其使用图集中的纹理
     * @param textureId textureId to replace
     * @returns boolean whether replace original texture object successfully
     * @zh 替换原始纹理对象，使其使用图集中的纹理
     * @param textureId 纹理ID
     * @returns 是否替换成功
     */
    public replaceOriginalTexture(textureId: number): boolean {
        if (this._isDestroyed) return false;
        
        let textureInfo = this._textureMap.get(textureId);
        if (!textureInfo || !textureInfo.isInAtlas) {
            return false;
        }

        const textureOut = this._largeTexManager.getTexture(textureId, textureInfo.largeTextureIndex);
        if (!textureOut || !textureOut.texture || !textureOut.texItem) {
            console.warn(`DynamicAtlasManager: 无法获取纹理 ${textureId} 的图集信息`);
            return false;
        }

        this._replaceTexture(textureInfo, textureOut);
        return true;
    }

    /**
     * @en Replace original texture objects
     * @param textureIds textureIds to replace
     * @returns number of textures replaced successfully
     * @zh 批量替换原始纹理对象
     * @param textureIds 纹理ID数组，如果为空则替换所有纹理
     * @returns 成功替换的纹理数量
     */
    public replaceOriginalTextures(textureIds?: number[]): number {
        let successCount = 0;
        
        if (textureIds && textureIds.length > 0) {
            for (const textureId of textureIds) {
                if (this.replaceOriginalTexture(textureId)) {
                    successCount++;
                }
            }
        } else {
            for (const [textureId, textureInfo] of this._textureMap) {
                if (textureInfo.isInAtlas && this.replaceOriginalTexture(textureId)) {
                    successCount++;
                }
            }
        }

        return successCount;
    }

    /**
     * @en Get texture info
     * @param textureId textureId to get
     * @returns texture info, if not exists return null
     * @zh 获取纹理信息
     * @param textureId 纹理ID
     * @returns 纹理信息，如果不存在返回null
     */
    public getTextureInfo(textureId: number): TextureInfo | null {
        return this._textureMap.get(textureId) || null;
    }

    /**
     * @en Get texture info by url
     * @param url url of texture to get
     * @returns texture info, if not exists return null
     * @zh 通过URL获取纹理信息
     * @param url 纹理URL
     * @returns 纹理信息，如果不存在返回null
     */
    public getTextureInfoByUrl(url: string): TextureInfo | null {
        if (!url) return null;

        let texture2D = this._getTexture2DByUrl(url);
        if (!texture2D) return null;

        return this.getTextureInfo(texture2D.id) || null;
    }

    /**
     * @en Get large texture object
     * @param largeTextureIndex largeTextureIndex to get
     * @returns large texture object
     * @zh 获取大纹理对象
     * @param largeTextureIndex 大纹理索引
     * @returns 大纹理对象
     */
    public getLargeTexture(largeTextureIndex: number) {
        return this._largeTexManager.getLargeTex(largeTextureIndex);
    }

    /**
     * @en Get all large texture objects
     * @returns all large texture objects
     * @zh 获取所有大纹理对象
     * @returns 大纹理对象数组
     */
    public getAllLargeTextures() {
        return this._largeTexManager.largeTexs;
    }

    /**
     * @en Get texture count in atlas
     * @returns texture count in atlas
     * @zh 获取图集中的纹理数量
     * @returns 纹理数量
     */
    public getTextureCount(): number {
        return this._textureMap.size;
    }

    /**
     * @en Clear atlas
     * @zh 清空图集，会清理rt注意引用关系
     */
    public clear(): void {
        // todo 还原
        this._largeTexManager.clear();
        this._textureMap.clear();
        this._textureIdMap.clear();
    }

    /**
     * @en Destroy manager
     * @zh 销毁管理器
     */
    public destroy(): void {
        if (this._isDestroyed) {
            return;
        }
        this.clear();
        this._isDestroyed = true;
    }

    /**
     * @en Get statistics info
     * @returns statistics info object
     * @zh 获取统计信息
     * @returns 统计信息对象
     */
    public getStatistics() {
        return {
            textureCount: this.getTextureCount(),
            usageRate: this._largeTexManager.getLoadUsageRate(),
            gpuMemoryUsage: this._largeTexManager.calculateGpuMemory(),
            largeTextureCount: this._largeTexManager.largeTexs.length,
            config: this._config
        };
    }

    /**
     * @en Clean up unused texture info
     * @param forceClean if true, clean all textures regardless of reference count
     * @returns number of textures cleaned up
     * @zh 清理未使用的纹理信息
     * @param forceClean 如果为true，则清理所有纹理，不管引用计数
     * @returns 清理的纹理数量
     */
    public cleanupUnusedTextures(forceClean: boolean = false): number {
        if (this._isDestroyed) return 0;
        
        let cleanedCount = 0;
        const textureIdsToRemove: number[] = [];
        
        // 收集需要移除的纹理ID
        for (const [textureId, textureInfo] of this._textureMap) {
            // 如果强制清理或者引用计数为0，则标记为移除
            if (forceClean || textureInfo.referenceCount <= 0) {
                textureIdsToRemove.push(textureId);
            }
        }
        
        for (const textureId of textureIdsToRemove) {
            if (this.removeByTexture2DId(textureId)) {
                cleanedCount++;
            }
        }
        
        return cleanedCount;
    }
}
