package laya.ani.bone {
	import laya.ani.AnimationPlayer;
	import laya.ani.GraphicsAni;
	import laya.display.Graphics;
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Matrix;
	import laya.net.Loader;
	import laya.resource.Texture;
	import laya.utils.Browser;
	import laya.utils.Byte;
	import laya.utils.Handler;
	import laya.utils.Timer;
	import laya.media.SoundManager;
	import laya.media.SoundChannel;
	
	/**动画开始播放调度
	 * @eventType Event.PLAYED
	 * */
	[Event(name = "played", type = "laya.events.Event.PLAYED", desc = "动画开始播放调度")]
	/**动画停止播放调度
	 * @eventType Event.STOPPED
	 * */
	[Event(name = "stopped", type = "laya.events.Event.STOPPED", desc = "动画停止播放调度")]
	/**动画暂停播放调度
	 * @eventType Event.PAUSED
	 * */
	[Event(name = "paused", type = "laya.events.Event.PAUSED", desc = "动画暂停播放调度")]
	/**自定义事件。
	 * @eventType Event.LABEL
	 */
	[Event(name = "label", type = "laya.events.Event.LABEL", desc = "自定义事件")]
	/**
	 * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
	 */
	public class Skeleton extends Sprite {
		/**
		 * 在canvas模式是否使用简化版的mesh绘制，简化版的mesh将不进行三角形绘制，而改为矩形绘制，能极大提高性能，但是可能某些mesh动画效果会不太正常
		 */
		public static var useSimpleMeshInCanvas:Boolean = false;
		protected var _templet:Templet;//动画解析器
		/** @private */
		protected var _player:AnimationPlayer;//播放器
		/** @private */
		protected var _curOriginalData:Float32Array;//当前骨骼的偏移数据
		private var _boneMatrixArray:Array = [];//当前骨骼动画的最终结果数据
		private var _lastTime:Number = 0;//上次的帧时间
		private var _currAniName:String = null;
		private var _currAniIndex:int = -1;
		private var _pause:Boolean = true;
		/** @private */
		protected var _aniClipIndex:int = -1;
		/** @private */
		protected var _clipIndex:int = -1;
		private var _skinIndex:int = 0;
		private var _skinName:String = "default";
		private var _aniMode:int = 0;//
		//当前动画自己的缓冲区
		private var _graphicsCache:Array;
		
		private var _boneSlotDic:Object;
		private var _bindBoneBoneSlotDic:Object;
		private var _boneSlotArray:Array;
		
		private var _index:int = -1;
		private var _total:int = -1;
		private var _indexControl:Boolean = false;
		//加载路径
		private var _aniPath:String;
		private var _texturePath:String;
		private var _complete:Handler;
		private var _loadAniMode:int;
		
		private var _yReverseMatrix:Matrix;
		
		private var _ikArr:Array;
		private var _tfArr:Array;
		private var _pathDic:Object;
		private var _rootBone:Bone;
		/** @private */
		protected var _boneList:Vector.<Bone>;
		/** @private */
		protected var _aniSectionDic:Object;		// section 是每段数据(transform,slot,ik,path)的长度，这个是一个section的数据，表示每个clip的section数据
		private var _eventIndex:int = 0;
		private var _drawOrderIndex:int = 0;
		private var _drawOrder:Vector.<int> = null;
		private var _lastAniClipIndex:int = -1;
		private var _lastUpdateAniClipIndex:int = -1;
		private var _playAudio:Boolean = true;
		private var _soundChannelArr:Array = [];
		
		
		
		
		/**
		 * 创建一个Skeleton对象
		 *
		 * @param	templet	骨骼动画模板
		 * @param	aniMode	动画模式，0不支持换装，1、2支持换装
		 */
		public function Skeleton(templet:Templet = null, aniMode:int = 0):void {
			if (templet) init(templet, aniMode);
		}
		
		/**
		 * 初始化动画
		 * @param	templet		模板
		 * @param	aniMode		动画模式
		 * <table>
		 * 	<tr><th>模式</th><th>描述</th></tr>
		 * 	<tr>
		 * 		<td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
		 * 	</tr>
		 * 	<tr>
		 * 		<td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）</td>
		 * 	</tr>
		 * 	<tr>
		 * 		<td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
		 * </tr>
		 * </table>
		 */
		public function init(templet:Templet, aniMode:int = 0):void {
			var i:int, n:int;
			//aniMode = 2;
			if (aniMode == 1)//使用动画自己的缓冲区
			{
				_graphicsCache = [];
				for (i = 0, n = templet.getAnimationCount(); i < n; i++) {
					_graphicsCache.push([]);
				}
			}
			_yReverseMatrix = templet.yReverseMatrix;
			_aniMode = aniMode;
			_templet = templet;
			_templet._addReference(1);
			_player = new AnimationPlayer();
			_player.cacheFrameRate = templet.rate;
			_player.templet = templet;
			_player.play();
			_parseSrcBoneMatrix();
			//骨骼数据
			_boneList = templet.mBoneArr;
			_rootBone = templet.mRootBone;
			_aniSectionDic = templet.aniSectionDic;
			//ik作用器
			if (templet.ikArr.length > 0) {
				_ikArr = [];
				for (i = 0, n = templet.ikArr.length; i < n; i++) {
					_ikArr.push(new IkConstraint(templet.ikArr[i], _boneList));
				}
			}
			//path作用器
			if (templet.pathArr.length > 0) {
				var tPathData:PathConstraintData;
				var tPathConstraint:PathConstraint;
				if (_pathDic == null) _pathDic = {};
				var tBoneSlot:BoneSlot;
				for (i = 0, n = templet.pathArr.length; i < n; i++) {
					tPathData = templet.pathArr[i];
					tPathConstraint = new PathConstraint(tPathData, _boneList);
					tBoneSlot = _boneSlotDic[tPathData.name];
					if (tBoneSlot) {
						tPathConstraint = new PathConstraint(tPathData, _boneList);
						tPathConstraint.target = tBoneSlot;
					}
					_pathDic[tPathData.name] = tPathConstraint;
				}
			}
			//tf作用器
			if (templet.tfArr.length > 0) {
				_tfArr = [];
				for (i = 0, n = templet.tfArr.length; i < n; i++) {
					_tfArr.push(new TfConstraint(templet.tfArr[i], _boneList));
				}
			}
			if (templet.skinDataArray.length > 0) {
				var tSkinData:SkinData = _templet.skinDataArray[_skinIndex];
				_skinName = tSkinData.name;
			}
			_player.on(Event.PLAYED, this, _onPlay);
			_player.on(Event.STOPPED, this, _onStop);
			_player.on(Event.PAUSED, this, _onPause);
		}
		
		/**
		 * 得到资源的URL
		 */
		public function get url():String {
			return _aniPath;
		}
		
		/**
		 * 设置动画路径
		 */
		public function set url(path:String):void {
			load(path);
		}
		
		/**
		 * 通过加载直接创建动画
		 * @param	path		要加载的动画文件路径
		 * @param	complete	加载完成的回调函数
		 * @param	aniMode		与<code>Skeleton.init</code>的<code>aniMode</code>作用一致
		 */
		public function load(path:String, complete:Handler = null, aniMode:int = 0):void {
			_aniPath = path;
			_complete = complete;
			_loadAniMode = aniMode;
			Laya.loader.load([{url: path, type: Loader.BUFFER}], Handler.create(this, _onLoaded));
		}
		
		/**
		 * 加载完成
		 */
		private function _onLoaded():void {
			var arraybuffer:ArrayBuffer = Loader.getRes(_aniPath);
			if (arraybuffer == null) return;
			if (Templet.TEMPLET_DICTIONARY == null) {
				Templet.TEMPLET_DICTIONARY = {};
			}
			var tFactory:Templet;
			tFactory = Templet.TEMPLET_DICTIONARY[_aniPath];
			if (tFactory) {
				if (tFactory.isParseFail) {
					_parseFail();
				} else {
					if (tFactory.isParserComplete) {
						_parseComplete();
					} else {
						tFactory.on(Event.COMPLETE, this, _parseComplete);
						tFactory.on(Event.ERROR, this, _parseFail);
					}
				}
				
			} else {
				tFactory = new Templet();
				tFactory._setCreateURL(_aniPath);
				Templet.TEMPLET_DICTIONARY[_aniPath] = tFactory;
				tFactory.on(Event.COMPLETE, this, _parseComplete);
				tFactory.on(Event.ERROR, this, _parseFail);
				tFactory.isParserComplete = false;
				tFactory.parseData(null, arraybuffer);
			}
		}
		
		/**
		 * 解析完成
		 */
		private function _parseComplete():void {
			var tTemple:Templet = Templet.TEMPLET_DICTIONARY[_aniPath];
			if (tTemple) {
				init(tTemple, _loadAniMode);
				play(0, true);
			}
			_complete && _complete.runWith(this);
		}
		
		/**
		 * 解析失败
		 */
		private function _parseFail():void {
			trace("[Error]:" + _aniPath + "解析失败");
		}
		
		/**
		 * 传递PLAY事件
		 */
		private function _onPlay():void {
			this.event(Event.PLAYED);
		}
		
		/**
		 * 传递STOP事件
		 */
		private function _onStop():void {
			//把没播的事件播完
			var tEventData:EventData;
			var tEventAniArr:Array = _templet.eventAniArr;
			var tEventArr:Vector.<EventData> = tEventAniArr[_aniClipIndex];
			if (tEventArr && _eventIndex < tEventArr.length) {
				for (; _eventIndex < tEventArr.length; _eventIndex++) {
					tEventData = tEventArr[_eventIndex];
					if (tEventData.time >= _player.playStart && tEventData.time <= _player.playEnd) {
						this.event(Event.LABEL, tEventData);
					}
				}
			}
			//_eventIndex = 0;
			_drawOrder = null;
			this.event(Event.STOPPED);
		}
		
		/**
		 * 传递PAUSE事件
		 */
		private function _onPause():void {
			this.event(Event.PAUSED);
		}
		
		/**
		 * 创建骨骼的矩阵，保存每次计算的最终结果
		 */
		private function _parseSrcBoneMatrix():void {
			var i:int = 0, n:int = 0;
			n = _templet.srcBoneMatrixArr.length;
			for (i = 0; i < n; i++) {
				_boneMatrixArray.push(new Matrix());
			}
			if (_aniMode == 0) {
				_boneSlotDic = _templet.boneSlotDic;
				_bindBoneBoneSlotDic = _templet.bindBoneBoneSlotDic;
				_boneSlotArray = _templet.boneSlotArray;
			} else {
				if (_boneSlotDic == null) _boneSlotDic = {};
				if (_bindBoneBoneSlotDic == null) _bindBoneBoneSlotDic = {};
				if (_boneSlotArray == null) _boneSlotArray = [];
				var tArr:Array = _templet.boneSlotArray;
				var tBS:BoneSlot;
				var tBSArr:Array;
				for (i = 0, n = tArr.length; i < n; i++) {
					tBS = tArr[i];
					tBSArr = _bindBoneBoneSlotDic[tBS.parent];
					if (tBSArr == null) {
						_bindBoneBoneSlotDic[tBS.parent] = tBSArr = [];
					}
					_boneSlotDic[tBS.name] = tBS = tBS.copy();
					tBSArr.push(tBS);
					_boneSlotArray.push(tBS);
				}
			}
		}
		
		private function _emitMissedEvents(startTime:Number, endTime:Number, startIndex:int = 0):void {
			var tEventAniArr:Array = _templet.eventAniArr;
			var tEventArr:Vector.<EventData> = tEventAniArr[_player.currentAnimationClipIndex];
			if (tEventArr) {
				var i:int, len:int;
				var tEventData:EventData;
				len = tEventArr.length;
				for (i = startIndex; i < len; i++) {
					tEventData = tEventArr[i];
					if (tEventData.time >= _player.playStart && tEventData.time <= _player.playEnd) {
						this.event(Event.LABEL, tEventData);
					}
				}
			}
		}
		
		/**
		 * 更新动画
		 * @param	autoKey true为正常更新，false为index手动更新
		 */
		private function _update(autoKey:Boolean = true):void {
			if (_pause) return;
			if (autoKey && _indexControl) {
				return;
			}
			var tCurrTime:Number = timer.currTimer;
			var preIndex:int = _player.currentKeyframeIndex;
			var dTime:Number = tCurrTime - _lastTime;
			if (autoKey) {
				// player update，更新当前帧数，判断是否stop或者complete
				_player._update(dTime);
			} else {
				preIndex = -1;
			}
			_lastTime = tCurrTime;
			if (!_player) return;
			_index = _clipIndex = _player.currentKeyframeIndex;	// 当前所在帧
			if (_index < 0) return;
			if (dTime > 0 && _clipIndex == preIndex && _lastUpdateAniClipIndex == _aniClipIndex) {
				return;
			}
			_lastUpdateAniClipIndex = _aniClipIndex;
			if (preIndex > _clipIndex && _eventIndex != 0) {
				_emitMissedEvents(_player.playStart, _player.playEnd, _eventIndex);
				_eventIndex = 0;
			}
			
			// 自定义事件的检查
			var tEventArr:Vector.<EventData> = _templet.eventAniArr[_aniClipIndex];
			if (tEventArr && _eventIndex < tEventArr.length) {
				var tEventData:EventData = tEventArr[_eventIndex];
				if (tEventData.time >= _player.playStart && tEventData.time <= _player.playEnd) {
					if (_player.currentPlayTime >= tEventData.time) {
						this.event(Event.LABEL, tEventData);
						_eventIndex++;
						if (_playAudio && tEventData.audioValue && tEventData.audioValue !== "null") {
							var _soundChannel: SoundChannel = SoundManager.playSound(_player.templet._path + tEventData.audioValue, 1, Handler.create(this, _onAniSoundStoped));
							_soundChannel && _soundChannelArr.push(_soundChannel);
						}
					}
				} else {
					_eventIndex++;
				}
			}
			
			var tGraphics:Graphics;
			
			if (_aniMode == 0 ) {	
				// 从templet中找到缓存的这一帧的 graphics
				tGraphics = _templet.getGrahicsDataWithCache(_aniClipIndex, _clipIndex)||_createGraphics();// _clipIndex是 AnimationPlayer计算出来的
				if (tGraphics && graphics!=tGraphics) {
					this.graphics = tGraphics;
				}
			} else if (_aniMode == 1) {
				tGraphics = _getGrahicsDataWithCache(_aniClipIndex, _clipIndex) || _createGraphics();	// 与0的区别是从this get，上面是从templet get
				if (tGraphics && graphics!=tGraphics) {
					this.graphics = tGraphics;
				}
			}else{
				_createGraphics();
			}
		}

		/**
		 * @private
		 * 清掉播放完成的音频
		 * @param force 是否强制删掉所有的声音channel
		 */
		private function _onAniSoundStoped(force: Boolean): void {
			var _channel: SoundChannel;
			for (var len:Number = _soundChannelArr.length, i:Number = 0; i < len; i++) {
				_channel = _soundChannelArr[i];
				if (_channel.isStopped || force) {
					!_channel.isStopped && _channel.stop();
					_soundChannelArr.splice(i, 1);
					// SoundManager.removeChannel(_channel); // TODO 是否需要? 去掉有什么好处? 是否还需要其他操作?
					len--; i--;
				}
			}
		}
		
		/**
		 * @private
		 * 创建grahics图像. 并且保存到cache中
		 * @param	_clipIndex 第几帧
		 */
		protected function _createGraphics(_clipIndex:int = -1):GraphicsAni {
			if (_clipIndex == -1) _clipIndex = this._clipIndex;
			var curTime:Number = _clipIndex * _player.cacheFrameRateInterval;
			//处理绘制顺序
			var tDrawOrderData:DrawOrderData;
			var tDrawOrderAniArr:Array = _templet.drawOrderAniArr;
			// 当前动作的 drawOrderArray 信息
			var tDrawOrderArr:Vector.<DrawOrderData> = tDrawOrderAniArr[_aniClipIndex];
			if (tDrawOrderArr && tDrawOrderArr.length > 0) {
				// 选出当前所在帧的 drawOrderArray
				_drawOrderIndex = 0;	// 从0开始
				tDrawOrderData = tDrawOrderArr[_drawOrderIndex];
				while (curTime >= tDrawOrderData.time) {
					_drawOrder = tDrawOrderData.drawOrder;
					_drawOrderIndex++;	// 下一帧
					if (_drawOrderIndex >= tDrawOrderArr.length) {
						break;
					}
					tDrawOrderData = tDrawOrderArr[_drawOrderIndex];
				}
			}
			
			//要用的graphics
			if (_aniMode == 0 || _aniMode == 1) {	// 有缓存的情况
				this.graphics = GraphicsAni.create();// new GraphicsAni();
			} else {			// 实时计算的情况。 每次都是新的数据，因此要把上一帧的清理一下
				if (this.graphics is GraphicsAni) {
					this.graphics.clear();
				} else {
					this.graphics = GraphicsAni.create(); //new GraphicsAni();
				}
			}
			var tGraphics:GraphicsAni = this.graphics as GraphicsAni;
			//获取骨骼数据
			var bones:Array = _templet.getNodes(_aniClipIndex);
			// 现在把帧数计算改成实时的，根据时间算，因此时间要求准确，不能再用curTime了。
			// 用curTime可能会出一个bug就是没有到达最后一帧。例如最后两帧间隔很短
			var stopped = _player.state == 0;
			
			_templet.getOriginalData(_aniClipIndex, _curOriginalData, /*_templet._fullFrames[_aniClipIndex]*/null, _clipIndex, stopped?(curTime+_player.cacheFrameRateInterval):curTime);
			var tSectionArr:Array = _aniSectionDic[_aniClipIndex];
			var tParentMatrix:Matrix;//父骨骼矩阵的引用
			var tStartIndex:int = 0;
			var i:int = 0, j:int = 0, k:int = 0, n:int = 0;
			var tDBBoneSlot:BoneSlot;
			var tDBBoneSlotArr:Array;
			var tParentTransform:Transform;
			var tSrcBone:Bone;
			//对骨骼数据进行计算
			var boneCount:int = _templet.srcBoneMatrixArr.length;
			var origDt:Float32Array = _curOriginalData;
			for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
				tSrcBone = _boneList[i];
				var resultTrans:Transform = tSrcBone.resultTransform;
				tParentTransform = _templet.srcBoneMatrixArr[i];
				resultTrans.scX = tParentTransform.scX * origDt[tStartIndex++];
				resultTrans.skX = tParentTransform.skX + origDt[tStartIndex++];
				resultTrans.skY = tParentTransform.skY + origDt[tStartIndex++];
				resultTrans.scY = tParentTransform.scY * origDt[tStartIndex++];
				resultTrans.x = tParentTransform.x + origDt[tStartIndex++];
				resultTrans.y = tParentTransform.y + origDt[tStartIndex++];
				if (_templet.tMatrixDataLen === 8) {
					resultTrans.skewX = tParentTransform.skewX + origDt[tStartIndex++];
					resultTrans.skewY = tParentTransform.skewY + origDt[tStartIndex++];
				}
				
			}
			//对插槽进行插值计算
			var tSlotDic:Object = {};
			var tSlotAlphaDic:Object = {};
			var tBoneData:*;
			for (n += tSectionArr[1]; i < n; i++) {
				tBoneData = bones[i];
				tSlotDic[tBoneData.name] = origDt[tStartIndex++];
				tSlotAlphaDic[tBoneData.name] = origDt[tStartIndex++];	// 每一个slot的alpha?
				//预留
				tStartIndex += 4;
			}
			//ik
			var tBendDirectionDic:Object = {};
			var tMixDic:Object = {};
			for (n += tSectionArr[2]; i < n; i++) {
				tBoneData = bones[i];
				tBendDirectionDic[tBoneData.name] = origDt[tStartIndex++];
				tMixDic[tBoneData.name] = origDt[tStartIndex++];
				//预留
				tStartIndex += 4;
			}
			//path
			if (_pathDic) {
				var tPathConstraint:PathConstraint;
				for (n += tSectionArr[3]; i < n; i++) {
					tBoneData = bones[i];
					tPathConstraint = _pathDic[tBoneData.name];
					if (tPathConstraint) {
						var tByte:Byte = new Byte(tBoneData.extenData);
						switch (tByte.getByte()) {
						case 1://position
							tPathConstraint.position = origDt[tStartIndex++];
							break;
						case 2://spacing
							tPathConstraint.spacing = origDt[tStartIndex++];
							break;
						case 3://mix
							tPathConstraint.rotateMix = origDt[tStartIndex++];
							tPathConstraint.translateMix = origDt[tStartIndex++];
							break;
						}
					}
				}
			}
			
			// 从root开始级联矩阵
			_rootBone.update(_yReverseMatrix || Matrix.TEMP.identity());
			
			//刷新IK作用器
			if (_ikArr) {
				var tIkConstraint:IkConstraint;
				for (i = 0, n = _ikArr.length; i < n; i++) {
					tIkConstraint = _ikArr[i];
					if (tBendDirectionDic.hasOwnProperty(tIkConstraint.name)) {
						tIkConstraint.bendDirection = tBendDirectionDic[tIkConstraint.name];
					}
					if (tMixDic.hasOwnProperty(tIkConstraint.name)) {
						tIkConstraint.mix = tMixDic[tIkConstraint.name]
					}
					tIkConstraint.apply();
						//tIkConstraint.updatePos(this.x, this.y);
				}
			}
			//刷新PATH作用器
			if (_pathDic) {
				for (var tPathStr:String in _pathDic) {
					tPathConstraint = _pathDic[tPathStr];
					tPathConstraint.apply(_boneList, tGraphics);
				}
			}
			//刷新transform作用器
			if (_tfArr) {
				var tTfConstraint:TfConstraint;
				for (i = 0, k = _tfArr.length; i < k; i++) {
					tTfConstraint = _tfArr[i];
					tTfConstraint.apply();
				}
			}
			
			for (i = 0, k = _boneList.length; i < k; i++) {
				tSrcBone = _boneList[i];
				tDBBoneSlotArr = _bindBoneBoneSlotDic[tSrcBone.name];
				tSrcBone.resultMatrix.copyTo(_boneMatrixArray[i]);
				if (tDBBoneSlotArr) {
					for (j = 0, n = tDBBoneSlotArr.length; j < n; j++) {
						tDBBoneSlot = tDBBoneSlotArr[j];
						if (tDBBoneSlot) {
							tDBBoneSlot.setParentMatrix(tSrcBone.resultMatrix);
						}
					}
				}
			}
			var tDeformDic:Object = {};
			//变形动画作用器
			var tDeformAniArr:Array = _templet.deformAniArr;
			var tDeformAniData:DeformAniData;
			var tDeformSlotData:DeformSlotData;
			var tDeformSlotDisplayData:DeformSlotDisplayData;
			if (tDeformAniArr && tDeformAniArr.length > 0) {
				if (_lastAniClipIndex != _aniClipIndex) {
					_lastAniClipIndex = _aniClipIndex;
					for (i = 0, n = _boneSlotArray.length; i < n; i++) {
						tDBBoneSlot = _boneSlotArray[i];
						tDBBoneSlot.deformData = null;
					}
				}
				var tSkinDeformAni:Object = tDeformAniArr[_aniClipIndex];
				//使用default数据
				tDeformAniData = (tSkinDeformAni["default"]) as DeformAniData;
				_setDeform(tDeformAniData, tDeformDic, _boneSlotArray, curTime);
				
				//使用其他皮肤的数据
				var tSkin:String;
				for (tSkin in tSkinDeformAni) {
					if (tSkin != "default" && tSkin != _skinName) {
						tDeformAniData = tSkinDeformAni[tSkin] as DeformAniData;
						_setDeform(tDeformAniData, tDeformDic, _boneSlotArray, curTime);
					}
				}
				
				//使用自己皮肤的数据
				tDeformAniData = (tSkinDeformAni[_skinName]) as DeformAniData;
				_setDeform(tDeformAniData, tDeformDic, _boneSlotArray, curTime);
			}
			
			//_rootBone.updateDraw(this.x,this.y);
			var tSlotData2:*;
			var tSlotData3:*;
			var tObject:Object;
			//把动画按插槽顺序画出来
			if (_drawOrder) {
				for (i = 0, n = _drawOrder.length; i < n; i++) {
					tDBBoneSlot = _boneSlotArray[_drawOrder[i]];
					tSlotData2 = tSlotDic[tDBBoneSlot.name];
					tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
					if (!isNaN(tSlotData3)) {	// 如果alpha有值的话
						//tGraphics.save();
						//tGraphics.alpha(tSlotData3);
					}
					if (!isNaN(tSlotData2) && tSlotData2 != -2) {
						
						if (_templet.attachmentNames) {
							tDBBoneSlot.showDisplayByName(_templet.attachmentNames[tSlotData2]);
						} else {
							tDBBoneSlot.showDisplayByIndex(tSlotData2);
						}
					}
					if (tDeformDic[_drawOrder[i]]) {
						tObject = tDeformDic[_drawOrder[i]];
						if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
							tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
						} else {
							tDBBoneSlot.deformData = null;
						}
					} else {
						tDBBoneSlot.deformData = null;
					}
					if (!isNaN(tSlotData3)) {
						tDBBoneSlot.draw(tGraphics, _boneMatrixArray, _aniMode == 2, tSlotData3);
					} else {
						tDBBoneSlot.draw(tGraphics, _boneMatrixArray, _aniMode == 2);
					}
					if (!isNaN(tSlotData3)) {
						//tGraphics.restore();
					}
				}
			} else {
				for (i = 0, n = _boneSlotArray.length; i < n; i++) {
					tDBBoneSlot = _boneSlotArray[i];
					tSlotData2 = tSlotDic[tDBBoneSlot.name];
					tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
					if (!isNaN(tSlotData3)) {
						//tGraphics.save();
						//tGraphics.alpha(tSlotData3);
					}
					if (!isNaN(tSlotData2) && tSlotData2 != -2) {
						if (_templet.attachmentNames) {
							tDBBoneSlot.showDisplayByName(_templet.attachmentNames[tSlotData2]);
						} else {
							tDBBoneSlot.showDisplayByIndex(tSlotData2);
						}
					}
					if (tDeformDic[i]) {
						tObject = tDeformDic[i];
						if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
							tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
						} else {
							tDBBoneSlot.deformData = null;
						}
					} else {
						tDBBoneSlot.deformData = null;
					}
					if (!isNaN(tSlotData3)) {
						tDBBoneSlot.draw(tGraphics, _boneMatrixArray, _aniMode == 2, tSlotData3);
					} else {
						tDBBoneSlot.draw(tGraphics, _boneMatrixArray, _aniMode == 2);
					}
					if (!isNaN(tSlotData3)) {
						//tGraphics.restore();
					}
				}
			}
			if (_aniMode == 0) {
				_templet.setGrahicsDataWithCache(_aniClipIndex, _clipIndex, tGraphics);
				_checkIsAllParsed(_aniClipIndex);
			} else if (_aniMode == 1) {
				_setGrahicsDataWithCache(_aniClipIndex, _clipIndex, tGraphics);
			}
			return tGraphics;
		}
		
		private function _checkIsAllParsed(_aniClipIndex:int):void
		{
			var i:int, len:int;
			len = Math.floor(0.01+_templet.getAniDuration(_aniClipIndex) / 1000 * _player.cacheFrameRate);
			for ( i= 0; i < len; i++)
			{
				if (!_templet.getGrahicsDataWithCache(_aniClipIndex, i)) return;
			}
			if (!_templet.getGrahicsDataWithCache(_aniClipIndex, len))
			{
				_createGraphics(len);
				return;
			}
			_templet.deleteAniData(_aniClipIndex);
		}
		
		/**
		 * 设置deform数据
		 * @param	tDeformAniData
		 * @param	tDeformDic
		 * @param	_boneSlotArray
		 * @param	curTime
		 */
		private function _setDeform(tDeformAniData:DeformAniData, tDeformDic:Object, _boneSlotArray:Array, curTime:Number):void {
			if (!tDeformAniData) return;
			var tDeformSlotData:DeformSlotData;
			var tDeformSlotDisplayData:DeformSlotDisplayData;
			var tDBBoneSlot:BoneSlot;
			var i:int, n:int, j:int;
			if (tDeformAniData) {
				for (i = 0, n = tDeformAniData.deformSlotDataList.length; i < n; i++) {
					tDeformSlotData = tDeformAniData.deformSlotDataList[i];
					for (j = 0; j < tDeformSlotData.deformSlotDisplayList.length; j++) {
						tDeformSlotDisplayData = tDeformSlotData.deformSlotDisplayList[j];
						tDBBoneSlot = _boneSlotArray[tDeformSlotDisplayData.slotIndex];
						tDeformSlotDisplayData.apply(curTime, tDBBoneSlot);
						if (!tDeformDic[tDeformSlotDisplayData.slotIndex]) {
							tDeformDic[tDeformSlotDisplayData.slotIndex] = {};
						}
						tDeformDic[tDeformSlotDisplayData.slotIndex][tDeformSlotDisplayData.attachment] = tDeformSlotDisplayData.deformData;
					}
				}
			}
		}
		
		/*******************************************定义接口*************************************************/
		/**
		 * 得到当前动画的数量
		 * @return 当前动画的数量
		 */
		public function getAnimNum():int {
			return _templet.getAnimationCount();
		}
		
		/**
		 * 得到指定动画的名字
		 * @param	index	动画的索引
		 */
		public function getAniNameByIndex(index:int):String {
			return _templet.getAniNameByIndex(index);
		}
		
		/**
		 * 通过名字得到插槽的引用
		 * @param	name	动画的名字
		 * @return 插槽的引用
		 */
		public function getSlotByName(name:String):BoneSlot {
			return _boneSlotDic[name];
		}
		
		/**
		 * 通过名字显示一套皮肤
		 * @param	name	皮肤的名字
		 * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
		 */
		public function showSkinByName(name:String, freshSlotIndex:Boolean = true):void {
			showSkinByIndex(_templet.getSkinIndexByName(name), freshSlotIndex);
		}
		
		/**
		 * 通过索引显示一套皮肤
		 * @param	skinIndex	皮肤索引
		 * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
		 */
		public function showSkinByIndex(skinIndex:int, freshSlotIndex:Boolean = true):void {
			for (var i:int = 0; i < _boneSlotArray.length; i++) {
				(_boneSlotArray[i] as BoneSlot).showSlotData(null, freshSlotIndex);
			}
			if (_templet.showSkinByIndex(_boneSlotDic, skinIndex, freshSlotIndex)) {
				var tSkinData:SkinData = _templet.skinDataArray[skinIndex];
				_skinIndex = skinIndex;
				_skinName = tSkinData.name;
			}
			_clearCache();
		}
		
		/**
		 * 设置某插槽的皮肤
		 * @param	slotName	插槽名称
		 * @param	index	插糟皮肤的索引
		 */
		public function showSlotSkinByIndex(slotName:String, index:int):void {
			if (_aniMode == 0) return;
			var tBoneSlot:BoneSlot = getSlotByName(slotName);
			if (tBoneSlot) {
				tBoneSlot.showDisplayByIndex(index);
			}
			_clearCache();
		}
		
		/**
		 * 设置某插槽的皮肤
		 * @param	slotName	插槽名称
		 * @param	name	皮肤名称
		 */
		public function showSlotSkinByName(slotName:String, name:String):void {
			if (_aniMode == 0) return;
			var tBoneSlot:BoneSlot = getSlotByName(slotName);
			if (tBoneSlot) {
				tBoneSlot.showDisplayByName(name);
			}
			_clearCache();
		}
		
		/**
		 * 替换插槽贴图名
		 * @param	slotName 插槽名称
		 * @param	oldName 要替换的贴图名
		 * @param	newName 替换后的贴图名
		 */
		public function replaceSlotSkinName(slotName:String, oldName:String, newName:String):void {
			if (_aniMode == 0) return;
			var tBoneSlot:BoneSlot = getSlotByName(slotName);
			if (tBoneSlot) {
				tBoneSlot.replaceDisplayByName(oldName, newName);
			}
			_clearCache();
		}
		
		/**
		 * 替换插槽的贴图索引
		 * @param	slotName 插槽名称
		 * @param	oldIndex 要替换的索引
		 * @param	newIndex 替换后的索引
		 */
		public function replaceSlotSkinByIndex(slotName:String, oldIndex:int, newIndex:int):void {
			if (_aniMode == 0) return;
			var tBoneSlot:BoneSlot = getSlotByName(slotName);
			if (tBoneSlot) {
				tBoneSlot.replaceDisplayByIndex(oldIndex, newIndex);
			}
			_clearCache();
		}
		
		/**
		 * 设置自定义皮肤
		 * @param	name		插糟的名字
		 * @param	texture		自定义的纹理
		 */
		public function setSlotSkin(slotName:String, texture:Texture):void {
			if (_aniMode == 0) return;
			var tBoneSlot:BoneSlot = getSlotByName(slotName);
			if (tBoneSlot) {
				tBoneSlot.replaceSkin(texture);
			}
			_clearCache();
		}
		
		/**
		 * 换装的时候，需要清一下缓冲区
		 */
		private function _clearCache():void {
			if (_aniMode == 1) {
				for (var i:int = 0, n:int = _graphicsCache.length; i < n; i++) {
					for (var j:int = 0, len:int = _graphicsCache[i].length; j < len; j++)
					{
						var gp:GraphicsAni = _graphicsCache[i][j];
						if (gp && gp != graphics)
						{
							GraphicsAni.recycle(gp);
						}
					}
					_graphicsCache[i].length = 0;
				}
			}
		}
		
		/**
		 * 播放动画
		 *
		 * @param	nameOrIndex	动画名字或者索引
		 * @param	loop		是否循环播放
		 * @param	force		false,如果要播的动画跟上一个相同就不生效,true,强制生效
		 * @param	start		起始时间
		 * @param	end			结束时间
		 * @param	freshSkin	是否刷新皮肤数据
		 * @param	playAudio	是否播放音频
		 */
		public function play(nameOrIndex:*, loop:Boolean, force:Boolean = true, start:int = 0, end:int = 0, freshSkin:Boolean = true, playAudio:Boolean = true):void {
			_playAudio = playAudio;
			_indexControl = false;
			var index:int = -1;
			var duration:Number;
			if (loop) {
				duration = 2147483647;//int.MAX_VALUE;
			} else {
				duration = 0;
			}
			if (nameOrIndex is String) {
				for (var i:int = 0, n:int = _templet.getAnimationCount(); i < n; i++) {
					var animation:* = _templet.getAnimation(i);
					if (animation && nameOrIndex == animation.name) {
						index = i;
						break;
					}
				}
			} else {
				index = nameOrIndex;
			}
			if (index > -1 && index < getAnimNum()) {
				_aniClipIndex = index;
				if (force || _pause || _currAniIndex != index) {
					_currAniIndex = index;
					_curOriginalData = new Float32Array(_templet.getTotalkeyframesLength(index));
					_drawOrder = null;
					_eventIndex = 0;
					_player.play(index, _player.playbackRate, duration, start, end);
					if (freshSkin)
						this._templet.showSkinByIndex(_boneSlotDic, _skinIndex);
					if (_pause) {
						_pause = false;
						_lastTime = Browser.now();
						timer.frameLoop(1, this, _update, null, true);
					}
					_update();
				}
			}
		}
		
		/**
		 * 停止动画
		 */
		public function stop():void {
			if (!_pause) {
				_pause = true;
				if (_player) {
					_player.stop(true);
				}
				if (_soundChannelArr.length > 0) { // 有正在播放的声音
					_onAniSoundStoped(true);
				}
				timer.clear(this, _update);
			}
		}
		
		/**
		 * 设置动画播放速率
		 * @param	value	1为标准速率
		 */
		public function playbackRate(value:Number):void {
			if (_player) {
				_player.playbackRate = value;
			}
		}
		
		/**
		 * 暂停动画的播放
		 */
		public function paused():void {
			if (!_pause) {
				_pause = true;
				if (_player) {
					_player.paused = true;
				}
				if (_soundChannelArr.length > 0) { // 有正在播放的声音
					var _soundChannel: SoundChannel;
					for (var len:Number = _soundChannelArr.length, i:Number =0; i < len; i++) {
						_soundChannel = _soundChannelArr[i];
						if (!_soundChannel.isStopped) {
							_soundChannel.pause();
						}
						
					}
				}
				timer.clear(this, _update);
			}
		}
		
		/**
		 * 恢复动画的播放
		 */
		public function resume():void {
			_indexControl = false;
			if (_pause) {
				_pause = false;
				if (_player) {
					_player.paused = false;
				}
				if (_soundChannelArr.length > 0) { // 有正在播放的声音
					var _soundChannel: SoundChannel;
					for (var len:Number = _soundChannelArr.length, i:Number =0; i < len; i++) {
						_soundChannel = _soundChannelArr[i];
						if (_soundChannel.audioBuffer) {
							_soundChannel.resume();
						}
					}
				}
				_lastTime = Browser.now();
				timer.frameLoop(1, this, _update, null, true);
			}
		
		}
		
		/**
		 * @private
		 * 得到缓冲数据
		 * @param	aniIndex
		 * @param	frameIndex
		 * @return
		 */
		private function _getGrahicsDataWithCache(aniIndex:int, frameIndex:Number):Graphics {
			return _graphicsCache[aniIndex][frameIndex];
		}
		
		/**
		 * @private
		 * 保存缓冲grahpics
		 * @param	aniIndex
		 * @param	frameIndex
		 * @param	graphics
		 */
		private function _setGrahicsDataWithCache(aniIndex:int, frameIndex:int, graphics:Graphics):void {
			_graphicsCache[aniIndex][frameIndex] = graphics;
		}
		
		/**
		 * 销毁当前动画
		 */
		override public function destroy(destroyChild:Boolean = true):void {
			super.destroy(destroyChild);
			_templet._removeReference(1);
			_templet = null;//动画解析器
			if (_player) _player.offAll();
			_player = null;// 播放器
			_curOriginalData = null;//当前骨骼的偏移数据
			_boneMatrixArray.length = 0;//当前骨骼动画的最终结果数据
			_lastTime = 0;//上次的帧时间
			timer.clear(this, _update);
			if (_soundChannelArr.length > 0) { // 有正在播放的声音
				_onAniSoundStoped(true);
			}
		}
		
		/**
		 * @private
		 * 得到帧索引
		 */
		public function get index():int {
			return _index;
		}
		
		/**
		 * @private
		 * 设置帧索引
		 */
		public function set index(value:int):void {
			if (player) {
				_index = value;
				_player.currentTime = _index * 1000 / _player.cacheFrameRate;
				_indexControl = true;
				_update(false);
			}
		}
		
		/**
		 * 得到总帧数据
		 */
		public function get total():int {
			if (_templet && _player) {
				_total = Math.floor(_templet.getAniDuration(_player.currentAnimationClipIndex) / 1000 * _player.cacheFrameRate);
			} else {
				_total = -1;
			}
			return _total;
		}
		
		/**
		 * 得到播放器的引用
		 */
		public function get player():AnimationPlayer {
			return _player;
		}
		
		/**
		 * 得到动画模板的引用
		 * @return templet.
		 */
		public function get templet():Templet{
			return _templet;
		}
	}
}