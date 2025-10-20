import { Texture } from "../resource/Texture";

/**
 * @en Texture processor interface for dynamic atlas management
 * @zh 动态图集管理的纹理处理器接口
 */
export interface ITextureProcessor {
    /**
     * @en Add texture to dynamic atlas
     * @zh 添加纹理到动态图集
     * @param texture Texture to add
     */
    addTexture(texture: Texture): void;

    /**
     * @en Check if texture should be added to dynamic atlas
     * @zh 检查纹理是否应该添加到动态图集
     * @param texture Texture to check
     * @returns true if should be added
     */
    shouldAddToDynamicAtlas(texture: Texture): boolean;

    /**
     * @en Update dynamic atlas
     * @zh 更新动态图集
     */
    onUpdate(): void;

    /**
     * @en 
     */
    cleanupUnused(): void;
}

export class EmptyTextureProcessor implements ITextureProcessor {
    addTexture(texture: Texture): void {
        // do nothing
    }
    onUpdate(): void {
        // do nothing
    }
    shouldAddToDynamicAtlas(texture: Texture): boolean {
        return false;
    }
    cleanupUnused(): void {
        // do nothing
    }
}