import { Component } from "../../components/Component";
import { Event } from "../../events/Event";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import type { DecalManager, DecalProjectorSettings } from "../../RenderDriver/RenderModuleData/Design/3D/DecalManager";
import { Material } from "../../resource/Material";
import { Sprite3D } from "../core/Sprite3D";
import { DecalShaderInit } from "../shader/decal/DecalShaderInit";

/**
 * @en Projects a decal material along the owner's local positive Z axis. Rendering is selected by Camera.decalMode.
 * @zh 沿节点本地 Z 正方向投射贴花材质，渲染方式由 Camera.decalMode 选择。
 */
export class DecalProjector extends Component {
    declare readonly owner: Sprite3D;

    private readonly _settings: DecalProjectorSettings = {
        material: null,
        size: new Vector3(1, 1, 1),
        pivot: new Vector3(0, 0, 0.5),
        uvScale: new Vector2(1, 1),
        uvOffset: new Vector2(),
        drawDistance: 100,
        fadeScale: 0.9,
        fadeFactor: 1,
        startAngleFade: 80,
        endAngleFade: 90,
        sortOrder: 0,
        layer: 0
    };
    private _manager: DecalManager;
    private _decalID = 0;

    constructor() {
        super();
        this.runInEditor = true;
        const { size, pivot, uvScale, uvOffset } = this._settings;
        const update = () => this._updateSettings();
        watchVector(size, update);
        watchVector(pivot, update);
        watchVector(uvScale, update);
        watchVector(uvOffset, update);
    }

    /** @en Shared material whose shader is classified as Decal. @zh Shader 类型标记为 Decal 的共享贴花材质。 */
    get material(): Material { return this._settings.material; }
    set material(value: Material) {
        const previous = this._settings.material;
        if (value === previous) return;
        if (value) DecalShaderInit.validate(value.shader);
        value?._addReference();
        this._settings.material = value;
        this._updateSettings();
        previous?._removeReference();
    }

    /** @en Local width, height and projection depth. Zero dimensions disable projection. @zh 本地宽、高和投射深度，尺寸为零时不投射。 */
    get size(): Vector3 { return this._settings.size; }
    set size(value: Vector3) {
        if (!value || !isFinite(value.x) || !isFinite(value.y) || !isFinite(value.z) || value.x < 0 || value.y < 0 || value.z < 0)
            throw new RangeError("DecalProjector.size must contain finite non-negative dimensions.");
        value.cloneTo(this._settings.size);
    }

    /** @en Local offset of the projection box center. @zh 投射盒中心相对节点的本地偏移。 */
    get pivot(): Vector3 { return this._settings.pivot; }
    set pivot(value: Vector3) {
        if (!value || !isFinite(value.x) || !isFinite(value.y) || !isFinite(value.z))
            throw new RangeError("DecalProjector.pivot must be finite.");
        value.cloneTo(this._settings.pivot);
    }

    /** @en Per-projector UV scale, useful for atlas selection. @zh 实例 UV 缩放，可用于图集选区。 */
    get uvScale(): Vector2 { return this._settings.uvScale; }
    set uvScale(value: Vector2) {
        if (!value || !isFinite(value.x) || !isFinite(value.y)) throw new RangeError("DecalProjector.uvScale must be finite.");
        value.cloneTo(this._settings.uvScale);
    }

    /** @en Per-projector UV offset. @zh 实例 UV 偏移。 */
    get uvOffset(): Vector2 { return this._settings.uvOffset; }
    set uvOffset(value: Vector2) {
        if (!value || !isFinite(value.x) || !isFinite(value.y)) throw new RangeError("DecalProjector.uvOffset must be finite.");
        value.cloneTo(this._settings.uvOffset);
    }

    /** @en Maximum camera distance, in world units. @zh 世界空间中的最大绘制距离。 */
    get drawDistance(): number { return this._settings.drawDistance; }
    set drawDistance(value: number) {
        if (!isFinite(value) || value < 0) throw new RangeError("DecalProjector.drawDistance must be finite and non-negative.");
        this._settings.drawDistance = value;
        this._updateSettings();
    }

    /** @en Fraction of drawDistance at which distance fading starts. @zh 距离淡出起点占最大绘制距离的比例。 */
    get fadeScale(): number { return this._settings.fadeScale; }
    set fadeScale(value: number) {
        this._settings.fadeScale = unitValue(value, "fadeScale");
        this._updateSettings();
    }

    /** @en Overall projector opacity. @zh 实例整体影响权重。 */
    get fadeFactor(): number { return this._settings.fadeFactor; }
    set fadeFactor(value: number) {
        this._settings.fadeFactor = unitValue(value, "fadeFactor");
        this._updateSettings();
    }

    /** @en Angle in degrees at which grazing-surface fading starts. @zh 表面倾角开始淡出的角度，单位为度。 */
    get startAngleFade(): number { return this._settings.startAngleFade; }
    set startAngleFade(value: number) {
        this._settings.startAngleFade = angleValue(value);
        this._updateSettings();
    }

    /** @en Angle in degrees at which grazing-surface fading completes. Set both angles to 180 to disable angle fading. @zh 表面倾角完全淡出的角度；两个角度均为 180 时禁用角度淡出。 */
    get endAngleFade(): number { return this._settings.endAngleFade; }
    set endAngleFade(value: number) {
        this._settings.endAngleFade = angleValue(value);
        this._updateSettings();
    }

    /**
     * @en Render group. Higher groups draw later. Draw order inside a group follows batching and is unspecified.
     * @zh 绘制组，数值越大越后绘制。组内按合批提交，叠加顺序不固定。
     */
    get sortOrder(): number { return this._settings.sortOrder; }
    set sortOrder(value: number) {
        if (!isFinite(value)) throw new RangeError("DecalProjector.sortOrder must be finite.");
        this._settings.sortOrder = value;
        this._updateSettings();
    }

    protected _onEnable(): void {
        if (this.owner instanceof Sprite3D) {
            this._manager = this.owner.scene?.sceneRenderableManager._decalManager;
            if (this._manager) {
                this._settings.layer = this.owner.layer;
                this._decalID = this._manager.add(this.owner.transform, this._settings);
                this.owner.on(Event.LAYER_CHANGE, this, this._onLayerChange);
                this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
            }
        }
        super._onEnable();
    }

    protected _onDisable(): void {
        if (this._manager) {
            this.owner.off(Event.LAYER_CHANGE, this, this._onLayerChange);
            this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
            this._manager.remove(this._decalID);
            this._manager = null;
            this._decalID = 0;
        }
        super._onDisable();
    }

    protected _onDestroy(): void {
        this.material = null;
        super._onDestroy();
    }

    private _onLayerChange(layer: number): void {
        this._settings.layer = layer;
        this._updateSettings();
    }

    private _onTransformChanged(): void { this._manager?.invalidateTransform(this._decalID); }
    private _updateSettings(): void { this._manager?.update(this._decalID, this._settings); }

    /** @internal */
    _cloneTo(dest: DecalProjector): void {
        super._cloneTo(dest);
        dest.material = this.material;
        dest.size = this.size;
        dest.pivot = this.pivot;
        dest.uvScale = this.uvScale;
        dest.uvOffset = this.uvOffset;
        dest.drawDistance = this.drawDistance;
        dest.fadeScale = this.fadeScale;
        dest.fadeFactor = this.fadeFactor;
        dest.startAngleFade = this.startAngleFade;
        dest.endAngleFade = this.endAngleFade;
        dest.sortOrder = this.sortOrder;
        dest.enabled = this.enabled;
    }
}

function unitValue(value: number, name: string): number {
    if (!isFinite(value)) throw new RangeError("DecalProjector." + name + " must be finite.");
    return Math.min(1, Math.max(0, value));
}

function angleValue(value: number): number {
    if (!isFinite(value)) throw new RangeError("DecalProjector angle must be finite.");
    return Math.min(180, Math.max(0, value));
}

// Keep mutable vectors and push edits to the store. 保留向量原地修改，变更同步到数值存储。
function watchVector(vector: Vector2 | Vector3, update: () => void): void {
    for (const axis of ["x", "y", "z"] as const) {
        if (!(axis in vector)) continue;
        let value = (vector as Vector3)[axis];
        Object.defineProperty(vector, axis, {
            configurable: true,
            enumerable: true,
            get: () => value,
            set: (next: number) => {
                if (next === value) return;
                value = next;
                update();
            }
        });
    }
}
