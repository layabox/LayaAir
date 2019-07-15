/*[IF-FLASH]*/
package laya.physics {
	improt laya.components.Component;
	public class RigidBody extends laya.components.Component {
		protected var _type:String;
		protected var _allowSleep:Boolean;
		protected var _angularVelocity:Number;
		protected var _angularDamping:Number;
		protected var _linearVelocity:*;
		protected var _linearDamping:Number;
		protected var _bullet:Boolean;
		protected var _allowRotation:Boolean;
		protected var _gravityScale:Number;
		public var group:Number;
		public var category:Number;
		public var mask:Number;
		public var label:String;
		protected var _body:*;
		private var _createBody:*;
		protected function _onAwake():void{}
		protected function _onEnable():void{}
		private var accessGetSetFunc:*;
		private var resetCollider:*;
		private var _sysPhysicToNode:*;
		private var _sysNodeToPhysic:*;
		private var _sysPosToPhysic:*;
		private var _overSet:*;
		protected function _onDisable():void{}
		public function getBody():*{}
		public function get body():*{};
		public function applyForce(position:*,force:*):void{}
		public function applyForceToCenter(force:*):void{}
		public function applyLinearImpulse(position:*,impulse:*):void{}
		public function applyLinearImpulseToCenter(impulse:*):void{}
		public function applyTorque(torque:Number):void{}
		public function setVelocity(velocity:*):void{}
		public function setAngle(value:*):void{}
		public function getMass():Number{}
		public function getCenter():*{}
		public function getWorldCenter():*{}
		public var type:String;
		public var gravityScale:Number;
		public var allowRotation:Boolean;
		public var allowSleep:Boolean;
		public var angularDamping:Number;
		public var angularVelocity:Number;
		public var linearDamping:Number;
		public var linearVelocity:*;
		public var bullet:Boolean;
	}

}
