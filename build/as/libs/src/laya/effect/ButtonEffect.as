package laya.effect {
	import laya.display.Sprite;

	/**
	 * @Script {name:ButtonEffect}
	 * @author ww
	 */
	public class ButtonEffect {
		private var _tar:*;
		private var _curState:*;
		private var _curTween:*;

		/**
		 * effectScale
		 * @prop {name:effectScale,type:number, tips:"缩放值",default:"1.5"}
		 */
		public var effectScale:Number;

		/**
		 * tweenTime
		 * @prop {name:tweenTime,type:number, tips:"缓动时长",default:"300"}
		 */
		public var tweenTime:Number;

		/**
		 * effectEase
		 * @prop {name:effectEase,type:ease, tips:"效果缓动类型"}
		 */
		public var effectEase:String;

		/**
		 * backEase
		 * @prop {name:backEase,type:ease, tips:"恢复缓动类型"}
		 */
		public var backEase:String;

		/**
		 * 设置控制对象
		 * @param tar 
		 */
		public var target:Sprite;
		private var toChangedState:*;
		private var toInitState:*;
		private var tweenComplete:*;
	}

}
