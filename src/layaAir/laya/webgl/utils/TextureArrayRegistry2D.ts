import { BaseTexture } from "../../resource/BaseTexture";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { RenderTexture2DArray } from "../../resource/RenderTexture2DArray";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { LayaGL } from "../../layagl/LayaGL";

export interface TextureArrayLayerAllocation {
    array: BaseTexture;
    sharedRT: RenderTexture2DArray;
    layer: number;
    texture: Texture;
    uploadSubPixels(x: number, y: number, w: number, h: number, pixels: ArrayBufferView, mipLevel?: number): void;
    release(): void;
}

type TextureArrayLayerRecord = TextureArrayLayerAllocation & {
    groupKey: string;
    refs: number;
    released: boolean;
};

type TextureArrayBucket = {
    sharedRT: RenderTexture2DArray;
    nextLayer: number;
    capacity: number;
    freeLayers: number[];
    usedLayers: Set<number>;
};

/**
 * Registry that maps ordinary 2D texture handles to a shared Texture2DArray
 * render target layer.
 */
export class TextureArrayRegistry2D {
    private static _idToRecord: Map<number, TextureArrayLayerRecord> = new Map();
    private static _groupKeyToArray: Map<string, TextureArrayBucket> = new Map();

    static clear(): void {
        this._idToRecord.clear();
        this._groupKeyToArray.forEach(group => {
            group.sharedRT.lock = false;
            group.sharedRT.destroy();
        });
        this._groupKeyToArray.clear();
    }

    static register(source: Texture | BaseTexture | Texture2D, allocation: TextureArrayLayerAllocation): void {
        const id = this._getTexId(source);
        if (id == null) return;

        const record = allocation as TextureArrayLayerRecord;
        const oldRecord = this._idToRecord.get(id);
        if (oldRecord === record)
            return;
        if (oldRecord)
            this.unregister(source);

        this._idToRecord.set(id, record);
        record.refs++;
    }

    static unregister(source: Texture | BaseTexture | Texture2D): void {
        const id = this._getTexId(source);
        if (id == null) return;

        const record = this._idToRecord.get(id);
        if (!record) return;

        this._idToRecord.delete(id);
        record.refs--;
        if (record.refs <= 0)
            this._releaseRecord(record);
    }

    static resolve(source: Texture | BaseTexture | Texture2D): TextureArrayLayerAllocation | null {
        const id = this._getTexId(source);
        if (id == null) return null;
        return this._idToRecord.get(id) || null;
    }

    /**
     * Allocate one layer from a shared RenderTexture2DArray bucket.
     */
    static allocateLayerAsTexture(width: number, height: number, format: TextureFormat | RenderTargetFormat = TextureFormat.R8G8B8A8,
        capacity: number = 64, sRGB: boolean = false, depthStencilFormat: RenderTargetFormat = RenderTargetFormat.None,
        generateMipmap: boolean = false): TextureArrayLayerAllocation {
        const key = `${width}x${height}_${format}_${depthStencilFormat}_${generateMipmap ? 1 : 0}_${sRGB ? 1 : 0}`;
        let group = this._groupKeyToArray.get(key);
        if (!group) {
            const sharedRT = new RenderTexture2DArray(width, height, capacity, <RenderTargetFormat><any>format, depthStencilFormat, generateMipmap, 1, sRGB);
            sharedRT.lock = true;
            group = { sharedRT, nextLayer: 0, capacity, freeLayers: [], usedLayers: new Set() };
            this._groupKeyToArray.set(key, group);
        }

        let layer: number;
        if (group.freeLayers.length > 0) {
            layer = group.freeLayers.pop();
        } else {
            if (group.nextLayer >= group.capacity) return null;
            layer = group.nextLayer++;
        }
        group.usedLayers.add(layer);

        const virtualTex = new Texture(group.sharedRT);
        const uploadSubPixels = (x: number, y: number, w: number, h: number, pixels: ArrayBufferView, mipLevel: number = 0) => {
            LayaGL.textureContext.setTexture3DSubPixelsData(group.sharedRT._texture, pixels, mipLevel, false, x, y, layer, w, h, 1, false, false);
        };

        const record: TextureArrayLayerRecord = {
            array: group.sharedRT,
            sharedRT: group.sharedRT,
            layer,
            texture: virtualTex,
            uploadSubPixels,
            release: () => this._releaseRecord(record),
            groupKey: key,
            refs: 0,
            released: false
        };

        return record;
    }

    private static _getTexId(source: Texture | BaseTexture | Texture2D): number | null {
        if (!source)
            return null;
        if (source instanceof Texture) {
            const bmp = source.bitmap;
            return bmp?._id ?? null;
        }
        if (typeof source.id === "number") return source.id;
        return null;
    }

    private static _releaseRecord(record: TextureArrayLayerRecord): void {
        if (record.released)
            return;

        record.released = true;
        this._idToRecord.forEach((value, id) => {
            if (value === record)
                this._idToRecord.delete(id);
        });
        record.refs = 0;
        record.texture.destroy();

        const group = this._groupKeyToArray.get(record.groupKey);
        if (!group)
            return;

        group.usedLayers.delete(record.layer);
        if (group.usedLayers.size === 0) {
            this._groupKeyToArray.delete(record.groupKey);
            group.sharedRT.lock = false;
            group.sharedRT.destroy();
        } else {
            group.freeLayers.push(record.layer);
        }
    }
}
