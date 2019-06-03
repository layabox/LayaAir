import { ILaya3D } from "ILaya3D";
import { ColliderShape } from "././ColliderShape";
	
	/**
	 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
	 */
	export class CylinderColliderShape extends ColliderShape {
		/** @private */
		private static _nativeSize:any = new ILaya3D.Laya3D._physics3D.btVector3(0, 0, 0);
		
		/**@private */
		private _orientation:number;
		/**@private */
		private _radius:number = 1;
		/**@private */
		private _height:number = 0.5;
		
		/**
		 * 获取半径。
		 */
		 get radius():number {
			return this._radius;
		}
		
		/**
		 * 获取高度。
		 */
		 get height():number {
			return this._height;
		}
		
		/**
		 * 获取方向。
		 */
		 get orientation():number {
			return this._orientation;
		}
		
		/**
		 * 创建一个新的 <code>CylinderColliderShape</code> 实例。
		 * @param height 高。
		 * @param radius 半径。
		 */
		constructor(radius:number = 0.5, height:number = 1.0, orientation:number = ColliderShape.SHAPEORIENTATION_UPY){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super();
this._radius = radius;
			this._height = height;
			this._orientation = orientation;
			this._type = ColliderShape.SHAPETYPES_CYLINDER;
			switch (orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX: 
				CylinderColliderShape._nativeSize.setValue(height / 2, radius, radius);
				this._nativeShape = new ILaya3D.Laya3D._physics3D.btCylinderShapeX(CylinderColliderShape._nativeSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY: 
				CylinderColliderShape._nativeSize.setValue(radius, height / 2, radius);
				this._nativeShape = new ILaya3D.Laya3D._physics3D.btCylinderShape(CylinderColliderShape._nativeSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ: 
				CylinderColliderShape._nativeSize.setValue(radius, radius, height / 2);
				this._nativeShape = new ILaya3D.Laya3D._physics3D.btCylinderShapeZ(CylinderColliderShape._nativeSize);
				break;
			default: 
				throw "CapsuleColliderShape:unknown orientation.";
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  clone():any {
			var dest:CylinderColliderShape = new CylinderColliderShape(this._radius, this._height, this._orientation);
			this.cloneTo(dest);
			return dest;
		}
	
	}


