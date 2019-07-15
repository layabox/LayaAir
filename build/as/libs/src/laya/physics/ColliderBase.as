/*[IF-FLASH]*/
package laya.physics {
	improt laya.physics.RigidBody;
	improt laya.components.Component;
	public class ColliderBase extends laya.components.Component {
		private var _isSensor:*;
		private var _density:*;
		private var _friction:*;
		private var _restitution:*;
		public var label:String;
		protected var _shape:*;
		protected var _def:*;
		public var fixture:*;
		public var rigidBody:RigidBody;
		protected function getDef():*{}
		protected function _onEnable():void{}
		private var _checkRigidBody:*;
		protected function _onDestroy():void{}
		public var isSensor:Boolean;
		public var density:Number;
		public var friction:Number;
		public var restitution:Number;
		public function refresh():void{}
		public function resetShape(re:Boolean = null):void{}
		public function get isSingleton():Boolean{};
	}

}
