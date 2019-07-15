/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.components.Component;
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.PhysicsTriggerComponent;
	improt laya.d3.physics.shape.ColliderShape;
	public class Rigidbody3D extends laya.d3.physics.PhysicsTriggerComponent {
		public static var TYPE_STATIC:Number;
		public static var TYPE_DYNAMIC:Number;
		public static var TYPE_KINEMATIC:Number;
		public var mass:Number;
		public var isKinematic:Boolean;
		public var linearDamping:Number;
		public var angularDamping:Number;
		public var overrideGravity:Boolean;
		public var gravity:Vector3;
		public function get totalForce():Vector3{};
		public var linearFactor:Vector3;
		public var linearVelocity:Vector3;
		public var angularFactor:Vector3;
		public var angularVelocity:Vector3;
		public function get totalTorque():Vector3{};
		public var detectCollisions:Boolean;
		public function get isSleeping():Boolean{};
		public var sleepLinearVelocity:Number;
		public var sleepAngularVelocity:Number;

		public function Rigidbody3D(collisionGroup:Number = null,canCollideWith:Number = null){}
		protected function _onScaleChange(scale:Vector3):void{}
		public function _onAdded():void{}
		public function _onShapeChange(colShape:ColliderShape):void{}
		public function _parse(data:*):void{}
		protected function _onDestroy():void{}
		public function _addToSimulation():void{}
		public function _removeFromSimulation():void{}
		public function _cloneTo(dest:Component):void{}
		public function applyForce(force:Vector3,localOffset:Vector3 = null):void{}
		public function applyTorque(torque:Vector3):void{}
		public function applyImpulse(impulse:Vector3,localOffset:Vector3 = null):void{}
		public function applyTorqueImpulse(torqueImpulse:Vector3):void{}
		public function wakeUp():void{}
		public function clearForces():void{}
	}

}
