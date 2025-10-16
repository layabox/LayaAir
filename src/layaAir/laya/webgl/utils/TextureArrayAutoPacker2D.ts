import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { Texture2DArray } from "../../resource/Texture2DArray";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";

type Group = {
    array: Texture2DArray,
    nextLayer: number,
    capacity: number,
    width: number,
    height: number,
    format: TextureFormat,
};

/**
 * @en Minimal auto packer: lazily creates Texture2DArray buckets per (w,h,format) and
 *    fills layers using CPU pixels if available; returns {array, layer}.
 * @zh 最小自动打包器：按 (宽,高,格式) 分桶，若可读取像素则懒创建 Texture2DArray 并写入层，返回 {array, layer}。
 */
export class TextureArrayAutoPacker2D {
    private static _groups: Map<string, Group> = new Map();

    /**
     * @returns null 表示无法自动打包（缺少像素等），调用方应走原路径。
     */
    static packIfPossible(tex: Texture): { array: Texture2DArray, layer: number } | null {
        if (!(tex instanceof Texture)) return null;
        const bmp = tex.bitmap as Texture2D;
        if (!(bmp instanceof Texture2D)) return null;

        const width = tex.width;
        const height = tex.height;
        const format = bmp.format as TextureFormat;

        // 读取像素：要求 Texture2D 构建时 canRead=true，否则返回 null
        const pixels = tex.getTexturePixels(0, 0, width, height);
        if (!pixels) return null;

        const key = `${width}x${height}_${format}`;
        let group = this._groups.get(key);
        if (!group) {
            // 初始容量（简化处理，可按需调整/扩展）
            const capacity = 16;
            const sRGB = bmp.gammaSpace; // 依据源纹理色域
            const arr = new Texture2DArray(width, height, capacity, format, false, false, sRGB);
            group = { array: arr, nextLayer: 0, capacity, width, height, format };
            this._groups.set(key, group);
        }

        if (group.nextLayer >= group.capacity) return null; // 满了：简化为不扩容

        const layer = group.nextLayer++;
        // 写入层数据
        group.array.setSubPixelsData(0, 0, layer, width, height, 1, pixels, 0, false, false, false);

        return { array: group.array, layer };
    }
}


