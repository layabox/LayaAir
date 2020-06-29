package laya.d3.animation {
	import laya.d3.animation.AnimationEvent;
	import laya.resource.Resource;
	import laya.utils.Handler;

	/**
	 * <code>AnimationClip</code> 类用于动画片段资源。
	 */
	public class AnimationClip extends Resource {

		/**
		 * AnimationClip资源。
		 */
		public static var ANIMATIONCLIP:String;

		/**
		 * @inheritDoc 
		 */
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):AnimationClip{
			return null;
		}

		/**
		 * 加载动画片段。
		 * @param url 动画片段地址。
		 * @param complete 完成回掉。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 是否循环。
		 */
		public var islooping:Boolean;

		/**
		 * 获取动画片段时长。
		 */
		public function duration():Number{
			return null;
		}

		/**
		 * 创建一个 <code>AnimationClip</code> 实例。
		 */

		public function AnimationClip(){}
		public function _evaluateClipDatasRealTimeForNative(nodes:*,playCurTime:Number,realTimeCurrentFrameIndexes:Uint16Array,addtive:Boolean):void{}
		private var _evaluateFrameNodeVector3DatasRealTime:*;
		private var _evaluateFrameNodeQuaternionDatasRealTime:*;
		private var _binarySearchEventIndex:*;

		/**
		 * 添加动画事件。
		 */
		public function addEvent(event:AnimationEvent):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _disposeResource():void{}
	}

}
