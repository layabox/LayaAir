import { IClone } from "../../../utils/IClone";
import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "../../../Physics3D/interface/Shape/IColliderShape";

/**
 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
 */
export class Physics3DColliderShape implements IClone {

	/** 形状方向_X轴正向 */
	static SHAPEORIENTATION_UPX: number = 0;
	/** 形状方向_Y轴正向 */
	static SHAPEORIENTATION_UPY: number = 1;
	/** 形状方向_Z轴正向 */
	static SHAPEORIENTATION_UPZ: number = 2;
	
	
	_shape: IColliderShape;

	get shape(): IColliderShape{
		return this._shape;
	}

	/**@internal */
	protected _localOffset: Vector3 = new Vector3(0, 0, 0);

	/**
	 * Shape的本地偏移。
	 */
	get localOffset(): Vector3 {
		return this._localOffset;
	}

	set localOffset(value: Vector3) {
		this._localOffset = value;
		this._shape.setOffset(value);
	}

	/**
	 * 创建一个新的 <code>ColliderShape</code> 实例。
	 */
	constructor() {
		this._createShape();
	}

	protected _createShape() {
		throw "override it";
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destColliderShape: Physics3DColliderShape = (<Physics3DColliderShape>destObject);
		this._localOffset.cloneTo(destColliderShape.localOffset);
		destColliderShape.localOffset = destColliderShape.localOffset;
	}

	/**
	 * 克隆。
	 * @return 克隆副本。
	 */
	clone(): any {
		return null;
	}

	/**
	 * 销毁。
	 */
	destroy(): void {
		if (this._shape) {
			this._shape.destroy();
			this._shape = null;
		}
	}

}


