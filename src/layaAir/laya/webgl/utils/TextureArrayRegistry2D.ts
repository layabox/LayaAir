import { BaseTexture } from "../../resource/BaseTexture";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { Texture2DArray } from "../../resource/Texture2DArray";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";

/**
 * @en Minimal registry to map a 2D texture to a Texture2DArray layer.
 * @zh 最小注册表：将单张纹理映射到 Texture2DArray 的某一层。
 */
export class TextureArrayRegistry2D {
    private static _idToRecord: Map<number, { array: Texture2DArray, layer: number }> = new Map();
    private static _groupKeyToArray: Map<string, { array: Texture2DArray, nextLayer: number, capacity: number }> = new Map();

    static clear(): void {
        this._idToRecord.clear();
    }

    static register(source: Texture | BaseTexture | Texture2D, array: Texture2DArray, layer: number): void {
        const id = this._getTexId(source);
        if (id == null) return;
        this._idToRecord.set(id, { array, layer });
    }

    static unregister(source: Texture | BaseTexture | Texture2D): void {
        const id = this._getTexId(source);
        if (id == null) return;
        this._idToRecord.delete(id);
    }

    static resolve(source: Texture | BaseTexture | Texture2D) {
        const id = this._getTexId(source);
        if (id == null) return null;
        return this._idToRecord.get(id) || null;
    }

    /**
     * @en Allocate a layer from a Texture2DArray bucket and return a Texture facade bound to that layer.
     * @zh 从 Texture2DArray 分组中分配一层，并返回一个绑定该层的 Texture 句柄（已登记映射）。
     */
    static allocateLayerAsTexture(width: number, height: number, format: TextureFormat = TextureFormat.R8G8B8A8, capacity: number = 64, sRGB: boolean = false) {
        const key = `${width}x${height}_${format}_${sRGB ? 1 : 0}`;
        let group = this._groupKeyToArray.get(key);
        if (!group) {
            const array = new Texture2DArray(width, height, capacity, format, false, false, sRGB);
            group = { array, nextLayer: 0, capacity };
            this._groupKeyToArray.set(key, group);
        }
        if (group.nextLayer >= group.capacity) return null;
        const layer = group.nextLayer++;

        // 创建一个 Texture 句柄，bitmap 指向数组纹理，登记映射（绘制时自动替换并写层）
        const virtualTex = new Texture(group.array);
        this.register(virtualTex, group.array, layer);

        const uploadSubPixels = (x: number, y: number, w: number, h: number, pixels: ArrayBufferView, mipLevel: number = 0) => {
            group.array.setSubPixelsData(x, y, layer, w, h, 1, pixels, mipLevel, false, false, false);
        };

        return { texture: virtualTex, array: group.array, layer, uploadSubPixels };
    }

    private static _getTexId(source: Texture | BaseTexture | Texture2D): number | null {
        if (!source)
            return null;
        // Texture → Texture2D
        if (source instanceof Texture) {
            const bmp = source.bitmap as Texture2D;
            return bmp._id
        }
        // Texture2D / Texture2DArray → id
        if (typeof source.id === 'number') return source.id;
        // BaseTexture → try internal
        if ((source as any)?._texture && typeof (source as any)._texture.id === 'number') {
            return (source as any)._texture.id;
        }
        return null;
    }
}


