import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { LayaEnv } from "../../../../LayaEnv";
import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../../Physics3D/interface/Shape/IBoxColliderShape";
import { Laya3D } from "../../../../Laya3D";

/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends Physics3DColliderShape {
	
	/**@interanl */
	_shape: IBoxColliderShape;
	private _size: Vector3;
	/**@internal */
	private _sizeX: number;
	/**@internal */
	private _sizeY: number;
	/**@internal */
	private _sizeZ: number;

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
		this._size = new Vector3(sizeX, sizeY, sizeZ);
		this._shape.setSize(this._size);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _createShape() {
		Laya3D.PhysicsCreateUtil.createBoxColliderShape()
	}

	/**
	 * Box size
	 */
	get size(): Vector3 {
		return this._size;
	}

	set size(value: Vector3) {
		this._size = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
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

	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		destObject.size = this.size;
	}

	//-------------------deprecated-------------------
	/**
	 * @description
	 * X轴尺寸。
	 */
	get sizeX(): number {
		return this._sizeX;
	}

	set sizeX(value: number) {
		this._size.x = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * Y轴尺寸。
	 */
	get sizeY(): number {
		return this._sizeY;
	}

	set sizeY(value: number) {
		this._size.y = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * Z轴尺寸。
	 */
	get sizeZ(): number {
		return this._sizeZ;
	}

	set sizeZ(value: number) {
		this._size.z = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}
}


