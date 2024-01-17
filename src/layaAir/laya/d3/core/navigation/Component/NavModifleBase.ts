
import { Component } from "../../../../components/Component";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { Bounds } from "../../../math/Bounds";
import { Sprite3D } from "../../Sprite3D";
import { NavigationManager } from "../NavigationManager";
import { NavMeshSurface } from "./NavMeshSurface";
import { Event } from "../../../../events/Event";
import { NavigationUtils } from "../NavigationUtils";
import { Scene3D } from "../../scene/Scene3D";

/**
 * <code>NavModifleBase</code> 动态节点的基类。
 */
export class NavModifleBase extends Component {
    /**@internal */
    _navManager: NavigationManager;

    /**@internal */
    protected _bounds: Bounds;

    /**@internal */
    protected _dtNavTileCache: any;

    /**@internal */
    protected _surface: Array<NavMeshSurface>;

    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;

    /**@internal */
    private _areaFlags: string = NavigationManager.defaltUnWalk;


    get dtNavTileCache(): any {
        return this._dtNavTileCache;
    }

    /**
     * @internal
     */
    get bounds(): Bounds {
        return this._bounds;
    }

    set bounds(value: Bounds) {
        value.cloneTo(this._bounds);
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
        if (this._navManager) {
            let area = this._navManager.getArea(value);
            if (area) this._dtNavTileCache.setFlag(area.flag);
        }

    }

    get areaFlag() {
        return this._areaFlags;
    }

    /**
     * <code>NavModifleBase<Code>
     */
    constructor() {
        super();
        this._bounds = new Bounds(new Vector3(), new Vector3());
        this._dtNavTileCache = NavigationUtils.createdtNavTileCache();
    }

    /**
     * @internal
     */
    protected _onWorldMatNeedChange() {
        this._surface.forEach(element => {
            element._removeModifileNavMesh(this);
        });
        this._refeashTranfrom((<Sprite3D>this.owner).transform.worldMatrix, this.bounds);
        this._surface.forEach(element => {
            element._addModifileNavMesh(this);
        });
    }

    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, bound: Bounds) {

    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        this._navManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        let area = this._navManager.getArea(this._areaFlags);
        if (area) this._dtNavTileCache.setFlag(area.flag);
        this._surface = new Array<NavMeshSurface>();
        NavMeshSurface.findNavMeshSurface(this._surface, this.owner as Sprite3D, [this._agentType]);
        this._onWorldMatNeedChange();
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange)
    }

    /**
     * @internal
     */
    protected _onDisable(): void {

        if (this._surface) {
            this._surface.forEach(element => {
                element._removeModifileNavMesh(this);
            });
            this._surface = null;
        }

    }

    /**
     * @internal
     */
    protected _onDestroy(): void {
        NavigationUtils.free(this._dtNavTileCache);
    }

    /**
     * @internal
     */
    _cloneTo(dest: Component): void {
        //TODO
        let base = dest as NavModifleBase;
        base._agentType = this._agentType;
        base._areaFlags = this._areaFlags;
        this._bounds.cloneTo(base._bounds);
        super._cloneTo(dest);
    }
}