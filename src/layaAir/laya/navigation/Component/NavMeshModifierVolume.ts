
import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Event } from "../../events/Event";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Bounds } from "../../d3/math/Bounds";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { NavigationManager } from "../NavigationManager";
import { NavMeshSurface } from "./NavMeshSurface";

const tempVec3 = new Vector3();
const tempBound = new Bounds(new Vector3(), new Vector3())
export class NavMeshModifierVolume extends Component {
    /**@internal */
    _transfrom: Matrix4x4 = new Matrix4x4();
    /**@internal */
    _datas: number[];

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
    * center
    */
    get center(): Vector3 {
        return this._center;
    }
    set center(value: Vector3) {
        value.cloneTo(this._center);
    }

    /**
     * size
     */
    get size(): Vector3 {
        return this._size;
    }
    set size(value: Vector3) {
        value.cloneTo(this._size);
    }

    /**
    * agentType
    */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * area 类型
     */
    set areaFlag(value: string) {
        this._areaFlags = value;
    }

    get areaFlag() {
        return this._areaFlags;
    }

    /**
     * <code>NavModifleBase<Code>
     */
    constructor() {
        super();
        this._datas = [0, 0, 0, 0, 0, 0];
    }

    /**
     * @internal
     */
    _onWorldMatNeedChange() {
        Vector3.scale(this._size, 0.5, tempVec3);
        Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, tempVec3, this._transfrom);
        Matrix4x4.multiply((<Sprite3D>this.owner).transform.worldMatrix, this._transfrom, this._transfrom);
        tempBound.min.setValue(-1, -1, -1);
        tempBound.max.setValue(1, 1, 1);
        tempBound._tranform(this._transfrom, tempBound);
        this._datas[0] = tempBound.min.x;
        this._datas[1] = tempBound.min.y;
        this._datas[2] = tempBound.min.z;
        this._datas[3] = tempBound.max.x;
        this._datas[4] = tempBound.max.y;
        this._datas[5] = tempBound.max.z;
        this._transfrom.invert(this._transfrom);
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