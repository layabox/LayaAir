import type { Transform3D } from "../../../../d3/core/Transform3D";
import type { Vector2 } from "../../../../maths/Vector2";
import type { Vector3 } from "../../../../maths/Vector3";
import type { Material } from "../../../../resource/Material";

/** @internal @en Component input copied into the backend store. @zh 复制到后端存储的组件输入。 */
export interface DecalProjectorSettings {
    material: Material;
    size: Vector3;
    pivot: Vector3;
    uvScale: Vector2;
    uvOffset: Vector2;
    drawDistance: number;
    fadeScale: number;
    fadeFactor: number;
    startAngleFade: number;
    endAngleFade: number;
    sortOrder: number;
    layer: number;
}

/** @internal @en Scene-owned decal backend. IDs are local to this manager. @zh 场景持有的贴花后端，ID 在管理器内有效。 */
export abstract class DecalManager {
    abstract add(transform: Transform3D, settings: DecalProjectorSettings): number;
    abstract update(id: number, settings: DecalProjectorSettings): void;
    abstract invalidateTransform(id: number): void;
    abstract remove(id: number): void;
    abstract destroy(): void;
}
