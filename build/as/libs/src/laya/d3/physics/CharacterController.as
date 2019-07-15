/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.PhysicsComponent;
	improt laya.d3.physics.shape.ColliderShape;
	improt laya.components.Component;
	public class CharacterController extends laya.d3.physics.PhysicsComponent {
		public static var UPAXIS_X:Number;
		public static var UPAXIS_Y:Number;
		public static var UPAXIS_Z:Number;
		public var fallSpeed:Number;
		public var jumpSpeed:Number;
		public var gravity:Vector3;
		public var maxSlope:Number;
		public function get isGrounded():Boolean{};
		public var stepHeight:Number;
		public var upAxis:Vector3;

		public function CharacterController(stepheight:Number = null,upAxis:Vector3 = null,collisionGroup:Number = null,canCollideWith:Number = null){}
		public function _onShapeChange(colShape:ColliderShape):void{}
		public function _onAdded():void{}
		public function _addToSimulation():void{}
		public function _removeFromSimulation():void{}
		public function _cloneTo(dest:Component):void{}
		protected function _onDestroy():void{}
		public function move(movement:Vector3):void{}
		public function jump(velocity:Vector3 = null):void{}
	}

}
