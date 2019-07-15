/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.events.EventDispatcher;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector3;
	improt laya.d3.core.Sprite3D;
	public class Transform3D extends laya.events.EventDispatcher {
		public function get owner():Sprite3D{};
		public function get worldNeedUpdate():Boolean{};
		public var localPositionX:Number;
		public var localPositionY:Number;
		public var localPositionZ:Number;
		public var localPosition:Vector3;
		public var localRotationX:Number;
		public var localRotationY:Number;
		public var localRotationZ:Number;
		public var localRotationW:Number;
		public var localRotation:Quaternion;
		public var localScaleX:Number;
		public var localScaleY:Number;
		public var localScaleZ:Number;
		public var localScale:Vector3;
		public var localRotationEulerX:Number;
		public var localRotationEulerY:Number;
		public var localRotationEulerZ:Number;
		public var localRotationEuler:Vector3;
		public var localMatrix:Matrix4x4;
		public var position:Vector3;
		public var rotation:Quaternion;
		public var scale:Vector3;
		public var rotationEuler:Vector3;
		public var worldMatrix:Matrix4x4;

		public function Transform3D(owner:Sprite3D){}
		public function translate(translation:Vector3,isLocal:Boolean = null):void{}
		public function rotate(rotation:Vector3,isLocal:Boolean = null,isRadian:Boolean = null):void{}
		public function getForward(forward:Vector3):void{}
		public function getUp(up:Vector3):void{}
		public function getRight(right:Vector3):void{}
		public function lookAt(target:Vector3,up:Vector3,isLocal:Boolean = null):void{}
	}

}
