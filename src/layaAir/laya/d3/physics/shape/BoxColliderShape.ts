import { ColliderShape } from "./ColliderShape";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends ColliderShape {
	/** @internal */
	private static _btSize: number;

	/**
	* @internal
	*/
	static __init__(): void {
		BoxColliderShape._btSize = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	}

	/**@internal */
	private _sizeX: number;
	/**@internal */
	private _sizeY: number;
	/**@internal */
	private _sizeZ: number;

	/**
	 * X轴尺寸。
	 */
	get sizeX(): number {
		return this._sizeX;
	}

	/**
	 * Y轴尺寸。
	 */
	get sizeY(): number {
		return this._sizeY;
	}

	/**
	 * Z轴尺寸。
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

		super();
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._sizeZ = sizeZ;
		this._type = ColliderShape.SHAPETYPES_BOX;

		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(BoxColliderShape._btSize, sizeX / 2, sizeY / 2, sizeZ / 2);
		this._btShape = bt.btBoxShape_create(BoxColliderShape._btSize);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: BoxColliderShape = new BoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
		this.cloneTo(dest);
		return dest;
	}
}


