import { Physics } from "../Physics";
import { ColliderShape } from "././ColliderShape";

/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends ColliderShape {
	/** @private */
	private static _nativeSize: any;

	/**
	* @private
	*/
	static __init__(): void {
		BoxColliderShape._nativeSize = new Physics._physics3D.btVector3(0, 0, 0);
	}

	/**@private */
	private _sizeX: number;
	/**@private */
	private _sizeY: number;
	/**@private */
	private _sizeZ: number;

	/**
	 * 获取X轴尺寸。
	 */
	get sizeX(): number {
		return this._sizeX;
	}

	/**
	 * 获取Y轴尺寸。
	 */
	get sizeY(): number {
		return this._sizeY;
	}

	/**
	 * 获取Z轴尺寸。
	 */
	get sizeZ(): number {
		return this._sizeZ;
	}



	/**
	 * 创建一个新的 <code>BoxColliderShape</code> 实例。
	 * @param sizeX 盒子X轴尺寸。
	 * @param sizeY 盒子Y轴尺寸。
	 * @param sizeZ 盒子Z轴尺寸。
	 */
	constructor(sizeX: number = 1.0, sizeY: number = 1.0, sizeZ: number = 1.0) {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._sizeZ = sizeZ;
		this._type = ColliderShape.SHAPETYPES_BOX;

		BoxColliderShape._nativeSize.setValue(sizeX / 2, sizeY / 2, sizeZ / 2);
		this._nativeShape = new Physics._physics3D.btBoxShape(BoxColliderShape._nativeSize);
	}

	/**
	 * @inheritDoc
	 */
	clone(): any {/*override*/
		var dest: BoxColliderShape = new BoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
		this.cloneTo(dest);
		return dest;
	}
}


