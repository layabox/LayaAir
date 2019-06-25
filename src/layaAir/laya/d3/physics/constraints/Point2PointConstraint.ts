import { Vector3 } from "../../math/Vector3"
	
	/**
	 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
	 */
	export class Point2PointConstraint {
		/**@internal */
		private _pivotInA:Vector3 = new Vector3();
		/**@internal */
		private _pivotInB:Vector3 = new Vector3();
		/**@internal */
		private _damping:number;
		/**@internal */
		private _impulseClamp:number;
		/**@internal */
		private _tau:number;
		
		 get pivotInA():Vector3 {
			return this._pivotInA;
		}
		
		 set pivotInA(value:Vector3) {
			this._pivotInA = value;
		}
		
		 get pivotInB():Vector3 {
			return this._pivotInB;
		}
		
		 set pivotInB(value:Vector3) {
			this._pivotInB = value;
		}
		
		 get damping():number {
			return this._damping;
		}
		
		 set damping(value:number) {
			this._damping = value;
		}
		
		 get impulseClamp():number {
			return this._impulseClamp;
		}
		
		 set impulseClamp(value:number) {
			this._impulseClamp = value;
		}
		
		 get tau():number {
			return this._tau;
		}
		
		 set tau(value:number) {
			this._tau = value;
		}
		
		/**
		 * 创建一个 <code>Point2PointConstraint</code> 实例。
		 */
		constructor(){
		
		}
	
	}


