/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Ray;
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.Constraint3D;
	improt laya.d3.physics.HitResult;
	improt laya.d3.physics.shape.ColliderShape;
	public class PhysicsSimulation {
		public static var disableSimulation:Boolean;
		public static function createConstraint():void{}
		public var maxSubSteps:Number;
		public var fixedTimeStep:Number;
		public var continuousCollisionDetection:Boolean;
		public var gravity:Vector3;
		public function raycastFromTo(from:Vector3,to:Vector3,out:HitResult = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{}
		public function raycastAllFromTo(from:Vector3,to:Vector3,out:Array,collisonGroup:Number = null,collisionMask:Number = null):Boolean{}
		public function rayCast(ray:Ray,outHitResult:HitResult = null,distance:Number = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{}
		public function rayCastAll(ray:Ray,out:Array,distance:Number = null,collisonGroup:Number = null,collisionMask:Number = null):Boolean{}
		public function shapeCast(shape:ColliderShape,fromPosition:Vector3,toPosition:Vector3,out:HitResult = null,fromRotation:Quaternion = null,toRotation:Quaternion = null,collisonGroup:Number = null,collisionMask:Number = null,allowedCcdPenetration:Number = null):Boolean{}
		public function shapeCastAll(shape:ColliderShape,fromPosition:Vector3,toPosition:Vector3,out:Array,fromRotation:Quaternion = null,toRotation:Quaternion = null,collisonGroup:Number = null,collisionMask:Number = null,allowedCcdPenetration:Number = null):Boolean{}
		public function addConstraint(constraint:Constraint3D,disableCollisionsBetweenLinkedBodies:Boolean = null):void{}
		public function removeConstraint(constraint:Constraint3D):void{}
		public function clearForces():void{}
	}

}
