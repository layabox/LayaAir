import { Component } from "../../../components/Component";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { BaseData } from "../../common/data/BaseData";
import { NavigationManager } from "../NavigationManager";

/**
 * @internal
 * @en BaseNav3DModifle is the base class for dynamic navigation nodes.
 * @zh BaseNav3DModifle 是动态导航节点的基类。
 */
export class BaseNav3DModifle extends Component {
    /**@internal */
    protected _modifierData: BaseData;

    /**@internal */
    protected _manager: NavigationManager;

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
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
    }

    /**
     * @internal
     */
    protected _onWorldMatNeedChange() {
        var sprite3D: Sprite3D = this.owner as Sprite3D;
        this._refeashTranfrom(sprite3D.transform.worldMatrix, this._modifierData._min, this._modifierData._max);
        this._modifierData._refeahTransfrom();
        this._modifierData._refeahBound();
    }

    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, min: Vector3, max: Vector3) {

    }
}