import { ICollider } from "../../Physics3D/interface/ICollider";
import { ContactPoint } from "./ContactPoint";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";

/**
 * <code>Collision</code> 类用于创建物理碰撞信息。
 */
export class Collision {
    /**@internal */
    _lastUpdateFrame = -2147483648/*int.MIN_VALUE*/;
    /**@internal */
    _updateFrame = -2147483648/*int.MIN_VALUE*/;
    /**@internal */
    _isTrigger = false;

    /**@internal */
    _colliderA: ICollider;
    /**@internal */
    _colliderB: ICollider;

    /**@readonly*/
    contacts: ContactPoint[] = [];
    /**@readonly*/
    other: PhysicsColliderComponent;

    /**@internal */
    _inPool: boolean = false;
    /**
     * 创建一个 <code>Collision</code> 实例。
     */
    constructor() {

    }

    /**
     * @internal
     */
    _setUpdateFrame(farme: number): void {
        this._lastUpdateFrame = this._updateFrame;//TODO:为啥整两个
        this._updateFrame = farme;
    }

}


