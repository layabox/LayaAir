/*[IF-FLASH]*/
package laya.ani {
	improt laya.ani.AnimationTemplet;
	improt laya.resource.IDestroy;
	improt laya.events.EventDispatcher;
	public class AnimationPlayer extends laya.events.EventDispatcher implements laya.resource.IDestroy {
		private var _destroyed:*;
		private var _templet:*;
		private var _currentTime:*;
		private var _currentFrameTime:*;
		private var _playStart:*;
		private var _playEnd:*;
		private var _playDuration:*;
		private var _overallDuration:*;
		private var _stopWhenCircleFinish:*;
		private var _startUpdateLoopCount:*;
		private var _currentAnimationClipIndex:*;
		private var _currentKeyframeIndex:*;
		private var _paused:*;
		private var _cacheFrameRate:*;
		private var _cacheFrameRateInterval:*;
		private var _cachePlayRate:*;
		public var isCache:Boolean;
		public var playbackRate:Number;
		public var returnToZeroStopped:Boolean;
		public var templet:AnimationTemplet;
		public function get playStart():Number{};
		public function get playEnd():Number{};
		public function get playDuration():Number{};
		public function get overallDuration():Number{};
		public function get currentAnimationClipIndex():Number{};
		public function get currentKeyframeIndex():Number{};
		public function get currentPlayTime():Number{};
		public function get currentFrameTime():Number{};
		public var cachePlayRate:Number;
		public var cacheFrameRate:Number;
		public var currentTime:Number;
		public var paused:Boolean;
		public function get cacheFrameRateInterval():Number{};
		public function get state():Number{};
		public function get destroyed():Boolean{};

		public function AnimationPlayer(){}
		private var _computeFullKeyframeIndices:*;
		private var _onAnimationTempletLoaded:*;
		private var _calculatePlayDuration:*;
		private var _setPlayParams:*;
		private var _setPlayParamsWhenStop:*;
		public function play(index:Number = null,playbackRate:Number = null,overallDuration:Number = null,playStart:Number = null,playEnd:Number = null):void{}
		public function playByFrame(index:Number = null,playbackRate:Number = null,overallDuration:Number = null,playStartFrame:Number = null,playEndFrame:Number = null,fpsIn3DBuilder:Number = null):void{}
		public function stop(immediate:Boolean = null):void{}
		public function destroy():void{}
	}

}
