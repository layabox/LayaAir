package laya.d3.physicsCannon {
	import laya.d3.math.Ray;
	import laya.d3.math.Vector3;
	import laya.d3.physicsCannon.CannonHitResult;

	/**
	 * <code>Simulation</code> 类用于创建物理模拟器。
	 */
	public class CannonPhysicsSimulation {
		public static var disableSimulation:Boolean;

		/**
		 * 创建限制刚体运动的约束条件。
		 */
		public static function createConstraint():void{}

		/**
		 * 物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。
		 */
		public var maxSubSteps:Number;

		/**
		 * 物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。
		 */
		public var fixedTimeStep:Number;

		/**
		 * 是否进行连续碰撞检测。CCD
		 */
		public function get continuousCollisionDetection():Boolean{return null;}
		public function set continuousCollisionDetection(value:Boolean):void{}

		/**
		 * 获取重力。
		 */
		public function get gravity():Vector3{return null;}
		public function set gravity(value:Vector3):void{}

		/**
		 * 获取重力。
		 */
		public function get solverIterations():Number{return null;}
		public function set solverIterations(value:Number):void{}

		/**
		 * 射线检测第一个碰撞物体。
		 * @param from 起始位置。
		 * @param to 结束位置。
		 * @param out 碰撞结果。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		public function raycastFromTo(from:Vector3,to:Vector3,out:CannonHitResult = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{
			return null;
		}

		/**
		 * 射线检测所有碰撞的物体。
		 * @param from 起始位置。
		 * @param to 结束位置。
		 * @param out 碰撞结果[数组元素会被回收]。
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否成功。
		 */
		public function raycastAllFromTo(from:Vector3,to:Vector3,out:Array,collisonGroup:Number = null,collisionMask:Number = null):Boolean{
			return null;
		}

		/**
		 * 射线检测第一个碰撞物体。
		 * @param ray 射线
		 * @param outHitInfo 与该射线发生碰撞的第一个碰撞器的碰撞信息
		 * @param distance 射线长度,默认为最大值
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否检测成功。
		 */
		public function rayCast(ray:Ray,outHitResult:CannonHitResult = null,distance:Number = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{
			return null;
		}

		/**
		 * 射线检测所有碰撞的物体。
		 * @param ray 射线
		 * @param out 碰撞结果[数组元素会被回收]。
		 * @param distance 射线长度,默认为最大值
		 * @param collisonGroup 射线所属碰撞组。
		 * @param collisionMask 与射线可产生碰撞的组。
		 * @return 是否检测成功。
		 */
		public function rayCastAll(ray:Ray,out:Array,distance:Number = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{
			return null;
		}

		/**
		 * 清除力。
		 */
		public function clearForces():void{}
	}

}
