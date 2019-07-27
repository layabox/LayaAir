(function (exports, Laya) {
    'use strict';

    class IAniLib {
    }
    IAniLib.Skeleton = null;
    IAniLib.AnimationTemplet = null;
    IAniLib.Templet = null;

    /**
     * @internal
     * @author ...
     */
    class AnimationContent {
    }

    /**
     * @internal
     */
    class AnimationNodeContent {
    }

    /**
     * @internal
     */
    class AnimationState {
        constructor() {
        }
    }
    AnimationState.stopped = 0;
    AnimationState.paused = 1;
    AnimationState.playing = 2;

    /**开始播放时调度。
     * @eventType Event.PLAYED
     * */
    /*[Event(name = "played", type = "laya.events.Event")]*/
    /**暂停时调度。
     * @eventType Event.PAUSED
     * */
    /*[Event(name = "paused", type = "laya.events.Event")]*/
    /**完成一次循环时调度。
     * @eventType Event.COMPLETE
     * */
    /*[Event(name = "complete", type = "laya.events.Event")]*/
    /**停止时调度。
     * @eventType Event.STOPPED
     * */
    /*[Event(name = "stopped", type = "laya.events.Event")]*/
    /**
     * <code>AnimationPlayer</code> 类用于动画播放器。
     */
    class AnimationPlayer extends Laya.EventDispatcher {
        /**
         * 创建一个 <code>AnimationPlayer</code> 实例。
         */
        constructor() {
            super();
            /**是否缓存*/
            this.isCache = true;
            /** 播放速率*/
            this.playbackRate = 1.0;
            this._destroyed = false;
            this._currentAnimationClipIndex = -1;
            this._currentKeyframeIndex = -1;
            this._currentTime = 0.0;
            this._overallDuration = Number.MAX_VALUE;
            this._stopWhenCircleFinish = false;
            this._elapsedPlaybackTime = 0;
            this._startUpdateLoopCount = -1;
            this._cachePlayRate = 1.0;
            this.cacheFrameRate = 60;
            this.returnToZeroStopped = false;
        }
        /**
         * 获取动画数据模板
         * @param	value 动画数据模板
         */
        get templet() {
            return this._templet;
        }
        /**
         * 设置动画数据模板,注意：修改此值会有计算开销。
         * @param	value 动画数据模板
         */
        set templet(value) {
            if (!(this.state === AnimationState.stopped))
                this.stop(true);
            if (this._templet !== value) {
                this._templet = value;
                //if (value.loaded)
                this._computeFullKeyframeIndices();
                //else
                //value.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, _cacheFrameRate]);
            }
        }
        /**
         * 动画播放的起始时间位置。
         * @return	 起始时间位置。
         */
        get playStart() {
            return this._playStart;
        }
        /**
         * 动画播放的结束时间位置。
         * @return	 结束时间位置。
         */
        get playEnd() {
            return this._playEnd;
        }
        /**
         * 获取动画播放一次的总时间
         * @return	 动画播放一次的总时间
         */
        get playDuration() {
            return this._playDuration;
        }
        /**
         * 获取动画播放的总总时间
         * @return	 动画播放的总时间
         */
        get overallDuration() {
            return this._overallDuration;
        }
        /**
         * 获取当前动画索引
         * @return	value 当前动画索引
         */
        get currentAnimationClipIndex() {
            return this._currentAnimationClipIndex;
        }
        /**
         * 获取当前帧数
         * @return	 当前帧数
         */
        get currentKeyframeIndex() {
            return this._currentKeyframeIndex;
        }
        /**
         *  获取当前精确时间，不包括重播时间
         * @return	value 当前时间
         */
        get currentPlayTime() {
            return this._currentTime + this._playStart;
        }
        /**
         *  获取当前帧时间，不包括重播时间
         * @return	value 当前时间
         */
        get currentFrameTime() {
            return this._currentFrameTime;
        }
        /**
         *  获取缓存播放速率。*
         * @return	 缓存播放速率。
         */
        get cachePlayRate() {
            return this._cachePlayRate;
        }
        /**
         *  设置缓存播放速率,默认值为1.0,注意：修改此值会有计算开销。*
         * @return	value 缓存播放速率。
         */
        set cachePlayRate(value) {
            if (this._cachePlayRate !== value) {
                this._cachePlayRate = value;
                if (this._templet)
                    //if (_templet.loaded)
                    this._computeFullKeyframeIndices();
                //else
                //_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [value, _cacheFrameRate]);
            }
        }
        /**
         *  获取默认帧率*
         * @return	value 默认帧率
         */
        get cacheFrameRate() {
            return this._cacheFrameRate;
        }
        /**
         *  设置默认帧率,每秒60帧,注意：修改此值会有计算开销。*
         * @return	value 缓存帧率
         */
        set cacheFrameRate(value) {
            if (this._cacheFrameRate !== value) {
                this._cacheFrameRate = value;
                this._cacheFrameRateInterval = 1000.0 / this._cacheFrameRate;
                if (this._templet)
                    //if (_templet.loaded)
                    this._computeFullKeyframeIndices();
                //else
                //_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, value]);
            }
        }
        /**
         * 设置当前播放位置
         * @param	value 当前时间
         */
        set currentTime(value) {
            if (this._currentAnimationClipIndex === -1 || !this._templet /*|| !_templet.loaded*/)
                return;
            if (value < this._playStart || value > this._playEnd)
                throw new Error("AnimationPlayer:value must large than playStartTime,small than playEndTime.");
            this._startUpdateLoopCount = Laya.Stat.loopCount;
            var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
            this._currentTime = value /*% playDuration*/;
            this._currentKeyframeIndex = Math.floor(this.currentPlayTime / cacheFrameInterval);
            this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
        }
        /**
         * 获取当前是否暂停
         * @return	是否暂停
         */
        get paused() {
            return this._paused;
        }
        /**
         * 设置是否暂停
         * @param	value 是否暂停
         */
        set paused(value) {
            this._paused = value;
            value && this.event(Laya.Event.PAUSED);
        }
        /**
         * 获取缓存帧率间隔时间
         * @return	缓存帧率间隔时间
         */
        get cacheFrameRateInterval() {
            return this._cacheFrameRateInterval;
        }
        /**
         * 获取当前播放状态
         * @return	当前播放状态
         */
        get state() {
            if (this._currentAnimationClipIndex === -1)
                return AnimationState.stopped;
            if (this._paused)
                return AnimationState.paused;
            return AnimationState.playing;
        }
        /**
         * 获取是否已销毁。
         * @return 是否已销毁。
         */
        get destroyed() {
            return this._destroyed;
        }
        /**
         * @internal
         */
        _onTempletLoadedComputeFullKeyframeIndices(cachePlayRate, cacheFrameRate, templet) {
            if (this._templet === templet && this._cachePlayRate === cachePlayRate && this._cacheFrameRate === cacheFrameRate)
                this._computeFullKeyframeIndices();
        }
        /**
         * @private
         */
        _computeFullKeyframeIndices() {
            return; // 先改成实时计算了。否则占用内存太多
            var templet = this._templet;
            if (templet._fullFrames)
                return;
            var anifullFrames = this._templet._fullFrames = [];
            var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
            for (var i = 0, iNum = templet.getAnimationCount(); i < iNum; i++) {
                var aniFullFrame = [];
                if (!templet.getAnimation(i).nodes) {
                    anifullFrames.push(aniFullFrame);
                    continue;
                }
                for (var j = 0, jNum = templet.getAnimation(i).nodes.length; j < jNum; j++) {
                    var node = templet.getAnimation(i).nodes[j];
                    var frameCount = Math.round(node.playTime / cacheFrameInterval);
                    var nodeFullFrames = new Uint16Array(frameCount + 1); //本骨骼对应的全帧关键帧编号
                    // 先把关键帧所在的位置填上
                    var stidx = -1; // 第一帧的位置，应该是0
                    var nodeframes = node.keyFrame;
                    for (var n = 0, nNum = nodeframes.length; n < nNum; n++) {
                        var keyFrame = nodeframes[n];
                        var pos = Math.round(keyFrame.startTime / cacheFrameInterval);
                        if (stidx < 0 && pos > 0) {
                            stidx = pos;
                        }
                        if (pos <= frameCount) { // 实际大小是frameCount+1
                            nodeFullFrames[pos] = n;
                        }
                    }
                    // 再把空隙填满
                    var cf = 0;
                    for (n = stidx; n < frameCount; n++) { // 实际大小是frameCount+1 
                        if (nodeFullFrames[n] == 0) {
                            nodeFullFrames[n] = cf;
                        }
                        else {
                            cf = nodeFullFrames[n]; // 新的开始
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
        _onAnimationTempletLoaded() {
            (this.destroyed) || (this._calculatePlayDuration());
        }
        /**
         * @private
         */
        _calculatePlayDuration() {
            if (this.state !== AnimationState.stopped) { //防止动画已停止，异步回调导致BUG
                var oriDuration = this._templet.getAniDuration(this._currentAnimationClipIndex);
                (this._playEnd === 0) && (this._playEnd = oriDuration);
                if (this._playEnd > oriDuration) //以毫秒为最小时间单位,取整。FillTextureSprite
                    this._playEnd = oriDuration;
                this._playDuration = this._playEnd - this._playStart;
            }
        }
        /**
         * @private
         */
        _setPlayParams(time, cacheFrameInterval) {
            this._currentTime = time;
            this._currentKeyframeIndex = Math.floor((this.currentPlayTime) / cacheFrameInterval + 0.01);
            this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
        }
        /**
         * 动画停止了对应的参数。目前都是设置时间为最后
         * @private
         */
        _setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval, playEnd = -1) {
            this._currentTime = currentAniClipPlayDuration;
            var endTime = playEnd > 0 ? playEnd : currentAniClipPlayDuration;
            this._currentKeyframeIndex = Math.floor(endTime / cacheFrameInterval + 0.01);
            this._currentKeyframeIndex = Math.floor(currentAniClipPlayDuration / cacheFrameInterval + 0.01);
            this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
            this._currentAnimationClipIndex = -1; //动画结束	
        }
        /**
         * @internal
         */
        _update(elapsedTime) {
            if (this._currentAnimationClipIndex === -1 || this._paused || !this._templet /*|| !_templet.loaded*/) //动画停止或暂停，不更新
                return;
            var cacheFrameInterval = this._cacheFrameRateInterval * this._cachePlayRate;
            var time = 0; // 时间间隔
            // 计算经过的时间
            (this._startUpdateLoopCount !== Laya.Stat.loopCount) && (time = elapsedTime * this.playbackRate, this._elapsedPlaybackTime += time); //elapsedTime为距离上一帧时间,首帧播放如果_startPlayLoopCount===Stat.loopCount，则不累加时间
            var currentAniClipPlayDuration = this.playDuration;
            // 如果设置了总播放时间，并且超过总播放时间了，就发送stop事件
            // 如果没有设置_overallDuration，且播放时间超过的动画总时间，也发送stop事件？  也就是说单次播放不会发出complete事件？
            // 如果设置了loop播放，则会设置 _overallDuration 
            time += this._currentTime;
            if ((this._overallDuration !== 0 && this._elapsedPlaybackTime >= this._overallDuration) || (this._overallDuration === 0 && this._elapsedPlaybackTime >= currentAniClipPlayDuration
                || (this._overallDuration === 0 && time >= this.playEnd))) {
                this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval, this.playEnd); // (总播放时间,缓存帧的时间间隔(33.33))
                this.event(Laya.Event.STOPPED);
                return;
            }
            if (currentAniClipPlayDuration > 0) { // 如果设置了 总动画时间，一般都设置了把，就是动画文件本身记录的时间
                if (time >= currentAniClipPlayDuration) { // 如果超出了总动画时间
                    if (this._stopWhenCircleFinish) { // 如果只播放一次，就发送stop事件
                        this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval); // (总播放时间,缓存帧的时间间隔(33.33))
                        this._stopWhenCircleFinish = false;
                        this.event(Laya.Event.STOPPED);
                        return;
                    }
                    else {
                        // 如果多次播放,发送complete事件
                        time = time % currentAniClipPlayDuration;
                        this._setPlayParams(time, cacheFrameInterval);
                        this.event(Laya.Event.COMPLETE);
                        return;
                    }
                }
                else {
                    this._setPlayParams(time, cacheFrameInterval);
                }
            }
            else {
                if (this._stopWhenCircleFinish) {
                    this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
                    this._stopWhenCircleFinish = false;
                    this.event(Laya.Event.STOPPED);
                    return;
                }
                this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
                this.event(Laya.Event.COMPLETE);
            }
        }
        /**
         * @internal
         */
        _destroy() {
            this.offAll();
            this._templet = null;
            //_fullFrames = null;
            this._destroyed = true;
        }
        /**
         * 播放动画。
         * @param	index 动画索引。
         * @param	playbackRate 播放速率。
         * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
         * @param	playStart 播放的起始时间位置。
         * @param	playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
         */
        play(index = 0, playbackRate = 1.0, overallDuration = 2147483647, playStart = 0, playEnd = 0) {
            if (!this._templet)
                throw new Error("AnimationPlayer:templet must not be null,maybe you need to set url.");
            if (overallDuration < 0 || playStart < 0 || playEnd < 0)
                throw new Error("AnimationPlayer:overallDuration,playStart and playEnd must large than zero.");
            if ((playEnd !== 0) && (playStart > playEnd))
                throw new Error("AnimationPlayer:start must less than end.");
            this._currentTime = 0;
            this._currentFrameTime = 0;
            this._elapsedPlaybackTime = 0;
            this.playbackRate = playbackRate;
            this._overallDuration = overallDuration;
            this._playStart = playStart;
            this._playEnd = playEnd;
            this._paused = false;
            this._currentAnimationClipIndex = index;
            this._currentKeyframeIndex = 0;
            this._startUpdateLoopCount = Laya.Stat.loopCount;
            this.event(Laya.Event.PLAYED);
            //if (_templet.loaded)
            this._calculatePlayDuration();
            //else
            //_templet.once(Event.LOADED, this, _onAnimationTempletLoaded);
            this._update(0); //如果分段播放,可修正帧率
        }
        /**
         * 播放动画。
         * @param	index 动画索引。
         * @param	playbackRate 播放速率。
         * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
         * @param	playStartFrame 播放的原始起始帧率位置。
         * @param	playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
         */
        playByFrame(index = 0, playbackRate = 1.0, overallDuration = 2147483647, playStartFrame = 0, playEndFrame = 0, fpsIn3DBuilder = 30) {
            var interval = 1000.0 / fpsIn3DBuilder;
            this.play(index, playbackRate, overallDuration, playStartFrame * interval, playEndFrame * interval);
        }
        /**
         * 停止播放当前动画
         * 如果不是立即停止就等待动画播放完成后再停止
         * @param	immediate 是否立即停止
         */
        stop(immediate = true) {
            if (immediate) {
                this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
                this._currentAnimationClipIndex = -1;
                this.event(Laya.Event.STOPPED);
            }
            else {
                this._stopWhenCircleFinish = true;
            }
        }
        /**
         * @private
         */
        destroy() {
        }
    }

    class KeyFramesContent {
    }

    /**
     * @internal
     */
    class AnimationParser01 {
        /**
         * @private
         */
        static parse(templet, reader) {
            var data = reader.__getBuffer();
            var i, j, k, n, l, m, o;
            //if (head != KeyframesAniTemplet.LAYA_ANIMATION_VISION)
            //{
            //trace("[Error] Version " + _aniVersion + " The engine is inconsistent, update to the version " + KeyframesAniTemplet.LAYA_ANIMATION_VISION + " please.");
            //return;
            //}
            var aniClassName = reader.readUTFString(); //字符串(动画播放器类名，缺省为ANI)
            templet._aniClassName = aniClassName;
            var strList = reader.readUTFString().split("\n"); //字符串(\n分割 UTF8 )
            var aniCount = reader.getUint8(); //动画块数:Uint8
            var publicDataPos = reader.getUint32(); //公用数据POS	
            var publicExtDataPos = reader.getUint32(); //公用扩展数据POS
            var publicData; //获取公用数据
            if (publicDataPos > 0)
                publicData = data.slice(publicDataPos, publicExtDataPos);
            var publicRead = new Laya.Byte(publicData);
            if (publicExtDataPos > 0) //获取公用扩展数据
                templet._publicExtData = data.slice(publicExtDataPos, data.byteLength);
            templet._useParent = !!reader.getUint8();
            templet._anis.length = aniCount;
            for (i = 0; i < aniCount; i++) {
                var ani = templet._anis[i] = new AnimationContent();
                //[IF-SCRIPT] {};//不要删除
                ani.nodes = [];
                var name = ani.name = strList[reader.getUint16()]; //获得骨骼名字
                templet._aniMap[name] = i; //按名字可以取得动画索引
                ani.bone3DMap = {};
                ani.playTime = reader.getFloat32(); //本骨骼播放时间
                var boneCount = ani.nodes.length = reader.getUint8(); //得到本动画骨骼数目
                ani.totalKeyframeDatasLength = 0;
                for (j = 0; j < boneCount; j++) {
                    var node = ani.nodes[j] = new AnimationNodeContent();
                    //[IF-SCRIPT] {};//不要删除
                    node.childs = [];
                    var nameIndex = reader.getInt16();
                    if (nameIndex >= 0) {
                        node.name = strList[nameIndex]; //骨骼名字
                        ani.bone3DMap[node.name] = j;
                    }
                    node.keyFrame = [];
                    node.parentIndex = reader.getInt16(); //父对象编号，相对本动画(INT16,-1表示没有)
                    node.parentIndex == -1 ? node.parent = null : node.parent = ani.nodes[node.parentIndex];
                    node.lerpType = reader.getUint8(); //该节点插值类型:0为不插值，1为逐节点插值，2为私有插值
                    var keyframeParamsOffset = reader.getUint32(); //相对于数据扩展区的偏移地址
                    publicRead.pos = keyframeParamsOffset; //切换到数据区偏移地址
                    var keyframeDataCount = node.keyframeWidth = publicRead.getUint16(); //keyframe数据宽度:Uint8		
                    ani.totalKeyframeDatasLength += keyframeDataCount;
                    //每个数据的插值方式:Uint8*keyframe数据宽度
                    if (node.lerpType === 0 || node.lerpType === 1) //是否逐节点插值
                     {
                        node.interpolationMethod = [];
                        node.interpolationMethod.length = keyframeDataCount;
                        for (k = 0; k < keyframeDataCount; k++)
                            node.interpolationMethod[k] = IAniLib.AnimationTemplet.interpolation[publicRead.getUint8()];
                    }
                    if (node.parent != null)
                        node.parent.childs.push(node);
                    var privateDataLen = reader.getUint16(); //"UINT16", [1],//私有数据长度
                    if (privateDataLen > 0) {
                        //"BYTE", [1],//私有数据
                        node.extenData = data.slice(reader.pos, reader.pos + privateDataLen);
                        reader.pos += privateDataLen;
                    }
                    var keyframeCount = reader.getUint16();
                    node.keyFrame.length = keyframeCount;
                    var startTime = 0;
                    var keyFrame;
                    for (k = 0, n = keyframeCount; k < n; k++) {
                        keyFrame = node.keyFrame[k] = new KeyFramesContent();
                        //[IF-SCRIPT] {};//不要删除
                        keyFrame.duration = reader.getFloat32();
                        keyFrame.startTime = startTime;
                        if (node.lerpType === 2) //是否逐帧插值
                         {
                            keyFrame.interpolationData = [];
                            var interDataLength = reader.getUint8(); //插值数据长度
                            var lerpType;
                            lerpType = reader.getFloat32();
                            switch (lerpType) {
                                case 254: //全线性插值
                                    keyFrame.interpolationData.length = keyframeDataCount;
                                    for (o = 0; o < keyframeDataCount; o++)
                                        keyFrame.interpolationData[o] = 0;
                                    break;
                                case 255: //全不插值
                                    keyFrame.interpolationData.length = keyframeDataCount;
                                    for (o = 0; o < keyframeDataCount; o++)
                                        keyFrame.interpolationData[o] = 5;
                                    break;
                                default:
                                    keyFrame.interpolationData.push(lerpType);
                                    for (m = 1; m < interDataLength; m++) {
                                        keyFrame.interpolationData.push(reader.getFloat32());
                                    }
                            }
                            //for (m = 0; m < interDataLength; m++) {
                            //var lerpData:int = read.getFloat32();//插值数据
                            //switch (lerpData) {
                            //case 254: //全线性插值
                            //keyFrame.interpolationData.length = keyframeDataCount;
                            //for (o = 0; o < keyframeDataCount; o++)
                            //keyFrame.interpolationData[o] = 0;
                            //break;
                            //case 255: //全不插值
                            //
                            //keyFrame.interpolationData.length = keyframeDataCount;
                            //for (o = 0; o < keyframeDataCount; o++)
                            //keyFrame.interpolationData[o] = 5;
                            //break;
                            //default: 
                            //keyFrame.interpolationData.push(lerpData);
                            //}
                            //}
                        }
                        keyFrame.data = new Float32Array(keyframeDataCount);
                        keyFrame.dData = new Float32Array(keyframeDataCount);
                        keyFrame.nextData = new Float32Array(keyframeDataCount);
                        for (l = 0; l < keyframeDataCount; l++) {
                            keyFrame.data[l] = reader.getFloat32();
                            if (keyFrame.data[l] > -0.00000001 && keyFrame.data[l] < 0.00000001)
                                keyFrame.data[l] = 0;
                        }
                        startTime += keyFrame.duration;
                    }
                    keyFrame.startTime = ani.playTime; //因工具BUG，矫正最后一帧startTime
                    node.playTime = ani.playTime; //节点总时间可能比总时长大，次处修正
                    templet._calculateKeyFrame(node, keyframeCount, keyframeDataCount);
                }
            }
        }
    }

    /**
     * @internal
     */
    class AnimationParser02 {
        /**
         * @private
         */
        static READ_DATA() {
            AnimationParser02._DATA.offset = AnimationParser02._reader.getUint32();
            AnimationParser02._DATA.size = AnimationParser02._reader.getUint32();
        }
        /**
         * @private
         */
        //TODO:coverage
        static READ_BLOCK() {
            var count = AnimationParser02._BLOCK.count = AnimationParser02._reader.getUint16();
            var blockStarts = AnimationParser02._BLOCK.blockStarts = [];
            var blockLengths = AnimationParser02._BLOCK.blockLengths = [];
            for (var i = 0; i < count; i++) {
                blockStarts.push(AnimationParser02._reader.getUint32());
                blockLengths.push(AnimationParser02._reader.getUint32());
            }
        }
        /**
         * @private
         */
        //TODO:coverage
        static READ_STRINGS() {
            var offset = AnimationParser02._reader.getUint32();
            var count = AnimationParser02._reader.getUint16();
            var prePos = AnimationParser02._reader.pos;
            AnimationParser02._reader.pos = offset + AnimationParser02._DATA.offset;
            for (var i = 0; i < count; i++)
                AnimationParser02._strings[i] = AnimationParser02._reader.readUTFString();
            AnimationParser02._reader.pos = prePos;
        }
        /**
         * @private
         */
        //TODO:coverage
        static parse(templet, reader) {
            AnimationParser02._templet = templet;
            AnimationParser02._reader = reader;
            var arrayBuffer = reader.__getBuffer();
            AnimationParser02.READ_DATA();
            AnimationParser02.READ_BLOCK();
            AnimationParser02.READ_STRINGS();
            for (var i = 0, n = AnimationParser02._BLOCK.count; i < n; i++) {
                var index = reader.getUint16();
                var blockName = AnimationParser02._strings[index];
                var fn = AnimationParser02["READ_" + blockName];
                if (fn == null)
                    throw new Error("model file err,no this function:" + index + " " + blockName);
                else
                    fn.call(null);
            }
        }
        //TODO:coverage
        static READ_ANIMATIONS() {
            var reader = AnimationParser02._reader;
            var arrayBuffer = reader.__getBuffer();
            var i, j, k, n;
            var keyframeWidth = reader.getUint16();
            var interpolationMethod = [];
            interpolationMethod.length = keyframeWidth;
            for (i = 0; i < keyframeWidth; i++)
                interpolationMethod[i] = IAniLib.AnimationTemplet.interpolation[reader.getByte()];
            var aniCount = reader.getUint8();
            AnimationParser02._templet._anis.length = aniCount;
            for (i = 0; i < aniCount; i++) {
                var ani = AnimationParser02._templet._anis[i] = new AnimationContent();
                ani.nodes = [];
                var aniName = ani.name = AnimationParser02._strings[reader.getUint16()];
                AnimationParser02._templet._aniMap[aniName] = i; //按名字可以取得动画索引
                ani.bone3DMap = {};
                ani.playTime = reader.getFloat32();
                var boneCount = ani.nodes.length = reader.getInt16();
                ani.totalKeyframeDatasLength = 0;
                for (j = 0; j < boneCount; j++) {
                    var node = ani.nodes[j] = new AnimationNodeContent();
                    node.keyframeWidth = keyframeWidth; //TODO:存在骨骼里是否合并，需要优化到动画中更合理。
                    node.childs = [];
                    var nameIndex = reader.getUint16();
                    if (nameIndex >= 0) {
                        node.name = AnimationParser02._strings[nameIndex]; //骨骼名字
                        ani.bone3DMap[node.name] = j;
                    }
                    node.keyFrame = [];
                    node.parentIndex = reader.getInt16(); //父对象编号，相对本动画(INT16,-1表示没有)
                    node.parentIndex == -1 ? node.parent = null : node.parent = ani.nodes[node.parentIndex];
                    ani.totalKeyframeDatasLength += keyframeWidth;
                    node.interpolationMethod = interpolationMethod; //TODO:
                    if (node.parent != null)
                        node.parent.childs.push(node);
                    var keyframeCount = reader.getUint16();
                    node.keyFrame.length = keyframeCount;
                    var keyFrame = null, lastKeyFrame = null;
                    for (k = 0, n = keyframeCount; k < n; k++) {
                        keyFrame = node.keyFrame[k] = new KeyFramesContent();
                        keyFrame.startTime = reader.getFloat32();
                        (lastKeyFrame) && (lastKeyFrame.duration = keyFrame.startTime - lastKeyFrame.startTime);
                        keyFrame.dData = new Float32Array(keyframeWidth);
                        keyFrame.nextData = new Float32Array(keyframeWidth);
                        var offset = AnimationParser02._DATA.offset;
                        var keyframeDataOffset = reader.getUint32();
                        var keyframeDataLength = keyframeWidth * 4;
                        var keyframeArrayBuffer = arrayBuffer.slice(offset + keyframeDataOffset, offset + keyframeDataOffset + keyframeDataLength);
                        keyFrame.data = new Float32Array(keyframeArrayBuffer);
                        lastKeyFrame = keyFrame;
                    }
                    keyFrame.duration = 0;
                    node.playTime = ani.playTime; //节点总时间可能比总时长大，次处修正
                    AnimationParser02._templet._calculateKeyFrame(node, keyframeCount, keyframeWidth);
                }
            }
        }
    }
    /**@private */
    AnimationParser02._strings = [];
    /**@private */
    AnimationParser02._BLOCK = { count: 0 };
    /**@private */
    AnimationParser02._DATA = { offset: 0, size: 0 };

    /**
     * @internal
     * ...
     * @author ww
     */
    class BezierLerp {
        constructor() {
        }
        //TODO:coverage
        static getBezierRate(t, px0, py0, px1, py1) {
            var key = BezierLerp._getBezierParamKey(px0, py0, px1, py1);
            var vKey = key * 100 + t;
            if (BezierLerp._bezierResultCache[vKey])
                return BezierLerp._bezierResultCache[vKey];
            var points = BezierLerp._getBezierPoints(px0, py0, px1, py1, key);
            var i, len;
            len = points.length;
            for (i = 0; i < len; i += 2) {
                if (t <= points[i]) {
                    BezierLerp._bezierResultCache[vKey] = points[i + 1];
                    return points[i + 1];
                }
            }
            BezierLerp._bezierResultCache[vKey] = 1;
            return 1;
        }
        //TODO:coverage
        static _getBezierParamKey(px0, py0, px1, py1) {
            return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
        }
        //TODO:coverage
        static _getBezierPoints(px0, py0, px1, py1, key) {
            if (BezierLerp._bezierPointsCache[key])
                return BezierLerp._bezierPointsCache[key];
            var controlPoints;
            controlPoints = [0, 0, px0, py0, px1, py1, 1, 1];
            var bz;
            bz = new Laya.Bezier();
            var points;
            points = bz.getBezierPoints(controlPoints, 100, 3);
            BezierLerp._bezierPointsCache[key] = points;
            return points;
        }
    }
    BezierLerp._bezierResultCache = {};
    BezierLerp._bezierPointsCache = {};

    /**
     * <code>AnimationTemplet</code> 类用于动画模板资源。
     */
    class AnimationTemplet extends Laya.Resource {
        constructor() {
            super();
            /**@internal */
            this._anis = [];
            /**@internal */
            this._aniMap = {};
            /**@private */
            this.unfixedLastAniIndex = -1;
            /**@internal */
            this._fullFrames = null;
            /**@private */
            this._boneCurKeyFrm = []; // 记录每个骨骼当前在动画的第几帧。这个是为了去掉缓存的帧索引数据。TODO 其实这个应该放到skeleton中
        }
        /**
         * @private
         */
        //TODO:coverage
        static _LinearInterpolation_0(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            out[outOfs] = data[index] + dt * dData[index];
            return 1;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _QuaternionInterpolation_1(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            var amount = duration === 0 ? 0 : dt / duration;
            Laya.MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs); //(dt/duration)为amount比例
            return 4;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _AngleInterpolation_2(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            return 0;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _RadiansInterpolation_3(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            return 0;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _Matrix4x4Interpolation_4(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            for (var i = 0; i < 16; i++, index++)
                out[outOfs + i] = data[index] + dt * dData[index];
            return 16;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _NoInterpolation_5(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
            out[outOfs] = data[index];
            return 1;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _BezierInterpolation_6(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
            out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
            return 5;
        }
        /**
         * @private
         */
        //TODO:coverage
        static _BezierInterpolation_7(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
            //interData=[x0,y0,x1,y1,start,d,offTime,allTime]
            out[outOfs] = interData[offset + 4] + interData[offset + 5] * BezierLerp.getBezierRate((dt * 0.001 + interData[offset + 6]) / interData[offset + 7], interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
            return 9;
        }
        /**
         * @private
         */
        parse(data) {
            var reader = new Laya.Byte(data);
            this._aniVersion = reader.readUTFString();
            AnimationParser01.parse(this, reader);
        }
        /**
         * @internal
         */
        _calculateKeyFrame(node, keyframeCount, keyframeDataCount) {
            var keyFrames = node.keyFrame;
            keyFrames[keyframeCount] = keyFrames[0];
            for (var i = 0; i < keyframeCount; i++) {
                var keyFrame = keyFrames[i];
                for (var j = 0; j < keyframeDataCount; j++) {
                    keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration; //末帧dData数据为0
                    keyFrame.nextData[j] = keyFrames[i + 1].data[j];
                }
            }
            keyFrames.length--;
        }
        /**
         * @internal
         */
        //TODO:coverage
        _onAsynLoaded(data, propertyParams = null) {
            var reader = new Laya.Byte(data);
            this._aniVersion = reader.readUTFString();
            switch (this._aniVersion) {
                case "LAYAANIMATION:02":
                    AnimationParser02.parse(this, reader);
                    break;
                default:
                    AnimationParser01.parse(this, reader);
            }
        }
        getAnimationCount() {
            return this._anis.length;
        }
        getAnimation(aniIndex) {
            return this._anis[aniIndex];
        }
        getAniDuration(aniIndex) {
            return this._anis[aniIndex].playTime;
        }
        //TODO:coverage
        getNodes(aniIndex) {
            return this._anis[aniIndex].nodes;
        }
        getNodeIndexWithName(aniIndex, name) {
            return this._anis[aniIndex].bone3DMap[name];
        }
        getNodeCount(aniIndex) {
            return this._anis[aniIndex].nodes.length;
        }
        getTotalkeyframesLength(aniIndex) {
            return this._anis[aniIndex].totalKeyframeDatasLength;
        }
        getPublicExtData() {
            return this._publicExtData;
        }
        //TODO:coverage
        getAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex) {
            var aniDatas = cacheDatas[aniIndex];
            if (!aniDatas) {
                return null;
            }
            else {
                var keyDatas = aniDatas[key];
                if (!keyDatas)
                    return null;
                else {
                    return keyDatas[frameIndex];
                }
            }
        }
        //TODO:coverage
        setAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex, data) {
            var aniDatas = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
            var aniDatasCache = (aniDatas[key]) || (aniDatas[key] = []);
            aniDatasCache[frameIndex] = data;
        }
        /**
         * 计算当前时间应该对应关键帧的哪一帧
         * @param	nodeframes	当前骨骼的关键帧数据
         * @param	nodeid		骨骼id，因为要使用和更新 _boneCurKeyFrm
         * @param	tm
         * @return
         * 问题
         * 	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧
         *  	使用与AnimationPlayer一致的累积时间就行
         */
        getNodeKeyFrame(nodeframes, nodeid, tm) {
            var cid = this._boneCurKeyFrm[nodeid];
            var frmNum = nodeframes.length;
            if (cid == void 0 || cid >= frmNum) {
                cid = this._boneCurKeyFrm[nodeid] = 0;
            }
            var kinfo = nodeframes[cid];
            var curFrmTm = kinfo.startTime;
            var dt = tm - curFrmTm;
            // 缓存命中的情况
            if (dt == 0 || (dt > 0 && kinfo.duration > dt)) {
                return cid;
            }
            // 否则就要前后判断在第几帧
            var i = 0;
            if (dt > 0) {
                // 在后面
                tm = tm + 0.01; // 有个问题，由于浮点精度的问题可能导致 前后 st+duration  st+duration 接不上。导致cid+1的起始时间>tm，所以时间加上一点
                for (i = cid + 1; i < frmNum; i++) {
                    kinfo = nodeframes[i];
                    if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                        this._boneCurKeyFrm[nodeid] = i;
                        return i;
                    }
                }
                return frmNum - 1;
            }
            else {
                // 在前面
                for (i = 0; i < cid; i++) {
                    kinfo = nodeframes[i];
                    if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                        this._boneCurKeyFrm[nodeid] = i;
                        return i;
                    }
                }
                return cid; // 可能误差导致，返回最后一个
            }
            return 0; // 这个怎么做
        }
        /**
         *
         * @param	aniIndex
         * @param	originalData
         * @param	nodesFrameIndices
         * @param	frameIndex
         * @param	playCurTime
         */
        getOriginalData(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime) {
            var oneAni = this._anis[aniIndex];
            var nodes = oneAni.nodes;
            // 当前帧缓存数组可能大小需要调整
            var curKFrm = this._boneCurKeyFrm;
            if (curKFrm.length < nodes.length) {
                curKFrm.length = nodes.length;
            }
            //playCurTime %= oneAni.playTime;
            var j = 0;
            for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
                var node = nodes[i];
                var key;
                //key = node.keyFrame[nodesFrameIndices[i][frameIndex]];
                var kfrm = node.keyFrame;
                key = kfrm[this.getNodeKeyFrame(kfrm, i, playCurTime)];
                node.dataOffset = outOfs;
                var dt = playCurTime - key.startTime;
                var lerpType = node.lerpType;
                if (lerpType) {
                    switch (lerpType) {
                        case 0:
                        case 1:
                            for (j = 0; j < node.keyframeWidth;)
                                j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                            break;
                        case 2:
                            var interpolationData = key.interpolationData;
                            var interDataLen = interpolationData.length;
                            var dataIndex = 0;
                            for (j = 0; j < interDataLen;) {
                                var type = interpolationData[j];
                                switch (type) {
                                    case 6:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                        break;
                                    case 7:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                        break;
                                    default:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                                }
                                //if (type === 6)
                                //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData.slice(j+1, j + 5));
                                //else
                                //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                                dataIndex++;
                            }
                            break;
                    }
                }
                else {
                    for (j = 0; j < node.keyframeWidth;)
                        j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                }
                outOfs += node.keyframeWidth;
            }
        }
        //TODO:coverage
        getNodesCurrentFrameIndex(aniIndex, playCurTime) {
            var ani = this._anis[aniIndex];
            var nodes = ani.nodes;
            if (aniIndex !== this.unfixedLastAniIndex) {
                this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
                this.unfixedCurrentTimes = new Float32Array(nodes.length);
                this.unfixedLastAniIndex = aniIndex;
            }
            for (var i = 0, n = nodes.length; i < n; i++) {
                var node = nodes[i];
                if (playCurTime < this.unfixedCurrentTimes[i])
                    this.unfixedCurrentFrameIndexes[i] = 0;
                this.unfixedCurrentTimes[i] = playCurTime;
                while ((this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length)) {
                    if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                        break;
                    this.unfixedCurrentFrameIndexes[i]++;
                }
                this.unfixedCurrentFrameIndexes[i]--;
            }
            return this.unfixedCurrentFrameIndexes;
        }
        //TODO:coverage
        getOriginalDataUnfixedRate(aniIndex, originalData, playCurTime) {
            var oneAni = this._anis[aniIndex];
            var nodes = oneAni.nodes;
            if (aniIndex !== this.unfixedLastAniIndex) {
                this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
                this.unfixedCurrentTimes = new Float32Array(nodes.length);
                this.unfixedKeyframes = [];
                this.unfixedLastAniIndex = aniIndex;
            }
            var j = 0;
            for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
                var node = nodes[i];
                if (playCurTime < this.unfixedCurrentTimes[i])
                    this.unfixedCurrentFrameIndexes[i] = 0;
                this.unfixedCurrentTimes[i] = playCurTime;
                while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
                    if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                        break;
                    this.unfixedKeyframes[i] = node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
                    this.unfixedCurrentFrameIndexes[i]++;
                }
                var key = this.unfixedKeyframes[i];
                node.dataOffset = outOfs;
                var dt = playCurTime - key.startTime;
                var lerpType = node.lerpType;
                if (lerpType) {
                    switch (node.lerpType) {
                        case 0:
                        case 1:
                            for (j = 0; j < node.keyframeWidth;)
                                j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                            break;
                        case 2:
                            var interpolationData = key.interpolationData;
                            var interDataLen = interpolationData.length;
                            var dataIndex = 0;
                            for (j = 0; j < interDataLen;) {
                                var type = interpolationData[j];
                                switch (type) {
                                    case 6:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                        break;
                                    case 7:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                        break;
                                    default:
                                        j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                                }
                                //if (type === 6)
                                //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData.slice(j+1, j + 5));
                                //else
                                //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                                dataIndex++;
                            }
                            break;
                    }
                }
                else {
                    for (j = 0; j < node.keyframeWidth;)
                        j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                }
                outOfs += node.keyframeWidth;
            }
        }
    }
    AnimationTemplet.interpolation = [AnimationTemplet._LinearInterpolation_0, AnimationTemplet._QuaternionInterpolation_1, AnimationTemplet._AngleInterpolation_2, AnimationTemplet._RadiansInterpolation_3, AnimationTemplet._Matrix4x4Interpolation_4, AnimationTemplet._NoInterpolation_5, AnimationTemplet._BezierInterpolation_6, AnimationTemplet._BezierInterpolation_7];
    IAniLib.AnimationTemplet = AnimationTemplet;

    class GraphicsAni extends Laya.Graphics {
        /**
         * @private
         * 画自定义蒙皮动画
         * @param	skin
         */
        //TODO:coverage
        drawSkin(skinA, alpha) {
            this.drawTriangles(skinA.texture, 0, 0, skinA.vertices, skinA.uvs, skinA.indexes, skinA.transform || Laya.Matrix.EMPTY, alpha);
        }
        //TODO:coverage
        static create() {
            var rs = GraphicsAni._caches.pop();
            return rs || new GraphicsAni();
        }
        //TODO:coverage
        static recycle(graphics) {
            graphics.clear();
            GraphicsAni._caches.push(graphics);
        }
    }
    GraphicsAni._caches = [];

    class Transform {
        constructor() {
            this.skX = 0; // 旋转？
            this.skY = 0; // 不知道干什么的
            this.scX = 1; // 缩放
            this.scY = 1;
            this.x = 0; // 偏移
            this.y = 0;
            this.skewX = 0; // skew
            this.skewY = 0;
        }
        //TODO:coverage
        initData(data) {
            if (data.x != undefined) {
                this.x = data.x;
            }
            if (data.y != undefined) {
                this.y = data.y;
            }
            if (data.skX != undefined) {
                this.skX = data.skX;
            }
            if (data.skY != undefined) {
                this.skY = data.skY;
            }
            if (data.scX != undefined) {
                this.scX = data.scX;
            }
            if (data.scY != undefined) {
                this.scY = data.scY;
            }
        }
        //TODO:coverage
        getMatrix() {
            var tMatrix;
            if (this.mMatrix) {
                tMatrix = this.mMatrix;
            }
            else {
                tMatrix = this.mMatrix = new Laya.Matrix();
            }
            tMatrix.identity();
            tMatrix.scale(this.scX, this.scY);
            if (this.skewX || this.skewY) {
                this.skew(tMatrix, this.skewX * Math.PI / 180, this.skewY * Math.PI / 180);
            }
            tMatrix.rotate(this.skX * Math.PI / 180);
            tMatrix.translate(this.x, this.y);
            return tMatrix;
        }
        //TODO:coverage
        skew(m, x, y) {
            var sinX = Math.sin(y);
            var cosX = Math.cos(y);
            var sinY = Math.sin(x);
            var cosY = Math.cos(x);
            m.setTo(m.a * cosY - m.b * sinX, m.a * sinY + m.b * cosX, m.c * cosY - m.d * sinX, m.c * sinY + m.d * cosX, m.tx * cosY - m.ty * sinX, m.tx * sinY + m.ty * cosX);
            return m;
        }
    }

    /**
     * @private
     */
    class Bone {
        constructor() {
            this.length = 10;
            this.resultTransform = new Transform();
            this.resultMatrix = new Laya.Matrix();
            this.inheritScale = true;
            this.inheritRotation = true;
            this.d = -1;
            this._children = [];
        }
        setTempMatrix(matrix) {
            this._tempMatrix = matrix;
            var i = 0, n = 0;
            var tBone;
            for (i = 0, n = this._children.length; i < n; i++) {
                tBone = this._children[i];
                tBone.setTempMatrix(this._tempMatrix);
            }
        }
        //TODO:coverage
        update(pMatrix = null) {
            this.rotation = this.transform.skX;
            var tResultMatrix;
            if (pMatrix) {
                tResultMatrix = this.resultTransform.getMatrix();
                Laya.Matrix.mul(tResultMatrix, pMatrix, this.resultMatrix);
                this.resultRotation = this.rotation;
            }
            else {
                this.resultRotation = this.rotation + this.parentBone.resultRotation;
                if (this.parentBone) {
                    if (this.inheritRotation && this.inheritScale) {
                        tResultMatrix = this.resultTransform.getMatrix();
                        Laya.Matrix.mul(tResultMatrix, this.parentBone.resultMatrix, this.resultMatrix);
                    }
                    else {
                        var parent = this.parentBone;
                        var tAngle;
                        var cos;
                        var sin;
                        var tParentMatrix = this.parentBone.resultMatrix;
                        //var worldX:Number = tParentMatrix.a * transform.x + tParentMatrix.c * transform.y + tParentMatrix.tx;
                        //var worldY:Number = tParentMatrix.b * transform.x + tParentMatrix.d * transform.y + tParentMatrix.ty;
                        //out.tx = ba * atx + bc * aty + btx;
                        //out.ty = bb * atx + bd * aty + bty;
                        tResultMatrix = this.resultTransform.getMatrix();
                        var worldX = tParentMatrix.a * tResultMatrix.tx + tParentMatrix.c * tResultMatrix.ty + tParentMatrix.tx;
                        var worldY = tParentMatrix.b * tResultMatrix.tx + tParentMatrix.d * tResultMatrix.ty + tParentMatrix.ty;
                        var tTestMatrix = new Laya.Matrix();
                        if (this.inheritRotation) {
                            tAngle = Math.atan2(parent.resultMatrix.b, parent.resultMatrix.a);
                            cos = Math.cos(tAngle), sin = Math.sin(tAngle);
                            tTestMatrix.setTo(cos, sin, -sin, cos, 0, 0);
                            Laya.Matrix.mul(this._tempMatrix, tTestMatrix, Laya.Matrix.TEMP);
                            Laya.Matrix.TEMP.copyTo(tTestMatrix);
                            tResultMatrix = this.resultTransform.getMatrix();
                            Laya.Matrix.mul(tResultMatrix, tTestMatrix, this.resultMatrix);
                            if (this.resultTransform.scX * this.resultTransform.scY < 0) {
                                this.resultMatrix.rotate(Math.PI * 0.5);
                            }
                            this.resultMatrix.tx = worldX;
                            this.resultMatrix.ty = worldY;
                        }
                        else if (this.inheritScale) {
                            tResultMatrix = this.resultTransform.getMatrix();
                            Laya.Matrix.TEMP.identity();
                            Laya.Matrix.TEMP.d = this.d;
                            Laya.Matrix.mul(tResultMatrix, Laya.Matrix.TEMP, this.resultMatrix);
                            this.resultMatrix.tx = worldX;
                            this.resultMatrix.ty = worldY;
                        }
                        else {
                            tResultMatrix = this.resultTransform.getMatrix();
                            Laya.Matrix.TEMP.identity();
                            Laya.Matrix.TEMP.d = this.d;
                            Laya.Matrix.mul(tResultMatrix, Laya.Matrix.TEMP, this.resultMatrix);
                            this.resultMatrix.tx = worldX;
                            this.resultMatrix.ty = worldY;
                        }
                    }
                }
                else {
                    tResultMatrix = this.resultTransform.getMatrix();
                    tResultMatrix.copyTo(this.resultMatrix);
                }
            }
            var i = 0, n = 0;
            var tBone;
            for (i = 0, n = this._children.length; i < n; i++) {
                tBone = this._children[i];
                tBone.update();
            }
        }
        //TODO:coverage
        updateChild() {
            var i = 0, n = 0;
            var tBone;
            for (i = 0, n = this._children.length; i < n; i++) {
                tBone = this._children[i];
                tBone.update();
            }
        }
        //TODO:coverage
        setRotation(rd) {
            if (this._sprite) {
                this._sprite.rotation = rd * 180 / Math.PI;
            }
        }
        //TODO:coverage
        updateDraw(x, y) {
            if (!Bone.ShowBones || Bone.ShowBones[this.name]) {
                if (this._sprite) {
                    this._sprite.x = x + this.resultMatrix.tx;
                    this._sprite.y = y + this.resultMatrix.ty;
                }
                else {
                    this._sprite = new Laya.Sprite();
                    this._sprite.graphics.drawCircle(0, 0, 5, "#ff0000");
                    this._sprite.graphics.drawLine(0, 0, this.length, 0, "#00ff00");
                    this._sprite.graphics.fillText(this.name, 0, 0, "20px Arial", "#00ff00", "center");
                    Laya.ILaya.stage.addChild(this._sprite);
                    this._sprite.x = x + this.resultMatrix.tx;
                    this._sprite.y = y + this.resultMatrix.ty;
                }
            }
            var i = 0, n = 0;
            var tBone;
            for (i = 0, n = this._children.length; i < n; i++) {
                tBone = this._children[i];
                tBone.updateDraw(x, y);
            }
        }
        addChild(bone) {
            this._children.push(bone);
            bone.parentBone = this;
        }
        //TODO:coverage
        findBone(boneName) {
            if (this.name == boneName) {
                return this;
            }
            else {
                var i, n;
                var tBone;
                var tResult;
                for (i = 0, n = this._children.length; i < n; i++) {
                    tBone = this._children[i];
                    tResult = tBone.findBone(boneName);
                    if (tResult) {
                        return tResult;
                    }
                }
            }
            return null;
        }
        //TODO:coverage
        localToWorld(local) {
            var localX = local[0];
            var localY = local[1];
            local[0] = localX * this.resultMatrix.a + localY * this.resultMatrix.c + this.resultMatrix.tx;
            local[1] = localX * this.resultMatrix.b + localY * this.resultMatrix.d + this.resultMatrix.ty;
        }
    }
    Bone.ShowBones = {};

    /**
     * 用于UV转换的工具类
     * @internal
     */
    class UVTools {
        constructor() {
        }
        //[0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0]
        /**
         * 将相对于大图图集的小UV转换成相对某个大图的UV
         * @param	bigUV 某个大图的UV
         * @param	smallUV 大图图集中的UV
         * @return 相对于某个大图的UV
         */
        //TODO:coverage
        static getRelativeUV(bigUV, smallUV, rst = null) {
            var startX = bigUV[0];
            var width = bigUV[2] - bigUV[0];
            var startY = bigUV[1];
            var height = bigUV[5] - bigUV[1];
            if (!rst)
                rst = [];
            rst.length = smallUV.length;
            var i, len;
            len = rst.length;
            var dWidth = 1 / width;
            var dHeight = 1 / height;
            for (i = 0; i < len; i += 2) {
                rst[i] = (smallUV[i] - startX) * dWidth;
                rst[i + 1] = (smallUV[i + 1] - startY) * dHeight;
            }
            return rst;
        }
        /**
         * 将相对于某个大图的UV转换成相对于大图图集的UV
         * @param	bigUV 某个大图的UV
         * @param	smallUV 相对于某个大图的UV
         * @return 相对于大图图集的UV
         */
        //TODO:coverage
        static getAbsoluteUV(bigUV, smallUV, rst = null) {
            if (bigUV[0] == 0 && bigUV[1] == 0 && bigUV[4] == 1 && bigUV[5] == 1) {
                if (rst) {
                    Laya.Utils.copyArray(rst, smallUV);
                    return rst;
                }
                else {
                    return smallUV;
                }
            }
            var startX = bigUV[0];
            var width = bigUV[2] - bigUV[0];
            var startY = bigUV[1];
            var height = bigUV[5] - bigUV[1];
            if (!rst)
                rst = [];
            rst.length = smallUV.length;
            var i, len;
            len = rst.length;
            for (i = 0; i < len; i += 2) {
                rst[i] = smallUV[i] * width + startX;
                rst[i + 1] = smallUV[i + 1] * height + startY;
            }
            return rst;
        }
    }

    /**
     */
    class MeshData {
        constructor() {
            /**
             * uv数据
             */
            this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
            /**
             * 顶点数据
             */
            this.vertices = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
            /**
             * 顶点索引
             */
            this.indexes = new Uint16Array([0, 1, 3, 3, 1, 2]);
            /**
             * 是否有uv变化矩阵
             */
            this.useUvTransform = false;
            /**
             * 扩展像素,用来去除黑边
             */
            this.canvasPadding = 1;
        }
        /**
         * 计算mesh的Bounds
         * @return
         *
         */
        //TODO:coverage
        getBounds() {
            return Laya.Rectangle._getWrapRec(this.vertices);
        }
    }

    class SkinMeshForGraphic extends MeshData {
        //TODO:coverage
        constructor() {
            super();
        }
        init2(texture, ps, verticles, uvs) {
            if (this.transform) {
                this.transform = null;
            }
            var _ps = ps || [0, 1, 3, 3, 1, 2];
            this.texture = texture;
            this.indexes = new Uint16Array(_ps);
            this.vertices = new Float32Array(verticles);
            this.uvs = new Float32Array(uvs);
        }
    }

    class BoneSlot {
        constructor() {
            /** 原始数据的索引 */
            this.srcDisplayIndex = -1;
            /** 判断对象是否是原对象 */
            this.type = "src";
            /** 显示皮肤的索引 */
            this.displayIndex = -1;
            /** @private */
            this.originalIndex = -1;
            /** 索引替换表 */
            this._replaceDic = {};
        }
        /**
         * 设置要显示的插槽数据
         * @param	slotData
         * @param	disIndex
         * @param	freshIndex 是否重置纹理
         */
        showSlotData(slotData, freshIndex = true) {
            this.currSlotData = slotData;
            if (freshIndex)
                this.displayIndex = this.srcDisplayIndex;
            this.currDisplayData = null;
            this.currTexture = null;
        }
        /**
         * 通过名字显示指定对象
         * @param	name
         */
        showDisplayByName(name) {
            if (this.currSlotData) {
                this.showDisplayByIndex(this.currSlotData.getDisplayByName(name));
            }
        }
        /**
         * 替换贴图名
         * @param	tarName 要替换的贴图名
         * @param	newName 替换后的贴图名
         */
        replaceDisplayByName(tarName, newName) {
            if (!this.currSlotData)
                return;
            var preIndex;
            preIndex = this.currSlotData.getDisplayByName(tarName);
            var newIndex;
            newIndex = this.currSlotData.getDisplayByName(newName);
            this.replaceDisplayByIndex(preIndex, newIndex);
        }
        /**
         * 替换贴图索引
         * @param	tarIndex 要替换的索引
         * @param	newIndex 替换后的索引
         */
        replaceDisplayByIndex(tarIndex, newIndex) {
            if (!this.currSlotData)
                return;
            this._replaceDic[tarIndex] = newIndex;
            if (this.originalIndex == tarIndex) {
                this.showDisplayByIndex(tarIndex);
            }
        }
        /**
         * 指定显示对象
         * @param	index
         */
        showDisplayByIndex(index) {
            this.originalIndex = index;
            if (this._replaceDic[index] != null)
                index = this._replaceDic[index];
            if (this.currSlotData && index > -1 && index < this.currSlotData.displayArr.length) {
                this.displayIndex = index;
                this.currDisplayData = this.currSlotData.displayArr[index];
                if (this.currDisplayData) {
                    var tName = this.currDisplayData.name;
                    this.currTexture = this.templet.getTexture(tName);
                    if (this.currTexture && this.currDisplayData.type == 0 && this.currDisplayData.uvs) {
                        this.currTexture = this.currDisplayData.createTexture(this.currTexture);
                    }
                }
            }
            else {
                this.displayIndex = -1;
                this.currDisplayData = null;
                this.currTexture = null;
            }
        }
        /**
         * 替换皮肤
         * @param	_texture
         */
        replaceSkin(_texture) {
            this._diyTexture = _texture;
            if (this._curDiyUV)
                this._curDiyUV.length = 0;
            if (this.currDisplayData && this._diyTexture == this.currDisplayData.texture) {
                this._diyTexture = null;
            }
        }
        /**
         * 保存父矩阵的索引
         * @param	parentMatrix
         */
        //TODO:coverage
        setParentMatrix(parentMatrix) {
            this._parentMatrix = parentMatrix;
        }
        //TODO:coverage
        static createSkinMesh() {
            return new SkinMeshForGraphic();
        }
        //TODO:coverage
        static isSameArr(arrA, arrB) {
            if (arrA.length != arrB.length)
                return false;
            var i, len;
            len = arrA.length;
            for (i = 0; i < len; i++) {
                if (arrA[i] != arrB[i])
                    return false;
            }
            return true;
        }
        //TODO:coverage
        getSaveVerticle(tArr) {
            if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicVerticle && BoneSlot.isSameArr(tArr, this._preGraphicVerticle)) {
                tArr = this._preGraphicVerticle;
            }
            else {
                tArr = Laya.ILaya.Utils.copyArray([], tArr);
                this._preGraphicVerticle = tArr;
            }
            return tArr;
        }
        //TODO:coverage
        static isSameMatrix(mtA, mtB) {
            return mtA.a == mtB.a && mtA.b == mtB.b && mtA.c == mtB.c && mtA.d == mtB.d && Math.abs(mtA.tx - mtB.tx) < 0.00001 && Math.abs(mtA.ty - mtB.ty) < 0.00001;
        }
        //TODO:coverage
        getSaveMatrix(tResultMatrix) {
            if (BoneSlot.useSameMatrixAndVerticle && this._preGraphicMatrix && BoneSlot.isSameMatrix(tResultMatrix, this._preGraphicMatrix)) {
                tResultMatrix = this._preGraphicMatrix;
            }
            else {
                var newMatrix = tResultMatrix.clone();
                tResultMatrix = newMatrix;
                this._preGraphicMatrix = tResultMatrix;
            }
            return tResultMatrix;
        }
        /**
         * 把纹理画到Graphics上
         * @param	graphics
         * @param	noUseSave   不使用共享的矩阵对象 _tempResultMatrix，只有实时计算的时候才设置为true
         */
        draw(graphics, boneMatrixArray, noUseSave = false, alpha = 1) {
            if ((this._diyTexture == null && this.currTexture == null) || this.currDisplayData == null) {
                if (!(this.currDisplayData && this.currDisplayData.type == 3)) {
                    return;
                }
            }
            var tTexture = this.currTexture;
            if (this._diyTexture)
                tTexture = this._diyTexture;
            var tSkinSprite;
            switch (this.currDisplayData.type) {
                case 0:
                    if (graphics) {
                        var tCurrentMatrix = this.getDisplayMatrix();
                        if (this._parentMatrix) {
                            var tRotateKey = false; // 是否有旋转
                            if (tCurrentMatrix) {
                                Laya.Matrix.mul(tCurrentMatrix, this._parentMatrix, Laya.Matrix.TEMP);
                                var tResultMatrix;
                                if (noUseSave) {
                                    if (this._resultMatrix == null)
                                        this._resultMatrix = new Laya.Matrix();
                                    tResultMatrix = this._resultMatrix;
                                }
                                else {
                                    //tResultMatrix = new Matrix();
                                    tResultMatrix = BoneSlot._tempResultMatrix;
                                }
                                if (this._diyTexture && this.currDisplayData.uvs) {
                                    var tTestMatrix = BoneSlot._tempMatrix;
                                    tTestMatrix.identity();
                                    //判断是否上下反转。
                                    if (this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                        tTestMatrix.d = -1;
                                    }
                                    //判断是否旋转
                                    if (this.currDisplayData.uvs[0] > this.currDisplayData.uvs[4]
                                        && this.currDisplayData.uvs[1] > this.currDisplayData.uvs[5]) {
                                        tRotateKey = true;
                                        tTestMatrix.rotate(-Math.PI / 2);
                                    }
                                    Laya.Matrix.mul(tTestMatrix, Laya.Matrix.TEMP, tResultMatrix);
                                }
                                else {
                                    Laya.Matrix.TEMP.copyTo(tResultMatrix);
                                }
                                if (!noUseSave) {
                                    tResultMatrix = this.getSaveMatrix(tResultMatrix);
                                }
                                tResultMatrix._checkTransform();
                                if (tRotateKey) {
                                    graphics.drawTexture(tTexture, -this.currDisplayData.height / 2, -this.currDisplayData.width / 2, this.currDisplayData.height, this.currDisplayData.width, tResultMatrix, alpha);
                                }
                                else {
                                    graphics.drawTexture(tTexture, -this.currDisplayData.width / 2, -this.currDisplayData.height / 2, this.currDisplayData.width, this.currDisplayData.height, tResultMatrix, alpha);
                                }
                            }
                        }
                    }
                    break;
                case 1:
                    if (noUseSave) {
                        if (this._skinSprite == null) {
                            this._skinSprite = BoneSlot.createSkinMesh();
                        }
                        tSkinSprite = this._skinSprite;
                    }
                    else {
                        tSkinSprite = BoneSlot.createSkinMesh();
                    }
                    if (tSkinSprite == null) {
                        return;
                    }
                    var tIBArray;
                    if (this.currDisplayData.bones == null) {
                        var tVertices = this.currDisplayData.weights;
                        if (this.deformData) {
                            tVertices = this.deformData;
                        }
                        var tUVs;
                        if (this._diyTexture) {
                            if (!this._curDiyUV) {
                                this._curDiyUV = [];
                            }
                            if (this._curDiyUV.length == 0) {
                                this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                                this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
                            }
                            tUVs = this._curDiyUV;
                        }
                        else {
                            tUVs = this.currDisplayData.uvs;
                        }
                        this._mVerticleArr = tVertices;
                        var tTriangleNum = this.currDisplayData.triangles.length / 3;
                        tIBArray = this.currDisplayData.triangles;
                        if (this.deformData) {
                            if (!noUseSave) {
                                this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
                            }
                        }
                        tSkinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUVs);
                        var tCurrentMatrix2 = this.getDisplayMatrix();
                        if (this._parentMatrix) {
                            if (tCurrentMatrix2) {
                                Laya.Matrix.mul(tCurrentMatrix2, this._parentMatrix, Laya.Matrix.TEMP);
                                var tResultMatrix2;
                                if (noUseSave) {
                                    if (this._resultMatrix == null)
                                        this._resultMatrix = new Laya.Matrix();
                                    tResultMatrix2 = this._resultMatrix;
                                }
                                else {
                                    tResultMatrix2 = BoneSlot._tempResultMatrix;
                                }
                                Laya.Matrix.TEMP.copyTo(tResultMatrix2);
                                if (!noUseSave) {
                                    tResultMatrix2 = this.getSaveMatrix(tResultMatrix2);
                                }
                                tSkinSprite.transform = tResultMatrix2;
                            }
                        }
                    }
                    else {
                        this.skinMesh(boneMatrixArray, tSkinSprite);
                    }
                    graphics.drawSkin(tSkinSprite, alpha);
                    break;
                case 2:
                    if (noUseSave) {
                        if (this._skinSprite == null) {
                            this._skinSprite = BoneSlot.createSkinMesh();
                        }
                        tSkinSprite = this._skinSprite;
                    }
                    else {
                        tSkinSprite = BoneSlot.createSkinMesh();
                    }
                    if (tSkinSprite == null) {
                        return;
                    }
                    this.skinMesh(boneMatrixArray, tSkinSprite);
                    graphics.drawSkin(tSkinSprite, alpha);
                    break;
                case 3:
                    break;
            }
        }
        /**
         * 显示蒙皮动画
         * @param	boneMatrixArray 当前帧的骨骼矩阵
         */
        skinMesh(boneMatrixArray, skinSprite) {
            var tTexture = this.currTexture;
            var tBones = this.currDisplayData.bones;
            var tUvs;
            if (this._diyTexture) {
                tTexture = this._diyTexture;
                if (!this._curDiyUV) {
                    this._curDiyUV = [];
                }
                if (this._curDiyUV.length == 0) {
                    this._curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, this.currDisplayData.uvs, this._curDiyUV);
                    this._curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, this._curDiyUV, this._curDiyUV);
                }
                tUvs = this._curDiyUV;
            }
            else {
                tUvs = this.currDisplayData.uvs;
            }
            var tWeights = this.currDisplayData.weights;
            var tTriangles = this.currDisplayData.triangles;
            var tIBArray;
            var tRx = 0;
            var tRy = 0;
            var nn = 0;
            var tMatrix;
            var tX;
            var tY;
            var tB = 0;
            var tWeight = 0;
            var tVertices;
            var i = 0, n = 0;
            BoneSlot._tempVerticleArr.length = 0;
            tVertices = BoneSlot._tempVerticleArr;
            if (this.deformData && this.deformData.length > 0) {
                var f = 0;
                for (i = 0, n = tBones.length; i < n;) {
                    nn = tBones[i++] + i;
                    tRx = 0, tRy = 0;
                    for (; i < nn; i++) {
                        tMatrix = boneMatrixArray[tBones[i]];
                        tX = tWeights[tB] + this.deformData[f++];
                        tY = tWeights[tB + 1] + this.deformData[f++];
                        tWeight = tWeights[tB + 2];
                        tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                        tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                        tB += 3;
                    }
                    tVertices.push(tRx, tRy);
                }
            }
            else {
                for (i = 0, n = tBones.length; i < n;) {
                    nn = tBones[i++] + i;
                    tRx = 0, tRy = 0;
                    for (; i < nn; i++) {
                        tMatrix = boneMatrixArray[tBones[i]];
                        tX = tWeights[tB];
                        tY = tWeights[tB + 1];
                        tWeight = tWeights[tB + 2];
                        tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
                        tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
                        tB += 3;
                    }
                    tVertices.push(tRx, tRy);
                }
            }
            this._mVerticleArr = tVertices;
            tIBArray = tTriangles;
            this._mVerticleArr = this.getSaveVerticle(this._mVerticleArr);
            skinSprite.init2(tTexture, tIBArray, this._mVerticleArr, tUvs);
        }
        /**
         * 画骨骼的起始点，方便调试
         * @param	graphics
         */
        drawBonePoint(graphics) {
            if (graphics && this._parentMatrix) {
                graphics.drawCircle(this._parentMatrix.tx, this._parentMatrix.ty, 5, "#ff0000");
            }
        }
        /**
         * 得到显示对象的矩阵
         * @return
         */
        //TODO:coverage
        getDisplayMatrix() {
            if (this.currDisplayData) {
                return this.currDisplayData.transform.getMatrix();
            }
            return null;
        }
        /**
         * 得到插糟的矩阵
         * @return
         */
        getMatrix() {
            return this._resultMatrix;
        }
        /**
         * 用原始数据拷贝出一个
         * @return
         */
        copy() {
            var tBoneSlot = new BoneSlot();
            tBoneSlot.type = "copy";
            tBoneSlot.name = this.name;
            tBoneSlot.attachmentName = this.attachmentName;
            tBoneSlot.srcDisplayIndex = this.srcDisplayIndex;
            tBoneSlot.parent = this.parent;
            tBoneSlot.displayIndex = this.displayIndex;
            tBoneSlot.templet = this.templet;
            tBoneSlot.currSlotData = this.currSlotData;
            tBoneSlot.currTexture = this.currTexture;
            tBoneSlot.currDisplayData = this.currDisplayData;
            return tBoneSlot;
        }
    }
    BoneSlot._tempMatrix = new Laya.Matrix();
    BoneSlot._tempResultMatrix = new Laya.Matrix();
    BoneSlot.useSameMatrixAndVerticle = true;
    BoneSlot._tempVerticleArr = [];

    /**
     * @internal
     */
    class DeformAniData {
        //TODO:coverage
        constructor() {
            this.deformSlotDataList = [];
        }
    }

    /**
     * @internal
     */
    class DeformSlotData {
        //TODO:coverage
        constructor() {
            this.deformSlotDisplayList = [];
        }
    }

    /**
     * @internal
     */
    class DeformSlotDisplayData {
        //TODO:coverage
        constructor() {
            this.slotIndex = -1;
            this.timeList = [];
            this.vectices = [];
            this.tweenKeyList = [];
            this.frameIndex = 0;
        }
        binarySearch1(values, target) {
            var low = 0;
            var high = values.length - 2;
            if (high == 0)
                return 1;
            var current = high >>> 1;
            while (true) {
                if (values[Math.floor(current + 1)] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return low + 1;
                current = (low + high) >>> 1;
            }
            return 0; // Can't happen.
        }
        //TODO:coverage
        apply(time, boneSlot, alpha = 1) {
            time += 0.05;
            if (this.timeList.length <= 0) {
                return;
            }
            var i = 0;
            var tTime = this.timeList[0];
            if (time < tTime) {
                return;
            }
            var tVertexCount = this.vectices[0].length;
            var tVertices = [];
            var tFrameIndex = this.binarySearch1(this.timeList, time);
            this.frameIndex = tFrameIndex;
            if (time >= this.timeList[this.timeList.length - 1]) {
                var lastVertices = this.vectices[this.vectices.length - 1];
                if (alpha < 1) {
                    for (i = 0; i < tVertexCount; i++) {
                        tVertices[i] += (lastVertices[i] - tVertices[i]) * alpha;
                    }
                }
                else {
                    for (i = 0; i < tVertexCount; i++) {
                        tVertices[i] = lastVertices[i];
                    }
                }
                this.deformData = tVertices;
                return;
            }
            var tTweenKey = this.tweenKeyList[this.frameIndex];
            var tPrevVertices = this.vectices[this.frameIndex - 1];
            var tNextVertices = this.vectices[this.frameIndex];
            var tPreFrameTime = this.timeList[this.frameIndex - 1];
            var tFrameTime = this.timeList[this.frameIndex];
            if (this.tweenKeyList[tFrameIndex - 1]) {
                alpha = (time - tPreFrameTime) / (tFrameTime - tPreFrameTime);
            }
            else {
                alpha = 0;
            }
            var tPrev;
            for (i = 0; i < tVertexCount; i++) {
                tPrev = tPrevVertices[i];
                tVertices[i] = tPrev + (tNextVertices[i] - tPrev) * alpha;
            }
            this.deformData = tVertices;
        }
    }

    /**
     * @internal
     */
    class DrawOrderData {
        //TODO:coverage
        constructor() {
            this.drawOrder = [];
        }
    }

    class EventData {
        constructor() {
        }
    }

    /**
     * @internal
     */
    class IkConstraint {
        //TODO:coverage
        constructor(data, bones) {
            this.isSpine = true;
            this.isDebug = false;
            this._data = data;
            this._targetBone = bones[data.targetBoneIndex];
            this.isSpine = data.isSpine;
            if (this._bones == null)
                this._bones = [];
            this._bones.length = 0;
            for (var i = 0, n = data.boneIndexs.length; i < n; i++) {
                this._bones.push(bones[data.boneIndexs[i]]);
            }
            this.name = data.name;
            this.mix = data.mix;
            this.bendDirection = data.bendDirection;
        }
        apply() {
            switch (this._bones.length) {
                case 1:
                    this._applyIk1(this._bones[0], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.mix);
                    break;
                case 2:
                    if (this.isSpine) {
                        this._applyIk2(this._bones[0], this._bones[1], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.bendDirection, this.mix); // tIkConstraintData.mix);
                    }
                    else {
                        this._applyIk3(this._bones[0], this._bones[1], this._targetBone.resultMatrix.tx, this._targetBone.resultMatrix.ty, this.bendDirection, this.mix); // tIkConstraintData.mix);
                    }
                    break;
            }
        }
        //TODO:coverage
        _applyIk1(bone, targetX, targetY, alpha) {
            var pp = bone.parentBone;
            var id = 1 / (pp.resultMatrix.a * pp.resultMatrix.d - pp.resultMatrix.b * pp.resultMatrix.c);
            var x = targetX - pp.resultMatrix.tx;
            var y = targetY - pp.resultMatrix.ty;
            var tx = (x * pp.resultMatrix.d - y * pp.resultMatrix.c) * id - bone.transform.x;
            var ty = (y * pp.resultMatrix.a - x * pp.resultMatrix.b) * id - bone.transform.y;
            var rotationIK = Math.atan2(ty, tx) * IkConstraint.radDeg - 0 - bone.transform.skX;
            if (bone.transform.scX < 0)
                rotationIK += 180;
            if (rotationIK > 180)
                rotationIK -= 360;
            else if (rotationIK < -180)
                rotationIK += 360;
            bone.transform.skX = bone.transform.skY = bone.transform.skX + rotationIK * alpha;
            bone.update();
        }
        //TODO:coverage
        updatePos(x, y) {
            if (this._sp) {
                this._sp.pos(x, y);
            }
        }
        //TODO:coverage
        _applyIk2(parent, child, targetX, targetY, bendDir, alpha) {
            if (alpha == 0) {
                return;
            }
            //spine 双骨骼ik计算
            var px = parent.resultTransform.x, py = parent.resultTransform.y;
            var psx = parent.transform.scX, psy = parent.transform.scY;
            var csx = child.transform.scX;
            var os1, os2, s2;
            if (psx < 0) {
                psx = -psx;
                os1 = 180;
                s2 = -1;
            }
            else {
                os1 = 0;
                s2 = 1;
            }
            if (psy < 0) {
                psy = -psy;
                s2 = -s2;
            }
            if (csx < 0) {
                csx = -csx;
                os2 = 180;
            }
            else {
                os2 = 0;
            }
            var cx = child.resultTransform.x, cy, cwx, cwy;
            var a = parent.resultMatrix.a, b = parent.resultMatrix.c;
            var c = parent.resultMatrix.b, d = parent.resultMatrix.d;
            var u = Math.abs(psx - psy) <= 0.0001;
            //求子骨骼的世界坐标点
            if (!u) {
                cy = 0;
                cwx = a * cx + parent.resultMatrix.tx;
                cwy = c * cx + parent.resultMatrix.ty;
            }
            else {
                cy = child.resultTransform.y;
                cwx = a * cx + b * cy + parent.resultMatrix.tx;
                cwy = c * cx + d * cy + parent.resultMatrix.ty;
            }
            //cwx,cwy为子骨骼应该在的世界坐标
            if (this.isDebug) {
                if (!this._sp) {
                    this._sp = new Laya.Sprite();
                    Laya.ILaya.stage.addChild(this._sp);
                }
                this._sp.graphics.clear();
                this._sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");
                this._sp.graphics.drawCircle(cwx, cwy, 15, "#ff00ff");
            }
            parent.setRotation(Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx));
            var pp = parent.parentBone;
            a = pp.resultMatrix.a;
            b = pp.resultMatrix.c;
            c = pp.resultMatrix.b;
            d = pp.resultMatrix.d;
            //逆因子
            var id = 1 / (a * d - b * c);
            //求得IK中的子骨骼角度向量
            var x = targetX - pp.resultMatrix.tx, y = targetY - pp.resultMatrix.ty;
            var tx = (x * d - y * b) * id - px;
            var ty = (y * a - x * c) * id - py;
            //求得子骨骼的角度向量
            x = cwx - pp.resultMatrix.tx;
            y = cwy - pp.resultMatrix.ty;
            var dx = (x * d - y * b) * id - px;
            var dy = (y * a - x * c) * id - py;
            //子骨骼的实际长度
            var l1 = Math.sqrt(dx * dx + dy * dy);
            //子骨骼的长度
            var l2 = child.length * csx;
            var a1, a2;
            if (u) {
                l2 *= psx;
                //求IK的角度
                var cos = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                if (cos < -1)
                    cos = -1;
                else if (cos > 1)
                    cos = 1;
                a2 = Math.acos(cos) * bendDir;
                a = l1 + l2 * cos;
                b = l2 * Math.sin(a2);
                a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
            }
            else {
                a = psx * l2;
                b = psy * l2;
                var aa = a * a, bb = b * b, dd = tx * tx + ty * ty, ta = Math.atan2(ty, tx);
                c = bb * l1 * l1 + aa * dd - aa * bb;
                var c1 = -2 * bb * l1, c2 = bb - aa;
                d = c1 * c1 - 4 * c2 * c;
                if (d > 0) {
                    var q = Math.sqrt(d);
                    if (c1 < 0)
                        q = -q;
                    q = -(c1 + q) / 2;
                    var r0 = q / c2, r1 = c / q;
                    var r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                    if (r * r <= dd) {
                        y = Math.sqrt(dd - r * r) * bendDir;
                        a1 = ta - Math.atan2(y, r);
                        a2 = Math.atan2(y / psy, (r - l1) / psx);
                    }
                }
                var minAngle = 0, minDist = Number.MAX_VALUE, minX = 0, minY = 0;
                var maxAngle = 0, maxDist = 0, maxX = 0, maxY = 0;
                x = l1 + a;
                d = x * x;
                if (d > maxDist) {
                    maxAngle = 0;
                    maxDist = d;
                    maxX = x;
                }
                x = l1 - a;
                d = x * x;
                if (d < minDist) {
                    minAngle = Math.PI;
                    minDist = d;
                    minX = x;
                }
                var angle = Math.acos(-a * l1 / (aa - bb));
                x = a * Math.cos(angle) + l1;
                y = b * Math.sin(angle);
                d = x * x + y * y;
                if (d < minDist) {
                    minAngle = angle;
                    minDist = d;
                    minX = x;
                    minY = y;
                }
                if (d > maxDist) {
                    maxAngle = angle;
                    maxDist = d;
                    maxX = x;
                    maxY = y;
                }
                if (dd <= (minDist + maxDist) / 2) {
                    a1 = ta - Math.atan2(minY * bendDir, minX);
                    a2 = minAngle * bendDir;
                }
                else {
                    a1 = ta - Math.atan2(maxY * bendDir, maxX);
                    a2 = maxAngle * bendDir;
                }
            }
            var os = Math.atan2(cy, cx) * s2;
            var rotation = parent.resultTransform.skX;
            a1 = (a1 - os) * IkConstraint.radDeg + os1 - rotation;
            if (a1 > 180)
                a1 -= 360;
            else if (a1 < -180)
                a1 += 360;
            parent.resultTransform.x = px;
            parent.resultTransform.y = py;
            parent.resultTransform.skX = parent.resultTransform.skY = rotation + a1 * alpha;
            rotation = child.resultTransform.skX;
            rotation = rotation % 360;
            a2 = ((a2 + os) * IkConstraint.radDeg - 0) * s2 + os2 - rotation;
            if (a2 > 180)
                a2 -= 360;
            else if (a2 < -180)
                a2 += 360;
            child.resultTransform.x = cx;
            child.resultTransform.y = cy;
            child.resultTransform.skX = child.resultTransform.skY = child.resultTransform.skY + a2 * alpha;
            parent.update();
        }
        //TODO:coverage
        _applyIk3(parent, child, targetX, targetY, bendDir, alpha) {
            if (alpha == 0) {
                return;
            }
            var cwx, cwy;
            // 龙骨双骨骼ik计算
            const x = child.resultMatrix.a * child.length;
            const y = child.resultMatrix.b * child.length;
            const lLL = x * x + y * y;
            //child骨骼长度
            const lL = Math.sqrt(lLL);
            var parentX = parent.resultMatrix.tx;
            var parentY = parent.resultMatrix.ty;
            var childX = child.resultMatrix.tx;
            var childY = child.resultMatrix.ty;
            var dX = childX - parentX;
            var dY = childY - parentY;
            const lPP = dX * dX + dY * dY;
            //parent骨骼长度
            const lP = Math.sqrt(lPP);
            dX = targetX - parent.resultMatrix.tx;
            dY = targetY - parent.resultMatrix.ty;
            const lTT = dX * dX + dY * dY;
            //parent到ik的长度
            const lT = Math.sqrt(lTT);
            if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL) //构不成三角形,被拉成直线
             {
                var rate;
                if (lL + lP <= lT) {
                    rate = 1;
                }
                else {
                    rate = -1;
                }
                childX = parentX + rate * (targetX - parentX) * lP / lT;
                childY = parentY + rate * (targetY - parentY) * lP / lT;
            }
            else {
                const h = (lPP - lLL + lTT) / (2 * lTT);
                const r = Math.sqrt(lPP - h * h * lTT) / lT;
                const hX = parentX + (dX * h);
                const hY = parentY + (dY * h);
                const rX = -dY * r;
                const rY = dX * r;
                if (bendDir > 0) {
                    childX = hX - rX;
                    childY = hY - rY;
                }
                else {
                    childX = hX + rX;
                    childY = hY + rY;
                }
            }
            cwx = childX;
            cwy = childY;
            //cwx,cwy为子骨骼应该在的世界坐标
            if (this.isDebug) {
                if (!this._sp) {
                    this._sp = new Laya.Sprite();
                    Laya.ILaya.stage.addChild(this._sp);
                }
                this._sp.graphics.clear();
                this._sp.graphics.drawCircle(parentX, parentY, 15, "#ff00ff");
                this._sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");
                this._sp.graphics.drawCircle(cwx, cwy, 15, "#ff00ff");
            }
            //根据当前计算出的世界坐标更新骨骼
            //更新parent
            var pRotation;
            pRotation = Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx);
            parent.setRotation(pRotation);
            var pTarMatrix;
            pTarMatrix = IkConstraint._tempMatrix;
            pTarMatrix.identity();
            pTarMatrix.rotate(pRotation);
            pTarMatrix.scale(parent.resultMatrix.getScaleX(), parent.resultMatrix.getScaleY());
            pTarMatrix.translate(parent.resultMatrix.tx, parent.resultMatrix.ty);
            pTarMatrix.copyTo(parent.resultMatrix);
            parent.updateChild();
            //更新child
            var childRotation;
            childRotation = Math.atan2(targetY - cwy, targetX - cwx);
            child.setRotation(childRotation);
            var childTarMatrix;
            childTarMatrix = IkConstraint._tempMatrix;
            childTarMatrix.identity();
            childTarMatrix.rotate(childRotation);
            childTarMatrix.scale(child.resultMatrix.getScaleX(), child.resultMatrix.getScaleY());
            childTarMatrix.translate(cwx, cwy);
            pTarMatrix.copyTo(child.resultMatrix);
            child.updateChild();
        }
    }
    IkConstraint.radDeg = 180 / Math.PI;
    IkConstraint.degRad = Math.PI / 180;
    IkConstraint._tempMatrix = new Laya.Matrix();

    /**
     * @internal
     */
    class IkConstraintData {
        //TODO:coverage
        constructor() {
            this.boneNames = [];
            this.bendDirection = 1;
            this.mix = 1;
            this.isSpine = true;
            this.targetBoneIndex = -1;
            this.boneIndexs = [];
        }
    }

    /**
     * @internal
     */
    class PathConstraintData {
        constructor() {
            this.bones = [];
        }
    }

    /**
     * @internal
     * 路径作用器
     * 1，生成根据骨骼计算控制点
     * 2，根据控制点生成路径，并计算路径上的节点
     * 3，根据节点，重新调整骨骼位置
     */
    class PathConstraint {
        constructor(data, bones) {
            this._debugKey = false;
            this._segments = [];
            this._curves = [];
            this.data = data;
            this.position = data.position;
            this.spacing = data.spacing;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
            this.bones = [];
            var tBoneIds = this.data.bones;
            for (var i = 0, n = tBoneIds.length; i < n; i++) {
                this.bones.push(bones[tBoneIds[i]]);
            }
        }
        /**
         * 计算骨骼在路径上的节点
         * @param	boneSlot
         * @param	boneMatrixArray
         * @param	graphics
         */
        //TODO:coverage
        apply(boneList, graphics) {
            if (!this.target)
                return;
            var tTranslateMix = this.translateMix;
            var tRotateMix = this.translateMix;
            var tRotate = tRotateMix > 0;
            var tSpacingMode = this.data.spacingMode;
            var tLengthSpacing = tSpacingMode == "length";
            var tRotateMode = this.data.rotateMode;
            var tTangents = tRotateMode == "tangent";
            var tScale = tRotateMode == "chainScale";
            var lengths = [];
            var boneCount = this.bones.length;
            var spacesCount = tTangents ? boneCount : boneCount + 1;
            var spaces = [];
            this._spaces = spaces;
            spaces[0] = this.position;
            var spacing = this.spacing;
            if (tScale || tLengthSpacing) {
                for (var i = 0, n = spacesCount - 1; i < n;) {
                    var bone = this.bones[i];
                    var length = bone.length;
                    //var x:Number = length * bone.transform.getMatrix().a;
                    //var y:Number = length * bone.transform.getMatrix().c;
                    var x = length * bone.resultMatrix.a;
                    var y = length * bone.resultMatrix.b;
                    length = Math.sqrt(x * x + y * y);
                    if (tScale)
                        lengths[i] = length;
                    spaces[++i] = tLengthSpacing ? Math.max(0, length + spacing) : spacing;
                }
            }
            else {
                for (i = 1; i < spacesCount; i++) {
                    spaces[i] = spacing;
                }
            }
            var positions = this.computeWorldPositions(this.target, boneList, graphics, spacesCount, tTangents, this.data.positionMode == "percent", tSpacingMode == "percent");
            if (this._debugKey) {
                for (i = 0; i < positions.length; i++) {
                    graphics.drawCircle(positions[i++], positions[i++], 5, "#00ff00");
                }
                var tLinePos = [];
                for (i = 0; i < positions.length; i++) {
                    tLinePos.push(positions[i++], positions[i++]);
                }
                graphics.drawLines(0, 0, tLinePos, "#ff0000");
            }
            var boneX = positions[0];
            var boneY = positions[1];
            var offsetRotation = this.data.offsetRotation;
            var tip = tRotateMode == "chain" && offsetRotation == 0;
            var p;
            for (i = 0, p = 3; i < boneCount; i++, p += 3) {
                bone = this.bones[i];
                bone.resultMatrix.tx += (boneX - bone.resultMatrix.tx) * tTranslateMix;
                bone.resultMatrix.ty += (boneY - bone.resultMatrix.ty) * tTranslateMix;
                x = positions[p];
                y = positions[p + 1];
                var dx = x - boneX, dy = y - boneY;
                if (tScale) {
                    length = lengths[i];
                    if (length != 0) {
                        var s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * tRotateMix + 1;
                        bone.resultMatrix.a *= s;
                        bone.resultMatrix.c *= s;
                    }
                }
                boneX = x;
                boneY = y;
                if (tRotate) {
                    var a = bone.resultMatrix.a;
                    //var b:Number = bone.resultMatrix.b;
                    //var c:Number = bone.resultMatrix.c;
                    var b = bone.resultMatrix.c;
                    var c = bone.resultMatrix.b;
                    var d = bone.resultMatrix.d;
                    var r;
                    var cos;
                    var sin;
                    if (tTangents) {
                        r = positions[p - 1];
                    }
                    else if (spaces[i + 1] == 0) {
                        r = positions[p + 2];
                    }
                    else {
                        r = Math.atan2(dy, dx);
                    }
                    r -= Math.atan2(c, a) - offsetRotation / 180 * Math.PI;
                    if (tip) {
                        cos = Math.cos(r);
                        sin = Math.sin(r);
                        length = bone.length;
                        boneX += (length * (cos * a - sin * c) - dx) * tRotateMix;
                        boneY += (length * (sin * a + cos * c) - dy) * tRotateMix;
                    }
                    if (r > Math.PI) {
                        r -= (Math.PI * 2);
                    }
                    else if (r < -Math.PI) {
                        r += (Math.PI * 2);
                    }
                    r *= tRotateMix;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    bone.resultMatrix.a = cos * a - sin * c;
                    bone.resultMatrix.c = cos * b - sin * d;
                    bone.resultMatrix.b = sin * a + cos * c;
                    bone.resultMatrix.d = sin * b + cos * d;
                }
            }
        }
        /**
         * 计算顶点的世界坐标
         * @param	boneSlot
         * @param	boneList
         * @param	start
         * @param	count
         * @param	worldVertices
         * @param	offset
         */
        //TODO:coverage
        computeWorldVertices2(boneSlot, boneList, start, count, worldVertices, offset) {
            var tBones = boneSlot.currDisplayData.bones;
            var tWeights = boneSlot.currDisplayData.weights;
            var tTriangles = boneSlot.currDisplayData.triangles;
            var tMatrix;
            var i = 0;
            var v = 0;
            var skip = 0;
            var n = 0;
            var w = 0;
            var b = 0;
            var wx = 0;
            var wy = 0;
            var vx = 0;
            var vy = 0;
            var bone;
            var len;
            //if (!tTriangles) tTriangles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            if (tBones == null) {
                if (!tTriangles)
                    tTriangles = tWeights;
                if (boneSlot.deformData)
                    tTriangles = boneSlot.deformData;
                var parentName;
                parentName = boneSlot.parent;
                if (boneList) {
                    len = boneList.length;
                    for (i = 0; i < len; i++) {
                        if (boneList[i].name == parentName) {
                            bone = boneList[i];
                            break;
                        }
                    }
                }
                var tBoneMt;
                if (bone) {
                    tBoneMt = bone.resultMatrix;
                }
                //bone = boneSlot.parent;
                if (!tBoneMt)
                    tBoneMt = PathConstraint._tempMt;
                var x = tBoneMt.tx;
                var y = tBoneMt.ty;
                var a = tBoneMt.a, bb = tBoneMt.b, c = tBoneMt.c, d = tBoneMt.d;
                if (bone)
                    d *= bone.d;
                for (v = start, w = offset; w < count; v += 2, w += 2) {
                    vx = tTriangles[v], vy = tTriangles[v + 1];
                    worldVertices[w] = vx * a + vy * bb + x;
                    worldVertices[w + 1] = -(vx * c + vy * d + y);
                }
                return;
            }
            for (i = 0; i < start; i += 2) {
                n = tBones[v];
                v += n + 1;
                skip += n;
            }
            var skeletonBones = boneList;
            for (w = offset, b = skip * 3; w < count; w += 2) {
                wx = 0, wy = 0;
                n = tBones[v++];
                n += v;
                for (; v < n; v++, b += 3) {
                    tMatrix = skeletonBones[tBones[v]].resultMatrix;
                    vx = tWeights[b];
                    vy = tWeights[b + 1];
                    var weight = tWeights[b + 2];
                    wx += (vx * tMatrix.a + vy * tMatrix.c + tMatrix.tx) * weight;
                    wy += (vx * tMatrix.b + vy * tMatrix.d + tMatrix.ty) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
        /**
         * 计算路径上的节点
         * @param	boneSlot
         * @param	boneList
         * @param	graphics
         * @param	spacesCount
         * @param	tangents
         * @param	percentPosition
         * @param	percentSpacing
         * @return
         */
        //TODO:coverage
        computeWorldPositions(boneSlot, boneList, graphics, spacesCount, tangents, percentPosition, percentSpacing) {
            var tBones = boneSlot.currDisplayData.bones;
            var tWeights = boneSlot.currDisplayData.weights;
            var tTriangles = boneSlot.currDisplayData.triangles;
            var tVertices = [];
            var i = 0;
            var verticesLength = boneSlot.currDisplayData.verLen;
            var position = this.position;
            var spaces = this._spaces;
            var world = [];
            var out = [];
            var curveCount = verticesLength / 6;
            var prevCurve = -1;
            var pathLength;
            var o, curve;
            var p;
            var space;
            var prev;
            var length;
            // World vertices.
            {
                curveCount--;
                verticesLength -= 4;
                this.computeWorldVertices2(boneSlot, boneList, 2, verticesLength, tVertices, 0);
                if (this._debugKey) {
                    for (i = 0; i < tVertices.length;) {
                        graphics.drawCircle(tVertices[i++], tVertices[i++], 10, "#ff0000");
                    }
                }
                world = tVertices;
            }
            // Curve lengths.
            this._curves.length = curveCount;
            var curves = this._curves;
            pathLength = 0;
            var x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
            var tmpx, tmpy, dddfx, dddfy, ddfx, ddfy, dfx, dfy;
            var w;
            for (i = 0, w = 2; i < curveCount; i++, w += 6) {
                cx1 = world[w];
                cy1 = world[w + 1];
                cx2 = world[w + 2];
                cy2 = world[w + 3];
                x2 = world[w + 4];
                y2 = world[w + 5];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                curves[i] = pathLength;
                x1 = x2;
                y1 = y2;
            }
            if (percentPosition)
                position *= pathLength;
            if (percentSpacing) {
                for (i = 0; i < spacesCount; i++)
                    spaces[i] *= pathLength;
            }
            var segments = this._segments;
            var curveLength = 0;
            var segment;
            for (i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
                space = spaces[i];
                position += space;
                p = position;
                if (p < 0) {
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                }
                else if (p > pathLength) {
                    this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                    continue;
                }
                // Determine curve containing position.
                for (;; curve++) {
                    length = curves[curve];
                    if (p > length)
                        continue;
                    if (curve == 0)
                        p /= length;
                    else {
                        prev = curves[curve - 1];
                        p = (p - prev) / (length - prev);
                    }
                    break;
                }
                // Curve segment lengths.
                if (curve != prevCurve) {
                    prevCurve = curve;
                    var ii = curve * 6;
                    x1 = world[ii];
                    y1 = world[ii + 1];
                    cx1 = world[ii + 2];
                    cy1 = world[ii + 3];
                    cx2 = world[ii + 4];
                    cy2 = world[ii + 5];
                    x2 = world[ii + 6];
                    y2 = world[ii + 7];
                    tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                    tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                    dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                    dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                    ddfx = tmpx * 2 + dddfx;
                    ddfy = tmpy * 2 + dddfy;
                    dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                    dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                    curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[0] = curveLength;
                    for (ii = 1; ii < 8; ii++) {
                        dfx += ddfx;
                        dfy += ddfy;
                        ddfx += dddfx;
                        ddfy += dddfy;
                        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                        segments[ii] = curveLength;
                    }
                    dfx += ddfx;
                    dfy += ddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[8] = curveLength;
                    dfx += ddfx + dddfx;
                    dfy += ddfy + dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[9] = curveLength;
                    segment = 0;
                }
                // Weight by segment length.
                p *= curveLength;
                for (;; segment++) {
                    length = segments[segment];
                    if (p > length)
                        continue;
                    if (segment == 0)
                        p /= length;
                    else {
                        prev = segments[segment - 1];
                        p = segment + (p - prev) / (length - prev);
                    }
                    break;
                }
                this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
            }
            return out;
        }
        //TODO:coverage
        addBeforePosition(p, temp, i, out, o) {
            var x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        }
        //TODO:coverage
        addAfterPosition(p, temp, i, out, o) {
            var x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        }
        //TODO:coverage
        addCurvePosition(p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
            if (p == 0)
                p = 0.0001;
            var tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
            var ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
            var x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
            out[o] = x;
            out[o + 1] = y;
            if (tangents) {
                out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
            }
            else {
                out[o + 2] = 0;
            }
        }
    }
    PathConstraint.NONE = -1;
    PathConstraint.BEFORE = -2;
    PathConstraint.AFTER = -3;
    PathConstraint._tempMt = new Laya.Matrix();

    /**
     * @internal
     */
    class TfConstraint {
        //TODO:coverage
        constructor(data, bones) {
            this._temp = [];
            this._data = data;
            if (this._bones == null) {
                this._bones = [];
            }
            this.target = bones[data.targetIndex];
            var j, n;
            for (j = 0, n = data.boneIndexs.length; j < n; j++) {
                this._bones.push(bones[data.boneIndexs[j]]);
            }
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
            this.scaleMix = data.scaleMix;
            this.shearMix = data.shearMix;
        }
        //TODO:coverage
        apply() {
            var tTfBone;
            var ta = this.target.resultMatrix.a, tb = this.target.resultMatrix.b, tc = this.target.resultMatrix.c, td = this.target.resultMatrix.d;
            for (var j = 0, n = this._bones.length; j < n; j++) {
                tTfBone = this._bones[j];
                if (this.rotateMix > 0) {
                    var a = tTfBone.resultMatrix.a, b = tTfBone.resultMatrix.b, c = tTfBone.resultMatrix.c, d = tTfBone.resultMatrix.d;
                    var r = Math.atan2(tc, ta) - Math.atan2(c, a) + this._data.offsetRotation * Math.PI / 180;
                    if (r > Math.PI)
                        r -= Math.PI * 2;
                    else if (r < -Math.PI)
                        r += Math.PI * 2;
                    r *= this.rotateMix;
                    var cos = Math.cos(r), sin = Math.sin(r);
                    tTfBone.resultMatrix.a = cos * a - sin * c;
                    tTfBone.resultMatrix.b = cos * b - sin * d;
                    tTfBone.resultMatrix.c = sin * a + cos * c;
                    tTfBone.resultMatrix.d = sin * b + cos * d;
                }
                if (this.translateMix) {
                    this._temp[0] = this._data.offsetX;
                    this._temp[1] = this._data.offsetY;
                    this.target.localToWorld(this._temp);
                    tTfBone.resultMatrix.tx += (this._temp[0] - tTfBone.resultMatrix.tx) * this.translateMix;
                    tTfBone.resultMatrix.ty += (this._temp[1] - tTfBone.resultMatrix.ty) * this.translateMix;
                    tTfBone.updateChild();
                }
                if (this.scaleMix > 0) {
                    var bs = Math.sqrt(tTfBone.resultMatrix.a * tTfBone.resultMatrix.a + tTfBone.resultMatrix.c * tTfBone.resultMatrix.c);
                    var ts = Math.sqrt(ta * ta + tc * tc);
                    var s = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleX) * this.scaleMix) / bs : 0;
                    tTfBone.resultMatrix.a *= s;
                    tTfBone.resultMatrix.c *= s;
                    bs = Math.sqrt(tTfBone.resultMatrix.b * tTfBone.resultMatrix.b + tTfBone.resultMatrix.d * tTfBone.resultMatrix.d);
                    ts = Math.sqrt(tb * tb + td * td);
                    s = bs > 0.00001 ? (bs + (ts - bs + this._data.offsetScaleY) * this.scaleMix) / bs : 0;
                    tTfBone.resultMatrix.b *= s;
                    tTfBone.resultMatrix.d *= s;
                }
                if (this.shearMix > 0) {
                    b = tTfBone.resultMatrix.b, d = tTfBone.resultMatrix.d;
                    var by = Math.atan2(d, b);
                    r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(tTfBone.resultMatrix.c, tTfBone.resultMatrix.a));
                    if (r > Math.PI)
                        r -= Math.PI * 2;
                    else if (r < -Math.PI)
                        r += Math.PI * 2;
                    r = by + (r + this._data.offsetShearY * Math.PI / 180) * this.shearMix;
                    s = Math.sqrt(b * b + d * d);
                    tTfBone.resultMatrix.b = Math.cos(r) * s;
                    tTfBone.resultMatrix.d = Math.sin(r) * s;
                }
            }
        }
    }

    /**动画开始播放调度
     * @eventType Event.PLAYED
     * */
    /*[Event(name = "played", type = "laya.events.Event.PLAYED", desc = "动画开始播放调度")]*/
    /**动画停止播放调度
     * @eventType Event.STOPPED
     * */
    /*[Event(name = "stopped", type = "laya.events.Event.STOPPED", desc = "动画停止播放调度")]*/
    /**动画暂停播放调度
     * @eventType Event.PAUSED
     * */
    /*[Event(name = "paused", type = "laya.events.Event.PAUSED", desc = "动画暂停播放调度")]*/
    /**自定义事件。
     * @eventType Event.LABEL
     */
    /*[Event(name = "label", type = "laya.events.Event.LABEL", desc = "自定义事件")]*/
    /**
     * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
     */
    class Skeleton extends Laya.Sprite {
        /**
         * 创建一个Skeleton对象
         *
         * @param	templet	骨骼动画模板
         * @param	aniMode	动画模式，0不支持换装，1、2支持换装
         */
        constructor(templet = null, aniMode = 0) {
            super();
            this._boneMatrixArray = []; //当前骨骼动画的最终结果数据
            this._lastTime = 0; //上次的帧时间
            this._currAniIndex = -1;
            this._pause = true;
            /** @private */
            this._aniClipIndex = -1;
            /** @private */
            this._clipIndex = -1;
            this._skinIndex = 0;
            this._skinName = "default";
            this._aniMode = 0; //
            this._index = -1;
            this._total = -1;
            this._indexControl = false;
            this._eventIndex = 0;
            this._drawOrderIndex = 0;
            this._drawOrder = null;
            this._lastAniClipIndex = -1;
            this._lastUpdateAniClipIndex = -1;
            this._playAudio = true;
            this._soundChannelArr = [];
            if (templet)
                this.init(templet, aniMode);
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
        init(templet, aniMode = 0) {
            var i = 0, n;
            //aniMode = 2;
            if (aniMode == 1) //使用动画自己的缓冲区
             {
                this._graphicsCache = [];
                for (i = 0, n = templet.getAnimationCount(); i < n; i++) {
                    this._graphicsCache.push([]);
                }
            }
            this._yReverseMatrix = templet.yReverseMatrix;
            this._aniMode = aniMode;
            this._templet = templet;
            this._templet._addReference(1);
            this._player = new AnimationPlayer();
            this._player.cacheFrameRate = templet.rate;
            this._player.templet = templet;
            this._player.play();
            this._parseSrcBoneMatrix();
            //骨骼数据
            this._boneList = templet.mBoneArr;
            this._rootBone = templet.mRootBone;
            this._aniSectionDic = templet.aniSectionDic;
            //ik作用器
            if (templet.ikArr.length > 0) {
                this._ikArr = [];
                for (i = 0, n = templet.ikArr.length; i < n; i++) {
                    this._ikArr.push(new IkConstraint(templet.ikArr[i], this._boneList));
                }
            }
            //path作用器
            if (templet.pathArr.length > 0) {
                var tPathData;
                var tPathConstraint;
                if (this._pathDic == null)
                    this._pathDic = {};
                var tBoneSlot;
                for (i = 0, n = templet.pathArr.length; i < n; i++) {
                    tPathData = templet.pathArr[i];
                    tPathConstraint = new PathConstraint(tPathData, this._boneList);
                    tBoneSlot = this._boneSlotDic[tPathData.name];
                    if (tBoneSlot) {
                        tPathConstraint = new PathConstraint(tPathData, this._boneList);
                        tPathConstraint.target = tBoneSlot;
                    }
                    this._pathDic[tPathData.name] = tPathConstraint;
                }
            }
            //tf作用器
            if (templet.tfArr.length > 0) {
                this._tfArr = [];
                for (i = 0, n = templet.tfArr.length; i < n; i++) {
                    this._tfArr.push(new TfConstraint(templet.tfArr[i], this._boneList));
                }
            }
            if (templet.skinDataArray.length > 0) {
                var tSkinData = this._templet.skinDataArray[this._skinIndex];
                this._skinName = tSkinData.name;
            }
            this._player.on(Laya.Event.PLAYED, this, this._onPlay);
            this._player.on(Laya.Event.STOPPED, this, this._onStop);
            this._player.on(Laya.Event.PAUSED, this, this._onPause);
        }
        /**
         * 得到资源的URL
         */
        get url() {
            return this._aniPath;
        }
        /**
         * 设置动画路径
         */
        set url(path) {
            this.load(path);
        }
        /**
         * 通过加载直接创建动画
         * @param	path		要加载的动画文件路径
         * @param	complete	加载完成的回调函数
         * @param	aniMode		与<code>Skeleton.init</code>的<code>aniMode</code>作用一致
         */
        load(path, complete = null, aniMode = 0) {
            this._aniPath = path;
            this._complete = complete;
            this._loadAniMode = aniMode;
            Laya.ILaya.loader.load([{ url: path, type: Laya.ILaya.Loader.BUFFER }], Laya.Handler.create(this, this._onLoaded));
        }
        /**
         * 加载完成
         */
        _onLoaded() {
            var arraybuffer = Laya.ILaya.Loader.getRes(this._aniPath);
            if (arraybuffer == null)
                return;
            if (IAniLib.Templet.TEMPLET_DICTIONARY == null) {
                IAniLib.Templet.TEMPLET_DICTIONARY = {};
            }
            var tFactory;
            tFactory = IAniLib.Templet.TEMPLET_DICTIONARY[this._aniPath];
            if (tFactory) {
                if (tFactory.isParseFail) {
                    this._parseFail();
                }
                else {
                    if (tFactory.isParserComplete) {
                        this._parseComplete();
                    }
                    else {
                        tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                        tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                    }
                }
            }
            else {
                tFactory = new IAniLib.Templet();
                tFactory._setCreateURL(this._aniPath);
                IAniLib.Templet.TEMPLET_DICTIONARY[this._aniPath] = tFactory;
                tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                tFactory.isParserComplete = false;
                tFactory.parseData(null, arraybuffer);
            }
        }
        /**
         * 解析完成
         */
        _parseComplete() {
            var tTemple = IAniLib.Templet.TEMPLET_DICTIONARY[this._aniPath];
            if (tTemple) {
                this.init(tTemple, this._loadAniMode);
                this.play(0, true);
            }
            this._complete && this._complete.runWith(this);
        }
        /**
         * 解析失败
         */
        _parseFail() {
            console.log("[Error]:" + this._aniPath + "解析失败");
        }
        /**
         * 传递PLAY事件
         */
        _onPlay() {
            this.event(Laya.Event.PLAYED);
        }
        /**
         * 传递STOP事件
         */
        _onStop() {
            //把没播的事件播完
            var tEventData;
            var tEventAniArr = this._templet.eventAniArr;
            var tEventArr = tEventAniArr[this._aniClipIndex];
            if (tEventArr && this._eventIndex < tEventArr.length) {
                for (; this._eventIndex < tEventArr.length; this._eventIndex++) {
                    tEventData = tEventArr[this._eventIndex];
                    if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                        this.event(Laya.Event.LABEL, tEventData);
                    }
                }
            }
            //_eventIndex = 0;
            this._drawOrder = null;
            this.event(Laya.Event.STOPPED);
        }
        /**
         * 传递PAUSE事件
         */
        _onPause() {
            this.event(Laya.Event.PAUSED);
        }
        /**
         * 创建骨骼的矩阵，保存每次计算的最终结果
         */
        _parseSrcBoneMatrix() {
            var i = 0, n = 0;
            n = this._templet.srcBoneMatrixArr.length;
            for (i = 0; i < n; i++) {
                this._boneMatrixArray.push(new Laya.Matrix());
            }
            if (this._aniMode == 0) {
                this._boneSlotDic = this._templet.boneSlotDic;
                this._bindBoneBoneSlotDic = this._templet.bindBoneBoneSlotDic;
                this._boneSlotArray = this._templet.boneSlotArray;
            }
            else {
                if (this._boneSlotDic == null)
                    this._boneSlotDic = {};
                if (this._bindBoneBoneSlotDic == null)
                    this._bindBoneBoneSlotDic = {};
                if (this._boneSlotArray == null)
                    this._boneSlotArray = [];
                var tArr = this._templet.boneSlotArray;
                var tBS;
                var tBSArr;
                for (i = 0, n = tArr.length; i < n; i++) {
                    tBS = tArr[i];
                    tBSArr = this._bindBoneBoneSlotDic[tBS.parent];
                    if (tBSArr == null) {
                        this._bindBoneBoneSlotDic[tBS.parent] = tBSArr = [];
                    }
                    this._boneSlotDic[tBS.name] = tBS = tBS.copy();
                    tBSArr.push(tBS);
                    this._boneSlotArray.push(tBS);
                }
            }
        }
        _emitMissedEvents(startTime, endTime, startIndex = 0) {
            var tEventAniArr = this._templet.eventAniArr;
            var tEventArr = tEventAniArr[this._player.currentAnimationClipIndex];
            if (tEventArr) {
                var i = 0, len;
                var tEventData;
                len = tEventArr.length;
                for (i = startIndex; i < len; i++) {
                    tEventData = tEventArr[i];
                    if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                        this.event(Laya.Event.LABEL, tEventData);
                    }
                }
            }
        }
        /**
         * 更新动画
         * @param	autoKey true为正常更新，false为index手动更新
         */
        _update(autoKey = true) {
            if (this._pause)
                return;
            if (autoKey && this._indexControl) {
                return;
            }
            var tCurrTime = this.timer.currTimer;
            var preIndex = this._player.currentKeyframeIndex;
            var dTime = tCurrTime - this._lastTime;
            if (autoKey) {
                // player update，更新当前帧数，判断是否stop或者complete
                this._player._update(dTime);
            }
            else {
                preIndex = -1;
            }
            this._lastTime = tCurrTime;
            if (!this._player)
                return;
            this._index = this._clipIndex = this._player.currentKeyframeIndex; // 当前所在帧
            if (this._index < 0)
                return;
            if (dTime > 0 && this._clipIndex == preIndex && this._lastUpdateAniClipIndex == this._aniClipIndex) {
                return;
            }
            this._lastUpdateAniClipIndex = this._aniClipIndex;
            if (preIndex > this._clipIndex && this._eventIndex != 0) {
                this._emitMissedEvents(this._player.playStart, this._player.playEnd, this._eventIndex);
                this._eventIndex = 0;
            }
            // 自定义事件的检查
            var tEventArr = this._templet.eventAniArr[this._aniClipIndex];
            var _soundChannel;
            if (tEventArr && this._eventIndex < tEventArr.length) {
                var tEventData = tEventArr[this._eventIndex];
                if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                    if (this._player.currentPlayTime >= tEventData.time) {
                        this.event(Laya.Event.LABEL, tEventData);
                        this._eventIndex++;
                        if (this._playAudio && tEventData.audioValue && tEventData.audioValue !== "null") {
                            _soundChannel = Laya.SoundManager.playSound(this._player.templet._path + tEventData.audioValue, 1, Laya.Handler.create(this, this._onAniSoundStoped));
                            Laya.SoundManager.playbackRate = this._player.playbackRate;
                            _soundChannel && this._soundChannelArr.push(_soundChannel);
                        }
                    }
                }
                else if (tEventData.time < this._player.playStart && this._playAudio && tEventData.audioValue && tEventData.audioValue !== "null") {
                    this._eventIndex++;
                    _soundChannel = Laya.SoundManager.playSound(this._player.templet._path + tEventData.audioValue, 1, Laya.Handler.create(this, this._onAniSoundStoped), null, (this._player.currentPlayTime - tEventData.time) / 1000);
                    Laya.SoundManager.playbackRate = this._player.playbackRate;
                    _soundChannel && this._soundChannelArr.push(_soundChannel);
                }
                else {
                    this._eventIndex++;
                }
            }
            var tGraphics;
            if (this._aniMode == 0) {
                // 从templet中找到缓存的这一帧的 graphics
                tGraphics = this._templet.getGrahicsDataWithCache(this._aniClipIndex, this._clipIndex) || this._createGraphics(); // _clipIndex是 AnimationPlayer计算出来的
                if (tGraphics && this.graphics != tGraphics) {
                    this.graphics = tGraphics;
                }
            }
            else if (this._aniMode == 1) {
                tGraphics = this._getGrahicsDataWithCache(this._aniClipIndex, this._clipIndex) || this._createGraphics(); // 与0的区别是从this get，上面是从templet get
                if (tGraphics && this.graphics != tGraphics) {
                    this.graphics = tGraphics;
                }
            }
            else {
                this._createGraphics();
            }
        }
        /**
         * @private
         * 清掉播放完成的音频
         * @param force 是否强制删掉所有的声音channel
         */
        _onAniSoundStoped(force) {
            var _channel;
            for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
                _channel = this._soundChannelArr[i];
                if (_channel.isStopped || force) {
                    !_channel.isStopped && _channel.stop();
                    this._soundChannelArr.splice(i, 1);
                    // SoundManager.removeChannel(_channel); // TODO 是否需要? 去掉有什么好处? 是否还需要其他操作?
                    len--;
                    i--;
                }
            }
        }
        /**
         * @private
         * 创建grahics图像. 并且保存到cache中
         * @param	_clipIndex 第几帧
         */
        _createGraphics(_clipIndex = -1) {
            if (_clipIndex == -1)
                _clipIndex = this._clipIndex;
            var curTime = _clipIndex * this._player.cacheFrameRateInterval;
            //处理绘制顺序
            var tDrawOrderData;
            var tDrawOrderAniArr = this._templet.drawOrderAniArr;
            // 当前动作的 drawOrderArray 信息
            var tDrawOrderArr = tDrawOrderAniArr[this._aniClipIndex];
            if (tDrawOrderArr && tDrawOrderArr.length > 0) {
                // 选出当前所在帧的 drawOrderArray
                this._drawOrderIndex = 0; // 从0开始
                tDrawOrderData = tDrawOrderArr[this._drawOrderIndex];
                while (curTime >= tDrawOrderData.time) {
                    this._drawOrder = tDrawOrderData.drawOrder;
                    this._drawOrderIndex++; // 下一帧
                    if (this._drawOrderIndex >= tDrawOrderArr.length) {
                        break;
                    }
                    tDrawOrderData = tDrawOrderArr[this._drawOrderIndex];
                }
            }
            //要用的graphics
            if (this._aniMode == 0 || this._aniMode == 1) { // 有缓存的情况
                this.graphics = GraphicsAni.create(); // new GraphicsAni();
            }
            else { // 实时计算的情况。 每次都是新的数据，因此要把上一帧的清理一下
                if (this.graphics instanceof GraphicsAni) {
                    this.graphics.clear();
                }
                else {
                    this.graphics = GraphicsAni.create(); //new GraphicsAni();
                }
            }
            var tGraphics = this.graphics;
            //获取骨骼数据
            var bones = this._templet.getNodes(this._aniClipIndex);
            // 现在把帧数计算改成实时的，根据时间算，因此时间要求准确，不能再用curTime了。
            // 用curTime可能会出一个bug就是没有到达最后一帧。例如最后两帧间隔很短
            var stopped = this._player.state == 0;
            this._templet.getOriginalData(this._aniClipIndex, this._curOriginalData, /*_templet._fullFrames[_aniClipIndex]*/ null, _clipIndex, stopped ? (curTime + this._player.cacheFrameRateInterval) : curTime);
            var tSectionArr = this._aniSectionDic[this._aniClipIndex];
            var tStartIndex = 0;
            var i = 0, j = 0, k = 0, n = 0;
            var tDBBoneSlot;
            var tDBBoneSlotArr;
            var tParentTransform;
            var tSrcBone;
            //对骨骼数据进行计算
            var boneCount = this._templet.srcBoneMatrixArr.length;
            var origDt = this._curOriginalData;
            for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
                tSrcBone = this._boneList[i];
                var resultTrans = tSrcBone.resultTransform;
                tParentTransform = this._templet.srcBoneMatrixArr[i];
                resultTrans.scX = tParentTransform.scX * origDt[tStartIndex++];
                resultTrans.skX = tParentTransform.skX + origDt[tStartIndex++];
                resultTrans.skY = tParentTransform.skY + origDt[tStartIndex++];
                resultTrans.scY = tParentTransform.scY * origDt[tStartIndex++];
                resultTrans.x = tParentTransform.x + origDt[tStartIndex++];
                resultTrans.y = tParentTransform.y + origDt[tStartIndex++];
                if (this._templet.tMatrixDataLen === 8) {
                    resultTrans.skewX = tParentTransform.skewX + origDt[tStartIndex++];
                    resultTrans.skewY = tParentTransform.skewY + origDt[tStartIndex++];
                }
            }
            //对插槽进行插值计算
            var tSlotDic = {};
            var tSlotAlphaDic = {};
            var tBoneData;
            for (n += tSectionArr[1]; i < n; i++) {
                tBoneData = bones[i];
                tSlotDic[tBoneData.name] = origDt[tStartIndex++];
                tSlotAlphaDic[tBoneData.name] = origDt[tStartIndex++]; // 每一个slot的alpha?
                //预留
                tStartIndex += 4;
            }
            //ik
            var tBendDirectionDic = {};
            var tMixDic = {};
            for (n += tSectionArr[2]; i < n; i++) {
                tBoneData = bones[i];
                tBendDirectionDic[tBoneData.name] = origDt[tStartIndex++];
                tMixDic[tBoneData.name] = origDt[tStartIndex++];
                //预留
                tStartIndex += 4;
            }
            //path
            if (this._pathDic) {
                var tPathConstraint;
                for (n += tSectionArr[3]; i < n; i++) {
                    tBoneData = bones[i];
                    tPathConstraint = this._pathDic[tBoneData.name];
                    if (tPathConstraint) {
                        var tByte = new Laya.Byte(tBoneData.extenData);
                        switch (tByte.getByte()) {
                            case 1: //position
                                tPathConstraint.position = origDt[tStartIndex++];
                                break;
                            case 2: //spacing
                                tPathConstraint.spacing = origDt[tStartIndex++];
                                break;
                            case 3: //mix
                                tPathConstraint.rotateMix = origDt[tStartIndex++];
                                tPathConstraint.translateMix = origDt[tStartIndex++];
                                break;
                        }
                    }
                }
            }
            // 从root开始级联矩阵
            this._rootBone.update(this._yReverseMatrix || Laya.Matrix.TEMP.identity());
            //刷新IK作用器
            if (this._ikArr) {
                var tIkConstraint;
                for (i = 0, n = this._ikArr.length; i < n; i++) {
                    tIkConstraint = this._ikArr[i];
                    if (tIkConstraint.name in tBendDirectionDic) {
                        tIkConstraint.bendDirection = tBendDirectionDic[tIkConstraint.name];
                    }
                    if (tIkConstraint.name in tMixDic) {
                        tIkConstraint.mix = tMixDic[tIkConstraint.name];
                    }
                    tIkConstraint.apply();
                    //tIkConstraint.updatePos(this.x, this.y);
                }
            }
            //刷新PATH作用器
            if (this._pathDic) {
                for (var tPathStr in this._pathDic) {
                    tPathConstraint = this._pathDic[tPathStr];
                    tPathConstraint.apply(this._boneList, tGraphics);
                }
            }
            //刷新transform作用器
            if (this._tfArr) {
                var tTfConstraint;
                for (i = 0, k = this._tfArr.length; i < k; i++) {
                    tTfConstraint = this._tfArr[i];
                    tTfConstraint.apply();
                }
            }
            for (i = 0, k = this._boneList.length; i < k; i++) {
                tSrcBone = this._boneList[i];
                tDBBoneSlotArr = this._bindBoneBoneSlotDic[tSrcBone.name];
                tSrcBone.resultMatrix.copyTo(this._boneMatrixArray[i]);
                if (tDBBoneSlotArr) {
                    for (j = 0, n = tDBBoneSlotArr.length; j < n; j++) {
                        tDBBoneSlot = tDBBoneSlotArr[j];
                        if (tDBBoneSlot) {
                            tDBBoneSlot.setParentMatrix(tSrcBone.resultMatrix);
                        }
                    }
                }
            }
            var tDeformDic = {};
            //变形动画作用器
            var tDeformAniArr = this._templet.deformAniArr;
            var tDeformAniData;
            if (tDeformAniArr && tDeformAniArr.length > 0) {
                if (this._lastAniClipIndex != this._aniClipIndex) {
                    this._lastAniClipIndex = this._aniClipIndex;
                    for (i = 0, n = this._boneSlotArray.length; i < n; i++) {
                        tDBBoneSlot = this._boneSlotArray[i];
                        tDBBoneSlot.deformData = null;
                    }
                }
                var tSkinDeformAni = tDeformAniArr[this._aniClipIndex];
                //使用default数据
                tDeformAniData = (tSkinDeformAni["default"]);
                this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);
                //使用其他皮肤的数据
                var tSkin;
                for (tSkin in tSkinDeformAni) {
                    if (tSkin != "default" && tSkin != this._skinName) {
                        tDeformAniData = tSkinDeformAni[tSkin];
                        this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);
                    }
                }
                //使用自己皮肤的数据
                tDeformAniData = (tSkinDeformAni[this._skinName]);
                this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);
            }
            //_rootBone.updateDraw(this.x,this.y);
            var tSlotData2;
            var tSlotData3;
            var tObject;
            //把动画按插槽顺序画出来
            if (this._drawOrder) {
                for (i = 0, n = this._drawOrder.length; i < n; i++) {
                    tDBBoneSlot = this._boneSlotArray[this._drawOrder[i]];
                    tSlotData2 = tSlotDic[tDBBoneSlot.name];
                    tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
                    if (!isNaN(tSlotData2) && tSlotData2 != -2) {
                        if (this._templet.attachmentNames) {
                            tDBBoneSlot.showDisplayByName(this._templet.attachmentNames[tSlotData2]);
                        }
                        else {
                            tDBBoneSlot.showDisplayByIndex(tSlotData2);
                        }
                    }
                    if (tDeformDic[this._drawOrder[i]]) {
                        tObject = tDeformDic[this._drawOrder[i]];
                        if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
                            tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
                        }
                        else {
                            tDBBoneSlot.deformData = null;
                        }
                    }
                    else {
                        tDBBoneSlot.deformData = null;
                    }
                    if (!isNaN(tSlotData3)) {
                        tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2, tSlotData3);
                    }
                    else {
                        tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2);
                    }
                }
            }
            else {
                for (i = 0, n = this._boneSlotArray.length; i < n; i++) {
                    tDBBoneSlot = this._boneSlotArray[i];
                    tSlotData2 = tSlotDic[tDBBoneSlot.name];
                    tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
                    if (!isNaN(tSlotData2) && tSlotData2 != -2) {
                        if (this._templet.attachmentNames) {
                            tDBBoneSlot.showDisplayByName(this._templet.attachmentNames[tSlotData2]);
                        }
                        else {
                            tDBBoneSlot.showDisplayByIndex(tSlotData2);
                        }
                    }
                    if (tDeformDic[i]) {
                        tObject = tDeformDic[i];
                        if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
                            tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
                        }
                        else {
                            tDBBoneSlot.deformData = null;
                        }
                    }
                    else {
                        tDBBoneSlot.deformData = null;
                    }
                    if (!isNaN(tSlotData3)) {
                        tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2, tSlotData3);
                    }
                    else {
                        tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2);
                    }
                }
            }
            if (this._aniMode == 0) {
                this._templet.setGrahicsDataWithCache(this._aniClipIndex, _clipIndex, tGraphics);
                this._checkIsAllParsed(this._aniClipIndex);
            }
            else if (this._aniMode == 1) {
                this._setGrahicsDataWithCache(this._aniClipIndex, _clipIndex, tGraphics);
            }
            return tGraphics;
        }
        _checkIsAllParsed(_aniClipIndex) {
            var i, len;
            len = Math.floor(0.01 + this._templet.getAniDuration(_aniClipIndex) / 1000 * this._player.cacheFrameRate);
            for (i = 0; i < len; i++) {
                if (!this._templet.getGrahicsDataWithCache(_aniClipIndex, i))
                    return;
            }
            if (!this._templet.getGrahicsDataWithCache(_aniClipIndex, len)) {
                this._createGraphics(len);
                return;
            }
            this._templet.deleteAniData(_aniClipIndex);
        }
        /**
         * 设置deform数据
         * @param	tDeformAniData
         * @param	tDeformDic
         * @param	_boneSlotArray
         * @param	curTime
         */
        _setDeform(tDeformAniData, tDeformDic, _boneSlotArray, curTime) {
            if (!tDeformAniData)
                return;
            var tDeformSlotData;
            var tDeformSlotDisplayData;
            var tDBBoneSlot;
            var i, n, j;
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
        getAnimNum() {
            return this._templet.getAnimationCount();
        }
        /**
         * 得到指定动画的名字
         * @param	index	动画的索引
         */
        getAniNameByIndex(index) {
            return this._templet.getAniNameByIndex(index);
        }
        /**
         * 通过名字得到插槽的引用
         * @param	name	动画的名字
         * @return 插槽的引用
         */
        getSlotByName(name) {
            return this._boneSlotDic[name];
        }
        /**
         * 通过名字显示一套皮肤
         * @param	name	皮肤的名字
         * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
         */
        showSkinByName(name, freshSlotIndex = true) {
            this.showSkinByIndex(this._templet.getSkinIndexByName(name), freshSlotIndex);
        }
        /**
         * 通过索引显示一套皮肤
         * @param	skinIndex	皮肤索引
         * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
         */
        showSkinByIndex(skinIndex, freshSlotIndex = true) {
            for (var i = 0; i < this._boneSlotArray.length; i++) {
                this._boneSlotArray[i].showSlotData(null, freshSlotIndex);
            }
            if (this._templet.showSkinByIndex(this._boneSlotDic, skinIndex, freshSlotIndex)) {
                var tSkinData = this._templet.skinDataArray[skinIndex];
                this._skinIndex = skinIndex;
                this._skinName = tSkinData.name;
            }
            this._clearCache();
        }
        /**
         * 设置某插槽的皮肤
         * @param	slotName	插槽名称
         * @param	index	插糟皮肤的索引
         */
        showSlotSkinByIndex(slotName, index) {
            if (this._aniMode == 0)
                return;
            var tBoneSlot = this.getSlotByName(slotName);
            if (tBoneSlot) {
                tBoneSlot.showDisplayByIndex(index);
            }
            this._clearCache();
        }
        /**
         * 设置某插槽的皮肤
         * @param	slotName	插槽名称
         * @param	name	皮肤名称
         */
        showSlotSkinByName(slotName, name) {
            if (this._aniMode == 0)
                return;
            var tBoneSlot = this.getSlotByName(slotName);
            if (tBoneSlot) {
                tBoneSlot.showDisplayByName(name);
            }
            this._clearCache();
        }
        /**
         * 替换插槽贴图名
         * @param	slotName 插槽名称
         * @param	oldName 要替换的贴图名
         * @param	newName 替换后的贴图名
         */
        replaceSlotSkinName(slotName, oldName, newName) {
            if (this._aniMode == 0)
                return;
            var tBoneSlot = this.getSlotByName(slotName);
            if (tBoneSlot) {
                tBoneSlot.replaceDisplayByName(oldName, newName);
            }
            this._clearCache();
        }
        /**
         * 替换插槽的贴图索引
         * @param	slotName 插槽名称
         * @param	oldIndex 要替换的索引
         * @param	newIndex 替换后的索引
         */
        replaceSlotSkinByIndex(slotName, oldIndex, newIndex) {
            if (this._aniMode == 0)
                return;
            var tBoneSlot = this.getSlotByName(slotName);
            if (tBoneSlot) {
                tBoneSlot.replaceDisplayByIndex(oldIndex, newIndex);
            }
            this._clearCache();
        }
        /**
         * 设置自定义皮肤
         * @param	name		插糟的名字
         * @param	texture		自定义的纹理
         */
        setSlotSkin(slotName, texture) {
            if (this._aniMode == 0)
                return;
            var tBoneSlot = this.getSlotByName(slotName);
            if (tBoneSlot) {
                tBoneSlot.replaceSkin(texture);
            }
            this._clearCache();
        }
        /**
         * 换装的时候，需要清一下缓冲区
         */
        _clearCache() {
            if (this._aniMode == 1) {
                for (var i = 0, n = this._graphicsCache.length; i < n; i++) {
                    for (var j = 0, len = this._graphicsCache[i].length; j < len; j++) {
                        var gp = this._graphicsCache[i][j];
                        if (gp && gp != this.graphics) {
                            GraphicsAni.recycle(gp);
                        }
                    }
                    this._graphicsCache[i].length = 0;
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
        play(nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
            this._playAudio = playAudio;
            this._indexControl = false;
            var index = -1;
            var duration;
            if (loop) {
                duration = 2147483647; //int.MAX_VALUE;
            }
            else {
                duration = 0;
            }
            if (typeof (nameOrIndex) == 'string') {
                for (var i = 0, n = this._templet.getAnimationCount(); i < n; i++) {
                    var animation = this._templet.getAnimation(i);
                    if (animation && nameOrIndex == animation.name) {
                        index = i;
                        break;
                    }
                }
            }
            else {
                index = nameOrIndex;
            }
            if (index > -1 && index < this.getAnimNum()) {
                this._aniClipIndex = index;
                if (force || this._pause || this._currAniIndex != index) {
                    this._currAniIndex = index;
                    this._curOriginalData = new Float32Array(this._templet.getTotalkeyframesLength(index));
                    this._drawOrder = null;
                    this._eventIndex = 0;
                    this._player.play(index, this._player.playbackRate, duration, start, end);
                    if (freshSkin)
                        this._templet.showSkinByIndex(this._boneSlotDic, this._skinIndex);
                    if (this._pause) {
                        this._pause = false;
                        this._lastTime = Laya.ILaya.Browser.now();
                        this.timer.frameLoop(1, this, this._update, null, true);
                    }
                    this._update();
                }
            }
        }
        /**
         * 停止动画
         */
        stop() {
            if (!this._pause) {
                this._pause = true;
                if (this._player) {
                    this._player.stop(true);
                }
                if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                    this._onAniSoundStoped(true);
                }
                this.timer.clear(this, this._update);
            }
        }
        /**
         * 设置动画播放速率
         * @param	value	1为标准速率
         */
        playbackRate(value) {
            if (this._player) {
                this._player.playbackRate = value;
            }
        }
        /**
         * 暂停动画的播放
         */
        paused() {
            if (!this._pause) {
                this._pause = true;
                if (this._player) {
                    this._player.paused = true;
                }
                if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                    var _soundChannel;
                    for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        _soundChannel = this._soundChannelArr[i];
                        if (!_soundChannel.isStopped) {
                            _soundChannel.pause();
                        }
                    }
                }
                this.timer.clear(this, this._update);
            }
        }
        /**
         * 恢复动画的播放
         */
        resume() {
            this._indexControl = false;
            if (this._pause) {
                this._pause = false;
                if (this._player) {
                    this._player.paused = false;
                }
                if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                    var _soundChannel;
                    for (var len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        _soundChannel = this._soundChannelArr[i];
                        if (_soundChannel.audioBuffer) {
                            _soundChannel.resume();
                        }
                    }
                }
                this._lastTime = Laya.ILaya.Browser.now();
                this.timer.frameLoop(1, this, this._update, null, true);
            }
        }
        /**
         * @private
         * 得到缓冲数据
         * @param	aniIndex
         * @param	frameIndex
         * @return
         */
        _getGrahicsDataWithCache(aniIndex, frameIndex) {
            return this._graphicsCache[aniIndex][frameIndex];
        }
        /**
         * @private
         * 保存缓冲grahpics
         * @param	aniIndex
         * @param	frameIndex
         * @param	graphics
         */
        _setGrahicsDataWithCache(aniIndex, frameIndex, graphics) {
            this._graphicsCache[aniIndex][frameIndex] = graphics;
        }
        /**
         * 销毁当前动画
         * @override
         */
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
            this._templet._removeReference(1);
            this._templet = null; //动画解析器
            if (this._player)
                this._player.offAll();
            this._player = null; // 播放器
            this._curOriginalData = null; //当前骨骼的偏移数据
            this._boneMatrixArray.length = 0; //当前骨骼动画的最终结果数据
            this._lastTime = 0; //上次的帧时间
            this.timer.clear(this, this._update);
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                this._onAniSoundStoped(true);
            }
        }
        /**
         * @private
         * 得到帧索引
         */
        get index() {
            return this._index;
        }
        /**
         * @private
         * 设置帧索引
         */
        set index(value) {
            if (this.player) {
                this._index = value;
                this._player.currentTime = this._index * 1000 / this._player.cacheFrameRate;
                this._indexControl = true;
                this._update(false);
            }
        }
        /**
         * 得到总帧数据
         */
        get total() {
            if (this._templet && this._player) {
                this._total = Math.floor(this._templet.getAniDuration(this._player.currentAnimationClipIndex) / 1000 * this._player.cacheFrameRate);
            }
            else {
                this._total = -1;
            }
            return this._total;
        }
        /**
         * 得到播放器的引用
         */
        get player() {
            return this._player;
        }
        /**
         * 得到动画模板的引用
         * @return templet.
         */
        get templet() {
            return this._templet;
        }
    }
    /**
     * 在canvas模式是否使用简化版的mesh绘制，简化版的mesh将不进行三角形绘制，而改为矩形绘制，能极大提高性能，但是可能某些mesh动画效果会不太正常
     */
    Skeleton.useSimpleMeshInCanvas = false;
    IAniLib.Skeleton = Skeleton;
    Laya.ILaya.regClass(Skeleton);
    Laya.ClassUtils.regClass("laya.ani.bone.Skeleton", Skeleton);
    Laya.ClassUtils.regClass("Laya.Skeleton", Skeleton);

    /**
     * @internal
     */
    class SkinData {
        constructor() {
            this.slotArr = [];
        }
    }

    class SkinSlotDisplayData {
        createTexture(currTexture) {
            if (this.texture)
                return this.texture;
            this.texture = new Laya.Texture(currTexture.bitmap, this.uvs);
            //判断是否旋转
            if (this.uvs[0] > this.uvs[4]
                && this.uvs[1] > this.uvs[5]) {
                //旋转
                this.texture.width = currTexture.height;
                this.texture.height = currTexture.width;
                this.texture.offsetX = -currTexture.offsetX;
                this.texture.offsetY = -currTexture.offsetY;
                this.texture.sourceWidth = currTexture.sourceHeight;
                this.texture.sourceHeight = currTexture.sourceWidth;
            }
            else {
                this.texture.width = currTexture.width;
                this.texture.height = currTexture.height;
                this.texture.offsetX = -currTexture.offsetX;
                this.texture.offsetY = -currTexture.offsetY;
                this.texture.sourceWidth = currTexture.sourceWidth;
                this.texture.sourceHeight = currTexture.sourceHeight;
            }
            return this.texture;
        }
        destory() {
            if (this.texture)
                this.texture.destroy();
        }
    }

    class SlotData {
        constructor() {
            this.displayArr = [];
        }
        getDisplayByName(name) {
            var tDisplay;
            for (var i = 0, n = this.displayArr.length; i < n; i++) {
                tDisplay = this.displayArr[i];
                if (tDisplay.attachmentName == name) {
                    return i;
                }
            }
            return -1;
        }
    }

    /**
     * @internal
     */
    //TODO:coverage
    class TfConstraintData {
        constructor() {
            this.boneIndexs = [];
        }
    }

    /**数据解析完成后的调度。
     * @eventType Event.COMPLETE
     * */
    /*[Event(name = "complete", type = "laya.events.Event.COMPLETE", desc = "数据解析完成后的调度")]*/
    /**数据解析错误后的调度。
     * @eventType Event.ERROR
     * */
    /*[Event(name = "error", type = "laya.events.Event.ERROR", desc = "数据解析错误后的调度")]*/
    /**
     * 动画模板类
     */
    class Templet extends AnimationTemplet {
        constructor() {
            super(...arguments);
            this._graphicsCache = [];
            /** 存放原始骨骼信息 */
            this.srcBoneMatrixArr = [];
            /** IK数据 */
            this.ikArr = [];
            /** transform数据 */
            this.tfArr = [];
            /** path数据 */
            this.pathArr = [];
            /** 存放插槽数据的字典 */
            this.boneSlotDic = {};
            /** 绑定插槽数据的字典 */
            this.bindBoneBoneSlotDic = {};
            /** 存放插糟数据的数组 */
            this.boneSlotArray = [];
            /** 皮肤数据 */
            this.skinDataArray = [];
            /** 皮肤的字典数据 */
            this.skinDic = {};
            /** 存放纹理数据 */
            this.subTextureDic = {};
            /** 是否解析失败 */
            this.isParseFail = false;
            /** 渲染顺序动画数据 */
            this.drawOrderAniArr = [];
            /** 事件动画数据 */
            this.eventAniArr = [];
            /** @private 索引对应的名称 */
            this.attachmentNames = null;
            /** 顶点动画数据 */
            this.deformAniArr = [];
            /** 实际显示对象列表，用于销毁用 */
            this.skinSlotDisplayDataArr = [];
            /** 是否需要解析audio数据 */
            this._isParseAudio = false;
            this._isDestroyed = false;
            this._rate = 30;
            this.isParserComplete = false;
            this.aniSectionDic = {};
            this._textureDic = {};
            this.mBoneArr = [];
        }
        loadAni(url) {
            this._skBufferUrl = url;
            Laya.ILaya.loader.load(url, Laya.Handler.create(this, this.onComplete), null, Laya.ILaya.Loader.BUFFER);
        }
        onComplete(content = null) {
            if (this._isDestroyed) {
                this.destroy();
                return;
            }
            var tSkBuffer = Laya.ILaya.Loader.getRes(this._skBufferUrl);
            if (!tSkBuffer) {
                this.event(Laya.Event.ERROR, "load failed:" + this._skBufferUrl);
                return;
            }
            this._path = this._skBufferUrl.slice(0, this._skBufferUrl.lastIndexOf("/")) + "/";
            this.parseData(null, tSkBuffer);
        }
        /**
         * 解析骨骼动画数据
         * @param	texture			骨骼动画用到的纹理
         * @param	skeletonData	骨骼动画信息及纹理分块信息
         * @param	playbackRate	缓冲的帧率数据（会根据帧率去分帧）
         */
        parseData(texture, skeletonData, playbackRate = 30) {
            if (!this._path) {
                var s1 = (this._relativeUrl || this.url);
                if (s1) {
                    var p1 = s1.lastIndexOf('/');
                    if (p1 > 0) {
                        this._path = s1.slice(0, p1) + "/";
                    }
                    else {
                        this._path = '';
                    }
                }
            }
            this._mainTexture = texture;
            this._rate = playbackRate;
            this.parse(skeletonData);
        }
        /**
         * 创建动画
         * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
         * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
         * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
         * @param	aniMode 0	动画模式，0:不支持换装,1,2支持换装
         * @return
         */
        buildArmature(aniMode = 0) {
            return new Skeleton(this, aniMode);
        }
        /**
         * @private
         * 解析动画
         * @param	data			解析的二进制数据
         * @param	playbackRate	帧率
         * @override
         */
        parse(data) {
            super.parse(data);
            //_loaded = true;
            this.event(Laya.Event.LOADED, this);
            if (this._aniVersion === Templet.LAYA_ANIMATION_VISION) {
                this._isParseAudio = true;
            }
            else if (this._aniVersion != Templet.LAYA_ANIMATION_160_VISION) {
                //trace("[Error] Version " + _aniVersion + " The engine is inconsistent, update to the version " + KeyframesAniTemplet.LAYA_ANIMATION_VISION + " please.");
                console.log("[Error] 版本不一致，请使用IDE版本配套的重新导出" + this._aniVersion + "->" + Templet.LAYA_ANIMATION_VISION);
                //_loaded = false;
            }
            //解析公共数据
            //if (loaded) {
            //这里后面要改成一个状态，直接确认是不是要不要加载外部图片
            if (this._mainTexture) {
                this._parsePublicExtData();
            }
            else {
                this._parseTexturePath();
            }
            //} else {
            //this.event(Event.ERROR, this);
            //isParseFail = true;
            //}
        }
        _parseTexturePath() {
            if (this._isDestroyed) {
                this.destroy();
                return;
            }
            var i = 0;
            this._loadList = [];
            var tByte = new Laya.Byte(this.getPublicExtData());
            var tX = 0, tY = 0, tWidth = 0, tHeight = 0;
            var tTempleData = 0;
            var tTextureLen = tByte.getInt32();
            var tTextureName = tByte.readUTFString();
            var tTextureNameArr = tTextureName.split("\n");
            var tSrcTexturePath;
            for (i = 0; i < tTextureLen; i++) {
                tSrcTexturePath = this._path + tTextureNameArr[i * 2];
                tTextureName = tTextureNameArr[i * 2 + 1];
                tX = tByte.getFloat32();
                tY = tByte.getFloat32();
                tWidth = tByte.getFloat32();
                tHeight = tByte.getFloat32();
                tTempleData = tByte.getFloat32();
                tTempleData = tByte.getFloat32();
                tTempleData = tByte.getFloat32();
                tTempleData = tByte.getFloat32();
                if (this._loadList.indexOf(tSrcTexturePath) == -1) {
                    this._loadList.push(tSrcTexturePath);
                }
            }
            Laya.ILaya.loader.load(this._loadList, Laya.Handler.create(this, this._textureComplete));
        }
        /**
         * 纹理加载完成
         */
        _textureComplete() {
            var tTexture;
            var tTextureName;
            for (var i = 0, n = this._loadList.length; i < n; i++) {
                tTextureName = this._loadList[i];
                tTexture = this._textureDic[tTextureName] = Laya.ILaya.Loader.getRes(tTextureName);
            }
            this._parsePublicExtData();
        }
        /**
         * 解析自定义数据
         */
        _parsePublicExtData() {
            var i = 0, j = 0, k = 0, l = 0, n = 0;
            for (i = 0, n = this.getAnimationCount(); i < n; i++) {
                this._graphicsCache.push([]);
            }
            var isSpine;
            isSpine = this._aniClassName != "Dragon";
            var tByte = new Laya.Byte(this.getPublicExtData());
            var tX = 0, tY = 0, tWidth = 0, tHeight = 0;
            var tFrameX = 0, tFrameY = 0, tFrameWidth = 0, tFrameHeight = 0;
            var tTempleData = 0;
            //var tTextureLen:int = tByte.getUint8();
            var tTextureLen = tByte.getInt32();
            var tTextureName = tByte.readUTFString();
            var tTextureNameArr = tTextureName.split("\n");
            var tTexture;
            var tSrcTexturePath;
            for (i = 0; i < tTextureLen; i++) {
                tTexture = this._mainTexture;
                tSrcTexturePath = this._path + tTextureNameArr[i * 2];
                tTextureName = tTextureNameArr[i * 2 + 1];
                if (this._mainTexture == null) {
                    tTexture = this._textureDic[tSrcTexturePath];
                }
                if (!tTexture) {
                    this.event(Laya.Event.ERROR, this);
                    this.isParseFail = true;
                    return;
                }
                tX = tByte.getFloat32();
                tY = tByte.getFloat32();
                tWidth = tByte.getFloat32();
                tHeight = tByte.getFloat32();
                tTempleData = tByte.getFloat32();
                tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
                tTempleData = tByte.getFloat32();
                tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
                tTempleData = tByte.getFloat32();
                tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
                tTempleData = tByte.getFloat32();
                tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
                this.subTextureDic[tTextureName] = Laya.Texture.create(tTexture, tX, tY, tWidth, tHeight, -tFrameX, -tFrameY, tFrameWidth, tFrameHeight);
            }
            this._mainTexture = tTexture;
            var tAniCount = tByte.getUint16();
            var tSectionArr;
            for (i = 0; i < tAniCount; i++) {
                tSectionArr = [];
                tSectionArr.push(tByte.getUint16());
                tSectionArr.push(tByte.getUint16());
                tSectionArr.push(tByte.getUint16());
                tSectionArr.push(tByte.getUint16());
                this.aniSectionDic[i] = tSectionArr;
            }
            var tBone;
            var tParentBone;
            var tName;
            var tParentName;
            var tBoneLen = tByte.getInt16();
            var tBoneDic = {};
            var tRootBone;
            for (i = 0; i < tBoneLen; i++) {
                tBone = new Bone();
                if (i == 0) {
                    tRootBone = tBone;
                }
                else {
                    tBone.root = tRootBone;
                }
                tBone.d = isSpine ? -1 : 1;
                tName = tByte.readUTFString();
                tParentName = tByte.readUTFString();
                tBone.length = tByte.getFloat32();
                if (tByte.getByte() == 1) {
                    tBone.inheritRotation = false;
                }
                if (tByte.getByte() == 1) {
                    tBone.inheritScale = false;
                }
                tBone.name = tName;
                if (tParentName) {
                    tParentBone = tBoneDic[tParentName];
                    if (tParentBone) {
                        tParentBone.addChild(tBone);
                    }
                    else {
                        this.mRootBone = tBone;
                    }
                }
                tBoneDic[tName] = tBone;
                this.mBoneArr.push(tBone);
            }
            this.tMatrixDataLen = tByte.getUint16();
            var tLen = tByte.getUint16();
            var boneLength = Math.floor(tLen / this.tMatrixDataLen);
            var tResultTransform;
            var tMatrixArray = this.srcBoneMatrixArr;
            for (i = 0; i < boneLength; i++) {
                tResultTransform = new Transform();
                tResultTransform.scX = tByte.getFloat32();
                tResultTransform.skX = tByte.getFloat32();
                tResultTransform.skY = tByte.getFloat32();
                tResultTransform.scY = tByte.getFloat32();
                tResultTransform.x = tByte.getFloat32();
                tResultTransform.y = tByte.getFloat32();
                if (this.tMatrixDataLen === 8) {
                    tResultTransform.skewX = tByte.getFloat32();
                    tResultTransform.skewY = tByte.getFloat32();
                }
                tMatrixArray.push(tResultTransform);
                tBone = this.mBoneArr[i];
                tBone.transform = tResultTransform;
            }
            var tIkConstraintData;
            var tIkLen = tByte.getUint16();
            var tIkBoneLen;
            for (i = 0; i < tIkLen; i++) {
                tIkConstraintData = new IkConstraintData();
                tIkBoneLen = tByte.getUint16();
                for (j = 0; j < tIkBoneLen; j++) {
                    tIkConstraintData.boneNames.push(tByte.readUTFString());
                    tIkConstraintData.boneIndexs.push(tByte.getInt16());
                }
                tIkConstraintData.name = tByte.readUTFString();
                tIkConstraintData.targetBoneName = tByte.readUTFString();
                tIkConstraintData.targetBoneIndex = tByte.getInt16();
                tIkConstraintData.bendDirection = tByte.getFloat32();
                tIkConstraintData.mix = tByte.getFloat32();
                tIkConstraintData.isSpine = isSpine;
                this.ikArr.push(tIkConstraintData);
            }
            var tTfConstraintData;
            var tTfLen = tByte.getUint16();
            var tTfBoneLen;
            for (i = 0; i < tTfLen; i++) {
                tTfConstraintData = new TfConstraintData();
                tTfBoneLen = tByte.getUint16();
                for (j = 0; j < tTfBoneLen; j++) {
                    tTfConstraintData.boneIndexs.push(tByte.getInt16());
                }
                tTfConstraintData.name = tByte.getUTFString();
                tTfConstraintData.targetIndex = tByte.getInt16();
                tTfConstraintData.rotateMix = tByte.getFloat32();
                tTfConstraintData.translateMix = tByte.getFloat32();
                tTfConstraintData.scaleMix = tByte.getFloat32();
                tTfConstraintData.shearMix = tByte.getFloat32();
                tTfConstraintData.offsetRotation = tByte.getFloat32();
                tTfConstraintData.offsetX = tByte.getFloat32();
                tTfConstraintData.offsetY = tByte.getFloat32();
                tTfConstraintData.offsetScaleX = tByte.getFloat32();
                tTfConstraintData.offsetScaleY = tByte.getFloat32();
                tTfConstraintData.offsetShearY = tByte.getFloat32();
                this.tfArr.push(tTfConstraintData);
            }
            var tPathConstraintData;
            var tPathLen = tByte.getUint16();
            var tPathBoneLen;
            for (i = 0; i < tPathLen; i++) {
                tPathConstraintData = new PathConstraintData();
                tPathConstraintData.name = tByte.readUTFString();
                tPathBoneLen = tByte.getUint16();
                for (j = 0; j < tPathBoneLen; j++) {
                    tPathConstraintData.bones.push(tByte.getInt16());
                }
                tPathConstraintData.target = tByte.readUTFString();
                tPathConstraintData.positionMode = tByte.readUTFString();
                tPathConstraintData.spacingMode = tByte.readUTFString();
                tPathConstraintData.rotateMode = tByte.readUTFString();
                tPathConstraintData.offsetRotation = tByte.getFloat32();
                tPathConstraintData.position = tByte.getFloat32();
                tPathConstraintData.spacing = tByte.getFloat32();
                tPathConstraintData.rotateMix = tByte.getFloat32();
                tPathConstraintData.translateMix = tByte.getFloat32();
                this.pathArr.push(tPathConstraintData);
            }
            var tDeformSlotLen;
            var tDeformSlotDisplayLen;
            var tDSlotIndex;
            var tDAttachment;
            var tDeformTimeLen;
            var tDTime;
            var tDeformVecticesLen;
            var tDeformAniData;
            var tDeformSlotData;
            var tDeformSlotDisplayData;
            var tDeformVectices;
            var tDeformAniLen = tByte.getInt16();
            for (i = 0; i < tDeformAniLen; i++) {
                var tDeformSkinLen = tByte.getUint8();
                var tSkinDic = {};
                this.deformAniArr.push(tSkinDic);
                for (var f = 0; f < tDeformSkinLen; f++) {
                    tDeformAniData = new DeformAniData();
                    tDeformAniData.skinName = tByte.getUTFString();
                    tSkinDic[tDeformAniData.skinName] = tDeformAniData;
                    tDeformSlotLen = tByte.getInt16();
                    for (j = 0; j < tDeformSlotLen; j++) {
                        tDeformSlotData = new DeformSlotData();
                        tDeformAniData.deformSlotDataList.push(tDeformSlotData);
                        tDeformSlotDisplayLen = tByte.getInt16();
                        for (k = 0; k < tDeformSlotDisplayLen; k++) {
                            tDeformSlotDisplayData = new DeformSlotDisplayData();
                            tDeformSlotData.deformSlotDisplayList.push(tDeformSlotDisplayData);
                            tDeformSlotDisplayData.slotIndex = tDSlotIndex = tByte.getInt16();
                            tDeformSlotDisplayData.attachment = tDAttachment = tByte.getUTFString();
                            tDeformTimeLen = tByte.getInt16();
                            for (l = 0; l < tDeformTimeLen; l++) {
                                if (tByte.getByte() == 1) {
                                    tDeformSlotDisplayData.tweenKeyList.push(true);
                                }
                                else {
                                    tDeformSlotDisplayData.tweenKeyList.push(false);
                                }
                                tDTime = tByte.getFloat32();
                                tDeformSlotDisplayData.timeList.push(tDTime);
                                tDeformVectices = [];
                                tDeformSlotDisplayData.vectices.push(tDeformVectices);
                                tDeformVecticesLen = tByte.getInt16();
                                for (n = 0; n < tDeformVecticesLen; n++) {
                                    tDeformVectices.push(tByte.getFloat32());
                                }
                            }
                        }
                    }
                }
            }
            var tDrawOrderArr;
            var tDrawOrderAniLen = tByte.getInt16();
            var tDrawOrderLen;
            var tDrawOrderData;
            var tDoLen;
            for (i = 0; i < tDrawOrderAniLen; i++) {
                tDrawOrderLen = tByte.getInt16();
                tDrawOrderArr = [];
                for (j = 0; j < tDrawOrderLen; j++) {
                    tDrawOrderData = new DrawOrderData();
                    tDrawOrderData.time = tByte.getFloat32();
                    tDoLen = tByte.getInt16();
                    for (k = 0; k < tDoLen; k++) {
                        tDrawOrderData.drawOrder.push(tByte.getInt16());
                    }
                    tDrawOrderArr.push(tDrawOrderData);
                }
                this.drawOrderAniArr.push(tDrawOrderArr);
            }
            var tEventArr;
            var tEventAniLen = tByte.getInt16();
            var tEventLen;
            var tEventData;
            for (i = 0; i < tEventAniLen; i++) {
                tEventLen = tByte.getInt16();
                tEventArr = [];
                for (j = 0; j < tEventLen; j++) {
                    tEventData = new EventData();
                    tEventData.name = tByte.getUTFString();
                    if (this._isParseAudio)
                        tEventData.audioValue = tByte.getUTFString();
                    tEventData.intValue = tByte.getInt32();
                    tEventData.floatValue = tByte.getFloat32();
                    tEventData.stringValue = tByte.getUTFString();
                    tEventData.time = tByte.getFloat32();
                    tEventArr.push(tEventData);
                }
                this.eventAniArr.push(tEventArr);
            }
            var tAttachmentLen = tByte.getInt16();
            if (tAttachmentLen > 0) {
                this.attachmentNames = [];
                for (i = 0; i < tAttachmentLen; i++) {
                    this.attachmentNames.push(tByte.getUTFString());
                }
            }
            //创建插槽并绑定到骨骼上
            var tBoneSlotLen = tByte.getInt16();
            var tDBBoneSlot;
            var tDBBoneSlotArr;
            for (i = 0; i < tBoneSlotLen; i++) {
                tDBBoneSlot = new BoneSlot();
                tDBBoneSlot.name = tByte.readUTFString();
                tDBBoneSlot.parent = tByte.readUTFString();
                tDBBoneSlot.attachmentName = tByte.readUTFString();
                tDBBoneSlot.srcDisplayIndex = tDBBoneSlot.displayIndex = tByte.getInt16();
                tDBBoneSlot.templet = this;
                this.boneSlotDic[tDBBoneSlot.name] = tDBBoneSlot;
                tDBBoneSlotArr = this.bindBoneBoneSlotDic[tDBBoneSlot.parent];
                if (tDBBoneSlotArr == null) {
                    this.bindBoneBoneSlotDic[tDBBoneSlot.parent] = tDBBoneSlotArr = [];
                }
                tDBBoneSlotArr.push(tDBBoneSlot);
                this.boneSlotArray.push(tDBBoneSlot);
            }
            var tNameString = tByte.readUTFString();
            var tNameArray = tNameString.split("\n");
            var tNameStartIndex = 0;
            var tSkinDataLen = tByte.getUint8();
            var tSkinData, tSlotData, tDisplayData;
            var tSlotDataLen, tDisplayDataLen;
            var tUvLen, tWeightLen, tTriangleLen, tVerticeLen, tLengthLen;
            for (i = 0; i < tSkinDataLen; i++) {
                tSkinData = new SkinData();
                tSkinData.name = tNameArray[tNameStartIndex++];
                tSlotDataLen = tByte.getUint8();
                for (j = 0; j < tSlotDataLen; j++) {
                    tSlotData = new SlotData();
                    tSlotData.name = tNameArray[tNameStartIndex++];
                    tDBBoneSlot = this.boneSlotDic[tSlotData.name];
                    tDisplayDataLen = tByte.getUint8();
                    for (k = 0; k < tDisplayDataLen; k++) {
                        tDisplayData = new SkinSlotDisplayData();
                        this.skinSlotDisplayDataArr.push(tDisplayData);
                        tDisplayData.name = tNameArray[tNameStartIndex++];
                        tDisplayData.attachmentName = tNameArray[tNameStartIndex++];
                        tDisplayData.transform = new Transform();
                        tDisplayData.transform.scX = tByte.getFloat32();
                        tDisplayData.transform.skX = tByte.getFloat32();
                        tDisplayData.transform.skY = tByte.getFloat32();
                        tDisplayData.transform.scY = tByte.getFloat32();
                        tDisplayData.transform.x = tByte.getFloat32();
                        tDisplayData.transform.y = tByte.getFloat32();
                        tSlotData.displayArr.push(tDisplayData);
                        tDisplayData.width = tByte.getFloat32();
                        tDisplayData.height = tByte.getFloat32();
                        tDisplayData.type = tByte.getUint8();
                        tDisplayData.verLen = tByte.getUint16();
                        tBoneLen = tByte.getUint16();
                        if (tBoneLen > 0) {
                            tDisplayData.bones = [];
                            for (l = 0; l < tBoneLen; l++) {
                                var tBoneId = tByte.getUint16();
                                tDisplayData.bones.push(tBoneId);
                            }
                        }
                        tUvLen = tByte.getUint16();
                        if (tUvLen > 0) {
                            tDisplayData.uvs = [];
                            for (l = 0; l < tUvLen; l++) {
                                tDisplayData.uvs.push(tByte.getFloat32());
                            }
                        }
                        tWeightLen = tByte.getUint16();
                        if (tWeightLen > 0) {
                            tDisplayData.weights = [];
                            for (l = 0; l < tWeightLen; l++) {
                                tDisplayData.weights.push(tByte.getFloat32());
                            }
                        }
                        tTriangleLen = tByte.getUint16();
                        if (tTriangleLen > 0) {
                            tDisplayData.triangles = [];
                            for (l = 0; l < tTriangleLen; l++) {
                                tDisplayData.triangles.push(tByte.getUint16());
                            }
                        }
                        tVerticeLen = tByte.getUint16();
                        if (tVerticeLen > 0) {
                            tDisplayData.vertices = [];
                            for (l = 0; l < tVerticeLen; l++) {
                                tDisplayData.vertices.push(tByte.getFloat32());
                            }
                        }
                        tLengthLen = tByte.getUint16();
                        if (tLengthLen > 0) {
                            tDisplayData.lengths = [];
                            for (l = 0; l < tLengthLen; l++) {
                                tDisplayData.lengths.push(tByte.getFloat32());
                            }
                        }
                    }
                    tSkinData.slotArr.push(tSlotData);
                }
                this.skinDic[tSkinData.name] = tSkinData;
                this.skinDataArray.push(tSkinData);
            }
            var tReverse = tByte.getUint8();
            if (tReverse == 1) {
                this.yReverseMatrix = new Laya.Matrix(1, 0, 0, -1, 0, 0);
                if (tRootBone) {
                    tRootBone.setTempMatrix(this.yReverseMatrix);
                }
            }
            else {
                if (tRootBone) {
                    tRootBone.setTempMatrix(new Laya.Matrix());
                }
            }
            this.showSkinByIndex(this.boneSlotDic, 0);
            this.isParserComplete = true;
            this.event(Laya.Event.COMPLETE, this);
        }
        /**
         * 得到指定的纹理
         * @param	name	纹理的名字
         * @return
         */
        getTexture(name) {
            var tTexture = this.subTextureDic[name];
            if (!tTexture) {
                tTexture = this.subTextureDic[name.substr(0, name.length - 1)];
            }
            if (tTexture == null) {
                return this._mainTexture;
            }
            return tTexture;
        }
        /**
         * @private
         * 显示指定的皮肤
         * @param	boneSlotDic	插糟字典的引用
         * @param	skinIndex	皮肤的索引
         * @param	freshDisplayIndex	是否重置插槽纹理
         */
        showSkinByIndex(boneSlotDic, skinIndex, freshDisplayIndex = true) {
            if (skinIndex < 0 && skinIndex >= this.skinDataArray.length)
                return false;
            var i, n;
            var tBoneSlot;
            var tSlotData;
            var tSkinData = this.skinDataArray[skinIndex];
            if (tSkinData) {
                for (i = 0, n = tSkinData.slotArr.length; i < n; i++) {
                    tSlotData = tSkinData.slotArr[i];
                    if (tSlotData) {
                        tBoneSlot = boneSlotDic[tSlotData.name];
                        if (tBoneSlot) {
                            tBoneSlot.showSlotData(tSlotData, freshDisplayIndex);
                            if (freshDisplayIndex && tBoneSlot.attachmentName != "undefined" && tBoneSlot.attachmentName != "null") {
                                tBoneSlot.showDisplayByName(tBoneSlot.attachmentName);
                            }
                            else {
                                tBoneSlot.showDisplayByIndex(tBoneSlot.displayIndex);
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        }
        /**
         * 通过皮肤名字得到皮肤索引
         * @param	skinName 皮肤名称
         * @return
         */
        getSkinIndexByName(skinName) {
            var tSkinData;
            for (var i = 0, n = this.skinDataArray.length; i < n; i++) {
                tSkinData = this.skinDataArray[i];
                if (tSkinData.name == skinName) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * @private
         * 得到缓冲数据
         * @param	aniIndex	动画索引
         * @param	frameIndex	帧索引
         * @return
         */
        getGrahicsDataWithCache(aniIndex, frameIndex) {
            if (this._graphicsCache[aniIndex] && this._graphicsCache[aniIndex][frameIndex]) {
                return this._graphicsCache[aniIndex][frameIndex];
            }
            //trace("getGrahicsDataWithCache fail:",aniIndex,frameIndex,this._path);
            return null;
        }
        /**
         * @internal
         * @override
         */
        _setCreateURL(url) {
            this._relativeUrl = url;
            super._setCreateURL(url);
        }
        /**
         * @private
         * 保存缓冲grahpics
         * @param	aniIndex	动画索引
         * @param	frameIndex	帧索引
         * @param	graphics	要保存的数据
         */
        setGrahicsDataWithCache(aniIndex, frameIndex, graphics) {
            this._graphicsCache[aniIndex][frameIndex] = graphics;
        }
        deleteAniData(aniIndex) {
            if (this._anis[aniIndex]) {
                var tAniDataO = this._anis[aniIndex];
                tAniDataO.bone3DMap = null;
                tAniDataO.nodes = null;
            }
        }
        /**
         * 释放纹理
         * @override
         */
        destroy() {
            this._isDestroyed = true;
            var tTexture;
            for (tTexture in this.subTextureDic) {
                if (tTexture) {
                    this.subTextureDic[tTexture].destroy();
                }
            }
            for (tTexture in this._textureDic) {
                if (tTexture) {
                    this._textureDic[tTexture].destroy();
                }
            }
            var tSkinSlotDisplayData;
            for (var i = 0, n = this.skinSlotDisplayDataArr.length; i < n; i++) {
                tSkinSlotDisplayData = this.skinSlotDisplayDataArr[i];
                tSkinSlotDisplayData.destory();
            }
            this.skinSlotDisplayDataArr.length = 0;
            if (this.url) {
                delete Templet.TEMPLET_DICTIONARY[this.url];
            }
            super.destroy();
        }
        /***********************************下面为一些儿访问接口*****************************************/
        /**
         * 通过索引得动画名称
         * @param	index
         * @return
         */
        getAniNameByIndex(index) {
            var tAni = this.getAnimation(index);
            if (tAni)
                return tAni.name;
            return null;
        }
        get rate() {
            return this._rate;
        }
        set rate(v) {
            this._rate = v;
        }
    }
    /**@internal */
    Templet.LAYA_ANIMATION_160_VISION = "LAYAANIMATION:1.6.0";
    /**@internal */
    Templet.LAYA_ANIMATION_VISION = "LAYAANIMATION:1.7.0";
    IAniLib.Templet = Templet;

    /**
     * 动画播放完毕后调度。
     * @eventType Event.COMPLETE
     */
    /*[Event(name = "complete", type = "laya.events.Event")]*/
    /**
     * 播放到某标签后调度。
     * @eventType Event.LABEL
     */
    /*[Event(name = "label", type = "laya.events.Event")]*/
    /**
     * 加载完成后调度。
     * @eventType Event.LOADED
     */
    /*[Event(name = "loaded", type = "laya.events.Event")]*/
    /**
     * 进入帧后调度。
     * @eventType Event.FRAME
     */
    /*[Event(name = "frame", type = "laya.events.Event")]*/
    /**
     * <p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
     */
    class MovieClip extends Laya.Sprite {
        /**
         * 创建一个 <code>MovieClip</code> 实例。
         * @param parentMovieClip 父MovieClip,自己创建时不需要传该参数
         */
        constructor(parentMovieClip = null) {
            super();
            /**@private 数据起始位置。*/
            this._start = 0;
            /**@private 当前位置。*/
            this._Pos = 0;
            /**@private */
            this._ended = true;
            /**@private */
            this._loadedImage = {};
            /**@private */
            this._endFrame = -1;
            /** 播放间隔(单位：毫秒)。*/
            this.interval = 30;
            this._ids = {};
            this._idOfSprite = [];
            this._reset();
            this._playing = false;
            this._parentMovieClip = parentMovieClip;
            if (!parentMovieClip) {
                this._movieClipList = [this];
                this._isRoot = true;
                this._setBitUp(Laya.Const.DISPLAY);
            }
            else {
                this._isRoot = false;
                this._movieClipList = parentMovieClip._movieClipList;
                this._movieClipList.push(this);
            }
        }
        /**
         * <p>销毁此对象。以及销毁引用的Texture</p>
         * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
         * @override
         */
        destroy(destroyChild = true) {
            this._clear();
            super.destroy(destroyChild);
        }
        /**
         * @internal
         * @override
         */
        _setDisplay(value) {
            super._setDisplay(value);
            if (this._isRoot) {
                this._onDisplay(value);
            }
        }
        /**
         * @private
         * @override
         */
        _onDisplay(value) {
            if (value)
                this.timer.loop(this.interval, this, this.updates, null, true);
            else
                this.timer.clear(this, this.updates);
        }
        /**@private 更新时间轴*/
        //TODO:coverage
        updates() {
            if (this._parentMovieClip)
                return;
            var i, len;
            len = this._movieClipList.length;
            for (i = 0; i < len; i++) {
                this._movieClipList[i] && this._movieClipList[i]._update();
            }
        }
        /**当前播放索引。*/
        get index() {
            return this._playIndex;
        }
        set index(value) {
            this._playIndex = value;
            if (this._data)
                this._displayFrame(this._playIndex);
            if (this._labels && this._labels[value])
                this.event(Laya.Event.LABEL, this._labels[value]);
        }
        /**
         * 增加一个标签到index帧上，播放到此index后会派发label事件
         * @param	label	标签名称
         * @param	index	索引位置
         */
        addLabel(label, index) {
            if (!this._labels)
                this._labels = {};
            this._labels[index] = label;
        }
        /**
         * 删除某个标签
         * @param	label 标签名字，如果label为空，则删除所有Label
         */
        removeLabel(label) {
            if (!label)
                this._labels = null;
            else if (!this._labels) {
                for (var name in this._labels) {
                    if (this._labels[name] === label) {
                        delete this._labels[name];
                        break;
                    }
                }
            }
        }
        /**
         * 帧总数。
         */
        get count() {
            return this._count;
        }
        /**
         * 是否在播放中
         */
        get playing() {
            return this._playing;
        }
        /**
         * @private
         * 动画的帧更新处理函数。
         */
        //TODO:coverage
        _update() {
            if (!this._data)
                return;
            if (!this._playing)
                return;
            this._playIndex++;
            if (this._playIndex >= this._count) {
                if (!this.loop) {
                    this._playIndex--;
                    this.stop();
                    return;
                }
                this._playIndex = 0;
            }
            this._parseFrame(this._playIndex);
            if (this._labels && this._labels[this._playIndex])
                this.event(Laya.Event.LABEL, this._labels[this._playIndex]);
            if (this._endFrame != -1 && this._endFrame == this._playIndex) {
                this._endFrame = -1;
                if (this._completeHandler != null) {
                    var handler = this._completeHandler;
                    this._completeHandler = null;
                    handler.run();
                }
                this.stop();
            }
        }
        /**
         * 停止播放动画。
         */
        stop() {
            this._playing = false;
        }
        /**
         * 跳到某帧并停止播放动画。
         * @param frame 要跳到的帧
         */
        gotoAndStop(index) {
            this.index = index;
            this.stop();
        }
        /**
         * @private
         * 清理。
         */
        _clear() {
            this.stop();
            this._idOfSprite.length = 0;
            if (!this._parentMovieClip) {
                this.timer.clear(this, this.updates);
                var i, len;
                len = this._movieClipList.length;
                for (i = 0; i < len; i++) {
                    if (this._movieClipList[i] != this)
                        this._movieClipList[i]._clear();
                }
                this._movieClipList.length = 0;
            }
            if (this._atlasPath) {
                Laya.ILaya.Loader.clearRes(this._atlasPath);
            }
            var key;
            for (key in this._loadedImage) {
                if (this._loadedImage[key]) {
                    Laya.ILaya.Loader.clearRes(key);
                    this._loadedImage[key] = false;
                }
            }
            this.removeChildren();
            this.graphics = null;
            this._parentMovieClip = null;
        }
        /**
         * 播放动画。
         * @param	index 帧索引。
         */
        play(index = 0, loop = true) {
            this.loop = loop;
            this._playing = true;
            if (this._data)
                this._displayFrame(index);
        }
        /**@private */
        //TODO:coverage
        _displayFrame(frameIndex = -1) {
            if (frameIndex != -1) {
                if (this._curIndex > frameIndex)
                    this._reset();
                this._parseFrame(frameIndex);
            }
        }
        /**@private */
        _reset(rm = true) {
            if (rm && this._curIndex != 1)
                this.removeChildren();
            this._preIndex = this._curIndex = -1;
            this._Pos = this._start;
        }
        /**@private */
        //TODO:coverage
        _parseFrame(frameIndex) {
            var mc, sp, key, type, tPos, ttype, ifAdd = false;
            var _idOfSprite = this._idOfSprite, _data = this._data, eStr;
            if (this._ended)
                this._reset();
            _data.pos = this._Pos;
            this._ended = false;
            this._playIndex = frameIndex;
            if (this._curIndex > frameIndex && frameIndex < this._preIndex) {
                this._reset(true);
                _data.pos = this._Pos;
            }
            while ((this._curIndex <= frameIndex) && (!this._ended)) {
                type = _data.getUint16();
                switch (type) {
                    case 12: //new MC
                        key = _data.getUint16();
                        tPos = this._ids[_data.getUint16()];
                        this._Pos = _data.pos;
                        _data.pos = tPos;
                        if ((ttype = _data.getUint8()) == 0) {
                            var pid = _data.getUint16();
                            sp = _idOfSprite[key];
                            if (!sp) {
                                sp = _idOfSprite[key] = new Laya.Sprite();
                                var spp = new Laya.Sprite();
                                spp.loadImage(this.basePath + pid + ".png");
                                this._loadedImage[this.basePath + pid + ".png"] = true;
                                sp.addChild(spp);
                                spp.size(_data.getFloat32(), _data.getFloat32());
                                var mat = _data._getMatrix();
                                spp.transform = mat;
                            }
                            sp.alpha = 1;
                        }
                        else if (ttype == 1) {
                            mc = _idOfSprite[key];
                            if (!mc) {
                                _idOfSprite[key] = mc = new MovieClip(this);
                                mc.interval = this.interval;
                                mc._ids = this._ids;
                                mc.basePath = this.basePath;
                                mc._setData(_data, tPos);
                                mc._initState();
                                mc.play(0);
                            }
                            mc.alpha = 1;
                        }
                        _data.pos = this._Pos;
                        break;
                    case 3: //addChild
                        var node = _idOfSprite[ /*key*/_data.getUint16()];
                        if (node) {
                            this.addChild(node);
                            node.zOrder = _data.getUint16();
                            ifAdd = true;
                        }
                        break;
                    case 4: //remove
                        node = _idOfSprite[ /*key*/_data.getUint16()];
                        node && node.removeSelf();
                        break;
                    case 5: //setValue
                        _idOfSprite[_data.getUint16()][MovieClip._ValueList[_data.getUint16()]] = (_data.getFloat32());
                        break;
                    case 6: //visible
                        _idOfSprite[_data.getUint16()].visible = ( /*visible*/_data.getUint8() > 0);
                        break;
                    case 7: //SetTransform
                        sp = _idOfSprite[ /*key*/_data.getUint16()]; //.transform=mt;
                        var mt = sp.transform || Laya.Matrix.create();
                        mt.setTo(_data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32());
                        sp.transform = mt;
                        break;
                    case 8: //pos
                        _idOfSprite[_data.getUint16()].setPos(_data.getFloat32(), _data.getFloat32());
                        break;
                    case 9: //size
                        _idOfSprite[_data.getUint16()].setSize(_data.getFloat32(), _data.getFloat32());
                        break;
                    case 10: //alpha
                        _idOfSprite[ /*key*/_data.getUint16()].alpha = /*alpha*/ _data.getFloat32();
                        break;
                    case 11: //scale
                        _idOfSprite[_data.getUint16()].setScale(_data.getFloat32(), _data.getFloat32());
                        break;
                    case 98: //event		
                        eStr = _data.getString();
                        this.event(eStr);
                        if (eStr == "stop")
                            this.stop();
                        break;
                    case 99: //FrameBegin				
                        this._curIndex = _data.getUint16();
                        ifAdd && this.updateZOrder();
                        break;
                    case 100: //cmdEnd
                        this._count = this._curIndex + 1;
                        this._ended = true;
                        if (this._playing) {
                            this.event(Laya.Event.FRAME);
                            this.event(Laya.Event.END);
                            this.event(Laya.Event.COMPLETE);
                        }
                        this._reset(false);
                        break;
                }
            }
            if (this._playing && !this._ended)
                this.event(Laya.Event.FRAME);
            this._Pos = _data.pos;
        }
        /**@internal */
        //TODO:coverage
        _setData(data, start) {
            this._data = data;
            this._start = start + 3;
        }
        /**
         * 资源地址。
         */
        set url(path) {
            this.load(path);
        }
        /**
         * 加载资源。
         * @param	url swf 资源地址。
         * @param   atlas  是否使用图集资源
         * @param   atlasPath  图集路径，默认使用与swf同名的图集
         */
        load(url, atlas = false, atlasPath = null) {
            this._url = url;
            if (atlas)
                this._atlasPath = atlasPath ? atlasPath : url.split(".swf")[0] + ".json";
            this.stop();
            this._clear();
            this._movieClipList = [this];
            var urls;
            urls = [{ url: url, type: Laya.ILaya.Loader.BUFFER }];
            if (this._atlasPath) {
                urls.push({ url: this._atlasPath, type: Laya.ILaya.Loader.ATLAS });
            }
            Laya.ILaya.loader.load(urls, Laya.Handler.create(this, this._onLoaded));
        }
        /**@private */
        _onLoaded() {
            var data;
            data = Laya.ILaya.Loader.getRes(this._url);
            if (!data) {
                this.event(Laya.Event.ERROR, "file not find");
                return;
            }
            if (this._atlasPath && !Laya.ILaya.Loader.getAtlas(this._atlasPath)) {
                this.event(Laya.Event.ERROR, "Atlas not find");
                return;
            }
            // guo TODO getAtlas 返回的会有dir么， 应该是数组
            this.basePath = this._atlasPath ? Laya.ILaya.Loader.getAtlas(this._atlasPath).dir : this._url.split(".swf")[0] + "/image/";
            this._initData(data);
        }
        /**@private */
        //TODO:coverage
        _initState() {
            this._reset();
            this._ended = false;
            var preState = this._playing;
            this._playing = false;
            this._curIndex = 0;
            while (!this._ended)
                this._parseFrame(++this._curIndex);
            this._playing = preState;
        }
        /**@private */
        //TODO:coverage
        _initData(data) {
            this._data = new Laya.Byte(data);
            var i, len = this._data.getUint16();
            for (i = 0; i < len; i++)
                this._ids[this._data.getInt16()] = this._data.getInt32();
            this.interval = 1000 / this._data.getUint16();
            this._setData(this._data, this._ids[32767]);
            this._initState();
            this.play(0);
            this.event(Laya.Event.LOADED);
            if (!this._parentMovieClip)
                this.timer.loop(this.interval, this, this.updates, null, true);
        }
        /**
         * 从开始索引播放到结束索引，结束之后出发complete回调
         * @param	start	开始索引
         * @param	end		结束索引
         * @param	complete	结束回调
         */
        playTo(start, end, complete = null) {
            this._completeHandler = complete;
            this._endFrame = end;
            this.play(start, false);
        }
    }
    /**@private */
    MovieClip._ValueList = ["x", "y", "width", "height", "scaleX", "scaleY", "rotation", "alpha"];

    exports.AnimationContent = AnimationContent;
    exports.AnimationNodeContent = AnimationNodeContent;
    exports.AnimationParser01 = AnimationParser01;
    exports.AnimationParser02 = AnimationParser02;
    exports.AnimationPlayer = AnimationPlayer;
    exports.AnimationState = AnimationState;
    exports.AnimationTemplet = AnimationTemplet;
    exports.BezierLerp = BezierLerp;
    exports.Bone = Bone;
    exports.BoneSlot = BoneSlot;
    exports.DeformAniData = DeformAniData;
    exports.DeformSlotData = DeformSlotData;
    exports.DeformSlotDisplayData = DeformSlotDisplayData;
    exports.DrawOrderData = DrawOrderData;
    exports.EventData = EventData;
    exports.GraphicsAni = GraphicsAni;
    exports.IAniLib = IAniLib;
    exports.IkConstraint = IkConstraint;
    exports.IkConstraintData = IkConstraintData;
    exports.KeyFramesContent = KeyFramesContent;
    exports.MeshData = MeshData;
    exports.MovieClip = MovieClip;
    exports.PathConstraint = PathConstraint;
    exports.PathConstraintData = PathConstraintData;
    exports.Skeleton = Skeleton;
    exports.SkinData = SkinData;
    exports.SkinMeshForGraphic = SkinMeshForGraphic;
    exports.SkinSlotDisplayData = SkinSlotDisplayData;
    exports.SlotData = SlotData;
    exports.Templet = Templet;
    exports.TfConstraint = TfConstraint;
    exports.TfConstraintData = TfConstraintData;
    exports.Transform = Transform;
    exports.UVTools = UVTools;

}(window.Laya = window.Laya|| {}, Laya));
