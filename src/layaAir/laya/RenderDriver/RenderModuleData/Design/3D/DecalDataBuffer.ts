import type { DecalProjectorSettings } from "./DecalManager";

/**
 * @internal
 * @en 80-byte input record: f64 order at byte 0, f32 fields at words 2–16, u32 fields at words 17–19.
 * @zh 输入记录固定为 80 字节：开头是 f64 绘制组，字 2–16 为 f32，字 17–19 为 u32。
 */
export const enum DecalField {
    Words = 20,
    Size = 2,
    Pivot = 5,
    UVScale = 8,
    UVOffset = 10,
    DrawDistance = 12,
    FadeScale = 13,
    FadeFactor = 14,
    StartAngle = 15,
    EndAngle = 16,
    LayerMask = 17,
    Material = 18,
    ID = 19
}

/**
 * @internal
 * @en Dense storage. An ID identifies the record and its transform binding, never its slot.
 * @zh 紧凑存储。ID 标识记录和变换绑定，不随槽位移动而改变。
 */
export class DecalDataBuffer {
    private readonly _slots = new Map<number, number>();
    private _lastID = 0;
    f32 = new Float32Array(0);
    u32 = new Uint32Array(this.f32.buffer);
    f64 = new Float64Array(this.f32.buffer);

    get count(): number { return this._slots.size; }
    get capacity(): number { return this.u32.length / DecalField.Words; }

    slotOf(id: number): number { return this._slots.get(id) ?? -1; }

    add(): number {
        if (this._lastID === 0xffffffff) throw new RangeError("Decal ID space exhausted.");
        const slot = this.count;
        if (slot === this.capacity) {
            const capacity = Math.max(16, this.capacity * 2);
            const buffer = new ArrayBuffer(capacity * DecalField.Words * 4);
            const u32 = new Uint32Array(buffer);
            u32.set(this.u32);
            this.f32 = new Float32Array(buffer);
            this.u32 = u32;
            this.f64 = new Float64Array(buffer);
        }
        const id = ++this._lastID;
        this._slots.set(id, slot);
        this.u32[slot * DecalField.Words + DecalField.ID] = id;
        return id;
    }

    remove(id: number): number {
        const slot = this.slotOf(id);
        if (slot < 0) return -1;
        const last = this.count - 1;
        this._slots.delete(id);
        if (slot !== last) {
            const from = last * DecalField.Words;
            this.u32.copyWithin(slot * DecalField.Words, from, from + DecalField.Words);
            this._slots.set(this.u32[from + DecalField.ID], slot);
        }
        return slot;
    }

    write(slot: number, settings: DecalProjectorSettings): boolean {
        const base = slot * DecalField.Words, f = this.f32, u = this.u32;
        const mask = (1 << settings.layer) >>> 0, { size, pivot, drawDistance, fadeScale, fadeFactor } = settings;
        const cullChanged = f[base + DecalField.Size] !== Math.fround(size.x) || f[base + DecalField.Size + 1] !== Math.fround(size.y)
            || f[base + DecalField.Size + 2] !== Math.fround(size.z) || f[base + DecalField.Pivot] !== Math.fround(pivot.x)
            || f[base + DecalField.Pivot + 1] !== Math.fround(pivot.y) || f[base + DecalField.Pivot + 2] !== Math.fround(pivot.z)
            || f[base + DecalField.DrawDistance] !== Math.fround(drawDistance) || f[base + DecalField.FadeScale] !== Math.fround(fadeScale)
            || f[base + DecalField.FadeFactor] !== Math.fround(fadeFactor) || u[base + DecalField.LayerMask] !== mask;
        this.f64[base / 2] = settings.sortOrder;
        f[base + DecalField.Size] = settings.size.x;
        f[base + DecalField.Size + 1] = settings.size.y;
        f[base + DecalField.Size + 2] = settings.size.z;
        f[base + DecalField.Pivot] = settings.pivot.x;
        f[base + DecalField.Pivot + 1] = settings.pivot.y;
        f[base + DecalField.Pivot + 2] = settings.pivot.z;
        f[base + DecalField.UVScale] = settings.uvScale.x;
        f[base + DecalField.UVScale + 1] = settings.uvScale.y;
        f[base + DecalField.UVOffset] = settings.uvOffset.x;
        f[base + DecalField.UVOffset + 1] = settings.uvOffset.y;
        f[base + DecalField.DrawDistance] = settings.drawDistance;
        f[base + DecalField.FadeScale] = settings.fadeScale;
        f[base + DecalField.FadeFactor] = settings.fadeFactor;
        f[base + DecalField.StartAngle] = settings.startAngleFade;
        f[base + DecalField.EndAngle] = settings.endAngleFade;
        u[base + DecalField.LayerMask] = mask;
        u[base + DecalField.Material] = settings.material?.id ?? 0;
        return cullChanged;
    }
}
