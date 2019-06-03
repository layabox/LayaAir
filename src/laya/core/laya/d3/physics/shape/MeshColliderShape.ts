import { ILaya3D } from "ILaya3D";
import { Vector3 } from "../../math/Vector3";
import { Mesh } from "../../resource/models/Mesh";
import { ColliderShape } from "././ColliderShape";
import { Physics } from "../Physics";
	
	/**
	 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
	 */
	export class MeshColliderShape extends ColliderShape {
		/**@private */
		private _mesh:Mesh = null;
		/**@private */
		private _convex:boolean = false;
		
		///**@private */
		//public var localOffset:Vector3 = new Vector3(0, 0, 0);
		///**@private */
		//public var localRotation:Quaternion = new Quaternion(0, 0, 0, 1);
		///**@private */
		//public var simpleWrap:Boolean = true;
		///**@private */
		//public var scaling:Vector3 = new Vector3(1, 1, 1);
		///**@private */
		//public var depth:int = 10;
		///**@private */
		//public var posSampling:int = 10;
		///**@private */
		//public var angleSampling:int = 10;
		///**@private */
		//public var posRefine:int = 5;
		///**@private */
		//public var angleRefine:int = 5;
		///**@private */
		//public var alpha:Number = 0.01;
		///**@private */
		//public var threshold:Number = 0.01;
		
		/**
		 * 获取网格。
		 * @return 网格。
		 */
		 get mesh():Mesh {
			return this._mesh;
		}
		
		/**
		 * 设置网格。
		 * @param 网格。
		 */
		 set mesh(value:Mesh) {
			if (this._mesh !== value) {
				var physics3D:any = Physics._physics3D;
				if (this._mesh) {
					physics3D.destroy(this._nativeShape);
				}
				if (value) {
					this._nativeShape = new Physics._physics3D.btGImpactMeshShape(value._getPhysicMesh());
					this._nativeShape.updateBound();
				}
				this._mesh = value;
			}
		}
		
		/**
		 * 获取是否使用凸多边形。
		 * @return 是否使用凸多边形。
		 */
		 get convex():boolean {
			return this._convex;
		}
		
		/**
		 * 设置是否使用凸多边形。
		 * @param value 是否使用凸多边形。
		 */
		 set convex(value:boolean) {
			this._convex = value;
		}
		
		/**
		 * 创建一个新的 <code>MeshColliderShape</code> 实例。
		 */
		constructor(){super();

		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _setScale(value:Vector3):void {
			if (this._compoundParent) {//TODO:待查,这里有问题
				this.updateLocalTransformations();//TODO:
			} else {
				ColliderShape._nativeScale.setValue(value.x, value.y, value.z);
				this._nativeShape.setLocalScaling(ColliderShape._nativeScale);
				this._nativeShape.updateBound();//更新缩放后需要更新包围体,有性能损耗
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  cloneTo(destObject:any):void {
			var destMeshCollider:MeshColliderShape = (<MeshColliderShape>destObject );
			destMeshCollider.convex = this._convex;
			destMeshCollider.mesh = this._mesh;
			super.cloneTo(destObject);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  clone():any {
			var dest:MeshColliderShape = new MeshColliderShape();
			this.cloneTo(dest);
			return dest;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy():void {
			if (this._nativeShape) {
				var physics3D:any = Physics._physics3D;
				physics3D.destroy(this._nativeShape);
				this._nativeShape = null;
			}
		}
	
	}


