import { Sprite } from "../../display/Sprite";
import { Byte } from "../../utils/Byte";
import { Handler } from "../../utils/Handler";
import { Event } from "../../events/Event";
import { ILaya } from "../../../ILaya";
import { Matrix } from "../../maths/Matrix";
import { Loader } from "../../net/Loader";

/**
 * @en MovieClip is used to play SWF animations that have been processed by tools.
 * - Event.COMPLETE: After the animation is played.
 * - Event.LABEL: After playing to a tag.
 * - Event.LOADED: After loading.
 * - Event.FRAME: After entering the frame.
 * @zh MovieClip 用于播放经过工具处理后的 swf 动画。
 * - Event.COMPLETE: 动画播放完毕后调度。
 * - Event.LABEL: 播放到某标签后调度。
 * - Event.LOADED: 加载完成后调度。
 * - Event.FRAME: 进入帧后调度。
 */
export class MovieClip extends Sprite {
    protected static _ValueList: any[] = ["x", "y", "width", "height", "scaleX", "scaleY", "rotation", "alpha"];
    /** 数据起始位置。*/
    protected _start: number = 0;
    /** 当前位置。*/
    protected _Pos: number = 0;
    /** 数据。*/
    protected _data: Byte;
    protected _curIndex: number;
    protected _preIndex: number;
    protected _playIndex: number;
    protected _playing: boolean;
    protected _ended: boolean = true;
    /** 总帧数。*/
    protected _count: number;
    /**@internal id_data起始位置表*/
    _ids: any;
    protected _loadedImage: any = {};
    /**@internal id_实例表*/
    _idOfSprite: any[];
    /**@internal 父mc*/
    _parentMovieClip: MovieClip;
    /**@internal 需要更新的movieClip表*/
    _movieClipList: MovieClip[];
    protected _labels: any;
    /** 
     * @en Resource root directory
     * @zh 资源根目录
     */
    basePath: string;
    private _isRoot: boolean;
    private _completeHandler: Handler;
    private _endFrame: number = -1;
    private _source: string;

    /** 
     * @en Playback interval (in milliseconds)
     * @zh 播放间隔(单位：毫秒)。
     */
    interval: number = 30;
    /**
     * @en Whether to play in a loop
     * @zh 是否循环播放 
     */
    loop: boolean;

    /**
     * @en Constructor method of MovieClip.
     * @param parentMovieClip The parent MovieClip, this parameter is not required when creating your own MovieClip.
     * @zh MovieClip构造方法
     * @param parentMovieClip 父 MovieClip，自己创建时不需要传该参数。
     */
    constructor(parentMovieClip: MovieClip = null) {
        super();
        this._ids = {};
        this._idOfSprite = [];
        this._reset();
        this._playing = false;
        this._parentMovieClip = parentMovieClip;
        if (!parentMovieClip) {
            this._movieClipList = [this];
            this._isRoot = true;
            this.on(Event.DISPLAY, this, this._onDisplay);
            this.on(Event.UNDISPLAY, this, this._onDisplay);
        } else {
            this._isRoot = false;
            this._movieClipList = parentMovieClip._movieClipList;
            this._movieClipList.push(this);
        }
    }

    /**
     * @en Destroys this object and its referenced Texture.
     * @param destroyChild Whether to destroy child nodes simultaneously. If true, child nodes are destroyed; otherwise, they are not.
     * @zh 销毁此对象及其引用的Texture。
     * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        this._clear();
        super.destroy(destroyChild);
    }

    private _onDisplay(): void {
        if (this.displayedInStage)
            this.timer.loop(this.interval, this, this.updates, null, true);
        else
            this.timer.clear(this, this.updates);
    }

    /**
     * @en Update the timeline of the MovieClip.
     * @zh 更新 MovieClip 的时间轴。
     */
    //TODO:coverage
    updates(): void {
        if (this._parentMovieClip) return;
        var i: number, len: number;
        len = this._movieClipList.length;
        for (i = 0; i < len; i++) {
            this._movieClipList[i] && this._movieClipList[i]._update();
        }
    }

    /**
     * @en The current playback index of the MovieClip.
     * @zh MovieClip 当前播放的索引。
     */
    get index(): number {
        return this._playIndex;
    }

    set index(value: number) {
        this._playIndex = value;
        if (this._data)
            this._displayFrame(this._playIndex);
        if (this._labels && this._labels[value]) this.event(Event.LABEL, this._labels[value]);
    }

    /**
     * @en Adds a label to a specified frame index. When played to this index, a label event will be dispatched.
     * @param label The name of the label.
     * @param index The frame index to add the label to.
     * @zh 在指定的帧索引上增加一个标签，播放到此索引后会派发label事件。
     * @param label	标签名称
     * @param index	索引位置
     */
    addLabel(label: string, index: number): void {
        if (!this._labels) this._labels = {};
        this._labels[index] = label;
    }

    /**
     * @en Remove the corresponding label from the specified label name.
     * @param label The name of the label to remove. If not provided, all labels are removed.
     * @zh 从指定的标签名字删除对应标签。
     * @param label 标签名字，如果label为空，则删除所有Label
     */
    removeLabel(label: string): void {
        if (!label) this._labels = null;
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
     * @en The total number of frames in the MovieClip.
     * @zh MovieClip 中的帧总数。
     */
    get count(): number {
        return this._count;
    }

    /**
     * @en Whether the MovieClip is currently playing.
     * @zh MovieClip 是否正在播放中。
     */
    get playing(): boolean {
        return this._playing;
    }
    /**
     * 动画的帧更新处理函数。
     */
    //TODO:coverage
    private _update(): void {
        if (!this._data) return;
        if (!this._playing) return;
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
        if (this._labels && this._labels[this._playIndex]) this.event(Event.LABEL, this._labels[this._playIndex]);
        if (this._endFrame != -1 && this._endFrame == this._playIndex) {
            this._endFrame = -1;
            if (this._completeHandler != null) {
                var handler: Handler = this._completeHandler;
                this._completeHandler = null;
                handler.run();
            }
            this.stop();

        }
    }

    /**
     * @en Stops the playback of the animation.
     * @zh 停止播放动画。
     */
    stop(): void {
        this._playing = false;
    }

    /**
     * @en Jumps to a specified frame and stops playing the animation.
     * @param index The frame index to jump to.
     * @zh 跳到指定帧并停止播放动画。
     * @param index 要跳到的帧
     */
    gotoAndStop(index: number): void {
        this.index = index;
        this.stop();
    }

    /**
     * 清理。
     */
    private _clear(): void {
        this.stop();
        this._idOfSprite.length = 0;
        if (!this._parentMovieClip) {
            this.timer.clear(this, this.updates);
            var i: number, len: number;
            len = this._movieClipList.length;
            for (i = 0; i < len; i++) {
                if (this._movieClipList[i] != this)
                    this._movieClipList[i]._clear();
            }
            this._movieClipList.length = 0;
        }
        var key: string;
        for (key in this._loadedImage) {
            let obj = this._loadedImage[key];
            if (obj) {
                ILaya.Loader.clearRes(key, obj);
                this._loadedImage[key] = false;
            }
        }
        this.removeChildren();
        this.graphics = null;
        this._parentMovieClip = null;
    }

    /**
     * @en Play Animation
     * @param index frame index
     * @zh 播放动画。
     * @param index 帧索引
     */
    play(index: number = 0, loop: boolean = true): void {
        this.loop = loop;
        this._playing = true;
        if (this._data)
            this._displayFrame(index);
    }

    //TODO:coverage
    private _displayFrame(frameIndex: number = -1): void {
        if (frameIndex != -1) {
            if (this._curIndex > frameIndex) this._reset();
            this._parseFrame(frameIndex);
        }
    }

    private _reset(rm: boolean = true): void {
        if (rm && this._curIndex != 1) this.removeChildren();
        this._preIndex = this._curIndex = -1;
        this._Pos = this._start;
    }

    //TODO:coverage
    private _parseFrame(frameIndex: number): void {
        var mc: MovieClip, sp: Sprite, key: number, type: number, tPos: number, ttype: number, ifAdd: boolean = false;
        var _idOfSprite: any[] = this._idOfSprite, _data: Byte = this._data, eStr: string;
        if (this._ended) this._reset();
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
                        var pid: number = _data.getUint16();
                        sp = _idOfSprite[key]
                        if (!sp) {
                            sp = _idOfSprite[key] = new Sprite();
                            var spp: Sprite = new Sprite();
                            spp.loadImage(this.basePath + pid + ".png");
                            spp.name = pid + "";
                            this._loadedImage[this.basePath + pid + ".png"] = true;
                            sp.addChild(spp);
                            spp.size(_data.getFloat32(), _data.getFloat32());
                            var mat: Matrix = _data._getMatrix();
                            spp.transform = mat;
                        }
                        sp.alpha = 1;
                    } else if (ttype == 1) {
                        mc = _idOfSprite[key]
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
                    var node: Sprite = _idOfSprite[ /*key*/_data.getUint16()];
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
                    var mt: Matrix = sp.transform || Matrix.create();
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
                    if (eStr == "stop") this.stop();
                    break;
                case 99: //FrameBegin				
                    this._curIndex = _data.getUint16();
                    ifAdd && this.updateZOrder();
                    break;
                case 100: //cmdEnd
                    this._count = this._curIndex + 1;
                    this._ended = true;
                    if (this._playing) {
                        this.event(Event.FRAME);
                        this.event(Event.END);
                        this.event(Event.COMPLETE);
                    }

                    this._reset(false);
                    break;
            }
        }
        if (this._playing && !this._ended) this.event(Event.FRAME);
        this._Pos = _data.pos;
    }

    //TODO:coverage
    _setData(data: Byte, start: number): void {
        this._data = data;
        this._start = start + 3;
    }

    /**
     * @en The source of the MovieClip.
     * @zh MovieClip 的资源地址。
     */
    get source() {
        return this._source;
    }

    set source(value: string) {
        this.load(value);
    }

    /**
     * @deprecated 请使用Loader.load(url:string, type: ILaya.Loader.BUFFER)
     * @en Loads resources for the MovieClip.
     * @param url The URL of the SWF resource.
     * @param atlas Whether to use atlas resources.
     * @param atlasPath The path of the atlas, by default it uses the atlas with the same name as the SWF.
     * @zh 加载 MovieClip 资源。
     * @param url SWF 资源的 URL。
     * @param atlas 是否使用图集资源。  
     * @param   atlasPath  图集路径，默认使用与swf同名的图集
     */
    load(url: string, atlas: boolean = false, atlasPath: string = null): void {
        this.stop();
        this._clear();
        this._movieClipList = [this];
        this._source = url;

        if (atlas)
            atlasPath = atlasPath ? atlasPath : url.split(".swf")[0] + ".json";

        ILaya.loader.load(atlasPath ? [url, atlasPath] : [url], Loader.BUFFER).then(res => {
            if (!res) {
                this.event(Event.ERROR, "file not find");
                return;
            }

            let basePath: string = atlas ? res[1]?.dir : url.split(".swf")[0] + "/image/";
            this._initData(new Byte(res[0].data), basePath);
        });
    }

    //TODO:coverage
    private _initState(): void {
        this._reset();
        this._ended = false;
        var preState: boolean = this._playing;
        this._playing = false;
        this._curIndex = 0;
        while (!this._ended) this._parseFrame(++this._curIndex);
        this._playing = preState;
    }

    //TODO:coverage
    private _initData(data: Byte, basePath: string): void {
        this.basePath = basePath;
        let len: number = data.getUint16();
        for (let i = 0; i < len; i++) this._ids[data.getInt16()] = data.getInt32();
        this.interval = 1000 / data.getUint16();
        this._setData(data, this._ids[32767]);
        this._initState();
        this.play(0);
        this.event(Event.READY);
        if (!this._parentMovieClip) this.timer.loop(this.interval, this, this.updates, null, true);
    }

    /**
     * @en Plays the animation from the start index to the end index, and triggers the complete callback when finished.
     * @param start The starting frame index.
     * @param end The ending frame index.
     * @param complete End callback.
     * @zh 从开始索引播放到结束索引，结束后触发 complete 回调。
     * @param start 开始索引
     * @param end 结束索引
     * @param complete 结束回调
     */
    playTo(start: number, end: number, complete: Handler = null): void {
        this._completeHandler = complete;
        this._endFrame = end;
        this.play(start, false);
    }
}

