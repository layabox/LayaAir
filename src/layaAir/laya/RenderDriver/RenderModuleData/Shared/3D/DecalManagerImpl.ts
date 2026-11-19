import type { Transform3D } from "../../../../d3/core/Transform3D";
import type { BoundFrustum } from "../../../../d3/math/BoundFrustum";
import type { Plane } from "../../../../d3/math/Plane";
import { DecalShaderInit } from "../../../../d3/shader/decal/DecalShaderInit";
import type { Vector3 } from "../../../../maths/Vector3";
import type { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import type { Material } from "../../../../resource/Material";
import { DecalDataBuffer, DecalField } from "../../Design/3D/DecalDataBuffer";
import { DecalManager, type DecalProjectorSettings } from "../../Design/3D/DecalManager";

// Hot cull fields are packed separately from draw inputs. 裁剪热数据与绘制输入分开存放。
const enum CullField {
    Words = 12, Center = 0, Extent = 3, Limit = 6, FadeWidth = 7, Opacity = 8, Mask = 9, Flags = 10
}
const enum CullFlags { Valid = 1, Mirrored = 2 }

interface DecalBatch {
    first: number;
    last: number;
    count: number;
    mirrored: boolean;
}

class DecalGroup {
    order: number;
    readonly lookup = new Map<number, DecalBatch>();
    readonly batches: DecalBatch[] = [];
}

/** @internal @en Shared decal collection for 3D render drivers. @zh 3D 渲染驱动共用的贴花收集器。 */
export class DecalManagerImpl extends DecalManager {
    private _data = new DecalDataBuffer();
    private readonly _transforms: Transform3D[] = [];
    private readonly _materials: Material[] = [];
    private readonly _dirty = new Set<number>();
    private readonly _validatedShaders = new WeakSet<Shader3D>();
    private _cull = new Float32Array(0);
    private _cullBits = new Uint32Array(this._cull.buffer);
    private _matrices = new Float32Array(0);
    private _next = new Int32Array(0);
    private _fade = new Float32Array(0);
    private readonly _planes = new Float64Array(6 * 4);
    private readonly _groups = new Map<number, DecalGroup>();
    private readonly _groupPool: DecalGroup[] = [];
    private readonly _batchPool: DecalBatch[] = [];
    private readonly _orderedGroups: DecalGroup[] = [];
    private readonly _batches: DecalBatch[] = [];

    add(transform: Transform3D, settings: DecalProjectorSettings): number {
        const id = this._data.add();
        this._ensureCapacity();
        const slot = this._data.slotOf(id);
        this._transforms[slot] = transform;
        this.update(id, settings);
        this._dirty.add(id);
        return id;
    }

    update(id: number, settings: DecalProjectorSettings): void {
        const slot = this._data?.slotOf(id) ?? -1;
        if (slot < 0) return;
        if (this._data.write(slot, settings)) this._dirty.add(id);
        this._materials[slot] = settings.material;
    }

    invalidateTransform(id: number): void {
        if ((this._data?.slotOf(id) ?? -1) >= 0) this._dirty.add(id);
    }

    remove(id: number): void {
        const slot = this._data?.remove(id) ?? -1;
        if (slot < 0) return;
        const last = this._data.count;
        if (slot !== last) {
            this._transforms[slot] = this._transforms[last];
            this._materials[slot] = this._materials[last];
            this._cullBits.copyWithin(slot * CullField.Words, last * CullField.Words, (last + 1) * CullField.Words);
            this._matrices.copyWithin(slot * 16, last * 16, (last + 1) * 16);
        }
        this._dirty.delete(id);
        this._transforms.length = this._materials.length = last;
    }

    destroy(): void {
        this._data = null;
        this._transforms.length = this._materials.length = 0;
        this._dirty.clear();
        this._cull = new Float32Array(0);
        this._cullBits = new Uint32Array(this._cull.buffer);
        this._matrices = this._fade = new Float32Array(0);
        this._next = new Int32Array(0);
        this._groups.clear();
        this._orderedGroups.length = this._batches.length = this._groupPool.length = this._batchPool.length = 0;
    }

    /**
     * @en Result slots are valid until the next collection or record change. Only draw groups are sorted.
     * @zh 结果槽位有效至下次收集或记录变动。仅对绘制组排序。
     */
    collect(mask: number, frustum: BoundFrustum, position: Vector3, maxInstances: number): readonly DecalBatch[] {
        this._groups.clear();
        this._orderedGroups.length = this._batches.length = 0;
        const data = this._data;
        if (!data?.count) return this._batches;
        for (const id of this._dirty) this._refreshBounds(data.slotOf(id));
        this._dirty.clear();

        this._setPlane(0, frustum.near);
        this._setPlane(4, frustum.left);
        this._setPlane(8, frustum.right);
        this._setPlane(12, frustum.bottom);
        this._setPlane(16, frustum.top);
        this._setPlane(20, frustum.far);
        let usedBatches = 0;
        for (let slot = 0, base = 0; slot < data.count; slot++, base += CullField.Words) {
            const flags = this._cullBits[base + CullField.Flags];
            if (!(flags & CullFlags.Valid) || !(mask & this._cullBits[base + CullField.Mask])) continue;
            const x = this._cull[base], y = this._cull[base + 1], z = this._cull[base + 2];
            const dx = position.x - x, dy = position.y - y, dz = position.z - z;
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            const limit = this._cull[base + CullField.Limit];
            if (distanceSquared >= limit * limit || !this._intersects(base, x, y, z)) continue;
            const material = this._materials[slot];
            if (!material || material.destroyed) continue;
            const shader = material.shader;
            if (!this._validatedShaders.has(shader)) {
                DecalShaderInit.validate(shader);
                this._validatedShaders.add(shader);
            }
            const fade = this._cull[base + CullField.Opacity] * Math.min(1,
                (limit - Math.sqrt(distanceSquared)) / this._cull[base + CullField.FadeWidth]);
            if (!(fade > 0)) continue;
            this._fade[slot] = fade;
            this._next[slot] = -1;

            const order = data.f64[slot * (DecalField.Words / 2)];
            let group = this._groups.get(order);
            if (!group) {
                const index = this._orderedGroups.length;
                group = this._groupPool[index] ??= new DecalGroup();
                group.order = order;
                group.lookup.clear();
                group.batches.length = 0;
                this._groups.set(order, group);
                this._orderedGroups.push(group);
            }
            const mirrored = !!(flags & CullFlags.Mirrored);
            const key = data.u32[slot * DecalField.Words + DecalField.Material] * 2 + Number(mirrored);
            let batch = group.lookup.get(key);
            if (!batch || batch.count === maxInstances) {
                batch = this._batchPool[usedBatches] ??= { first: 0, last: 0, count: 0, mirrored: false };
                usedBatches++;
                batch.first = slot;
                batch.count = 0;
                batch.mirrored = mirrored;
                group.lookup.set(key, batch);
                group.batches.push(batch);
            } else {
                this._next[batch.last] = slot;
            }
            batch.last = slot;
            batch.count++;
        }
        this._orderedGroups.sort((a, b) => a.order - b.order);
        for (const group of this._orderedGroups) {
            for (const batch of group.batches) this._batches.push(batch);
        }
        return this._batches;
    }

    materialAt(slot: number): Material { return this._materials[slot]; }

    copyInstance(slot: number, matrix: Float32Array, uv: Float32Array, params: Float32Array, offset: number): number {
        const matrixBase = slot * 16;
        for (let i = 0; i < 16; i++) matrix[i] = this._matrices[matrixBase + i];
        const f = this._data.f32, base = slot * DecalField.Words;
        for (let i = 0; i < 4; i++) uv[offset + i] = f[base + DecalField.UVScale + i];
        const a = f[base + DecalField.StartAngle], b = f[base + DecalField.EndAngle];
        params[offset] = this._fade[slot];
        params[offset + 1] = Math.cos(Math.min(a, b) * Math.PI / 180);
        params[offset + 2] = Math.cos(Math.max(a, b) * Math.PI / 180);
        return this._next[slot];
    }

    private _ensureCapacity(): void {
        const capacity = this._data.capacity;
        if (this._next.length === capacity) return;
        const cull = new Uint32Array(capacity * CullField.Words);
        const matrices = new Float32Array(capacity * 16);
        cull.set(this._cullBits);
        matrices.set(this._matrices);
        this._cull = new Float32Array(cull.buffer);
        this._cullBits = cull;
        this._matrices = matrices;
        this._next = new Int32Array(capacity);
        this._fade = new Float32Array(capacity);
    }

    private _refreshBounds(slot: number): void {
        const data = this._data, f = data.f32, base = slot * DecalField.Words, c = slot * CullField.Words;
        this._cullBits[c + CullField.Flags] = 0;
        const sx = f[base + DecalField.Size], sy = f[base + DecalField.Size + 1], sz = f[base + DecalField.Size + 2];
        const opacity = f[base + DecalField.FadeFactor], drawDistance = f[base + DecalField.DrawDistance];
        if (sx <= 0 || sy <= 0 || sz <= 0 || opacity <= 0 || drawDistance <= 0) return;
        const px = f[base + DecalField.Pivot], py = f[base + DecalField.Pivot + 1], pz = f[base + DecalField.Pivot + 2];
        const source = this._transforms[slot].worldMatrix.elements, m = this._matrices, k = slot * 16;
        for (let i = 0; i < 3; i++) {
            m[k + i] = source[i] * sx;
            m[k + 4 + i] = source[4 + i] * sy;
            m[k + 8 + i] = source[8 + i] * sz;
            m[k + 12 + i] = source[i] * px + source[4 + i] * py + source[8 + i] * pz + source[12 + i];
        }
        m[k + 3] = m[k + 7] = m[k + 11] = 0;
        m[k + 15] = 1;
        const determinant = m[k] * (m[k + 5] * m[k + 10] - m[k + 6] * m[k + 9])
            - m[k + 4] * (m[k + 1] * m[k + 10] - m[k + 2] * m[k + 9])
            + m[k + 8] * (m[k + 1] * m[k + 6] - m[k + 2] * m[k + 5]);
        if (!isFinite(determinant) || Math.abs(determinant) < 1e-12) return;
        let radiusSquared = 0;
        for (let i = 0; i < 3; i++) {
            const extent = (Math.abs(m[k + i]) + Math.abs(m[k + 4 + i]) + Math.abs(m[k + 8 + i])) * 0.5;
            const center = m[k + 12 + i];
            if (!isFinite(extent) || !isFinite(center)) return;
            this._cull[c + CullField.Center + i] = center;
            this._cull[c + CullField.Extent + i] = extent;
            radiusSquared += extent * extent;
        }
        const limit = drawDistance + Math.sqrt(radiusSquared);
        this._cull[c + CullField.Limit] = limit;
        this._cull[c + CullField.FadeWidth] = Math.max(limit * (1 - f[base + DecalField.FadeScale]), 0.00001);
        this._cull[c + CullField.Opacity] = opacity;
        this._cullBits[c + CullField.Mask] = data.u32[base + DecalField.LayerMask];
        this._cullBits[c + CullField.Flags] = CullFlags.Valid | (determinant < 0 ? CullFlags.Mirrored : 0);
    }

    private _setPlane(base: number, plane: Plane): void {
        const p = this._planes;
        p[base] = plane.normal.x;
        p[base + 1] = plane.normal.y;
        p[base + 2] = plane.normal.z;
        p[base + 3] = plane.distance;
    }

    private _intersects(base: number, x: number, y: number, z: number): boolean {
        const ex = this._cull[base + CullField.Extent], ey = this._cull[base + CullField.Extent + 1], ez = this._cull[base + CullField.Extent + 2];
        const p = this._planes;
        for (let i = 0; i < 24; i += 4) {
            const nx = p[i], ny = p[i + 1], nz = p[i + 2];
            if (p[i + 3] + nx * (x + (nx < 0 ? -ex : ex))
                + ny * (y + (ny < 0 ? -ey : ey)) + nz * (z + (nz < 0 ? -ez : ez)) < 0) return false;
        }
        return true;
    }
}
