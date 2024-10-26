import { Component } from "../../components/Component";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { NavigationManager } from "../NavigationManager";
import { NavMeshSurface } from "./NavMeshSurface";
import { Event } from "../../events/Event";
import { NavigationUtils } from "../NavigationUtils";

/**
 * @en NavModifleBase is the base class for dynamic navigation nodes.
 * @zh NavModifleBase 是动态导航节点的基类。
 */
export class NavModifleBase extends Component {
    /**@internal */
    _navManager: NavigationManager;

    /**@internal */
    protected _boundMin: Vector3 = new Vector3();

    protected _boundMax: Vector3 = new Vector3();

    /**@internal */
    protected _dtNavTileCache: any;

    /**@internal */
    protected _surface: Array<NavMeshSurface>;

    /**@internal */
    private _agentType: string = NavigationManager.defaltAgentName;

    /**@internal */
    private _areaFlags: string = NavigationManager.defaltUnWalk;

    /**@internal */
    get dtNavTileCache(): any {
        return this._dtNavTileCache;
    }

    /**
     * @internal
     */
    get boundMin(): Vector3 {
        return this._boundMin;
    }

    get boundMax(): Vector3 {
        return this._boundMax;
    }

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * @en Area type for the navigation node
     * @zh 导航节点的区域类型
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
     * @en Create a new instance of NavModifleBase.
     * @zh 创建 NavModifleBase 类的新实例。
     */
    constructor() {
        super();
        this._boundMax = new Vector3();
        this._boundMin = new Vector3();
        this._dtNavTileCache = NavigationUtils.createdtNavTileCache();
    }

    /**
     * @internal
     */
    protected _onWorldMatNeedChange() {
        if (this._surface == null) return;
        this._surface.forEach(element => {
            element._removeModifileNavMesh(this);
        });
        this._refeashTranfrom((<Sprite3D>this.owner).transform.worldMatrix, this._boundMin, this._boundMax);
        this._surface.forEach(element => {
            element._addModifileNavMesh(this);
        });
    }

    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, min:Vector3,max:Vector3) {

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
    _cloneTo(dest: NavModifleBase): void {
        dest._agentType = this._agentType;
        dest._areaFlags = this._areaFlags;
        this._boundMax.cloneTo(dest._boundMax);
        this._boundMin.cloneTo(dest._boundMin);
        super._cloneTo(dest);
    }
}