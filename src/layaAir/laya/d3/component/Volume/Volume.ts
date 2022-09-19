import { Component } from "../../../components/Component";
import { BaseRender } from "../../core/render/BaseRender";
import { Sprite3D } from "../../core/Sprite3D";
import { Bounds } from "../../math/Bounds";
import { Vector3 } from "../../math/Vector3";
import { VolumeManager } from "./VolumeManager";
import { Event } from "../../../events/Event";

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

/**
 * @internal
 */
export class Volume extends Component {
    /** 包围盒 */
    protected _bounds: Bounds;
    /**cache number of around Volume */
    protected _aroundVolumeCacheNum: number = 0;
    /** around Volume */
    protected _aroundVolume: Volume[];
    /** volume manager */
    protected _volumeManager: VolumeManager;
    /** volume intersect Comonent */
    protected _type: number;
    /** 重要性 */
    protected _importance: number;


    /**
     * 创建一个<code>Volume</code>实例
     */
    constructor() {
        super();
        this._bounds = new Bounds();
        this._importance = 0;
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
    set bounds(value: Bounds) {
        this._bounds = value;
    }

    get boundsMax(): Vector3 {
        return this._bounds.getMax();
    }

    get boundsMin(): Vector3 {
        return this._bounds.getMin();
    }

    get probePosition(): Vector3 {
        return (this.owner as Sprite3D).transform.position;
    }

    get importance() {
        return this._importance;
    }

    set importance(value: number) {
        this._importance = value;
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onEnable(): void {
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this._VolumeChange);
        this._volumeManager = (this.owner as Sprite3D).scene.volumeManager;
        this._volumeManager.add(this);
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onDisable(): void {
        (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this._VolumeChange);
        this._volumeManager.remove(this);
    }

    /**
     * 当一个渲染节点进入体积
     * @param renderNode 
     */
    _addRenderNode?(renderNode: BaseRender): void;

    /**
     * 当一个渲染节点移除体积
     * @param renderNode    
     */
    _removeRenderNode?(renderNode: BaseRender): void;

    /**
     * 当一个渲染节点在体积中移动
     * @param renderNode 
     */
    _motionInVolume?(renderNode: BaseRender): void;


    _VolumeChange() {
        this._volumeManager._needUpdateAllRender = true;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: Volume): void {
    }

}