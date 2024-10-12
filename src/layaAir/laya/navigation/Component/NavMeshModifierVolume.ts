
import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Event } from "../../events/Event";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { NavigationManager } from "../NavigationManager";
import { NavMeshSurface } from "./NavMeshSurface";
import { NavigationUtils } from "../NavigationUtils";

const tempVec3 = new Vector3();
const tempVec31 = new Vector3();

/**
 * @en NavMeshModifierVolume is a component that modifies the navigation mesh in a specific volume.
 * @zh NavMeshModifierVolume 是一个在特定体积内修改导航网格的组件。
 */
export class NavMeshModifierVolume extends Component {
    /**@internal */
    _transfrom: Matrix4x4 = new Matrix4x4();
    /**@internal */
    _datas: Float32Array;

    /**@internal */
    _center: Vector3 = new Vector3();
    /**@internal */
    _size: Vector3 = new Vector3(1, 1, 1);


    /**@internal */
    _surface: Array<NavMeshSurface>;

    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;

    /**@internal */
    private _areaFlags: string = NavigationManager.defaltUnWalk;


    /**
     * @en The center of the modifier volume.
     * @zh 修改体积的中心点。
     */
    get center(): Vector3 {
        return this._center;
    }
    set center(value: Vector3) {
        value.cloneTo(this._center);
    }

    /**
     * @en The size of the modifier volume.
     * @zh 修改体积的大小。
     */
    get size(): Vector3 {
        return this._size;
    }
    set size(value: Vector3) {
        value.cloneTo(this._size);
    }

    /**
     * @en The agent type that this volume applies to.
     * @zh 该体积适用的代理类型。
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * @en The area flag for this volume.
     * @zh 该体积的区域标志。
     */
    set areaFlag(value: string) {
        this._areaFlags = value;
    }

    get areaFlag() {
        return this._areaFlags;
    }

    /**
     * @en Creates a new NavMeshModifierVolume instance.
     * @zh 创建一个新的 NavMeshModifierVolume 实例。
     */
    constructor() {
        super();
        this._datas = new Float32Array(22);
    }

    /**
     * @internal
     */
    _onWorldMatNeedChange() {
        Vector3.scale(this._size, 0.5, tempVec3);
        Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, tempVec3, this._transfrom);
        Matrix4x4.multiply((<Sprite3D>this.owner).transform.worldMatrix, this._transfrom, this._transfrom);
        let min = tempVec31;
        let max = tempVec31;
        min.setValue(-1, -1, -1);
        max.setValue(1, 1, 1);
        NavigationUtils.transfromBound(this._transfrom, min, max, min, max);
        this._datas[0] = min.x;
        this._datas[1] = min.y;
        this._datas[2] = min.z;
        this._datas[3] = max.x;
        this._datas[4] = max.y;
        this._datas[5] = max.z;
        this._transfrom.invert(this._transfrom);
        this._datas.set(this._transfrom.elements, 6);
        this._surface.forEach(element => {
            element._updateCovexVoume(this);
        });
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        this._surface = new Array<NavMeshSurface>();
        NavMeshSurface.findNavMeshSurface(this._surface, this.owner as Sprite3D, [this._agentType]);
        this._surface.forEach(element => {
            element._addCovexVoume(this);
        });
        this._onWorldMatNeedChange();
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange)
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        if (this._surface) {
            this._surface.forEach(element => {
                element._addCovexVoume(this);
            });
            this._surface = null;
        }

    }

    /**@internal */
    _cloneTo(dest: Component): void {
        let volume = dest as NavMeshModifierVolume;
        this._size.cloneTo(volume._size);
        this._center.cloneTo(volume._center);
        volume._agentType = this._agentType;
        volume._areaFlags = this._areaFlags;
        super._cloneTo(dest);
    }
}