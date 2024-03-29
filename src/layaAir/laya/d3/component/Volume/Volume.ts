import { Component } from "../../../components/Component";
import { BaseRender } from "../../core/render/BaseRender";
import { Sprite3D } from "../../core/Sprite3D";
import { Bounds } from "../../math/Bounds";
import { VolumeManager } from "./VolumeManager";
import { Event } from "../../../events/Event";
import { Scene3D } from "../../core/scene/Scene3D";
import { Vector3 } from "../../../maths/Vector3";

export enum volumeIntersectType {
    /**包含 */
    contain,
    /**相交 */
    intersect,
    /**不相交*/
    Disjoint
}

/**
 * 物体于Volume的相交属性
 */
export class volumeIntersectInfo {
    type: volumeIntersectType;
    /**相交比例 */
    intersectRate: number;
}

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
     * 创建一个<code>Volume</code>实例
     */
    constructor() {
        super();
        this._bounds = new Bounds();
        this._primitiveBounds = new Bounds();
        this._importance = 0;
        this.runInEditor = true;
    }

    /**
     * volume Type
     */
    get type() {
        return this._type;
    }

    /**
     * @internal
     */
    get bounds(): Bounds {
        return this._bounds;
    }

    get boundsMax(): Vector3 {
        return this._primitiveBounds.getMax();
    }

    /**
     * primitive包围盒max
     */
    set boundsMax(value: Vector3) {
        this._primitiveBounds.setMax(value);
        this._reCaculateBoundBox();
    }

    /**
     * primitiveBoxMax
     */
    set boundsMin(value: Vector3) {
        this._primitiveBounds.setMin(value);
        this._reCaculateBoundBox();
    }

    get boundsMin(): Vector3 {
        return this._primitiveBounds.getMin();
    }

    /**
     * 探针位置
     */
    get probePosition(): Vector3 {
        return (this.owner as Sprite3D).transform.position;
    }

    /**
     * 体积块探针重要度
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
     * 当一个渲染节点进入体积
     * @param renderNode 
     */
    _addRenderNode?(renderNode: BaseRender): void;

    /**
     * @internal
     * 当一个渲染节点移除体积
     * @param renderNode    
     */
    _removeRenderNode?(renderNode: BaseRender): void;

    /**
     * @internal
     * 当一个渲染节点在体积中移动
     * @param renderNode 
     */
    _motionInVolume?(renderNode: BaseRender): void;


    /**
     * @internal
     * Volume change
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

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: Volume): void {
    }

}