import { NavMeshLinkData } from "../../common/data/NavMeshLinkData";
import { NavModifleData } from "../../common/data/NavModifleData";
import { Component } from "../../../components/Component";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { BaseData } from "../../common/data/BaseData";
import { NavigationManager } from "../NavigationManager";

/**
 * @en BaseNav3DModifle is the base class for dynamic navigation nodes.
 * @zh BaseNav3DModifle 是动态导航节点的基类。
 */
export class BaseNav3DModifle extends Component {
    /**@internal */
    protected _modifierData: BaseData;

    /**@internal */
    protected _manager: NavigationManager;

    declare readonly owner: Sprite3D;

    /**
     * @en Agent type for the navigation node
     * @zh 导航节点的代理类型
     */
    set agentType(value: string) {
        this._modifierData.agentType = value;
    }

    get agentType() {
        return this._modifierData.agentType;
    }

    /**
     * @en Area type for the navigation node
     * @zh 导航节点的区域类型
     */
    set areaFlag(value: string) {
        this._modifierData.areaFlag = value;
    }

    get areaFlag() {
        return this._modifierData.areaFlag;
    }

    constructor() {
        super();
        this.runInEditor = true;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        this._manager = NavigationManager._getNavManager(this);
        this._onWorldMatNeedChange();
        this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
    }

    protected _onDisable(): void {
        this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
        const data = this._modifierData;
        if (data instanceof NavMeshLinkData) data.destroy();
        else if (data instanceof NavModifleData) data._destory();
        super._onDisable();
    }

    protected _onDestroy(): void {
        if (this._modifierData instanceof NavModifleData) this._modifierData._destory();
        super._onDestroy();
    }

    _cloneTo(dest: Component): void {
        const modifier = dest as BaseNav3DModifle;
        modifier.agentType = this.agentType;
        modifier.areaFlag = this.areaFlag;
        super._cloneTo(dest);
    }

    /**
     * @internal
     */
    protected _onWorldMatNeedChange() {
        this._refeashTranfrom(this.owner.transform.worldMatrix, this._modifierData._min, this._modifierData._max);
        this._modifierData._refeahTransfrom();
        this._modifierData._refeahBound();
    }

    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, min: Vector3, max: Vector3) {

    }
}