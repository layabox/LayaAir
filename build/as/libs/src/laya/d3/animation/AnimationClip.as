/*[IF-FLASH]*/
package laya.d3.animation {
	improt laya.d3.animation.AnimationEvent;
	improt laya.resource.Resource;
	improt laya.utils.Handler;
	public class AnimationClip extends laya.resource.Resource {
		public static var ANIMATIONCLIP:String;
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):AnimationClip{}
		public static function load(url:String,complete:Handler):void{}
		public var islooping:Boolean;
		public function duration():Number{}

		public function AnimationClip(){}
		private var _hermiteInterpolate:*;
		private var _hermiteInterpolateVector3:*;
		private var _hermiteInterpolateQuaternion:*;
		public function _evaluateClipDatasRealTimeForNative(nodes:*,playCurTime:Number,realTimeCurrentFrameIndexes:Uint16Array,addtive:Boolean):void{}
		private var _evaluateFrameNodeVector3DatasRealTime:*;
		private var _evaluateFrameNodeQuaternionDatasRealTime:*;
		private var _binarySearchEventIndex:*;
		public function addEvent(event:AnimationEvent):void{}
		protected function _disposeResource():void{}
	}

}
