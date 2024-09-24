import { LayaEnv } from "../../../../LayaEnv";
import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../../Physics3D/interface/Shape/IBoxColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * @en BoxColliderShape class is used to create box collider shape.
 * @zh BoxColliderShape 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends Physics3DColliderShape {

	/**@internal */
	_shape: IBoxColliderShape;
	/**@internal */
	private _size: Vector3;

	/**
	 * @en Constructor method, initializes the box collider shape with a specified size.
	 * @param sizeX The size of the box along the X-axis.
	 * @param sizeY The size of the box along the Y-axis.
	 * @param sizeZ The size of the box along the Z-axis.
	 * @zh 盒形碰撞器的构造方法，初始化为指定尺寸。
	 * @param sizeX 盒子X轴尺寸。
	 * @param sizeY 盒子Y轴尺寸。
	 * @param sizeZ 盒子Z轴尺寸。
	 */
	constructor(sizeX: number = 1.0, sizeY: number = 1.0, sizeZ: number = 1.0) {
		super();
		this._size = new Vector3(sizeX, sizeY, sizeZ);
		this._shape.setSize(this._size);
	}

	/**
	 * @internal
	 * @protected
	 */
	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_BoxColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createBoxColliderShape();
		else {
			console.error("BoxColliderShape: cant enable BoxColliderShape");
		}
	}

	/**
	 * @en Box size
	 * @zh 盒子尺寸
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
	 * @en Clone a new BoxColliderShape object.
	 * @zh 克隆一个新的 BoxColliderShape 对象。
	 */
	clone(): any {
		var dest: BoxColliderShape = new BoxColliderShape(this._size.x, this._size.y, this._size.z);
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @en Clone data to target object.
	 * @param destObject target object.
	 * @zh 克隆数据到目标对象
	 * @param destObject 目标对象 
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		destObject.size = this.size;
	}

	//-------------------deprecated-------------------
	/**
	 * @description
	 * @en X-axis size.
	 * @zh X轴尺寸。
	 */
	get sizeX(): number {
		return this.size.x;
	}

	set sizeX(value: number) {
		this._size.x = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * @en Y-axis size.
	 * @zh Y轴尺寸。
	 */
	get sizeY(): number {
		return this.size.y;
	}

	set sizeY(value: number) {
		this._size.y = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * @en Z-axis size.
	 * @zh Z轴尺寸。
	 */
	get sizeZ(): number {
		return this.size.z;
	}

	set sizeZ(value: number) {
		this._size.z = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}
}


