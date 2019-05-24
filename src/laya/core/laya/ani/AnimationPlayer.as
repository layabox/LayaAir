package laya.ani {
	import laya.events.Event;
	import laya.events.EventDispatcher;
	import laya.resource.IDestroy;
	import laya.utils.Stat;
	
	/**开始播放时调度。
	 * @eventType Event.PLAYED
	 * */
	[Event(name = "played", type = "laya.events.Event")]
	/**暂停时调度。
	 * @eventType Event.PAUSED
	 * */
	[Event(name = "paused", type = "laya.events.Event")]
	/**完成一次循环时调度。
	 * @eventType Event.COMPLETE
	 * */
	[Event(name = "complete", type = "laya.events.Event")]
	/**停止时调度。
	 * @eventType Event.STOPPED
	 * */
	[Event(name = "stopped", type = "laya.events.Event")]
	
	/**
	 * <code>AnimationPlayer</code> 类用于动画播放器。
	 */
	public class AnimationPlayer extends EventDispatcher implements IDestroy {
		/**@private */
		private var _destroyed:Boolean;
		/** 数据模板*/
		private var _templet:AnimationTemplet;
		/** 当前精确时间，不包括重播时间*/
		private var _currentTime:Number;
		/** 当前帧时间，不包括重播时间*/
		private var _currentFrameTime:Number;	// 这个是根据当前帧数反向计算的时间。
		/** 动画播放的起始时间位置*/
		private var _playStart:Number;
		/** 动画播放的结束时间位置*/
		private var _playEnd:Number;
		/** 动画播放一次的总时间*/
		private var _playDuration:Number;
		/** 动画播放总时间*/
		private var _overallDuration:Number;
		/** 是否在一次动画结束时停止。 设置这个标志后就不会再发送complete事件了*/
		private var _stopWhenCircleFinish:Boolean;
		/** 已播放时间，包括重播时间*/
		public var _elapsedPlaybackTime:Number;
		/** 播放时帧数*/
		private var _startUpdateLoopCount:Number;
		/** 当前动画索引*/
		private var _currentAnimationClipIndex:int;
		/** 当前帧数*/
		private var _currentKeyframeIndex:int;
		/** 是否暂停*/
		private var _paused:Boolean;
		/** 默认帧率,必须大于0*/
		private var _cacheFrameRate:int;
		/** 帧率间隔时间*/
		private var _cacheFrameRateInterval:Number;
		/** 缓存播放速率*/
		private var _cachePlayRate:Number;
		
		/**是否缓存*/
		public var isCache:Boolean = true;
		/** 播放速率*/
		public var playbackRate:Number = 1.0;
		/** 停止时是否归零*/
		public var returnToZeroStopped:Boolean;
		
		/**
		 * 获取动画数据模板
		 * @param	value 动画数据模板
		 */
		public function get templet():AnimationTemplet {
			return _templet;
		}
		
		/**
		 * 设置动画数据模板,注意：修改此值会有计算开销。
		 * @param	value 动画数据模板
		 */
		public function set templet(value:AnimationTemplet):void {
			if (!(state === AnimationState.stopped))
				stop(true);
			
			if (_templet !== value) {
				_templet = value;
				//if (value.loaded)
					_computeFullKeyframeIndices();
				//else
					//value.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, _cacheFrameRate]);
			}
		}
		
		/**
		 * 动画播放的起始时间位置。
		 * @return	 起始时间位置。
		 */
		public function get playStart():Number {
			return _playStart;
		}
		
		/**
		 * 动画播放的结束时间位置。
		 * @return	 结束时间位置。
		 */
		public function get playEnd():Number {
			return _playEnd;
		}
		
		/**
		 * 获取动画播放一次的总时间
		 * @return	 动画播放一次的总时间
		 */
		public function get playDuration():Number {
			return _playDuration;
		}
		
		/**
		 * 获取动画播放的总总时间
		 * @return	 动画播放的总时间
		 */
		public function get overallDuration():Number {
			return _overallDuration;
		}
		
		/**
		 * 获取当前动画索引
		 * @return	value 当前动画索引
		 */
		public function get currentAnimationClipIndex():int {
			return _currentAnimationClipIndex;
		}
		
		/**
		 * 获取当前帧数
		 * @return	 当前帧数
		 */
		public function get currentKeyframeIndex():int {
			return _currentKeyframeIndex;
		}
		
		/**
		 *  获取当前精确时间，不包括重播时间
		 * @return	value 当前时间
		 */
		public function get currentPlayTime():Number {
			return _currentTime + _playStart;
		}
		
		/**
		 *  获取当前帧时间，不包括重播时间
		 * @return	value 当前时间
		 */
		public function get currentFrameTime():Number {
			return _currentFrameTime;
		}
		
		/**
		 *  获取缓存播放速率。*
		 * @return	 缓存播放速率。
		 */
		public function get cachePlayRate():Number {
			return _cachePlayRate;
		}
		
		/**
		 *  设置缓存播放速率,默认值为1.0,注意：修改此值会有计算开销。*
		 * @return	value 缓存播放速率。
		 */
		public function set cachePlayRate(value:Number):void {
			if (_cachePlayRate !== value) {
				_cachePlayRate = value;
				if (_templet)
					//if (_templet.loaded)
						_computeFullKeyframeIndices();
					//else
						//_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [value, _cacheFrameRate]);
			}
		}
		
		/**
		 *  获取默认帧率*
		 * @return	value 默认帧率
		 */
		public function get cacheFrameRate():int {
			return _cacheFrameRate;
		}
		
		/**
		 *  设置默认帧率,每秒60帧,注意：修改此值会有计算开销。*
		 * @return	value 缓存帧率
		 */
		public function set cacheFrameRate(value:int):void {
			if (_cacheFrameRate !== value) {
				_cacheFrameRate = value;
				_cacheFrameRateInterval = 1000.0 / _cacheFrameRate;
				if (_templet)
					//if (_templet.loaded)
						_computeFullKeyframeIndices();
					//else
						//_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, value]);
			}
		}
		
		/**
		 * 设置当前播放位置
		 * @param	value 当前时间
		 */
		public function set currentTime(value:Number):void {
			if (_currentAnimationClipIndex === -1 || !_templet /*|| !_templet.loaded*/)
				return;
			
			if (value < _playStart || value > _playEnd)
				throw new Error("AnimationPlayer:value must large than playStartTime,small than playEndTime.");
			
			_startUpdateLoopCount = Stat.loopCount;
			var cacheFrameInterval:Number = _cacheFrameRateInterval * _cachePlayRate;
			_currentTime = value /*% playDuration*/;
			_currentKeyframeIndex = Math.floor(currentPlayTime / cacheFrameInterval);
			_currentFrameTime = _currentKeyframeIndex * cacheFrameInterval;
		}
		
		/**
		 * 获取当前是否暂停
		 * @return	是否暂停
		 */
		public function get paused():Boolean {
			return _paused;
		}
		
		/**
		 * 设置是否暂停
		 * @param	value 是否暂停
		 */
		public function set paused(value:Boolean):void {
			_paused = value;
			value && this.event(Event.PAUSED);
		}
		
		/**
		 * 获取缓存帧率间隔时间
		 * @return	缓存帧率间隔时间
		 */
		public function get cacheFrameRateInterval():Number {
			return _cacheFrameRateInterval;
		}
		
		/**
		 * 获取当前播放状态
		 * @return	当前播放状态
		 */
		public function get state():int {
			if (_currentAnimationClipIndex === -1)
				return AnimationState.stopped;
			if (_paused)
				return AnimationState.paused;
			return AnimationState.playing;
		}
		
		/**
		 * 获取是否已销毁。
		 * @return 是否已销毁。
		 */
		public function get destroyed():Boolean {
			return _destroyed;
		}
		
		/**
		 * 创建一个 <code>AnimationPlayer</code> 实例。
		 */
		public function AnimationPlayer() {
			_destroyed = false;
			_currentAnimationClipIndex = -1;
			_currentKeyframeIndex = -1;
			_currentTime = 0.0;
			_overallDuration = Number.MAX_VALUE;
			_stopWhenCircleFinish = false;
			_elapsedPlaybackTime = 0;
			_startUpdateLoopCount = -1;
			_cachePlayRate = 1.0;
			cacheFrameRate = 60;
			returnToZeroStopped = false;
		}
		
		/**
		 * @private
		 */
		public function _onTempletLoadedComputeFullKeyframeIndices(cachePlayRate:Number, cacheFrameRate:Number, templet:AnimationTemplet):void {
			if (_templet === templet && _cachePlayRate === cachePlayRate && _cacheFrameRate === cacheFrameRate)
				_computeFullKeyframeIndices();
		}
		
		/**
		 * @private
		 */
		private function _computeFullKeyframeIndices():void {
			return;// 先改成实时计算了。否则占用内存太多
			var templet:AnimationTemplet = _templet;
			if (templet._fullFrames)
				return;
			var anifullFrames:Array = _templet._fullFrames = [];
			
			var cacheFrameInterval:Number = _cacheFrameRateInterval * _cachePlayRate;
			
			for (var i:int = 0, iNum:int = templet.getAnimationCount(); i < iNum; i++) {
				var aniFullFrame:Array = [];
				if (!templet.getAnimation(i).nodes){
					anifullFrames.push(aniFullFrame);
					continue;
				} 
				for (var j:int = 0, jNum:int = templet.getAnimation(i).nodes.length; j < jNum; j++) {
					var node:* = templet.getAnimation(i).nodes[j];
					var frameCount:int = Math.round(node.playTime / cacheFrameInterval);
					var nodeFullFrames:Uint16Array = new Uint16Array(frameCount + 1);//本骨骼对应的全帧关键帧编号
					// 先把关键帧所在的位置填上
					var stidx:int = -1;// 第一帧的位置，应该是0
					var nodeframes:Array = node.keyFrame;
					for (var n:int = 0, nNum:int = nodeframes.length; n < nNum; n++) {
						var keyFrame:* = nodeframes[n];
						var pos:int = Math.round(keyFrame.startTime / cacheFrameInterval);
						if (stidx < 0 && pos>0) {
							stidx = pos;
						}
						if (pos <= frameCount) {// 实际大小是frameCount+1
							nodeFullFrames[pos] = n;
						}
					}
					// 再把空隙填满
					var cf:int = 0;
					for (n = stidx ; n < frameCount; n++) {	// 实际大小是frameCount+1 
						if ( nodeFullFrames[n] == 0) {
							nodeFullFrames[n] = cf;
						}else {
							cf = nodeFullFrames[n]; 	// 新的开始
						}
					}
					aniFullFrame.push(nodeFullFrames);
				}
				anifullFrames.push(aniFullFrame);
			}
		}
		
		/**
		 * @private
		 */
		private function _onAnimationTempletLoaded():void {
			(destroyed) || (_calculatePlayDuration());
		}
		
		/**
		 * @private
		 */
		private function _calculatePlayDuration():void {
			if (state !== AnimationState.stopped) {//防止动画已停止，异步回调导致BUG
				var oriDuration:int = _templet.getAniDuration(_currentAnimationClipIndex);
				(_playEnd === 0) && (_playEnd = oriDuration);
				
				if (_playEnd > oriDuration)//以毫秒为最小时间单位,取整。FillTextureSprite
					_playEnd = oriDuration;
				
				_playDuration = _playEnd - _playStart;
			}
		}
		
		/**
		 * @private
		 */
		private function _setPlayParams(time:Number, cacheFrameInterval:Number):void {
			_currentTime = time;
			_currentKeyframeIndex = Math.floor((currentPlayTime) / cacheFrameInterval + 0.01);
			_currentFrameTime = _currentKeyframeIndex * cacheFrameInterval;
		}
		
		/**
		 * 动画停止了对应的参数。目前都是设置时间为最后
		 * @private
		 */
		private function _setPlayParamsWhenStop(currentAniClipPlayDuration:Number, cacheFrameInterval:Number):void {
			_currentTime = currentAniClipPlayDuration;
			_currentKeyframeIndex = Math.floor(currentAniClipPlayDuration / cacheFrameInterval + 0.01);
			_currentFrameTime = _currentKeyframeIndex * cacheFrameInterval;
			_currentAnimationClipIndex = -1;//动画结束	
		}
		
		/**
		 * @private
		 */
		public function _update(elapsedTime:Number):void {
			if (_currentAnimationClipIndex === -1 || _paused || !_templet /*|| !_templet.loaded*/)//动画停止或暂停，不更新
				return;
			
			var cacheFrameInterval:Number = _cacheFrameRateInterval * _cachePlayRate;
			var time:Number = 0;	// 时间间隔
			// 计算经过的时间
			(_startUpdateLoopCount !== Stat.loopCount) && (time = elapsedTime * playbackRate, _elapsedPlaybackTime += time);//elapsedTime为距离上一帧时间,首帧播放如果_startPlayLoopCount===Stat.loopCount，则不累加时间
			
			var currentAniClipPlayDuration:Number = playDuration;
			// 如果设置了总播放时间，并且超过总播放时间了，就发送stop事件
			// 如果没有设置_overallDuration，且播放时间超过的动画总时间，也发送stop事件？  也就是说单次播放不会发出complete事件？
			// 如果设置了loop播放，则会设置 _overallDuration 
			if ((_overallDuration !== 0 && _elapsedPlaybackTime >= _overallDuration) || (_overallDuration === 0 && _elapsedPlaybackTime >= currentAniClipPlayDuration)) {
				_setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);	// (总播放时间,缓存帧的时间间隔(33.33))
				this.event(Event.STOPPED);
				return;
			}
			time += _currentTime;
			if (currentAniClipPlayDuration > 0) {// 如果设置了 总动画时间，一般都设置了把，就是动画文件本身记录的时间
				if (time >= currentAniClipPlayDuration) {	// 如果超出了总动画时间
					if (_stopWhenCircleFinish) {// 如果只播放一次，就发送stop事件
						_setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);// (总播放时间,缓存帧的时间间隔(33.33))
						_stopWhenCircleFinish = false;
						this.event(Event.STOPPED);
						return;
					}else {
						// 如果多次播放,发送complete事件
						time = time % currentAniClipPlayDuration;
						_setPlayParams(time, cacheFrameInterval);
						this.event(Event.COMPLETE);
						return;
					}
				} else {
					_setPlayParams(time, cacheFrameInterval);
				}
			} else {
				if (_stopWhenCircleFinish) {
					_setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
					_stopWhenCircleFinish = false;
					this.event(Event.STOPPED);
					return;
				}
				_currentTime = _currentFrameTime = _currentKeyframeIndex = 0;
				this.event(Event.COMPLETE);
			}
		}
		
		/**
		 * @private
		 */
		public function _destroy():void {
			offAll();
			_templet = null;
			//_fullFrames = null;
			_destroyed = true;
		}
		
		/**
		 * 播放动画。
		 * @param	index 动画索引。
		 * @param	playbackRate 播放速率。
		 * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param	playStart 播放的起始时间位置。
		 * @param	playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
		 */
		public function play(index:int = 0, playbackRate:Number = 1.0, overallDuration:int = /*int.MAX_VALUE*/ 2147483647, playStart:Number = 0, playEnd:Number = 0):void {
			if (!_templet)
				throw new Error("AnimationPlayer:templet must not be null,maybe you need to set url.");
			
			if (overallDuration < 0 || playStart < 0 || playEnd < 0)
				throw new Error("AnimationPlayer:overallDuration,playStart and playEnd must large than zero.");
			
			if ((playEnd !== 0) && (playStart > playEnd))
				throw new Error("AnimationPlayer:start must less than end.");
			
			_currentTime = 0;
			_currentFrameTime = 0;
			_elapsedPlaybackTime = 0;
			this.playbackRate = playbackRate;
			_overallDuration = overallDuration;
			_playStart = playStart;
			_playEnd = playEnd;
			_paused = false;
			_currentAnimationClipIndex = index;
			_currentKeyframeIndex = 0;
			_startUpdateLoopCount = Stat.loopCount;
			this.event(Event.PLAYED);
			
			//if (_templet.loaded)
				_calculatePlayDuration();
			//else
				//_templet.once(Event.LOADED, this, _onAnimationTempletLoaded);
			
			_update(0);//如果分段播放,可修正帧率
		}
		
		/**
		 * 播放动画。
		 * @param	index 动画索引。
		 * @param	playbackRate 播放速率。
		 * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
		 * @param	playStartFrame 播放的原始起始帧率位置。
		 * @param	playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
		 */
		public function playByFrame(index:int = 0, playbackRate:Number = 1.0, overallDuration:Number = /*int.MAX_VALUE*/ 2147483647, playStartFrame:Number = 0, playEndFrame:Number = 0, fpsIn3DBuilder:int = 30):void {
			var interval:Number = 1000.0 / fpsIn3DBuilder;
			play(index, playbackRate, overallDuration, playStartFrame * interval, playEndFrame * interval);
		}
		
		/**
		 * 停止播放当前动画
		 * 如果不是立即停止就等待动画播放完成后再停止
		 * @param	immediate 是否立即停止
		 */
		public function stop(immediate:Boolean = true):void {
			if (immediate) {
				_currentTime = _currentFrameTime = _currentKeyframeIndex = 0;
				_currentAnimationClipIndex = -1;
				this.event(Event.STOPPED);
			} else {
				_stopWhenCircleFinish = true;
			}
		}
		
		/**
		 * @private
		 */
		public function destroy():void{
			
		}
	
	}
}