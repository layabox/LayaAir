package laya.effect {
	import laya.utils.Handler;
	import laya.display.Sprite;
	import laya.utils.Tween;
	import laya.components.Component;

	/**
	 * 效果插件基类，基于对象池管理
	 */
	public class EffectBase extends Component {

		/**
		 * 动画持续时间，单位为毫秒
		 */
		public var duration:Number;

		/**
		 * 动画延迟时间，单位为毫秒
		 */
		public var delay:Number;

		/**
		 * 重复次数，默认为播放一次
		 */
		public var repeat:Number;

		/**
		 * 缓动类型，如果为空，则默认为匀速播放
		 */
		public var ease:String;

		/**
		 * 触发事件，如果为空，则创建时触发
		 */
		public var eventName:String;

		/**
		 * 效用作用的目标对象，如果为空，则是脚本所在的节点本身
		 */
		public var target:Sprite;

		/**
		 * 效果结束后，是否自动移除节点
		 */
		public var autoDestroyAtComplete:Boolean;
		protected var _comlete:Handler;
		protected var _tween:Tween;
		protected function _exeTween():void{}
		protected function _doTween():Tween{
			return null;
		}

		/**
		 * @override 
		 */
		override public function onReset():void{}
	}

}
