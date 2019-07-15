/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.components.Component;
	improt laya.d3.physics.PhysicsSimulation;
	improt laya.d3.physics.shape.ColliderShape;
	public class PhysicsComponent extends laya.components.Component {
		public var canScaleShape:Boolean;
		public var restitution:Number;
		public var friction:Number;
		public var rollingFriction:Number;
		public var ccdMotionThreshold:Number;
		public var ccdSweptSphereRadius:Number;
		public function get isActive():Boolean{};
		public var enabled:Boolean;
		public var colliderShape:ColliderShape;
		public function get simulation():PhysicsSimulation{};
		public var collisionGroup:Number;
		public var canCollideWith:Number;

		public function PhysicsComponent(collisionGroup:Number,canCollideWith:Number){}
		public function _parse(data:*):void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		public function _onAdded():void{}
		protected function _onDestroy():void{}
		public function _cloneTo(dest:Component):void{}
	}

}
