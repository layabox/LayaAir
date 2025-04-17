import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { ICompoundColliderShape } from "../../../Physics3D/interface/Shape/ICompoundColliderShape";

/**
 * @en use to create compound collider.
 * @zh 用于创建组合碰撞器。
 */
export class CompoundColliderShape extends Physics3DColliderShape {
	_shape: ICompoundColliderShape;

	/**@internal */
	private _childColliderShapes: Physics3DColliderShape[] = [];

	/**
	 * @en create a new instance of CompoundColliderShape.
	 * @zh 创建一个新的组合碰撞形状实例。
	 */
	constructor() {
		super();
	}

	protected _createShape(): void {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CompoundColliderShape)) {
			this._shape = Laya3D.PhysicsCreateUtil.createCompoundShape();
		} else {
			console.error("CompoundColliderShape: cannot enable CompoundColliderShape");
		}
	}

	/**
	 * @en set the physics shape array.
	 * @zh 设置物理形状数组。
	 */
	public set shapes(value: any[]) {
		for (var i = this._childColliderShapes.length - 1; i >= 0; i--) {
			this.removeChildShape(this._childColliderShapes[i]);
		}

		for (var i = 0; i < value.length; i++) {
			this.addChildShape(value[i]);
		}
	}

	public get shapes(): any[] {
		return this._childColliderShapes;
	}

	/**
	 * @en add a child collider shape.
	 * @param shape.
	 * @zh 添加一个子碰撞器形状。
	 * @param shape 子碰撞器形状。
	 */
	addChildShape(shape: Physics3DColliderShape): void {
		this._shape && this._shape.setShapeData(this.physicsComponent);
		this._shape && this._shape.addChildShape(shape.shape);
		this._childColliderShapes.push(shape);
	}

	/**
	 * @en remove a child collider shape.
	 * @param shape.
	 * @zh 移除一个子碰撞器形状。
	 * @param shape 子碰撞器形状。
	 */
	removeChildShape(shape: Physics3DColliderShape): void {
		let index = this._childColliderShapes.indexOf(shape);
		this._shape && this._shape.removeChildShape(shape.shape, index);
		this._childColliderShapes.splice(index, 1);
	}

	/**
	 * @en clear the child collider shape.
	 * @zh 清空子碰撞器形状。
	 */
	clearChildShape(): void {
		this._shape && this._childColliderShapes.forEach(shape => {
			this._shape && this._shape.removeChildShape(shape.shape, 0);
		});
		this._childColliderShapes = [];
	}

	/**
	 * @en get the child shape count.
	 * @zh 获取子形状数量。
	 */
	getChildShapeCount(): number {
		return this._childColliderShapes.length;
	}

	/**
	 * @en clone the data to the destination node.
	 * @zh 将数据克隆到目标节点。
	 */
	cloneTo(destObject: CompoundColliderShape): void {
		destObject.clearChildShape();
		for (let i: number = 0, n: number = this._childColliderShapes.length; i < n; i++)
			destObject.addChildShape(this._childColliderShapes[i].clone());
	}

	/**
	 * @en clone the data to the destination node.
	 * @zh 将数据克隆到目标节点。
	 */
	clone(): any {
		var dest: CompoundColliderShape = new CompoundColliderShape();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @en destroy the instance.
	 * @zh 销毁实例。
	 */
	destroy(): void {
		super.destroy();
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
			var childShape: Physics3DColliderShape = this._childColliderShapes[i];
			childShape.destroy();
		}

	}
}

