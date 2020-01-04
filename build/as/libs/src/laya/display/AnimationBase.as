package laya.display {
	import laya.display.Sprite;

	/**
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/**
	 * <p>动画基类，提供了基础的动画播放控制方法和帧标签事件相关功能。</p>
	 * <p>可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。</p>
	 */
	public class AnimationBase extends Sprite {

		/**
		 * 动画播放顺序类型：正序播放。
		 */
		public static var WRAP_POSITIVE:Number;

		/**
		 * 动画播放顺序类型：逆序播放。
		 */
		public static var WRAP_REVERSE:Number;

		/**
		 * 动画播放顺序类型：pingpong播放(当按指定顺序播放完结尾后，如果继续播放，则会改变播放顺序)。
		 */
		public static var WRAP_PINGPONG:Number;

		/**
		 * 是否循环播放，调用play(...)方法时，会将此值设置为指定的参数值。
		 */
		public var loop:Boolean;

		/**
		 * 播放顺序类型：AnimationBase.WRAP_POSITIVE为正序播放(默认值)，AnimationBase.WRAP_REVERSE为倒序播放，AnimationBase.WRAP_PINGPONG为pingpong播放(当按指定顺序播放完结尾后，如果继续播发，则会改变播放顺序)。
		 */
		public var wrapMode:Number;

		/**
		 * @private 播放间隔(单位：毫秒)。
		 */
		protected var _interval:Number;

		/**
		 * @private 
		 */
		protected var _index:Number;

		/**
		 * @private 
		 */
		protected var _count:Number;

		/**
		 * @private 
		 */
		protected var _isPlaying:Boolean;

		/**
		 * @private 
		 */
		protected var _labels:*;

		/**
		 * 是否是逆序播放
		 */
		protected var _isReverse:Boolean;

		/**
		 * @private 
		 */
		protected var _frameRateChanged:Boolean;

		/**
		 * @private 
		 */
		protected var _actionName:String;

		/**
		 * @private 
		 */
		private var _controlNode:*;

		/**
		 * 可以继承此类，但不要直接实例化此类，因为有些方法需要由子类实现。
		 */

		public function AnimationBase(){}

		/**
		 * <p>开始播放动画。play(...)方法被设计为在创建实例后的任何时候都可以被调用，当相应的资源加载完毕、调用动画帧填充方法(set frames)或者将实例显示在舞台上时，会判断是否正在播放中，如果是，则进行播放。</p>
		 * <p>配合wrapMode属性，可设置动画播放顺序类型。</p>
		 * @param start （可选）指定动画播放开始的索引(int)或帧标签(String)。帧标签可以通过addLabel(...)和removeLabel(...)进行添加和删除。
		 * @param loop （可选）是否循环播放。
		 * @param name （可选）动画名称。
		 */
		public function play(start:* = null,loop:Boolean = null,name:String = null):void{}

		/**
		 * <p>动画播放的帧间隔时间(单位：毫秒)。默认值依赖于Config.animationInterval=50，通过Config.animationInterval可以修改默认帧间隔时间。</p>
		 * <p>要想为某动画设置独立的帧间隔时间，可以使用set interval，注意：如果动画正在播放，设置后会重置帧循环定时器的起始时间为当前时间，也就是说，如果频繁设置interval，会导致动画帧更新的时间间隔会比预想的要慢，甚至不更新。</p>
		 */
		public var interval:Number;

		/**
		 * @private 
		 */
		protected function _getFrameByLabel(label:String):Number{
			return null;
		}

		/**
		 * @private 
		 */
		protected function _frameLoop():void{}

		/**
		 * @private 
		 */
		protected function _resumePlay():void{}

		/**
		 * 停止动画播放。
		 */
		public function stop():void{}

		/**
		 * 是否正在播放中。
		 */
		public function get isPlaying():Boolean{
				return null;
		}

		/**
		 * 增加一个帧标签到指定索引的帧上。当动画播放到此索引的帧时会派发Event.LABEL事件，派发事件是在完成当前帧画面更新之后。
		 * @param label 帧标签名称
		 * @param index 帧索引
		 */
		public function addLabel(label:String,index:Number):void{}

		/**
		 * 删除指定的帧标签。
		 * @param label 帧标签名称。注意：如果为空，则删除所有帧标签！
		 */
		public function removeLabel(label:String):void{}

		/**
		 * @private 
		 */
		private var _removeLabelFromList:*;

		/**
		 * 将动画切换到指定帧并停在那里。
		 * @param position 帧索引或帧标签
		 */
		public function gotoAndStop(position:*):void{}

		/**
		 * 动画当前帧的索引。
		 */
		public var index:Number;

		/**
		 * @private 显示到某帧
		 * @param value 帧索引
		 */
		protected function _displayToIndex(value:Number):void{}

		/**
		 * 当前动画中帧的总数。
		 */
		public function get count():Number{
				return null;
		}

		/**
		 * 停止动画播放，并清理对象属性。之后可存入对象池，方便对象复用。
		 * @return 返回对象本身
		 */
		public function clear():AnimationBase{
			return null;
		}
	}

}
