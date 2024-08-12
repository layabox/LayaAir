import { IClone } from "../../../utils/IClone";
import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "../../../Physics3D/interface/Shape/IColliderShape";

/**
 * @en The Physics3DColliderShape class serves as the base class for creating collider shapes and is an abstract class.
 * @zh 类是用于创建形状碰撞器的父类，该类为抽象类。
 */
export class Physics3DColliderShape implements IClone {

	/**
	 * @en Shape orientation: along the positive X-axis.
	 * @zh 形状方向：沿 X 轴正向。
	 */
	static SHAPEORIENTATION_UPX: number = 0;
	/**
	 * @en Shape orientation: along the positive Y-axis.
	 * @zh 形状方向：沿 Y 轴正向。
	 */
	static SHAPEORIENTATION_UPY: number = 1;
	/**
	 * @en Shape orientation: along the positive Z-axis.
	 * @zh 形状方向：沿 Z 轴正向。
	 */
	static SHAPEORIENTATION_UPZ: number = 2;

	/**@internal */
	_shape: IColliderShape;

	/**
	 * @en The shape of the collider.
	 * @zh 碰撞器的形状。
	 */
	get shape(): IColliderShape {
		return this._shape;
	}

	/**@internal */
	protected _localOffset: Vector3 = new Vector3(0, 0, 0);

	/**
	 * @en The local offset of the shape.
	 * @zh 形状的本地偏移。
	 */
	get localOffset(): Vector3 {
		return this._localOffset;
	}

	set localOffset(value: Vector3) {
		this._localOffset = value;
		this._shape.setOffset(value);
	}
	/**@ignore */
	constructor() {
		this._createShape();
	}

	/**
	 * @internal
	 * @protected
	 */
	protected _createShape() {
		throw "override it";
	}

	/**
	 * @en Clone this object to a destination object.
	 * @param destObject The destination object.
	 * @zh 将此对象克隆到目标对象。
	 * @param destObject 目标对象。
	 */
	cloneTo(destObject: any): void {
		var destColliderShape: Physics3DColliderShape = (<Physics3DColliderShape>destObject);
		this._localOffset.cloneTo(destColliderShape.localOffset);
		destColliderShape.localOffset = destColliderShape.localOffset;
	}

	/**
	 * @en Clone.
	 * @return A clone of this object.
	 * @zh 克隆。
	 * @return 此对象的克隆
	 */
	clone(): any {
		return null;
	}

	/**
	 * @en Destroy this object.
	 * @zh 销毁此对象。
	 */
	destroy(): void {
		if (this._shape) {
			this._shape.destroy();
			this._shape = null;
		}
	}

}


