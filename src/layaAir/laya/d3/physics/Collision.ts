import { ContactPoint } from "././ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent"

/**
 * <code>Collision</code> 类用于创建物理碰撞信息。
 */
export class Collision {
	/**@private */
	_lastUpdateFrame: number = -2147483648/*int.MIN_VALUE*/;
	/**@private */
	_updateFrame: number = -2147483648/*int.MIN_VALUE*/;
	/**@private */
	_isTrigger: boolean = false;

	/**@private */
	_colliderA: PhysicsComponent;
	/**@private */
	_colliderB: PhysicsComponent;

	/**@private [只读]*/
	contacts: ContactPoint[] = [];
	/**@private [只读]*/
	other: PhysicsComponent;

	/**
	 * 创建一个 <code>Collision</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
	}

	/**
	 * @private
	 */
	_setUpdateFrame(farme: number): void {
		this._lastUpdateFrame = this._updateFrame;//TODO:为啥整两个
		this._updateFrame = farme;
	}

}


