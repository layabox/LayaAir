
import { Laya } from "../../Laya";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { LargeTexManager, TextureItem, TextureOut } from "./LargeTexManager";

/**
 * 纹理信息接口
 */
export interface TextureInfo {
    /** 原始纹理对象 */
    originalTexture: Texture;
    /** 原始uv */
    // originalUV?: ArrayLike<number>;
    /** 原始texture2d */
    // originalTexture2d?: Texture2D;
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
 * 动态图集管理器 - 封装LargeTexManager，提供便捷的图集管理功能
 * 支持动态添加、移除纹理，自动管理UV坐标，替换原始纹理对象
 */
export class DynamicAtlasManager {
    private _largeTexManager: LargeTexManager;
    private _textureMap: Map<number, TextureInfo> = new Map();
    private _config: DynamicAtlasConfig;
    private _isDestroyed: boolean = false;
    private _waitIds: number[] = [];
    private _waitUpdate: boolean = false;
    private _autoReplace: boolean = false;

    constructor(config?: Partial<DynamicAtlasConfig> , autoReplace: boolean = false) {
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


        this._largeTexManager.immediately = this._config.immediately;
        this._largeTexManager.autoExtend = this._config.autoExtend;
        this._largeTexManager.checkDup = this._config.checkDuplicate;
        this._largeTexManager.name = "DynamicAtlas";
        this._autoReplace = autoReplace;
        if (autoReplace) {
            this._largeTexManager.updateHook = this.afterUpdate.bind(this);
        }
        this._waitUpdate = !this._config.immediately;
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

        if (this._textureMap.has(textureId)) {
            return true;
        }

        let result = this._largeTexManager.addTexture(texture2D, scale, largeTextureIndex, texture.url, false);
        if (result < 0) {
            console.warn(`DynamicAtlasManager: 纹理 ${textureId} 添加失败，空间不足`);
            return false;
        }

        let textureOut = this._largeTexManager.getTexture(textureId, result);

        let textureInfo: TextureInfo = {
            originalTexture: texture,
            textureId: textureId,
            url: texture.url || "",
            uv: new Vector4(
                textureOut.texItem.x,
                textureOut.texItem.y,
                textureOut.texItem.w,
                textureOut.texItem.h
            ),
            largeTextureIndex: result,
            isInAtlas: true
        };

        this._textureMap.set(textureId, textureInfo);
        
        if (this._waitUpdate) {
            this._waitIds.push(textureId);
        }

        return true;
    }

    private afterUpdate(): void {
        if (this._waitIds.length > 0) {
            for (let index = this._waitIds.length - 1; index >= 0; index--) {
                const id = this._waitIds[index];
                let result = this.replaceOriginalTexture(id);
                if (result) {
                    this._waitIds.splice(index, 1);
                }
            }
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
        if (this._isDestroyed
            || !url
        ) {
            return false;
        }

        let texture = Laya.loader.getRes(url, Loader.IMAGE) as Texture;
        if (!texture) {
            console.warn(`DynamicAtlasManager: 纹理 ${url} 未加载，请先加载纹理`);
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
     * @param textureId textureId to remove
     * @param largeTextureIndex largeTextureIndex to remove
     * @returns boolean whether remove texture from atlas successfully
     * @zh 从图集中移除纹理
     * @param textureId 纹理ID
     * @param largeTextureIndex 大纹理索引，-1表示从所有大纹理中移除
     * @returns 是否移除成功
     */
    public removeTexture(textureId: number, largeTextureIndex: number = -1): boolean {
        if (this._isDestroyed) return false;

        let textureInfo = this._textureMap.get(textureId);
        if (!textureInfo) return false;

        this._largeTexManager.removeTexture(textureId, largeTextureIndex);
        this._textureMap.delete(textureId);
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
        let texture = Laya.loader.getRes(url, Loader.IMAGE) as Texture;
        if (!texture) return false;
        return this.removeTexture(texture.id, largeTextureIndex);
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

        let originalTexture = textureInfo.originalTexture;
        /** 保存原始uv */
        // textureInfo.originalUV = originalTexture.uv;
        /** 保存原始texture2d */
        // textureInfo.originalTexture2d = originalTexture.bitmap as Texture2D;

        let x = textureOut.texItem.x;
        let y = textureOut.texItem.y;
        let w = textureOut.texItem.w;
        let h = textureOut.texItem.h;
        let uvArray = Float32Array.from([x, y, x + w, y, x + w, y + h, x, y + h]);

        let orginWidth = originalTexture.width;
        let orginHeight = originalTexture.height;
        originalTexture.setTo(textureOut.texture, uvArray);
        originalTexture.width = orginWidth;
        originalTexture.height = orginHeight;

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
        return this.getTextureInfo(Laya.loader.getRes(url, Loader.TEXTURE2D).id) || null;
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
}
