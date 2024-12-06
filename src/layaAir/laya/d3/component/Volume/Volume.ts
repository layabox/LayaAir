import { Component } from "../../../components/Component";
import { BaseRender } from "../../core/render/BaseRender";
import { Sprite3D } from "../../core/Sprite3D";
import { Bounds } from "../../math/Bounds";
import { VolumeManager } from "./VolumeManager";
import { Event } from "../../../events/Event";
import { Scene3D } from "../../core/scene/Scene3D";
import { Vector3 } from "../../../maths/Vector3";

/**
 * @en Enum representing the types of intersection between volumes.
 * @zh 表示体积之间相交类型的枚举。
 */
export enum volumeIntersectType {
    /**
     * @en One volume contains the other.
     * @zh 一个体积包含另一个体积。
     */
    contain,
    /**
     * @en Volumes intersect but do not fully contain each other.
     * @zh 体积相交但不完全包含彼此。
     */
    intersect,
    /**
     * @en Volumes are disjoint (do not intersect).
     * @zh 体积不相交（互不相交）。
     */
    Disjoint
}

/**
 * @en Represents the intersection properties between volume.
 * @zh 表示物体的相交属性。
 */
export class volumeIntersectInfo {
    /**
     * @en Intersection Type
     * @zh 相交类型 
     */
    type: volumeIntersectType;
    /**
     * @en Intersection ratio
     * @zh 相交比例
     */
    intersectRate: number;
}

/**
 * @en Represents a volume component in the scene.
 * @zh 表示场景中的体积组件。
 */
export class Volume extends Component {
    /**@internal */
    protected _primitiveBounds: Bounds;
    /** @internal @protected 包围盒 */
    protected _bounds: Bounds;
    /**@internal @protected cache number of around Volume */
    protected _aroundVolumeCacheNum: number = 0;
    /** @internal @protected around Volume */
    protected _aroundVolume: Volume[];
    /** @internal @protected volume manager */
    protected _volumeManager: VolumeManager;
    /** @internal @protected volume intersect Comonent */
    protected _type: number;
    /** @internal @protected 重要性 */
    protected _importance: number;

    /**
     * @en constractor of Volume 
     * @zh 体积组件的构造函数。
     */
    constructor() {
        super();
        this._bounds = new Bounds();
        this._primitiveBounds = new Bounds();
        this._importance = 0;
        this.runInEditor = true;
    }

    /**
     * @en The volume type.
     * @zh 体积类型。
     */
    get type() {
        return this._type;
    }

    /**
     * @internal
     * @en The bounds of the volume.
     * @zh 体积的边界。
     */
    get bounds(): Bounds {
        return this._bounds;
    }

    /**
     * @en The maximum point of the volume component's own bounding box.
     * @zh 体积组件自身包围盒的最大点。
     */
    get boundsMax(): Vector3 {
        return this._primitiveBounds.getMax();
    }

    set boundsMax(value: Vector3) {
        this._primitiveBounds.setMax(value);
        this._reCaculateBoundBox();
    }

    /**
     * @en The minimum point of the volume component's own bounding box.
     * @zh 体积组件自身包围盒的最小点。
     */
    get boundsMin(): Vector3 {
        return this._primitiveBounds.getMin();
    }

    set boundsMin(value: Vector3) {
        this._primitiveBounds.setMin(value);
        this._reCaculateBoundBox();
    }

    /**
     * @en The probe position of the volume.
     * @zh 体积的探针位置。
     */
    get probePosition(): Vector3 {
        return (this.owner as Sprite3D).transform.position;
    }

    /**
     * @en The importance value of the volume probe.
     * @zh 体积探针的重要度。
     */
    get importance() {
        return this._importance;
    }

    set importance(value: number) {
        this._importance = value;
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onEnable(): void {
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._VolumeChange);
        this._volumeManager = ((this.owner as Sprite3D).scene as Scene3D)._volumeManager;
        this._volumeManager.add(this);
        this._reCaculateBoundBox();
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onDisable(): void {
        (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._VolumeChange);
        this._volumeManager.remove(this);
    }

    /**
     * @internal
     * @en Called when a render node enters the volume.
     * @param renderNode The BaseRender node entering the volume.
     * @zh 当一个渲染节点进入体积时调用。
     * @param renderNode 进入体积的BaseRender节点。
     */
    _addRenderNode?(renderNode: BaseRender): void;

    /**
     * @internal
     * @en Called when a render node is removed from the volume.
     * @param renderNode The BaseRender node being removed from the volume.
     * @zh 当一个渲染节点从体积中移除时调用。
     * @param renderNode 从体积中移除的BaseRender节点。
     */
    _removeRenderNode?(renderNode: BaseRender): void;

    /**
     * @internal
     * @en Called when a render node moves within the volume.
     * @param renderNode The BaseRender node moving within the volume.
     * @zh 当一个渲染节点在体积中移动时调用。
     * @param renderNode 在体积中移动的BaseRender节点。
     */
    _motionInVolume?(renderNode: BaseRender): void;

    /**
     * @internal
     * @en Handles volume changes.
     * @zh 处理体积变化。
     */
    _VolumeChange() {
        this._volumeManager._needUpdateAllRender = true;
        let reManager = this._volumeManager._regVolumeManager[this.type];
        if (reManager) {
            reManager._needUpdateAllRender = true;
        }
        this._reCaculateBoundBox();
    }

    /**
     * @internal
     */
    _reCaculateBoundBox() {
        this.owner && this._primitiveBounds._tranform((this.owner as Sprite3D).transform.worldMatrix, this._bounds);
    }
}