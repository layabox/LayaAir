import { IkConstraint } from "././IkConstraint";
import { PathConstraint } from "././PathConstraint";
import { TfConstraint } from "././TfConstraint";
import { AnimationPlayer } from "../AnimationPlayer";
import { GraphicsAni } from "../GraphicsAni";
import { Sprite } from "../../display/Sprite";
import { Handler } from "../../utils/Handler";
import { Matrix } from "../../maths/Matrix";
import { Event } from "../../events/Event";
import { SoundManager } from "../../media/SoundManager";
import { Byte } from "../../utils/Byte";
import { IAniLib } from "../AniLibPack";
import { ILaya } from "../../../ILaya";
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
export class Skeleton extends Sprite {
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
        this._currAniName = null;
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
        this._player.on(Event.PLAYED, this, this._onPlay);
        this._player.on(Event.STOPPED, this, this._onStop);
        this._player.on(Event.PAUSED, this, this._onPause);
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
        ILaya.loader.load([{ url: path, type: ILaya.Loader.BUFFER }], Handler.create(this, this._onLoaded));
    }
    /**
     * 加载完成
     */
    _onLoaded() {
        var arraybuffer = ILaya.Loader.getRes(this._aniPath);
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
                    tFactory.on(Event.COMPLETE, this, this._parseComplete);
                    tFactory.on(Event.ERROR, this, this._parseFail);
                }
            }
        }
        else {
            tFactory = new IAniLib.Templet();
            tFactory._setCreateURL(this._aniPath);
            IAniLib.Templet.TEMPLET_DICTIONARY[this._aniPath] = tFactory;
            tFactory.on(Event.COMPLETE, this, this._parseComplete);
            tFactory.on(Event.ERROR, this, this._parseFail);
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
        this.event(Event.PLAYED);
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
                    this.event(Event.LABEL, tEventData);
                }
            }
        }
        //_eventIndex = 0;
        this._drawOrder = null;
        this.event(Event.STOPPED);
    }
    /**
     * 传递PAUSE事件
     */
    _onPause() {
        this.event(Event.PAUSED);
    }
    /**
     * 创建骨骼的矩阵，保存每次计算的最终结果
     */
    _parseSrcBoneMatrix() {
        var i = 0, n = 0;
        n = this._templet.srcBoneMatrixArr.length;
        for (i = 0; i < n; i++) {
            this._boneMatrixArray.push(new Matrix());
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
                    this.event(Event.LABEL, tEventData);
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
        if (tEventArr && this._eventIndex < tEventArr.length) {
            var tEventData = tEventArr[this._eventIndex];
            if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                if (this._player.currentPlayTime >= tEventData.time) {
                    this.event(Event.LABEL, tEventData);
                    this._eventIndex++;
                    if (this._playAudio && tEventData.audioValue && tEventData.audioValue !== "null") {
                        var _soundChannel = SoundManager.playSound(this._player.templet._path + tEventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped));
                        _soundChannel && this._soundChannelArr.push(_soundChannel);
                    }
                }
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
        var tParentMatrix; //父骨骼矩阵的引用
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
                    var tByte = new Byte(tBoneData.extenData);
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
        this._rootBone.update(this._yReverseMatrix || Matrix.TEMP.identity());
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
        var tDeformSlotData;
        var tDeformSlotDisplayData;
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
                if (!isNaN(tSlotData3)) { // 如果alpha有值的话
                    //tGraphics.save();
                    //tGraphics.alpha(tSlotData3);
                }
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
                if (!isNaN(tSlotData3)) {
                    //tGraphics.restore();
                }
            }
        }
        else {
            for (i = 0, n = this._boneSlotArray.length; i < n; i++) {
                tDBBoneSlot = this._boneSlotArray[i];
                tSlotData2 = tSlotDic[tDBBoneSlot.name];
                tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
                if (!isNaN(tSlotData3)) {
                    //tGraphics.save();
                    //tGraphics.alpha(tSlotData3);
                }
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
                if (!isNaN(tSlotData3)) {
                    //tGraphics.restore();
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
                    this._lastTime = ILaya.Browser.now();
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
            this._lastTime = ILaya.Browser.now();
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
     */
    /*override*/ destroy(destroyChild = true) {
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
ILaya.regClass(Skeleton);
