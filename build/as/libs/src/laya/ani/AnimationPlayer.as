package laya.ani {
	import laya.ani.AnimationTemplet;
	import laya.resource.IDestroy;
	import laya.events.EventDispatcher;

	/**
	 * 开始播放时调度。
	 * @eventType Event.PLAYED
	 */

	/**
	 * 暂停时调度。
	 * @eventType Event.PAUSED
	 */

	/**
	 * 完成一次循环时调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 停止时调度。
	 * @eventType Event.STOPPED
	 */

	/**
	 * <code>AnimationPlayer</code> 类用于动画播放器。
	 */
	public class AnimationPlayer extends EventDispatcher implements IDestroy {

		/**
		 * 是否缓存
		 */
		public var isCache:Boolean;

		/**
		 * 播放速率
		 */
		public var playbackRate:Number;

		/**
		 * 停止时是否归零
		 */
		public var returnToZeroStopped:Boolean;

		/**
		 * 获取动画数据模板
		 * @param value 动画数据模板
		 */

		/**
		 * 设置动画数据模板,注意：修改此值会有计算开销。
		 * @param value 动画数据模板
		 */
		public var templet:AnimationTemplet;

		/**
		 * 动画播放的起始时间位置。
		 * @return 起始时间位置。
		 */
		public function get playStart():Number{
				return null;
		}

		/**
		 * 动画播放的结束时间位置。
		 * @return 结束时间位置。
		 */
		public function get playEnd():Number{
				return null;
		}

		/**
		 * 获取动画播放一次的总时间
		 * @return 动画播放一次的总时间
		 */
		public function get playDuration():Number{
				return null;
		}

		/**
		 * 获取动画播放的总总时间
		 * @return 动画播放的总时间
		 */
		public function get overallDuration():Number{
				return null;
		}

		/**
		 * 获取当前动画索引
		 * @return value 当前动画索引
		 */
		public function get currentAnimationClipIndex():Number{
				return null;
		}

		/**
		 * 获取当前帧数
		 * @return 当前帧数
		 */
		public function get currentKeyframeIndex():Number{
				return null;
		}

		/**
		 * 获取当前精确时间，不包括重播时间
		 * @return value 当前时间
		 */
		public function get currentPlayTime():Number{
				return null;
		}

		/**
		 * 获取当前帧时间，不包括重播时间
		 * @return value 当前时间
		 */
		public function get currentFrameTime():Number{
				return null;
		}

		/**
		 * 获取缓存播放速率。*
		 * @return 缓存播放速率。
		 */

		/**
		 * 设置缓存播放速率,默认值为1.0,注意：修改此值会有计算开销。*
		 * @return value 缓存播放速率。
		 */
		public var cachePlayRate:Number;

		/**
		 * 获取默认帧率*
		 * @return value 默认帧率
		 */

		/**
		 * 设置默认帧率,每秒60帧,注意：修改此值会有计算开销。*
		 * @return value 缓存帧率
		 */
		public var cacheFrameRate:Number;

		/**
		 * 设置当前播放位置
		 * @param value 当前时间
		 */
		public var currentTime:Number;

		/**
		 * 获取当前是否暂停
		 * @return 是否暂停
		 */

		/**
		 * 设置是否暂停
		 * @param value 是否暂停
		 */
		public var paused:Boolean;

		/**
		 * 获取缓存帧率间隔时间
		 * @return 缓存帧率间隔时间
		 */
		public function get cacheFrameRateInterval():Number{
				return null;
		}

		/**
		 * 获取当前播放状态
		 * @return 当前播放状态
		 */
		public function get state():Number{
				return null;
		}

		/**
		 * 获取是否已销毁。
		 * @return 是否已销毁。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>AnimationPlayer</code> 实例。
		 */

		public function AnimationPlayer(){}

		/**
		 * @private 
		 */
		private var _setPlayParams:*;

		/**
		 * 动画停止了对应的参数。目前都是设置时间为最后
		 * @private 
		 */
		private var _setPlayParamsWhenStop:*;

		/**
		 * 播放动画。
		 * @param index 动画索引。
		 * @param playbackRate 播放速率。
		 * @param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param playStart 播放的起始时间位置。
		 * @param playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
		 */
		public function play(index:Number = null,playbackRate:Number = null,overallDuration:Number = null,playStart:Number = null,playEnd:Number = null):void{}

		/**
		 * 播放动画。
		 * @param index 动画索引。
		 * @param playbackRate 播放速率。
		 * @param duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param playStartFrame 播放的原始起始帧率位置。
		 * @param playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
		 */
		public function playByFrame(index:Number = null,playbackRate:Number = null,overallDuration:Number = null,playStartFrame:Number = null,playEndFrame:Number = null,fpsIn3DBuilder:Number = null):void{}

		/**
		 * 停止播放当前动画
		 * 如果不是立即停止就等待动画播放完成后再停止
		 * @param immediate 是否立即停止
		 */
		public function stop(immediate:Boolean = null):void{}

		/**
		 * @private 
		 */
		public function destroy():void{}
	}

}
